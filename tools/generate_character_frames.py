"""
角色分帧生成 + 拼接脚本
流程：
  1. 从 prompts.json 读取角色 prompt
  2. 拆成 4 帧独立 prompt（给每个帧添加 Frame 专用描述）
  3. 逐帧调用 Agnes API 生成 256×256 单帧图
  4. 4 帧竖排拼接为 256×1024 sprite sheet

用法：
  python tools/generate_character_frames.py --character archer --action attack  # 单条测试
  python tools/generate_character_frames.py --all                              # 全量生成
  python tools/generate_character_frames.py --conposite-only                   # 仅拼接（跳过生成）
"""

import json, os, sys, time, math, shutil
from collections import deque
from pathlib import Path

import urllib.request

# ── 配置 ──
PROJECT_ROOT = Path(__file__).resolve().parent.parent / "回到地面"
PROMPTS_PATH = Path(__file__).resolve().parent.parent / "assets/resources/config/prompts.json"
MASTER_DIR = PROJECT_ROOT / "art_source/textures_review/master/characters"
BACKUP_DIR = PROJECT_ROOT / "art_source/textures_review/backup"
TEMP_DIR = PROJECT_ROOT / ".workbuddy/tmp/character_frames"

API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
API_KEY = os.environ.get("AGNES_API_KEY", "")

# ── 帧描述（与 normalize_prompts_positive_style.py 的 ACTION_MAP 对应）──
FRAME_DESCRIPTIONS = {
    "idle": [
        "Standing relaxed, breathing neutral, weapon held at rest.",
        "Slight inhale, body rises gently, chest expands, ears perk up slightly.",
        "Exhale, body settles, shoulders relax, returning to neutral.",
        "Return to neutral standing pose, resting comfortably.",
    ],
    "attack": [
        "Ready stance holding weapon forward, alert and prepared, weight balanced.",
        "Wind-up: drawing weapon back, body coiling, gathering power for the strike.",
        "Peak action: weapon swung or thrust forward at full extension, arrow released, full power.",
        "Follow-through: weapon completing its arc, body settling back to ready position.",
    ],
    "walk": [
        "Standing with one foot planted forward, about to take a step.",
        "Stepping forward, back leg pushing off, body shifting weight ahead.",
        "Mid-stride, legs crossing past each other, arms swinging naturally.",
        "Landing step with opposite foot forward, body balanced, preparing for next step.",
    ],
    "hit": [
        "Standing neutral, unaware of incoming hit.",
        "Impact: head and upper body flinch backward, eyes wide in surprise.",
        "Recoil: body curls inward, arms move to guard, knees slightly bent.",
        "Recovering: straightening up, returning to guarded stance.",
    ],
    "dodge": [
        "Alert stance, weight on back foot, eyes watchful, ready to evade.",
        "Body crouches down low, tucking in arms and legs to roll.",
        "Sideways or forward roll, limbs tucked tight, momentum carrying through.",
        "Spring back up to standing, landing lightly on both feet, alert.",
    ],
    "death": [
        "Standing but wounded, body drooping, weapon lowering.",
        "Knees buckling, body leaning forward, losing strength.",
        "Kneeling or falling forward slowly, weapon dropping.",
        "Lying down peacefully as soft sparkle dust fades, body relaxing completely.",
    ],
    "skill": [
        "Raising weapon or wand upward to channel magical energy.",
        "Energy gathering and swirling around the character, glowing brighter.",
        "Releasing the ability: weapon or wand thrust forward, energy bursting outward.",
        "Aftermath: soft magical glow lingering, character settling with satisfied expression.",
    ],
}

# ── 工具函数 ──

def call_agnes_api(prompt, size="512x512"):
    """调用 Agnes API 生成图片，返回 (image_url, error)。"""
    payload = json.dumps({
        "model": "agnes-image-2.1-flash",
        "prompt": prompt,
        "n": 1,
        "size": size,
    }).encode("utf-8")

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        url = result.get("data", [{}])[0].get("url", "")
        if not url:
            return None, "API 返回中没有 data[0].url"
        return url, None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:300]
        return None, f"HTTP {e.code}: {body}"
    except Exception as e:
        return None, str(e)


