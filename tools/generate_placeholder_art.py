"""
generate_placeholder_art.py
Phase 3 M3.5: 为 Phase 3 生成占位符美术资源

为每个区域生成占位符精灵:
- 6种普通怪物 (32×32 彩色方块)
- 1种迷你Boss (48×48 彩色方块+框)
- 1种终结Boss (64×64 彩色方块+边框)
- 区域 Tile (16×16 地板+墙壁)
- UI 按钮/图标 (32×32)

输出: E:/game/回到地面/assets/resources/arts/placeholders/

区域颜色方案:
  forest    → 绿色系 (#4a7c3f, #7cb342)
  catacombs → 灰色系 (#5d4037, #795548)
  volcano   → 红色系 (#d84315, #bf360c)
  tundra    → 蓝色系 (#42a5f5, #1e88e5)
  swamp     → 紫色系 (#7b1fa2, #9c27b0)
  abyss     → 黑色系 (#263238, #37474f)
"""

import os
from PIL import Image, ImageDraw, ImageFont
import json

OUTPUT_DIR = r"E:/game/回到地面/assets/resources/arts/placeholders"

ZONE_THEMES = {
    'forest':    {'name': '翠绿森林', 'colors': {'base': '#4a7c3f', 'light': '#7cb342', 'dark': '#2e7d32', 'accent': '#8bc34a'}},
    'catacombs': {'name': '幽暗墓穴', 'colors': {'base': '#5d4037', 'light': '#795548', 'dark': '#3e2723', 'accent': '#a1887f'}},
    'volcano':   {'name': '熔岩火山', 'colors': {'base': '#d84315', 'light': '#ff7043', 'dark': '#bf360c', 'accent': '#ffab91'}},
    'tundra':    {'name': '冰封雪原', 'colors': {'base': '#42a5f5', 'light': '#90caf9', 'dark': '#1565c0', 'accent': '#e3f2fd'}},
    'swamp':     {'name': '剧毒沼泽', 'colors': {'base': '#7b1fa2', 'light': '#ab47bc', 'dark': '#4a148c', 'accent': '#ce93d8'}},
    'abyss':     {'name': '暗影深渊', 'colors': {'base': '#37474f', 'light': '#546e7a', 'dark': '#1a237e', 'accent': '#00bcd4'}},
}

MONSTER_SHAPES = {
    'charger':  'circle',    # 圆形
    'ranged':   'diamond',   # 菱形
    'defender': 'square',    # 方形(带盾)
    'suicider': 'triangle',  # 三角(倒)
    'summoner': 'hexagon',   # 六边形
    'elite':    'star',      # 星形
}

BOSS_SHAPES = {
    'miniboss': 'hexagon_bold',
    'finalboss': 'star_bold',
}

def hex_to_rgb(hex_color: str) -> tuple:
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def draw_circle(draw, cx, cy, r, fill, outline=None):
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill, outline=outline)

def draw_diamond(draw, cx, cy, r, fill, outline=None):
    draw.polygon([(cx, cy-r), (cx+r, cy), (cx, cy+r), (cx-r, cy)], fill=fill, outline=outline)

def draw_square(draw, cx, cy, r, fill, outline=None):
    draw.rectangle([cx-r, cy-r, cx+r, cy+r], fill=fill, outline=outline)

def draw_triangle(draw, cx, cy, r, fill, outline=None):
    draw.polygon([(cx, cy-r), (cx+r, cy+r), (cx-r, cy+r)], fill=fill, outline=outline)

def draw_hexagon(draw, cx, cy, r, fill, outline=None):
    pts = []
    for i in range(6):
        angle = i * 60 - 90
        pts.append((cx + r * __import__('math').cos(__import__('math').radians(angle)),
                    cy + r * __import__('math').sin(__import__('math').radians(angle))))
    draw.polygon(pts, fill=fill, outline=outline)

