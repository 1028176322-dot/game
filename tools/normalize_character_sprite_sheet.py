"""
角色Sprite Sheet后标准化脚本
功能：检测AI生成的 sprite sheet 的实际布局 → 自动分割 → 重排为 256×1024

支持的布局：
  - 1列×4行（理想，跳过）
  - 2列×4行（最常见的错误，左右两列各自是动画帧）
  - 2列×N行（N!=4 但可强制均分）
  - 1列×N行（N>4，可分割）

用法：
  python tools/normalize_character_sprite_sheet.py                           # 处理所有角色文件
  python tools/normalize_character_sprite_sheet.py --character archer        # 处理某个角色
  python tools/normalize_character_sprite_sheet.py --resource archer_attack  # 处理某个资源
  python tools/normalize_character_sprite_sheet.py --check-only              # 仅检查不修改
"""

import sys, os, glob, math, time, json
from collections import deque
from pathlib import Path
from PIL import Image, ImageOps

# ── 配置 ──
MASTER_DIR = Path(__file__).resolve().parent.parent / "回到地面" / "art_source" / "textures_review" / "master" / "characters"
BACKUP_DIR = Path(__file__).resolve().parent.parent / "回到地面" / "art_source" / "textures_review" / "backup"

FRAME_SIZE = 256        # 单帧宽高
TOTAL_HEIGHT = 1024     # 总高度
TARGET_SIZE = (FRAME_SIZE, TOTAL_HEIGHT)


# ═══════════════════════════════════════════════
#  布局检测
# ═══════════════════════════════════════════════

def detect_content_rows(img, threshold=244, density_threshold=0.02):
    """检测哪些行有内容，返回 (content_row_indices, row_densities)"""
    w, h = img.size
    gray = ImageOps.grayscale(img)
    pixels = list(gray.getdata())

    densities = []
    for y in range(h):
        row_start = y * w
        row_end = row_start + w
        non_white = sum(1 for x in range(row_start, row_end) if pixels[x] < threshold)
        densities.append(non_white / w)

    content_rows = [y for y, d in enumerate(densities) if d > density_threshold]
    return content_rows, densities


def find_gaps(content_rows, min_gap=4):
    """从内容行列表中找出间隙。返回 [(gap_start, gap_end), ...]"""
    if not content_rows:
        return []
    gaps = []
    for i in range(1, len(content_rows)):
        gap = content_rows[i] - content_rows[i - 1]
        if gap > min_gap:
            gaps.append((content_rows[i - 1] + 1, content_rows[i] - 1))
    return gaps


def detect_layout(img):
    """
    检测sprite sheet的布局。
    返回: dict {
        'columns': int,        # 检测到的列数
        'rows': int,           # 检测到的行数（帧数）
        'cells': [(x1,y1,x2,y2), ...],  # 每个单元格的bbox
        'quality': str         # 'good' | 'repairable' | 'bad'
    }
    """
    w, h = img.size
    gray = ImageOps.grayscale(img)

    # ── 按列检测内容分布 ──
    col_content = []
    for x in range(w):
        count = sum(1 for y in range(h) if gray.getpixel((x, y)) < 244)
        col_content.append(count / h)

    # 找到有内容的列范围
    content_cols = [x for x, d in enumerate(col_content) if d > 0.02]
    if not content_cols:
        return {'columns': 0, 'rows': 0, 'cells': [], 'quality': 'bad'}

    # 检测列间隙（垂直分割线）
    col_gaps = find_gaps(content_cols, min_gap=8)

    # 按列间隙切分
    columns = len(col_gaps) + 1
    if columns == 1:
        # 单列布局
        col_ranges = [(0, w - 1)]
    else:
        col_ranges = []
        prev = content_cols[0]
        for gs, ge in col_gaps:
            col_ranges.append((prev, gs - 1))
            prev = ge + 1
        col_ranges.append((prev, content_cols[-1]))

    # ── 按行检测内容分布 ──
    content_rows, _ = detect_content_rows(img)
    if not content_rows:
        return {'columns': columns, 'rows': 0, 'cells': [], 'quality': 'bad'}

    # 检测行间隙
    row_gaps = find_gaps(content_rows, min_gap=6)

    # 按行间隙切分
    if not row_gaps:
        rows = 1
        row_ranges = [(content_rows[0], content_rows[-1])]
    else:
        rows = len(row_gaps) + 1
        row_ranges = []
        prev_row = content_rows[0]
        for gs, ge in row_gaps:
            row_ranges.append((prev_row, gs - 1))
            prev_row = ge + 1
        row_ranges.append((prev_row, content_rows[-1]))

    # ── 构建单元格 ──
    cells = []
    for col_x1, col_x2 in col_ranges:
        for row_y1, row_y2 in row_ranges:
            # 在这个单元格内找实际的bbox
            cell = img.crop((col_x1, row_y1, col_x2 + 1, row_y2 + 1))
            cell_gray = ImageOps.grayscale(cell)
            mask = cell_gray.point(lambda x: 255 if x < 244 else 0)
            bbox = mask.getbbox()
            if bbox:
                cells.append((
                    col_x1 + bbox[0], row_y1 + bbox[1],
                    col_x1 + bbox[2], row_y1 + bbox[3]
                ))
            else:
                cells.append((col_x1, row_y1, col_x2 + 1, row_y2 + 1))

    # ── 质量判定 ──
    total_cells = len(cells)
    if columns == 1 and rows == 4:
        quality = 'good'  # 正好 4 帧竖排
    elif total_cells == 4:
        quality = 'repairable'  # 有 4 个单元格但布局不对（如 2×2）
    elif total_cells > 4:
        quality = 'repairable'  # 太多帧，可压缩
    else:
        quality = 'repairable'

    return {
        'columns': columns,
        'rows': rows,
        'cells': cells,
        'quality': quality,
        'col_ranges': col_ranges,
        'row_ranges': row_ranges,
        'content_rows': content_rows,
        'row_gaps': row_gaps,
    }


