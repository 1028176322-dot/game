#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validate character part images with semantic checks.

General checks:
  1. Required parts exist for each profession.
  2. Each part is RGBA PNG.
  3. Alpha bbox has >= 12px transparent margin from all edges.
  4. Content is not too small (at least 5% of image area).
  5. Content is not the whole image (at most 90% of image area).
  6. Content center is not severely off-center.

Per-part semantic checks (P4 gate):
  arm_l/r:  aspect ratio >= 1.5 (tall), opaque < 0.40
  leg_l/r:  aspect ratio >= 1.5 (tall), opaque < 0.35
  ear_l/r:  bbox small (max fill < 0.35), opaque < 0.30
  tail:     opaque < 0.35
  bow:      opaque < 0.35
  quiver:   opaque < 0.35
  head:     aspect ratio 0.8-1.2 (square), opaque < 0.40
  cape:     opaque < 0.55
  body:     opaque < 0.45, aspect >= 1.0

Usage:
  python tools/check_character_parts.py
  python tools/check_character_parts.py --character archer
"""

import argparse
import os
from pathlib import Path

from PIL import Image

# ── Configuration ───────────────────────────────────────────────────────────
MASTER_DIR = (
    Path(__file__).resolve().parent.parent
    / "回到地面"
    / "art_source"
    / "textures_review"
    / "master"
    / "characters"
)

REQUIRED_PARTS = ["body", "head", "arm_l", "arm_r", "leg_l", "leg_r", "tail"]
OPTIONAL_PARTS = ["ear_l", "ear_r", "weapon", "bow", "quiver", "cape"]
MIN_MARGIN = 12
MIN_FILL_RATIO = 0.05
MAX_FILL_RATIO = 0.90
MAX_CENTER_OFFSET = 0.25

# Per-part semantic thresholds (P4 gate)
# If opaque_ratio exceeds MAX_OPAQUE, the part likely contains full-body content.
PART_SEMANTIC: dict[str, dict] = {
    "arm_l":  {"max_opaque": 0.40, "min_aspect": 1.5},
    "arm_r":  {"max_opaque": 0.40, "min_aspect": 1.5},
    "leg_l":  {"max_opaque": 0.35, "min_aspect": 1.5},
    "leg_r":  {"max_opaque": 0.35, "min_aspect": 1.5},
    "ear_l":  {"max_opaque": 0.30, "max_fill": 0.35},
    "ear_r":  {"max_opaque": 0.30, "max_fill": 0.35},
    "tail":   {"max_opaque": 0.35},
    "bow":    {"max_opaque": 0.35},
    "quiver": {"max_opaque": 0.35},
    "head":   {"max_opaque": 0.40, "min_aspect": 0.8, "max_aspect": 1.2},
    "cape":   {"max_opaque": 0.55},
    "body":   {"max_opaque": 0.45, "min_aspect": 1.0},
}


def check_part(path: Path) -> list[str]:
    """Run all checks on a single part image. Return list of issue strings."""
    issues = []
    rel = path.relative_to(MASTER_DIR)

    try:
        img = Image.open(str(path))
    except Exception as e:
        issues.append(f"cannot open: {e}")
        return issues

    if img.format != "PNG":
        issues.append(f"not PNG ({img.format})")

    if img.mode != "RGBA":
        issues.append(f"not RGBA ({img.mode})")
        return issues

    w, h = img.size
    if w <= 0 or h <= 0:
        issues.append("invalid dimensions")
        return issues

    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        issues.append("fully transparent")
        return issues

    left, top, right, bottom = bbox
    pad_left = left
    pad_top = top
    pad_right = w - right
    pad_bottom = h - bottom

    if min(pad_left, pad_top, pad_right, pad_bottom) < MIN_MARGIN:
        issues.append(
            f"margin too small: L{pad_left} T{pad_top} R{pad_right} B{pad_bottom}"
        )

    content_area = (right - left) * (bottom - top)
    image_area = w * h
    fill_ratio = content_area / image_area
    if fill_ratio < MIN_FILL_RATIO:
        issues.append(f"content too small: {fill_ratio:.1%}")
    if fill_ratio > MAX_FILL_RATIO:
        issues.append(f"content too large: {fill_ratio:.1%}")

    cx = (left + right) / 2
    cy = (top + bottom) / 2
    dx = abs(cx - w / 2) / w
    dy = abs(cy - h / 2) / h
    if dx > MAX_CENTER_OFFSET or dy > MAX_CENTER_OFFSET:
        issues.append(f"off-center: dx={dx:.2f}, dy={dy:.2f}")

    # ── Per-part semantic checks (P4) ──────────────────────────────────
    part_name = path.stem
    sem = PART_SEMANTIC.get(part_name)
    if sem:
        aspect = (bottom - top) / max(1, right - left)
        if "min_aspect" in sem and aspect < sem["min_aspect"]:
            issues.append(f"SEMANTIC: aspect={aspect:.2f} < min {sem['min_aspect']} (likely not a {part_name})")
        if "max_aspect" in sem and aspect > sem["max_aspect"]:
            issues.append(f"SEMANTIC: aspect={aspect:.2f} > max {sem['max_aspect']} (likely not a {part_name})")

        if "max_fill" in sem and fill_ratio > sem["max_fill"]:
            issues.append(f"SEMANTIC: fill={fill_ratio:.2%} > max {sem['max_fill']:.0%} (bbox too large for {part_name})")

        if "max_opaque" in sem:
            # Compute opaque ratio: alpha > 30 / total pixels
            opaque_pixels = sum(1 for p in alpha.getdata() if p > 30)
            opaque_ratio = opaque_pixels / image_area
            if opaque_ratio > sem["max_opaque"]:
                issues.append(
                    f"SEMANTIC: opaque_ratio={opaque_ratio:.3f} > max {sem['max_opaque']:.2f} "
                    f"(full body/face detected instead of isolated {part_name})"
                )

    return issues


def check_character(character_dir: Path) -> dict[str, list[str]]:
    """Check all parts for one character profession."""
    parts_dir = character_dir / "parts"
    if not parts_dir.exists():
        return {"_missing": ["parts directory not found"]}

    results = {}
    existing = {p.stem: p for p in parts_dir.glob("*.png")}

    for part in REQUIRED_PARTS:
        if part not in existing:
            results[part] = ["required part missing"]
        else:
            results[part] = check_part(existing[part])

    for part in OPTIONAL_PARTS:
        if part in existing:
            results[part] = check_part(existing[part])

    return results


def run_check(character_name: str | None = None) -> bool:
    """Run validation and print report."""
    all_ok = True

    if character_name:
        dirs = [MASTER_DIR / character_name]
    else:
        dirs = sorted(d for d in MASTER_DIR.iterdir() if d.is_dir())

    for character_dir in dirs:
        print(f"\n[{character_dir.name}]")
        results = check_character(character_dir)

        if "_missing" in results:
            print(f"  FAIL: {results['_missing'][0]}")
            all_ok = False
            continue

        for part, issues in sorted(results.items()):
            if not issues:
                print(f"  OK   {part}")
            else:
                all_ok = False
                print(f"  FAIL {part}: {'; '.join(issues)}")

    print("\n" + ("All checks passed." if all_ok else "Some checks failed."))
    return all_ok


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate character part images")
    parser.add_argument("--character", help="Validate a single character (e.g. archer)")
    args = parser.parse_args()

    ok = run_check(args.character)
    raise SystemExit(0 if ok else 1)
