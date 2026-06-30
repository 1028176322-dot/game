#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美术资源 v2.2 优化 - 第3批: HUD + 商店 + 结算 + 强化房(卡牌/能力)
卡通像素风 - 明亮可爱冒险
"""
import subprocess, json, os, time

API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
BASE = "E:/game/回到地面/assets/resources/textures/ui"

TASKS = [
    # 1.5 HUD (8)
    ("hud/hud_hpbar_bg.png", "200x20", """Pixel art rectangular HP bar background, 200x20px. Cartoon game style. Rounded rectangle dungeon gray #2A2A3E with soft edges. Simple and clean. Transparent background."""),
    ("hud/hud_hpbar_fill.png", "200x20", """Pixel art health bar fill, 200x20px. Red gradient from bright #FF4444 left to darker #CC2222 right. Cartoon style, rounded corners. Slight highlight on top edge. For HP bar fill animation."""),
    ("hud/hud_hpbar_frame.png", "200x20", """Pixel art decorative gold frame for health bar, 200x20px. Ornate gold border #D4AF37 with tiny decorative corner gems. Cartoon adventure game style, fits around HP bar."""),
    ("hud/hud_skillslot.png", "60x60", """Pixel art skill slot panel, 60x60px. 9-slice cartoon dungeon panel #2A2A3E with gold border #5A5A7E, rounded 8px corners. Clean empty space for skill icons."""),
    ("hud/hud_cdmask.png", "60x60", """Pixel art cooldown circular mask, 60x60px. Semi-transparent black circle #000000 at 60% opacity. Clean radial gradient from opaque to transparent. For rotating cooldown overlay."""),
    ("hud/joystick_base.png", "120x120", """Pixel art virtual joystick base, 120x120px. Semi-transparent white circle #FFFFFF at 15% opacity. Outer ring in gold #D4AF37, 2px wide. Clean touch input pad aesthetic, cartoon game style."""),
    ("hud/joystick_dot.png", "40x40", """Pixel art joystick control dot, 40x40px. Solid gold circle #D4AF37 with subtle inner highlight. Small directional arrow indicators around edge. Mobile game virtual joystick center."""),
    ("hud/hud_rollbtn.png", "48x48", """Pixel art circular roll/dodge button, 48x48px. Dark circular button #2A2A3E with curved gold ring #D4AF37 around edge. Simple rolling arrow icon in center. Cartoon adventure style."""),
    
    # 1.8 商店 (3)
    ("shop/shop_bg.png", "750x1334", """Vertical cartoon pixel-art shop background, 750x1334px portrait. Warm merchant tent interior, wooden shelves on walls, colorful banners overhead. Amber candlelight #FFAA44. Earth-tone wood #8A6A3A with gold accents. Center area clean for product display. Fun and inviting shop atmosphere, cartoon adventure style."""),
    ("shop/shop_slot.png", "160x180", """Pixel art merchant item display slot, 160x180px. Ornate wooden frame #6A4A2A with gold trim #D4AF37. Dark interior #1A1A2E. Small decorative corner scrolls. Cartoon fantasy shop aesthetic."""),
    ("shop/icon_coin.png", "24x24", """Pixel art gold coin icon, 24x24px. Round golden coin #FFCC44 with raised star emblem in center. Metallic shine with lighter top half and darker bottom. Cartoon style, clean small icon."""),
    
    # 1.9 结算 (7)
    ("death/death_bg.png", "750x1334", """Cartoon pixel-art game over background, 750x1334px portrait. Soft dramatic but not scary: cracked ground with warm fading embers #FFAA44 floating upward, purple twilight sky, faint star particles. Somber but hopeful atmosphere. Clean center area for stats display. Cartoon adventure style, not dark/horror."""),
    ("death/icon_soulstone.png", "32x32", """Pixel art soulstone gem icon, 32x32px. Teardrop-shaped blue-purple crystal #6644AA with inner glow and faceted reflections. Small white sparkle highlight. Cute game currency icon, cartoon style."""),
    ("death/result_panel.png", "500x400", """Pixel art settlement/results panel background, 500x400px. Dark dungeon frame #1A1A2E with warm gold border #D4AF37. Cute corner decorations with small vines. Flat center area for stats display. Cartoon adventure game UI."""),
    ("death/btn_revive_default.png", "200x60", """Pixel art revive button default, 200x60px. Rounded rectangle button. Warm green-gold theme #88AA55 with gold border #D4AF37. Subtle glow suggesting hope and second chance. Cartoon adventure style, friendly."""),
    ("death/btn_revive_active.png", "200x60", """Pixel art revive button pressed, 200x60px. Same shape as default but visually pressed down with brighter inner glow. Green intensifies #AAFF88. Mobile game UI pressed state."""),
    ("death/btn_settle_default.png", "200x60", """Pixel art settle button default, 200x60px. Dark rectangular button #3A3A4E with orange-gold border #AA6633. Somber but cartoon friendly. Button for confirming death/stats."""),
    ("death/btn_settle_active.png", "200x60", """Pixel art settle button pressed, 200x60px. Darker fill #2A2A3E, border compressed, visual press feedback. Cartoon style consistent with default."""),
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
    print("v2.2 美术优化 - 第3批: HUD+商店+结算 (18个)")
    print("="*50)
    s = f = 0
    for fn, sz, pr in TASKS:
        if gen_dl(fn, sz, pr): s += 1
        else: f += 1
        time.sleep(0.3)
    print(f"\n结果: {s} 成功, {f} 失败")

if __name__ == "__main__":
    main()
