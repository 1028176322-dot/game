#!/usr/bin/env python3
"""Fix 3 background prompts - aggressive version to remove blood/heart/skull."""
import json

with open(r'E:\game\assets\resources\config\prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Completely rewritten prompts - remove ALL decorative elements that could trigger bad content
new_prompts = {
    'backgrounds/bg_room_upgrade.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: indoor workshop scene with stone table, metal tools on wooden shelves, "
        "gears and mechanical parts organized in boxes, warm orange lamp light, "
        "wooden stool, clay pots with colorful minerals, coiled ropes, "
        "brick walls with tool outlines painted in white, , "
        "STYLE: bright cheerful pixel art, warm workshop interior, clean organized space, "
        "saturated friendly colors, soft lighting, rounded shapes, "
        "NO BIOLOGICAL ELEMENTS, NO ORGANIC DECORATIONS, NO WALL HANGINGS, "
        "ONLY inanimate objects: tools, furniture, containers, materials., "
        "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., "
        "CRITICAL: NO HEART, NO HEART SHAPE, NO HEART SYMBOL, NO ANATOMICAL HEART, "
        "NO BLOOD, NO RED LIQUID, NO DRIPPING, NO SPLATTER, NO STAINS, "
        "NO SKULL, NO BONE, NO SKELETON, NO CROSSBONES, NO WEAPON SYMBOLS, "
        "NO PIRATE FLAGS, NO JOLLY ROGER, NO WARNING SIGNS, NO DANGER SYMBOLS., "
        "ONLY geometric patterns, abstract shapes, tool outlines on walls."
        "Negative prompt: text, watermark, signature, logo, heart, heart shape, valentine, "
        "anatomical heart, blood, red liquid, dripping, splatter, stain, spill, "
        "skull, bone, skeleton, crossbones, jolly roger, pirate flag, danger sign, warning symbol, "
        "weapon, sword, axe, knife, dagger, cross, tomb, grave, cemetery, "
        "organ, meat, flesh, biological, organic decoration, wall hanging, trophy, "
        "realistic, 3d render, photorealistic, horror, gore, scary"
    ),
    'backgrounds/bg_room_shop.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: merchant tent interior with colorful fabric drapes in rainbow colors, "
        "wooden table with stacked gold coins in neat piles, wooden crates with rope handles, "
        "round barrels with metal bands, hanging brass lanterns with warm glow, "
        "rolled scrolls tied with ribbon, folded maps, small decorative boxes, "
        "wooden floor planks, tent poles with rope ties, , "
        "STYLE: bright cheerful pixel art, cozy market atmosphere, clean merchant space, "
        "saturated friendly colors, warm candlelight, rounded friendly shapes, "
        "NO BIOLOGICAL ELEMENTS, NO SKULL SYMBOLS, NO WEAPON DECORATIONS, "
        "ONLY inanimate trade goods: fabrics, coins, containers, supplies., "
        "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., "
        "CRITICAL: NO SKULL, NO BONE, NO SKELETON, NO CROSSBONES, NO PIRATE SYMBOLS, "
        "NO WEAPONS ON WALLS, NO SWORDS, NO AXES, NO DAGGERS AS DECORATION, "
        "NO BLOOD, NO RED STAINS, NO RED SPOTS ON FLOOR, NO RED LIQUID, "
        "NO HEART, NO HEART SHAPE, NO ORGANIC DECORATIONS., "
        "ONLY peaceful trade goods and containers."
        "Negative prompt: text, watermark, signature, logo, skull, bone, skeleton, crossbones, "
        "jolly roger, pirate, weapon, sword, axe, dagger, knife, blade, "
        "blood, red stain, red spot, red liquid, red splash, spill, "
        "heart, anatomical heart, organ, meat, flesh, "
        "danger sign, warning symbol, crossed weapons, shield with symbols, "
        "tomb, grave, cemetery, coffin, sarcophagus, crypt, "
        "realistic, 3d render, photorealistic, horror, gore"
    ),
    'backgrounds/bg_event_tundra.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: peaceful snowy landscape with ice formations, frozen lake, "
        "snow-covered rocks and boulders, evergreen trees with snow caps, "
        "icicles hanging from cliff edges, gentle snow falling, pale blue sky, "
        "distant snow-capped mountains, frozen river, snowdrifts, "
        "small snow-covered bushes, ice crystals sparkling, , "
        "STYLE: serene winter pixel art, peaceful frozen wilderness, clean natural landscape, "
        "cool blue and white palette with soft purple hints, bright daylight, soft shadows, "
        "NO MAN-MADE STRUCTURES, NO MONUMENTS, NO STONE PILLARS, NO GRAVE MARKERS, "
        "NO MEMORIALS, NO STANDING STONES, NO RUNESTONES, NO TOMBSTONES., "
        "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., "
        "CRITICAL: NO HEART, NO HEART SHAPE, NO HEART SYMBOL, NO RED COLOR ON OBJECTS, "
        "NO BLOOD, NO RED STAINS, NO RED MARKS, NO RED LIQUID, "
        "NO WEAPONS, NO SWORDS, NO AXES, NO CROSSED WEAPONS, "
        "NO SKULL, NO BONE, NO SKELETON, NO BURIAL GROUND., "
        "ONLY pure natural winter landscape with ice, snow, rocks, trees."
        "Negative prompt: text, watermark, signature, logo, heart, heart shape, red heart, "
        "blood, red stain, red mark, red liquid, red color on stone, "
        "skull, bone, skeleton, tombstone, grave, cemetery, burial ground, memorial, "
        "monument, standing stone, runestone, stone pillar, stone marker, "
        "weapon, sword, axe, dagger, cross, crossed weapons, "
        "battlefield, fight, combat, war, death, corpse, "
        "ruin, ancient structure, building, man-made structure, "
        "realistic, 3d render, photorealistic, horror, dark"
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
