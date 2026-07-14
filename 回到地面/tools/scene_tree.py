#!/usr/bin/env python3
# Dump a Cocos Creator .scene as an indented node tree with every component
# listed (built-in cc.* shown directly, custom scripts resolved to class name
# via the _RF.push registrations in temp/library compiled chunks).
#
# USAGE:
#   python tools/scene_tree.py [scene.scene]
# If no path given, defaults to assets/scenes/dungeon.scene.
#
# Reads the LAST SAVED version on disk. Ctrl+S in Cocos Creator first.

import glob
import json
import os
import re
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def build_uuid_to_class():
    mapping = {}
    for base in (os.path.join(PROJECT_ROOT, "temp"),
                 os.path.join(PROJECT_ROOT, "library")):
        if not os.path.isdir(base):
            continue
        pat = re.compile(r'_RF\.push\(\{\},\s*"([^"]+)",\s*"([^"]+)"')
        for f in glob.glob(os.path.join(base, "**", "*.js"), recursive=True):
            try:
                text = open(f, encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            for m in pat.finditer(text):
                mapping.setdefault(m.group(1), m.group(2))
    return mapping


def is_compact_uuid(s):
    return isinstance(s, str) and re.fullmatch(r"[A-Za-z0-9_\-+]{20,24}", s) is not None


def main():
    scene_path = sys.argv[1] if len(sys.argv) > 1 else \
        os.path.join(PROJECT_ROOT, "assets", "scenes", "dungeon.scene")
    if not os.path.isfile(scene_path):
        print("scene not found:", scene_path)
        sys.exit(1)

    uuid2class = build_uuid_to_class()
    scene = json.load(open(scene_path, encoding="utf-8"))

    # index -> object
    nodes = {}
    comps = {}
    for i, o in enumerate(scene):
        t = o.get("__type__", "")
        if t == "cc.Node":
            nodes[i] = o
        elif t.startswith("cc."):
            comps[i] = (t, o)
        elif is_compact_uuid(t):
            comps[i] = (uuid2class.get(t, "<<UNRESOLVED:%s>>" % t), o)

    # node components
    node_comps = {i: [] for i in nodes}
    for i, (cls, o) in comps.items():
        ref = o.get("node", {})
        nid = ref.get("__id__") if isinstance(ref, dict) else None
        if nid in node_comps:
            node_comps[nid].append(cls)

    # build children map; a node is a root if no other node references it as a child
    children = {i: [] for i in nodes}
    child_set = set()
    for i, o in nodes.items():
        refs = o.get("_children", [])
        for r in refs:
            if isinstance(r, dict) and isinstance(r.get("__id__"), int):
                children[i].append(r["__id__"])
                child_set.add(r["__id__"])
    roots = [i for i in nodes if i not in child_set]

    def dump(idx, depth):
        o = nodes[idx]
        name = o.get("_name", "?")
        line = "  " * depth + ("└─ " if depth else "") + name + "  "
        # components
        cs = node_comps.get(idx, [])
        if cs:
            line += "[" + ", ".join(cs) + "]"
        print(line)
        for c in sorted(children.get(idx, [])):
            dump(c, depth + 1)

    print("=== %s ===" % os.path.relpath(scene_path, PROJECT_ROOT))
    for r in roots:
        dump(r, 0)
    unresolved = sum(1 for _, (c, _) in comps.items() if str(c).startswith("<<UNRESOLVED"))
    print("\n%d custom components unresolved (build once in Cocos to populate)." % unresolved)


if __name__ == "__main__":
    main()
