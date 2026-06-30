#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成UI界面资源
包括: HUD / 强化房 / 装备背包 / 商店 / 结算
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.join(os.getcwd(), 'assets', 'resources', 'textures', 'ui')

def save_img(img, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, 'PNG')
    size = os.path.getsize(filepath)
    print(f"  [OK] {os.path.relpath(filepath, ROOT)} ({img.size[0]}x{img.size[1]}, {size}B)")

def draw_beveled_rect(draw, bbox, fill, border_width=2, border_color=None):
    """绘制带斜面效果的矩形"""
    if len(fill) == 3:
        fill = (*fill, 200)
    r, g, b, a = fill
    light = (min(r+40,255), min(g+40,255), min(b+40,255), a)
    dark = (max(r-40,0), max(g-40,0), max(b-40,0), a)
    # 顶边和左边浅色
    for i in range(border_width):
        top = bbox[1]+i
        left = bbox[0]+i
        bottom = bbox[3]-border_width+i
        right = bbox[2]-border_width+i
        draw.rectangle([bbox[0], top, bbox[2], top+1], fill=light)
        draw.rectangle([left, bbox[1], left+1, bbox[3]], fill=light)
        draw.rectangle([bbox[0], bottom, bbox[2], bottom+1], fill=dark)
        draw.rectangle([right, bbox[1], right+1, bbox[3]], fill=dark)

# ========== 1. HUD ==========
print("=== HUD UI ===")
hud_dir = os.path.join(ROOT, 'hud')

# 血条组件
img = Image.new('RGBA', (200, 20), (50, 50, 70, 200))
save_img(img, os.path.join(hud_dir, 'hud_hpBar_bg.png'))
img = Image.new('RGBA', (200, 20), (220, 40, 40, 220))
save_img(img, os.path.join(hud_dir, 'hud_hpBar_fill.png'))
img = Image.new('RGBA', (200, 20), (100, 100, 120, 200))
img_draw = ImageDraw.Draw(img)
for i in range(200):
    img_draw.line([i, 0, i, 3], fill=(180,180,200,180))
    img_draw.line([i, 17, i, 20], fill=(80,80,100,180))
save_img(img, os.path.join(hud_dir, 'hud_hpBar_frame.png'))

# 技能槽位
img = Image.new('RGBA', (60, 60), (30, 30, 50, 180))
draw = ImageDraw.Draw(img)
draw_beveled_rect(draw, [0, 0, 59, 59], (50, 50, 70, 200))
save_img(img, os.path.join(hud_dir, 'hud_skillSlot.png'))