def draw_hexagon_bold(draw, cx, cy, r, fill, outline=None):
    # 迷你Boss: 六边形 + 内圈
    pts = []
    for i in range(6):
        angle = i * 60 - 90
        pts.append((cx + r * __import__('math').cos(__import__('math').radians(angle)),
                    cy + r * __import__('math').sin(__import__('math').radians(angle))))
    # 外框
    draw.polygon(pts, fill=None, outline=outline or (255,255,255), width=3)
    # 内形状
    pts2 = []
    for i in range(6):
        angle = i * 60 - 90
        pts2.append((cx + (r-4) * __import__('math').cos(__import__('math').radians(angle)),
                     cy + (r-4) * __import__('math').sin(__import__('math').radians(angle))))
    draw.polygon(pts2, fill=fill)

def draw_star(draw, cx, cy, r, fill, outline=None):
    pts = []
    for i in range(10):
        angle = i * 36 - 90
        radius = r if i % 2 == 0 else r * 0.45
        pts.append((cx + radius * __import__('math').cos(__import__('math').radians(angle)),
                    cy + radius * __import__('math').sin(__import__('math').radians(angle))))
    draw.polygon(pts, fill=fill, outline=outline)

def draw_star_bold(draw, cx, cy, r, fill, outline=None):
    # 终结Boss: 星星 + 外发光
    pts = []
    for i in range(10):
        angle = i * 36 - 90
        radius = r if i % 2 == 0 else r * 0.45
        pts.append((cx + radius * __import__('math').cos(__import__('math').radians(angle)),
                    cy + radius * __import__('math').sin(__import__('math').radians(angle))))
    draw.polygon(pts, fill=None, outline=outline or (255,215,0), width=4)
    pts2 = []
    for i in range(10):
        angle = i * 36 - 90
        radius = (r-4) if i % 2 == 0 else (r-4) * 0.45
        pts2.append((cx + radius * __import__('math').cos(__import__('math').radians(angle)),
                     cy + radius * __import__('math').sin(__import__('math').radians(angle))))
    draw.polygon(pts2, fill=fill)

SHAPE_FUNCS = {
    'circle': draw_circle,
    'diamond': draw_diamond,
    'square': draw_square,
    'triangle': draw_triangle,
    'hexagon': draw_hexagon,
    'star': draw_star,
    'hexagon_bold': draw_hexagon_bold,
    'star_bold': draw_star_bold,
}

