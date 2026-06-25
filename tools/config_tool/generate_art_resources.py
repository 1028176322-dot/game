#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美术资源生成脚本 - 回到地面
自动生成占位美术资源，严格按照设计文档规范

输出目录: assets/resources/textures/{category}/{subcategory}/
"""

import os
import sys
from PIL import Image, ImageDraw

# ==================== 颜色常量 ====================
COLORS = {
    # UI 基础色
    'bg_dark':       '#1A1A2E',
    'panel':         '#2A2A3E',
    'card':          '#3A3A4E',
    'edge':          '#5A5A7E',
    'gold':          '#D4AF37',
    'text_white':    '#F0E8D8',
    'text_gray':     '#8A8A9E',
    'red':           '#FF4444',
    'green':         '#44FF88',
    
    # 区域主色调
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
    
    # 角色色调
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
}


def hex_to_rgb(h):
    """Hex 颜色转 RGB"""
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def hex_to_rgba(h, alpha=255):
    """Hex 颜色转 RGBA"""
    r, g, b = hex_to_rgb(h)
    return (r, g, b, alpha)


def create_image(width, height, fill_color=None, transparent=False):
    """创建新图像"""
    if transparent:
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    elif fill_color:
        if isinstance(fill_color, str):
            fill_color = hex_to_rgba(fill_color)
        img = Image.new('RGBA', (width, height), fill_color)
    else:
        img = Image.new('RGBA', (width, height))
    return img


def draw_pixel_border(draw, x, y, w, h, color, border_width=2, pixel_size=4):
    """绘制像素风格边框"""
    for i in range(0, w, pixel_size):
        draw.rectangle([x+i, y, x+i+border_width-1, y+h-1], fill=color)  # 上
        draw.rectangle([x+i, y+h-border_width, x+i+border_width-1, y+h-1], fill=color)  # 下
    for j in range(pixel_size, h-pixel_size, pixel_size):
        draw.rectangle([x, y+j, x+w-1, y+j+border_width-1], fill=color)  # 左
        draw.rectangle([x+w-border_width, y+j, x+w-1, y+j+border_width-1], fill=color)  # 右


def save_image(img, filepath):
    """保存图片并打印"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, 'PNG')
    size_str = f"{img.size[0]}x{img.size[1]}"
    file_size = os.path.getsize(filepath)
    print(f"[OK] {os.path.basename(filepath)} ({size_str}, {file_size}B)")


