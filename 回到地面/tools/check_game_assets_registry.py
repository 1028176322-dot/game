#!/usr/bin/env python3
"""
check_game_assets_registry.py — Game asset registry validation gate

Checks:
  1. All game_assets.json assetIds exist in assets.json
  2. assetId -> disk file exists
  3. type is in allowed set
  4. sprite_sheet frameWidth/frameHeight/frames/layout are present
  5. background format/fit are present
  6. tile tileSize is present
  7. icon width/height are present
  8. Output unused keys as warnings

Usage:
    python tools/check_game_assets_registry.py
    python tools/check_game_assets_registry.py --ci   # exit(1) on errors
"""

import json
import sys
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = PROJECT_DIR / "assets" / "resources" / "config"
TEXTURES_DIR = PROJECT_DIR / "assets" / "resources" / "textures"

ASSETS_JSON = CONFIG_DIR / "assets.json"
GAME_ASSETS_JSON = CONFIG_DIR / "game_assets.json"

VALID_TYPES = {"sprite", "sprite_sheet", "background", "tile", "effect_sheet", "icon"}
SHEET_TYPES = {"sprite_sheet", "effect_sheet"}

REQUIRED_FIELDS = {
    "sprite_sheet": ["frameWidth", "frameHeight", "frames", "layout"],
    "background": ["format", "fit"],
    "tile": ["tileSize"],
    "icon": ["width", "height"],
}


def load_json(path: Path) -> dict:
    if not path.exists():
        print(f"[ERROR] file not found: {path}")
        return {}
    with path.open("r", encoding="utf-8") as f:
        raw = json.load(f)
    data = raw.get("data", raw)
    if "metadata" in data:
        del data["metadata"]
    return data


def asset_id_to_file(asset_id: str) -> Path:
    """Convert assetId like 'textures/characters/warrior/warrior_idle' to file path."""
    rel = asset_id
    if rel.startswith("textures/"):
        rel = rel[len("textures/"):]
    for ext in [".png", ".jpg", ".jpeg"]:
        p = TEXTURES_DIR / f"{rel}{ext}"
        if p.exists():
            return p
    return TEXTURES_DIR / f"{rel}.png"  # Return default, caller checks exists


def main() -> int:
    print("=" * 60)
    print("  Game Asset Registry Validation")
    print("=" * 60)

    errors = []
    warnings = []

    # Load assets.json
    assets = load_json(ASSETS_JSON)
    asset_ids = set(assets.keys())
    print(f"\n  assets.json entries: {len(asset_ids)}")

    # Load game_assets.json
    game_assets = load_json(GAME_ASSETS_JSON)
    game_keys = list(game_assets.keys())
    print(f"  game_assets.json entries: {len(game_keys)}")

    if not game_keys:
        errors.append("game_assets.json is empty or not loaded")
        print(f"\n[SUMMARY] errors={len(errors)} warnings={len(warnings)}")
        return 1 if errors else 0

    # Per-entry checks
    for key in game_keys:
        item = game_assets[key]
        asset_id = item.get("assetId", "")
        typ = item.get("type", "")

        # Required: assetId
        if not asset_id:
            errors.append(f"missing assetId: {key}")
            continue

        # Check 1: assetId in assets.json
        if asset_id not in asset_ids:
            errors.append(f"assetId not in assets.json: key={key}, assetId={asset_id}")

        # Check 2: file exists on disk
        fpath = asset_id_to_file(asset_id)
        if not fpath.exists():
            errors.append(f"file not found: key={key}, assetId={asset_id}, path={fpath}")

        # Check 3: type valid
        if typ not in VALID_TYPES:
            errors.append(f"invalid type: key={key}, type={typ}")
            continue

        # Check 4: required fields per type
        for field in REQUIRED_FIELDS.get(typ, []):
            if field not in item or item[field] is None:
                errors.append(f"missing field '{field}' for {typ}: key={key}")

        # Check 5: sprite sheet layout validation
        if typ in SHEET_TYPES:
            layout = item.get("layout", "")
            if layout not in ("vertical", "horizontal", "grid"):
                errors.append(f"invalid layout '{layout}' for sheet: key={key}")

        # Check 6: safeReview boolean
        if "safeReview" in item and not isinstance(item["safeReview"], bool):
            warnings.append(f"safeReview should be boolean: key={key}")

    # Find unused assets.json entries that are not referenced by game_assets or ui_assets
    used_asset_ids = set()
    for item in game_assets.values():
        if item.get("assetId"):
            used_asset_ids.add(item["assetId"])

    # Also check ui_assets
    try:
        ui_assets = load_json(CONFIG_DIR / "ui_assets.json")
        for item in ui_assets.values():
            if isinstance(item, dict) and item.get("assetId"):
                used_asset_ids.add(item["assetId"])
    except Exception:
        pass

    unreferenced = sorted(asset_ids - used_asset_ids - {"metadata"})
    if unreferenced:
        # Only show non-ui/texture entries that are clearly meant to be game assets
        game_unref = [k for k in unreferenced if not k.startswith("textures/ui/")]
        if game_unref:
            warnings.append(f"unreferenced assetIds (may be orphaned): {len(game_unref)}")
            for k in game_unref[:10]:
                warnings.append(f"  unreferenced: {k}")

    # Print results
    print(f"\n{'=' * 60}")
    for e in errors:
        print(f"  [ERROR] {e}")
    for w in warnings:
        print(f"  [WARN] {w}")
    print(f"{'=' * 60}")
    print(f"  Summary: errors={len(errors)} warnings={len(warnings)}")

    # Save report
    OUTPUT_DIR = Path(__file__).resolve().parent / "output"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report = {
        "metadata": {
            "tool": "check_game_assets_registry.py",
            "version": "1.0.0",
        },
        "errors": errors,
        "warnings": warnings,
        "summary": {"errors": len(errors), "warnings": len(warnings)},
    }
    with open(OUTPUT_DIR / "check_game_assets_registry_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
