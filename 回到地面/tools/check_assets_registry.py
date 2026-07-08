#!/usr/bin/env python3
"""
check_assets_registry.py — Resource registry integrity gate

Checks assets.json / ui_assets.json / disk file 3-way consistency, plus:
  1. disk_exists_but_not_registered — file on disk but missing from assets.json
  2. registered_but_missing_file — entry in assets.json but file missing on disk
  3. ui_assets_type_invalid — type not in allowed set (sprite/sliced/nine_slice/icon/background)
  4. ui_assets_assetId_missing — assetId referenced by ui_assets.json not in assets.json
  5. binder_key_orphaned — UISkinBinder.assetKey / apply() call referencing unknown key
  6. ui_assets_key_unused — key defined in ui_assets but never referenced by any .ts file
  7. nine_slice_no_border — nine_slice resource lacks nine-patch border config (heuristic)

Usage:
    python tools/check_assets_registry.py
    python tools/check_assets_registry.py --ci        # exit(1) if issues > 0
    python tools/check_assets_registry.py --fix-assets # auto-fix missing asset.json entries

Output:
    tools/output/check_assets_registry_report.json
"""

import json
import os
import re
import sys
from pathlib import Path

# -- Paths --

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = (SCRIPT_DIR / "..").resolve()
TEXTURES_DIR = PROJECT_DIR / "assets" / "resources" / "textures"
ASSETS_JSON = PROJECT_DIR / "assets" / "resources" / "config" / "assets.json"
UI_ASSETS_JSON = PROJECT_DIR / "assets" / "resources" / "config" / "ui_assets.json"
SCRIPTS_DIR = PROJECT_DIR / "assets" / "scripts"
SCENES_DIR = PROJECT_DIR / "assets" / "scenes"
OUTPUT_DIR = SCRIPT_DIR / "output"

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
SKIP_DIRS = {"__MACOSX"}
ALLOWED_UI_TYPES = {"sprite", "sliced", "nine_slice", "icon", "background"}

# -- Scan helpers --

def scan_disk_files(textures_dir: Path) -> dict[str, str]:
    """Scan textures on disk, return {resource_key: file_path}."""
    result = {}
    if not textures_dir.exists():
        print(f"[WARN] textures dir not found: {textures_dir}")
        return result

    for root, dirs, files in os.walk(textures_dir):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for fname in files:
            ext = Path(fname).suffix.lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            full_path = Path(root) / fname
            rel_path = full_path.relative_to(textures_dir.parent)
            key = str(rel_path.with_suffix("")).replace("\\", "/")
            result[key] = str(full_path)

    return result


def read_assets_json(path: Path) -> dict:
    """Read assets.json, return {resource_key: entry}."""
    if not path.exists():
        print(f"[ERROR] assets.json not found: {path}")
        return {}

    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    data = raw.get("data", raw)
    return {k: v for k, v in data.items() if k != "metadata"}


def read_ui_assets_json(path: Path) -> tuple[dict, list]:
    """Read ui_assets.json, return ({semantic_key: full_def}, [issues])."""
    issues = []
    if not path.exists():
        print(f"[WARN] ui_assets.json not found: {path}")
        return {}, issues

    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    data = raw.get("data", raw)
    result = {}
    for k, v in data.items():
        if k == "metadata":
            continue
        if isinstance(v, dict):
            result[k] = v
            # Type validation
            t = v.get("type", "")
            if t not in ALLOWED_UI_TYPES:
                issues.append({
                    "type": "ui_assets_type_invalid",
                    "key": k,
                    "value": t,
                    "allowed": sorted(ALLOWED_UI_TYPES),
                })
    return result, issues


def scan_ts_for_asset_keys(scripts_dir: Path) -> tuple[set, set]:
    """
    Scan all .ts files for UISkinBinder.assetKey references and
    UISkinService.instance.apply() / applyOptional() calls.
    Returns (keys_found_in_code, keys_found_in_binder_assignments).
    """
    apply_keys = set()
    binder_keys = set()

    pattern_apply = re.compile(r"""(?:UISkinService\.instance\.(?:apply|applyOptional))\([^)]*['"]([^'"]+)['"]""")
    pattern_binder = re.compile(r"""assetKey\s*=\s*['"]([^'"]+)['"]""")

    if not scripts_dir.exists():
        return apply_keys, binder_keys

    for fpath in scripts_dir.rglob("*.ts"):
        try:
            text = fpath.read_text("utf-8", errors="replace")
        except Exception:
            continue

        for m in pattern_apply.finditer(text):
            apply_keys.add(m.group(1))

        for m in pattern_binder.finditer(text):
            binder_keys.add(m.group(1))

    return apply_keys, binder_keys


def scan_scenes_for_binder(scenes_dir: Path) -> int:
    """Scan .scene files for UISkinBinder references (editor component)."""
    count = 0
    if not scenes_dir.exists():
        return 0
    for fpath in scenes_dir.rglob("*.scene"):
        try:
            text = fpath.read_text("utf-8", errors="replace")
            if "UISkinBinder" in text or "assetKey" in text:
                count += 1
        except Exception:
            continue
    return count


