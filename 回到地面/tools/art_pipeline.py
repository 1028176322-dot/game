#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
art_pipeline.py — 美术资源生成与入库一体化管线

功能：
  - audit      扫描 prompts.json，对比磁盘/进度文件，生成待处理清单
  - generate   生成缺失/失败的资源（单资源/单类/全量）
  - validate   技术门禁（尺寸/格式/Alpha/体积）
  - contact    生成 contact sheet 供人工验收
  - import     将 approved 资源从 master/candidate 复制到正式目录
               （2D->textures/；3D 模型->models/，prefab->prefabs/）
  - status     打印进度摘要
  - reset      重置某资源或某类资源的进度状态

3D 升级说明（P2）：
  3D 类别（characters/monsters/bosses/effects/tiles）不经由 Agnes 出图，
  而是经 Blender->glb->Prefab 流程后由 import 直接入库。generate/validate
  对 3D 资产自动路由到 3D 门禁（命名+三角面/骨骼/贴图预算，读
  art_quality_budget.json 的 rules3d）。详见 ART_RESOURCE_RULES.md §16。

断点续执行：
  进度文件 art_source/textures_review/art_pipeline_progress.json
  每处理一个资源后即时写入，中断后重新运行会自动跳过已完成项。
  使用 --resume-failed 只重试失败项，--force 强制重做。

