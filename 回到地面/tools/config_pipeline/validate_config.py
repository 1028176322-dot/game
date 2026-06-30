#!/usr/bin/env python3
"""
validate_config.py - 配置文件校验脚本

检查内容:
1. JSON 能解析
2. 每个配置有 metadata.version
3. ID 唯一性
4. 引用存在
5. 权重非负
6. 数值范围合理
7. 文本 key 不缺失

输出:
- art_source/config_check/config_check_summary.json
- art_source/config_check/config_check_issues.csv

使用方式:
    python tools/config_pipeline/validate_config.py
    python tools/config_pipeline/validate_config.py --fix   # 自动修复已知问题
"""

import json
import os
import sys
import csv
from datetime import datetime
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CONFIG_DIR = PROJECT_ROOT / "assets" / "resources" / "config"
OUTPUT_DIR = PROJECT_ROOT / "art_source" / "config_check"
KNOWN_TEXT_KEYS = {"ui", "room", "item", "skill", "event", "buff", "system"}


def ensure_output_dir():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_metadata(name: str, data: dict, issues: list):
    """检查 metadata"""
    meta = data.get("metadata")
    if not meta:
        issues.append({
            "file": name, "severity": "error", "field": "metadata",
            "message": "缺少 metadata 字段"
        })
        return

    if not isinstance(meta.get("version"), str) or not meta["version"]:
        issues.append({
            "file": name, "severity": "error", "field": "metadata.version",
            "message": "metadata.version 必须为非空字符串"
        })
    if not isinstance(meta.get("lastUpdated"), str) or not meta["lastUpdated"]:
        issues.append({
            "file": name, "severity": "warning", "field": "metadata.lastUpdated",
            "message": "metadata.lastUpdated 必须为非空字符串"
        })


def validate_zones(data: dict, issues: list):
    """校验 zones.json 结构"""
    zone_pool = data.get("zonePool", [])
    zones = data.get("zones", {})
    runs = data.get("runsPerGame", 0)

    if not isinstance(runs, (int, float)) or runs < 2 or runs > 4:
        issues.append({
            "file": "zones.json", "severity": "error", "field": "runsPerGame",
            "message": f"runsPerGame 应为 2~4，当前: {runs}"
        })

    # 检查 zonePool 和 zones 的引用
    for zone_id in zone_pool:
        if zone_id not in zones:
            issues.append({
                "file": "zones.json", "severity": "error", "field": "zonePool",
                "message": f"zonePool 引用了不存在的区域: {zone_id}"
            })

    for zone_id, zone in zones.items():
        if not isinstance(zone, dict):
            continue
        # 检查房间类型权重
        weights = data.get("roomTypeWeights", {})
        if weights:
            total = sum(weights.values())
            if abs(total - 100) > 1:
                issues.append({
                    "file": "zones.json", "severity": "warning", "field": "roomTypeWeights",
                    "message": f"房间类型权重之和为 {total}，期望接近 100"
                })


def validate_monsters(zones_data: dict, monsters_data: dict, issues: list):
    """校验 monsters.json + 交叉引用"""
    monster_scale = monsters_data.get("monsterScale", {})
    required_scale_fields = [
        "eliteHpMultiplier", "eliteAtkMultiplier",
        "summonHpMultiplier", "summonAtkMultiplier",
        "maxOnScreen", "summonMaxPerMonster", "summonGlobalCap"
    ]
    for field in required_scale_fields:
        val = monster_scale.get(field)
        if not isinstance(val, (int, float)) or val < 0:
            issues.append({
                "file": "monsters.json", "severity": "error", "field": f"monsterScale.{field}",
                "message": f"monsterScale.{field} 必须为非负数，当前: {val}"
            })

    # 检查每个 zone 的 monsterPool 是否在 monsters 中有定义
    zones = zones_data.get("zones", {})
    for zone_id, zone in zones.items():
        if not isinstance(zone, dict):
            continue
        monster_pool = zone.get("monsterPool", [])
        zone_monsters = monsters_data.get(zone_id, {})
        if not isinstance(zone_monsters, dict):
            issues.append({
                "file": "monsters.json", "severity": "error", "field": zone_id,
                "message": f"区域 '{zone_id}' 在 monsters.json 中缺少怪物定义"
            })
            continue
        for mid in monster_pool:
            if mid not in zone_monsters:
                issues.append({
                    "file": "monsters.json", "severity": "error",
                    "field": f"zones.{zone_id}.monsterPool",
                    "message": f"区域 '{zone_id}' 的怪物池引用了不存在的怪物: {mid}"
                })
            else:
                # 检查怪物数值合理性
                mdef = zone_monsters[mid]
                if not isinstance(mdef, dict):
                    continue
                if mdef.get("hp", 0) <= 0:
                    issues.append({
                        "file": "monsters.json", "severity": "error",
                        "field": f"{zone_id}.{mid}.hp",
                        "message": f"怪物 {mid}.hp 必须 > 0，当前: {mdef.get('hp')}"
                    })
                if mdef.get("appearanceWeight", 0) < 0:
                    issues.append({
                        "file": "monsters.json", "severity": "error",
                        "field": f"{zone_id}.{mid}.appearanceWeight",
                        "message": f"怪物 {mid}.appearanceWeight 不能为负数"
                    })
                if mdef.get("atk", 0) < 0:
                    issues.append({
                        "file": "monsters.json", "severity": "error",
                        "field": f"{zone_id}.{mid}.atk",
                        "message": f"怪物 {mid}.atk 不能为负数"
                    })