def check_nine_slice_spriteborders(ui_assets: dict) -> list:
    """
    Warn about nine_slice entries -- we can't easily read .meta files for
    Sprite borders in pure Python, but we flag them for manual review.
    """
    warnings = []
    for key, defn in ui_assets.items():
        if defn.get("type") in {"sliced", "nine_slice"}:
            # Check if the source texture is in the common/panel directory
            aid = defn.get("assetId", "")
            if "panel" in aid or "frame" in aid or "bg" in aid:
                warnings.append({
                    "type": "nine_slice_requires_border",
                    "key": key,
                    "assetId": aid,
                    "note": "Verify Sprite borders (9-slice) are configured in .meta",
                })
    return warnings


# -- Report generation --

def generate_report():
    print("=" * 60)
    print("  UI Resource Registry Integrity Check")
    print("=" * 60)

    total_issues = 0
    all_issues = []

    # 1. Scan disk files
    print("\n[1/5] Scanning disk texture files...")
    disk_files = scan_disk_files(TEXTURES_DIR)
    print(f"      Found {len(disk_files)} files")

    # 2. Read assets.json
    print("\n[2/5] Reading assets.json...")
    assets = read_assets_json(ASSETS_JSON)
    print(f"      {len(assets)} entries")

    # 3. Read ui_assets.json
    print("\n[3/5] Reading ui_assets.json...")
    ui_assets, type_issues = read_ui_assets_json(UI_ASSETS_JSON)
    all_issues.extend(type_issues)
    print(f"      {len(ui_assets)} semantic keys")

    # 4. Scan code for key references
    print("\n[4/5] Scanning .ts files for asset key references...")
    apply_keys, binder_keys = scan_ts_for_asset_keys(SCRIPTS_DIR)
    scene_binder_count = scan_scenes_for_binder(SCENES_DIR)
    all_referenced_keys = apply_keys | binder_keys
    print(f"      apply() calls: {len(apply_keys)}")
    print(f"      UISkinBinder assignments: {len(binder_keys)}")
    print(f"      Scene files with Binder refs: {scene_binder_count}")

    # 5. Execute checks
    print("\n[5/5] Running checks...")

    # Check A: disk vs assets.json consistency
    disk_keys = set(disk_files.keys())
    assets_keys = set(assets.keys())
    registry_check = {
        "disk_exists_but_not_registered": sorted(disk_keys - assets_keys),
        "registered_but_missing_file": sorted(assets_keys - disk_keys),
        "total_disk": len(disk_keys),
        "total_registered": len(assets_keys),
        "total_matched": len(disk_keys & assets_keys),
    }
    total_issues += len(registry_check["disk_exists_but_not_registered"])
    total_issues += len(registry_check["registered_but_missing_file"])

    # Check B: ui_assets assetId cross-reference
    ui_cross_ref_missing = []
    for semantic_key, defn in ui_assets.items():
        aid = defn.get("assetId", "")
        if aid and aid not in assets:
            ui_cross_ref_missing.append({"key": semantic_key, "assetId": aid})
    ui_cross_ref = {
        "ui_assets_total": len(ui_assets),
        "ui_assets_assetId_not_in_assets_json": ui_cross_ref_missing,
    }
    total_issues += len(ui_cross_ref_missing)

    # Check C: orphaned binder keys (referenced in code but not registered)
    # Filter out false positives: empty-string assignments and JSDoc matches
    orphaned_binder_keys = sorted(
        k for k in (all_referenced_keys - set(ui_assets.keys()))
        if k and len(k) > 2 and not k.startswith('*') and '\n' not in k
    )
    binder_key_check = {
        "binder_key_orphaned": orphaned_binder_keys,
        "total_referenced": len(all_referenced_keys),
        "total_matched_in_ui_assets": len(all_referenced_keys & set(ui_assets.keys())),
    }
    total_issues += len(orphaned_binder_keys)

    # Check D: unused ui_assets keys (registered but never referenced by code)
    unused_keys = sorted(set(ui_assets.keys()) - all_referenced_keys)
    unused_key_check = {
        "ui_assets_key_unused": unused_keys,
        "total_unused": len(unused_keys),
    }

    # Check E: nine_slice border warnings
    nine_slice_warnings = check_nine_slice_spriteborders(ui_assets)
    nine_slice_check = {
        "nine_slice_requires_border": nine_slice_warnings,
        "total_nine_slice_entries": len(nine_slice_warnings),
    }

    # Compile report
    report = {
        "metadata": {
            "tool": "check_assets_registry.py",
            "version": "2.0.0",
            "timestamp": __import__("datetime").datetime.now().isoformat(),
        },
        "registry": registry_check,
        "ui_assets_cross_ref": ui_cross_ref,
        "ui_assets_type_issues": type_issues,
        "binder_key_check": binder_key_check,
        "unused_key_check": unused_key_check,
        "nine_slice_check": nine_slice_check,
        "summary": {
            "total_issues": total_issues,
            "type_validation_errors": len(type_issues),
            "orphaned_binder_keys": len(orphaned_binder_keys),
            "unused_ui_asset_keys": len(unused_keys),
            "nine_slice_review_needed": len(nine_slice_warnings),
        },
    }

    # Write report
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report_path = OUTPUT_DIR / "check_assets_registry_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # Print summary
    r = registry_check
    s = report["summary"]
    print(f"\n{'=' * 60}")
    print(f"  Results")
    print(f"{'=' * 60}")
    print(f"  Disk files:               {r['total_disk']}")
    print(f"  assets.json entries:      {r['total_registered']}")
    print(f"  Matched:                  {r['total_matched']}")
    print(f"  Disk not registered:      {len(r['disk_exists_but_not_registered'])}")
    print(f"  Registered file missing:  {len(r['registered_but_missing_file'])}")

    if r["disk_exists_but_not_registered"]:
        for f in r["disk_exists_but_not_registered"][:10]:
            print(f"    - {f}")

    if ui_cross_ref_missing:
        print(f"\n  ui_assets assetId missing from assets.json: {len(ui_cross_ref_missing)}")
        for item in ui_cross_ref_missing[:10]:
            print(f"    {item['key']} -> {item['assetId']}")

    if type_issues:
        print(f"\n  ui_assets type errors: {len(type_issues)}")
        for ti in type_issues:
            print(f"    {ti['key']}: type='{ti['value']}' (allowed: {', '.join(ti['allowed'])})")

    if orphaned_binder_keys:
        print(f"\n  Orphaned binder keys (code but no ui_assets def): {len(orphaned_binder_keys)}")
        for k in orphaned_binder_keys[:10]:
            print(f"    - {k}")

    if unused_keys:
        print(f"\n  Unused ui_assets keys (defined but no code ref): {len(unused_keys)}")
        for k in unused_keys[:15]:
            print(f"    - {k}")
        if len(unused_keys) > 15:
            print(f"    ... and {len(unused_keys) - 15} more")

    if nine_slice_warnings:
        print(f"\n  Nine-slice entries requiring border review: {len(nine_slice_warnings)}")
        for n in nine_slice_warnings[:10]:
            print(f"    {n['key']} -> {n['assetId']}")

    print(f"\n  Summary:")
    print(f"    Issues counted as errors:     {s['total_issues']}")
    print(f"    Type validation errors:        {s['type_validation_errors']}")
    print(f"    Orphaned binder keys:          {s['orphaned_binder_keys']}")
    print(f"    Unused ui_assets keys:         {s['unused_ui_asset_keys']}")
    print(f"    Nine-slice review needed:      {s['nine_slice_review_needed']}")

    print(f"\n  Report: {report_path}")
    print(f"{'=' * 60}")

    return total_issues, report


