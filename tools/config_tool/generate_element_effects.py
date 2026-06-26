#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成元素反应特效 (Element Reaction FX)
共 11 个文件，放入 effects/reactions/ 目录
"""
import os
import math
from PIL import Image, ImageDraw

BASE_DIR = os.path.join(os.getcwd(), 'assets', 'resources', 'textures', 'effects', 'reactions')
os.makedirs(BASE_DIR, exist_ok=True)

def draw_hexagon(draw, cx, cy, r, fill_color, outline_color=None):
    """绘制六边形"""
    points = []
    for i in range(6):
        angle = math.radians(60 * i - 30)
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill=fill_color, outline=outline_color)

def draw_circle_pattern(draw, cx, cy, r, color, num_circles=5):
    """绘制圆形图案"""
    for i in range(num_circles):
        offset_r = int(r * (i + 1) / num_circles)
        alpha = int(255 * (1 - i / num_circles) * 0.6)
        draw.ellipse([cx - offset_r, cy - offset_r, cx + offset_r, cy + offset_r],
                     fill=(*color[:3], alpha))

def draw_sparkles(draw, cx, cy, count, color, size=8):
    """绘制星芒点缀"""
    for i in range(count):
        angle = (2 * math.pi * i) / count + 0.3
        dx = cx + int(size * math.cos(angle))
        dy = cy + int(size * math.sin(angle))
        # 4点星芒
        draw.line([dx-size//2, dy, dx+size//2, dy], fill=color, width=1)
        draw.line([dx, dy-size//2, dx, dy+size//2], fill=color, width=1)

def gen_ellipse(draw, bbox, fill):
    """兼容写法：ellipse"""
    draw.ellipse(bbox, fill=fill)

def generate_fx_reaction(filename, size, draw_func):
    """生成单个特效"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    draw_func(draw, cx, cy, size // 2)
    filepath = os.path.join(BASE_DIR, filename)
    img.save(filepath, 'PNG')
    return filepath

def fx_burn(draw, cx, cy, r):
    """爆燃 - 红绿爆炸"""
    draw_ellipse(draw, cx, cy, r, (255, 120, 0, 80))
    draw_ellipse(draw, cx, cy, int(r*0.7), (255, 60, 30, 120))
    draw_ellipse(draw, cx, cy, int(r*0.4), (255, 255, 50, 180))
    draw.arc([cx-r, cy-r, cx+r, cy+r], 0, 360, fill=(50, 255, 80, 100), width=6)
    draw_sparkles(draw, cx, cy, 12, (255, 200, 50, 180), size=r*0.6)

def fx_vaporize(draw, cx, cy, r):
    """汽化 - 白色蒸汽"""
    for i in range(8):
        angle = (2 * math.pi * i) / 8
        ox = cx + int(r * 0.3 * math.cos(angle))
        oy = cy + int(r * 0.3 * math.sin(angle))
        sr = int(r * 0.5)
        alpha = int(150 - i * 10)
        draw_ellipse(draw, ox, oy, sr, (240, 240, 255, alpha))
    draw_ellipse(draw, cx, cy, int(r*0.2), (255, 255, 255, 200))

def fx_overload(draw, cx, cy, r):
    """超载 - 金色爆裂+电弧"""
    draw_ellipse(draw, cx, cy, r, (255, 215, 0, 100))
    draw_ellipse(draw, cx, cy, int(r*0.6), (255, 180, 0, 150))
    for i in range(12):
        angle = (2 * math.pi * i) / 12
        x1 = cx + int(r * 0.2 * math.cos(angle))
        y1 = cy + int(r * 0.2 * math.sin(angle))
        x2 = cx + int(r * 0.8 * math.cos(angle + 0.1))
        y2 = cy + int(r * 0.8 * math.sin(angle + 0.1))
        draw.line([x1, y1, x2, y2], fill=(180, 200, 255, 200), width=2)

def fx_melt(draw, cx, cy, r):
    """融化 - 紫红火焰"""
    draw_ellipse(draw, cx, cy, r, (180, 50, 200, 100))
    draw_ellipse(draw, cx, cy, int(r*0.7), (220, 40, 60, 140))
    draw_ellipse(draw, cx, cy, int(r*0.4), (255, 200, 50, 180))

def fx_freeze(draw, cx, cy, r):
    """冻结 - 蓝白冰晶"""
    draw_hexagon(draw, cx, cy, int(r*0.9), None, (100, 180, 255, 150))
    draw_hexagon(draw, cx, cy, int(r*0.6), None, (150, 200, 255, 180))
    draw_hexagon(draw, cx, cy, int(r*0.3), (200, 230, 255, 200), (220, 240, 255, 220))
    for i in range(6):
        angle = (2 * math.pi * i) / 6
        px = cx + int(r * 0.7 * math.cos(angle))
        py = cy + int(r * 0.7 * math.sin(angle))
        draw_ellipse(draw, px, py, 3, (255, 255, 255, 200))

