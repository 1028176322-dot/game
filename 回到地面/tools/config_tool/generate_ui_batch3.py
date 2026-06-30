#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UI模块优化 - 第三批次: 强化房UI + 装备背包UI
共 54 个文件
"""
import subprocess, json, os, time

API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
BASE = "E:/game/回到地面/assets/resources/textures/ui"

TASKS = [
    # 强化房 - 卡牌 (3)
    ("upgrade/card_frame_common.png", "160x220", """Pixel art card frame border for mobile game upgrade screen. Simple dark gray frame #3A3A4A with subtle metallic sheen, thin border, clean rectangular shape with rounded corners, 160x220 pixels, common tier (white/gray)"""),
    ("upgrade/card_frame_rare.png", "160x220", """Pixel art rare-tier card frame border. Blue glowing frame #4466AA with azure accents #88BBFF, subtle runic symbols on border, ornate corner pieces, 160x220 pixels, mobile game UI card"""),
    ("upgrade/card_frame_epic.png", "160x220", """Pixel art epic-tier card frame border. Gold frame #D4AF37 with bright highlights #FFE4A0, elaborate gothic flourishes at corners, luminous aura, premium feel, 160x220 pixels, rarest tier"""),
    
    # 强化房 - 能力图标 (12个, 64x64)
    ("upgrade/icon_ability_doublestrike.png", "64x64", """Pixel art game icon 64x64px, two crossed swords, golden circle border #D4AF37, dark blue background #1A1A2E, fantasy RPG upgrade screen UI, clean minimal design"""),
    ("upgrade/icon_ability_phasewalk.png", "64x64", """Pixel art game icon 64x64px, ghost silhouette passing through wall, purple glow, dark background, mobile game upgrade screen"""),
    ("upgrade/icon_ability_warcry.png", "64x64", """Pixel art game icon 64x64px, warrior shouting with sound waves, red-orange theme, dark background, fantasy game style"""),
    ("upgrade/icon_ability_lifestealaura.png", "64x64", """Pixel art game icon 64x64px, dripping red heart with arrow, dark blue background, health steal ability, game UI style"""),
    ("upgrade/icon_ability_ricochet.png", "64x64", """Pixel art game icon 64x64px, bouncing arrow with yellow trail hitting targets, dark background, bow ability icon"""),
    ("upgrade/icon_ability_shieldreflect.png", "64x64", """Pixel art game icon 64x64px, metal shield deflecting arrows, silver-gray metallic, dark blue background, defensive ability"""),
    ("upgrade/icon_ability_bullettime.png", "64x64", """Pixel art game icon 64x64px, broken clock with motion blur, time slowing effect, purple-blue gradient, dark background"""),
    ("upgrade/icon_ability_elementresonance.png", "64x64", """Pixel art game icon 64x64px, hexagram with six colored elemental orbs orbiting, mystical purple, dark background"""),
    ("upgrade/icon_ability_sprint.png", "64x64", """Pixel art game icon 64x64px, running figure with speed lines, cyan movement effect, dark background, speed boost icon"""),
    ("upgrade/icon_ability_frostbite.png", "64x64", """Pixel art game icon 64x64px, intricate ice crystal with slow ripples, icy blue-white, dark background, freezing ability"""),
    ("upgrade/icon_ability_firewalker.png", "64x64", """Pixel art game icon 64x64px, boot print surrounded by fire flames, orange-red fire, dark ground, dark background"""),
    ("upgrade/icon_ability_holyshield.png", "64x64", """Pixel art game icon 64x64px, ornate golden holy shield with angel wings, divine white-gold glow, dark blue background"""),
    
    # 强化房 - 属性强化 (7个)
    ("upgrade/icon_upgrade_berserkerpact.png", "64x64", """Pixel art game icon 64x64px, demonic pact seal with red markings and skull, dark red #8A2A2A with blood accents, aggressive dark background, berserker buff icon"""),
    ("upgrade/icon_upgrade_ironwall.png", "64x64", """Pixel art game icon 64x64px, layered metal armor plates overlapping, steel-gray #8A8A9A with rivet details, thick defensive armor aesthetic"""),
    ("upgrade/icon_upgrade_windstep.png", "64x64", """Pixel art game icon 64x64px, swishing wind trails with feather, cyan-blue #4488AA, motion blur effect, speed mobility upgrade"""),
    ("upgrade/icon_upgrade_longarm.png", "64x64", """Pixel art game icon 64x64px, extended arm reaching forward with measuring marks, gray-blue theme, attack range increase indicator"""),
    ("upgrade/icon_upgrade_lifecharm.png", "64x64", """Pixel art game icon 64x64px, heart-shaped gemstone pulsing with green life energy #44CC44, vitality boost, dark background"""),
    ("upgrade/icon_upgrade_greedring.png", "64x64", """Pixel art game icon 64x64px, ornate golden ring dripping gold coins #D4AF37, treasure greed theme, wealth increase icon"""),
    ("upgrade/icon_upgrade_agileboots.png", "64x64", """Pixel art game icon 64x64px, leather boot with feather trim, earth-brown with blue accents, light movement footwear, agility upgrade"""),
    
    # 强化房 - 遗物图标 (16个)
    ("upgrade/icon_relic_thornarmor.png", "64x64", """Pixel art game icon 64x64px, armor plate covered in sharp thorns, green-brown metallic, damage reflection ability"""),
    ("upgrade/icon_relic_luckycoin.png", "64x64", """Pixel art game icon 64x64px, two overlapping golden coins, bright gold #D4AF37, luck boost icon"""),
    ("upgrade/icon_relic_frenzyaxe.png", "64x64", """Pixel art game icon 64x64px, blood-stained battle axe, red drips, dark iron metallic, rage attack boost"""),
    ("upgrade/icon_relic_immortalstone.png", "64x64", """Pixel art game icon 64x64px, glowing green gem with infinity symbol, emerald glow #44CC44, invincibility passive"""),
    ("upgrade/icon_relic_echoorb.png", "64x64", """Pixel art game icon 64x64px, purple crystal orb with echoing ripples, mystical purple #8A4ACA, skill echo effect"""),
    ("upgrade/icon_relic_shadowcloak.png", "64x64", """Pixel art game icon 64x64px, flowing semi-transparent black cloak, dark purple shadow aura, stealth ability"""),
    ("upgrade/icon_relic_speedgauntlet.png", "64x64", """Pixel art game icon 64x64px, gauntlet with lightning patterns, electric blue-yellow crackle, speed boost"""),
    ("upgrade/icon_relic_ironarmor.png", "64x64", """Pixel art game icon 64x64px, heavy iron armor plate, steel-gray with rivets and scratches, defense passive"""),
    ("upgrade/icon_relic_shadowdagger.png", "64x64", """Pixel art game icon 64x64px, flying dagger with shadow trail, obsidian black blade, purple shadow active skill"""),
    ("upgrade/icon_relic_frostamulet.png", "64x64", """Pixel art game icon 64x64px, icicle pendant with snowflake carving, ice-blue glow, freeze area effect"""),
    ("upgrade/icon_relic_flamering.png", "64x64", """Pixel art game icon 64x64px, ring engulfed in fire, molten gold, flaming pulse effect active skill"""),
    ("upgrade/icon_relic_blinkstone.png", "64x64", """Pixel art game icon 64x64px, glowing blue teleport stone crystal, sparkles, blink teleport active"""),
    ("upgrade/icon_relic_gravitystone.png", "64x64", """Pixel art game icon 64x64px, purple orb pulling in particles, swirling dark matter vortex, gravity effect"""),
    ("upgrade/icon_relic_lifelink.png", "64x64", """Pixel art game icon 64x64px, chain connecting two red hearts, blood-red glow, health sharing link"""),
    ("upgrade/icon_relic_decoyscroll.png", "64x64", """Pixel art game icon 64x64px, ancient scroll with phantom rising, sepia tones, summon decoy effect"""),
    ("upgrade/icon_relic_timehourglass.png", "64x64", """Pixel art game icon 64x64px, ornate hourglass with flowing sand, golden frame, time slow active skill"""),
    
    # 装备背包 (16)
    ("equipment/equip_body_frame.png", "400x300", """Pixel art equipment screen layout background 400x300px. Silhouette outline of human character in standing pose with labeled equipment slots: head, torso, arms, legs, feet, hands. Dark background #1A1A2E with gold slot markers #D4AF37, gothic UI frame border, clean schematic style"""),
    ("equipment/equip_slot_weapon.png", "48x48", """Pixel art weapon slot icon 48x48px. Small sword outline in gray, equipment slot placeholder for main hand weapon, dark background with gold border"""),
    ("equipment/equip_slot_ring.png", "48x48", """Pixel art ring slot icon 48x48px. Simple circle outline in gold, finger equipment slot placeholder, dark background"""),
    ("equipment/equip_slot_necklace.png", "48x48", """Pixel art necklace/amulet slot icon 48x48px. Pendant charm outline, neck equipment slot, dark background with gold outline"""),
    ("equipment/equip_slot_helmet.png", "48x48", """Pixel art helmet slot icon 48x48px. Small helmet outline, head equipment slot, steel-gray outline, dark background"""),
    ("equipment/equip_slot_chest.png", "48x48", """Pixel art chest armor slot icon 48x48px. Torso armor outline, body equipment slot, dark background with metallic sheen"""),
    ("equipment/equip_slot_legs.png", "48x48", """Pixel art leg armor slot icon 48x48px. Lower body armor outline, leg equipment slot, dark background"""),
    ("equipment/equip_slot_shoes.png", "48x48", """Pixel art boots slot icon 48x48px. Boot outline, foot equipment slot, dark background"""),
    ("equipment/equip_slot_gloves.png", "48x48", """Pixel art gloves slot icon 48x48px. Gauntlet outline, hand equipment slot, dark background"""),
    ("equipment/inventory_slot.png", "60x60", """Pixel art inventory grid cell 60x60px. Square dark panel #2A2A3E with thin gold border #D4AF37, clean empty slot for item display, 12-slot grid layout style"""),
    ("equipment/item_slot.png", "40x40", """Pixel art item consumption grid cell 40x40px. Small dark square with gray border, for consumable items display area"""),
    ("equipment/rarity_common.png", "60x60", """Pixel art common-item quality border 60x60px. Simple white-gray #CCCCCC border, basic frame for uncommon items"""),
    ("equipment/rarity_magic.png", "60x60", """Pixel art magic-quality border 60x60px. Blue glowing #4488FF frame with subtle runic glow, enchantment tier"""),
    ("equipment/rarity_rare.png", "60x60", """Pixel art rare-quality border 60x60px. Golden #D4AF37 ornate frame with corner jewels, premium tier"""),
    ("equipment/rarity_legendary.png", "60x60", """Pixel art legendary-quality border 60x60px. Bright orange-gold #FF8833 frame with dramatic glow and light rays, highest rarity tier"""),
    ("equipment/set_counter_bg.png", "200x120", """Pixel art set bonus display panel 200x120px. Dark background with progress indicator, shows equipped set items count, clean panel for display"""),
]

