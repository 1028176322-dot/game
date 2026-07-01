#!/usr/bin/env python3
"""
check_ts_static.py - Lightweight TypeScript static analysis for common errors.

Checks:
1. Unbalanced braces { } per file
2. 'Node' type usage in function signatures without importing Node from 'cc'
3. 'resources.load' usage without importing resources from 'cc'
4. 'JsonAsset' type usage without importing JsonAsset from 'cc'

Exit code 0 = pass, 1 = issues found
"""

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "assets" / "scripts"


def check_balanced_braces() -> list:
    """Check for unbalanced { } in .ts files"""
    issues = []
    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        if "node_modules" in str(ts_file):
            continue
        text = ts_file.read_text(encoding="utf-8", errors="replace")
        opens = text.count("{")
        closes = text.count("}")
        if opens != closes:
            rel = ts_file.relative_to(PROJECT_ROOT)
            issues.append(f"  {rel}: {opens} '{{' vs {closes} '}}' (unbalanced)")
    return issues


def check_missing_imports() -> list:
    """Check for type usage without corresponding import from 'cc'"""
    checks = [
        (r":\s*Node\b", "Node", "Node"),
        (r"resources\.load\b", "resources", "resources"),
        (r":\s*JsonAsset\b", "JsonAsset", "JsonAsset"),
        (r":\s*Texture2D\b", "Texture2D", "Texture2D"),
        (r":\s*SpriteFrame\b", "SpriteFrame", "SpriteFrame"),
    ]

    issues = []
    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        if "node_modules" in str(ts_file):
            continue
        rel = ts_file.relative_to(PROJECT_ROOT)
        text = ts_file.read_text(encoding="utf-8", errors="replace")

        for pattern, type_name, import_name in checks:
            # Skip if type is already imported
            if f"import {{" in text and import_name in text.split("import {")[1].split("}")[0] if "import {" in text else False:
                continue
            # Allow full qualified access: cc.Node, cc.JsonAsset etc
            if f"cc.{type_name}" in text:
                continue

            if re.search(pattern, text):
                # Verify it's actually used, not just in a comment
                for lineno, line in enumerate(text.splitlines(), 1):
                    if re.search(pattern, line) and not line.strip().startswith(("//", "*")):
                        issues.append(f"  {rel}:{lineno}  uses '{type_name}' but '{import_name}' not imported from 'cc'")
                        break

    return issues


def main():
    brace_issues = check_balanced_braces()
    import_issues = check_missing_imports()

    print("=" * 50)
    print("  [TS Static] Lightweight TypeScript Check")
    print("=" * 50)

    failed = 0

    if brace_issues:
        print("\n[FAIL] Unbalanced braces:")
        for i in brace_issues:
            print(f"  {i}")
        failed += 1
    else:
        print("\n[OK] All .ts files have balanced braces")

    if import_issues:
        print(f"\n[FAIL] Missing imports ({len(import_issues)}):")
        for i in import_issues:
            print(f"  {i}")
        failed += 1
    else:
        print("\n[OK] All TypeScript imports detected")

    if failed:
        print(f"\n  [FAIL] {failed} check(s) failed")
        return 1
    else:
        print("\n  [OK] All static checks passed")
        return 0


if __name__ == "__main__":
    sys.exit(main())
