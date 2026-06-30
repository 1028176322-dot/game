#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美术资源 v2.2 优化 - 第1批: 启动屏 + 主界面 (4个)
卡通像素风 (Cartoon Pixel Art) - 明亮、可爱、冒险
"""
import subprocess, json, os, time

API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
BASE = "E:/game/回到地面/assets/resources/textures/ui"

TASKS = [
    # 1.1 启动屏
    ("splash/splash_bg.png", "1280x720", """Generate a cartoon pixel-art landscape for a mobile game splash screen. 1280x720 pixels, bright and inviting. Cheerful stone ruins at center with a friendly dungeon entrance glowing with warm magical blue light. Warm twilight sky with twinkling stars in shades #4466AA and #6688CC. Gentle ground-level mist. Warm gold glow #FFCC44 from dungeon entrance. No text, no scary elements, bright cartoon pixel art style with rounded shapes, clean lines, adventurous atmosphere, welcoming and fun. Dithering allowed."""),
    ("splash/splash_logo.png", "400x120", """Generate a cartoon pixel-art Chinese title logo reading 回到地面 for a mobile game. 400x120 pixels, PNG with transparency. Bold playful pixel characters in warm gold #FFCC44 with friendly orange #FF8844 outline. White highlight for readability. Small cute pixelated star decorations and torch icons flanking the text. Adventure themed, cheerful tone, rounded pixel art style, transparent background."""),
    
    # 1.2 主界面
    ("main/main_bg.png", "750x1334", """Generate a vertical cartoon pixel-art background for game main menu. 750x1334 pixels portrait. Cheerful warm dungeon entrance: stone archway decorated with friendly orange torches, staircase going down with warm golden light from below, bright sconces casting amber glow #FFAA44. Friendly sky visible through upper arch #6688CC. Warm stone #A08860 walls. Golden sparkles floating in air. No text, no UI elements, just inviting cartoon pixel art atmosphere. Bright and welcoming."""),
    ("main/main_titledeco.png", "600x200", """Generate a decorative banner behind game title text. 600x200 pixels PNG with transparency. Ornate cartoon adventure stone arch border with small pixel vines on edges. Gold trim #D4AF37 on dark stone #2A2A3E background. Subtle warm glow in center. Pixel art, decorative only, no text. Cartoon style, cute and whimsical."""),
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
    print("v2.2 美术优化 - 第1批: 启动屏+主界面 (4个)")
    print("风格: 卡通像素风 - 明亮可爱冒险")
    print("="*50)
    s = f = 0
    for fn, sz, pr in TASKS:
        if gen_dl(fn, sz, pr): s += 1
        else: f += 1
        time.sleep(0.5)
    print(f"\n结果: {s} 成功, {f} 失败")

if __name__ == "__main__":
    main()
