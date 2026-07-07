#!/usr/bin/env python3
"""
P2 Batch: Character + AreaSelect 一体化界面资源生成
流程：调用 Agnes API → 缩放至目标尺寸 → 保存 PNG RGBA → 检查体积
→ 复制到 assets → check_assets_registry --fix-assets → 更新 ui_assets.json → validate:all
"""
import json, os, sys, time, urllib.request, subprocess, shutil
sys.stdout.reconfigure(line_buffering=True)
from PIL import Image

PROJECT_ROOT = "E:/game/回到地面"
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets/resources/textures")
ASSETS_JSON = os.path.join(PROJECT_ROOT, "assets/resources/config/assets.json")
UI_ASSETS_JSON = os.path.join(PROJECT_ROOT, "assets/resources/config/ui_assets.json")
MASTER_DIR = os.path.join(PROJECT_ROOT, "art_source/textures_review/master")
CANDIDATES_DIR = os.path.join(PROJECT_ROOT, "runtime_candidates")
CHECK_SCRIPT = os.path.join(PROJECT_ROOT, "tools/check_assets_registry.py")

API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
API_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"

GP = "Bright cartoon animation style, cute animal fantasy adventure, polished mobile game UI, soft hand-painted look, clean shapes, crisp edges, warm lighting, family-friendly, WeChat mini game safe."
GN = "text, letters, words, numbers, logo, watermark, skull, skeleton, bone, blood, gore, wound, organ, heart organ, horror, dark gothic, realistic violence, scary, pixel art, blurry, low resolution, messy UI, pasted panel, English text, Chinese text"

