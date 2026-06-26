#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成图标资源 (Icons)
包括: 主动技能/物品/BuffDebuff 图标
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.join(os.getcwd(), 'assets', 'resources', 'textures', 'icons')

def save_img(img, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, 'PNG')
    size = os.path.getsize(filepath)
    print(f"  [OK] {os.path.relpath(filepath, ROOT)} ({img.size[0]}x{img.size[1]}, {size}B)")

# ========== 1. 主动技能图标 (48x48) ==========
print("=== 主动技能图标 ===")
skill_dir = os.path.join(ROOT, 'skills')

skill_defs = [
    ('icon_skill_dash', '#FF6633', 'polygon', [(24, 4), (44, 24), (24, 44), (4, 24)]),
    ('icon_skill_elementBurst', '#FF3333', 'circle', 18, (255, 100, 50, 220)),
    ('icon_skill_shield', '#3366FF', 'circle', 16, (80, 120, 255, 220)),
    ('icon_skill_healWave', '#33CC33', 'circle', 16, (80, 220, 80, 220)),
    ('icon_skill_slowField', '#6633CC', 'circle', 16, (120, 80, 220, 220)),
    ('icon_skill_snapShot', '#CCCCCC', 'diamond', 16, (200, 200, 200, 220)),
]

for name, color, shape, *rest in skill_defs:
    img = Image.new('RGBA', (48, 48), (30, 30, 50, 200))
    draw = ImageDraw.Draw(img)
    
    if shape == 'polygon':
        draw.polygon(rest[0], fill=(200, 100, 50, 200), outline=(255, 180, 100, 220))
    elif shape == 'circle':
        r = rest[0]
        fill = rest[1] if len(rest) > 1 else (100, 100, 200, 200)
        draw.ellipse([24-r, 24-r, 24+r, 24+r], fill=fill, outline=(200, 200, 240, 200), width=2)
    elif shape == 'diamond':
        r = rest[0]
        fill = rest[1] if len(rest) > 1 else (200, 200, 200, 200)
        draw.polygon([(24, 4), (44, 24), (24, 44), (4, 24)], fill=fill, outline=(240, 240, 240, 200))
    
    save_img(img, os.path.join(skill_dir, f'{name}.png'))

# ========== 2. 物品图标 (48x48) ==========
print("\n=== 物品图标 ===")
item_dir = os.path.join(ROOT, 'items')

item_defs = [
    ('icon_item_healingPotion', '#FF4444', 'potion'),
    ('icon_item_bigHealingPotion', '#FF6666', 'potion_big'),
    ('icon_item_furyPotion', '#FF8800', 'potion_fury'),
    ('icon_item_ironPotion', '#8888FF', 'potion_def'),
    ('icon_item_speedPotion', '#44FF44', 'potion_speed'),
    ('icon_item_purifyPotion', '#FF44FF', 'potion_purify'),
    ('icon_item_flameBomb', '#FF6600', 'bomb_fire'),
    ('icon_item_iceBomb', '#44AAFF', 'bomb_ice'),
    ('icon_item_key', '#FFDD44', 'key'),
    ('icon_item_advancedKey', '#FFAA00', 'key_gold'),
    ('icon_item_rerollScroll', '#DDDDFF', 'scroll'),
    ('icon_item_reviveCoin', '#FFD700', 'coin'),
    ('icon_item_mapScroll', '#AADDAA', 'map'),
    ('icon_item_scrollFire', '#FF4422', 'element_fire'),
    ('icon_item_scrollIce', '#2288FF', 'element_ice'),
    ('icon_item_scrollThunder', '#FFFF22', 'element_thunder'),
    ('icon_item_scrollPoison', '#44AA22', 'element_poison'),
    ('icon_item_scrollShadow', '#8844AA', 'element_shadow'),
    ('icon_item_scrollHoly', '#FFFFFF', 'element_holy'),
]

