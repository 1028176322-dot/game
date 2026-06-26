#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成遗物技能特效 (Relic Skill FX)
共 8 个文件，放入 effects/relics/ 目录
"""
import os
import math
from PIL import Image, ImageDraw

BASE_DIR = os.path.join(os.getcwd(), 'assets', 'resources', 'textures', 'effects', 'relics')
os.makedirs(BASE_DIR, exist_ok=True)

def draw_ellipse_at(draw, cx, cy, rx, ry, fill):
    """以(cx,cy)为中心绘制椭圆"""
    bbox = [cx - rx, cy - ry, cx + rx, cy + ry]
    draw.ellipse(bbox, fill=fill)

def draw_star(draw, cx, cy, points, outer_r, inner_r, fill_color):
    """绘制星形"""
    coords = []
    for i in range(points * 2):
        angle = (math.pi * i) / points - math.pi / 2
        r = outer_r if i % 2 == 0 else inner_r
        coords.append((cx + int(r * math.cos(angle)), cy + int(r * math.sin(angle))))
    draw.polygon(coords, fill=fill_color)

def draw_ring(draw, cx, cy, radius, width, color):
    """绘制圆环"""
    for w in range(width):
        r = radius - w
        if r > 0:
            bbox = [cx - r, cy - r, cx + r, cy + r]
            draw.arc(bbox, 0, 360, fill=color, width=1)

def generate_relic_fx(filename, size, draw_func):
    """生成单个遗物特效"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    draw_func(draw, cx, cy, size // 2)
    filepath = os.path.join(BASE_DIR, filename)
    img.save(filepath, 'PNG')
    return filepath

def fx_shadow_dagger(draw, cx, cy, r):
    """暗影飞刀轨迹 - 黑色刀刃+暗紫尾迹"""
    # 刀刃形状
    blade_points = [
        (cx, cy - r),
        (cx - 3, cy - r * 0.3),
        (cx - r * 0.5, cy),
        (cx - 3, cy + r * 0.3),
        (cx, cy + r),
        (cx + 3, cy + r * 0.3),
        (cx + r * 0.5, cy),
        (cx + 3, cy - r * 0.3),
    ]
    draw.polygon(blade_points, fill=(40, 20, 60, 200))
    # 暗紫尾迹弧线
    for i in range(5):
        offset = i * 6
        draw.arc([cx-r-offset, cy-r-offset, cx+r+offset, cy+r+offset],
                180, 360, fill=(100, 50, 150, 120-i*20), width=2)

def fx_frost_amulet(draw, cx, cy, r):
    """冻结冰环 - 蓝色冰环扩散"""
    # 三层同心冰环
    for i, radius_factor in enumerate([1.0, 0.7, 0.4]):
        radius = int(r * radius_factor)
        alpha = int(200 - i * 50)
        draw_ring(draw, cx, cy, radius, 4, (100, 180, 255, alpha))
    # 冰晶装饰
    for i in range(8):
        angle = (2 * math.pi * i) / 8
        px = cx + int(r * 0.8 * math.cos(angle))
        py = cy + int(r * 0.8 * math.sin(angle))
        draw_star(draw, px, py, 4, 5, 2, (180, 220, 255, 200))

def fx_flame_ring(draw, cx, cy, r):
    """火焰脉冲 - 橙红色环形脉冲"""
    # 外层火焰环
    draw_ring(draw, cx, cy, int(r*0.9), 6, (255, 100, 20, 180))
    # 中层火焰环
    draw_ring(draw, cx, cy, int(r*0.6), 4, (255, 180, 30, 200))
    # 内层高温核心
    draw_ring(draw, cx, cy, int(r*0.3), 3, (255, 255, 100, 220))
    # 火焰粒子
    for i in range(12):
        angle = (2 * math.pi * i) / 12
        px = cx + int(r * 0.75 * math.cos(angle))
        py = cy + int(r * 0.75 * math.sin(angle))
        draw_ellipse_at(draw, px, py, 3, 2, (255, 150, 50, 180))

def fx_blink_stone(draw, cx, cy, r):
    """瞬移残影 - 淡蓝色虚影+传送带"""
    # 三个残影位置
    ox1_val = int(r * -0.5)
    ox2_val = int(r * 0.5)
    oy1_val = int(r * -0.3)
    oy2_val = int(r * 0.3)
    pts = [(ox1_val, oy1_val), (ox1_val, oy2_val), (cx, oy1_val), (cx, oy2_val), (ox2_val, oy1_val), (ox2_val, oy2_val)]
    for idx, (offset_x, offset_y) in enumerate(pts):
        alpha = 100 if idx % 2 == 0 else 180
        draw_ellipse_at(draw, cx + offset_x, cy + offset_y, int(r*0.6), int(r*0.8), (150, 200, 255, alpha))
    # 传送连线
    line_pts_top = [(ox1_val, oy1_val), (cx, oy1_val), (ox2_val, oy1_val)]
    line_pts_bot = [(ox1_val, oy2_val), (cx, oy2_val), (ox2_val, oy2_val)]
    draw.line(line_pts_top, fill=(100, 150, 255, 150), width=2)
    draw.line(line_pts_bot, fill=(100, 150, 255, 150), width=2)

