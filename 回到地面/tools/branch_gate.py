# branch_gate.py — CI / PR merge gate for the 2D->3D upgrade (§5.13 + decision F).
#
# Purpose:
#   Enforce that a merge into the stable branch (master / main) is blocked unless the
#   full validation suite AND the unit-test suite pass. This operationalizes:
#     - §5.13 branch gate  ("PR must pass")
#     - §8.3 test gate     (§5.11 unit tests + §5.13 branch gate, PR必过)
#     - decision F          (develop on feature/3d-*; merge back only after Demo + tests + gate)
#
# Hard gate (non-zero exit on failure):
#   1. npm run validate:all  (9 gates: config/bundle/encoding/architecture/ts-static/
#                             asset/ui-skin/game-assets/doc-consistency)
#   2. npm run test          (vitest unit tests)
#
# Soft policy (warning only, does NOT fail the gate):
#   When the target is master/main, the source branch SHOULD be a feature/3d-* branch
#   (decision F). A non-feature source is warned so reviewers can confirm intent, but
#   local/main development is not hard-blocked by naming alone.
#
# Usage:
#   python tools/branch_gate.py [--target main] [--source <branch>]
# If --source is omitted it is detected from `git rev-parse --abbrev-ref HEAD`.

import argparse
import os
import subprocess
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN_BRANCHES = {"master", "main"}
FEATURE_PREFIX = "feature/3d-"


def _run(step_name: str, cmd: list[str]) -> int:
    print(f"\n=== [{step_name}] {' '.join(cmd)} ===")
    try:
        result = subprocess.run(cmd, cwd=PROJECT_ROOT)
    except FileNotFoundError as exc:
        print(f"  ERROR: command not found: {exc}")
        return 127
    code = result.returncode
    print(f"  -> {step_name} exit code: {code}")
    return code


def _current_branch() -> str:
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
        )
        return out.stdout.strip()
    except Exception:
        return ""


def _check_branch_policy(target: str, source: str) -> None:
    if target not in MAIN_BRANCHES:
        return
    if not source:
        print(
            "  [policy] WARNING: could not detect source branch; "
            "skipping feature/3d-* naming check."
        )
        return
    if source in MAIN_BRANCHES:
        print(
            f"  [policy] WARNING: merging '{source}' directly into '{target}'. "
            "decision F prefers feature/3d-* branches; confirm this is intentional."
        )
    elif not source.startswith(FEATURE_PREFIX):
        print(
            f"  [policy] WARNING: source '{source}' is not a '{FEATURE_PREFIX}*' branch. "
            "decision F recommends feature/3d-* for 3D work."
        )
    else:
        print(f"  [policy] OK: '{source}' is a feature branch targeting '{target}'.")


def main() -> int:
    parser = argparse.ArgumentParser(description="§5.13 branch merge gate")
    parser.add_argument("--target", default="main", help="Target branch (default: main)")
    parser.add_argument("--source", default=None, help="Source branch (auto-detect if omitted)")
    args = parser.parse_args()

    source = args.source or _current_branch()
    print(f"branch_gate: target='{args.target}' source='{source}'")
    _check_branch_policy(args.target, source)

    failures = 0
    failures += _run("validate:all", ["npm.cmd" if os.name == "nt" else "npm", "run", "validate:all"])
    failures += _run("unit-tests", ["npm.cmd" if os.name == "nt" else "npm", "run", "test"])

    if failures == 0:
        print("\n[branch_gate] PASS: validation + tests green. Merge allowed.")
        return 0

    print(f"\n[branch_gate] BLOCKED: {failures} gate(s) failed. Do NOT merge.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
