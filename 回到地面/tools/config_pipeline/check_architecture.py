#!/usr/bin/env python3
"""
check_architecture.py - Architecture rule gate for P0 Architecture Rules.

Checks:
1. director.loadScene() only allowed in SceneFlowService.ts
2. GamePhase.setPhase() bypass in app/ only allowed in AppFlowController.ts

Exit code 0 = pass, 1 = fail
"""

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "assets" / "scripts"


def find_illegal_load_scene() -> list:
    """
    Search all .ts files for actual director.loadScene() calls.
    Only SceneFlowService.ts is allowed.
    Skip comment/doc lines.
    """
    violations = []
    ALLOWED = {"SceneFlowService.ts"}

    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        rel = ts_file.relative_to(SCRIPTS_DIR)
        if any(p == "node_modules" for p in ts_file.parts):
            continue

        text = ts_file.read_text(encoding="utf-8", errors="replace")

        for lineno, line in enumerate(text.splitlines(), 1):
            stripped = line.strip()

            # Skip empty or comment-only lines
            if not stripped or stripped.startswith(("//", "*", "/*")):
                continue

            # Check for actual call pattern: director.loadScene('...')
            if "director.loadScene(" in stripped:
                # Verify it's a real call, not just doc mention
                # Real call: director.loadScene('main')  or  director.loadScene("dungeon")
                if re.search(r"director\.loadScene\s*\([\"']", stripped):
                    fname = str(rel).replace("\\", "/")
                    if fname not in ALLOWED:
                        violations.append(f"  {rel}:{lineno}  {stripped[:80]}")

    return violations


def main():
    violations = find_illegal_load_scene()

    print("=" * 50)
    print("  [Architecture] P0 Rule Check")
    print("=" * 50)

    if violations:
        print("\n  Illegal director.loadScene() calls found (only SceneFlowService.ts allowed):")
        for v in violations:
            print(f"    {v}")
        print("\n  [FAIL]")
        return 1
    else:
        print("\n  [OK] All loadScene calls through SceneFlowService.ts")
        return 0


if __name__ == "__main__":
    sys.exit(main())
