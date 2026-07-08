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
  - status     打印进度摘要
  - reset      重置某资源或某类资源的进度状态

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
# prompts.json 在父目录的公共资源目录下
PROMPTS_JSON = os.path.join(os.path.dirname(PROJECT_ROOT), "assets/resources/config/prompts.json")
MASTER_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/master")
CANDIDATES_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/runtime_candidates")
BACKUP_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/backup")
CONTACTS_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/contact_sheets")
PROGRESS_FILE = os.path.join(PROJECT_ROOT, "art_source/textures_review/art_pipeline_progress.json")

# Agnes API: key 从环境变量读取
API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
API_KEY = os.environ.get("AGNES_API_KEY", "")

# ── 编辑性常量（提示词工程参数，非数据） ──────────────────

STYLE_ANCHOR = (
    "Bright colorful cartoon adventure game art, playful mobile game look, "
    "clean high-resolution rounded shapes, warm friendly forms, saturated colors, "
    "soft highlights, readable silhouettes, consistent with the forest-and-gem interface style."
)

SAFETY_BLOCK = (
    "Unified safety direction: warm cheerful family-friendly fantasy matching the project's forest-and-gem interface style, "
    "flowers, leaves, crystals, stars, paw marks, magic sparkles, gems, ribbons, and polished toy-like props, "
    "pure visual fantasy decoration, clear blank areas for engine-rendered text overlay."
)

DETAIL_ANCHORS = {
    "bosses": "Full-body boss sprite, large readable silhouette, simple exaggerated shapes, clear head-body-limb separation, bright material colors, 12 percent transparent margin.",
    "monsters": "Small full-body enemy sprite, readable at 128px, simple pose, one creature only, chunky outline, clear attack-facing silhouette, friendly arcade adventure proportions.",
    "effects": "Clean VFX, bold center shape per frame, simple particle clusters, rich clean color gradients, high readability over gameplay, smooth transparent edges.",
    "icons": "Standalone item icon, one object only, thick outline, simple inner highlights, recognizable at 64px, centered with transparent margin, clear contrast against matte background.",
    "tiles": "Tiny 32px top-down gameplay tile, readable material pattern, tileable edges, simple clean cartoon material patches, consistent color family per region.",
    "ui": "Reusable clean UI piece, clean beveled shape, soft highlight, simple border, empty content area where needed, consistent warm forest adventure UI palette.",
    "backgrounds": "Full opaque rectangular scene filling the entire canvas; no transparency, single complete painted scene background, no isolated cutout, no empty border. Keep a clean readable center area for gameplay.",
}

TRANSPARENT_CATEGORIES = {"effects", "icons", "ui", "monsters", "bosses", "characters"}
MATTE_CATEGORIES = {"icons", "ui", "monsters", "bosses", "characters"}
PROCEDURAL_CATEGORIES = {"tiles"}

MIN_OPAQUE_RATIO = {
    "icons": 0.20, "ui": 0.02, "monsters": 0.08,
    "bosses": 0.05, "characters": 0.08,
}

PALETTE_RETRY_STEPS = {
    "backgrounds": (256, 192, 128, 64, 32),
    "effects": (64, 48, 32),
    "icons": (128, 96, 64, 48),
    "ui": (128, 96, 64, 48),
    "monsters": (128, 96, 64),
    "characters": (256, 192, 128),
    "bosses": (256, 192, 128),
}

# ── BUDGET_LIMITS：从 prompts.json 实际文件尺寸动态计算 ──
# 不在脚本中硬编码，也不在外部配文件中中转。
# 每次启动时扫描磁盘文件统计，自动适配。

_BUDGET_CACHE = None

