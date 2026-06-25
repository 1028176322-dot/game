#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美术资源生成脚本 - Boss 资源和图标资源
"""

import os
from PIL import Image, ImageDraw

# 颜色
COLORS = {
    'gold': '#D4AF37',
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
    'panel': '#2A2A3E',
    'bg_dark': '#1A1A2E',
    'red': '#FF4444',
    'green': '#44FF88',
    'blue': '#4488FF',
    'purple': '#AA44FF',
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

def generate_minibosses():
    """生成迷你 Boss 资源 (6 区域 x 27 = 实际上每个区域约4-5个迷你Boss)"""
    print("\n=== 生成迷你 Boss 资源 ===")
    
    zones = [
        ('forest', COLORS['forest_primary'], 'assets/resources/textures/bosses/miniboss/forest'),
        ('catacombs', COLORS['catacombs_primary'], 'assets/resources/textures/bosses/miniboss/catacombs'),
        ('volcano', COLORS['volcano_primary'], 'assets/resources/textures/bosses/miniboss/volcano'),
        ('tundra', COLORS['tundra_primary'], 'assets/resources/textures/bosses/miniboss/tundra'),
        ('swamp', COLORS['swamp_primary'], 'assets/resources/textures/bosses/miniboss/swamp'),
        ('abyss', COLORS['abyss_primary'], 'assets/resources/textures/bosses/miniboss/abyss'),
    ]
    
    # 每个区域约 4-5 个迷你 Boss
    miniboss_names = [
        'guardian', 'sentinel', 'warden', 'overlord', 'champion'
    ]
    
    for zone_name, base_color, out_dir in zones:
        for mb_index, mb_name in enumerate(miniboss_names):
            # 迷你 Boss 64x64
            filename = f'miniboss_{mb_name}_{zone_name}_idle.png'
            
            img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            color_rgba = hex_to_rgba(base_color, 200)
            color_rgb = hex_to_rgb(base_color)
            
            # 精英怪体型 (比普通怪大)
            # 主体
            draw.ellipse([16, 16, 47, 47], fill=color_rgba, outline=color_rgb)
            # 发光眼睛
            glow_color = hex_to_rgba(COLORS['gold'], 200)
            draw.ellipse([22, 24, 28, 30], fill=glow_color)
            draw.ellipse([36, 24, 42, 30], fill=glow_color)
            # 皇冠/角
            crown_color = hex_to_rgb(COLORS['gold'])
            draw.line([(24, 16), (28, 8), (32, 14), (36, 8), (40, 16)], fill=crown_color, width=2)
            
            save_image(img, os.path.join(out_dir, filename))

def generate_finalbosses():
    """生成终结 Boss 资源 (6 个)"""
    print("\n=== 生成终结 Boss 资源 ===")
    
    finalbosses = [
        ('boss_guardian_forest', '森林守护者', COLORS['forest_primary'], COLORS['gold']),
        ('boss_lord_catacombs', '亡灵君主', COLORS['catacombs_primary'], COLORS['catacombs_glow']),
        ('boss_lord_volcano', '火焰领主', COLORS['volcano_primary'], '#FF8844'),
        ('boss_queen_tundra', '冰霜女王', COLORS['tundra_primary'], COLORS['tundra_ice']),
        ('boss_beast_swamp', '毒沼巨兽', COLORS['swamp_primary'], COLORS['swamp_poison']),
        ('boss_lord_abyss', '深渊魔王', COLORS['abyss_primary'], COLORS['abyss_void']),
    ]
    
    for boss_id, boss_name, body_color, accent_color in finalbosses:
        out_dir = 'assets/resources/textures/bosses/finalboss'
        
        # 8 帧动画占位
        animations = ['idle', 'attack', 'skill', 'phaseChange', 'death']
        
        for anim in animations:
            filename = f'{boss_id}_{anim}.png'
            img = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            color_rgba = hex_to_rgba(body_color, 220)
            color_rgb = hex_to_rgb(body_color)
            
            # 大型 Boss 体型
            # 主体 - 更大的椭圆
            draw.ellipse([20, 20, 75, 75], fill=color_rgba, outline=color_rgb)
            
            # 发光眼睛
            glow_color = hex_to_rgba(accent_color, 220)
            if anim == 'idle':
                draw.ellipse([32, 35, 42, 45], fill=glow_color)
                draw.ellipse([54, 35, 64, 45], fill=glow_color)
            elif anim == 'attack':
                # 攻击时眼睛更大更亮
                draw.ellipse([30, 33, 44, 47], fill=glow_color)
                draw.ellipse([52, 33, 66, 47], fill=glow_color)
            elif anim == 'skill':
                # 技能释放时全身发光
                for r in range(40, 20, -2):
                    alpha = int(r * 5.5)
                    c = (*hex_to_rgb(accent_color), alpha)
                    draw.ellipse([48-r, 48-r, 48+r, 48+r], outline=c)
            elif anim == 'phaseChange':
                # 转阶段特效
                for r in range(50, 10, -4):
                    alpha = int(r * 4)
                    c = (*hex_to_rgb(accent_color), alpha)
                    draw.ellipse([48-r, 48-r, 48+r, 48+r], outline=c)
            else:  # death
                # 消亡效果
                fade_color = hex_to_rgba(body_color, 100)
                draw.ellipse([25, 25, 70, 70], fill=fade_color)
            
            # 装饰边框
            draw.rectangle([2, 2, 93, 93], outline=hex_to_rgb(accent_color), width=3)
            
            save_image(img, os.path.join(out_dir, filename))

def generate_icon_items():
    """生成物品图标"""
    print("\n=== 生成物品图标 ===")
    
    out_dir = 'assets/resources/textures/icons/items'
    
    items = [
        ('item_healthPotion', '回复药水', '#FF4444'),
        ('item_largeHealthPotion', '大药水', '#FF6644'),
        ('item_berserkScroll', '狂暴卷轴', '#AA4444'),
        ('item_ironScroll', '铁壁卷轴', '#888888'),
        ('item_speedScroll', '疾速卷轴', '#44AA44'),
        ('item_cleanseScroll', '净化卷轴', '#44AAAA'),
        ('item_flameBottle', '火焰瓶', '#FF8844'),
        ('item_frostBottle', '冰霜瓶', '#4488FF'),
        ('item_key', '钥匙', '#D4AF37'),
        ('item_advancedKey', '高级钥匙', '#FFDD44'),
        ('item_resetscroll', '洗点券', '#AA88FF'),
        ('item_reviveCoin', '复活币', '#FFAA44'),
        ('item_map', '地图', '#88AA88'),
        ('element_scroll_fire', '火元素卷轴', '#FF4422'),
        ('element_scroll_frost', '冰元素卷轴', '#4488FF'),
        ('element_scroll_lightning', '雷元素卷轴', '#FFDD44'),
        ('element_scroll_poison', '毒元素卷轴', '#44AA44'),
        ('element_scroll_shadow', '暗影卷轴', '#6644AA'),
        ('element_scroll_holy', '神圣卷轴', '#FFFFFF'),
    ]
    
    for item_name, item_cn, color in items:
        filename = f'icon_{item_name}.png'
        img = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        color_rgba = hex_to_rgba(color, 200)
        color_rgb = hex_to_rgb(color)
        
        # 六边形图标背景
        center_x, center_y = 24, 24
        radius = 20
        points = []
        for i in range(6):
            angle = (60 * i - 30) * 3.14159 / 180
            x = center_x + radius * 0.866 * (i % 2 == 0 or i == 0)
            y = center_y + radius * ((i - 2) if i < 3 else (4 - i))
            points.append((int(x), int(y)))
        
        # 简化: 使用圆形代替六边形
        draw.ellipse([4, 4, 43, 43], fill=color_rgba, outline=color_rgb)
        
        # 内部图标
        inner_color = hex_to_rgba('#FFFFFF', 180)
        if 'key' in item_name:
            draw.ellipse([18, 12, 28, 22], fill=inner_color)
            draw.rectangle([23, 22, 25, 35], fill=inner_color)
        elif 'scroll' in item_name:
            draw.rectangle([16, 10, 32, 38], fill=inner_color)
            draw.rectangle([18, 12, 30, 36], fill=color_rgba)
        else:
            # 通用瓶状
            draw.ellipse([18, 14, 30, 24], fill=inner_color)
            draw.rectangle([20, 24, 28, 38], fill=inner_color)
        
        save_image(img, os.path.join(out_dir, filename))

def generate_icon_abilities():
    """生成能力图标 (12 种核心能力)"""
    print("\n=== 生成能力图标 ===")
    
    out_dir = 'assets/resources/textures/icons/abilities'
    
    abilities = [
        ('ability_doubleStrike', '二段斩', '#FF8844'),
        ('ability_phaseWalk', '穿影', '#AA44FF'),
        ('ability_warCry', '怒吼', '#FF4444'),
        ('ability_vampireAura', '吸血光环', '#884444'),
        ('ability_arrowVolley', '弹射箭', '#44AA44'),
        ('ability_shieldBounce', '盾反', '#8888FF'),
        ('ability_bulletTime', '子弹时间', '#4488FF'),
        ('ability_elementResonance', '元素共鸣', '#AA44AA'),
        ('ability_sprint', '疾跑', '#44FF44'),
        ('ability_frostBite', '霜噬', '#44AAAA'),
        ('ability_burning', '浴火', '#FF6644'),
        ('ability_holyShield', '圣盾', '#FFDD44'),
    ]
    
    for ability_name, ability_cn, color in abilities:
        filename = f'icon_{ability_name}.png'
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        color_rgba = hex_to_rgba(color, 200)
        color_rgb = hex_to_rgb(color)
        
        # 六边形盾牌形状
        cx, cy = 32, 32
        r = 28
        
        points = []
        for i in range(6):
            angle = (60 * i - 30) * 3.14159 / 180
            px = cx + r * 0.866 * (1 if i % 2 == 0 else 0.5)
            py = cy + r * 0.5 * (i - 2.5)
            points.append((int(px), int(py)))
        
        draw.polygon(points, fill=color_rgba, outline=color_rgb)
        
        # 中心图标
        center_color = hex_to_rgba('#FFFFFF', 180)
        if 'sword' in ability_name.lower() or 'strike' in ability_name.lower():
            draw.line([(24, 24), (40, 40)], fill=center_color, width=3)
            draw.line([(40, 24), (24, 40)], fill=center_color, width=3)
        elif 'shield' in ability_name.lower():
            draw.ellipse([24, 20, 40, 44], fill=center_color)
        else:
            # 通用星号
            for i in range(4):
                angle = i * 90 * 3.14159 / 180
                x1 = 32 + 8 * 0.7 * (1 if i % 2 == 0 else 0.5)
                y1 = 32 + 8 * 0.5
                x2 = 32 - 8 * 0.7 * (1 if i % 2 == 0 else 0.5)
                y2 = 32 - 8 * 0.5
                draw.line([(x1, y1), (x2, y2)], fill=center_color, width=2)
        
        save_image(img, os.path.join(out_dir, filename))

def generate_icon_relics():
    """生成遗物图标 (16 种: 8 主动 + 8 被动)"""
    print("\n=== 生成遗物图标 ===")
    
    out_dir = 'assets/resources/textures/icons/relics'
    
    relics = [
        ('relic_thornArmor', '荆棘甲', '#44AA44', False),
        ('relic_luckyCoin', '幸运币', '#FFDD44', False),
        ('relic_berserkerAxe', '狂战斧', '#FF4444', False),
        ('relic_immortalStone', '不朽石', '#888888', False),
        ('relic_echoPearl', '回响之珠', '#AA44AA', False),
        ('relic_rapidGlove', '急速手套', '#44AAFF', False),
        ('relic_ironArmor', '铁甲', '#666666', False),
        ('relic_shadowCloak', '暗影斗篷', '#6644AA', False),
        ('relic_shadowDagger', '暗影匕首', '#442266', True),
        ('relic_frostAmulet', '寒冰护符', '#4488FF', True),
        ('relic_flameRing', '烈焰之环', '#FF8844', True),
        ('relic_flashStone', '闪烁石', '#FFDD44', True),
        ('relic_gravityStone', '引力石', '#8844AA', True),
        ('relic_lifeLink', '生命链接', '#44AA44', True),
        ('relic_cloneTalisman', '分身符', '#AA88FF', True),
        ('relic_hourglass', '时间沙漏', '#FFAA44', True),
    ]
    
    for relic_name, relic_cn, color, is_active in relics:
        filename = f'icon_{relic_name}.png'
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        color_rgba = hex_to_rgba(color, 200)
        color_rgb = hex_to_rgb(color)
        
        # 被动遗物: 六边形; 主动遗物: 方形圆角
        if not is_active:
            # 六边形
            cx, cy = 32, 32
            r = 28
            points = []
            for i in range(6):
                angle = (60 * i - 30) * 3.14159 / 180
                px = cx + r * (0.866 if i % 2 == 0 else 0.5)
                py = cy + r * 0.5 * (i - 2.5)
                points.append((int(px), int(py)))
            draw.polygon(points, fill=color_rgba, outline=color_rgb)
        else:
            # 圆角矩形
            draw.rectangle([4, 4, 60, 60], fill=color_rgba, outline=color_rgb, width=2)
        
        # 中心图标
        center_color = hex_to_rgba('#FFFFFF', 180)
        draw.ellipse([26, 26, 38, 38], fill=center_color)
        
        save_image(img, os.path.join(out_dir, filename))

def generate_icon_sets():
    """生成套装图标 (6 种套装)"""
    print("\n=== 生成套装图标 ===")
    
    out_dir = 'assets/resources/textures/icons/sets'
    
    sets = [
        ('set_tempest', '狂风', '#4488FF'),
        ('set_ironwall', '铁壁', '#888888'),
        ('set_shadow', '暗影', '#6644AA'),
        ('set_berserker', '狂怒', '#FF4444'),
        ('set_frost', '霜噬', '#44AAAA'),
        ('set_holy', '圣光', '#FFDD44'),
    ]
    
    for set_name, set_cn, color in sets:
        filename = f'icon_{set_name}.png'
        img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        color_rgba = hex_to_rgba(color, 200)
        color_rgb = hex_to_rgb(color)
        
        # 盾牌形状
        draw.polygon([
            (16, 2), (28, 6), (28, 18), (16, 30), (4, 18), (4, 6)
        ], fill=color_rgba, outline=color_rgb)
        
        save_image(img, os.path.join(out_dir, filename))

def generate_buff_icons():
    """生成 Buff/Debuff 图标 (10 种)"""
    print("\n=== 生成 Buff 图标 ===")
    
    out_dir = 'assets/resources/textures/icons/buffs'
    
    buffs = [
        ('buff_attackUp', '攻击提升', '#FF8844'),
        ('buff_defenseUp', '防御提升', '#4488FF'),
        ('buff_speedUp', '速度提升', '#44FF44'),
        ('buff_criticalUp', '暴击提升', '#FF4444'),
        ('buff_lifesteal', '吸血', '#AA4444'),
        ('buff_shield', '护盾', '#44AAFF'),
        ('buff_debuff_attackDown', '攻击下降', '#884444'),
        ('buff_debuff_defenseDown', '防御下降', '#444488'),
        ('buff_debuff_slow', '减速', '#4488AA'),
        ('buff_debuff_poison', '中毒', '#44AA44'),
    ]
    
    for buff_name, buff_cn, color in buffs:
        filename = f'icon_{buff_name}.png'
        img = Image.new('RGBA', (20, 20), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        color_rgba = hex_to_rgba(color, 200)
        is_debuff = 'debuff' in buff_name
        
        # 圆形 Buff 图标
        if not is_debuff:
            draw.ellipse([2, 2, 17, 17], fill=color_rgba, outline=hex_to_rgb(color))
        else:
            # Debuff 带 X 标记
            draw.ellipse([2, 2, 17, 17], fill=hex_to_rgba(color, 120), outline=hex_to_rgb(color))
            draw.line([(5, 5), (15, 15)], fill=(255, 0, 0, 200), width=2)
            draw.line([(15, 5), (5, 15)], fill=(255, 0, 0, 200), width=2)
        
        save_image(img, os.path.join(out_dir, filename))

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
    
    print("回到地面 - Boss/图标资源生成器")
    print("=" * 50)
    
    generate_minibosses()
    generate_finalbosses()
    generate_icon_items()
    generate_icon_abilities()
    generate_icon_relics()
    generate_icon_sets()
    generate_buff_icons()
    
    print("\n" + "=" * 50)
    print("[OK] Boss/图标资源生成完成")
