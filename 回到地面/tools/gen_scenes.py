"""
Cocos Creator 3.8 场景文件生成器
读取脚本 .meta 获取 UUID，生成 splash/main/dungeon 三个场景
"""

import json
import os
import uuid as uuid_module
import base64

SCRIPT_DIR = r"E:/game/回到地面/assets/scripts"
SCENE_DIR = r"E:/game/回到地面/assets/scenes"

# ====== Helper: 读取所有脚本的 UUID ======
def read_script_uuids():
    """从 .meta 文件读取所有脚本 UUID"""
    uuids = {}
    for root, dirs, files in os.walk(SCRIPT_DIR):
        for f in files:
            if f.endswith('.ts.meta'):
                meta_path = os.path.join(root, f)
                with open(meta_path, 'r', encoding='utf-8') as fp:
                    meta = json.load(fp)
                rel_path = os.path.relpath(meta_path, SCRIPT_DIR)
                # 获取 .ts 的真是路径（相对于 assets/scripts/）
                ts_name = f.replace('.meta', '')
                rel_dir = os.path.relpath(root, SCRIPT_DIR)
                if rel_dir == '.':
                    key = ts_name.replace('.ts', '')
                else:
                    key = os.path.join(rel_dir, ts_name.replace('.ts', ''))
                key = key.replace('\\', '/')
                uuids[key] = meta['uuid']
    return uuids

