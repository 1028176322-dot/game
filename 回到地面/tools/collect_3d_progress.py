"""
collect_3d_progress.py

扫描 assets/resources/models/ 下所有 .assetmeta.json，聚合 3D 资产进度状态。
与 art_3d_manifest.json 对比，输出缺失/已生成/已验证 报告。

Usage:
    python tools/collect_3d_progress.py
    python tools/collect_3d_progress.py --json        # JSON output for automations
    python tools/collect_3d_progress.py --detail       # Full per-asset detail
    python tools/collect_3d_progress.py --report       # Write to docs/progress/3d_progress.md

Relies on:
    - assets/resources/config/art_3d_manifest.json (176 items expected)
    - assets/resources/models/*/*.assetmeta.json (actual on-disk state)
"""

import json
import os
import sys
import argparse
from datetime import datetime

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 回到地面/
GAME_ROOT = os.path.dirname(PROJECT_ROOT)  # E:/game/
MANIFEST_PATH = os.path.join(GAME_ROOT, "assets", "resources", "config", "art_3d_manifest.json")
MODELS_DIR = os.path.join(GAME_ROOT, "assets", "resources", "models")
REPORT_DIR = os.path.join(PROJECT_ROOT, "docs", "progress")


def load_manifest():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def scan_assetmeta_files(models_dir: str) -> dict:
    """Scan models/ for .assetmeta.json files, return {name: parsed_meta}."""
    result = {}
    if not os.path.isdir(models_dir):
        return result
    for root, dirs, files in os.walk(models_dir):
        for f in files:
            if f.endswith(".assetmeta.json"):
                name = f.replace(".assetmeta.json", "")
                path = os.path.join(root, f)
                try:
                    with open(path, "r", encoding="utf-8") as fh:
                        meta = json.load(fh)
                    result[name] = meta
                except (json.JSONDecodeError, IOError) as e:
                    result[name] = {"name": name, "parse_error": str(e), "lifecycle": "corrupted"}
    return result


def determine_status(meta: dict, default_lifecycle: str = "选秀") -> str:
    """Determine asset status from its metadata."""
    if not meta:
        return "missing"
    if "parse_error" in meta:
        return "corrupted"
    lc = meta.get("lifecycle", default_lifecycle)
    if lc == "已批准":
        return "approved"
    if lc == "评审中":
        return "reviewing"
    if lc == "已弃用":
        return "deprecated"
    if lc == "选秀":
        return "draft"
    return "unknown"


def main():
    parser = argparse.ArgumentParser(description="Collect 3D asset progress from assetmeta files")
    parser.add_argument("--json", action="store_true", help="Output progress as JSON")
    parser.add_argument("--detail", action="store_true", help="Show per-asset detail")
    parser.add_argument("--report", action="store_true", help="Write progress MD to docs/progress/3d_progress.md")
    args = parser.parse_args()

    manifest = load_manifest()
    expected_entries = {e["name"]: e for e in manifest.get("entries", [])}
    on_disk = scan_assetmeta_files(MODELS_DIR)

    progress = {}
    status_counts = {"approved": 0, "reviewing": 0, "draft": 0, "missing": 0, "corrupted": 0, "deprecated": 0, "unknown": 0}

    for name, entry in expected_entries.items():
        meta = on_disk.get(name)
        status = determine_status(meta, entry.get("lifecycle", "选秀"))
        progress[name] = {
            "name": name,
            "category": entry.get("category", "?"),
            "status": status,
            "lifecycle": meta.get("lifecycle", entry.get("lifecycle", "?")) if meta else "N/A",
            "on_disk": name in on_disk,
            "has_assetmeta": name in on_disk,
        }
        if meta and "parse_error" not in meta:
            progress[name]["tri"] = meta.get("tri")
            progress[name]["bones"] = meta.get("bones")
            progress[name]["animClips"] = meta.get("animClips")
            progress[name]["lodLevels"] = meta.get("lodLevels")
            progress[name]["sizeKB"] = meta.get("sizeKB")
        status_counts[status] = status_counts.get(status, 0) + 1

    # Output
    if args.json:
        output = {
            "updated_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
            "total_expected": len(expected_entries),
            "on_disk": sum(1 for p in progress.values() if p["on_disk"]),
            "status_counts": status_counts,
            "assets": list(progress.values()),
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))
        return

    # Text summary
    print(f"=== 3D Asset Progress ({datetime.now().strftime('%Y-%m-%d %H:%M')}) ===")
    print(f"Expected: {len(expected_entries)}")
    print(f"On disk:  {sum(1 for p in progress.values() if p['on_disk'])}")
    print(f"Missing:  {sum(1 for p in progress.values() if not p['on_disk'])}")
    print()

    for status, count in sorted(status_counts.items()):
        pct = count / len(expected_entries) * 100 if expected_entries else 0
        label = {"approved": "已批准", "reviewing": "评审中", "draft": "选秀",
                 "missing": "未生产", "corrupted": "损坏", "deprecated": "已弃用"}.get(status, status)
        print(f"  {label}: {count} ({pct:.1f}%)")

    if args.detail:
        print(f"\n--- Per-Asset Detail ---")
        for name, info in sorted(progress.items()):
            cat = info["category"]
            stat = info["status"]
            tri = info.get("tri", "-")
            bones = info.get("bones", "-")
            clips = info.get("animClips", "-")
            print(f"  {name:40s} | {cat:12s} | {stat:12s} | Tri={tri} | Bone={bones} | Clip={clips}")

    # MD report
    if args.report:
        os.makedirs(REPORT_DIR, exist_ok=True)
        report_path = os.path.join(REPORT_DIR, "3d_progress.md")
        now = datetime.now().strftime("%Y-%m-%d %H:%M")

        lines = [
            "# 3D 资产进度报告",
            "",
            f"> **更新**: {now}",
            f"> **预期总计**: {len(expected_entries)}",
            f"> **已生成(有 assetmeta)**: {sum(1 for p in progress.values() if p['on_disk'])}",
            "",
            "## 状态分布",
            "",
            f"| 状态 | 数量 | 占比 |",
            f"|------|------|------|",
        ]
        for status in ["approved", "reviewing", "draft", "missing", "corrupted", "deprecated", "unknown"]:
            count = status_counts.get(status, 0)
            if count == 0:
                continue
            pct = count / len(expected_entries) * 100
            label = {"approved": "已批准", "reviewing": "评审中", "draft": "选秀",
                     "missing": "未生产", "corrupted": "损坏", "deprecated": "已弃用",
                     "unknown": "未知"}.get(status, status)
            lines.append(f"| {label} | {count} | {pct:.1f}% |")

        lines.extend(["", "## 逐资产状态", "", f"| 名称 | 类别 | 状态 | Tri | Bone | 贴图 | 动画 |", f"|---|---|---|---|---|---|---|"])

        for name in sorted(progress.keys()):
            info = progress[name]
            tri = info.get("tri", "-")
            bones = info.get("bones", "-")
            tex = info.get("sizeKB", "-")
            clips = info.get("animClips", "-")
            lines.append(f"| {name} | {info['category']} | {info['status']} | {tri} | {bones} | {tex} | {clips} |")

        with open(report_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        print(f"\nReport written to: {report_path}")


if __name__ == "__main__":
    main()
