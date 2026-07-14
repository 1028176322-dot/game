#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""draw_character_cut_marks.py - 在母版上标注 rect/pivot/socket/z/名字。

输出 reference/{character}_rig_master_marked.png，供人工标注/复核切割 spec。
"""
import argparse
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)


def resolve_spec_path(character):
    return os.path.join(PROJECT_ROOT, "art_source", "textures_review",
                        "master", "characters", character, "cut_specs",
                        "{0}_part_cut_spec.json".format(character))


def draw_marks(spec_path):
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)
    source_path = os.path.join(PROJECT_ROOT, spec["source"])
    if not os.path.isfile(source_path):
        print("[ERROR] 母版不存在: {0}".format(source_path))
        return 2

    from PIL import Image, ImageDraw
    img = Image.open(source_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    for name, ps in spec["parts"].items():
        x, y, w, h = ps["rect"]
        px, py = ps["pivot"]
        sx, sy = ps["socket"]
        draw.rectangle([x, y, x + w, y + h], outline=(255, 220, 0, 255), width=3)
        draw.ellipse([x + px - 5, y + py - 5, x + px + 5, y + py + 5],
                     fill=(255, 0, 0, 255))
        draw.ellipse([sx - 5, sy - 5, sx + 5, sy + 5],
                     fill=(0, 120, 255, 255))
        draw.text((x, y - 16), "{0} z={1}".format(name, ps["z"]),
                  fill=(255, 255, 255, 255))
    out = os.path.join(PROJECT_ROOT, os.path.dirname(spec["source"]),
                       "{0}_rig_master_marked.png".format(spec["characterId"]))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out)
    print("  marks -> {0}".format(out))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description="在母版上标注切割 spec。")
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--spec", help="cut spec JSON 路径")
    g.add_argument("--character", help="角色 id")
    args = parser.parse_args(argv)
    spec_path = args.spec or resolve_spec_path(args.character)
    if not os.path.isfile(spec_path):
        print("[ERROR] cut spec 不存在: {0}".format(spec_path))
        return 2
    return draw_marks(spec_path)


if __name__ == "__main__":
    sys.exit(main())
