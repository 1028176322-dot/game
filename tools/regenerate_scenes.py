#!/usr/bin/env python3
"""
Cocos Creator 3.x Scene File Regenerator
Regenerates scene files with fresh sequential IDs to fix library cache corruption issues.
Backups are saved as *.scene.bak.

Usage: python tools/regenerate_scenes.py
"""

import json
import uuid as uuid_lib
import os
import shutil

# ============================================================
# Cocos UUID compression
# ============================================================
BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

def compress_uuid(uuid_str: str) -> str:
    """Compress a standard UUID to 23-char Cocos format"""
    hex_str = uuid_str.replace('-', '')
    result = hex_str[:5]
    for i in range(5, 32, 3):
        h1 = int(hex_str[i], 16)
        h2 = int(hex_str[i+1], 16)
        h3 = int(hex_str[i+2], 16)
        c1 = (h1 << 2) | (h2 >> 2)
        c2 = ((h2 & 3) << 4) | h3
        result += BASE64_CHARS[c1] + BASE64_CHARS[c2]
    return result

def new_uuid() -> str:
    return str(uuid_lib.uuid4())

def compressed_type(uuid_str: str) -> str:
    return compress_uuid(uuid_str)

# ============================================================
# Scene builder helper
# ============================================================
class SceneBuilder:
    """Build a Cocos Creator 3.x scene JSON array."""
    
    def __init__(self, scene_name: str, asset_uuid: str):
        self.entries = []
        self.scene_uuid = asset_uuid  # Must match .meta file UUID!
        
        # Index 0: SceneAsset
        self.entries.append({
            "__type__": "cc.SceneAsset",
            "__editorExtras__": {},
            "_id": "",
            "_name": scene_name,
            "_native": "",
            "_objFlags": 0,
            "scene": {"__id__": 1}
        })
        
        # Index 1: Scene node (no _globals!)
        self.entries.append({
            "__type__": "cc.Scene",
            "__editorExtras__": {},
            "_active": True,
            "_children": [],
            "_components": [],
            "_id": self.scene_uuid,
            "_layer": 1073741824,
            "_lpos": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
            "_lrot": {"__type__": "cc.Quat", "w": 1, "x": 0, "y": 0, "z": 0},
            "_lscale": {"__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1},
            "_euler": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
            "_mobility": 0,
            "_name": "",
            "_objFlags": 0,
            "_parent": None,
            "_prefab": None,
            "autoReleaseAssets": False
        })
        
        self.scene_node_idx = 1
        self.child_nodes = []  # (idx, parent_idx) tracking
    
    def add_node(self, name: str, parent_idx: int, children=None):
        """Add a node and return its index."""
        idx = len(self.entries)
        node = {
            "__type__": "cc.Node",
            "__editorExtras__": {},
            "_active": True,
            "_children": [],
            "_components": [],
            "_id": str(idx),
            "_layer": 1073741824,
            "_lpos": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
            "_lrot": {"__type__": "cc.Quat", "w": 1, "x": 0, "y": 0, "z": 0},
            "_lscale": {"__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1},
            "_euler": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
            "_mobility": 0,
            "_name": name,
            "_objFlags": 0,
            "_parent": {"__id__": parent_idx},
            "_prefab": None
        }
        self.entries.append(node)
        
        # Register as child of parent
        parent = self.entries[parent_idx]
        parent["_children"].append({"__id__": idx})
        
        self.child_nodes.append((idx, parent_idx))
        return idx
    
    def add_component(self, node_idx: int, comp_type: str, extra_fields=None):
        """Add a component to a node and return its index."""
        idx = len(self.entries)
        comp = {
            "__type__": comp_type,
            "__editorExtras__": {},
            "__prefab": None,
            "_enabled": True,
            "_id": str(idx),
            "_name": "",
            "_objFlags": 0,
            "node": {"__id__": node_idx}
        }
        if extra_fields:
            comp.update(extra_fields)
        self.entries.append(comp)
        
        # Register as component of node
        node = self.entries[node_idx]
        node["_components"].append({"__id__": idx})
        return idx
    
    def add_script_component(self, node_idx: int, script_uuid: str, extra_fields=None):
        """Add a script component with compressed UUID type."""
        return self.add_component(node_idx, compressed_type(script_uuid), extra_fields)
    
    def to_json(self) -> str:
        """Output as single-line JSON array."""
        return json.dumps(self.entries, ensure_ascii=False, separators=(',', ':'))


# ============================================================
# Script UUIDs (from .meta files)
# ============================================================
SCRIPT_UUIDS = {
    "SplashUI": "84b255a5-dfea-4529-9df0-266355422bb9",
    "MainSceneController": "7281852a-98e7-4033-94ee-e9ba8c544901",
    "DungeonSceneController": "2939eb96-2227-48d9-8894-d6ac34af8daa",
    "GridManager": "4180736e-043b-44a4-a955-00a4c70e8acc",
    "PlayerController": "ad1e8e0e-526a-46e9-b147-71e5d0da6184",
    "AutoAttack": "8b95cbf9-e4e7-4516-90a8-41e75908d4be",
    "VirtualJoystick": "50d59f41-8e23-420e-bdee-ca34cc62234f",
    "BattleManager": "aff11a94-b038-4b46-b736-b0258198813d",
    "BattleHUD": "a47b088f-22f9-4c86-be95-76c740db3ac9",
    "SkillUI": "a0b3122e-be24-4a38-9a98-9469f393e89d",
    "DungeonMapUI": "3360d6df-f452-40f0-a423-056efb7ad842",
    "UpgradeUI": "67e74083-b74b-4873-b127-0048cfe9c9a0",
    "DeathUI": "4f97f0a8-7306-495d-a0af-2844c101100f",
}


# ============================================================
# Scene 1: splash.scene
# ============================================================
def build_splash_scene(asset_uuid: str):
    """Canvas → SplashUI → SplashImage, SkipButton + SplashUI script"""
    b = SceneBuilder("splash", asset_uuid)
    
    # Add Main Light (child of scene)
    light_node = b.add_node("Main Light", b.scene_node_idx)
    b.add_component(light_node, "cc.DirectionalLight", {
        "_color": {"__type__": "cc.Color", "r": 255, "g": 244, "b": 214, "a": 255},
        "_illuminance": 65000,
        "_temperature": 6500,
        "_useColorTemperature": False,
    })
    
    # Add Main Camera (child of scene)
    cam_node = b.add_node("Main Camera", b.scene_node_idx)
    b.add_component(cam_node, "cc.Camera", {
        "_aperture": 16,
        "_clearFlags": 14,
        "_color": {"__type__": "cc.Color", "r": 82, "g": 97, "b": 122, "a": 255},
        "_depth": 1,
        "_far": 1000,
        "_fov": 45,
        "_fovAxis": 0,
        "_iso": 100,
        "_near": 1,
        "_orthoHeight": 10,
        "_priority": 0,
        "_projection": 1,
        "_rect": {"__type__": "cc.Rect", "x": 0, "y": 0, "width": 1, "height": 1},
        "_screenScale": 1,
        "_shutter": 7,
        "_stencil": 0,
        "_targetTexture": None,
        "_visibility": 16777215,
    })
    
    # Add Canvas (child of scene)
    canvas = b.add_node("Canvas", b.scene_node_idx)
    b.add_component(canvas, "cc.UITransform", {
        "_contentSize": {"__type__": "cc.Size", "width": 1280, "height": 720},
        "_anchorPoint": {"__type__": "cc.Vec2", "x": 0.5, "y": 0.5},
    })
    b.add_component(canvas, "cc.Canvas", {
        "_cameraComponent": None,
        "_alignCanvasWithScreen": True,
    })
    
    # SplashUI node (child of Canvas)
    splash_ui = b.add_node("SplashUI", canvas)
    
    # SplashImage (child of SplashUI)
    b.add_node("SplashImage", splash_ui)
    
    # SkipButton (child of SplashUI)
    b.add_node("SkipButton", splash_ui)
    
    # SplashScript node with SplashUI script component (child of SplashUI)
    splash_script = b.add_node("SplashScript", splash_ui)
    b.add_script_component(splash_script, SCRIPT_UUIDS["SplashUI"], {
        "skipLabel": None,
        "splashImage": None,
    })
    
    return b.to_json()


# ============================================================
# Scene 2: main.scene
# ============================================================
def build_main_scene(asset_uuid: str):
    """Canvas → MainUI → StartButton + MainSceneController script"""
    b = SceneBuilder("main", asset_uuid)
    
    # Main Light
    light_node = b.add_node("Main Light", b.scene_node_idx)
    b.add_component(light_node, "cc.DirectionalLight", {
        "_color": {"__type__": "cc.Color", "r": 255, "g": 244, "b": 214, "a": 255},
        "_illuminance": 65000,
        "_temperature": 6500,
        "_useColorTemperature": False,
    })
    
    # Main Camera
    cam_node = b.add_node("Main Camera", b.scene_node_idx)
    b.add_component(cam_node, "cc.Camera", {
        "_aperture": 16,
        "_clearFlags": 14,
        "_color": {"__type__": "cc.Color", "r": 82, "g": 97, "b": 122, "a": 255},
        "_depth": 1,
        "_far": 1000,
        "_fov": 45,
        "_fovAxis": 0,
        "_iso": 100,
        "_near": 1,
        "_orthoHeight": 10,
        "_priority": 0,
        "_projection": 1,
        "_rect": {"__type__": "cc.Rect", "x": 0, "y": 0, "width": 1, "height": 1},
        "_screenScale": 1,
        "_shutter": 7,
        "_stencil": 0,
        "_targetTexture": None,
        "_visibility": 16777215,
    })
    
    # Canvas
    canvas = b.add_node("Canvas", b.scene_node_idx)
    b.add_component(canvas, "cc.UITransform", {
        "_contentSize": {"__type__": "cc.Size", "width": 1280, "height": 720},
        "_anchorPoint": {"__type__": "cc.Vec2", "x": 0.5, "y": 0.5},
    })
    b.add_component(canvas, "cc.Canvas", {
        "_cameraComponent": None,
        "_alignCanvasWithScreen": True,
    })
    
    # MainUI node
    main_ui = b.add_node("MainUI", canvas)
    
    # StartButton
    b.add_node("StartButton", main_ui)
    
    # MainSceneController script node
    main_ctrl = b.add_node("MainSceneController", main_ui)
    b.add_script_component(main_ctrl, SCRIPT_UUIDS["MainSceneController"], {
        "startButton": None,
    })
    
    return b.to_json()


# ============================================================
# Scene 3: dungeon.scene
# ============================================================
def build_dungeon_scene(asset_uuid: str):
    """
    Canvas (UITransform + Canvas)
    ├── DungeonSceneController (wrapper)
    │   ├── DungeonSceneController (script holder → DungeonSceneController script)
    │   ├── GridManager (wrapper)
    │   │   └── GridManager (script holder → GridManager script)
    │   ├── Player (wrapper)
    │   │   ├── PlayerController (script holder → PlayerController script)
    │   │   └── AutoAttack (script holder → AutoAttack script)
    │   ├── VirtualJoystick (wrapper)
    │   │   └── VirtualJoystick (script holder → VirtualJoystick script)
    │   ├── BattleManager (wrapper)
    │   │   └── BattleManager (script holder → BattleManager script)
    │   ├── DungeonManager (wrapper)
    │   │   └── DungeonManager (script holder)
    │   ├── BattleHUD (wrapper)
    │   │   └── BattleHUD (script holder → BattleHUD script)
    │   ├── SkillUI (wrapper)
    │   │   └── SkillUI (script holder → SkillUI script)
    │   ├── DungeonMapUI (wrapper)
    │   │   └── DungeonMapUI (script holder → DungeonMapUI script)
    │   ├── UpgradeUI (wrapper)
    │   │   └── UpgradeUI (script holder → UpgradeUI script)
    │   └── DeathUI (wrapper)
    │       └── DeathUI (script holder → DeathUI script)
    """
    b = SceneBuilder("dungeon", asset_uuid)
    
    def add_camera_node():
        cam_node = b.add_node("Main Camera", b.scene_node_idx)
        b.add_component(cam_node, "cc.Camera", {
            "_aperture": 19,
            "_clearFlags": 14,
            "_color": {"__type__": "cc.Color", "r": 82, "g": 97, "b": 122, "a": 255},
            "_depth": 1,
            "_far": 1000,
            "_fov": 45,
            "_fovAxis": 0,
            "_iso": 0,
            "_near": 1,
            "_orthoHeight": 10,
            "_priority": 0,
            "_projection": 1,
            "_rect": {"__type__": "cc.Rect", "x": 0, "y": 0, "width": 1, "height": 1},
            "_screenScale": 1,
            "_shutter": 7,
            "_stencil": 0,
            "_targetTexture": None,
            "_visibility": 16777215,
        })
    
    # Main Light (child of scene)
    light_node = b.add_node("Main Light", b.scene_node_idx)
    b.add_component(light_node, "cc.DirectionalLight", {
        "_color": {"__type__": "cc.Color", "r": 255, "g": 250, "b": 240, "a": 255},
        "_illuminance": 65000,
        "_temperature": 6500,
        "_useColorTemperature": False,
    })
    
    # Main Camera (child of scene)
    add_camera_node()
    
    # Canvas (child of scene)
    canvas = b.add_node("Canvas", b.scene_node_idx)
    b.add_component(canvas, "cc.UITransform", {
        "_contentSize": {"__type__": "cc.Size", "width": 1280, "height": 720},
        "_anchorPoint": {"__type__": "cc.Vec2", "x": 0.5, "y": 0.5},
    })
    b.add_component(canvas, "cc.Canvas")
    
    # --- DungeonSceneController wrapper ---
    dsc_wrapper = b.add_node("DungeonSceneController", canvas)
    
    # DungeonSceneController script holder
    dsc_holder = b.add_node("DungeonSceneController", dsc_wrapper)
    b.add_script_component(dsc_holder, SCRIPT_UUIDS["DungeonSceneController"])
    
    # GridManager wrapper
    gm_wrapper = b.add_node("GridManager", dsc_wrapper)
    gm_holder = b.add_node("GridManager", gm_wrapper)
    b.add_script_component(gm_holder, SCRIPT_UUIDS["GridManager"], {
        "tilePrefab": None,
    })
    
    # Player wrapper
    player_wrapper = b.add_node("Player", dsc_wrapper)
    
    # PlayerController script holder
    pc_holder = b.add_node("PlayerController", player_wrapper)
    b.add_script_component(pc_holder, SCRIPT_UUIDS["PlayerController"], {
        "maxHP": 100,
        "atk": 10,
        "def": 3,
        "moveSpeed": 200,
    })
    
    # AutoAttack script holder
    aa_holder = b.add_node("AutoAttack", player_wrapper)
    b.add_script_component(aa_holder, SCRIPT_UUIDS["AutoAttack"], {
        "attackRange": 2,
        "attackInterval": 1,
        "atk": 10,
        "critChance": 0.05,
    })
    
    # VirtualJoystick wrapper
    vj_wrapper = b.add_node("VirtualJoystick", dsc_wrapper)
    vj_holder = b.add_node("VirtualJoystick", vj_wrapper)
    b.add_script_component(vj_holder, SCRIPT_UUIDS["VirtualJoystick"], {
        "joystickBg": None,
        "joystickThumb": None,
    })
    
    # BattleManager wrapper
    bm_wrapper = b.add_node("BattleManager", dsc_wrapper)
    bm_holder = b.add_node("BattleManager", bm_wrapper)
    b.add_script_component(bm_holder, SCRIPT_UUIDS["BattleManager"], {
        "monsterPrefab": None,
    })
    
    # DungeonManager wrapper
    dm_wrapper = b.add_node("DungeonManager", dsc_wrapper)
    dm_holder = b.add_node("DungeonManager", dm_wrapper)
    # No script component on DungeonManager in old scene
    
    # BattleHUD wrapper
    bh_wrapper = b.add_node("BattleHUD", dsc_wrapper)
    bh_holder = b.add_node("BattleHUD", bh_wrapper)
    b.add_script_component(bh_holder, SCRIPT_UUIDS["BattleHUD"], {
        "hpBar": None,
        "hpLabel": None,
        "floorLabel": None,
        "killLabel": None,
        "damageNumberPrefab": None,
    })
    
    # SkillUI wrapper
    su_wrapper = b.add_node("SkillUI", dsc_wrapper)
    su_holder = b.add_node("SkillUI", su_wrapper)
    b.add_script_component(su_holder, SCRIPT_UUIDS["SkillUI"], {
        "activeLeftBtn": None,
        "activeRightBtn": None,
        "relicLeftBtn": None,
        "relicRightBtn": None,
        "activeLeftCDLabel": None,
        "activeRightCDLabel": None,
        "relicLeftCDLabel": None,
        "relicRightCDLabel": None,
    })
    
    # DungeonMapUI wrapper
    dmu_wrapper = b.add_node("DungeonMapUI", dsc_wrapper)
    dmu_holder = b.add_node("DungeonMapUI", dmu_wrapper)
    b.add_script_component(dmu_holder, SCRIPT_UUIDS["DungeonMapUI"], {
        "roomNodePrefab": None,
        "mapContainer": None,
        "lineSprite": None,
    })
    
    # UpgradeUI wrapper
    uu_wrapper = b.add_node("UpgradeUI", dsc_wrapper)
    uu_holder = b.add_node("UpgradeUI", uu_wrapper)
    b.add_script_component(uu_holder, SCRIPT_UUIDS["UpgradeUI"], {
        "panelNode": None,
        "option1": None,
        "option2": None,
        "option3": None,
    })
    
    # DeathUI wrapper
    du_wrapper = b.add_node("DeathUI", dsc_wrapper)
    du_holder = b.add_node("DeathUI", du_wrapper)
    b.add_script_component(du_holder, SCRIPT_UUIDS["DeathUI"], {
        "awakenPanel": None,
        "settlementPanel": None,
        "floorLabel": None,
        "killLabel": None,
        "soulStoneLabel": None,
        "reviveButton": None,
    })
    
    return b.to_json()


# ============================================================
# Main
# ============================================================
SCENES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "scenes")

def write_scene(filename: str, content: str):
    path = os.path.join(SCENES_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Written: {path} ({os.path.getsize(path)} bytes)")

if __name__ == "__main__":
    # Read .meta UUIDs to match scene node _id
    meta_uuids = {}
    for name in ['splash', 'main', 'dungeon']:
        meta_path = os.path.join(SCENES_DIR, f"{name}.scene.meta")
        if os.path.exists(meta_path):
            with open(meta_path) as f:
                meta = json.load(f)
            meta_uuids[name] = meta.get("uuid", "")
            print(f"Read {name}.scene.meta uuid: {meta_uuids[name]}")
        else:
            meta_uuids[name] = new_uuid()
            print(f"{name}.scene.meta not found, generated new uuid: {meta_uuids[name]}")
    
    print()
    
    # Regenerate scene files with matching UUIDs
    splash_json = build_splash_scene(meta_uuids["splash"])
    write_scene("splash.scene", splash_json)
    
    main_json = build_main_scene(meta_uuids["main"])
    write_scene("main.scene", main_json)
    
    dungeon_json = build_dungeon_scene(meta_uuids["dungeon"])
    write_scene("dungeon.scene", dungeon_json)
    
    print("\nAll scenes regenerated.")
    print("Run Cocos Creator and test the scenes.")
    print("Backup files are at *.scene.bak")
