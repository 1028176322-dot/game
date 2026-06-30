import json, os
from PIL import Image

with open(r'E:/game/.workbuddy/gen_missing_progress.json') as f:
    progress = json.load(f)

new_paths = set(progress.get('completed_paths', []))
print(f'本次生成的新图片: {len(new_paths)} 张')
print()

replace_dir = r'E:/game/回到地面/art_source/textures_export/runtime_replace'

new_dark = 0
new_total = 0
old_dark = 0
old_total = 0

for root, dirs, files in os.walk(replace_dir):
    for f in files:
        if not f.lower().endswith('.png'):
            continue
        path = os.path.join(root, f)
        rel = os.path.relpath(path, replace_dir)
        rel_unix = rel.replace(os.sep, '/')
        
        im = Image.open(path).convert('RGBA')
        im.load()
        
        xs = [int(im.size[0]*i/10) for i in range(10)]
        ys = [int(im.size[1]*i/10) for i in range(10)]
        samples = []
        for x in xs:
            for y in ys:
                if x < im.size[0] and y < im.size[1]:
                    p = im.getpixel((x,y))
                    samples.append(p[:3])
        
        brightness = sum(sum(p)/3 for p in samples) / len(samples)
        
        if rel_unix in new_paths:
            new_total += 1
            if brightness < 100:
                new_dark += 1
        else:
            old_total += 1
            if brightness < 100:
                old_dark += 1

print(f'新图片: {new_total} 张, 暗色调: {new_dark}')
print(f'旧图片: {old_total} 张, 暗色调: {old_dark}')
