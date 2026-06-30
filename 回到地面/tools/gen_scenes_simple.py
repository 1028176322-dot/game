"""
场景文件生成器 - 简化版
只创建节点层级，不添加脚本组件引用
"""
import json, os, uuid as uuid_mod, base64

def make_node_id():
    """生成 Cocos Creator 节点兼容的 _id"""
    return base64.b64encode(uuid_mod.uuid4().bytes).decode().rstrip('=')

def make_std_id():
    """生成标准 UUID（用于 Scene 等）"""
    return str(uuid_mod.uuid4())

def vec3(x, y, z):
    return {"__type__": "cc.Vec3", "x": x, "y": y, "z": z}

def vec2(x, y):
    return {"__type__": "cc.Vec2", "x": x, "y": y}

def quat(x, y, z, w):
    return {"__type__": "cc.Quat", "x": x, "y": y, "z": z, "w": w}

def color(r, g, b, a=255):
    return {"__type__": "cc.Color", "r": r, "g": g, "b": b, "a": a}

def rect(x, y, w, h):
    return {"__type__": "cc.Rect", "x": x, "y": y, "width": w, "height": h}

def make_ref(idx):
    return {"__id__": idx}

# ====== 构建场景 ======
def build_standard_scene_parts():
    """返回场景的前 12 个标准对象（0-11）：SceneAsset, Scene, Globals, Camera, Canvas"""
    objects = []
    def add(obj):
        idx = len(objects)
        objects.append(obj)
        return idx
    def ref(idx):
        return make_ref(idx)

    # 0. SceneAsset
    add({
        "__type__": "cc.SceneAsset",
        "_name": "dungeon", "_objFlags": 0, "_native": "",
        "scene": ref(1)
    })

    # 1. Scene
    scene_idx = add({
        "__type__": "cc.Scene",
        "_name": "", "_objFlags": 0, "_parent": None,
        "_children": [ref(7), ref(9)],
        "_active": True, "_components": [], "_prefab": None,
        "autoReleaseAssets": False,
        "_globals": ref(2),
        "_id": make_std_id()
    })

    # 2-6. Globals
    add({
        "__type__": "cc.SceneGlobals",
        "ambient": ref(3), "shadows": ref(4), "_skybox": ref(5), "fog": ref(6)
    })
    add({
        "__type__": "cc.AmbientInfo",
        "_skyColorHDR": vec3(0.365754, 0.568107, 0.9080791),
        "_skyIllumHDR": 20000, "_skyIllum": 20000,
        "_groundAlbedoHDR": vec3(0.455624, 0.403274, 0.370948),
    })
    add({
        "__type__": "cc.ShadowsInfo",
        "_type": 0, "_enabled": False, "_normal": vec3(0, 1, 0),
        "_distance": 0, "_shadowColor": color(76, 76, 76),
        "_bias": 0.00001, "_pcf": 1,
        "_near": 0.1, "_far": 10, "_shadowDistance": 10,
        "_size": vec2(1024, 1024), "_maxReceived": 4,
    })
    add({
        "__type__": "cc.SkyboxInfo",
        "_enabled": True, "_useIBL": False, "_useHDR": True,
        "_envmapHDR": None, "_envmap": None, "_envmapLDR": None,
    })
    add({
        "__type__": "cc.FogInfo",
        "_type": 0, "_fogColor": color(200, 200, 200),
        "_enabled": False, "_fogDensity": 0.3,
        "_fogStart": 0.5, "_fogEnd": 300,
    })

    # 7. Main Camera node
    add({
        "__type__": "cc.Node",
        "_name": "Main Camera", "_objFlags": 0,
        "_parent": ref(1), "_children": [], "_active": True,
        "_components": [ref(8)],
        "_prefab": None,
        "_lpos": vec3(0, 0, 1000), "_lrot": quat(0, 0, 0, 1),
        "_lscale": vec3(1, 1, 1), "_layer": 1073741824,
        "_euler": vec3(0, 0, 0),
        "_id": make_node_id()
    })

    # 8. Camera component
    add({
        "__type__": "cc.Camera",
        "_name": "", "_objFlags": 0, "node": ref(7),
        "_enabled": True, "__prefab": None,
        "_projection": 0, "_priority": 0, "_fov": 45,
        "_orthoHeight": 10, "_near": 1, "_far": 10000,
        "_color": color(51, 51, 51),
        "_clearFlags": 14,
        "_rect": rect(0, 0, 1, 1),
        "_visibility": 1822425087, "_targetTexture": None,
        "_id": make_node_id()
    })

    # 9. Canvas node
    canvas_idx = add({
        "__type__": "cc.Node",
        "_name": "Canvas", "_objFlags": 0,
        "_parent": ref(1), "_children": [], "_active": True,
        "_components": [ref(10)],
        "_prefab": None,
        "_lpos": vec3(0, 0, 0), "_lrot": quat(0, 0, 0, 1),
        "_lscale": vec3(1, 1, 1), "_layer": 1073741824,
        "_euler": vec3(0, 0, 0),
        "_id": make_node_id()
    })

    # 10. Canvas component
    add({
        "__type__": "cc.Canvas",
        "_name": "", "_objFlags": 0, "node": ref(9),
        "_enabled": True, "__prefab": None,
        "_id": make_node_id()
    })

    return objects, scene_idx, canvas_idx