def fx_gravity_stone(draw, cx, cy, r):
    """引力漩涡 - 黑色漩涡+向心箭头"""
    # 螺旋线条（向心）
    for i in range(16):
        angle = (2 * math.pi * i) / 8
        radius_start = int(r * 0.9 * (1 - i/16))
        radius_end = int(r * 0.9 * (1 - (i+1)/16))
        x1 = cx + int(radius_start * math.cos(angle))
        y1 = cy + int(radius_start * math.sin(angle))
        x2 = cx + int(radius_end * math.cos(angle + 0.3))
        y2 = cy + int(radius_end * math.sin(angle + 0.3))
        alpha = int(150 * i / 16)
        draw.line([x1, y1, x2, y2], fill=(100, 50, 150, alpha), width=3)
    # 中心黑洞
    draw_ellipse_at(draw, cx, cy, int(r*0.2), int(r*0.2), (20, 10, 40, 220))

def fx_life_link(draw, cx, cy, r):
    """生命链接 - 红色连接线+光点"""
    # 两条对角线连接
    dx1 = int(r * 0.7)
    dy1 = int(r * 0.7)
    pt_tl = (cx - dx1, cy - dy1)
    pt_tr = (cx + dx1, cy - dy1)
    bl = (cx - dx1, cy + dy1)
    br = (cx + dx1, cy + dy1)
    draw.line([pt_tl, (cx, cy), br], fill=(255, 50, 80, 200), width=3)
    draw.line([pt_tr, (cx, cy), bl], fill=(255, 50, 80, 200), width=3)
    # 端点光球
    pts = [pt_tl, pt_tr, bl, br]
    for px, py in pts:
        draw_ellipse_at(draw, px, py, 6, 6, (255, 100, 120, 220))
    # 中心光
    draw_ellipse_at(draw, cx, cy, 8, 8, (255, 200, 200, 240))

def fx_decoy_scroll(draw, cx, cy, r):
    """分身出现 - 半透明人形轮廓+闪光"""
    # 本尊轮廓
    draw_ellipse_at(draw, cx, cy, int(r*0.5), int(r*0.7), (200, 200, 255, 150))
    # 分身轮廓（偏移+更透明）
    draw_ellipse_at(draw, cx + int(r*0.4), cy + int(r*-0.2), int(r*0.4), int(r*0.6),
                   (180, 180, 240, 80))
    draw_ellipse_at(draw, cx + int(r*-0.4), cy + int(r*0.2), int(r*0.4), int(r*0.6),
                   (180, 180, 240, 80))
    # 出现闪光
    draw_star(draw, cx, cy, 6, int(r*0.9), int(r*0.4), (255, 255, 255, 180))

def fx_time_hourglass(draw, cx, cy, r):
    """时间波纹 - 金色环形波纹扩散"""
    # 三层时间波纹
    for i, radius_factor in enumerate([1.0, 0.7, 0.4]):
        radius = int(r * radius_factor)
        alpha = int(220 - i * 60)
        draw_ring(draw, cx, cy, radius, 3, (255, 215, 100, alpha))
    # 沙漏形状
    hourglass_points = [
        (cx - r*0.2, cy - r),
        (cx + r*0.2, cy - r),
        (cx + r*0.1, cy),
        (cx - r*0.1, cy),
    ]
    draw.polygon(hourglass_points, fill=(200, 180, 100, 150))
    hourglass_points2 = [
        (cx - r*0.1, cy),
        (cx + r*0.1, cy),
        (cx + r*0.2, cy + r),
        (cx - r*0.2, cy + r),
    ]
    draw.polygon(hourglass_points2, fill=(200, 180, 100, 150))

# 生成遗物特效
fx_configs = [
    ('fx_relic_shadow_dagger.png', 32, fx_shadow_dagger),
    ('fx_relic_frost_amulet.png', 64, fx_frost_amulet),
    ('fx_relic_flame_ring.png', 80, fx_flame_ring),
    ('fx_relic_blink_stone.png', 48, fx_blink_stone),
    ('fx_relic_gravity_stone.png', 80, fx_gravity_stone),
    ('fx_relic_life_link.png', 32, fx_life_link),
    ('fx_relic_decoy_scroll.png', 64, fx_decoy_scroll),
    ('fx_relic_time_hourglass.png', 64, fx_time_hourglass),
]

print(f"生成遗物特效到: {BASE_DIR}")
for filename, size, draw_func in fx_configs:
    try:
        filepath = generate_relic_fx(filename, size, draw_func)
        file_size = os.path.getsize(filepath)
        print(f"  [OK] {filename} ({size}x{size}, {file_size}B)")
    except Exception as e:
        print(f"  [FAIL] {filename}: {e}")

print("\n完成!")
