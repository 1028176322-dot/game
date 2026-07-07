#!/usr/bin/env python3
"""
P1 批次：MainHub + Login 一体化界面资源生成脚本（flush 版本）
流程：调用 Agnes API → 下载母版 → 缩放 → 保存 PNG RGBA → 检测体积 → 超限则转 JPG → 复制到 assets
"""
import os, sys, json, time, requests
from PIL import Image
from io import BytesIO

flush = lambda: sys.stdout.flush()

# === 配置 ===
BASE_DIR = "E:/game/回到地面"
API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
MODEL = "agnes-image-2.1-flash"
MAX_RETRIES = 3
RETRY_DELAY = 15

MASTER_DIR = os.path.join(BASE_DIR, "art_source/textures_review/master/ui")
CANDIDATE_DIR = os.path.join(BASE_DIR, "runtime_candidates")
ASSETS_DIR = os.path.join(BASE_DIR, "assets/resources/textures/ui")

POSITIVE_PREFIX = (
    "Bright cartoon animation style, cute animal fantasy adventure, "
    "polished mobile game UI, soft hand-painted look, clean shapes, "
    "crisp edges, warm lighting, family-friendly, WeChat mini game safe."
)
NEGATIVE_SUFFIX = (
    "text, letters, words, numbers, logo, watermark, skull, skeleton, bone, "
    "blood, gore, wound, organ, heart organ, horror, dark gothic, "
    "realistic violence, scary, pixel art, blurry, low resolution, "
    "messy UI, pasted panel, English text, Chinese text"
)

IMAGES = [
    ("main_bg.png","main",1280,720,800,
     "Create a 1280x720 integrated main hub screen background for a cute animal fantasy adventure mobile game. Bright cartoon animation style, peaceful forest camp and sunny meadow, open center space for main action button, top area reserved for character status text, bottom area reserved for four navigation buttons. Decorative leaves, stars, gems and paw motifs are part of the environment. No text, no letters, no numbers. No skulls, no blood, no horror. The screen must feel like a complete game hub, not separate UI cards pasted on a dark background.", True),
    ("btn_adventure.png","main",260,88,70,
     "Create a transparent PNG game UI button sized 260x88 in bright cartoon animal adventure style. Leafy wooden frame, soft blue-green inner plate, small star and gem ornaments, empty center for runtime text, crisp edges, prominent and large enough to be the main action button. No embedded text, no letters, no numbers, no skulls, no blood, transparent background.", False),
    ("btn_character.png","main",180,68,45,
     "Create a transparent PNG game UI button sized 180x68 in bright cartoon animal adventure style. Leafy wooden frame, soft blue-green inner plate, small star and gem ornaments, empty center for runtime text, crisp edges. No embedded text, no letters, no numbers, no skulls, no blood, transparent background.", False),
    ("btn_shop.png","main",180,68,45,
     "Create a transparent PNG game UI button sized 180x68 in bright cartoon animal adventure style. Leafy wooden frame, soft blue-green inner plate with golden coin accent, small star and gem ornaments, empty center for runtime text, crisp edges. No embedded text, no letters, no numbers, no skulls, no blood, transparent background.", False),
    ("btn_log.png","main",180,68,45,
     "Create a transparent PNG game UI button sized 180x68 in bright cartoon animal adventure style. Leafy wooden frame, soft blue-green inner plate with parchment scroll accent, small star and gem ornaments, empty center for runtime text, crisp edges. No embedded text, no letters, no numbers, no skulls, no blood, transparent background.", False),
    ("btn_settings.png","main",180,68,45,
     "Create a transparent PNG game UI button sized 180x68 in bright cartoon animal adventure style. Leafy wooden frame, soft blue-green inner plate with gear/cog accent, small star and gem ornaments, empty center for runtime text, crisp edges. No embedded text, no letters, no numbers, no skulls, no blood, transparent background.", False),
    ("top_status_panel.png","main",1120,86,120,
     "Create a transparent PNG wide horizontal panel sized 1120x86 for top status bar in a cute animal fantasy adventure mobile game. Bright cartoon animation style, leafy wooden decorative frame, soft parchment-like inner surface, divided into empty sections for character portrait area, name area, HP bar area, and currency area. Gem and star corner ornaments, crisp edges, no embedded text, no letters, no numbers, no skulls, no blood, transparent background.", False),
    ("login_bg.png","login",1280,720,800,
     "Create a 1280x720 full-screen login background for a cute animal fantasy adventure mobile game. Bright cartoon animation style, soft forest dawn with warm golden sunlight through trees, friendly welcome mood, lush green meadow and flowers, gentle magical sparkles, center area reserved for a login panel, top area for game title. Empty UI areas naturally embedded in the scene. No embedded text, no letters, no numbers, no watermark, no skulls, no blood, no horror.", True),
    ("login_panel.png","login",760,460,160,
     "Create a transparent PNG login panel sized 760x460 for a cute animal fantasy adventure mobile game. Bright cartoon animation style, soft parchment or carved stone texture, leafy vine border frame, gentle golden inner glow, top area for title decoration, middle area for two button slots, bottom area for agreement strip. Star and paw corner ornaments. No embedded text, no letters, no numbers, no watermark, no skulls, no blood, transparent background.", False),
    ("btn_wechat.png","login",320,76,65,
     "Create a transparent PNG game UI button sized 320x76 in bright cartoon animal adventure style. Leafy wooden frame, soft green inner fill (WeChat brand color accent), small star and gem ornaments, empty center for runtime text, crisp edges, wider button for primary login action. No embedded text, no letters, no numbers, no skulls, no blood, transparent background.", False),
    ("btn_guest.png","login",320,76,65,
     "Create a transparent PNG game UI button sized 320x76 in bright cartoon animal adventure style. Leafy wooden frame, soft blue inner fill, small star and gem ornaments, empty center for runtime text, crisp edges. Slightly more subtle than the primary button. No embedded text, no letters, no numbers, no skulls, no blood, transparent background.", False),
    ("agreement_strip.png","login",620,44,45,
     "Create a transparent PNG horizontal strip sized 620x44 for agreement text in a cute animal fantasy adventure mobile game. Bright cartoon animation style, thin leafy border frame, soft semi-transparent parchment inner surface, small decorative paw and star at ends, empty center area for runtime agreement text. No embedded text, no letters, no numbers, no watermark, no skulls, no blood, transparent background.", False),
]