# ====== Scene Builder: 自动追踪数组索引 ======
class SceneBuilder:
    def __init__(self, name, is_2d=True, width=720, height=1280):
        self.objects = []
        self.name = name
        self.is_2d = is_2d
        self.width = width
        self.height = height
        self._id_gen = self._make_id_generator()

    def _make_id_generator(self):
        idx = 0
        while True:
            yield f"id_{idx:06X}"
            idx += 1

    def _gen_id(self):
        return next(self._id_gen)

    def add(self, obj):
        """添加对象，返回其数组索引"""
        idx = len(self.objects)
        self.objects.append(obj)
        return idx

    def ref(self, idx):
        """创建引用对象"""
        return {"__id__": idx}

    def uuid_ref(self, uuid_str, expected_type=None):
        r = {"__uuid__": uuid_str}
        if expected_type:
            r["__expectedType__"] = expected_type
        return r

    def vec2(self, x, y):
        return {"__type__": "cc.Vec2", "x": x, "y": y}

    def vec3(self, x, y, z):
        return {"__type__": "cc.Vec3", "x": x, "y": y, "z": z}

    def vec4(self, x, y, z, w=0):
        return {"__type__": "cc.Vec4", "x": x, "y": y, "z": z, "w": w}

    def quat(self, x, y, z, w):
        return {"__type__": "cc.Quat", "x": x, "y": y, "z": z, "w": w}

    def color(self, r, g, b, a=255):
        return {"__type__": "cc.Color", "r": r, "g": g, "b": b, "a": a}

    def rect(self, x, y, w, h):
        return {"__type__": "cc.Rect", "x": x, "y": y, "width": w, "height": h}

    def new_uuid(self):
        """生成 Cocos Creator 兼容的节点 _id 格式（22 字符 base64）"""
        raw_uuid = uuid_module.uuid4()
        raw_bytes = raw_uuid.bytes
        return base64.b64encode(raw_bytes).decode('ascii').rstrip('=')

    def build_scene(self):
        """构建标准 3D 场景的基础设施"""
        # 0. SceneAsset wrapper
        self.add({
            "__type__": "cc.SceneAsset",
            "_name": self.name,
            "_objFlags": 0,
            "_native": "",
            "scene": self.ref(1)
        })

        # 1. Scene
        scene_id = self.new_uuid()
        scene_idx = self.add({
            "__type__": "cc.Scene",
            "_name": "",
            "_objFlags": 0,
            "_parent": None,
            "_children": [],
            "_active": True,
            "_components": [],
            "_prefab": None,
            "autoReleaseAssets": False,
            "_globals": self.ref(2),
            "_id": scene_id
        })
        self.scene_idx = scene_idx

        # 2. SceneGlobals
        globals_idx = self.add({
            "__type__": "cc.SceneGlobals",
            "ambient": self.ref(3),
            "shadows": self.ref(4),
            "_skybox": self.ref(5),
            "fog": self.ref(6)
        })

        # 3. Ambient
        self.add({
            "__type__": "cc.AmbientInfo",
            "_skyColorHDR": self.vec4(0.365754, 0.568107, 0.9080791, 0),
            "_skyIllumHDR": 20000,
            "_skyIllum": 20000,
            "_groundAlbedoHDR": self.vec4(0.455624, 0.403274, 0.370948, 0),
            "_skyColorLDR": self.vec4(0.452588, 0.607642, 0.755699, 0),
            "_skyIllumLDR": 0.8,
            "_groundAlbedoLDR": self.vec4(0.618555, 0.577848, 0.544564, 0),
        })

        # 4. Shadows
        self.add({
            "__type__": "cc.ShadowsInfo",
            "_type": 0, "_enabled": False,
            "_normal": self.vec3(0, 1, 0), "_distance": 0,
            "_shadowColor": self.color(76, 76, 76),
            "_firstSetCSM": False, "_fixedArea": False,
            "_pcf": 1, "_bias": 0.00001, "_normalBias": 0,
            "_near": 0.1, "_far": 10, "_shadowDistance": 10,
            "_invisibleOcclusionRange": 200, "_orthoSize": 5,
            "_maxReceived": 4,
            "_size": self.vec2(1024, 1024),
            "_saturation": 0.75
        })

        # 5. Skybox
        self.add({
            "__type__": "cc.SkyboxInfo",
            "_applyDiffuseMap": False,
            "_envmapHDR": self.uuid_ref("d032ac98-05e1-4090-88bb-eb640dcb5fc1@b47c0", "cc.TextureCube"),
            "_envmap": self.uuid_ref("d032ac98-05e1-4090-88bb-eb640dcb5fc1@b47c0", "cc.TextureCube"),
            "_envmapLDR": self.uuid_ref("6f01cf7f-81bf-4a7e-bd5d-0afc19696480@b47c0", "cc.TextureCube"),
            "_diffuseMapHDR": None, "_diffuseMapLDR": None,
            "_enabled": True, "_useIBL": False, "_useHDR": True
        })

        # 6. Fog
        self.add({
            "__type__": "cc.FogInfo",
            "_type": 0, "_fogColor": self.color(200, 200, 200),
            "_enabled": False, "_fogDensity": 0.3,
            "_fogStart": 0.5, "_fogEnd": 300,
            "_fogAtten": 5, "_fogTop": 1.5, "_fogRange": 1.2
        })

        if self.is_2d:
            self._build_2d_camera()
        else:
            self._build_3d_camera()

        return scene_idx

    def _build_2d_camera(self):
        """2D 正交相机"""
        cam_id = self.new_uuid()
        cam_node_idx = self.add({
            "__type__": "cc.Node",
            "_name": "Main Camera",
            "_objFlags": 0,
            "_parent": self.ref(self.scene_idx),
            "_children": [],
            "_active": True,
            "_components": [self.ref(len(self.objects) + 1)],
            "_prefab": None,
            "_lpos": self.vec3(0, 0, 1000),
            "_lrot": self.quat(0, 0, 0, 1),
            "_lscale": self.vec3(1, 1, 1),
            "_layer": 1073741824,
            "_euler": self.vec3(0, 0, 0),
            "_id": cam_id
        })
        self._add_scene_child(cam_node_idx)

        # Camera component (2D orthographic)
        self.add({
            "__type__": "cc.Camera",
            "_name": "",
            "_objFlags": 0,
            "node": self.ref(cam_node_idx),
            "_enabled": True,
            "__prefab": None,
            "_projection": 0,  # 0=ortho
            "_priority": 0,
            "_fov": 45,
            "_fovAxis": 0,
            "_orthoHeight": 10,
            "_near": 1,
            "_far": 10000,
            "_color": self.color(51, 51, 51),
            "_depth": 1,
            "_stencil": 0,
            "_clearFlags": 14,
            "_rect": self.rect(0, 0, 1, 1),
            "_aperture": 19,
            "_shutter": 7,
            "_iso": 0,
            "_screenScale": 1,
            "_visibility": 1822425087,
            "_targetTexture": None,
            "_id": self.new_uuid()
        })

    def _build_3d_camera(self):
        """3D 透视相机"""
        cam_id = self.new_uuid()
        cam_node_idx = self.add({
            "__type__": "cc.Node",
            "_name": "Main Camera",
            "_objFlags": 0,
            "_parent": self.ref(self.scene_idx),
            "_children": [],
            "_active": True,
            "_components": [self.ref(len(self.objects) + 1)],
            "_prefab": None,
            "_lpos": self.vec3(-10, 10, 10),
            "_lrot": self.quat(-0.2778, -0.3650, -0.1151, 0.8811),
            "_lscale": self.vec3(1, 1, 1),
            "_layer": 1073741824,
            "_euler": self.vec3(-35, -45, 0),
            "_id": cam_id
        })
        self._add_scene_child(cam_node_idx)

        self.add({
            "__type__": "cc.Camera",
            "_name": "",
            "_objFlags": 0,
            "node": self.ref(cam_node_idx),
            "_enabled": True,
            "__prefab": None,
            "_projection": 1,  # 1=perspective
            "_priority": 0,
            "_fov": 45,
            "_fovAxis": 0,
            "_orthoHeight": 10,
            "_near": 1,
            "_far": 1000,
            "_color": self.color(51, 51, 51),
            "_depth": 1,
            "_stencil": 0,
            "_clearFlags": 14,
            "_rect": self.rect(0, 0, 1, 1),
            "_aperture": 19,
            "_shutter": 7,
            "_iso": 0,
            "_screenScale": 1,
            "_visibility": 1822425087,
            "_targetTexture": None,
            "_id": self.new_uuid()
        })

    def _add_scene_child(self, node_idx):
        """将节点添加到场景的 children 列表"""
        self.objects[self.scene_idx]["_children"].append(self.ref(node_idx))

    def add_node(self, name, parent_idx, components=None, active=True,
                 pos=None, scale=None, layer=1073741824):
        """添加一个节点，返回其索引"""
        if pos is None:
            pos = self.vec3(0, 0, 0)
        if scale is None:
            scale = self.vec3(1, 1, 1)

        comp_refs = []
        if components:
            for comp in components:
                comp_idx = self.add(comp)
                comp_refs.append(self.ref(comp_idx))

        node_id = self.new_uuid()
        node_idx = self.add({
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "_parent": self.ref(parent_idx),
            "_children": [],
            "_active": active,
            "_components": comp_refs,
            "_prefab": None,
            "_lpos": pos,
            "_lrot": self.quat(0, 0, 0, 1),
            "_lscale": scale,
            "_layer": layer,
            "_euler": self.vec3(0, 0, 0),
            "_id": node_id
        })

        # ★ 关键修复：将新节点添加到父节点的 _children 列表
        if parent_idx >= 0 and parent_idx < len(self.objects):
            parent_obj = self.objects[parent_idx]
            if "_children" not in parent_obj:
                parent_obj["_children"] = []
            parent_obj["_children"].append(self.ref(node_idx))
        return node_idx

    def add_script_component(self, script_uuid, node_idx, properties=None):
        """添加一个自定义脚本组件"""
        comp = {
            "__type__": "cc.Script",
            "_name": "",
            "_objFlags": 0,
            "node": self.ref(node_idx),
            "_enabled": True,
            "__prefab": None,
            "_id": self.new_uuid()
        }
        if properties:
            comp.update(properties)
        comp_idx = self.add(comp)
        return comp_idx

    def make_button_component(self, node_idx, target_node_idx, script_uuid, method_name):
        """创建 Button 组件（含 OnClick 回调）"""
        # 需要添加：Button, Sprite, UITransform
        btn_id = self.new_uuid()
        sprite_id = self.new_uuid()
        ui_transform_id = self.new_uuid()

        # UI transform
        ui_transform = {
            "__type__": "cc.UITransform",
            "_name": "",
            "_objFlags": 0,
            "node": self.ref(node_idx),
            "_enabled": True,
            "__prefab": None,
            "_contentSize": self.vec3(200, 60, 0),
            "_anchorPoint": self.vec2(0.5, 0.5),
            "_priority": 0,
            "_id": ui_transform_id
        }

        # Sprite
        sprite = {
            "__type__": "cc.Sprite",
            "_name": "",
            "_objFlags": 0,
            "node": self.ref(node_idx),
            "_enabled": True,
            "__prefab": None,
            "_spriteFrame": None,
            "_type": 0,
            "_sizeMode": 1,
            "_srcBlendFactor": 2,
            "_dstBlendFactor": 4,
            "_color": self.color(255, 255, 255),
            "_id": sprite_id
        }

        # Button
        button = {
            "__type__": "cc.Button",
            "_name": "",
            "_objFlags": 0,
            "node": self.ref(node_idx),
            "_enabled": True,
            "__prefab": None,
            "_transition": 1,  # color transition
            "_pressedScale": 0.9,
            "_hoverScale": 1.05,
            "_target": self.ref(node_idx),
            "_interactable": True,
            "_duration": 0.1,
            "_zoomScale": 0.95,
            "_clickEvents": [
                {
                    "target": self.ref(target_node_idx),
                    "component": "",
                    "handler": method_name,
                    "customEventData": ""
                }
            ],
            "_id": btn_id
        }

        return [ui_transform, sprite, button]

    def make_label(self, node_idx, text="", font_size=24, color=None):
        if color is None:
            color = self.color(255, 255, 255)

        label_id = self.new_uuid()
        ui_transform_id = self.new_uuid()

        return [
            {
                "__type__": "cc.UITransform",
                "_name": "", "_objFlags": 0, "node": self.ref(node_idx),
                "_enabled": True, "__prefab": None,
                "_contentSize": self.vec3(200, 30, 0),
                "_anchorPoint": self.vec2(0.5, 0.5),
                "_priority": 0, "_id": ui_transform_id
            },
            {
                "__type__": "cc.Label",
                "_name": "", "_objFlags": 0, "node": self.ref(node_idx),
                "_enabled": True, "__prefab": None,
                "_string": text,
                "_fontSize": font_size,
                "_lineHeight": font_size * 1.2,
                "_enableWrapText": True,
                "_overflow": 0,
                "_isSystemFontUsed": True,
                "_spacingX": 0,
                "_color": color,
                "_id": label_id
            }
        ]

    def to_json(self):
        return json.dumps(self.objects, indent=2, ensure_ascii=False)

    def save(self, path):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(self.to_json())
        print(f"  已保存: {path}")


