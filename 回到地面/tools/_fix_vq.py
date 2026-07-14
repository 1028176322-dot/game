#!/usr/bin/env python3
"""Replace validate_visual_quality function in art_pipeline.py"""
import re

with open('E:/game/回到地面/tools/art_pipeline.py', 'r', encoding='utf-8') as f:
    code = f.read()

old_start = 'def validate_visual_quality(img, category, filename=""):'
new_func = '''def validate_visual_quality(img, category, filename=""):
    """Visual quality gate for ALL resource types.

    Universal checks (all types):
    - Global brightness: not all dark / all light / all single color
    - Global variance: image should not be a solid block (too flat/blank)

    Transparent resources extra:
    - Subject proportion: subject should occupy a reasonable portion
    - Subject centering: alpha bbox should not be severely off-center

    Type-specific:
    - Button/card/panel: center region blank (low variance)
    - Backgrounds: enough scene detail (variance above threshold)
    """
    issues = []
    if img.mode not in ("RGBA", "RGB"):
        return True, issues

    w, h = img.size
    pixels = img.load()
    total = w * h
    is_transparent = img.mode == "RGBA"

    # Collect opaque pixel data
    opaque_pixels = []
    opaque_count = 0
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y][:3]
            if is_transparent:
                a = pixels[x, y][3] if len(pixels[x, y]) > 3 else 255
                if a < 16:
                    continue
            opaque_pixels.append((r, g, b))
            opaque_count += 1

    # --- 1. Universal: brightness and flatness ---
    if opaque_count > 0:
        avg_r = sum(p[0] for p in opaque_pixels) / opaque_count
        avg_g = sum(p[1] for p in opaque_pixels) / opaque_count
        avg_b = sum(p[2] for p in opaque_pixels) / opaque_count
        avg_luma = avg_r * 0.299 + avg_g * 0.587 + avg_b * 0.114

        if avg_luma < 30:
            issues.append("brightness_too_dark: avg luma {:.0f}".format(avg_luma))
        elif avg_luma > 230:
            issues.append("brightness_too_bright: avg luma {:.0f}".format(avg_luma))

        var_r = sum((p[0] - avg_r) ** 2 for p in opaque_pixels) / opaque_count
        var_g = sum((p[1] - avg_g) ** 2 for p in opaque_pixels) / opaque_count
        var_b = sum((p[2] - avg_b) ** 2 for p in opaque_pixels) / opaque_count
        avg_std = ((var_r + var_g + var_b) / 3) ** 0.5

        if avg_std < 15:
            issues.append("image_too_flat: color std {:.0f}".format(avg_std))
    else:
        issues.append("no_opaque_pixels: image is fully transparent")

    # --- 2. Transparent: subject centering ---
    if is_transparent:
        from PIL import Image as _PIL
        _, _, _, alpha = img.split()
        bbox = alpha.getbbox()
        if bbox:
            l, t, r, b_ = bbox
            sb_w = r - l
            sb_h = b_ - t
            ratio = (sb_w * sb_h) / total
            if ratio < 0.01 and opaque_count > 0:
                issues.append("subject_too_small: {:.1%} of canvas".format(ratio))
            cx_img = w / 2
            cy_img = h / 2
            cx_sb = (l + r) / 2
            cy_sb = (t + b_) / 2
            offset_x = abs(cx_sb - cx_img) / w
            offset_y = abs(cy_sb - cy_img) / h
            if offset_x > 0.25 or offset_y > 0.25:
                issues.append("subject_off_center: h{:.0%}/v{:.0%}".format(offset_x, offset_y))

    # --- 3. Button/card/panel: center blank check ---
    is_blank_type = any(tag in filename for tag in
        ["btn_", "card_", "panel_", "frame_", "input_", "name_", "strip_"])
    if category in ORNAMENT_TYPES and is_blank_type:
        cx, cy = w // 2, h // 2
        cw, ch = max(w // 4, 8), max(h // 4, 8)
        x1 = max(cx - cw // 2, 0)
        y1 = max(cy - ch // 2, 0)
        x2 = min(cx + cw // 2, w)
        y2 = min(cy + ch // 2, h)

        cv = []
        for y in range(y1, y2):
            for x in range(x1, x2):
                if is_transparent and pixels[x, y][3] < 128:
                    continue
                cv.append((pixels[x, y][0], pixels[x, y][1], pixels[x, y][2]))

        if cv:
            mr = sum(v[0] for v in cv) / len(cv)
            mg = sum(v[1] for v in cv) / len(cv)
            mb = sum(v[2] for v in cv) / len(cv)
            vr = sum((v[0] - mr) ** 2 for v in cv) / len(cv)
            vg = sum((v[1] - mg) ** 2 for v in cv) / len(cv)
            vb = sum((v[2] - mb) ** 2 for v in cv) / len(cv)
            center_std = ((vr + vg + vb) / 3) ** 0.5
            if center_std > 30:
                issues.append("center_not_blank: color std {:.0f}".format(center_std))

    # --- 4. Background: scene detail check ---
    if category == "backgrounds" and opaque_count > 0:
        if avg_std < 25:
            issues.append("background_low_detail: color std {:.0f}".format(avg_std))

    # --- 5. Chroma residuals (transparent only) ---
    if is_transparent:
        chroma_count = 0
        for y in range(h):
            for x in range(w):
                if pixels[x, y][3] == 0:
                    pr, pg, pb = pixels[x, y][:3]
                    if (pr >= 210 and pb >= 170 and pg <= 95) or (pg >= 210 and pr <= 95 and pb <= 95):
                        chroma_count += 1
        if chroma_count > 10:
            issues.append("chroma_residuals: {} transparent pixels magenta/green".format(chroma_count))

    return len(issues) == 0, issues'''

# Find and replace
idx = code.find(old_start)
if idx >= 0:
    # Find the next def at same indentation level
    rest = code[idx:]
    end_idx = rest.find('\ndef ')
    if end_idx > 0:
        new_code = code[:idx] + new_func + '\n\n' + rest[end_idx:]
        with open('E:/game/回到地面/tools/art_pipeline.py', 'w', encoding='utf-8') as f:
            f.write(new_code)
        print("validate_visual_quality replaced successfully")
    else:
        print("ERROR: could not find next function boundary")
else:
    print("ERROR: could not find function start")