def build_frame_prompt(base_prompt: str, frame_desc: str, frame_idx: int) -> str:
    """为单帧构建 prompt：去掉 sprite sheet 相关描述，替换为单帧布局。"""
    # 去掉旧的 layout 描述
    for phrase in ["Sprite sheet layout", "4 frames stacked", "total canvas 256x1024", "vertical strip"]:
        base_prompt = base_prompt.replace(phrase, "")
    # 去掉 "Frame consistency" 段落
    lines = base_prompt.split(". ")
    lines = [l for l in lines if "Frame consistency" not in l and "same species" not in l]
    base_prompt = ". ".join(lines)

    frame_prompt = (
        f"{base_prompt}. "
        f"Single frame only, one character centered, 256x256 canvas, pure white background. "
        f"This is Frame {frame_idx+1} of 4: {frame_desc}. "
        f"Clean transparent edges, centered composition, full body visible."
    )
    return frame_prompt


def download_image(url, save_path):
    """下载图片到本地。"""
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    urllib.request.urlretrieve(url, save_path)
    return save_path


def clean_single_frame(raw_path, output_size=(256, 256)):
    """清理单帧图片：去白底、裁剪、缩放到 256×256。"""
    from PIL import Image, ImageOps
    import math

    img = Image.open(raw_path)
    w, h = img.size

    # 转 RGBA
    img_rgba = img.convert("RGBA")

    # flood fill 去白底（通过颜色距离）
    def dist_from_white(r, g, b):
        return math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2)

    pixels = list(img_rgba.getdata())
    mw, mh = img_rgba.size
    bg_threshold = 8
    mask = [255 if dist_from_white(p[0], p[1], p[2]) > bg_threshold else 0 for p in pixels]

    # Flood fill from edges
    visited = set()
    queue = deque()
    for x in range(mw):
        for idx in [x, (mh - 1) * mw + x]:
            if idx < len(mask) and mask[idx] == 0 and idx not in visited:
                visited.add(idx)
                queue.append(idx)
    for y in range(mh):
        for idx in [y * mw, y * mw + mw - 1]:
            if idx < len(mask) and mask[idx] == 0 and idx not in visited:
                visited.add(idx)
                queue.append(idx)

    while queue:
        idx = queue.popleft()
        x = idx % mw
        y = idx // mw
        for dx, dy in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < mw and 0 <= ny < mh:
                nidx = ny * mw + nx
                if nidx not in visited and mask[nidx] == 0:
                    visited.add(nidx)
                    queue.append(nidx)

    # Apply transparency
    pix = img_rgba.load()
    for y in range(mh):
        for x in range(mw):
            idx = y * mw + x
            if idx in visited:
                pix[x, y] = (pix[x, y][0], pix[x, y][1], pix[x, y][2], 0)

    # 去底部阴影
    shadow_top = int(mh * 0.72)
    for y in range(shadow_top, mh):
        for x in range(mw):
            r, g, b, a = pix[x, y]
            if a > 0:
                mx = max(r, g, b)
                mn = min(r, g, b)
                sat = (mx - mn) / mx if mx > 0 else 0
                if sat < 0.25 and 90 < mx < 245 and mn > 80:
                    pix[x, y] = (r, g, b, 0)

    # 找到内容边界并缩放居中
    bbox = img_rgba.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = 12
        left = max(0, left - pad)
        top = max(0, top - pad)
        right = min(mw, right + pad)
        bottom = min(mh, bottom + pad)

        cropped = img_rgba.crop((left, top, right, bottom))
        cw, ch = cropped.size
        max_fit = 240
        scale = min(max_fit / cw, max_fit / ch)
        new_w = max(int(cw * scale), 32)
        new_h = max(int(ch * scale), 32)

        resized = cropped.resize((new_w, new_h), Image.LANCZOS)

        canvas = Image.new("RGBA", output_size, (0, 0, 0, 0))
        x_off = (output_size[0] - new_w) // 2
        y_off = (output_size[1] - new_h) // 2
        canvas.paste(resized, (x_off, y_off), resized)
        return canvas

    return img_rgba.resize(output_size)


def composite_sprite_sheet(frame_images, output_size=(256, 1024)):
    """将 4 张 256×256 单帧竖排拼成 256×1024 sprite sheet。"""
    from PIL import Image
    sheet = Image.new("RGBA", output_size, (0, 0, 0, 0))
    for i, img in enumerate(frame_images):
        if img.size != (256, 256):
            img = img.resize((256, 256), Image.LANCZOS)
        sheet.paste(img, (0, i * 256), img)
    return sheet


