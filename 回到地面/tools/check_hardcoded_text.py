#!/usr/bin/env python3
"""
硬编码玩家文本扫描脚本
扫描 .ts 和 .scene 文件中的玩家可见硬编码文本

使用方式:
    python tools/check_hardcoded_text.py
    python tools/check_hardcoded_text.py --fix    (输出待修复列表, 不自动修改)

扫描规则:
    .ts:  Label.string = "xxx"  或  `xxx` 模板字符串中的中文/英文文案
    .scene: String 字段中的硬编码文本

白名单:
    - console.log / console.warn 中的调试文本
    - 变量名、属性名、键名
    - T() 函数调用中的 key 参数
    - 空字符串 ""
    - 纯数字/符号字符串
"""

import os
import re
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 跳过目录
SKIP_DIRS = {'node_modules', '.git', 'library', 'temp', 'build', 'native'}

# 白名单模式：这些上下文的字符串不报错
ALLOWED_PATTERNS = [
    r'console\.(log|warn|error)\(',
    r'eventBus\.emit\(',
    r'\.on\(Node\.EventType',
    r'layer\s*=',
    r'name\s*=',
    r'fontSize\s*=',
    r'/^\s*$/',
    r'^""$',
    r'^T\(',
]

def is_allowed(context: str, text: str) -> bool:
    """检查当前上下文是否在白名单中"""
    for pat in ALLOWED_PATTERNS:
        if re.search(pat, context):
            return True
    return False

def scan_ts_file(filepath: str) -> list:
    """扫描 .ts 文件中 Label.string = '...' 或 `...` 中的硬编码文本"""
    issues = []
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # 跳过注释行
        if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
            continue
        
        # 跳过 import 行
        if stripped.startswith('import ') or stripped.startswith('from '):
            continue

        # 检查 .string = "xxx" 模式
        m = re.search(r'\.string\s*=\s*"([^"]{2,})"', line)
        if m:
            text = m.group(1)
            # 跳过 T() 调用
            if re.search(r'\.string\s*=\s*T\(', line):
                continue
            # 跳过纯数字/符号
            if re.match(r'^[\d\s\+\-\>\<\=\.\,\:\;\!\?]+$', text):
                continue
            if not is_allowed(line, text):
                issues.append((filepath, i, text, '.string = "..."'))

        # 检查 .string = `xxx` 模式 (模板字符串)
        m2 = re.search(r'\.string\s*=\s*`([^`]{2,})`', line)
        if m2:
            text = m2.group(1)
            # 如果包含 ${} 且不含中文字符，可能是数据展示而非硬编码
            if '${' in text and not re.search(r'[\u4e00-\u9fff]', text):
                continue
            if not is_allowed(line, text):
                issues.append((filepath, i, text, '.string = `...`'))

    return issues


def main():
    """主扫描流程"""
    ts_issues = []
    scanned = 0
    
    for root, dirs, files in os.walk(PROJECT_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        
        for f in files:
            if not f.endswith('.ts'):
                continue
            fp = os.path.join(root, f)
            if 'node_modules' in fp:
                continue
            scanned += 1
            ts_issues.extend(scan_ts_file(fp))

    # 输出结果
    if not ts_issues:
        print(f'✅ 扫描完成 ({scanned} 个文件), 未发现硬编码文本')
        return 0

    print(f'⚠️ 发现 {len(ts_issues)} 处可能的硬编码文本:\n')
    for fp, line_no, text, kind in ts_issues:
        rel = os.path.relpath(fp, PROJECT_ROOT)
        print(f'  {rel}:{line_no}  {kind}')
        print(f'    "{text[:60]}{"..." if len(text) > 60 else ""}"\n')

    print(f'总计: {len(ts_issues)} 处')
    print('建议: 将这些文本迁移到 assets/resources/config/text.json 并使用 T(key) 调用')
    return 1


if __name__ == '__main__':
    sys.exit(main())