# ═══════════════════════════════════════════════
#  标准化处理
# ═══════════════════════════════════════════════

def extract_and_center(cell_img, target_size=(256, 256)):
    """从切下的单元格中提取角色，居中放到 target_size 画布。"""
    w, h = cell_img.size

    # 转RGBA，去白底
    rgba = cell_img.convert("RGBA")
    pix = rgba.load()
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

    # 缩放到目标尺寸
    max_fit = 240
    scale = min(max_fit / cw, max_fit / ch)
    new_w = max(int(cw * scale), 32)
    new_h = max(int(ch * scale), 32)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    # 居中
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    x_off = (target_size[0] - new_w) // 2
    y_off = (target_size[1] - new_h) // 2
    canvas.paste(resized, (x_off, y_off), resized)
    return canvas


def normalize(img):
    """
    标准化一张 sprite sheet：
    1. 检测布局
    2. 如果已经是 1×4 竖排 → 直接清理后返回
    3. 否则 → 切单元格 → 居中缩放 → 重排 4 帧竖排
    返回 (pil_image, layout_info)
    """
    layout = detect_layout(img)
    w, h = img.size

    if layout['quality'] == 'good':
        # 已经是正确布局，直接做清理后返回
        frames = []
        for row_y1, row_y2 in zip(layout['row_ranges'][:4], layout['row_ranges'][1:4]):
            # 实际上我们需要4行
            pass
        # 简化：按行间隙切出 4 帧
        row_gaps = layout['row_gaps']
        if len(row_gaps) >= 3:
            row_bounds = [0]
            for gs, ge in row_gaps[:3]:
                gs = max(0, gs - 8)
                row_bounds.append(gs)
            row_bounds.append(h)
            while len(row_bounds) > 5:
                row_bounds.pop(-2)
            while len(row_bounds) < 5:
                row_bounds.append(h)

            frames = []
            for fi in range(4):
                ys = row_bounds[fi]
                ye = row_bounds[fi + 1]
                cell = img.crop((0, ys, w, ye))
                clean = extract_and_center(cell)
                frames.append(clean)

            sheet = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
            for fi, frame in enumerate(frames):
                sheet.paste(frame, (0, fi * FRAME_SIZE), frame)
            return sheet, layout
        else:
            # gap 不足，强制均分
            layout['quality'] = 'repairable'

    # ── repairable 的情况：从 cells 中提取 → 重排 ──
    cells = layout['cells']
    if len(cells) < 4:
        # 单元格不足，尝试强制均分
        content_rows = layout.get('content_rows', [])
        if content_rows:
            y_first = content_rows[0]
            y_last = content_rows[-1]
            content_h = y_last - y_first + 1
            frame_h = content_h // 4
            cells = []
            for fi in range(4):
                ys = y_first + fi * frame_h
                ye = y_first + (fi + 1) * frame_h if fi < 3 else y_last
                cells.append((0, ys, w, ye))

    # 取最多 4 个单元格（优先取中间/内容丰富的）
    if len(cells) > 4:
        # 按内容量排序
        cells_with_content = []
        for cell in cells:
            cell_img = img.crop(cell)
            gray = ImageOps.grayscale(cell_img)
            content = sum(1 for p in list(gray.getdata()) if p < 244)
            cells_with_content.append((content, cell))
        cells_with_content.sort(key=lambda x: -x[0])
        cells = [c[1] for c in cells_with_content[:4]]
        # 按垂直位置重新排序
        cells.sort(key=lambda c: c[1])

    # 从每个单元格提取角色
    frames = []
    for cell in cells[:4]:
        cell_img = img.crop(cell)
        clean = extract_and_center(cell_img)
        frames.append(clean)

    # 如果不足4帧，用最后帧补齐
    while len(frames) < 4:
        frames.append(frames[-1] if frames else Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0)))

    # 合成
    sheet = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    for fi, frame in enumerate(frames):
        sheet.paste(frame, (0, fi * FRAME_SIZE), frame)

    return sheet, layout