def add_node(objects, name, parent_idx):
    """添加一个节点，返回其索引"""
    node_idx = len(objects)
    objects.append({
        "__type__": "cc.Node",
        "_name": name, "_objFlags": 0,
        "_parent": ref_(parent_idx), "_children": [], "_active": True,
        "_components": [],
        "_prefab": None,
        "_lpos": vec3(0, 0, 0), "_lrot": quat(0, 0, 0, 1),
        "_lscale": vec3(1, 1, 1), "_layer": 1073741824,
        "_euler": vec3(0, 0, 0),
        "_id": make_node_id()
    })
    # 更新父节点的 _children
    objects[parent_idx]["_children"].append(ref_(node_idx))
    return node_idx

def ref_(idx):
    return {"__id__": idx}

def save_scene(objects, path):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(objects, f, indent=2, ensure_ascii=False)
    print(f"  已保存: {path}")

# ====== 生成 dungeon 场景 ======
SCENE_DIR = r"E:/game/回到地面/assets/scenes"

print("生成简化版 dungeon.scene...")
objects, scene_idx, canvas_idx = build_standard_scene_parts()

# DungeonSceneController (Canvas 的子节点)
dsc_idx = add_node(objects, "DungeonSceneController", canvas_idx)

# 子系统节点 (DungeonSceneController 的子节点)
sub_nodes = [
    "GridManager", "Player", "VirtualJoystick",
    "BattleManager", "DungeonManager", "BattleHUD",
    "SkillUI", "DungeonMapUI", "UpgradeUI", "DeathUI",
]
for name in sub_nodes:
    add_node(objects, name, dsc_idx)

save_scene(objects, os.path.join(SCENE_DIR, "dungeon.scene"))

# ====== 简化版 splash ======
print("生成简化版 splash.scene...")
obj_s, _, canvas_s = build_standard_scene_parts()
n = add_node(obj_s, "SplashUI", canvas_s)
add_node(obj_s, "SplashImage", n)
save_scene(obj_s, os.path.join(SCENE_DIR, "splash.scene"))

# ====== 简化版 main ======
print("生成简化版 main.scene...")
obj_m, _, canvas_m = build_standard_scene_parts()
ctrl = add_node(obj_m, "MainSceneController", canvas_m)
add_node(obj_m, "MainUI", ctrl)
add_node(obj_m, "StartButton", ctrl)
save_scene(obj_m, os.path.join(SCENE_DIR, "main.scene"))

print("\n✅ 所有简化场景已生成！刷新编辑器查看效果。")
