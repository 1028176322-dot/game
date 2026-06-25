#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美术资源生成脚本 - 完整版
生成所有占位美术资源

直接在项目根目录运行，路径使用相对于 assets/ 的相对路径
"""

import os
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
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def hex_to_rgba(h, alpha=255):
    r, g, b = hex_to_rgb(h)
    return (r, g, b, alpha)


def create_image(width, height, fill_color=None, transparent=False):
    if transparent:
        return Image.new('RGBA', (width, height), (0, 0, 0, 0))
    elif fill_color:
        if isinstance(fill_color, str):
            fill_color = hex_to_rgba(fill_color)
        return Image.new('RGBA', (width, height), fill_color)
    else:
        return Image.new('RGBA', (width, height))


def save_image(img, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, 'PNG')
    file_size = os.path.getsize(filepath)
    rel_path = os.path.relpath(filepath, '.')
    print(f"  [OK] {os.path.basename(filepath)} ({img.size[0]}x{img.size[1]}, {file_size}B) -> {rel_path}")


def generate_ui_splash():
    print("\n=== 生成启动屏资源 ===")
    out_dir = 'assets/resources/textures/ui/splash'
    
    img = create_image(1280, 720, COLORS['bg_dark'])
    draw = ImageDraw.Draw(img)
    for y in range(0, 720, 32):
        for x in range(0, 1280, 32):
            if (x // 32 + y // 32) % 2 == 0:
                draw.rectangle([x, y, x+31, y+31], fill=(*hex_to_rgb(COLORS['panel']), 180))
    gold_color = hex_to_rgba(COLORS['gold'], 80)
    for i in range(0, 1280, 64):
        for j in range(5):
            draw.rectangle([i+j*2, 300+j*10, i+j*2+4, 300+j*10+4], fill=gold_color)
    save_image(img, os.path.join(out_dir, 'splash_bg.png'))
    
    img = create_image(400, 120, transparent=True)
    draw = ImageDraw.Draw(img)
    gold_rgba = hex_to_rgba(COLORS['gold'])
    draw.rectangle([0, 0, 399, 119], outline=gold_rgba, width=4)
    draw.rectangle([4, 4, 395, 115], outline=gold_rgba, width=2)
    draw.rectangle([6, 6, 393, 113], fill=hex_to_rgba(COLORS['panel'], 200))
    draw.text((130, 50), '回到地面', fill=gold_rgba)
    save_image(img, os.path.join(out_dir, 'splash_logo.png'))


def generate_ui_common():
    print("\n=== 生成通用UI资源 ===")
    out_dir = 'assets/resources/textures/ui/common'
    panel_color = hex_to_rgba(COLORS['panel'])
    edge_color = hex_to_rgba(COLORS['edge'])
    
    img = create_image(64, 64, transparent=True)
    draw = ImageDraw.Draw(img)
    corner_size = 8
    for cx, cy in [(0, 0), (56, 0), (0, 56), (56, 56)]:
        draw.rectangle([cx, cy, cx+corner_size-1, cy+corner_size-1], fill=panel_color)
        draw.rectangle([cx, cy, cx+corner_size-1, cy+corner_size-1], outline=edge_color, width=1)
    save_image(img, os.path.join(out_dir, 'panel_bg.png'))
    
    for variant, offset in [('btn_default', 0), ('btn_hover', -20), ('btn_active', 40)]:
        img = create_image(200, 60, transparent=True)
        draw = ImageDraw.Draw(img)
        base_r, base_g, base_b = panel_color[:3]
        fill_c = (min(255, max(0, base_r + offset)), min(255, max(0, base_g + offset)), min(255, max(0, base_b + offset)), 255)
        draw.rectangle([2, 2, 197, 57], fill=fill_c, outline=edge_color, width=2)
        save_image(img, os.path.join(out_dir, variant + '.png'))
    
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 31, 31], fill=hex_to_rgba(COLORS['card']), outline=edge_color, width=1)
    close_color = hex_to_rgba(COLORS['red'])
    for i in range(0, 24, 4):
        draw.line([(4+i, 4+i), (28-i, 28-i)], fill=close_color, width=3)
        draw.line([(28-i, 4+i), (4+i, 28-i)], fill=close_color, width=3)
    save_image(img, os.path.join(out_dir, 'btn_close.png'))


def generate_ui_map():
    print("\n=== 生成地牢地图UI资源 ===")
    out_dir = 'assets/resources/textures/ui/map'
    edge_color = hex_to_rgba(COLORS['edge'])
    gold_color = hex_to_rgba(COLORS['gold'], 200)
    card_color = hex_to_rgba(COLORS['card'])
    
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([4, 4, 27, 27], fill=card_color, outline=edge_color, width=2)
    save_image(img, os.path.join(out_dir, 'map_node_unknown.png'))
    
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([4, 4, 27, 27], fill=hex_to_rgba(COLORS['panel']), outline=edge_color, width=2)
    save_image(img, os.path.join(out_dir, 'map_node_visited.png'))
    
    img = create_image(32, 32, transparent=True)
    draw = ImageDraw.Draw(img)
    draw.rectangle([2, 2, 29, 29], fill=hex_to_rgba(COLORS['card']), outline=gold_color, width=3)
    draw.rectangle([8, 8, 23, 23], fill=hex_to_rgba(COLORS['gold'], 150))
    save_image(img, os.path.join(out_dir, 'map_node_current.png'))
    
    img = create_image(2, 16, transparent=True)
    ImageDraw.Draw(img).rectangle([0, 0, 1, 15], fill=edge_color)
    save_image(img, os.path.join(out_dir, 'map_line.png'))
    
    room_types = ['combat', 'treasure', 'shop', 'healing', 'upgrade', 'event', 'boss']
    room_colors = {
        'combat': COLORS['red'], 'treasure': COLORS['gold'], 'shop': COLORS['gold'],
        'healing': COLORS['green'], 'upgrade': '#4488FF', 'event': '#AA88FF', 'boss': '#FF4488',
    }
    for room in room_types:
        img = create_image(20, 20, transparent=True)
        draw = ImageDraw.Draw(img)
        draw.rectangle([2, 2, 17, 17], fill=hex_to_rgba(room_colors[room], 150), outline=hex_to_rgb(room_colors[room]))
        save_image(img, os.path.join(out_dir, f'icon_room_{room}.png'))


def generate_ui_main():
    print("\n=== 生成主界面资源 ===")
    out_dir = 'assets/resources/textures/ui/main'
    
    img = create_image(750, 1334, COLORS['bg_dark'])
    draw = ImageDraw.Draw(img)
    for i in range(10):
        y = 100 + i * 130
        draw.rectangle([50, y, 700, y+2], fill=(*hex_to_rgb(COLORS['edge']), 100))
    save_image(img, os.path.join(out_dir, 'main_bg.png'))
    
    img = create_image(600, 200, transparent=True)
    draw = ImageDraw.Draw(img)
    for r in range(100, 0, -1):
        alpha = int(r * 2.55)
        c = (*hex_to_rgb(COLORS['gold']), alpha // 4)
        draw.ellipse([300-r, 100-r//2, 300+r, 100+r//2], outline=c)
    save_image(img, os.path.join(out_dir, 'main_titleDeco.png'))


def generate_characters():
    print("\n=== 生成角色资源 ===")
    characters = [
        ('warrior', COLORS['warrior_main'], COLORS['warrior_sec'], 'assets/resources/textures/characters/warrior'),
        ('archer', COLORS['archer_main'], COLORS['archer_sec'], 'assets/resources/textures/characters/archer'),
        ('assassin', COLORS['assassin_main'], COLORS['assassin_sec'], 'assets/resources/textures/characters/assassin'),
        ('mage', COLORS['mage_main'], COLORS['mage_sec'], 'assets/resources/textures/characters/mage'),
        ('berserker', COLORS['berserker_main'], COLORS['berserker_sec'], 'assets/resources/textures/characters/berserker'),
    ]
    animations = ['idle', 'walk', 'attack', 'skill', 'dodge', 'hit', 'death']
    
    for char_name, main_c, sec_c, out_dir in characters:
        for anim in animations:
            img = create_image(64, 64, transparent=True)
            draw = ImageDraw.Draw(img)
            main_rgba = hex_to_rgba(main_c, 200)
            sec_rgba = hex_to_rgba(sec_c, 150)
            draw.rectangle([16, 21, 47, 41], fill=main_rgba, outline=hex_to_rgb(main_c))
            draw.ellipse([21, 0, 42, 20], fill=sec_rgba, outline=hex_to_rgb(sec_c))
            save_image(img, os.path.join(out_dir, f'{char_name}_{anim}.png'))


def generate_monsters():
    print("\n=== 生成怪物资源 ===")
    zones = [
        ('forest', COLORS['forest_primary'], 'assets/resources/textures/monsters/forest'),
        ('catacombs', COLORS['catacombs_primary'], 'assets/resources/textures/monsters/catacombs'),
        ('volcano', COLORS['volcano_primary'], 'assets/resources/textures/monsters/volcano'),
        ('tundra', COLORS['tundra_primary'], 'assets/resources/textures/monsters/tundra'),
        ('swamp', COLORS['swamp_primary'], 'assets/resources/textures/monsters/swamp'),
        ('abyss', COLORS['abyss_primary'], 'assets/resources/textures/monsters/abyss'),
    ]
    monster_types = ['slime', 'fungus', 'tree', 'beast', 'flyer', 'elite']
    
    for zone_name, base_color, out_dir in zones:
        for monster_name in monster_types:
            img = create_image(48 if monster_name != 'elite' else 64, 48 if monster_name != 'elite' else 64, transparent=True)
            draw = ImageDraw.Draw(img)
            color_rgba = hex_to_rgba(base_color, 180)
            color_rgb = hex_to_rgb(base_color)
            if monster_name == 'slime':
                draw.ellipse([10, 15, 37, 33], fill=color_rgba, outline=color_rgb)
            elif monster_name == 'elite':
                draw.ellipse([8, 8, 55, 55], fill=color_rgba, outline=color_rgb)
                draw.ellipse([12, 12, 51, 51], fill=hex_to_rgba(COLORS['gold'], 150))
            else:
                draw.rectangle([10, 10, 37, 37], fill=color_rgba, outline=color_rgb)
            save_image(img, os.path.join(out_dir, f'{zone_name}_{monster_name}_idle.png'))


def generate_tiles():
    print("\n=== 生成地形Tile资源 ===")
    zones = [('forest', COLORS['forest_primary']), ('catacombs', COLORS['catacombs_primary']),
             ('volcano', COLORS['volcano_primary']), ('tundra', COLORS['tundra_primary']),
             ('swamp', COLORS['swamp_primary']), ('abyss', COLORS['abyss_primary'])]
    tile_types = ['floor', 'wall', 'thorn', 'highground']
    
    for zone_name, base_color in zones:
        out_dir = f'assets/resources/textures/tiles/{zone_name}'
        for tile_type in tile_types:
            rect_fill = hex_to_rgba(base_color)
            img = Image.new('RGBA', (32, 32), (*rect_fill[:3], 180))
            draw = ImageDraw.Draw(img)
            if tile_type == 'floor':
                for y in range(0, 32, 16):
                    for x in range(0, 32, 16):
                        if (x + y) % 32 == 0:
                            draw.rectangle([x, y, x+15, y+15], fill=(*rect_fill[:3], 150))
            elif tile_type == 'wall':
                draw.rectangle([0, 0, 31, 15], fill=(*rect_fill[:3], 200))
                draw.rectangle([0, 16, 31, 31], fill=(*rect_fill[:3], 160))
            elif tile_type == 'thorn':
                spike_color = hex_to_rgb(base_color)
                for x in range(4, 32, 8):
                    draw.polygon([(x, 31), (x+4, 15), (x+8, 31)], fill=spike_color)
            else:
                draw.rectangle([2, 20, 29, 30], fill=(*rect_fill[:3], 220))
                draw.rectangle([0, 18, 31, 20], fill=(*rect_fill[:3], 180))
            save_image(img, os.path.join(out_dir, f'tile_{zone_name}_{tile_type}.png'))


def generate_minibosses():
    print("\n=== 生成迷你Boss资源 ===")
    zones = [('forest', COLORS['forest_primary'], 'assets/resources/textures/bosses/miniboss/forest'),
             ('catacombs', COLORS['catacombs_primary'], 'assets/resources/textures/bosses/miniboss/catacombs'),
             ('volcano', COLORS['volcano_primary'], 'assets/resources/textures/bosses/miniboss/volcano'),
             ('tundra', COLORS['tundra_primary'], 'assets/resources/textures/bosses/miniboss/tundra'),
             ('swamp', COLORS['swamp_primary'], 'assets/resources/textures/bosses/miniboss/swamp'),
             ('abyss', COLORS['abyss_primary'], 'assets/resources/textures/bosses/miniboss/abyss')]
    miniboss_names = ['guardian', 'sentinel', 'warden', 'overlord', 'champion']
    
    for zone_name, base_color, out_dir in zones:
        for mb_name in miniboss_names:
            img = create_image(64, 64, transparent=True)
            draw = ImageDraw.Draw(img)
            draw.ellipse([16, 16, 47, 47], fill=hex_to_rgba(base_color, 200), outline=hex_to_rgb(base_color))
            draw.ellipse([22, 24, 28, 30], fill=hex_to_rgba(COLORS['gold'], 200))
            draw.ellipse([36, 24, 42, 30], fill=hex_to_rgba(COLORS['gold'], 200))
            save_image(img, os.path.join(out_dir, f'miniboss_{mb_name}_{zone_name}_idle.png'))


def generate_finalbosses():
    print("\n=== 生成终结Boss资源 ===")
    finalbosses = [
        ('boss_guardian_forest', '森林守护者', COLORS['forest_primary'], COLORS['gold']),
        ('boss_lord_catacombs', '亡灵君主', COLORS['catacombs_primary'], COLORS['catacombs_glow']),
        ('boss_lord_volcano', '火焰领主', COLORS['volcano_primary'], '#FF8844'),
        ('boss_queen_tundra', '冰霜女王', COLORS['tundra_primary'], COLORS['tundra_ice']),
        ('boss_beast_swamp', '毒沼巨兽', COLORS['swamp_primary'], COLORS['swamp_poison']),
        ('boss_lord_abyss', '深渊魔王', COLORS['abyss_primary'], COLORS['abyss_void']),
    ]
    animations = ['idle', 'attack', 'skill', 'phaseChange', 'death']
    
    for boss_id, _, body_color, accent_color in finalbosses:
        out_dir = 'assets/resources/textures/bosses/finalboss'
        for anim in animations:
            img = create_image(96, 96, transparent=True)
            draw = ImageDraw.Draw(img)
            draw.ellipse([20, 20, 75, 75], fill=hex_to_rgba(body_color, 220), outline=hex_to_rgb(body_color))
            glow_color = hex_to_rgba(accent_color, 220)
            if anim in ['idle', 'death']:
                draw.ellipse([32, 35, 42, 45], fill=glow_color)
                draw.ellipse([54, 35, 64, 45], fill=glow_color)
            elif anim in ['skill', 'phaseChange']:
                for r in range(40, 20, -2):
                    alpha = int(r * 5.5)
                    draw.ellipse([48-r, 48-r, 48+r, 48+r], outline=(*hex_to_rgb(accent_color), alpha))
            draw.rectangle([2, 2, 93, 93], outline=hex_to_rgb(accent_color), width=3)
            save_image(img, os.path.join(out_dir, f'{boss_id}_{anim}.png'))


def generate_icons():
    print("\n=== 生成图标资源 ===")
    elements = {'fire': COLORS['volcano_primary'], 'frost': COLORS['tundra_primary'],
                'lightning': '#FFDD44', 'poison': COLORS['swamp_poison'],
                'shadow': COLORS['abyss_primary'], 'holy': '#FFFFFF'}
    
    out_dir = 'assets/resources/textures/icons/elements'
    for name, color in elements.items():
        img = create_image(24, 24, transparent=True)
        draw = ImageDraw.Draw(img)
        draw.rectangle([2, 2, 21, 21], fill=hex_to_rgba(color, 180), outline=hex_to_rgb(color))
        save_image(img, os.path.join(out_dir, f'icon_element_{name}.png'))
    
    out_dir = 'assets/resources/textures/icons/items'
    items = [('item_healthPotion', '#FF4444'), ('item_largeHealthPotion', '#FF6644'),
             ('item_key', '#D4AF37'), ('item_map', '#88AA88')]
    for item_name, color in items:
        img = create_image(48, 48, transparent=True)
        draw = ImageDraw.Draw(img)
        draw.ellipse([4, 4, 43, 43], fill=hex_to_rgba(color, 200), outline=hex_to_rgb(color))
        save_image(img, os.path.join(out_dir, f'{item_name}.png'))
    
    out_dir = 'assets/resources/textures/icons/sets'
    sets = [('set_tempest', '#4488FF'), ('set_ironwall', '#888888'), ('set_shadow', '#6644AA'),
            ('set_berserker', '#FF4444'), ('set_frost', '#44AAAA'), ('set_holy', '#FFDD44')]
    for set_name, color in sets:
        img = create_image(32, 32, transparent=True)
        draw = ImageDraw.Draw(img)
        draw.polygon([(16, 2), (28, 6), (28, 18), (16, 30), (4, 18), (4, 6)],
                    fill=hex_to_rgba(color, 200), outline=hex_to_rgb(color))
        save_image(img, os.path.join(out_dir, f'{set_name}.png'))


def generate_effects():
    print("\n=== 生成特效资源 ===")
    fx_types = [('fx_hit_normal', 48, 48, '#FFFFFF'), ('fx_crit', 64, 64, '#FF4444'),
                ('fx_dodge', 32, 32, '#AAAAFF'), ('fx_shield', 64, 64, '#4488FF'),
                ('fx_heal', 80, 80, '#44FF88'), ('fx_dash', 48, 64, '#FFDD44')]
    out_dir = 'assets/resources/textures/effects/combat'
    
    for fx_name, w, h, color in fx_types:
        img = create_image(w, h, transparent=True)
        draw = ImageDraw.Draw(img)
        center_x, center_y = w // 2, h // 2
        radius = min(w, h) // 4
        for r in range(radius, 0, -1):
            alpha = int(r * 255 / radius)
            draw.ellipse([center_x-r, center_y-r, center_x+r, center_y+r],
                        fill=(*hex_to_rgb(color), alpha))
        save_image(img, os.path.join(out_dir, f'{fx_name}.png'))


def generate_room_backgrounds():
    print("\n=== 生成房间背景资源 ===")
    combat_configs = {
        'combat_forest': COLORS['forest_primary'], 'combat_catacombs': COLORS['catacombs_primary'],
        'combat_volcano': COLORS['volcano_primary'], 'combat_tundra': COLORS['tundra_primary'],
        'combat_swamp': COLORS['swamp_primary'], 'combat_abyss': COLORS['abyss_primary'],
    }
    for name, color in combat_configs.items():
        img = create_image(750, 500, (*hex_to_rgb(color), 180))
        draw = ImageDraw.Draw(img)
        for y in range(0, 500, 32):
            for x in range(0, 750, 32):
                if (x // 32 + y // 32) % 3 == 0:
                    draw.rectangle([x, y, x+31, y+31], fill=(*hex_to_rgb(color), 100))
        draw.rectangle([10, 10, 739, 490], outline=hex_to_rgb(COLORS['gold']), width=4)
        save_image(img, os.path.join('assets/resources/textures/backgrounds/combat', f'{name}.png'))
    
    common_rooms = [('bg_room_treasure', '#886622', '#FFDD44', 'treasure'),
                    ('bg_room_healing', '#226644', '#44FF88', 'healing'),
                    ('bg_room_shop', '#664422', '#FFAA44', 'shop'),
                    ('bg_room_upgrade', '#442266', '#AA44FF', 'upgrade')]
    for room_name, base, accent, subdir in common_rooms:
        img = create_image(750, 500, (*hex_to_rgb(base), 180))
        draw = ImageDraw.Draw(img)
        for y in range(0, 500, 40):
            for x in range(0, 750, 40):
                if (x // 40 + y // 40) % 2 == 0:
                    draw.rectangle([x, y, x+39, y+39], fill=(*hex_to_rgb(base), 120))
        draw.rectangle([20, 20, 729, 479], outline=hex_to_rgb(accent), width=4)
        save_image(img, os.path.join(f'assets/resources/textures/backgrounds/{subdir}', f'{room_name}.png'))


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("  回到地面 - 美术资源生成器 v1.0")
    print("=" * 60)
    print(f"\n项目目录: {os.getcwd()}\n")
    
    generate_ui_splash()
    generate_ui_common()
    generate_ui_map()
    generate_ui_main()
    generate_characters()
    generate_monsters()
    generate_tiles()
    generate_minibosses()
    generate_finalbosses()
    generate_icons()
    generate_effects()
    generate_room_backgrounds()
    
    print("\n" + "=" * 60)
    print("[OK] 所有美术资源生成完成!")
    print("=" * 60)
