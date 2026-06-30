#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI模块优化 - 第一批次: 启动屏 + 主界面 + 通用组件 + 地图节点
共 20 个文件, 通过 Agnes AI 文生图生成
"""
import subprocess
import json
import os
import time

API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
BASE_DIR = "E:/game/回到地面/assets/resources/textures/ui"

TASKS = [
    # 启动屏 (2)
    ("splash/splash_bg.png", "1280x720", """Pixel art dark fantasy landscape for mobile game splash screen. Dark stone ruins at center with dungeon entrance glowing with blue light. Deep blue #1A1A2E and dark purple #2A1A3A palette. Warm gold glow #D4AF37 from dungeon entrance. Dark purple night sky with subtle stars. Mist at ground level. Mysterious atmospheric pixel art, sharp edges, no text, no characters, dithering technique"""),
    ("splash/splash_logo.png", "400x120", """Pixel art Chinese characters '回到地面' as game logo. Bold pixel font, gold color #D4AF37 with subtle dark red #8A2A2A outline for contrast. White text with gold glow for readability. Transparent background. 400x120 pixels, mobile game UI style"""),
    
    # 主界面 (2)
    ("main/main_bg.png", "750x1334", """Pixel art fantasy background for mobile game main menu screen. 750x1334 portrait orientation. Dark dungeon interior with arched stone walls. Subtle ambient lighting from torches on walls. Atmospheric perspective with depth. Purple-blue color palette #2A1A3A with gold accents #D4AF37. Clean center area for UI overlays"""),
    ("main/main_titledeco.png", "256x64", """Pixel art decorative banner for game title screen. Gothic fantasy ornament with golden accents and dark purple background. Symmetrical design with curved flourishes. 256x64 pixels, transparent background"""),
    
    # 通用按钮/面板 (5)
    ("common/btn_default.png", "160x48", """Pixel art rectangular button for mobile game UI. Dark blue-gray #1A1A2E background with gold border #D4AF37. Subtle bevel effect with lighter top edge #3A3A5E and darker bottom edge #0A0A1E. Clean minimal design for game buttons, 160x48 pixels, RGBA with transparency"""),
    ("common/btn_hover.png", "160x48", """Pixel art hovered game button, same shape as default but brighter. Gold border #D4AF37 with brighter highlights #FFE4A0. Inner panel illuminated with subtle warm yellow glow. 160x48 pixels, mobile game UI style"""),
    ("common/btn_active.png", "160x48", """Pixel art pressed/active game button. Darker compression effect, gold border slightly dimmed #C49A2A. Inner panel shifted downward to simulate press. 160x48 pixels, realistic button press state"""),
    ("common/btn_close.png", "48x48", """Pixel art square close button with X symbol. Dark gray #2A2A3E background, red X mark #CC3333 with subtle glow. 48x48 pixels, clean geometric design for UI panels"""),
    ("common/panel_bg.png", "500x400", """Pixel art semi-transparent panel background for game UI modals. Dark blue-black #1A1A2E with subtle noise texture. Gold trim border #D4AF37 at corners. Corner decorations with gothic flourishes. Center relatively flat for text overlay, 500x400 pixels"""),
    
    # 地图节点/线路 (11)
    ("map/map_node_unknown.png", "32x32", """Pixel art round map node for dungeon map UI. Dark gray #2A2A2A circle with subtle border, question mark symbol, locked room indicator, 32x32 pixels, game minimap style"""),
    ("map/map_node_visited.png", "32x32", """Pixel art visited room node on dungeon map. Faded green #3A5A3A circle with dark border, slightly desaturated to indicate cleared room, 32x32 pixels"""),
    ("map/map_node_current.png", "32x32", """Pixel art current position indicator on dungeon map. Bright gold #D4AF37 pulsing circle with white glow effect, player marker, 32x32 pixels, prominent and visible"""),
    ("map/map_line.png", "80x8", """Pixel art connecting line for dungeon map. Short horizontal line, dark gray #3A3A4A with subtle gold border pixels at ends, 80x8 pixels"""),
    ("map/icon_room_combat.png", "24x24", """Pixel art sword icon for combat room on map. Crude pixelated sword in diagonal position, steel-gray #8A8A9A with wooden brown handle #6A4A2A, 24x24 pixels, game map marker"""),
    ("map/icon_room_treasure.png", "24x24", """Pixel art treasure chest icon for map. Closed wooden chest #8A6A3A with gold trim #D4AF37, slightly open showing yellow glow inside, 24x24 pixels, dungeon map room marker"""),
    ("map/icon_room_healing.png", "24x24", """Pixel art cross/heart icon for healing room on map. Glowing green #55CC55 cross or red #CC4444 heart symbol, 24x24 pixels, clean and readable at small size"""),
    ("map/icon_room_shop.png", "24x24", """Pixel art coin icon for shop on map. Golden coin #D4AF37 with star or crown symbol in center, 24x24 pixels, shiny metallic appearance"""),
    ("map/icon_room_upgrade.png", "24x24", """Pixel art upgrade/star icon for enhancement room on map. Glowing blue #4488FF star or upward arrow, 24x24 pixels, mystical enhancement indicator"""),
    ("map/icon_room_event.png", "24x24", """Pixel art mystery/event icon on map. Orange-yellow #FFAA33 glowing diamond or exclamation mark, 24x24 pixels, special event marker"""),
    ("map/icon_room_boss.png", "24x24", """Pixel art skull icon for boss room on map. White-cracked skull #CCCCBB with dark hollow eyes, ominous red glow in eye sockets, 24x24 pixels, danger boss marker"""),
]

def generate_and_download(filename, size, prompt):
    """生成图片并下载"""
    print(f"\n[{filename}]")
    
    # Step 1: Generate via Agnes API
    cmd_gen = [
        "curl", "-s", "-X", "POST",
        "https://apihub.agnes-ai.com/v1/images/generations",
        "-H", "Content-Type: application/json",
        f"-H", f"Authorization: Bearer {API_KEY}",
        "-d", json.dumps({
            "model": "agnes-image-2.1-flash",
            "prompt": prompt,
            "n": 1,
            "size": size
        })
    ]
    
    try:
        result = subprocess.run(cmd_gen, capture_output=True, text=True, timeout=60)
        data = json.loads(result.stdout)
        url = data['data'][0]['url']
        
        # Step 2: Download with retries
        filepath = os.path.join(BASE_DIR, filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        for attempt in range(3):
            cmd_dl = ["curl", "-L", "-o", filepath, url]
            res = subprocess.run(cmd_dl, capture_output=True, timeout=120)
            if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                size_bytes = os.path.getsize(filepath)
                print(f"  [OK] ({size_bytes:,}B)")
                return True
        
        print(f"  [FAIL] Download failed after 3 attempts")
        return False
        
    except Exception as e:
        print(f"  [FAIL] {e}")
        return False

def main():
    print(f"={50}")
    print(f"UI模块优化 - 第一批次: 20个文件")
    print(f"={50}")
    
    success = 0
    failed = 0
    
    for filename, size, prompt in TASKS:
        if generate_and_download(filename, size, prompt):
            success += 1
        else:
            failed += 1
        
        time.sleep(0.3)  # 避免API限流
    
    print(f"\n{'='*50}")
    print(f"结果: {success} 成功, {failed} 失败, 共 {len(TASKS)} 个")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
