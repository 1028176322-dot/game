#!/usr/bin/env python3
"""Update prompts with the user's exact template + strengthen splash."""
import json

with open('E:/game/assets/resources/config/prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Button — user's exact template
data['ui/create/btn_create_confirm.png'] = (
    "Transparent PNG reusable UI frame for a cheerful cartoon animal adventure game. "
    "Only the centered frame is visible. "
    "The outside area is clean alpha transparency. "
    "The frame has generous transparent padding on all four sides. "
    "Soft shadow and glow fade completely before reaching the canvas edge. "
    "The center area is blank, calm, low-contrast, and ready for runtime Chinese text. "
    "Decorations stay on the corners and border: leaves, flowers, gems, paw motifs, warm wood trim. "
    "Crisp clean alpha edge, rounded friendly hand-painted style, cohesive forest-and-gem UI language. "
    "Target canvas: 240x80."
)

# Card — same template style adapted for card
data['ui/character/character_card_default.png'] = (
    "Transparent PNG reusable UI frame for a cheerful cartoon animal adventure game. "
    "Only the centered card frame is visible. "
    "The outside area is clean alpha transparency. "
    "The frame has generous transparent padding on all four sides. "
    "Soft shadow and glow fade completely before reaching the canvas edge. "
    "The center area is blank, calm, low-contrast, and ready for runtime Chinese text and avatar. "
    "Decorations stay on the corners and border: leaves, flowers, gems, paw motifs, warm wood trim. "
    "Crisp clean alpha edge, rounded friendly hand-painted style, cohesive forest-and-gem UI language. "
    "Target canvas: 260x96."
)

# Badge — also use consistent template
data['ui/area/area_badge_forest.png'] = (
    "Transparent PNG reusable badge emblem for a cheerful cartoon animal adventure game. "
    "Only the centered round badge emblem is visible. "
    "The outside area is clean alpha transparency. "
    "The emblem has generous transparent padding on all four sides. "
    "Soft glow fades completely before reaching the canvas edge. "
    "The badge shows a forest theme symbol: tree silhouette or leaf cluster, "
    "surrounded by a round wood rim with small gem accents. "
    "Crisp clean alpha edge, rounded friendly hand-painted style. "
    "Target canvas: 128x128."
)

# Icon — consistent style  
data['icons/items/icon_item_key.png'] = (
    "Transparent PNG standalone item icon for a cheerful cartoon animal adventure game. "
    "Only the centered antique brass key object is visible. "
    "The outside area is clean alpha transparency. "
    "The key has generous transparent padding on all four sides. "
    "Round decorative bow, short straight shaft, two clean teeth, "
    "warm golden brass material, soft top-left highlight, thick soft outline, "
    "readable silhouette at 64px. "
    "Crisp clean alpha edge, polished hand-painted cartoon item style. "
    "Target canvas: 128x128."
)

# Splash — no embedded UI elements
data['ui/splash/splash_bg.jpg'] = (
    "Horizontal mobile game splash background, 1280x720, one continuous hand-painted cartoon forest scene. "
    "Warm lighting, rounded trees, flowers, leaves, gems, soft sparkles. "
    "Natural open meadow and sky zones for title, character, and buttons that will be added by the game engine. "
    "The blank areas are natural forest clearings and sky, not drawn rectangles, panels, or buttons. "
    "No text, letters, numbers, labels, UI panels, buttons, frames, cards, or characters in the artwork. "
    "Pure scenery only."
)

with open('E:/game/assets/resources/config/prompts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("5 prompts updated with user's exact template")
