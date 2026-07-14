#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""check_character_parts.py - 校验某角色的部件配置与文件一致性。

规则（docs/角色部件化母版标准姿势规范.md §4.3）：
  - character_parts.json 声明的部件必须都存在（文件缺失则判失败）。
  - character_rigs.json 声明的部件必须与 character_parts.json 一致。
  - 未声明的多余部件不进入正式 textures（仅警告）。
  - 不因为某职业缺少 quiver/cape 等非必需部件而判失败（quiver 仅 archer，cape 全职业可选）。

仅做配置与文件存在性校验，不读取像素内容。
"""
import argparse
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

CONFIG_DIR = os.path.join(PROJECT_ROOT, "assets", "resources", "config")
TEXTURES_CHAR = os.path.join(PROJECT_ROOT, "assets", "resources",
                             "textures", "characters")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def check_character(character, quiet=False):
    parts_path = os.path.join(CONFIG_DIR, "character_parts.json")
    rigs_path = os.path.join(CONFIG_DIR, "character_rigs.json")
    if not os.path.isfile(parts_path):
        print("[ERROR] 缺少配置文件: {0}".format(parts_path))
        return 2
    parts_cfg = load_json(parts_path)
    rigs_cfg = load_json(rigs_path) if os.path.isfile(rigs_path) else {}

    char_parts = parts_cfg.get(character, {}).get("parts", {})
    char_rigs = rigs_cfg.get(character, {}).get("parts", {})

    errors = []

    parts_dir = os.path.join(TEXTURES_CHAR, character, "parts")
    for part_name in char_parts:
        png = os.path.join(parts_dir, "{0}.png".format(part_name))
        if not os.path.isfile(png):
            errors.append("部件文件缺失: {0}".format(png))

    for part_name in char_rigs:
        if part_name not in char_parts:
            errors.append("rig 声明了未注册部件: {0}".format(part_name))
    for part_name in char_parts:
        if part_name not in char_rigs:
            errors.append("部件未在 rig 声明: {0}".format(part_name))

    if not quiet:
        print("== 角色 {0} 校验 ==".format(character))
        print("  声明部件: {0}  声明 rig 部件: {1}".format(
            len(char_parts), len(char_rigs)))
    for e in errors:
        print("  [ERROR] {0}".format(e))

    return 1 if errors else 0


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="校验角色部件配置与文件一致性。")
    parser.add_argument("--character", required=True, help="角色 id")
    parser.add_argument("--quiet", action="store_true", help="只返回退出码")
    args = parser.parse_args(argv)
    return check_character(args.character, quiet=args.quiet)


if __name__ == "__main__":
    sys.exit(main())