RESOURCES = [
    # ==== Character 必须 ====
    {
        "name": "character_bg", "category": "character",
        "prompt": f"{GP} A full-screen 1280x720 character selection background for a cute animal fantasy adventure game. Cozy forest guild hall interior with warm wooden beams, hanging leafy vines as natural decoration, large center stage area with soft golden glow, left side area for character list, right side for detail panel, bottom action button space. Integrated scene, no pasted panels. {GN}",
        "gen_size": "1280x720", "target": (1280, 720), "max_kb": 160, "is_bg": True,
    },
    {
        "name": "character_detail_panel", "category": "character",
        "prompt": f"{GP} A 520x520 transparent PNG decorative panel frame for a cute animal fantasy character detail display. Leafy wooden border with carved fox and rabbit motifs, soft parchment inner area, corner star and gem ornaments, warm golden-brown tones. Empty center area. Transparent outside the frame. {GN}",
        "gen_size": "1024x1024", "target": (520, 520), "max_kb": 140, "is_bg": False,
    },
    {
        "name": "character_list_panel", "category": "character",
        "prompt": f"{GP} A 360x560 transparent PNG decorative list panel for a cute animal fantasy character selection. Tall vertical wooden frame with green vines and small flower ornaments on both sides, soft parchment-style inner scrollable area. Transparent outside the frame. {GN}",
        "gen_size": "720x1120", "target": (360, 560), "max_kb": 120, "is_bg": False,
    },
    {
        "name": "character_card_default", "category": "character",
        "prompt": f"{GP} A 320x96 transparent PNG horizontal card default state for a cute animal fantasy character list. Soft wooden plaque with light brown grain, subtle leaf corner decorations, rounded edges. Normal dim state, not highlighted. Transparent outside. {GN}",
        "gen_size": "640x192", "target": (320, 96), "max_kb": 60, "is_bg": False,
    },
    {
        "name": "character_card_selected", "category": "character",
        "prompt": f"{GP} A 320x96 transparent PNG horizontal card selected state for cute animal fantasy character list. Shiny golden wooden border with bright gem accents, soft glow outline, leaf and star ornaments. Brighter than default. Transparent outside. {GN}",
        "gen_size": "640x192", "target": (320, 96), "max_kb": 70, "is_bg": False,
    },
    {
        "name": "btn_select", "category": "character",
        "prompt": f"{GP} A 220x72 transparent PNG UI button for a cute animal fantasy game. Leafy wooden frame with soft blue-green inner plate, small star ornaments at edges, rounded friendly shape. Empty center for text. Transparent outside. {GN}",
        "gen_size": "440x144", "target": (220, 72), "max_kb": 55, "is_bg": False,
    },
    # ==== Character 建议头像 ====
    {
        "name": "avatar_warrior", "category": "character",
        "prompt": f"{GP} A 128x128 circular avatar icon of a cute animal warrior for a fantasy game: a brave lion cub wearing a tiny helmet and holding a small wooden sword, determined expression, cartoon style. Clean circular composition, transparent background outside. {GN}",
        "gen_size": "512x512", "target": (128, 128), "max_kb": 45, "is_bg": False,
    },
    {
        "name": "avatar_archer", "category": "character",
        "prompt": f"{GP} A 128x128 circular avatar icon of a cute animal archer for a fantasy game: a clever fox cub wearing a tiny green hood holding a small bow, agile pose, cartoon style. Transparent background outside. {GN}",
        "gen_size": "512x512", "target": (128, 128), "max_kb": 45, "is_bg": False,
    },
    {
        "name": "avatar_assassin", "category": "character",
        "prompt": f"{GP} A 128x128 circular avatar icon of a cute animal assassin for a fantasy game: a sleek cat cub wearing a tiny dark mask, crouching pose with small dagger, stealthy look, cartoon style. Transparent background outside. {GN}",
        "gen_size": "512x512", "target": (128, 128), "max_kb": 45, "is_bg": False,
    },
    {
        "name": "avatar_mage", "category": "character",
        "prompt": f"{GP} A 128x128 circular avatar icon of a cute animal mage for a fantasy game: an owl cub wearing a tiny pointed wizard hat, holding a small glowing wand, magical sparkles around, cartoon style. Transparent outside. {GN}",
        "gen_size": "512x512", "target": (128, 128), "max_kb": 45, "is_bg": False,
    },
    {
        "name": "avatar_berserker", "category": "character",
        "prompt": f"{GP} A 128x128 circular avatar icon of a cute animal berserker for a fantasy game: a fierce cute wolf cub with a tiny horned helmet, flexing strong pose, cartoon action, no blood. Transparent background outside. {GN}",
        "gen_size": "512x512", "target": (128, 128), "max_kb": 45, "is_bg": False,
    },
    # ==== AreaSelect 必须 ====
    {
        "name": "area_bg", "category": "area",
        "prompt": f"{GP} A full-screen 1280x720 route selection background for a cute animal fantasy adventure game. Forest camp scene with a large wooden table in center holding an illustrated fantasy world map, warm lantern light, parchment details, route list space, decorative compass and leaf motifs. Integrated scene. {GN}",
        "gen_size": "1280x720", "target": (1280, 720), "max_kb": 160, "is_bg": True,
    },
    {
        "name": "route_panel", "category": "area",
        "prompt": f"{GP} A 780x420 transparent PNG decorative route selection panel for a cute animal fantasy game. Large parchment scroll unrolled on wood, soft aged paper texture, decorative compass rose corner, leaf and rope ornaments, empty route list center. Transparent outside. {GN}",
        "gen_size": "780x420", "target": (780, 420), "max_kb": 150, "is_bg": False,
    },
    {
        "name": "route_card_default", "category": "area",
        "prompt": f"{GP} A 720x92 transparent PNG horizontal route card default state for a cute animal fantasy game. Long parchment card with soft wooden edge trim, subtle leaf corner decorations, wide layout for route name and difficulty. Normal look. Transparent outside. {GN}",
        "gen_size": "720x184", "target": (720, 92), "max_kb": 70, "is_bg": False,
    },
    {
        "name": "route_card_locked", "category": "area",
        "prompt": f"{GP} A 720x92 transparent PNG horizontal route card locked state for a cute animal fantasy game. Dimmed greyed parchment card with dark stone border, subtle chain link corner decor, greyed-out locked look. Transparent outside. {GN}",
        "gen_size": "720x184", "target": (720, 92), "max_kb": 70, "is_bg": False,
    },
    {
        "name": "btn_start", "category": "area",
        "prompt": f"{GP} A 240x76 transparent PNG main action button for a cute animal fantasy game. Leafy wooden frame with bright golden-green inner plate, gem highlight on left, small star ornaments, larger prominent button. Empty center for text. Transparent outside. {GN}",
        "gen_size": "480x152", "target": (240, 76), "max_kb": 60, "is_bg": False,
    },
    {
        "name": "btn_back", "category": "area",
        "prompt": f"{GP} A 200x68 transparent PNG secondary back button for a cute animal fantasy game. Leafy wooden frame with softer brown inner plate, compact size, small leaf decorations, return-friendly design. Empty center for text. Transparent outside. {GN}",
        "gen_size": "400x136", "target": (200, 68), "max_kb": 50, "is_bg": False,
    },
]


