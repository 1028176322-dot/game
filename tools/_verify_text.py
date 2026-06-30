import csv
from collections import Counter

with open(r'E:\game\回到地面\art_source\textures_audit_manifest.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

cols = list(rows[0].keys())
print(f'列数: {len(cols)}')
print(f'列名: {cols}\n')

for field in ['has_text', 'text_type', 'text_language', 'text_action']:
    c = Counter(r[field] for r in rows)
    print(f'{field}:')
    for k, v in sorted(c.items()):
        print(f'  {k:12s}: {v}')
    print()

print('suspected 样例:')
s = [r for r in rows if r['has_text'] == 'suspected']
for r in s[:3]:
    print(f'  {r["path"]}: type={r["text_type"]} lang={r["text_language"]} action={r["text_action"]} note={r["text_note"]}')
