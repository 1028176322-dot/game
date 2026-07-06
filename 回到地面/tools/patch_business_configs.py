#!/usr/bin/env python3
"""
patch_business_configs.py — Phase 3: Add semantic key references to business configs.

Adds visual/icon/effect/backgrounds/tileset fields that reference game_assets.json keys.
This does NOT change existing values — only appends new fields.

Usage:
    python tools/patch_business_configs.py --apply   # Write changes
    python tools/patch_business_configs.py --dry-run # Print what would change
"""

import json
import sys
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = PROJECT_DIR / "assets" / "resources" / "config"

# Monster ID → game_assets monster visual key
# (lowercase match — zone+monster name from monsters.json → game_assets key)
def build_monster_visual_map(ga: dict) -> dict:
    """Build monster_id -> visual_key from game_assets monster entries."""
    result = {}
    for k in ga:
        if k.startswith("monster."):
            # monster.forest.slime -> key stores the '_idle' we need
            pass
    return result


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        raw = json.load(f)
    return raw


def save_json(path: Path, data: dict):
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"  Written: {path}")


def patch_monsters(ga: dict, dry_run: bool):
    path = CONFIG_DIR / "monsters.json"
    data = load_json(path)
    changes = 0

    for zone_key, monsters in data.items():
        if zone_key in ("metadata", "monsterScale"):
            continue
        for mid, entry in monsters.items():
            visual_key = f"monster.{zone_key}.{mid.lower()}"
            if visual_key in ga and "visual" not in entry:
                entry["visual"] = visual_key
                changes += 1

    if changes:
        print(f"  monsters.json: +{changes} visual keys")
        if not dry_run:
            save_json(path, data)
    else:
        print("  monsters.json: no changes needed")


def patch_zones(ga: dict, dry_run: bool):
    path = CONFIG_DIR / "zones.json"
    data = load_json(path)
    zones = data.get("zones", {})
    changes = 0

    for zone_id in list(zones.keys()):
        zone = zones[zone_id]
        # backgrounds
        bk = f"background.bg_combat_{zone_id}"
        if bk in ga and "backgrounds" not in zone:
            zone["backgrounds"] = {
                "combat": f"background.bg_combat_{zone_id}",
                "event": f"background.bg_event_{zone_id}",
            }
            changes += 1

        # tileset
        for ttype in ["floor", "wall", "highground", "hazard"]:
            tk = f"tile.{zone_id}.{ttype}"
            if tk in ga and "tileset" not in zone:
                zone["tileset"] = {
                    "floor": f"tile.{zone_id}.floor",
                    "wall": f"tile.{zone_id}.wall",
                    "highground": f"tile.{zone_id}.highground",
                    "hazard": f"tile.{zone_id}.hazard",
                }
                changes += 1
                break

    if changes:
        print(f"  zones.json: +{changes} backgrounds/tileset entries")
        if not dry_run:
            save_json(path, data)
    else:
        print("  zones.json: no changes needed")


def patch_skills(ga: dict, dry_run: bool):
    path = CONFIG_DIR / "skills.json"
    data = load_json(path)
    changes = 0

    # Active skills
    for skill in data.get("activeSkills", []):
        sid = skill["id"]
        # Try both naming conventions: icon.skill.{id} and icon.skills.icon_skill_{id}
        ikey = f"icon.skill.{sid}"
        if ikey not in ga:
            ikey = f"icon.skills.icon_skill_{sid}"
        if ikey in ga and "icon" not in skill:
            skill["icon"] = ikey
            changes += 1

    # Core abilities
    for ab in data.get("coreAbilities", []):
        aid = ab["id"]
        ikey = f"icon.ability.{aid}"
        if ikey not in ga:
            ikey = f"icon.upgrade.icon_ability_{aid}"
        if ikey in ga and "icon" not in ab:
            ab["icon"] = ikey
            changes += 1

    if changes:
        print(f"  skills.json: +{changes} icon keys")
        if not dry_run:
            save_json(path, data)
    else:
        print("  skills.json: no changes needed")


def patch_items(ga: dict, dry_run: bool):
    path = CONFIG_DIR / "items.json"
    data = load_json(path)
    changes = 0

    # Item pool
    for iid, entry in data.get("itemPool", {}).items():
        iid_lower = iid.lower()
        ikey = f"icon.item.{iid_lower}"
        if ikey not in ga:
            ikey = f"icon.items.icon_item_{iid_lower}"
        if ikey not in ga:
            ikey = f"icon.items.item_{iid_lower}"
        if ikey in ga and "icon" not in entry:
            entry["icon"] = ikey
            changes += 1

    # Element scrolls
    for scroll in data.get("elementScrolls", []):
        sid = scroll["id"].lower()
        ikey = f"icon.item.{sid}"
        if ikey not in ga:
            ikey = f"icon.items.icon_{sid}"
        if ikey in ga and "icon" not in scroll:
            scroll["icon"] = ikey
            changes += 1

    if changes:
        print(f"  items.json: +{changes} icon keys")
        if not dry_run:
            save_json(path, data)
    else:
        print("  items.json: no changes needed")


def patch_equipment(ga: dict, dry_run: bool):
    path = CONFIG_DIR / "equipment.json"
    data = load_json(path)
    changes = 0

    # Equipment slots (just add slot icon for reference)
    # Check if there's an icon field we can add
    for slot_key in data.get("slotBaseStats", {}):
        skey = f"ui.equipment.slot_{slot_key}"
        # Slot icons are in ui_assets, not game_assets. Skip here.

    if changes:
        print(f"  equipment.json: +{changes} keys")
        if not dry_run:
            save_json(path, data)
    else:
        print("  equipment.json: no changes (icons via ui_assets)")


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write changes to disk")
    parser.add_argument("--dry-run", action="store_true", help="Show what would change")
    args = parser.parse_args()

    if not args.apply:
        args.dry_run = True
        print("  [DRY RUN] No files will be modified")

    with open(CONFIG_DIR / "game_assets.json", "r", encoding="utf-8") as f:
        raw = json.load(f)
    ga = raw.get("data", raw)
    ga = {k: v for k, v in ga.items() if k != "metadata"}

    print("Patching business configs with semantic key references...\n")

    patch_monsters(ga, args.dry_run)
    patch_zones(ga, args.dry_run)
    patch_skills(ga, args.dry_run)
    patch_items(ga, args.dry_run)
    patch_equipment(ga, args.dry_run)

    print("\nDone.")


if __name__ == "__main__":
    main()
