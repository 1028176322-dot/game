#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI模块优化 - 第二批次: HUD + 商店 + 结算 UI
共 18 个文件
"""
import subprocess, json, os, time

API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
BASE_DIR = "E:/game/回到地面/assets/resources/textures/ui"

TASKS = [
    # HUD (8)
    ("hud/hud_hpbar_bg.png", "200x20", """Pixel art rectangular HP bar background for mobile game UI. Dark blue-gray #1A1A2E with subtle texture, beveled edges with lighter top #2A2A3E and darker bottom #0A0A1E, thin gold outline #D4AF37, 200x20 pixels, clean minimal HUD element"""),
    ("hud/hud_hpbar_fill.png", "200x20", """Pixel art health bar fill for mobile game. Gradient from bright red #CC2222 at left to darker red #881111 at right, pixel art style, subtle highlight stripe near top, 200x20 pixels, game HUD element with transparent background"""),
    ("hud/hud_hpbar_frame.png", "200x20", """Pixel art HP bar decorative frame/border. Ornate gothic-style border, gold #D4AF37 metal with subtle engravings, dark blue-gray corners #1A1A2E, 200x20 pixels, wraps around health bar fill"""),
    ("hud/hud_skillslot.png", "60x60", """Pixel art skill slot background for MOBA-style game HUD. Octagonal dark blue-gray #1A1A2E panel with gold border #D4AF37, subtle inner glow, grid-like texture, 60x60 pixels, clean and minimal for icon placement"""),
    ("hud/hud_cdmask.png", "60x60", """Pixel art cooldown overlay mask for skill slot. Semi-transparent dark overlay covering 3/4 of circle, gradient fade from dark #0A0A1E to transparent, clean cut-off line, 60x60 pixels, rounds out skill slot"""),
    ("hud/joystick_base.png", "120x120", """Pixel art virtual joystick base for mobile game. Circular dark panel #1A1A2E with subtle grid pattern, metallic gold rim #D4AF37, slight 3D depth effect with top highlight and bottom shadow, 120x120 pixels, transparent outside circle"""),
    ("hud/joystick_dot.png", "40x40", """Pixel art joystick control knob/thumb. Round gray button #6A6A7A with gold rim #D4AF37, subtle top highlight #8A8A9A, pressed appearance with inner shadow, 40x40 pixels, transparent background"""),
    ("hud/hud_rollbtn.png", "48x48", """Pixel art dodge/roll action button. Circular dark button #2A2A3E with orange-red glow #CC4422, stylized wind/whoosh symbol in center, 48x48 pixels, mobile game bottom-right corner button"""),
    
    # 商店 (3)
    ("shop/shop_bg.png", "750x1334", """Pixel art shop interior background for mobile game merchant screen. 750x1334 portrait orientation, warm candlelit tavern-style interior, wooden shelves on walls displaying goods, stone floor, warm amber lighting #D4AF37 with purple shadows #2A1A3A, clean center area for product slots"""),
    ("shop/shop_slot.png", "160x180", """Pixel art merchant shop item slot/frame. Ornate wooden display frame #6A4A2A with gold trim #D4AF37, dark interior #1A1A2E background with subtle fabric texture, gothic corner decorations, 160x180 pixels, clean center for item display"""),
    ("shop/icon_coin.png", "24x24", """Pixel art gold coin icon. Round golden coin #D4AF37 with raised star symbol, metallic shine with lighter top half, dark shadow bottom, 24x24 pixels, clean and recognizable, 2D sprite style"""),
    
    # 结算 (7)
    ("death/death_bg.png", "750x1334", """Pixel art dark dramatic background for game over screen. 750x1334 portrait, cracked dark ground with purple energy #2A1A3A rising from below, faint skull imagery in clouds, somber atmosphere with dying embers #AA3A2A floating upward, dramatic red-purple lighting, center clean for stats display"""),
    ("death/icon_soulstone.png", "32x32", """Pixel art soulstone gem icon. Teardrop-shaped purple crystal #8A4ACA with inner glow and facet reflections, small white sparkle highlight, gemstone style with dark purple aura, 32x32 pixels, game currency/resource icon"""),
    ("death/result_panel.png", "500x400", """Pixel art settlement/results panel background. Dark gothic frame #1A1A2E with thick gold border #D4AF37, ornate corner flourishes, subtle stone texture center, 500x400 pixels, clean flat interior for displaying death stats"""),
    ("death/btn_revive_default.png", "200x60", """Pixel art revive/resurrection button default state. Rectangular button with green-gold theme, subtle leaf/cross motif hint, dark border #D4AF37 with green tint #3A5A2A, 200x60 pixels, hopeful warm glow suggesting second chance"""),
    ("death/btn_revive_active.png", "200x60", """Pixel art revive button pressed/active state. Brighter green glow, inner light intensified, gold border shining #FFE4A0, simulating push-down visual feedback, 200x60 pixels"""),
    ("death/btn_settle_default.png", "200x60", """Pixel art settle/confirm button default state. Darker somber red-brown theme matching death screen, subtle bone-white text area, 200x60 pixels, clean rectangular button for game over screen"""),
    ("death/btn_settle_active.png", "200x60", """Pixel art settle button pressed state. Darker compression, slightly muted tones indicating active/pressed, 200x60 pixels, same design as default but visually compressed downward"""),
]

def generate_and_download(filename, size, prompt):
    print(f"\n[{filename}]")
    cmd = [
        "curl", "-s", "-X", "POST",
        "https://apihub.agnes-ai.com/v1/images/generations",
        "-H", "Content-Type: application/json",
        f"-H", f"Authorization: Bearer {API_KEY}",
        "-d", json.dumps({"model": "agnes-image-2.1-flash", "prompt": prompt, "n": 1, "size": size})
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        data = json.loads(result.stdout)
        url = data['data'][0]['url']
        filepath = os.path.join(BASE_DIR, filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        for _ in range(3):
            res = subprocess.run(["curl", "-L", "-o", filepath, url], capture_output=True, timeout=120)
            if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                print(f"  [OK] ({os.path.getsize(filepath):,}B)")
                return True
        print("  [FAIL] Download failed")
        return False
    except Exception as e:
        print(f"  [FAIL] {e}")
        return False

def main():
    print("=" * 50)
    print("UI模块优化 - 第二批次: 18个文件")
    print("=" * 50)
    success = failed = 0
    for fn, sz, pr in TASKS:
        if generate_and_download(fn, sz, pr):
            success += 1
        else:
            failed += 1
        time.sleep(0.3)
    print(f"\n结果: {success} 成功, {failed} 失败, 共 {len(TASKS)} 个")

if __name__ == "__main__":
    main()