完整规格详见 docs/美术资源生成与入库规范.md
"""

import json, os, sys, re, time, hashlib, shutil, subprocess, urllib.request, argparse, math
from datetime import datetime, timezone
from PIL import Image, ImageFilter

# ── 路径自动检测 ──────────────────────────────────────────
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(_SCRIPT_DIR)

TEXTURES_DIR = os.path.join(PROJECT_ROOT, "assets/resources/textures")
ASSETS_JSON = os.path.join(PROJECT_ROOT, "assets/resources/config/assets.json")
UI_ASSETS_JSON = os.path.join(PROJECT_ROOT, "assets/resources/config/ui_assets.json")
GAME_ASSETS_JSON = os.path.join(PROJECT_ROOT, "assets/resources/config/game_assets.json")
PROMPTS_JSON = os.path.join(os.path.dirname(PROJECT_ROOT), "assets/resources/config/prompts.json")
MASTER_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/master")
CANDIDATES_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/runtime_candidates")
BACKUP_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/backup")
CONTACTS_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/contact_sheets")
PROGRESS_FILE = os.path.join(PROJECT_ROOT, "art_source/textures_review/art_pipeline_progress.json")

# 3D asset dirs (added in 3D upgrade; see ART_RESOURCE_RULES.md §16).
# 3D models import to models/, prefabs to prefabs/; 2D still uses textures/.
MODELS_DIR = os.path.join(PROJECT_ROOT, "assets/resources/models")
PREFABS_DIR = os.path.join(PROJECT_ROOT, "assets/resources/prefabs")
MODELS_REL = "assets/resources/models"
PREFABS_REL = "assets/resources/prefabs"
# Categories that route through Blender->glb->Prefab instead of Agnes image gen.
DIM_3D_CATEGORIES = {"characters", "monsters", "bosses", "effects", "tiles"}
PROMPTS_DIM_JSON = os.path.join(os.path.dirname(PROJECT_ROOT),
                                "assets/resources/config/prompts_dim.json")
RULES3D_BUDGET_JSON = os.path.join(os.path.dirname(PROJECT_ROOT),
                                  "assets/resources/config/art_quality_budget.json")
# 3D 资产注册表 (由 tools/gen_3d_manifest.py 从 L1 文档生成；单一事实来源)
MANIFEST_JSON = os.path.join(os.path.dirname(PROJECT_ROOT),
                             "assets/resources/config/art_3d_manifest.json")
# 独立 3D 校验器 (GAP 4/8：3D 入库/校验必须复用此单一来源)
ASSET_VALIDATE_SCRIPT = os.path.join(_SCRIPT_DIR, "asset_validate.py")

# Agnes API: key 从环境变量读取
API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
API_KEY = os.environ.get("AGNES_API_KEY", "")

# ── 权威来源路径 ──────────────────────────────────────────
# 相对 PROJECT_ROOT 计算（遵循「所有路径相对」约定），避免项目移动即失效
ART_RULES_PATH = os.path.normpath(os.path.join(
    PROJECT_ROOT, "..", ".workbuddy", "memory", "topics", "ART_RESOURCE_RULES.md"))

# ── 从 ART_RESOURCE_RULES.md 第15节加载所有管线参数 ──────

_PIPELINE_CFG_CACHE = None

def _load_pipeline_config():
    """从 ART_RESOURCE_RULES.md 第15节 JSON 代码块加载管线参数。
    
    权威来源：ART_RESOURCE_RULES.md → 十五、Pipeline 实现参数
    编辑该节后必须 `npm.cmd run validate:all` 验证解析一致。
    """
    global _PIPELINE_CFG_CACHE
    if _PIPELINE_CFG_CACHE is not None:
        return _PIPELINE_CFG_CACHE

    if not os.path.isfile(ART_RULES_PATH):
        print(f"[WARN] ART_RESOURCE_RULES.md not found, using fallback constants", file=sys.stderr)
        _PIPELINE_CFG_CACHE = _FALLBACK_PIPELINE_CFG()
        return _PIPELINE_CFG_CACHE

    try:
        with open(ART_RULES_PATH, "r", encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        print(f"[WARN] Cannot read ART_RESOURCE_RULES.md: {e}", file=sys.stderr)
        _PIPELINE_CFG_CACHE = _FALLBACK_PIPELINE_CFG()
        return _PIPELINE_CFG_CACHE

    # Extract the JSON block from Section 15 — between ```json and ```
    m = re.search(r"```json\s*\n(.*?)\n```", text, re.DOTALL)
    if not m:
        print(f"[WARN] No JSON config block found in ART_RESOURCE_RULES.md, using fallback", file=sys.stderr)
        _PIPELINE_CFG_CACHE = _FALLBACK_PIPELINE_CFG()
        return _PIPELINE_CFG_CACHE

    try:
        cfg = json.loads(m.group(1))
        _PIPELINE_CFG_CACHE = cfg
        return cfg
    except json.JSONDecodeError as e:
        print(f"[WARN] JSON parse error in ART_RESOURCE_RULES.md: {e}", file=sys.stderr)
        _PIPELINE_CFG_CACHE = _FALLBACK_PIPELINE_CFG()
        return _PIPELINE_CFG_CACHE


def _FALLBACK_PIPELINE_CFG():
    """回退默认值（当规则文件解析失败时使用）。"""
    return {
        "style_anchor": "Bright cheerful hand-painted cartoon game art, rounded friendly shapes, saturated colors, soft highlights, clean mobile readability, polished look.",
        "safety_block": "Warm cheerful family-friendly fantasy art style, clean shapes and readable silhouettes, suitable for mobile game UI and backgrounds.",
        "detail_anchors": {
            "bosses": "Full-body boss sprite, large readable silhouette, simple exaggerated shapes, bright material colors.",
            "monsters": "Small full-body enemy sprite, readable at 128px, simple pose, one creature only.",
            "characters": "Full-body character sprite sheet with multiple frames stacked vertically, each frame on plain solid background.",
            "effects": "Clean VFX, bold center shape per frame, simple particle clusters, rich clean color gradients.",
            "icons": "Icon asset, single centered object with transparent margin.",
            "tiles": "Seamless ground tile texture at 96px, natural ground crack patterns, stone grain marks, and soil texture variations distributed evenly, tileable edges, consistent natural ground color per region, pure ground material only.",
            "ui": "UI asset, clean alpha edges, centered with transparent margin.",
            "backgrounds": "Full opaque rectangular painted scene filling the entire canvas.",
        },
        "transparent_categories": ["effects", "icons", "ui", "monsters", "bosses", "characters"],
        "matte_categories": ["icons", "ui", "monsters", "bosses", "characters"],
        "procedural_categories": [],
        "ornament_types": ["ui", "icons"],
        "overscan_factor": 1.8,
        "min_opaque_ratio": {"icons": 0.15, "ui": 0.02, "monsters": 0.08, "bosses": 0.05, "characters": 0.08, "effects": 0.02},
        "palette_retry_steps": {"effects": [64, 48, 32], "icons": [128, 96, 64, 48], "ui": [128, 96, 64, 48], "monsters": [128, 96, 64], "characters": [256, 192, 128], "bosses": [256, 192, 128]},
        "ui_kit_default_dims": {"btn": [240, 80], "card": [260, 96], "panel": [360, 200], "input": [260, 44], "slot": [92, 92]},
    }


def _pc(key, default=None):
    """安全读取管线配置项。"""
    return _load_pipeline_config().get(key, default)


# ── 管线配置常量（从 ART_RESOURCE_RULES.md 第15节读取，回退到 _fallback） ──

STYLE_ANCHOR = _pc("style_anchor", "")
SAFETY_BLOCK = _pc("safety_block", "")
DETAIL_ANCHORS = _pc("detail_anchors", {})
TRANSPARENT_CATEGORIES = set(_pc("transparent_categories", []))
MATTE_CATEGORIES = set(_pc("matte_categories", []))
PROCEDURAL_CATEGORIES = set(_pc("procedural_categories", []))
MIN_OPAQUE_RATIO = _pc("min_opaque_ratio", {})
PALETTE_RETRY_STEPS = _pc("palette_retry_steps", {})
ORNAMENT_TYPES = set(_pc("ornament_types", []))
OVERSCAN_FACTOR = _pc("overscan_factor", 1.8)
# 推荐生成尺寸（来自 ART_RESOURCE_RULES.md 3.2 节，按分类取高画质版本）
RECOMMENDED_SIZES = _pc("recommended_sizes", {})

UI_KIT_DEFAULT_DIMS = _pc("ui_kit_default_dims", {})

# ── 3D/2D dimension routing (P2: 3D upgrade) ──
_DIM_MAP_CACHE = None

def load_dim_map():
    """Load prompts_dim.json registry (P1). Non-blocking: empty dict if absent."""
    global _DIM_MAP_CACHE
    if _DIM_MAP_CACHE is not None:
        return _DIM_MAP_CACHE
    _DIM_MAP_CACHE = {}
    if os.path.isfile(PROMPTS_DIM_JSON):
        try:
            with open(PROMPTS_DIM_JSON, encoding="utf-8") as f:
                obj = json.load(f)
            _DIM_MAP_CACHE = obj.get("map", {}) or {}
        except Exception:
            _DIM_MAP_CACHE = {}
    return _DIM_MAP_CACHE

def category_dim(category, key=None, mode="2d"):
    """Return '3d' or '2d' for a category/key.

    Authority order (ART_RESOURCE_RULES.md §16 single-source):
      1. mode == "2d"  → 永远返回 "2d"（2D 兼容模式，不阻断当前 2D 生产；GAP 3）
      2. mode == "3d"  → prompts_dim.json map (key-level, P1 registry)
      3. category-name fallback (DIM_3D_CATEGORIES)
    """
    if mode == "2d":
        return "2d"
    if key:
        dmap = load_dim_map()
        if key in dmap:
            return dmap[key]
    return "3d" if category in DIM_3D_CATEGORIES else "2d"

# ── UI 生成方式（2D→3D 升级：2026-07-10 起 UI 全部走 AI 出图） ──
# 历史正则 KIND_PROCEDURAL_UI（匹配 btn_/panel/card/frame/slot/input_/name_/strip_/row_/bar_）
# 已弃用：UI 不再程序化生成，统一由 prompts.json + Agnes API 出图。
# 若需回滚到程序化，恢复下方正则并在 classify_resource / is_procedural 重新接入。
# KIND_PROCEDURAL_UI = re.compile(
#     r"^(?:ui/(?:.*/)?.*?(?:btn_|button_|panel|card|frame|slot|input_|name_|strip_|row_|bar_))"
# )

# ── 体积预算：从 ART_RESOURCE_RULES.md 读取 ──────────────
# 权威来源：ART_RESOURCE_RULES.md（相对 PROJECT_ROOT 计算）→ 九、体积与性能策略
# 如果解析失败，回退到静态默认值。

# 静态预算默认值（当规则文件解析失败时使用）
_FALLBACK_BUDGET = {
    "backgrounds":  {"warning": 800,    "hard": 1500},
    "ui":           {"warning": 500,    "hard": 800},
    "icons":        {"warning": 60,     "hard": 180},
    "characters":   {"warning": 500,    "hard": 1200},
    "monsters":     {"warning": 350,    "hard": 900},
    "bosses":       {"warning": 1200,   "hard": 2500},
    "effects":      {"warning": 250,    "hard": 700},
    "tiles":        {"warning": 40,     "hard": 120},
}

_BUDGET_CACHE = None

def _parse_art_rules_budget():
    """从 ART_RESOURCE_RULES.md 解析体积预算表。"""
    if not os.path.isfile(ART_RULES_PATH):
        print(f"[WARN] ART_RESOURCE_RULES.md not found, using fallback budget", file=sys.stderr)
        return dict(_FALLBACK_BUDGET)

    try:
        with open(ART_RULES_PATH, "r", encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        print(f"[WARN] Cannot read ART_RESOURCE_RULES.md: {e}", file=sys.stderr)
        return dict(_FALLBACK_BUDGET)

    # Parse the budget table in Section 9.2.
    # Table format (4 columns after split by |):
    #   类型         推荐范围        可接受           人工确认上限
    #   全屏背景 JPG  300-800KB     800KB-1.2MB     1.5MB
    #   战斗背景 JPG  250-600KB     600KB-1MB       1.2MB
    #   UI 大面板 PNG 80-250KB      250-500KB       800KB
    #   UI 小按钮 PNG 20-100KB      100-180KB       250KB
    #   角色 sprite  150-500KB     500-900KB       1.2MB
    #   Boss sprite  400KB-1.2MB   1.2-1.8MB       2.5MB
    #   普通怪物 PNG  100-350KB     350-600KB       900KB
    #   特效 sprite  80-250KB      250-450KB       700KB
    #   图标 PNG     15-60KB       60-120KB        180KB
    #   Tile PNG     5-40KB        40-80KB         120KB

    category_map = {
        "全屏背景": "backgrounds",
        "战斗背景": "backgrounds",
        "UI 大面板": "ui",
        "UI 小按钮": "ui",
        "角色 sprite": "characters",
        "Boss sprite": "bosses",
        "普通怪物": "monsters",
        "特效 sprite": "effects",
        "图标": "icons",
        "Tile": "tiles",
    }

    def parse_kb(s):
        """Parse a size like '800KB', '1.2MB' to KB int."""
        s = s.strip()
        m = re.match(r"([\d.]+)\s*(KB|MB)", s)
        if not m:
            return None
        val = float(m.group(1))
        if m.group(2) == "MB":
            val *= 1024
        return int(round(val))

    def parse_warn(s):
        """Parse '可接受' column like '800KB-1.2MB', '100-180KB' → return upper bound."""
        s = s.strip()
        parts = s.split("-")
        if len(parts) != 2:
            return None
        return parse_kb(parts[1])

    result = {}
    # For categories with multiple rows (e.g. backgrounds → 全屏背景/战斗背景), take the LARGER budget
    for line in text.split("\n"):
        if not line.startswith("|") or line.count("|") < 4:
            continue
        cols = [c.strip() for c in line.split("|")]
        if len(cols) < 5:
            continue
        name = cols[1]
        matched_cat = None
        for keyword, cat in category_map.items():
            if keyword in name:
                matched_cat = cat
                break
        if not matched_cat:
            continue

        warn = parse_warn(cols[3])
        hard = parse_kb(cols[4])
        if warn is None or hard is None:
            continue

        # Merge: if category already has a value, take LARGER budget
        existing = result.get(matched_cat)
        if existing:
            warn = max(warn, existing["warning"])
            hard = max(hard, existing["hard"])
        result[matched_cat] = {"warning": warn, "hard": hard}

    if not result:
        print(f"[WARN] Could not parse budget from ART_RESOURCE_RULES.md, using fallback", file=sys.stderr)
        return dict(_FALLBACK_BUDGET)

    return result

def _to_kb(val_str, unit):
    """Convert KB/MB string to KB integer."""
    val = float(val_str)
    if unit.upper() == "MB":
        val *= 1024
    return int(round(val))

def budget_limits(category):
    """获取某类别的体积预算，从 ART_RESOURCE_RULES.md 读取。"""
    global _BUDGET_CACHE
    if _BUDGET_CACHE is None:
        _BUDGET_CACHE = _parse_art_rules_budget()
    return _BUDGET_CACHE.get(category, {"warning": 64, "hard": 256})

# ── 状态常量 ──────────────────────────────────────────────
ST_PLANNED = "planned"
ST_PROMPTING = "prompting"
ST_GENERATED = "generated"
ST_VALIDATED = "validated"
ST_APPROVED = "approved"
ST_IMPORTED = "imported"
ST_FAILED = "failed"
ST_SKIPPED = "skipped"

VALID_STATUSES = {ST_PLANNED, ST_PROMPTING, ST_GENERATED, ST_VALIDATED,
                  ST_APPROVED, ST_IMPORTED, ST_FAILED, ST_SKIPPED}

# ── 辅助函数 ──────────────────────────────────────────────


def ensure_dir(path):
    """确保目录存在，不存在则创建。"""
    os.makedirs(path, exist_ok=True)


def _cleanup_stale_temps(directory: str):
    """清理中断残留的 .tmp 和 .tmp_check.png 文件。"""
    import glob
    for ext in ("*.tmp", "*.tmp_check.png"):
        for f in glob.glob(os.path.join(directory, "**", ext), recursive=True):
            try:
                os.remove(f)
            except OSError:
                pass


def file_hash(path):
    """计算文件的 SHA256 哈希。"""
    if not os.path.isfile(path):
        return ""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def prompt_hash(prompt):
    """计算 prompt 字符串的哈希。"""
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:16]


def now_iso():
    """当前时间 ISO 格式。"""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load_json(path, default=None):
    """安全加载 JSON 文件。"""
    if default is None:
        default = {}
    if not os.path.isfile(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"[WARN] 无法加载 {path}: {e}")
        return default


def save_json(path, data):
    """安全写入 JSON 文件（UTF-8）。"""
    ensure_dir(os.path.dirname(path))
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    shutil.move(tmp, path)


def find_dimension_in_prompt(prompt):
    """从 prompt 文本中提取目标尺寸。支持 2-4 位数字。"""
    m = re.search(r"(\d{2,4})x(\d{2,4})", prompt)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None


def resolve_target_size(category, key, default=(128, 128)):
    """确定生成目标尺寸。优先级：推荐尺寸（UI 除外按组件分化）→ prompt提取 → 默认值。
    
    来源链：
      1. ART_RESOURCE_RULES.md 第3.2节推荐尺寸（按分类取高画质版本）——质量目标
         UI 跳过此步（recommended_sizes["ui"]=192×192 过于笼统），由 UI_KIT_DEFAULT_DIMS 按组件分化。
      2. prompts.json 中的 Target canvas: WxH（由 find_dimension_in_prompt 提取）
      3. 回退 128x128
    """
    # 0. 部件化角色部件：尺寸由 per-part 规格决定（body=160x160, head=128x128 等），
    #    提取自 prompts.json 的 Target canvas，不取 recommended_sizes["characters"]（256x1024）。
    if "/parts/" in (key or ""):
        return None
    # 1. 检查规则文件中的推荐尺寸（最高优先级，UI 除外由 UI_KIT_DEFAULT_DIMS 按组件分化）
    if category in RECOMMENDED_SIZES and category != "ui":
        return tuple(RECOMMENDED_SIZES[category])
    # 2. 检查 UI Kit 默认尺寸（按钮/卡片/面板等）
    for kit_name, dims in UI_KIT_DEFAULT_DIMS.items():
        if kit_name in key:
            return tuple(dims)
    # fallback 留给调用方处理（prompts.json 提取或 128x128）
    return None


def classify_resource(key, mode="2d"):
    """根据资源 key 判断类别和用途。返回包含 asset_kind 的 dict。

    mode: "2d" 兼容模式（默认，不阻断 2D 生产）；"3d" 走 3D 路由。
    """
    parts = key.split("/")
    category = parts[0] if len(parts) > 1 else "other"
    # 整屏背景即使在 ui 目录下也按 backgrounds 处理
    if key.endswith("_bg.jpg") or key.endswith("_bg.png"):
        category = "backgrounds"

    # 判定 asset_kind（决定生成方式和验证门禁）
    if category == "backgrounds":
        asset_kind = "background"
    elif category == "tiles":
        asset_kind = "tile"
    elif category == "icons" or (category == "ui" and "/icon_" in key):
        asset_kind = "icon"
    elif category == "characters" and "/parts/" in key:
        asset_kind = "character_part"
    elif category == "characters":
        asset_kind = "character"
    elif category == "monsters":
        asset_kind = "monster"
    elif category == "bosses":
        asset_kind = "boss"
    elif category == "effects":
        asset_kind = "effect"
    elif category == "ui":
        # 2D→3D 升级：UI 全部由 AI 出图（Agnes），不再程序化生成
        asset_kind = "ui"
    else:
        asset_kind = "icon"

    # 判定生成方式：统一从规则文件读取 PROCEDURAL_CATEGORIES
    # (asset_kind 保留给验证门禁用，不决定生成方式)
    # 2D→3D 升级：UI 已改为 AI 出图，不再程序化生成（PROCEDURAL_CATEGORIES 当前为空集）
    is_procedural = category in PROCEDURAL_CATEGORIES

    # 细分 ui 下面的子类
    sub_category = "/".join(parts[:2]) if len(parts) > 1 else ""
    filename = parts[-1]
    ext = os.path.splitext(filename)[1].lower()
    return {
        "key": key,
        "category": category,
        "asset_kind": asset_kind,
        "sub_category": sub_category,
        "filename": filename,
        "ext": ext,
        "is_ui": category == "ui",
        "is_bg": category == "backgrounds",
        "is_procedural": is_procedural,
        "dim": category_dim(category, key, mode),
    }


def load_3d_manifest():
    """Load the 3D asset registry (art_3d_manifest.json). Single-source for 3D
    generate/validate/import batches. Non-blocking: empty entries if absent."""
    global _MANIFEST_CACHE
    if _MANIFEST_CACHE is not None:
        return _MANIFEST_CACHE
    _MANIFEST_CACHE = {"entries": []}
    if os.path.isfile(MANIFEST_JSON):
        try:
            with open(MANIFEST_JSON, encoding="utf-8") as f:
                _MANIFEST_CACHE = json.load(f)
        except Exception:
            _MANIFEST_CACHE = {"entries": []}
    return _MANIFEST_CACHE


_MANIFEST_CACHE = None


def run_asset_validate(model_path):
    """Run tools/asset_validate.py on a 3D asset's .assetmeta.json sidecar.

    Returns (pass:bool, issues:list[str]).
    Enforces GAP 4: a 3D asset MUST pass asset_validate before it can be
    imported. Falls back to inline _validate_3d_asset only if the standalone
    validator script is missing (single-source preference = asset_validate.py).
    """
    meta = model_path + ".assetmeta.json"
    if not os.path.isfile(meta):
        return False, [f"缺少边车校验文件: {os.path.basename(meta)}"
                       f"（3D 资产必须附带 .assetmeta.json，见 ART_RESOURCE_RULES.md §16）"]
    if not os.path.isfile(ASSET_VALIDATE_SCRIPT):
        # 回退：内联校验（仍要求 meta 存在）
        cat = os.path.splitext(os.path.basename(model_path))[0].split("_")[0].lower()
        return _validate_3d_asset(model_path, category=cat)
    try:
        proc = subprocess.run(
            [sys.executable, ASSET_VALIDATE_SCRIPT, meta, "--budget", RULES3D_BUDGET_JSON],
            capture_output=True, text=True, timeout=120)
    except Exception as e:  # noqa: BLE001
        return False, [f"asset_validate 调用失败: {e}"]
    if proc.returncode == 0:
        return True, []
    issues = [ln.strip() for ln in proc.stdout.splitlines() if ln.strip().startswith("[XX]")]
    if not issues:
        tail = (proc.stdout or proc.stderr).strip()
        issues = [tail[:300] or "asset_validate 报告未过"]
    return False, issues


def _filter_manifest(manifest, category, resource):
    """Filter manifest entries by --category (category field) or --resource (name)."""
    entries = manifest.get("entries", [])
    if resource:
        base = os.path.splitext(resource)[0]
        return [e for e in entries if e["name"] == base]
    if category:
        return [e for e in entries if e["category"] == category]
    return entries


def _cmd_import_3d(args):
    """3D 资产入库（GAP 1+4）：从 manifest 驱动，强制 asset_validate 通过。

    流程: 候选模型 CANDIDATES_DIR/<name>.glb (+ .prefab) → 校验 →
          models/<name>.glb + prefabs/<name>.prefab。
    真实 3D 资产名 (CHR_/MON_/BOSS_/FX_/TILE_) 取自 manifest，不再拼 prompts.json key。
    """
    manifest = load_3d_manifest()
    entries = _filter_manifest(manifest, args.category, args.resource)
    if not entries:
        print("没有匹配 3D 模式的资产条目 (检查 --category / --resource 或 manifest)")
        return
    print(f"Import(3D): {len(entries)} 个 3D 资产 (强制 asset_validate)")
    imported = 0
    for e in entries:
        name = e["name"]
        src_glb = os.path.join(CANDIDATES_DIR, name + ".glb")
        src_prefab = os.path.join(CANDIDATES_DIR, name + ".prefab")
        if not os.path.isfile(src_glb):
            print(f"  ✗ {name}: 候选模型不存在 ({src_glb})")
            continue
        ok, issues = run_asset_validate(src_glb)
        if not ok:
            print(f"  ✗ {name}: 资产校验未过 → {'; '.join(issues)}")
            continue
        tgt_glb = os.path.join(MODELS_DIR, name + ".glb")
        tgt_prefab = os.path.join(PREFABS_DIR, name + ".prefab")
        for src, tgt in ((src_glb, tgt_glb), (src_prefab, tgt_prefab)):
            if not os.path.isfile(src):
                continue
            ensure_dir(os.path.dirname(tgt))
            if os.path.isfile(tgt):
                ts = datetime.now().strftime("%Y%m%d_%H%M%S")
                rel_backup = os.path.join(
                    BACKUP_DIR, f"pre_import_3d_{ts}", os.path.basename(tgt))
                ensure_dir(os.path.dirname(rel_backup))
                shutil.copy2(tgt, rel_backup)
            shutil.copy2(src, tgt)
        imported += 1
        print(f"  ✓ {name} (3D → models/ + prefabs/，已通过 asset_validate)")
    print(f"\n3D 导入完成: {imported}/{len(entries)}")


def _cmd_validate_3d(args):
    """3D 资产技术门禁（GAP 8）：复用 asset_validate.py 单一来源。"""
    manifest = load_3d_manifest()
    entries = _filter_manifest(manifest, args.category, args.resource)
    if not entries:
        print("没有匹配 3D 模式的资产条目 (检查 --category / --resource 或 manifest)")
        return
    print(f"Validate(3D): {len(entries)} 个 3D 资产")
    passed = 0
    failed = 0
    for e in entries:
        name = e["name"]
        src_glb = os.path.join(CANDIDATES_DIR, name + ".glb")
        if not os.path.isfile(src_glb):
            src_glb = os.path.join(MODELS_DIR, name + ".glb")
        if not os.path.isfile(src_glb):
            print(f"  ✗ {name}: 模型文件不存在")
            failed += 1
            continue
        ok, issues = run_asset_validate(src_glb)
        if ok:
            print(f"  ✓ {name}")
            passed += 1
        else:
            print(f"  ✗ {name}: {'; '.join(issues)}")
            failed += 1
    print(f"\n3D 验证完成: 通过 {passed}, 失败 {failed}")


# ── 进度管理 ──────────────────────────────────────────────


class ProgressTracker:
    """进度跟踪器，管理 art_pipeline_progress.json。"""

    def __init__(self, progress_path=None):
        self.path = progress_path or PROGRESS_FILE
        self.data = load_json(self.path, {"version": 2, "resources": {}})
        if "resources" not in self.data:
            self.data["resources"] = {}

    def save(self):
        """立即保存进度到磁盘。"""
        self.data["lastUpdated"] = now_iso()
        save_json(self.path, self.data)

    def get(self, key):
        """获取某个资源的进度状态条目（不存在则创建一条 status=planned）。"""
        if key not in self.data["resources"]:
            self.data["resources"][key] = {
                "status": ST_PLANNED,
                "promptHash": "",
                "fileHash": "",
                "source": "",
                "failCount": 0,
                "lastError": "",
                "updatedAt": now_iso(),
            }
        return self.data["resources"][key]

    def update(self, key, **kwargs):
        """更新某个资源的状态。"""
        entry = self.get(key)
        for k, v in kwargs.items():
            if k in ("status", "promptHash", "fileHash", "source", "lastError",
                     "dim", "modelPath"):
                entry[k] = v
            elif k == "failCount":
                entry[k] = int(v)
        entry["updatedAt"] = now_iso()
        self.save()

    def mark_failed(self, key, error=""):
        """标记失败并递增失败计数。"""
        entry = self.get(key)
        entry["status"] = ST_FAILED
        entry["failCount"] = entry.get("failCount", 0) + 1
        entry["lastError"] = str(error)[:500]
        entry["updatedAt"] = now_iso()
        self.save()

    def mark(self, key, status):
        """快速标记状态。"""
        self.update(key, status=status)

    def reset(self, key=None, category=None):
        """重置进度。key 指定单资源，category 指定类别前缀，都为空则全量重置。"""
        if key:
            if key in self.data["resources"]:
                del self.data["resources"][key]
                self.save()
                return 1
            return 0

        keys_to_remove = []
        for k in self.data["resources"]:
            if category is None or k.startswith(category):
                keys_to_remove.append(k)
        for k in keys_to_remove:
            del self.data["resources"][k]
        self.save()
        return len(keys_to_remove)

    def summary(self, category=None):
        """打印进度摘要。"""
        resources = self.data["resources"]
        if category:
            resources = {k: v for k, v in resources.items()
                         if k.startswith(category)}

        if not resources:
            print("  (无记录)")
            return

        status_counts = {}
        for v in resources.values():
            s = v.get("status", ST_PLANNED)
            status_counts[s] = status_counts.get(s, 0) + 1

        total = len(resources)
        print(f"  总记录: {total}")
        for s in sorted(status_counts.keys(), key=lambda x: -status_counts[x]):
            pct = 100 * status_counts[s] / total
            print(f"    {s}: {status_counts[s]} ({pct:.1f}%)")

        # 显示失败条目
        failed = {k: v for k, v in resources.items()
                  if v.get("status") == ST_FAILED}
        if failed:
            print(f"\n  失败条目 ({len(failed)}):")
            for k, v in sorted(failed.items()):
                err = v.get("lastError", "")[:60]
                print(f"    {k}: {err}")


# ── 核心操作 ──────────────────────────────────────────────


def load_prompts():
    """加载 prompts.json。"""
    return load_json(PROMPTS_JSON, {})


def call_agnes_api(prompt, size="1024x1024"):
    """调用 Agnes API 生成图片，返回 (image_url, error)。"""
    payload = json.dumps({
        "model": "agnes-image-2.1-flash",
        "prompt": prompt,
        "n": 1,
        "size": size,
    }).encode("utf-8")

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        url = result.get("data", [{}])[0].get("url", "")
        if not url:
            return None, "API 返回中没有 data[0].url"
        return url, None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:300]
        return None, f"HTTP {e.code}: {body}"
    except Exception as e:
        return None, str(e)


def download_image(url, output_path):
    """下载图片到指定路径。"""
    try:
        urllib.request.urlretrieve(url, output_path)
        if os.path.getsize(output_path) < 100:
            os.remove(output_path)
            return False, "下载文件过小"
        return True, None
    except Exception as e:
        return False, str(e)


# ── UI Kit 风格默认尺寸 ──
UI_KIT_DEFAULT_DIMS = {
    "btn": (240, 80),
    "card": (260, 96),
    "panel": (360, 200),
    "input": (260, 44),
    "slot": (92, 92),
}


def _infer_ui_kit_params(key, textures_dir=TEXTURES_DIR):
    """从资源 key 推断 UI Kit 生成参数（style / dim / selected / no_leaves / no_gems）。

    优先读取 textures_dir 中已有文件的尺寸，否则使用风格默认值。
    """
    filename = os.path.basename(key)

    # —— 风格推断 ——
    if filename.startswith("btn_") or filename.startswith("button_"):
        style = "btn"
    elif filename.startswith("card_") or filename.startswith("character_card_"):
        style = "card"
    elif filename.startswith("route_card_"):
        style = "panel"
    elif filename.startswith("panel_") or filename.startswith("frame_"):
        style = "panel"
    elif filename.startswith("input_") or filename.startswith("name_"):
        style = "input"
    elif filename.startswith("slot_"):
        style = "slot"
    else:
        style = "panel"

    # —— 尺寸推断：优先已有文件，否则用风格默认 ——
    textures_path = os.path.join(textures_dir, key)
    if os.path.isfile(textures_path):
        try:
            from PIL import Image as _PIL
            existing = _PIL.open(textures_path)
            dim = (existing.width, existing.height)
        except Exception:
            dim = UI_KIT_DEFAULT_DIMS.get(style, (240, 80))
    else:
        dim = UI_KIT_DEFAULT_DIMS.get(style, (240, 80))

    # —— 选中态 / 锁定态 ——
    selected = "_selected" in filename or "_active" in filename
    locked = "_locked" in filename or "_lock" in filename

    # —— 装饰开关 ——
    no_leaves = style in ("input", "slot")
    no_gems = style == "slot"

    return style, dim, selected, locked, no_leaves, no_gems


def generate_procedural(resource_info, output_path):
    """调用 ui_kit_generator.py 生成程序化 UI 组件（替代旧 generate_panel.py）。"""
    # 定位 UI Kit 生成器脚本
    candidates = [
        os.path.join(_SCRIPT_DIR, "ui_kit_generator.py"),
        os.path.join(PROJECT_ROOT, "tools", "ui_kit_generator.py"),
    ]
    script = None
    for c in candidates:
        if os.path.isfile(c):
            script = c
            break
    if not script:
        return False, "找不到 ui_kit_generator.py"

    key = resource_info["key"]
    style, dim, selected, locked, no_leaves, no_gems = _infer_ui_kit_params(key)

    # UI Kit 生成器内部加 8px PADDING 透明边距（每边 8px，共 16px）。
    # 需传入缩小后的 content 尺寸，使最终输出 = 目标尺寸。
    content_w = max(dim[0] - 16, 32)
    content_h = max(dim[1] - 16, 16)

    cmd = [
        sys.executable, script,
        "--width", str(content_w),
        "--height", str(content_h),
        "--style", style,
        "--output", output_path,
        "--seed", "20260709",
    ]
    if selected and style in ("btn", "card", "panel"):
        cmd.append("--selected")
    if locked and style in ("card", "panel"):
        cmd.append("--locked")
    if no_leaves:
        cmd.append("--no-leaves")
    if no_gems:
        cmd.append("--no-gems")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            return False, result.stderr[:300]
        if not os.path.isfile(output_path):
            return False, "ui_kit_generator.py 未生成文件"
        return True, None
    except subprocess.TimeoutExpired:
        return False, "脚本超时"
    except Exception as e:
        return False, str(e)


def resize_image(input_path, target_size, output_path):
    """缩放图片到目标尺寸（保持纵横比，中心裁剪）。"""
    try:
        img = Image.open(input_path)
        img = crop_to_target_aspect(img, target_size)
        if img.size != target_size:
            img = img.resize(target_size, Image.LANCZOS)
        if img.mode not in ("RGBA", "RGB"):
            img = img.convert("RGBA")
        img.save(output_path, "PNG")
        return True, None
    except Exception as e:
        return False, str(e)


def crop_to_target_aspect(img, target_size):
    """Crop source image to the target aspect ratio from the center.

    This preserves the subject composition and avoids squashing/distorting
    non-square targets when the API returns a square image.
    """
    tw, th = target_size
    sw, sh = img.size
    target_ratio = tw / th
    source_ratio = sw / sh

    if abs(target_ratio - source_ratio) < 0.001:
        return img

    if source_ratio > target_ratio:
        # Source is wider than target: crop left/right
        new_w = int(sh * target_ratio)
        left = (sw - new_w) // 2
        return img.crop((left, 0, left + new_w, sh))
    else:
        # Source is taller than target: crop top/bottom
        new_h = int(sw / target_ratio)
        top = (sh - new_h) // 2
        return img.crop((0, top, sw, top + new_h))


def fit_rgba_to_canvas(img, target_size, margin_ratio=0.10, resample=Image.LANCZOS, max_scale=1.0):
    """Center the subject in target_size canvas with transparent margin.

    Finds the alpha bounding box of the subject, scales it to fit within
    target_size minus margin, and centers it with transparent padding on all sides.
    This replaces center-crop for transparent UI assets: instead of cropping
    to aspect, it preserves the full subject and adds breathing room.
    margin_ratio = what fraction of the shorter edge is reserved as transparent padding.
    """
    if img.mode == "RGB":
        img = img.convert("RGBA")

    # Find alpha bbox
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        # Fully transparent — blank canvas
        return Image.new("RGBA", target_size, (0, 0, 0, 0))

    subject = img.crop(bbox)
    sw, sh = subject.size
    tw, th = target_size

    # Calculate inner area with margin
    margin_w = int(tw * margin_ratio * 2)
    margin_h = int(th * margin_ratio * 2)
    inner_w = max(tw - margin_w, tw // 4)
    inner_h = max(th - margin_h, th // 4)

    # Scale subject to fit inner area (preserving aspect)
    scale = min(inner_w / sw, inner_h / sh, max_scale)
    new_w = max(int(sw * scale), 1)
    new_h = max(int(sh * scale), 1)
    subject_resized = subject.resize((new_w, new_h), resample)

    # Center on canvas
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    x = (tw - new_w) // 2
    y = (th - new_h) // 2
    canvas.paste(subject_resized, (x, y), subject_resized)
    return canvas


def remove_matte_background(img):
    """Remove solid matte backgrounds from AI-generated images via edge-based flood-fill.
    
    Steps:
    1. Sample ALL edge pixels (not just 4 corners) to build a color histogram
    2. Pick the 1-2 most common edge colors as the "background" color(s)
    3. Flood-fill from the edges matching those colors within threshold
    4. If insufficient background removal, fall back to a wider sampling
    
    This avoids both:
    - Old flood-fill bug: taking only 4 corners that might be scene colors
    - Global key bug: eating into monster body parts that match background color
    """
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size

    # --- Step 1: Build edge color histogram ---
    # Sample all 4 edges (not just corners) to find real background color(s)
    step = max(1, min(w, h) // 100)  # sample ~100 per edge
    edge_colors = {}
    
    def _sample_edge(x, y):
        r, g, b, a = pixels[x, y]
        if a == 0:
            return
        bucket = (r // 16 * 16, g // 16 * 16, b // 16 * 16)  # finer 16-level buckets
        edge_colors[bucket] = edge_colors.get(bucket, 0) + 1
    
    # Top edge
    for x in range(0, w, step):
        _sample_edge(x, 0)
    # Bottom edge
    for x in range(0, w, step):
        _sample_edge(x, h - 1)
    # Left edge
    for y in range(0, h, step):
        _sample_edge(0, y)
    # Right edge
    for y in range(0, h, step):
        _sample_edge(w - 1, y)

    if not edge_colors:
        return rgba

    # --- Step 2: Find most common edge background color(s) ---
    sorted_colors = sorted(edge_colors.items(), key=lambda x: -x[1])
    
    # Use top-2 most common edge colors as background candidates
    bg_threshold = 72  # RGB Euclidean distance
    bg_colors = []
    for bucket, count in sorted_colors[:2]:
        # Only use if it's significantly present (>5% of edge samples)
        if count > max(1, sum(edge_colors.values()) * 0.05):
            center = (bucket[0] + 8, bucket[1] + 8, bucket[2] + 8)
            bg_colors.append(center)
    
    if not bg_colors:
        # Fallback: use first bucket anyway
        center = (sorted_colors[0][0][0] + 8, sorted_colors[0][0][1] + 8, sorted_colors[0][0][2] + 8)
        bg_colors.append(center)

    def _is_bg(r, g, b):
        """Check if pixel matches any background color within threshold."""
        for bc in bg_colors:
            dist = ((r - bc[0]) ** 2 + (g - bc[1]) ** 2 + (b - bc[2]) ** 2) ** 0.5
            if dist <= bg_threshold:
                return True
        return False

    # --- Step 3: Flood-fill from edges ---
    stack = []
    seen = set()
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))

    removed_count = 0
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue
        if not _is_bg(r, g, b):
            continue
        pixels[x, y] = (r, g, b, 0)
        removed_count += 1
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    # --- Step 4 (fallback): If flood-fill barely removed anything (< 5% of image),
    # the subject likely fills the entire canvas with no visible matte.
    # In that case, aggressively remove edge pixels that are "more background-like"
    # than their neighbors (thin halos around edges).
    total_px = w * h
    if removed_count < total_px * 0.03:
        # Wider sampling: find top 3 colors in the whole edge region (outer 10%)
        wide_colors = {}
        margin_x = max(w // 10, 5)
        margin_y = max(h // 10, 5)
        for y in range(0, h):
            for x in range(0, w):
                if min(x, y, w - x - 1, h - y - 1) > margin_x:
                    continue
                r, g, b, a = pixels[x, y]
                if a == 0:
                    continue
                bucket = (r // 16 * 16, g // 16 * 16, b // 16 * 16)
                wide_colors[bucket] = wide_colors.get(bucket, 0) + 1
        
        if wide_colors:
            sorted_wide = sorted(wide_colors.items(), key=lambda x: -x[1])
            for bucket, count in sorted_wide[:3]:
                if count > max(1, sum(wide_colors.values()) * 0.03):
                    center = (bucket[0] + 8, bucket[1] + 8, bucket[2] + 8)
                    bg_colors.append(center)
            
            # Re-flood with wider colors
            second_stack = []
            second_seen = set()
            for x in range(w):
                second_stack.append((x, 0))
                second_stack.append((x, h - 1))
            for y in range(h):
                second_stack.append((0, y))
                second_stack.append((w - 1, y))
            
            while second_stack:
                x, y = second_stack.pop()
                if x < 0 or y < 0 or x >= w or y >= h or (x, y) in second_seen:
                    continue
                second_seen.add((x, y))
                r, g, b, a = pixels[x, y]
                if a == 0:
                    continue
                if not _is_bg(r, g, b):
                    continue
                pixels[x, y] = (r, g, b, 0)
                second_stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    return rgba


def remove_chroma_pixels(img):
    """Remove chroma-key (magenta/green) residuals."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            is_magenta = (r >= 210 and b >= 170 and g <= 95 and r > g * 1.8 and b > g * 1.6)
            is_green = (g >= 210 and r <= 95 and b <= 95 and g > r * 1.8 and g > b * 1.8)
            is_cyan = (b >= 210 and r <= 95 and g >= 170 and b > r * 1.8 and b > g * 0.1)
            if is_magenta or is_green or is_cyan:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def feather_alpha(img, radius=0.8):
    """Apply slight blur to alpha channel for smooth edge transitions.

    This prevents the 'hard alpha edge' validation failure by creating
    0<v<255 transition pixels at subject borders after matte removal.
    Uses a small-radius Gaussian blur to preserve sharpness while adding
    sub-pixel anti-aliasing to the alpha edge.
    """
    if img.mode != "RGBA":
        return img
    r, g, b, a = img.split()
    a = a.filter(ImageFilter.GaussianBlur(radius=radius))
    return Image.merge("RGBA", (r, g, b, a))