def generate_ui_splash():
    """生成启动屏资源"""
    print("\n=== 生成启动屏资源 ===")
    out_dir = 'assets/resources/textures/ui/splash'
    
    # splash_bg (1280x720, <100KB)
    img = create_image(1280, 720, COLORS['bg_dark'])
    draw = ImageDraw.Draw(img)
    # 渐变装饰
    for y in range(0, 720, 32):
        for x in range(0, 1280, 32):
            if (x // 32 + y // 32) % 2 == 0:
                draw.rectangle([x, y, x+31, y+31], fill=(*hex_to_rgb(COLORS['panel']), 180))
    # 像素图案装饰带
    gold_color = hex_to_rgba(COLORS['gold'], 80)
    for i in range(0, 1280, 64):
        for j in range(5):
            draw.rectangle([i+j*2, 300+j*10, i+j*2+4, 300+j*10+4], fill=gold_color)
    save_image(img, os.path.join(out_dir, 'splash_bg.png'))
    
    # splash_logo (400x120, 透明)
    img = create_image(400, 120, transparent=True)
    draw = ImageDraw.Draw(img)
    gold_rgba = hex_to_rgba(COLORS['gold'])
    # 像素风矩形边框
    draw.rectangle([0, 0, 399, 119], outline=gold_rgba, width=4)
    draw.rectangle([4, 4, 395, 115], outline=gold_rgba, width=2)
    draw.rectangle([6, 6, 393, 113], fill=hex_to_rgba(COLORS['panel'], 200))
    # 文字占位
    draw.text((130, 50), '回到地面', fill=gold_rgba)
    save_image(img, os.path.join(out_dir, 'splash_logo.png'))


def generate_ui_common():
    """生成通用UI资源"""
    print("\n=== 生成通用UI资源 ===")
    out_dir = 'assets/resources/textures/ui/common'
    
    panel_color = hex_to_rgba(COLORS['panel'])
    edge_color = hex_to_rgba(COLORS['edge'])
    gold_color = hex_to_rgba(COLORS['gold'])
    
    # panel_bg (64x64, 九宫格切图)
    img = create_image(64, 64, transparent=True)
    draw = ImageDraw.Draw(img)
    # 四角
    corner_size = 8
    for cx, cy in [(0, 0), (64-corner_size, 0), (0, 64-corner_size), (64-corner_size, 64-corner_size)]:
        draw.rectangle([cx, cy, cx+corner_size-1, cy+corner_size-1], fill=panel_color)
        draw.rectangle([cx, cy, cx+corner_size-1, cy+corner_size-1], outline=edge_color, width=1)
    # 边
    for x in range(corner_size, 64-corner_size):
        draw.rectangle([x, 0, x, 0], fill=edge_color)  # 上
        draw.rectangle([x, 63, x, 63], fill=edge_color)  # 下
    for y in range(corner_size, 64-corner_size):
        draw.rectangle([0, y, 0, y], fill=edge_color)  # 左
        draw.rectangle([63, y, 63, y], fill=edge_color)  # 右
    save_image(img, os.path.join(out_dir, 'panel_bg.png'))
    
    # btn_default/normal/active (200x60)
    for variant, color_offset in [('btn_default', 0), ('btn_hover', -20), ('btn_active', 40)]:
        img = create_image(200, 60, transparent=True)
        draw = ImageDraw.Draw(img)
        base_r, base_g, base_b = panel_color[:3]
        offset_r, offset_g, offset_b = color_offset, color_offset, color_offset
        fill_c = (
            min(255, max(0, base_r + offset_r)),
            min(255, max(0, base_g + offset_g)),
            min(255, max(0, base_b + offset_b)),
            255
        )
        draw.rectangle([2, 2, 197, 57], fill=fill_c, outline=edge_color, width=2)
        draw.text((80, 22), 'Button', fill=hex_to_rgba(COLORS['text_white']))
        save_image(img, os.path.join(out_dir, variant + '.png'))
    
    # btn_close (32x32)
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 31, 31], fill=hex_to_rgba(COLORS['card']), outline=edge_color, width=1)
    # X 标记
    close_color = hex_to_rgba(COLORS['red'])
    for i in range(0, 24, 4):
        draw.line([(4+i, 4+i), (28-i, 28-i)], fill=close_color, width=3)
        draw.line([(28-i, 4+i), (4+i, 28-i)], fill=close_color, width=3)
    save_image(img, os.path.join(out_dir, 'btn_close.png'))


def generate_ui_map():
    """生成地牢地图UI资源"""
    print("\n=== 生成地牢地图UI资源 ===")
    out_dir = 'assets/resources/textures/ui/map'
    
    edge_color = hex_to_rgba(COLORS['edge'])
    gold_color = hex_to_rgba(COLORS['gold'], 200)
    card_color = hex_to_rgba(COLORS['card'])
    
    # map_node_unknown (32x32)
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([4, 4, 27, 27], fill=card_color, outline=edge_color, width=2)
    draw.point((16, 16), fill=hex_to_rgba(COLORS['text_gray']))
    save_image(img, os.path.join(out_dir, 'map_node_unknown.png'))
    
    # map_node_visited (32x32)
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([4, 4, 27, 27], fill=hex_to_rgba(COLORS['panel']), outline=edge_color, width=2)
    save_image(img, os.path.join(out_dir, 'map_node_visited.png'))
    
    # map_node_current (32x32)
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([2, 2, 29, 29], fill=hex_to_rgba(COLORS['card']), outline=gold_color, width=3)
    draw.rectangle([8, 8, 23, 23], fill=hex_to_rgba(COLORS['gold'], 150))
    save_image(img, os.path.join(out_dir, 'map_node_current.png'))
    
    # map_line (2x16)
    img = create_image(2, 16, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 1, 15], fill=edge_color)
    save_image(img, os.path.join(out_dir, 'map_line.png'))
    
    # icon_room_* (20x20)
    room_types = ['combat', 'treasure', 'shop', 'healing', 'upgrade', 'event', 'boss']
    room_colors = {
        'combat': COLORS['red'],
        'treasure': COLORS['gold'],
        'shop': COLORS['gold'],
        'healing': COLORS['green'],
        'upgrade': '#4488FF',
        'event': '#AA88FF',
        'boss': '#FF4488',
    }
    for room in room_types:
        img = create_image(20, 20, transparent=True)
        draw = ImageDraw.Draw(img)
        draw.rectangle([2, 2, 17, 17], fill=hex_to_rgba(room_colors[room], 150), outline=hex_to_rgba(room_colors[room]))
        draw.point((10, 10), fill=(255, 255, 255, 200))
        save_image(img, os.path.join(out_dir, f'icon_room_{room}.png'))