# ═══════════════════════════════════════════════
#  批量处理
# ═══════════════════════════════════════════════

def process_file(filepath, check_only=False):
    """处理一个角色文件。返回 True 如果处理了（或没问题）。"""
    name = os.path.basename(filepath)
    rel = os.path.relpath(filepath, str(MASTER_DIR))

    img = Image.open(filepath)
    if img.size == TARGET_SIZE and img.mode == 'RGBA':
        # 已经是正确尺寸，检查是否需要重排
        layout = detect_layout(img)
        if layout['quality'] == 'good' and layout['columns'] == 1 and layout['rows'] >= 4:
            return True

    if check_only:
        print(f"  {rel}: needs normalization (layout: {layout.get('columns', '?')}col × {layout.get('rows', '?')}row)")
        return False

    # 备份
    backup_subdir = BACKUP_DIR / "pre_normalize"
    backup_subdir.mkdir(parents=True, exist_ok=True)
    backup_path = backup_subdir / f"{rel.replace(os.sep, '_')}"
    import shutil
    if not backup_path.exists():
        shutil.copy2(str(filepath), str(backup_path))

    # 标准化
    try:
        sheet, layout = normalize(img)
        sheet.save(str(filepath), "PNG")
        print(f"  ✅ {rel}: {layout.get('columns', '?')}col×{layout.get('rows', '?')}row → 1×4 ({os.path.getsize(filepath)} bytes)")
        return True
    except Exception as e:
        print(f"  ❌ {rel}: error: {e}")
        return False


def process_character(name, check_only=False):
    """处理一个角色的所有动作文件。"""
    pattern = str(MASTER_DIR / name / "*.png")
    files = sorted(glob.glob(pattern))
    if not files:
        print(f"  No files found for character '{name}'")
        return 0, 0

    success = 0
    fail = 0
    for f in files:
        if process_file(f, check_only):
            success += 1
        else:
            fail += 1
    return success, fail


def process_all(check_only=False):
    """处理所有角色文件。"""
    if not MASTER_DIR.exists():
        print(f"Master directory not found: {MASTER_DIR}")
        return

    pattern = str(MASTER_DIR / "*" / "*.png")
    files = sorted(glob.glob(pattern))
    print(f"Found {len(files)} character files")

    success = 0
    fail = 0
    for f in files:
        if process_file(f, check_only):
            success += 1
        else:
            fail += 1

    print(f"\nDone: {success} OK, {fail} need regen / {len(files)} total")
    return success, fail


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Normalize character sprite sheets")
    parser.add_argument("--character", help="Character name (archer, warrior, etc.)")
    parser.add_argument("--resource", help="Resource filename (archer_attack)")
    parser.add_argument("--check-only", action="store_true", help="Only check, don't modify")
    args = parser.parse_args()

    if args.character:
        process_character(args.character, args.check_only)
    elif args.resource:
        for f in glob.glob(str(MASTER_DIR / "*" / f"{args.resource}.png")):
            process_file(f, args.check_only)
    else:
        process_all(args.check_only)
