#!/usr/bin/env python3
"""Rewrite 5 prompts per 美术资源边缘切割感根因治理方案 document."""
import json

with open('E:/game/assets/resources/config/prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# ===== 3.1 整屏背景 — splash_bg.jpg =====
data['ui/splash/splash_bg.jpg'] = (
    "Full-screen integrated cartoon animal adventure background for a horizontal mobile game interface. "
    "One continuous hand-painted scene with shared warm forest lighting, rounded friendly shapes, "
    "flowers, leaves, gems, paw motifs, soft magic sparkles, and calm readable runtime UI zones. "
    "The title, character display, information area, and button area are naturally embedded "
    "into the environment with soft shadows and matching color palette. "
    "All readable copy is rendered by the game engine; "
    "the artwork contains blank calm visual zones and decorative shapes only. "
    "Target canvas: 1280x720."
)

# ===== 3.2 透明按钮 — btn_create_confirm.png =====
data['ui/create/btn_create_confirm.png'] = (
    "Transparent PNG reusable button frame for a cheerful cartoon animal adventure UI. "
    "Only the raised rounded button frame is visible, centered with generous transparent padding on all sides. "
    "The outside area is clean alpha transparency. "
    "The central label area is blank, calm, low-contrast, and readable for runtime Chinese text. "
    "Decorations use leaves, flowers, small gems, paw motifs, warm wood trim, or soft cloth "
    "only on the border, corners, or left and right ends. "
    "Soft shadow and glow fade completely before reaching the canvas edge. "
    "Crisp clean alpha edge, polished hand-painted cartoon style, integrated forest-and-gem UI language. "
    "Target canvas: 240x80."
)

# ===== 3.3 透明卡片/面板 — character_card_default.png =====
data['ui/character/character_card_default.png'] = (
    "Transparent PNG reusable content panel frame for a cheerful cartoon animal adventure UI. "
    "The panel is centered with generous transparent padding around it. "
    "The outside area is clean alpha transparency. "
    "Use a warm parchment or soft translucent cream content area with subtle hand-painted texture. "
    "Border decoration uses rounded wood trim, leaves, flowers, tiny gems, paw motifs, "
    "ribbons, and soft forest highlights. "
    "Corners contain the most decorative detail, edges are calm stretchable bands, "
    "and the center is blank and readable for runtime Chinese labels and icons. "
    "Soft shadow fades before reaching the canvas edge. "
    "Clean alpha edge, cohesive forest-and-gem UI style. "
    "Target canvas: 260x96."
)

# ===== 3.4 透明徽章 — area_badge_forest.png =====
data['ui/area/area_badge_forest.png'] = (
    "Transparent PNG standalone badge emblem for a cheerful cartoon animal adventure UI. "
    "A single centered emblem with clean alpha transparency around it. "
    "The emblem uses rounded wood, leaves, flowers, gems, paw motifs, and soft magical sparkles. "
    "The silhouette is readable at small mobile size, "
    "with generous transparent padding and a soft glow contained inside the canvas. "
    "The image contains only one centered symbolic badge ornament "
    "with transparent space around it. "
    "Target canvas: 128x128."
)

# ===== 3.5 单体图标 — icon_item_key.png =====
data['icons/items/icon_item_key.png'] = (
    "Transparent PNG standalone item icon. "
    "A single antique brass key object centered on clean alpha transparency. "
    "Round decorative bow, short straight shaft, two clean teeth, "
    "warm golden brass material, soft top-left highlight, thick soft outline, "
    "readable silhouette at 64px, generous transparent padding on all sides, "
    "polished cartoon animal adventure item style. "
    "Target canvas: 128x128."
)

# Save
with open('E:/game/assets/resources/config/prompts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("5 prompts rewritten per 边缘切割感治理方案")