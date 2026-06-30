import csv
from collections import Counter

rows = []
with open(r'E:\game\回到地面\art_source\textures_audit_manifest.csv', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

print("=== v3 最终验证 ===")

# 1. Boss unknown 解了吗
unknown_boss = [r for r in rows if r['bundle'] == 'bundle_boss_unknown']
print(f"\n1. bundle_boss_unknown: {len(unknown_boss)} 个")
if unknown_boss:
    for r in unknown_boss[:3]:
        print(f"   {r['path']}")

# 2. 关键 bundle 体积
print(f"\n2. 关键 bundle 目标体积:")
for target_bundle in ['bundle_core_battle', 'bundle_bg', 'bundle_ui', 'bundle_effects']:
    items = [r for r in rows if r['bundle'] == target_bundle]
    tkb = sum(float(r['target_size_kb']) for r in items)
    print(f"   {target_bundle:25s}: {len(items):>3} files, target {tkb:>8.1f}KB ({tkb/1024:.1f}MB)")

# 3. 背景 vs 之前 1041KB
bgs = [r for r in rows if r['path'].startswith('backgrounds')]
print(f"\n3. 背景目标体积:")
for r in bgs[:3]:
    tkb = r['target_size_kb']
    print(f"   {r['path']}: {r['width']}x{r['height']} -> {r['target_w']}x{r['target_h']} ~{tkb}KB")

# 4. Boss 分级汇总
bosses = [r for r in rows if r['path'].startswith('bosses')]
print(f"\n4. Boss 分级:")
for k, v in sorted(Counter(r['grade']+'/'+r['action'] for r in bosses).items()):
    print(f"   {k}: {v}")

# 5. used_by=unknown 分布
unknown = [r for r in rows if r['used_by'] == 'unknown']
print(f"\n5. used_by=unknown: {len(unknown)} 个 -> 全部 B 级 + defer")
if unknown:
    for r in unknown[:3]:
        print(f"   {r['path']}: grade={r['grade']}, action={r['action']}")