def validate_edge_transparent(img):
    """Check that a transparent resource has proper transparent margin.

    Layer 2 gate checks:
    - Outer 2px: non-transparent pixel ratio <= 1%
    - Four corners 8x8: non-transparent ratio <= 1%
    - Subject alpha bbox has >= 6px padding from all 4 edges

    Returns (pass: bool, issues: list[str]).
    """
    issues = []
    if img.mode != "RGBA":
        return True, issues

    w, h = img.size
    pixels = img.load()

    def _ratio_in_area(x1, y1, x2, y2):
        opaque = 0
        total = 0
        for y in range(max(y1, 0), min(y2, h)):
            for x in range(max(x1, 0), min(x2, w)):
                total += 1
                if pixels[x, y][3] > 0:
                    opaque += 1
        return opaque / total if total > 0 else 0.0

    # Outer 2px strip on all 4 edges
    top_r = _ratio_in_area(0, 0, w, 2)
    bot_r = _ratio_in_area(0, h - 2, w, h)
    lft_r = _ratio_in_area(0, 2, 2, h - 2)
    rgt_r = _ratio_in_area(w - 2, 2, w, h - 2)
    max_edge_ratio = max(top_r, bot_r, lft_r, rgt_r)
    if max_edge_ratio > 0.01:
        issues.append(
            f"边缘透明不足: 最外2px非透明率{max_edge_ratio:.1%}"
            f" (T{top_r:.1%}/B{bot_r:.1%}/L{lft_r:.1%}/R{rgt_r:.1%})"
        )

    # Four 8x8 corners
    corners = [(0, 0), (w - 8, 0), (0, h - 8), (w - 8, h - 8)]
    for cx, cy in corners:
        cr = _ratio_in_area(cx, cy, min(cx + 8, w), min(cy + 8, h))
        if cr > 0.01:
            issues.append(f"角({cx},{cy})非透明率{cr:.1%}")
            break

    # Subject alpha bbox padding
    alpha = img.split()[3]
    alpha_bbox = alpha.getbbox()
    if alpha_bbox:
        l, t, r, b = alpha_bbox
        pad_l, pad_t = l, t
        pad_r, pad_b = w - r, h - b
        min_pad = min(pad_l, pad_t, pad_r, pad_b)
        if min_pad < 6:
            issues.append(
                f"主体留边不足: L{pad_l}/T{pad_t}/R{pad_r}/B{pad_b} (min={min_pad}px)"
            )

    return len(issues) == 0, issues


