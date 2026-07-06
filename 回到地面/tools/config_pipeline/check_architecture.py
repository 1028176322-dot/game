#!/usr/bin/env python3
"""
check_architecture.py - Extended architecture rule gate.

Checks:
1. director.loadScene() is allowed only in SceneFlowService.ts.
2. Warn about raw `new SomeComponent()` on known Cocos Component subclasses.
3. GameManager.setPhase() is allowed only in AppFlowController.ts.
4. Warn about editor-exposed Component fields that should be Node + NodeRef.

Exit code 0 = pass, 1 = fail.
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


def read_ts(path: Path) -> list[str]:
    return path.read_text(encoding="utf-8", errors="replace").splitlines()


def find_illegal_load_scene() -> list[str]:
    violations = []
    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        rel = ts_file.relative_to(SCRIPTS_DIR)
        for lineno, line in enumerate(read_ts(ts_file), 1):
            stripped = line.strip()
            if not stripped or stripped.startswith(("//", "*", "/*")):
                continue
            if "director.loadScene(" in stripped:
                if re.search(r"director\.loadScene\s*\([\"']", stripped):
                    fname = str(rel).replace("\\", "/")
                    if fname != "app/SceneFlowService.ts":
                        violations.append(f"  {rel}:{lineno}  {stripped[:80]}")
    return violations


def find_illegal_new_component() -> list[str]:
    violations = []
    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        for lineno, line in enumerate(read_ts(ts_file), 1):
            stripped = line.strip()
            for comp in KNOWN_COMPONENTS:
                pattern = f"new {comp}("
                if pattern in stripped and not stripped.startswith(("//", "*")):
                    rel = ts_file.relative_to(SCRIPTS_DIR)
                    violations.append(f"  {rel}:{lineno}  {stripped[:80]}")
                    break
    return violations


def find_illegal_set_phase() -> list[str]:
    violations = []
    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        rel = ts_file.relative_to(SCRIPTS_DIR)
        if str(rel).replace("\\", "/") == "app/AppFlowController.ts":
            continue
        for lineno, line in enumerate(read_ts(ts_file), 1):
            if ".setPhase(" in line and not line.strip().startswith(("//", "*")):
                violations.append(f"  {rel}:{lineno}  {line.strip()[:80]}")
    return violations


def find_risky_editor_component_fields() -> list[str]:
    """Warn about @property(ComponentType) fields in UI scripts.

    Project rule: expose Node fields in the editor, then resolve components
    with NodeRef.component() at runtime. This prevents stale scene bindings
    and Node-vs-Component drag mistakes from breaking panels.
    """
    risky_types = {"Label", "Button", "EditBox", "Sprite"}
    warnings = []

    for ts_file in sorted(SCRIPTS_DIR.rglob("*.ts")):
        rel = ts_file.relative_to(SCRIPTS_DIR)
        rel_text = str(rel).replace("\\", "/")
        if not (rel_text.startswith("ui/") or rel_text in {"MainSceneController.ts"}):
            continue

        pending_type = None
        pending_line = 0
        for lineno, line in enumerate(read_ts(ts_file), 1):
            stripped = line.strip()
            match = re.search(r"@property\s*\(\s*([A-Za-z0-9_]+)\s*\)", stripped)
            if match and match.group(1) in risky_types:
                pending_type = match.group(1)
                pending_line = lineno
                continue

            if pending_type:
                if not stripped or stripped.startswith("//"):
                    continue
                field_match = re.search(r"([A-Za-z0-9_]+)\s*:", stripped)
                field_name = field_match.group(1) if field_match else "<unknown>"
                warnings.append(
                    f"  {rel}:{pending_line}  @property({pending_type}) {field_name} -> prefer @property(Node) + NodeRef"
                )
                pending_type = None
                pending_line = 0

    return warnings


def main() -> int:
    load_scene_issues = find_illegal_load_scene()
    new_comp_issues = find_illegal_new_component()
    set_phase_issues = find_illegal_set_phase()
    editor_field_warnings = find_risky_editor_component_fields()

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
        print("\n[OK] director.loadScene() only in SceneFlowService.ts")

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
        print("\n[OK] setPhase() only in AppFlowController.ts")

    if editor_field_warnings:
        print("\n[WARN] Risky editor Component fields (prefer Node + NodeRef):")
        for v in editor_field_warnings[:40]:
            print(f"  {v}")
        if len(editor_field_warnings) > 40:
            print(f"  ... and {len(editor_field_warnings) - 40} more")
    else:
        print("\n[OK] editor-exposed UI fields use Node-safe binding")

    if failed:
        print(f"\n  [FAIL] {failed} check(s) failed")
        return 1

    print("\n  [OK] All architecture checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
