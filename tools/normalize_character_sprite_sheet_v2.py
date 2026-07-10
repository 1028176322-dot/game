"""
角色Sprite Sheet后标准化脚本（v2 - 连通域检测）

把AI生成的不规则 sprite sheet（可能含 1列、2列、多列）规范化为 256×1024 竖排4帧。

核心算法：
  1. 二值化：非白像素为前景
  2. 4连通域标记：找出图中所有独立角色团
  3. 按 Y 轴排序，归并到 4 个水平条带
  4. 每个条带内若有多列，取最居中/最清晰的一列
  5. 提取角色→居中缩放→256×256
  6. 4 帧竖排合成 256×1024

用法：
  python tools/normalize_character_sprite_sheet_v2.py --resource archer_attack  # 单条测试
  python tools/normalize_character_sprite_sheet_v2.py --all                  # 全量
  python tools/normalize_character_sprite_sheet_v2.py --check-only           # 仅检查
"""

import sys, os, glob, math, shutil
from collections import defaultdict
from pathlib import Path
from PIL import Image, ImageOps

# ── 配置 ──
MASTER_DIR = Path(__file__).resolve().parent.parent / "回到地面" / "art_source" / "textures_review" / "master" / "characters"
BACKUP_DIR = Path(__file__).resolve().parent.parent / "回到地面" / "art_source" / "textures_review" / "backup" / "pre_normalize"
FRAME_SIZE = 256
TOTAL_HEIGHT = 1024
TARGET_SIZE = (FRAME_SIZE, TOTAL_HEIGHT)


# ═══════════════════════════════════════════════
#  连通域分析
# ═══════════════════════════════════════════════

def find_connected_components(img, threshold=248):
    """找到前景连通域，返回 [(bbox, pixels), ...]。"""
    w, h = img.size
    gray = ImageOps.grayscale(img)
    pixels = list(gray.getdata())
    
    # 0 = background, 1 = foreground
    mask = [1 if p < threshold else 0 for p in pixels]
    visited = [False] * (w * h)
    components = []
    
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if mask[idx] == 1 and not visited[idx]:
                # BFS
                queue = [(x, y)]
                visited[idx] = True
                component = []
                min_x, max_x = x, x
                min_y, max_y = y, y
                
                while queue:
                    cx, cy = queue.pop(0)
                    cidx = cy * w + cx
                    component.append((cx, cy))
                    min_x = min(min_x, cx)
                    max_x = max(max_x, cx)
                    min_y = min(min_y, cy)
                    max_y = max(max_y, cy)
                    
                    for dx, dy in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            nidx = ny * w + nx
                            if mask[nidx] == 1 and not visited[nidx]:
                                visited[nidx] = True
                                queue.append((nx, ny))
                
                # 过滤小噪声
                if len(component) > 50:
                    components.append({
                        'bbox': (min_x, min_y, max_x + 1, max_y + 1),
                        'pixels': len(component),
                        'center_x': (min_x + max_x) / 2,
                        'center_y': (min_y + max_y) / 2,
                    })
    
    return components


def cluster_components_by_y(components, bands=4):
    """把连通域按Y坐标聚类到4个水平条带。"""
    if not components:
        return []
    
    # 按中心Y排序
    sorted_comps = sorted(components, key=lambda c: c['center_y'])
    
    # 简单K-means风格：初始边界均分，迭代 refine
    h_min = sorted_comps[0]['center_y']
    h_max = sorted_comps[-1]['center_y']
    if h_max == h_min:
        h_max += 1
    
    # 初始边界
    boundaries = [h_min + (h_max - h_min) * i / bands for i in range(1, bands)]
    
    for _ in range(10):
        clusters = [[] for _ in range(bands)]
        for c in sorted_comps:
            best_band = 0
            best_dist = abs(c['center_y'] - (h_min + (h_max - h_min) * (0.5 / bands)))
            for b in range(1, bands):
                center_y_b = h_min + (h_max - h_min) * ((b + 0.5) / bands)
                d = abs(c['center_y'] - center_y_b)
                if d < best_dist:
                    best_dist = d
                    best_band = b
            clusters[best_band].append(c)
        
        # 更新边界
        new_boundaries = []
        for b in range(bands - 1):
            if clusters[b] and clusters[b + 1]:
                max_b = max(c['center_y'] for c in clusters[b])
                min_b1 = min(c['center_y'] for c in clusters[b + 1])
                new_boundaries.append((max_b + min_b1) / 2)
            elif clusters[b]:
                new_boundaries.append(max(c['center_y'] for c in clusters[b]) + 1)
            elif clusters[b + 1]:
                new_boundaries.append(min(c['center_y'] for c in clusters[b + 1]) - 1)
            else:
                new_boundaries.append(h_min + (h_max - h_min) * (b + 1) / bands)
        
        if new_boundaries == boundaries:
            break
        boundaries = new_boundaries
    
    return clusters


# ═══════════════════════════════════════════════
#  清理与重排
# ═══════════════════════════════════════════════

