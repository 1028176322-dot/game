#!/usr/bin/env python3
"""Create ultra-minimal scene files to test Cocos Creator import."""
import json, os, shutil

SCENES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'scenes')

# Delete existing .meta and .bak files to prevent confusion
for name in ['splash', 'main', 'dungeon']:
    for ext in ['.scene.meta', '.scene.bak', '.scene.bak.meta']:
        p = os.path.join(SCENES_DIR, name + ext)
        if os.path.exists(p):
            os.remove(p)
            print(f'Removed: {p}')

# Also clean temp/library again
for d in ['temp', 'library']:
    dp = os.path.join(os.path.dirname(SCENES_DIR), d)
    if os.path.exists(dp):
        shutil.rmtree(dp, ignore_errors=True)
        print(f'Removed: {dp}')

# Minimal scene - bare bones, NO custom scripts
scene = [
    # [0] SceneAsset
    {
        "__type__": "cc.SceneAsset",
        "_id": "",
        "_name": "splash",
        "_objFlags": 0,
        "_native": "",
        "scene": {"__id__": 1}
    },
    # [1] Scene node
    {
        "__type__": "cc.Scene",
        "_active": True,
        "_children": [{"__id__": 2}, {"__id__": 4}, {"__id__": 6}],
        "_components": [],
        "_id": "",
        "_layer": 1073741824,
        "_lpos": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
        "_lrot": {"__type__": "cc.Quat", "x": 0, "y": 0, "z": 0, "w": 1},
        "_lscale": {"__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1},
        "_euler": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
        "_mobility": 0,
        "_name": "splash",
        "_objFlags": 0,
        "_parent": None,
        "_prefab": None,
        "autoReleaseAssets": False
    },
    # [2] Main Light
    {
        "__type__": "cc.Node",
        "_active": True,
        "_children": [],
        "_components": [{"__id__": 3}],
        "_id": "2",
        "_layer": 1073741824,
        "_lpos": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
        "_lrot": {"__type__": "cc.Quat", "x": -0.064, "y": -0.446, "z": -0.824, "w": -0.344},
        "_lscale": {"__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1},
        "_euler": {"__type__": "cc.Vec3", "x": -117.894, "y": -194.909, "z": 38.562},
        "_mobility": 0,
        "_name": "Main Light",
        "_objFlags": 0,
        "_parent": {"__id__": 1},
        "_prefab": None
    },
    # [3] DirectionalLight
    {
        "__type__": "cc.DirectionalLight",
        "__prefab": None,
        "_color": {"__type__": "cc.Color", "r": 255, "g": 250, "b": 240, "a": 255},
        "_colorTemperature": 6550,
        "_enabled": True,
        "_id": "3",
        "_illuminance": 65000,
        "_name": "",
        "_objFlags": 0,
        "_shadowEnabled": False,
        "_useColorTemperature": False,
        "_visibility": -325058561,
        "node": {"__id__": 2}
    },
    # [4] Main Camera
    {
        "__type__": "cc.Node",
        "_active": True,
        "_children": [],
        "_components": [{"__id__": 5}],
        "_id": "4",
        "_layer": 1073741824,
        "_lpos": {"__type__": "cc.Vec3", "x": -10, "y": 10, "z": 10},
        "_lrot": {"__type__": "cc.Quat", "x": -0.278, "y": -0.365, "z": -0.115, "w": 0.881},
        "_lscale": {"__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1},
        "_euler": {"__type__": "cc.Vec3", "x": -35, "y": -45, "z": 0},
        "_mobility": 0,
        "_name": "Main Camera",
        "_objFlags": 0,
        "_parent": {"__id__": 1},
        "_prefab": None
    },
    # [5] Camera component
    {
        "__type__": "cc.Camera",
        "__prefab": None,
        "_aperture": 19,
        "_clearFlags": 14,
        "_color": {"__type__": "cc.Color", "r": 51, "g": 51, "b": 51, "a": 255},
        "_depth": 1,
        "_enabled": True,
        "_far": 1000,
        "_fov": 45,
        "_fovAxis": 0,
        "_id": "5",
        "_iso": 0,
        "_name": "",
        "_near": 1,
        "_objFlags": 0,
        "_orthoHeight": 10,
        "_priority": 0,
        "_projection": 1,
        "_rect": {"__type__": "cc.Rect", "x": 0, "y": 0, "width": 1, "height": 1},
        "_screenScale": 1,
        "_shutter": 7,
        "_stencil": 0,
        "_targetTexture": None,
        "_visibility": 16777215,
        "node": {"__id__": 4}
    },
    # [6] Canvas
    {
        "__type__": "cc.Node",
        "_active": True,
        "_children": [],
        "_components": [{"__id__": 7}, {"__id__": 8}],
        "_id": "6",
        "_layer": 1073741824,
        "_lpos": {"__type__": "cc.Vec3", "x": 640, "y": 360, "z": 0},
        "_lrot": {"__type__": "cc.Quat", "x": 0, "y": 0, "z": 0, "w": 1},
        "_lscale": {"__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1},
        "_euler": {"__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0},
        "_mobility": 0,
        "_name": "Canvas",
        "_objFlags": 0,
        "_parent": {"__id__": 1},
        "_prefab": None
    },
    # [7] UITransform
    {
        "__type__": "cc.UITransform",
        "__prefab": None,
        "_anchorPoint": {"__type__": "cc.Vec2", "x": 0.5, "y": 0.5},
        "_contentSize": {"__type__": "cc.Size", "width": 1280, "height": 720},
        "_enabled": True,
        "_id": "7",
        "_name": "",
        "_objFlags": 0,
        "node": {"__id__": 6}
    },
    # [8] Canvas component
    {
        "__type__": "cc.Canvas",
        "__prefab": None,
        "_alignCanvasWithScreen": True,
        "_cameraComponent": None,
        "_enabled": True,
        "_id": "8",
        "_name": "",
        "_objFlags": 0,
        "node": {"__id__": 6}
    }
]

# Write minimal splash.scene
for name in ['splash', 'main', 'dungeon']:
    data = json.loads(json.dumps(scene))
    data[0]["_name"] = name
    data[1]["_name"] = name
    path = os.path.join(SCENES_DIR, f'{name}.scene')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Written: {path} ({os.path.getsize(path)} bytes)')

print('\nDone. Restart Cocos Creator and check if scene files show as valid scenes.')
