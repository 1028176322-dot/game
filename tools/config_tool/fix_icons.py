"""Batch resize oversized icon files to 64x64 RGBA"""
import os
from PIL import Image

dirs = ['icons/abilities', 'icons/relics']
base = r'E:/game/回到地面/assets/resources/textures'

fixed = 0
for d in dirs:
    full = os.path.join(base, d)
    for f in os.listdir(full):
        if not f.endswith('.png'):
            continue
        path = os.path.join(full, f)
        img = Image.open(path)
        w, h = img.size
        
        needs_fix = False
        if w > 128 or h > 128:
            img = img.resize((64, 64), Image.NEAREST)
            needs_fix = True
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
            needs_fix = True
        
        if needs_fix:
            img.save(path)
            new_size = os.path.getsize(path)
            print(f'修复: {d}/{f}  {w}x{h} -> 64x64 RGBA ({new_size//1024}KB)')
            fixed += 1

print(f'\n完成: 修复 {fixed} 个文件')
