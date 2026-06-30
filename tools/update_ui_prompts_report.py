#!/usr/bin/env python3
"""更新 UI prompts.json，添加三类 contract 修复审查问题。"""
import json, re

with open(r'E:\game\assets\resources\config\prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

CENTER_CONTRACT = (
    'CENTER CONTENT AREA CONTRACT: '
    'center 70 percent of the asset must remain clean, mostly empty, '
    'and usable for runtime UI text and buttons; '
    'no large symbol, paw mark, character head, icon, X mark, '
    'close icon, logo, or badge in the center area.'
)

EMPTY_SLOT_CONTRACT = (
    'EMPTY SLOT CONTRACT: '
    'draw the frame border only; '
    'inside area must be transparent or plain empty; '
    'do not draw any equipment, item, face, paw icon, symbol, weapon, '
    'armor, ring, boot, gem, or placeholder object inside the slot.'
)

SEMANTIC_ICON_CONTRACT = (
    'SEMANTIC ICON CONTRACT: '
    'the subject must be the actual game object described by the filename, '
    'not a generic badge, paw mark, or decoration; '
    'one single identifiable object centered; '
    'small decorative frame is optional and must not dominate; '
    'no generic paw badge as main subject; '
    'no animal face as main subject; '
    'the object must be recognizable.'
)

# == 1. 面板/背景类（main_bg, shop_bg, panel_bg, death_bg, splash_bg etc）==
panel_subjects = {
    'ui/main/main_bg.png': (
        'bright cartoon adventure main menu background, outdoor landscape scenery, '
        'small cute animal head icons only in corners and border edges, '
        'center area remains open landscape with sky, trees, and clouds, '
        'no large symbols, no X marks'
    ),
    'ui/shop/shop_bg.png': (
        'cartoon adventure shop interior background panel, '
        'center area completely open and clean for merchandise layout, '
        'decorative elements only on borders and corners: small coins, tiny paw prints, '
        'no large symbol, no paw badge, no character in center'
    ),
    'ui/common/panel_bg.png': (
        'repeatable blank panel background texture, vanilla UI panel, '
        'subtle border decoration with very tiny corner ornaments only, '
        'center area completely plain and clean for text and buttons, '
        'no center icon, no paw print, no symbol'
    ),
    'ui/death/death_bg.png': (
        'adventure result screen background, calm peaceful scene, '
        'soft magical particles and sparkles on edges, '
        'center area open for result text and panels, '
        'no skulls, no bones, no blood, no gore'
    ),
    'ui/death/result_panel.png': (
        'adventure result panel frame, empty center content area, '
        'decorative border with small stars and gems on corners only, '
        'center completely empty for runtime content display'
    ),
    'ui/splash/splash_bg.png': (
        'full 1280x720 landscape splash screen background, '
        'cute animal adventurer silhouettes in scenery, '
        'top area clear for game title text, '
        'bottom area clear for buttons, '
        'warm golden hour outdoor landscape, no frame border'
    ),
}

# == 2. 装备槽类 ==
slot_subjects = {
    'equip_body_frame': 'equipment character body frame, empty silhouette outline only, no filled body, no armor objects inside',
    'equip_slot_chest': 'empty chest armor slot frame, faint chest outline suggestion only, completely empty inside',
    'equip_slot_gloves': 'empty gloves slot frame, faint glove outline suggestion only, completely empty inside',
    'equip_slot_legs': 'empty leg armor slot frame, faint leg outline suggestion only, completely empty inside',
    'equip_slot_necklace': 'empty necklace slot frame, faint necklace circle outline only, completely empty inside',
    'equip_slot_ring': 'empty ring slot frame, faint ring circle outline only, completely empty inside',
    'equip_slot_shoes': 'empty boots slot frame, faint boot outline suggestion only, completely empty inside',
    'equip_slot_weapon': 'empty weapon slot frame, faint sword outline suggestion only, completely empty inside',
    'inventory_slot': 'empty inventory slot square frame, completely empty inside with no object',
    'item_slot': 'empty item slot square frame, completely empty inside with no object',
}

# == 3. HUD 类 ==
hud_subjects = {
    'hud_cdmask': 'circular radial cooldown mask with translucent fan-shaped gradient overlay, circular ring pattern, no X mark, no symbol, no icon',
    'hud_hpbar_bg': 'plain health bar background trough, empty inside for fill bar, no symbols, no icons, no X, no decoration inside',
    'hud_hpbar_fill': 'health bar fill segment, smooth green gradient from left to right, simple bar shape only',
    'hud_hpbar_frame': 'health bar decorative border frame, simple edge line around bar area, no content inside',
    'hud_rollbtn': 'circular roll dodge button with simple speed arrow arc on button face, empty center, round button shape',
    'hud_skillslot': 'empty circular skill slot frame, round border only, completely empty center for skill icon',
    'joystick_base': 'circular joystick base ring, simple clean circle with subtle inner shadow',
    'joystick_dot': 'plain circular thumb pad, solid clean circle, no face no symbol no icon, simple dot',
}

# == 4. 地图图标类 ==
map_subjects = {
    'icon_room_boss': 'map room icon, small animal skull boss indicator silhouette, simple tiny symbol',
    'icon_room_combat': 'map room icon, crossed swords combat symbol with small animal paw accents',
    'icon_room_event': 'map room icon, magical sparkle star event symbol, no question mark',
    'icon_room_healing': 'map room icon, healing leaf and drop symbol, green nature motif',
    'icon_room_shop': 'map room icon, tiny coin stack shop symbol with small bag',
    'icon_room_treasure': 'map room icon, tiny treasure chest with sparkling gem symbol',
    'icon_room_upgrade': 'map room icon, tiny anvil and hammer upgrade symbol',
    'map_line': 'map connection line, thin dashed line with tiny dots, simple path connector',
    'map_node_current': 'map node marker, glowing circular ring around a bright dot, current position indicator',
    'map_node_unknown': 'map node marker, fog-covered circular node, soft gray circle, no face',
    'map_node_visited': 'map node marker, dimmed completed node, dark circle with subtle inner ring',
}

# == 5. Common buttons ==
button_subjects = {
    'btn_active': 'plain blank pressed button background, rounded rectangle shape, subtle inner shadow showing pressed state, empty center no text no icon',
    'btn_close': 'close button, two short rounded bars crossing at center forming X shape, clean simple, no text',
    'btn_default': 'plain blank default button background, rounded rectangle shape, clean border, empty center no text no icon',
    'btn_hover': 'plain blank hover button background, rounded rectangle shape with soft edge glow, empty center no text no icon',
    'btn_revive_active': 'plain blank pressed revive action button, teal-tinted rounded rectangle, empty center no icon',
    'btn_revive_default': 'plain blank default revive action button, blue-gray rounded rectangle, empty center no icon',
    'btn_settle_active': 'plain blank pressed continue button, gold-tinted rounded rectangle, empty center no icon',
    'btn_settle_default': 'plain blank default continue button, blue-gray rounded rectangle with gold trim, empty center no icon',
}

# == 6. Upgrade 图标（需要语义合约）==
# These need SEMANTIC ICON CONTRACT and specific subject descriptions
upgrade_subjects = {
    'icon_ability_bullettime': 'ability icon for bullet time, a small clock face with slowed motion sparkle, blue-white time symbol',
    'icon_ability_doublestrike': 'ability icon for double strike, two crossed short blades with action lines, orange-red combat symbol',
    'icon_ability_elementresonance': 'ability icon for element resonance, four small colored elemental orbs in a ring, rainbow energy',
    'icon_ability_firewalker': 'ability icon for fire walker, flame footstep mark on ground, orange fire trail',
    'icon_ability_frostbite': 'ability icon for frostbite, ice crystal shard with cold mist, blue-white ice symbol',
    'icon_ability_holyshield': 'ability icon for holy shield, circular golden barrier shield with light rays, defensive symbol',
    'icon_ability_lifestealaura': 'ability icon for life steal aura, green life energy ring with heart-like vine pattern, nature symbol',
    'icon_ability_phasewalk': 'ability icon for phase walk, ghostly figure stepping through a dimensional rift, purple void symbol',
    'icon_ability_ricochet': 'ability icon for ricochet, a bouncing projectile with zigzag arrow path lines, yellow speed symbol',
    'icon_ability_shieldreflect': 'ability icon for shield reflect, shield with curved arrow bouncing off, blue counter symbol',
    'icon_ability_sprint': 'ability icon for sprint, running boot with horizontal speed lines, green movement symbol',
    'icon_ability_warcry': 'ability icon for warcry, open roaring mouth with sound wave rings, orange battle cry symbol',
    'icon_relic_blinkstone': 'relic icon for blinkstone, small blue teleport crystal with angular cut facets, glowing',
    'icon_relic_decoyscroll': 'relic icon for decoy scroll, rolled parchment with ghostly decoy silhouette mark',
    'icon_relic_echoorb': 'relic icon for echo orb, glass orb with concentric sound ripple rings inside',
    'icon_relic_flamering': 'relic icon for flame ring, metal ring encircled by continuous orange flame',
    'icon_relic_frenzyaxe': 'relic icon for frenzy axe, red battle axe head with short handle and rage glow',
    'icon_relic_frostamulet': 'relic icon for frost amulet, icy blue amulet pendant with frost crystal detail',
    'icon_relic_gravitystone': 'relic icon for gravity stone, violet gravity stone with curved orbit rings',
    'icon_relic_immortalstone': 'relic icon for immortal stone, golden life stone with cross-shaped shine symbol',
    'icon_relic_ironarmor': 'relic icon for iron armor, compact iron chest armor plate, protective symbol',
    'icon_relic_lifelink': 'relic icon for life link, two small green life crystals joined by chain of light',
    'icon_relic_luckycoin': 'relic icon for lucky coin, single gold coin with simple clover-like mark, no text',
    'icon_relic_shadowcloak': 'relic icon for shadow cloak, folded violet cloak with shadow wisps trailing',
    'icon_relic_shadowdagger': 'relic icon for shadow dagger, violet fantasy dagger with soft shadow trail',
    'icon_relic_speedgauntlet': 'relic icon for speed gauntlet, lightweight silver gauntlet with blue speed streaks',
    'icon_relic_thornarmor': 'relic icon for thorn armor, green-brown armor plate covered in sharp thorns',
    'icon_relic_timehourglass': 'relic icon for time hourglass, small golden hourglass with flowing sand particles',
    'icon_upgrade_agileboots': 'upgrade icon for agile boots, light boot with wing motif and wind swirls',
    'icon_upgrade_berserkerpact': 'upgrade icon for berserker pact, clenched fist with red energy aura, combat symbol',
    'icon_upgrade_greedring': 'upgrade icon for greed ring, golden ring with coin-stacking motif on band',
    'icon_upgrade_ironwall': 'upgrade icon for iron wall, thick stone wall segment with reinforcement lines, defense symbol',
    'icon_upgrade_lifecharm': 'upgrade icon for life charm, small green leaf-shaped pendant charm, nature symbol',
    'icon_upgrade_longarm': 'upgrade icon for long arm, extended reaching arm with grabber claw at end, range symbol',
    'icon_upgrade_windstep': 'upgrade icon for wind step, light footprint with wind swirls and speed lines',
}

# == 7. Other UI (death icons, rarity, etc.) ==
other_subjects = {
    'icon_soulstone': 'soulstone crystal icon, glowing purple crystal with inner light, small spirit orb floating above',
    'rarity_common': 'common rarity badge, small simple gray border circle, no decoration, minimal',
    'rarity_legendary': 'legendary rarity badge, golden crown-shaped border with small gems, ornate',
    'rarity_magic': 'magic rarity badge, blue-green gem-shaped border with sparkle dots, magical',
    'rarity_rare': 'rare rarity badge, silver border with small star cutouts, elegant',
    'set_counter_bg': 'equipment set counter background panel, small rectangular area with set emblem outline, no text',
    'main_titledeco': 'main menu title decoration frame, arched top ornament with animal ear silhouette decorations, no text',
    'icon_coin': 'gold coin icon, circular coin with small animal face imprint on one side, no text',
    'shop_slot': 'shop item slot frame, square empty slot with small price tag corner decoration',
    'splash_logo': 'game logo decoration panel, decorative banner shape with animal mascot corner ornaments, center area empty for logo text',
    'card_frame_common': 'upgrade card border frame, simple gray-brown border, center area empty, no symbols',
    'card_frame_epic': 'upgrade card border frame, purple-gold ornate border with gem corner decorations, center empty',
    'card_frame_rare': 'upgrade card border frame, blue-silver border with star corner decorations, center area empty, no X no symbols',
}

count = 0
for key in list(data.keys()):
    if not key.startswith('ui/'):
        continue
    
    fname = key.split('/')[-1].replace('.png', '')
    orig = data[key]
    
    # Extract size
    size_m = re.search(r'(\d+)x(\d+)', orig)
    size = size_m.group(0) if size_m else '64x64'
    
    # Determine subject
    subject = ''
    contract = ''
    contract_addition = ''
    
    # Panel/background
    if key in panel_subjects:
        subject = panel_subjects[key]
        contract = CENTER_CONTRACT
    # HUD
    elif fname in hud_subjects:
        subject = hud_subjects[fname]
        contract = CENTER_CONTRACT
    # Equipment slots
    elif fname in slot_subjects:
        subject = slot_subjects[fname]
        contract = EMPTY_SLOT_CONTRACT
    # Map icons
    elif fname in map_subjects:
        subject = map_subjects[fname]
        contract = ''
    # Buttons
    elif fname in button_subjects:
        subject = button_subjects[fname]
        contract = CENTER_CONTRACT
    # Upgrade icons
    elif fname in upgrade_subjects:
        subject = upgrade_subjects[fname]
        contract = SEMANTIC_ICON_CONTRACT
    # Other
    elif fname in other_subjects:
        subject = other_subjects[fname]
    
    if not subject:
        continue  # skip if no specific subject defined
    
    # Build prompt with 3 sections: description + contracts + negative
    base_desc = (
        f'pixel art mobile game UI sprite, {size}, '
        f'subject: {subject}, '
        f'{size}, '
        'UI sprite with transparent margin, '
        'single isolated reusable UI sprite only, clean shape, crisp pixels, '
        'bright cartoon adventure style with subtle animal decorations, '
        'no embedded text, no letters, no numbers, no fake labels, '
        'CLEARLY DEFINED SUBJECT MATTER: specific identifiable objects and scenes, '
        'cartoon adventure aesthetic with rounded friendly elements, '
        'STYLE: bright colorful cartoon pixel art, playful mobile game adventure look, '
        'clean pixels, rounded friendly shapes, saturated colors, soft highlights, '
        'readable silhouettes, consistent cute cartoon pixel aesthetic.'
    )
    
    contracts_section = ''
    if contract:
        contracts_section = contract + ' '
    
    safety = (
        'CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND. '
        'no blood, no gore, no splatter, no dripping liquid, '
        'no organs, no realistic heart, no impalement, no wound, no severed body parts, no skull, no horror face. '
        'No heart shapes, no heart symbols, no valentine or love symbols.'
    )
    
    negative = (
        'Negative prompt: text, letters, words, watermark, signature, logo, checkerboard, '
        'gray background, preview background, UI mockup, screenshot, portrait, avatar, emoji, '
        'face-only image, cropped head, fake writing, '
        'blood, gore, splatter, dripping blood, wound, injury, impalement, realistic heart, organs, '
        'heart shape, heart symbol, valentine, love symbol, '
        'horror face, grimdark, gothic, scary style, '
        'muddy low-saturation palette, photorealistic, 3d render, blurry edges.'
    )
    
    new_prompt = f'{base_desc} {contracts_section}{safety} {negative}'
    data[key] = new_prompt
    count += 1

with open(r'E:\game\assets\resources\config\prompts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Updated {count} UI prompts with contracts')
