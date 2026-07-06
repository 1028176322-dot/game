#!/usr/bin/env python3
"""
check_all.py - 全量验证入口（CI 门禁）

执行顺序:
1. validate_config.py  — 配置 JSON 合法性
2. check_bundle_budget.py — Bundle 包体预算
3. validate_runtime_ready.py — 资源管线就绪状态（即将实现）

使用方式:
    python tools/config_pipeline/check_all.py          # 所有检查
    python tools/config_pipeline/check_all.py --ci     # CI 模式（失败退出码 1）
"""

import sys
import subprocess
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

CHECKS = [
    ("配置校验", ["python", "tools/config_pipeline/validate_config.py"]),
    ("包体预算", ["python", "tools/bundle/check_bundle_budget.py"]),
    ("编码审计", ["python", "tools/encoding_audit.py", "--ci"]),
    ("架构门禁", ["python", "tools/config_pipeline/check_architecture.py"]),
    ("TS静态检查", ["python", "tools/config_pipeline/check_ts_static.py"]),
    ("资源注册", ["python", "tools/check_assets_registry.py", "--ci"]),
    ("UI皮肤绑定", ["python", "tools/check_ui_skin_bindings.py"]),
    ("非UI资源注册", ["python", "tools/check_game_assets_registry.py"]),
]


def run_check(name: str, cmd: list) -> bool:
    print(f"\n{'=' * 50}")
    print(f"  [{name}] 开始验证...")
    print(f"{'=' * 50}")

    result = subprocess.run(cmd, cwd=str(PROJECT_ROOT), capture_output=False)

    if result.returncode == 0:
        print(f"\n  [{name}] [OK]")
        return True
    else:
        print(f"\n  [{name}] [FAIL]")
        return False


def main():
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    failed = 0
    total = len(CHECKS)

    print(f"项目根目录: {PROJECT_ROOT}")
    print(f"共 {total} 项检查\n")

    for name, cmd in CHECKS:
        if not run_check(name, cmd):
            failed += 1

    print(f"\n{'=' * 50}")
    if failed == 0:
        print(f"  全部 {total} 项检查通过 [OK]")
    else:
        print(f"  {failed}/{total} 项检查失败 [FAIL]")

    if failed > 0 or ("--ci" in sys.argv and failed > 0):
        sys.exit(1)


if __name__ == "__main__":
    main()
