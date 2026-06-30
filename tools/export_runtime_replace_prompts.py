"""Export per-asset Agnes prompts for runtime_replace generation review.

This script is read-only for assets. It imports gen_missing_179.py and writes
review files under art_source/runtime_replace_recovery so selected manifest
assets can be checked before spending API quota.

Run:
  python E:/game/tools/export_runtime_replace_prompts.py
  python E:/game/tools/export_runtime_replace_prompts.py --category=effects
"""

from __future__ import annotations

import csv
import importlib.util
import sys
from pathlib import Path


BASE = Path(r"E:\game")
PROJECT = BASE / "回到地面"
TOOLS = BASE / "tools"
GEN_SCRIPT = TOOLS / "gen_missing_179.py"
RUNTIME_REPLACE = PROJECT / "art_source" / "textures_export" / "runtime_replace"
OUT_DIR = PROJECT / "art_source" / "runtime_replace_recovery"
OUT_CSV = OUT_DIR / "runtime_replace_prompt_review.csv"
OUT_MD = OUT_DIR / "runtime_replace_prompt_review.md"
VISUAL_SAFETY_REWORK_PATHS = {
    "ui/common/btn_default.png",
    "ui/common/btn_hover.png",
    "ui/common/btn_active.png",
    "ui/map/icon_room_boss.png",
    "ui/upgrade/icon_upgrade_berserkerpact.png",
    "ui/upgrade/icon_ability_lifestealaura.png",
    "ui/splash/splash_bg.png",
    "ui/hud/hud_cdmask.png",
    "ui/hud/hud_rollbtn.png",
    "ui/hud/hud_skillslot.png",
    "icons/skills/icon_skill_dash.png",
    "icons/skills/icon_skill_elementburst.png",
    "icons/skills/icon_skill_healwave.png",
    "icons/items/icon_item_key.png",
    "icons/relics/icon_relic_frenzyaxe.png",
    "icons/sets/icon_set_frostbite.png",
    "icons/sets/icon_set_fury.png",
    "icons/sets/icon_set_ironwall.png",
    "icons/sets/icon_set_tempest.png",
    "icons/buffs/icon_debuff_slow.png",
    "ui/death/btn_revive_active.png",
    "ui/death/btn_revive_default.png",
    "ui/death/btn_settle_active.png",
    "ui/death/btn_settle_default.png",
    "ui/death/death_bg.png",
    "ui/death/icon_soulstone.png",
    "ui/death/result_panel.png",
    "ui/equipment/equip_body_frame.png",
    "ui/equipment/equip_slot_chest.png",
    "ui/equipment/equip_slot_gloves.png",
    "ui/equipment/equip_slot_helmet.png",
    "ui/equipment/equip_slot_legs.png",
    "ui/equipment/equip_slot_necklace.png",
    "ui/equipment/equip_slot_ring.png",
    "ui/equipment/equip_slot_shoes.png",
    "ui/equipment/equip_slot_weapon.png",
    "ui/equipment/inventory_slot.png",
    "ui/equipment/item_slot.png",
}

PROMPT_BLOCK_TERMS = {
    "death", "blood", "gore", "splatter", "dripping", "wound", "injury",
    "impalement", "impaled", "pierced", "realistic heart", "heart-shaped",
    "organs", "skull", "skeleton", "bone", "bones", "corpse", "severed",
    "horror", "scary",
}


