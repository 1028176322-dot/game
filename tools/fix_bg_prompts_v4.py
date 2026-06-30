#!/usr/bin/env python3
"""Fix 4 background prompts v4 - explicit ivy vines and tent patches."""
import json

with open(r'E:\game\assets\resources\config\prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_prompts = {
    'backgrounds/bg_room_upgrade.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: cozy craftsman workshop interior, stone workbench with lamp, "
        "wooden shelves on brick walls holding metal tools, wrenches, hammers, screwdrivers, "
        "metal gears and cogwheels arranged neatly, clay pots with colorful gems and crystals, "
        "small wooden stool, woven basket, ropes coiled on floor, "
        "warm orange lamp light casting soft shadows, brick walls with white painted tool outlines, "
        "CRITICAL: ABSOLUTELY NO MEAT, NO FOOD, NO ORGANS, NO SKULL, NO BONE, NO SKELETAL PARTS, "
        "NO ANATOMICAL OBJECTS, ONLY INANIMATE TOOLS AND MATERIALS., "
        "STYLE: bright cheerful pixel art, warm cozy workshop, clean organized space, "
        "NO TEXT, NO WATERMARK, NO SIGNATURE."
    ),
    'backgrounds/bg_room_shop.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: traveling merchant tent interior, tent canvas with colored fabric PATCHES sewn on, "
        "wooden display counter with stacks of gold coins, small treasure chests, "
        "wooden crates stacked beside counter, round barrels with metal bands, "
        "brass lanterns on hooks, rolled maps on table, small clay dishes with gems, "
        "rope nets filled with colorful glass bottles and crystals, "
        "tent roof made of canvas with visible stitching and fabric patches in different colors, "
        "wooden floor planks, warm cozy candlelight, "
        "CRITICAL: TENT TOP MUST SHOW FABRIC PATCHES NOT ORGANS, "
        "ABSOLUTELY NO HANGING ORGANS, NO HEARTS, NO MEAT, NO ANATOMICAL OBJECTS, "
        "ONLY TRADE GOODS: coins, gems, bottles, maps, chests, crates., "
        "STYLE: bright cheerful pixel art, cozy market atmosphere, "
        "NO TEXT, NO WATERMARK, NO SIGNATURE."
    ),
    'backgrounds/bg_room_rest.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: cozy rest tent interior for adventurers, tent canvas with colored fabric PATCHES, "
        "comfortable cushions and pillows in bright colors, wooden crates used as tables, "
        "small campfire or lantern in center, rolled sleeping mats, backpacks and travel bags, "
        "cooking pot over small fire, wooden mugs and plates, "
        "string lights with small lanterns hanging, "
        "tent roof made of canvas with visible stitching and colored fabric patches, "
        "warm inviting atmosphere, soft lighting, "
        "CRITICAL: TENT MUST SHOW FABRIC PATCHES NOT BLOOD STAINS, "
        "ABSOLUTELY NO BLOOD, NO RED STAINS, NO DRIPPING, "
        "ONLY RESTING AREA WITH CUSHIONS AND SUPPLIES., "
        "STYLE: bright cheerful pixel art, cozy camp atmosphere, "
        "NO TEXT, NO WATERMARK, NO SIGNATURE."
    ),
    'backgrounds/bg_combat_catacombs.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: ancient underground stone chamber with carved pillar columns, "
        "stone pillars COVERED WITH GREEN IVY VINES AND CLIMBING PLANTS, "
        "cracked floor tiles with dim amber light glowing from below, "
        "faded golden geometric patterns painted on walls, vaulted arched ceiling, "
        "dust particles floating in torchlight, moss growing on stone surfaces, "
        "CRITICAL: STONE PILLARS MUST BE DECORATED WITH GREEN IVY VINES AND PLANTS, "
        "ABSOLUTELY NO HEART SHAPES, NO HEART SYMBOLS, NO BLOOD STAINS, NO RED MARKS, "
        "ONLY NATURAL STONE WITH GREEN VEGETATION., "
        "STYLE: ancient ruin with nature reclaiming, mysterious underground atmosphere, "
        "bright colorful pixel art, NO TEXT, NO WATERMARK, NO SIGNATURE."
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
