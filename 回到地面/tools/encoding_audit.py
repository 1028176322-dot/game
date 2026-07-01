#!/usr/bin/env python3
"""
UTF-8 and mojibake audit for project source, config, docs, and memory files.

Keep this script ASCII-only. Mojibake tokens are built from Unicode codepoints
so the script does not contain the suspicious characters it detects.
"""

from __future__ import annotations

import argparse
import csv
import sys
from dataclasses import dataclass
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GAME_ROOT = PROJECT_ROOT.parent
MEMORY_ROOT = GAME_ROOT / ".workbuddy" / "memory"

SCAN_ROOTS = [
    PROJECT_ROOT / "assets" / "scripts",
    PROJECT_ROOT / "assets" / "resources" / "config",
    PROJECT_ROOT / "tools",
    PROJECT_ROOT / "docs",
    PROJECT_ROOT / "art_source",
    MEMORY_ROOT,
]

EXTS = {".ts", ".json", ".md", ".csv", ".py"}
EXCLUDE_NAMES = {"encoding_audit_report.csv"}

MOJIBAKE_CODEPOINTS = [
    0xFFFD,  # replacement character
    0x951B, 0x935A, 0x9354, 0x95B0, 0x7EFE, 0x7459, 0x74A7,
    0x6D93, 0x6D60, 0x59DD, 0x9422, 0x93C4, 0x7039, 0x5158,
    0x546F, 0x608A, 0x621E, 0x9225, 0x9286, 0x951F, 0x95BF,
    0x95B8, 0x95C1, 0x5A11, 0x5A34, 0x6FEE, 0x95BB, 0x95BA,
    0x940E, 0x93B4, 0x934F, 0x935B, 0x93AE,
]
MOJIBAKE_TOKENS = [chr(cp) for cp in MOJIBAKE_CODEPOINTS]

CODELIKE_COMMENT_PREFIXES = (
    "const ",
    "let ",
    "var ",
    "return ",
    "if ",
    "if(",
    "for ",
    "for(",
    "while ",
    "while(",
    "switch ",
    "switch(",
    "class ",
    "function ",
    "this.",
)


@dataclass
class Issue:
    severity: str
    file: str
    line: int
    issue: str
    detail: str


def rel_path(path: Path) -> str:
    try:
        return path.relative_to(PROJECT_ROOT).as_posix()
    except ValueError:
        try:
            return path.relative_to(GAME_ROOT).as_posix()
        except ValueError:
            return path.as_posix()


def severity(path_text: str, issue: str) -> str:
    if path_text.startswith("assets/scripts") or path_text.startswith("assets/resources/config"):
        return "P0"
    if path_text.startswith(".workbuddy/memory") or path_text.startswith("tools"):
        return "P1"
    if issue in {"decode_error", "replacement_character", "comment_may_swallow_code"}:
        return "P1"
    return "P2"


def iter_files() -> list[Path]:
    files: list[Path] = []
    for root in SCAN_ROOTS:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in EXTS:
                continue
            if path.name in EXCLUDE_NAMES:
                continue
            files.append(path)
    return sorted(set(files))


def is_code_like_comment(stripped: str) -> bool:
    if not stripped.startswith("//"):
        return False
    body = stripped[2:].strip()
    return body.startswith(CODELIKE_COMMENT_PREFIXES)


def scan_file(path: Path) -> list[Issue]:
    path_text = rel_path(path)
    issues: list[Issue] = []

    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as err:
        return [Issue(severity(path_text, "decode_error"), path_text, 1, "decode_error", str(err))]

    ext = path.suffix.lower()
    for line_no, line in enumerate(text.splitlines(), start=1):
        for token in MOJIBAKE_TOKENS:
            if token in line:
                issue = "replacement_character" if token == chr(0xFFFD) else "mojibake_token"
                issues.append(Issue(severity(path_text, issue), path_text, line_no, issue, f"U+{ord(token):04X}"))
                break

        stripped = line.strip()
        if ext in {".ts", ".js", ".json", ".md"} and is_code_like_comment(stripped):
            issues.append(
                Issue(
                    severity(path_text, "comment_may_swallow_code"),
                    path_text,
                    line_no,
                    "comment_may_swallow_code",
                    stripped[:200],
                )
            )

    if ext == ".ts":
        unclosed_line = find_unclosed_block_comment_line(text)
        if unclosed_line:
            issues.append(
                Issue(
                    severity(path_text, "unclosed_block_comment"),
                    path_text,
                    unclosed_line,
                    "unclosed_block_comment",
                    "unclosed block comment",
                )
            )

    return issues


def find_unclosed_block_comment_line(text: str) -> int | None:
    in_block = False
    block_start_line = 0
    in_string: str | None = None
    escaped = False
    line_no = 1
    i = 0

    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""

        if ch == "\n":
            line_no += 1
            if in_string not in {'"', "'", "`"}:
                in_string = None
            escaped = False
            i += 1
            continue

        if in_block:
            if ch == "*" and nxt == "/":
                in_block = False
                i += 2
                continue
            i += 1
            continue

        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == in_string:
                in_string = None
            i += 1
            continue

        if ch in {'"', "'", "`"}:
            in_string = ch
            i += 1
            continue

        if ch == "/" and nxt == "/":
            while i < len(text) and text[i] != "\n":
                i += 1
            continue

        if ch == "/" and nxt == "*":
            in_block = True
            block_start_line = line_no
            i += 2
            continue

        i += 1

    return block_start_line if in_block else None


def write_report(issues: list[Issue]) -> Path:
    out = PROJECT_ROOT / "art_source" / "encoding_audit_report.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["severity", "file", "line", "issue", "detail"])
        writer.writeheader()
        for issue in issues:
            writer.writerow(issue.__dict__)
    return out


def print_summary(total_files: int, issues: list[Issue], report: Path) -> None:
    counts = {"P0": 0, "P1": 0, "P2": 0}
    by_type: dict[str, int] = {}
    for issue in issues:
        counts[issue.severity] = counts.get(issue.severity, 0) + 1
        by_type[issue.issue] = by_type.get(issue.issue, 0) + 1

    print(f"[encoding-audit] scanned_files={total_files}")
    print(f"[encoding-audit] issues={len(issues)}")
    print(f"[encoding-audit] p0={counts.get('P0', 0)} p1={counts.get('P1', 0)} p2={counts.get('P2', 0)}")
    print(f"[encoding-audit] report={report}")
    if by_type:
        print("[encoding-audit] issue_types:")
        for name, count in sorted(by_type.items(), key=lambda item: (-item[1], item[0])):
            print(f"  {name}: {count}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser()
    parser.add_argument("--ci", action="store_true", help="Return non-zero when P0/P1 issues exist.")
    args = parser.parse_args()

    files = iter_files()
    issues: list[Issue] = []
    for path in files:
        issues.extend(scan_file(path))

    report = write_report(issues)
    print_summary(len(files), issues, report)

    if args.ci and any(issue.severity in {"P0", "P1"} for issue in issues):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