# ====== 生成三个场景 ======
def build_splash_scene(script_uuid_splash):
    """启动屏场景"""
    sb = SceneBuilder("splash", is_2d=True)
    scene_idx = sb.build_scene()

    # Canvas
    canvas_idx = sb.add_node("Canvas", scene_idx, active=True)
    # add_node 已自动处理父子关系，不需要再 _add_scene_child

    # Canvas 组件
    canvas_comp = sb.add({
        "__type__": "cc.Canvas",
        "_name": "", "_objFlags": 0,
        "node": sb.ref(canvas_idx),
        "_enabled": True, "__prefab": None,
        "_id": sb.new_uuid()
    })
    sb.objects[canvas_idx]["_components"].append(sb.ref(canvas_comp))

    # SplashUI 节点
    splash_ui_idx = sb.add_node("SplashUI", canvas_idx, active=True)

    # 挂载脚本组件
    splash_comp_idx = sb.add_script_component("", splash_ui_idx)

    # SplashImage (Sprite)
    splash_img_idx = sb.add_node("SplashImage", splash_ui_idx, active=True)

    # 给 SplashImage 添加 UITransform + Sprite 组件
    sprite_id = sb.new_uuid()
    ui_transform_id = sb.new_uuid()
    img_uitf = {
        "__type__": "cc.UITransform",
        "_name": "", "_objFlags": 0, "node": sb.ref(splash_img_idx),
        "_enabled": True, "__prefab": None,
        "_contentSize": sb.vec3(360, 640, 0),
        "_anchorPoint": sb.vec2(0.5, 0.5),
        "_priority": 0, "_id": ui_transform_id
    }
    img_sprite = {
        "__type__": "cc.Sprite",
        "_name": "", "_objFlags": 0, "node": sb.ref(splash_img_idx),
        "_enabled": True, "__prefab": None,
        "_spriteFrame": None, "_type": 0, "_sizeMode": 1,
        "_srcBlendFactor": 2, "_dstBlendFactor": 4,
        "_color": sb.color(255, 255, 255),
        "_id": sprite_id
    }
    for ic in [img_uitf, img_sprite]:
        ci = sb.add(ic)
        sb.objects[splash_img_idx].setdefault("_components", []).append(sb.ref(ci))

    # SkipButton
    skip_btn_idx = sb.add_node("SkipButton", splash_ui_idx, active=True)
    btn_comps = sb.make_button_component(skip_btn_idx, splash_ui_idx, script_uuid_splash, "onSkipClick")
    # Update the target node's _components with the button components
    btn_node_obj = sb.objects[skip_btn_idx]
    comp_indices = []
    for bc in btn_comps:
        ci = sb.add(bc)
        comp_indices.append(ci)
    btn_node_obj["_components"] = [sb.ref(ci) for ci in comp_indices]

    sb.save(os.path.join(SCENE_DIR, "splash.scene"))


