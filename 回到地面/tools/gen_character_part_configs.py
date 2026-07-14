#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""gen_character_part_configs.py - 生成 5 职业部件化占位配置。

产出：
  assets/resources/config/character_parts.json
  assets/resources/config/character_rigs.json
  assets/resources/config/character_part_animations.json

说明：
  - 这是母版切割前的占位配置；部件集与 z-order 以
    docs/角色部件化母版标准姿势规范.md §4.3 / §4.5 为准。
  - position / anchor 为占位值，待母版切割后由 cut_character_parts.py
    按 cut spec 重新生成 rig（或人工 overwrite）。
  - 不生成任何图片，只写 JSON 配置。
  - archer 采用手武器合并 arm_r_weapon（不拆 bow / arm_r）。
  - quiver 仅限 archer；其余职业的装饰件按 §4.3 配置。
"""
import json
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_DIR = os.path.join(PROJECT_ROOT, "assets", "resources", "config")

# 职业 -> 部件 -> 角色槽位（role）。1:1 映射。
# role 决定 z / position / anchor 模板（见 ROLE_Z / ROLE_POS）。
PROFESSIONS = {
    "warrior": {
        "body": "body", "head": "head", "ear_l": "ear_l", "ear_r": "ear_r",
        "leg_l": "leg_l", "leg_r": "leg_r", "tail": "tail", "cape": "cape",
        "helmet": "headtop9", "shield_arm_l": "arm_l_role",
        "sword_arm_r": "arm_r_role",
    },
    "archer": {
        "body": "body", "head": "head", "ear_l": "ear_l", "ear_r": "ear_r",
        "leg_l": "leg_l", "leg_r": "leg_r", "tail": "tail", "cape": "cape",
        "quiver": "overlay6", "arm_l": "arm_l_role",
        "arm_r_weapon": "arm_r_role",
    },
    "assassin": {
        "body": "body", "head": "head", "ear_l": "ear_l", "ear_r": "ear_r",
        "leg_l": "leg_l", "leg_r": "leg_r", "tail": "tail", "cape": "cape",
        "scarf": "headtop9", "dagger_arm_l": "arm_l_role",
        "dagger_arm_r": "arm_r_role",
    },
    "mage": {
        "body": "body", "head": "head", "ear_l": "ear_l", "ear_r": "ear_r",
        "leg_l": "leg_l", "leg_r": "leg_r", "tail": "tail", "cape": "cape",
        "hat": "headtop9", "robe_front": "overlay6", "arm_l": "arm_l_role",
        "staff_arm_r": "arm_r_role",
    },
    "berserker": {
        "body": "body", "head": "head", "ear_l": "ear_l", "ear_r": "ear_r",
        "leg_l": "leg_l", "leg_r": "leg_r", "tail": "tail", "cape": "cape",
        "shoulder_guard": "headtop9", "belt": "overlay6",
        "arm_l": "arm_l_role", "axe_arm_r": "arm_r_role",
    },
}

ROLE_Z = {
    "shadow": 0, "tail": 1, "cape": 2, "leg_l": 3, "leg_r": 4,
    "body": 5, "overlay6": 6, "arm_l_role": 7, "arm_r_role": 8,
    "headtop9": 9, "head": 10, "ear_l": 11, "ear_r": 12,
}

ROLE_POS = {
    "shadow": ([0, -74], [0.5, 0.5]),
    "tail": ([-42, -18], [0.5, 0.15]),
    "cape": ([-12, -8], [0.5, 0.75]),
    "leg_l": ([-18, -58], [0.5, 0.85]),
    "leg_r": ([18, -58], [0.5, 0.85]),
    "body": ([0, -12], [0.5, 0.5]),
    "overlay6": ([-34, 4], [0.5, 0.5]),
    "arm_l_role": ([-34, -2], [0.5, 0.85]),
    "arm_r_role": ([34, -2], [0.5, 0.85]),
    "headtop9": ([0, 40], [0.5, 0.5]),
    "head": ([0, 48], [0.5, 0.35]),
    "ear_l": ([-28, 92], [0.5, 0.15]),
    "ear_r": ([28, 92], [0.5, 0.15]),
}

# 基础动画模板（role -> keyframes）。角色若没有某 role 部件则不出该轨道。
BASE_ANIMS = {
    "idle": {
        "loop": True, "duration": 1.2,
        "tracks": {
            "body": [
                {"time": 0, "position": [0, -12], "rotation": 0, "scale": [1, 1]},
                {"time": 0.6, "position": [0, -8], "rotation": 0, "scale": [1.01, 1.01]},
                {"time": 1.2, "position": [0, -12], "rotation": 0, "scale": [1, 1]},
            ],
            "head": [
                {"time": 0, "position": [0, 48], "rotation": 0},
                {"time": 0.6, "position": [0, 51], "rotation": -2},
                {"time": 1.2, "position": [0, 48], "rotation": 0},
            ],
            "ear_l": [{"time": 0, "rotation": -4}, {"time": 0.6, "rotation": 3}, {"time": 1.2, "rotation": -4}],
            "ear_r": [{"time": 0, "rotation": 4}, {"time": 0.6, "rotation": -3}, {"time": 1.2, "rotation": 4}],
            "cape": [{"time": 0, "rotation": -2}, {"time": 0.6, "rotation": 2}, {"time": 1.2, "rotation": -2}],
            "tail": [{"time": 0, "rotation": -3}, {"time": 0.6, "rotation": 3}, {"time": 1.2, "rotation": -3}],
        },
    },
    "walk": {
        "loop": True, "duration": 0.8,
        "tracks": {
            "body": [
                {"time": 0, "position": [0, -12], "rotation": 0},
                {"time": 0.2, "position": [0, -14], "rotation": 0},
                {"time": 0.4, "position": [0, -12], "rotation": 0},
                {"time": 0.6, "position": [0, -14], "rotation": 0},
                {"time": 0.8, "position": [0, -12], "rotation": 0},
            ],
            "head": [
                {"time": 0, "position": [0, 48], "rotation": 0},
                {"time": 0.2, "position": [0, 46], "rotation": 0},
                {"time": 0.4, "position": [0, 48], "rotation": 0},
                {"time": 0.6, "position": [0, 46], "rotation": 0},
                {"time": 0.8, "position": [0, 48], "rotation": 0},
            ],
            "leg_l": [{"time": 0, "rotation": 0}, {"time": 0.2, "rotation": 18}, {"time": 0.4, "rotation": 0}, {"time": 0.6, "rotation": -18}, {"time": 0.8, "rotation": 0}],
            "leg_r": [{"time": 0, "rotation": 0}, {"time": 0.2, "rotation": -18}, {"time": 0.4, "rotation": 0}, {"time": 0.6, "rotation": 18}, {"time": 0.8, "rotation": 0}],
            "arm_l_role": [{"time": 0, "rotation": 0}, {"time": 0.2, "rotation": 10}, {"time": 0.4, "rotation": 0}, {"time": 0.6, "rotation": -10}, {"time": 0.8, "rotation": 0}],
            "arm_r_role": [{"time": 0, "rotation": 0}, {"time": 0.2, "rotation": -10}, {"time": 0.4, "rotation": 0}, {"time": 0.6, "rotation": 10}, {"time": 0.8, "rotation": 0}],
            "cape": [{"time": 0, "rotation": -4}, {"time": 0.2, "rotation": 4}, {"time": 0.4, "rotation": -4}, {"time": 0.6, "rotation": 4}, {"time": 0.8, "rotation": -4}],
        },
    },
    "attack": {
        "loop": False, "duration": 0.45,
        "tracks": {
            "body": [
                {"time": 0, "position": [0, -12], "rotation": 0},
                {"time": 0.18, "position": [-5, -12], "rotation": -5},
                {"time": 0.3, "position": [4, -12], "rotation": 4},
                {"time": 0.45, "position": [0, -12], "rotation": 0},
            ],
            "arm_r_role": [
                {"time": 0, "rotation": 12},
                {"time": 0.18, "rotation": -38},
                {"time": 0.3, "rotation": 42},
                {"time": 0.45, "rotation": 12},
            ],
            "head": [
                {"time": 0, "position": [0, 48], "rotation": 0},
                {"time": 0.18, "position": [0, 48], "rotation": -4},
                {"time": 0.45, "position": [0, 48], "rotation": 0},
            ],
        },
    },
    "hit": {
        "loop": False, "duration": 0.4,
        "tracks": {
            "body": [
                {"time": 0, "position": [0, -12], "rotation": 0},
                {"time": 0.12, "position": [-8, -12], "rotation": -8},
                {"time": 0.28, "position": [-4, -12], "rotation": -4},
                {"time": 0.4, "position": [0, -12], "rotation": 0},
            ],
            "head": [
                {"time": 0, "position": [0, 48], "rotation": 0},
                {"time": 0.12, "position": [-6, 48], "rotation": -6},
                {"time": 0.4, "position": [0, 48], "rotation": 0},
            ],
            "arm_l_role": [{"time": 0, "rotation": 0}, {"time": 0.12, "rotation": 25}, {"time": 0.4, "rotation": 0}],
        },
    },
    "dodge": {
        "loop": False, "duration": 0.35,
        "tracks": {
            "body": [
                {"time": 0, "position": [0, -12], "scale": [1, 1]},
                {"time": 0.15, "position": [30, -12], "scale": [0.9, 1.05]},
                {"time": 0.25, "position": [45, -12], "scale": [0.85, 1.1]},
                {"time": 0.35, "position": [0, -12], "scale": [1, 1]},
            ],
            "head": [
                {"time": 0, "position": [0, 48]},
                {"time": 0.15, "position": [20, 48]},
                {"time": 0.35, "position": [0, 48]},
            ],
            "cape": [{"time": 0, "rotation": 0}, {"time": 0.15, "rotation": 18}, {"time": 0.35, "rotation": 0}],
        },
    },
    "death": {
        "loop": False, "duration": 0.6,
        "tracks": {
            "body": [
                {"time": 0, "position": [0, -12], "rotation": 0, "scale": [1, 1]},
                {"time": 0.2, "position": [-6, -22], "rotation": -15, "scale": [1, 1]},
                {"time": 0.45, "position": [-12, -42], "rotation": -45, "scale": [0.95, 0.95]},
                {"time": 0.6, "position": [-16, -58], "rotation": -70, "scale": [0.9, 0.9]},
            ],
            "head": [
                {"time": 0, "position": [0, 48], "rotation": 0},
                {"time": 0.45, "position": [-14, 22], "rotation": -25},
                {"time": 0.6, "position": [-18, 8], "rotation": -35},
            ],
        },
    },
    "skill": {
        "loop": False, "duration": 0.6,
        "tracks": {
            "body": [
                {"time": 0, "position": [0, -12], "rotation": 0},
                {"time": 0.25, "position": [0, -8], "rotation": -3},
                {"time": 0.45, "position": [0, -12], "rotation": 2},
                {"time": 0.6, "position": [0, -12], "rotation": 0},
            ],
            "arm_r_role": [
                {"time": 0, "rotation": 12},
                {"time": 0.25, "rotation": -55},
                {"time": 0.45, "rotation": 60},
                {"time": 0.6, "rotation": 12},
            ],
            "head": [
                {"time": 0, "position": [0, 48], "rotation": 0},
                {"time": 0.45, "position": [0, 50], "rotation": 3},
                {"time": 0.6, "position": [0, 48], "rotation": 0},
            ],
        },
    },
}


def build_parts():
    root = {}
    for prof, mapping in PROFESSIONS.items():
        parts = {}
        for part in mapping:
            parts[part] = "textures/characters/{0}/parts/{1}".format(prof, part)
        root[prof] = {"parts": parts}
    return root


def build_rigs():
    root = {}
    for prof, mapping in PROFESSIONS.items():
        parts = {}
        for part, role in mapping.items():
            pos, anchor = ROLE_POS[role]
            parts[part] = {
                "z": ROLE_Z[role],
                "position": list(pos),
                "scale": [1, 1],
                "anchor": list(anchor),
            }
        root[prof] = {"rootSize": [256, 256], "parts": parts}
    return root


def build_anims():
    root = {}
    for prof, mapping in PROFESSIONS.items():
        role_to_part = {role: part for part, role in mapping.items()}
        anims = {}
        for anim_name, anim_def in BASE_ANIMS.items():
            tracks = {}
            for role, frames in anim_def["tracks"].items():
                if role in role_to_part:
                    tracks[role_to_part[role]] = frames
            anims[anim_name] = {
                "loop": anim_def["loop"],
                "duration": anim_def["duration"],
                "tracks": tracks,
            }
        root[prof] = anims
    return root


def write_json(name, data, description):
    path = os.path.join(CONFIG_DIR, name)
    payload = {
        "metadata": {
            "version": "2.0.0",
            "lastUpdated": "2026-07-11",
            "description": description,
        }
    }
    payload.update(data)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print("wrote {0}".format(path))


def main():
    write_json(
        "character_parts.json", build_parts(),
        "Character part asset paths (modular cut from one rig master per "
        "profession). archer uses arm_r_weapon (hand+bow merged); quiver only for archer.")
    write_json(
        "character_rigs.json", build_rigs(),
        "Character rig: z-order + placeholder part positions. Positions are "
        "placeholders; regenerate from cut spec via cut_character_parts.py after master cut.")
    write_json(
        "character_part_animations.json", build_anims(),
        "Keyframe animations per profession (idle/walk/attack/hit/dodge/death/skill). "
        "attack/skill drive the merged weapon arm (arm_r_weapon etc.). Placeholder keyframes.")


if __name__ == "__main__":
    main()