def validate_visual_quality(img, category, filename=""):
    """Visual quality gate for ALL resource types.

    Universal checks (all types):
    - Global brightness: not all dark / all light / all single color
    - Global variance: image should not be a solid block (too flat/blank)

    Transparent resources extra:
    - Subject proportion: subject should occupy a reasonable portion
    - Subject centering: alpha bbox should not be severely off-center

    Type-specific:
    - Button/card/panel: center region blank (low variance)
    - Backgrounds: enough scene detail (variance above threshold)
    """
    issues = []
    if img.mode not in ("RGBA", "RGB"):
        return True, issues

    w, h = img.size
    pixels = img.load()
    total = w * h
    is_transparent = img.mode == "RGBA"

    # Collect opaque pixel data
    opaque_pixels = []
    opaque_count = 0
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y][:3]
            if is_transparent:
                a = pixels[x, y][3] if len(pixels[x, y]) > 3 else 255
                if a < 16:
                    continue
            opaque_pixels.append((r, g, b))
            opaque_count += 1

    # --- 1. Universal: brightness and flatness ---
    if opaque_count > 0:
        avg_r = sum(p[0] for p in opaque_pixels) / opaque_count
        avg_g = sum(p[1] for p in opaque_pixels) / opaque_count
        avg_b = sum(p[2] for p in opaque_pixels) / opaque_count
        avg_luma = avg_r * 0.299 + avg_g * 0.587 + avg_b * 0.114

        if avg_luma < 30:
            issues.append("brightness_too_dark: avg luma {:.0f}".format(avg_luma))
        elif avg_luma > 230:
            issues.append("brightness_too_bright: avg luma {:.0f}".format(avg_luma))

        var_r = sum((p[0] - avg_r) ** 2 for p in opaque_pixels) / opaque_count
        var_g = sum((p[1] - avg_g) ** 2 for p in opaque_pixels) / opaque_count
        var_b = sum((p[2] - avg_b) ** 2 for p in opaque_pixels) / opaque_count
        avg_std = ((var_r + var_g + var_b) / 3) ** 0.5

        if avg_std < 15:
            issues.append("image_too_flat: color std {:.0f}".format(avg_std))
    else:
        issues.append("no_opaque_pixels: image is fully transparent")

    # --- 2. Transparent: subject centering ---
    if is_transparent:
        from PIL import Image as _PIL
        _, _, _, alpha = img.split()
        bbox = alpha.getbbox()
        if bbox:
            l, t, r, b_ = bbox
            sb_w = r - l
            sb_h = b_ - t
            ratio = (sb_w * sb_h) / total
            if ratio < 0.01 and opaque_count > 0:
                issues.append("subject_too_small: {:.1%} of canvas".format(ratio))
            cx_img = w / 2
            cy_img = h / 2
            cx_sb = (l + r) / 2
            cy_sb = (t + b_) / 2
            offset_x = abs(cx_sb - cx_img) / w
            offset_y = abs(cy_sb - cy_img) / h
            if offset_x > 0.25 or offset_y > 0.25:
                issues.append("subject_off_center: h{:.0%}/v{:.0%}".format(offset_x, offset_y))

    # --- 3. Button/card/panel: center blank check ---
    is_blank_type = any(tag in filename for tag in
        ["btn_", "card_", "panel_", "frame_", "input_", "name_", "strip_"])
    if category in ORNAMENT_TYPES and is_blank_type:
        cx, cy = w // 2, h // 2
        cw, ch = max(w // 4, 8), max(h // 4, 8)
        x1 = max(cx - cw // 2, 0)
        y1 = max(cy - ch // 2, 0)
        x2 = min(cx + cw // 2, w)
        y2 = min(cy + ch // 2, h)

        cv = []
        for y in range(y1, y2):
            for x in range(x1, x2):
                if is_transparent and pixels[x, y][3] < 128:
                    continue
                cv.append((pixels[x, y][0], pixels[x, y][1], pixels[x, y][2]))

        if cv:
            mr = sum(v[0] for v in cv) / len(cv)
            mg = sum(v[1] for v in cv) / len(cv)
            mb = sum(v[2] for v in cv) / len(cv)
            vr = sum((v[0] - mr) ** 2 for v in cv) / len(cv)
            vg = sum((v[1] - mg) ** 2 for v in cv) / len(cv)
            vb = sum((v[2] - mb) ** 2 for v in cv) / len(cv)
            center_std = ((vr + vg + vb) / 3) ** 0.5
            if center_std > 30:
                issues.append("center_not_blank: color std {:.0f}".format(center_std))

    # --- 4. Background: scene detail check ---
    if category == "backgrounds" and opaque_count > 0:
        if avg_std < 25:
            issues.append("background_low_detail: color std {:.0f}".format(avg_std))

    # --- 5. Chroma residuals (transparent only) ---
    if is_transparent:
        chroma_count = 0
        for y in range(h):
            for x in range(w):
                if pixels[x, y][3] == 0:
                    pr, pg, pb = pixels[x, y][:3]
                    if (pr >= 210 and pb >= 170 and pg <= 95) or (pg >= 210 and pr <= 95 and pb <= 95):
                        chroma_count += 1
        if chroma_count > 10:
            issues.append("chroma_residuals: {} transparent pixels magenta/green".format(chroma_count))

    return len(issues) == 0, issues


def reduce_palette(img, max_colors):
    """Reduce color count to fit within budget. Returns (new_img, actual_colors)."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    # Extract alpha, quantize RGB channels
    r, g, b, a = img.split()
    rgb = Image.merge("RGB", (r, g, b))
    quantized = rgb.quantize(colors=min(max_colors, 256), method=Image.Quantize.MEDIANCUT)
    # Rebuild RGBA
    out = quantized.convert("RGBA")
    out.putalpha(a)
    # Count actual unique colors
    colors_used = len(set(out.getdata()))
    return out, colors_used


def post_process_generated(master_path, target_size, category, output_path,
                           max_kb=120, overscan_factor=1.0):
    """Full post-processing pipeline: overscan crop -> matte removal -> alpha feather
    -> chroma cleanup -> fit_rgba_to_canvas -> palette reduction -> size check.

    For ornament/border type resources, overscan_factor > 1 means the API
    generated at a larger canvas; we crop to target and fit with margin.

    Returns (ok: bool, error_or_warning: str, final_size_kb: int).
    """
    img = Image.open(master_path)

    # Step 1: For transparent categories, use margin-aware fit instead of center-crop
    if category in TRANSPARENT_CATEGORIES:
        # Apply matte removal and chroma cleanup at full resolution first
        if category in MATTE_CATEGORIES:
            img = remove_matte_background(img)
        img = remove_chroma_pixels(img)
        if img.mode != "RGBA":
            img = img.convert("RGBA")

        # Fit to target canvas with margin:
        # 装饰框/UI/icon 需要较宽透明边距；角色/怪物/BOSS/特效应几乎铺满画布
        if category in ORNAMENT_TYPES:
            margin_ratio = 0.12
            resample = Image.LANCZOS
            max_scale = 1.0
        else:
            margin_ratio = 0.0
            resample = Image.NEAREST
            max_scale = 1.5
        img = fit_rgba_to_canvas(img, target_size, margin_ratio, resample, max_scale)

        # Feather alpha for smooth edge transitions (仅装饰框/UI/icon 需要柔边)
        if category in ORNAMENT_TYPES:
            img = feather_alpha(img, radius=0.8)
    else:
        # Backgrounds: center-crop to aspect then resize
        img = crop_to_target_aspect(img, target_size)
        img = img.resize(target_size, Image.LANCZOS)
        if category == "backgrounds":
            if img.mode != "RGB":
                img = img.convert("RGB")

    # Step 3: Palette reduction if over budget
    max_colors = PALETTE_RETRY_STEPS.get(category, (256, 128, 64))

    # Determine save format from output_path extension
    ext = os.path.splitext(output_path)[1].lower()
    save_format = "JPEG" if ext in (".jpg", ".jpeg") else "PNG"
    if save_format == "JPEG" and img.mode == "RGBA":
        img = img.convert("RGB")

    last_tmp = None
    try:
        for colors in (max_colors if isinstance(max_colors, (list, tuple)) else (256,)):
            # Save temporarily to check size
            tmp_path = output_path + ".tmp_check.png"
            img.save(tmp_path, "PNG")
            fsize = os.path.getsize(tmp_path)
            last_tmp = tmp_path

            if fsize <= max_kb * 1024:
                # Under budget — finalize with correct format
                if save_format == "JPEG":
                    rgb = img.convert("RGB") if img.mode == "RGBA" else img
                    rgb.save(output_path, "JPEG", quality=85, optimize=True)
                    if os.path.isfile(tmp_path):
                        os.remove(tmp_path)
                else:
                    shutil.move(tmp_path, output_path)
                fsize = os.path.getsize(output_path) if os.path.isfile(output_path) else 0
                return True, "", fsize / 1024
            elif colors > 8:
                # Reduce palette and retry
                img, _ = reduce_palette(img, colors)
            else:
                # Can't reduce further — save as-is with correct format
                if save_format == "JPEG":
                    rgb = img.convert("RGB") if img.mode == "RGBA" else img
                    rgb.save(output_path, "JPEG", quality=85, optimize=True)
                    if os.path.isfile(tmp_path):
                        os.remove(tmp_path)
                else:
                    shutil.move(tmp_path, output_path)
                fsize = os.path.getsize(output_path) if os.path.isfile(output_path) else 0
                return True, f"size_warning:{fsize/1024:.0f}KB>{max_kb}KB", fsize / 1024

        # Loop exhausted without saving — save the last temp file to output
        if last_tmp and os.path.isfile(last_tmp) and not os.path.isfile(output_path):
            if save_format == "JPEG":
                rgb = img.convert("RGB") if img.mode == "RGBA" else img
                rgb.save(output_path, "JPEG", quality=85, optimize=True)
                os.remove(last_tmp)
            else:
                shutil.move(last_tmp, output_path)
        fsize = os.path.getsize(output_path) if os.path.isfile(output_path) else 0
        return True, f"size_warning:{fsize/1024:.0f}KB>{max_kb}KB" if fsize > max_kb * 1024 else "", fsize / 1024
    finally:
        # 确保任何中断情况下都清理临时检查文件
        if os.path.isfile(last_tmp or ""):
            try:
                os.remove(last_tmp)
            except OSError:
                pass


def validate_technical(filepath, expected_size=None, max_kb=None, category=None,
                       asset_kind=None, dim=None):
    """技术门禁检查。返回 (pass, issues_list)。

    Enhanced checks:
    - File existence
    - Image dimensions match expected
    - Mode is RGBA or RGB (not indexed/CMYK)
    - Filename conforms to naming convention: lowercase letters, digits, underscores only
    - For transparent categories: alpha has smooth edges, not hard 0/255 cut
    - For transparent categories: subject has minimum opaque pixel ratio
    - File volume within budget
    - No chroma residuals (magenta/green/cyan at alpha=0)
    """
    issues = []
    if not os.path.isfile(filepath):
        issues.append("文件不存在")
        return False, issues

    # 3D upgrade (P2): 3D model assets route to the 3D gate, not raster-image checks
    if dim == "3d":
        return _validate_3d_asset(filepath, category=category)

    # 命名规范检查（ART_RESOURCE_RULES.md Section 6: lowercase + digits + underscores only）
    filename = os.path.basename(filepath)
    name_no_ext = os.path.splitext(filename)[0]
    if not re.match(r"^[a-z0-9_]+$", name_no_ext):
        issues.append(f"文件名不合规: {filename}（必须小写英文+数字+下划线）")

    fsize = os.path.getsize(filepath)
    try:
        img = Image.open(filepath)
    except Exception as e:
        issues.append(f"无法打开图片: {e}")
        return False, issues

    # 尺寸检查
    if expected_size and img.size != expected_size:
        issues.append(f"尺寸不匹配: 期望 {expected_size}, 实际 {img.size}")

    # 模式检查（不允许索引色、CMYK）
    if img.mode not in ("RGBA", "RGB"):
        issues.append(f"模式异常: {img.mode}（应为 RGBA 或 RGB）")

    # 程序化 UI 走轻量验证（不检查 alpha/边缘/Chroma）
    if asset_kind == "procedural_ui":
        if max_kb and fsize > max_kb * 1024:
            issues.append(f"体积超标: {fsize / 1024:.1f}KB > {max_kb}KB")
        return len(issues) == 0, issues

    # 透明相关检查
    if img.mode == "RGBA":
        r, g, b, a = img.split()
        a_data = list(a.getdata())
        total_pixels = len(a_data)

        # 硬切边检查（仅装饰框/UI/icon 需要渐变过渡）
        if category in ORNAMENT_TYPES:
            mid_count = sum(1 for v in a_data if 0 < v < 255)
            if mid_count == 0 and total_pixels > 0:
                issues.append("Alpha 硬切边: 没有 0<v<255 的过渡像素")

        # 透明类别：检查是否完全透明（opaque ratio）
        if category and category in MIN_OPAQUE_RATIO:
            opaque_count = sum(1 for v in a_data if v > 0)
            ratio = opaque_count / total_pixels if total_pixels > 0 else 0
            min_ratio = MIN_OPAQUE_RATIO.get(category, 0)
            if ratio < min_ratio:
                issues.append(f"不透明像素比例过低: {ratio:.1%} < {min_ratio:.0%}（可能全透明或只有微量主体）")

        # 边缘透明检查（Layer 2 门禁：仅装饰框/UI/icon 需要严格留边）
        if category in ORNAMENT_TYPES:
            edge_ok, edge_issues = validate_edge_transparent(img)
            if not edge_ok:
                issues.extend(edge_issues)

        # Chroma 残留检查（alpha=0 的像素不应是纯品红/绿/青色）
        rgba_pixels = img.load()
        chroma_found = False
        for y in range(min(img.height, 32)):  # 只检查顶部部分行
            for x in range(img.width):
                pr, pg, pb, pa = rgba_pixels[x, y]
                if pa > 0:
                    continue
                is_magenta = (pr >= 210 and pb >= 170 and pg <= 95)
                is_green = (pg >= 210 and pr <= 95 and pb <= 95)
                if is_magenta or is_green:
                    chroma_found = True
                    break
            if chroma_found:
                break
        if chroma_found:
            issues.append("Chroma 残留: 透明像素中存在品红/绿色")

        # 视觉质量门禁
        fname = os.path.basename(filepath)
        vq_ok, vq_issues = validate_visual_quality(img, category, fname)
        if not vq_ok:
            issues.extend(vq_issues)

    # 对 RGB（背景）也做视觉质量检查
    if img.mode == "RGB":
        fname = os.path.basename(filepath)
        vq_ok, vq_issues = validate_visual_quality(img, category, fname)
        if not vq_ok:
            issues.extend(vq_issues)

    # 体积检查
    if max_kb and fsize > max_kb * 1024:
        issues.append(f"体积超标: {fsize / 1024:.1f}KB > {max_kb}KB")

    return len(issues) == 0, issues


# ── 3D asset gate (P2: 3D upgrade) ──────────────────────────
# Budget is read from art_quality_budget.json `rules3d` (single source of truth,
# see ART_RESOURCE_RULES.md §16). Mirrors tools/asset_validate.py logic inline
# so the pipeline needs no subprocess.

_RULES3D_CACHE = None

def _rules3d():
    """Load rules3d budget (cached). Returns {} if absent."""
    global _RULES3D_CACHE
    if _RULES3D_CACHE is None:
        _RULES3D_CACHE = {}
        if os.path.isfile(RULES3D_BUDGET_JSON):
            try:
                with open(RULES3D_BUDGET_JSON, encoding="utf-8") as f:
                    d = json.load(f)
                _RULES3D_CACHE = d.get("rules3d", {}) or {}
            except Exception:
                _RULES3D_CACHE = {}
    return _RULES3D_CACHE

def _rules3d_bucket(category, key=None):
    """Map a category/key to its rules3d bucket name (matches art_quality_budget.json)."""
    if category == "characters":
        return "characters"
    if category == "monsters":
        return "monsters"
    if category == "bosses":
        return "bosses_final" if (key and "final" in key.lower()) else "bosses_mini"
    if category == "effects":
        return "effects_boss" if (key and "boss" in key.lower()) else "effects_normal"
    if category == "tiles":
        return "tiles"
    return None

def _validate_3d_asset(filepath, category=None):
    """3D model/prefab technical gate. Returns (pass, issues_list).

    Checks:
      - extension is a 3D asset (.glb/.gltf/.prefab/.fbx)
      - filename matches rules3d naming convention (CHR_/MON_/BOSS_/FX_/TILE_)
      - if a sidecar <file>.assetmeta.json exists, compare tri/bones/texture to budget
    """
    issues = []
    filename = os.path.basename(filepath)
    ext = os.path.splitext(filename)[1].lower()
    if ext not in (".glb", ".gltf", ".prefab", ".fbx"):
        issues.append(f"3D 资产扩展名不合规: {filename}（应为 .glb/.gltf/.prefab/.fbx）")
        return False, issues

    bucket = _rules3d_bucket(category, filename)
    rules = _rules3d()
    pattern = rules.get("naming", {}).get("pattern")
    if not pattern:
        pattern = r"^(CHR|MON|BOSS|FX|TILE)_[A-Za-z0-9]+"
    if not re.match(pattern, os.path.splitext(filename)[0]):
        issues.append(f"3D 命名不合规: {filename}（需匹配 {pattern}）")

    meta_path = filepath + ".assetmeta.json"
    if os.path.isfile(meta_path):
        try:
            with open(meta_path, encoding="utf-8") as f:
                meta = json.load(f)
        except Exception as e:
            issues.append(f"无法解析 meta: {e}")
            return False, issues
        b = rules.get(bucket, {})
        tri_max = b.get("maxTri")
        if tri_max and isinstance(meta.get("tri"), int) and meta["tri"] > tri_max:
            issues.append(f"三角面超标: {meta.get('tri')} > {tri_max}")
        bones_max = b.get("maxBones")
        if bones_max and isinstance(meta.get("bones"), int) and meta["bones"] > bones_max:
            issues.append(f"骨骼数超标: {meta.get('bones')} > {bones_max}")
        tex_max = b.get("textureSize")
        if tex_max and isinstance(meta.get("textureSize"), int) and meta["textureSize"] > tex_max:
            issues.append(f"贴图尺寸超标: {meta.get('textureSize')} > {tex_max}（预算上限）")
    return len(issues) == 0, issues


# ── 子命令实现 ──────────────────────────────────────────────


def cmd_audit(args):
    """audit: 扫描所有资源，对比磁盘/进度文件，输出待处理清单。"""
    prompts = load_prompts()
    progress = ProgressTracker()

    if args.resource:
        keys = [k for k in prompts if k == args.resource]
    elif args.category:
        keys = sorted(k for k in prompts if k.startswith(args.category))
    else:
        keys = sorted(prompts.keys())

    if args.limit:
        keys = keys[:args.limit]

    print(f"Audit: 共匹配 {len(keys)} 个资源")
    print(f"{'状态':<14} {'key':<60}")
    print("-" * 80)

    need_generate = []
    for key in keys:
        entry = progress.get(key)
        status = entry.get("status", ST_PLANNED)
        disk_path = os.path.join(TEXTURES_DIR, key)
        has_disk = os.path.isfile(disk_path)

        # 状态处理
        if status == ST_IMPORTED and has_disk:
            print(f"  {ST_IMPORTED:<12} {key}")
        elif status == ST_FAILED:
            print(f"  {ST_FAILED:<12} {key} (重试 {entry['failCount']} 次)")
            need_generate.append(key)
        elif status in (ST_PLANNED, ST_PROMPTING, ST_GENERATED, ST_VALIDATED, ST_APPROVED):
            need_generate.append(key)
            print(f"  {status:<12} {key}")
        else:
            print(f"  {status:<12} {key} (磁盘={'有' if has_disk else '无'})")
            if not has_disk:
                need_generate.append(key)

    print(f"\n需要生成: {len(need_generate)} 个")
    for key in need_generate:
        info = classify_resource(key)
        if info["dim"] == "3d":
            gen = "3D建模"
        elif info["is_procedural"]:
            gen = "程序化"
        else:
            gen = "AI"
        print(f"  [{gen}] {key}")
    return need_generate


def cmd_generate(args):
    """generate: 生成缺失/失败的资源。"""
    prompts = load_prompts()
    progress = ProgressTracker()
    _cleanup_stale_temps(MASTER_DIR)
    keys_to_process = []

    if args.resource:
        keys_to_process = [args.resource]
    elif args.category:
        keys_to_process = sorted(
            k for k in prompts if k.startswith(args.category))
    elif args.resume_failed:
        keys_to_process = sorted(
            k for k, v in progress.data["resources"].items()
            if v.get("status") == ST_FAILED
        )
    elif args.all:
        keys_to_process = sorted(prompts.keys())
    else:
        print("错误: 必须指定 --resource、--category、--all 或 --resume-failed")
        sys.exit(1)

    # 应用 limit
    if args.limit and len(keys_to_process) > args.limit:
        keys_to_process = keys_to_process[:args.limit]

    print(f"Generate: 计划处理 {len(keys_to_process)} 个资源")

    succeed = 0
    failed = 0
    skipped = 0

    for idx, key in enumerate(keys_to_process):
        entry = progress.get(key)
        info = classify_resource(key, getattr(args, "mode", "2d"))

        # 3D assets are authored in Blender, not AI-generated. Skip Agnes gen;
        # they enter via `import` after export+Prefab. (ART_RESOURCE_RULES.md §16)
        if info["dim"] == "3d":
            print(f"  → 跳过 AI 生成 (3D 资产，需经 Blender→glb→Prefab 流程；"
                  f"用 import 直接入库)")
            skipped += 1
            continue

        print(f"\n[{idx + 1}/{len(keys_to_process)}] {key}")

        # 跳过已完成且未被强制重做的
        if not args.force and entry.get("status") in (ST_IMPORTED, ST_APPROVED, ST_VALIDATED):
            if not args.resume_failed:
                print(f"  → 跳过 (状态: {entry['status']})")
                skipped += 1
                continue

        # 失败次数过多则跳过
        if entry.get("failCount", 0) >= 2 and not args.force:
            print(f"  → 跳过 (已失败 {entry['failCount']} 次, 用 --force 强制重试)")
            skipped += 1
            continue

        # 确定输出路径
        master_path = os.path.join(MASTER_DIR, key)
        candidate_path = os.path.join(CANDIDATES_DIR, key)
        ensure_dir(os.path.dirname(master_path))
        ensure_dir(os.path.dirname(candidate_path))

        # 提取目标尺寸（规则推荐 → prompt提取 → 128x128）
        orig_prompt = prompts.get(key, "")
        target_size = resolve_target_size(info["category"], key)
        if target_size is None:
            dim = find_dimension_in_prompt(orig_prompt)
            target_size = dim or (128, 128)

        prompt_hash_val = prompt_hash(orig_prompt)

        # 检查是否可复用（prompt 没变且已有成功 master）
        if not args.force:
            if os.path.isfile(master_path):
                existing_hash = file_hash(master_path)
                if (entry.get("promptHash") == prompt_hash_val
                        and entry.get("fileHash") == existing_hash
                        and entry.get("status") not in (ST_FAILED, ST_PLANNED)):
                    print(f"  → 复用已有 master (哈希匹配)")
                    progress.update(key, status=ST_GENERATED,
                                    promptHash=prompt_hash_val,
                                    fileHash=existing_hash)
                    succeed += 1
                    continue

        # 生成
        try:
            progress.update(key, status=ST_PROMPTING)

            if info["is_procedural"]:
                print(f"  → 程序化生成 {target_size}")
                ok, err = generate_procedural(info, master_path)
                if not ok:
                    progress.mark_failed(key, err)
                    print(f"  ✗ 失败: {err}")
                    failed += 1
                    continue
                print(f"  ✓ master 已生成: {master_path}")
            else:
                # AI 生成
                if not orig_prompt:
                    progress.mark_failed(key, "prompts.json 中没有该资源的 prompt")
                    print(f"  ✗ 失败: prompts.json 中无此资源")
                    failed += 1
                    continue

                # 构造完整 prompt（使用类别专属的 DETAIL_ANCHORS）
                # 部件化角色部件 (/parts/) 用自己的 CREATURE_CORE 包装，
                # 跳过 detail_anchors["characters"]（其内容是 sheet 描述，与部件 prompt 冲突）
                if "/parts/" in key:
                    ct_prompt = orig_prompt
                else:
                    detail = DETAIL_ANCHORS.get(info["category"], "")
                    ct_prompt = f"{STYLE_ANCHOR} {orig_prompt} {detail} {SAFETY_BLOCK}"
                # 装饰框类按目标纵横比 overscan，给 AI 物理余量
                if info["category"] in ORNAMENT_TYPES:
                    tw, th = target_size
                    scale = 512 / min(tw, th)  # 短边至少 512，保持目标比例
                    gen_size_str = f"{int(tw * scale)}x{int(th * scale)}"
                else:
                    # 角色/怪物/BOSS/特效：生成尺寸按目标等比放大，
                    # 小 sprite 用更大的源尺寸保证缩回后细节清晰
                    tw, th = target_size
                    if tw < 64 or th < 64:
                        # 极小 sprite（如 48x48）：用 256 作为短边
                        scale = 256 / min(tw, th)
                    elif tw < 128 or th < 128:
                        scale = 3.0
                    elif tw < 256 or th < 256:
                        scale = 2.0
                    else:
                        scale = 1.5
                    gen_size_str = f"{int(tw * scale)}x{int(th * scale)}"

                print(f"  → 调用 Agnes API (size={gen_size_str}, category={info['category']})...")
                url, err = call_agnes_api(ct_prompt, gen_size_str)
                if err:
                    progress.mark_failed(key, err)
                    print(f"  ✗ API 失败: {err}")
                    failed += 1
                    continue

                print(f"  → 下载图片...")
                temp_path = master_path + ".tmp"
                try:
                    ok, err = download_image(url, temp_path)
                    if not ok:
                        progress.mark_failed(key, err)
                        print(f"  ✗ 下载失败: {err}")
                        failed += 1
                        continue

                    # 全流程后处理：缩放 → 抠图 → 去绿幕 → 调色板压缩 → 体积检查
                    budget = budget_limits(info["category"])
                    max_kb = budget.get("hard", 120)
                    overscan_factor = 1.8 if info["category"] in ORNAMENT_TYPES else 1.0
                    ok, warn, final_kb = post_process_generated(
                        temp_path, target_size, info["category"], master_path, max_kb,
                        overscan_factor)
                    if not ok:
                        progress.mark_failed(key, warn)
                        print(f"  ✗ 后处理失败: {warn}")
                        failed += 1
                        continue
                finally:
                    # 无论成功还是中断，都清理临时文件
                    if os.path.isfile(temp_path):
                        os.remove(temp_path)
                size_note = f" ({final_kb:.0f}KB)"
                if warn:
                    size_note += f" [WARN: {warn}]"
                print(f"  ✓ AI master {target_size}{size_note}: {master_path}")

            # 复制到 runtime_candidates（程序化直接复制，AI 需后处理）
            shutil.copy2(master_path, candidate_path)
            progress.update(key, status=ST_GENERATED,
                            promptHash=prompt_hash_val,
                            fileHash=file_hash(master_path),
                            source=("procedural" if info["is_procedural"] else "ai"))
            succeed += 1
            print(f"  ✓ runtime_candidate 已同步")

        except KeyboardInterrupt:
            print(f"\n  ⚠ 中断于 {key}，进度已保存")
            sys.exit(1)
        except Exception as e:
            progress.mark_failed(key, str(e))
            print(f"  ✗ 异常: {e}")
            failed += 1

    print(f"\n完成: 成功 {succeed}, 失败 {failed}, 跳过 {skipped}")

    # 自检查：如果指定了 --self-check，对刚生成的 resources 运行技术门禁
    if args.self_check and succeed > 0:
        print(f"\n[自检查] 对 {succeed} 个已生成资源进行技术门禁...")
        # 构造一个伪 args 传入 cmd_validate
        class FakeArgs:
            resource = None
            category = args.category
            all = True
            limit = None
        # 只检查刚生成的分类/资源
        fake = FakeArgs()
        fake.resource = args.resource
        fake.category = args.category
        if args.resource:
            fake.all = False
        cmd_validate(fake)


def cmd_validate(args):
    """validate: 对 generated 状态的资源做技术门禁检查。"""
    # 3D 模式：从 manifest 驱动，复用 asset_validate.py 单一来源 (GAP 1+8)
    if getattr(args, "mode", "2d") == "3d":
        _cmd_validate_3d(args)
        return
    prompts = load_prompts()
    progress = ProgressTracker()

    # 收集需要验证的资源
    keys_to_check = []
    if args.resource:
        keys_to_check = [args.resource]
    elif args.category:
        prefix = args.category
        keys_to_check = sorted(
            k for k in progress.data["resources"]
            if k.startswith(prefix)
        )
    elif args.all:
        keys_to_check = sorted(progress.data["resources"].keys())
    else:
        keys_to_check = sorted(
            k for k, v in progress.data["resources"].items()
            if v.get("status") in (ST_GENERATED, ST_VALIDATED, ST_FAILED)
        )
        if not keys_to_check:
            print("没有处于 generated/validated/failed 状态的资源需要验证")
            return

    print(f"Validate: {len(keys_to_check)} 个资源")

    passed = 0
    failed_count = 0
    for key in keys_to_check:
        info = classify_resource(key, getattr(args, "mode", "2d"))
        candidate_path = os.path.join(CANDIDATES_DIR, key)
        master_path = os.path.join(MASTER_DIR, key)

        # 优先检查 runtime_candidate，没有则检查 master
        check_path = candidate_path if os.path.isfile(
            candidate_path) else master_path
        if not os.path.isfile(check_path):
            progress.mark_failed(key, "验证文件不存在")
            print(f"  ✗ {key}: 文件不存在")
            failed_count += 1
            continue

        # 提取目标尺寸（与 generate 一致：规则推荐 → prompt → 128x128）
        orig_prompt = prompts.get(key, "")
        dim = resolve_target_size(info["category"], key)
        if dim is None:
            dim = find_dimension_in_prompt(orig_prompt)
        if dim is None:
            dim = (128, 128)

        # 体积预算（从 ART_RESOURCE_RULES.md 读取）
        budget = budget_limits(info["category"])
        max_kb = budget.get("hard", 256)

        ok, issues = validate_technical(check_path, dim, max_kb,
                                           category=info["category"],
                                           asset_kind=info.get("asset_kind"),
                                           dim=info.get("dim"))
        if ok:
            progress.update(key, status=ST_VALIDATED,
                            fileHash=file_hash(check_path))
            print(f"  ✓ {key}")
            passed += 1
        else:
            progress.mark_failed(key, "; ".join(issues))
            print(f"  ✗ {key}: {'; '.join(issues)}")
            failed_count += 1

    print(f"\n验证完成: 通过 {passed}, 失败 {failed_count}")


def cmd_import(args):
    """import: 将 validated/approved 的资源复制到正式目录。"""
    # 3D 模式：从 manifest 驱动，强制 asset_validate 通过 (GAP 1+4)
    if getattr(args, "mode", "2d") == "3d":
        _cmd_import_3d(args)
        return
    progress = ProgressTracker()

    if args.resource:
        keys_to_import = [args.resource]
    elif args.category:
        keys_to_import = sorted(
            k for k, v in progress.data["resources"].items()
            if k.startswith(args.category) and v.get("status") in (ST_VALIDATED, ST_APPROVED)
        )
    else:
        keys_to_import = sorted(
            k for k, v in progress.data["resources"].items()
            if v.get("status") in (ST_VALIDATED, ST_APPROVED)
        )

    if not keys_to_import:
        print("没有 validated/approved 状态的资源需要导入")
        return

    print(f"Import: {len(keys_to_import)} 个资源")
    imported = 0
    for key in keys_to_import:
        info = classify_resource(key, getattr(args, "mode", "2d"))
        candidate_path = os.path.join(CANDIDATES_DIR, key)

        textures_path = os.path.join(TEXTURES_DIR, key)

        if not os.path.isfile(candidate_path):
            print(f"  ✗ {key}: candidate 文件不存在")
            continue

        # 备份旧文件到 backup/
        if os.path.isfile(textures_path):
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_subdir = os.path.join(
                BACKUP_DIR, f"pre_import_{ts}")
            ensure_dir(backup_subdir)
            rel_backup = os.path.join(backup_subdir, os.path.basename(key))
            shutil.copy2(textures_path, rel_backup)
            print(f"  → 已备份旧文件到 {rel_backup}")

        # 复制候选到正式目录
        ensure_dir(os.path.dirname(textures_path))
        shutil.copy2(candidate_path, textures_path)
        progress.update(key, status=ST_IMPORTED,
                        fileHash=file_hash(candidate_path))
        print(f"  ✓ {key}")
        imported += 1

    print(f"\n导入完成: {imported}/{len(keys_to_import)}")


def cmd_contact(args):
    """contact: 生成 contact sheet 供人工视觉验收。"""
    from PIL import ImageDraw, ImageFont

    if args.category:
        keys = sorted(
            k for k in load_prompts()
            if k.startswith(args.category)
        )
    else:
        keys = sorted(load_prompts().keys())

    if args.limit:
        keys = keys[:args.limit]

    if not keys:
        print("没有资源可以生成 contact sheet")
        return

    # 收集有 master 的图片
    images = []
    for key in keys:
        master_path = os.path.join(MASTER_DIR, key)
        if os.path.isfile(master_path):
            images.append((key, master_path))

    if not images:
        print("没有找到任何 master 文件")
        return

    # 计算网格布局
    cols = min(6, len(images))
    rows = (len(images) + cols - 1) // cols
    thumb_w, thumb_h = 200, 150
    padding = 8
    label_h = 28
    cell_w = thumb_w + padding * 2
    cell_h = thumb_h + label_h + padding * 2

    canvas_w = cols * cell_w + padding * 2
    canvas_h = rows * cell_h + padding * 2 + 40

    canvas = Image.new("RGB", (canvas_w, canvas_h), (40, 40, 40))
    draw = ImageDraw.Draw(canvas)
    draw.text((padding, padding), f"Contact Sheet ({len(images)} items)",
              fill=(200, 200, 200))

    x0 = padding
    y0 = padding + 40

    for idx, (key, master_path) in enumerate(images):
        col = idx % cols
        row = idx // cols
        x = x0 + col * cell_w + padding
        y = y0 + row * cell_h + padding

        try:
            img = Image.open(master_path)
            img.thumbnail((thumb_w, thumb_h), Image.LANCZOS)
            canvas.paste(img, (x + (thumb_w - img.width) // 2,
                               y + (thumb_h - img.height) // 2))
        except Exception:
            draw.rectangle([x, y, x + thumb_w, y + thumb_h],
                           fill=(80, 0, 0))
            draw.text((x + 8, y + 8), "FAIL", fill=(255, 100, 100))

        # 显示文件名简称
        short_name = os.path.basename(key)
        if len(short_name) > 28:
            short_name = short_name[:25] + "..."
        draw.text((x, y + thumb_h + 4), short_name,
                  fill=(180, 180, 180))

    ensure_dir(CONTACTS_DIR)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    cat = (args.category or "all").replace("/", "_")
    output_path = os.path.join(CONTACTS_DIR, f"contact_{cat}_{ts}.png")
    canvas.save(output_path)

    print(f"Contact sheet 已生成: {output_path}")
    print(f"  图片: {len(images)} 张, 网格: {cols}x{rows}, 画布: {canvas_w}x{canvas_h}")


def cmd_status(args):
    """status: 打印进度摘要。"""
    progress = ProgressTracker()
    progress.summary(args.category)


def cmd_reset(args):
    """reset: 重置进度。"""
    progress = ProgressTracker()

    if args.resource:
        count = progress.reset(key=args.resource)
        print(f"已重置资源: {args.resource} ({'完成' if count else '未找到'})")
    elif args.category:
        count = progress.reset(category=args.category)
        print(f"已重置类别: {args.category} ({count} 条)")
    else:
        count = progress.reset()
        print(f"已重置全部进度 ({count} 条)")


# ── CLI 入口 ──────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="美术资源生成与入库一体化管线",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  # 审计
  python tools/art_pipeline.py audit
  python tools/art_pipeline.py audit --category backgrounds
  python tools/art_pipeline.py audit --resource backgrounds/bg_combat_forest.jpg

  # 生成
  python tools/art_pipeline.py generate --resource backgrounds/bg_combat_forest.jpg
  python tools/art_pipeline.py generate --category bosses --limit 5
  python tools/art_pipeline.py generate --all --limit 10
  python tools/art_pipeline.py generate --resume-failed

  # 验证
  python tools/art_pipeline.py validate --all
  python tools/art_pipeline.py validate --category ui/create

  # Contact sheet
  python tools/art_pipeline.py contact --category ui/create
  python tools/art_pipeline.py contact --all

  # 导入
  python tools/art_pipeline.py import --all

  # 3D 资产入库（先经 Blender->glb->Prefab，放入候选区后由 manifest 驱动）
  #   → 强制 asset_validate.py 通过，未过校验禁止入库
  python tools/art_pipeline.py import --mode 3d --category bosses
  python tools/art_pipeline.py import --mode 3d --resource CHR_Archer_A
  # 3D 资产技术门禁（复用 asset_validate.py 单一来源）
  python tools/art_pipeline.py validate --mode 3d --category characters
  # 2D 兼容模式（默认）：正常生成/导入 2D sprite，不被 3D 升级阻断
  python tools/art_pipeline.py generate --category characters

  # 进度管理
  python tools/art_pipeline.py status
  python tools/art_pipeline.py status --category backgrounds
  python tools/art_pipeline.py reset --resource backgrounds/bg_combat_forest.jpg
  python tools/art_pipeline.py reset --category bosses
        """,
    )
    parser.add_argument("--progress", default=PROGRESS_FILE,
                        help="进度文件路径")

    subparsers = parser.add_subparsers(dest="command", help="子命令")

    # audit
    p_audit = subparsers.add_parser("audit", help="扫描 resources 状态")
    p_audit.add_argument("--resource", help="指定单个资源 key")
    p_audit.add_argument("--category", help="按类别前缀过滤")
    p_audit.add_argument("--limit", type=int, help="最多显示数量")
    p_audit.add_argument("--mode", choices=["2d", "3d"], default="2d",
                         help="维度模式: 2d(默认,兼容当前 2D 生产) / 3d(走 manifest)")

    # generate
    p_gen = subparsers.add_parser("generate", help="生成资源")
    p_gen.add_argument("--resource", help="指定单个资源 key")
    p_gen.add_argument("--category", help="按类别前缀批量生成")
    p_gen.add_argument("--all", action="store_true", help="所有资源")
    p_gen.add_argument("--limit", type=int, help="最多处理数量")
    p_gen.add_argument("--force", action="store_true", help="强制重新生成")
    p_gen.add_argument("--resume-failed", action="store_true",
                       help="只重试失败项")
    p_gen.add_argument("--self-check", action="store_true",
                       help="生成完成后自动运行技术门禁检查")
    p_gen.add_argument("--mode", choices=["2d", "3d"], default="2d",
                       help="维度模式: 2d(默认) / 3d(3D 资产跳过 AI 生成)")

    # validate
    p_val = subparsers.add_parser("validate", help="技术门禁检查")
    p_val.add_argument("--resource", help="指定单个资源 key")
    p_val.add_argument("--category", help="按类别前缀过滤")
    p_val.add_argument("--all", action="store_true", help="所有已验证的资源")
    p_val.add_argument("--mode", choices=["2d", "3d"], default="2d",
                       help="维度模式: 2d(默认) / 3d(走 manifest + asset_validate)")

    # import
    p_imp = subparsers.add_parser("import", help="导入 validated 资源到正式目录")
    p_imp.add_argument("--resource", help="指定单个资源 key")
    p_imp.add_argument("--category", help="按类别前缀过滤")
    p_imp.add_argument("--all", action="store_true", dest="all_import",
                       help="导入所有 validated 资源")
    p_imp.add_argument("--mode", choices=["2d", "3d"], default="2d",
                       help="维度模式: 2d(默认,导 textures) / 3d(导 models+prefabs,强制 asset_validate)")

    # contact
    p_con = subparsers.add_parser("contact", help="生成 contact sheet")
    p_con.add_argument("--category", help="按类别前缀过滤")
    p_con.add_argument("--all", action="store_true", dest="all_contact",
                       help="所有资源")
    p_con.add_argument("--limit", type=int, help="最多图片数量")
    p_con.add_argument("--mode", choices=["2d", "3d"], default="2d",
                       help="维度模式: 2d(默认) / 3d")

    # status
    p_sta = subparsers.add_parser("status", help="打印进度摘要")
    p_sta.add_argument("--category", help="按类别前缀过滤")
    p_sta.add_argument("--mode", choices=["2d", "3d"], default="2d",
                       help="维度模式: 2d(默认) / 3d")

    # reset
    p_res = subparsers.add_parser("reset", help="重置进度")
    p_res.add_argument("--resource", help="指定单个资源 key 重置")
    p_res.add_argument("--category", help="按类别前缀重置")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # 路由
    if args.command == "audit":
        cmd_audit(args)
    elif args.command == "generate":
        cmd_generate(args)
    elif args.command == "validate":
        cmd_validate(args)
    elif args.command == "import":
        cmd_import(args)
    elif args.command == "contact":
        cmd_contact(args)
    elif args.command == "status":
        cmd_status(args)
    elif args.command == "reset":
        cmd_reset(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
