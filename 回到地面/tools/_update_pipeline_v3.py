#!/usr/bin/env python3
"""Apply edge-touch gate + margin-aware fit + overscan to art_pipeline.py."""
import re

with open('E:/game/回到地面/tools/art_pipeline.py', 'r', encoding='utf-8') as f:
    code = f.read()

# ── 1. Add ORNAMENT_TYPES and OVERSCAN_FACTOR after palette retry steps ──
code = code.replace(
    '# ── BUDGET_LIMITS',
    """# ── 边框装饰类（需要 overscan 生成 + 严格留边检查） ──────────────────
ORNAMENT_TYPES = {"ui", "icons"}
# 装饰框类生成画布 = 目标尺寸 × OVERSCAN_FACTOR（给 AI 物理余量）
OVERSCAN_FACTOR = 1.8

# ── BUDGET_LIMITS"""
)

# ── 2. Add fit_rgba_to_canvas after crop_to_target_aspect ──
code = code.replace(
    "def remove_matte_background(img):",
    """def fit_rgba_to_canvas(img, target_size, margin_ratio=0.10):
    \"\"\"Center the subject in target_size canvas with transparent margin.

    Finds the alpha bounding box of the subject, scales it to fit within
    target_size minus margin, and centers it with transparent padding on all sides.
    This replaces center-crop for transparent UI assets: instead of cropping
    to aspect, it preserves the full subject and adds breathing room.
    margin_ratio = what fraction of the shorter edge is reserved as transparent padding.
    \"\"\"
    if img.mode == "RGB":
        img = img.convert("RGBA")

    # Find alpha bbox
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        # Fully transparent — blank canvas
        return Image.new("RGBA", target_size, (0, 0, 0, 0))

    subject = img.crop(bbox)
    sw, sh = subject.size
    tw, th = target_size

    # Calculate inner area with margin
    margin_w = int(tw * margin_ratio * 2)
    margin_h = int(th * margin_ratio * 2)
    inner_w = max(tw - margin_w, tw // 4)
    inner_h = max(th - margin_h, th // 4)

    # Scale subject to fit inner area (preserving aspect)
    scale = min(inner_w / sw, inner_h / sh, 1.0)
    new_w = max(int(sw * scale), 1)
    new_h = max(int(sh * scale), 1)
    subject_resized = subject.resize((new_w, new_h), Image.LANCZOS)

    # Center on canvas
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    x = (tw - new_w) // 2
    y = (th - new_h) // 2
    canvas.paste(subject_resized, (x, y), subject_resized)
    return canvas


def remove_matte_background(img):"""
)

