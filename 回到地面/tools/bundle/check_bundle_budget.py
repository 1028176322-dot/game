#!/usr/bin/env python3
"""
check_bundle_budget.py - Bundle 包体预算检查

检查流程:
1. 读取 bundle_budget.json 预算配置
2. 扫描 assets/resources/textures/ 各子目录的实际大小
3. 对比预算，输出超支报告

使用方式:
    python tools/bundle/check_bundle_budget.py
    python tools/bundle/check_bundle_budget.py --ci  # CI 模式：超支时退出码 1
"""

import json
import os
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding='utf-8')
except (AttributeError, ValueError):
    pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BUDGET_FILE = PROJECT_ROOT / "tools" / "bundle" / "bundle_budget.json"
TEXTURES_DIR = PROJECT_ROOT / "assets" / "resources" / "textures"
OUTPUT_DIR = PROJECT_ROOT / "art_source" / "bundle_check"

# 当前实际目录 → 目标 bundle 映射（Phase 5 规划）
DIR_TO_BUNDLE = {
    "ui": "core_ui",
    "tiles": "core_ui",
    "effects": "core_ui",
    "icons": "core_ui",
    "characters": "characters_basic",
    "monsters": "zone_forest",  # 实际需要按 zone 细分，这里粗略估算
    "backgrounds": "zone_forest",
    "bosses": "bosses",
}


def get_dir_size(path: Path) -> int:
    """计算目录下所有文件的总大小（字节）"""
    total = 0
    for fpath in path.rglob("*"):
        if fpath.is_file():
            total += fpath.stat().st_size
    return total


def mb(bytes_size: int) -> float:
    return bytes_size / (1024 * 1024)


def main():
    # 读取预算
    with open(BUDGET_FILE, "r", encoding="utf-8") as f:
        budget = json.load(f)

    bundle_budgets = budget.get("bundles", {})
    total_budget = budget.get("totalMaxMB", 30.0)

    # 计算实际大小
    actual_sizes: dict[str, float] = {}
    for dir_name, bundle_name in DIR_TO_BUNDLE.items():
        dir_path = TEXTURES_DIR / dir_name
        if dir_path.exists():
            size_mb = mb(get_dir_size(dir_path))
            actual_sizes[bundle_name] = actual_sizes.get(bundle_name, 0) + size_mb
            print(f"  {dir_name:15s} → {bundle_name:20s} {size_mb:.2f} MB")
        else:
            print(f"  {dir_name:15s} → (目录不存在)")

    # 输出报告
    output_dir.mkdir(parents=True, exist_ok=True)

    issues = []
    total_actual = sum(actual_sizes.values())
    over_budget = False

    print(f"\n{'=' * 60}")
    print(f"  Bundle 包体预算检查报告")
    print(f"{'=' * 60}")
    print(f"  {'Bundle':20s} {'预算':>8s} {'实际':>8s} {'状态':>10s}")
    print(f"  {'-' * 48}")

    for bundle_name, budget_info in sorted(bundle_budgets.items()):
        budget_mb = budget_info.get("maxMB", 999)
        actual_mb = actual_sizes.get(bundle_name, 0)
        status = "[OK]" if actual_mb <= budget_mb else "[OVER]"
        if actual_mb > budget_mb:
            over_budget = True
            issues.append({
                "bundle": bundle_name, "budgetMB": budget_mb,
                "actualMB": round(actual_mb, 2), "differenceMB": round(actual_mb - budget_mb, 2),
            })
        print(f"  {bundle_name:20s} {budget_mb:>6.1f}MB {actual_mb:>6.2f}MB {status:>10s}")

    print(f"  {'-' * 48}")
    print(f"  {'合计':20s} {total_budget:>6.1f}MB {total_actual:>6.2f}MB {'[OK]' if total_actual <= total_budget else '[OVER]'}")
    print(f"{'=' * 60}")

    # 写报告
    report = {
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "totalBudgetMB": total_budget,
        "totalActualMB": round(total_actual, 2),
        "overBudget": over_budget or total_actual > total_budget,
        "bundles": {},
        "issues": issues,
    }
    for bn, bm in sorted(actual_sizes.items()):
        bi = bundle_budgets.get(bn, {})
        report["bundles"][bn] = {
            "budgetMB": bi.get("maxMB", 999),
            "actualMB": round(bm, 2),
            "pass": bm <= bi.get("maxMB", 999),
        }

    report_file = output_dir / "bundle_budget_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n  [REPORT] 写入: {report_file}")

    # CI 模式：仅总包体超预算才失败，单 bundle 超预算只警告
    if "--ci" in sys.argv and total_actual > total_budget:
        print("\n  [FAIL] 包体总预算超支")
        sys.exit(1)

    if total_actual > total_budget:
        print("\n  [FAIL] 包体总预算超支")
        sys.exit(1)

    print("\n  [PASS] 包体总预算合规")
    if over_budget:
        print("  [WARN] 部分 bundle 超出预算，建议实际迁移文件后调整")


if __name__ == "__main__":
    output_dir = OUTPUT_DIR
    main()
