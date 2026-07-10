#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Post-process AI-generated archer part images into runtime-ready parts.

Steps:
  1. Remove matte/checkerboard background via edge flood-fill.
  2. Crop out bottom-right watermark region.
  3. Crop to content with padding.
  4. Resize to target size while keeping >= 12px transparent margin.

Usage:
  python tools/process_archer_parts.py
"""

import os
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageFilter

# Allow importing art_pipeline functions from the project-level tools
_SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_TOOLS_DIR = _SCRIPT_DIR.parent / "回到地面" / "tools"
if str(PROJECT_TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_TOOLS_DIR))

from art_pipeline import remove_matte_background, remove_chroma_pixels, feather_alpha

# ── Configuration ───────────────────────────────────────────────────────────
BASE_DIR = _SCRIPT_DIR.parent / "回到地面" / "art_source" / "textures_review" / "master" / "characters" / "archer"
TMP_GEN_DIR = BASE_DIR / "tmp_gen"
OUT_DIR = BASE_DIR / "parts"
WATERMARK_CROP_BOTTOM = 80  # px to remove from bottom (where watermark appears)

PART_TARGETS = {
    "body": (160, 160),
    "head": (128, 128),
    "ear_l": (64, 96),
    "ear_r": (64, 96),
    "arm_l": (96, 128),
    "arm_r": (96, 128),
    "leg_l": (80, 112),
    "leg_r": (80, 112),
    "tail": (96, 128),
    "bow": (128, 128),
    "quiver": (96, 96),
    "cape": (128, 160),
}

MARGIN = 12


def process_part(raw_path: Path, target_size: tuple[int, int]) -> Image.Image | None:
    """Process a single raw generated image into a clean part image."""
    img = Image.open(str(raw_path))

    # Remove background (works for white or checkerboard backgrounds)
    rgba = remove_matte_background(img)
    rgba = remove_chroma_pixels(rgba)
    rgba = feather_alpha(rgba, radius=0.8)

    w, h = rgba.size
    # Crop out bottom watermark region
    rgba = rgba.crop((0, 0, w, h - WATERMARK_CROP_BOTTOM))

    # Find content bbox
    bbox = rgba.getbbox()
    if not bbox:
        return None

    left, top, right, bottom = bbox
    # Add a small padding around content before cropping
    pad = 8
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(rgba.size[0], right + pad)
    bottom = min(rgba.size[1], bottom + pad)
    cropped = rgba.crop((left, top, right, bottom))
    cw, ch = cropped.size

    # Compute fit size: target minus margin on each side
    fit_w = target_size[0] - MARGIN * 2
    fit_h = target_size[1] - MARGIN * 2
    scale = min(fit_w / cw, fit_h / ch) if cw > 0 and ch > 0 else 1.0
    new_w = max(int(cw * scale), 1)
    new_h = max(int(ch * scale), 1)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    # Center on target canvas with transparent background
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    x_off = (target_size[0] - new_w) // 2
    y_off = (target_size[1] - new_h) // 2
    canvas.paste(resized, (x_off, y_off), resized)
    return canvas


def process_all() -> dict[str, bool]:
    """Process all generated parts in tmp_gen/."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = {}

    for part_name, target_size in PART_TARGETS.items():
        part_dir = TMP_GEN_DIR / part_name
        if not part_dir.exists():
            print(f"  SKIP {part_name}: generation directory not found")
            results[part_name] = False
            continue

        pngs = sorted(part_dir.glob("*.png"))
        if not pngs:
            print(f"  SKIP {part_name}: no PNG found in {part_dir}")
            results[part_name] = False
            continue

        raw_path = pngs[0]
        try:
            out = process_part(raw_path, target_size)
            if out is None:
                print(f"  ERR  {part_name}: no content found")
                results[part_name] = False
                continue

            out_path = OUT_DIR / f"{part_name}.png"
            out.save(str(out_path), "PNG")
            print(f"  OK   {part_name}: {target_size[0]}x{target_size[1]} ({out_path.stat().st_size // 1024}KB)")
            results[part_name] = True
        except Exception as e:
            print(f"  ERR  {part_name}: {e}")
            results[part_name] = False

    return results


if __name__ == "__main__":
    print(f"Processing generated parts from {TMP_GEN_DIR}")
    results = process_all()
    ok = sum(1 for v in results.values() if v)
    print(f"\nDone: {ok}/{len(results)} parts processed")
