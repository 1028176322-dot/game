#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成Boss技能特效占位图 (Sprite Sheet格式)
共16个文件
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.join(os.getcwd(), 'assets', 'resources', 'textures', 'effects', 'bossSkills')
UI_EFFECTS_DIR = os.path.join(os.getcwd(), 'assets', 'resources', 'textures', 'effects', 'ui')

os.makedirs(ROOT, exist_ok=True)
os.makedirs(UI_EFFECTS_DIR, exist_ok=True)

def save_sheet(filename, total_frames, frame_width, vertical=False, frame_height=None):
    """生成Sprite Sheet占位图"""
    if frame_height is None:
        frame_height = frame_width
    w, h = frame_width, frame_height
    if vertical:
        sheet = Image.new('RGBA', (w, h * total_frames), (20, 10, 40, 200))
    else:
        sheet = Image.new('RGBA', (w * total_frames, h), (20, 10, 40, 200))
    
    draw = ImageDraw.Draw(sheet)
    
    # 绘制每一帧占位
    for i in range(total_frames):
        if vertical:
            y = i * h
            bbox = [0, y, w-1, y+h-1]
        else:
            x = i * w
            bbox = [x, 0, x+w-1, h-1]
        
        # 帧背景渐变
        shade = 30 + i * 10
        draw.rectangle(bbox, fill=(shade, 15, shade+20, 180))
        
        # 帧号
        if w >= 40:
            draw.text((bbox[0]+5, bbox[1]+5), str(i+1), fill=(200, 200, 255, 180))
    
    # 边框
    draw.rectangle([0, 0, sheet.width-1, sheet.height-1], outline=(100, 80, 150, 200), width=2)
    
    filepath = os.path.join(ROOT, filename) if 'bossSkills' in filename else os.path.join(UI_EFFECTS_DIR, filename)
    if 'bossSkills' in str(filepath):
        filepath = os.path.join(ROOT, filename)
    else:
        filepath = os.path.join(UI_EFFECTS_DIR, filename)
    
    sheet.save(filepath, 'PNG')
    size = os.path.getsize(filepath)
    print(f"  [OK] {os.path.basename(filepath)} ({sheet.width}x{sheet.height}, {size}B)")
    return filepath

print("=== Boss技能特效 (16个) ===")
boss_fx = [
    ('fx_boss_forestguardian_vine.png', 6, 64, False),      # 藤蔓缠绕
    ('fx_boss_forestguardian_fallinglog.png', 6, 64, True),  # 落木
    ('fx_boss_skeletonlord_shadowwave.png', 6, 64, False),   # 暗影斩波
    ('fx_boss_skeletonlord_summon.png', 6, 64, False),       # 骷髅召唤
    ('fx_boss_firelord_fireball.png', 6, 64, False),         # 火球
    ('fx_boss_firelord_magma.png', 6, 64, False),            # 岩浆喷发
    ('fx_boss_firelord_rainfire.png', 8, 80, True),          # 火雨
    ('fx_boss_frostqueen_icicle.png', 6, 64, False),         # 冰锥散射
    ('fx_boss_frostqueen_blizzard.png', 8, 80, True),        # 暴风雪
    ('fx_boss_frostqueen_freezering.png', 6, 64, False),     # 冻结环
    ('fx_boss_swampbehemoth_venom.png', 6, 64, False),       # 毒液吐息
    ('fx_boss_swampbehemoth_fog.png', 6, 64, False),         # 毒雾
    ('fx_boss_swampbehemoth_geyser.png', 6, 64, False),      # 毒泉
    ('fx_boss_abyssoverlord_barrage.png', 8, 80, True),      # 弹幕
    ('fx_boss_abyssoverlord_grasp.png', 8, 80, True),        # 虚空之握
    ('fx_boss_abyssoverlord_meteor.png', 8, 80, True),       # 陨石
]

for filename, frames, width, vertical in boss_fx:
    save_sheet(filename, frames, width, vertical)

print("\n=== UI特效 (2个) ===")
ui_fx = [
    ('fx_ui_loading.png', 8, 64, True),   # 加载旋转
    ('fx_ui_glow.png', 4, 64, True),       # 选中发光
]

for filename, frames, width, vertical in ui_fx:
    save_sheet(filename, frames, width, vertical)

print("\n完成!")
