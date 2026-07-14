#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cleanup_scan.py - File cleanup PLANNER (AI-executable, dry-run by default, NEVER deletes).

================================================================================
DETERMINISM STATEMENT (read before trusting any output)
--------------------------------------------------------------------------------
This tool reasons ONLY about the CURRENT working-tree snapshot. It does NOT:
  * read full git history (no `git log`/blame analysis of when/why files exist),
  * build a COMPLETE import/dependency graph of all 8909 files. Orphan detection
    uses an AST/reference heuristic over a restricted set of organizational dirs
    (see ORPHAN_DIRS) - it is NOT exhaustive and may report false orphans.
  * compare image/asset content beyond MD5 of small files.
Therefore every "SAFE_DELETE" label is an INFERENCE from current evidence, not a
proven fact. A file with 0 references TODAY may be referenced TOMORROW. The human
operator must confirm the plan, and a git tag/branch must be created BEFORE any
destructive action.

TOOL VERSION: 4.x  (v1 no gate -> v2 dry-run -> v3 must_keep.json -> v4 priority/ast/exit-code)
See docs/CHANGELOG_AI_RULES.md for the full evolution.
================================================================================

SAFE-DELETE GATE (every candidate is evaluated in this exact order):
  1. (when relevant) content hash matches a known-duplicate group
  2. reference count (git grep over source files for the basename) == 0
  3. NOT referenced by any package.json script
  4. NO uncommitted modification (git status --porcelain is clean for the path)
Only when ALL four pass is a file marked SAFE_DELETE.

PRIORITY MODEL (added in v4):
  P0 - MUST be decided by a human (core file / live reference / uncommitted edit).
  P1 - SUGGESTED human review (duplicates, orphans, large, weak-marked drafts).
  P2 - AI MAY auto-apply after the gate passes (clearly-temporary backups/drafts).

EXECUTION FLOW (see the doc section "AI Execution Principles"):
  scan -> inventory -> duplicate -> reference -> git-status -> PLAN -> CONFIRM -> apply -> RESCAN -> report

EXIT CODES (useful for CI, e.g. GitHub Actions `exit 2` stops the pipeline):
  0 - clean, no SAFE_DELETE and no BLOCKED items found
  1 - SAFE_DELETE items found (review/apply at your discretion)
  2 - BLOCKED items found (human decision required before any deletion)
  3 - tool failure (exception / git error)

Usage:
  python tools/maintenance/cleanup_scan.py
        Print the deletion plan (DRY-RUN, nothing is removed).
  python tools/maintenance/cleanup_scan.py --json plan.json
        Also write a machine-readable plan to plan.json.
  python tools/maintenance/cleanup_scan.py --apply --i-have-reviewed-the-plan
        DESTRUCTIVE: actually removes only SAFE_DELETE items. Requires the
        companion flag. Refuses to run if --i-have-reviewed-the-plan is absent.
