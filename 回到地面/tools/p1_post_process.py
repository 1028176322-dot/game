#!/usr/bin/env python3
"""
P1 后处理：更新 ui_assets.json → 运行 --fix-assets → 运行 validate:all
"""

import json, os, sys, subprocess

BASE_DIR = "E:/game/回到地面"
UI_ASSETS_PATH = os.path.join(BASE_DIR, "assets/resources/config/ui_assets.json")
ASSETS_PATH = os.path.join(BASE_DIR, "assets/resources/config/assets.json")
CHECK_SCRIPT = os.path.join(BASE_DIR, "tools/check_assets_registry.py")

def update_ui_assets():
    """更新 ui_assets.json：修改已有 key 的 assetId，新增 key"""
    with open(UI_ASSETS_PATH, "r", encoding="utf-8") as f:
        ui = json.load(f)

    # 更新 MainHub 按钮指向专用资源
    ui["ui.main.start_button"] = {
        "assetId": "textures/ui/main/btn_adventure",
        "type": "sprite",
        "usage": "button"
    }
    ui["ui.main.character_button"] = {
        "assetId": "textures/ui/main/btn_character",
        "type": "sprite",
        "usage": "button"
    }
    ui["ui.main.shop_button"] = {
        "assetId": "textures/ui/main/btn_shop",
        "type": "sprite",
        "usage": "button"
    }
    ui["ui.main.log_button"] = {
        "assetId": "textures/ui/main/btn_log",
        "type": "sprite",
        "usage": "button"
    }
    ui["ui.main.settings_button"] = {
        "assetId": "textures/ui/main/btn_settings",
        "type": "sprite",
        "usage": "button"
    }

    # 新增 MainHub 顶部状态面板
    ui["ui.main.top_status_panel"] = {
        "assetId": "textures/ui/main/top_status_panel",
        "type": "sprite",
        "usage": "panel_frame"
    }

    # 新增 Login 资源
    ui["ui.login.bg"] = {
        "assetId": "textures/ui/login/login_bg",
        "type": "background",
        "usage": "background"
    }
    ui["ui.login.panel"] = {
        "assetId": "textures/ui/login/login_panel",
        "type": "sprite",
        "usage": "panel_frame"
    }
    ui["ui.login.wechat_btn"] = {
        "assetId": "textures/ui/login/btn_wechat",
        "type": "sprite",
        "usage": "button"
    }
    ui["ui.login.guest_btn"] = {
        "assetId": "textures/ui/login/btn_guest",
        "type": "sprite",
        "usage": "button"
    }
    ui["ui.login.agreement_strip"] = {
        "assetId": "textures/ui/login/agreement_strip",
        "type": "sprite",
        "usage": "decoration"
    }

    # 更新 metadata
    ui["metadata"]["lastUpdated"] = "2026-07-06"

    with open(UI_ASSETS_PATH, "w", encoding="utf-8") as f:
        json.dump(ui, f, ensure_ascii=False, indent=4)
    print(f"✅ Updated ui_assets.json")


def fix_assets():
    """运行 --fix-assets 自动注册缺失条目"""
    print("\n--- Running check_assets_registry.py --fix-assets ---")
    result = subprocess.run(
        [sys.executable, CHECK_SCRIPT, "--fix-assets"],
        capture_output=True, text=True, cwd=BASE_DIR
    )
    print(result.stdout)
    if result.stderr:
        print(result.stderr)


def validate_all():
    """运行 validate:all"""
    print("\n--- Running npm.cmd run validate:all ---")
    result = subprocess.run(
        ["npm.cmd", "run", "validate:all"],
        capture_output=True, text=True, cwd=BASE_DIR,
        shell=True
    )
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result.returncode


def verify_assets():
    """验证最终生成的文件"""
    checks = [
        ("assets/resources/textures/ui/main/main_bg.png", 1280, 720),
        ("assets/resources/textures/ui/main/btn_adventure.png", 260, 88),
        ("assets/resources/textures/ui/main/btn_character.png", 180, 68),
        ("assets/resources/textures/ui/main/btn_shop.png", 180, 68),
        ("assets/resources/textures/ui/main/btn_log.png", 180, 68),
        ("assets/resources/textures/ui/main/btn_settings.png", 180, 68),
        ("assets/resources/textures/ui/main/top_status_panel.png", 1120, 86),
        ("assets/resources/textures/ui/login/login_bg.png", 1280, 720),
        ("assets/resources/textures/ui/login/login_panel.png", 760, 460),
        ("assets/resources/textures/ui/login/btn_wechat.png", 320, 76),
        ("assets/resources/textures/ui/login/btn_guest.png", 320, 76),
        ("assets/resources/textures/ui/login/agreement_strip.png", 620, 44),
    ]

    from PIL import Image
    all_ok = True
    print("\n--- Asset Verification ---")
    for rel_path, exp_w, exp_h in checks:
        full = os.path.join(BASE_DIR, rel_path)
        if not os.path.exists(full):
            print(f"  ❌ MISSING: {rel_path}")
            all_ok = False
            continue
        img = Image.open(full)
        w, h = img.size
        kb = os.path.getsize(full) / 1024
        if img.mode != "RGBA" and "bg" not in rel_path:
            print(f"  ⚠️  NOT RGBA: {rel_path} (mode={img.mode})")
        if (w, h) == (exp_w, exp_h):
            print(f"  ✅ {rel_path}: {w}x{h} {kb:.1f}KB")
        else:
            print(f"  ⚠️  SIZE MISMATCH {rel_path}: got {w}x{h}, expected {exp_w}x{exp_h}")
            all_ok = False
    return all_ok


def main():
    print("=" * 60)
    print("  P1 后处理：注册资产 + 验证")
    print("=" * 60)

    # 1. 验证生成文件
    ok = verify_assets()
    if not ok:
        print("\n⚠️  部分文件缺失或尺寸不对，仍继续注册...")

    # 2. 更新 ui_assets.json
    update_ui_assets()

    # 3. 运行 --fix-assets 注册 assets.json
    fix_assets()

    # 4. 运行 validate:all
    rc = validate_all()

    if rc == 0:
        print("\n🎉 P1 全部完成！")
    else:
        print(f"\n⚠️  validate:all 返回 {rc}，请检查输出")

    return rc


if __name__ == "__main__":
    exit(main())
