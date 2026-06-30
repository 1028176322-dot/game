"""Audit generated and pending art for WeChat mini-game visual safety.

This does not pretend to replace human review. It creates a focused queue for
content that may fail review: blood/gore/organs/skulls/impalement/fake text or
overly horror-like imagery.

Run:
  python E:/game/tools/visual_safety_audit.py
"""

from __future__ import annotations

import csv
import importlib.util
import json
from collections import Counter, defaultdict
from pathlib import Path

from PIL import Image, ImageDraw


BASE = Path(r"E:\game")
PROJECT = BASE / "回到地面"
TOOLS = BASE / "tools"
GEN_SCRIPT = TOOLS / "gen_missing_179.py"
MANIFEST = PROJECT / "art_source" / "textures_audit_manifest.csv"
RUNTIME_REPLACE = PROJECT / "art_source" / "textures_export" / "runtime_replace"
REPORT_DIR = PROJECT / "art_source" / "visual_safety_audit"

KNOWN_REJECT_PATHS = {
    "ui/common/btn_default.png": "known unsafe: fake text or skull-like decoration in generated button",
    "ui/common/btn_hover.png": "known unsafe: fake text or skull-like decoration in generated button",
    "ui/common/btn_active.png": "known unsafe: fake text or skull-like decoration in generated button",
    "ui/map/icon_room_boss.png": "known unsafe: skull-like icon generated for boss room marker",
    "ui/upgrade/icon_upgrade_berserkerpact.png": "known unsafe: skull/blood/fake text in generated icon",
    "ui/upgrade/icon_ability_lifestealaura.png": "known unsafe: pierced realistic heart/blood/fake text in generated icon",
    "ui/splash/splash_bg.png": "known unsafe: generated image contains English/fake UI text",
    "ui/hud/hud_cdmask.png": "known unsafe: generated image contains English/fake UI text",
    "ui/hud/hud_rollbtn.png": "known unsafe: generated image contains English/fake UI text",
    "ui/hud/hud_skillslot.png": "known unsafe: generated image contains English/fake UI text",
    "icons/skills/icon_skill_dash.png": "known unsafe: generated skill icon contains English/fake text",
    "icons/skills/icon_skill_elementburst.png": "known unsafe: generated skill icon contains English/fake text",
    "icons/skills/icon_skill_healwave.png": "known unsafe: generated skill icon contains English/fake text",
    "icons/sets/icon_set_frostbite.png": "known unsafe: generated set icon contains English/fake text",
    "icons/sets/icon_set_fury.png": "known unsafe: generated set icon contains English/fake text",
    "icons/sets/icon_set_ironwall.png": "known unsafe: generated set icon contains English/fake text",
    "icons/sets/icon_set_tempest.png": "known unsafe: generated set icon contains English/fake text",
    "icons/buffs/icon_debuff_slow.png": "known unsafe: generated buff/debuff icon contains English/fake text",
    "ui/death/btn_revive_active.png": "known unsafe death-ui batch: fake text or horror visual risk",
    "ui/death/btn_revive_default.png": "known unsafe death-ui batch: fake text or horror visual risk",
    "ui/death/btn_settle_active.png": "known unsafe death-ui batch: fake text or horror visual risk",
    "ui/death/btn_settle_default.png": "known unsafe death-ui batch: fake text or horror visual risk",
    "ui/death/death_bg.png": "known unsafe: skulls/blood/organs/bones in generated result background",
    "ui/death/icon_soulstone.png": "known unsafe death-ui batch: must recheck as family-friendly crystal",
    "ui/death/result_panel.png": "known unsafe death-ui batch: must recheck as family-friendly result panel",
}

PATH_RISK_KEYWORDS = {
    "death": "manual_review_death_theme",
    "berserker": "manual_review_berserker_theme",
    "lifesteal": "manual_review_lifesteal_theme",
    "blood": "manual_review_blood_keyword",
    "skull": "manual_review_skull_keyword",
    "skeleton": "manual_review_skeleton_keyword",
    "shadowdagger": "manual_review_blade_keyword",
    "frenzyaxe": "manual_review_blade_keyword",
    "thorn": "manual_review_spike_keyword",
}

