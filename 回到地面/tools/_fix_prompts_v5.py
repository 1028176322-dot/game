#!/usr/bin/env python3
"""Strengthen prompts to be more explicit about no scene/no text."""
import json

with open('E:/game/assets/resources/config/prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# ===== 整屏背景 — splash_bg.jpg =====
# 强调：不要内嵌 UI、文字、按钮、面板
data['ui/splash/splash_bg.jpg'] = (
    "Full-screen integrated cartoon animal adventure background for a horizontal mobile game interface. "
    "One continuous hand-painted scene with shared warm forest lighting, rounded friendly shapes, "
    "flowers, leaves, gems, paw motifs, soft magic sparkles, and calm readable runtime UI zones. "
    "The title, character display, information area, and button area are naturally embedded "
    "into the environment with soft shadows and matching color palette. "
    "The artwork is a pure visual scene without any text, letters, numbers, labels, "
    "button graphics, UI panels, frames, or cards. "
    "Readable titles, labels, and buttons will be rendered by the game engine on top of this background. "
    "The artwork contains blank calm visual zones and decorative shapes only. "
    "Target canvas: 1280x720."
)

# ===== 透明按钮 — btn_create_confirm.png =====
# 强调：只有按钮框，外部干净透明，无花草场景
data['ui/create/btn_create_confirm.png'] = (
    "Transparent PNG reusable button frame for a cheerful cartoon animal adventure UI. "
    "The artwork is limited to the raised rounded button frame only. "
    "The area outside the button is clean alpha transparency. "
    "The central label area is blank, calm, low-contrast, and readable for runtime Chinese text. "
    "Decorations use leaves, flowers, small gems, paw motifs, warm wood trim, or soft cloth "
    "only on the button border, corners, or left and right ends. "
    "There are no surrounding plants, trees, flowers, or scene elements outside the button. "
    "Soft shadow and glow fade completely before reaching the canvas edge. "
    "Crisp clean alpha edge, polished hand-painted cartoon style. "
    "Target canvas: 240x80."
)

# ===== 透明卡片 — character_card_default.png =====
data['ui/character/character_card_default.png'] = (
    "Transparent PNG reusable content panel frame for a cheerful cartoon animal adventure UI. "
    "The artwork is limited to the card frame only. "
    "The area outside the card is clean alpha transparency. "
    "Use a warm parchment or soft translucent cream content area with subtle hand-painted texture. "
    "Border decoration uses rounded wood trim, leaves, flowers, tiny gems, paw motifs, "
    "ribbons, and soft forest highlights. "
    "There are no surrounding plants, trees, flowers, or scene elements outside the card. "
    "Corners contain the most decorative detail, edges are calm stretchable bands, "
    "and the center is blank and readable for runtime Chinese labels and icons. "
    "Soft shadow fades before reaching the canvas edge. "
    "Clean alpha edge. "
    "Target canvas: 260x96."
)

# ===== 透明徽章 — area_badge_forest.png =====
data['ui/area/area_badge_forest.png'] = (
    "Transparent PNG standalone badge emblem for a cheerful cartoon animal adventure UI. "
    "The artwork is limited to one centered forest badge emblem. "
    "The area outside the emblem is clean alpha transparency. "
    "The emblem uses rounded wood, leaves, flowers, gems, paw motifs, and soft magical sparkles. "
    "There are no surrounding plants, trees, flowers, or scene elements outside the emblem. "
    "The silhouette is readable at small mobile size, "
    "with generous transparent padding and a soft glow contained inside the canvas. "
    "The image contains only one centered symbolic badge ornament "
    "with transparent space around it. "
    "Target canvas: 128x128."
)

# ===== 单体图标 — icon_item_key.png =====
data['icons/items/icon_item_key.png'] = (
    "Transparent PNG standalone item icon. "
    "The artwork is limited to one antique brass key object only. "
    "The area outside the key is clean alpha transparency. "
    "Round decorative bow, short straight shaft, two clean teeth, "
    "warm golden brass material, soft top-left highlight, thick soft outline, "
    "readable silhouette at 64px, generous transparent padding on all sides, "
    "polished cartoon item style. "
    "There are no surrounding flowers, leaves, plants, or decorative elements outside the key. "
    "Target canvas: 128x128."
)

# Save
with open('E:/game/assets/resources/config/prompts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("5 prompts strengthened")