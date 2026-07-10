#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_3d_manifest.py — 从 Layer 1 规范文档生成 3D 资产注册表。

单一事实来源: docs/美术资源制作参数总表_3D.md (Layer 1 人类可读规范)
输出:          (项目父级)/assets/resources/config/art_3d_manifest.json
               （与 prompts.json / art_quality_budget.json 同目录，便于管道统一读取）

每个 3D 资源 (CHR_/MON_/BOSS_/FX_/TILE_) 提取:
  - name       模型名 (如 CHR_Archer_A)
  - category   characters/monsters/bosses/effects/tiles (由前缀推导)
  - bucket     rules3d 桶名 (characters/monsters/tiles/bosses_final/bosses_mini/
               effects_normal/effects_boss)
  - dim        "3d"
  - source_2d  派生该模型的 2D sprite 路径列表 (来自「源 2D 资源:」行)
  - lifecycle  资源生命周期 (默认 选秀)

用法:
  python tools/gen_3d_manifest.py            # 生成并打印摘要
  python tools/gen_3d_manifest.py --check    # 仅校验数量，不写文件
"""
import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timezone

# 路径自动检测 (与 art_pipeline.py 一致)
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(_SCRIPT_DIR)
PARENT_ASSETS = os.path.join(os.path.dirname(PROJECT_ROOT), "assets", "resources", "config")

L1_DOC = os.path.join(PROJECT_ROOT, "docs", "美术资源制作参数总表_3D.md")
OUT_JSON = os.path.join(PARENT_ASSETS, "art_3d_manifest.json")

# 前缀 -> category
PREFIX_CATEGORY = {
    "CHR": "characters",
    "MON": "monsters",
    "BOSS": "bosses",
    "FX": "effects",
    "TILE": "tiles",
}

# L1 总表声明的理论数量 (用于 --check 校验)
EXPECTED = {"characters": 5, "monsters": 36, "bosses": 42, "effects": 27, "tiles": 24}

# 兼容 markdown 粗体 **命名规范**: 与全角冒号 ：
NAME_RE = re.compile(r"命名规范\**\s*[:：]\s*`?([A-Z]+_[A-Za-z0-9_]+)`?")
SRC_RE = re.compile(r"源\s*2D\s*资源\**\s*[:：]\s*(.+)")
SECTION_RE = re.compile(r"^#{3}\s")


def detect_bucket(category, name, source_2d):
    """根据 category + 源 2D 路径推导 rules3d 桶名。"""
    low_paths = " ".join(source_2d).lower()
    low_name = name.lower()
    if category == "characters":
        return "characters"
    if category == "monsters":
        return "monsters"
    if category == "tiles":
        return "tiles"
    if category == "bosses":
        if "finalboss" in low_paths or "final" in low_name:
            return "bosses_final"
        if "miniboss" in low_paths or "mini" in low_name:
            return "bosses_mini"
        # 无法判定时默认 mini（更安全，避免误用 final 预算）
        return "bosses_mini"
    if category == "effects":
        if "boss" in low_paths or "boss" in low_name:
            return "effects_boss"
        return "effects_normal"
    return None


def parse_l1(doc_path):
    """解析 L1 文档，返回 entries 列表。"""
    with open(doc_path, encoding="utf-8") as f:
        lines = f.read().split("\n")

    entries = []
    cur = None  # 当前 命名规范 名
    for ln in lines:
        if SECTION_RE.match(ln):
            cur = None  # 新节开始，避免跨节串味
            continue
        m = NAME_RE.search(ln)
        if m:
            token = m.group(1)
            prefix = token.split("_")[0]
            if prefix in PREFIX_CATEGORY:
                cur = token
            else:
                cur = None
            continue
        if cur:
            s = SRC_RE.search(ln)
            if s:
                paths = re.findall(r"`([^`]+)`", s.group(1))
                category = PREFIX_CATEGORY[cur.split("_")[0]]
                bucket = detect_bucket(category, cur, paths)
                entries.append({
                    "name": cur,
                    "category": category,
                    "bucket": bucket,
                    "dim": "3d",
                    "source_2d": paths,
                    "lifecycle": "选秀",
                })
                cur = None
    return entries


def main():
    check_only = "--check" in sys.argv[1:]
    if not os.path.isfile(L1_DOC):
        print(f"[ERROR] L1 文档不存在: {L1_DOC}", file=sys.stderr)
        sys.exit(1)

    entries = parse_l1(L1_DOC)
    counts = Counter(e["category"] for e in entries)

    print(f"解析到 3D 资源条目: {len(entries)}")
    for cat in ("characters", "monsters", "bosses", "effects", "tiles"):
        got = counts.get(cat, 0)
        exp = EXPECTED.get(cat, 0)
        flag = "OK" if got == exp else f"期望 {exp} 不符!"
        print(f"  {cat:>12}: {got:>3}  ({flag})")

    # 桶分布
    buckets = Counter(e["bucket"] for e in entries)
    print("  桶分布:", dict(buckets))

    if check_only:
        total_ok = all(counts.get(c, 0) == EXPECTED[c] for c in EXPECTED)
        sys.exit(0 if total_ok else 1)

    payload = {
        "version": 1,
        "source": "docs/美术资源制作参数总表_3D.md",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "counts": {c: counts.get(c, 0) for c in EXPECTED},
        "entries": entries,
    }
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"\n已写入: {OUT_JSON}")
    print(f"条目总数: {len(entries)}")


if __name__ == "__main__":
    main()
