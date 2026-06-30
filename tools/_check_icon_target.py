import csv
with open(r'E:\game\回到地面\art_source\textures_audit_manifest.csv', encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        if 'icon_item_key' in r['path']:
            print(f'{r["path"]}: target={r["target_w"]}x{r["target_h"]} action={r["action"]} grade={r["grade"]}')
            break
    for r in csv.DictReader(f):
        if 'icon_buff_atkup' in r['path']:
            print(f'{r["path"]}: target={r["target_w"]}x{r["target_h"]} action={r["action"]} grade={r["grade"]}')
            break
