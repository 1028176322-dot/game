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

# File size thresholds (KB): (warning, hard_fail)
# Based on 4MB WeChat mini game code package budget
FILE_SIZE_LIMITS: dict[str, tuple[float | None, float | None]] = {
    "background":     (500, 1000),   # 500KB warn, 1MB fail
    "sprite_sheet":   (300, 500),    # character sprite sheets
    "sprite":         (150, 300),    # single-frame boss/monster sprites
    "effect_sheet":   (200, 350),    # effect sprite sheets
    "icon":           (50, 100),     # UI/element icons
    "tile":           (100, 200),    # terrain tiles
}
# Category-specific overrides map (game_assets category -> type for lookup)
CATEGORY_SIZE_OVERRIDES: dict[str, dict[str, tuple[float, float]]] = {
    "bosses":    {"sprite": (250, 500)},   # boss sprites can be larger
    "monsters":  {"sprite": (100, 200)},   # monster sprites are smaller
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

        # Check 4b: sprite sheet layout validation
        if typ in SHEET_TYPES:
            layout = item.get("layout", "")
            if layout not in ("vertical", "horizontal", "grid"):
                errors.append(f"invalid layout '{layout}' for sheet: key={key}")

        # Check 4c: file-based type consistency — verify that actual disk image
        # dimensions match the declared type. This prevents the root cause where
        # sprite sheets are declared as 'sprite' (missing frame metadata) or
        # single images are declared as 'sprite_sheet'.
        if fpath.exists():
            _check_type_vs_file(fpath, key, typ, item, errors)

        # Check 6: safeReview — required for all entries, enforce compliance
        if "safeReview" not in item:
            errors.append(f"missing safeReview field: key={key} (all game_assets must have safeReview boolean)")
        elif not isinstance(item["safeReview"], bool):
            errors.append(f"safeReview must be boolean: key={key}, got {type(item['safeReview']).__name__}")
        elif item["safeReview"] is False:
            warnings.append(f"safeReview=false: key={key} (pending content review for WeChat compliance)")

        # Check 7: file size gate by type
        _check_file_size(fpath, key, typ, item, errors, warnings)

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


# ---- Type-vs-File consistency check ----

def _check_type_vs_file(fpath, key, typ, item, errors):
    """
    Verify that the declared type matches the actual file:
    - If file is a multi-frame sprite sheet (height >= 2x width, clean division),
      type MUST be sprite_sheet or effect_sheet, and frame metadata must be present.
    - If file is single image, type MUST NOT be sprite_sheet or effect_sheet.
    """
    try:
        img = Image.open(fpath)
    except Exception:
        return  # Can't check, skip

    w, h = img.size
    is_multi_frame = False
    frames = 0
    if h >= w * 2 and h % w == 0:
        is_multi_frame = True
        frames = h // w
    elif w >= h * 2 and w % h == 0:
        is_multi_frame = True
        frames = w // h

    if is_multi_frame:
        # File IS a sprite sheet — type must match
        if typ not in SHEET_TYPES:
            errors.append(
                f"type mismatch: {key} declared as '{typ}' but file is a {frames}-frame sprite sheet "
                f"({w}x{h}). Must be one of {SHEET_TYPES} with frameWidth/frameHeight/frames/layout."
            )
        else:
            # Verify frame metadata dimensions match actual file
            fw = item.get("frameWidth", 0)
            fh = item.get("frameHeight", 0)
            declared_frames = item.get("frames", 0)
            layout = item.get("layout", "vertical")
            if layout == "vertical" and (w != fw or h != fh * declared_frames):
                errors.append(
                    f"sheet metadata mismatch: {key}, "
                    f"declared={fw}x{fh}×{declared_frames} {layout}"
                    f", actual file={w}x{h} ({h // max(w,1)} frames)"
                )
            elif layout == "horizontal" and (w != fw * declared_frames or h != fh):
                errors.append(
                    f"sheet metadata mismatch: {key}, "
                    f"declared={fw}x{fh}×{declared_frames} {layout}"
                    f", actual file={w}x{h} ({w // max(h,1)} frames)"
                )
    else:
        # File is single image — type must not be sprite_sheet
        if typ in SHEET_TYPES:
            errors.append(
                f"type mismatch: {key} declared as '{typ}' but file is a single image "
                f"({w}x{h}). Change type to 'sprite' and remove sheet metadata."
            )


# ---- Image-level quality check helpers (Pillow required) ----

def _check_file_size(fpath, key, typ, item, errors, warnings):
    """
    Validate file size against per-type thresholds.
    Category-specific overrides take precedence over type defaults.
    """
    try:
        fsize_kb = fpath.stat().st_size / 1024
    except Exception:
        return  # cannot stat

    category = item.get("category", "")
    warn_limit, fail_limit = None, None

    # Check category-specific override first
    if category in CATEGORY_SIZE_OVERRIDES and typ in CATEGORY_SIZE_OVERRIDES[category]:
        warn_limit, fail_limit = CATEGORY_SIZE_OVERRIDES[category][typ]
    elif typ in FILE_SIZE_LIMITS:
        warn_limit, fail_limit = FILE_SIZE_LIMITS[typ]

    if fail_limit is not None and fsize_kb > fail_limit:
        errors.append(
            f"file size HARD FAIL: key={key}, {fsize_kb:.0f}KB exceeds limit {fail_limit:.0f}KB "
            f"(type={typ}, category={category or 'none'})"
        )
    elif warn_limit is not None and fsize_kb > warn_limit:
        warnings.append(
            f"file size WARNING: key={key}, {fsize_kb:.0f}KB exceeds warning {warn_limit:.0f}KB "
            f"(type={typ}, category={category or 'none'})"
        )

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
    """Validate tile size, edge seamlessness, and wrap-around tiling."""
    w, h = img.size
    tile_size = item.get("tileSize", 0)
    if tile_size and (w != tile_size or h != tile_size):
        warnings.append(f"tile size mismatch: {key}, actual={w}x{h}, expected={tile_size}x{tile_size}")

    px = img.convert("RGB").load()
    if not px:
        return

    # Edge seamlessness: compare left/right edges and top/bottom edges
    edge_score = 0
    # Horizontal wrap edges (left vs right)
    for y in range(h):
        edge_score += sum(abs(px[0, y][i] - px[w - 1, y][i]) for i in range(3))
    # Vertical wrap edges (top vs bottom)
    for x in range(w):
        edge_score += sum(abs(px[x, 0][i] - px[x, h - 1][i]) for i in range(3))
    edge_score /= max(1, (w + h) * 3)

    # Corner seamlessness: check 2x2 tile pattern continuity
    corner_score = 0
    if w > 2 and h > 2:
        for y in range(min(4, h)):
            for x in range(min(4, w)):
                mid_x = w // 2 + x
                mid_y = h // 2 + y
                if mid_x < w and mid_y < h:
                    if x + 1 < w and y + 1 < h:
                        corner_score += (
                            abs(px[x, y][0] - px[mid_x, mid_y][0]) +
                            abs(px[x, y][1] - px[mid_x, mid_y][1]) +
                            abs(px[x, y][2] - px[mid_x, mid_y][2])
                        )
    corner_score /= max(1, 16 * 3)

    combined = edge_score * 0.7 + corner_score * 0.3

    if combined > 25:
        warnings.append(f"tile edge score CRITICAL: {key}, combined={combined:.2f} (edge={edge_score:.2f}, corner={corner_score:.2f})")
    elif combined > 15:
        warnings.append(f"tile edge score HIGH: {key}, combined={combined:.2f} (edge={edge_score:.2f}, corner={corner_score:.2f})")


def _check_icon(img, key, warnings):
    """Validate icon has transparent background."""
    img_rgba = img.convert("RGBA")
    alpha = img_rgba.getchannel("A")
    transparent = sum(1 for v in alpha.getdata() if v < 16)
    ratio = transparent / max(1, img.width * img.height)
    if ratio < 0.10:
        warnings.append(f"icon may lack transparent background: {key}, transparent={ratio:.2%}")


def _check_background(img, key, item, warnings):
    """Validate background format and alpha channel."""
    fmt = item.get("format", "")
    if fmt and fmt not in ("jpg", "jpeg", "png"):
        warnings.append(f"background format may be suboptimal: {key}, format={fmt}")

    # Backgrounds should not have alpha in most cases (unless overlay)
    if fmt in ("jpg", "jpeg") and img.mode in ("RGBA", "LA"):
        warnings.append(f"background should be RGB (no alpha) for JPG: {key}, mode={img.mode}")
    elif img.mode == "RGBA":
        # Check if alpha is actually used (non-opaque pixels)
        alpha = img.getchannel("A")
        non_opaque = sum(1 for v in alpha.getdata() if v < 240)
        ratio = non_opaque / max(1, img.width * img.height)
        if ratio < 0.02:
            warnings.append(f"background has unused alpha channel: {key}, consider saving as RGB for size reduction")


if __name__ == "__main__":
    sys.exit(main())
