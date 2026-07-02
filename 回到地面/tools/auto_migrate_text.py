#!/usr/bin/env python3
"""
场景文本迁移工具 — 阶段 2：自动迁移

1. 给 text.json 补充缺失的文本 key
2. 输出场景迁移清单（给用户手动在编辑器操作）

用法:
    cd 回到地面
    python tools/auto_migrate_text.py

输出:
    - 自动更新 text.json
    - 生成 tools/migration_guide.md（编辑器操作清单）
"""

import json
import os
import csv

SCENE_PATH = 'assets/resources/config/text.json'
CSV_PATH = 'tools/text_migration.csv'
GUIDE_PATH = 'tools/migration_guide.md'

# 待补充的 new keys: {key: text}
NEW_KEYS = {
    'ui.mainStart': '出征',
    'ui.charName': '{name}',
    'ui.charClass': '{class}',
    'ui.charLevel': 'Lv{level}',
    'ui.soulStones': '魂石: {count}',
    'ui.appVersion': 'v0.1.0',
    'ui.skip': '跳过',
    'ui.loading': '正在加载...',
}


def patch_text_json():
    """把缺失的 key 补充到 text.json"""
    with open(SCENE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    added = 0
    for key, value in NEW_KEYS.items():
        parts = key.split('.')
        current = data
        for p in parts[:-1]:
            if p not in current:
                current[p] = {}
            current = current[p]
        leaf = parts[-1]
        if leaf not in current:
            current[leaf] = value
            added += 1
            print(f'  [+] {key} = "{value}"')
        else:
            print(f'  [=] {key} already exists: "{current[leaf]}"')

    with open(SCENE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f'\n[text.json] 新增 {added} 个 key')
    return added > 0


def generate_migration_guide():
    """生成编辑器操作清单"""
    rows = []
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    pending = [r for r in rows if r['suggested_key'] not in [
        'scene.label',  # 占位文本，忽略
    ]]

    with open(GUIDE_PATH, 'w', encoding='utf-8') as f:
        f.write('# 场景文本迁移操作清单\n\n')
        f.write('> 所有固定 Label 都需要挂 LocalizedLabel 组件\n')
        f.write('> 动态文本节点（StatusLabel、PlayerInfo）由代码刷新，不需要挂\n\n')
        f.write('## 操作说明\n\n')
        f.write('1. 打开对应场景文件\n')
        f.write('2. 在层级管理器找到节点路径\n')
        f.write('3. 选中该节点 → 添加组件 → LocalizedLabel\n')
        f.write('4. 在 textKey 字段填入对应的 key\n\n')
        f.write('---\n\n')

        for r in rows:
            np = r['node_path']
            txt = r['current_text']
            sk = r['suggested_key']
            cs = r['component_status']
            ts = r['text_key_status']
            
            if cs == 'dynamic':
                tag = '⏭️ 动态文本（代码刷新，不挂组件）'
            elif ts == 'exists':
                tag = '📦 需挂 LocalizedLabel（key 已存在）'
            else:
                tag = '🚨 需挂 LocalizedLabel（key 也缺失，请确认）'

            f.write(f'### {np}  {tag}\n\n')
            f.write(f'| 字段 | 值 |\n')
            f.write(f'|------|-----|\n')
            f.write(f'| 场景 | `{r["scene_path"]}` |\n')
            f.write(f'| 节点路径 | `{np}` |\n')
            f.write(f'| 当前文本 | `{txt}` |\n')
            f.write(f'| textKey | `{sk}` |\n')
            f.write(f'| 操作 | {"跳过（代码刷新）" if cs == "dynamic" else f"添加组件→LocalizedLabel→填入{sk}"} |\n\n')

        f.write('---\n\n')
        f.write('## 验证\n\n')
        f.write('```bash\n')
        f.write('python tools/check_hardcoded_text.py\n')
        f.write('npm.cmd run validate:all\n')
        f.write('```\n')

    print(f'\n[GUIDE] 生成 {GUIDE_PATH}: {len(pending)} 项')
    return GUIDE_PATH


def main():
    print('=== 阶段 2：文本自动迁移 ===\n')
    print('[1/2] 补充 text.json...')
    patched = patch_text_json()
    
    print(f'\n[2/2] 生成迁移清单...')
    guide = generate_migration_guide()
    
    print(f'\n=== 完成 ===')
    if patched:
        print('text.json 已更新，请 commit')
    print(f'迁移清单: {guide}')
    print('请在编辑器中按清单逐项操作')


if __name__ == '__main__':
    main()
