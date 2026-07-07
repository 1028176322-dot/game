#!/usr/bin/env python3
"""
P1 v2 — 使用 curl (subprocess) 调用 Agnes API, 避免 requests 库挂死问题
"""
import os, sys, json, subprocess, time, shutil
from PIL import Image
from io import BytesIO

BASE = "E:/game/回到地面"
API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
MAX_RETRIES = 3

POS = "Bright cartoon animation style, cute animal fantasy adventure, polished mobile game UI, soft hand-painted look, clean shapes, crisp edges, warm lighting, family-friendly, WeChat mini game safe."
NEG = "text, letters, words, numbers, logo, watermark, skull, skeleton, bone, blood, gore, wound, organ, heart organ, horror, dark gothic, realistic violence, scary, pixel art, blurry, low resolution, messy UI, pasted panel, English text, Chinese text"

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

def call_api(prompt, w, h):
    """用 curl 调用 Agnes API"""
    full_prompt = f"{prompt}. Style: {POS}. Avoid: {NEG}"
    payload = json.dumps({"model":"agnes-image-2.1-flash","prompt":full_prompt,"n":1,"size":f"{w}x{h}"})
    cmd = [
        "curl", "-s", "-X", "POST",
        "https://apihub.agnes-ai.com/v1/images/generations",
        "-H", "Content-Type: application/json",
        "-H", f"Authorization: Bearer {API_KEY}",
        "-d", payload
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if result.returncode != 0:
        raise RuntimeError(f"curl failed: {result.stderr}")
    data = json.loads(result.stdout)
    url = data["data"][0]["url"]
    return url

def resize_and_save(img, tw, th, output_path):
    img = img.convert("RGBA")
    sw, sh = img.size
    tr = tw / th
    sr = sw / sh
    if sr > tr:
        nh, nw = th, int(sw * th / sh)
    else:
        nw, nh = tw, int(sh * tw / sw)
    img = img.resize((nw, nh), Image.LANCZOS)
    l, t = (nw - tw)//2, (nh - th)//2
    img = img.crop((l, t, l+tw, t+th))
    img.save(output_path, "PNG")
    return os.path.getsize(output_path) / 1024

def main():
    results = {"success":[],"failed":[],"oversized":[],"jpeg":[]}
    total = len(IMAGES)
    PY = sys.executable

    for idx, (fn, sd, tw, th, mk, prompt, is_bg) in enumerate(IMAGES, 1):
        print(f"\n{'='*60}", flush=True)
        print(f"[{idx}/{total}] {sd}/{fn} ({tw}x{th}, <= {mk}KB)", flush=True)
        print(f"{'='*60}", flush=True)

        url = None
        for attempt in range(1, MAX_RETRIES+1):
            print(f"  [API] call attempt {attempt}/{MAX_RETRIES}...", flush=True)
            try:
                url = call_api(prompt, tw, th)
                print(f"  [API] got URL: {url[:80]}...", flush=True)
                break
            except Exception as e:
                print(f"  [API] attempt {attempt} failed: {e}", flush=True)
                if attempt < MAX_RETRIES:
                    print(f"  [API] retry in 15s...", flush=True)
                    time.sleep(15)

        if not url:
            print(f"  ❌ FAILED to generate", flush=True)
            results["failed"].append(fn)
            continue

        # Download
        print(f"  [DL] downloading...", flush=True)
        dl_cmd = ["curl", "-s", "-L", url]
        try:
            dl_res = subprocess.run(dl_cmd, capture_output=True, timeout=180)
            dl_res.check_returncode()
        except Exception as e:
            print(f"  ❌ Download failed: {e}", flush=True)
            results["failed"].append(fn)
            continue

        img = Image.open(BytesIO(dl_res.stdout))
        print(f"  [DL] {img.size[0]}x{img.size[1]} mode={img.mode}", flush=True)

        # Save master
        md = os.path.join(BASE, "art_source/textures_review/master/ui", sd)
        os.makedirs(md, exist_ok=True)
        img.save(os.path.join(md, fn), "PNG")
        print(f"  [MASTER] saved", flush=True)

        # Resize
        cd = os.path.join(BASE, "runtime_candidates", sd)
        os.makedirs(cd, exist_ok=True)
        cp = os.path.join(cd, fn)
        file_kb = resize_and_save(img, tw, th, cp)
        print(f"  [RESIZE] {tw}x{th} = {file_kb:.1f}KB", flush=True)

        # Handle oversized backgrounds
        ext = "png"
        if file_kb > mk * 1.1 and is_bg:
            jpg_path = cp.replace(".png", ".jpg")
            Image.open(cp).convert("RGB").save(jpg_path, "JPEG", quality=85, optimize=True)
            jkb = os.path.getsize(jpg_path) / 1024
            print(f"  ⚠️ PNG={file_kb:.1f}KB > {mk}KB → JPG={jkb:.1f}KB", flush=True)
            if jkb <= mk * 1.1:
                os.remove(cp)
                ext = "jpg"
                file_kb = jkb
                results["jpeg"].append((fn, jkb))
            else:
                results["oversized"].append((fn, jkb, mk))

        final_fn = fn.replace(".png", f".{ext}")
        final_cp = os.path.join(cd, final_fn)

        if file_kb <= mk:
            print(f"  ✅ Size OK: {file_kb:.1f}KB <= {mk}KB", flush=True)
        elif file_kb <= mk * 1.1:
            print(f"  ⚠️ Slightly over: {file_kb:.1f}KB > {mk}KB (within 10%)", flush=True)
        else:
            print(f"  ❌ OVER: {file_kb:.1f}KB > {mk}KB", flush=True)

        # Copy to assets
        ad = os.path.join(BASE, "assets/resources/textures/ui", sd)
        os.makedirs(ad, exist_ok=True)
        ap = os.path.join(ad, final_fn)
        if ext == "jpg":
            Image.open(final_cp).convert("RGB").save(ap, "JPEG", quality=85, optimize=True)
        else:
            Image.open(final_cp).convert("RGBA").save(ap, "PNG")
        akb = os.path.getsize(ap) / 1024
        print(f"  [ASSETS] {ap} ({akb:.1f}KB)", flush=True)
        results["success"].append((fn, ext))

    print(f"\n{'='*60}", flush=True)
    print(f"  DONE: {len(results['success'])}/{total} success, {len(results['failed'])} failed", flush=True)
    if results.get("jpeg"):
        print(f"  JPEG converts: {len(results['jpeg'])}", flush=True)
    if results.get("oversized"):
        for fn, kb, mk in results["oversized"]:
            print(f"  OVER: {fn} {kb:.1f}KB > {mk}KB", flush=True)
    return results

if __name__ == "__main__":
    r = main()
    exit(0 if not r["failed"] else 1)