# CD遮罩
img = Image.new('RGBA', (60, 60), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.pieslice([0, 0, 59, 59], 0, 270, fill=(0, 0, 0, 150))
save_img(img, os.path.join(hud_dir, 'hud_cdMask.png'))

# 摇杆
img = Image.new('RGBA', (120, 120), (40, 40, 60, 150))
draw = ImageDraw.Draw(img)
draw.ellipse([0, 0, 119, 119], fill=(60, 60, 80, 180), outline=(120, 120, 140, 200), width=3)
save_img(img, os.path.join(hud_dir, 'joystick_base.png'))

img = Image.new('RGBA', (40, 40), (200, 200, 220, 200))
draw = ImageDraw.Draw(img)
draw.ellipse([0, 0, 39, 39], fill=(180, 180, 200, 220), outline=(220, 220, 240, 200), width=2)
save_img(img, os.path.join(hud_dir, 'joystick_dot.png'))

# 翻滚按钮
img = Image.new('RGBA', (48, 48), (80, 60, 120, 200))
draw = ImageDraw.Draw(img)
draw.ellipse([2, 2, 45, 45], fill=(100, 80, 140, 200), outline=(150, 130, 180, 200), width=2)
save_img(img, os.path.join(hud_dir, 'hud_rollBtn.png'))

# ========== 2. 强化房UI ==========
print("\n=== 强化房UI ===")
upgrade_dir = os.path.join(ROOT, 'upgrade')

# 卡牌边框
rarities = {'common': (180, 180, 180, 220), 'rare': (80, 120, 200, 220), 'epic': (200, 180, 60, 220)}
for name, color in rarities.items():
    img = Image.new('RGBA', (160, 220), (40, 40, 60, 200))
    draw = ImageDraw.Draw(img)
    draw_beveled_rect(draw, [0, 0, 159, 219], color)
    save_img(img, os.path.join(upgrade_dir, f'card_frame_{name}.png'))

# 技能图标 (64x64)
abilities = [
    'doubleStrike', 'phaseWalk', 'warCry', 'lifeStealAura', 'ricochet',
    'shieldReflect', 'bulletTime', 'elementResonance', 'sprint',
    'frostBite', 'fireWalker', 'holyShield'
]
for name in abilities:
    img = Image.new('RGBA', (64, 64), (50, 50, 70, 200))
    draw = ImageDraw.Draw(img)
    draw.polygon([(32, 4), (60, 32), (32, 60), (4, 32)], fill=(100, 100, 140, 180), outline=(140, 140, 180, 200))
    save_img(img, os.path.join(upgrade_dir, f'icon_ability_{name}.png'))

# 属性强化图标
upgrades = ['berserkerPact', 'ironWall', 'windStep', 'longArm', 'lifeCharm', 'greedRing', 'agileBoots']
for name in upgrades:
    img = Image.new('RGBA', (64, 64), (50, 50, 70, 200))
    draw = ImageDraw.Draw(img)
    draw.rectangle([8, 8, 55, 55], fill=(80, 80, 110, 180), outline=(120, 120, 150, 200), width=2)
    save_img(img, os.path.join(upgrade_dir, f'icon_upgrade_{name}.png'))

# 遗物图标 (8被动+8主动)
relics_passive = ['thornArmor', 'luckyCoin', 'frenzyAxe', 'immortalStone', 'echoOrb', 'speedGauntlet', 'ironArmor', 'shadowCloak']
relics_active = ['shadowDagger', 'frostAmulet', 'flameRing', 'blinkStone', 'gravityStone', 'lifeLink', 'decoyScroll', 'timeHourglass']
for name in relics_passive:
    img = Image.new('RGBA', (64, 64), (50, 50, 70, 200))
    draw = ImageDraw.Draw(img)
    draw.ellipse([4, 4, 59, 59], fill=(100, 90, 60, 180), outline=(160, 150, 80, 200), width=2)
    save_img(img, os.path.join(upgrade_dir, f'icon_relic_{name}.png'))
for name in relics_active:
    img = Image.new('RGBA', (64, 64), (50, 50, 70, 200))
    draw = ImageDraw.Draw(img)
    draw.polygon([(32, 4), (60, 32), (32, 60), (4, 32)], fill=(60, 90, 120, 180), outline=(100, 150, 200, 200))
    save_img(img, os.path.join(upgrade_dir, f'icon_relic_{name}.png'))

# ========== 3. 装备/背包UI ==========
print("\n=== 装备/背包UI ===")
equip_dir = os.path.join(ROOT, 'equipment')

# 装备底框
img = Image.new('RGBA', (400, 300), (40, 40, 60, 200))
draw = ImageDraw.Draw(img)
draw_beveled_rect(draw, [0, 0, 399, 299], (80, 80, 100, 200))
# 人体轮廓简化
draw.ellipse([160, 20, 240, 80], fill=(60, 60, 80, 180), outline=(120, 120, 140, 200), width=2)
draw.rectangle([150, 80, 250, 200], fill=(60, 60, 80, 180), outline=(120, 120, 140, 200), width=2)
for x in [120, 280]:
    draw.rectangle([x, 85, x+30, 180], fill=(60, 60, 80, 180), outline=(120, 120, 140, 200), width=2)
for x in [170, 230]:
    draw.rectangle([x, 200, x+20, 280], fill=(60, 60, 80, 180), outline=(120, 120, 140, 200), width=2)
save_img(img, os.path.join(equip_dir, 'equip_body_frame.png'))

# 装备槽位图标 (9个)
slots = ['weapon', 'ring', 'necklace', 'helmet', 'chest', 'legs', 'shoes', 'gloves']
for name in slots:
    img = Image.new('RGBA', (48, 48), (50, 50, 70, 180))
    draw = ImageDraw.Draw(img)
    draw.rectangle([2, 2, 45, 45], fill=(70, 70, 90, 180), outline=(120, 120, 140, 200), width=2)
    save_img(img, os.path.join(equip_dir, f'equip_slot_{name}.png'))

# 背包格子
img = Image.new('RGBA', (60, 60), (40, 40, 60, 180))
draw = ImageDraw.Draw(img)
draw_beveled_rect(draw, [0, 0, 59, 59], (80, 80, 100, 200))
save_img(img, os.path.join(equip_dir, 'inventory_slot.png'))

# 道具格子
img = Image.new('RGBA', (40, 40), (40, 40, 60, 180))
draw = ImageDraw.Draw(img)
draw_beveled_rect(draw, [0, 0, 39, 39], (80, 80, 100, 200))
save_img(img, os.path.join(equip_dir, 'item_slot.png'))

# 品质边框
quality_colors = {
    'common': (200, 200, 200, 220),
    'magic': (80, 120, 200, 220),
    'rare': (200, 180, 60, 220),
    'legendary': (220, 120, 40, 220)
}
for name, color in quality_colors.items():
    img = Image.new('RGBA', (60, 60), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 59, 59], fill=None, outline=color, width=3)
    save_img(img, os.path.join(equip_dir, f'rarity_{name}.png'))

