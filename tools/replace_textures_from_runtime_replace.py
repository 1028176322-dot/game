"""Safely replace assets/resources/textures from runtime_replace.

Default is dry-run. Use --apply only after:
  1. validate_runtime_replace_ready.py passes
  2. category contact sheets are manually approved
  3. Cocos Creator is closed

Run:
  python E:/game/tools/replace_textures_from_runtime_replace.py
  python E:/game/tools/replace_textures_from_runtime_replace.py --apply
"""

from __future__ import annotations

import argparse
import csv
import shutil
from datetime import datetime
from pathlib import Path


BASE = Path(r"E:\game")
PROJECT = BASE / "回到地面"
MANIFEST = PROJECT / "art_source" / "textures_audit_manifest.csv"
RUNTIME_REPLACE = PROJECT / "art_source" / "textures_export" / "runtime_replace"
TEXTURES = PROJECT / "assets" / "resources" / "textures"
BACKUP_ROOT = PROJECT / "art_source" / "backup"


def manifest_paths() -> set[str]:
    with MANIFEST.open("r", encoding="utf-8-sig", newline="") as f:
        return {
            row["path"].replace("\\", "/").removeprefix("textures/")
            for row in csv.DictReader(f)
        }


def runtime_paths() -> set[str]:
    return {p.relative_to(RUNTIME_REPLACE).as_posix() for p in RUNTIME_REPLACE.rglob("*.png")}


def non_png_files() -> list[str]:
    return [
        p.relative_to(RUNTIME_REPLACE).as_posix()
        for p in RUNTIME_REPLACE.rglob("*")
        if p.is_file() and p.suffix.lower() != ".png"
    ]


def validate_path_set() -> tuple[list[str], list[str], list[str]]:
    expected = manifest_paths()
    actual = runtime_paths()
    missing = sorted(expected - actual)
    extra = sorted(actual - expected)
    non_png = sorted(non_png_files())
    return missing, extra, non_png


def copy_runtime_replace_to_textures() -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = BACKUP_ROOT / f"textures_before_runtime_replace_apply_{stamp}"
    backup.parent.mkdir(parents=True, exist_ok=True)

    if TEXTURES.exists():
        shutil.copytree(TEXTURES, backup)

    if TEXTURES.exists():
        shutil.rmtree(TEXTURES)
    TEXTURES.mkdir(parents=True, exist_ok=True)

    for src in RUNTIME_REPLACE.rglob("*.png"):
        rel = src.relative_to(RUNTIME_REPLACE)
        dst = TEXTURES / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

    return backup


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Actually replace assets/resources/textures.")
    args = parser.parse_args()

    missing, extra, non_png = validate_path_set()

    print("=" * 64)
    print("replace textures from runtime_replace")
    print("=" * 64)
    print(f"project:         {PROJECT}")
    print(f"runtime_replace: {RUNTIME_REPLACE}")
    print(f"textures:        {TEXTURES}")
    print(f"runtime PNG:     {len(runtime_paths())}")
    print(f"missing:         {len(missing)}")
    print(f"extra:           {len(extra)}")
    print(f"non_png:         {len(non_png)}")

    if missing:
        print("[MISSING sample]")
        print("\n".join(missing[:30]))
    if extra:
        print("[EXTRA sample]")
        print("\n".join(extra[:30]))
    if non_png:
        print("[NON-PNG sample]")
        print("\n".join(non_png[:30]))

    if missing or extra or non_png:
        print("[ABORT] runtime_replace path set is not clean.")
        return 1

    if not args.apply:
        print("[DRY-RUN] No files changed. Re-run with --apply after final manual approval.")
        return 0

    backup = copy_runtime_replace_to_textures()
    print("[APPLIED] textures replaced.")
    print(f"backup: {backup}")
    print("Next:")
    print("  1. Open Cocos Creator and wait for .png.meta import.")
    print("  2. Run: python E:\\game\\tools\\verify_textures_after_replace.py")
    print("  3. Run: python E:\\game\\tools\\art_resource_gate.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
