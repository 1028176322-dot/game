#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Character sprite sheet normalizer (v3).

Takes an AI-generated character sprite sheet (which may contain 1-4 rows and 1-N
columns of frames) and produces a canonical 256x1024 vertical sprite sheet with
exactly 4 frames stacked at 256x256 each.

Approach:
  1. Build a foreground mask from alpha + white background rejection.
  2. Project onto the Y axis to find horizontal bands (frames) via deep gaps.
  3. In each band, use 4-connected component analysis to find individual character
     blobs and pick the best one (largest, prefer centered).
  4. Clean, center, and scale each selected frame to 256x256.
  5. Stack vertically into 256x1024.

Usage:
  python tools/normalize_character_sprite_sheet_v3.py --resource archer_attack
  python tools/normalize_character_sprite_sheet_v3.py --all
  python tools/normalize_character_sprite_sheet_v3.py --check-only
"""

import argparse
import glob
import os
import shutil
from collections import deque
from pathlib import Path

from PIL import Image, ImageOps

# ── Configuration ───────────────────────────────────────────────────────────
FRAME_SIZE = 256
TOTAL_HEIGHT = 1024
TARGET_SIZE = (FRAME_SIZE, TOTAL_HEIGHT)

MASTER_DIR = (
    Path(__file__).resolve().parent.parent
    / "回到地面"
    / "art_source"
    / "textures_review"
    / "master"
    / "characters"
)
BACKUP_DIR = (
    Path(__file__).resolve().parent.parent
    / "回到地面"
    / "art_source"
    / "textures_review"
    / "backup"
    / "pre_normalize_v3"
)

MIN_COMPONENT_PIXELS = 50
ALPHA_THRESHOLD = 30
WHITE_THRESHOLD = 248


# ── Mask utilities ─────────────────────────────────────────────────────────

def build_mask(img: Image.Image) -> tuple[list[int], int, int]:
    """Return a 1D binary mask: 1 for foreground, 0 for background."""
    rgba = img.convert("RGBA")
    w, h = rgba.size
    pix = rgba.load()
    mask = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a > ALPHA_THRESHOLD and not (r > WHITE_THRESHOLD and g > WHITE_THRESHOLD and b > WHITE_THRESHOLD):
                mask.append(1)
            else:
                mask.append(0)
    return mask, w, h


def smooth(values: list[int | float], window: int = 5) -> list[float]:
    """Simple moving average with mirror padding."""
    if window <= 1:
        return [float(v) for v in values]
    half = window // 2
    padded = [values[0]] * half + list(values) + [values[-1]] * half
    out = []
    for i in range(len(values)):
        window_vals = padded[i : i + window]
        out.append(sum(window_vals) / len(window_vals))
    return out


def find_valleys(density: list[float], gap_min_size: int = 8, low_ratio: float = 0.08) -> list[int]:
    """Find deep valleys in density that are suitable as separators."""
    if not density:
        return []
    peak = max(density) or 1.0
    low_threshold = peak * low_ratio

    # Find all local minima below low_threshold
    minima = []
    for i in range(1, len(density) - 1):
        if density[i] < density[i - 1] and density[i] <= density[i + 1] and density[i] < low_threshold:
            minima.append((density[i], i))

    # Greedy selection: deepest first, enforce minimum separation
    minima.sort()
    selected = []
    for _, y in minima:
        if all(abs(y - s) > gap_min_size for s in selected):
            selected.append(y)

    selected.sort()
    return selected


# ── Band detection (rows) ─────────────────────────────────────────────────

def split_into_bands(mask: list[int], w: int, h: int, bands: int = 4) -> list[tuple[int, int]]:
    """Split image vertically into `bands` horizontal bands via deep row gaps."""
    row_density = [sum(mask[y * w + x] for x in range(w)) for y in range(h)]
    smoothed = smooth(row_density, window=5)

    # Find up to (bands - 1) deep valleys
    valleys = find_valleys(smoothed, gap_min_size=20, low_ratio=0.06)

    if len(valleys) >= bands - 1:
        cuts = sorted(valleys[: bands - 1])
    else:
        # Equal fallback
        cuts = [int((i + 1) * h / bands) for i in range(bands - 1)]

    bounds = [0] + cuts + [h]
    return [(bounds[i], bounds[i + 1]) for i in range(bands)]


# ── Connected components per band ─────────────────────────────────────────────

def find_components_in_band(img: Image.Image, y1: int, y2: int) -> list[dict]:
    """Find connected character blobs inside a horizontal band."""
    band = img.crop((0, y1, img.size[0], y2))
    mask, w, h = build_mask(band)
    visited = [False] * (w * h)
    components = []

    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if mask[idx] == 0 or visited[idx]:
                continue

            queue = deque([(x, y)])
            visited[idx] = True
            pixels = []
            min_x, max_x = x, x
            min_y, max_y = y, y

            while queue:
                cx, cy = queue.popleft()
                cidx = cy * w + cx
                pixels.append((cx, cy))
                min_x, max_x = min(min_x, cx), max(max_x, cx)
                min_y, max_y = min(min_y, cy), max(max_y, cy)

                for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        nidx = ny * w + nx
                        if mask[nidx] == 1 and not visited[nidx]:
                            visited[nidx] = True
                            queue.append((nx, ny))

            if len(pixels) > MIN_COMPONENT_PIXELS:
                components.append({
                    "bbox": (min_x, min_y, max_x + 1, max_y + 1),
                    "pixels": len(pixels),
                    "center_x": (min_x + max_x) / 2,
                    "center_y": (min_y + max_y) / 2,
                })

    return components


def select_best_component(components: list[dict], band_width: int) -> dict | None:
    """Select the best character blob in a band."""
    if not components:
        return None
    if len(components) == 1:
        return components[0]

    center_x = band_width / 2
    scored = []
    for c in components:
        size_score = min(c["pixels"], 50000) / 50000
        pos_score = 1 - abs(c["center_x"] - center_x) / (band_width / 2)
        score = size_score * 0.6 + pos_score * 0.4
        scored.append((score, c))

    scored.sort(key=lambda x: -x[0])
    return scored[0][1]


# ── Extraction and cleanup ──────────────────────────────────────────────────

def remove_white_background(img: Image.Image) -> Image.Image:
    """Convert white background to transparent."""
    rgba = img.convert("RGBA")
    pix = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if r > WHITE_THRESHOLD and g > WHITE_THRESHOLD and b > WHITE_THRESHOLD:
                whiteness = min(r, g, b)
                if whiteness > 252:
                    pix[x, y] = (r, g, b, 0)
                elif whiteness > 248:
                    pix[x, y] = (r, g, b, max(0, int(a - (252 - whiteness) * 4)))
    return rgba


def remove_shadows(img: Image.Image, shadow_ratio: float = 0.72) -> Image.Image:
    """Remove low-saturation ground shadows from the bottom area."""
    pix = img.load()
    w, h = img.size
    shadow_top = int(h * shadow_ratio)
    for y in range(shadow_top, h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a > 0:
                mx = max(r, g, b)
                mn = min(r, g, b)
                sat = (mx - mn) / mx if mx > 0 else 0
                if sat < 0.25 and 80 < mx < 245 and mn > 60:
                    pix[x, y] = (r, g, b, 0)
    return img


def clean_cell(img: Image.Image) -> Image.Image:
    """Remove background and shadow, then center content into 256x256."""
    rgba = remove_white_background(img)
    rgba = remove_shadows(rgba)

    bbox = rgba.getbbox()
    if not bbox:
        return Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))

    left, top, right, bottom = bbox
    pad = 12
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(rgba.size[0], right + pad)
    bottom = min(rgba.size[1], bottom + pad)

    cropped = rgba.crop((left, top, right, bottom))
    cw, ch = cropped.size

    max_fit = 240
    scale = min(max_fit / cw, max_fit / ch) if cw > 0 and ch > 0 else 1.0
    new_w = max(int(cw * scale), 32)
    new_h = max(int(ch * scale), 32)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    x_off = (FRAME_SIZE - new_w) // 2
    y_off = (FRAME_SIZE - new_h) // 2
    canvas.paste(resized, (x_off, y_off), resized)
    return canvas


# ── Public normalize ───────────────────────────────────────────────────────

def normalize(img: Image.Image) -> Image.Image | None:
    """Normalize an irregular sprite sheet to a canonical 256x1024 sheet."""
    w, h = img.size
    mask, w, h = build_mask(img)

    # Detect horizontal bands (rows)
    bands = split_into_bands(mask, w, h, bands=4)

    frames = []
    for y1, y2 in bands:
        components = find_components_in_band(img, y1, y2)
        best = select_best_component(components, w)

        if best is None:
            # Fallback: use the whole band
            band_img = img.crop((0, y1, w, y2))
            frame = clean_cell(band_img)
        else:
            x1, y1c, x2, y2c = best["bbox"]
            cell_img = img.crop((x1, y1 + y1c, x2, y1 + y2c))
            frame = clean_cell(cell_img)

        frames.append(frame)

    while len(frames) < 4:
        frames.append(frames[-1] if frames else Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0)))

    sheet = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    for fi, frame in enumerate(frames[:4]):
        sheet.paste(frame, (0, fi * FRAME_SIZE), frame)

    return sheet


# ── Batch processing ─────────────────────────────────────────────────────────

def needs_normalization(filepath: str) -> bool:
    """Return True if the file is not yet a clean 1x4 vertical sheet."""
    img = Image.open(filepath)
    if img.size != TARGET_SIZE:
        return True

    w, h = img.size
    mask, w, h = build_mask(img)
    bands = split_into_bands(mask, w, h, bands=4)
    for y1, y2 in bands:
        components = find_components_in_band(img, y1, y2)
        if len(components) > 1:
            return True
    return False


def process_file(filepath: str, check_only: bool = False) -> bool:
    """Process one sprite sheet. Returns True if OK or successfully normalized."""
    rel = os.path.relpath(filepath, str(MASTER_DIR))

    if not needs_normalization(filepath):
        print(f"  OK  {rel}: already 1x4 vertical")
        return True

    if check_only:
        print(f"  FIX {rel}: needs normalization")
        return False

    # Backup before modification
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_name = rel.replace(os.sep, "_")
    backup_path = BACKUP_DIR / backup_name
    if not backup_path.exists():
        shutil.copy2(filepath, str(backup_path))

    try:
        img = Image.open(filepath)
        sheet = normalize(img)
        if sheet is None:
            print(f"  ERR {rel}: normalization failed")
            return False
        sheet.save(filepath, "PNG")
        size_kb = os.path.getsize(filepath) // 1024
        print(f"  OK  {rel}: normalized to 256x1024 ({size_kb}KB)")
        return True
    except Exception as e:
        print(f"  ERR {rel}: {e}")
        return False


def process_all(check_only: bool = False) -> tuple[int, int]:
    """Process all character files in the master directory."""
    pattern = str(MASTER_DIR / "*" / "*.png")
    files = sorted(glob.glob(pattern))
    print(f"Found {len(files)} character files in {MASTER_DIR}\n")

    ok = 0
    fail = 0
    for f in files:
        if process_file(f, check_only):
            ok += 1
        else:
            fail += 1

    print(f"\nDone: {ok} OK, {fail} need attention / {len(files)} total")
    return ok, fail


def main():
    parser = argparse.ArgumentParser(description="Normalize character sprite sheets to 1x4 vertical layout")
    parser.add_argument("--resource", help="Specific resource name, e.g. archer_attack")
    parser.add_argument("--all", action="store_true", help="Process all character files")
    parser.add_argument("--check-only", action="store_true", help="Only check, do not modify")
    args = parser.parse_args()

    if args.resource:
        files = glob.glob(str(MASTER_DIR / "*" / f"{args.resource}.png"))
        if not files:
            print(f"No files found for resource '{args.resource}'")
        for f in files:
            process_file(f, args.check_only)
    elif args.all:
        process_all(args.check_only)
    else:
        print("Usage: python tools/normalize_character_sprite_sheet_v3.py --resource archer_attack")
        print("       python tools/normalize_character_sprite_sheet_v3.py --all")
        print("       python tools/normalize_character_sprite_sheet_v3.py --check-only")


if __name__ == "__main__":
    main()
