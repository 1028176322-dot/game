#!/usr/bin/env python3
"""Update all 92 UI prompts with animal theme matching main_bg.png style."""
import json, re

with open(r'E:\game\assets\resources\config\prompts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

ANIMAL_STYLE = (
    'STYLE: bright colorful cartoon pixel art with cute animal theme, '
    'playful mobile game adventure look, clean chunky pixels, '
    'rounded friendly animal shapes, tiny cute animal head icons as decorative elements, '
    'cartoon cat dog rabbit bear motifs decorating borders and corners, '
    'whimsical animal-themed UI design, saturated colors, soft highlights, '
    'readable silhouettes, consistent cute animal pixel aesthetic.'
)

ANIMAL_DETAIL = (
    'DETAIL: reusable cartoon pixel UI piece with animal decorations, '
    'cute animal head icons in corners and edges, '
    'clean beveled shape with tiny paw prints or animal ears as accents, '
    'soft highlight, simple border with animal-themed trim, '
    'empty content area where needed, '
    'consistent blue-purple-gold adventure UI palette with animal motifs.'
)

ANIMAL_NEGATIVE = (
    'Negative prompt: text, letters, words, watermark, signature, logo, checkerboard, '
    'gray background, preview background, UI mockup, screenshot, portrait, avatar, emoji, '
    'face-only image, cropped head, decorative fake writing, '
    'blood, gore, splatter, dripping blood, wound, injury, impalement, realistic heart, organs, '
    'heart shape, heart symbol, valentine, love symbol, anatomical heart, '
    'crossed axes, crossed weapons, horror face, frightening gore, '
    'grimdark, gothic, horror style, scary badge style, heavy black metal UI, '
    'muddy low-saturation palette, photorealistic, 3d render, smooth blurry edges, jpeg artifacts.'
)

BASE_TPL = (
    'pixel art landscape mobile game UI sprite asset, {size}, '
    'subject: {subject}, '
    '{size}, solid pure chroma magenta (#ff00ff) background, '
    'UI asset must not use magenta, safe transparent margin unless the asset is a full background panel, '
    'single isolated reusable UI sprite only, clean shape, crisp pixels, '
    'bright cartoon adventure HUD style with animal decorations, '
    'no embedded text, no letters, no numbers, no fake labels, '
    'no screenshot, no full UI mockup, no character portrait, no emoji, no watermark, , '
    'CLEARLY DEFINED SUBJECT MATTER: specific identifiable objects and scenes, not abstract shapes, '
    'cartoon adventure aesthetic with rounded friendly animal elements, playful mobile game atmosphere, '
    '{style} {detail} '
    'CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND., '
    'CRITICAL: NO ANATOMICAL HEART SHAPES, NO HEART SYMBOLS, NO HEART ICONS ANYWHERE. '
    'ONLY CUTE ANIMAL HEAD ICONS AS DECORATIVE ELEMENTS., '
    'APPROVAL-SAFE MOBILE GAME ART: non-graphic fantasy symbols only, '
    'no blood, no gore, no splatter, no dripping liquid, no organs, no realistic heart, no impalement, '
    'no wound no severed body parts no horror face.'
    '{negative}'
)

SUBJECT_MAP = {
    'btn_active': 'cartoon adventure button frame with animal paw prints, pressed state',
    'btn_close': 'cartoon adventure close button with tiny animal ears on corners',
    'btn_default': 'cartoon adventure button frame with animal paw prints, default state',
    'btn_hover': 'cartoon adventure button frame with animal paw prints, hover highlight state',
    'panel_bg': 'cartoon adventure panel background with small animal head icons decorating borders',
    'btn_revive_active': 'revive button with glowing life crystal and tiny animal guardian icons',
    'btn_revive_default': 'revive button with life crystal and cute animal spirit icons',
    'btn_settle_active': 'settlement button with treasure chest and animal coin icons',
    'btn_settle_default': 'settlement button with reward chest and cute animal motifs',
    'death_bg': 'adventure result background panel with peaceful spirit animal silhouettes',
    'icon_soulstone': 'soulstone icon with glowing crystal and tiny animal spirit orb',
    'result_panel': 'adventure result panel frame with animal trophy decorations',
    'equip_body_frame': 'equipment body frame slot with animal paw print decorations',
    'equip_slot_chest': 'equipment slot frame with tiny animal badge for chest armor',
    'equip_slot_gloves': 'equipment slot frame with tiny animal badge for gloves',
    'equip_slot_helmet': 'equipment slot frame with tiny animal badge for helmet',
    'equip_slot_legs': 'equipment slot frame with tiny animal badge for leg armor',
    'equip_slot_necklace': 'equipment slot frame with tiny animal badge for necklace',
    'equip_slot_ring': 'equipment slot frame with tiny animal badge for ring',
    'equip_slot_shoes': 'equipment slot frame with tiny animal badge for boots',
    'equip_slot_weapon': 'equipment slot frame with tiny animal badge for weapon',
    'inventory_slot': 'inventory item slot frame with animal paw corner decorations',
    'item_slot': 'item slot square frame with tiny animal ear decorations on corners',
    'rarity_common': 'common rarity badge with simple animal paw print icon',
    'rarity_legendary': 'legendary rarity badge with golden animal crown icon',
    'rarity_magic': 'magic rarity badge with glowing animal star icon',
    'rarity_rare': 'rare rarity badge with silver animal gem icon',
    'set_counter_bg': 'equipment set counter background with animal counting icons',
    'hud_cdmask': 'cooldown mask overlay with circular animal pattern frame',
    'hud_hpbar_bg': 'health bar background panel with small animal guardian icons',
    'hud_hpbar_fill': 'health bar fill gradient with tiny animal spirit glow',
    'hud_hpbar_frame': 'health bar decorative frame with animal scale decorations',
    'hud_rollbtn': 'roll dodge button with circular animal paw print icon',
    'hud_skillslot': 'skill slot frame with animal totem corner decorations',
    'joystick_base': 'joystick base with circular animal pattern border',
    'joystick_dot': 'joystick control dot with tiny animal face center',
    'main_bg': 'bright cartoon adventure main menu background panel with small cute animal head icons decorating corners, outdoor landscape with trees and clouds',
    'main_titledeco': 'main menu title decoration frame with animal ear and paw motifs',
    'icon_room_boss': 'map room icon with animal skull boss indicator',
    'icon_room_combat': 'map room icon with crossed animal paw combat symbol',
    'icon_room_event': 'map room icon with animal question mark event symbol',
    'icon_room_healing': 'map room icon with animal healing symbol',
    'icon_room_shop': 'map room icon with animal merchant shop symbol',
    'icon_room_treasure': 'map room icon with animal treasure chest symbol',
    'icon_room_upgrade': 'map room icon with animal anvil upgrade symbol',
    'map_line': 'map connection line with tiny animal paw print dots',
    'map_node_current': 'map node marker with glowing animal current position',
    'map_node_unknown': 'map node marker with animal question fog',
    'map_node_visited': 'map node marker with animal checkmark visited',
    'icon_coin': 'gold coin icon with small animal face imprint',
    'shop_bg': 'shop background panel with animal merchant decorations',
    'shop_slot': 'shop item slot frame with tiny animal price tag decorations',
    'splash_bg': 'game splash screen background with cute animal adventurer silhouettes',
    'splash_logo': 'game logo decoration with animal mascot characters',
    'card_frame_common': 'upgrade card frame with simple animal border decorations',
    'card_frame_epic': 'upgrade card frame with golden animal crown decorations',
    'card_frame_rare': 'upgrade card frame with silver animal gem decorations',
}

# Handle upgrade icons with prefix variations
def get_icon_subject(fname):
    if fname.startswith('icon_ability_'):
        ability = fname.replace('icon_ability_', '').replace('_', ' ')
        return f'ability icon for {ability} with animal-themed visual representation'
    if fname.startswith('icon_relic_'):
        relic = fname.replace('icon_relic_', '').replace('_', ' ')
        return f'relic item icon for {relic} with animal-themed visual design'
    if fname.startswith('icon_upgrade_'):
        upgrade = fname.replace('icon_upgrade_', '').replace('_', ' ')
        return f'upgrade stat icon for {upgrade} with animal-themed symbol'
    if fname.startswith('card_frame_'):
        rarity = fname.replace('card_frame_', '')
        return f'upgrade selection card border frame with {rarity} animal decorations'
    return None

count = 0
for key in list(data.keys()):
    if not key.startswith('ui/'):
        continue

    orig = data[key]
    size_m = re.search(r'(\d+)x(\d+)', orig)
    size = size_m.group(0) if size_m else '64x64'

    fname = key.split('/')[-1].replace('.png', '')
    
    # Determine subject
    if fname in SUBJECT_MAP:
        subject = SUBJECT_MAP[fname]
    else:
        subject = get_icon_subject(fname)
        if not subject:
            subject = f'cartoon UI element with cute animal decorations for {fname}'

    new_prompt = BASE_TPL.format(
        size=size,
        subject=subject,
        style=ANIMAL_STYLE,
        detail=ANIMAL_DETAIL,
        negative=ANIMAL_NEGATIVE
    )
    data[key] = new_prompt
    count += 1

with open(r'E:\game\assets\resources\config\prompts.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Updated {count} UI prompts with animal theme')
