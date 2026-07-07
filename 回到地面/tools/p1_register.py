#!/usr/bin/env python3
"""
P1 注册脚本：更新 ui_assets.json → 运行 --fix-assets → 运行 validate:all
在生成脚本完成所有图片后手动执行。
"""
import json, os, sys, subprocess

BASE = "E:/game/回到地面"
UI_PATH = os.path.join(BASE, "assets/resources/config/ui_assets.json")
CHECK_SCRIPT = os.path.join(BASE, "tools/check_assets_registry.py")

def verify_files():
    """验证生成的文件是否全部到位"""
    from PIL import Image
    checks = [
        ("main/main_bg", 1280, 720),
        ("main/btn_adventure", 260, 88),
        ("main/btn_character", 180, 68),
        ("main/btn_shop", 180, 68),
        ("main/btn_log", 180, 68),
        ("main/btn_settings", 180, 68),
        ("main/top_status_panel", 1120, 86),
        ("login/login_bg", 1280, 720),
        ("login/login_panel", 760, 460),
        ("login/btn_wechat", 320, 76),
        ("login/btn_guest", 320, 76),
        ("login/agreement_strip", 620, 44),
    ]
    ext_map = {}
    all_ok = True
    print("\n" + "="*60)
    print("  FILE VERIFICATION")
    print("="*60)
    for rel, ew, eh in checks:
        for ext in ["png", "jpg"]:
            fp = os.path.join(BASE, f"assets/resources/textures/ui/{rel}.{ext}")
            if os.path.exists(fp):
                img = Image.open(fp)
                w, h = img.size
                kb = os.path.getsize(fp) / 1024
                status = "✅" if (w, h) == (ew, eh) else "⚠️"
                print(f"  {status} {rel}.{ext}: {w}x{h} {kb:.1f}KB")
                ext_map[rel] = ext
                break
        else:
            print(f"  ❌ MISSING: {rel}.png/.jpg")
            all_ok = False
    return all_ok, ext_map

def update_ui_assets():
    with open(UI_PATH, "r", encoding="utf-8") as f:
        ui = json.load(f)

    updates = {
        "ui.main.start_button": {"assetId": "textures/ui/main/btn_adventure", "type": "sprite", "usage": "button"},
        "ui.main.character_button": {"assetId": "textures/ui/main/btn_character", "type": "sprite", "usage": "button"},
        "ui.main.shop_button": {"assetId": "textures/ui/main/btn_shop", "type": "sprite", "usage": "button"},
        "ui.main.log_button": {"assetId": "textures/ui/main/btn_log", "type": "sprite", "usage": "button"},
        "ui.main.settings_button": {"assetId": "textures/ui/main/btn_settings", "type": "sprite", "usage": "button"},
        "ui.main.top_status_panel": {"assetId": "textures/ui/main/top_status_panel", "type": "sprite", "usage": "panel_frame"},
        "ui.login.bg": {"assetId": "textures/ui/login/login_bg", "type": "background", "usage": "background"},
        "ui.login.panel": {"assetId": "textures/ui/login/login_panel", "type": "sprite", "usage": "panel_frame"},
        "ui.login.wechat_btn": {"assetId": "textures/ui/login/btn_wechat", "type": "sprite", "usage": "button"},
        "ui.login.guest_btn": {"assetId": "textures/ui/login/btn_guest", "type": "sprite", "usage": "button"},
        "ui.login.agreement_strip": {"assetId": "textures/ui/login/agreement_strip", "type": "sprite", "usage": "decoration"},
    }
    ui.update(updates)
    ui["metadata"]["lastUpdated"] = "2026-07-06"

    with open(UI_PATH, "w", encoding="utf-8") as f:
        json.dump(ui, f, ensure_ascii=False, indent=4)
    print(f"\n✅ Updated ui_assets.json ({len(updates)} entries)")

def fix_assets():
    print("\n--- check_assets_registry.py --fix-assets ---")
    r = subprocess.run([sys.executable, CHECK_SCRIPT, "--fix-assets"], capture_output=True, text=True, cwd=BASE)
    print(r.stdout)
    if r.stderr:
        print(r.stderr)

def validate():
    print("\n--- npm.cmd run validate:all ---")
    r = subprocess.run(["npm.cmd", "run", "validate:all"], capture_output=True, text=True, cwd=BASE, shell=True)
    print(r.stdout)
    if r.stderr:
        print(r.stderr[:2000])
    return r.returncode

if __name__ == "__main__":
    all_ok, ext_map = verify_files()
    if not all_ok:
        print("\n⚠️  Some files missing or wrong size. Proceeding anyway...\n")
    
    update_ui_assets()
    fix_assets()
    rc = validate()
    
    print(f"\n{'='*60}")
    if rc == 0:
        print("  🎉 P1 REGISTRATION COMPLETE (validate:all passed)")
    else:
        print(f"  ⚠️  validate:all returned {rc}, check output above")
    print(f"{'='*60}")
    sys.exit(rc)
