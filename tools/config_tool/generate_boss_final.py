#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成终结Boss资源 (Final Bosses)
6个Boss x 5种动画 = 30个文件
尺寸: 96x96px, PNG
"""
import os
import math
from PIL import Image, ImageDraw

ROOT = os.path.join(os.getcwd())
BOSS_DIR = os.path.join(ROOT, 'assets', 'resources', 'textures', 'bosses', 'finalboss')
os.makedirs(BOSS_DIR, exist_ok=True)

def save_img(img, filepath):
    img.save(filepath, 'PNG')
    size = os.path.getsize(filepath)
    print(f"  [OK] {os.path.basename(filepath)} (96x96, {size}B)")

def draw_boss_body(draw, cx, cy, main_color, accent_color, size=48):
    """绘制Boss身体轮廓"""
    r = size
    # 头部
    draw.ellipse([cx-r//2, cy-r, cx+r//2, cy-r//2], fill=main_color, outline=accent_color, width=3)
    # 身体
    draw.rectangle([cx-r//3, cy-r//2, cx+r//3, cy+r//2], fill=main_color, outline=accent_color, width=2)
    # 四肢
    draw.line([(cx-r//3, cy-r//4), (cx-r//2, cy+r//3)], fill=main_color, width=8)
    draw.line([(cx+r//3, cy-r//4), (cx+r//2, cy+r//3)], fill=main_color, width=8)
    draw.line([(cx-r//4, cy+r//2), (cx-r//4, cy+r)], fill=main_color, width=6)
    draw.line([(cx+r//4, cy+r//2), (cx+r//4, cy+r)], fill=main_color, width=6)

def draw_boss_effect(draw, cx, cy, fx_type, color, size=48):
    """绘制Boss特效装饰"""
    r = size
    
    if fx_type == 'attack':
        # 攻击效果 - 放射状光线
        for i in range(8):
            angle = (2 * math.pi * i) / 8
            x1 = cx + int(10 * math.cos(angle))
            y1 = cy + int(10 * math.sin(angle))
            x2 = cx + int(r * math.cos(angle))
            y2 = cy + int(r * math.sin(angle))
            draw.line([x1, y1, x2, y2], fill=color, width=4)
    elif fx_type == 'skill':
        # 技能效果 - 能量环
        for ring_r in [r//2, r//3, r//4]:
            alpha = 200 - ring_r
            draw.ellipse([cx-ring_r, cy-ring_r, cx+ring_r, cy+ring_r], 
                        outline=(*color[:3], alpha), width=3)
    elif fx_type == 'phaseChange':
        # 转场效果 - 光爆
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(*color[:3], 100))
        draw.ellipse([cx-r//2, cy-r//2, cx+r//2, cy+r//2], fill=(255, 255, 255, 200))
    elif fx_type == 'death':
        # 死亡效果 - 碎裂
        for i in range(12):
            angle = (2 * math.pi * i) / 12
            x = cx + int(r * 0.7 * math.cos(angle))
            y = cy + int(r * 0.7 * math.sin(angle))
            draw.ellipse([x-3, y-3, x+3, y+3], fill=color)
    elif fx_type == 'idle':
        # 待机效果 - 微光
        pulse = int(180 + 40 * math.sin(0))
        draw.ellipse([cx-r+5, cy-r+5, cx+r-5, cy+r-5], fill=(*color[:3], pulse))

def generate_boss_file(boss_name, anim_type, main_color, accent_color):
    """生成单个Boss动画文件"""
    img = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = 48, 48
    size = 40
    
    # 基础身体
    draw_boss_body(draw, cx, cy, main_color, accent_color, size)
    # 特效
    fx_colors = {
        'idle': (200, 200, 255, 150),
        'attack': (255, 100, 50, 200),
        'skill': (255, 200, 50, 220),
        'phaseChange': (255, 255, 255, 240),
        'death': (150, 50, 50, 180)
    }
    draw_boss_effect(draw, cx, cy, anim_type, fx_colors.get(anim_type, main_color), size)
    
    filepath = os.path.join(BOSS_DIR, f'boss_{boss_name}_{anim_type}.png')
    save_img(img, filepath)

# Boss定义
BOSS_DEFS = [
    ('forestGuardian', '#4A7A4A', '#8BAA7A', 'forest'),      # 森林守护者
    ('skeletonLord', '#8A7A9A', '#B0A0C0', 'catacombs'),     # 亡灵君主
    ('fireLord', '#CC5500', '#FF8833', 'volcano'),           # 火焰领主
    ('frostQueen', '#4488CC', '#88BBFF', 'tundra'),          # 冰霜女王
    ('swampBehemoth', '#5A8A3A', '#8BBA6A', 'swamp'),        # 毒沼巨兽
    ('abyssOverlord', '#4A2A6A', '#8A5ABA', 'abyss'),        # 深渊魔王
]

ANIM_TYPES = ['idle', 'attack', 'skill', 'phaseChange', 'death']

print(f"生成终结Boss资源到: {BOSS_DIR}\n")
total = 0
for boss_name, main_color, accent_color, _ in BOSS_DEFS:
    for anim in ANIM_TYPES:
        try:
            generate_boss_file(boss_name, anim, main_color, accent_color)
            total += 1
        except Exception as e:
            print(f"  [FAIL] boss_{boss_name}_{anim}.png: {e}")

print(f"\n完成! 共生成 {total} 个Boss文件")