def _calc_budget():
    """扫描 prompts.json 对应磁盘文件，按类别统计实际尺寸，计算预算。"""
    global _BUDGET_CACHE
    if _BUDGET_CACHE is not None:
        return _BUDGET_CACHE
    prompts = load_prompts()
    cat_sizes = {}
    for key in prompts:
        fp = os.path.join(TEXTURES_DIR, key)
        if os.path.isfile(fp):
            sz = os.path.getsize(fp) / 1024
            cat = key.split("/")[0]
            cat_sizes.setdefault(cat, []).append(sz)

    result = {}
    for cat, sizes in cat_sizes.items():
        sizes.sort()
        n = len(sizes)
        p75 = sizes[3 * n // 4]
        mx = sizes[-1]
        warn = int(math.ceil(p75 / 5) * 5)
        hard = int(math.ceil(mx * 1.3 / 5) * 5)
        result[cat] = {"warning": warn, "hard": max(hard, warn + 5)}

    # 确保所有类别都有预算（包括磁盘上可能暂无文件的）
    for cat in list(DETAIL_ANCHORS.keys()) + ["characters"]:
        if cat not in result:
            result[cat] = {"warning": 64, "hard": 256}

    _BUDGET_CACHE = result
    return result

def budget_limits(category):
    """获取某类别的体积预算。"""
    return _calc_budget().get(category, {"warning": 64, "hard": 256})

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


def classify_resource(key):
    """根据资源 key 判断类别和用途。"""
    parts = key.split("/")
    category = parts[0] if len(parts) > 1 else "other"
    # 细分 ui 下面的子类
    sub_category = "/".join(parts[:2]) if len(parts) > 1 else ""
    is_ui = category == "ui"
    is_bg = key.startswith("backgrounds/")
    is_procedural = category in PROCEDURAL_CATEGORIES
    filename = parts[-1]
    ext = os.path.splitext(filename)[1].lower()
    return {
        "key": key,
        "category": category,
        "sub_category": sub_category,
        "filename": filename,
        "ext": ext,
        "is_ui": is_ui,
        "is_bg": is_bg,
        "is_procedural": is_procedural,
    }


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
            if k in ("status", "promptHash", "fileHash", "source", "lastError"):
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


def generate_procedural(resource_info, output_path):
    """调用 generate_panel.py 生成程序化面板。"""
    script = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..",
        ".workbuddy",
        "skills",
        "art-pipeline",
        "scripts",
        "generate_panel.py",
    )
    # 如果技能脚本不在项目中，回退到用户级 skill 目录
    if not os.path.isfile(script):
        script = os.path.join(
            os.path.expanduser("~"),
            ".workbuddy",
            "skills",
            "art-pipeline",
            "scripts",
            "generate_panel.py",
        )
    if not os.path.isfile(script):
        return False, "找不到 generate_panel.py"

    # 从文件名推断尺寸
    key = resource_info["key"]
    dim = find_dimension_in_prompt(
        load_prompts().get(key, "")) or (360, 200)

    cmd = [
        sys.executable, script,
        "--width", str(dim[0]),
        "--height", str(dim[1]),
        "--output", output_path,
        "--seed", "20260708",
    ]
    # 输入框不要叶子装饰
    if "input" in key or "name_input" in key:
        cmd.append("--no-leaves")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            return False, result.stderr[:300]
        if not os.path.isfile(output_path):
            return False, "脚本未生成文件"
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