for name, color, kind in item_defs:
    img = Image.new('RGBA', (48, 48), (30, 30, 50, 200))
    draw = ImageDraw.Draw(img)
    
    # 底色方块
    draw.rectangle([6, 6, 41, 41], fill=(60, 60, 80, 200), outline=(120, 120, 140, 180), width=2)
    
    # 根据类型绘制内部图案
    hex_col = color.lstrip('#')
    rgb = (int(hex_col[0:2], 16), int(hex_col[2:4], 16), int(hex_col[4:6], 16))
    
    if 'potion' in kind:
        # 药水瓶子形状
        draw.ellipse([18, 14, 29, 22], fill=rgb, outline=(255, 255, 255, 150), width=2)
        draw.rectangle([16, 22, 31, 38], fill=(*rgb[:2], 180), outline=(255, 255, 255, 150), width=2)
        draw.ellipse([16, 34, 31, 42], fill=(*rgb[:2], 160), outline=(255, 255, 255, 120), width=1)
    elif 'bomb' in kind:
        # 炸弹形状
        draw.ellipse([12, 12, 35, 35], fill=rgb, outline=(255, 255, 255, 150), width=2)
        draw.line([24, 12, 28, 6], fill=(255, 200, 100, 200), width=3)
    elif 'key' in kind:
        # 钥匙形状
        draw.ellipse([30, 16, 40, 26], fill=rgb, outline=(255, 255, 255, 150), width=2)
        draw.rectangle([28, 22, 32, 40], fill=rgb, outline=(255, 255, 255, 120), width=1)
        draw.rectangle([28, 34, 36, 38], fill=rgb, outline=(255, 255, 255, 120), width=1)
    elif 'scroll' in kind or kind == 'map':
        # 卷轴形状
        draw.rectangle([10, 14, 38, 34], fill=rgb, outline=(255, 255, 255, 150), width=2)
        draw.ellipse([8, 12, 14, 36], fill=(180, 160, 120, 200), outline=(220, 200, 160, 180), width=1)
        draw.ellipse([34, 12, 40, 36], fill=(180, 160, 120, 200), outline=(220, 200, 160, 180), width=1)
    elif kind == 'coin':
        # 金币
        draw.ellipse([12, 12, 35, 35], fill=rgb, outline=(255, 255, 200, 200), width=3)
    elif 'element' in kind:
        # 元素符号
        symbols = {'fire': '#', 'ice': '~', 'thunder': '*', 'poison': '%', 'shadow': '@', 'holy': '!'}
        elem = kind.split('_')[-1]
        sym = symbols.get(elem, '?')
        draw.text((20, 18), sym, fill=(255, 255, 255, 240))
    
    save_img(img, os.path.join(item_dir, f'{name}.png'))

# ========== 3. Buff/Debuff 图标 (20x20) ==========
print("\n=== Buff/Debuff 图标 ===")
buff_dir = os.path.join(ROOT, 'buffs')

buff_defs = [
    ('icon_buff_atkUp', '#FF4444', '+'),
    ('icon_buff_defUp', '#4444FF', '+'),
    ('icon_buff_speedUp', '#44FF44', '+'),
    ('icon_buff_shield', '#4488FF', '🛡'),
    ('icon_buff_stealth', '#8844FF', '👻'),
    ('icon_debuff_poison', '#44AA22', '☠'),
    ('icon_debuff_slow', '#4488AA', '⏱'),
    ('icon_debuff_burn', '#FF6622', '🔥'),
    ('icon_debuff_stun', '#FFAA44', '⚡'),
    ('icon_debuff_freeze', '#44AAFF', '❄'),
]

for name, color, symbol in buff_defs:
    img = Image.new('RGBA', (20, 20), (30, 30, 50, 200))
    draw = ImageDraw.Draw(img)
    
    # 圆形背景
    is_buff = name.startswith('icon_buff')
    outline_color = (150, 255, 150, 200) if is_buff else (255, 150, 150, 200)
    fill_color = tuple(int(color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)) + (180,)
    draw.ellipse([1, 1, 18, 18], fill=fill_color, outline=outline_color, width=2)
    
    # 中央加点
    draw.ellipse([8, 8, 11, 11], fill=(255, 255, 255, 200))
    
    save_img(img, os.path.join(buff_dir, f'{name}.png'))

print("\n=== 全部图标完成! ===")
