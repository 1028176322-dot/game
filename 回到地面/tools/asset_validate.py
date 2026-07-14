#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
asset_validate.py - 3D art asset validator (3D-upgrade pipeline).

Single consumer of 3D budget rules defined in ART_RESOURCE_RULES.md §16
and art_quality_budget.json (rules3d). Reads each 3D asset's sidecar
manifest (.assetmeta.json) and emits a Pass/Fail report so hundreds of
artist deliverables can be batch-checked instead of manually reviewed.

NO third-party dependencies. UTF-8 safe. Tool script: ASCII/English only.

Usage:
  python tools/asset_validate.py <manifest.json> [--budget PATH]
  python tools/asset_validate.py --scan <dir> [--budget PATH] [--report PATH]
  python tools/asset_validate.py --self-test
"""

import argparse
import json
import os
import re
import sys

DEFAULT_BUDGET = "assets/resources/config/art_quality_budget.json"

LIFECYCLE_STATES = {"选秀", "评审中", "已批准", "已弃用"}
PERF_TIERS = {"low", "medium", "high"}

# Maps an asset prefix to its default rules3d bucket key.
PREFIX_BUCKET = {
    "CHR": "characters",
    "MON": "monsters",
    "BOSS": "bosses_final",
    "FX": "effects_normal",
    "TILE": "tiles",
    "DNG": "dungeon",
    "BG": "backdrop",
}


def log(msg):
    sys.stderr.write(msg + "\n")


def load_budget(path):
    if not os.path.isfile(path):
        log("[warn] budget not found: %s (using empty rules3d)" % path)
        return {"rules3d": {}}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def naming_regex(budget):
    r3d = budget.get("rules3d", {})
    pat = (r3d.get("naming") or {}).get(
        "pattern", r"^(CHR|MON|BOSS|FX|TILE)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?$")
    return re.compile(pat)


_KNOWN_3D_EXT = (".glb", ".prefab", ".cconb", ".material", ".fbx")


def strip_ext(name):
    base, ext = os.path.splitext(name)
    if ext.lower() in _KNOWN_3D_EXT:
        return base
    return name


def category_from_name(name, rx):
    m = rx.match(strip_ext(name))
    if not m:
        return None
    return m.group(1)


def resolve_budget(path):
    """Find the budget file, searching upward from cwd to reduce path fragility."""
    if os.path.isfile(path):
        return path
    name = os.path.basename(path)
    cur = os.path.abspath(os.getcwd())
    for _ in range(6):
        cand = os.path.join(cur, name)
        if os.path.isfile(cand):
            return cand
        parent = os.path.dirname(cur)
        if parent == cur:
            break
        cur = parent
    return path


def resolve_budget_key(prefix, name, budget):
    r3d = budget.get("rules3d", {})
    if prefix == "BOSS":
        if "bosses_final" in r3d and ("Final" in name or "final" in name):
            return "bosses_final"
        if "bosses_mini" in r3d:
            return "bosses_mini"
        return "bosses_final"
    if prefix == "FX":
        # Heuristic: boss FX carry "Boss"/"final" in token; default normal.
        if "effects_boss" in r3d and ("Boss" in name or "Final" in name):
            return "effects_boss"
        return "effects_normal"
    return PREFIX_BUCKET.get(prefix)


def rule_for(bkey, budget):
    return budget.get("rules3d", {}).get(bkey, {})


def check_manifest(manifest_path, budget, rx):
    """Return (asset_name, [(check, ok, detail), ...])."""
    name = os.path.basename(manifest_path)
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            m = json.load(f)
    except Exception as e:  # noqa: BLE001
        return name, [("manifest_parsable", False, "parse error: %s" % e)]

    results = []
    asset_name = m.get("name", name)
    prefix = category_from_name(asset_name, rx)
    results.append(("naming", prefix is not None, "prefix=%s" % (prefix or "NONE")))

    if prefix is None:
        return asset_name, results

    bkey = resolve_budget_key(prefix, asset_name, budget)
    rule = rule_for(bkey, budget)
    if not rule:
        results.append(("budget_rule_found", False, "no rules3d for %s" % bkey))
        return asset_name, results
    results.append(("budget_rule_found", True, "bucket=%s" % bkey))

    if prefix != "FX":
        tri = m.get("tri")
        if tri is not None:
            mn, mx = rule.get("minTri"), rule.get("maxTri")
            ok = (mn is None or tri >= mn) and (mx is None or tri <= mx)
            results.append(("tri_budget", ok, "tri=%s range=[%s,%s]" % (tri, mn, mx)))
        bones = m.get("bones")
        if bones is not None:
            mx = rule.get("maxBones")
            ok = mx is None or bones <= mx
            results.append(("bones_budget", ok, "bones=%s max=%s" % (bones, mx)))
        tsize = m.get("textureSize")
        if tsize is not None:
            mx = rule.get("textureSize")
            ok = mx is None or tsize <= mx
            results.append(("texture_size", ok, "size=%s max=%s" % (tsize, mx)))
        lod = m.get("lodLevels")
        if lod is not None:
            ok = lod >= 1
            results.append(("lod_present", ok, "levels=%s expected>=1" % lod))
        anim = m.get("animClips")
        if anim is not None:
            mn = rule.get("animClipsMin")
            ok = mn is None or anim >= mn
            results.append(("anim_clips_min", ok, "clips=%s min=%s" % (anim, mn)))
        sockets = set(m.get("sockets", []))
        req = rule.get("sockets", [])
        missing = [s for s in req if s not in sockets]
        results.append(("required_sockets", len(missing) == 0, "missing=%s" % (missing or "none")))
        colliders = m.get("colliders", [])
        results.append(("collider_present", len(colliders) > 0, "count=%s" % len(colliders)))
    else:
        parts = m.get("maxParticles")
        if parts is not None:
            mx = rule.get("maxParticles")
            ok = mx is None or parts <= mx
            results.append(("particles_budget", ok, "parts=%s max=%s" % (parts, mx)))
        dc = m.get("maxDrawCall")
        if dc is not None:
            mx = rule.get("maxDrawCall")
            ok = mx is None or dc <= mx
            results.append(("drawcall_budget", ok, "dc=%s max=%s" % (dc, mx)))

    base = os.path.dirname(manifest_path)
    depends = m.get("depends", [])
    miss = []
    for d in depends:
        found = (os.path.isfile(os.path.join(base, d))
                 or os.path.isfile(os.path.join(base, d + ".glb"))
                 or os.path.isfile(os.path.join(base, d + ".prefab")))
        if not found:
            miss.append(d)
    results.append(("dependencies_present", len(miss) == 0, "missing=%s" % (miss or "none")))

    lc = m.get("lifecycle")
    results.append(("lifecycle_valid", lc in LIFECYCLE_STATES, "state=%s" % lc))
    pt = m.get("perfTier")
    results.append(("perf_tier_valid", pt in PERF_TIERS, "tier=%s" % pt))
    ts = m.get("testScene")
    results.append(("test_scene_present", bool(ts), "scene=%s" % ts))

    for fld in ("version", "author", "date", "reviewer"):
        results.append(("meta_" + fld, bool(m.get(fld)), "%s=%s" % (fld, m.get(fld))))
    return asset_name, results


def render_report(all_results, report_path=None):
    lines = []
    total_fail = 0
    for asset_name, results in all_results:
        fails = [r for r in results if not r[1]]
        total_fail += len(fails)
        status = "PASS" if not fails else "FAIL"
        lines.append("=== %s [%s] ===" % (asset_name, status))
        for check, ok, detail in results:
            mark = "ok " if ok else "XX "
            lines.append("  [%s] %-22s %s" % (mark, check, detail))
    header = "ASSET VALIDATION REPORT  (fail_checks=%d, assets=%d)" % (total_fail, len(all_results))
    out = header + "\n" + "\n".join(lines) + "\n"
    if report_path:
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(out)
    return out, total_fail


def cmd_scan(scan_dir, budget, report_path):
    rx = naming_regex(budget)
    manifests = []
    for root, _dirs, files in os.walk(scan_dir):
        for fn in files:
            if fn.endswith(".assetmeta.json"):
                manifests.append(os.path.join(root, fn))
    if not manifests:
        log("[warn] no .assetmeta.json found under %s" % scan_dir)
    all_results = [check_manifest(p, budget, rx) for p in manifests]
    out, fails = render_report(all_results, report_path)
    sys.stdout.write(out)
    return 1 if fails > 0 else 0


def cmd_single(manifest_path, budget, report_path):
    rx = naming_regex(budget)
    all_results = [check_manifest(manifest_path, budget, rx)]
    out, fails = render_report(all_results, report_path)
    sys.stdout.write(out)
    return 1 if fails > 0 else 0


def cmd_self_test():
    tmp = "_selftest_assetmeta.json"
    sample = {
        "name": "CHR_Warrior_A.glb",
        "tri": 2900, "bones": 28, "textureSize": 512,
        "lodLevels": 3, "animClips": 7,
        "sockets": ["RightHand", "LeftHand", "Head", "Chest", "Back", "Foot", "Weapon", "SkillOrigin"],
        "colliders": ["capsule"],
        "depends": [], "lifecycle": "已批准", "perfTier": "medium",
        "testScene": "Arena_Test", "version": "1.0", "author": "x", "date": "2026-07-10", "reviewer": "y"
    }
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(sample, f, ensure_ascii=False, indent=2)
    budget = {"rules3d": {
        "characters": {"minTri": 2000, "maxTri": 3000, "maxBones": 30, "textureSize": 512,
                       "lod": [{}, {}, {}], "animClipsMin": 5,
                       "sockets": ["RightHand", "LeftHand", "Head", "Chest", "Back", "Foot", "Weapon", "SkillOrigin"],
                       "collider": "capsule", "perfTier": "medium"},
        "naming": {"pattern": r"^(CHR|MON|BOSS|FX|TILE)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?$"}
    }}
    rx = naming_regex(budget)
    _name, results = check_manifest(tmp, budget, rx)
    ok_all = all(r[1] for r in results)
    out, fails = render_report([(_name, results)])
    sys.stdout.write(out)
    os.remove(tmp)
    return 0 if ok_all else 1


def main(argv):
    ap = argparse.ArgumentParser(description="3D art asset validator")
    ap.add_argument("manifest", nargs="?", help="path to .assetmeta.json")
    ap.add_argument("--scan", help="scan a directory of manifests")
    ap.add_argument("--budget", default=DEFAULT_BUDGET, help="art_quality_budget.json path")
    ap.add_argument("--report", help="write report to this path")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args(argv)

    budget = load_budget(resolve_budget(args.budget))
    if args.self_test:
        return cmd_self_test()
    if args.scan:
        return cmd_scan(args.scan, budget, args.report)
    if args.manifest:
        return cmd_single(args.manifest, budget, args.report)
    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
