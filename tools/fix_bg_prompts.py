#!/usr/bin/env python3
"""Fix 5 background prompts to remove heart/blood triggers."""
import json

with open(r'E:\game\assets\resources\config\prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_prompts = {
    'backgrounds/bg_room_shop.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: cozy traveling merchant tent interior, hanging colorful fabrics and lanterns, "
        "wooden display counter with shiny gold coins, stacked wooden crates and barrels, "
        "warm candlelight illuminate the space, scrolls and maps pinned to tent walls, , "
        "CLEARLY DEFINED SUBJECT MATTER: specific identifiable objects and scenes, not abstract shapes, "
        "cozy fantasy pixel art style, warm inviting atmosphere, playful mobile game look, "
        "clean chunky pixels, saturated colors, soft highlights, readable silhouettes., "
        "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., "
        "CRITICAL: NO HEART SHAPES, NO HEART SYMBOLS, NO HEART DECORATIONS ANYWHERE, "
        "NO BLOOD, NO RED SPLATTERS, NO GORE, NO ORGANIC MATTER, NO ANATOMICAL PARTS. "
        "The image must show ONLY an empty room scene with objects - no symbols, no icons, no decorative hearts. "
        "APPROVAL-SAFE MOBILE GAME ART."
        "Negative prompt: text, letters, words, watermark, signature, logo, checkerboard, "
        "gray background, preview background, UI mockup, screenshot, portrait, avatar, emoji, "
        "face-only image, cropped head, decorative fake writing, heart, heart shape, heart symbol, "
        "heart decoration, cupid, valentine, love symbol, blood, gore, splatter, dripping blood, "
        "wound, injury, realistic heart, organs, bones, skeleton, skull, crossed axes, crossed weapons, "
        "horror face, frightening gore, grimdark, gothic, horror style, scary badge style, "
        "heavy black metal UI, muddy low-saturation palette, photorealistic, 3d render, smooth blurry edges, jpeg artifacts."
    ),
    'backgrounds/bg_combat_catacombs.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: ancient underground stone chamber with carved pillar columns on both sides, "
        "cracked floor tiles revealing dim amber light from below, faded golden geometric patterns painted on walls, "
        "vaulted arched ceiling overhead, dust particles floating in torchlight, , "
        "CLEARLY DEFINED SUBJECT MATTER: specific identifiable objects and scenes, not abstract shapes, "
        "cozy fantasy pixel art style, mysterious ancient underground atmosphere, "
        "playful mobile game look, clean chunky pixels, saturated colors, soft highlights, readable silhouettes., "
        "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., "
        "CRITICAL: NO HEART SHAPES, NO HEART SYMBOLS, NO BLOOD, NO GORE, "
        "NO ORGANIC MATTER, NO BONES, NO SKELETAL REMAINS. "
        "The image must show ONLY stone architecture and geometric patterns - "
        "no biological matter, no body parts, no organs. "
        "APPROVAL-SAFE MOBILE GAME ART."
        "Negative prompt: text, letters, words, watermark, signature, logo, checkerboard, "
        "gray background, preview background, UI mockup, screenshot, portrait, avatar, emoji, "
        "face-only image, cropped head, decorative fake writing, heart, heart shape, heart symbol, "
        "blood, gore, splatter, dripping blood, wound, injury, realistic heart, organs, bones, "
        "skeleton, skull, tomb, grave, crypt, sarcophagus, coffin, crossed axes, crossed weapons, "
        "horror face, frightening gore, grimdark, gothic, horror style, scary badge style, "
        "heavy black metal UI, muddy low-saturation palette, photorealistic, 3d render, smooth blurry edges, jpeg artifacts."
    ),
    'backgrounds/bg_event_tundra.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: frozen tundra wilderness with weathered stone monuments half-buried in snow, "
        "icicles hanging from rocky overhangs, pale blue permafrost stretching to horizon, "
        "wind-swept snowdrifts under pale winter sky, scattered glacial rocks and frost-covered shrubs, , "
        "CLEARLY DEFINED SUBJECT MATTER: specific identifiable objects and scenes, not abstract shapes, "
        "cozy fantasy pixel art style, cold serene winter atmosphere, "
        "playful mobile game look, clean chunky pixels, saturated colors, soft highlights, readable silhouettes., "
        "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., "
        "CRITICAL: NO HEART SHAPES, NO HEART SYMBOLS, NO BLOOD, NO GORE, NO ORGANIC MATTER. "
        "The image must show ONLY frozen landscape, snow, rocks, and monuments - "
        "no combat, no violence, no biological matter, no symbols. "
        "APPROVAL-SAFE MOBILE GAME ART."
        "Negative prompt: text, letters, words, watermark, signature, logo, checkerboard, "
        "gray background, preview background, UI mockup, screenshot, portrait, avatar, emoji, "
        "face-only image, cropped head, decorative fake writing, heart, heart shape, heart symbol, "
        "blood, gore, splatter, dripping blood, wound, injury, realistic heart, organs, bones, "
        "skeleton, skull, battlefield, fight, war, combat, death, corpse, crossed axes, crossed weapons, "
        "horror face, frightening gore, grimdark, gothic, horror style, scary badge style, "
        "heavy black metal UI, muddy low-saturation palette, photorealistic, 3d render, smooth blurry edges, jpeg artifacts."
    ),
    'backgrounds/bg_event_catacombs.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: ancient underground hall with tall stone monuments lined along walls, "
        "carved geometric symbols glowing faintly in torchlight, broken pillars lying across clean stone floor, "
        "arched ceiling with faded fresco paintings, dust motes dancing in shafts of light from above, , "
        "CLEARLY DEFINED SUBJECT MATTER: specific identifiable objects and scenes, not abstract shapes, "
        "cozy fantasy pixel art style, mysterious ancient ruin atmosphere, "
        "playful mobile game look, clean chunky pixels, saturated colors, soft highlights, readable silhouettes., "
        "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., "
        "CRITICAL: NO HEART SHAPES, NO HEART SYMBOLS, NO BLOOD, NO GORE, "
        "NO ORGANIC MATTER, NO BONES, NO SKELETAL REMAINS. "
        "The image must show ONLY stone architecture, pillars, and geometric patterns - "
        "no burial elements, no body parts, no organic matter. "
        "APPROVAL-SAFE MOBILE GAME ART."
        "Negative prompt: text, letters, words, watermark, signature, logo, checkerboard, "
        "gray background, preview background, UI mockup, screenshot, portrait, avatar, emoji, "
        "face-only image, cropped head, decorative fake writing, heart, heart shape, heart symbol, "
        "blood, gore, splatter, dripping blood, wound, injury, realistic heart, organs, bones, "
        "skeleton, skull, tomb, grave, crypt, sarcophagus, coffin, burial, corpse, crossed axes, crossed weapons, "
        "horror face, frightening gore, grimdark, gothic, horror style, scary badge style, "
        "heavy black metal UI, muddy low-saturation palette, photorealistic, 3d render, smooth blurry edges, jpeg artifacts."
    ),
    'backgrounds/bg_room_upgrade.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: craftsman workshop interior with stone workbench in center, "
        "various tool racks on walls holding hammers, pliers and chisels, "
        "blueprint scrolls pinned to wooden boards, warm forge glow casting orange light across room, "
        "polished gemstones in small clay dishes, , "
        "CLEARLY DEFINED SUBJECT MATTER: specific identifiable objects and scenes, not abstract shapes, "
        "cozy fantasy pixel art style, warm workshop atmosphere, "
        "playful mobile game look, clean chunky pixels, saturated colors, soft highlights, readable silhouettes., "
        "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., "
        "CRITICAL: NO HEART SHAPES, NO HEART SYMBOLS, NO HEART DECORATIONS ANYWHERE, "
        "NO BLOOD, NO GORE, NO ORGANIC MATTER. "
        "The image must show ONLY workshop tools, furniture, and crafting materials - "
        "no symbols, no icons, no decorative hearts. "
        "APPROVAL-SAFE MOBILE GAME ART."
        "Negative prompt: text, letters, words, watermark, signature, logo, checkerboard, "
        "gray background, preview background, UI mockup, screenshot, portrait, avatar, emoji, "
        "face-only image, cropped head, decorative fake writing, heart, heart shape, heart symbol, "
        "heart decoration, cupid, valentine, love symbol, blood, gore, splatter, dripping blood, "
        "wound, injury, realistic heart, organs, bones, skeleton, skull, crossed axes, crossed weapons, "
        "horror face, frightening gore, grimdark, gothic, horror style, scary badge style, "
        "heavy black metal UI, muddy low-saturation palette, photorealistic, 3d render, smooth blurry edges, jpeg artifacts."
    ),
}

for key, new_prompt in new_prompts.items():
    if key in data:
        old_len = len(data[key])
        data[key] = new_prompt
        print(f'✓ Updated {key} ({old_len} chars -> {len(data[key])} chars)')
    else:
        print(f'✗ Key {key} not found!')

with open(r'E:\game\assets\resources\config\prompts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('\nDone! prompts.json saved.')