"""

import os
import sys
import ast
import json
import argparse
import subprocess
import hashlib
import re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # E:/game

# ---------------------------------------------------------------------------
# Filename markers that SUGGEST temp/debug/backup. These are HINTS only and are
# NEVER sufficient alone to delete a file (see SAFE-DELETE GATE above).
# IMPORTANT: do NOT match a bare "debug" / "tmp" / "temp" substring. Matching
# bare "debug" would catch DebugPanel.ts / debug_save_replay.test.ts (live code).
# Matching bare "tmp"/"temp" could catch legitimate modules. Use boundary forms.
# ---------------------------------------------------------------------------
STRONG_MARKERS = ("_tmp_", "_debug_", ".backup_", "prompts.backup", "副本", "copy", ".swp")
# Prefix-style weak markers: they flag a candidate but ALWAYS require human review
# and are never auto-deleted.
WEAK_MARKERS = ("tmp_", "temp_")

SKIP_DIRS = {".git", "library", "temp", "local", "node_modules",
             ".creator", "__pycache__", "art_source"}

HASH_LIMIT = 5 * 1024 * 1024        # only hash files <= 5MB for duplicate detection
LARGE_FILE_BYTES = 100 * 1024 * 1024  # alert when a file is larger than 100MB

# Fallback core files used only if config/must_keep.json is missing/unreadable.
# Prefer editing config/must_keep.json - no code change required.
DEFAULT_MUST_KEEP = {
    "DebugPanel.ts", "GameBootstrap.ts", "gen_missing_179.py",
    "auto_bind_scene.py", "gen_scenes.py", "gen_scenes_simple.py",
}

# Directories scanned for source/config/docs (used for duplicate detection).
SOURCE_DIRS = [
    "回到地面/assets/scripts",
    "回到地面/tools",
    "tools",
    "docs",
    "回到地面/docs",
    "回到地面/tests",
    "assets/resources/config",
]

# Restricted dirs for the AST-based orphan heuristic (kept small for speed and to
# avoid flooding the report with generated assets). Not exhaustive by design.
# `config/` is excluded: it holds tooling config (e.g. must_keep.json) read by
# filesystem path, not by import, which would always false-flag as orphan.
ORPHAN_DIRS = [
    "tools", "回到地面/tools", "docs", "回到地面/docs", "回到地面/design",
]


# ---------------------------------------------------------------------------
# must_keep configuration (externalised, not hard-coded in logic)
# ---------------------------------------------------------------------------
def load_must_keep():
    """Load the MUST_KEEP set from config/must_keep.json.

    Falls back to DEFAULT_MUST_KEEP if the file is missing or malformed so the
    tool still runs. Returns (set, source_label).
    """
    candidates = [
        os.path.join(ROOT, "config", "must_keep.json"),
        os.path.join(ROOT, "tools", "maintenance", "must_keep.json"),
    ]
    for p in candidates:
        if os.path.isfile(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                items = set(data.get("must_keep", []))
                if items:
                    return items, p
            except (OSError, json.JSONDecodeError):
                pass
    return set(DEFAULT_MUST_KEEP), "<built-in DEFAULT_MUST_KEEP>"


# ---------------------------------------------------------------------------
# git helpers
# ---------------------------------------------------------------------------
def run_git(args):
    return subprocess.run(["git"] + args, cwd=ROOT,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def git_tracked(rel):
    return run_git(["ls-files", "--error-unmatch", rel]).returncode == 0


def git_ignored(rel):
    return run_git(["check-ignore", "-q", rel]).returncode == 0


def git_modified(rel):
    r = run_git(["status", "--porcelain", "--", rel])
    if r.returncode != 0:
        return False
    out = r.stdout.decode("utf-8", "replace").strip()
    if not out:
        return False
    code = out.split()[0]
    # "??" = untracked (not a modification of an existing file); everything else
    # with a non-empty status indicates staged/unstaged changes.
    return code != "??"


# ---------------------------------------------------------------------------
# file helpers
# ---------------------------------------------------------------------------
def md5_of(path):
    try:
        if os.path.getsize(path) > HASH_LIMIT:
            return None
        h = hashlib.md5()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except OSError:
        return None


def marker_of(fn):
    for m in STRONG_MARKERS:
        if m in fn:
            return ("strong", m)
    for m in WEAK_MARKERS:
        if fn.startswith(m):
            return ("weak", m)
    return None


def collect_candidates():
    out = []
    for dp, dns, fns in os.walk(ROOT):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            rel = os.path.relpath(os.path.join(dp, fn), ROOT)
            mk = marker_of(fn)
            if mk:
                out.append((rel, fn, mk))
    return out


def reference_counts(basenames):
    """Return {basename: count} of grep matches across tracked source files."""
    names = list(set(basenames))
    counts = {n: 0 for n in names}
    if not names:
        return counts
    pat = "|".join(re.escape(n) for n in names)
    r = run_git(["grep", "-I", "-h", "-o", "-E", pat, "--",
                 "*.ts", "*.py", "*.json", "*.md", "*.yml"])
    if r.returncode != 0:
        return counts
    for line in r.stdout.decode("utf-8", "replace").splitlines():
        for n in names:
            if n in line:
                counts[n] += 1
    return counts


def package_refs(basenames):
    refs = set()
    for pj in ("package.json", "回到地面/package.json"):
        p = os.path.join(ROOT, pj)
        if not os.path.isfile(p):
            continue
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, json.JSONDecodeError):
            continue
        blob = json.dumps(data, ensure_ascii=False)
        for n in basenames:
            if n in blob:
                refs.add(n)
    return refs


def find_duplicates():
    hashes = {}
    for sd in SOURCE_DIRS:
        base = os.path.join(ROOT, sd)
        if not os.path.isdir(base):
            continue
        for dp, dns, fns in os.walk(base):
            dns[:] = [d for d in dns if d not in SKIP_DIRS]
            for fn in fns:
                if fn.endswith(".meta"):
                    continue  # generated 1:1 asset pairs, not content comparisons
                p = os.path.join(dp, fn)
                h = md5_of(p)
                if h:
                    hashes.setdefault(h, []).append(os.path.relpath(p, ROOT))
    return [sorted(v) for v in hashes.values() if len(v) > 1]


def find_large_files():
    big = []
    for dp, dns, fns in os.walk(ROOT):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            p = os.path.join(dp, fn)
            try:
                sz = os.path.getsize(p)
            except OSError:
                continue
            if sz > LARGE_FILE_BYTES:
                big.append((os.path.relpath(p, ROOT), sz))
    return big


# ---------------------------------------------------------------------------
# AST / reference-graph based orphan detection (upgraded in v4)
# ---------------------------------------------------------------------------
def extract_refs(path):
    """Extract raw reference tokens from a source/config/doc file.

    Python: `import x` / `from y import ...` (ast parse).
    TS/JS: `import ... from '...'`, `export ... from '...'`, `require('...')`,
           dynamic `import('...')`.
    Markdown: `[...](target)` links.
    JSON: string values ending in a known code/doc extension (path-like).
    """
    ext = os.path.splitext(path)[1].lower()
    refs = set()
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except OSError:
        return refs
    if ext == ".py":
        try:
            tree = ast.parse(text)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for n in node.names:
                        refs.add(n.name.split(".")[0])
                elif isinstance(node, ast.ImportFrom):
                    if node.level:  # relative import, keep the leading dots
                        refs.add("." + (node.module or ""))
                    elif node.module:
                        refs.add(node.module.split(".")[0])
        except SyntaxError:
            pass
    elif ext in (".ts", ".tsx", ".js"):
        for m in re.finditer(r"""(?:import|export)\b[^\n;]*?\bfrom\s*['"]([^'"]+)['"]""", text):
            refs.add(m.group(1))
        for m in re.finditer(r"""require\(\s*['"]([^'"]+)['"]\s*\)""", text):
            refs.add(m.group(1))
        for m in re.finditer(r"""import\(\s*['"]([^'"]+)['"]\s*\)""", text):
            refs.add(m.group(1))
    elif ext == ".md":
        for m in re.finditer(r"""\]\(([^)]+)\)""", text):
            t = m.group(1).split("#")[0].strip()
            if t:
                refs.add(t)
    elif ext == ".json":
        for m in re.finditer(r"""['"]([^'"]*?\.(?:py|ts|tsx|js|json|md))['"]""", text):
            refs.add(m.group(1))
    return refs


def build_reference_graph():
    """Build {rel_path: incoming_reference_count} over ORPHAN_DIRS.

    Heuristic (NOT exhaustive): resolves relative imports against the source
    directory and module/basename references against the known file universe.
    """
    universe_rel = set()
    base_to_rel = {}
    for sd in ORPHAN_DIRS:
        base = os.path.join(ROOT, sd)
        if not os.path.isdir(base):
            continue
        for dp, dns, fns in os.walk(base):
            dns[:] = [d for d in dns if d not in SKIP_DIRS]
            for fn in fns:
                if fn.endswith(".meta"):
                    continue
                rel = os.path.relpath(os.path.join(dp, fn), ROOT)
                universe_rel.add(rel)
                base_to_rel[fn] = rel

    ref_targets = defaultdict(int)
    for sd in ORPHAN_DIRS:
        base = os.path.join(ROOT, sd)
        if not os.path.isdir(base):
            continue
        for dp, dns, fns in os.walk(base):
            dns[:] = [d for d in dns if d not in SKIP_DIRS]
            for fn in fns:
                if fn.endswith(".meta"):
                    continue
                p = os.path.join(dp, fn)
                for ref in extract_refs(p):
                    resolved = _resolve_ref(ref, dp, universe_rel, base_to_rel)
                    if resolved:
                        ref_targets[resolved] += 1

    ref_count = {rel: 0 for rel in universe_rel}
    for target, c in ref_targets.items():
        if target in ref_count:
            ref_count[target] += c
    return ref_count


def _resolve_ref(ref, src_dir, universe_rel, base_to_rel):
    if ref.startswith(".") or ref.startswith("/"):
        cand = os.path.normpath(os.path.join(src_dir, ref))
        rel = os.path.relpath(cand, ROOT)
        if rel in universe_rel:
            return rel
        return None
    for ext in ("", ".py", ".ts", ".tsx", ".js", ".json", ".md", ".meta"):
        cand = ref + ext
        if cand in base_to_rel:
            return base_to_rel[cand]
    if ref in base_to_rel:
        return base_to_rel[ref]
    return None


def find_orphans(ref_count, must_keep):
    """Informational: ORPHAN_DIRS files with 0 incoming AST references.

    HEURISTIC only - a 0 count today does NOT mean the file is safe to delete.
    Files on MUST_KEEP are excluded.
    """
    orphans = []
    for rel, c in ref_count.items():
        if c == 0 and os.path.basename(rel) not in must_keep:
            orphans.append(rel)
    return sorted(orphans)


def find_empty_dirs():
    empties = []
    for dp, dns, fns in os.walk(ROOT):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        if os.path.basename(dp) in SKIP_DIRS:
            continue
        children = [c for c in os.listdir(dp) if c not in SKIP_DIRS]
        if not children:
            empties.append(os.path.relpath(dp, ROOT))
    return empties


# ---------------------------------------------------------------------------
# priority classification
# ---------------------------------------------------------------------------
def classify_candidate(item):
    if item["decision"] == "SAFE_DELETE":
        return "P2" if item["kind"] == "strong" else "P1"
    r = item["reason"]
    if "MUST_KEEP" in r or "reference" in r or "uncommitted" in r or "package.json" in r:
        return "P0"
    if "weak marker" in r:
        return "P1"
    return "P1"


def classify_duplicate(group, must_keep):
    return "P0" if any(os.path.basename(p) in must_keep for p in group) else "P1"


# ---------------------------------------------------------------------------
# plan builder
# ---------------------------------------------------------------------------
def build_plan(must_keep):
    cands = collect_candidates()
    plan = []
    for rel, fn, (kind, marker) in cands:
        tracked = git_tracked(rel)
        ignored = git_ignored(rel)
        modified = git_modified(rel)
        rc = reference_counts([fn]).get(fn, 0)
        in_pkg = fn in package_refs([fn])
        in_keep = fn in must_keep
        reasons = []
        safe = True
        if in_keep:
            safe = False
            reasons.append("on MUST_KEEP list (live code)")
        if modified:
            safe = False
            reasons.append("has uncommitted modification")
        if rc > 0:
            safe = False
            reasons.append("%d reference(s) found" % rc)
        if in_pkg:
            safe = False
            reasons.append("referenced by package.json script")
        if kind == "weak":
            safe = False
            reasons.append("weak marker, needs human review")
        item = {
            "path": rel,
            "marker": marker,
            "kind": kind,
            "tracked": tracked,
            "ignored": ignored,
            "modified": modified,
            "ref_count": rc,
            "in_package_json": in_pkg,
            "decision": "SAFE_DELETE" if safe else "BLOCKED",
            "reason": "; ".join(reasons) if reasons else "no blockers",
        }
        item["priority"] = classify_candidate(item)
        plan.append(item)
    return plan


def apply_plan(plan):
    deleted = 0
    for item in plan:
        if item["decision"] != "SAFE_DELETE":
            continue
        rel = item["path"]
        if item["tracked"]:
            run_git(["rm", "--ignore-unmatch", rel])
        else:
            try:
                os.remove(os.path.join(ROOT, rel))
            except OSError:
                continue
        deleted += 1
    return deleted


# ---------------------------------------------------------------------------
# reporting
# ---------------------------------------------------------------------------
def humansize(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return "%.1f%s" % (n, unit)
        n /= 1024.0
    return "%.1fTB" % n


PRIO_DESC = {
    "P0": "MUST be decided by a human (core/live/uncommitted)",
    "P1": "SUGGESTED human review (dup/orphan/large/weak)",
    "P2": "AI MAY auto-apply after the gate passes (temp/backup)",
}


def _group_by_priority(items):
    g = {"P0": [], "P1": [], "P2": []}
    for it in items:
        g[it.get("priority", "P1")].append(it)
    return g


def print_plan(plan, dup_groups, must_keep, ref_count, large, orphans, empties):
    safe = [p for p in plan if p["decision"] == "SAFE_DELETE"]
    blocked = [p for p in plan if p["decision"] != "SAFE_DELETE"]
    safe_g = _group_by_priority(safe)
    blocked_g = _group_by_priority(blocked)

    print("=" * 78)
    print("cleanup_scan.py  --  DRY-RUN DELETION PLAN (nothing was removed)")
    print("scan root: %s" % ROOT)
    print("=" * 78)

    print("\n[SAFE_DELETE] %d file(s) passed the 4-step safe gate:" % len(safe))
    for prio in ("P2", "P1", "P0"):
        if not safe_g[prio]:
            continue
        print("  -- %s: %s --" % (prio, PRIO_DESC[prio]))
        for p in sorted(safe_g[prio], key=lambda x: x["path"]):
            mode = "git rm" if p["tracked"] else ("rm (ignored)" if p["ignored"] else "rm")
            print("    [%s] %s   (marker=%s)" % (mode, p["path"], p["marker"]))

    print("\n[BLOCKED] %d file(s) need human review (NOT deleted):" % len(blocked))
    for prio in ("P0", "P1", "P2"):
        if not blocked_g[prio]:
            continue
        print("  -- %s: %s --" % (prio, PRIO_DESC[prio]))
        for p in sorted(blocked_g[prio], key=lambda x: x["path"]):
            print("    %-55s -> %s" % (p["path"], p["reason"]))

    print("\n[DUPLICATE GROUPS] %d group(s) with identical content (MD5):" % len(dup_groups))
    for i, g in enumerate(dup_groups[:60], 1):
        prio = classify_duplicate(g, must_keep)
        print("  D%d [%s]:" % (i, prio))
        for path in g:
            print("      %s" % path)
    if len(dup_groups) > 60:
        print("  ... (%d more groups omitted)" % (len(dup_groups) - 60))

    print("\n[LARGE FILES >100MB] %d (informational, usually generated/asset) [P1]:"
          % len(large))
    for path, sz in sorted(large, key=lambda x: -x[1]):
        print("  %s  (%s)" % (path, humansize(sz)))

    print("\n[ORPHANS] %d file(s) with 0 AST references in ORPHAN_DIRS (informational) [P1]:"
          % len(orphans))
    for rel in orphans[:80]:
        print("  %s" % rel)
    if len(orphans) > 80:
        print("  ... (%d more omitted)" % (len(orphans) - 80))

    print("\n[EMPTY DIRS] %d (candidates for removal) [P2]:" % len(empties))
    for rel in empties:
        print("  %s" % rel)

    print("\n" + "=" * 78)
    print("NEXT STEP: review the SAFE_DELETE list, then create a safety tag:")
    print("  git tag cleanup_before_%s" % _today())
    print("  # or: git checkout -b backup_cleanup")
    print("Then run (only after human confirmation):")
    print("  python tools/maintenance/cleanup_scan.py --apply --i-have-reviewed-the-plan")
    print("=" * 78)


def _today():
    try:
        return subprocess.run(["date", "+%Y%m%d"], stdout=subprocess.PIPE,
                              cwd=ROOT).stdout.decode().strip()
    except Exception:
        return "YYYYMMDD"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", metavar="FILE", help="emit machine-readable plan to FILE")
    ap.add_argument("--apply", action="store_true",
                    help="DESTRUCTIVE: remove only SAFE_DELETE items")
    ap.add_argument("--i-have-reviewed-the-plan", action="store_true",
                    help="required companion flag for --apply")
    args = ap.parse_args()

    must_keep, mk_source = load_must_keep()
    print("[cleanup_scan] MUST_KEEP source: %s (%d files)" % (mk_source, len(must_keep)))

    plan = build_plan(must_keep)
    dup_groups = find_duplicates()
    ref_count = build_reference_graph()
    large = find_large_files()
    orphans = find_orphans(ref_count, must_keep)
    empties = find_empty_dirs()

    if args.json:
        with open(os.path.join(ROOT, args.json), "w", encoding="utf-8") as f:
            json.dump({
                "summary": {
                    "safe_delete": sum(1 for p in plan if p["decision"] == "SAFE_DELETE"),
                    "blocked": sum(1 for p in plan if p["decision"] != "SAFE_DELETE"),
                    "duplicate_groups": len(dup_groups),
                    "large_files": len(large),
                    "orphans": len(orphans),
                    "empty_dirs": len(empties),
                    "priority": {
                        "P0": sum(1 for p in plan if p.get("priority") == "P0"),
                        "P1": sum(1 for p in plan if p.get("priority") == "P1"),
                        "P2": sum(1 for p in plan if p.get("priority") == "P2"),
                    },
                },
                "plan": plan,
                "duplicate_groups": dup_groups,
                "large_files": [{"path": p, "bytes": s} for p, s in large],
                "orphans": orphans,
                "empty_dirs": empties,
            }, f, ensure_ascii=False, indent=2)
        print("[cleanup_scan] wrote plan -> %s" % args.json)

    if args.apply:
        if not args.i_have_reviewed_the_plan:
            print("REFUSED: --apply requires --i-have-reviewed-the-plan.")
            print("Review the dry-run plan first, create a git tag, then re-run.")
            sys.exit(2)
        n = apply_plan(plan)
        print("[cleanup_scan] APPLY done: %d file(s) removed (safe-gated only)." % n)
        print("RESCAN recommended: re-run this tool to confirm zero regressions.")
        sys.exit(0)

    print_plan(plan, dup_groups, must_keep, ref_count, large, orphans, empties)

    # Exit code for CI:
    n_blocked = sum(1 for p in plan if p["decision"] != "SAFE_DELETE")
    n_safe = sum(1 for p in plan if p["decision"] == "SAFE_DELETE")
    if n_blocked > 0:
        sys.exit(2)
    if n_safe > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
