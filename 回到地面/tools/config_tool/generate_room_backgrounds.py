#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成房间背景 (Room Backgrounds)
共 22 张，放入 backgrounds 目录
"""
import os
from PIL import Image, ImageDraw

BASE = os.path.join(os.getcwd(), 'assets', 'resources', 'textures', 'backgrounds')

COLORS = {
    'forest':('#4A7A4A','#8BAA7A','#2D5A2D'),
    'catacombs':('#6A5A7A','#9A8AAA','#3D3A5A'),
    'volcano':('#8B4513','#CD853F','#6B3410'),
    'tundra':('#6A8CAF','#A0C4E8','#3A5A7A'),
    'swamp':('#5A7A3A','#8BAA5A','#3A5A2A'),
    'abyss':('#3A2A5A','#6A4A8A','#1A0A2A'),
}

def hex_to_rgba(h, alpha=255):
    h = h.lstrip('#')
    return (int(h[0:2],16), int(h[2:4],16), int(h[4:6],16), alpha)

def gen_bg(compress_dir, filename, base_color, accent_color, detail_func=None):
    os.makedirs(os.path.join(BASE, compress_dir), exist_ok=True)
    w, h = 750, 500
    img = Image.new('RGBA', (w, h), hex_to_rgba(base_color, 200))
    draw = ImageDraw.Draw(img)
    # 渐变
    for y in range(h):
        ratio = y / h
        r = int(hex_to_rgba(base_color)[0] * (1-ratio*0.3) + hex_to_rgba(accent_color)[0] * ratio*0.3)
        g = int(hex_to_rgba(base_color)[1] * (1-ratio*0.3) + hex_to_rgba(accent_color)[1] * ratio*0.3)
        b = int(hex_to_rgba(base_color)[2] * (1-ratio*0.3) + hex_to_rgba(accent_color)[2] * ratio*0.3)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 180))
    # 装饰细节
    if detail_func:
        detail_func(draw, w, h)
    # 暗角
    for i in range(20):
        alpha = int(100 * (1 - i/20))
        draw.rectangle([0, i-1, w, h-i+1], fill=(0,0,0,alpha))
        draw.rectangle([i-1, 0, w-i+1, h], fill=(0,0,0,alpha))
    filepath = os.path.join(BASE, compress_dir, filename)
    img.save(filepath, 'PNG')
    size = os.path.getsize(filepath)
    print(f"  [OK] {compress_dir}/{filename} ({w}x{h}, {size}B)")
    return filepath

def bg_detail_forest(draw, w, h):
    # 树木剪影
    for x in [50, 150, 300, 500, 650]:
        for i in range(5):
            draw.ellipse([x-20+i*3, h-100-i*30, x+20-i*3, h-50-i*20], fill=(45,80,45,150))

def bg_detail_catacombs(draw, w, h):
    # 石柱
    for x in [80, 250, 500, 680]:
        draw.rectangle([x-15, h-150, x+15, h], fill=(80,70,90,180))
        draw.ellipse([x-20, h-160, x+20, h-140], fill=(100,90,110,180))

def bg_detail_volcano(draw, w, h):
    # 岩浆裂缝
    for y in [h-80, h-120, h-200]:
        draw.line([(0, y), (w*0.3, y+10), (w*0.5, y-5), (w, y+15)], fill=(200,100,30,120), width=3)

def bg_detail_tundra(draw, w, h):
    # 雪花点缀
    for _ in range(30):
        x = int(w * (1 - _/30))
        y = int(h * (0.2 + (_%5)*0.15))
        draw.ellipse([x-2, y-2, x+2, y+2], fill=(220,240,255,150))

def bg_detail_swamp(draw, w, h):
    # 水波纹
    for y in range(h-100, h, 20):
        draw.arc([0, y, w, y+15], 0, 180, fill=(80,120,50,100), width=2)

def bg_detail_abyss(draw, w, h):
    # 虚空裂隙
    for i in range(5):
        y = int(h * 0.3 + i * 60)
        draw.line([(0, y), (w*0.4, y+10+i*5), (w*0.6, y-10-i*3), (w, y+5)], fill=(100,60,140,80), width=2)

def bg_detail_generic(draw, w, h):
    # 通用纹理
    for x in range(0, w, 40):
        for y in range(0, h, 30):
            draw.rectangle([x, y, x+20, y+15], fill=hex_to_rgba('#8B7355', 40))

# === 生成战斗房背景 ===
print("=== 战斗房背景 ===")
for zone, key in [('forest','forest'),('catacombs','catacombs'),('volcano','volcano'),
                  ('tundra','tundra'),('swamp','swamp'),('abyss','abyss')]:
    c = COLORS[key]
    gen_bg('combat', f'bg_combat_{zone}.png', c[0], c[1])

# === 生成事件房背景 ===
print("\n=== 事件房背景 ===")
events = {
    'forest': (bg_detail_forest, COLORS['forest']),
    'catacombs': (bg_detail_catacombs, COLORS['catacombs']),
    'volcano': (bg_detail_volcano, COLORS['volcano']),
    'tundra': (bg_detail_tundra, COLORS['tundra']),
    'swamp': (bg_detail_swamp, COLORS['swamp']),
    'abyss': (bg_detail_abyss, COLORS['abyss']),
}
for zone, (func, c) in events.items():
    gen_bg('event', f'bg_event_{zone}.png', c[0], c[1], func)

# === 生成其他房间背景 ===
print("\n=== 其他房间背景 ===")
other_rooms = {
    'treasure': (bg_detail_generic, None),
    'healing': (None, None),
    'shop': (bg_detail_generic, None),
    'upgrade': (None, None),
    'rest': (None, None),
}
for room, (func, _) in other_rooms.items():
    color_map = {'treasure': '#8B7355', 'healing': '#5A8A6A', 'shop': '#9A8A5A', 'upgrade': '#6A7A9A', 'rest': '#5A6A7A'}
    gen_bg('', f'bg_room_{room}.png', color_map[room], '#FFFFFF', func)

print("\n完成!")
