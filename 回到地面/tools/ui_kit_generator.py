#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI Kit Generator — 程序化生成 UI 组件资源（按钮/卡片/面板/输入框/槽位）

替代旧的 generate_panel.py，支持：
- 5 种 UI 类型：btn / card / panel / input / slot
- 外圈透明安全边距（~8px），通过边缘门禁
- 9-slice 兼容结构（四角装饰密集，边线可拉伸，中心低对比）
- 可选装饰（叶子/宝石）
- 固定 seed，相同参数每次一致

输出：RGBA PNG，可直接入库。
"""

import os, math, random, argparse, json
from PIL import Image, ImageDraw, ImageFont

# ── 调色板 ──
PALETTES = {
    "forest": {
        "bg_top": (252, 246, 232),
        "bg_mid": (245, 235, 210),
        "bg_bottom": (238, 224, 192),
        "border_outer": (185, 152, 108),
        "border_inner": (232, 214, 174),
        "accent": (126, 179, 66),      # leaf green
        "accent_dark": (96, 139, 46),
        "gem": (180, 140, 200),         # amethyst
        "gem_highlight": (220, 190, 240),
        "shadow": (80, 60, 35, 50),
        "hl": (255, 255, 255, 40),
    },
}

DEFAULT_PALETTE = PALETTES["forest"]

# ── 透明安全边距 ──
PADDING = 8          # 外圈透明边距（px）
MARGIN_INNER = 4     # 内部内容与边框间距


def make_rounded_mask(size, radius, antialias=4):
    """Create a rounded rectangle alpha mask with anti-aliased edges."""
    w, h = size
    aw, ah = w * antialias, h * antialias
    ar = radius * antialias
    big = Image.new("L", (aw, ah), 0)
    d = ImageDraw.Draw(big)
    d.rounded_rectangle([0, 0, aw - 1, ah - 1], radius=ar, fill=255)
    return big.resize((w, h), Image.LANCZOS)


def wood_grain(size, alpha=12):
    """生成木纹纹理层。"""
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    pixels = img.load()
    for x in range(size[0]):
        base = math.sin(x / 18.0) * 0.5 + math.sin(x / 7.0) * 0.25
        for y in range(size[1]):
            noise = random.uniform(-0.35, 0.35)
            val = int((base + noise) * alpha)
            pixels[x, y] = (120, 90, 60, max(0, min(255, val)))
    return img


def draw_leaf(d, cx, cy, angle, scale=1.0, palette=DEFAULT_PALETTE):
    """Draw a decorative leaf at (cx, cy) rotated by angle."""
    green = palette["accent"]
    dark = palette["accent_dark"]
    pts = []
    for t in range(0, 360, 10):
        rad = math.radians(t)
        r = 1.0 + 0.12 * math.cos(2 * rad)
        x = r * math.cos(rad) * 12 * scale
        y = r * math.sin(rad) * 7 * scale
        xr = x * math.cos(angle) - y * math.sin(angle)
        yr = x * math.sin(angle) + y * math.cos(angle)
        pts.append((cx + xr, cy + yr))
    d.polygon(pts, fill=green, outline=dark)
    vx = cx + math.cos(angle) * 8 * scale
    vy = cy + math.sin(angle) * 8 * scale
    d.line([(cx, cy), (vx, vy)], fill=dark, width=1)


def draw_gem(d, cx, cy, size=6, palette=DEFAULT_PALETTE):
    """Draw a small gem shape at (cx, cy)."""
    gem_c = palette["gem"]
    gem_h = palette["gem_highlight"]
    pts = [
        (cx, cy - size),
        (cx + size * 0.7, cy - size * 0.3),
        (cx + size * 0.5, cy + size * 0.6),
        (cx, cy + size),
        (cx - size * 0.5, cy + size * 0.6),
        (cx - size * 0.7, cy - size * 0.3),
    ]
    d.polygon(pts, fill=gem_c, outline=gem_c)
    d.polygon(pts[:3], fill=gem_h)


def create_gradient(w, h, top, mid, bottom):
    """Create a vertical gradient image."""
    img = Image.new("RGBA", (w, h), mid)
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            t = y / h
            r = int(top[0] * (1 - t) + bottom[0] * t)
            g = int(top[1] * (1 - t) + bottom[1] * t)
            b = int(top[2] * (1 - t) + bottom[2] * t)
            pixels[x, y] = (r, g, b, 255)
    return img


def add_outer_padding(img, pad=PADDING):
    """Add transparent padding around the image."""
    w, h = img.size
    result = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    result.paste(img, (pad, pad), img)
    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Style renderers
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def render_btn(w, h, radius=14, palette=None, leaves=True, gems=True, selected=False):
    """生成按钮框（凸起圆角矩形，中心留白）。"""
    p = palette or DEFAULT_PALETTE
    r = min(radius, w // 4, h // 4)

    # 底色渐变 + 木纹
    base = create_gradient(w, h, p["bg_top"], p["bg_mid"], p["bg_bottom"])
    grain = wood_grain((w, h), alpha=10)
    base = Image.alpha_composite(base, grain)

    # 边框层
    border = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(border)

    if selected:
        # 选中态：加亮边框 + 光晕
        d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r,
                            outline=p["gem"], width=4)
        d.rounded_rectangle([2, 2, w - 3, h - 3], radius=max(0, r - 2),
                            outline=p["gem_highlight"], width=2)
        # 四角宝石
        if gems:
            for cx, cy in [(4, 4), (w - 4, 4), (4, h - 4), (w - 4, h - 4)]:
                draw_gem(d, cx, cy, 5, p)
    else:
        # 默认态：木质边框
        d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r,
                            outline=p["border_outer"], width=3)
        d.rounded_rectangle([2, 2, w - 3, h - 3], radius=max(0, r - 2),
                            outline=p["border_inner"], width=1)

    # 阴影斜角效果
    sh = p.get("shadow", (80, 60, 35, 50))
    hl = p.get("hl", (255, 255, 255, 40))
    d.arc([3, 3, w - 4, h - 4], start=180, end=270, fill=hl, width=1)
    d.arc([3, 3, w - 4, h - 4], start=0, end=90, fill=sh, width=1)

    base = Image.alpha_composite(base, border)

    # 叶子装饰（仅四角）
    if leaves:
        leaf_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dl = ImageDraw.Draw(leaf_layer)
        m = min(20, w // 6, h // 4)
        draw_leaf(dl, m, m, math.radians(-45), 0.7, p)
        draw_leaf(dl, w - m, m, math.radians(-135), 0.7, p)
        if h > 48:
            draw_leaf(dl, m, h - m, math.radians(45), 0.7, p)
            draw_leaf(dl, w - m, h - m, math.radians(135), 0.7, p)
        base = Image.alpha_composite(base, leaf_layer)

    # 圆角裁剪
    mask = make_rounded_mask((w, h), r)
    base.putalpha(mask)

    # 中心 60-70% 区域降低对比度（留白）
    cx, cy = w // 2, h // 2
    iw, ih = int(w * 0.5), int(h * 0.5)
    x1, y1 = max(cx - iw // 2, 0), max(cy - ih // 2, 0)
    x2, y2 = min(cx + iw // 2, w), min(cy + ih // 2, h)
    pixels = base.load()
    avg_r, avg_g, avg_b = 0, 0, 0
    count = 0
    for y in range(y1, y2):
        for x in range(x1, x2):
            pr, pg, pb, pa = pixels[x, y]
            if pa > 0:
                avg_r += pr; avg_g += pg; avg_b += pb
                count += 1
    if count > 0:
        avg_r //= count; avg_g //= count; avg_b //= count
        soften = 0.6
        for y in range(y1, y2):
            for x in range(x1, x2):
                pr, pg, pb, pa = pixels[x, y]
                if pa > 0:
                    nr = int(pr * (1 - soften) + avg_r * soften)
                    ng = int(pg * (1 - soften) + avg_g * soften)
                    nb = int(pb * (1 - soften) + avg_b * soften)
                    pixels[x, y] = (nr, ng, nb, pa)

    return add_outer_padding(base)


def render_card(w, h, radius=16, palette=None, leaves=True, gems=True, selected=False):
    """生成卡片框（完整圆角矩形，中心留白）。"""
    p = palette or DEFAULT_PALETTE
    r = min(radius, w // 4, h // 4)

    # 选中态：使用更亮的羊皮纸底色 + 金色边框倾向
    if selected:
        base = create_gradient(w, h, (255, 252, 240), (252, 245, 220), (248, 238, 200))
        border_outer = (210, 175, 95)
        border_inner = (255, 235, 170)
        selected_palette = dict(p)
        selected_palette["gem"] = (255, 215, 80)
        selected_palette["gem_highlight"] = (255, 240, 160)
    else:
        base = create_gradient(w, h, (255, 248, 235), (250, 240, 220), (242, 230, 205))
        border_outer = p["border_outer"]
        border_inner = p["border_inner"]
        selected_palette = p

    grain = wood_grain((w, h), alpha=8)
    base = Image.alpha_composite(base, grain)

    # 边框
    border = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(border)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r,
                        outline=border_outer, width=4)
    d.rounded_rectangle([3, 3, w - 4, h - 4], radius=max(0, r - 3),
                        outline=border_inner, width=2)
    # 高光/阴影
    hl = p.get("hl", (255, 255, 255, 40))
    sh = p.get("shadow", (80, 60, 35, 50))
    d.arc([4, 4, w - 5, h - 5], start=180, end=270, fill=hl, width=2)
    d.arc([4, 4, w - 5, h - 5], start=0, end=90, fill=sh, width=2)

    base = Image.alpha_composite(base, border)

    # 叶子 + 宝石装饰
    if leaves or gems:
        deco = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dl = ImageDraw.Draw(deco)
        m = 16
        # 四角叶子
        if leaves:
            for cx, cy, ang in [(m, m, -45), (w - m, m, -135),
                                (m, h - m, 45), (w - m, h - m, 135)]:
                draw_leaf(dl, cx, cy, math.radians(ang), 0.8, p)
        # 四角宝石（叶子内侧）
        if gems:
            gem_m = 8
            for cx, cy in [(gem_m, gem_m), (w - gem_m, gem_m),
                           (gem_m, h - gem_m), (w - gem_m, h - gem_m)]:
                draw_gem(dl, cx, cy, 4, selected_palette)
        base = Image.alpha_composite(base, deco)

    # 选中态：额外四角高光
    if selected:
        highlight = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dh = ImageDraw.Draw(highlight)
        dh.arc([6, 6, w - 7, h - 7], start=180, end=270, fill=(255, 235, 160, 80), width=3)
        dh.arc([6, 6, w - 7, h - 7], start=270, end=360, fill=(255, 235, 160, 80), width=3)
        base = Image.alpha_composite(base, highlight)

    # 圆角裁剪
    mask = make_rounded_mask((w, h), r)
    base.putalpha(mask)

    return add_outer_padding(base)


def render_panel(w, h, radius=22, palette=None, leaves=True, gems=True, selected=False, locked=False):
    """生成面板底板（完整矩形，四角装饰密集，边线可拉伸）。"""
    p = palette or DEFAULT_PALETTE
    r = min(radius, w // 4, h // 4)

    # 锁定态：暖灰褐色调，保持卡通感，不冷灰
    if locked:
        base = create_gradient(w, h, (232, 226, 210), (215, 208, 190), (198, 190, 172))
        border_outer = (155, 145, 125)
        border_inner = (205, 195, 175)
        deco_color = (140, 130, 110)
        panel_palette = dict(p)
        panel_palette["gem"] = deco_color
    elif selected:
        base = create_gradient(w, h, (255, 250, 230), (250, 242, 205), (245, 235, 185))
        border_outer = (205, 170, 90)
        border_inner = (255, 230, 155)
        deco_color = (255, 215, 80)
        panel_palette = dict(p)
        panel_palette["gem"] = deco_color
    else:
        base = create_gradient(w, h, p["bg_top"], p["bg_mid"], p["bg_bottom"])
        border_outer = p["border_outer"]
        border_inner = p["border_inner"]
        deco_color = p["gem"]
        panel_palette = p
    grain = wood_grain((w, h), alpha=14)
    base = Image.alpha_composite(base, grain)

    border = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(border)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r,
                        outline=border_outer, width=4)
    d.rounded_rectangle([3, 3, w - 4, h - 4], radius=max(0, r - 3),
                        outline=border_inner, width=2)
    hl = p.get("hl", (255, 255, 255, 40))
    sh = p.get("shadow", (80, 60, 35, 50))
    d.arc([5, 5, w - 6, h - 6], start=180, end=270, fill=hl, width=2)
    d.arc([5, 5, w - 6, h - 6], start=0, end=90, fill=sh, width=2)

    base = Image.alpha_composite(base, border)

    if leaves or gems:
        deco = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dl = ImageDraw.Draw(deco)
        m = 20
        if leaves:
            for cx, cy, ang in [(m + 8, m + 8, -45), (w - m - 8, m + 8, -135),
                                (m + 8, h - m - 8, 45), (w - m - 8, h - m - 8, 135)]:
                draw_leaf(dl, cx, cy, math.radians(ang), 1.0, p)
        if gems:
            gem_m = 10
            for cx, cy in [(gem_m, gem_m), (w - gem_m, gem_m),
                           (gem_m, h - gem_m), (w - gem_m, h - gem_m)]:
                draw_gem(dl, cx, cy, 6, panel_palette)
        base = Image.alpha_composite(base, deco)

    # 锁定态：均匀微暖色半透明叠加（替代稀疏 diagonal 线条）
    if locked:
        overlay = Image.new("RGBA", (w, h), (140, 130, 115, 18))
        base = Image.alpha_composite(base, overlay)
        # 再加一条极浅的底边阴影线，暗示"不可用"状态
        shadow_line = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        sl = ImageDraw.Draw(shadow_line)
        sl.arc([2, 2, w - 3, h - 3], start=90, end=180, fill=(80, 70, 55, 14), width=2)
        base = Image.alpha_composite(base, shadow_line)

    mask = make_rounded_mask((w, h), r)
    base.putalpha(mask)

    # Soften center area for readability (跳过锁定态，避免中间矩形断层)
    if not locked:
        cx, cy = w // 2, h // 2
        iw, ih = int(w * 0.4), int(h * 0.4)
        x1, y1 = max(cx - iw // 2, 0), max(cy - ih // 2, 0)
        x2, y2 = min(cx + iw // 2, w), min(cy + ih // 2, h)
        pixels = base.load()
        avg_r, avg_g, avg_b = 0, 0, 0
        count = 0
        for y in range(y1, y2):
            for x in range(x1, x2):
                pr, pg, pb, pa = pixels[x, y]
                if pa > 0:
                    avg_r += pr; avg_g += pg; avg_b += pb; count += 1
        if count > 0:
            avg_r //= count; avg_g //= count; avg_b //= count
            soften = 0.7
            for y in range(y1, y2):
                for x in range(x1, x2):
                    pr, pg, pb, pa = pixels[x, y]
                    if pa > 0:
                        pixels[x, y] = (
                            int(pr * (1 - soften) + avg_r * soften),
                            int(pg * (1 - soften) + avg_g * soften),
                            int(pb * (1 - soften) + avg_b * soften),
                            pa,
                        )

    return add_outer_padding(base)


def render_input(w, h, radius=8, palette=None):
    """生成输入框（简洁圆角框，中心透明/低对比）。"""
    p = palette or DEFAULT_PALETTE
    r = min(radius, w // 6, h // 3)

    base = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    # 极浅底色（几乎透明）
    bg = create_gradient(w, h, (252, 250, 245), (248, 244, 238), (245, 240, 232))
    bg = bg.convert("RGBA")
    bg_mask = make_rounded_mask((w, h), r)
    bg.putalpha(bg_mask.point(lambda v: int(v * 0.3)))  # very transparent
    base = Image.alpha_composite(base, bg)

    # 边框
    border = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(border)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r,
                        outline=p["border_outer"], width=2)
    d.rounded_rectangle([1, 1, w - 2, h - 2], radius=max(0, r - 1),
                        outline=p["border_inner"], width=1)
    base = Image.alpha_composite(base, border)

    return add_outer_padding(base)


def render_slot(w, h, radius=8, palette=None):
    """生成槽位边框（装备/技能槽，中心透明）。"""
    p = palette or DEFAULT_PALETTE
    r = min(radius, w // 4, h // 4)

    base = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    # 半透明深色底
    bg = Image.new("RGBA", (w, h), (40, 35, 25, 40))
    bg_mask = make_rounded_mask((w, h), r)
    bg.putalpha(bg_mask)
    base = Image.alpha_composite(base, bg)

    # 边框
    border = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(border)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r,
                        outline=p["border_outer"], width=2)
    base = Image.alpha_composite(base, border)

    return add_outer_padding(base)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Main entry point
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STYLE_CONFIG = {
    "btn": {"min_w": 128, "min_h": 48, "render": render_btn},
    "card": {"min_w": 160, "min_h": 64, "render": render_card},
    "panel": {"min_w": 128, "min_h": 48, "render": render_panel},
    "input": {"min_w": 128, "min_h": 32, "render": render_input},
    "slot": {"min_w": 48, "min_h": 48, "render": render_slot},
}


def generate_ui(width=240, height=80, radius=None, style="btn",
                output="output.png", no_leaves=False, no_gems=False,
                selected=False, locked=False, seed=20260709):
    """Generate a UI component texture.

    Args:
        width, height: Target size (without transparent padding).
        radius: Corner radius. Auto-calculated if None.
        style: One of btn/card/panel/input/slot.
        output: Output PNG path.
        no_leaves: Skip leaf decorations.
        no_gems: Skip gem decorations.
        selected: Draw selected/highlighted state.
        locked: Draw locked/unavailable state (panel/card only).
        seed: Random seed for reproducibility.
    """
    if seed is not None:
        random.seed(seed)

    cfg = STYLE_CONFIG.get(style)
    if not cfg:
        raise ValueError(f"Unknown style: {style}. Must be one of {list(STYLE_CONFIG.keys())}")

    w = max(width, cfg["min_w"])
    h = max(height, cfg["min_h"])

    if radius is None:
        radius = max(8, min(w, h) // 8)

    render_fn = cfg["render"]
    if style == "panel":
        img = render_fn(w, h, radius=radius, leaves=not no_leaves,
                        gems=not no_gems, selected=selected, locked=locked)
    else:
        img = render_fn(w, h, radius=radius, leaves=not no_leaves,
                        gems=not no_gems, selected=selected)

    output_dir = os.path.dirname(os.path.abspath(output))
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    img.save(output, "PNG")
    return output


def main():
    parser = argparse.ArgumentParser(
        description="UI Kit Generator - procedural UI component textures")
    parser.add_argument("--width", type=int, default=240, help="Target width")
    parser.add_argument("--height", type=int, default=80, help="Target height")
    parser.add_argument("--radius", type=int, default=None, help="Corner radius (auto if omitted)")
    parser.add_argument("--style", type=str, default="btn",
                        choices=list(STYLE_CONFIG.keys()),
                        help="UI component style")
    parser.add_argument("--output", type=str, default="output.png", help="Output PNG path")
    parser.add_argument("--no-leaves", action="store_true", help="Skip leaf decorations")
    parser.add_argument("--no-gems", action="store_true", help="Skip gem decorations")
    parser.add_argument("--selected", action="store_true", help="Selected/highlighted state")
    parser.add_argument("--locked", action="store_true", help="Locked/unavailable state (panel/card only)")
    parser.add_argument("--seed", type=int, default=20260709, help="Random seed")
    args = parser.parse_args()

    path = generate_ui(
        width=args.width, height=args.height, radius=args.radius,
        style=args.style, output=args.output,
        no_leaves=args.no_leaves, no_gems=args.no_gems,
        selected=args.selected, locked=args.locked, seed=args.seed,
    )
    print(f"Generated [{args.style}] {args.width}x{args.height} -> {path}")


if __name__ == "__main__":
    main()
