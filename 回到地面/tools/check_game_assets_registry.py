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
  9. Image-level quality checks (requires Pillow):
     - sprite_sheet/effect_sheet: dimension match, alpha channel
     - tile: size match, edge difference score
     - icon: transparent background ratio
     - background: format, rough file size

Usage:
    python tools/check_game_assets_registry.py
    python tools/check_game_assets_registry.py --ci   # exit(1) on errors
"""

import json
import sys
from pathlib import Path

try:
    from PIL import Image
    HAS_PILLOW = True
except Exception:
    Image = None
    HAS_PILLOW = False

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

    # Pillow is required for image-level quality checks
    if not HAS_PILLOW:
        print("\n  [WARN] Pillow not installed. Image-level checks (sheet dims, tile edges, icon alpha) will be SKIPPED.")
        print("  Install: pip install Pillow")
        # In CI mode, fail hard — quality gate must be operational
        if "--ci" in sys.argv:
            errors.append("Pillow is required for image-level asset validation in CI mode")

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

        # -- Image-level quality checks (require Pillow) --
        if not HAS_PILLOW:
            continue
        if not fpath.exists():
            continue

        try:
            img = Image.open(fpath)
        except Exception:
            warnings.append(f"cannot open image for inspection: key={key}")
            continue

        if typ in SHEET_TYPES:
            _check_sheet(img, key, item, errors)
        elif typ == "tile":
            _check_tile(img, key, item, warnings)
        elif typ == "icon":
            _check_icon(img, key, warnings)
        elif typ == "background":
            _check_background(img, key, item, warnings)

    # ---- Find unused assets.json entries ----
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


# ---- Image-level quality check helpers (Pillow required) ----

def _check_sheet(img, key, item, errors):
    """Validate sprite sheet dimensions match metadata."""
    w, h = img.size
    fw = item.get("frameWidth", 0)
    fh = item.get("frameHeight", 0)
    frames = item.get("frames", 0)
    layout = item.get("layout", "vertical")

    if fw <= 0 or fh <= 0 or frames <= 0:
        errors.append(f"invalid sheet metadata: {key}")
        return

    if layout == "vertical" and (w != fw or h != fh * frames):
        errors.append(f"sheet size mismatch: {key}, actual={w}x{h}, expected={fw}x{fh*frames}")
    elif layout == "horizontal" and (w != fw * frames or h != fh):
        errors.append(f"sheet size mismatch: {key}, actual={w}x{h}, expected={fw*frames}x{fh}")

    if img.mode not in ("RGBA", "LA"):
        errors.append(f"sheet should have alpha channel: {key}, mode={img.mode}")


def _check_tile(img, key, item, warnings):
    """Validate tile size and edge seamlessness."""
    w, h = img.size
    tile_size = item.get("tileSize", 0)
    if tile_size and (w != tile_size or h != tile_size):
        warnings.append(f"tile size mismatch: {key}, actual={w}x{h}, expected={tile_size}x{tile_size}")

    px = img.convert("RGB").load()
    if not px:
        return
    score = 0
    for y in range(h):
        score += sum(abs(px[0, y][i] - px[w - 1, y][i]) for i in range(3))
    for x in range(w):
        score += sum(abs(px[x, 0][i] - px[x, h - 1][i]) for i in range(3))
    score /= max(1, (w + h) * 3)

    if score > 18:
        warnings.append(f"tile edge score high: {key}, score={score:.2f}")


def _check_icon(img, key, warnings):
    """Validate icon has transparent background."""
    img_rgba = img.convert("RGBA")
    alpha = img_rgba.getchannel("A")
    transparent = sum(1 for v in alpha.getdata() if v < 16)
    ratio = transparent / max(1, img.width * img.height)
    if ratio < 0.10:
        warnings.append(f"icon may lack transparent background: {key}, transparent={ratio:.2%}")


def _check_background(img, key, item, warnings):
    """Validate background format and rough file size."""
    fmt = item.get("format", "")
    if fmt and fmt not in ("jpg", "jpeg", "png"):
        warnings.append(f"background format may be suboptimal: {key}, format={fmt}")
    try:
        fsize = Path(img.filename).stat().st_size if hasattr(img, 'filename') and img.filename else 0
        size_kb = fsize / 1024
        if size_kb > 500:
            warnings.append(f"background file may be oversized: {key}, {size_kb:.0f}KB")
    except Exception:
        pass


if __name__ == "__main__":
    sys.exit(main())
