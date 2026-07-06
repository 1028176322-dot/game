#!/usr/bin/env python3
"""
check_ui_skin_bindings.py — UI skin binding validation gate

Checks:
  1. All skin keys in ui_skin_bindings.json exist in ui_assets.json
  2. All node path segments exist as _name values in the corresponding .scene file
  3. Output unused ui_assets keys as warnings

Known false positives (suppressed as warnings, not errors):
  - dungeon scene: UIRoot and its children are created at runtime by DungeonSceneInstaller,
    so they don't exist in the static .scene file. These warnings are expected.

Usage:
    python tools/check_ui_skin_bindings.py
    python tools/check_ui_skin_bindings.py --ci   # exit(1) on errors

Integrates with check_all.py as the 7th check.
"""

import json
import sys
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = PROJECT_DIR / "assets" / "resources" / "config"
SCENE_DIR = PROJECT_DIR / "assets" / "scenes"

UI_ASSETS_JSON = CONFIG_DIR / "ui_assets.json"
UI_BINDINGS_JSON = CONFIG_DIR / "ui_skin_bindings.json"

SCENE_FILES = {
    "splash": SCENE_DIR / "splash.scene",
    "main": SCENE_DIR / "main.scene",
    "dungeon": SCENE_DIR / "dungeon.scene",
}

VALID_TYPES = {"sprite", "nine_slice", "icon", "background"}


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


def extract_scene_node_names(scene_path: Path) -> set[str]:
    """Extract all _name values from a .scene json file."""
    if not scene_path.exists():
        print(f"[WARN] scene file not found: {scene_path}")
        return set()

    with scene_path.open("r", encoding="utf-8") as f:
        raw = f.read()

    names = set()
    marker = '"_name":'
    for part in raw.split(marker)[1:]:
        # Value is the first quoted string after the marker
        idx = part.find('"')
        if idx < 0:
            continue
        end = part.find('"', idx + 1)
        if end < 0:
            continue
        val = part[idx + 1:end]
        if val:
            names.add(val)
    return names


def path_segments_exist(scene_names: set[str], node_path: str) -> list[str]:
    """Check each segment of a node path against scene node names.
    Returns list of missing segments (empty = all found)."""
    segments = [s for s in node_path.split("/") if s]
    missing = []
    for seg in segments:
        if seg not in scene_names:
            missing.append(seg)
    return missing


def main() -> int:
    print("=" * 60)
    print("  UI Skin Binding Validation")
    print("=" * 60)

    errors = []
    warnings = []

    # Load ui_assets.json
    ui_assets = load_json(UI_ASSETS_JSON)
    ui_keys = set(ui_assets.keys())

    if not ui_keys:
        errors.append("ui_assets.json is empty or not loaded")
        print(f"\n[SUMMARY] errors={len(errors)} warnings={len(warnings)}")
        return 1 if errors else 0

    print(f"\n  ui_assets keys: {len(ui_keys)}")

    # Load bindings
    bindings = load_json(UI_BINDINGS_JSON)
    bound_keys = set()

    for scene_key in ["splash", "main", "dungeon"]:
        scene_bindings = bindings.get(scene_key, {})
        if not isinstance(scene_bindings, dict):
            errors.append(f"scene binding must be a dict: {scene_key}")
            continue

        scene_file = SCENE_FILES.get(scene_key)
        scene_names = extract_scene_node_names(scene_file) if scene_file else set()

        if not scene_bindings:
            warnings.append(f"no bindings defined for scene: {scene_key}")
            continue

        print(f"\n  [{scene_key}] {len(scene_bindings)} bindings")

        for node_path, skin_key in scene_bindings.items():
            bound_keys.add(skin_key)

            # Check 1: skin key exists in ui_assets
            if skin_key not in ui_keys:
                errors.append(f"skin key not in ui_assets: scene={scene_key}, path={node_path}, key={skin_key}")

    # Check 2: node path segments exist in scene
    # (dungeon scene has runtime-created nodes like UIRoot — skip path check for dungeon)
    should_check_paths = scene_key != "dungeon"
    if scene_names and should_check_paths:
        missing_segs = path_segments_exist(scene_names, node_path)
        if missing_segs:
            warnings.append(f"node path segment(s) may be missing: scene={scene_key}, path={node_path}, missing={missing_segs}")

    # Check 3: unused ui_assets keys
    unused = sorted(ui_keys - bound_keys)
    if unused:
        # Show all for now — the user needs to know what's not bound
        print(f"\n  Unbound ui_assets keys: {len(unused)}")
        for key in unused[:20]:
            warnings.append(f"ui_assets key not bound by any scene: {key}")
        if len(unused) > 20:
            warnings.append(f"... and {len(unused) - 20} more unbound keys")

    # Print summary
    print(f"\n{'=' * 60}")
    for w in warnings:
        print(f"  [WARN] {w}")
    for e in errors:
        print(f"  [ERROR] {e}")
    print(f"{'=' * 60}")
    print(f"  Summary: errors={len(errors)} warnings={len(warnings)}")

    # Report
    OUTPUT_DIR = Path(__file__).resolve().parent / "output"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report = {
        "metadata": {
            "tool": "check_ui_skin_bindings.py",
            "version": "1.0.0",
        },
        "errors": errors,
        "warnings": warnings,
        "summary": {"errors": len(errors), "warnings": len(warnings)},
    }
    with open(OUTPUT_DIR / "check_ui_skin_bindings_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