PROMPT_BLOCK_TERMS = {
    "death",
    "blood",
    "gore",
    "splatter",
    "dripping",
    "wound",
    "injury",
    "impalement",
    "impaled",
    "pierced",
    "realistic heart",
    "heart-shaped",
    "organs",
    "skull",
    "skeleton",
    "bone",
    "bones",
    "corpse",
    "severed",
    "horror face",
    "horror",
    "scary",
}


def load_generator():
    spec = importlib.util.spec_from_file_location("gen_missing_179", GEN_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {GEN_SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def read_manifest() -> dict[str, dict[str, str]]:
    rows: dict[str, dict[str, str]] = {}
    if not MANIFEST.exists():
        return rows
    with MANIFEST.open("r", encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            rel = row["path"].replace("\\", "/").removeprefix("textures/")
            rows[rel] = {
                "path": rel,
                "category": row.get("category", ""),
                "final_target_w": row.get("target_w") or row.get("frame_w") or row.get("width") or "",
                "final_target_h": row.get("target_h") or row.get("frame_h") or row.get("height") or "",
                "target_size_kb": row.get("target_size_kb", ""),
            }
    return rows


def prompt_positive_part(prompt: str) -> str:
    for marker in ("CRITICAL:", "APPROVAL-SAFE", "Negative prompt:"):
        idx = prompt.find(marker)
        if idx >= 0:
            return prompt[:idx].lower()
    return prompt.lower()


def has_unsafe_positive_term(prompt: str) -> list[str]:
    positive = prompt_positive_part(prompt)
    hits: list[str] = []
    for term in PROMPT_BLOCK_TERMS:
        idx = positive.find(term)
        if idx < 0:
            continue
        window = positive[max(0, idx - 16):idx + len(term) + 16]
        hits.append(term)
    return sorted(set(hits))


def image_red_risk(path: Path) -> tuple[float, float]:
    """Return rough red ratio and dark-red ratio for manual triage."""
    try:
        img = Image.open(path).convert("RGBA")
        img.thumbnail((128, 128), Image.Resampling.NEAREST)
    except Exception:
        return 0.0, 0.0

    pixels = list(img.getdata())
    visible = [(r, g, b, a) for r, g, b, a in pixels if a > 20]
    if not visible:
        return 0.0, 0.0
    red = 0
    dark_red = 0
    for r, g, b, _ in visible:
        if r > 110 and r > g * 1.45 and r > b * 1.25:
            red += 1
            if g < 80 and b < 80:
                dark_red += 1
    return red / len(visible), dark_red / len(visible)


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def make_contact_sheet(rows: list[dict[str, object]]) -> None:
    review_rows = [row for row in rows if row.get("exists") == "true" and row.get("decision") != "pass"]
    if not review_rows:
        return
    cols = 8
    cell = 112
    gap = 6
    label_h = 28
    sheet_w = cols * (cell + gap) + gap
    sheet_h = ((len(review_rows) + cols - 1) // cols) * (cell + label_h + gap) + gap
    sheet = Image.new("RGBA", (sheet_w, max(sheet_h, cell + label_h + gap * 2)), (24, 24, 24, 255))
    draw = ImageDraw.Draw(sheet)
    for idx, row in enumerate(review_rows):
        rel = str(row["path"])
        img_path = RUNTIME_REPLACE / rel
        try:
            img = Image.open(img_path).convert("RGBA")
            img.thumbnail((cell - 8, cell - label_h - 8), Image.Resampling.NEAREST)
        except Exception:
            continue
        col = idx % cols
        line = idx // cols
        x = gap + col * (cell + gap)
        y = gap + line * (cell + label_h + gap)
        draw.text((x, y), Path(rel).name[:18], fill=(240, 240, 240, 255))
        px = x + (cell - img.width) // 2
        py = y + label_h + (cell - label_h - img.height) // 2
        sheet.paste(img, (px, py), img)
    sheet.save(REPORT_DIR / "visual_safety_review_contact.png")


def main() -> int:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    gen = load_generator()

    manifest_items = read_manifest()
    items = gen.read_spec()
    if hasattr(gen, "read_safety_reworks"):
        items.extend(gen.read_safety_reworks())
    prompt_paths = {item["path"].replace("\\", "/").removeprefix("textures/") for item in items}

    by_path: dict[str, dict[str, str]] = dict(manifest_items)
    for item in items:
        by_path[item["path"].replace("\\", "/").removeprefix("textures/")] = item

    runtime_paths = {
        p.relative_to(RUNTIME_REPLACE).as_posix(): p
        for p in RUNTIME_REPLACE.rglob("*.png")
    }

    all_paths = sorted(set(by_path) | set(runtime_paths))
    rows: list[dict[str, object]] = []
    issues: list[dict[str, object]] = []

    for rel in all_paths:
        item = by_path.get(rel, {"path": rel, "category": rel.split("/", 1)[0]})
        exists = rel in runtime_paths
        prompt = gen.build_prompt(item) if rel in prompt_paths else ""
        prompt_hits = has_unsafe_positive_term(prompt) if prompt else []

        risk_reasons: list[str] = []
        decision = "pass"
        if rel in KNOWN_REJECT_PATHS:
            risk_reasons.append(KNOWN_REJECT_PATHS[rel])
            decision = "reject_rework_required"

        lower_rel = rel.lower()
        for keyword, reason in PATH_RISK_KEYWORDS.items():
            if keyword in lower_rel:
                risk_reasons.append(reason)
                if decision == "pass":
                    decision = "manual_review"

        if prompt_hits:
            risk_reasons.append("unsafe_positive_prompt_terms:" + ",".join(prompt_hits))
            decision = "prompt_rework_required"

        red_ratio = 0.0
        dark_red_ratio = 0.0
        if exists:
            red_ratio, dark_red_ratio = image_red_risk(runtime_paths[rel])
            if dark_red_ratio >= 0.08:
                risk_reasons.append(f"red_visual_heuristic_dark:{dark_red_ratio:.1%}")
                if decision == "pass":
                    decision = "manual_review"

        row = {
            "path": rel,
            "category": item.get("category", ""),
            "exists": str(exists).lower(),
            "decision": decision,
            "risk_reasons": "; ".join(sorted(set(risk_reasons))),
            "red_ratio": round(red_ratio, 4),
            "dark_red_ratio": round(dark_red_ratio, 4),
            "prompt_positive_unsafe_terms": ",".join(prompt_hits),
        }
        rows.append(row)
        if decision != "pass":
            issues.append({"path": rel, "decision": decision, "risk_reasons": row["risk_reasons"]})

    fields = [
        "path", "category", "exists", "decision", "risk_reasons",
        "red_ratio", "dark_red_ratio", "prompt_positive_unsafe_terms",
    ]
    write_csv(REPORT_DIR / "visual_safety_detail.csv", rows, fields)
    write_csv(REPORT_DIR / "visual_safety_issues.csv", issues, ["path", "decision", "risk_reasons"])
    make_contact_sheet(rows)

    summary = {
        "total": len(rows),
        "generated_png": len(runtime_paths),
        "issue_count": len(issues),
        "decision_counts": Counter(str(row["decision"]) for row in rows),
        "known_reject_count": sum(1 for row in rows if row["decision"] == "reject_rework_required"),
        "prompt_rework_count": sum(1 for row in rows if row["decision"] == "prompt_rework_required"),
        "manual_review_count": sum(1 for row in rows if row["decision"] == "manual_review"),
    }
    (REPORT_DIR / "visual_safety_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("=" * 64)
    print("visual safety audit")
    print("=" * 64)
    print(f"total:          {summary['total']}")
    print(f"generated_png:  {summary['generated_png']}")
    print(f"issues:         {summary['issue_count']}")
    print(f"known_reject:   {summary['known_reject_count']}")
    print(f"prompt_rework:  {summary['prompt_rework_count']}")
    print(f"manual_review:  {summary['manual_review_count']}")
    print(f"report_dir:     {REPORT_DIR}")

    if summary["known_reject_count"] or summary["prompt_rework_count"]:
        print("[FAIL] Visual-safety blocking issues exist.")
        return 1
    print("[PASS] No blocking visual-safety issues. Manual-review rows still need human approval.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
