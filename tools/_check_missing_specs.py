"""从主 CSV 查询缺失资源的完整制作参数"""
import csv

missing_path = r"E:\game\回到地面\art_source\runtime_replace_recovery\runtime_replace_missing_after_cleanup.csv"
main_csv     = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"

# 读缺失清单
with open(missing_path, encoding='utf-8-sig') as f:
    missing = {row['path'] for row in csv.DictReader(f)}

# 读主 CSV 构建索引
index = {}
with open(main_csv, encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        index[row['path']] = row

# 统计
from collections import Counter
cats = Counter()

print(f"缺失总数: {len(missing)}\n")

# 按分类展示关键制作参数
for rel in sorted(missing):
    if rel not in index:
        print(f"  [WARN] 主 CSV 找不到: {rel}")
        continue
    r = index[rel]
    cat = r['category']
    cats[cat] += 1
    
    w, h = r['target_w'], r['target_h']
    fw, fh, fc = r['frame_w'], r['frame_h'], r['frame_count']
    alpha = r['has_alpha']
    grade = r['grade']
    act = r['action']
    tkb = r['target_size_kb']
    bundle = r['bundle']
    atlas = r['atlas_group']
    lay = r['layout']
    
    print(f"{cat:15s} {rel:50s} target={w}x{h} frame={fw}x{fh}x{fc} {lay:8s} alpha={alpha:5s} grade={grade} action={act:15s} ~{tkb}KB")

print(f"\n分类统计:")
for c, n in sorted(cats.items()):
    print(f"  {c}: {n}")