def build_main_scene(script_uuid_main):
    """主界面场景"""
    sb = SceneBuilder("main", is_2d=True)
    scene_idx = sb.build_scene()

    # Canvas
    canvas_idx = sb.add_node("Canvas", scene_idx, active=True)
    # add_node 已自动处理父子关系，不需要再 _add_scene_child
    canvas_comp = sb.add({
        "__type__": "cc.Canvas",
        "_name": "", "_objFlags": 0,
        "node": sb.ref(canvas_idx),
        "_enabled": True, "__prefab": None,
        "_id": sb.new_uuid()
    })
    sb.objects[canvas_idx]["_components"].append(sb.ref(canvas_comp))

    # MainSceneController node
    ctrl_idx = sb.add_node("MainSceneController", canvas_idx, active=True)
    sb.add_script_component("", ctrl_idx)

    # MainUI node
    main_ui_idx = sb.add_node("MainUI", ctrl_idx, active=True)

    # Title Label
    title_idx = sb.add_node("TitleLabel", main_ui_idx, active=True)
    title_comps = sb.make_label(title_idx, "回到地面", font_size=48)
    title_node_obj = sb.objects[title_idx]
    comp_indices = []
    for tc in title_comps:
        ci = sb.add(tc)
        comp_indices.append(ci)
    title_node_obj["_components"] = [sb.ref(ci) for ci in comp_indices]

    # 调整位置
    title_node_obj["_lpos"] = sb.vec3(0, 200, 0)

    # StartButton
    btn_idx = sb.add_node("StartButton", main_ui_idx, active=True)
    btn_comps = sb.make_button_component(btn_idx, ctrl_idx, script_uuid_main, "onDungeonEnter")
    btn_node_obj = sb.objects[btn_idx]
    comp_indices = []
    for bc in btn_comps:
        ci = sb.add(bc)
        comp_indices.append(ci)
    btn_node_obj["_components"] = [sb.ref(ci) for ci in comp_indices]
    btn_node_obj["_lpos"] = sb.vec3(0, -50, 0)

    # StartButton Label
    btn_label_idx = sb.add_node("Label", btn_idx, active=True)
    label_comps = sb.make_label(btn_label_idx, "开始游戏", font_size=28)
    label_node_obj = sb.objects[btn_label_idx]
    comp_indices = []
    for lc in label_comps:
        ci = sb.add(lc)
        comp_indices.append(ci)
    label_node_obj["_components"] = [sb.ref(ci) for ci in comp_indices]

    sb.save(os.path.join(SCENE_DIR, "main.scene"))