def gen(prompt, size, retries=MAX_RETRIES):
    for a in range(retries):
        try:
            print(f"  [API] call attempt {a+1}/{retries}...", flush=True)
            r = requests.post(API_URL, headers={"Content-Type":"application/json","Authorization":f"Bearer {API_KEY}"},
                              json={"model":MODEL,"prompt":f"{prompt}. Style: {POSITIVE_PREFIX}. Avoid: {NEGATIVE_SUFFIX}",
                                    "n":1,"size":f"{size[0]}x{size[1]}"}, timeout=180)
            r.raise_for_status()
            d = r.json()
            url = d["data"][0]["url"]
            print(f"  [API] got URL: {url[:80]}...", flush=True)
            return url
        except Exception as e:
            print(f"  [API] attempt {a+1} failed: {e}", flush=True)
            if a < retries-1:
                print(f"  [API] wait {RETRY_DELAY}s...", flush=True)
                time.sleep(RETRY_DELAY)
    return None

def dl(url):
    print(f"  [DL] downloading...", flush=True)
    r = requests.get(url, timeout=180)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content))
    print(f"  [DL] {img.size[0]}x{img.size[1]} mode={img.mode}", flush=True)
    return img

def resize_pad(img, tw, th):
    """缩放 + 居中裁剪到目标尺寸"""
    img = img.convert("RGBA")
    sw, sh = img.size
    target_r = tw / th
    src_r = sw / sh
    if src_r > target_r:
        new_h = th
        new_w = int(sw * th / sh)
    else:
        new_w = tw
        new_h = int(sh * tw / sw)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - tw) // 2
    top = (new_h - th) // 2
    img = img.crop((left, top, left + tw, top + th))
    return img

