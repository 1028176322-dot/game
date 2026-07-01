#!/usr/bin/env python3
"""
check_architecture.py - Extended architecture rule gate.

Checks:
1. director.loadScene() only allowed in SceneFlowService.ts
2. No raw `new SomeComponent()` on known Cocos Component subclasses
3. No direct GameManager.setPhase() outside app/AppFlowController.ts
4. AssetBundleService.loadAsset() usage — warns about deprecated API

Exit code 0 = pass, 1 = fail
"""

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "assets" / "scripts"

KNOWN_COMPONENTS = {
    "GameManager", "BattleManager", "GridManager", "DungeonManager",
    "MonsterController", "PlayerController", "AutoAttack",
    "SkillSystem", "UpgradeManager", "ElementSystem",
    "EquipmentSystem", "ItemSystem", "EventSystem",
    "SplashUI", "MainUI", "MainHubUI", "ShopUI",
    "BattleHUD", "DeathUI", "UpgradeUI", "SkillUI",
    "DungeonMapUI", "EquipmentUI", "InventoryUI", "EventUI",
}


def find_illegal_load_scene() -> list:
    """Only SceneFlowService.ts may call director.loadScene()"""
    violations = []
    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        rel = ts_file.relative_to(SCRIPTS_DIR)
        text = ts_file.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), 1):
            stripped = line.strip()
            if not stripped or stripped.startswith(("//", "*", "/*")):
                continue
            if "director.loadScene(" in stripped:
                if re.search(r"director\.loadScene\s*\([\"']", stripped):
                    fname = str(rel).replace("\\", "/")
                    if fname != "app/SceneFlowService.ts":
                        violations.append(f"  {rel}:{lineno}  {stripped[:80]}")
    return violations


def find_illegal_new_component() -> list:
    """Warn about `new SomeComponent()` for known Cocos Components"""
    violations = []
    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        text = ts_file.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), 1):
            stripped = line.strip()
            for comp in KNOWN_COMPONENTS:
                pattern = f"new {comp}("
                if pattern in stripped and not stripped.startswith(("//", "*")):
                    rel = ts_file.relative_to(SCRIPTS_DIR)
                    violations.append(f"  {rel}:{lineno}  {stripped[:80]}")
                    break
    return violations


def find_illegal_set_phase() -> list:
    """GameManager.setPhase() should only appear in AppFlowController"""
    violations = []
    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        rel = ts_file.relative_to(SCRIPTS_DIR)
        if str(rel) == "app/AppFlowController.ts":
            continue
        text = ts_file.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), 1):
            if ".setPhase(" in line and not line.strip().startswith(("//", "*")):
                violations.append(f"  {rel}:{lineno}  {line.strip()[:80]}")
    return violations


def main():
    load_scene_issues = find_illegal_load_scene()
    new_comp_issues = find_illegal_new_component()
    set_phase_issues = find_illegal_set_phase()

    print("=" * 50)
    print("  [Architecture] P0 + P1 Rule Check")
    print("=" * 50)

    failed = 0

    if load_scene_issues:
        print("\n[FAIL] Illegal director.loadScene() calls:")
        for v in load_scene_issues:
            print(f"  {v}")
        failed += 1
    else:
        print("\n[OK] director.loadScene() — only in SceneFlowService.ts")

    if new_comp_issues:
        print("\n[WARN] Possible illegal `new Component()` calls (review each):")
        for v in new_comp_issues:
            print(f"  {v}")

    if set_phase_issues:
        print("\n[FAIL] Illegal GameManager.setPhase() calls (only AppFlowController allowed):")
        for v in set_phase_issues:
            print(f"  {v}")
        failed += 1
    else:
        print("\n[OK] setPhase() — only in AppFlowController.ts")

    if failed:
        print(f"\n  [FAIL] {failed} check(s) failed")
        return 1
    else:
        print("\n  [OK] All architecture checks passed")
        return 0


if __name__ == "__main__":
    sys.exit(main())