# 套装计数器
img = Image.new('RGBA', (200, 120), (40, 40, 60, 200))
draw = ImageDraw.Draw(img)
draw_beveled_rect(draw, [0, 0, 199, 119], (80, 80, 100, 200))
save_img(img, os.path.join(equip_dir, 'set_counter_bg.png'))

# ========== 4. 商店UI ==========
print("\n=== 商店UI ===")
shop_dir = os.path.join(ROOT, 'shop')

img = Image.new('RGBA', (750, 1334), (60, 50, 80, 220))
draw = ImageDraw.Draw(img)
for y in range(0, 1334, 30):
    draw.line([(0, y), (750, y)], fill=(80, 70, 100, 100))
save_img(img, os.path.join(shop_dir, 'shop_bg.png'))

img = Image.new('RGBA', (160, 180), (50, 50, 70, 200))
draw = ImageDraw.Draw(img)
draw_beveled_rect(draw, [0, 0, 159, 179], (100, 90, 130, 200))
save_img(img, os.path.join(shop_dir, 'shop_slot.png'))

# 金币图标
img = Image.new('RGBA', (24, 24), (212, 175, 55, 220))
draw = ImageDraw.Draw(img)
draw.ellipse([0, 0, 23, 23], fill=(212, 175, 55, 220), outline=(240, 210, 100, 220), width=2)
save_img(img, os.path.join(shop_dir, 'icon_coin.png'))

# ========== 5. 结算UI ==========
print("\n=== 结算UI ===")
death_dir = os.path.join(ROOT, 'death')

img = Image.new('RGBA', (750, 1334), (30, 20, 40, 230))
draw = ImageDraw.Draw(img)
for y in range(0, 1334, 20):
    draw.line([(0, y), (750, y)], fill=(50, 30, 60, 80))
save_img(img, os.path.join(death_dir, 'death_bg.png'))

# 魂石图标
img = Image.new('RGBA', (32, 32), (100, 60, 160, 200))
draw = ImageDraw.Draw(img)
draw.polygon([(16, 2), (30, 16),  (16, 30),  (2, 16)], fill=(120, 80, 180, 200), outline=(180, 140, 220, 220))
save_img(img, os.path.join(death_dir, 'icon_soulstone.png'))

# 结算面板
img = Image.new('RGBA', (500, 400), (50, 40, 60, 220))
draw = ImageDraw.Draw(img)
draw_beveled_rect(draw, [0, 0, 499, 399], (80, 70, 100, 220))
save_img(img, os.path.join(death_dir, 'result_panel.png'))

# 复活按钮 (默认+按下)
for state in ['default', 'active']:
    img = Image.new('RGBA', (200, 60), (80, 120, 80, 220))
    draw = ImageDraw.Draw(img)
    color = (100, 140, 100, 220) if state == 'active' else (80, 120, 80, 220)
    draw_beveled_rect(draw, [0, 0, 199, 59], color)
    save_img(img, os.path.join(death_dir, f'btn_revive_{state}.png'))

# 结算按钮 (默认+按下)
for state in ['default', 'active']:
    img = Image.new('RGBA', (200, 60), (120, 80, 80, 220))
    draw = ImageDraw.Draw(img)
    color = (140, 100, 80, 220) if state == 'active' else (120, 80, 80, 220)
    draw_beveled_rect(draw, [0, 0, 199, 59], color)
    save_img(img, os.path.join(death_dir, f'btn_settle_{state}.png'))

print("\n=== 全部UI完成! ===")
