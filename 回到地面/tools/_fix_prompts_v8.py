#!/usr/bin/env python3
"""Fix prompts: prevent embedded UI in splash, ensure full borders in button/card."""
import json

with open('E:/game/assets/resources/config/prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Splash: blank zones must be natural, not drawn UI
data['ui/splash/splash_bg.jpg'] = (
    "Horizontal mobile game splash background, 1280x720, one continuous hand-painted cartoon forest scene. "
    "Warm lighting, rounded trees, flowers, leaves, gems, soft sparkles. "
    "Natural open meadow and sky clearings for title, character, and buttons that will be added by the game engine. "
    "The blank zones are natural forest clearings and sky areas, not drawn rectangles, panels, buttons, or icon circles. "
    "No text, letters, numbers, labels, UI panels, buttons, frames, cards, animals, characters, or circular icons in the artwork. "
    "Pure scenery only."
)

# Button: small and centered with margin so crop preserves full frame
data['ui/create/btn_create_confirm.png'] = (
    "Transparent PNG button frame, 240x80, small and centered in the canvas. "
    "Complete rounded rectangular frame with clearly visible top, bottom, left, and right wood borders. "
    "Small leaf and gem accents on corners and ends. "
    "Center blank label area. "
    "Only the button frame is opaque. Everything outside the button is fully transparent alpha. "
    "No background, no scene, no surrounding plants outside the button. "
    "Soft shadow fades before the canvas edge. Clean alpha edge."
)

# Card: small and centered with margin
data['ui/character/character_card_default.png'] = (
    "Transparent PNG card frame, 260x96, small and centered in the canvas. "
    "Complete rounded rectangular frame with clearly visible top, bottom, left, and right borders. "
    "Warm parchment center, rounded wood border, tiny gem and leaf corners. "
    "Only the card frame is opaque. Everything outside the card is fully transparent alpha. "
    "No background, no scene, no surrounding plants outside the card. "
    "Center blank for labels. Soft shadow fades before edge. Clean alpha edge."
)

# Save
with open('E:/game/assets/resources/config/prompts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("splash/button/card prompts updated for margin")