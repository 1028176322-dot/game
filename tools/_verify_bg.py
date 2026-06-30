import csv
with open(r'E:\game\回到地面\art_source\textures_audit_manifest.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))
bgs = [r for r in rows if r['path'].startswith('backgrounds')]
for r in bgs[:2]:
    print(f'{r["path"]}: bundle={r["bundle"]} action={r["action"]} target={r["target_w"]}x{r["target_h"]} ~{r["target_size_kb"]}KB note={r["note"]}')
total = sum(float(r['target_size_kb']) for r in bgs)
print(f'总目标: {total:.0f}KB ({total/1024:.1f}MB)')