def extract_character(frame_region, img):
    """从 frame_region (bbox) 提取角色，清理后居中到 256×256。"""
    x1, y1, x2, y2 = frame_region
    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(img.size[0], x2)
    y2 = min(img.size[1], y2)
    
    region = img.crop((x1, y1, x2, y2))
    rgba = region.convert("RGBA")
    
    # 去白底
    pix = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if r > 250 and g > 250 and b > 250:
                whiteness = min(r, g, b)
                if whiteness > 252:
                    pix[x, y] = (r, g, b, 0)
                elif whiteness > 248:
                    alpha = int((255 - whiteness) * 2.55)
                    pix[x, y] = (r, g, b, min(alpha, a))
    
    # 去底部阴影
    shadow_top = int(h * 0.72)
    for y in range(shadow_top, h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a > 0:
                mx = max(r, g, b)
                mn = min(r, g, b)
                sat = (mx - mn) / mx if mx > 0 else 0
                if sat < 0.25 and 90 < mx < 245 and mn > 80:
                    pix[x, y] = (r, g, b, 0)
    
    # 找内容边界
    bbox = rgba.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = 12
        left = max(0, left - pad)
        top = max(0, top - pad)
        right = min(w, right + pad)
        bottom = min(h, bottom + pad)
        cropped = rgba.crop((left, top, right, bottom))
        cw, ch = cropped.size
    else:
        cropped = rgba
        cw, ch = w, h
    
    # 缩放到 256×256
    max_fit = 240
    scale = min(max_fit / cw, max_fit / ch) if cw > 0 and ch > 0 else 1.0
    new_w = max(int(cw * scale), 32)
    new_h = max(int(ch * scale), 32)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)
    
    canvas = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    x_off = (FRAME_SIZE - new_w) // 2
    y_off = (FRAME_SIZE - new_h) // 2
    canvas.paste(resized, (x_off, y_off), resized)
    return canvas


def select_best_component(components, img_width):
    """在一帧条带内选择最合适的连通域（若多列，选最居中/最大的）。"""
    if not components:
        return None
    if len(components) == 1:
        return components[0]
    
    # 优先：像素数量大，且中心靠近图像水平中心
    center_x = img_width / 2
    scored = []
    for c in components:
        size_score = min(c['pixels'], 50000) / 50000
        pos_score = 1 - abs(c['center_x'] - center_x) / (img_width / 2)
        total_score = size_score * 0.6 + pos_score * 0.4
        scored.append((total_score, c))
    
    scored.sort(key=lambda x: -x[0])
    return scored[0][1]


def normalize(img):
    """标准化 sprite sheet → 256×1024。"""
    w, h = img.size
    components = find_connected_components(img)
    
    if not components:
        return None
    
    # 按Y聚类到4个条带
    clusters = cluster_components_by_y(components, bands=4)
    
    frames = []
    for band_idx in range(4):
        if band_idx < len(clusters) and clusters[band_idx]:
            best = select_best_component(clusters[band_idx], w)
            if best:
                frame = extract_character(best['bbox'], img)
                frames.append(frame)
    
    # 补齐到4帧
    while len(frames) < 4:
        if frames:
            frames.append(frames[-1])
        else:
            frames.append(Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0)))
    
    # 合成
    sheet = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    for fi, frame in enumerate(frames):
        sheet.paste(frame, (0, fi * FRAME_SIZE), frame)
    
    return sheet


def needs_normalization(filepath):
    """检查是否已规范。"""
    img = Image.open(filepath)
    if img.size != TARGET_SIZE:
        return True
    # 已是目标尺寸，检查是否含 4 个独立帧
    components = find_connected_components(img)
    clusters = cluster_components_by_y(components, bands=4)
    # 如果每个条带只有一个主要成分，说明已经是规范 4 帧
    ok = True
    for c in clusters:
        if len(c) > 1:
            ok = False
            break
    return not ok


# ═══════════════════════════════════════════════
#  主流程
# ═══════════════════════════════════════════════

def process_file(filepath, check_only=False):
    rel = os.path.relpath(filepath, str(MASTER_DIR))
    
    if not check_only and not needs_normalization(filepath):
        return True
    
    if check_only:
        img = Image.open(filepath)
        status = "wrong size" if img.size != TARGET_SIZE else "layout needs fix"
        print(f"  {rel}: {status}")
        return False
    
    # 备份
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_path = BACKUP_DIR / f"{rel.replace(os.sep, '_')}"
    if not backup_path.exists():
        shutil.copy2(str(filepath), str(backup_path))
    
    try:
        img = Image.open(filepath)
        sheet = normalize(img)
        if sheet is None:
            print(f"  ❌ {rel}: no components found")
            return False
        sheet.save(str(filepath), "PNG")
        print(f"  ✅ {rel}: normalized → 256×1024 ({os.path.getsize(filepath)} bytes)")
        return True
    except Exception as e:
        print(f"  ❌ {rel}: error: {e}")
        return False


def process_all(check_only=False):
    files = sorted(glob.glob(str(MASTER_DIR / "*" / "*.png")))
    print(f"Found {len(files)} character files")
    success = 0
    fail = 0
    for f in files:
        if process_file(f, check_only):
            success += 1
        else:
            fail += 1
    print(f"\nDone: {success} OK, {fail} need fix / {len(files)} total")
    return success, fail


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--resource", help="Resource filename (e.g. archer_attack)")
    parser.add_argument("--all", action="store_true", help="Process all character files")
    parser.add_argument("--check-only", action="store_true", help="Only check, no modification")
    args = parser.parse_args()
    
    if args.resource:
        for f in glob.glob(str(MASTER_DIR / "*" / f"{args.resource}.png")):
            process_file(f, args.check_only)
    elif args.all:
        process_all(args.check_only)
    else:
        print("Usage: python tools/normalize_character_sprite_sheet_v2.py --resource archer_attack")
        print("       python tools/normalize_character_sprite_sheet_v2.py --all")
