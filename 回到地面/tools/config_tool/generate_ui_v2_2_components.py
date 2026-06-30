#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美术资源 v2.2 优化 - 第2批: 通用组件 + 地图 + 装备背包UI (26个)
卡通像素风 - 明亮可爱冒险
"""
import subprocess, json, os, time

API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
BASE = "E:/game/回到地面/assets/resources/textures/ui"

TASKS = [
    # 1.4 通用组件 (5)
    ("common/btn_default.png", "200x60", """Pixel art game button, 200x60 pixels. Cartoon adventure style. Dark dungeon panel #2A2A3E with 2px gold border #5A5A7E. Rounded corners 8px. Subtle gradient with lighter top edge and darker bottom for depth. Clean minimal, no text. Transparent background."""),
    ("common/btn_hover.png", "200x60", """Pixel art hovered game button, 200x60 pixels. Same shape as default but border brighter #8A8AAE with subtle outer glow. Inner fill slightly lighter. Cartoon pixel art style, adventurous warm feel, no text."""),
    ("common/btn_active.png", "200x60", """Pixel art pressed game button, 200x60 pixels. Same shape but visually pushed down - inner fill darker #1A1A2E, border compressed. Simulates physical button press. Cartoon pixel art style, game UI element."""),
    ("common/btn_close.png", "32x32", """Pixel art close/X button icon, 32x32 pixels. Dark circular button #2A2A3E with bright red X mark #FF4444 centered. Cartoon style, friendly rounded X not sharp. Simple and clean."""),
    ("common/panel_bg.png", "32x32", """9-slice panel background for cartoon game UI. 32x32 pixels PNG RGBA. Dungeon semi-transparent panel #1A1A2E at 85% opacity. 2px gold border #D4AF37 with 8px rounded corners. Center area transparent. Cartoon pixel art, dark fantasy but friendly."""),
    
    # 1.3 地图节点+线+房间图标 (11)
    ("map/map_node_unknown.png", "32x32", """Pixel art unexplored dungeon map node, 32x32px. Cartoon adventure game style. Gray #3A3A3A diamond shape with subtle border, unlit feeling, no glow, mysterious but cute. Transparent background."""),
    ("map/map_node_visited.png", "32x32", """Pixel art explored dungeon map node, 32x32px. Lighter gray #7A7A7A diamond with subtle blue border #4488CC, slightly glowing to indicate completed exploration. Cartoon pixel style, friendly."""),
    ("map/map_node_current.png", "32x32", """Pixel art current position map node, 32x32px. Bright gold #D4AF37 diamond with pulsing white glow #FFFFFF at center, clearly active and highlighted. Cartoon adventure game style, vibrant."""),
    ("map/map_line.png", "80x4", """Pixel art map connection line, 80x4 pixels. Thin horizontal line, dark gray #3A3A4A with subtle gold dots at each end #D4AF37. Cartoon pixel art dungeon map connector."""),
    ("map/icon_room_combat.png", "20x20", """Pixel art crossed swords icon for dungeon map, 20x20px. Cartoon adventure style. Steel-gray swords #AAAAAA with brown handles #6A4A2A, crossed diagonally. Simple readable symbol, transparent background."""),
    ("map/icon_room_treasure.png", "20x20", """Pixel art treasure chest icon, 20x20px. Open wooden chest #8A6A3A showing gold glow inside. Gold trim #D4AF37. Cartoon friendly style, recognizable at small scale."""),
    ("map/icon_room_healing.png", "20x20", """Pixel art glowing green heart icon for healing room, 20x20px. Bright green #44FF88 with lighter highlight. Cartoon adventure style, cute and friendly, transparent background."""),
    ("map/icon_room_shop.png", "20x20", """Pixel art gold coin icon, 20x20px. Round golden coin #D4AF37 with small star embossed in center. Shiny appearance with lighter top half. Cartoon pixel art style."""),
    ("map/icon_room_upgrade.png", "20x20", """Pixel art blue arrow-up icon for upgrade room, 20x20px. Pointing upward blue #44AAFF arrow with subtle sparkle. Cartoon adventure style, progressive and positive feel."""),
    ("map/icon_room_event.png", "20x20", """Pixel art purple scroll icon for special event, 20x20px. Rolled parchment with purple ribbon #8844FF. Cartoon adventure style, mysterious but friendly. Transparent background."""),
    ("map/icon_room_boss.png", "20x20", """Pixel art crown icon for boss room, 20x20px. Golden crown #D4AF37 with red jewel top #FF4444. Friendly cartoon boss indicator - not scary, just challenging and exciting."""),
]

def gen_dl(fn, size, prompt):
    print(f"\n[{fn}]")
    cmd = ["curl", "-s", "-X", "POST", "https://apihub.agnes-ai.com/v1/images/generations",
           "-H", "Content-Type: application/json",
           f"-H", f"Authorization: Bearer {API_KEY}",
           "-d", json.dumps({"model": "agnes-image-2.1-flash", "prompt": prompt, "n": 1, "size": size})]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        url = json.loads(r.stdout)['data'][0]['url']
        fp = os.path.join(BASE, fn)
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        for _ in range(3):
            subprocess.run(["curl", "-L", "-o", fp, url], capture_output=True, timeout=120)
            if os.path.exists(fp) and os.path.getsize(fp) > 0:
                print(f"  [OK] ({os.path.getsize(fp):,}B)")
                return True
        print("  [FAIL]"); return False
    except Exception as e:
        print(f"  [FAIL] {e}"); return False

def main():
    print("="*50)
    print("v2.2 美术优化 - 第2批: 通用组件+地图+装备 (26个)")
    print("="*50)
    s = f = 0
    for fn, sz, pr in TASKS:
        if gen_dl(fn, sz, pr): s += 1
        else: f += 1
        time.sleep(0.3)
    print(f"\n结果: {s} 成功, {f} 失败")

if __name__ == "__main__":
    main()
