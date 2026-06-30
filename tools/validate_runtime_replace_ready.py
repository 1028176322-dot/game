"""Final gate for runtime_replace before replacing Cocos textures.

Read-only by default. Validates:
  - runtime_replace path set exactly matches textures_audit_manifest.csv
  - PNG-only payload, no .meta/.gitkeep/extra files
  - PNG dimensions, mode, alpha, and rough size budget
  - required generated/reworked files are present
  - creates category contact sheets for human review

Run:
  python E:/game/tools/validate_runtime_replace_ready.py
"""

from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

from PIL import Image, ImageDraw


BASE = Path(r"E:\game")
PROJECT = BASE / "回到地面"
MANIFEST = PROJECT / "art_source" / "textures_audit_manifest.csv"
SPEC = PROJECT / "art_source" / "runtime_replace_recovery" / "runtime_replace_missing_production_spec.csv"
RUNTIME_REPLACE = PROJECT / "art_source" / "textures_export" / "runtime_replace"
REPORT_DIR = PROJECT / "art_source" / "runtime_replace_final_check"

REWORK_EFFECT_PATHS = {
    "effects/combat/fx_crit.png",
    "effects/combat/fx_dash.png",
    "effects/combat/fx_heal.png",
    "effects/combat/fx_hit_normal.png",
    "effects/combat/fx_shield.png",
}
EFFECTS_WARNING_KB = 80
EFFECTS_HARD_LIMIT_KB = 96
UI_DEFAULT_HARD_FLOOR_KB = 24
UI_SLOT_HARD_FLOOR_KB = 20
UI_PANEL_HARD_FLOOR_KB = 120
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
TRANSPARENCY_REQUIRED_CATEGORIES = {"effects", "icons", "ui", "monsters", "bosses"}
MIN_TRANSPARENT_RATIO_BY_CATEGORY = {
    "icons": 0.20,
    "ui": 0.02,
    "monsters": 0.08,
    "bosses": 0.05,
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def parse_int(value: str, default: int = 0) -> int:
    try:
        return int(float(value or default))
    except Exception:
        return default


def parse_float(value: str, default: float = 0.0) -> float:
    try:
        return float(value or default)
    except Exception:
        return default


def rel_path_from_manifest(row: dict[str, str]) -> str:
    return row["path"].replace("\\", "/").removeprefix("textures/")


def build_expected_specs() -> dict[str, dict[str, str]]:
    manifest_rows = read_csv(MANIFEST)
    by_path = {rel_path_from_manifest(row): row for row in manifest_rows}

    # Start with manifest defaults for all 418 rows.
    expected: dict[str, dict[str, str]] = {}
    for rel, row in by_path.items():
        expected[rel] = {
            "path": rel,
            "category": row.get("category", ""),
            "target_w": row.get("target_w") or row.get("frame_w") or row.get("width") or "",
            "target_h": row.get("target_h") or row.get("frame_h") or row.get("height") or "",
            "has_alpha": row.get("has_alpha", ""),
            "target_size_kb": row.get("target_size_kb", ""),
            "source": "manifest",
        }

    # Production spec overrides dimensions for missing/generated resources.
    if SPEC.exists():
        for row in read_csv(SPEC):
            rel = row["path"].replace("\\", "/").removeprefix("textures/")
            expected.setdefault(rel, {})
            expected[rel].update({
                "path": rel,
                "category": row.get("category", expected[rel].get("category", "")),
                "target_w": row.get("final_target_w") or expected[rel].get("target_w", ""),
                "target_h": row.get("final_target_h") or expected[rel].get("target_h", ""),
                "has_alpha": row.get("has_alpha", expected[rel].get("has_alpha", "")),
                "target_size_kb": row.get("target_size_kb", expected[rel].get("target_size_kb", "")),
                "source": "production_spec",
            })

    # Known-bad combat effects are expected to be valid transparent effects too.
    for rel in REWORK_EFFECT_PATHS:
        if rel in by_path:
            row = by_path[rel]
            expected[rel].update({
                "target_w": row.get("target_w", ""),
                "target_h": row.get("target_h", ""),
                "has_alpha": row.get("has_alpha", "True"),
                "target_size_kb": row.get("target_size_kb", "40"),
                "source": "rework_effect_required",
            })
    return expected


def alpha_opaque(img: Image.Image) -> bool:
    rgba = img.convert("RGBA")
    lo, hi = rgba.getchannel("A").getextrema()
    return lo == 255 and hi == 255


def transparent_ratio(img: Image.Image) -> float:
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A")
    data = alpha.getdata()
    total = img.size[0] * img.size[1]
    transparent = sum(1 for value in data if value == 0)
    return transparent / total if total else 0.0


def requires_transparency(category: str) -> bool:
    return category in TRANSPARENCY_REQUIRED_CATEGORIES


def min_transparent_ratio(category: str) -> float:
    return MIN_TRANSPARENT_RATIO_BY_CATEGORY.get(category, 0.0)


def size_hard_limit_kb(spec: dict[str, str]) -> float:
    category = str(spec.get("category", ""))
    target_size = parse_float(str(spec.get("target_size_kb", "")))
    if category == "effects":
        return EFFECTS_HARD_LIMIT_KB
    if category == "ui":
        path = str(spec.get("path", "")).replace("\\", "/").lower()
        tw = parse_int(str(spec.get("target_w", "")))
        th = parse_int(str(spec.get("target_h", "")))
        hard = target_size * 4 if target_size else 0
        if any(key in path for key in ("slot", "rarity_", "btn_", "button")):
            hard = max(hard, UI_SLOT_HARD_FLOOR_KB)
        if any(key in path for key in ("panel", "_bg", "body_frame", "death_bg", "shop_bg", "main_bg")) or (tw * th >= 50000):
            hard = max(hard, UI_PANEL_HARD_FLOOR_KB)
        return max(hard, UI_DEFAULT_HARD_FLOOR_KB)
    return target_size * 2 if target_size else 0


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def make_contact_sheets(details: list[dict[str, object]]) -> None:
    by_category: defaultdict[str, list[dict[str, object]]] = defaultdict(list)
    for row in details:
        if row.get("exists") == "true":
            by_category[str(row.get("category") or "unknown")].append(row)

    for category, rows in by_category.items():
        cols = 8
        cell = 96
        gap = 6
        label_h = 18
        sheet_w = cols * (cell + gap) + gap
        sheet_h = ((len(rows) + cols - 1) // cols) * (cell + gap + label_h) + gap
        sheet = Image.new("RGBA", (sheet_w, max(sheet_h, cell + label_h + gap * 2)), (28, 28, 28, 255))
        draw = ImageDraw.Draw(sheet)
        for idx, row in enumerate(rows):
            rel = str(row["path"])
            img_path = RUNTIME_REPLACE / rel
            try:
                img = Image.open(img_path).convert("RGBA")
                img.thumbnail((cell - 4, cell - 4), Image.Resampling.NEAREST)
            except Exception:
                continue
            col = idx % cols
            line = idx // cols
            x = gap + col * (cell + gap)
            y = gap + line * (cell + gap + label_h)
            px = x + (cell - img.width) // 2
            py = y + label_h + (cell - img.height) // 2
            sheet.paste(img, (px, py), img)
            draw.text((x, y), Path(rel).name[:14], fill=(230, 230, 230, 255))
        sheet.save(REPORT_DIR / f"contact_{category}.png")


def main() -> int:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    expected = build_expected_specs()
    expected_paths = set(expected)
    actual_pngs = {p.relative_to(RUNTIME_REPLACE).as_posix() for p in RUNTIME_REPLACE.rglob("*.png")}
    all_files = [p for p in RUNTIME_REPLACE.rglob("*") if p.is_file()]
    non_png = [p.relative_to(RUNTIME_REPLACE).as_posix() for p in all_files if p.suffix.lower() != ".png"]

    details: list[dict[str, object]] = []
    issues: list[dict[str, object]] = []

    for rel in sorted(expected_paths | actual_pngs):
        spec = expected.get(rel, {})
        path = RUNTIME_REPLACE / rel
        row: dict[str, object] = {
            "path": rel,
            "category": spec.get("category", ""),
            "exists": str(path.exists()).lower(),
            "width": "",
            "height": "",
            "mode": "",
            "size_kb": "",
            "transparent_ratio": "",
            "expected_w": spec.get("target_w", ""),
            "expected_h": spec.get("target_h", ""),
            "source": spec.get("source", ""),
            "issues": "",
        }
        row_issues: list[str] = []
        if rel not in expected_paths:
            row_issues.append("extra_png_not_in_manifest")
        if rel not in actual_pngs:
            row_issues.append("missing_png")
        if rel in VISUAL_SAFETY_REWORK_PATHS and path.exists():
            row_issues.append("visual_safety_rework_required")

        if path.exists():
            try:
                img = Image.open(path)
                row["width"], row["height"], row["mode"] = img.width, img.height, img.mode
                row["size_kb"] = round(path.stat().st_size / 1024, 2)
                row["transparent_ratio"] = round(transparent_ratio(img), 4)
                exp_w = parse_int(str(spec.get("target_w", "")))
                exp_h = parse_int(str(spec.get("target_h", "")))
                if exp_w and exp_h and img.size != (exp_w, exp_h):
                    row_issues.append(f"dimension_mismatch:{img.width}x{img.height}!={exp_w}x{exp_h}")
                if img.mode == "P":
                    row_issues.append("png_mode_P")
                category = str(spec.get("category", ""))
                ratio = transparent_ratio(img)
                if requires_transparency(category) and alpha_opaque(img):
                    row_issues.append("alpha_opaque")
                minimum_ratio = min_transparent_ratio(category)
                if minimum_ratio and ratio < minimum_ratio:
                    row_issues.append(f"{category}_low_transparent_ratio:{ratio:.1%}<{minimum_ratio:.0%}")
                size_kb = path.stat().st_size / 1024
                hard_limit = size_hard_limit_kb(spec)
                if hard_limit and size_kb > hard_limit:
                    row_issues.append(f"size_over_hard_limit:{round(size_kb, 2)}>{hard_limit}")
                img.close()
            except Exception as exc:
                row_issues.append(f"png_read_error:{type(exc).__name__}:{exc}")

        row["issues"] = ";".join(row_issues)
        details.append(row)
        for issue in row_issues:
            issues.append({"path": rel, "issue": issue})

    for rel in non_png:
        issues.append({"path": rel, "issue": "non_png_file_in_runtime_replace"})

    fields = [
        "path", "category", "exists", "width", "height", "mode", "size_kb",
        "transparent_ratio", "expected_w", "expected_h", "source", "issues",
    ]
    write_csv(REPORT_DIR / "runtime_replace_final_detail.csv", details, fields)
    write_csv(REPORT_DIR / "runtime_replace_final_issues.csv", issues, ["path", "issue"])
    make_contact_sheets(details)

    summary = {
        "expected_png": len(expected_paths),
        "actual_png": len(actual_pngs),
        "missing": len(expected_paths - actual_pngs),
        "extra": len(actual_pngs - expected_paths),
        "non_png": len(non_png),
        "issue_count": len(issues),
        "issue_types": Counter(issue["issue"].split(":", 1)[0] for issue in issues),
    }
    (REPORT_DIR / "runtime_replace_final_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("=" * 64)
    print("runtime_replace final gate")
    print("=" * 64)
    print(f"expected_png: {summary['expected_png']}")
    print(f"actual_png:   {summary['actual_png']}")
    print(f"missing:      {summary['missing']}")
    print(f"extra:        {summary['extra']}")
    print(f"non_png:      {summary['non_png']}")
    print(f"issues:       {summary['issue_count']}")
    print(f"report_dir:   {REPORT_DIR}")

    if summary["missing"] or summary["extra"] or summary["non_png"] or summary["issue_count"]:
        print("[FAIL] runtime_replace is not ready.")
        return 1
    print("[PASS] runtime_replace is technically ready. Human contact-sheet review is still required.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
