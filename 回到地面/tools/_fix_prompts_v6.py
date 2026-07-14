#!/usr/bin/env python3
"""Simplify and strengthen prompts with clear negative structural instructions."""
import json

with open('E:/game/assets/resources/config/prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# ===== 整屏背景 =====
data['ui/splash/splash_bg.jpg'] = (
    "Horizontal mobile game splash background, 1280x720, one continuous hand-painted cartoon forest scene. "
    "Warm lighting, rounded trees, flowers, leaves, gems, paw motifs, soft sparkles. "
    "The scene has calm blank zones for title, character, and buttons that will be added by the game engine. "
    "No text, no letters, no numbers, no labels, no UI panels, no buttons, no frames, no cards in the artwork. "
    "Pure scenery only."
)

# ===== 透明按钮 =====
data['ui/create/btn_create_confirm.png'] = (
    "Transparent PNG button frame, 240x80, raised rounded rectangle, warm wood trim, small leaf and gem accents. "
    "Center blank label area. "
    "Only the button frame is opaque. Everything outside the button is fully transparent alpha. "
    "No background, no scene, no surrounding plants, no trees, no flowers outside the button. "
    "Soft shadow fades before the canvas edge. Clean alpha edge."
)

# ===== 透明卡片 =====
data['ui/character/character_card_default.png'] = (
    "Transparent PNG card frame, 260x96, warm parchment center, rounded wood border, tiny gem and leaf corners. "
    "Only the card frame is opaque. Everything outside the card is fully transparent alpha. "
    "No background, no scene, no surrounding plants outside the card. "
    "Center blank for labels. Soft shadow fades before edge. Clean alpha edge."
)

# ===== 透明徽章 =====
data['ui/area/area_badge_forest.png'] = (
    "Transparent PNG forest badge, 128x128, single centered round emblem with tree or leaf symbol, wood rim, small gems. "
    "Only the emblem is opaque. Everything outside the emblem is fully transparent alpha. "
    "No background, no scene, no surrounding plants outside the emblem. "
    "Clean alpha edge."
)

# ===== 单体图标 =====
data['icons/items/icon_item_key.png'] = (
    "Transparent PNG item icon, 128x128, single antique brass key centered, round bow, two teeth, golden metal. "
    "Only the key is opaque. Everything outside the key is fully transparent alpha. "
    "No background, no flowers, no leaves, no plants, no scene around the key. "
    "Thick soft outline, readable at 64px."
)

# Save
with open('E:/game/assets/resources/config/prompts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("5 prompts simplified")