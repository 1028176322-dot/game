#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""cut_character_parts.py - 从角色母版按 cut spec 精确切割部件。

读取 art_source/textures_review/master/characters/{character}/cut_specs/{character}_part_cut_spec.json，
从同一张母版精确裁切各部件 PNG 到 .../export/parts/，并按 §12 公式生成 rig JSON。

硬性约束（docs/角色部件化母版切割与精确拼装方案.md）：
  - 不执行任何 AI 生成 / 不调用生图接口。
  - 默认不 tight-crop，保留裁切矩形内透明空间，确保 pivot 关系稳定。
  - 部件必须来自同一张母版，禁止独立生成后再拼。

PIL 为可选依赖：仅在真正执行切割时才 import；--help / py_compile 不需要 PIL。
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


def crop_part(source, part_spec):
    x, y, w, h = part_spec["rect"]
    return source.crop((x, y, x + w, y + h)).convert("RGBA")


def fit_to_output(part_img, output_size):
    from PIL import Image
    target_w, target_h = output_size
    alpha = part_img.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return Image.new("RGBA", output_size, (0, 0, 0, 0))
    img = part_img.copy()
    img.thumbnail(output_size, Image.LANCZOS)
    canvas = Image.new("RGBA", output_size, (0, 0, 0, 0))
    ox = (target_w - img.width) // 2
    oy = (target_h - img.height) // 2
    canvas.alpha_composite(img, (ox, oy))
    return canvas


def generate_rig(spec):
    # §12: runtimeSocket = (socket - characterRootInSource) * scaleToRuntime
    #       runtimePartPosition = runtimeSocket - pivotInOutput
    # 第一版简化：母版中心映射到 runtime 中心，scaleToRuntime = 256/768。
    scale = float(spec.get("scaleToRuntime", 1.0))
    cx = spec["canvas"][0] / 2.0
    cy = spec["canvas"][1] / 2.0
    parts = {}
    for name, ps in spec["parts"].items():
        sx, sy = ps["socket"]
        out_w, out_h = ps["outputSize"]
        rsx = (sx - cx) * scale
        rsy = (sy - cy) * scale
        out_pivot = ps.get("outputPivot", [out_w / 2.0, out_h / 2.0])
        parts[name] = {
            "z": ps["z"],
            "position": [round(rsx - out_pivot[0], 2),
                         round(rsy - out_pivot[1], 2)],
            "scale": [1, 1],
            "anchor": [0.5, 0.5],
        }
    return {
        "rootSize": spec.get("runtimeRootSize", [256, 256]),
        "parts": parts,
    }


def cut_parts(spec_path, write_config=False):
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)
    character = spec["characterId"]
    source_path = os.path.join(PROJECT_ROOT, spec["source"])
    if not os.path.isfile(source_path):
        print("[ERROR] 母版不存在: {0}".format(source_path))
        print("        请先生成角色母版（本脚本不负责 AI 生图）。")
        return 2

    from PIL import Image
    source = Image.open(source_path).convert("RGBA")

    cdir = character_dir(character)
    out_dir = os.path.join(cdir, "export", "parts")
    os.makedirs(out_dir, exist_ok=True)

    for part_name, part_spec in spec["parts"].items():
        part = crop_part(source, part_spec)
        part = fit_to_output(part, tuple(part_spec["outputSize"]))
        dest = os.path.join(out_dir, "{0}.png".format(part_name))
        part.save(dest)
        print("  cut {0:16s} -> {1}".format(part_name, dest))

    rig = generate_rig(spec)
    rig_path = os.path.join(cdir, "export",
                            "character_rig_{0}.json".format(character))
    with open(rig_path, "w", encoding="utf-8") as f:
        json.dump(rig, f, ensure_ascii=False, indent=2)
    print("  rig  -> {0}".format(rig_path))

    if write_config:
        canonical = os.path.join(PROJECT_ROOT, "assets", "resources",
                                 "config", "character_rigs.json")
        data = {}
        if os.path.isfile(canonical):
            with open(canonical, "r", encoding="utf-8") as f:
                data = json.load(f)
        data.setdefault("metadata", {})
        data[character] = rig
        with open(canonical, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("  merged into canonical -> {0}".format(canonical))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="从角色母版精确切割部件（不生成母版、不 tight-crop）。")
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--spec", help="cut spec JSON 路径")
    g.add_argument("--character", help="角色 id（解析默认 spec 路径）")
    parser.add_argument("--write-config", action="store_true",
                        help="同时把生成的 rig 合并进正式 character_rigs.json")
    args = parser.parse_args(argv)
    spec_path = args.spec or resolve_spec_path(args.character)
    if not os.path.isfile(spec_path):
        print("[ERROR] cut spec 不存在: {0}".format(spec_path))
        return 2
    return cut_parts(spec_path, write_config=args.write_config)


if __name__ == "__main__":
    sys.exit(main())
