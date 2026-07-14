#!/usr/bin/env python3
# Introspect a Cocos Creator .scene file: print the node tree and resolve every
# custom component's serialized uuid back to its real script class name.
#
# WHY THIS EXISTS
#   A .scene file stores custom components only as a compact base64url uuid
#   (e.g. "2939euWIidI2YiU1qw0r42q"), never the class name. This script recovers
#   the class name by scanning the editor/preview compiled chunks, where Cocos
#   registers each component via `_cclegacy._RF.push({}, "<uuid>", "<ClassName>", undefined)`.
#
# NOTE
#   This reads the LAST SAVED version of the scene on disk. Unsaved in-editor
#   changes are NOT visible here. Save (Ctrl+S) in Cocos Creator first.
#
# USAGE
#   python tools/introspect_scene.py [path/to/scene.scene]
#   (defaults to assets/scenes/dungeon.scene)

import json
import glob
import os
import re
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def build_uuid_to_class():
    """Scan compiled chunks for `_RF.push({}, uuid, ClassName, ...)` registrations."""
    mapping = {}
    search_dirs = [
        os.path.join(PROJECT_ROOT, "temp"),
        os.path.join(PROJECT_ROOT, "library"),
    ]
    pattern = re.compile(r'_RF\.push\(\{\},\s*"([^"]+)",\s*"([^"]+)"')
    for base in search_dirs:
        if not os.path.isdir(base):
            continue
        for f in glob.glob(os.path.join(base, "**", "*.js"), recursive=True):
            try:
                text = open(f, encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            for m in pattern.finditer(text):
                mapping.setdefault(m.group(1), m.group(2))
    return mapping


def is_compact_uuid(s):
    return isinstance(s, str) and re.fullmatch(r"[A-Za-z0-9_\-+]{20,24}", s) is not None


def collect_nodes(scene):
    """Return list of (index, name) for every cc.Node in the scene array."""
    out = []
    for i, o in enumerate(scene):
        if o.get("__type__") == "cc.Node":
            out.append((i, o.get("_name", "?")))
    return out


def collect_components(scene):
    """Return dict: component_array_index -> compact_uuid."""
    out = {}
    for i, o in enumerate(scene):
        t = o.get("__type__", "")
        if t.startswith("cc."):
            continue
        if is_compact_uuid(t):
            out[i] = t
    return out


def node_name_by_index(scene, idx):
    if isinstance(idx, int) and 0 <= idx < len(scene):
        return scene[idx].get("_name", "?")
    return "?"


def main():
    if len(sys.argv) > 1:
        scene_path = sys.argv[1]
    else:
        scene_path = os.path.join(PROJECT_ROOT, "assets", "scenes", "dungeon.scene")
    if not os.path.isfile(scene_path):
        print(f"scene not found: {scene_path}")
        sys.exit(1)

    uuid2class = build_uuid_to_class()
    scene = json.load(open(scene_path, encoding="utf-8"))

    nodes = collect_nodes(scene)
    comps = collect_components(scene)

    # component index -> host node name
    host = {}
    for i in comps:
        node_ref = scene[i].get("node", {})
        nid = node_ref.get("__id__") if isinstance(node_ref, dict) else None
        host[i] = node_name_by_index(scene, nid)

    print(f"=== {os.path.relpath(scene_path, PROJECT_ROOT)} ===")
    print("NODE -> COMPONENT CLASS")
    print("-" * 52)
    for i in sorted(host):
        cls = uuid2class.get(comps[i], "<<UNRESOLVED>>")
        flag = "" if cls != "<<UNRESOLVED>>" else "  (uuid not found in chunks; build the project once)"
        print(f"  {host[i]:<22} -> {cls}{flag}")

    resolved = sum(1 for i in comps if comps[i] in uuid2class)
    print(f"\nResolved {resolved}/{len(comps)} component uuids to classes.")
    if resolved != len(comps):
        print("Tip: run a Cocos Creator build/preview once so temp/ chunks contain the _RF.push registrations.")


if __name__ == "__main__":
    main()
