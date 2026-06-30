"""清理 runtime_replace: 保留已生成文件, 移除错误复制的旧资源"""
import json, os, shutil, csv

replace = r"E:\game\回到地面\art_source\textures_export\runtime_replace"
csv_path = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"

# 收集真正生成的文件
gen = set()
for pf in ['phase3_progress.json', 'phase4b_progress.json', 'phase6_progress.json']:
    p = os.path.join(r'E:\.workbuddy', pf)
    if os.path.exists(p):
        with open(p) as f:
            gen.update(json.load(f)['generated'].keys())

# Phase 4a resize_export 也加到已生成
with open(csv_path, encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        if row['action'] == 'resize_export':
            gen.add(row['path'].replace('\\', '/'))

print(f"已生成文件: {len(gen)} 个")

# 扫描 runtime_replace
replace_files = set()
for root, dirs, files in os.walk(replace):
    for f in files:
        if f.endswith('.png'):
            rel = os.path.relpath(os.path.join(root, f), replace).replace('\\', '/')
            replace_files.add(rel)

print(f"runtime_replace 当前: {len(replace_files)} 个")

# 找出 234 个生成文件 vs 184 个复制文件
actually_generated = replace_files & gen
copied_old = replace_files - gen

print(f"\n实际由脚本生成的: {len(actually_generated)}")
print(f"从旧 textures 复制来的: {len(copied_old)}")

# 删除复制来的旧资源
deleted = 0
for rel in copied_old:
    fpath = os.path.join(replace, rel.replace('/', os.sep))
    if os.path.exists(fpath):
        os.remove(fpath)
        deleted += 1
        # 如果目录空了也清理
        d = os.path.dirname(fpath)
        while d.startswith(replace):
            if os.listdir(d):
                break
            os.rmdir(d)
            d = os.path.dirname(d)

print(f"已删除: {deleted} 个")

# 重新统计
replace_after = set()
for root, dirs, files in os.walk(replace):
    for f in files:
        if f.endswith('.png'):
            rel = os.path.relpath(os.path.join(root, f), replace).replace('\\', '/')
            replace_after.add(rel)

print(f"清理后 runtime_replace: {len(replace_after)} 个")

# 输出缺失清单
with open(csv_path, encoding='utf-8-sig') as f:
    csv_paths = {r['path'].replace('\\', '/') for r in csv.DictReader(f)}

missing = sorted(csv_paths - replace_after)
if missing:
    print(f"\n仍缺失: {len(missing)} 张")
    from collections import Counter
    for cat, cnt in sorted(Counter(p.split('/')[0] for p in missing).items()):
        print(f"  {cat}: {cnt}")
else:
    print(f"\n全部完成! runtime_replace={len(replace_after)} CSV={len(csv_paths)}")
