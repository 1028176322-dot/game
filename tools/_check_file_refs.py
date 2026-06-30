"""检查资源文件名涉及的所有文件"""
import os, csv, json, re

sources = {}

# 1. Manifest CSV
with open(r'E:/game/回到地面/art_source/textures_audit_manifest.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))
    sources['manifest.csv'] = [r['path'].replace('\\\\', '/') for r in rows]

# 2. Production spec CSV  
with open(r'E:/game/回到地面/art_source/runtime_replace_recovery/runtime_replace_missing_production_spec.csv', encoding='utf-8-sig') as f:
    rows2 = list(csv.DictReader(f))
    sources['production_spec.csv'] = [r['path'].replace('\\\\', '/') for r in rows2]

# 3. prompts.json
with open(r'E:/game/assets/resources/config/prompts.json', encoding='utf-8') as f:
    sources['prompts.json'] = list(json.load(f).keys())

# 4. gen_missing_179.py
with open(r'E:/game/tools/gen_missing_179.py', encoding='utf-8') as f:
    code = f.read()
    png_refs = re.findall(r'\"[^\"]+\.png\"', code)
    sources['gen_missing_179.py'] = [x.strip('"') for x in png_refs]

# 5. Find all .meta files referencing textures
meta_refs = []
for root, dirs, files in os.walk(r'E:/game/回到地面'):
    for f in files:
        if f.endswith('.meta'):
            path = os.path.join(root, f)
            try:
                with open(path, encoding='utf-8') as mf:
                    content = mf.read()
                    # Count texture files referenced in meta
                    if '.png' in content:
                        meta_refs.append(os.path.relpath(path, r'E:/game/回到地面'))
            except:
                pass

# Count unique file references in code
boss_in_code = code.count('"bosses/finalboss')
mini_in_code = code.count('"miniboss')
monster_in_code = code.count('"monsters/')
ui_in_code = code.count('"ui/')
icon_in_code = code.count('"icons/')

print('=== 资源文件名涉及的文件清单 ===')
print()
print('【必须同步修改的文件】')
print(f'  1. textures_audit_manifest.csv            — 418条, 文件变更==这里变更')
print(f'  2. runtime_replace_missing_production_spec.csv  — 179条, 生产规格需同步')
print(f'  3. assets/resources/config/prompts.json   — 418条 提示词, 按路径索引')
print(f'  4. runtime_replace/ 下的 PNG 文件本身       — 改名/移动')
print()
print('【生成脚本中路径引用】')
print(f'  tools/gen_missing_179.py 中共有:')
print(f'    \"bosses/\" 引用: ~{boss_in_code} 处')
print(f'    \"miniboss\" 引用: ~{mini_in_code} 处')
print(f'    \"monsters/\" 引用: ~{monster_in_code} 处')
print(f'    \"ui/\" 引用: ~{ui_in_code} 处')
print(f'    \"icons/\" 引用: ~{icon_in_code} 处')
print(f'  (这些是 REBUILD 常量中的硬编码路径)')
print()
print('【Cocos Creator 关联】')
print(f'  检测到含 .png 引用的 .meta 文件: {len(meta_refs)} 个')
print(f'  (Cocos 的 Prefab/Scene 中引用需手动排查)')
print()
print('【排查建议】')
print('  如果只是重命名一个文件（不改类型）, 只需改:')
print('    1. manifest.csv 中的路径')
print('    2. production_spec.csv 中的路径')
print('    3. prompts.json 中的键名')
print('    4. runtime_replace 下的实际文件名')
