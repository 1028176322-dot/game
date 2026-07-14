#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""preview_character_rig.py - 用切割出的部件 PNG 拼装预览图。

读取 cut spec，按 z 升序把 export/parts/*.png 合成到 runtimeRootSize 画布，
输出 parts_preview/{character}_rig_preview.png。用于人工确认拼装是否像完整角色。
"""
import argparse
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)


def character_dir(character):
    return os.path.join(PROJECT_ROOT, "art_source", "textures_review",
                        "master", "characters", character)


def resolve_spec_path(character):
    return os.path.join(character_dir(character), "cut_specs",
                        "{0}_part_cut_spec.json".format(character))


def preview(spec_path):
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)
    character = spec["characterId"]
    cdir = character_dir(character)
    parts_dir = os.path.join(cdir, "export", "parts")
    if not os.path.isdir(parts_dir):
        print("[ERROR] 部件目录不存在: {0}".format(parts_dir))
        print("        请先运行 cut_character_parts.py 切割母版。")
        return 2

    from PIL import Image
    canvas_w, canvas_h = spec["runtimeRootSize"]
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    center = (canvas_w // 2, canvas_h // 2)
    scale = float(spec["scaleToRuntime"])
    items = sorted(spec["parts"].items(), key=lambda kv: kv[1]["z"])
    missing = []
    for part_name, part_spec in items:
        img_path = os.path.join(parts_dir, "{0}.png".format(part_name))
        if not os.path.isfile(img_path):
            missing.append(part_name)
            continue
        img = Image.open(img_path).convert("RGBA")
        sx, sy = part_spec["socket"]
        out_pivot = part_spec.get("outputPivot",
                                 [img.width // 2, img.height // 2])
        rx = int((sx - spec["canvas"][0] / 2.0) * scale + center[0])
        ry = int((sy - spec["canvas"][1] / 2.0) * scale + center[1])
        x = rx - out_pivot[0]
        y = ry - out_pivot[1]
        canvas.alpha_composite(img, (x, y))

    if missing:
        print("[WARN] 以下部件缺失，跳过: {0}".format(missing))
    out = os.path.join(cdir, "parts_preview",
                       "{0}_rig_preview.png".format(character))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    canvas.save(out)
    print("  preview -> {0}".format(out))
    return 1 if missing else 0


def main(argv=None):
    parser = argparse.ArgumentParser(description="拼装角色部件预览图。")
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--spec", help="cut spec JSON 路径")
    g.add_argument("--character", help="角色 id")
    args = parser.parse_args(argv)
    spec_path = args.spec or resolve_spec_path(args.character)
    if not os.path.isfile(spec_path):
        print("[ERROR] cut spec 不存在: {0}".format(spec_path))
        return 2
    return preview(spec_path)


if __name__ == "__main__":
    sys.exit(main())
