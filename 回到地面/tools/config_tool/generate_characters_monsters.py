#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美术资源生成脚本 - 角色和怪物
"""

import os
from PIL import Image, ImageDraw

# 颜色
COLORS = {
    'warrior_main': '#4A6A8A',
    'warrior_sec': '#8A8A8A',
    'archer_main': '#4A7A4A',
    'archer_sec': '#6A5A3A',
    'assassin_main': '#3A2A4A',
    'assassin_sec': '#2A2A3A',
    'mage_main': '#3A4A8A',
    'mage_sec': '#6A5A8A',
    'berserker_main': '#8A3A2A',
    'berserker_sec': '#3A2A1A',
    
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
    
    'bg_dark': '#1A1A2E',
    'gold': '#D4AF37',
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
    file_size = os.path.getsize(filepath)
    print(f"[OK] {os.path.basename(filepath)} ({img.size[0]}x{img.size[1]}, {file_size}B)")

def generate_character(name, main_color, sec_color, width, height, filepath):
    """生成角色占位图"""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 角色主体 (简化为矩形占位)
    main_rgba = hex_to_rgba(main_color, 200)
    sec_rgba = hex_to_rgba(sec_color, 150)
    
    # 身体
    body_w, body_h = width // 2, height // 3
    body_x = (width - body_w) // 2
    draw.rectangle([body_x, height // 3, body_x + body_w - 1, height // 3 + body_h - 1], 
                   fill=main_rgba, outline=hex_to_rgb(main_color))
    
    # 头部
    head_size = width // 3
    draw.ellipse([width // 2 - head_size // 2, 0, 
                  width // 2 + head_size // 2 - 1, head_size - 1],
                 fill=sec_rgba, outline=hex_to_rgb(sec_color))
    
    # 武器占位
    weapon_color = hex_to_rgba(COLORS['gold'], 180)
    if 'sword' in name.lower():
        draw.rectangle([width - 10, height // 4, width - 4, height // 2], fill=weapon_color)
    elif 'bow' in name.lower():
        draw.arc([width - 15, height // 4, width - 5, height // 2 + 20], 0, 360, fill=weapon_color, width=3)
    
    save_image(img, filepath)

def generate_monster(zone, monster_type, base_color, size, filepath):
    """生成怪物占位图"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    color_rgba = hex_to_rgba(base_color, 180)
    color_rgb = hex_to_rgb(base_color)
    
    # 根据怪物类型绘制不同形状
    if 'slime' in monster_type.lower() or '史莱姆' in monster_type:
        # 圆球体
        center = (size[0] // 2, size[1] // 2)
        radius = min(size[0], size[1]) // 3
        draw.ellipse([center[0]-radius, center[1]-radius//2, 
                     center[0]+radius, center[1]+radius//2],
                    fill=color_rgba, outline=color_rgb)
    elif 'ghost' in monster_type.lower() or '幽灵' in monster_type:
        # 半透明幽灵
        ghost_alpha = 150
        draw.polygon([
            (size[0]//2, 0), (size[0]-10, size[1]//2),
            (size[0]-5, size[1]-5), (size[0]//2, size[1]),
            (5, size[1]-5), (10, size[1]//2)
        ], fill=(*color_rgb[:3], ghost_alpha))
    elif 'skeleton' in monster_type.lower() or '骷髅' in monster_type:
        # 骷髅形状
        skull_size = size[0] // 3
        draw.ellipse([size[0]//2-skull_size, 10, 
                     size[0]//2+skull_size, skull_size*2+10],
                    fill=color_rgba, outline=color_rgb)
        # 眼睛
        draw.ellipse([size[0]//2-skull_size//2-3, skull_size//2+5,
                     size[0]//2-skull_size//2+3, skull_size//2+11],
                    fill=(0, 0, 0, 255))
        draw.ellipse([size[0]//2+skull_size//2-3, skull_size//2+5,
                     size[0]//2+skull_size//2+3, skull_size//2+11],
                    fill=(0, 0, 0, 255))
    else:
        # 通用矩形
        draw.rectangle([10, 10, size[0]-10, size[1]-10], 
                      fill=color_rgba, outline=color_rgb)
    
    save_image(img, filepath)

def generate_characters():
    """生成5个角色资源"""
    print("\n=== 生成角色资源 ===")
    
    characters = [
        ('warrior', COLORS['warrior_main'], COLORS['warrior_sec'], 64, 64, 'assets/resources/textures/characters/warrior'),
        ('archer', COLORS['archer_main'], COLORS['archer_sec'], 64, 64, 'assets/resources/textures/characters/archer'),
        ('assassin', COLORS['assassin_main'], COLORS['assassin_sec'], 64, 64, 'assets/resources/textures/characters/assassin'),
        ('mage', COLORS['mage_main'], COLORS['mage_sec'], 64, 64, 'assets/resources/textures/characters/mage'),
        ('berserker', COLORS['berserker_main'], COLORS['berserker_sec'], 64, 64, 'assets/resources/textures/characters/berserker'),
    ]
    
    animations = ['idle', 'walk', 'attack', 'skill', 'dodge', 'hit', 'death']
    
    for char_name, main_c, sec_c, w, h, out_dir in characters:
        for anim in animations:
            filename = f'{char_name}_{anim}.png'
            generate_character(char_name, main_c, sec_c, w, h, os.path.join(out_dir, filename))

def generate_monsters():
    """生成怪物资源"""
    print("\n=== 生成怪物资源 ===")
    
    zones = [
        ('forest', '翠绿森林', COLORS['forest_primary'], 'assets/resources/textures/monsters/forest'),
        ('catacombs', '幽暗墓穴', COLORS['catacombs_primary'], 'assets/resources/textures/monsters/catacombs'),
        ('volcano', '熔岩火山', COLORS['volcano_primary'], 'assets/resources/textures/monsters/volcano'),
        ('tundra', '冰封雪原', COLORS['tundra_primary'], 'assets/resources/textures/monsters/tundra'),
        ('swamp', '剧毒沼泽', COLORS['swamp_primary'], 'assets/resources/textures/monsters/swamp'),
        ('abyss', '暗影深渊', COLORS['abyss_primary'], 'assets/resources/textures/monsters/abyss'),
    ]
    
    # 每个区域6种怪物
    monster_types = [
        ('slime', '史莱姆'),
        ('fungus', '蘑菇'),
        ('tree', '树精'),
        ('beast', '野兽'),
        ('flyer', '飞行'),
        ('elite', '精英'),
    ]
    
    for zone_name, zone_cn, base_color, out_dir in zones:
        for monster_name, monster_cn in monster_types:
            filename = f'{zone_name}_{monster_name}_idle.png'
            size = (48, 48) if monster_name != 'elite' else (64, 64)
            generate_monster(zone_name, monster_name, base_color, size, os.path.join(out_dir, filename))

def generate_tiles():
    """生成地形Tile资源"""
    print("\n=== 生成地形Tile资源 ===")
    
    zones = [
        ('forest', COLORS['forest_primary']),
        ('catacombs', COLORS['catacombs_primary']),
        ('volcano', COLORS['volcano_primary']),
        ('tundra', COLORS['tundra_primary']),
        ('swamp', COLORS['swamp_primary']),
        ('abyss', COLORS['abyss_primary']),
    ]
    
    tile_types = ['floor', 'wall', 'thorn', 'highground']
    
    for zone_name, base_color in zones:
        out_dir = f'assets/resources/textures/tiles/{zone_name}'
        for tile_type in tile_types:
            filename = f'tile_{zone_name}_{tile_type}.png'
            rgba = hex_to_rgba(base_color)
            img = Image.new('RGBA', (32, 32), rgba[:3] + (180,))
            draw = ImageDraw.Draw(img)
            
            # 绘制不同类型的Tile
            if tile_type == 'floor':
                # 网格状
                for y in range(0, 32, 16):
                    for x in range(0, 32, 16):
                        if (x + y) % 32 == 0:
                            rect_fill = hex_to_rgba(base_color)
                            draw.rectangle([x, y, x+15, y+15], fill=(*rect_fill[:3], 150))
            elif tile_type == 'wall':
                # 石块堆叠
                draw.rectangle([0, 0, 31, 15], fill=(*rect_fill[:3], 200))
                draw.rectangle([0, 16, 31, 31], fill=(*rect_fill[:3], 160))
            elif tile_type == 'thorn':
                # 尖刺
                spike_color = hex_to_rgb(base_color)
                for x in range(4, 32, 8):
                    draw.polygon([(x, 31), (x+4, 15), (x+8, 31)], fill=spike_color)
            else:  # highground
                # 平台
                draw.rectangle([2, 20, 29, 30], fill=(*rect_fill[:3], 220))
                draw.rectangle([0, 18, 31, 20], fill=(*rect_fill[:3], 180))
            
            save_image(img, os.path.join(out_dir, filename))

def generate_effects():
    """生成基础特效"""
    print("\n=== 生成特效资源 ===")
    
    fx_types = [
        ('fx_hit_normal', 48, 48, '#FFFFFF'),
        ('fx_crit', 64, 64, '#FF4444'),
        ('fx_dodge', 32, 32, '#AAAAFF'),
        ('fx_shield', 64, 64, '#4488FF'),
        ('fx_heal', 80, 80, '#44FF88'),
        ('fx_dash', 48, 64, '#FFDD44'),
    ]
    
    out_dir = 'assets/resources/textures/effects/combat'
    
    for fx_name, w, h, color in fx_types:
        filename = f'{fx_name}.png'
        img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # 中心光点
        center_x, center_y = w // 2, h // 2
        radius = min(w, h) // 4
        
        # 径向渐变模拟
        for r in range(radius, 0, -1):
            alpha = int(r * 255 / radius)
            c = (*hex_to_rgb(color), alpha)
            draw.ellipse([center_x-r, center_y-r, center_x+r, center_y+r], fill=c)
        
        save_image(img, os.path.join(out_dir, filename))

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
    
    print("回到地面 - 角色/怪物/地形/特效生成器")
    print("=" * 50)
    
    generate_characters()
    generate_monsters()
    generate_tiles()
    generate_effects()
    
    print("\n" + "=" * 50)
    print("[OK] 角色/怪物/地形/特效资源生成完成")