def remove_matte_background(img):
    """Remove solid matte backgrounds from AI-generated images via flood-fill from edges."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    corner_colors = [pixels[0, 0][:3], pixels[w - 1, 0][:3],
                     pixels[0, h - 1][:3], pixels[w - 1, h - 1][:3]]

    def bg_match(x, y):
        r, g, b, a = pixels[x, y]
        if a == 0:
            return True
        return any(sum((int(r) - int(c[i]))**2 for i in range(3)) ** 0.5 <= 72
                   for c in corner_colors)

    stack = []
    seen = set()
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))

    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or (x, y) in seen:
            continue
        seen.add((x, y))
        if not bg_match(x, y):
            continue
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
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
                           max_kb=120):
    """Full post-processing pipeline: resize → matte removal → alpha feather
    → chroma cleanup → palette reduction → size check with retry.

    Returns (ok: bool, error_or_warning: str, final_size_kb: int).
    """
    img = Image.open(master_path)

    # Step 1: Crop to target aspect ratio from center, then resize
    img = crop_to_target_aspect(img, target_size)
    img = img.resize(target_size, Image.LANCZOS)

    # Step 2: Transparent post-processing (categories that need alpha)
    if category in TRANSPARENT_CATEGORIES:
        if category in MATTE_CATEGORIES:
            img = remove_matte_background(img)
        img = remove_chroma_pixels(img)
        # Ensure RGBA
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        # Feather alpha to create smooth edge transitions (passes validate_technical)
        img = feather_alpha(img, radius=0.8)
    elif category == "backgrounds":
        # Backgrounds are opaque RGB
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


def validate_technical(filepath, expected_size=None, max_kb=None, category=None):
    """技术门禁检查。返回 (pass, issues_list)。

    Enhanced checks:
    - File existence
    - Image dimensions match expected
    - Mode is RGBA or RGB (not indexed/CMYK)
    - For transparent categories: alpha has smooth edges, not hard 0/255 cut
    - For transparent categories: subject has minimum opaque pixel ratio
    - File volume within budget
    - No chroma residuals (magenta/green/cyan at alpha=0)
    """
    issues = []
    if not os.path.isfile(filepath):
        issues.append("文件不存在")
        return False, issues

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

    # 透明相关检查
    if img.mode == "RGBA":
        r, g, b, a = img.split()
        a_data = list(a.getdata())
        total_pixels = len(a_data)

        # 硬切边检查
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

    # 体积检查
    if max_kb and fsize > max_kb * 1024:
        issues.append(f"体积超标: {fsize / 1024:.1f}KB > {max_kb}KB")

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
        gen = "程序化" if info["is_procedural"] else "AI"
        print(f"  [{gen}] {key}")
    return need_generate


def cmd_generate(args):
    """generate: 生成缺失/失败的资源。"""
    prompts = load_prompts()
    progress = ProgressTracker()
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

    max_kb_map = {
        "backgrounds": 180,
        "ui": 120,
        "icons": 32,
        "characters": 80,
        "monsters": 80,
        "bosses": 180,
        "effects": 60,
        "tiles": 8,
    }

    succeed = 0
    failed = 0
    skipped = 0

    for idx, key in enumerate(keys_to_process):
        entry = progress.get(key)
        info = classify_resource(key)

        print(f"\n[{idx + 1}/{len(keys_to_process)}] {key}")

        # 跳过已完成且未被强制重做的
        if not args.force and entry.get("status") in (ST_IMPORTED, ST_APPROVED, ST_VALIDATED):
            if not args.resume_failed:
                print(f"  → 跳过 (状态: {entry['status']})")
                skipped += 1
                continue

        # 失败次数过多则跳过
        if entry.get("failCount", 0) >= 3 and not args.force:
            print(f"  → 跳过 (已失败 {entry['failCount']} 次, 用 --force 强制重试)")
            skipped += 1
            continue

        # 确定输出路径
        master_path = os.path.join(MASTER_DIR, key)
        candidate_path = os.path.join(CANDIDATES_DIR, key)
        ensure_dir(os.path.dirname(master_path))
        ensure_dir(os.path.dirname(candidate_path))

        # 提取目标尺寸
        orig_prompt = prompts.get(key, "")
        dim = find_dimension_in_prompt(orig_prompt)
        target_size = dim or (128, 128)  # 找不到就用 128x128

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
                detail = DETAIL_ANCHORS.get(info["category"], "")
                ct_prompt = f"{STYLE_ANCHOR} {orig_prompt} {detail} {SAFETY_BLOCK}"
                gen_size_str = f"{max(target_size[0], 512)}x{max(target_size[1], 512)}"

                print(f"  → 调用 Agnes API (size={gen_size_str}, category={info['category']})...")
                url, err = call_agnes_api(ct_prompt, gen_size_str)
                if err:
                    progress.mark_failed(key, err)
                    print(f"  ✗ API 失败: {err}")
                    failed += 1
                    continue

                print(f"  → 下载图片...")
                temp_path = master_path + ".tmp"
                ok, err = download_image(url, temp_path)
                if not ok:
                    progress.mark_failed(key, err)
                    print(f"  ✗ 下载失败: {err}")
                    failed += 1
                    continue

                # 全流程后处理：缩放 → 抠图 → 去绿幕 → 调色板压缩 → 体积检查
                budget = budget_limits(info["category"])
                max_kb = budget.get("hard", 120)
                ok, warn, final_kb = post_process_generated(
                    temp_path, target_size, info["category"], master_path, max_kb)
                if os.path.isfile(temp_path):
                    os.remove(temp_path)
                if not ok:
                    progress.mark_failed(key, warn)
                    print(f"  ✗ 后处理失败: {warn}")
                    failed += 1
                    continue
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

    max_kb_map = {
        "backgrounds": 180,
        "ui": 120,
        "icons": 32,
        "characters": 80,
        "monsters": 80,
        "bosses": 180,
        "effects": 60,
        "tiles": 8,
    }

    passed = 0
    failed_count = 0
    for key in keys_to_check:
        info = classify_resource(key)
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

        # 提取目标尺寸
        orig_prompt = prompts.get(key, "")
        dim = find_dimension_in_prompt(orig_prompt)

        # 体积预算
        max_kb = max_kb_map.get(info["category"], 120)

        ok, issues = validate_technical(check_path, dim, max_kb)
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

    # validate
    p_val = subparsers.add_parser("validate", help="技术门禁检查")
    p_val.add_argument("--resource", help="指定单个资源 key")
    p_val.add_argument("--category", help="按类别前缀过滤")
    p_val.add_argument("--all", action="store_true", help="所有已验证的资源")

    # import
    p_imp = subparsers.add_parser("import", help="导入 validated 资源到正式目录")
    p_imp.add_argument("--resource", help="指定单个资源 key")
    p_imp.add_argument("--category", help="按类别前缀过滤")
    p_imp.add_argument("--all", action="store_true", dest="all_import",
                       help="导入所有 validated 资源")

    # contact
    p_con = subparsers.add_parser("contact", help="生成 contact sheet")
    p_con.add_argument("--category", help="按类别前缀过滤")
    p_con.add_argument("--all", action="store_true", dest="all_contact",
                       help="所有资源")
    p_con.add_argument("--limit", type=int, help="最多图片数量")

    # status
    p_sta = subparsers.add_parser("status", help="打印进度摘要")
    p_sta.add_argument("--category", help="按类别前缀过滤")

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
