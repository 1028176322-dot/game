"""Art resource audit script - check naming, dimensions, format, file size"""
import os, re
from PIL import Image

base = r'assets/resources/textures'
total = 0
issues = []

for root, dirs, files in os.walk(base):
    for f in files:
        if not f.endswith('.png') or f == '.gitkeep':
            continue
        total += 1
        path = os.path.join(root, f)
        rel = os.path.relpath(path, base)

        name_bad = []
        if re.search(r'[\u4e00-\u9fff]', f):
            name_bad.append('含中文')
        if ' ' in f:
            name_bad.append('含空格')
        if f != f.lower():
            name_bad.append('含大写字母')

        try:
            img = Image.open(path)
            w, h = img.size
            mode = img.mode
            fsize = os.path.getsize(path)
            spec_issue = ''
            if mode not in ('RGBA', 'RGB'):
                spec_issue += f'颜色模式={mode} '
            if fsize > 500 * 1024:
                spec_issue += f'文件过大({fsize // 1024}KB) '

            if name_bad or spec_issue:
                issues.append((rel, f'{w}x{h}', mode, f'{fsize // 1024}KB', name_bad, spec_issue))
        except Exception as e:
            issues.append((rel, 'ERR', '', '', [str(e)], ''))

print(f'总文件数: {total}')
print(f'有问题的: {len(issues)}')
print()

# 按目录分组输出
if issues:
    print('=== 问题列表 ===')
    for rel, dims, mode, fsize, names, spec in issues:
        print(f'\n  {rel}')
        if dims != 'ERR':
            print(f'    规格: {dims} {mode} {fsize}')
        if names:
            print(f'    命名: {" | ".join(names)}')
        if spec:
            print(f'    异常: {spec}')
else:
    print('所有文件通过检查 ✅')

# 输出汇总统计
print()
print('=== 按目录统计 ===')
dirs_seen = {}
for root, dirs, files in os.walk(base):
    for f in files:
        if not f.endswith('.png') or f == '.gitkeep':
            continue
        d = os.path.relpath(root, base)
        dirs_seen[d] = dirs_seen.get(d, 0) + 1
for d, c in sorted(dirs_seen.items()):
    print(f'  {d}: {c} files')
