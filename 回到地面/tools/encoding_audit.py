#!/usr/bin/env python3
"""
encoding_audit.py — 源码编码质量审计

功能:
1. 扫描源码/配置/文档文件，检查是否 UTF-8 可解码
2. 检查乱码特征词（UTF-8 被当 GBK 解码后的文字）
3. 检查注释吞代码风险（// 注释中的大括号、未闭合 /*）
4. 检查字符串中的乱码（可能影响运行时显示）
5. 输出 CSV 报告
6. CI 模式下遇 P0/P1 直接失败

使用方式:
    python tools/encoding_audit.py              # 扫描生成报告
    python tools/encoding_audit.py --ci          # CI 模式，P0/P1 时返回码 1
    python tools/encoding_audit.py --fix-comments # 尝试修复注释类乱码
"""

import sys
import re
import csv
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

SCAN_DIRS = [
    "assets/scripts",
    "assets/resources/config",
    "tools",
    "docs",
    "art_source",
]

EXTS = {".ts", ".json", ".md", ".csv", ".py"}

# 跳过自身输出文件和自身源码（模式定义中的乱码词是故意的）
EXCLUDE_PATTERNS = [
    "encoding_audit_report.csv",
    "tools/encoding_audit.py",
]

# ---------- 乱码特征词 ----------
# UTF-8 中文常见字被按 GBK/ANSI 解码后的字形碎片
MOJIBAKE_PATTERNS = [
    "锛", "鍚", "鍔", "閰", "绾", "瑙", "璧", "涓",
    "浠", "姝", "鐢", "鏄", "瀹", "兘", "呯", "悊",
    "戞", "€?", "�",
]

# ---------- 风险模式 ----------
RISK_PATTERNS = [
    # 单行注释中 } 出现在行尾，且行内无 { 配对，可能吞掉代码
    # 不匹配 {varName} 这类文档用法
    ("comment_may_swallow_brace", re.compile(r"//[^\n{]*\}\s*$", re.MULTILINE)),
    # 未闭合的多行注释
    ("unclosed_block_comment", re.compile(r"/\*[^*]*(?:\*(?!/)[^*]*)*$", re.DOTALL)),
    # 字符串内出现乱码关键词（影响运行时显示）
    ("mojibake_in_string", re.compile(r"""['"`][^'"`]*(锛|鍚|鍔|閰|涓|�)[^'"`]*['"`]""")),
]


def severity(rel_path: str, issue: str) -> str:
    """根据文件路径和问题类型判定严重级别。"""
    if rel_path.startswith("assets/scripts"):
        if issue in {"decode_error", "mojibake_in_string", "comment_may_swallow_brace", "unclosed_block_comment"}:
            return "P0"
        return "P0"
    if rel_path.startswith("assets/resources/config"):
        if issue == "decode_error":
            return "P0"
        return "P0"
    if rel_path.startswith("tools"):
        return "P1"
    return "P2"


def scan_file(path: Path) -> list:
    """扫描单个文件，返回 [(issue_type, detail, line_number), ...]"""
    issues = []
    rel = path.relative_to(PROJECT_ROOT).as_posix()
    ext = path.suffix.lower()

    # --- 检查 1: 是否 UTF-8 可解码 ---
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as e:
        issues.append(("decode_error", str(e), 1))
        return issues

    lines = text.splitlines()

    # --- 检查 2: 逐行检查乱码特征词 ---
    for i, line in enumerate(lines, start=1):
        for token in MOJIBAKE_PATTERNS:
            if token in line:
                issues.append(("mojibake_token", token, i))
                break  # 一行只报一次

    # --- 检查 3: 风险模式匹配（按扩展名筛选） ---
    for name, pattern in RISK_PATTERNS:
        # unclosed_block_comment 只对 .ts 有意义（Python 用 # 注释）
        if name == "unclosed_block_comment" and ext != ".ts":
            continue
        # 注释吞代码风险：// 在 .py 里是整除运算符，只对 .ts/.json 检测
        if name == "comment_may_swallow_brace" and ext not in (".ts", ".json"):
            continue
        # mojibake_in_string 对 .ts/.py/.json/.md 有运行时影响
        if name == "mojibake_in_string" and ext not in (".ts", ".py", ".json", ".md"):
            continue
        for m in pattern.finditer(text):
            lineno = text[:m.start()].count("\n") + 1
            snippet = m.group(0)[:200].replace("\n", "\\n")
            issues.append((name, snippet, lineno))

    return issues


def fix_file_comments(path: Path) -> bool:
    """尝试修复注释类乱码问题。
    
    当前策略：
    - 将乱码注释标记替换为 `// [encoding-fixed]` 注释。
    - 不对运行时字符串进行自动修复（需要人工核对 text.json）。
    返回 True 表示文件已被修改。
    """
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return False

    original = text
    lines = text.splitlines(keepends=True)

    for i, line in enumerate(lines):
        stripped = line.strip()
        # 只处理纯注释行（// 开头且包含乱码）
        if stripped.startswith("//") and any(t in stripped for t in MOJIBAKE_PATTERNS):
            lines[i] = line.replace(stripped, "// [encoding-fixed]\n")

    new_text = "".join(lines)
    if new_text != original:
        path.write_text(new_text, encoding="utf-8")
        return True
    return False