# ── 主流程 ──

def generate_frames(character, action, base_prompt):
    """生成指定角色-动作的 4 帧，返回 4 个(PIL.Image, url)元组。"""
    frame_descs = FRAME_DESCRIPTIONS.get(action, FRAME_DESCRIPTIONS["idle"])
    results = []
    
    for fi in range(4):
        prompt = build_frame_prompt(base_prompt, frame_descs[fi], fi)
        print(f"  Frame {fi+1}: calling API...")
        url, err = call_agnes_api(prompt, "512x512")
        if err:
            print(f"  ✗ Frame {fi+1} failed: {err}")
            return None
        
        # Download
        temp_path = TEMP_DIR / f"{character}_{action}_f{fi+1}_raw.png"
        download_image(url, str(temp_path))
        
        # Clean
        cleaned = clean_single_frame(str(temp_path))
        results.append(cleaned)
        print(f"  ✓ Frame {fi+1}: cleaned to {cleaned.size}")
    
    return results


def process_one(character, action):
    """处理一个角色-动作的完整流程：生成+拼接。"""
    # 读取 base prompt
    key = f"characters/{character}/{character}_{action}.png"
    with open(PROMPTS_PATH, "r", encoding="utf-8") as f:
        prompts = json.load(f)
    
    if key not in prompts:
        print(f"  ✗ {key} not found in prompts.json")
        return False
    
    base_prompt = prompts[key]
    print(f"\n{'='*60}")
    print(f"Processing: {character}_{action}")
    
    # 生成 4 帧
    frames = generate_frames(character, action, base_prompt)
    if frames is None:
        return False
    
    # 拼接 sprite sheet
    sheet = composite_sprite_sheet(frames)
    
    # 保存 master
    char_dir = MASTER_DIR / character
    os.makedirs(str(char_dir), exist_ok=True)
    master_path = char_dir / f"{character}_{action}.png"
    sheet.save(str(master_path), "PNG")
    print(f"  ✅ Saved: {master_path} ({os.path.getsize(master_path)} bytes)")
    
    return True


def process_all():
    """全量处理 35 个角色-动作。"""
    with open(PROMPTS_PATH, "r", encoding="utf-8") as f:
        prompts = json.load(f)
    
    # 列出所有角色-动作
    char_keys = [k for k in prompts if k.startswith("characters/")]
    # 已存在的角色-动作（排除 _f1 _f2 等）
    already = set()
    for k in char_keys:
        parts = k.replace(".png", "").split("/")
        if len(parts) >= 2 and "_f" not in parts[-1]:
            already.add(k)
    
    # 按职业排序
    sorted_keys = sorted(already)
    print(f"Total character-actions to process: {len(sorted_keys)}")
    
    # 备份旧的 master 目录
    if MASTER_DIR.exists():
        ts = time.strftime("%Y%m%d_%H%M%S")
        backup_path = BACKUP_DIR / f"chars_before_frame_regen_{ts}"
        shutil.copytree(str(MASTER_DIR), str(backup_path))
        print(f"Backed up old masters to {backup_path}")
    
    success = 0
    fail = 0
    for key in sorted_keys:
        parts = key.replace(".png", "").split("/")
        character = parts[1].split("_")[0] if "_" not in parts[1] else parts[1]
        action = parts[-1].split("_")[-1]
        
        ok = process_one(character, action)
        if ok:
            success += 1
        else:
            fail += 1
    
    print(f"\n{'='*60}")
    print(f"Done: {success} succeeded, {fail} failed / {len(sorted_keys)} total")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--character", help="Character name (archer, warrior, etc.)")
    parser.add_argument("--action", help="Action name (idle, attack, etc.)")
    parser.add_argument("--all", action="store_true", help="Process all 35 character-actions")
    parser.add_argument("--conposite-only", action="store_true", help="Only composite (skip generation)")
    
    args = parser.parse_args()
    
    os.makedirs(str(TEMP_DIR), exist_ok=True)
    
    if args.conposite_only:
        print("Composite-only mode not yet implemented (use process_all normally)")
    elif args.all:
        process_all()
    elif args.character and args.action:
        process_one(args.character, args.action)
    else:
        print("指定 --character + --action 或 --all")
        print("示例: python tools/generate_character_frames.py --character archer --action attack")