# ── 3. Add validate_edge_transparent after feather_alpha ──
code = code.replace(
    "def reduce_palette(img, max_colors):",
    """def validate_edge_transparent(img):
    \"\"\"Check that a transparent resource has proper transparent margin.

    Layer 2 gate checks:
    - Outer 2px: non-transparent pixel ratio <= 1%
    - Four corners 8x8: non-transparent ratio <= 1%
    - Subject alpha bbox has >= 6px padding from all 4 edges

    Returns (pass: bool, issues: list[str]).
    \"\"\"
    issues = []
    if img.mode != "RGBA":
        return True, issues

    w, h = img.size
    pixels = img.load()

    def _ratio_in_area(x1, y1, x2, y2):
        opaque = 0
        total = 0
        for y in range(max(y1, 0), min(y2, h)):
            for x in range(max(x1, 0), min(x2, w)):
                total += 1
                if pixels[x, y][3] > 0:
                    opaque += 1
        return opaque / total if total > 0 else 0.0

    # Outer 2px strip on all 4 edges
    top_r = _ratio_in_area(0, 0, w, 2)
    bot_r = _ratio_in_area(0, h - 2, w, h)
    lft_r = _ratio_in_area(0, 2, 2, h - 2)
    rgt_r = _ratio_in_area(w - 2, 2, w, h - 2)
    max_edge_ratio = max(top_r, bot_r, lft_r, rgt_r)
    if max_edge_ratio > 0.01:
        issues.append(
            f"边缘透明不足: 最外2px非透明率{max_edge_ratio:.1%}"
            f" (T{top_r:.1%}/B{bot_r:.1%}/L{lft_r:.1%}/R{rgt_r:.1%})"
        )

    # Four 8x8 corners
    corners = [(0, 0), (w - 8, 0), (0, h - 8), (w - 8, h - 8)]
    for cx, cy in corners:
        cr = _ratio_in_area(cx, cy, min(cx + 8, w), min(cy + 8, h))
        if cr > 0.01:
            issues.append(f"角({cx},{cy})非透明率{cr:.1%}")
            break

    # Subject alpha bbox padding
    alpha = img.split()[3]
    alpha_bbox = alpha.getbbox()
    if alpha_bbox:
        l, t, r, b = alpha_bbox
        pad_l, pad_t = l, t
        pad_r, pad_b = w - r, h - b
        min_pad = min(pad_l, pad_t, pad_r, pad_b)
        if min_pad < 6:
            issues.append(
                f"主体留边不足: L{pad_l}/T{pad_t}/R{pad_r}/B{pad_b} (min={min_pad}px)"
            )

    return len(issues) == 0, issues


def reduce_palette(img, max_colors):"""
)

# ── 4. Update post_process_generated: overscan + fit_rgba_to_canvas ──
old_ppg = """def post_process_generated(master_path, target_size, category, output_path,
                           max_kb=120):
    \"\"\"Full post-processing pipeline: resize → matte removal → alpha feather
    → chroma cleanup → palette reduction → size check with retry.

    Returns (ok: bool, error_or_warning: str, final_size_kb: int).
    \"\"\"
    img = Image.open(master_path)

    # Step 1: Crop to target aspect ratio from center, then resize
    img = crop_to_target_aspect(img, target_size)
    img = img.resize(target_size, Image.LANCZOS)

    # Step 2: Transparent post-processing (categories that need alpha)
    if category in TRANSPARENT_CATEGORIES:
        if category in MATTE_CATEGORIES:
            img = remove_matte_background(img)
        img = remove_chroma_pixels(img)
        # Ensure RGBA
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        # Feather alpha to create smooth edge transitions (passes validate_technical)
        img = feather_alpha(img, radius=0.8)
    elif category == "backgrounds":
        # Backgrounds are opaque RGB
        if img.mode != "RGB":
            img = img.convert("RGB")"""

new_ppg = """def post_process_generated(master_path, target_size, category, output_path,
                           max_kb=120, overscan_factor=1.0):
    \"\"\"Full post-processing pipeline: overscan crop → matte removal → alpha feather
    → chroma cleanup → fit_rgba_to_canvas → palette reduction → size check.

    For ornament/border type resources, overscan_factor > 1 means the API
    generated at a larger canvas; we crop to target and fit with margin.

    Returns (ok: bool, error_or_warning: str, final_size_kb: int).
    \"\"\"
    img = Image.open(master_path)

    # Step 1: For transparent categories, use margin-aware fit instead of center-crop
    if category in TRANSPARENT_CATEGORIES:
        # Apply matte removal and chroma cleanup at full resolution first
        if category in MATTE_CATEGORIES:
            img = remove_matte_background(img)
        img = remove_chroma_pixels(img)
        if img.mode != "RGBA":
            img = img.convert("RGBA")

        # Fit to target canvas with generous transparent margin
        margin_ratio = 0.12 if category in ORNAMENT_TYPES else 0.08
        img = fit_rgba_to_canvas(img, target_size, margin_ratio)

        # Feather alpha for smooth edge transitions
        img = feather_alpha(img, radius=0.8)
    else:
        # Backgrounds: center-crop to aspect then resize
        img = crop_to_target_aspect(img, target_size)
        img = img.resize(target_size, Image.LANCZOS)
        if category == "backgrounds":
            if img.mode != "RGB":
                img = img.convert("RGB")"""

