# -*- coding: utf-8 -*-
"""runtime_replace art asset generation tool.
Reads the production list from textures_audit_manifest.csv + prompts.json.
Generation must specify a category unless --all is passed explicitly.
Each batch writes batch_report.csv + contact sheet for manual review.

Usage:
  # Set the API key first.
  PowerShell: $env:AGNES_API_KEY="sk-xxx"

  python gen_missing_179.py --full-rebuild-all --category=effects --dry-run
  python gen_missing_179.py --full-rebuild-all --category=effects
  python gen_missing_179.py --full-rebuild-all --category=ui
  python gen_missing_179.py --only=effects/relics/fx_relic_time_hourglass.png
  python gen_missing_179.py --test=5         # Generate a small 5-file test batch.
  python gen_missing_179.py --full-rebuild-all --all --dry-run  # Check the full list only.
  python gen_missing_179.py --full-rebuild-all --all            # Explicit full rebuild. Use carefully.
  python gen_missing_179.py contact p0       # Build the P0 contact sheet.
"""
import os, sys, csv, json, math, time, hashlib, random
from PIL import Image, ImageDraw, ImageFilter
from collections import defaultdict

# ======== Paths ========
SPEC_CSV    = r"E:\game\回到地面\art_source\runtime_replace_recovery\runtime_replace_missing_production_spec.csv"
MANIFEST_CSV = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"
REPLACE_DIR = r"E:\game\回到地面\art_source\textures_export\runtime_replace"
REPORT_DIR  = r"E:\game\回到地面\art_source\textures_review"
RAW_DIR     = r"E:\game\回到地面\art_source\textures_review\raw"
MASTER_DIR  = r"E:\game\回到地面\art_source\textures_review\master"
RUNTIME_CANDIDATE_DIR = r"E:\game\回到地面\art_source\textures_review\runtime_candidates"
PROGRESS    = r"E:\game\.workbuddy\gen_missing_progress.json"

AGNES_URL = "https://apihub.agnes-ai.com/v1/images/generations"
NT = "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND."
STYLE_ANCHOR = (
    "STYLE: bright colorful cartoon animal game art, playful mobile game adventure look, "
    "clean high-resolution rounded shapes, friendly animal forms, saturated colors, soft highlights, "
    "readable silhouettes, consistent with existing cute cartoon animal assets."
)
DETAIL_ANCHORS = {
    "bosses": (
        "DETAIL: full-body cartoon boss sprite, large readable silhouette, simple exaggerated shapes, "
        "clear head-body-limb separation, bright material colors, 12 percent transparent margin, "
        "same design language as friendly arcade adventure enemies."
    ),
    "monsters": (
        "DETAIL: small full-body cartoon enemy sprite, readable at 128px, simple pose, "
        "one creature only, chunky outline, clear attack-facing silhouette, friendly arcade adventure proportions."
    ),
    "effects": (
        "DETAIL: clean cartoon animal VFX, bold center shape per frame, simple particle clusters, "
        "limited color count, high readability over gameplay, no gritty smoke texture."
    ),
    "icons": (
        "DETAIL: standalone cartoon item icon, one object only, thick outline, simple inner highlights, "
        "recognizable at 64px, centered with transparent margin, no badge label."
    ),
    "tiles": (
        "DETAIL: tiny 32px top-down gameplay tile, readable material pattern, tileable edges, "
        "simple clean cartoon material patches, consistent color family per region."
    ),
    "ui": (
        "DETAIL: reusable cartoon animal UI piece, clean beveled shape, soft highlight, simple border, "
        "empty content area where needed, consistent blue-gray violet gold adventure UI palette."
    ),
}
APPROVAL_SAFE = (
    "APPROVAL-SAFE MOBILE GAME ART: non-graphic fantasy symbols only, "
    "no blood, no gore, no splatter, no dripping liquid, no organs, no realistic heart, "
    "no impalement, no wound, no corpse, no severed body parts, no skull, no horror face."
)
MAX_RETRIES = 3
RETRY_DELAY = 3  # seconds between retries
EFFECTS_WARNING_KB = 80
EFFECTS_HARD_LIMIT_KB = 128
BOSS_HARD_LIMIT_KB = 256  # finalboss 256x256(~150KB) / 256x1024 sprite sheet(~444KB) / miniboss 192x192(~40KB)
BACKGROUND_WARNING_KB = 166
BACKGROUND_HARD_LIMIT_KB = 500  # runtime PNG gate; master is preserved when this is exceeded
ICON_WARNING_KB = 16   # Icon warning line.
ICON_HARD_LIMIT_KB = 32  # Icon hard limit. Transparent 64x64-128x128 PNGs need some room.
MONSTER_HARD_LIMIT_KB = 64  # 128x128 monster (~20-40KB), allow up to 64KB
CHARACTER_HARD_LIMIT_KB = 512
UI_DEFAULT_HARD_FLOOR_KB = 24
UI_SLOT_HARD_FLOOR_KB = 20
UI_PANEL_HARD_FLOOR_KB = 256
OK_STATUSES = {"generated", "exported_runtime", "skipped", "size_warning"}
MATTE_CATEGORIES = {"icons", "ui", "monsters", "bosses", "characters"}
TRANSPARENCY_REQUIRED_CATEGORIES = {"effects", "icons", "ui", "monsters", "bosses", "characters"}
SEGMENTATION_BACKGROUND = (
    "plain flat light neutral off-white background (#f2f2ee) for subject segmentation, "
    "background is not part of the asset and must stay fully outside the subject silhouette"
)
TRANSPARENT_SUBJECT_CONTRACT = (
    "POSTPROCESS CONTRACT: draw only the asset subject; do not draw aura plates, cards, badges, "
    "shield backplates, colored blobs, scenery, floor shadows, or decorative background patches. "
    "The script will remove the plain neutral background and keep the subject only."
)
MIN_TRANSPARENT_RATIO_BY_CATEGORY = {
    "icons": 0.20,
    "ui": 0.02,
    "monsters": 0.08,
    "bosses": 0.05,
    "characters": 0.08,
}
INITIAL_PALETTE_COLORS = {
    "effects": 32,
    "icons": 64,
    "ui": 64,
    "monsters": 64,
    "characters": 128,
    "bosses": 128,
}
PALETTE_RETRY_STEPS = {
    "effects": (32, 24, 18, 14, 10),
    "icons": (64, 48, 32, 24, 16),
    "ui": (64, 48, 32, 24, 16),
    "monsters": (64, 48, 32),
    "characters": (128, 96, 64),
    "bosses": (128, 96, 64),
}

# These files were previously generated with opaque/checkerboard-like backgrounds.
# They are not part of the 179 missing list, so they are opt-in via
# --include-rework-effects. This keeps the default missing-resource flow safe.
REWORK_EFFECT_PATHS = {
    "effects/combat/fx_crit.png",
    "effects/combat/fx_dash.png",
    "effects/combat/fx_heal.png",
    "effects/combat/fx_hit_normal.png",
    "effects/combat/fx_shield.png",
}

# These generated UI upgrade icons are visually unsafe for WeChat mini-game review
# despite passing technical checks. Rework them with symbolic, non-graphic prompts.
REWORK_SAFETY_PATHS = {
    "ui/common/btn_default.png",
    "ui/common/btn_hover.png",
    "ui/common/btn_active.png",
    "ui/map/icon_room_boss.png",
    "ui/upgrade/icon_upgrade_berserkerpact.png",
    "ui/upgrade/icon_ability_lifestealaura.png",
    "ui/splash/splash_bg.png",
    "ui/hud/hud_cdmask.png",
    "ui/hud/hud_rollbtn.png",
    "ui/hud/hud_skillslot.png",
    "icons/skills/icon_skill_dash.png",
    "icons/skills/icon_skill_elementburst.png",
    "icons/skills/icon_skill_healwave.png",
    "icons/items/icon_item_key.png",
    "icons/relics/icon_relic_frenzyaxe.png",
    "icons/sets/icon_set_frostbite.png",
    "icons/sets/icon_set_fury.png",
    "icons/sets/icon_set_ironwall.png",
    "icons/sets/icon_set_tempest.png",
    "icons/buffs/icon_debuff_slow.png",
    "ui/death/btn_revive_active.png",
    "ui/death/btn_revive_default.png",
    "ui/death/btn_settle_active.png",
    "ui/death/btn_settle_default.png",
    "ui/death/death_bg.png",
    "ui/death/icon_soulstone.png",
    "ui/death/result_panel.png",
    "ui/equipment/equip_body_frame.png",
    "ui/equipment/equip_slot_chest.png",
    "ui/equipment/equip_slot_gloves.png",
    "ui/equipment/equip_slot_helmet.png",
    "ui/equipment/equip_slot_legs.png",
    "ui/equipment/equip_slot_necklace.png",
    "ui/equipment/equip_slot_ring.png",
    "ui/equipment/equip_slot_shoes.png",
    "ui/equipment/equip_slot_weapon.png",
    "ui/equipment/inventory_slot.png",
    "ui/equipment/item_slot.png",
}


def apply_black_matte_alpha(img):
    """Convert a black-background VFX image into RGBA by using luminance as alpha."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            brightness = max(r, g, b)
            if brightness <= 18:
                pixels[x, y] = (r, g, b, 0)
                continue
            alpha = int(min(255, max(0, (brightness - 18) * 255 / 237)))
            pixels[x, y] = (r, g, b, alpha)
    return rgba


def color_distance(a, b):
    return sum((int(a[i]) - int(b[i])) ** 2 for i in range(3)) ** 0.5


def remove_edge_connected_background(img, tolerance=72):
    """Remove icon/UI matte backgrounds by flood-filling from image edges.

    This is safer for icons than black-matte luminance extraction because it only
    removes pixels connected to the outside background, not dark pixels inside
    the icon silhouette.
    """
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    corner_colors = [
        pixels[0, 0][:3],
        pixels[w - 1, 0][:3],
        pixels[0, h - 1][:3],
        pixels[w - 1, h - 1][:3],
    ]

    def is_background(x, y):
        r, g, b, a = pixels[x, y]
        if a == 0:
            return True
        return any(color_distance((r, g, b), c) <= tolerance for c in corner_colors)

    stack = []
    seen = set()
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))

    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or (x, y) in seen:
            continue
        seen.add((x, y))
        if not is_background(x, y):
            continue
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return rgba


def keep_subject_components(img, category):
    """Keep plausible subject components after background removal.

    This is a structural cleanup pass, not a color-key pass. It removes tiny
    disconnected background crumbs while keeping arrows, weapons, and UI parts
    that are large enough to be intentional.
    """
    if category in ("ui", "effects", "backgrounds", "tiles"):
        return img.convert("RGBA")
    rgba = img.convert("RGBA")
    w, h = rgba.size
    alpha = rgba.getchannel("A")
    seen = set()
    components = []

    for y in range(h):
        for x in range(w):
            if (x, y) in seen or alpha.getpixel((x, y)) <= 20:
                continue
            stack = [(x, y)]
            seen.add((x, y))
            pixels = []
            while stack:
                px, py = stack.pop()
                pixels.append((px, py))
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if nx < 0 or ny < 0 or nx >= w or ny >= h or (nx, ny) in seen:
                        continue
                    if alpha.getpixel((nx, ny)) <= 20:
                        continue
                    seen.add((nx, ny))
                    stack.append((nx, ny))
            components.append(pixels)

    if not components:
        return rgba

    components.sort(key=len, reverse=True)
    largest = len(components[0])
    if category == "icons":
        min_keep = max(8, int(largest * 0.08))
    elif category in ("characters", "monsters"):
        min_keep = max(12, int(largest * 0.025))
    else:  # bosses
        min_keep = max(24, int(largest * 0.015))

    keep = set()
    for comp in components:
        if len(comp) >= min_keep:
            keep.update(comp)

    out = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    src = rgba.load()
    dst = out.load()
    for x, y in keep:
        dst[x, y] = src[x, y]
    return out


def remove_chroma_key_pixels(img):
    """Remove remaining chroma matte pixels anywhere in the image.

    Edge flood fill removes connected matte backgrounds, but AI often leaves
    magenta speckles inside decorations. Since prompts explicitly forbid assets
    from using chroma magenta, strict magenta pixels are safe to make transparent.
    """
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            is_magenta = (
                (r >= 210 and b >= 170 and g <= 95 and r > g * 1.8 and b > g * 1.6)
                or (r >= 220 and b >= 120 and g <= 85 and r > g * 2.2 and b > g * 1.5)
            )
            is_green = g >= 180 and r <= 110 and b <= 130 and g > r * 1.6 and g > b * 1.4
            if is_magenta or is_green:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def magenta_residue_ratio(img):
    """Visible chroma-matte residue ratio after cleanup.

    This is intentionally used only for character-like sprites, where magenta
    is forbidden as a real asset color. It catches solid backdrop blobs that
    were generated as part of the subject instead of transparent background.
    """
    rgba = img.convert("RGBA")
    visible = 0
    residue = 0
    for r, g, b, a in rgba.getdata():
        if a <= 20:
            continue
        visible += 1
        if r >= 145 and b >= 85 and g <= 130 and r > g * 1.25 and b > g * 0.8:
            residue += 1
    return residue / max(1, visible)


def magenta_residue_limit(category):
    # Current prompts use neutral off-white segmentation backgrounds, not chroma
    # magenta. Purple/violet is valid subject color for abyss monsters, bosses,
    # relics, and UI accents, so chroma-era residue ratios must not gate output.
    return 0.0


def magenta_frame_residue_error(img, item):
    """Catch one bad frame in a vertical sprite sheet.

    Full-sheet ratios can hide a single generated magenta/purple backdrop blob.
    A higher per-frame threshold avoids rejecting normal pink ear highlights.
    """
    # Disabled for the neutral-background pipeline. See magenta_residue_limit().
    return ""


def fit_rgba_to_canvas(img, target_w, target_h, margin_ratio=0.06):
    """Fit a transparent sprite onto a target canvas without aspect distortion."""
    rgba = img.convert("RGBA")
    bbox = rgba.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    cropped = rgba.crop(bbox)
    margin_x = max(0, int(target_w * margin_ratio))
    margin_y = max(0, int(target_h * margin_ratio))
    max_w = max(1, target_w - margin_x * 2)
    max_h = max(1, target_h - margin_y * 2)
    scale = min(max_w / cropped.width, max_h / cropped.height)
    new_w = max(1, int(round(cropped.width * scale)))
    new_h = max(1, int(round(cropped.height * scale)))
    resample = Image.Resampling.LANCZOS if scale < 1 else Image.Resampling.NEAREST
    fitted = cropped.resize((new_w, new_h), resample)
    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    canvas.alpha_composite(fitted, ((target_w - new_w) // 2, (target_h - new_h) // 2))
    return canvas


def quantize_preserve_alpha(img, colors):
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A")
    rgb = rgba.convert("RGB").quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def sharpen_for_category(img, category):
    """Apply gentle sharpening after downscale to keep generated assets readable."""
    if category in ("backgrounds", "tiles", "effects"):
        return img
    if category in ("ui", "icons"):
        return img.filter(ImageFilter.UnsharpMask(radius=0.7, percent=90, threshold=2))
    if category in ("characters", "bosses", "monsters"):
        return img.filter(ImageFilter.UnsharpMask(radius=0.8, percent=70, threshold=3))
    return img


def postprocess_sprite_like(img, category, target_w, target_h, tolerance=72, margin_ratio=0.08):
    img = remove_edge_connected_background(img, tolerance=tolerance)
    img = keep_subject_components(img, category)
    img = fit_rgba_to_canvas(img, target_w, target_h, margin_ratio=margin_ratio)
    img = sharpen_for_category(img, category)
    return img


def build_tile_source_prompt(prompt):
    """Ask the image model for a large texture source, not a final tiny icon."""
    return (
        prompt
        + " TILE SOURCE GENERATION MODE: create a large seamless terrain texture source, not a 32x32 icon. "
        "Uniform repeating ground material only, no central glowing dot, no center composition, no single gem, "
        "no crystal core, no flame, no torch, no lamp, no orb, no jewel, no item, no badge, no frame, no border, "
        "no vignette, no spotlight, no vertical object, no repeated object stamp. "
        "The texture must look acceptable when cropped anywhere and repeated in a grid."
    )


def _rgb_brightness(px):
    return (px[0] + px[1] + px[2]) / 3.0


def _edge_distance_rgb(img):
    rgb = img.convert("RGB")
    w, h = rgb.size
    if w < 2 or h < 2:
        return 0.0
    total = 0.0
    count = 0
    for y in range(h):
        a = rgb.getpixel((0, y))
        b = rgb.getpixel((w - 1, y))
        total += sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5
        count += 1
    for x in range(w):
        a = rgb.getpixel((x, 0))
        b = rgb.getpixel((x, h - 1))
        total += sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5
        count += 1
    return total / max(1, count)


def _center_focal_score_rgb(img):
    rgb = img.convert("RGB")
    w, h = rgb.size
    all_b = [_rgb_brightness(px) for px in rgb.getdata()]
    mean = sum(all_b) / max(1, len(all_b))
    x0, x1 = int(w * 0.34), int(w * 0.66)
    y0, y1 = int(h * 0.34), int(h * 0.66)
    center = [_rgb_brightness(rgb.getpixel((x, y))) for y in range(y0, y1) for x in range(x0, x1)]
    center_mean = sum(center) / max(1, len(center))
    return abs(center_mean - mean)


def _hotspot_score_rgb(img):
    """Detect small bright/saturated objects such as gems, flames, lamps or cores."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    pixels = list(rgb.getdata())
    mean_b = sum(_rgb_brightness(px) for px in pixels) / max(1, len(pixels))
    hot = set()
    for y in range(h):
        for x in range(w):
            px = rgb.getpixel((x, y))
            brightness = _rgb_brightness(px)
            colorfulness = max(px) - min(px)
            # Tiny terrain can contain highlights, but a bright colorful blob is usually an icon-like object.
            if (brightness > mean_b + 42 and colorfulness > 45) or (brightness > 175 and colorfulness > 35):
                hot.add((x, y))
    if not hot:
        return 0.0
    seen = set()
    max_component = 0
    component_count = 0
    for start in list(hot):
        if start in seen:
            continue
        component_count += 1
        stack = [start]
        seen.add(start)
        size = 0
        while stack:
            x, y = stack.pop()
            size += 1
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if (nx, ny) in hot and (nx, ny) not in seen:
                    seen.add((nx, ny))
                    stack.append((nx, ny))
        max_component = max(max_component, size)
    hot_ratio = len(hot) / max(1, w * h)
    return max_component + hot_ratio * 40 + max(0, component_count - 4) * 1.5


