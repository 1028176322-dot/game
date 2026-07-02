#!/usr/bin/env python3
"""
场景文本迁移工具 — 阶段 1：扫描

扫描 splash.scene / main.scene / dungeon.scene
提取所有 cc.Label 节点的 _string 字段
输出 CSV: scene_path, node_path, current_text, suggested_key, text_key_status, component_status

字段说明:
  text_key_status: exists | missing     — text.json 中是否已有此 key
  component_status: pending | dynamic   — 是否需要挂 LocalizedLabel

用法:
    cd 回到地面
    python tools/scan_scene_labels.py
"""

import json
import os
import re
import csv
import sys

SCENES = ['assets/scenes/splash.scene', 'assets/scenes/main.scene', 'assets/scenes/dungeon.scene']
OUTPUT_CSV = 'tools/text_migration.csv'
TEXT_JSON_PATH = 'assets/resources/config/text.json'

IGNORE_PATTERNS = [
    r'^\s*$', r'^\d+$', r'^[\>\<\-\=\.\,\!\?]+$',
]

# 动态文本节点：运行时由代码刷新，不挂 LocalizedLabel
DYNAMIC_NODES = {
    'Canvas/SplashUI/GameBootstrap/StatusLabel',
    'Canvas/AreaSelectPanel/PanelRoot/PlayerInfo',
}


def load_text_json():
    """读取已有的 text.json 返回 {value: key} 反向映射"""
    try:
        with open(TEXT_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        return {}
    rev = {}
    def walk(obj, prefix=''):
        if isinstance(obj, dict):
            for k, v in obj.items():
                walk(v, f'{prefix}{k}.')
        elif isinstance(obj, str):
            rev[obj] = prefix.rstrip('.')
    walk(data)
    return rev


def is_ignorable(text: str) -> bool:
    for pat in IGNORE_PATTERNS:
        if re.match(pat, text):
            return True
    return False


def suggest_key(text: str, node_path: str) -> str:
    """根据节点路径优先、文本值兜底，推测 text key"""
    path = node_path.lower()

    # ===== 优先级 1：节点路径规则 =====
    # 按钮类
    if 'startbutton' in path or ('start' in path and '/label' in path):
        return 'ui.mainStart'
    if 'skipbutton' in path or ('skip' in path and '/label' in path):
        return 'ui.skip'
    if 'back' in path and 'btn' in path:
        return 'ui.areaBack'
    if 'shop' in path and 'btn' in path:
        return 'ui.mainShop'
    if 'characterbtn' in path or ('character' in path and 'btn' in path):
        return 'ui.mainCharacter'
    if 'log' in path and 'btn' in path:
        return 'ui.mainLog'
    if 'setting' in path and 'btn' in path:
        return 'ui.mainSettings'
    if 'start' in path and 'btn' in path:
        return 'ui.areaStart'
    
    # 标签类
    if 'loading' in path:
        return 'ui.loading'
    if 'charname' in path or 'char_name' in path:
        return 'ui.charName'
    if 'charclass' in path or 'char_class' in path:
        return 'ui.charClass'
    if 'level' in path:
        return 'ui.charLevel'
    if 'soulstone' in path or 'soul_stone' in path:
        return 'ui.soulStones'
    if 'version' in path:
        return 'ui.appVersion'
    if 'title' in path:
        return 'ui.areaTitle'
    if 'playerinfo' in path:
        return 'ui.areaPlayerInfo'

    # ===== 优先级 2：文本内容推断 =====
    cn_map = {
        '跳过': 'ui.skip',
        '正在加载': 'ui.loading',
        '商店': 'ui.mainShop',
        '角色': 'ui.mainCharacter',
        '日志': 'ui.mainLog',
        '设置': 'ui.mainSettings',
        '开始冒险': 'ui.areaStart',
        '开始游戏': 'ui.mainStart',
        '返回': 'ui.areaBack',
        '出征': 'ui.mainStart',
        'Adventurer': 'ui.charName',
        'Bear Warrior': 'ui.charClass',
        'Lv': 'ui.charLevel',
        'Soul Stones': 'ui.soulStones',
        'v0.1.0': 'ui.appVersion',
    }
    for val, key in cn_map.items():
        if text.startswith(val):
            return key

    # ===== 优先级 3：fallback =====
    safe = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fff]', '_', text)[:20]
    return f'scene.{safe}'


def scan_scene(filepath: str, text_rev: dict) -> list:
    """扫描一个 .scene 文件，返回 [(node_path, text, suggested_key, text_key_status), ...]"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nodes = {}
    for i, entry in enumerate(data):
        if isinstance(entry, dict) and entry.get('__type__') == 'cc.Node':
            node_id = entry.get('_id$Serializable', str(i))
            parent = entry.get('_parent', {})
            parent_id = parent.get('__id__', parent.get('id', None))
            nodes[node_id] = {
                'name': entry.get('_name', '?'),
                'parent_id': parent_id,
                'index': i,
            }

    def get_path(node_id):
        if node_id not in nodes:
            return ''
        parts = []
        current = node_id
        while current in nodes:
            n = nodes[current]
            parts.append(n['name'])
            pid = n['parent_id']
            if pid is None or pid == current:
                break
            current = str(pid) if not isinstance(pid, str) else pid
        return '/'.join(reversed(parts))

    results = []
    for i, entry in enumerate(data):
        if isinstance(entry, dict) and entry.get('__type__') and entry['__type__'].endswith('cc.Label'):
            text = entry.get('_string', '')
            if text and not is_ignorable(text):
                node_id = entry.get('node', {}).get('__id__')
                node_path = get_path(str(node_id)) if node_id else ''

                # 先算 key（路径优先，不依赖 text.json 反向映射）
                suggested = suggest_key(text, node_path)

                # 再查 text.json 是否存在此 key
                text_key_status = 'exists' if text_rev.get(text) else 'unknown'
                # 如果 path 规则给的 key 在 text.json 中也存在，标记为 exists
                for tv, tk in text_rev.items():
                    if tk == suggested:
                        text_key_status = 'exists'
                        break

                results.append((node_path, text, suggested, text_key_status))

    return results


def main():
    text_rev = load_text_json()
    all_rows = []

    for sp in SCENES:
        if not os.path.exists(sp):
            print(f'[SKIP] {sp} not found')
            continue
        labels = scan_scene(sp, text_rev)
        print(f'[SCAN] {sp}: {len(labels)} labels')
        for node_path, text, suggested, text_key_status in labels:
            component_status = 'dynamic' if node_path in DYNAMIC_NODES else 'pending'
            all_rows.append((sp, node_path, text, suggested, text_key_status, component_status))

    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['scene_path', 'node_path', 'current_text', 'suggested_key',
                     'text_key_status', 'component_status'])
        w.writerows(all_rows)

    print(f'\n[CSV] 写入 {OUTPUT_CSV}: {len(all_rows)} 行')

    # 汇总
    pending = [r for r in all_rows if r[5] == 'pending']
    dynamic = [r for r in all_rows if r[5] == 'dynamic']
    print(f'\n[SUMMARY] 总计 {len(all_rows)} 个 Label:')
    print(f'  需要挂 LocalizedLabel: {len(pending)} 个')
    for r in pending:
        status = 'key✅' if r[4] == 'exists' else 'KEY缺失⚠️'
        print(f'    {r[1]:50s} {r[3]:25s} {status}')
    print(f'  动态文本(不挂组件): {len(dynamic)} 个')
    for r in dynamic:
        print(f'    {r[1]:50s} {r[3]:25s} 代码刷新')
    return 0


if __name__ == '__main__':
    sys.exit(main())