def main():
    results = {"success":[],"failed":[],"oversized":[],"to_jpg":[]}

    for i, (fn, sd, tw, th, mk, prompt, is_bg) in enumerate(IMAGES, 1):
        print(f"\n{'='*60}", flush=True)
        print(f"[{i}/{len(IMAGES)}] {sd}/{fn} ({tw}x{th}, <= {mk}KB)", flush=True)
        print(f"{'='*60}", flush=True)

        # 1. Generate
        url = gen(prompt, (tw, th))
        if not url:
            print(f"  ❌ FAILED to generate {fn}", flush=True)
            results["failed"].append(fn)
            continue

        # 2. Download
        try:
            img = dl(url)
        except Exception as e:
            print(f"  ❌ FAILED to download: {e}", flush=True)
            results["failed"].append(fn)
            continue

        # 3. Save master (original)
        md = os.path.join(MASTER_DIR, sd)
        os.makedirs(md, exist_ok=True)
        mp = os.path.join(md, fn)
        img.save(mp, "PNG")
        print(f"  [MASTER] saved: {mp}", flush=True)

        # 4. Resize
        img_r = resize_pad(img, tw, th)

        # 5. Save to runtime_candidates (PNG for UI elements, try PNG then JPG for bg)
        cd = os.path.join(CANDIDATE_DIR, sd)
        os.makedirs(cd, exist_ok=True)
        cp = os.path.join(cd, fn)
        img_r.save(cp, "PNG")
        file_kb = os.path.getsize(cp) / 1024

        # 6. Handle oversized backgrounds → convert to JPG
        final_ext = "png"
        if file_kb > mk * 1.1 and is_bg:
            jpg_path = cp.replace(".png", ".jpg")
            img_r = img_r.convert("RGB")
            img_r.save(jpg_path, "JPEG", quality=85, optimize=True)
            jpg_kb = os.path.getsize(jpg_path) / 1024
            print(f"  ⚠️ PNG={file_kb:.1f}KB > {mk}KB → JPG={jpg_kb:.1f}KB", flush=True)
            if jpg_kb <= mk * 1.1:
                final_ext = "jpg"
                results["to_jpg"].append((fn, file_kb, jpg_kb))
                file_kb = jpg_kb
            else:
                print(f"  ⚠️ JPG also over limit ({jpg_kb:.1f}KB)", flush=True)
                results["oversized"].append((fn, jpg_kb, mk))

        final_fn = fn.replace(".png", f".{final_ext}")
        final_cand = os.path.join(cd, final_fn)

        if final_ext == "jpg":
            os.remove(cp)
            print(f"  [CANDIDATE] JPG: {final_cand} ({file_kb:.1f}KB)", flush=True)
        else:
            print(f"  [CANDIDATE] PNG: {final_cand} ({file_kb:.1f}KB)", flush=True)

        # Size verdict
        if file_kb > mk * 1.1:
            print(f"  ❌ OVER SIZE: {file_kb:.1f}KB > {mk}KB", flush=True)
            if (fn, file_kb, mk) not in results["oversized"]:
                results["oversized"].append((fn, file_kb, mk))
        elif file_kb > mk:
            print(f"  ⚠️ Slightly over: {file_kb:.1f}KB > {mk}KB (within 10%)", flush=True)
        else:
            print(f"  ✅ Size OK: {file_kb:.1f}KB <= {mk}KB", flush=True)

        # 7. Copy to assets
        ad = os.path.join(ASSETS_DIR, sd)
        os.makedirs(ad, exist_ok=True)
        ap = os.path.join(ad, final_fn)

        if final_ext == "jpg":
            # Read JPG, save as JPG
            j = Image.open(final_cand).convert("RGB")
            j.save(ap, "JPEG", quality=85, optimize=True)
        else:
            fin = Image.open(final_cand).convert("RGBA")
            fin.save(ap, "PNG")

        akb = os.path.getsize(ap) / 1024
        print(f"  [ASSETS] {ap} ({akb:.1f}KB)", flush=True)
        results["success"].append((fn, final_ext))

    # Summary
    print(f"\n{'='*60}", flush=True)
    print(f"  GENERATION SUMMARY", flush=True)
    print(f"{'='*60}", flush=True)
    print(f"  Success: {len(results['success'])}/{len(IMAGES)}", flush=True)
    if results.get("to_jpg"):
        print(f"  Converted to JPG: {len(results['to_jpg'])}", flush=True)
        for fn, png_kb, jpg_kb in results["to_jpg"]:
            print(f"    - {fn}: PNG {png_kb:.1f}KB → JPG {jpg_kb:.1f}KB", flush=True)
    if results.get("oversized"):
        print(f"  ⚠️ Over limit:", flush=True)
        for fn, kb, mk in results["oversized"]:
            print(f"    - {fn}: {kb:.1f}KB > {mk}KB", flush=True)
    if results.get("failed"):
        print(f"  Failed: {results['failed']}", flush=True)
    return results

if __name__ == "__main__":
    r = main()
    exit(0 if not r["failed"] else 1)