def load_generator():
    spec = importlib.util.spec_from_file_location("gen_missing_179", GEN_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {GEN_SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def file_status(path: str) -> str:
    return "full_rebuild_all_required"


def review_note(item: dict[str, str], prompt: str, status: str) -> str:
    category = item.get("category", "")
    path = item.get("path", "")
    notes: list[str] = []
    if status == "full_rebuild_all_required":
        notes.append("regenerate this asset even if an old PNG exists; use prompts.json as source of truth")
    if "single reusable game UI sprite asset" in prompt:
        notes.append("ui fallback subject used; add a specific ui_map entry before generation")
    if "single fantasy RPG relic item object" in prompt:
        notes.append("icon fallback subject used; add a specific icon_map entry before generation")
    if "single readable enemy silhouette" in prompt:
        notes.append("monster fallback subject used; add a specific monster_map entry before generation")
    if "large threatening fantasy creature" in prompt:
        notes.append("boss fallback subject used; add a specific boss_map entry before generation")
    if category == "effects" and "VFX only" not in prompt:
        notes.append("effect prompt missing VFX-only guard")
    if category == "tiles" and "tileable on all four edges" not in prompt:
        notes.append("tile prompt missing tileable guard")
    if path.endswith(".png") and "ABSOLUTELY NO TEXT" not in prompt:
        notes.append("prompt missing no-text guard")
    positive = prompt_positive_part(prompt)
    unsafe_terms = sorted(term for term in PROMPT_BLOCK_TERMS if term in positive)
    if unsafe_terms:
        notes.append("unsafe positive prompt terms:" + ",".join(unsafe_terms))
    return "; ".join(notes)


def blocking_prompt_issue(prompt: str) -> str:
    issues: list[str] = []
    if "single reusable game UI sprite asset" in prompt:
        issues.append("ui fallback subject used")
    if "single fantasy RPG relic item object" in prompt:
        issues.append("icon fallback subject used")
    if "single readable enemy silhouette" in prompt:
        issues.append("monster fallback subject used")
    if "large threatening fantasy creature" in prompt:
        issues.append("boss fallback subject used")
    positive = prompt_positive_part(prompt)
    unsafe_terms = sorted(term for term in PROMPT_BLOCK_TERMS if term in positive)
    if unsafe_terms:
        issues.append("unsafe positive prompt terms:" + ",".join(unsafe_terms))
    return "; ".join(issues)


def prompt_positive_part(prompt: str) -> str:
    for marker in ("CRITICAL:", "APPROVAL-SAFE", "Negative prompt:"):
        idx = prompt.find(marker)
        if idx >= 0:
            return prompt[:idx].lower()
    return prompt.lower()


def main() -> int:
    gen = load_generator()
    items = gen.read_manifest_all()
    category_filter = None
    only_paths: set[str] = set()
    for arg in sys.argv[1:]:
        if arg.startswith("--category="):
            category_filter = arg.split("=", 1)[1]
        elif arg.startswith("--only="):
            only_paths.add(arg.split("=", 1)[1].replace("\\", "/").removeprefix("textures/"))
    if category_filter:
        items = [item for item in items if item.get("category") == category_filter]
    if only_paths:
        items = [item for item in items if item["path"].replace("\\", "/").removeprefix("textures/") in only_paths]
    if hasattr(gen, "validate_prompt_coverage"):
        gen.validate_prompt_coverage(items, require_all=True)
    rows: list[dict[str, str]] = []
    note_count = 0
    blocking_count = 0

    for item in sorted(items, key=lambda row: (row.get("category", ""), row.get("path", ""))):
        prompt = gen.build_prompt(item)
        status = file_status(item["path"])
        note = review_note(item, prompt, status)
        blocking = blocking_prompt_issue(prompt)
        if note:
            note_count += 1
        if blocking:
            blocking_count += 1
        rows.append({
            "path": item["path"],
            "category": item.get("category", ""),
            "status": status,
            "final_target_w": item.get("final_target_w", ""),
            "final_target_h": item.get("final_target_h", ""),
            "target_size_kb": item.get("target_size_kb", ""),
            "blocking_prompt_issue": blocking,
            "review_note": note,
            "prompt": prompt,
        })

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    pending = [row for row in rows if row["status"] != "exists"]
    by_category: dict[str, list[dict[str, str]]] = {}
    for row in pending:
        by_category.setdefault(row["category"], []).append(row)

    lines: list[str] = [
        "# runtime_replace 资源 Prompt 审查表",
        "",
        "本文件由 `E:/game/tools/export_runtime_replace_prompts.py` 生成。",
        "执行 Agnes 批量生成前，先检查这里选中资源的 prompt 是否语义正确。",
        "",
        "当前口径：按 `E:/game/assets/resources/config/prompts.json` 制作资源。",
        "推荐按分类执行，例如：`python E:/game/tools/gen_missing_179.py --full-rebuild-all --category=effects`。",
        "",
        "## 汇总",
        "",
        f"- selected 总数: {len(rows)}",
        f"- full_rebuild_all_required: {len(pending)}",
        f"- 阻塞性 prompt 问题: {blocking_count}",
        f"- 带审查备注: {note_count}",
        "",
    ]

    for category in sorted(by_category):
        lines.extend([f"## {category}", ""])
        for row in by_category[category]:
            lines.extend([
                f"### {row['path']}",
                "",
                f"- status: `{row['status']}`",
                f"- size: `{row['final_target_w']}x{row['final_target_h']}`",
                f"- target_size_kb: `{row['target_size_kb']}`",
                f"- review_note: {row['review_note'] or 'OK'}",
                "",
                "```text",
                row["prompt"],
                "```",
                "",
            ])

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    print(f"rows: {len(rows)}")
    print(f"pending_or_rework: {len(pending)}")
    print(f"blocking_prompt_issues: {blocking_count}")
    print(f"review_notes: {note_count}")
    print(f"csv: {OUT_CSV}")
    print(f"md:  {OUT_MD}")
    return 1 if blocking_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
