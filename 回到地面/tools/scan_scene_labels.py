#!/usr/bin/env python3
"""
场景文本迁移工具 — 阶段 1：扫描

扫描 splash.scene / main.scene / dungeon.scene
提取所有 cc.Label 节点的 _string 字段
输出 CSV: scene_path, node_path, current_text, suggested_key, status

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

# 已存在于 text.json 中的 key -> value 映射（运行时读取）
TEXT_JSON_PATH = 'assets/resources/config/text.json'

# 忽略的短文本（空串、纯数字、纯符号）
IGNORE_PATTERNS = [
    r'^\s*$', r'^\d+$', r'^[\>\<\-\=\.\,\!\?]+$', r'^\s*$',
]


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
    """根据文本内容和节点路径推测合适的 key"""
    path = node_path.lower()
    
    # 根据路径推断
    if 'start' in path and ('btn' in path or 'button' in path):
        return 'ui.mainStart'
    if 'back' in path and ('btn' in path or 'button' in path):
        return 'ui.areaBack'
    if 'shop' in path and ('btn' in path or 'button' in path):
        return 'ui.mainShop'
    if 'character' in path and ('btn' in path or 'button' in path):
        return 'ui.mainCharacter'
    if 'log' in path and ('btn' in path or 'button' in path):
        return 'ui.mainLog'
    if 'setting' in path:
        return 'ui.mainSettings'
    if 'skip' in path:
        return 'ui.skip'
    if 'loading' in path:
        return 'ui.loading'
    if 'playerinfo' in path or 'player_info' in path:
        return 'ui.areaPlayerInfo'
    if 'title' in path:
        return 'ui.areaTitle'
    if 'level' in path:
        return 'ui.charLevel'
    if 'version' in path:
        return 'ui.appVersion'
    if 'soulstone' in path or 'soul_stone' in path:
        return 'ui.soulStones'
    if 'charclass' in path or 'char_class' in path:
        return 'ui.charClass'
    if 'charname' in path or 'char_name' in path:
        return 'ui.charName'
    
    # 根据文本内容推断
    cn_map = {
        '跳过': 'ui.skip',
        '正在加载': 'ui.loading',
        '商店': 'ui.mainShop',
        '角色': 'ui.mainCharacter',
        '日志': 'ui.mainLog',
        '设置': 'ui.mainSettings',
        '开始冒险': 'ui.areaStart',
        '返回': 'ui.areaBack',
        '出征': 'ui.mainStart',
        'Adventurer': 'ui.charName',
        'Bear Warrior': 'ui.charClass',
    }
    for val, key in cn_map.items():
        if text.startswith(val):
            return key
    
    # fallback: hash as unique key
    safe = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fff]', '_', text)[:20]
    return f'scene.{safe}'


def scan_scene(filepath: str) -> list:
    """扫描一个 .scene 文件，返回 [(node_path, text), ...]"""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 构建节点层级映射
    nodes = {}
    for i, entry in enumerate(data):
        if isinstance(entry, dict) and entry.get('__type__') == 'cc.Node':
            node_id = entry.get('_id$Serializable', str(i))
            parent = entry.get('_parent', {})
            parent_id = parent.get('__id__', parent.get('id', None))
            nodes[node_id] = {
                'name': entry.get('_name', '?'),
                'parent_id': parent_id,
                'components': entry.get('_components', []),
                'index': i,
            }
    
    # 构建从根到节点的路径
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
    
    # 查找所有 cc.Label 类型的组件
    for i, entry in enumerate(data):
        if isinstance(entry, dict) and entry.get('__type__') and entry['__type__'].endswith('cc.Label'):
            # Label 组件的 _string 字段
            text = entry.get('_string', '')
            if text and not is_ignorable(text):
                node_id = entry.get('node', {}).get('__id__')
                node_path = get_path(str(node_id)) if node_id else ''
                results.append((node_path, text))
    
    return results


def main():
    text_rev = load_text_json()
    all_rows = []
    seen_texts = {}  # text -> suggested_key
    
    for sp in SCENES:
        if not os.path.exists(sp):
            print(f'[SKIP] {sp} not found')
            continue
        labels = scan_scene(sp)
        print(f'[SCAN] {sp}: {len(labels)} labels')
        for node_path, text in labels:
            # 检查是否已存在于 text.json
            existing_key = text_rev.get(text, '')
            if existing_key:
                suggested = existing_key
                status = 'already_migrated'
            else:
                if text not in seen_texts:
                    seen_texts[text] = suggest_key(text, node_path)
                suggested = seen_texts[text]
                status = 'pending'
            all_rows.append((sp, node_path, text, suggested, status))
    
    # 写入 CSV
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['scene_path', 'node_path', 'current_text', 'suggested_key', 'status'])
        w.writerows(all_rows)
    
    print(f'\n[CSV] 写入 {OUTPUT_CSV}: {len(all_rows)} 行')
    
    # 汇总 pending 文本
    pending_texts = [(t, k) for t, k in seen_texts.items() if t not in text_rev]
    if pending_texts:
        print(f'\n[PENDING] 需要迁移到 text.json 的文本 ({len(pending_texts)} 个):')
        for text, key in pending_texts:
            print(f'  {key:30s} = "{text}"')
    else:
        print('\n[DONE] 所有文本已在 text.json 中')
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