def save_report(rows: list, output: Path):
    """将结果输出为 CSV。"""
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["severity", "file", "line", "issue", "detail"])
        writer.writeheader()
        writer.writerows(rows)


def print_summary(rows: list):
    """打印摘要。"""
    counts = {"P0": 0, "P1": 0, "P2": 0}
    issue_types = {}
    for r in rows:
        counts[r["severity"]] = counts.get(r["severity"], 0) + 1
        issue_types[r["issue"]] = issue_types.get(r["issue"], 0) + 1

    print(f"\n{'=' * 55}")
    print(f"  审计报告摘要")
    print(f"{'=' * 55}")
    print(f"  总问题数: {len(rows)}")
    print(f"  P0 (严重): {counts.get('P0', 0)}")
    print(f"  P1 (中等): {counts.get('P1', 0)}")
    print(f"  P2 (轻微): {counts.get('P2', 0)}")
    print(f"  ————————————————")
    print(f"  问题类型分布:")
    for itype, cnt in sorted(issue_types.items(), key=lambda x: -x[1]):
        print(f"    {itype}: {cnt}")
    print(f"{'=' * 55}")

    # P0 文件列表
    p0_files = sorted(set(r["file"] for r in rows if r["severity"] == "P0"))
    if p0_files:
        print(f"\n  P0 文件 ({len(p0_files)}):")
        for f in p0_files:
            print(f"    ❌ {f}")
    else:
        print(f"\n  ✅ 无 P0 问题")


def main():
    # 确保用 UTF-8 输出
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    fix_comments = "--fix-comments" in sys.argv
    ci_mode = "--ci" in sys.argv

    if fix_comments:
        print("[encoding-audit] 修复模式: 将乱码注释替换为 [encoding-fixed] 标记\n")

    rows = []
    fixed_files = 0
    total_files = 0

    for scan_dir in SCAN_DIRS:
        base = PROJECT_ROOT / scan_dir
        if not base.exists():
            print(f"[encoding-audit] 目录不存在，跳过: {scan_dir}")
            continue

        for path in sorted(base.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in EXTS:
                continue

            total_files += 1
            rel = path.relative_to(PROJECT_ROOT).as_posix()

            # 跳过已知的假阳性：自身输出报告和自身源码
            if any(excl in rel for excl in EXCLUDE_PATTERNS):
                continue

            issues = scan_file(path)

            if fix_comments and any(i[0] == "mojibake_token" for i in issues):
                # 尝试修复纯注释行
                if path.read_text(encoding="utf-8").strip().startswith("//"):
                    # 纯注释文件或注释行
                    pass
                # 在第二遍统一修复

            for issue_type, detail, line_no in issues:
                rows.append({
                    "severity": severity(rel, issue_type),
                    "file": rel,
                    "line": line_no,
                    "issue": issue_type,
                    "detail": detail,
                })

    # 修复模式：重新扫描文件，尝试修复注释乱码
    if fix_comments:
        for r in rows:
            if r["issue"] == "mojibake_token" and r["severity"] == "P0":
                fpath = PROJECT_ROOT / r["file"]
                if fix_file_comments(fpath):
                    fixed_files += 1
        # 修复后重新扫描
        rows.clear()
        for scan_dir in SCAN_DIRS:
            base = PROJECT_ROOT / scan_dir
            if not base.exists():
                continue
            for path in sorted(base.rglob("*")):
                if not path.is_file() or path.suffix.lower() not in EXTS:
                    continue
                rel = path.relative_to(PROJECT_ROOT).as_posix()
                # 跳过已知假阳性
                if any(excl in rel for excl in EXCLUDE_PATTERNS):
                    continue
                issues = scan_file(path)
                for issue_type, detail, line_no in issues:
                    rows.append({
                        "severity": severity(rel, issue_type),
                        "file": rel,
                        "line": line_no,
                        "issue": issue_type,
                        "detail": detail,
                    })
        print(f"[encoding-audit] 已修复 {fixed_files} 个文件中的乱码注释\n")

    # 输出到 art_source/encoding_audit_report.csv
    out = PROJECT_ROOT / "art_source" / "encoding_audit_report.csv"
    save_report(rows, out)

    print(f"[encoding-audit] 扫描文件数: {total_files}")
    print(f"[encoding-audit] 发现问题数: {len(rows)}")
    print(f"[encoding-audit] 报告已保存: {out}")

    # 按严重级别统计
    p0_count = sum(1 for r in rows if r["severity"] == "P0")
    p1_count = sum(1 for r in rows if r["severity"] == "P1")

    print_summary(rows)

    # 拦截严重问题
    fail = False
    if ci_mode:
        if p0_count > 0:
            print(f"\n[encoding-audit] [CI-FAIL] 存在 {p0_count} 个 P0 问题，CI 阻断！")
            fail = True
        if p1_count > 0:
            print(f"\n[encoding-audit] [CI-FAIL] 存在 {p1_count} 个 P1 问题，CI 阻断！")
            fail = True

    if fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
