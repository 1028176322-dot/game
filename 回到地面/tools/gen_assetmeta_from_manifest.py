"""
gen_assetmeta_from_manifest.py

从 art_3d_manifest.json 批量生成 .assetmeta.json 模板文件（176 项）。
AI 拿到模板后只需填写实际 Tri/Bone/Animation 数值，无需从头编写。

Usage:
    python tools/gen_assetmeta_from_manifest.py
    python tools/gen_assetmeta_from_manifest.py --output assets/resources/models
    python tools/gen_assetmeta_from_manifest.py --single CHR_Archer_A

Relies on:
    - assets/resources/config/art_3d_manifest.json (manifest)
    - assets/resources/config/art_quality_budget.json → rules3d (budget defaults)
"""

import json
import os
import sys
import argparse
from datetime import date

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 回到地面/
GAME_ROOT = os.path.dirname(PROJECT_ROOT)  # E:/game/
MANIFEST_PATH = os.path.join(GAME_ROOT, "assets", "resources", "config", "art_3d_manifest.json")
BUDGET_PATH = os.path.join(GAME_ROOT, "assets", "resources", "config", "art_quality_budget.json")
DEFAULT_OUTPUT = os.path.join(GAME_ROOT, "assets", "resources", "models")


def load_manifest():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_budget():
    with open(BUDGET_PATH, "r", encoding="utf-8") as f:
        return json.load(f).get("rules3d", {})


def map_category_to_rules3d(category: str) -> str:
    """Map manifest category to rules3d budget key."""
    mapping = {
        "characters": "characters",
        "bosses": "bosses_mini",  # default; final bosses handled separately
        "monsters": "monsters",
        "effects": "effects_normal",
        "tiles": "tiles",
        "dungeon": "dungeon",
    }
    return mapping.get(category, "characters")


def build_assetmeta(entry: dict, budget: dict) -> dict:
    """Build an .assetmeta.json dict for a manifest entry."""
    name = entry["name"]
    category = entry["category"]
    lifecycle = entry.get("lifecycle", "选秀")

    # Determine budget key
    is_final_boss = category == "bosses" and "Final" in name
    budget_key = "bosses_final" if is_final_boss else map_category_to_rules3d(category)
    b = budget.get(budget_key, {})

    # Default values from rules3d
    default_tri = b.get("maxTri", 0) or b.get("recommendTri", 0)
    default_bones = b.get("maxBones", 0) or b.get("recommendBones", 0)
    default_tex = b.get("textureSize", 512)
    default_lod = len(b.get("lod", []))
    default_clips = b.get("animClipsMin", 0)
    default_sockets = b.get("sockets", [])
    default_collider = b.get("collider", "capsule")
    default_perf = b.get("perfTier", "medium")
    default_particles = b.get("maxParticles", 0)
    default_drawcall = b.get("maxDrawCall", 0)

    meta = {
        "name": name,
        "tri": default_tri,
        "bones": default_bones,
        "textureSize": default_tex,
        "lodLevels": default_lod,
        "animClips": default_clips,
        "sockets": default_sockets,
        "colliders": [default_collider] if default_collider else [],
        "lifecycle": lifecycle,
        "perfTier": default_perf,
        "version": "1.0.0",
        "author": "",
        "date": str(date.today()),
        "reviewer": "",
    }

    # Effects are particle systems, not meshes — different fields
    if category == "effects":
        meta["particles"] = default_particles
        meta["drawCall"] = default_drawcall

    return meta


def write_assetmeta(meta: dict, output_dir: str, dry_run: bool = False):
    """Write a single .assetmeta.json file."""
    name = meta["name"]
    cat_dir = os.path.join(output_dir, _category_from_name(name))
    os.makedirs(cat_dir, exist_ok=True)
    path = os.path.join(cat_dir, f"{name}.assetmeta.json")
    if dry_run:
        return path
    with open(path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    return path


def _category_from_name(name: str) -> str:
    """Infer storage category from asset name prefix."""
    if name.startswith("CHR_"):
        return "characters"
    if name.startswith("MON_"):
        return "monsters"
    if name.startswith("BOSS_"):
        return "bosses"
    if name.startswith("FX_"):
        return "effects"
    if name.startswith("TILE_"):
        return "tiles"
    if name.startswith("DNG_"):
        return "dungeon"
    return "other"


def main():
    parser = argparse.ArgumentParser(description="Generate .assetmeta.json templates from 3D manifest")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="Output directory for assetmeta files")
    parser.add_argument("--single", default=None, help="Generate only for a specific asset name")
    parser.add_argument("--dry-run", action="store_true", help="Print paths without writing")
    parser.add_argument("--report", action="store_true", help="Print summary report")
    args = parser.parse_args()

    manifest = load_manifest()
    budget = load_budget()
    entries = manifest.get("entries", [])

    if args.single:
        entries = [e for e in entries if e["name"] == args.single]
        if not entries:
            print(f"ERROR: asset '{args.single}' not found in manifest")
            sys.exit(1)

    generated = 0
    skipped = 0
    for entry in entries:
        meta = build_assetmeta(entry, budget)
        path = write_assetmeta(meta, args.output, dry_run=args.dry_run)

        if args.dry_run:
            print(f"[DRY-RUN] {path}")
        else:
            print(f"[GEN] {path}")

        generated += 1

    print(f"\n=== Summary ===")
    print(f"Generated: {generated}")
    print(f"Output: {args.output}/")

    if args.report and not args.dry_run:
        # Count by category
        cat_counts = {}
        for e in entries:
            cat = e["category"]
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
        print(f"\nBy category:")
        for cat, cnt in sorted(cat_counts.items()):
            print(f"  {cat}: {cnt}")


if __name__ == "__main__":
    main()