def _soften_tile_edges(img):
    """Make opposite edges closer without changing the whole tile into a blur."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    band = 2 if min(w, h) >= 32 else 1
    for y in range(h):
        for i in range(band):
            l = px[i, y]
            r = px[w - 1 - i, y]
            avg = tuple(int((l[c] + r[c]) / 2) for c in range(3))
            px[i, y] = avg
            px[w - 1 - i, y] = avg
    for x in range(w):
        for i in range(band):
            t = px[x, i]
            b = px[x, h - 1 - i]
            avg = tuple(int((t[c] + b[c]) / 2) for c in range(3))
            px[x, i] = avg
            px[x, h - 1 - i] = avg
    return rgb


def _tile_candidate_score(img):
    return _center_focal_score_rgb(img) * 2.5 + _edge_distance_rgb(img) + _hotspot_score_rgb(img) * 4.0


def process_tile_texture(raw_img, target_w, target_h):
    """Build a 32x32 terrain tile from a larger AI texture source.

    The model often makes tiny tiles look like icons. This samples many crops
    from the large source and keeps the least focal, most edge-compatible one.
    Returns (master_128, runtime_32, metrics).
    """
    src = raw_img.convert("RGB")
    w, h = src.size
    side_max = min(w, h)
    candidates = []
    crop_sizes = [side_max, int(side_max * 0.875), int(side_max * 0.75), int(side_max * 0.625), int(side_max * 0.5)]
    for size in sorted({max(64, s) for s in crop_sizes}, reverse=True):
        if size > side_max:
            continue
        max_x = w - size
        max_y = h - size
        xs = sorted({0, max_x // 4, max_x // 2, (max_x * 3) // 4, max_x})
        ys = sorted({0, max_y // 4, max_y // 2, (max_y * 3) // 4, max_y})
        for y in ys:
            for x in xs:
                crop = src.crop((x, y, x + size, y + size))
                master = crop.resize((128, 128), Image.Resampling.LANCZOS)
                runtime = crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
                runtime = _soften_tile_edges(runtime)
                candidates.append((runtime, master, _tile_candidate_score(runtime)))
    if not candidates:
        runtime = src.resize((target_w, target_h), Image.Resampling.LANCZOS)
        runtime = _soften_tile_edges(runtime)
        master = src.resize((128, 128), Image.Resampling.LANCZOS)
        candidates.append((runtime, master, _tile_candidate_score(runtime)))
    runtime, master, score = min(candidates, key=lambda item: item[2])
    runtime = runtime.filter(ImageFilter.UnsharpMask(radius=0.5, percent=80, threshold=3)).convert("RGB")
    metrics = {
        "tile_score": round(score, 2),
        "tile_center_score": round(_center_focal_score_rgb(runtime), 2),
        "tile_edge_distance": round(_edge_distance_rgb(runtime), 2),
        "tile_hotspot_score": round(_hotspot_score_rgb(runtime), 2),
    }
    return master.convert("RGB"), runtime, metrics


def save_tile_repeat_preview(img, item, scale=8, repeats=5):
    preview_path = ensure_safe_aux_path(
        os.path.join(REPORT_DIR, "tile_repeat_previews"),
        item["path"],
    )
    os.makedirs(os.path.dirname(preview_path), exist_ok=True)
    tile = img.convert("RGB").resize((img.width * scale, img.height * scale), Image.Resampling.LANCZOS)
    preview = Image.new("RGB", (tile.width * repeats, tile.height * repeats))
    for y in range(repeats):
        for x in range(repeats):
            preview.paste(tile, (x * tile.width, y * tile.height))
    preview.save(preview_path, format="PNG", optimize=True)
    return preview_path


def _clamp_color(color):
    return tuple(max(0, min(255, int(v))) for v in color)


def _mix_color(a, b, t):
    return _clamp_color(a[i] * (1 - t) + b[i] * t for i in range(3))


def _jitter_color(color, amount, rng):
    return _clamp_color(v + rng.randint(-amount, amount) for v in color)


def _tile_seed(path):
    return int(hashlib.sha256(path.encode("utf-8")).hexdigest()[:16], 16)


def procedural_tile_palette(zone):
    palettes = {
        "abyss": {
            "base": (50, 42, 94), "dark": (31, 27, 62), "light": (75, 64, 128),
            "accent": (67, 82, 150), "hazard": (92, 62, 132),
        },
        "catacombs": {
            "base": (95, 91, 82), "dark": (63, 61, 57), "light": (126, 119, 104),
            "accent": (83, 104, 79), "hazard": (116, 105, 86),
        },
        "forest": {
            "base": (61, 104, 59), "dark": (39, 70, 42), "light": (91, 132, 69),
            "accent": (93, 77, 49), "hazard": (75, 112, 54),
        },
        "swamp": {
            "base": (65, 84, 55), "dark": (42, 56, 45), "light": (91, 108, 67),
            "accent": (70, 105, 82), "hazard": (77, 116, 63),
        },
        "tundra": {
            "base": (148, 172, 184), "dark": (121, 145, 160), "light": (169, 190, 200),
            "accent": (132, 164, 184), "hazard": (118, 154, 176),
        },
        "volcano": {
            "base": (67, 58, 55), "dark": (38, 35, 35), "light": (98, 84, 74),
            "accent": (130, 74, 44), "hazard": (142, 82, 45),
        },
    }
    return palettes.get(zone, palettes["catacombs"])


def parse_tile_zone_type(path):
    parts = path.replace("\\", "/").split("/")
    zone = parts[1] if len(parts) > 1 else "catacombs"
    name = parts[-1].removesuffix(".png")
    tile_type = name.split("_")[-1]
    return zone, tile_type


def generate_procedural_tile(item):
    """Deterministic no-AI tile generator.

    Tiles are ground materials, not standalone art objects. This avoids AI
    center-composition failures such as gems, flames, badges, and framed icons.
    The master is drawn at 128px in a clean cartoon material style, then
    downsampled to the runtime tile size so it does not read as blocky pixel art.
    """
    path = item["path"].replace("\\", "/")
    zone, tile_type = parse_tile_zone_type(path)
    pal = procedural_tile_palette(zone)
    rng = random.Random(_tile_seed(path))
    is_tundra = zone == "tundra"
    size = int(item.get("final_target_w") or 32)
    size = max(16, size)
    master_size = max(128, size * 4)
    img = Image.new("RGB", (master_size, master_size), pal["base"])
    px = img.load()
    draw = ImageDraw.Draw(img)

    def scale(v):
        return max(1, int(round(v * master_size / 32)))

    def draw_wrapped_ellipse(box, fill):
        x0, y0, x1, y1 = box
        for ox in (-master_size, 0, master_size):
            for oy in (-master_size, 0, master_size):
                draw.ellipse((x0 + ox, y0 + oy, x1 + ox, y1 + oy), fill=fill)

    def draw_wrapped_line(points, fill, width=1):
        for ox in (-master_size, 0, master_size):
            for oy in (-master_size, 0, master_size):
                shifted = [(x + ox, y + oy) for x, y in points]
                draw.line(shifted, fill=fill, width=width, joint="curve")

    def draw_wrapped_polygon(points, fill):
        for ox in (-master_size, 0, master_size):
            for oy in (-master_size, 0, master_size):
                shifted = [(x + ox, y + oy) for x, y in points]
                draw.polygon(shifted, fill=fill)

    # Low-contrast toroidal cartoon material base.
    for y in range(master_size):
        for x in range(master_size):
            wave = (
                math.sin((x / master_size) * math.tau * 2)
                + math.sin((y / master_size) * math.tau * 2)
                + math.sin(((x + y) / master_size) * math.tau)
            ) / 3.0
            wave_strength = 0.08 if is_tundra else 0.14
            t = 0.5 + wave * wave_strength
            if tile_type == "wall":
                t -= 0.12
            elif tile_type == "highground":
                t += 0.08
            base = _mix_color(pal["dark"], pal["light"], max(0.0, min(1.0, t)))
            px[x, y] = _jitter_color(base, 1 if is_tundra else 2, rng)

    # Distributed rounded cartoon material patches, never a single center object.
    flecks = 18 if tile_type in ("floor", "highground") else 14
    if tile_type == "wall":
        flecks = 24
    if is_tundra:
        flecks = 10 if tile_type in ("floor", "highground") else 8
        if tile_type == "wall":
            flecks = 16
    for _ in range(flecks):
        x = rng.randrange(master_size)
        y = rng.randrange(master_size)
        fleck_choices = [pal["dark"], pal["base"], pal["accent"]] if is_tundra else [pal["dark"], pal["light"], pal["accent"]]
        color = _jitter_color(rng.choice(fleck_choices), 2 if is_tundra else 5, rng)
        rx = scale(rng.choice([2, 2, 3, 4]))
        ry = scale(rng.choice([1, 2, 2, 3]))
        draw_wrapped_ellipse((x - rx, y - ry, x + rx, y + ry), color)

    # Fine distributed soft seams and material lines.
    crack_count = 4 if tile_type != "thorn" else 2
    if tile_type == "wall":
        crack_count = 7
    if is_tundra:
        crack_count = 2 if tile_type != "wall" else 3
    for _ in range(crack_count):
        x = rng.randrange(master_size)
        y = rng.randrange(master_size)
        steps = rng.randint(4, 9)
        color = _jitter_color(_mix_color(pal["dark"], pal["base"], 0.35), 2 if is_tundra else 4, rng)
        points = []
        for _step in range(steps):
            points.append((x, y))
            if rng.random() < 0.55:
                x += rng.choice([-1, 1]) * scale(1)
            else:
                y += rng.choice([-1, 1]) * scale(1)
        draw_wrapped_line(points, color, width=scale(1))

    if tile_type == "thorn":
        # Small repeated rounded hazard tufts, muted and distributed.
        for _ in range(7):
            x = rng.randrange(master_size)
            y = rng.randrange(master_size)
            color = _jitter_color(pal["hazard"], 2 if is_tundra else 5, rng)
            r = scale(rng.choice([2, 3]))
            draw_wrapped_polygon([(x, y - r), (x - r, y + r), (x + r, y + r)], color)
            draw_wrapped_ellipse((x - r, y + r // 2, x + r, y + r * 2), _mix_color(color, pal["dark"], 0.25))

    if tile_type == "wall":
        # Rounded rock patches without an outline frame.
        for _ in range(9):
            x = rng.randrange(master_size)
            y = rng.randrange(master_size)
            rx = scale(rng.randint(3, 6))
            ry = scale(rng.randint(2, 5))
            color = _jitter_color(rng.choice([pal["dark"], pal["base"], pal["light"]]), 4, rng)
            draw_wrapped_ellipse((x - rx, y - ry, x + rx, y + ry), color)

    if tile_type == "highground" and not is_tundra:
        # Subtle material planes, not a border.
        for _ in range(5):
            y = rng.randrange(master_size)
            color = _mix_color(pal["light"], pal["base"], 0.5)
            draw_wrapped_line(
                [(0, y), (master_size // 3, y + scale(rng.choice([-1, 0, 1]))), (master_size, y + scale(rng.choice([-1, 0, 1])))],
                color,
                width=scale(1),
            )

    # Make opposite edges compatible and remove any accidental hot spot.
    if is_tundra:
        img = img.filter(ImageFilter.MedianFilter(size=3))
    img = _soften_tile_edges(img)
    if _hotspot_score_rgb(img) > 10:
        img = img.filter(ImageFilter.MedianFilter(size=3))
        img = _soften_tile_edges(img)

    master = img.resize((128, 128), Image.Resampling.LANCZOS).filter(
        ImageFilter.UnsharpMask(radius=0.6, percent=70, threshold=3)
    )
    runtime = master.resize((size, size), Image.Resampling.LANCZOS).filter(
        ImageFilter.UnsharpMask(radius=0.4, percent=60, threshold=3)
    )
    runtime = _soften_tile_edges(runtime)
    metrics = {
        "tile_score": round(_tile_candidate_score(runtime), 2),
        "tile_center_score": round(_center_focal_score_rgb(runtime), 2),
        "tile_edge_distance": round(_edge_distance_rgb(runtime), 2),
        "tile_hotspot_score": round(_hotspot_score_rgb(runtime), 2),
        "tile_source": "procedural_cartoon_material",
    }
    return master.convert("RGB"), runtime.convert("RGB"), metrics


def _effect_rng(path):
    seed = int(hashlib.sha1(path.encode("utf-8")).hexdigest()[:8], 16)
    return random.Random(seed)


def _effect_colors(name):
    palettes = {
        "burn": [(255, 120, 24, 255), (255, 210, 72, 255), (220, 54, 32, 255)],
        "melt": [(255, 128, 24, 255), (255, 220, 80, 255), (220, 60, 30, 255)],
        "flame": [(255, 130, 20, 255), (255, 215, 70, 255), (230, 70, 36, 255)],
        "freeze": [(125, 230, 255, 255), (225, 255, 255, 255), (80, 155, 255, 255)],
        "frost": [(125, 230, 255, 255), (225, 255, 255, 255), (95, 170, 255, 255)],
        "conduct": [(95, 220, 255, 255), (255, 245, 110, 255), (40, 120, 255, 255)],
        "overload": [(255, 90, 230, 255), (255, 245, 130, 255), (120, 70, 255, 255)],
        "radiance": [(255, 235, 95, 255), (255, 255, 210, 255), (255, 175, 55, 255)],
        "heal": [(95, 235, 125, 255), (255, 235, 90, 255), (185, 255, 190, 255)],
        "life": [(95, 235, 125, 255), (255, 235, 90, 255), (185, 255, 190, 255)],
        "shield": [(100, 225, 255, 255), (215, 250, 255, 255), (70, 125, 255, 255)],
        "void": [(155, 80, 255, 255), (80, 175, 255, 255), (225, 170, 255, 255)],
        "gravity": [(130, 75, 255, 255), (85, 180, 255, 255), (225, 170, 255, 255)],
        "shadow": [(155, 80, 255, 255), (85, 55, 180, 255), (230, 170, 255, 255)],
        "decay": [(155, 175, 65, 255), (225, 215, 95, 255), (95, 115, 55, 255)],
        "corrode": [(140, 245, 80, 255), (235, 255, 80, 255), (95, 170, 70, 255)],
        "shatter": [(190, 245, 255, 255), (255, 255, 255, 255), (100, 170, 255, 255)],
        "vaporize": [(235, 245, 255, 245), (180, 220, 255, 230), (255, 255, 255, 255)],
        "time": [(255, 218, 80, 255), (255, 245, 180, 255), (230, 165, 45, 255)],
        "dodge": [(145, 245, 255, 255), (255, 255, 255, 255), (75, 170, 255, 255)],
        "dash": [(110, 235, 255, 255), (255, 255, 255, 255), (70, 140, 255, 255)],
        "crit": [(255, 238, 85, 255), (255, 255, 255, 255), (255, 95, 55, 255)],
        "hit": [(255, 230, 75, 255), (255, 255, 255, 255), (255, 145, 55, 255)],
        "blink": [(115, 220, 255, 255), (255, 255, 255, 255), (120, 120, 255, 255)],
        "decoy": [(165, 245, 185, 245), (235, 255, 235, 245), (100, 205, 160, 235)],
        "glow": [(110, 220, 255, 235), (255, 255, 255, 245), (255, 230, 120, 235)],
        "loading": [(110, 220, 255, 255), (255, 255, 255, 255), (60, 145, 255, 255)],
    }
    for key, colors in palettes.items():
        if key in name:
            return colors
    return [(120, 220, 255, 255), (255, 255, 255, 255), (255, 220, 90, 255)]


def _draw_centered_ring(draw, cx, cy, r, color, width=6, bbox_scale_y=1.0):
    box = [cx - r, cy - int(r * bbox_scale_y), cx + r, cy + int(r * bbox_scale_y)]
    draw.ellipse(box, outline=color, width=width)


def _draw_starburst(draw, cx, cy, radius, color, width=5, rays=10, start=0.0):
    for i in range(rays):
        a = start + (math.pi * 2 * i / rays)
        inner = radius * 0.30
        draw.line(
            (
                cx + math.cos(a) * inner,
                cy + math.sin(a) * inner,
                cx + math.cos(a) * radius,
                cy + math.sin(a) * radius,
            ),
            fill=color,
            width=width,
        )


def _draw_lightning(draw, rng, cx, cy, spread, color, width=5):
    for branch in range(4):
        x = cx + rng.randint(-spread // 3, spread // 3)
        y = cy - spread // 2
        points = [(x, y)]
        for _ in range(5):
            y += spread // 5
            x += rng.randint(-18, 18)
            points.append((x, y))
        draw.line(points, fill=color, width=width, joint="curve")
        if branch % 2 == 0:
            bx, by = points[rng.randint(1, len(points) - 2)]
            draw.line((bx, by, bx + rng.choice((-1, 1)) * rng.randint(18, 32), by + rng.randint(8, 22)), fill=color, width=max(2, width - 2))


def _draw_polygon_shards(draw, rng, cx, cy, spread, color):
    for _ in range(10):
        a = rng.random() * math.pi * 2
        dist = rng.randint(spread // 4, spread)
        x = cx + int(math.cos(a) * dist)
        y = cy + int(math.sin(a) * dist)
        s = rng.randint(5, 12)
        draw.polygon([(x, y - s), (x + s, y + s // 2), (x - s, y + s)], fill=color)


def _draw_clean_effect_frame(draw, name, frame_index, frame_count, box, rng):
    x0, y0, x1, y1 = box
    fw, fh = x1 - x0, y1 - y0
    cx, cy = x0 + fw // 2, y0 + fh // 2
    t = (frame_index + 1) / max(1, frame_count)
    colors = _effect_colors(name)
    c0, c1, c2 = colors
    r = int(22 + t * min(fw, fh) * 0.34)
    thick = max(4, int(fw * 0.035))

    if any(k in name for k in ("burn", "flame", "melt")):
        for i in range(3):
            rr = r - i * 14
            if rr > 10:
                _draw_centered_ring(draw, cx, cy, rr, colors[i % 3], thick + 1)
        if "melt" in name or "flame" in name:
            for i in range(5):
                px = cx + rng.randint(-45, 45)
                top = cy - rng.randint(10, 55)
                draw.polygon([(px, top), (px + 10, top + 32), (px, top + 54), (px - 10, top + 32)], fill=colors[i % 3])
    elif any(k in name for k in ("conduct", "lightning")):
        _draw_lightning(draw, rng, cx, cy, int(70 + 30 * t), c0, thick)
        _draw_lightning(draw, rng, cx, cy, int(50 + 24 * t), c1, max(2, thick - 2))
    elif any(k in name for k in ("freeze", "frost", "shatter")):
        if "shatter" in name:
            _draw_polygon_shards(draw, rng, cx, cy, int(35 + 50 * t), c0)
            _draw_polygon_shards(draw, rng, cx, cy, int(25 + 40 * t), c1)
        else:
            _draw_starburst(draw, cx, cy, r, c0, thick, rays=6, start=math.pi / 6)
            _draw_starburst(draw, cx, cy, max(12, r - 18), c1, max(2, thick - 2), rays=6)
            _draw_centered_ring(draw, cx, cy, max(14, r - 28), c2, max(2, thick - 1))
    elif "shield" in name:
        for row in range(-2, 3):
            for col in range(-2, 3):
                px = cx + col * 25 + (row % 2) * 12
                py = cy + row * 22
                s = 11
                pts = [(px, py - s), (px + s, py - s // 2), (px + s, py + s // 2), (px, py + s), (px - s, py + s // 2), (px - s, py - s // 2)]
                draw.line(pts + [pts[0]], fill=c0, width=3)
        _draw_centered_ring(draw, cx, cy, r, c1, thick)
    elif any(k in name for k in ("void", "gravity", "time", "dodge", "loading")):
        for i in range(3):
            rr = max(12, r - i * 18)
            if "loading" in name:
                start = int((frame_index * 90 + i * 22) % 360)
                draw.arc([cx - rr, cy - rr, cx + rr, cy + rr], start=start, end=start + 210, fill=colors[i % 3], width=thick + 2)
            else:
                _draw_centered_ring(draw, cx, cy, rr, colors[i % 3], thick, 0.62 if "gravity" in name else 1.0)
        if "time" in name:
            _draw_starburst(draw, cx, cy, r + 8, c2, 2, rays=12)
    elif any(k in name for k in ("crit", "overload", "radiance", "hit")):
        rays = 12 if "crit" in name or "radiance" in name else 9
        _draw_starburst(draw, cx, cy, r + 8, c0, thick + 2, rays=rays)
        _draw_starburst(draw, cx, cy, max(20, r - 18), c1, max(2, thick - 1), rays=rays, start=math.pi / rays)
        if "hit" in name:
            _draw_centered_ring(draw, cx, cy, max(18, r - 22), c2, thick)
    elif any(k in name for k in ("heal", "life", "blink", "corrode", "decoy", "vaporize")):
        for i in range(18):
            a = rng.random() * math.pi * 2
            dist = rng.randint(8, max(12, r))
            px = cx + int(math.cos(a) * dist)
            py = cy + int(math.sin(a) * dist) - (18 if "heal" in name or "life" in name else 0)
            s = rng.randint(4, 10)
            draw.ellipse([px - s, py - s, px + s, py + s], fill=colors[i % 3])
        if "blink" in name:
            _draw_centered_ring(draw, cx, cy, r, c0, thick)
    elif "dash" in name or "shadow" in name:
        for i in range(5):
            yy = cy - 42 + i * 20
            draw.line((cx - 62, yy + int(t * 18), cx + 48, yy - int(t * 18)), fill=colors[i % 3], width=thick + 2)
    else:
        _draw_centered_ring(draw, cx, cy, r, c0, thick)
        _draw_starburst(draw, cx, cy, r, c1, max(2, thick - 1), rays=8)


def generate_procedural_effect(item):
    """Generate crisp, hard-edged transparent VFX sprite sheets without AI blur."""
    path = item["path"].replace("\\", "/")
    name = os.path.splitext(os.path.basename(path))[0].lower()
    tw = int(item["final_target_w"])
    th = int(item["final_target_h"])
    frame_h = tw if th > tw and th % tw == 0 else int(item.get("csv_frame_h") or tw)
    frame_h = max(1, min(frame_h, th))
    frames = max(1, th // frame_h)
    img = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    rng = _effect_rng(path)
    for i in range(frames):
        y0 = i * frame_h
        box = (0, y0, tw, min(th, y0 + frame_h))
        frame_rng = random.Random(rng.randint(0, 2**31 - 1) + i * 97)
        _draw_clean_effect_frame(draw, name, i, frames, box, frame_rng)
    metrics = {
        "source": "procedural_crisp_effect",
        "frames": frames,
        "frame_h": frame_h,
        "alpha_levels": len(set(img.getchannel("A").getdata())),
    }
    return img, img.copy(), metrics


# ======== Production Spec Loading ========
def normalize_character_item(item):
    if item.get("category") != "characters":
        return item
    frame_size = int(item.get("final_target_w") or item.get("target_w") or item.get("csv_frame_w") or 192)
    source_frame_h = int(
        item.get("source_frame_h")
        or item.get("csv_frame_h")
        or item.get("frame_h")
        or item.get("final_target_h")
        or frame_size
    )
    original_target_h = int(item.get("final_target_h") or item.get("target_h") or source_frame_h)
    frames = max(1, round(original_target_h / max(1, source_frame_h))) if original_target_h > source_frame_h else 1
    frames = max(4, frames)
    item["final_target_w"] = str(frame_size)
    item["final_target_h"] = str(frame_size * frames)
    item["csv_frame_w"] = str(frame_size)
    item["csv_frame_h"] = str(frame_size)
    item["frame_count"] = str(frames)
    item["layout"] = "vertical"
    return item


def read_spec():
    items = []
    with open(SPEC_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            items.append(normalize_character_item(row))
    p0_cats = {"ui", "icons", "effects", "tiles"}
    p1_cats = {"monsters", "bosses"}
    for item in items:
        item["batch"] = "p0" if item["category"] in p0_cats else "p1"
    return items


def manifest_row_to_item(row, action="manifest_full"):
    path = row["path"].replace("\\", "/").removeprefix("textures/")
    cat = row.get("category", "")
    p0_cats = {"ui", "icons", "effects", "tiles", "backgrounds"}
    final_target_w = row.get("target_w", row.get("frame_w", "256"))
    final_target_h = row.get("target_h", row.get("frame_h", "256"))
    csv_frame_w = row.get("frame_w", "")
    csv_frame_h = row.get("frame_h", "")
    if cat == "characters":
        frame_size = int(final_target_w or row.get("frame_w") or 192)
        source_frame_h = int(row.get("source_frame_h") or row.get("frame_h") or final_target_h or frame_size)
        original_target_h = int(row.get("target_h") or source_frame_h)
        frames = max(1, round(original_target_h / max(1, source_frame_h))) if original_target_h > source_frame_h else 1
        frames = max(4, frames)
        final_target_h = str(frame_size * frames)
        csv_frame_w = str(frame_size)
        csv_frame_h = str(frame_size)
    item = {
        "path": path,
        "category": cat,
        "action": action,
        "grade": row.get("grade", ""),
        "csv_target_w": row.get("target_w", ""),
        "csv_target_h": row.get("target_h", ""),
        "csv_frame_w": csv_frame_w,
        "csv_frame_h": csv_frame_h,
        "final_target_w": final_target_w,
        "final_target_h": final_target_h,
        "size_policy": action,
        "has_alpha": row.get("has_alpha", "True"),
        "mode": row.get("mode", "RGBA"),
        "bundle": row.get("bundle", ""),
        "atlas_group": row.get("atlas_group", ""),
        "target_size_kb": row.get("target_size_kb", "30"),
        "prompt_note": "from manifest full batch",
        "status": "todo",
        "batch": "p0" if cat in p0_cats else "p1",
    }
    return normalize_character_item(item)


def read_manifest_all():
    """Read the full textures_audit_manifest.csv list for full rebuilds."""
    if not os.path.exists(MANIFEST_CSV):
        print("[WARN] textures_audit_manifest.csv does not exist")
        return []

    rows = []
    with open(MANIFEST_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rows.append(manifest_row_to_item(row, "manifest_full"))
    print(f"  [manifest] loaded {len(rows)} total assets")
    return rows


def read_rework_effects():
    """Build opt-in rework specs for known bad effect files from the main manifest."""
    if not os.path.exists(MANIFEST_CSV):
        return []

    rows = []
    with open(MANIFEST_CSV, encoding="utf-8-sig") as f:
        by_path = {
            row["path"].replace("\\", "/").removeprefix("textures/"): row
            for row in csv.DictReader(f)
        }

    for path in sorted(REWORK_EFFECT_PATHS):
        src = by_path.get(path)
        if not src:
            continue
        rows.append({
            "path": path,
            "category": "effects",
            "action": "rework_effect_alpha",
            "grade": src.get("grade", ""),
            "csv_target_w": src.get("target_w", ""),
            "csv_target_h": src.get("target_h", ""),
            "csv_frame_w": src.get("frame_w", ""),
            "csv_frame_h": src.get("frame_h", ""),
            "final_target_w": src.get("target_w", ""),
            "final_target_h": src.get("target_h", ""),
            "size_policy": "rework_effect_transparent_alpha",
            "has_alpha": src.get("has_alpha", "True"),
            "mode": "RGBA",
            "bundle": src.get("bundle", ""),
            "atlas_group": src.get("atlas_group", ""),
            "target_size_kb": src.get("target_size_kb", "40"),
            "prompt_note": "rework combat effect: transparent alpha, no checkerboard, no baked background",
            "status": "todo",
            "batch": "p0",
        })
    return rows


def read_safety_reworks():
    """Build opt-in specs for generated assets that need visual-safety rework."""
    if not os.path.exists(MANIFEST_CSV):
        return []

    rows = []
    with open(MANIFEST_CSV, encoding="utf-8-sig") as f:
        by_path = {
            row["path"].replace("\\", "/").removeprefix("textures/"): row
            for row in csv.DictReader(f)
        }

    for path in sorted(REWORK_SAFETY_PATHS):
        src = by_path.get(path)
        if not src:
            continue
        rows.append({
            "path": path,
            "category": src.get("category", "ui") or "ui",
            "action": "rework_visual_safety",
            "grade": src.get("grade", ""),
            "csv_target_w": src.get("target_w", ""),
            "csv_target_h": src.get("target_h", ""),
            "csv_frame_w": src.get("frame_w", ""),
            "csv_frame_h": src.get("frame_h", ""),
            "final_target_w": src.get("target_w", src.get("frame_w", "")),
            "final_target_h": src.get("target_h", src.get("frame_h", "")),
            "size_policy": "wechat_review_safe_ui_icon",
            "has_alpha": src.get("has_alpha", "True"),
            "mode": "RGBA",
            "bundle": src.get("bundle", ""),
            "atlas_group": src.get("atlas_group", ""),
            "target_size_kb": src.get("target_size_kb", "20"),
            "prompt_note": "visual safety rework: no blood, gore, organs, skulls, or fake text",
            "status": "todo",
            "batch": "p0",
        })
    return rows


def read_boss_reworks():
    """Read ALL boss entries (rows 19-138) from textures_audit_manifest.csv for rework.

    Covers 120 entries: 90 finalboss (6 chars x 2-3 naming variants x 5 actions x 2 sizes)
    + 30 miniboss (30 chars x 1 idle frame).
    Dedup via dedupe_items_prefer_rework ensures each path appears only once.
    """
    if not os.path.exists(MANIFEST_CSV):
        print("[WARN] textures_audit_manifest.csv does not exist, skip boss rework")
        return []

    rows = []
    with open(MANIFEST_CSV, encoding="utf-8-sig") as f:
        manifest = {row["path"].replace("\\", "/").removeprefix("textures/"): row
                    for row in csv.DictReader(f)}

    # Filter to only boss category entries
    boss_paths = sorted(
        p for p, src in manifest.items()
        if src.get("category", "") == "bosses"
    )
    for path in boss_paths:
        src = manifest[path]
        rows.append({
            "path": path,
            "category": "bosses",
            "action": "boss_rework",
            "grade": src.get("grade", ""),
            "csv_target_w": src.get("target_w", ""),
            "csv_target_h": src.get("target_h", ""),
            "csv_frame_w": src.get("frame_w", ""),
            "csv_frame_h": src.get("frame_h", ""),
            "final_target_w": src.get("target_w", src.get("frame_w", "256")),
            "final_target_h": src.get("target_h", src.get("frame_h", "256")),
            "size_policy": "boss_rework_pixel",
            "has_alpha": src.get("has_alpha", "True"),
            "mode": "RGBA",
            "bundle": src.get("bundle", ""),
            "atlas_group": src.get("atlas_group", ""),
            "target_size_kb": src.get("target_size_kb", "30"),
            "prompt_note": "boss visual rework: unique distinctive cartoon animal description",
            "status": "todo",
            "batch": "bosses",
        })
    print(f"  [boss rework] loaded {len(rows)} boss assets from manifest")
    return rows


def dedupe_items_prefer_rework(items):
    by_path = {}
    for item in items:
        path = item["path"].replace("\\", "/").removeprefix("textures/")
        old = by_path.get(path)
        if old is None or item.get("action") in ("rework_visual_safety", "boss_rework"):
            by_path[path] = item
    return list(by_path.values())

def read_manifest_category(category):
    """Read all manifest rows for one category. Supports the full 418-row list."""
    if not os.path.exists(MANIFEST_CSV):
        print(f"  [WARN] manifest.csv does not exist, skip {category}")
        return []

    rows = []
    with open(MANIFEST_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            cat = row.get("category", "")
            if cat == category:
                rows.append(manifest_row_to_item(row, "manifest_full"))
    print(f"  [manifest] loaded {len(rows)} {category} assets")
    return rows



# ======== AI Prompt Building ========
_PROMPTS_CACHE = None
_PROMPTS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                              "assets/resources/config/prompts.json")

def _load_prompts_cache():
    global _PROMPTS_CACHE
    if _PROMPTS_CACHE is not None:
        return _PROMPTS_CACHE
    try:
        if os.path.exists(_PROMPTS_PATH):
            with open(_PROMPTS_PATH, encoding="utf-8") as f:
                _PROMPTS_CACHE = json.load(f)
            print(f"  [prompts] loaded {len(_PROMPTS_CACHE)} dedicated prompts from {_PROMPTS_PATH}")
        else:
            _PROMPTS_CACHE = {}
            print(f"  [prompts] {_PROMPTS_PATH} does not exist, using fallback prompts")
    except Exception as e:
        _PROMPTS_CACHE = {}
        print(f"  [prompts] load failed: {e}")
    return _PROMPTS_CACHE


def build_prompt(item):
    cat = item["category"]
    path = item["path"]
    
    # Prefer dedicated prompts from prompts.json.
    prompts_cache = _load_prompts_cache()
    if path in prompts_cache and prompts_cache[path]:
        return prompts_cache[path]
    
    fname = os.path.basename(path).replace(".png", "")
    tw = int(item["final_target_w"])
    th = int(item["final_target_h"])
    frame_h = tw if item["category"] in ("effects", "bosses") and th > tw else int(item.get("csv_frame_h") or th)
    frames = max(1, round(th / max(1, frame_h))) if th > frame_h else 1
    needs_alpha = str(item.get("has_alpha", "")).lower() == "true"

    zone = "unknown"
    for z in ["forest", "catacombs", "volcano", "tundra", "swamp", "abyss"]:
        if z in path.lower():
            zone = z
            break

    boss_variant = ""
    if "death" in fname:
        boss_variant = "non-graphic retreat animation, dissolving into soft magic particles"
    elif "phasechange" in fname:
        boss_variant = "transformation aura, power-up state, same body shape"

    # Effect color hints for effects only.
    effect_colors = ""
    if cat == "effects":
        color_map = {
            "burn": "ONLY expanding orange and red concentric ring shapes on solid black background. All rings are hollow with empty centers. No center dot. No center mark. Nothing at center. Absolutely nothing else in the image. No other shapes. No other objects.",
            "conduct": "electric blue white yellow BRANCHING JAGGED LIGHTNING LINES on black background, angular tree-like fork pattern, each frame branches spread wider, pure geometric zigzag lines only NO face NO skull NO symbol",
            "corrode": "acid green yellow-green purple EXPANDING BUBBLE CLOUD on black background, clustered circular dot pattern, each frame more bubbles appear outward, abstract circle cluster shapes only NO face NO skull NO symbol",
            "decay": "olive green muted yellow soft brown FADING CONCENTRIC RINGS on black background, shrinking ring pattern inward, each frame rings get smaller and dimmer, abstract fading circle shapes only NO face NO skull NO symbol",
            "freeze": "ice blue white pale cyan EXPANDING HEXAGONAL CRYSTAL on black background, six-sided geometric snowflake branching pattern, each frame crystal branches spread wider, pure geometric ice geometry only NO face NO skull NO symbol",
            "melt": "orange molten red yellow VERTICAL DRIPPING DROPLETS on black background, elongated teardrop shapes falling downward, each frame drops stretch longer, abstract liquid drip shapes only NO face NO skull NO symbol",
            "overload": "purple pink white RADIAL STARBURST LINE PATTERN on black background, straight lines radiating from center like a star, each frame lines grow longer, pure geometric radial lines only NO face NO skull NO symbol",
            "radiance": "gold yellow white EXPANDING FAN-SHAPED LIGHT RAYS on black background, triangular wedge light beams radiating outward, each frame beams spread wider, pure geometric light fan shapes only NO face NO skull NO symbol",
            "shatter": "white pale blue FLYING POLYGON FRAGMENTS on black background, small sharp geometric triangle pieces flying apart outward, each frame fragments spread farther, pure abstract broken geometry only NO face NO skull NO symbol",
            "vaporize": "white steam pale gray light blue RISING CIRCULAR PUFF CLOUDS on black background, round fluffy blob shapes drifting upward, each frame puffs rise higher, pure abstract cloud blob shapes only NO face NO skull NO symbol",
            "void": "deep purple blue violet SWIRLING SPIRAL VORTEX on black background, concentric curved spiral lines winding inward, each frame spiral tightens, pure geometric spiral shapes only NO face NO skull NO symbol",
            "dodge": "EXPANDING HOLLOW WHITE CYAN RINGS on black background, concentric circular wave pattern, each frame ring at different expansion size, empty hollow center in every frame, pure geometric ring shapes only NO face NO skull NO symbol",
            "heal": "green gold warm yellow FLOATING SMALL CIRCLE DOTS RISING UPWARD on black background, tiny bright sphere shapes floating up like sparkles, each frame dots spread wider and rise, pure abstract dot cluster only NO face NO skull NO symbol",
            "shield": "blue cyan white HEXAGONAL HONEYCOMB GRID on black background, repeating six-sided geometric cell pattern forming a barrier wall, each frame grid becomes denser, pure geometric tessellation only NO face NO skull NO symbol",
            "crit": "white yellow red EXPANDING STAR-SHAPED BURST LINES on black background, short straight lines radiating from center in a star burst, each frame lines stretch outward, pure geometric radial line starburst only NO face NO skull NO symbol",
            "hit": "white yellow SMALL EXPANDING CONCENTRIC CIRCLE on black background, simple circular ring expanding from center outward, each frame ring grows slightly larger, pure geometric circle only NO face NO skull NO symbol",
            "blink": "crystal blue white SMALL SPARKLE DUST CIRCLE on black background, tiny bright dot cluster in a loose circular cloud, each frame dots spread outward, pure abstract glitter dot cluster only NO face NO skull NO symbol",
            "decoy": "pale green ghostly white AMORPHOUS FOG CLOUD on black background, shapeless mist-like blob with no defined edges, each frame fog expands slightly, pure abstract vapor blob only NO face NO skull NO symbol",
            "flame": "orange red RISING WAVY FLAME ARC SHAPES on black background, curved flame-like arcs rising upward from base, each frame arcs rise higher, pure abstract curved line shapes only NO face NO skull NO symbol",
            "frost": "ice blue white EXPANDING SIX-SIDED SNOWFLAKE CRYSTAL on black background, branching hexagonal geometric frost pattern growing outward, each frame crystal branches spread, pure geometric frost geometry only NO face NO skull NO symbol",
            "gravity": "purple blue CONCENTRIC ORBIT RING VORTEX on black background, multiple oval rings rotating around center like planetary orbits, each frame rings spin slightly, pure geometric orbital ellipse shapes only NO face NO skull NO symbol",
            "life": "green gold bright FLOATING GLOWING SPHERE ORBS on black background, circular bright orb shapes of varying sizes floating upward, each frame orbs rise and multiply, pure abstract glowing circle shapes only NO face NO skull NO symbol",
            "shadow": "violet deep blue DIAGONAL SWEEPING ARC STROKE on black background, single curved brush stroke line sweeping diagonally, each frame stroke grows longer and fades, pure abstract line stroke only NO face NO skull NO symbol",
            "time": "gold pale yellow white CONCENTRIC EXPANDING RING RIPPLES on black background, multiple circular wave rings radiating from center like water ripples, each frame new outer ring appears, pure geometric concentric circles only NO face NO skull NO symbol",
            "glow": "white blue soft CORNER LIGHT GRADIENT on black background, smooth gradual brightness transition from corner to center, soft glowing vignette effect, pure abstract light gradient only NO face NO skull NO symbol",
            "loading": "white blue CIRCULAR ARC SPINNER SEGMENT on black background, single curved arc segment rotating around center like a loading indicator, each frame arc rotates to next position, pure geometric arc only NO face NO skull NO symbol",
        }
        for keyword, colors in color_map.items():
            if keyword in fname.lower():
                effect_colors = f"Color palette: {colors}. "
                break
        if "time_hourglass" in fname.lower():
            effect_colors = (
                "Color palette: gold, pale yellow, white. "
                "Abstract temporal magic VFX only: circular time ripple rings, "
                "floating sand-like particles, small sparkle bursts, empty center, "
                "no recognizable object silhouette, no container, no frame, no vertical structure. "
            )
        if "radiance" in fname.lower():
            effect_colors = "Color palette: gold, yellow, white radiance burst only, no pillars, no scenery, no blocky background. "
        if not effect_colors:
            effect_colors = "Color palette: bright warm colors with clean high contrast. "

    icon_subject = ""
    if cat == "icons":
        icon_map = {
            "blinkstone": "a small blue teleport crystal stone with angular rune cuts",
            "decoyscroll": "a rolled parchment scroll with a ghostly decoy silhouette seal",
            "echoorb": "a glass orb with concentric echo rings inside",
            "flamering": "a metal ring encircled by orange flame",
            "frenzyaxe": "a red battle axe head with a short handle and rage glow",
            "frostamulet": "an icy blue amulet pendant with frost crystals",
            "gravitystone": "a violet gravity stone with curved orbit lines",
            "immortalstone": "a golden life stone with a small immortal cross-shaped shine",
            "ironarmor": "a compact iron chest armor plate icon",
            "lifelink": "two small green linked life crystals joined by a chain of light",
            "luckycoin": "a single gold lucky coin with a simple clover-like mark, no text",
            "shadowcloak": "a folded violet cloak with shadow wisps",
            "shadowdagger": "a violet fantasy dagger with soft shadow trail",
            "speedgauntlet": "a lightweight silver gauntlet glove with blue speed streaks",
            "thornarmor": "a green-brown thorn-covered armor plate",
            "timehourglass": "a small golden hourglass relic with flowing sand and time ripple ring",
            "skill_dash": "skill icon, blue-white motion streak and boot-shaped speed trail, clean symbol only",
            "skill_elementburst": "skill icon, four colored elemental energy sparks orbiting a bright central burst",
            "skill_healwave": "skill icon, green healing wave rings around a bright life crystal and leaf glow",
            "set_frostbite": "set icon, icy blue snowflake crystal badge shape, clean symbol only",
            "set_fury": "set icon, orange energy swirl and flame-shaped aura, clean symbol only",
            "set_ironwall": "set icon, gray iron shield wall plate with rivets, clean symbol only",
            "set_tempest": "set icon, blue wind spiral and lightning spark, clean symbol only",
            "debuff_slow": "status icon, blue-gray slowing spiral with small frost particles, clean symbol only",
        }
        for keyword, subject in icon_map.items():
            if keyword in fname.lower():
                icon_subject = subject
                break
        if not icon_subject:
            icon_subject = "a single fantasy RPG relic item object"

    boss_subject = ""
    if cat == "bosses":
        boss_map = {
            # ======================== FINALBOSS (6 unique) ========================
            # Strategy: each has a completely different body plan, never "tall humanoid"

            "abyssoverlord": "abyss overlord finalboss, floating energy entity with NO LEGS, lower body is a swirling vortex of purple void energy, upper body is dark crystal torso with bright violet core at center, four translucent energy tendrils from back like spider legs, no physical arms just energy ribbons, head is smooth crystal helmet with single glowing eye slit",
            "lord_abyss": "abyss overlord finalboss, floating energy entity with NO LEGS, lower body is a swirling vortex of purple void energy, upper body is dark crystal torso with bright violet core at center, four translucent energy tendrils from back like spider legs, no physical arms just energy ribbons, head is smooth crystal helmet with single glowing eye slit",

            "swampbehemoth": "swamp behemoth finalboss, LOW FLAT QUADRUPED crawling with belly on ground, four short stubby legs like a massive toad, extremely wide body with no neck, head is flat triangular shape with two small glowing eyes on top, back covered in warts and moss, no arms, short stubby tail, shaped like a giant rotund amphibian",
            "beast_swamp": "swamp behemoth finalboss, LOW FLAT QUADRUPED crawling with belly on ground, four short stubby legs like a massive toad, extremely wide body with no neck, head is flat triangular shape with two small glowing eyes on top, back covered in warts and moss, no arms, short stubby tail, shaped like a giant rotund amphibian",

            "firelord": "volcano fire lord finalboss, BROAD MOUNTAIN-LIKE body, shoulders wider than twice the head width, no visible neck, legs short and planted wide like a boulder, arms thick and hang past knees, fists the size of boulders, body covered in cracked black rock with lava veins, large round belly, shaped like a volcanic dwarf giant not a tall humanoid",
            "lord_volcano": "volcano fire lord finalboss, BROAD MOUNTAIN-LIKE body, shoulders wider than twice the head width, no visible neck, legs short and planted wide like a boulder, arms thick and hang past knees, fists the size of boulders, body covered in cracked black rock with lava veins, large round belly, shaped like a volcanic dwarf giant not a tall humanoid",

            "forestguardian": "forest guardian finalboss, SHORT WIDE TREE STUMP body, legs are thick root clusters spreading outward like an ancient tree, arms are massive twisted branches growing directly from upper torso sides, head is carved wooden face in trunk with two glowing green eye holes, moss and vines hanging from shoulders, shaped like a walking oak stump",
            "guardian_forest": "forest guardian finalboss, SHORT WIDE TREE STUMP body, legs are thick root clusters spreading outward like an ancient tree, arms are massive twisted branches growing directly from upper torso sides, head is carved wooden face in trunk with two glowing green eye holes, moss and vines hanging from shoulders, shaped like a walking oak stump",

            "frostqueen": "frost queen finalboss, FLOATING ICE CRYSTAL entity with NO LEGS, lower body is a cluster of jagged ice crystals floating above ground, back has two large crystalline frost wings like an ice butterfly, arms are slender ice formations tapering into sharp points, head is elegant ice sculpture face with icicle crown, body radiates cold mist downward",
            "queen_tundra": "frost queen finalboss, FLOATING ICE CRYSTAL entity with NO LEGS, lower body is a cluster of jagged ice crystals floating above ground, back has two large crystalline frost wings like an ice butterfly, arms are slender ice formations tapering into sharp points, head is elegant ice sculpture face with icicle crown, body radiates cold mist downward",

            "skeletonlord": "catacombs phantom knight finalboss, LOWER BODY IS GHOSTLY MIST with no visible legs, torso floats above swirling blue spirit cloud, two gauntlet-armored arms holding a spectral greatsword, head is fully sealed blue metal helm with glowing blue gem in visor, cape of translucent blue spirit energy, body flickers between solid and translucent",
            "lord_catacombs": "catacombs phantom knight finalboss, LOWER BODY IS GHOSTLY MIST with no visible legs, torso floats above swirling blue spirit cloud, two gauntlet-armored arms holding a spectral greatsword, head is fully sealed blue metal helm with glowing blue gem in visor, cape of translucent blue spirit energy, body flickers between solid and translucent",

            # ======================== ABYSS MINIBOSS (5) ========================

            "abysssentinel": "abyss sentinel miniboss, PURE ABSTRACT SHAPE with NO BODY, just a single large floating violet eye at center, surrounded by four smaller crystal shards orbiting in a ring, no limbs, no torso, no head, just eye plus orbiting fragments, completely non-humanoid",
            "nightmareknight": "abyss nightmare knight miniboss, HUNCHED SQUAT humanoid, back heavily curved like a troll, shoulders extremely broad with jagged spikes, legs short and bowed, arms long and drag on ground, walks on knuckles, shaped like a fantasy cave troll, one red eye through cracked helmet",
            "shadowdragon": "abyss shadow dragon miniboss, FOUR-LEGGED DRAGON with long serpentine neck, two wings like torn shadow fabric from shoulders, long tail ending in purple crystal, lean lizard-like body low to ground, completely quadrupedal",
            "voidhunter": "abyss void hunter miniboss, EXTREMELY TALL THIN humanoid with elongated limbs, lower body from waist down is blurred void mist with NO LEGS, upper body wrapped in dark cloth, one long arm holding purple crystal bow, other arm longer ending in claws, unnatural stretched proportions",
            "voidlord": "abyss void lord miniboss, SHORT ROUND dwarf-like body in dark violet robe, completely BALD head with glowing void rune tattoo on forehead, arms short and pudgy, hands crackling with purple energy, FLOATS above ground, round belly shape",

            # ======================== CATACOMBS MINIBOSS (5) ========================

            "blackknight": "catacombs black knight miniboss, BOXY STOCKY humanoid with extremely thick armor plates, shoulders are massive rectangular blocks, cube-like helmet with narrow T-shaped visor showing red glow, legs short and planted wide, carries large rectangular tower shield and short thick broadsword, shaped like a walking iron tank",
            "gargoyle": "catacombs gargoyle miniboss, HUNCHED ANIMAL-LIKE posture on all fours, gray stone skin with cracks, two folded stone wing slabs on back, horned head with wide jaw, long tail with spiked tip, claws on all four paws, sits on hind legs like a griffin not humanoid",
            "giantskeleton": "catacombs giant stone golem miniboss, HUGE BLOCKY rock body with NO NECK, head is a single massive carved stone block on shoulders, one arm holds a stone hammer, other arm is noticeably longer and bulkier, legs are thick stone pillars, body covered in ancient glowing blue runic carvings",
            "lich": "catacombs curse caster miniboss, BENT FRAIL humanoid with back curved forward heavily, leaning on gnarled wooden staff, legs thin and unstable, arms stick-thin, large head with tall pointed hat drooping to one side, shapeless tattered robe, slow shuffling posture",
            "warden_catacombs": "catacombs spectral guard miniboss, STANDARD PROPORTION humanoid in silver-blue armor, upright posture, carries long polearm with crescent blade in two hands, round shield on back, full-face visor helmet with no visible features, blue spirit chains on belt, most normal human proportions",

            # ======================== FOREST MINIBOSS (5) ========================

            "boarchief": "forest boar chief miniboss, FOUR-LEGGED WILD BOAR with extremely thick muscular front shoulders, large head with two huge tusks curving upward, barrel-shaped body low to ground, short powerful legs, bristly brown fur, vine crown between ears, pure quadruped build",
            "poisonflower": "forest poison flower miniboss, PLANT-BASED with TALL THIN STEM as body and NO HEAD, top of stem blooms into giant red-purple spotted flower with one large eye at center, two leaf-shaped arms from stem, small root tendrils at base as feet, sways like a plant, completely non-animal",
            "porcupineking": "forest porcupine king miniboss, EXTREMELY ROUND WIDE body like a spiky ball, short stubby legs barely visible, entire back covered in long sharp quills, small head tucked into body with only snout and eyes visible, quill crest forming a crown, shaped like a living pincushion",
            "stagbeetle": "forest stag beetle miniboss, SIX-LEGGED INSECT body, large glossy black oval shell on back, two enormous antler-like mandibles forward from head, small head tucked under shell, jointed legs spread wide gripping ground, low profile hugging ground, pure insectoid body",
            "warden_forest": "forest warden miniboss, SLIM ELF-LIKE humanoid with pointed ears under hood, lean agile body in green-brown fitted leather armor with leaf pauldrons, carries wooden staff with amber crystal, vine whip at belt, stands lightly on balls of feet",

            # ======================== SWAMP MINIBOSS (5) ========================

            "poisonscorpion": "swamp poison scorpion miniboss, EIGHT-LEGGED ARTHROPOD, two massive pincers at front, segmented tail curved up with glowing purple venom stinger tip, dark green chitin armor, long low body with raised tail section, pure arachnid body",
            "rottreantelite": "swamp rottreant elite miniboss, SINGLE-LEGGED tree creature with one thick root-leg supporting body, other leg is broken stump dragging, rotting tree trunk body tilted, one arm is broken branch, other is thick moss-covered club arm, hollow eye carved in trunk with single yellow glow",
            "serpentqueen": "swamp serpent queen miniboss, LEGLESS SNAKE body, long sinuous serpentine form coiled in striking S-shape, NO LEGS NO ARMS, thick emerald green scales, cobra-like hood behind head with small spike crown, forked tongue visible, pure snake body with no limbs at all",
            "swampcrocodile": "swamp crocodile miniboss, FOUR-LEGGED REPTILE with extremely long jaw and tail, body long and low with short splayed legs, heavy dark green-brown armored scales on back, massive jaw full of visible teeth, tail as long as body dragging on ground",
            "swampfrog": "swamp frog miniboss, FROG-SHAPED with EXTREMELY LARGE ROUND BELLY, huge back legs folded in crouching leap position, short front legs with webbed fingers, wide head with bulging eyes on top and very wide mouth, upright sitting frog posture, warty mottled green-purple skin",

            # ======================== TUNDRA MINIBOSS (5) ========================

            "frostelemental": "tundra frost elemental miniboss, AMORPHOUS SHIFTING body of snow and ice crystals, roughly humanoid upper body but lower half is drifting snow cloud with NO LEGS, arms are jagged icicles that reform constantly, featureless ice mask face with two white glowing dots for eyes, particles falling off and reforming",
            "icegiant": "tundra ice giant miniboss, TALL BROAD humanoid with massive thick body, extremely wide shoulders, thick short neck, blocky head with rough features, one eye frozen shut, dressed in furs and crude armor, legs like tree-trunk pillars, long muscular arms wielding giant icicle club, bare massive feet",
            "icescorpion": "tundra ice scorpion miniboss, SIX-LEGGED ARTHROPOD made of translucent blue ice, internal frost veins visible through icy exoskeleton, two ice crystal pincers at front, curled tail with frozen spike tip, jointed ice shard legs, long segmented body, pure insectoid",
            "polarbearking": "tundra polar bear king miniboss, FOUR-LEGGED BEAR with massive thick body, white fur with thicker mane around neck like royal collar, bear snout head with blue eyes, ice crystal crown on forehead, four powerful paws with claws, heavy lumbering quadruped gait",
            "snowape": "tundra snow ape miniboss, APE-SHAPED walking on KNUCKLES, arms EXTREMELY LONG past knees when standing, shorter bent legs, shaggy white-gray fur, very broad shoulders, head with pronounced brow ridge and flat nose, stands half-upright or on all fours, chest thumping pose",

            # ======================== VOLCANO MINIBOSS (5) ========================

            "firegolem": "volcano fire golem miniboss, SQUAT BLOCKY rock body with NO NECK, head is one massive dark volcanic rock chunk on shoulders, two fists made of molten stone glowing orange, stubby stone pillar legs planted wide, body wider than tall with lava cracks, shaped like a walking furnace",
            "inferno": "volcano inferno miniboss, COMPLETELY FLAME-BASED with NO SOLID BODY, vaguely humanoid upper torso of swirling orange-red fire, NO LEGS just fire whirlpool tail connecting to ground, two flame arms that flicker, brighter white-hot fireball head with two dark spots for eyes, body constantly shifts",
            "lavaworm": "volcano lava worm miniboss, LONG SEGMENTED WORM body with NO LEGS NO ARMS, tube of black rocky segments separated by glowing orange lava gaps, circular mouth ringed with small teeth, two tiny red eyes on first segment, slides like earthworm leaving ember trail, pure worm body",
            "volcanogiant": "volcano giant miniboss, EXTREMELY LARGE FAT humanoid, belly is largest body part sticking far forward, short legs barely supporting weight, arms short due to massive belly, round head on thick neck with no visible chin, stone helmet, dark charcoal skin with ember patches",
            "warden_volcano": "volcano warden miniboss, STOUT DWARF-like humanoid with very short legs, broad chest and shoulders, thick strong arms, fire-resistant leather and metal armor with orange trim, long red beard, helmet with mining goggles pushed up, pickaxe-hammer weapon and round volcano-emblem shield, wide stable stance",
        }
        for keyword, subject in boss_map.items():
            if keyword in fname.lower():
                boss_subject = subject
                break
        if not boss_subject:
            boss_subject = f"{zone} fantasy boss, large cartoon adventure creature"

    monster_subject = ""
    if cat == "monsters":
        monster_map = {
            "abyssarcher": "abyss archer monster with deep violet hood, void bow, bright violet glow",
            "shadowdemon": "violet imp-like magic monster with small horns, smoky purple body",
            "shadowgolem": "violet stone golem monster, bulky silhouette, glowing cracks",
            "voidrift": "floating void rift monster, torn portal shape, violet energy",
            "voidwraith": "void wisp monster, hooded spirit shape, trailing violet wisps",
            "batswarm": "clustered bat swarm monster, several small bats forming one readable silhouette",
            "deathknight": "catacombs deep blue armored knight monster, sealed helmet, small sword, blue ghost flame",
            "ghost": "pale ghost monster, floating sheet-like spirit, simple readable silhouette",
            "ghoul": "hunched gray-green fantasy crawler monster, simple cartoon claws",
            "skeletonarcher": "catacombs hooded phantom archer monster with small bow, sealed blue-gray armor, blue ghost flame",
            "skeleton": "catacombs sealed armor warrior monster, blue-gray helmet, small fantasy weapon, blue ghost glow",
            "boar": "wild forest boar monster, tusks, compact charging body",
            "elfarcher": "forest elf archer enemy, green hood, small bow, not a portrait",
            "mushroom": "walking mushroom monster, red cap, small feet, forest colors",
            "slime": "round slime monster, glossy blob body, readable eyes allowed only if simple",
            "treant": "small treant monster, walking tree body, branch arms",
            "rottreant": "old swamp treant monster, weathered bark, moss and poison fungus",
            "slimepoison": "poison slime monster, green toxic blob, small bubbles",
            "swampspider": "swamp spider monster, low body, long legs, toxic markings",
            "viper": "coiled swamp viper monster, green snake body, sharp silhouette",
            "frostmage": "tundra frost mage enemy, icy hooded caster, blue staff",
            "iceskeleton": "ice armor warrior monster, frosted helmet and plates, blue crystal cracks",
            "penguinsoldier": "penguin soldier monster, small armored penguin with spear",
            "snowman": "snowman monster, angry snow body, twig arms",
            "snowwolf": "snow wolf monster, white-blue wolf body, sharp icy fur",
            "ashwraith": "ash mist spirit monster, smoky gray shape with ember glow",
            "demon": "volcano lava imp monster, red horned body, small wings, lava glow",
            "fireelemental": "fire elemental monster, living flame body, orange-red core",
            "lavaspider": "lava spider monster, black legs, molten orange abdomen",
            "suicidegolem": "unstable lava golem monster, cracked rock body, glowing explosive core",
        }
        for keyword, subject in monster_map.items():
            if keyword in fname.lower():
                monster_subject = subject
                break
        if not monster_subject:
            monster_subject = f"{zone} cartoon adventure monster, single readable enemy silhouette"

    tile_subject = ""
    if cat == "tiles":
        tile_kind = "floor"
        for kind in ["highground", "thorn", "wall", "floor"]:
            if kind in fname.lower():
                tile_kind = kind
                break
        zone_materials = {
            "forest": "mossy grass, roots, worn earth",
            "catacombs": "old stone slabs, dust, cracks, muted gray masonry",
            "volcano": "charcoal basalt rock, lava seams, ash",
            "tundra": "snow, ice crust, blue frozen stone",
            "swamp": "mud, moss, wet stones, toxic green puddle hints",
            "abyss": "deep violet stone, violet cracks, star-like specks",
        }
        kind_desc = {
            "floor": "walkable ground tile",
            "wall": "solid blocking wall tile with heavier edge shapes",
            "highground": "raised platform tile with clear height/readability",
            "thorn": "hazard thorn tile with sharp spikes, readable danger",
        }
        tile_subject = f"{kind_desc.get(tile_kind, 'adventure tile')}, material: {zone_materials.get(zone, 'cartoon adventure stone')}"

    ui_subject = ""
    if cat == "ui":
        ui_map = {
            "btn_close": "square close button with two crossed rounded white strokes as a pictogram, not a letter glyph, no text",
            "btn_revive_active": "wide blank pressed action button background, teal crystal glow, rounded blue-gray trim, empty center",
            "btn_revive_default": "wide blank default action button background, blue-gray metal with subtle teal crystal edge glow, empty center",
            "btn_settle_active": "wide blank pressed continue button background, warm gold edge glow, rounded blue-gray trim, empty center",
            "btn_settle_default": "wide blank default continue button background, blue-gray metal with warm gold trim, empty center",
            "btn_active": "wide blank pressed button background, plain rounded rectangle, subtle inner highlight, empty center",
            "btn_default": "wide blank default button background, plain rounded rectangle, clean border, empty center",
            "btn_hover": "wide blank hover button background, plain rounded rectangle, soft edge glow, empty center",
            "panel_bg": "repeatable blue-purple panel background slice",
            "result_panel": "adventure result panel frame, empty center, violet crystal corners, soft gold trim",
            "death_bg": "adventure result background panel, violet crystals, soft golden mist, parchment texture, calm magical atmosphere",
            "icon_soulstone": "small blue spirit crystal currency icon, faceted gem shape, soft glow",
            "equip_body_frame": "equipment layout panel with empty rounded slots, clean metal borders, blank center areas, decorative corners only",
            "equip_slot_chest": "empty equipment slot frame for chest armor, clean rounded square border, blank transparent center",
            "equip_slot_gloves": "empty equipment slot frame for gloves, clean rounded square border, blank transparent center",
            "equip_slot_helmet": "empty equipment slot frame for helmet, clean rounded square border, blank transparent center",
            "equip_slot_legs": "empty equipment slot frame for leg armor, clean rounded square border, blank transparent center",
            "equip_slot_necklace": "empty equipment slot frame for necklace, clean rounded square border, blank transparent center",
            "equip_slot_ring": "empty equipment slot frame for ring, clean rounded square border, blank transparent center",
            "equip_slot_shoes": "empty equipment slot frame for shoes, clean rounded square border, blank transparent center",
            "equip_slot_weapon": "empty equipment slot frame for weapon, clean rounded square border, blank transparent center",
            "inventory_slot": "square inventory item slot frame, empty center",
            "item_slot": "small square item slot frame, empty center",
            "rarity_common": "common rarity item frame, simple gray metal border, empty center",
            "rarity_magic": "magic rarity item frame, blue glowing border, empty center",
            "rarity_rare": "rare rarity item frame, purple-blue border, empty center",
            "rarity_legendary": "legendary rarity item frame, gold ornate border, empty center",
            "set_counter_bg": "compact set counter background badge, empty center, no digits",
            "hud_hpbar_bg": "horizontal HP bar blue-gray background trough",
            "hud_hpbar_fill": "horizontal HP bar red fill strip, no frame",
            "hud_hpbar_frame": "horizontal HP bar metal frame with transparent center",
            "hud_cdmask": "round cooldown mask UI overlay, simple translucent radial wedge shape, empty center",
            "hud_rollbtn": "round blank dodge action button frame, blue-gray rim, empty center, clean swirl mark only",
            "hud_skillslot": "round blank skill slot frame, blue-gray rim, empty center, no icon inside",
            "joystick_base": "round virtual joystick base ring, transparent center, no thumbstick",
            "splash_bg": "landscape cartoon animal title screen background only, atmospheric ruins and soft blue light, no logo panel, no text, no UI card",
            "main_bg": "bright cartoon adventure main menu background panel texture, clean open center area, no central X mark, no cross mark, no close icon, no text",
            "main_titledeco": "decorative title ornament, no letters, no logo text",
            "icon_room_boss": "map room icon, tiny crown above a simple stone gate shape, clean friendly symbol",
            "icon_room_combat": "map room icon for combat encounter, crossed swords symbol, no text",
            "icon_room_event": "map room icon for event encounter, simple sparkle symbol, no text",
            "icon_room_healing": "map room icon for healing room, simple green plus and leaf symbol",
            "icon_room_shop": "map room icon for shop, small coin bag symbol, no text",
            "icon_room_treasure": "map room icon for treasure, small chest symbol, no text",
            "icon_room_upgrade": "map room icon for upgrade, upward arrow gem symbol, no text",
            "map_line": "thin vertical map connection line segment",
            "map_node_current": "map node current marker, bright ring, empty center",
            "map_node_unknown": "map node unknown marker, dim ring, no question mark",
            "map_node_visited": "map node visited marker, muted completed ring, no checkmark text",
            "icon_coin": "small gold coin currency icon, no text, no face",
            "shop_bg": "shop panel background texture, empty center, no text",
            "shop_slot": "shop item slot card frame, empty center, no price text",
            "card_frame_common": "upgrade card frame common rarity, empty center, no text",
            "card_frame_rare": "upgrade card frame rare rarity, empty center, no text",
            "card_frame_epic": "upgrade card frame epic rarity, empty center, no text",
            "icon_ability_bullettime": "ability icon, blue time-slow circular clock ripple with arrow streaks, no weapon piercing",
            "icon_ability_doublestrike": "ability icon, two clean crossing slash arcs as abstract light trails",
            "icon_ability_elementresonance": "ability icon, four elemental orbs orbiting a central crystal, no text",
            "icon_ability_firewalker": "ability icon, boot silhouette stepping over stylized flame aura, no burning person",
            "icon_ability_frostbite": "ability icon, icy crystal fang shape and snowflake aura",
            "icon_ability_holyshield": "ability icon, golden shield with soft radiant aura, no religious text",
            "icon_ability_lifestealaura": "ability icon, green life-energy aura swirling around a bright life crystal and simple circular energy marks",
            "icon_ability_phasewalk": "ability icon, translucent boot or footprint passing through blue portal rings, no person",
            "icon_ability_ricochet": "ability icon, bouncing arrow trail between small metal sparks, no target body",
            "icon_ability_shieldreflect": "ability icon, shield reflecting a small light projectile",
            "icon_ability_sprint": "ability icon, boot with blue speed lines, no character body",
            "icon_ability_warcry": "ability icon, golden sound wave burst from a simple horn emblem, no mouth, no face",
            "icon_upgrade_agileboots": "upgrade icon, light leather boots with wind streaks, no text",
            "icon_upgrade_berserkerpact": "upgrade icon, red-orange power crystal wrapped by a clean golden ribbon and flame-shaped energy aura, abstract strength boost symbol, soft rounded silhouette",
            "icon_upgrade_greedring": "upgrade icon, gold ring with coin sparkle, no text",
            "icon_upgrade_ironwall": "upgrade icon, sturdy iron wall shield plate with clean rivets",
            "icon_upgrade_lifecharm": "upgrade icon, green life charm pendant with leaf glow and crystal shape",
            "icon_upgrade_longarm": "upgrade icon, extended reach gauntlet with blue arc line, no detached arm",
            "icon_upgrade_windstep": "upgrade icon, wind swirl around light boot symbol, no character",
            "icon_relic_blinkstone": "relic icon, small blue teleport crystal stone with angular rune cuts, no letters",
            "icon_relic_decoyscroll": "relic icon, rolled parchment scroll with ghostly decoy silhouette seal, no text",
            "icon_relic_echoorb": "relic icon, glass orb with concentric echo rings inside",
            "icon_relic_flamering": "relic icon, metal ring encircled by stylized orange flame",
            "icon_relic_frenzyaxe": "relic icon, red battle axe head with clean energy glow",
            "icon_relic_frostamulet": "relic icon, icy blue amulet pendant with frost crystals",
            "icon_relic_gravitystone": "relic icon, violet gravity stone with curved orbit lines",
            "icon_relic_immortalstone": "relic icon, golden life stone with soft shine and clean geometric facets",
            "icon_relic_ironarmor": "relic icon, compact iron chest armor plate",
            "icon_relic_lifelink": "relic icon, two green linked life crystals joined by a chain of light",
            "icon_relic_luckycoin": "relic icon, single gold lucky coin with simple clover-like mark, no text",
            "icon_relic_shadowcloak": "relic icon, folded violet cloak with shadow wisps",
            "icon_relic_shadowdagger": "relic icon, violet fantasy dagger with soft shadow trail",
            "icon_relic_speedgauntlet": "relic icon, lightweight silver gauntlet glove with blue speed streaks",
            "icon_relic_thornarmor": "relic icon, green-brown thorn-covered armor plate",
            "icon_relic_timehourglass": "relic icon, small golden hourglass relic with flowing sand and time ripple ring",
        }
        for keyword, subject in sorted(ui_map.items(), key=lambda kv: len(kv[0]), reverse=True):
            if keyword in fname.lower():
                ui_subject = subject
                break
        if not ui_subject:
            ui_subject = "single reusable game UI sprite asset, empty content area, no text"

    prompts = {
        "bosses": (
            f"cartoon animal game boss sprite for {zone} zone, {tw}x{th}, subject: {boss_subject}, "
            f"{boss_variant}, same character design as existing {zone} boss assets, "
            f"{'vertical sprite sheet with ' + str(frames) + ' frames, each frame 256x256, ' if frames > 1 else ''}"
            f"single full-body boss character only, centered in each frame, readable top-down/isometric game sprite, "
            f"large silhouette, crisp clean edges, no portrait crop, no face-only icon, "
            f"{SEGMENTATION_BACKGROUND}, "
            f"12 percent safe margin from image borders, no checkerboard, "
            f"bright cartoon animal fantasy adventure style, no UI, no floor, no scenery, no item icon, no text, "
            f"{TRANSPARENT_SUBJECT_CONTRACT}"
        ),
        "monsters": (
            f"cartoon animal monster idle sprite for {zone} zone, subject: {monster_subject}, "
            f"{tw}x{th}, centered, {SEGMENTATION_BACKGROUND}, "
            f"12 percent safe margin from image borders, "
            f"single full-body enemy only, clear silhouette, same scale as other {zone} monsters, "
            f"three-quarter top-down readable game sprite, crisp clean edges, bright cartoon animal adventure style, "
            f"no scenery, no floor, no item icon, no portrait, no UI, no text, {TRANSPARENT_SUBJECT_CONTRACT}"
        ),
        "effects": (
            f"{frames}-frame vertical sprite sheet, {tw}x{th} total, each frame {tw}x{max(1, th//frames)}, "
            f"pure abstract cartoon animal game VFX, {effect_colors}"
            f"pure black background (#000000), additive game VFX style, "
            f"ONLY abstract particle shapes, scattered dots, streaks, lines, and small fragments, "
            f"24 color palette, limited clean colors, no noise, no background texture, "
            f"pure light-only effect, centered energy motion, no props, no characters, no UI panels, "
            f"solid black background only for luminance-to-alpha postprocessing"
        ),
        "icons": (
            f"cartoon animal RPG inventory item icon, {tw}x{th}, object: {icon_subject}, "
            f"single non-living item object only, readable at small size, centered, "
            f"{SEGMENTATION_BACKGROUND}, "
            f"12 percent safe margin from image borders, "
            f"simple object silhouette, crisp clean painted edges, "
            f"cartoon animal game loot icon style, three-quarter view or front view, "
            f"no face, no eyes, no mouth, no head, no portrait, no avatar, no emoji, no character, "
            f"no creature, no person, no UI text, no letters, no numbers, "
            f"no watermark, {TRANSPARENT_SUBJECT_CONTRACT}"
        ),
        "tiles": (
            f"seamless cartoon animal adventure map tile for {zone} zone, {tw}x{th}, subject: {tile_subject}, "
            f"orthographic top-down tile texture, full square filled edge-to-edge, tileable on all four edges, "
            f"clear gameplay readability at 32x32, limited clean palette, crisp clean edges, "
            f"no object icon, no character, no UI, no border frame, no preview grid, no text, no letters"
        ),
        "ui": (
            f"cartoon animal mobile game UI sprite asset, {tw}x{th}, subject: {ui_subject}, "
            f"{tw}x{th}, {SEGMENTATION_BACKGROUND}, "
            f"safe transparent margin unless the asset is a full background panel, "
            f"single isolated reusable UI sprite only, clean shape, crisp clean edges, bright cartoon animal adventure HUD style, "
            f"no embedded text, no letters, no numbers, no fake labels, no screenshot, no full UI mockup, "
            f"no character portrait, no emoji, no watermark, {TRANSPARENT_SUBJECT_CONTRACT}"
        ),
    }
    if needs_alpha:
        fallback_bg = f"{SEGMENTATION_BACKGROUND}, {TRANSPARENT_SUBJECT_CONTRACT}"
    else:
        fallback_bg = "complete opaque rectangular game asset"
    base = prompts.get(cat, f"cartoon animal game asset, {tw}x{th}, {fallback_bg}, crisp clean edges")
    if item.get("action") == "rework_visual_safety":
        base += (
            ", visual-safety rework version, family-friendly fantasy UI asset, "
            "clean abstract decorative shapes, soft glow, simple readable silhouette"
        )
    if item.get("path", "").replace("\\", "/").startswith("ui/death/"):
        base += (
            ", family-friendly adventure result UI, calm magical crystal theme, "
            "soft purple and gold palette, blank unlabeled game interface asset, "
            "friendly neutral mood, soft glow, clean decorative shapes"
        )
    negative = (
        "Negative prompt: text, letters, words, watermark, signature, logo, "
        "checkerboard, gray background, preview background, UI mockup, screenshot, "
        "portrait, avatar, emoji, face-only image, cropped head, decorative fake writing, "
        "blood, gore, splatter, dripping blood, wound, injury, impalement, realistic heart, organs, "
        "skull, skull icon, skull emblem, skeleton head, bones, corpse, severed body parts, "
        "crossed axes, crossed weapons, horror face, frightening gore, "
        "grimdark, gothic, horror style, scary badge style, heavy black metal UI, "
        "muddy low-saturation palette, photorealistic, 3d render, smooth blurry edges, jpeg artifacts."
    )
    detail_anchor = DETAIL_ANCHORS.get(cat, "")
    return base + ", " + STYLE_ANCHOR + ", " + detail_anchor + ", " + NT + ", " + APPROVAL_SAFE + ", " + negative


def validate_prompt_coverage(items, require_all=False):
    prompts_cache = _load_prompts_cache()
    missing = [
        item["path"].replace("\\", "/").removeprefix("textures/")
        for item in items
        if item["path"].replace("\\", "/").removeprefix("textures/") not in prompts_cache
    ]
    if missing:
        print(f"[WARN] prompts.json is missing {len(missing)} asset prompts")
        for path in missing[:10]:
            print(f"  missing prompt: {path}")
        if require_all:
            raise RuntimeError("full rebuild requires prompts.json coverage for every selected asset")
    else:
        print(f"  [prompts] all {len(items)} selected assets have dedicated prompts.json prompts")


def alpha_is_effectively_opaque(img):
    if img.mode != "RGBA":
        return False
    lo, hi = img.getchannel("A").getextrema()
    return lo == 255 and hi == 255


def transparent_ratio(img):
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A")
    total = rgba.size[0] * rgba.size[1]
    transparent = sum(1 for value in alpha.getdata() if value == 0)
    return transparent / total if total else 0.0


def requires_transparency(item):
    has_alpha = str(item.get("has_alpha", "True")).strip().lower()
    if has_alpha in ("false", "0", "no", "none"):
        return False
    return item.get("category") in TRANSPARENCY_REQUIRED_CATEGORIES


def min_transparent_ratio(item):
    category = item.get("category")
    path = item.get("path", "").replace("\\", "/")
    if category == "ui":
        w = int(item.get("final_target_w") or item.get("target_w") or 0)
        h = int(item.get("final_target_h") or item.get("target_h") or 0)
        # Tiny UI slices and map icons often intentionally fill almost the whole
        # canvas. Requiring the same 2% transparent margin as large panels causes
        # false failures for valid 20-32px assets such as panel_bg or room icons.
        if min(w, h) <= 32 or path.startswith("ui/map/"):
            return 0.003
    return MIN_TRANSPARENT_RATIO_BY_CATEGORY.get(category, 0.0)


def transparent_subject_structure_error(img, item):
    """Validate transparent subject geometry before runtime export."""
    category = item.get("category", "")
    if category not in {"characters", "monsters", "bosses", "icons", "ui"}:
        return ""
    rgba = img.convert("RGBA")
    w, h = rgba.size
    bbox = rgba.getchannel("A").getbbox()
    if not bbox:
        return "empty_alpha_subject"
    x0, y0, x1, y1 = bbox
    bbox_w = x1 - x0
    bbox_h = y1 - y0
    bbox_area_ratio = (bbox_w * bbox_h) / max(1, w * h)
    margin = max(1, int(min(w, h) * 0.01))

    if category in {"characters", "monsters", "bosses", "icons"}:
        if x0 <= margin or y0 <= margin or x1 >= w - margin or y1 >= h - margin:
            return f"subject touches canvas edge: bbox={bbox}"

    if category == "icons":
        if bbox_area_ratio < 0.18:
            return f"icon subject too small: bbox_area={bbox_area_ratio:.1%}"
        if bbox_area_ratio > 0.86:
            return f"icon subject/backplate too large: bbox_area={bbox_area_ratio:.1%}"
    elif category in {"monsters", "characters"}:
        if bbox_area_ratio < 0.22:
            return f"{category} subject too small: bbox_area={bbox_area_ratio:.1%}"
    elif category == "bosses":
        if bbox_area_ratio < 0.16:
            return f"boss subject too small: bbox_area={bbox_area_ratio:.1%}"
    return ""


def size_limits_kb(item):
    """Return (warning_limit, hard_limit) in KB for generation validation."""
    cat = item.get("category", "")
    target_kb = int(item.get("target_size_kb", "0") or "0")
    path = item.get("path", "").replace("\\", "/").lower()
    tw = int(item.get("final_target_w") or item.get("target_w") or 0)
    th = int(item.get("final_target_h") or item.get("target_h") or 0)

    if cat == "effects":
        return EFFECTS_WARNING_KB, EFFECTS_HARD_LIMIT_KB

    if cat == "icons":
        return ICON_WARNING_KB, ICON_HARD_LIMIT_KB

    if cat == "ui":
        warning = target_kb * 2 if target_kb > 0 else 0
        hard = target_kb * 4 if target_kb > 0 else 0
        if any(key in path for key in ("slot", "rarity_", "btn_", "button")):
            hard = max(hard, UI_SLOT_HARD_FLOOR_KB)
        if any(key in path for key in ("panel", "_bg", "body_frame", "death_bg", "shop_bg", "main_bg")) or (tw * th >= 50000):
            hard = max(hard, UI_PANEL_HARD_FLOOR_KB)
        hard = max(hard, UI_DEFAULT_HARD_FLOOR_KB)
        return warning, hard

    if cat == "bosses":
        if th > tw:
            return 256, max(BOSS_HARD_LIMIT_KB, 768)
        return 0, BOSS_HARD_LIMIT_KB

    if cat == "monsters":
        return 0, MONSTER_HARD_LIMIT_KB

    if cat == "backgrounds":
        return BACKGROUND_WARNING_KB, BACKGROUND_HARD_LIMIT_KB

    if cat == "characters":
        if th > tw:
            return 128, CHARACTER_HARD_LIMIT_KB
        return 0, 256

    return 0, target_kb * 2 if target_kb > 0 else 0


def category_quality_policy(category):
    return {
        "requires_transparency": category in TRANSPARENCY_REQUIRED_CATEGORIES,
        "matte_removal": category in MATTE_CATEGORIES,
        "initial_palette": INITIAL_PALETTE_COLORS.get(category, "full_color"),
        "palette_retry": PALETTE_RETRY_STEPS.get(category, ()),
        "sharpen": category not in ("backgrounds", "tiles", "effects"),
    }


# ======== Agnes API (environment variable + retry + rate limit) ========
def get_api_key():
    key = os.environ.get("AGNES_API_KEY", "")
    if not key:
        print("[FATAL] environment variable AGNES_API_KEY is not set")
        print("    PowerShell: $env:AGNES_API_KEY=\"sk-xxx\"")
        sys.exit(1)
    return key


def ensure_safe_output_path(path):
    dst = os.path.abspath(os.path.join(REPLACE_DIR, path.replace("/", os.sep)))
    root = os.path.abspath(REPLACE_DIR)
    if not dst.lower().startswith(root.lower() + os.sep):
        raise ValueError(f"unsafe output path outside runtime_replace: {path}")
    return dst


def ensure_safe_aux_path(root_dir, path, ext=None):
    rel = path.replace("/", os.sep)
    if ext:
        rel = os.path.splitext(rel)[0] + ext
    dst = os.path.abspath(os.path.join(root_dir, rel))
    root = os.path.abspath(root_dir)
    if not dst.lower().startswith(root.lower() + os.sep):
        raise ValueError(f"unsafe output path outside {root_dir}: {path}")
    return dst


def ensure_safe_master_path(path):
    return ensure_safe_aux_path(MASTER_DIR, path)


def save_master_png(img, item):
    """Save the postprocessed high-quality master before runtime size gates."""
    master_path = ensure_safe_master_path(item["path"])
    os.makedirs(os.path.dirname(master_path), exist_ok=True)
    master_img = img.convert("RGBA") if requires_transparency(item) else img.convert("RGB")
    master_img.save(master_path, format="PNG", optimize=True)
    return master_path


def save_master_after_structure_checks(img, item):
    """Return cleaned image, save review master, and report visible residue issues."""
    master_path = save_master_png(img, item)
    structure_error = transparent_subject_structure_error(img, item)
    if structure_error:
        return img, master_path, structure_error
    return img, master_path, ""


def save_background_runtime_candidate(img, item, target_kb=BACKGROUND_WARNING_KB):
    """Write a JPG candidate for backgrounds whose PNG runtime export is too large."""
    if item.get("category") != "backgrounds":
        return ""
    candidate_path = ensure_safe_aux_path(RUNTIME_CANDIDATE_DIR, item["path"], ext=".jpg")
    os.makedirs(os.path.dirname(candidate_path), exist_ok=True)
    rgb = img.convert("RGB")
    best_path = candidate_path
    for quality in (85, 80, 75, 70):
        rgb.save(candidate_path, format="JPEG", quality=quality, optimize=True, progressive=True)
        size_kb = os.path.getsize(candidate_path) // 1024
        if size_kb <= target_kb:
            break
    return best_path


def result_dict(path, status, actual_size_kb=0, mode="", error="", master_path="", runtime_candidate=""):
    return {
        "path": path,
        "status": status,
        "actual_size_kb": actual_size_kb,
        "mode": mode,
        "error": error,
        "master_path": master_path,
        "runtime_candidate": runtime_candidate,
    }


def call_agnes(prompt, retry=MAX_RETRIES):
    import urllib.request
    api_key = get_api_key()

    for attempt in range(1, retry + 1):
        try:
            data = json.dumps({
                "model": "agnes-image-2.1-flash",
                "prompt": prompt,
                "n": 1,
                "size": "1024x1024"
            }).encode("utf-8")
            req = urllib.request.Request(AGNES_URL, data=data)
            req.add_header("Content-Type", "application/json")
            req.add_header("Authorization", f"Bearer {api_key}")

            with urllib.request.urlopen(req, timeout=120) as r:
                body = r.read().decode("utf-8")
                result = json.loads(body)
                return result["data"][0]["url"]

        except Exception as e:
            if attempt < retry:
                wait = RETRY_DELAY * attempt
                print(f"    [retry {attempt}/{retry}] {type(e).__name__}, waiting {wait}s...")
                time.sleep(wait)
            else:
                raise


def download(url, dst_path):
    import urllib.request
    with urllib.request.urlopen(url, timeout=120) as r:
        with open(dst_path, "wb") as f:
            f.write(r.read())


# ======== Character Frame-by-Frame Generation (single frames -> sprite sheet) ========
def gen_one_character(item):
    """Generate character sprite sheets by calling AI per frame, resizing, then stacking vertically."""
    path = item["path"]
    tw = int(item["final_target_w"])
    th = int(item["final_target_h"])
    fw = int(item.get("csv_frame_w") or tw)
    fh = int(item.get("csv_frame_h") or th)
    if item.get("category") == "bosses" and th > tw:
        fw = tw
        fh = tw
    frames = max(1, round(th / max(1, fh))) if th > fh else 1
    dst = ensure_safe_output_path(path)
    tmp_dst = dst + ".tmp.png"
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    os.makedirs(RAW_DIR, exist_ok=True)
    master_path = ""

    base_prompt = build_prompt(item)
    action_name = os.path.basename(path).replace(".png", "").split("_")[-1]

    # Empty canvas used to stack generated frames.
    canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))

    try:
        for i in range(frames):
            # Convert sprite-sheet wording to single-frame wording and add frame index.
            frame_prompt = base_prompt
            frame_prompt = frame_prompt.replace(
                "sprite sheet format with clear frame divisions",
                f"single frame {i+1} of {frames}, character centered in frame"
            )
            frame_prompt = frame_prompt.replace(
                "sprite sheet format with evenly spaced frames and no merged poses",
                f"single frame {i+1} of {frames}, character centered in frame"
            )
            frame_prompt = frame_prompt.replace(
                "sprite sheet for",
                "single frame for"
            )
            frame_prompt += (
                f" This is frame {i+1} of {frames} in a {action_name} animation sequence. "
                f"Show the character in pose for step {i+1} of the {action_name} animation. "
                f"Final frame canvas is {fw}x{fh}; the full body must be centered vertically and horizontally. "
                "The character must fill 75 to 85 percent of the frame height, with no huge empty top or bottom space. "
                "Do not place the character at the bottom edge. "
                "No colored aura, no solid color blob, no shield shape, no backdrop shape, no background patch behind the character. "
                "Only the character body, clothing, weapon, and a removable plain light neutral segmentation background. "
                + TRANSPARENT_SUBJECT_CONTRACT
            )

            raw_name = path.replace("/", "_").replace("\\", "_") + f"_frame{i}.png"
            raw_path = os.path.join(RAW_DIR, raw_name)

            url = call_agnes(frame_prompt)
            download(url, raw_path)

            frame_img = Image.open(raw_path).convert("RGBA")

            # Remove matte background. Bosses use lower tolerance to preserve dark edges.
            cat = item["category"]
            if cat in MATTE_CATEGORIES and requires_transparency(item):
                tol = 40 if cat == "bosses" else 72
                margin = 0.05 if cat in ("characters", "bosses") else 0.08
                frame_img = postprocess_sprite_like(frame_img, cat, fw, fh, tolerance=tol, margin_ratio=margin)
            else:
                frame_img = frame_img.resize((fw, fh), Image.Resampling.LANCZOS)
                frame_img = sharpen_for_category(frame_img, cat)

            alpha_saved = frame_img.getchannel("A")
            frame_img.putalpha(alpha_saved)

            # Paste into the corresponding vertical sprite-sheet slot.
            y_offset = i * fh
            canvas.paste(frame_img, (0, y_offset), frame_img)

            # Clean raw download.
            try:
                os.remove(raw_path)
            except OSError:
                pass

        canvas, master_path, structure_error = save_master_after_structure_checks(canvas, item)
        if structure_error:
            return result_dict(
                path,
                "structure_failed",
                0,
                "RGBA",
                structure_error,
                master_path=master_path,
            )

        # Palette reduction: keep higher color counts for characters/Bosses to avoid muddy colors.
        if item.get("category") in INITIAL_PALETTE_COLORS:
            canvas = quantize_preserve_alpha(canvas, INITIAL_PALETTE_COLORS[item.get("category")])

        # Save runtime PNG.
        canvas.save(tmp_dst, format="PNG", optimize=True)

        size_kb = os.path.getsize(tmp_dst) // 1024
        mode = canvas.mode

        # File size gate.
        warning_limit_kb, hard_limit_kb = size_limits_kb(item)
        if hard_limit_kb > 0 and size_kb > hard_limit_kb:
            try:
                os.remove(tmp_dst)
            except OSError:
                pass
            return result_dict(
                path,
                "export_size_failed",
                size_kb,
                mode,
                f"runtime PNG {size_kb}KB > {hard_limit_kb}KB hard limit; master preserved",
                master_path=master_path,
            )

        os.replace(tmp_dst, dst)
        status = "size_warning" if warning_limit_kb and size_kb > warning_limit_kb else "exported_runtime"
        warning = f"{size_kb}KB > {warning_limit_kb}KB warning" if status == "size_warning" else ""
        return result_dict(path, status, size_kb, mode, warning, master_path=master_path)

    except Exception as e:
        if os.path.exists(tmp_dst):
            try:
                os.remove(tmp_dst)
            except OSError:
                pass
        return result_dict(path, "failed", 0, "RGBA", f"{type(e).__name__}: {e}")


# ======== Single Asset Generation ========
def gen_one(item):
    """Generate one asset and return its result dict."""
    path = item["path"]
    tw = int(item["final_target_w"])
    th = int(item["final_target_h"])

    # Multi-frame character/Boss sprites are generated frame-by-frame and stacked.
    cat = item["category"]
    if cat in ("characters", "bosses"):
        fh = int(item.get("csv_frame_h") or th)
        # For bosses: frame_h = tw (from build_prompt logic)
        if cat == "bosses" and th > tw:
            fh = tw
        frames = max(1, round(th / max(1, fh))) if th > fh else 1
        if frames > 1:
            return gen_one_character(item)

    dst = ensure_safe_output_path(path)
    tmp_dst = dst + ".tmp.png"
    os.makedirs(os.path.dirname(dst), exist_ok=True)

    # Keep raw downloads under textures_review/raw/ for debugging failed outputs.
    os.makedirs(RAW_DIR, exist_ok=True)
    raw_name = path.replace("/", "_").replace("\\", "_")
    raw_path = os.path.join(RAW_DIR, raw_name)
    master_path = ""

    try:
        if cat == "tiles":
            tile_master_img, img, tile_metrics = generate_procedural_tile(item)
            master_path = save_master_png(tile_master_img, item)
            tmp_img = img.convert("RGB")
            tmp_img.save(tmp_dst, format="PNG", optimize=True)
            size_kb = os.path.getsize(tmp_dst) // 1024
            mode = tmp_img.mode
            tile_preview = save_tile_repeat_preview(tmp_img, item)
            center_score = float(tile_metrics.get("tile_center_score", 0))
            edge_distance = float(tile_metrics.get("tile_edge_distance", 0))
            hotspot_score = float(tile_metrics.get("tile_hotspot_score", 0))
            metric_note = ", ".join(f"{k}={v}" for k, v in tile_metrics.items())
            if center_score > 18 or edge_distance > 35 or hotspot_score > 10:
                try:
                    os.remove(tmp_dst)
                except OSError:
                    pass
                return result_dict(
                    path,
                    "structure_failed",
                    size_kb,
                    mode,
                    f"procedural tile quality failed: {metric_note}; master and repeat preview preserved",
                    master_path=master_path,
                    runtime_candidate=tile_preview,
                )
            os.replace(tmp_dst, dst)
            return result_dict(
                path,
                "exported_runtime",
                size_kb,
                mode,
                metric_note,
                master_path=master_path,
                runtime_candidate=tile_preview,
            )

        if cat == "effects":
            master_img, img, effect_metrics = generate_procedural_effect(item)
            master_path = save_master_png(master_img, item)
            img.save(tmp_dst, format="PNG", optimize=True)
            size_kb = os.path.getsize(tmp_dst) // 1024
            if alpha_is_effectively_opaque(img):
                try:
                    os.remove(tmp_dst)
                except OSError:
                    pass
                return result_dict(path, "failed_alpha", 0, "RGBA", "procedural effect alpha failed", master_path=master_path)
            os.replace(tmp_dst, dst)
            metric_note = ", ".join(f"{k}={v}" for k, v in effect_metrics.items())
            return result_dict(path, "exported_runtime", size_kb, img.mode, metric_note, master_path=master_path)

        prompt = build_prompt(item)
        if cat == "tiles":
            prompt = build_tile_source_prompt(prompt)
        url = call_agnes(prompt)
        download(url, raw_path)

        img = Image.open(raw_path).convert("RGBA")
        tile_master_img = None
        tile_metrics = {}

        # Effects use black-matte extraction: generate on pure black, then derive alpha from brightness.
        if cat == "tiles":
            tile_master_img, img, tile_metrics = process_tile_texture(img, tw, th)

        elif cat == "effects" and requires_transparency(item):
            img = img.resize((tw, th), Image.Resampling.LANCZOS)
            img = apply_black_matte_alpha(img)

        # Sprite-like assets use edge-connected matte removal. This avoids deleting dark internal details.
        # Bosses use lower tolerance (40) to avoid eating dark edges.
        elif cat in MATTE_CATEGORIES and requires_transparency(item):
            tol = 40 if cat == "bosses" else 72
            if cat == "ui":
                margin = 0.02 if min(tw, th) <= 40 else 0.04
            elif cat in ("characters", "bosses"):
                margin = 0.05
            else:
                margin = 0.08
            img = postprocess_sprite_like(img, cat, tw, th, tolerance=tol, margin_ratio=margin)
        else:
            img = img.resize((tw, th), Image.Resampling.LANCZOS)
            img = sharpen_for_category(img, cat)

        if tile_master_img is not None:
            master_path = save_master_png(tile_master_img, item)
        else:
            img, master_path, structure_error = save_master_after_structure_checks(img, item)
            if structure_error:
                return result_dict(
                    path,
                    "structure_failed",
                    0,
                    "RGBA" if requires_transparency(item) else img.mode,
                    structure_error,
                    master_path=master_path,
                )

        # Palette reduction: keep enough colors so UI/icons do not become muddy blocks.
        if cat in INITIAL_PALETTE_COLORS:
            img = quantize_preserve_alpha(img, INITIAL_PALETTE_COLORS[cat])

        if not requires_transparency(item):
            img = img.convert("RGB")

        # Simple particles on plain backgrounds compress well; no extra pass needed.

        # If postprocessing still leaves a fully opaque image, fail it.
        if requires_transparency(item) and alpha_is_effectively_opaque(img):
            return result_dict(path, "failed", 0, "RGBA", "alpha_opaque: alpha extraction failed", master_path=master_path)
        img.save(tmp_dst, format="PNG", optimize=True)

        # Generation succeeded; clean raw download.
        try:
            os.remove(raw_path)
        except OSError:
            pass

        size_kb = os.path.getsize(tmp_dst) // 1024
        mode = img.mode

        # File size gates:
        # - effects: 80KB warning, 128KB runtime export hard limit
        # - ui: target*2 warning, category-specific hard floor
        # - oversized runtime export preserves the master instead of deleting the asset
        warning_limit_kb, hard_limit_kb = size_limits_kb(item)

        if hard_limit_kb > 0 and size_kb > hard_limit_kb:
            # Effects/icons/ui can usually be brought back under budget by reducing palette,
            # but never crush UI/icon colors to 4-8 colors because that visibly destroys assets.
            if cat in PALETTE_RETRY_STEPS:
                for color_count in PALETTE_RETRY_STEPS[cat]:
                    retry_img = quantize_preserve_alpha(img, color_count)
                    retry_img.save(tmp_dst, format="PNG", optimize=True)
                    size_kb = os.path.getsize(tmp_dst) // 1024
                    if size_kb <= hard_limit_kb:
                        img = retry_img
                        break

            if size_kb > hard_limit_kb:
                runtime_candidate = save_background_runtime_candidate(img, item)
                try:
                    os.remove(tmp_dst)
                except OSError:
                    pass
                return result_dict(
                    path,
                    "export_size_failed",
                    size_kb,
                    mode,
                    f"runtime PNG {size_kb}KB > {hard_limit_kb}KB hard limit; master preserved",
                    master_path=master_path,
                    runtime_candidate=runtime_candidate,
                )

        # Postprocess alpha guard: all-255 alpha means transparency extraction failed.
        if requires_transparency(item) and img.mode == "RGBA" and alpha_is_effectively_opaque(img):
            try:
                os.remove(tmp_dst)
            except OSError:
                pass
            return result_dict(
                path,
                "failed",
                size_kb,
                "RGBA",
                "alpha_opaque after neutral background removal",
                master_path=master_path,
            )

        min_ratio = min_transparent_ratio(item)
        if min_ratio and transparent_ratio(img) < min_ratio:
            try:
                os.remove(tmp_dst)
            except OSError:
                pass
            return result_dict(
                path,
                "failed_alpha",
                size_kb,
                "RGBA",
                f"{cat} transparent area too small: {transparent_ratio(img):.1%} < {min_ratio:.0%}",
                master_path=master_path,
            )

        # Clean raw download.
        try:
            os.remove(raw_path)
        except OSError:
            pass

        tile_preview = save_tile_repeat_preview(img, item) if cat == "tiles" else ""
        if cat == "tiles" and tile_metrics:
            center_score = float(tile_metrics.get("tile_center_score", 0))
            edge_distance = float(tile_metrics.get("tile_edge_distance", 0))
            hotspot_score = float(tile_metrics.get("tile_hotspot_score", 0))
            if center_score > 18 or edge_distance > 35 or hotspot_score > 10:
                try:
                    os.remove(tmp_dst)
                except OSError:
                    pass
                metric_note = ", ".join(f"{k}={v}" for k, v in tile_metrics.items())
                return result_dict(
                    path,
                    "structure_failed",
                    size_kb,
                    mode,
                    f"tile repeat quality failed: {metric_note}; master and repeat preview preserved",
                    master_path=master_path,
                    runtime_candidate=tile_preview,
                )
        status = "size_warning" if warning_limit_kb and size_kb > warning_limit_kb else "exported_runtime"
        warning = f"{size_kb}KB > {warning_limit_kb}KB warning" if status == "size_warning" else ""
        if tile_metrics:
            metric_note = ", ".join(f"{k}={v}" for k, v in tile_metrics.items())
            warning = (warning + "; " if warning else "") + metric_note
        os.replace(tmp_dst, dst)
        return result_dict(path, status, size_kb, mode, warning, master_path=master_path, runtime_candidate=tile_preview)

    except Exception as e:
        try:
            os.remove(tmp_dst)
        except OSError:
            pass
        # Keep raw download for debugging.
        return result_dict(path, "failed", 0, "", f"{type(e).__name__}: {e}", master_path=master_path)


# ======== Batch Loop ========
def _load_progress():
    """Try to load the saved progress file."""
    try:
        if os.path.exists(PROGRESS):
            with open(PROGRESS) as f:
                return json.load(f)
    except (json.JSONDecodeError, OSError):
        pass
    return {}


def _is_output_valid(dst):
    """Check that the output file exists and is a valid PNG."""
    if not os.path.exists(dst):
        return False
    try:
        with Image.open(dst) as im:
            im.verify()
        return True
    except Exception:
        return False


def generate_batch(items, overwrite=False, force_regenerate=False):
    """Generate one batch and return result rows."""
    results = []
    total = len(items)

    # Resume support: skip previously completed outputs when allowed.
    saved_progress = _load_progress()
    completed_set = set(saved_progress.get("completed_paths", [])) if isinstance(saved_progress, dict) else set()
    resumed_count = 0

    for i, item in enumerate(items):
        path = item["path"]
        dst = ensure_safe_output_path(path)

        # Skip policy: full rebuild ignores progress; normal/resume runs may skip completed paths.
        if os.path.exists(dst) and _is_output_valid(dst):
            if not overwrite:
                sz = os.path.getsize(dst) // 1024
                print(f"  [{i+1}/{total}] [skip] {path} ({sz}KB)")
                results.append(result_dict(path, "skipped", sz, "RGBA", ""))
                continue
            elif overwrite and not force_regenerate and path in completed_set:
                sz = os.path.getsize(dst) // 1024
                print(f"  [{i+1}/{total}] [resume-skip] {path} ({sz}KB) - confirmed complete")
                results.append(result_dict(path, "skipped", sz, "RGBA", ""))
                resumed_count += 1
                continue
            # With overwrite and no completed marker, regenerate normally.

        print(f"  [{i+1}/{total}] {path} -> {item['final_target_w']}x{item['final_target_h']} ...", end=" ", flush=True)
        result = gen_one(item)

        if result["status"] in OK_STATUSES:
            print(f"{result['actual_size_kb']}KB")
        elif result["status"] == "export_size_failed":
            print(f"EXPORT SIZE FAIL: {result['error'][:80]}")
        else:
            print(f"FAIL: {result['error'][:80]}")

        results.append(result)

        # Rate-limit between image requests.
        if i < total - 1:
            time.sleep(1.5)

        # Save progress, including completed paths for resume.
        completed = [r["path"] for r in results if r["status"] in OK_STATUSES]
        with open(PROGRESS, "w") as f:
            json.dump({
                "last_index": i,
                "generated": sum(1 for r in results if r["status"] in OK_STATUSES),
                "failed": sum(1 for r in results if r["status"] not in OK_STATUSES),
                "completed_paths": completed,
                "total": total,
            }, f)

    if resumed_count > 0:
        print(f"\n  [resume] skipped {resumed_count} confirmed completed files")

    return results


# ======== Reports ========
def write_batch_report(results, batch_name):
    fields = ["path", "status", "actual_size_kb", "mode", "error", "master_path", "runtime_candidate"]
    report_path = os.path.join(REPORT_DIR, f"gen_batch_{batch_name}_report.csv")
    os.makedirs(REPORT_DIR, exist_ok=True)
    with open(report_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for row in results:
            w.writerow({field: row.get(field, "") for field in fields})

    ok = sum(1 for r in results if r["status"] in OK_STATUSES)
    fail = sum(1 for r in results if r["status"] not in OK_STATUSES)
    print(f"\n  [{batch_name.upper()}] {ok} OK, {fail} FAIL | report: {report_path}")


# ======== Validation ========
def validate_batch(items, batch_name):
    errors = []
    for item in items:
        path = item["path"]
        dst = ensure_safe_output_path(path)
        if not os.path.exists(dst):
            errors.append({"path": path, "issue": "missing"})
            continue
        try:
            img = Image.open(dst)
            ew, eh = int(item["final_target_w"]), int(item["final_target_h"])
            if img.size != (ew, eh):
                errors.append({"path": path, "issue": f'size: {img.size} != {ew}x{eh}'})
            if img.mode not in ("RGBA", "RGB"):
                errors.append({"path": path, "issue": f'mode: {img.mode}'})
            if requires_transparency(item):
                rgba = img.convert("RGBA")
                if alpha_is_effectively_opaque(rgba):
                    errors.append({"path": path, "issue": "alpha_opaque"})
                structure_error = transparent_subject_structure_error(rgba, item)
                if structure_error:
                    errors.append({"path": path, "issue": structure_error})
            min_ratio = min_transparent_ratio(item)
            if min_ratio and transparent_ratio(img) < min_ratio:
                errors.append({
                    "path": path,
                    "issue": f"{item.get('category')}_low_transparent_ratio:{transparent_ratio(img):.1%}<{min_ratio:.0%}",
                })
            img.close()
        except Exception as e:
            errors.append({"path": path, "issue": str(e)})

    report_path = os.path.join(REPORT_DIR, f"validate_batch_{batch_name}.csv")
    os.makedirs(REPORT_DIR, exist_ok=True)
    with open(report_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=["path", "issue"])
        w.writeheader()
        w.writerows(errors)

    print(f"  validate: {len(items)} files, {len(errors)} errors")
    if errors:
        print(f"  details: {report_path}")


# ======== Contact Sheet (fixed 96x96 cells) ========
def make_contact_sheet(items, batch_name, cols=8, cell_size=96):
    """Build a contact sheet with fixed 96x96 cells and centered thumbnails."""
    valid = []
    for item in items:
        dst = ensure_safe_output_path(item["path"])
        if os.path.exists(dst):
            valid.append(item)

    if not valid:
        print("  [contact] no valid files, skip")
        return

    gap = 4
    sheet_w = cols * (cell_size + gap) + gap
    rows = math.ceil(len(valid) / cols)
    sheet_h = rows * (cell_size + gap) + gap + 20
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (30, 30, 30, 255))
    draw = ImageDraw.Draw(sheet)

    for idx, item in enumerate(valid):
        dst = ensure_safe_output_path(item["path"])
        try:
            img = Image.open(dst)
            img.thumbnail((cell_size - 4, cell_size - 4), Image.NEAREST)
            col = idx % cols
            row = idx // cols
            cx = gap + col * (cell_size + gap) + (cell_size - img.width) // 2
            cy = gap + row * (cell_size + gap) + (cell_size - img.height) // 2 + 20  # title row space
            sheet.paste(img, (cx, cy), img if img.mode == "RGBA" else None)
        except Exception:
            pass

    sheet_path = os.path.join(REPORT_DIR, f"contact_{batch_name}.png")
    sheet.save(sheet_path, format="PNG")
    print(f"  Contact sheet: {sheet_path}")


# ======== Main Entry ========
def main():
    import sys

    batch_filter = None
    category_filter = None
    only_paths = set()
    overwrite = False
    resume_failed = False
    include_rework_effects = False
    include_safety_rework = False
    include_boss_rework = False
    full_rebuild_179 = False
    full_rebuild_all = False
    allow_all = False
    dry_run = False
    mode = "gen"
    test_n = 0

    for arg in sys.argv[1:]:
        if arg.startswith("--batch="):
            batch_filter = arg.split("=")[1]
        elif arg.startswith("--category="):
            category_filter = arg.split("=")[1]
        elif arg.startswith("--only="):
            only_paths.add(arg.split("=", 1)[1].replace("\\", "/").removeprefix("textures/"))
        elif arg == "--overwrite":
            overwrite = True
        elif arg == "--resume-failed":
            resume_failed = True
        elif arg == "--include-rework-effects":
            include_rework_effects = True
        elif arg == "--include-safety-rework":
            include_safety_rework = True
        elif arg == "--rework-bosses":
            include_boss_rework = True
            overwrite = True
        elif arg == "--full-rebuild-179":
            full_rebuild_179 = True
            overwrite = True
            include_rework_effects = False
            include_safety_rework = False
        elif arg in ("--full-rebuild-all", "--full-rebuild-418"):
            full_rebuild_all = True
            overwrite = True
            include_rework_effects = False
            include_safety_rework = False
            include_boss_rework = False
        elif arg == "--all":
            allow_all = True
        elif arg == "--dry-run":
            dry_run = True
        elif arg.startswith("--test="):
            test_n = int(arg.split("=")[1])
        elif arg == "contact":
            mode = "contact"
        elif mode == "contact":
            batch_filter = arg

    if full_rebuild_all:
        all_items = read_manifest_all()
    else:
        all_items = read_spec()
    if include_rework_effects and not full_rebuild_179 and not full_rebuild_all:
        all_items.extend(read_rework_effects())
    if include_safety_rework and not full_rebuild_179 and not full_rebuild_all:
        all_items.extend(read_safety_reworks())
    if include_boss_rework and not full_rebuild_all:
        boss_items = read_boss_reworks()
        all_items.extend(boss_items)
    all_items = dedupe_items_prefer_rework(all_items)
    if batch_filter:
        all_items = [i for i in all_items if i["batch"] == batch_filter]
    if category_filter:
        if full_rebuild_all:
            all_items = [i for i in all_items if i["category"] == category_filter]
        else:
            # Non-full mode keeps old behavior: load a full category from manifest.
            manifest_items = read_manifest_category(category_filter)
            if len(manifest_items) > 0:
                all_items = manifest_items
            else:
                all_items = [i for i in all_items if i["category"] == category_filter]
    if only_paths:
        all_items = [i for i in all_items if i["path"].replace("\\", "/").removeprefix("textures/") in only_paths]
    if test_n > 0:
        all_items = all_items[:test_n]

    validate_prompt_coverage(all_items, require_all=full_rebuild_all)

    is_unfiltered_manifest_run = full_rebuild_all and not category_filter and not only_paths
    if is_unfiltered_manifest_run and not allow_all:
        print("[SAFE STOP] full manifest list selected.")
        print("  To avoid accidental full overwrite, generation must specify --category or --only.")
        print("  Examples:")
        print("    python E:\\game\\tools\\gen_missing_179.py --full-rebuild-all --category=effects --dry-run")
        print("    python E:\\game\\tools\\gen_missing_179.py --full-rebuild-all --category=effects")
        print("  If you truly need full rebuild of all assets, pass --all explicitly.")
        if dry_run:
            print("  dry-run continues and prints full list stats.")
        else:
            return

    if dry_run:
        counts = defaultdict(int)
        for item in all_items:
            counts[item.get("category", "")] += 1
        print("\n[DRY RUN] Agnes is not called and PNG files are not written")
        print(f"  selected: {len(all_items)}")
        for cat in sorted(counts):
            policy = category_quality_policy(cat)
            print(
                f"  {cat}: {counts[cat]} | "
                f"alpha={policy['requires_transparency']} matte={policy['matte_removal']} "
                f"palette={policy['initial_palette']} sharpen={policy['sharpen']}"
                f"{' | procedural_no_agnes=True' if cat in ('tiles', 'effects') else ''}"
            )
        return

    if mode == "contact":
        batch_name = batch_filter or "all"
        make_contact_sheet(all_items, batch_name)
        return

    # Check AGNES_API_KEY only for categories that still call Agnes.
    # Procedural tiles/effects do not call the API and do not need a key.
    needs_agnes = any(item.get("category") not in ("tiles", "effects") for item in all_items)
    if needs_agnes and not os.environ.get("AGNES_API_KEY", ""):
        print("[FATAL] environment variable AGNES_API_KEY is not set")
        print("   PowerShell: $env:AGNES_API_KEY=\"sk-xxx\"")
        sys.exit(1)

    batch_name = category_filter or batch_filter or ("all" if allow_all else "selected")
    label = f"{batch_name} ({'test ' + str(test_n) if test_n else str(len(all_items)) + ' files'})"
    if full_rebuild_179:
        label += " | FULL REBUILD 179, overwrite enabled"
    if full_rebuild_all:
        label += " | MANIFEST REBUILD, overwrite enabled, prompts.json required"
        if allow_all:
            label += " | --all confirmed"
    if include_boss_rework:
        label += " | + BOSS REWORK 120"
    print(f"=== {label} ===")

    results = generate_batch(all_items, overwrite, force_regenerate=(full_rebuild_179 or full_rebuild_all))
    write_batch_report(results, batch_name)
    validate_batch(all_items, batch_name)
    make_contact_sheet(all_items, batch_name)

    failed = [r for r in results if r["status"] not in OK_STATUSES]
    if failed:
        print(f"\n[WARN] {len(failed)} files failed:")
        for f in failed[:3]:
            print(f"  {f['path']}: {f['error'][:80]}")
        print(f"\n  retry: python gen_missing_179.py --batch={batch_name}  (existing valid files will be skipped)")
        sys.exit(1)

    print(f"\n[OK] {batch_name} batch complete!")


if __name__ == "__main__":
    main()
