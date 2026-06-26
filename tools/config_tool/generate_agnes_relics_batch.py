#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量生成遗物图标 (Agnes AI)
共 16 个文件, 64x64px
"""
import subprocess
import json
import os
import time

API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
OUTPUT_DIR = "assets/resources/textures/icons/relics"

RELIC_ICONS = [
    ('icon_relic_thornarmor', 'Pixel art game icon 64x64, armor plate covered in sharp thorns, dark green-brown metal with green thorns, dark background'),
    ('icon_relic_luckycoin', 'Pixel art game icon 64x64, two overlapping golden coins with lucky symbol, bright gold shine, dark background'),
    ('icon_relic_frenzyaxe', 'Pixel art game icon 64x64, blood-stained battle axe, red blood drips, dark iron metallic, menacing dark background'),
    ('icon_relic_immortalstone', 'Pixel art game icon 64x64, glowing green gemstone with infinity symbol etched, emerald green magical glow, dark background'),
    ('icon_relic_echoorb', 'Pixel art game icon 64x64, purple crystal orb with echoing ripple waves, mystical purple-purple, dark background'),
    ('icon_relic_shadowcloak', 'Pixel art game icon 64x64, flowing semi-transparent black cloak or cape, dark purple shadow aura, mysterious dark background'),
    ('icon_relic_speedgauntlet', 'Pixel art game icon 64x64, gauntlet glove with lightning bolt patterns crackling, electric blue-yellow, dark background'),
    ('icon_relic_ironarmor', 'Pixel art game icon 64x64, heavy iron armor plate segment, thick steel-gray metal with rivets, battle scratches, dark background'),
    ('icon_relic_shadowdagger', 'Pixel art game icon 64x64, throwing dagger mid-flight with dark shadow trail, obsidian-black blade, purple shadow, dark background'),
    ('icon_relic_frostamulet', 'Pixel art game icon 64x64, icicle-shaped pendant amulet with snowflake carving, ice-blue magical glow, frost crystals, dark background'),
    ('icon_relic_flamering', 'Pixel art game icon 64x64, enchanted ring engulfed in animated flame, molten gold band with fire effect, dark background'),
    ('icon_relic_blinkstone', 'Pixel art game icon 64x64, glowing translucent blue teleportation stone crystal, sparkles and starbursts, magical blue, dark background'),
    ('icon_relic_gravitystone', 'Pixel art game icon 64x64, deep purple gravity orb pulling in particles toward center, swirling dark matter effect, dark background'),
    ('icon_relic_lifelink', 'Pixel art game icon 64x64, chain link connecting two red hearts, blood-red glow, dark fantasy style, dark background'),
    ('icon_relic_decoyscroll', 'Pixel art game icon 64x64, ancient parchment scroll unfurled with ghostly humanoid phantom rising from it, sepia tones, mystical glow'),
    ('icon_relic_timehourglass', 'Pixel art game icon 64x64, ornate hourglass with sand flowing downward, golden antique frame, magical glowing sand, dark background'),
]

def generate_image(prompt):
    """调用 Agnes API 生成图片"""
    cmd = [
        "curl", "-s", "-X", "POST", API_URL,
        "-H", "Content-Type: application/json",
        f"-H", f"Authorization: Bearer {API_KEY}",
        "-d", json.dumps({
            "model": "agnes-image-2.1-flash",
            "prompt": prompt,
            "n": 1,
            "size": "64x64"
        })
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    data = json.loads(result.stdout)
    return data['data'][0]['url']

def download_image(url, filepath):
    """下载图片"""
    cmd = ["curl", "-s", "-o", filepath, url]
    subprocess.run(cmd, capture_output=True)
    size = os.path.getsize(filepath)
    return size

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    total = 0
    failed = 0
    
    for filename, prompt in RELIC_ICONS:
        filepath = os.path.join(OUTPUT_DIR, f"{filename}.png")
        print(f"[{filename}]")
        
        try:
            # Step 1: Generate
            url = generate_image(prompt)
            # Step 2: Download
            size = download_image(url, filepath)
            print(f"  [OK] ({size:,}B)")
            total += 1
        except Exception as e:
            print(f"  [FAIL] {e}")
            failed += 1
        
        # 短暂延迟避免API限流
        time.sleep(0.5)
    
    print(f"\n总计: {total} 成功, {failed} 失败")

if __name__ == "__main__":
    main()