def generate_monster_sprite(name_prefix, shape_name, size, base_color, accent_color, filename):
    """生成单个怪物占位符精灵"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = size // 2
    r = size // 2 - 2

    fill_color = hex_to_rgb(base_color)
    outline_color = hex_to_rgb(accent_color)

    draw_func = SHAPE_FUNCS.get(shape_name, draw_circle)
    draw_func(draw, cx, cy, r, fill_color, outline_color)

    # 保存
    img.save(filename, 'PNG')

def generate_tile(zone_id, colors, size=16):
    """生成区域地板和墙壁 Tile"""
    base = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(base)

    # 地板
    floor_color = hex_to_rgb(colors['light'])
    draw.rectangle([0, 0, size-1, size-1], fill=floor_color, outline=hex_to_rgb(colors['dark']))

    # 墙壁
    wall = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw2 = ImageDraw.Draw(wall)
    wall_color = hex_to_rgb(colors['dark'])
    draw2.rectangle([0, 0, size-1, size-1], fill=wall_color, outline=hex_to_rgb(colors['base']))

    base.save(os.path.join(OUTPUT_DIR, f'{zone_id}_floor.png'))
    wall.save(os.path.join(OUTPUT_DIR, f'{zone_id}_wall.png'))

def main():
    print("=" * 60)
    print("Phase 3 M3.5: 生成占位符美术资源")
    print("=" * 60)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    monster_counts = {}
    total_generated = 0

    for zone_id, theme in ZONE_THEMES.items():
        colors = theme['colors']
        print(f"\n[区域] {theme['name']} ({zone_id})")

        # === 6种普通怪物 (32x32) ===
        monsters = ['slime', 'soldier', 'flyer', 'heavy', 'caster', 'rogue']
        shapes = ['circle', 'circle', 'diamond', 'square', 'diamond', 'triangle']
        names = ['史莱姆', '士兵', '飞兵', '重甲', '法师', '刺客']

        for i, mkey in enumerate(monsters):
            # 不同怪物用不同的亮色
            brightness = 0.5 + (i * 0.1)
            
            filename = os.path.join(OUTPUT_DIR, f'{zone_id}_{mkey}.png')
            generate_monster_sprite(
                f'{zone_id}_{mkey}',
                shapes[i],
                32,
                colors['base'],
                colors['accent'],
                filename
            )
            total_generated += 1
            print(f"  ✓ {names[i]} ({mkey}) 32×32 -> {zone_id}_{mkey}.png")

        # === 精英怪 (32x32, 金色边框) ===
        elite_filename = os.path.join(OUTPUT_DIR, f'{zone_id}_elite.png')
        generate_monster_sprite(
            f'{zone_id}_elite',
            'star',
            32,
            colors['base'],
            '#FFD700',
            elite_filename
        )
        total_generated += 1
        print(f"  ✓ 精英 32×32 -> {zone_id}_elite.png")

        # === 迷你Boss (48x48) ===
        mb_filename = os.path.join(OUTPUT_DIR, f'{zone_id}_miniboss.png')
        generate_monster_sprite(
            f'{zone_id}_miniboss',
            'hexagon_bold',
            48,
            colors['dark'],
            '#FFFFFF',
            mb_filename
        )
        total_generated += 1
        print(f"  ✓ 迷你Boss 48×48 -> {zone_id}_miniboss.png")

        # === 终结Boss (64x64) ===
        fb_filename = os.path.join(OUTPUT_DIR, f'{zone_id}_finalboss.png')
        generate_monster_sprite(
            f'{zone_id}_finalboss',
            'star_bold',
            64,
            colors['base'],
            '#FFD700',
            fb_filename
        )
        total_generated += 1
        print(f"  ✓ 终结Boss 64×64 -> {zone_id}_finalboss.png")

        # === Tile ===
        generate_tile(zone_id, colors)
        total_generated += 2
        print(f"  ✓ 地板/墙壁 Tile 16×16 -> {zone_id}_floor.png, {zone_id}_wall.png")

        monster_counts[zone_id] = len(monsters) + 1  # +1 for elite

    # === 通用UI占位符 ===
    print("\n[UI] 通用元素")
    ui_elements = [
        ('btn_attack', 'square', '#e53935', '#ffcdd2'),
        ('btn_skill', 'square', '#1e88e5', '#bbdefb'),
        ('btn_dodge', 'square', '#43a047', '#c8e6c9'),
        ('icon_hp', 'circle', '#e53935', '#ffffff'),
        ('icon_gold', 'circle', '#ffb300', '#ffffff'),
        ('icon_key', 'circle', '#7cb342', '#ffffff'),
        ('icon_soul', 'circle', '#9c27b0', '#ffffff'),
        ('icon_element', 'circle', '#00bcd4', '#ffffff'),
    ]
    for name, shape, color, accent in ui_elements:
        filename = os.path.join(OUTPUT_DIR, f'{name}.png')
        generate_monster_sprite(name, shape, 32, color, accent, filename)
        print(f"  ✓ {name} 32×32 -> {name}.png")
        total_generated += 1

    # === 汇总 ===
    print(f"\n{'=' * 60}")
    print(f"生成完成! 共计 {total_generated} 个占位符精灵")
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"{'=' * 60}")

    # 生成资源索引
    index = {
        'version': '1.0.0',
        'generated': '2026-06-25',
        'tool': 'generate_placeholder_art.py',
        'count': total_generated,
        'zones': list(monster_counts.keys()),
    }
    with open(os.path.join(OUTPUT_DIR, '_index.json'), 'w') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"资源索引 -> placeholders/_index.json")

if __name__ == '__main__':
    main()
