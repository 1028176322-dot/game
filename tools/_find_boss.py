import csv
with open(r'E:\game\回到地面\art_source\textures_audit_manifest.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

# 只检查 S-grade replace 且 fc>1 的序列帧
print('=== S-grade replace 序列帧的一致性 ===')
bad = 0
for r in rows:
    if r['grade'] == 'S' and r['action'] == 'replace' and int(r['frame_count']) > 1:
        tfh = int(r['frame_h'])
        fc = int(r['frame_count'])
        th = int(r['target_h'])
        expected_th = tfh * fc
        if r['layout'] == 'vertical' and abs(expected_th - th) > 2:
            bad += 1
            print(f'  ❌ {r["path"]}: target_h={th} vs tfh*fc={expected_th}')

if bad == 0:
    print(f'  ✅ 全部一致 (S-replace fc>1: target_h = frame_h × frame_count)')

# 核心样例展示
print('\n=== 样例验证 ===')
samples = [
    'bosses/finalboss/catacombs/boss_skeletonlord_idle.png',
    'characters/warrior/warrior_idle.png',
    'effects/combat/fx_crit.png',
    'characters/warrior/warrior_hit.png',
]
for sp in samples:
    for r in rows:
        if r['path'] == sp:
            print(f'{r["path"]}')
            print(f'  source_frame: {r["source_frame_w"]}x{r["source_frame_h"]}')
            print(f'  frame_w/frame_h (target frame): {r["frame_w"]}x{r["frame_h"]}')
            print(f'  target整图: {r["target_w"]}x{r["target_h"]}')
            print(f'  fc={r["frame_count"]} layout={r["layout"]} grade={r["grade"]} action={r["action"]}')
            break
