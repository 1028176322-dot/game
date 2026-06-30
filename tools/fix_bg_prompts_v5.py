#!/usr/bin/env python3
"""Fix 3 background prompts v5 - explicitly remove blood/stains."""
import json

with open(r'E:\game\assets\resources\config\prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_prompts = {
    'backgrounds/bg_room_rest.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: cozy rest tent interior for adventurers, tent canvas with colored fabric patches, "
        "comfortable cushions and pillows in bright colors, wooden crates used as tables, "
        "small campfire or lantern in center, rolled sleeping mats, backpacks and travel bags, "
        "cooking pot over small fire, wooden mugs and plates, "
        "string lights with small lanterns hanging, "
        "tent roof made of canvas with visible stitching and colored fabric patches, "
        "CRITICAL: TENT CANVAS MUST BE CLEAN WITH FABRIC PATCHES ONLY, "
        "ABSOLUTELY NO BLOOD, NO RED STAINS, NO DRIPPING LIQUID, NO RED MARKS ON TENT, "
        "TENT FABRIC MUST BE CLEAN WITHOUT ANY STAINS., "
        "STYLE: bright cheerful pixel art, cozy camp atmosphere, "
        "NO TEXT, NO WATERMARK, NO SIGNATURE."
    ),
    'backgrounds/bg_event_catacombs.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: ancient underground hall with stone pillars, green ivy vines climbing on pillars, "
        "stone walls with carved geometric symbols, torches mounted on walls casting warm light, "
        "broken pillars lying on clean stone floor, arched ceiling with faded fresco paintings, "
        "dust motes dancing in shafts of light from above, moss growing on stone surfaces, "
        "CRITICAL: TORCHES MUST BE CLEAN WITH NO BLOOD, "
        "STONE PILLARS MUST HAVE GREEN VINES NOT RED STAINS, "
        "ABSOLUTELY NO BLOOD, NO RED STAINS, NO DRIPPING, NO WOUNDS, "
        "TORCHES AND WALLS MUST BE CLEAN WITHOUT ANY RED MARKS., "
        "STYLE: ancient ruin with nature reclaiming, mysterious atmosphere, "
        "bright colorful pixel art, NO TEXT, NO WATERMARK, NO SIGNATURE."
    ),
    'backgrounds/bg_combat_catacombs.png': (
        "pixel art game asset, 1000x666, transparent background, crisp pixels, "
        "subject: ancient underground stone chamber with carved pillar columns, "
        "stone pillars covered with green ivy vines and climbing plants, "
        "cracked floor tiles with dim amber light glowing from below, "
        "faded golden geometric patterns painted on walls, vaulted arched ceiling, "
        "dust particles floating in torchlight, moss growing on stone surfaces, "
        "clean stone floor without any stains or marks, "
        "CRITICAL: FLOOR MUST BE CLEAN STONE WITHOUT ANY RED SPOTS OR STAINS, "
        "ABSOLUTELY NO BLOOD, NO RED STAINS, NO RED SPOTS ON FLOOR, "
        "NO DRIPPING LIQUID, NO WOUNDS, NO INJURIES, "
        "FLOOR MUST BE PURE CLEAN STONE WITH ONLY DUST AND MOSS., "
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
