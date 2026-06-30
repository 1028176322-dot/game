"""Verify monster config <-> file mapping consistency"""
import json, os

# Load configs
config_dir = r'E:/game/回到地面/assets/resources/config'
textures_dir = r'E:/game/回到地面/assets/resources/textures/monsters'

with open(os.path.join(config_dir, 'monsters.json'), 'r', encoding='utf-8') as f:
    monsters = json.load(f)

with open(os.path.join(config_dir, 'zones.json'), 'r', encoding='utf-8') as f:
    zones = json.load(f)

print('=== 检查 monsters.json 配置与 PNG 文件 ===')

issues = []
zone_monster_map = {}

# Build expected file list from config
for zone_key, zone_data in monsters.items():
    if zone_key in ('metadata',):
        continue
    zone_monster_map[zone_key] = {}
    for monster_id, monster_data in zone_data.items():
        expected_file = f'monster_{zone_key}_{monster_id}_idle.png'
        zone_monster_map[zone_key][monster_id] = expected_file

# Check actual files
all_correct = True
for zone_key, monster_dict in zone_monster_map.items():
    zone_dir = os.path.join(textures_dir, zone_key)
    if not os.path.isdir(zone_dir):
        issues.append(f'目录缺失: {zone_dir}')
        continue
    actual_files = set(os.listdir(zone_dir))
    for monster_id, expected in monster_dict.items():
        if expected not in actual_files:
            # try all lowercase
            expected_lower = expected.lower()
            if expected_lower in actual_files:
                pass  # ok
            else:
                # find similar files
                similar = [f for f in actual_files if monster_id.lower() in f.lower()]
                issues.append(f'缺失: {zone_key}/{expected}')
                if similar:
                    issues.append(f'  近似文件: {similar}')
                all_correct = False

# Check zones.json monsterPool against monsters.json
print('=== 检查 zones.json 引用一致性 ===')
zone_pool_issues = []
for zone_key, zone_data in zones.get('zones', {}).items():
    monster_pool = zone_data.get('monsterPool', [])
    for m_id in monster_pool:
        if m_id not in monsters.get(zone_key, {}):
            zone_pool_issues.append(f'zones.json -> {zone_key}.monsterPool 引用了 "{m_id}" 但 monsters.json 中不存在')

    # Check miniBoss references
    stages = zone_data.get('stages', {})
    for stage_id, stage_data in stages.items():
        mb = stage_data.get('miniBoss', '')
        if mb:
            expected_miniboss_file = f'miniboss_{mb}_idle.png'
            # Can't verify file easily, just note it

if zone_pool_issues:
    for i in zone_pool_issues:
        print(f'  ❌ {i}')
else:
    print(f'  ✅ 所有 zones.json 引用的怪物 ID 在 monsters.json 中都有定义')

if issues:
    print(f'\n=== 文件缺失问题 ===')
    for i in issues:
        print(f'  {i}')
else:
    print(f'\n✅ 所有 monsters.json 中定义的怪物都有对应的 PNG 文件')

# Summary
total_expected = sum(len(v) for v in zone_monster_map.values())
total_actual = sum(len(os.listdir(os.path.join(textures_dir, z))) for z in zone_monster_map if os.path.isdir(os.path.join(textures_dir, z)))
print(f'\n配置定义: {total_expected} 种怪物')
print(f'实际文件: {total_actual} 个')
print(f'问题数: {len(issues)}')
