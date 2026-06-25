#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美术资源生成脚本 - 房间背景
"""

import os
from PIL import Image, ImageDraw

# 颜色
COLORS = {
    'bg_dark': '#1A1A2E',
    'panel': '#2A2A3E',
    'gold': '#D4AF37',
    'forest_primary': '#4A7A4A',
    'forest_secondary': '#8BAA7A',
    'catacombs_primary': '#6A5A7A',
    'catacombs_glow': '#AAFFAA',
    'volcano_primary': '#AA3A2A',
    'volcano_shadow': '#3A2A1A',
    'tundra_primary': '#7ABBDD',
    'tundra_ice': '#DDFFFF',
    'swamp_primary': '#3A5A2A',
    'swamp_poison': '#AA77AA',
    'abyss_primary': '#2A1A3A',
    'abyss_void': '#6644AA',
}

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def hex_to_rgba(h, alpha=255):
    r, g, b = hex_to_rgb(h)
    return (r, g, b, alpha)

def save_image(img, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, 'PNG')
    size_str = f"{img.size[0]}x{img.size[1]}"
    file_size = os.path.getsize(filepath)
    print(f"[OK] {os.path.basename(filepath)} ({size_str}, {file_size}B)")

def generate_room_backgrounds():
    """生成房间背景资源"""
    print("\n=== 生成房间背景资源 ===")
    
    # 通用背景
    out_dirs = {
        'combat': 'assets/resources/textures/backgrounds/combat',
        'treasure': 'assets/resources/textures/backgrounds/treasure',
        'healing': 'assets/resources/textures/backgrounds/healing',
        'shop': 'assets/resources/textures/backgrounds/shop',
        'upgrade': 'assets/resources/textures/backgrounds/upgrade',
    }
    
    # 750x500 战斗房背景 - 每区域一种
    combat_configs = {
        'combat_forest': COLORS['forest_primary'],
        'combat_catacombs': COLORS['catacombs_primary'],
        'combat_volcano': COLORS['volcano_primary'],
        'combat_tundra': COLORS['tundra_primary'],
        'combat_swamp': COLORS['swamp_primary'],
        'combat_abyss': COLORS['abyss_primary'],
    }
    
    for name, color in combat_configs.items():
        img = Image.new('RGBA', (750, 500), (*hex_to_rgb(color), 180))
        draw = ImageDraw.Draw(img)
        
        # 简单图案装饰
        for y in range(0, 500, 32):
            for x in range(0, 750, 32):
                if (x // 32 + y // 32) % 3 == 0:
                    draw.rectangle([x, y, x+31, y+31], fill=(*hex_to_rgb(color), 100))
        
        # 边框装饰
        draw.rectangle([10, 10, 739, 490], outline=hex_to_rgb(COLORS['gold']), width=4)
        draw.rectangle([14, 14, 735, 485], outline=(*hex_to_rgb(COLORS['gold']), 100), width=2)
        
        # 中心区域深色
        draw.rectangle([100, 150, 650, 350], fill=(*hex_to_rgb(COLORS['panel']), 150))
        
        save_image(img, os.path.join(out_dirs['combat'], f'{name}.png'))
    
    # 通用房间背景
    for room_type, base_color, accent_color in [
        ('bg_room_treasure', '#886622', '#FFDD44'),
        ('bg_room_healing', '#226644', '#44FF88'),
        ('bg_room_shop', '#664422', '#FFAA44'),
        ('bg_room_upgrade', '#442266', '#AA44FF'),
    ]:
        for subdir, out_dir in out_dirs.items():
            if subdir != room_type.split('_')[2]:
                continue
        
        img = Image.new('RGBA', (750, 500), (*hex_to_rgb(base_color), 180))
        draw = ImageDraw.Draw(img)
        
        # 图案装饰
        for y in range(0, 500, 40):
            for x in range(0, 750, 40):
                if (x // 40 + y // 40) % 2 == 0:
                    draw.rectangle([x, y, x+39, y+39], fill=(*hex_to_rgb(base_color), 120))
        
        # 边框
        draw.rectangle([20, 20, 729, 479], outline=hex_to_rgb(accent_color), width=4)
        draw.rectangle([24, 24, 724, 474], outline=(*hex_to_rgb(accent_color), 150), width=2)
        
        save_image(img, os.path.join(out_dirs.get('combat', out_dirs['combat']), f'{room_type}.png'))
    
    # 简化：直接生成每个房间背景
    print("\n[生成通用房间背景]")
    common_rooms = [
        ('bg_room_treasure', '#886622', '#FFDD44'),
        ('bg_room_healing', '#226644', '#44FF88'),
        ('bg_room_shop', '#664422', '#FFAA44'),
        ('bg_room_upgrade', '#442266', '#AA44FF'),
    ]
    
    for room_name, base, accent in common_rooms:
        dir_map = {
            'bg_room_treasure': out_dirs['treasure'],
            'bg_room_healing': out_dirs['healing'],
            'bg_room_shop': out_dirs['shop'],
            'bg_room_upgrade': out_dirs['upgrade'],
        }
        img = Image.new('RGBA', (750, 500), (*hex_to_rgb(base), 180))
        draw = ImageDraw.Draw(img)
        
        # 装饰图案
        for y in range(0, 500, 40):
            for x in range(0, 750, 40):
                if (x // 40 + y // 40) % 2 == 0:
                    draw.rectangle([x, y, x+39, y+39], fill=(*hex_to_rgb(base), 120))
        
        draw.rectangle([20, 20, 729, 479], outline=hex_to_rgb(accent), width=4)
        draw.text((300, 230), room_name.replace('bg_room_', '').upper(), fill=hex_to_rgba(accent))
        
        save_image(img, os.path.join(dir_map[room_name], f'{room_name}.png'))

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
    generate_room_backgrounds()