code = code.replace(old_ppg, new_ppg)

# ── 5. Update validate_technical to include edge-touch checks ──
# Find the chroma check in RGBA section and add edge-touch check
old_validate_rgba = """        # Chroma 残留检查（alpha=0 的像素不应是纯品红/绿/青色）
        rgba_pixels = img.load()
        chroma_found = False
        for y in range(min(img.height, 32)):  # 只检查顶部部分行
            for x in range(img.width):
                pr, pg, pb, pa = rgba_pixels[x, y]
                if pa > 0:
                    continue
                is_magenta = (pr >= 210 and pb >= 170 and pg <= 95)
                is_green = (pg >= 210 and pr <= 95 and pb <= 95)
                if is_magenta or is_green:
                    chroma_found = True
                    break
            if chroma_found:
                break
        if chroma_found:
            issues.append("Chroma 残留: 透明像素中存在品红/绿色")"""

new_validate = """        # 边缘透明检查（Layer 2 门禁：外圈alpha / 四角 / 留边）
        edge_ok, edge_issues = validate_edge_transparent(img)
        if not edge_ok:
            issues.extend(edge_issues)

        # Chroma 残留检查（alpha=0 的像素不应是纯品红/绿/青色）
        rgba_pixels = img.load()
        chroma_found = False
        for y in range(min(img.height, 32)):  # 只检查顶部部分行
            for x in range(img.width):
                pr, pg, pb, pa = rgba_pixels[x, y]
                if pa > 0:
                    continue
                is_magenta = (pr >= 210 and pb >= 170 and pg <= 95)
                is_green = (pg >= 210 and pr <= 95 and pb <= 95)
                if is_magenta or is_green:
                    chroma_found = True
                    break
            if chroma_found:
                break
        if chroma_found:
            issues.append("Chroma 残留: 透明像素中存在品红/绿色")"""

code = code.replace(old_validate_rgba, new_validate)

# ── 6. Update cmd_generate gen_size logic to use overscan for ORNAMENT_TYPES ──
old_gen_size = """                gen_size_str = f"{max(target_size[0], 512)}x{max(target_size[1], 512)}"

                print(f\"\"\"  → 调用 Agnes API (size={gen_size_str}, category={info["category"]})...\"\"\")
                url, err = call_agnes_api(ct_prompt, gen_size_str)"""

new_gen_size = """                # 装饰框类使用 overscan 画布，给 AI 物理余量
                if info["category"] in ORNAMENT_TYPES:
                    overscan_w = max(int(target_size[0] * 1.8), 512)
                    overscan_h = max(int(target_size[1] * 1.8), 512)
                    gen_size_str = f"{overscan_w}x{overscan_h}"
                else:
                    gen_size_str = f"{max(target_size[0], 512)}x{max(target_size[1], 512)}"

                print(f\"\"\"  → 调用 Agnes API (size={gen_size_str}, category={info["category"]})...\"\"\")
                url, err = call_agnes_api(ct_prompt, gen_size_str)"""

code = code.replace(old_gen_size, new_gen_size)

# ── 7. Update post_process call to pass overscan_factor ──
old_pp_call = """                max_kb = budget.get("hard", 120)
                ok, warn, final_kb = post_process_generated(
                    temp_path, target_size, info["category"], master_path, max_kb)"""

new_pp_call = """                max_kb = budget.get("hard", 120)
                overscan_factor = 1.8 if info["category"] in ORNAMENT_TYPES else 1.0
                ok, warn, final_kb = post_process_generated(
                    temp_path, target_size, info["category"], master_path, max_kb,
                    overscan_factor)"""

code = code.replace(old_pp_call, new_pp_call)

# ── Write ──
with open('E:/game/回到地面/tools/art_pipeline.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("art_pipeline.py updated: edge-touch gate + fit_rgba_to_canvas + overscan")
