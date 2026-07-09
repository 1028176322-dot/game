#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_doc_consistency.py — 文档一致性交叉验证

检查项：
  1. 体积预算：ART_RESOURCE_RULES.md 表格 vs art_pipeline.py 实际值
  2. 分类完整性：prompts.json 分类 vs DETAIL_ANCHORS
  3. 引用有效性：art-pipeline Skill 中引用的路径是否存在
  4. 规则文件自检：ART_RESOURCE_RULES.md 结构完整性
  5. 漂移检测：规则预算 vs 磁盘文件实际大小（预警预算脱离实际）

用法：python tools/check_doc_consistency.py
返回码：0=通过  1=未通过（仅 check 1-4 影响通过性，check 5 仅预警）
"""

import json, os, sys, subprocess, re

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART_RULES_PATH = os.path.join(
    os.path.dirname(PROJECT_ROOT),
    ".workbuddy/memory/topics/ART_RESOURCE_RULES.md",
)
PROMPTS_JSON = os.path.join(
    os.path.dirname(PROJECT_ROOT),
    "assets/resources/config/prompts.json",
)
PIPELINE_SCRIPT = os.path.join(PROJECT_ROOT, "tools/art_pipeline.py")
SKILL_PATH = os.path.expanduser(
    "~/.workbuddy/skills/art-pipeline/SKILL.md"
)

issues = 0


def fail(msg):
    global issues
    print(f"  FAIL: {msg}")
    issues += 1


def pass_msg(msg):
    print(f"  OK: {msg}")


# ── Check 1: Budget consistency ──
print("=== Check 1: Budget consistency (ART_RESOURCE_RULES.md vs art_pipeline.py) ===")

# Read budget from ART_RESOURCE_RULES.md (same logic as pipeline script)
def parse_rules_budget(path):
    """Minimal budget table parser (same logic as art_pipeline.py)."""
    import re
    if not os.path.isfile(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    def parse_kb(s):
        s = s.strip()
        m = re.match(r"([\d.]+)\s*(KB|MB)", s)
        if not m:
            return None
        val = float(m.group(1))
        if m.group(2) == "MB":
            val *= 1024
        return int(round(val))

    def parse_warn(s):
        parts = s.strip().split("-")
        return parse_kb(parts[1]) if len(parts) == 2 else None

    cat_map = {
        "全屏背景": "backgrounds", "战斗背景": "backgrounds",
        "UI 大面板": "ui", "UI 小按钮": "ui",
        "角色 sprite": "characters", "Boss sprite": "bosses",
        "普通怪物": "monsters", "特效 sprite": "effects",
        "图标": "icons", "Tile": "tiles",
    }
    result = {}
    for line in text.split("\n"):
        if not line.startswith("|") or line.count("|") < 4:
            continue
        cols = [c.strip() for c in line.split("|")]
        if len(cols) < 5:
            continue
        matched = next((cat for kw, cat in cat_map.items() if kw in cols[1]), None)
        if not matched:
            continue
        warn = parse_warn(cols[3])
        hard = parse_kb(cols[4])
        if warn is None or hard is None:
            continue
        existing = result.get(matched)
        if existing:
            warn = max(warn, existing["warning"])
            hard = max(hard, existing["hard"])
        result[matched] = {"warning": warn, "hard": hard}
    return result


rules_budget = parse_rules_budget(ART_RULES_PATH)
if rules_budget is None:
    fail("Cannot parse ART_RESOURCE_RULES.md")
else:
    # Import pipeline script's budget function
    sys.path.insert(0, os.path.join(PROJECT_ROOT, "tools"))
    import importlib

    pipeline_mod = importlib.import_module("art_pipeline")
    pipeline_mod._BUDGET_CACHE = None

    for cat in sorted(rules_budget.keys()):
        rb = rules_budget.get(cat)
        pb = pipeline_mod.budget_limits(cat)
        if not rb or not pb:
            fail(f"{cat}: budget missing in one source")
            continue
        if rb["warning"] != pb["warning"] or rb["hard"] != pb["hard"]:
            fail(
                f"{cat}: rules=({rb['warning']}KB/{rb['hard']}KB) "
                f"pipeline=({pb['warning']}KB/{pb['hard']}KB)"
            )
        else:
            pass_msg(f"{cat}: {rb['warning']}KB/{rb['hard']}KB ✓")

# ── Check 2: Category completeness ──
print("\n=== Check 2: Category completeness (prompts.json vs art_pipeline DETAIL_ANCHORS) ===")

prompts = {}
if os.path.isfile(PROMPTS_JSON):
    with open(PROMPTS_JSON, "r", encoding="utf-8") as f:
        prompts = json.load(f)

prompt_cats = set(key.split("/")[0] for key in prompts)
anchor_cats = set(pipeline_mod.DETAIL_ANCHORS.keys())

missing_in_anchors = prompt_cats - anchor_cats
missing_in_prompts = anchor_cats - prompt_cats

if missing_in_anchors:
    fail(f"Anchors missing for categories: {missing_in_anchors}")
else:
    pass_msg(f"All {len(prompt_cats)} categories from prompts.json have DETAIL_ANCHORS")

if missing_in_prompts:
    fail(f"Prompts missing for anchor categories: {missing_in_prompts}")
else:
    pass_msg(f"All {len(anchor_cats)} anchor categories have prompts in prompts.json")

# ── Check 3: Skill references validity ──
print("\n=== Check 3: Path references in art-pipeline SKILL.md ===")

def _resolve_path(ref, skill_path, project_root):
    """Resolve a reference string to an absolute file path. Returns None if unresolvable."""
    ref = ref.split()[0]  # strip trailing command args
    if ref.startswith("~"):
        return os.path.expanduser(ref)
    if ref.startswith("E:") or ref.startswith("/"):
        return ref
    if ref.startswith("scripts/"):
        return os.path.join(os.path.dirname(skill_path), ref)
    if ref.startswith("docs/"):
        return os.path.join(project_root, ref)
    if ref.startswith("tools/"):
        return os.path.join(project_root, ref)
    if ref.startswith("assets/"):
        # assets/ can be at both the parent level (prompts.json) and project level (textures/)
        fp_parent = os.path.join(os.path.dirname(project_root), ref)
        if os.path.exists(fp_parent):
            return fp_parent
        fp_project = os.path.join(project_root, ref)
        if os.path.exists(fp_project):
            return fp_project
        return None
    if ref.startswith("art_source/"):
        return os.path.join(project_root, ref)
    if ref.startswith(".workbuddy/"):
        return os.path.join(os.path.dirname(project_root), ref)
    if ref in ("assets.json", "ui_assets.json", "game_assets.json"):
        return os.path.join(project_root, "assets/resources/config", ref)
    return None

if os.path.isfile(SKILL_PATH):
    with open(SKILL_PATH, "r", encoding="utf-8") as f:
        skill_text = f.read()

    # Find all path references in backticks that look like file paths
    refs = re.findall(r"`([^`]+?\.(?:md|json|py|ts|png|txt))`", skill_text)
    # Also find references with full paths like `E:/...` or `docs/...`
    refs += re.findall(r"`((?:E:|/|[a-zA-Z]/|docs/|tools/|assets/)[^`]+?)`", skill_text)
    refs = list(set(refs))
    missing_refs = []
    for ref in refs:
        # Skip: commands, code keywords, API references, placeholders
        if ref.startswith("http"):
            continue
        if ref in ("python", "bash", "text", "png", "jpg", "json", "md", "ts", "py"):
            continue
        if "{" in ref or "}" in ref:
            continue  # Skip template/placeholder paths like {category}

        # Strip trailing command arguments (e.g. "tools/art_pipeline.py generate" → "tools/art_pipeline.py")
        ref_clean = ref.split()[0]
        if ref_clean != ref:
            # Check if the clean path exists; if so, skip the original
            fp_clean = _resolve_path(ref_clean, SKILL_PATH, PROJECT_ROOT)
            if fp_clean and os.path.isfile(fp_clean):
                continue

        fp = _resolve_path(ref, SKILL_PATH, PROJECT_ROOT)
        if not fp:
            continue
        if not os.path.isfile(fp) and not os.path.isdir(fp):
            missing_refs.append(f"{ref}")

    if missing_refs:
        for ref in missing_refs:
            fail(f"Broken reference in SKILL.md: {ref}")
    else:
        pass_msg(f"All {len(refs)} path references in SKILL.md are valid")
else:
    warn(f"SKILL.md not found: {SKILL_PATH}")

# ── Check 4: Rules file self-validation ──
print("\n=== Check 4: Self-validation of ART_RESOURCE_RULES.md ===")

rules_text = ""
if os.path.isfile(ART_RULES_PATH):
    with open(ART_RULES_PATH, "r", encoding="utf-8") as f:
        rules_text = f.read()

# 4a: Section completeness — expected sections
expected_sections = [
    "美术风格总纲", "Pipeline 与 Skill 调用规则", "格式与规格",
    "资源注册规则", "Prompt 生成脚本", "命名规则",
    "安全与审核规则", "编码与验证规则", "体积与性能策略",
    "文件与目录结构", "额外处理规则", "新增资源的标准操作流程",
    "文档索引", "文档一致性与防冲突规则",
]
for sec in expected_sections:
    if sec in rules_text:
        pass_msg(f"Section found: {sec}")
    else:
        fail(f"Section MISSING: {sec}")

# 4b: Budget table sanity — no zero/negative/impossible values
budget = parse_rules_budget(ART_RULES_PATH)
if budget:
    for cat, vals in sorted(budget.items()):
        if vals["hard"] <= 0:
            fail(f"{cat}: budget hard limit is {vals['hard']} (must be > 0)")
        elif vals["warning"] <= 0:
            fail(f"{cat}: budget warning is {vals['warning']} (must be > 0)")
        elif vals["hard"] < vals["warning"]:
            fail(f"{cat}: hard limit ({vals['hard']}) < warning ({vals['warning']})")
        else:
            pass_msg(f"{cat}: budget OK ({vals['warning']}KB warn / {vals['hard']}KB hard)")

# ── Check 5: Drift detection (rules budget vs actual file sizes) ──
print("\n=== Check 5: Drift detection (rules budget vs actual disk) ===")
print("  Note: budgets in ART_RESOURCE_RULES.md target **TapTap** platform.")
print("  Current files were created for WeChat Mini Game dev (smaller).")
print("  Drift warnings are expected — TapTap will produce larger files.")
print("  Only actual overshoot (file > hard limit) is actionable.\n")

textures_dir = os.path.join(PROJECT_ROOT, "assets/resources/textures")
prompts = {}
if os.path.isfile(PROMPTS_JSON):
    with open(PROMPTS_JSON, "r", encoding="utf-8") as f:
        prompts = json.load(f)

cat_sizes = {}
for key in prompts:
    fp = os.path.join(textures_dir, key)
    if os.path.isfile(fp):
        sz = os.path.getsize(fp) / 1024
        cat = key.split("/")[0]
        cat_sizes.setdefault(cat, []).append(sz)

drift_warnings = 0
if budget and cat_sizes:
    for cat in sorted(budget.keys()):
        sizes = cat_sizes.get(cat)
        if not sizes:
            continue
        hard = budget[cat]["hard"]
        mx = max(sizes)
        p95 = sorted(sizes)[int(len(sizes) * 0.95)]

        # Only flag actual overshoot (file > hard limit) — "too loose" is
        # expected when transitioning from WeChat dev to TapTap production.
        if mx > hard:
            drift_warnings += 1
            print(f"  ⚠ {cat}: max={mx:.0f}KB > hard={hard}KB — 已存在超标文件")
        else:
            util = mx / hard * 100
            print(f"  ✓ {cat}: max={mx:.0f}KB / hard={hard}KB ({util:.0f}%) — TapTap 预算充足")

    if drift_warnings == 0:
        print("  所有类别预算与实际文件体积匹配良好")
    else:
        print(f"\n  ⚠ {drift_warnings} 个漂移预警 — 建议审核 ART_RESOURCE_RULES.md 第 9.2 节")
else:
    print("  无法读取预算或文件数据，跳过漂移检测")

# ── Summary ──
print(f"\n{'=' * 50}")
if issues == 0:
    print("ALL CHECKS PASSED — no cross-document inconsistencies found")
    if drift_warnings > 0:
        print(f"(Note: {drift_warnings} drift warning(s) — review recommended)")
    sys.exit(0)
else:
    print(f"{issues} issue(s) found — fix before continuing")
    sys.exit(1)