def build_dungeon_scene(script_uuids):
    """地牢场景 - 核心游戏场景"""
    sb = SceneBuilder("dungeon", is_2d=True)
    scene_idx = sb.build_scene()

    # Canvas
    canvas_idx = sb.add_node("Canvas", scene_idx, active=True)
    # add_node 已自动处理父子关系，不需要再 _add_scene_child
    canvas_comp = sb.add({
        "__type__": "cc.Canvas",
        "_name": "", "_objFlags": 0,
        "node": sb.ref(canvas_idx),
        "_enabled": True, "__prefab": None,
        "_id": sb.new_uuid()
    })
    sb.objects[canvas_idx]["_components"].append(sb.ref(canvas_comp))

    # DungeonSceneController node
    dungeon_ctrl_idx = sb.add_node(
        "DungeonSceneController", canvas_idx, active=True
    )
    sb.add_script_component("", dungeon_ctrl_idx)

    # 创建核心子系统节点
    subsystems = [
        ("GridManager", True),
        ("Player", False),  # 单独处理
        ("VirtualJoystick", True),
        ("BattleManager", True),
        ("DungeonManager", True),
        ("BattleHUD", True),
        ("SkillUI", True),
        ("DungeonMapUI", True),
        ("UpgradeUI", True),
        ("DeathUI", True),
    ]
    # RoomTransition 作为 DungeonManager 的子节点
    # AutoAttack 作为 Player 的子节点

    sub_node_indices = {}
    for name, add_script in subsystems:
        node_idx = sb.add_node(name, dungeon_ctrl_idx, active=True)
        sub_node_indices[name] = node_idx
        if add_script:
            sb.add_script_component("", node_idx)
        if name == "Player":
            # Player 需要挂载两个脚本
            sb.add_script_component("", node_idx)  # PlayerController
            sb.add_script_component("", node_idx)  # AutoAttack

        # 特殊处理：给 BattleHUD 加一些子节点
        if name == "BattleHUD":
            # HPBar progress bar
            hp_bar_idx = sb.add_node("HPBar", node_idx, active=True)
            hp_bar_comps = [
                {
                    "__type__": "cc.UITransform",
                    "_name": "", "_objFlags": 0, "node": sb.ref(hp_bar_idx),
                    "_enabled": True, "__prefab": None,
                    "_contentSize": sb.vec3(200, 20, 0),
                    "_anchorPoint": sb.vec2(0.5, 0.5), "_priority": 0,
                    "_id": sb.new_uuid()
                },
                {
                    "__type__": "cc.ProgressBar",
                    "_name": "", "_objFlags": 0, "node": sb.ref(hp_bar_idx),
                    "_enabled": True, "__prefab": None,
                    "_barSprite": None, "_progress": 1.0,
                    "_totalLength": 200, "_mode": 0,
                    "_id": sb.new_uuid()
                },
                {
                    "__type__": "cc.Sprite",
                    "_name": "", "_objFlags": 0, "node": sb.ref(hp_bar_idx),
                    "_enabled": True, "__prefab": None,
                    "_spriteFrame": None, "_type": 0, "_sizeMode": 1,
                    "_color": sb.color(255, 100, 100),
                    "_id": sb.new_uuid()
                },
            ]
            hp_node_obj = sb.objects[hp_bar_idx]
            for hc in hp_bar_comps:
                ci = sb.add(hc)
                if "_components" not in hp_node_obj:
                    hp_node_obj["_components"] = []
                hp_node_obj.setdefault("_components", []).append(sb.ref(ci))

            # 位置调整
            hp_node_obj["_lpos"] = sb.vec3(0, 600, 0)

            # HPLabel
            hp_label_idx = sb.add_node("HPLabel", node_idx, active=True)
            hp_label_comps = sb.make_label(hp_label_idx, "100/100", font_size=16)
            hp_label_node = sb.objects[hp_label_idx]
            for lc in hp_label_comps:
                ci = sb.add(lc)
                hp_label_node.setdefault("_components", []).append(sb.ref(ci))
            hp_label_node["_lpos"] = sb.vec3(0, 575, 0)

        elif name == "VirtualJoystick":
            # JoystickBg
            jbg_idx = sb.add_node("JoystickBg", node_idx, active=True, pos=sb.vec3(-250, -400, 0))
            jbg_comps = [
                {
                    "__type__": "cc.UITransform",
                    "_name": "", "_objFlags": 0, "node": sb.ref(jbg_idx),
                    "_enabled": True, "__prefab": None,
                    "_contentSize": sb.vec3(120, 120, 0),
                    "_anchorPoint": sb.vec2(0.5, 0.5), "_priority": 0,
                    "_id": sb.new_uuid()
                },
                {
                    "__type__": "cc.Sprite",
                    "_name": "", "_objFlags": 0, "node": sb.ref(jbg_idx),
                    "_enabled": True, "__prefab": None,
                    "_spriteFrame": None, "_type": 0, "_sizeMode": 1,
                    "_color": sb.color(255, 255, 255, 128),
                    "_id": sb.new_uuid()
                },
            ]
            for jc in jbg_comps:
                ci = sb.add(jc)
                sb.objects[jbg_idx].setdefault("_components", []).append(sb.ref(ci))

            # JoystickThumb
            jth_idx = sb.add_node("JoystickThumb", node_idx, active=True, pos=sb.vec3(-250, -400, 0))
            jth_comps = [
                {
                    "__type__": "cc.UITransform",
                    "_name": "", "_objFlags": 0, "node": sb.ref(jth_idx),
                    "_enabled": True, "__prefab": None,
                    "_contentSize": sb.vec3(50, 50, 0),
                    "_anchorPoint": sb.vec2(0.5, 0.5), "_priority": 0,
                    "_id": sb.new_uuid()
                },
                {
                    "__type__": "cc.Sprite",
                    "_name": "", "_objFlags": 0, "node": sb.ref(jth_idx),
                    "_enabled": True, "__prefab": None,
                    "_spriteFrame": None, "_type": 0, "_sizeMode": 1,
                    "_color": sb.color(200, 200, 200, 200),
                    "_id": sb.new_uuid()
                },
            ]
            for jc in jth_comps:
                ci = sb.add(jc)
                sb.objects[jth_idx].setdefault("_components", []).append(sb.ref(ci))

        elif name == "SkillUI":
            # 4 个技能按钮
            pos_offset = [(-300, -400), (-200, -400), (200, -400), (300, -400)]
            slots = ["ActiveLeftBtn", "ActiveRightBtn", "RelicLeftBtn", "RelicRightBtn"]
            for i, (sname, (px, py)) in enumerate(zip(slots, pos_offset)):
                btn_idx = sb.add_node(sname, node_idx, active=(i < 2), pos=sb.vec3(px, py, 0))
                ui_tf = {
                    "__type__": "cc.UITransform",
                    "_name": "", "_objFlags": 0, "node": sb.ref(btn_idx),
                    "_enabled": True, "__prefab": None,
                    "_contentSize": sb.vec3(60, 60, 0),
                    "_anchorPoint": sb.vec2(0.5, 0.5), "_priority": 0,
                    "_id": sb.new_uuid()
                }
                sprite = {
                    "__type__": "cc.Sprite",
                    "_name": "", "_objFlags": 0, "node": sb.ref(btn_idx),
                    "_enabled": True, "__prefab": None,
                    "_spriteFrame": None, "_type": 0, "_sizeMode": 1,
                    "_color": sb.color(100, 100, 255) if i < 2 else sb.color(255, 215, 0),
                    "_id": sb.new_uuid()
                }
                btn = {
                    "__type__": "cc.Button",
                    "_name": "", "_objFlags": 0, "node": sb.ref(btn_idx),
                    "_enabled": True, "__prefab": None,
                    "_transition": 1, "_pressedScale": 0.9,
                    "_target": sb.ref(btn_idx), "_interactable": True,
                    "_duration": 0.1, "_zoomScale": 0.95,
                    "_clickEvents": [],
                    "_id": sb.new_uuid()
                }
                for bc in [ui_tf, sprite, btn]:
                    ci = sb.add(bc)
                    sb.objects[btn_idx].setdefault("_components", []).append(sb.ref(ci))

        elif name == "DeathUI":
            # 觉悟战面板（默认隐藏）
            awaken_idx = sb.add_node("AwakenPanel", node_idx, active=False,
                                     pos=sb.vec3(0, 0, 0))
            # 复活按钮
            revive_idx = sb.add_node("ReviveButton", awaken_idx, active=True)
            revive_comps = sb.make_button_component(revive_idx, node_idx, "", "onReviveClick")
            for rc in revive_comps:
                ci = sb.add(rc)
                sb.objects[revive_idx].setdefault("_components", []).append(sb.ref(ci))
            sb.objects[revive_idx]["_lpos"] = sb.vec3(-80, -50, 0)

            # 结算按钮
            settle_idx = sb.add_node("SettleButton", awaken_idx, active=True)
            settle_comps = sb.make_button_component(settle_idx, node_idx, "", "onSettleClick")
            for sc in settle_comps:
                ci = sb.add(sc)
                sb.objects[settle_idx].setdefault("_components", []).append(sb.ref(ci))
            sb.objects[settle_idx]["_lpos"] = sb.vec3(80, -50, 0)

            # 结算面板（默认隐藏）
            settlement_idx = sb.add_node("SettlementPanel", node_idx, active=False,
                                        pos=sb.vec3(0, 0, 0))
            # 结算信息标签
            labels = ["FloorLabel", "KillLabel", "SoulStoneLabel"]
            label_texts = ["到达层数: 0", "击杀数: 0", "魂石: 0"]
            for li, (lname, ltext) in enumerate(zip(labels, label_texts)):
                lbl_idx = sb.add_node(lname, settlement_idx, active=True,
                                      pos=sb.vec3(0, 50 - li * 40, 0))
                lbl_comps = sb.make_label(lbl_idx, ltext, font_size=24)
                for lc in lbl_comps:
                    ci = sb.add(lc)
                    sb.objects[lbl_idx].setdefault("_components", []).append(sb.ref(ci))

            # 回到地面按钮
            back_idx = sb.add_node("BackToMainBtn", settlement_idx, active=True,
                                  pos=sb.vec3(0, -100, 0))
            back_comps = sb.make_button_component(back_idx, node_idx, "", "onBackToMainClick")
            for bc in back_comps:
                ci = sb.add(bc)
                sb.objects[back_idx].setdefault("_components", []).append(sb.ref(ci))

    # Player 节点 - 脚本组件需在编辑器中手动添加

    sb.save(os.path.join(SCENE_DIR, "dungeon.scene"))


# ====== 主入口 ======
def main():
    print("读取脚本 UUID...")
    script_uuids = read_script_uuids()
    print(f"  找到 {len(script_uuids)} 个脚本:")
    for k, v in sorted(script_uuids.items()):
        print(f"    {k}: {v}")

    print("\n生成 splash.scene...")
    build_splash_scene(script_uuids.get("ui/SplashUI", ""))

    print("生成 main.scene...")
    build_main_scene(script_uuids.get("MainSceneController", ""))

    print("生成 dungeon.scene...")
    build_dungeon_scene(script_uuids)

    print("\n✅ 所有场景文件已生成！")
    print("请在 Cocos Creator 编辑器中刷新 Assets 面板查看效果。")


if __name__ == "__main__":
    main()