def fx_shatter(draw, cx, cy, r):
    """粉碎 - 青绿碎裂"""
    for i in range(8):
        angle = (2 * math.pi * i) / 8
        x2 = cx + int(r * math.cos(angle))
        y2 = cy + int(r * math.sin(angle))
        draw.line([cx, cy, x2, y2], fill=(50, 255, 200, 180), width=3)
    draw_ellipse(draw, cx, cy, int(r*0.2), (150, 255, 220, 220))

def fx_decay(draw, cx, cy, r):
    """腐朽 - 灰紫雾气"""
    for i in range(10):
        angle = (2 * math.pi * i) / 10
        ox = cx + int(r * 0.2 * math.cos(angle))
        oy = cy + int(r * 0.2 * math.sin(angle))
        sr = int(r * 0.6)
        alpha = int(100 - i * 5)
        draw_ellipse(draw, ox, oy, sr, (150, 100, 200, alpha))
    draw_ellipse(draw, cx, cy, int(r*0.3), (80, 50, 120, 180))

def fx_conduct(draw, cx, cy, r):
    """导电能 - 黄绿弹射"""
    for i in range(6):
        angle = (2 * math.pi * i) / 6
        segments = 4
        points = [(cx, cy)]
        for j in range(1, segments+1):
            t = j / segments
            px = cx + int(r * t * math.cos(angle + (0.2 if j % 2 else -0.2)))
            py = cy + int(r * t * math.sin(angle + (0.2 if j % 2 else -0.2)))
            points.append((px, py))
        draw.line(points, fill=(180, 255, 50, 200), width=3)
    for i in range(12):
        angle = (2 * math.pi * i) / 12
        px = cx + int(r * 0.8 * math.cos(angle))
        py = cy + int(r * 0.8 * math.sin(angle))
        draw_ellipse(draw, px, py, 2, (255, 255, 50, 200))

def fx_void(draw, cx, cy, r):
    """虚空 - 紫黑漩涡"""
    for i in range(24):
        angle = (2 * math.pi * i) / 12
        radius = int(r * (i / 24))
        x1 = cx + int(radius * math.cos(angle))
        y1 = cy + int(radius * math.sin(angle))
        x2 = cx + int(radius * math.cos(angle + 0.5))
        y2 = cy + int(radius * math.sin(angle + 0.5))
        alpha = int(200 * (1 - i/24))
        draw.line([x1, y1, x2, y2], fill=(100, 50, 150, alpha), width=2)
    draw_ellipse(draw, cx, cy, int(r*0.25), (0, 0, 0, 220))

def fx_corrode(draw, cx, cy, r):
    """腐蚀 - 暗绿腐蚀"""
    for i in range(8):
        angle = (2 * math.pi * i) / 8
        ox = cx + int(r * 0.4 * math.cos(angle))
        oy = cy + int(r * 0.4 * math.sin(angle))
        sr = int(r * 0.25)
        draw_ellipse(draw, ox, oy, sr, (80, 180, 50, 150))
    draw_ellipse(draw, cx, cy, int(r*0.3), (120, 220, 80, 180))

def fx_radiance(draw, cx, cy, r):
    """光辉 - 白金光柱"""
    for i in range(16):
        angle = (2 * math.pi * i) / 16
        length = int(r * (0.8 + 0.2 * math.sin(i * 0.5)))
        x1 = cx + int(length * 0.3 * math.cos(angle))
        y1 = cy + int(length * 0.3 * math.sin(angle))
        x2 = cx + int(length * math.cos(angle))
        y2 = cy + int(length * math.sin(angle))
        draw.line([x1, y1, x2, y2], fill=(255, 255, 200, 150), width=2)
    draw_ellipse(draw, cx, cy, int(r*0.3), (255, 255, 220, 220))
    draw_ellipse(draw, cx, cy, int(r*0.15), (255, 255, 255, 255))

def draw_ellipse(draw, cx, cy, radius, fill):
    """以(cx,cy)为中心绘制椭圆"""
    r = int(radius)
    bbox = [cx - r, cy - r, cx + r, cy + r]
    draw.ellipse(bbox, fill=fill)

# 生成所有元素反应特效
fx_configs = [
    ('fx_reaction_burn.png', 80, fx_burn),
    ('fx_reaction_vaporize.png', 64, fx_vaporize),
    ('fx_reaction_overload.png', 80, fx_overload),
    ('fx_reaction_melt.png', 64, fx_melt),
    ('fx_reaction_freeze.png', 64, fx_freeze),
    ('fx_reaction_shatter.png', 80, fx_shatter),
    ('fx_reaction_decay.png', 64, fx_decay),
    ('fx_reaction_conduct.png', 48, fx_conduct),
    ('fx_reaction_void.png', 80, fx_void),
    ('fx_reaction_corrode.png', 64, fx_corrode),
    ('fx_reaction_radiance.png', 96, fx_radiance),
]

print(f"生成元素反应特效到: {BASE_DIR}")
for filename, size, draw_func in fx_configs:
    try:
        filepath = generate_fx_reaction(filename, size, draw_func)
        file_size = os.path.getsize(filepath)
        print(f"  [OK] {filename} ({size}x{size}, {file_size}B)")
    except Exception as e:
        print(f"  [FAIL] {filename}: {e}")

print("\n完成!")