def gen_dl(fn, size, prompt):
    print(f"\n[{fn}]")
    cmd = ["curl", "-s", "-X", "POST", "https://apihub.agnes-ai.com/v1/images/generations",
           "-H", "Content-Type: application/json",
           f"-H", f"Authorization: Bearer {API_KEY}",
           "-d", json.dumps({"model": "agnes-image-2.1-flash", "prompt": prompt, "n": 1, "size": size})]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        url = json.loads(r.stdout)['data'][0]['url']
        fp = os.path.join(BASE, fn)
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        for _ in range(3):
            subprocess.run(["curl", "-L", "-o", fp, url], capture_output=True, timeout=120)
            if os.path.exists(fp) and os.path.getsize(fp) > 0:
                print(f"  [OK] ({os.path.getsize(fp):,}B)")
                return True
        print("  [FAIL]")
        return False
    except Exception as e:
        print(f"  [FAIL] {e}")
        return False

def main():
    print("=" * 50)
    print("UI优化 - 第三批次: 强化房 + 装备背包 (54个)")
    print("=" * 50)
    s = f = 0
    for fn, sz, pr in TASKS:
        if gen_dl(fn, sz, pr): s += 1
        else: f += 1
        time.sleep(0.3)
    print(f"\n结果: {s} 成功, {f} 失败")

if __name__ == "__main__":
    main()
