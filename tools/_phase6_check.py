import csv
from collections import Counter

with open(r'E:\game\回到地面\art_source\textures_audit_manifest.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

effects = [r for r in rows if r['path'].startswith('effects')]
print(f'特效: {len(effects)} 个')
print(f'动作分布:')
for a, c in Counter(r['action'] for r in effects).items():
    print(f'  {a}: {c}')

print(f'\nreplace 特效:')
for r in effects:
    if r['action'] == 'replace':
        print(f'  {r["path"]}: {r["width"]}x{r["height"]} -> target {r["target_w"]}x{r["target_h"]} ~{r["target_size_kb"]}KB')

print(f'\ntiles:')
tiles = [r for r in rows if r['path'].startswith('tiles')]
print(f'  数量: {len(tiles)}')
for r in tiles[:2]:
    print(f'  {r["path"]}: {r["width"]}x{r["height"]} action={r["action"]}')