def fix_missing_assets(report: dict):
    """Auto-fix missing file entries into assets.json."""
    missing = report["registry"].get("disk_exists_but_not_registered", [])
    if not missing:
        print("  Nothing to fix")
        return

    with open(ASSETS_JSON, "r", encoding="utf-8") as f:
        assets_data = json.load(f)

    added = 0
    for key in missing:
        if key.startswith("textures/backgrounds/"):
            entry_type = "Texture2D"
            entry_path = f"{key}/texture"
        else:
            entry_type = "SpriteFrame"
            entry_path = f"{key}/spriteFrame"

        if "data" in assets_data:
            if key not in assets_data["data"]:
                assets_data["data"][key] = {"bundle": "resources", "type": entry_type, "path": entry_path}
                added += 1
        else:
            if key not in assets_data:
                assets_data[key] = {"bundle": "resources", "type": entry_type, "path": entry_path}
                added += 1

    if added > 0:
        if "metadata" in assets_data:
            assets_data["metadata"]["lastUpdated"] = __import__("datetime").datetime.now().strftime("%Y-%m-%d")
        with open(ASSETS_JSON, "w", encoding="utf-8") as f:
            json.dump(assets_data, f, ensure_ascii=False, indent=4)
        print(f"  Fixed {added} entries in {ASSETS_JSON}")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Resource registry integrity gate")
    parser.add_argument("--ci", action="store_true", help="CI mode: exit(1) if issues > 0")
    parser.add_argument("--fix-assets", action="store_true", help="Auto-fix missing assets.json entries")
    args = parser.parse_args()

    total_issues, report = generate_report()

    if args.fix_assets and total_issues > 0:
        fix_missing_assets(report)

    if args.ci and total_issues > 0:
        print(f"\n[CI FAIL] {total_issues} issues found, gate rejected")
        sys.exit(1)

    print(f"\n[PASS] Check complete")


if __name__ == "__main__":
    main()