def call_agnes_api(prompt, size="1024x1024", retries=3):
    """Call Agnes API directly via urllib."""
    payload = json.dumps({
        "model": "agnes-image-2.1-flash",
        "prompt": prompt,
        "n": 1,
        "size": size,
    }).encode("utf-8")

    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                API_URL,
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {API_KEY}",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if "data" in data and len(data["data"]) > 0:
                    return data["data"][0]["url"]
                else:
                    print(f"  API error (attempt {attempt+1}): {data}")
        except Exception as e:
            print(f"  Exception (attempt {attempt+1}): {e}")
        time.sleep(5)
    return None


def process_one(res):
    name, cat = res["name"], res["category"]
    tw, th = res["target"]
    print(f"\n[{name}] {tw}x{th} max {res['max_kb']}KB")
    print(f"  Calling Agnes API...", end=" ", flush=True)

    url = call_agnes_api(res["prompt"], res["gen_size"])
    if not url:
        print(f"FAILED")
        return False
    print(f"OK")

    # Download
    tmp = os.path.join(PROJECT_ROOT, "temp", f"{name}_raw.png")
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    print(f"  Downloading...", end=" ", flush=True)
    try:
        urllib.request.urlretrieve(url, tmp)
        print(f"{os.path.getsize(tmp)//1024}KB")
    except Exception as e:
        print(f"FAILED: {e}")
        return False

    # Resize → master
    master_dir = os.path.join(MASTER_DIR, "ui", cat)
    os.makedirs(master_dir, exist_ok=True)
    master_path = os.path.join(master_dir, f"{name}.png")

    img = Image.open(tmp).convert("RGBA")
    img_resized = img.resize((tw, th), Image.LANCZOS)
    img_resized.save(master_path, "PNG")
    print(f"  Master: {master_path} ({os.path.getsize(master_path)//1024}KB)")

    # Copy → candidates
    cand_dir = os.path.join(CANDIDATES_DIR, cat)
    os.makedirs(cand_dir, exist_ok=True)
    cand_path = os.path.join(cand_dir, f"{name}.png")
    shutil.copy2(master_path, cand_path)
    print(f"  Candidates: {cand_path} ({os.path.getsize(cand_path)//1024}KB)")

    # Check size
    kb = os.path.getsize(cand_path) / 1024
    if kb <= res["max_kb"]:
        print(f"  Size: {kb:.1f}KB ✅ (max {res['max_kb']}KB)")
    else:
        print(f"  Size: {kb:.1f}KB ⚠️ exceeds {res['max_kb']}KB")
    return True


def copy_to_assets():
    print(f"\n{'='*40}\nCopying to assets...\n{'='*40}")
    for res in RESOURCES:
        name, cat = res["name"], res["category"]
        src = os.path.join(CANDIDATES_DIR, cat, f"{name}.png")
        dst_dir = os.path.join(ASSETS_DIR, "ui", cat)
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, f"{name}.png")
        if os.path.exists(src):
            shutil.copy2(src, dst)
            sz = os.path.getsize(dst) // 1024
            print(f"  {name}.png -> ui/{cat}/ ({sz}KB)")
        else:
            print(f"  MISSING: {name}.png")


def fix_assets():
    print(f"\n{'='*40}\ncheck_assets_registry --fix-assets\n{'='*40}")
    if os.path.exists(CHECK_SCRIPT):
        r = subprocess.run(
            [sys.executable, CHECK_SCRIPT, "--fix-assets"],
            capture_output=True, text=True, cwd=PROJECT_ROOT, timeout=60
        )
        out = r.stdout.strip()
        if out:
            print(out[:2000])
        if r.stderr:
            print(r.stderr[:500])
    else:
        print(f"  Script not found: {CHECK_SCRIPT}")