def generate_icons_elements():
    """生成元素图标"""
    print("\n=== 生成元素图标 ===")
    out_dir = 'assets/resources/textures/icons/elements'
    
    elements = {
        'fire': COLORS['volcano_primary'],
        'frost': COLORS['tundra_primary'],
        'lightning': '#FFDD44',
        'poison': COLORS['swamp_poison'],
        'shadow': COLORS['abyss_primary'],
        'holy': '#FFFFFF',
    }
    
    for name, color in elements.items():
        img = create_image(24, 24, transparent=True)
        draw = ImageDraw.Draw(img)
        draw.rectangle([2, 2, 21, 21], fill=hex_to_rgba(color, 180), outline=hex_to_rgb(color))
        # 中心标记
        center = hex_to_rgba('#FFFFFF', 200)
        draw.point((12, 12), fill=center)
        save_image(img, os.path.join(out_dir, f'icon_element_{name}.png'))


def generate_icons_misc():
    """生成杂项图标"""
    print("\n=== 生成杂项图标 ===")
    out_dir = 'assets/resources/textures/icons'
    
    # icon_coin (24x24)
    img = create_image(24, 24, transparent=True)
    draw = ImageDraw.Draw(img)
    gold_rgba = hex_to_rgba(COLORS['gold'])
    draw.ellipse([2, 2, 21, 21], fill=gold_rgba, outline=hex_to_rgb(COLORS['gold']))
    draw.text((8, 7), '$', fill=(255, 255, 255, 200))
    save_image(img, os.path.join(out_dir, 'icon_coin.png'))
    
    # icon_key (24x24)
    img = create_image(24, 24, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.ellipse([4, 4, 16, 16], fill=hex_to_rgba('#C0C0C0', 200), outline='#A0A0A0')
    draw.rectangle([12, 16, 14, 22], fill='#A0A0A0')
    save_image(img, os.path.join(out_dir, 'icon_key.png'))
    
    # icon_soul (32x32)
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    soul_color = hex_to_rgba('#8888FF', 200)
    draw.ellipse([8, 4, 23, 22], fill=soul_color, outline='#6666DD')
    draw.text((10, 10), ' souls', fill=(255, 255, 255, 180))
    save_image(img, os.path.join(out_dir, 'icon_soul.png'))
    
    # icon_hp (24x24)
    img = create_image(24, 24, transparent=True)
    draw = ImageDraw.Draw(img)
    green_rgba = hex_to_rgba(COLORS['green'])
    # 心形占位
    draw.rectangle([4, 8, 20, 16], fill=green_rgba)
    draw.ellipse([4, 4, 12, 12], fill=green_rgba)
    draw.ellipse([12, 4, 20, 12], fill=green_rgba)
    save_image(img, os.path.join(out_dir, 'icon_hp.png'))


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
    
    print("回到地面 - 美术资源生成器 v1.0")
    print("=" * 50)
    
    generate_ui_splash()
    generate_ui_common()
    generate_ui_map()
    generate_icons_elements()
    generate_icons_misc()
    
    print("\n" + "=" * 50)
    print("[OK] 基础资源生成完成")
