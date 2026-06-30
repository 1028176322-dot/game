"""Phase 4b: A-grade replace 图标和背景 AI 生成器
68 个图标 (48px → 128x128) 和背景
"""
import os, sys, csv, json, time
from PIL import Image

AGNES_URL = "https://apihub.agnes-ai.com/v1/images/generations"
AGNES_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
NT = "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND."

AUDIT_CSV = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"
REPLACE_DIR = r"E:\game\回到地面\art_source\textures_export\runtime_replace"
PROGRESS = r"E:\game\.workbuddy\phase4b_progress.json"


def call_agnes(prompt):
    import urllib.request
    data = json.dumps({"model": "agnes-image-2.1-flash", "prompt": prompt + " " + NT, "n": 1, "size": "1024x1024"}).encode("utf-8")
    req = urllib.request.Request(AGNES_URL, data=data)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {AGNES_KEY}")
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))["data"][0]["url"]


def download(url, path):
    import urllib.request
    with urllib.request.urlopen(url, timeout=120) as r:
        with open(path, "wb") as f: f.write(r.read())


def gen_one(prompt, dst_path, size):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    raw = dst_path + ".raw"
    try:
        url = call_agnes(prompt)
        download(url, raw)
        img = Image.open(raw)
        img = img.resize(size, Image.LANCZOS)
        img = img.convert("RGBA")
        img.save(dst_path, format="PNG", optimize=True)
        if os.path.exists(raw): os.remove(raw)
        return os.path.getsize(dst_path)
    except Exception as e:
        if os.path.exists(raw): os.remove(raw)
        raise e


def build_prompt(row):
    path = row["path"]
    tw, th = int(row["target_w"]), int(row["target_h"])
    
    if path.startswith("icons/items"):
        name = os.path.basename(path).replace(".png", "").replace("icon_item_", "")
        return f"Generate a pixel-art game item icon, {tw}x{th} pixels, transparent background. Icon for '{name}'. Q版 cute pixel art, bright colors, clean readable design."
    if path.startswith("icons/skills"):
        name = os.path.basename(path).replace(".png", "").replace("icon_skill_", "")
        return f"Generate a pixel-art game skill icon, {tw}x{th} pixels, transparent background. Skill: '{name}'. Q版 pixel art, bright colors."
    if path.startswith("icons/buffs"):
        name = os.path.basename(path).replace(".png", "").replace("icon_", "")
        return f"Generate a pixel-art game buff/debuff icon, {tw}x{th} pixels, transparent background. Status effect icon. Q版 pixel art."
    if path.startswith("icons/elements"):
        name = os.path.basename(path).replace(".png", "").replace("icon_element_", "")
        return f"Generate a pixel-art game element icon, {tw}x{th} pixels, transparent background. Element: '{name}'. Q版 pixel art, glowing effect."
    if path.startswith("icons/sets"):
        name = os.path.basename(path).replace(".png", "").replace("icon_set_", "")
        return f"Generate a pixel-art game equipment set emblem icon, {tw}x{th} pixels, transparent background. Set: '{name}'. Q版 pixel art."
    if path.startswith("backgrounds"):
        zone = path.split("/")[1] if "/" in path else "unknown"
        return f"Generate a pixel-art game battle background scene, {tw}x{th} pixels. Fantasy {zone} environment. Cartoon pixel art style, atmospheric."
    
    return f"Generate a pixel-art game UI element, {tw}x{th} pixels, transparent background. Q版 cute pixel art."


def main():
    os.makedirs(REPLACE_DIR, exist_ok=True)
    
    prog = {"current_index": 0, "generated": {}}
    if os.path.exists(PROGRESS):
        with open(PROGRESS) as f: prog = json.load(f)
    
    items = []
    with open(AUDIT_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            if row["grade"] == "A" and row["action"] == "replace":
                items.append(row)
    
    total = len(items)
    print(f"A-grade replace 资源: {total} 个")
    
    for i, row in enumerate(items):
        rel = row["path"]
        key = rel.replace("\\", "/")
        if key in prog["generated"]:
            print(f"  [skip] {key}")
            continue
        
        tw, th = int(row["target_w"]), int(row["target_h"])
        out = os.path.join(REPLACE_DIR, key.replace("/", os.sep))
        
        prompt = build_prompt(row)
        print(f"  [{i+1}/{total}] {key} -> {tw}x{th} ...", end=" ", flush=True)
        
        try:
            sz = gen_one(prompt, out, (tw, th))
            print(f"{sz//1024}KB")
            prog["generated"][key] = sz
            with open(PROGRESS, "w") as f: json.dump(prog, f, indent=2)
        except Exception as e:
            print(f"FAIL: {e}")
            with open(PROGRESS, "w") as f: json.dump(prog, f, indent=2)
            sys.exit(1)
    
    print(f"\n全部 {total} 个 A-grade replace 完成!")


if __name__ == "__main__":
    main()