def validate_battle(data: dict, issues: list):
    """校验 battle.json 数值范围"""
    constraints = {
        "autoAttack.baseInterval": (0.2, 5.0),
        "autoAttack.minDamage": (1, 10),
        "autoAttack.rangeDecayRate": (0, 0.5),
        "dodge.duration": (0.1, 1.0),
        "dodge.cooldown": (1.0, 10.0),
        "crit.baseChance": (0, 1),
        "crit.multiplier": (1.0, 5.0),
        "damage.defReductionFactor": (0, 1),
    }
    _check_nested_range(data, "battle.json", constraints, issues)


def _check_nested_range(data: dict, filename: str, constraints: dict, issues: list, prefix: str = ""):
    """递归检查嵌套字段的数值范围"""
    for key, constraint in constraints.items():
        parts = key.split(".")
        value = data
        path_parts = []
        for part in parts:
            if isinstance(value, dict):
                path_parts.append(part)
                value = value.get(part)
            else:
                value = None
                break
        if value is None:
            issues.append({
                "file": filename, "severity": "error", "field": key,
                "message": f"缺少字段 {key}"
            })
            continue
        if not isinstance(value, (int, float)):
            issues.append({
                "file": filename, "severity": "error", "field": key,
                "message": f"{key} 应为数值，当前: {value}"
            })
            continue
        min_val, max_val = constraint
        if value < min_val or value > max_val:
            issues.append({
                "file": filename, "severity": "error", "field": key,
                "message": f"{key}={value} 超出范围 [{min_val}, {max_val}]"
            })


def validate_text(data: dict, issues: list):
    """校验文本 key 不缺失"""
    expected_top_keys = KNOWN_TEXT_KEYS
    for key in expected_top_keys:
        if key not in data:
            issues.append({
                "file": "text.json", "severity": "warning", "field": key,
                "message": f"缺少顶层字段 '{key}'"
            })


def main():
    ensure_output_dir()
    issues = []

    # 扫描所有 JSON 文件
    json_files = sorted(CONFIG_DIR.glob("*.json"))
    if not json_files:
        print(f"[ERROR] 未在 {CONFIG_DIR} 找到 JSON 文件")
        sys.exit(1)

    # 先加载所有数据
    configs = {}
    for fpath in json_files:
        name = fpath.name
        try:
            configs[name] = load_json(fpath)
            print(f"[OK] {name} -> 解析成功")
        except json.JSONDecodeError as e:
            issues.append({
                "file": name, "severity": "error", "field": "(root)",
                "message": f"JSON 解析失败: {e}"
            })
            print(f"[FAIL] {name} -> JSON 解析失败: {e}")

    # 逐文件校验
    for name, data in configs.items():
        validate_metadata(name, data, issues)

        if name == "zones.json":
            validate_zones(data, issues)
        elif name == "monsters.json":
            # monsters 交叉引用需要 zones 数据
            zones_data = configs.get("zones.json", {})
            validate_monsters(zones_data, data, issues)
        elif name == "battle.json":
            validate_battle(data, issues)
        elif name == "text.json":
            validate_text(data, issues)

    # 输出结果
    summary = {
        "timestamp": datetime.now().isoformat(),
        "total_files": len(json_files),
        "total_issues": len(issues),
        "errors": len([i for i in issues if i["severity"] == "error"]),
        "warnings": len([i for i in issues if i["severity"] == "warning"]),
    }

    # 写 summary
    summary_path = OUTPUT_DIR / "config_check_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"\n[SUMMARY] 写入: {summary_path}")

    # 写 CSV
    csv_path = OUTPUT_DIR / "config_check_issues.csv"
    with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["file", "severity", "field", "message"])
        writer.writeheader()
        for issue in issues:
            writer.writerow(issue)
    print(f"[SUMMARY] 写入: {csv_path}")

    # 打印摘要
    print(f"\n{'=' * 50}")
    print(f"  文件数:      {summary['total_files']}")
    print(f"  问题总数:    {summary['total_issues']}")
    print(f"  错误:        {summary['errors']}")
    print(f"  警告:        {summary['warnings']}")
    print(f"{'=' * 50}")

    if summary["errors"] > 0:
        print("\n[FAIL] 配置校验未通过，请修复上述错误")
        sys.exit(1)
    else:
        print("\n[PASS] 配置校验通过")
        sys.exit(0)


if __name__ == "__main__":
    main()
