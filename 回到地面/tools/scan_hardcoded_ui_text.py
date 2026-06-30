#!/usr/bin/env python3
"""
scan_hardcoded_ui_text.py - 扫描 UI 文件中硬编码的玩家可见文本

检查所有 .string = '...' 赋值中是否包含中文/英文/数字等玩家可见文本。
这些应改为 T('ui.xxx', {...}) 从 text.json 加载。

验收标准：输出为空才算通过。

使用方式：
    python tools/scan_hardcoded_ui_text.py
"""

import re
import sys
import io
from pathlib import Path

# UTF-8 stdout for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "assets" / "scripts"

# 匹配 .string = '...' 或 .string = "..."
PATTERN = re.compile(r'\.string\s*=\s*(["\'])(.*?)(?<!\\)\1', re.DOTALL)

# 应该被 T() 替代的硬编码文本模式（中文、英文词组）
HARDCODED_KEYWORDS = re.compile(
    r'[\u4e00-\u9fff\u3400-\u4dbf]'  # 中文字符
    r'|[a-zA-Z]{2,}',                  # 2+ 英文字母
)

# 忽略的文件
IGNORE_FILES = {"TextManager.ts"}


def has_visible_text(value: str) -> bool:
    """判断字符串是否包含玩家可见文本"""
    value = value.strip()
    if not value:
        return False
    if HARDCODED_KEYWORDS.search(value):
        return True
    return False


def main():
    errors = []
    for ts_path in sorted(SCRIPTS_DIR.rglob("*.ts")):
        if ts_path.name in IGNORE_FILES:
            continue
        text = ts_path.read_text(encoding="utf-8", errors="replace")
        rel = ts_path.relative_to(SCRIPTS_DIR).as_posix()

        for m in PATTERN.finditer(text):
            val = m.group(2).strip()
            if not val:
                continue
            if has_visible_text(val):
                line = text[:m.start()].count("\n") + 1
                excerpt = val.replace("\n", "\\n")[:160]
                errors.append((rel, line, excerpt))

    if errors:
        print(f"找到 {len(errors)} 处硬编码文本：\n")
        for rel, line, val in errors:
            print(f"  {rel}:{line}: \"{val}\"")
        print("\n[FAIL] 请将上述字符串改为 T('ui.xxx', {...})")
        sys.exit(1)
    else:
        print("[PASS] 未发现硬编码玩家可见文本")
        sys.exit(0)


if __name__ == "__main__":
    main()
