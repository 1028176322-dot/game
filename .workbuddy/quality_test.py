"""测试：用 Agnes AI 生成像素画质量"""
import os, json, urllib.request, sys
sys.stdout.reconfigure(encoding="utf-8")
from PIL import Image

AGNES_URL = "https://apihub.agnes-ai.com/v1/images/generations"
AGNES_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
NT = "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND."

def gen_one(prompt, subdir, filename, target_size, max_colors=64):
    dst_dir = os.path.join(r"E:\game\回到地面\assets\resources\textures", subdir)
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, filename)
    raw = os.path.join(dst_dir, "_raw_" + filename)
    
    data = json.dumps({"model": "agnes-image-2.1-flash", "prompt": prompt + " " + NT, "n": 1, "size": "1024x1024"}).encode("utf-8")
    req = urllib.request.Request(AGNES_URL, data=data)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {AGNES_KEY}")
    with urllib.request.urlopen(req, timeout=60) as resp:
        url = json.loads(resp.read().decode("utf-8"))["data"][0]["url"]
    
    print(f"  Downloading...", end=" ", flush=True)
    with urllib.request.urlopen(url, timeout=60) as resp:
        with open(raw, "wb") as f:
            f.write(resp.read())
    
    img = Image.open(raw)
    img = img.resize(target_size, Image.NEAREST)
    img = img.quantize(colors=max_colors, method=Image.Quantize.MEDIANCUT)
    if img.mode == "P":
        img = img.convert("RGBA")
    img.save(dst, format="PNG", optimize=True)
    os.remove(raw)
    sz = os.path.getsize(dst)
    print(f"[OK] {sz} bytes ({sz/1024:.1f} KB)")
    return sz

print("=== 样品 1: 战士 idle Sprite Sheet ===")
# 4 frames tiled horizontally = 48 wide x (64 * 4 = 256) tall
gen_one(
    "Generate a cartoon pixel-art game character sprite sheet. "
    "The image is a horizontal strip of 4 frames of the same character "
    "showing a breathing idle animation. "
    "Character: A warrior in blue steel armor with sword and shield, "
    "side view, full body. Each frame is about 48x64 pixels. "
    "The 4 frames tile horizontally showing subtle breathing movement. "
    "Q版 cute cartoon pixel art style, bright and colorful.",
    r"characters\warrior", "warrior_idle_test.png", (48, 256), 32
)

print("=== 样品 2: 史莱姆怪物单帧 ===")
gen_one(
    "Generate a cute cartoon pixel-art monster sprite. "
    "Single frame, side view, full body. "
    "A green slime creature: round bouncy blob with big cute eyes, "
    "small smile, sitting on ground. "
    "48x64 pixels total. Q版 cute cartoon pixel art style. "
    "Bright green color #66BB44.",
    r"monsters\forest", "slime_test.png", (48, 64), 16
)

print("=== 样品 3: 地形 Tile ===")
gen_one(
    "Generate a pixel-art seamless tile texture. "
    "32x32 pixels, top-down view, tileable/seamless on all edges. "
    "Green forest grass floor with small flowers and pebbles. "
    "Cartoon pixel art style, bright cheerful colors.",
    r"tiles\forest", "tile_forest_floor_test.png", (32, 32), 16
)

print("=== 样品 4: 物品图标 ===")
gen_one(
    "Generate a pixel-art item icon for a game inventory. "
    "48x48 pixels, transparent background. "
    "A health potion: small round bottle with red liquid, "
    "white cork stopper, tiny sparkle. "
    "Cartoon pixel art, clean and readable, bright colors.",
    r"icons\items", "icon_item_healthpotion_test.png", (48, 48), 16
)

print("\n[OK] 4个样品已生成，请检查效果")