def update_ui_assets():
    print(f"\n{'='*40}\nUpdating ui_assets.json\n{'='*40}")
    with open(UI_ASSETS_JSON, "r", encoding="utf-8") as f:
        ui = json.load(f)

    entries = {
        # Character
        "ui.character.bg": {"assetId": "textures/ui/character/character_bg", "type": "background", "usage": "character_background"},
        "ui.character.detail_panel": {"assetId": "textures/ui/character/character_detail_panel", "type": "sprite", "usage": "panel_frame"},
        "ui.character.list_panel": {"assetId": "textures/ui/character/character_list_panel", "type": "sprite", "usage": "panel_frame"},
        "ui.character.select_btn": {"assetId": "textures/ui/character/btn_select", "type": "sprite", "usage": "button"},
        "character.card.default": {"assetId": "textures/ui/character/character_card_default", "type": "sprite", "usage": "character_card"},
        "character.card.selected": {"assetId": "textures/ui/character/character_card_selected", "type": "sprite", "usage": "character_card"},
        # Area
        "ui.area.bg": {"assetId": "textures/ui/area/area_bg", "type": "background", "usage": "area_select_background"},
        "ui.area.route_panel": {"assetId": "textures/ui/area/route_panel", "type": "sprite", "usage": "panel_frame"},
        "ui.area.route_card": {"assetId": "textures/ui/area/route_card_default", "type": "sprite", "usage": "route_card"},
        "ui.area.route_card_locked": {"assetId": "textures/ui/area/route_card_locked", "type": "sprite", "usage": "route_card"},
        "ui.area.start_btn": {"assetId": "textures/ui/area/btn_start", "type": "sprite", "usage": "button"},
        "ui.area.back_btn": {"assetId": "textures/ui/area/btn_back", "type": "sprite", "usage": "button"},
    }

    avatar_fixes = {
        "character.avatar.warrior": "textures/ui/character/avatar_warrior",
        "character.avatar.archer": "textures/ui/character/avatar_archer",
        "character.avatar.assassin": "textures/ui/character/avatar_assassin",
        "character.avatar.mage": "textures/ui/character/avatar_mage",
        "character.avatar.berserker": "textures/ui/character/avatar_berserker",
    }

    card_fixes = {
        "character.card.warrior": "textures/ui/character/character_card_default",
        "character.card.archer": "textures/ui/character/character_card_default",
        "character.card.assassin": "textures/ui/character/character_card_default",
        "character.card.mage": "textures/ui/character/character_card_default",
        "character.card.berserker": "textures/ui/character/character_card_default",
    }

    card_sel = {
        "character.card.selected.warrior": "textures/ui/character/character_card_selected",
        "character.card.selected.archer": "textures/ui/character/character_card_selected",
        "character.card.selected.assassin": "textures/ui/character/character_card_selected",
        "character.card.selected.mage": "textures/ui/character/character_card_selected",
        "character.card.selected.berserker": "textures/ui/character/character_card_selected",
    }

    changed = 0
    for key, val in entries.items():
        if key not in ui:
            ui[key] = val
            changed += 1
            print(f"  + {key}")
        elif ui[key] != val:
            print(f"  ~ {key}: old={ui[key]['assetId']} -> {val['assetId']}")
            ui[key] = val
            changed += 1

    for key, aid in {**avatar_fixes, **card_fixes, **card_sel}.items():
        if key in ui:
            if ui[key]["assetId"] != aid:
                print(f"  ~ {key}: {ui[key]['assetId']} -> {aid}")
                ui[key]["assetId"] = aid
                changed += 1
        else:
            usage = "avatar" if "avatar" in key else "character_card"
            ui[key] = {"assetId": aid, "type": "sprite", "usage": usage}
            print(f"  + {key}")
            changed += 1

    ui["metadata"]["lastUpdated"] = "2026-07-06"
    with open(UI_ASSETS_JSON, "w", encoding="utf-8") as f:
        json.dump(ui, f, ensure_ascii=False, indent=4)
    print(f"  {changed} changes written to ui_assets.json")


def validate():
    print(f"\n{'='*40}\nnpm.cmd run validate:all\n{'='*40}")
    r = subprocess.run(
        ["npm.cmd", "run", "validate:all"],
        capture_output=True, text=True, cwd=PROJECT_ROOT, timeout=120, shell=True
    )
    out = r.stdout.strip()
    if out:
        print(out)
    if r.stderr:
        err = r.stderr.strip()
        if err:
            print(err[:1000])
    print(f"\nvalidate:all exit code: {r.returncode}")
    return r.returncode


def main():
    t0 = time.time()
    print("="*50)
    print("P2 Batch: Character + AreaSelect 资源生成")
    print("="*50)

    ok = fail = 0
    for i, res in enumerate(RESOURCES):
        print(f"\n--- [{i+1}/{len(RESOURCES)}] {res['name']} ---")
        if process_one(res):
            ok += 1
        else:
            fail += 1

    print(f"\n{'='*50}")
    print(f"Generation: {ok} OK, {fail} FAIL, {time.time()-t0:.0f}s")

    if ok == 0:
        print("No resources generated, aborting downstream steps.")
        return 1

    copy_to_assets()
    fix_assets()
    update_ui_assets()
    rc = validate()

    print(f"\n{'='*50}")
    if rc == 0:
        print("✅ P2 COMPLETE (validate:all passed)")
    else:
        print(f"⚠️  validate:all returned {rc}")
    print(f"{'='*50}")
    return rc


if __name__ == "__main__":
    sys.exit(main())
