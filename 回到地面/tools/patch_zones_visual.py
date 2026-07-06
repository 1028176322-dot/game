#!/usr/bin/env python3
"""
patch_zones_visual.py — Add visual keys to zones.json finalBoss and miniBoss stages.

Usage:
    python tools/patch_zones_visual.py --apply
    python tools/patch_zones_visual.py --dry-run
"""

import json
import re
import sys
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
ZONES_JSON = PROJECT_DIR / "assets" / "resources" / "config" / "zones.json"

# Map finalBoss id -> boss name suffix for key construction
FINAL_BOSS_VISUAL = {
    "forestGuardian": "forestguardian",
    "skeletonLord": "skeletonlord", 
    "fireLord": "firelord",
    "frostQueen": "frostqueen",
    "swampBehemoth": "beast_swamp",
    "abyssOverlord": "abyssoverlord",
}

# Same finalBoss entries also have a variant with zone prefix
FINAL_BOSS_VISUAL_ALT = {
    "forestGuardian": "forestguardian",
    "skeletonLord": "lord_catacombs",
    "fireLord": "lord_volcano",
    "frostQueen": "queen_tundra",
    "swampBehemoth": "beast_swamp",
    "abyssOverlord": "lord_abyss",
}


def zone_key_to_boss_key(zone_id: str) -> str:
    """Map zone id to boss key suffix."""
    mapping = {
        "forest": "forestguardian",
        "catacombs": "skeletonlord",
        "volcano": "firelord",
        "tundra": "frostqueen",
        "swamp": "beast_swamp",
        "abyss": "abyssoverlord",
    }
    return mapping.get(zone_id, zone_id)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.apply:
        args.dry_run = True
        print("[DRY RUN]")

    with open(ZONES_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    zones = data.get("zones", {})
    changes = 0

    for zone_id, zone in zones.items():
        # Final boss
        fb = zone.get("finalBoss", {})
        if fb and "visual" not in fb:
            boss_key = zone_key_to_boss_key(zone_id)
            fb["visual"] = f"boss.{boss_key}"
            changes += 1
            print(f"  {zone_id}.finalBoss: visual=boss.{boss_key}")

        # Stages with miniBoss
        stages = zone.get("stages", {})
        for stage_id, stage in stages.items():
            if "miniBoss" in stage and "miniBossVisual" not in stage:
                mbid = stage["miniBoss"]
                # Convert camelCase miniBoss id to snake_case for key
                snake = re.sub(r'(?<!^)(?=[A-Z])', '_', mbid).lower()
                # Determine zone-specific miniboss visual key
                # game_assets has: miniboss/<zone>/miniboss_{zone}_{snake}_idle
                mb_key = f"boss.miniboss.{zone_id}.{snake}"
                stage["miniBossVisual"] = mb_key
                changes += 1
                print(f"  {stage_id}.miniBoss={mbid}: miniBossVisual={mb_key}")

    if changes > 0 and not args.dry_run:
        with open(ZONES_JSON, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"\nWritten {changes} changes to zones.json")
    elif changes > 0 and args.dry_run:
        print(f"\n{changes} changes would be applied")
    else:
        print("No changes needed")


if __name__ == "__main__":
    main()
