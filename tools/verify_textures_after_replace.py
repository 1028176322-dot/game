"""Verify assets/resources/textures after runtime_replace has been applied.

Run after:
  1. replace_textures_from_runtime_replace.py --apply
  2. Cocos Creator has opened the project and regenerated .png.meta files

Checks:
  - textures PNG path set matches runtime_replace and manifest
  - every copied PNG hash equals runtime_replace source
  - every PNG has .png.meta
  - PNG mode/dimensions/alpha/size budget remain valid
"""

from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

from PIL import Image


BASE = Path(r"E:\game")
PROJECT = BASE / "回到地面"
MANIFEST = PROJECT / "art_source" / "textures_audit_manifest.csv"
SPEC = PROJECT / "art_source" / "runtime_replace_recovery" / "runtime_replace_missing_production_spec.csv"
RUNTIME_REPLACE = PROJECT / "art_source" / "textures_export" / "runtime_replace"
TEXTURES = PROJECT / "assets" / "resources" / "textures"
REPORT_DIR = PROJECT / "art_source" / "textures_after_replace_check"
EFFECTS_HARD_LIMIT_KB = 96
UI_DEFAULT_HARD_FLOOR_KB = 24
UI_SLOT_HARD_FLOOR_KB = 20
UI_PANEL_HARD_FLOOR_KB = 120
TRANSPARENCY_REQUIRED_CATEGORIES = {"effects", "icons", "ui", "monsters", "bosses"}
MIN_TRANSPARENT_RATIO_BY_CATEGORY = {
    "icons": 0.20,
    "ui": 0.02,
    "monsters": 0.08,
    "bosses": 0.05,
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def rel_path(row: dict[str, str]) -> str:
    return row["path"].replace("\\", "/").removeprefix("textures/")


def parse_int(value: str) -> int:
    try:
        return int(float(value or 0))
    except Exception:
        return 0


def parse_float(value: str) -> float:
    try:
        return float(value or 0)
    except Exception:
        return 0.0


def sha1(path: Path) -> str:
    h = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def alpha_opaque(img: Image.Image) -> bool:
    rgba = img.convert("RGBA")
    lo, hi = rgba.getchannel("A").getextrema()
    return lo == 255 and hi == 255


def transparent_ratio(img: Image.Image) -> float:
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A")
    total = img.size[0] * img.size[1]
    transparent = sum(1 for value in alpha.getdata() if value == 0)
    return transparent / total if total else 0.0


def requires_transparency(category: str) -> bool:
    return category in TRANSPARENCY_REQUIRED_CATEGORIES


def min_transparent_ratio(category: str) -> float:
    return MIN_TRANSPARENT_RATIO_BY_CATEGORY.get(category, 0.0)


def size_hard_limit_kb(spec: dict[str, str], rel: str) -> float:
    category = str(spec.get("category", ""))
    budget = parse_float(str(spec.get("target_size_kb", "")))
    if category == "effects":
        return EFFECTS_HARD_LIMIT_KB
    if category == "ui":
        path = rel.replace("\\", "/").lower()
        tw = parse_int(str(spec.get("target_w", "")))
        th = parse_int(str(spec.get("target_h", "")))
        hard = budget * 4 if budget else 0
        if any(key in path for key in ("slot", "rarity_", "btn_", "button")):
            hard = max(hard, UI_SLOT_HARD_FLOOR_KB)
        if any(key in path for key in ("panel", "_bg", "body_frame", "death_bg", "shop_bg", "main_bg")) or (tw * th >= 50000):
            hard = max(hard, UI_PANEL_HARD_FLOOR_KB)
        return max(hard, UI_DEFAULT_HARD_FLOOR_KB)
    return budget * 2 if budget else 0


def expected_specs() -> dict[str, dict[str, str]]:
    rows = read_csv(MANIFEST)
    specs = {}
    for row in rows:
        rel = rel_path(row)
        specs[rel] = {
            "category": row.get("category", ""),
            "target_w": row.get("target_w") or row.get("frame_w") or row.get("width") or "",
            "target_h": row.get("target_h") or row.get("frame_h") or row.get("height") or "",
            "has_alpha": row.get("has_alpha", ""),
            "target_size_kb": row.get("target_size_kb", ""),
        }
    if SPEC.exists():
        for row in read_csv(SPEC):
            rel = row["path"].replace("\\", "/").removeprefix("textures/")
            specs.setdefault(rel, {})
            specs[rel].update({
                "category": row.get("category", specs[rel].get("category", "")),
                "target_w": row.get("final_target_w") or specs[rel].get("target_w", ""),
                "target_h": row.get("final_target_h") or specs[rel].get("target_h", ""),
                "has_alpha": row.get("has_alpha", specs[rel].get("has_alpha", "")),
                "target_size_kb": row.get("target_size_kb", specs[rel].get("target_size_kb", "")),
            })
    return specs


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    specs = expected_specs()
    expected = set(specs)
    runtime = {p.relative_to(RUNTIME_REPLACE).as_posix(): p for p in RUNTIME_REPLACE.rglob("*.png")}
    textures = {p.relative_to(TEXTURES).as_posix(): p for p in TEXTURES.rglob("*.png")}

    issues: list[dict[str, object]] = []
    details: list[dict[str, object]] = []

    for rel in sorted(expected | set(runtime) | set(textures)):
        spec = specs.get(rel, {})
        tex = textures.get(rel)
        run = runtime.get(rel)
        row: dict[str, object] = {
            "path": rel,
            "category": spec.get("category", ""),
            "exists_in_textures": str(tex is not None).lower(),
            "exists_in_runtime": str(run is not None).lower(),
            "hash_equal_runtime": "",
            "meta_exists": "",
            "width": "",
            "height": "",
            "mode": "",
            "size_kb": "",
            "issues": "",
        }
        row_issues: list[str] = []

        if rel not in expected:
            row_issues.append("not_in_manifest")
        if run is None:
            row_issues.append("missing_in_runtime_replace")
        if tex is None:
            row_issues.append("missing_in_textures")
        else:
            meta = Path(str(tex) + ".meta")
            row["meta_exists"] = str(meta.exists()).lower()
            if not meta.exists():
                row_issues.append("missing_png_meta")

            if run is not None:
                equal = sha1(tex) == sha1(run)
                row["hash_equal_runtime"] = str(equal).lower()
                if not equal:
                    row_issues.append("hash_mismatch_runtime_replace")

            try:
                img = Image.open(tex)
                row["width"], row["height"], row["mode"] = img.width, img.height, img.mode
                row["size_kb"] = round(tex.stat().st_size / 1024, 2)
                ew = parse_int(str(spec.get("target_w", "")))
                eh = parse_int(str(spec.get("target_h", "")))
                if ew and eh and img.size != (ew, eh):
                    row_issues.append(f"dimension_mismatch:{img.width}x{img.height}!={ew}x{eh}")
                if img.mode == "P":
                    row_issues.append("png_mode_P")
                category = str(spec.get("category", ""))
                ratio = transparent_ratio(img)
                if requires_transparency(category) and alpha_opaque(img):
                    row_issues.append("alpha_opaque")
                minimum_ratio = min_transparent_ratio(category)
                if minimum_ratio and ratio < minimum_ratio:
                    row_issues.append(f"{category}_low_transparent_ratio:{ratio:.1%}<{minimum_ratio:.0%}")
                size_kb = tex.stat().st_size / 1024
                hard_limit = size_hard_limit_kb(spec, rel)
                if hard_limit and size_kb > hard_limit:
                    row_issues.append(f"size_over_hard_limit:{round(size_kb, 2)}>{hard_limit}")
                img.close()
            except Exception as exc:
                row_issues.append(f"png_read_error:{type(exc).__name__}:{exc}")

        row["issues"] = ";".join(row_issues)
        details.append(row)
        for issue in row_issues:
            issues.append({"path": rel, "issue": issue})

    fields = [
        "path", "category", "exists_in_textures", "exists_in_runtime", "hash_equal_runtime",
        "meta_exists", "width", "height", "mode", "size_kb", "issues",
    ]
    write_csv(REPORT_DIR / "textures_after_replace_detail.csv", details, fields)
    write_csv(REPORT_DIR / "textures_after_replace_issues.csv", issues, ["path", "issue"])

    summary = {
        "expected": len(expected),
        "runtime_png": len(runtime),
        "textures_png": len(textures),
        "issue_count": len(issues),
        "issue_types": Counter(issue["issue"].split(":", 1)[0] for issue in issues),
    }
    (REPORT_DIR / "textures_after_replace_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("=" * 64)
    print("textures after replace verification")
    print("=" * 64)
    print(f"expected:     {summary['expected']}")
    print(f"runtime_png:  {summary['runtime_png']}")
    print(f"textures_png: {summary['textures_png']}")
    print(f"issues:       {summary['issue_count']}")
    print(f"report_dir:   {REPORT_DIR}")

    if issues:
        print("[FAIL] textures replacement is not fully correct.")
        return 1
    print("[PASS] textures replacement matches runtime_replace and technical resource checks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
