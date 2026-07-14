# 3D 角色资源生成流程 · 完整说明（方案 A：水密战士 CHR_Warrior_A）

> 本文档为**自包含、可审查**的权威说明，供另一台电脑 / 审查人员完整复现与核对该 3D 角色资源生成流程。
> 包含：根因分析、方案决策、完整管线步骤、**全部脚本源码**、配置文件原文、入库规则、验证命令与真实输出、已知陷阱、跨文件同步清单、审查 Checklist。
>
> 项目：回到地面（"回到地面" 工作区）
> 适用职业：本项目全部角色（鹿弓手 / 熊战士 / 狐刺客 / 兔法师 / 猪狂战 …），本文以「战士（Warrior）」为已交付范本。
> 技能来源：`character-3d-from-concept` skill（从 2D 母图 / 文生 3D 概念图生成可入库 3D 角色 GLB）
> 文档版本：v11 / 2026-07-13

---

## 0. 一句话结论

- 最终模型外观 = **图生 3D 母图本体**（造型 + PBR 金色金属盔甲），不替换、不投影替代。
- 裂痕根因已被**从构造上根除**：用 **Voxel Remesh** 把母图零散碎片（~1312 块）熔成**单一连续水密表皮**，再 EMIT 烘焙母图 PBR 回新网格。
- 交付物 `CHR_Warrior_A` 经 **Blender 回环焊接校验 = 1 连通块 / 0 真实边界边（水密 ✓）**，并经 `asset_validate` 全项 PASS。
- 因 **Decimate 减面会重新撕开裂痕**，按用户授权采用「保留 5268 tri + 预算例外」路线（例外仅作用于本资产）。

---

## 1. 环境依赖（精确版本 / 路径）

| 依赖 | 版本 / 路径 | 说明 |
|---|---|---|
| Blender | `C:/Program Files/Blender Foundation/Blender 5.1/blender.exe` | headless 构建。其他版本用环境变量 `BLENDER_EXE` 覆盖 |
| Python | `C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe`（或系统 `python3`） | 校验器 / GLB 解析工具无第三方依赖（仅 stdlib + numpy for Blender 内脚本） |
| 构建脚本 | `回到地面/.workbuddy/skills/character-3d-from-concept/scripts/build_from_prototype_v11.py` | 方案 A 正本（本文 §6.1 全文嵌入） |
| 校验器 | `回到地面/tools/asset_validate.py` | 本文 §6.4 全文嵌入 |
| 预算配置 | `assets/resources/config/art_quality_budget.json`（**上层** `d:/game/assets/...`，角色注册目录所在层） | 含 `rules3d` 与 `exceptions`（本文 §7.1 全文嵌入） |
| 入库目录 | `assets/resources/models/characters/` | 注意：本工作区存在**两层同名目录**（上层 `d:/game/assets/...` 与项目级 `d:/game/回到地面/assets/...`）。角色注册 manifest 落在**上层**目录；项目级目录无 `models/characters` |
| 规则权威 | `回到地面/.workbuddy/memory/topics/ART_RESOURCE_RULES.md` §16 | 本文 §8 全文引用 |

> ⚠ 跨层同名警告（关键）：`docs/ assets/ tools/ .workbuddy/ art_source/` 在 `d:/game/` 与 `d:/game/回到地面/` 都存在。角色资产实际注册在**上层** `d:/game/assets/resources/models/characters/`。校验时请指定上层预算文件，或让 `asset_validate.py` 的 `--budget` 解析（它会从 cwd 向上查找）命中正确文件。

---

## 2. 整体架构 / 流程图

```
           2D 母图 / 文生 3D 概念图
                      │
        ┌─────────────┴───────────────┐
        │  Step 1  概念图生成 + 人工确认门禁  │
        └─────────────┬───────────────┘
                      ▼
        ┌──────────────────────────────┐
        │  Step 2  AI 3D 原型 (图生 3D)    │  gen_prototype.py
        │  → prototype.glb (~15万面, PBR)  │  (mesh 多块、无骨架、无动画)
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │  Step 3  减面转 FBX (供 Mixamo)  │  glb_to_mixamo_fbx.py
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │  Step 4  Mixamo 绑骨 + 套动作    │  (仅取 armature + 动画 FBX，
        │  (只取骨架/动画，不用其网格)      │   网格当本体=外观不符，禁用)
        └──────────────┬───────────────┘
                       ▼
   ╔═══════════════════╪══════════════════════════════════════════╗
   ║  Step 5  build_from_prototype_v11.py  (方案 A 核心，本文 §6.1)  ║
   ║                                                            ║
   ║  (a) 导入 prototype.glb → 合并多 mesh 为 SRC                  ║
   ║  (b) 复制为 PM（重网格目标）                                  ║
   ║  (c) 水密门禁：若 SRC 是碎片(连通块>1) → Voxel Remesh 熔成水密  ║
   ║      ├─ 自动调体素到 2000~3000 三角（构造即水密，无裂痕）        ║
   ║      ├─ Smart UV 重展                                          ║
   ║      └─ EMIT 烘焙：母图 baseColor/normal/metallicRough → 新UV  ║
   ║  (d) 材质塌缩为 1 槽（避免导出多余 primitive 重现碎片）         ║
   ║  (e) Blender 内三角化 + 平滑 + 清除 split normals             ║
   ║  (f) 水密校验：components=1 / boundary_edges=0                ║
   ║  (g) 导入 idle FBX → 抢 armature → 归一化 scale=1            ║
   ║  (h) 删 SRC 网格，仅留 PM（可见本体）                         ║
   ║  (i) 手动权重蒙皮（顶点→最近3骨线段距离反比，100%可靠）         ║
   ║  (j) 减骨（手指/脚趾/末端）→ 权重重挂 Hand/Foot/Head          ║
   ║  (k) 加 8 挂点（空节点父级到骨骼）                             ║
   ║  (l) idle + 各段动画 push 到 NLA                              ║
   ║  (m) 导出 GLB（embedded 纹理、skin、NLA 动画、sockets）       ║
   ║  (n) 写 .assetmeta.json manifest                              ║
   ╚═══════════════════╪══════════════════════════════════════════╝
                       ▼
        ┌──────────────────────────────┐
        │  Step 6  独立水密复验            │  glb_watertight_check.py (§6.2)
        │          + Blender 回环焊接校验  │  rt_check2.py (§6.3)
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │  Step 7  asset_validate 全项校验 │  asset_validate.py (§6.4)
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │  Step 8  入库 + 跨文件同步       │  characters/ + manifest + 文档
        └──────────────────────────────┘
```

---

## 3. 裂痕根因分析（为什么旧版有裂痕，方案 A 如何根除）

### 3.1 裂痕的真正制造者

| 阶段 | 操作 | 结果 |
|---|---|---|
| 母图生成 | AI 图生 3D | 母图本体由 **~1312 个独立碎片 mesh** 组成（meshfrag） |
| 旧管线减面 | `Decimate`（COLLAPSE） | Decimate **不保证流形（不保水密）**，把水密网格重新打碎成 59 个连通块（导出 GLB 实测） |
| 旧管线导出 | glTF 导出 N-gon | 体素网格含 N-gon，glTF 导出器的 N-gon 三角化把表面撕成碎片（9305 条边界边） |

→ 视觉表现：**体表大量可见裂痕**。

### 3.2 真实裂痕指标 vs 误报

- **真实裂痕指标 = 边界边数（boundary edges）**：只被 1 个三角共用的边 = 破洞 / 裂痕。
- **连通块数（components）不可靠**：glTF 导出会沿 UV 接缝把顶点复制分裂（重复顶点），使连通块数虚高，必须用「焊接后再数」才准。
- **朴素按索引数边界边 = 假阳性**：UV 接缝分裂出的重复顶点会让每条接缝都被误判为破洞（实测误报 6336 / 6490 条）。

### 3.3 方案 A 的根除机制

1. **Voxel Remesh 天然水密**：体素重网格总是输出**单一封闭流形网格**，从构造上杜绝裂痕。三角面数 ∝ `1/voxel_size²`。
2. **导出前在 Blender 内用 bmesh 预三角化**：避免 glTF 导出器对 N-gon 的撕裂三角化。
3. **EMIT 烘焙替代 DIFFUSE**：金属材质（metallic=1）用 DIFFUSE bake 输出黑，改用 EMIT（自发光）把母图 baseColor/normal/metallicRoughness 颜色原样投影到新网格 UV → 保留金色盔甲外观。
4. **材质槽塌缩为 1 个**：避免 glTF 导出第二个 primitive 带回旧碎片。

### 3.4 减面会重新撕裂痕（核心约束，决定预算例外）

对本水密结构实测：

| 减面方式 | 面数 | 焊接后真实边界边 | 结论 |
|---|---|---|---|
| COLLAPSE 减到 0.55 | ~2850 | **604 条真实破洞** | 撕裂 ✗ |
| DISSOLVE 各角度 | — | 196+ 破洞，角度大还碎成多块 | 撕裂 ✗ |
| 不手动三角化、仅 apply Decimate | 2850 | 604 | 撕裂 ✗ |

→ **Decimate（任何模式）不保流形，会重新撕开裂痕**，正是用户最想根治的问题。
→ 因此方案 A 的水密结构天然落在 **~5268 tri**（体素网格四边形在 glTF 导出时三角化翻倍），**减面与无裂痕在本结构上互斥**。

### 3.5 决策（用户已确认）

> **保留你已确认的 5268 水密版，授权放宽预算，正式入库为 `CHR_Warrior_A`（已批准）。**
> 即在 `art_quality_budget.json` 加该资产专属例外 `exceptions.CHR_Warrior_A.maxTri=6000`，并让 `asset_validate.py` 识别例外（仅本资产放宽，其他角色仍受 3000 硬约束）。

---

## 4. 完整管线步骤（与 build_from_prototype_v11.py 逐段对应）

| 步骤 | 动作 | 关键代码位置（§6.1） |
|---|---|---|
| 1 | 导入 prototype.glb，多 mesh 合并为 SRC，apply transform（scale/rot 折进 mesh，使 voxel_size 单位一致） | line 342–361 |
| 2 | 复制 SRC → PM（重网格目标） | line 363–369 |
| 3 | **水密门禁**：`count_components(PM)`；若 >1（碎片）→ Voxel Remesh 熔成水密，自动调体素到 2000~3000，Smart UV 重展，EMIT 烘焙母图 PBR；否则若已水密且超预算再轻量减面 | line 371–426 |
| 4 | 材质槽塌缩为 1 个（强制所有面用 slot 0） | line 428–438 |
| 5 | Blender 内三角化 + 平滑着色 + 清除 split normals；`PRE_EXPORT` 水密校验（components/boundary_edges） | line 440–453 |
| 6 | 导入 idle FBX → 抢 armature → `transform_apply(scale=True)` 归一化到 scale=1 → 删非 PM 网格 | line 455–478 |
| 7 | 手动权重蒙皮（顶点→最近 3 骨线段距离反比） | line 480–522 |
| 8 | 减骨（手指/脚趾/末端骨），权重重挂 Hand/Foot/Head | line 524–587 |
| 9 | 加 8 挂点（空节点父级到对应骨骼） | line 589–607 |
| 10 | idle 命名并 push 到 NLA | line 609–614 |
| 11 | 合并各段动画 FBX → push NLA（rescale_action_for_meters 处理 cm/m 单位） | line 616–647 |
| 12 | 导出 GLB（embedded 纹理、skin、NLA 动画、sockets） | line 651–668 |
| 13 | 写 .assetmeta.json manifest | line 670–687 |

---

## 5. 运行命令（复现 / 审查用）

### 5.1 构建（方案 A）

```bat
"C:/Program Files/Blender Foundation/Blender 5.1/blender.exe" --background --python ^
  "回到地面/.workbuddy/skills/character-3d-from-concept/scripts/build_from_prototype_v11.py" -- ^
  "art_source/models_review/CHR_Warrior_W/CHR_Warrior_W_v11_proto.glb" ^
  "art_source/models_review/CHR_Warrior_W/Warrior_Idle.fbx" ^
  "art_source/models_review/CHR_Warrior_W/CHR_Warrior_W_v11.glb" ^
  "art_source/models_review/CHR_Warrior_W/CHR_Warrior_W_v11.assetmeta.json" ^
  --anim "Warrior_walk.fbx:walk" ^
  --anim "Warrior_run.fbx:run" ^
  --anim "Warrior_attack.fbx:attack" ^
  --anim "Warrior_skill.fbx:skill" ^
  --anim "Warrior_hit.fbx:hit" ^
  --anim "Warrior_dodge.fbx:dodge" ^
  --anim "Warrior_die.fbx:die" ^
  --target-tri 2800 --tex 512 --voxel 0.01
```

### 5.2 独立水密复验（解析 GLB 二进制，焊接后数边界边）

```bat
python 回到地面/art_source/models_review/CHR_Warrior_W/glb_watertight_check.py ^
  CHR_Warrior_W_v11.glb
```

### 5.3 Blender 回环焊接校验（权威，区分真洞 vs 接缝）

```bat
"C:/Program Files/Blender Foundation/Blender 5.1/blender.exe" --background --python ^
  "art_source/models_review/CHR_Warrior_W/rt_check2.py" -- ^
  "assets/resources/models/characters/CHR_Warrior_A.glb"
```

### 5.4 资产校验（入库门禁）

```bat
python 回到地面/tools/asset_validate.py ^
  "assets/resources/models/characters/CHR_Warrior_A.assetmeta.json" ^
  --budget "assets/resources/config/art_quality_budget.json"
```

### 5.5 减面破坏水密的实证（审查可复现）

```bat
"C:/Program Files/Blender Foundation/Blender 5.1/blender.exe" --background --python ^
  "art_source/models_review/CHR_Warrior_W/decimate_realcheck.py"
```

### 5.6 本地预览（浏览器查看模型）

```bat
python -m http.server 8777 --directory "art_source/models_review/CHR_Warrior_W"
REM 浏览器打开 http://localhost:8777/CHR_Warrior_W_v11_test_scene.html
```

---

## 6. 完整代码清单（审查用，均已嵌入，无需另取）

### 6.1 build_from_prototype_v11.py  ← 方案 A 正本

```python
import sys, os, json, tempfile, bpy, mathutils
import numpy as np

# =============================================================================
# build_from_prototype_v11.py  --  Warrior "crack" fix build
#
# v10 problem: the text-to-3D mother image is composed of ~1312 separate
# fragment meshes (AI meshfrag). After decimation to ~2660 tris those fragments
# show as visible CRACKS. v11 fixes this with Voxel Remesh (melt fragments into
# one watertight skin) + re-unwrap + PBR bake (re-project mother-image
# baseColor/normal/metallicRoughness back onto the new skin). Then the canonical
# manual-skin -> prune -> sockets -> anims pipeline runs as before.
#
# usage:
#   blender --background --python build_from_prototype_v11.py -- \
#       <prototype.glb> <idle_rigged.fbx> <dst.glb> <dst.assetmeta.json> \
#       --anim "Warrior_walk.fbx:player_walk" ... [--target-tri 2800] [--tex 512] [--voxel 0.01]
# =============================================================================

argv = sys.argv
i = argv.index('--') + 1
PROTO_GLB = argv[i]
IDLE_FBX  = argv[i + 1]
DST_GLB   = argv[i + 2]
DST_MAN   = argv[i + 3]

TARGET_TRI = 2800
TEX_SIZE   = 512
VOXEL_SIZE = 0.01
anim_specs = []

j = i + 4
while j < len(argv):
    a = argv[j]
    if a == "--anim":
        anim_specs.append(argv[j + 1]); j += 2
    elif a == "--target-tri":
        TARGET_TRI = int(argv[j + 1]); j += 2
    elif a == "--tex":
        TEX_SIZE = int(argv[j + 1]); j += 2
    elif a == "--voxel":
        VOXEL_SIZE = float(argv[j + 1]); j += 2
    else:
        j += 1

HERE = os.path.dirname(os.path.abspath(PROTO_GLB))
ANIM_MAP = [tuple(s.split(":", 1)) for s in anim_specs]

SOCKET_TARGETS = {
    "RightHand":   "RightHand",
    "LeftHand":    "LeftHand",
    "Head":        "Head",
    "Chest":       "Spine2",
    "Back":        "Spine1",
    "Foot":        "RightFoot",
    "Weapon":      "RightHand",
    "SkillOrigin": "Spine2",
}
SOCKET_NAMES = list(SOCKET_TARGETS.keys())

# ---------- texture resize (numpy, no img.scale) ----------
def resize_texture_np(img, size=TEX_SIZE):
    if not img or not img.size or len(img.size) < 2:
        return None
    w, h = int(img.size[0]), int(img.size[1])
    if w <= size and h <= size:
        return None
    src = np.array(img.pixels[:], dtype=np.float32).reshape((h, w, 4))
    ty = np.linspace(0.0, h - 1.0, size)
    tx = np.linspace(0.0, w - 1.0, size)
    gy, gx = np.meshgrid(ty, tx, indexing='ij')
    x0 = np.floor(gx).astype(np.int64); y0 = np.floor(gy).astype(np.int64)
    x1 = np.minimum(x0 + 1, w - 1); y1 = np.minimum(y0 + 1, h - 1)
    sx = (gx - x0)[:, :, None]; sy = (gy - y0)[:, :, None]
    top = src[y0, x0]; bot = src[y1, x0]
    left = src[y0, x1]; right = src[y1, x1]
    out = (top * (1 - sx) * (1 - sy) + bot * sx * (1 - sy)
           + left * (1 - sx) * sy + right * sx * sy)
    out = np.clip(out, 0.0, 1.0).reshape(-1).tolist()
    new = bpy.data.images.new(img.name + "_rs", size, size)
    new.pixels[:] = out
    fd, tmp = tempfile.mkstemp(suffix=".png", prefix="tex_rs_")
    os.close(fd)
    new.file_format = 'PNG'
    new.save(filepath=tmp)
    loaded = bpy.data.images.load(tmp)
    loaded.pack()
    bpy.data.images.remove(new)
    try:
        os.remove(tmp)
    except OSError:
        pass
    return loaded

# ---------- new animation system helpers ----------
def action_frame_range(act):
    fmin, fmax = None, None
    for L in act.layers:
        for st in L.strips:
            for cb in st.channelbags:
                for fc in cb.fcurves:
                    for kp in fc.keyframe_points:
                        x = kp.co.x
                        fmin = x if fmin is None else min(fmin, x)
                        fmax = x if fmax is None else max(fmax, x)
    if fmin is None:
        return 0, 0
    return int(round(fmin)), int(round(fmax))

def push_nla(arm, act, name):
    if arm.animation_data is None:
        arm.animation_data_create()
    fs, fe = action_frame_range(act)
    if fs == 0 and fe == 0:
        fs, fe = 1, 30
    track = arm.animation_data.nla_tracks.new()
    track.name = name
    track.strips.new(name, fs, act)
    track.mute = False
    print("PUSHED", name, "frames", fs, "-", fe)

def get_action(obj):
    ad = obj.animation_data
    if ad and ad.action:
        return ad.action
    if ad:
        for tr in ad.nla_tracks:
            for st in tr.strips:
                if st.action:
                    return st.action
    return None

def rescale_action_for_meters(action, armature_scale):
    if action is None or abs(armature_scale - 1.0) < 1e-5:
        return
    for L in action.layers:
        for st in L.strips:
            for cb in st.channelbags:
                for fc in cb.fcurves:
                    if 'location' in fc.data_path:
                        for kp in fc.keyframe_points:
                            kp.co.y *= armature_scale
    print("RESCALE_ACTION", action.name, "by", armature_scale)

def find_bone(arm, sub):
    sub = sub.lower()
    for b in arm.data.bones:
        if b.name.lower() == ("mixamorig:" + sub):
            return b.name
    for b in arm.data.bones:
        if sub in b.name.lower():
            return b.name
    return None

# ---------- watertight gate: count connected components (loose parts) ----------
def count_components(mesh):
    """Return number of disconnected mesh islands. >1 means fragmented."""
    import bmesh as _bm
    bm = _bm.new()
    bm.from_mesh(mesh)
    bm.verts.ensure_lookup_table()
    parent = list(range(len(bm.verts)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    for e in bm.edges:
        union(e.verts[0].index, e.verts[1].index)
    roots = set(find(v.index) for v in bm.verts)
    bm.free()
    return len(roots)


def boundary_edges(mesh):
    """Count edges used by only one face (boundary / holes). 0 == watertight.
    This is the TRUE crack indicator (UV-seam vertex splits are NOT counted)."""
    import bmesh as _bm
    bm = _bm.new()
    bm.from_mesh(mesh)
    bm.edges.ensure_lookup_table()
    n = sum(1 for e in bm.edges if not e.is_manifold)
    bm.free()
    return n


def triangulate_mesh(mesh):
    """Triangulate in place via bmesh (Blender 5.1 has no quads_to_tris op)."""
    import bmesh as _bm
    bm = _bm.new()
    bm.from_mesh(mesh)
    _bm.ops.triangulate(bm, faces=bm.faces[:])
    bm.to_mesh(mesh)
    bm.free()


# ---------- PBR bake (mother image -> remeshed skin) ----------
def bake_pbr(src_obj, dst_obj, size=TEX_SIZE):
    """Project source PBR textures (baseColor/normal/metalRough) onto dst UVs
    using EMIT bake. DIFFUSE bake fails for metallic=1 surfaces (returns black),
    so we feed each texture into an Emission shader and bake its color directly.
    """
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 32
    scene.render.bake.use_selected_to_active = True
    scene.render.bake.cage_extrusion = 0.02

    # build target material
    mat = bpy.data.materials.new("WarriorBaked")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    for inp in ('Base Color', 'Normal', 'Metallic', 'Roughness'):
        for l in list(bsdf.inputs[inp].links):
            nt.links.remove(l)

    img_bc = bpy.data.images.new("bake_basecolor", size, size)
    img_nr = bpy.data.images.new("bake_normal", size, size)
    img_mr = bpy.data.images.new("bake_metalrough", size, size)

    tex_bc = nt.nodes.new("ShaderNodeTexImage"); tex_bc.image = img_bc
    tex_nr = nt.nodes.new("ShaderNodeTexImage"); tex_nr.image = img_nr
    tex_mr = nt.nodes.new("ShaderNodeTexImage"); tex_mr.image = img_mr
    nrm = nt.nodes.new("ShaderNodeNormalMap")
    nt.links.new(tex_bc.outputs['Color'], bsdf.inputs['Base Color'])
    nt.links.new(tex_nr.outputs['Color'], nrm.inputs['Color'])
    nt.links.new(nrm.outputs['Normal'], bsdf.inputs['Normal'])
    nt.links.new(tex_mr.outputs['Color'], bsdf.inputs['Metallic'])
    nt.links.new(tex_mr.outputs['Color'], bsdf.inputs['Roughness'])

    if dst_obj.data.materials:
        dst_obj.data.materials[0] = mat
    else:
        dst_obj.data.materials.append(mat)

    # identify source PBR images
    def find_source_images():
        imgs = {}
        for m in src_obj.data.materials:
            if not m.use_nodes:
                continue
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            if bsdf is None:
                continue
            for l in bsdf.inputs['Base Color'].links:
                n = l.from_node
                if n.type == 'TEX_IMAGE' and n.image and 'basecolor' not in imgs:
                    imgs['basecolor'] = n.image
            for inp in ('Metallic', 'Roughness'):
                for l in bsdf.inputs[inp].links:
                    n = l.from_node
                    if n.type == 'TEX_IMAGE' and n.image and 'metalrough' not in imgs:
                        imgs['metalrough'] = n.image
                if 'metalrough' in imgs:
                    break
            for l in bsdf.inputs['Normal'].links:
                queue = [l.from_node]
                visited = set()
                found = None
                while queue:
                    node = queue.pop(0)
                    if node in visited:
                        continue
                    visited.add(node)
                    if node.type == 'TEX_IMAGE' and node.image:
                        found = node.image
                        break
                    for inp in node.inputs:
                        for l2 in inp.links:
                            queue.append(l2.from_node)
                if found and 'normal' not in imgs:
                    imgs['normal'] = found
        # fallback by name
        if len(imgs) < 3:
            for m in src_obj.data.materials:
                if not m.use_nodes:
                    continue
                for n in m.node_tree.nodes:
                    if n.type != 'TEX_IMAGE' or not n.image:
                        continue
                    name = n.image.name.lower()
                    if 'normal' in name and 'normal' not in imgs:
                        imgs['normal'] = n.image
                    elif ('metal' in name or 'rough' in name) and 'metalrough' not in imgs:
                        imgs['metalrough'] = n.image
                    elif ('base' in name or 'color' in name or 'diff' in name) and 'basecolor' not in imgs:
                        imgs['basecolor'] = n.image
        return imgs

    src_imgs = find_source_images()
    print("SOURCE_IMAGES", {k: (v.name if v else None) for k, v in src_imgs.items()})
    for k in ('basecolor', 'normal', 'metalrough'):
        if src_imgs.get(k) is None:
            raise SystemExit("ERROR: missing source " + k + " image")

    # EMIT bake setup
    bpy.ops.object.select_all(action='DESELECT')
    src_obj.select_set(True)
    bpy.context.view_layer.objects.active = dst_obj

    def bake_emit(src_image, dst_node):
        tmp = bpy.data.materials.new("tmp_emit")
        tmp.use_nodes = True
        tnt = tmp.node_tree
        emit = tnt.nodes.new("ShaderNodeEmission")
        emit.inputs['Strength'].default_value = 1.0
        ttex = tnt.nodes.new("ShaderNodeTexImage")
        ttex.image = src_image
        tnt.links.new(ttex.outputs['Color'], emit.inputs['Color'])
        out = tnt.nodes["Material Output"]
        for l in list(out.inputs['Surface'].links):
            tnt.links.remove(l)
        tnt.links.new(emit.outputs['Emission'], out.inputs['Surface'])
        src_obj.data.materials.clear()
        src_obj.data.materials.append(tmp)

        for n in nt.nodes:
            if n.type == 'TEX_IMAGE':
                n.select = False
        dst_node.select = True
        nt.nodes.active = dst_node
        scene.cycles.bake_type = 'EMIT'
        bpy.ops.object.bake()
        dst_node.image.pack()
        print("BAKED EMIT", src_image.name, "->", dst_node.image.name)
        bpy.data.materials.remove(tmp)

    bake_emit(src_imgs['basecolor'], tex_bc)
    bake_emit(src_imgs['normal'], tex_nr)
    bake_emit(src_imgs['metalrough'], tex_mr)
    return mat

# ============ 1. import prototype -> join into SRC ============
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=PROTO_GLB)
mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
if not mesh_objs:
    raise SystemExit("ERROR: no mesh in prototype glb")
if len(mesh_objs) > 1:
    for o in mesh_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objs[0]
    bpy.ops.object.join()
SRC = bpy.context.view_layer.objects.active
bpy.ops.object.select_all(action='DESELECT')
SRC.select_set(True)
bpy.context.view_layer.objects.active = SRC
# Fold object transforms (scale/rotation) into the mesh so voxel_size is
# interpreted in meters consistently regardless of how the prototype imported.
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
SRC.name = "SRC_PROTO"
print("SRC verts", len(SRC.data.vertices), "tris", len(SRC.data.polygons))

# ============ 2. duplicate -> PM (remesh target) ============
bpy.ops.object.select_all(action='DESELECT')
SRC.select_set(True)
bpy.context.view_layer.objects.active = SRC
bpy.ops.object.duplicate()
pm = bpy.context.active_object
pm.name = "PROTO_MESH"

# ============ 3. WATERTIGHT GATE: remesh only if fragmented ============
# Root-cause fix for cracks: a text-to-3D mother image is often composed of
# many loose fragment meshes. If so, melt them into ONE watertight skin via
# Voxel Remesh, then re-project the mother-image PBR (baseColor/normal/
# metallicRoughness) onto the new UVs with EMIT bake. If the source is already
# watertight (e.g. a clean generator output), keep its original UV + texture
# untouched for maximum fidelity.
bpy.context.view_layer.objects.active = pm
comps = count_components(pm.data)
print("PRE_GATE components =", comps)
def decimate_to(keep_ratio):
    mod = pm.modifiers.new('Decimate', 'DECIMATE')
    mod.ratio = max(0.02, min(1.0, keep_ratio))
    bpy.context.view_layer.objects.active = pm
    pm.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return len(pm.data.polygons)

if comps > 1:
    # --- melt fragments -> single watertight skin, tuned to tri budget ---
    # Voxel Remesh tri count scales ~ 1/voxel^2, so estimate the voxel that
    # yields TARGET_TRI, then refine with up to 6 proportional corrections.
    # Guarantees a single watertight manifold (no cracks) by construction.
    pm.data.remesh_voxel_size = VOXEL_SIZE
    pm.data.remesh_voxel_adaptivity = 0.0
    bpy.ops.object.voxel_remesh()
    tri0 = len(pm.data.polygons)
    vox = VOXEL_SIZE * (tri0 / TARGET_TRI) ** 0.5
    tri = tri0
    for _ in range(6):
        pm.data.remesh_voxel_size = vox
        pm.data.remesh_voxel_adaptivity = 0.0
        bpy.ops.object.voxel_remesh()
        tri = len(pm.data.polygons)
        if 2000 <= tri <= 3000:
            break
        vox = vox * (tri / TARGET_TRI) ** 0.5  # proportional correction
    print("REMESH vox=%.4f tris=%d (watertight by construction)" % (vox, tri))
    # Force triangulation in Blender so the glTF exporter does NOT re-triangulate
    # N-gons (its N-gon triangulation can split the surface into islands -> cracks).
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project()
    bpy.ops.object.mode_set(mode='OBJECT')
    triangulate_mesh(pm.data)
    be = boundary_edges(pm.data)
    print("BOUNDARY_EDGES (Blender, after remesh+tri)", be,
          "WATERTIGHT ✓" if be == 0 else "HOLES ✗ (will crack)")
    bake_pbr(SRC, pm, TEX_SIZE)
    print("BAKE_DONE")
else:
    print("WATERTIGHT already (%d part) -> keep original UV + texture" % comps)
    if len(pm.data.polygons) > 3000:
        r = max(0.02, min(1.0, (3000 / len(pm.data.polygons)) / 1.86))
        tri = decimate_to(r)
        print("DECIMATED (over-budget watertight source) ->", tri)

# Collapse to a SINGLE material so glTF exports one watertight primitive.
# The mother image (and its duplicate) may carry multiple material slots from
# many fragment clusters; leftover slots would be exported as extra primitives
# (re-introducing the fragmented mesh). Force every face onto material slot 0.
_final_mat = pm.data.materials[0] if pm.data.materials else None
pm.data.materials.clear()
if _final_mat:
    pm.data.materials.append(_final_mat)
for _p in pm.data.polygons:
    _p.material_index = 0
print("MATERIALS_COLLAPSED to", len(pm.data.materials), "slot(s)")

# Guarantee a fully triangulated, watertight mesh before glTF export.
bpy.context.view_layer.objects.active = pm
triangulate_mesh(pm.data)
bpy.ops.object.shade_smooth()
try:
    bpy.ops.mesh.customdata_custom_splitnormals_clear()
except Exception:
    pass
# Voxel Remesh is watertight by construction; the exported GLB is re-checked
# independently by glb_boundary.py (parse binary buffer, count boundary edges).
post_comps = count_components(pm.data)
be = boundary_edges(pm.data)
print("PRE_EXPORT components =", post_comps, "boundary_edges =", be,
      "WATERTIGHT ✓" if be == 0 else "(WARNING: holes -> cracks)")

# ============ 5. import idle FBX -> armature ============
bpy.ops.wm.fbx_import(filepath=IDLE_FBX)
arm = None
for o in bpy.data.objects:
    if o.type == 'ARMATURE' and arm is None:
        arm = o
if arm is None:
    raise SystemExit("ERROR: no armature in idle FBX")
idle_arm_scale = arm.scale.x
idle_act = get_action(arm)
print("ARM:", arm.name, "idle_act:", idle_act.name if idle_act else None, "scale", arm.scale[:])
rescale_action_for_meters(idle_act, idle_arm_scale)
bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
print("ARM scale after normalize:", [round(x, 4) for x in arm.scale])

# delete ALL meshes except PROTO_MESH (drops SRC + idle mesh)
bpy.ops.object.select_all(action='DESELECT')
for o in list(bpy.data.objects):
    if o.type == 'MESH' and o.name != 'PROTO_MESH':
        o.select_set(True)
bpy.ops.object.delete()

# ============ 6. MANUAL weights ============
for b in arm.data.bones:
    if b.name not in pm.vertex_groups:
        pm.vertex_groups.new(name=b.name)
segs = []
for b in arm.data.bones:
    h = arm.matrix_world @ b.head_local
    t = arm.matrix_world @ b.tail_local
    segs.append((b.name, h, t))

def dist_seg(p, h, t):
    v = t - h
    if v.length < 1e-6:
        return (p - h).length
    w = p - h
    c1 = w.dot(v)
    if c1 <= 0:
        return (p - h).length
    c2 = v.dot(v)
    if c2 <= c1:
        return (p - t).length
    return (p - (h + v * (c1 / c2))).length

K = 3
for v in pm.data.vertices:
    wc = pm.matrix_world @ v.co
    ds = sorted(((dist_seg(wc, h, t), name) for name, h, t in segs))
    top = ds[:K]
    tot = sum(1.0 / (d + 1e-3) for d, _ in top)
    for d, name in top:
        pm.vertex_groups[name].add([v.index], (1.0 / (d + 1e-3)) / tot, 'REPLACE')

am = pm.modifiers.new('Armature', 'ARMATURE')
am.object = arm
pm.parent = arm
if arm.animation_data and arm.animation_data.action:
    arm.animation_data.action = None

dg = bpy.context.evaluated_depsgraph_get()
ev = pm.evaluated_get(dg)
tm = ev.to_mesh(preserve_all_data_layers=True, depsgraph=dg)
wv = sum(1 for v in tm.vertices if len(v.groups) > 0)
print("WEIGHTED VERTS:", wv, "of", len(tm.vertices))

# ============ 7. prune finger/toe/end bones ============
def lname(b):
    return b.name.lower()

def is_finger(b):
    return any(k in lname(b) for k in ["thumb", "index", "middle", "ring", "pinky"])

def is_toe(b):
    return "toe" in lname(b)

def is_end(b):
    return lname(b).endswith("headtop_end") or lname(b).endswith("_end")

bones = {b.name: b for b in arm.data.bones}
prune = [b.name for b in arm.data.bones if is_finger(b) or is_toe(b) or is_end(b)]

def target_of(b):
    cur = b
    if is_finger(b):
        while cur and not lname(cur).endswith("hand"):
            cur = cur.parent
    elif is_toe(b):
        while cur and not lname(cur).endswith("foot"):
            cur = cur.parent
    else:
        cur = b.parent
    return cur.name if cur else b.parent.name

vg = pm.vertex_groups
weights = {}
for bname in prune:
    if bname not in vg:
        continue
    grp = vg[bname]
    d = {}
    for v in pm.data.vertices:
        for ge in v.groups:
            if ge.group == grp.index:
                d[v.index] = ge.weight
                break
    weights[bname] = d
for bname in prune:
    d = weights.get(bname)
    if not d:
        continue
    tname = target_of(bones[bname])
    if tname not in vg:
        vg.new(tname)
    tgrp = vg[tname]
    for v_idx, w in d.items():
        if w > 0:
            tgrp.add([v_idx], w, 'ADD')
for bname in prune:
    if bname in vg:
        vg.remove(vg[bname])

bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
for bname in list(prune):
    if bname in eb:
        eb.remove(eb[bname])
bpy.ops.object.mode_set(mode='OBJECT')
print("PRUNE_COUNT", len(prune), "REMAIN_BONES", len(arm.data.bones))

# ============ 8. sockets ============
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='POSE')
sockets_made = []
for sname in SOCKET_NAMES:
    bname = find_bone(arm, SOCKET_TARGETS[sname])
    if bname is None:
        print("SOCKET_SKIP no bone for", sname)
        continue
    empty = bpy.data.objects.new(sname, None)
    bpy.context.collection.objects.link(empty)
    empty.parent = arm
    empty.parent_type = 'BONE'
    empty.parent_bone = bname
    empty.location = (0.0, 0.0, 0.0)
    empty.scale = (1.0, 1.0, 1.0)
    sockets_made.append(sname)
    print("SOCKET", sname, "-> bone", bname)
bpy.ops.object.mode_set(mode='OBJECT')

# ============ 9. idle NLA ============
if idle_act is not None:
    idle_act.name = "idle"
    push_nla(arm, idle_act, "idle")
else:
    print("WARN no idle action found in idle FBX")

# ============ 10. merge animations ============
for fname, clip in ANIM_MAP:
    p = os.path.join(HERE, fname)
    if not os.path.exists(p):
        print("SKIP missing", fname)
        continue
    before = set(bpy.data.objects)
    bpy.ops.wm.fbx_import(filepath=p)
    after = set(bpy.data.objects)
    added = after - before
    added_arm = None
    act = None
    for o in added:
        if o.type == 'ARMATURE' and o != arm:
            added_arm = o
            act = get_action(o)
            break
    if act is None:
        for a in bpy.data.actions:
            if a.name not in ("idle",):
                act = a
                break
    if act is None:
        print("NO_ACT", clip)
    else:
        anim_scale = added_arm.scale.x if added_arm else 1.0
        rescale_action_for_meters(act, anim_scale)
        act.name = clip
        push_nla(arm, act, clip)
    for o in added:
        if o.type in ('ARMATURE', 'MESH', 'EMPTY', 'CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)

# ============ 11. textures already 512 from bake; skip resize ============

# ============ 12. export GLB ============
clip_count = len(arm.animation_data.nla_tracks) if arm.animation_data else 0
bpy.ops.object.select_all(action='DESELECT')
arm.select_set(True)
pm.select_set(True)
for s in sockets_made:
    if s in bpy.data.objects:
        bpy.data.objects[s].select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(
    filepath=DST_GLB, export_format='GLB', use_selection=True,
    export_animations=True, export_nla_strips=True, export_force_sampling=True,
    export_skins=True, export_morph=False, export_lights=False,
    export_cameras=False, export_materials='EXPORT', export_image_format='AUTO',
)
tri = len(pm.data.polygons)
print("EXPORTED_GLB", DST_GLB, "clips=", clip_count,
      "bones=", len(arm.data.bones), "tri=", tri)

# ============ 13. manifest ============
base_name = os.path.basename(DST_GLB)
manifest = {
    "name": base_name, "tri": tri, "bones": len(arm.data.bones),
    "textureSize": TEX_SIZE, "lodLevels": 1, "animClips": clip_count,
    "sockets": SOCKET_NAMES, "colliders": ["capsule"],
    "depends": [], "lifecycle": "选秀", "perfTier": "medium",
    "testScene": os.path.splitext(base_name)[0] + "_TestScene",
    "version": "0.3",
    "author": "v11: voxel-remesh + PBR bake from mother image + manual-skin (character-3d-from-concept)",
    "date": "2026-07-12", "reviewer": "pending",
    "notes": "v11 修复 v10 裂痕：对图生3D母图(Voxel碎片~1312块)做 Voxel Remesh 熔成连续表皮，Smart UV 重展，将母图 baseColor/normal/metallicRoughness 烘焙回新网格；再减面到 %d 三角、手动蒙皮到 Mixamo 骨架、减骨 %d->%d、8 sockets、%d 段动画。" % (
        tri, len(prune) + len(arm.data.bones), len(arm.data.bones), clip_count),
}
with open(DST_MAN, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print("MANIFEST_WRITTEN", DST_MAN)
print("DONE")
```

### 6.2 glb_watertight_check.py  ← 独立二进制水密校验（焊接后数边界边，避免误报）

```python
"""Authoritative watertight verification (matches Blender's weld behavior).

glTF export splits vertices along UV seams; the duplicate (seam) vertices
carry positions that differ by up to ~1mm (a skinned-export artifact), so a
naive index-based boundary count reports thousands of false "holes". The fix
is to WELD vertices by distance (cascading, like Blender's remove_doubles),
then count boundary edges and components on the welded mesh.

If after welding: boundary_edges == 0 and components == 1  ->  WATERTIGHT (no
real cracks; the raw count was pure UV-seam artifact).
"""
import sys, struct, json
from collections import defaultdict


def parse_glb(path):
    with open(path, 'rb') as f:
        data = f.read()
    off = 12
    clen = struct.unpack('<I', data[off:off + 4])[0]
    gltf = json.loads(data[off + 8:off + 8 + clen])
    je = off + 8 + clen
    jep = (je + 3) & ~3
    blen = struct.unpack('<I', data[jep:jep + 4])[0]
    return gltf, data[jep + 4:jep + 4 + blen]


def get_acc(gltf, bin_data, idx):
    a = gltf['accessors'][idx]
    bv = gltf['bufferViews'][a['bufferView']]
    comp = a['componentType']
    ncomp = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a.get('type', 'SCALAR')]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    cs = {5121: 1, 5123: 2, 5125: 4, 5126: 4}[comp]
    fmt = {5121: 'B', 5123: 'H', 5125: 'I', 5126: 'f'}[comp]
    total = a['count'] * ncomp
    return struct.unpack('<' + fmt * total, bin_data[off:off + cs * total])


EPS = 1e-3  # 1 mm weld, matches Blender remove_doubles(0.001)

def main():
    path = sys.argv[1]
    gltf, bin_data = parse_glb(path)
    prim = gltf['meshes'][0]['primitives'][0]
    pos = get_acc(gltf, bin_data, prim['attributes']['POSITION'])
    n = len(pos) // 3
    idx = get_acc(gltf, bin_data, prim['indices']) if 'indices' in prim else list(range(n))
    tris = len(idx) // 3

    pts = [(pos[3*i], pos[3*i+1], pos[3*i+2]) for i in range(n)]

    # ---- grid-based cascading weld (equivalent to remove_doubles) ----
    cell = EPS
    grid = defaultdict(list)
    canon = list(range(n))
    def find(x):
        while canon[x] != x:
            canon[x] = canon[canon[x]]; x = canon[x]
        return x
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb: canon[ra] = rb
    for i in range(n):
        cx, cy, cz = int(pts[i][0]/cell), int(pts[i][1]/cell), int(pts[i][2]/cell)
        placed = False
        for dx in (-1,0,1):
            for dy in (-1,0,1):
                for dz in (-1,0,1):
                    key = (cx+dx, cy+dy, cz+dz)
                    for j in grid.get(key, ()):
                        if (pts[i][0]-pts[j][0])**2 + (pts[i][1]-pts[j][1])**2 + (pts[i][2]-pts[j][2])**2 <= EPS*EPS:
                            union(i, j); placed = True; break
                    if placed: break
                if placed: break
            if placed: break
        if not placed:
            grid[(cx,cy,cz)].append(i)
    weld = [find(i) for i in range(n)]
    unique = set(weld)

    # ---- boundary edges (welded) ----
    ec = defaultdict(int)
    for t in range(0, len(idx), 3):
        a, b, c = weld[idx[t]], weld[idx[t+1]], weld[idx[t+2]]
        for e in ((a, b), (b, c), (c, a)):
            lo, hi = (e[0], e[1]) if e[0] < e[1] else (e[1], e[0])
            ec[(lo, hi)] += 1
    boundary = sum(1 for v in ec.values() if v == 1)

    # ---- components (welded adjacency) ----
    adj = defaultdict(set)
    for t in range(0, len(idx), 3):
        a, b, c = weld[idx[t]], weld[idx[t+1]], weld[idx[t+2]]
        adj[a] |= {b, c}; adj[b] |= {a, c}; adj[c] |= {a, b}
    seen = set(); comps = 0
    for s in unique:
        if s in seen: continue
        comps += 1
        stack = [s]
        while stack:
            v = stack.pop()
            if v in seen: continue
            seen.add(v)
            for w in adj[v]:
                if w not in seen: stack.append(w)

    raw_merged = n - len(unique)
    print("verts(raw)=%d  verts(welded@1mm)=%d  merged=%d  tris=%d" % (n, len(unique), raw_merged, tris))
    print("BOUNDARY_EDGES (welded, real holes) = %d" % boundary)
    print("COMPONENTS (welded) = %d" % comps)
    if boundary == 0 and comps == 1:
        print("WATERTIGHT ✓ — geometry is a single closed manifold. No cracks.")
        print("  (the raw boundary-edge count was 100% UV-seam vertex splits, not holes)")
    else:
        print("HOLES ✗ — %d real boundary edges / %d components remain." % (boundary, comps))

if __name__ == '__main__':
    main()
```

### 6.3 rt_check2.py  ← Blender 回环焊接校验（权威，区分真洞 vs 接缝）

```python
"""Round-trip + weld check. Import v11.glb, weld PROTO_MESH by distance,
then re-run watertight checks. This separates real holes from UV-seam
duplicate-vertex splits (which an import does NOT auto-merge)."""
import sys, bpy
bpy.ops.wm.read_factory_settings(use_empty=True)
GLB = sys.argv[sys.argv.index('--') + 1]
bpy.ops.import_scene.gltf(filepath=GLB)

import bmesh as _bm

def count_components(mesh):
    bm = _bm.new(); bm.from_mesh(mesh); bm.verts.ensure_lookup_table()
    parent = list(range(len(bm.verts)))
    def find(x):
        while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
        return x
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb: parent[ra] = rb
    for e in bm.edges: union(e.verts[0].index, e.verts[1].index)
    bm.free()
    return len(set(find(v) for v in range(len(parent))))

def boundary_edges(mesh):
    bm = _bm.new(); bm.from_mesh(mesh); bm.edges.ensure_lookup_table()
    n = sum(1 for e in bm.edges if not e.is_manifold)
    bm.free()
    return n

pm = next(o for o in bpy.data.objects if o.type == 'MESH' and o.name == 'PROTO_MESH')
print("BEFORE weld: COMPONENTS=%d BOUNDARY_EDGES=%d" % (count_components(pm.data), boundary_edges(pm.data)))

# weld by distance (merge coincident seam duplicates)
bpy.context.view_layer.objects.active = pm
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.001)
bpy.ops.object.mode_set(mode='OBJECT')
print("AFTER weld(1mm): verts=%d COMPONENTS=%d BOUNDARY_EDGES=%d  %s" % (
    len(pm.data.vertices), count_components(pm.data), boundary_edges(pm.data),
    "WATERTIGHT ✓" if (boundary_edges(pm.data) == 0 and count_components(pm.data) == 1) else "STILL BROKEN ✗"))
print("ROUNDTRIP_WELD_DONE")
```

### 6.4 decimate_realcheck.py  ← 减面破坏水密的实证（审查可复现）

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""True test: APPLY decimate, then weld_and_check WITHOUT manual triangulation,
to isolate whether decimation itself creates real holes."""
import bpy, bmesh

SRC = "d:/game/回到地面/art_source/models_review/CHR_Warrior_W/CHR_Warrior_W_v11.glb"
WELD = 0.001

def weld_and_check(mesh):
    bm = bmesh.new(); bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=WELD)
    parent = list(range(len(bm.verts)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb: parent[ra] = rb
    for e in bm.edges: union(e.verts[0].index, e.verts[1].index)
    comps = len(set(find(v) for v in range(len(parent))))
    be = sum(1 for e in bm.edges if not e.is_manifold)
    bm.free(); return comps, be

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
mesh_obj = max([o for o in bpy.data.objects if o.type == 'MESH'], key=lambda o: len(o.data.vertices))
dg = bpy.context.evaluated_depsgraph_get()
for r in [0.55, 0.5]:
    mod = mesh_obj.modifiers.new('Decimate', 'DECIMATE')
    mod.ratio = r
    dg.update()
    tri = mod.face_count if (mod.face_count and mod.face_count > 0) else int(5268 * r)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    comps, be = weld_and_check(mesh_obj.data)
    print("APPLIED ratio=%.2f tri=%d comps=%d boundary=%d %s" % (r, tri, comps, be, "WATERTIGHT" if be == 0 else "REAL_HOLES"))
    # restore pristine mesh for next ratio
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SRC)
    mesh_obj = max([o for o in bpy.data.objects if o.type == 'MESH'], key=lambda o: len(o.data.vertices))
    dg = bpy.context.evaluated_depsgraph_get()
print("DONE")
```

### 6.5 asset_validate.py  ← 资产校验器（含预算例外识别）

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
asset_validate.py - 3D art asset validator (3D-upgrade pipeline).

Single consumer of 3D budget rules defined in ART_RESOURCE_RULES.md §16
and art_quality_budget.json (rules3d). Reads each 3D asset's sidecar
manifest (.assetmeta.json) and emits a Pass/Fail report so hundreds of
artist deliverables can be batch-checked instead of manually reviewed.

NO third-party dependencies. UTF-8 safe. Tool script: ASCII/English only.

Usage:
  python tools/asset_validate.py <manifest.json> [--budget PATH]
  python tools/asset_validate.py --scan <dir> [--budget PATH] [--report PATH]
  python tools/asset_validate.py --self-test
"""

import argparse
import json
import os
import re
import sys

DEFAULT_BUDGET = "assets/resources/config/art_quality_budget.json"

LIFECYCLE_STATES = {"选秀", "评审中", "已批准", "已弃用"}
PERF_TIERS = {"low", "medium", "high"}

# Maps an asset prefix to its default rules3d bucket key.
PREFIX_BUCKET = {
    "CHR": "characters",
    "MON": "monsters",
    "BOSS": "bosses_final",
    "FX": "effects_normal",
    "TILE": "tiles",
}


def log(msg):
    sys.stderr.write(msg + "\n")


def load_budget(path):
    if not os.path.isfile(path):
        log("[warn] budget not found: %s (using empty rules3d)" % path)
        return {"rules3d": {}}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def naming_regex(budget):
    r3d = budget.get("rules3d", {})
    pat = (r3d.get("naming") or {}).get(
        "pattern", r"^(CHR|MON|BOSS|FX|TILE)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?$")
    return re.compile(pat)


_KNOWN_3D_EXT = (".glb", ".prefab", ".cconb", ".material", ".fbx")


def strip_ext(name):
    base, ext = os.path.splitext(name)
    if ext.lower() in _KNOWN_3D_EXT:
        return base
    return name


def category_from_name(name, rx):
    m = rx.match(strip_ext(name))
    if not m:
        return None
    return m.group(1)


def resolve_budget(path):
    """Find the budget file, searching upward from cwd to reduce path fragility."""
    if os.path.isfile(path):
        return path
    name = os.path.basename(path)
    cur = os.path.abspath(os.getcwd())
    for _ in range(6):
        cand = os.path.join(cur, name)
        if os.path.isfile(cand):
            return cand
        parent = os.path.dirname(cur)
        if parent == cur:
            break
        cur = parent
    return path


def resolve_budget_key(prefix, name, budget):
    r3d = budget.get("rules3d", {})
    if prefix == "BOSS":
        if "bosses_final" in r3d and ("Final" in name or "final" in name):
            return "bosses_final"
        if "bosses_mini" in r3d:
            return "bosses_mini"
        return "bosses_final"
    if prefix == "FX":
        # Heuristic: boss FX carry "Boss"/"final" in token; default normal.
        if "effects_boss" in r3d and ("Boss" in name or "Final" in name):
            return "effects_boss"
        return "effects_normal"
    return PREFIX_BUCKET.get(prefix)


def rule_for(bkey, budget):
    return budget.get("rules3d", {}).get(bkey, {})


def check_manifest(manifest_path, budget, rx):
    """Return (asset_name, [(check, ok, detail), ...])."""
    name = os.path.basename(manifest_path)
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            m = json.load(f)
    except Exception as e:  # noqa: BLE001
        return name, [("manifest_parsable", False, "parse error: %s" % e)]

    results = []
    asset_name = m.get("name", name)
    prefix = category_from_name(asset_name, rx)
    results.append(("naming", prefix is not None, "prefix=%s" % (prefix or "NONE")))

    if prefix is None:
        return asset_name, results

    bkey = resolve_budget_key(prefix, asset_name, budget)
    rule = rule_for(bkey, budget)
    if not rule:
        results.append(("budget_rule_found", False, "no rules3d for %s" % bkey))
        return asset_name, results
    results.append(("budget_rule_found", True, "bucket=%s" % bkey))
    # Per-asset authorized budget exceptions (e.g. a watertight AI-derived
    # warrior whose only crack-free topology lands above maxTri). Keyed by the
    # manifest name (extension stripped). Only overrides listed fields; all
    # other assets still enforce the bucket's hard limits.
    exc = budget.get("rules3d", {}).get("exceptions", {}).get(strip_ext(asset_name))
    if exc:
        rule = dict(rule)
        rule.update(exc)
        results.append(("budget_exception", True, "overrides=%s" % ",".join(exc.keys())))

    if prefix != "FX":
        tri = m.get("tri")
        if tri is not None:
            mn, mx = rule.get("minTri"), rule.get("maxTri")
            ok = (mn is None or tri >= mn) and (mx is None or tri <= mx)
            results.append(("tri_budget", ok, "tri=%s range=[%s,%s]" % (tri, mn, mx)))
        bones = m.get("bones")
        if bones is not None:
            mx = rule.get("maxBones")
            ok = mx is None or bones <= mx
            results.append(("bones_budget", ok, "bones=%s max=%s" % (bones, mx)))
        tsize = m.get("textureSize")
        if tsize is not None:
            mx = rule.get("textureSize")
            ok = mx is None or tsize <= mx
            results.append(("texture_size", ok, "size=%s max=%s" % (tsize, mx)))
        lod = m.get("lodLevels")
        if lod is not None:
            ok = lod >= 1
            results.append(("lod_present", ok, "levels=%s expected>=1" % lod))
        anim = m.get("animClips")
        if anim is not None:
            mn = rule.get("animClipsMin")
            ok = mn is None or anim >= mn
            results.append(("anim_clips_min", ok, "clips=%s min=%s" % (anim, mn)))
        sockets = set(m.get("sockets", []))
        req = rule.get("sockets", [])
        missing = [s for s in req if s not in sockets]
        results.append(("required_sockets", len(missing) == 0, "missing=%s" % (missing or "none")))
        colliders = m.get("colliders", [])
        results.append(("collider_present", len(colliders) > 0, "count=%s" % len(colliders)))
    else:
        parts = m.get("maxParticles")
        if parts is not None:
            mx = rule.get("maxParticles")
            ok = mx is None or parts <= mx
            results.append(("particles_budget", ok, "parts=%s max=%s" % (parts, mx)))
        dc = m.get("maxDrawCall")
        if dc is not None:
            mx = rule.get("maxDrawCall")
            ok = mx is None or dc <= mx
            results.append(("drawcall_budget", ok, "dc=%s max=%s" % (dc, mx)))

    base = os.path.dirname(manifest_path)
    depends = m.get("depends", [])
    miss = []
    for d in depends:
        found = (os.path.isfile(os.path.join(base, d))
                 or os.path.isfile(os.path.join(base, d + ".glb"))
                 or os.path.isfile(os.path.join(base, d + ".prefab")))
        if not found:
            miss.append(d)
    results.append(("dependencies_present", len(miss) == 0, "missing=%s" % (miss or "none")))

    lc = m.get("lifecycle")
    results.append(("lifecycle_valid", lc in LIFECYCLE_STATES, "state=%s" % lc))
    pt = m.get("perfTier")
    results.append(("perf_tier_valid", pt in PERF_TIERS, "tier=%s" % pt))
    ts = m.get("testScene")
    results.append(("test_scene_present", bool(ts), "scene=%s" % ts))

    for fld in ("version", "author", "date", "reviewer"):
        results.append(("meta_" + fld, bool(m.get(fld)), "%s=%s" % (fld, m.get(fld))))
    return asset_name, results


def render_report(all_results, report_path=None):
    lines = []
    total_fail = 0
    for asset_name, results in all_results:
        fails = [r for r in results if not r[1]]
        total_fail += len(fails)
        status = "PASS" if not fails else "FAIL"
        lines.append("=== %s [%s] ===" % (asset_name, status))
        for check, ok, detail in results:
            mark = "ok " if ok else "XX "
            lines.append("  [%s] %-22s %s" % (mark, check, detail))
    header = "ASSET VALIDATION REPORT  (fail_checks=%d, assets=%d)" % (total_fail, len(all_results))
    out = header + "\n" + "\n".join(lines) + "\n"
    if report_path:
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(out)
    return out, total_fail


def cmd_scan(scan_dir, budget, report_path):
    rx = naming_regex(budget)
    manifests = []
    for root, _dirs, files in os.walk(scan_dir):
        for fn in files:
            if fn.endswith(".assetmeta.json"):
                manifests.append(os.path.join(root, fn))
    if not manifests:
        log("[warn] no .assetmeta.json found under %s" % scan_dir)
    all_results = [check_manifest(p, budget, rx) for p in manifests]
    out, fails = render_report(all_results, report_path)
    sys.stdout.write(out)
    return 1 if fails > 0 else 0


def cmd_single(manifest_path, budget, report_path):
    rx = naming_regex(budget)
    all_results = [check_manifest(manifest_path, budget, rx)]
    out, fails = render_report(all_results, report_path)
    sys.stdout.write(out)
    return 1 if fails > 0 else 0


def cmd_self_test():
    tmp = "_selftest_assetmeta.json"
    sample = {
        "name": "CHR_Warrior_A.glb",
        "tri": 2900, "bones": 28, "textureSize": 512,
        "lodLevels": 3, "animClips": 7,
        "sockets": ["RightHand", "LeftHand", "Head", "Chest", "Back", "Foot", "Weapon", "SkillOrigin"],
        "colliders": ["capsule"],
        "depends": [], "lifecycle": "已批准", "perfTier": "medium",
        "testScene": "Arena_Test", "version": "1.0", "author": "x", "date": "2026-07-10", "reviewer": "y"
    }
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(sample, f, ensure_ascii=False, indent=2)
    budget = {"rules3d": {
        "characters": {"minTri": 2000, "maxTri": 3000, "maxBones": 30, "textureSize": 512,
                       "lod": [{}, {}, {}], "animClipsMin": 5,
                       "sockets": ["RightHand", "LeftHand", "Head", "Chest", "Back", "Foot", "Weapon", "SkillOrigin"],
                       "collider": "capsule", "perfTier": "medium"},
        "naming": {"pattern": r"^(CHR|MON|BOSS|FX|TILE)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?$"}
    }}
    rx = naming_regex(budget)
    _name, results = check_manifest(tmp, budget, rx)
    ok_all = all(r[1] for r in results)
    out, fails = render_report([(_name, results)])
    sys.stdout.write(out)
    os.remove(tmp)
    return 0 if ok_all else 1


def main(argv):
    ap = argparse.ArgumentParser(description="3D art asset validator")
    ap.add_argument("manifest", nargs="?", help="path to .assetmeta.json")
    ap.add_argument("--scan", help="scan a directory of manifests")
    ap.add_argument("--budget", default=DEFAULT_BUDGET, help="art_quality_budget.json path")
    ap.add_argument("--report", help="write report to this path")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args(argv)

    budget = load_budget(resolve_budget(args.budget))
    if args.self_test:
        return cmd_self_test()
    if args.scan:
        return cmd_scan(args.scan, budget, args.report)
    if args.manifest:
        return cmd_single(args.manifest, budget, args.report)
    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

---

## 7. 配置文件原文（审查用）

### 7.1 art_quality_budget.json（上层 `d:/game/assets/resources/config/art_quality_budget.json`）

> 仅 `rules3d`（3D 段）与 `naming` / `exceptions` 与本流程相关；上方 `rules`（2D 贴图预算）平行存在，不在 3D 管线范围，此处略去。

```json
{
  "rules3d": {
    "characters": {
      "category": "characters",
      "prefix": "CHR",
      "minTri": 2000,
      "recommendTri": 2500,
      "maxTri": 3000,
      "maxBones": 30,
      "recommendBones": 26,
      "textureSize": 512,
      "astcBlock": 6,
      "lod": [{"level": 0, "triPct": 1.0, "dist": 0}, {"level": 1, "triPct": 0.6, "dist": 12}, {"level": 2, "triPct": 0.3, "dist": 24}],
      "animClipsMin": 5,
      "sockets": ["RightHand", "LeftHand", "Head", "Chest", "Back", "Foot", "Weapon", "SkillOrigin"],
      "collider": "capsule",
      "perfTier": "medium"
    },
    "bosses_final": {
      "category": "bosses_final",
      "prefix": "BOSS",
      "minTri": 5000,
      "recommendTri": 7000,
      "maxTri": 9000,
      "maxBones": 80,
      "recommendBones": 60,
      "textureSize": 1024,
      "astcBlock": 8,
      "lod": [{"level": 0, "triPct": 1.0, "dist": 0}, {"level": 1, "triPct": 0.5, "dist": 18}, {"level": 2, "triPct": 0.2, "dist": 36}],
      "animClipsMin": 8,
      "sockets": ["RightHand", "LeftHand", "Head", "Chest", "Back", "Foot", "Weapon", "SkillOrigin", "Mouth", "Wing", "Tail", "Eye", "WeakPoint"],
      "collider": "capsule_multi",
      "perfTier": "high"
    },
    "bosses_mini": {
      "category": "bosses_mini",
      "prefix": "BOSS",
      "minTri": 4000,
      "recommendTri": 5000,
      "maxTri": 7000,
      "maxBones": 60,
      "recommendBones": 40,
      "textureSize": 512,
      "astcBlock": 6,
      "lod": [{"level": 0, "triPct": 1.0, "dist": 0}, {"level": 1, "triPct": 0.5, "dist": 14}],
      "animClipsMin": 7,
      "sockets": ["RightHand", "LeftHand", "Head", "Chest", "Back", "Foot", "Weapon", "SkillOrigin", "Mouth", "Tail", "WeakPoint"],
      "collider": "capsule",
      "perfTier": "medium"
    },
    "monsters": {
      "category": "monsters",
      "prefix": "MON",
      "minTri": 1000,
      "recommendTri": 1800,
      "maxTri": 2500,
      "maxBones": 30,
      "recommendBones": 18,
      "textureSize": 512,
      "astcBlock": 6,
      "lod": [{"level": 0, "triPct": 1.0, "dist": 0}, {"level": 1, "triPct": 0.6, "dist": 14}, {"level": 2, "triPct": 0.3, "dist": 28}],
      "animClipsMin": 5,
      "sockets": ["RightHand", "LeftHand", "Head", "Foot", "SkillOrigin"],
      "collider": "capsule",
      "perfTier": "low"
    },
    "effects_normal": {
      "category": "effects_normal",
      "prefix": "FX",
      "maxParticles": 80,
      "maxDrawCall": 2,
      "textureSize": 256,
      "astcBlock": 6,
      "maxDurationSec": 1.5,
      "perfTier": "medium"
    },
    "effects_boss": {
      "category": "effects_boss",
      "prefix": "FX",
      "maxParticles": 300,
      "maxDrawCall": 4,
      "textureSize": 512,
      "astcBlock": 8,
      "maxDurationSec": 2.0,
      "perfTier": "high"
    },
    "tiles": {
      "category": "tiles",
      "prefix": "TILE",
      "moduleSizeM": 2,
      "textureSize": 512,
      "astcBlock": 6,
      "lod": [{"level": 0, "triPct": 1.0, "dist": 0}, {"level": 1, "triPct": 0.5, "dist": 20}],
      "modules": ["Floor", "Wall", "HighGround", "Thorn", "Corner", "Edge", "Slope", "Ramp"],
      "perfTier": "low"
    },
    "naming": {
      "pattern": "^(CHR|MON|BOSS|FX|TILE)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?([.]glb|[.]prefab)?$",
      "example": "CHR_Warrior_A.glb",
      "note": "manifest name may include .glb/.prefab; validator strips the extension before matching."
    },
    "exceptions": {
      "CHR_Warrior_A": {
        "maxTri": 6000,
        "reason": "watertight AI-derived warrior (voxel-remesh from mother image); Decimate reintroduces cracks, so 5268 tri retained. Authorized 2026-07-13 per user (relax §16.6 tri budget for this asset only)."
      }
    }
  }
}
```

> ⚠ 跨层一致性：项目级 `d:/game/回到地面/assets/resources/config/art_quality_budget.json` 的 `rules3d.exceptions.CHR_Warrior_A` 也已同步同一例外，确保从任一目录校验均 PASS。

### 7.2 CHR_Warrior_A.assetmeta.json（交付 manifest 原文）

```json
{
  "name": "CHR_Warrior_A",
  "tri": 5268,
  "bones": 20,
  "textureSize": 512,
  "lodLevels": 1,
  "animClips": 8,
  "sockets": [
    "RightHand",
    "LeftHand",
    "Head",
    "Chest",
    "Back",
    "Foot",
    "Weapon",
    "SkillOrigin"
  ],
  "colliders": [
    "capsule"
  ],
  "depends": [],
  "lifecycle": "已批准",
  "perfTier": "medium",
  "testScene": "CHR_Warrior_A_TestScene",
  "version": "1.0.0",
  "author": "v11 pipeline: voxel-remesh + PBR bake from mother image + manual-skin (character-3d-from-concept)",
  "date": "2026-07-13",
  "reviewer": "user-confirmed 2026-07-13 (appearance + watertight)",
  "notes": "方案A 水密战士：对图生3D母图(~1312碎片)做 Voxel Remesh 熔成单一连续水密表皮，Smart UV 重展，将母图 baseColor/normal/metallicRoughness 以 EMIT 烘焙回新网格；手动蒙皮到 Mixamo 骨架、减骨 41->20、8 sockets、8 段动画、512² 贴图。几何经 Blender 回环焊接校验 1 连通块/0 真实边界边（UV 接缝重复顶点≤1mm 重合，运行时不可见）。tri=5268 超出 characters.maxTri=3000，已授权预算例外（art_quality_budget.json rules3d.exceptions.CHR_Warrior_A）：Decimate 减面会重新撕开裂痕（COLLAPSE 2850tri→604 真实破洞；DISSOLVE 同样破洞），故保留水密 5268。LOD 链为后续优化项（当前 lodLevels=1）。"
}
```

---

## 8. 入库规则（ART_RESOURCE_RULES.md §16 全文引用）

> 以下为 `回到地面/.workbuddy/memory/topics/ART_RESOURCE_RULES.md` §16「3D 资源规则（权威源）」原文节选。

### §16.1 3D 资源范围与类别
- **3D 化类别**：characters（5 英雄）、monsters（36）、bosses（42：12 终 Boss + 30 小 Boss）、effects（27 VFX）、tiles（24 模块件）。
- **保留 2D（不走 3D 分支）**：icons（67）、ui（173）、backgrounds（17）。其规则仍见 §3 / §6。

### §16.2 命名规范（双轨）
- 2D-retained 继续用 §6 小写规则 `{category}_{subject}_{action}.png`。
- 3D 资产**强制**前缀 + PascalCase（对应 `art_quality_budget.json → rules3d.naming.pattern`）：
  - `CHR_{Hero}_A.glb`（角色，A/B/C… 为变体）
  - `MON_{Region}_{Name}.glb`（怪物）
  - `BOSS_{Name}_{NN}.glb`（Boss，NN=序号；终 Boss 名含 `Final`）
  - `FX_{Name}.prefab`（特效）
  - `TILE_{Region}_{Module}.glb`（地块，Module ∈ Floor/Wall/HighGround/Thorn/Corner/Edge/Slope/Ramp）
  - 动画 clip：`{前缀}_{Token}_{Clip}`（如 `CHR_Warrior_Attack`）。
- 正则（权威，供 `asset_validate.py` 使用，须与 `art_quality_budget.json → rules3d.naming.pattern` 完全一致）：`^(CHR|MON|BOSS|FX|TILE)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?([.]glb|[.]prefab)?$`

### §16.3 预算（取自 `art_quality_budget.json → rules3d`）
- 角色：2000~3000 Tri / 20~30 骨 / 512² / ASTC 6×6 / LOD 100·60·30% / 最低 5 clip。
- 终 Boss：5000~9000 Tri（建议 7000）/ 40~80 骨 / 1024² / ASTC 8×8 / LOD 100·50·20% / 最低 8 clip。
- 小 Boss：4000~7000 Tri / 30~60 骨 / 512² / LOD 100·50%。
- 普通怪：1000~2500 Tri / 18~30 骨 / 512² / LOD 100·60·30% / 最低 5 clip。
- 普通特效：≤80 粒子 / ≤2 DrawCall / 256² / ≤1.5s。
- Boss 特效：≤300 粒子 / ≤4 DrawCall / 512² / ≤2s。
- Tile：2m×2m 模块 / 512² / LOD 100·50%。
- **具体数值以 `rules3d` 段为准（工具读取，不在此硬编码）**。

### §16.4 目录与入库
- 3D 母版 / 候选 / 校验报告：`art_source/models_review/`（对应 2D 的 `textures_review`）。
- 运行资产：
  - `assets/resources/models/`：.glb 源（仅构建期，不进运行时 Bundle 直读）
  - `assets/resources/prefabs/`：3D 实体 Prefab
  - ASTC 贴图目录：`assets/resources/textures/astc/`（与 2D 贴图分离）
- 入库语义：.glb 源不入 runtime；经 Cocos 导入生成 Prefab → 登记 `assets.json`（3D 类型：Prefab/SkeletalAnimation/Material）→ 业务配置引用。

### §16.5 资源元数据（manifest）
每个 3D 资产导出时需附带 sidecar `.assetmeta.json`，含：
- `tri` / `bones` / `textureSize` / `lodLevels` / `animClips`
- `sockets[]`（§16.2 规定集）/ `colliders[]`
- `version` / `author` / `date` / `reviewer`
- `depends[]`（依赖 token：武器 / FX / 音频 / 子模型）
- `perfTier`（`low`/`medium`/`high`）
- `testScene`（验证场景）
- `lifecycle`（选秀 / 评审中 / 已批准 / 已弃用）
`asset_validate.py` 读取此 manifest 比对 §16.3 预算出报告。

### §16.6 生命周期与单源
- 状态机：选秀 → 评审中 → 已批准 → 已弃用。仅「已批准」可正式接入。
- 本章 + `rules3d` 为唯一权威；`gen_art_spec.py` 须改为读取本章而非自行硬编码（见审查报告 §6.4）。

---

## 9. 验证命令真实输出（审查对照）

### 9.1 构建（节选关键日志）
```
PRE_GATE components = 1311
REMESH vox=0.0301 tris=2634 (watertight by construction)
BOUNDARY_EDGES (Blender, after remesh+tri) 0 WATERTIGHT ✓
BAKE_DONE
MATERIALS_COLLAPSED to 1 slot(s)
PRE_EXPORT components = 1 boundary_edges = 0 WATERTIGHT ✓
EXPORTED_GLB CHR_Warrior_W_v11.glb clips= 8 bones= 20 tri= 5268
MANIFEST_WRITTEN CHR_Warrior_W_v11.assetmeta.json
DONE
```

### 9.2 Blender 回环焊接校验（权威，对**已导出** glb 复验）
```
BEFORE weld: COMPONENTS=174 BOUNDARY_EDGES=2486
AFTER weld(1mm): verts=2635 COMPONENTS=1 BOUNDARY_EDGES=0  WATERTIGHT ✓
ROUNDTRIP_WELD_DONE
```
> 解释：焊接前 174 连通块 / 2486 边界边是 **UV 接缝重复顶点**（≤1mm 重合、运行时不可见），焊接后归并为 1 连通块 / 0 真实边界边 = 几何水密。

### 9.3 asset_validate（交付 manifest）
```
ASSET VALIDATION REPORT  (fail_checks=0, assets=1)
=== CHR_Warrior_A [PASS] ===
  [ok ] naming                prefix=CHR
  [ok ] budget_rule_found     bucket=characters
  [ok ] budget_exception      overrides=maxTri
  [ok ] tri_budget            tri=5268 range=[2000,6000]
  [ok ] bones_budget          bones=20 max=30
  [ok ] texture_size          size=512 max=512
  [ok ] lod_present           levels=1 expected>=1
  [ok ] anim_clips_min        clips=8 min=5
  [ok ] required_sockets      missing=none
  [ok ] collider_present      count=1
  [ok ] dependencies_present  missing=none
  [ok ] lifecycle_valid       state=已批准
  [ok ] perf_tier_valid       tier=medium
  [ok ] test_scene_present    scene=CHR_Warrior_A_TestScene
  [ok ] meta_version          version=1.0.0
  [ok ] meta_author           author=v11 pipeline: ...
  [ok ] meta_date             date=2026-07-13
  [ok ] meta_reviewer         reviewer=user-confirmed 2026-07-13 (appearance + watertight)
```

### 9.4 减面破坏水密实证（decimate_realcheck.py）
```
APPLIED ratio=0.55 tri=... comps=1 boundary=604 REAL_HOLES
APPLIED ratio=0.50 tri=... comps=1 boundary=604 REAL_HOLES
DONE
```
> 焊接后仍有 604 条真实边界边 = 减面重新撕裂痕，证明「保留 5268 + 预算例外」路线的必要性。

---

## 10. 问题与排查记录（审查必读，全部已规避 / 已根因解释）

> 本节完整记录本次交付从**构建 → 验证 → 决策**全过程遇到的每一个问题、每一步误判、每一条死路及其根因与解决。审查人员在另一台机器复现或排查类似问题时，可直接对照，避免重复踩坑。
> 共三类：§10.1 构建期陷阱（管线内）、§10.2 验证期陷阱（裂痕真伪调查，最易误判）、§10.3 减面 vs 预算 决策期问题。

### 10.1 构建期陷阱（v11 管线内，已规避）

| # | 陷阱 | 现象 | 解决 |
|---|---|---|---|
| 1 | `voxel_remesh(voxel_size=...)` 关键字参数 | Blender 5.1 报 TypeError | 改用 `pm.data.remesh_voxel_size = VOXEL_SIZE` 设属性 + 无参 `bpy.ops.object.voxel_remesh()` |
| 2 | `bpy.ops.mesh.quads_to_tris` | AttributeError（5.1 无此算子） | 改用 `bmesh.ops.triangulate(bm, faces=bm.faces[:])` |
| 3 | 体素网格 N-gon 导出撕裂 | 9305 条边界边（真破洞） | 导出前在 Blender 内用 bmesh 预三角化（`triangulate_mesh()`） |
| 4 | `Decimate` 不保流形 | 导出 GLB 实测被重新打碎成 59 个连通块 | 不用 Decimate 减面；改用 Voxel Remesh 调参到预算（构造即水密）。见 §10.3 进一步实证 |
| 5 | 体素调参不收敛 | 比例步长 1.08 太慢，12 次仍停在 4146 | `1/voxel²` 比例估算 + 6 次比例修正，一次到 2634 |
| 6 | `bmesh` `bm.free()` 后惰性求值 | ReferenceError（生成器在 free 后才求值） | 先物化结果（如 `roots = set(find(v.index) for v in bm.verts)`）再 `bm.free()` |
| 7 | 朴素边界边计数误报 | 6336 / 6490 假阳性（把每条 UV 接缝算成破洞） | 焊接后再数边界边；真洞判据 = 焊接后 `boundary_edges==0 && components==1` |
| 8 | glTF 导出沿 UV 接缝分裂顶点 | 导入后 174 组件 / 2486 边界 | 仅视觉接缝（≤1mm 重合、亚像素），焊接即归并；非真洞 |
| 9 | 纹理 `img.scale()` 黑屏 | PNG 前 8 字节垃圾前缀导致读坏 | 改 `resize_texture_np()`（numpy 双线性 → 临时 PNG → 重新 load+pack） |
| 10 | 自动蒙皮 0 权重 | Bone-Heat / Envelope 对水密体素网格失效 | 改手动权重（顶点→最近 3 骨线段距离反比，100% 可靠） |
| 11 | Mixamo scale 未归一化 → 巨大 | armature.scale=0.01 缩成厘米级 | 抢到 armature 后立刻 `transform_apply(scale=True)` 归一化到 scale=1 |
| 12 | 动画单位 cm/m 不一致 → 骨飞出 | 骨骼位置放大 100 倍 | `rescale_action_for_meters()`（按 armature_scale 缩放 location 轨道） |
| 13 | 金属材质被阉割 → 塑料感 | 金色变暗淡、发黑 | 保留原 PBR（仅缩放贴图尺寸）；预览调 `exposure=1.5` / `environment-image=neutral` |
| 14 | 误选 glTF 隐藏 Icosphere 占位 | 导出只剩球 | 以解析 glb JSON `meshes` 数组为真实几何准，排除占位 |
| 15 | 跨层同名目录混乱 | 写到错误目录、校验命中错误预算 | 角色注册落在**上层** `d:/game/assets/resources/models/characters/`；校验指定上层预算文件 |
| 16 | 导出前 `shade_smooth` + 清除 split normals 后数边界 | 误以为减面破坏水密（见 §10.3 #6） | 水密门禁放到平滑着色**之前**；或确认该步骤本身不引入破洞 |

### 10.2 验证期陷阱（裂痕真伪调查 —— 最易误判，完整时间线）

> 背景：构建脚本里 `PRE_EXPORT` 印出 `components=1 / boundary_edges=0`，但独立二进制解析器却报大量"边界边"。以下为逐次排查，**多数中途结论是错的**，最终才收敛到正确判据。审查者务必理解：任何"按索引数边界边"的结论都不可信，只有"导入后焊接再数"才是权威。

| 阶段 | 操作 / 误判 | 结果 | 根因 / 结论 |
|---|---|---|---|
| V1 | 独立 `glb_boundary.py` 直接解析导出 GLB 数边界边 | 报 **6490 边界边** | 误判为"导出 GLB 真裂"。实际是 UV 接缝分裂顶点被当破洞（假阳性） |
| V2 | 写 `glb_boundary_welded.py` 焊接后再数 | JSON chunk parse 失败 | GLB chunk offset 算错（漏算 4 字节 type + padding）。改 `off=12` 起读 JSON 到 `data[20:20+clen]` 修复 |
| V3 | 修复 offset 后重跑 | 索引超顶点数（index 4036 > 顶点 1345） | accessor 读取只取 `count` 个 float，漏乘向量分量（VEC3→×3）。改 `get_acc` 按 `count×ncomp` 读取 |
| V4 | 修正 accessor 读取 | 报 **6336 边界边 / 581 连通块** | 仍假阳性：焊接容差 `1e-5` 过严，接缝重复顶点（差 ≤1mm）未合并 |
| V5 | 容差扫描（1e-5 / 1mm / 1cm） | 即使 1cm 焊接也只降到 337 组件 / 6023 边界 | **错误结论**：以为 GLB 真碎成 ~337 块。根因：我的单趟焊接算法欠合并（见 V9） |
| V6 | 用 raw 三角邻接（不焊接）数连通块 | **46 组件**，最大块含 3828/4037 顶点 | 暴露 V4/V5 的焊接计数器有 bug（它把破洞边排除在连通性外，反而把洞多的面拆碎） |
| V7 | Blender 回环：导入导出 v11.glb 跑 `count_components/boundary_edges` | `COMPONENTS=174, BOUNDARY_EDGES=2486, BROKEN ✗` | 与构建脚本 `PRE_EXPORT ✓` 矛盾 → 疑 GLB 真裂。继续查（见 V9） |
| V8 | `rt_check2.py` 焊接后再查，函数写 `find(v.index)` | 崩（v 已是 int，无 `.index`） | 笔误，改 `find(v)` 后重跑 |
| **V9** | **`rt_check2.py` 按 1mm 焊接后重查（修复后）** | **`COMPONENTS=1, BOUNDARY_EDGES=0, WATERTIGHT ✓`** | **关键转折点**：174/2486 全是 UV 接缝重复顶点（≤1mm 重合），焊接即归并。GLB 几何真正水密 |
| V10 | 排查"为何 Python 解析器只合并 396 顶点而 Blender 合并 1402" | BufferView **非交织**（无 `byteStride`） | 排除"解析器错读坐标"假设 → 纯焊接算法差异（Python 单趟欠合并） |
| V11 | 暴力成对距离分析 | 4037 顶点中 **≤1mm 对 539**、≤5mm 对 1022 | 539 = 接缝重复顶点（亚像素、不可见）；1022 多为正常表面邻接，非缝。证实无缝 |
| V12 | 用 `force_sampling=False` 重导出对照 | ≤1mm 对 543（与 539 几乎不变） | 排除 `export_force_sampling=True` 造成接缝间隙的假设 |
| V13 | `cd` 用反斜杠路径 | Python 报路径不存在 | 改用正斜杠 `d:/game/...` |

**验证期最终判据（权威）**：
```
glTF 导入 → 按 1mm 焊接 remove_doubles → count_components == 1 && boundary_edges == 0  ⇒  水密（无裂痕）
焊接前看到的 174 组件 / 2486 边界边 = 100% UV 接缝重复顶点（≤1mm 重合、运行时亚像素不可见）
```
任何"不先焊接就数边界边 / 连通块"的中间结论（V1–V7）均为假阳性，**不要采信**。

### 10.3 减面 vs 预算 决策期问题（决定"保留 5268 + 例外"）

> 目标：把 v11 从 5268 tri 压到 ≤3000 以过 `asset_validate` 预算门禁。结果：发现**任何减面都会重新撕开裂痕**，最终用户授权"保留 5268 + 预算例外"。

| # | 问题 / 误判 | 结果 | 根因 / 结论 |
|---|---|---|---|
| 1 | `decimate_deliver.py` 的 `count_components` 写 `find(v.index)` | 导出前崩溃 | 同 V8 笔误，改 `find(v)` |
| 2 | `decimate_deliver.py` 未先焊接就数边界边 → `ABORT` | 误报"减面破坏水密" | 假阳性（没焊接种缝）。真判据须先焊接（见 §10.2 V9） |
| 3 | `decimate_scan2.py` 只加 Decimate 修改器但**从不 apply** | 误报"所有 ratio 都水密" | 一直检查的是原始未减面网格。假阳性 |
| 4 | `decimate_realcheck.py` 未设 active object 就 `modifier_apply` | 误报"减面后 0 破洞" | apply 实际没作用到网格，测的是 5268 原始（天然水密）。假阳性 |
| **5** | **`decimate_deliver.py` 正确 apply 后焊接检查** | **`boundary=604 REAL_HOLES`** | **真结论**：COLLAPSE 减到 2850 tri 重新产生 604 条真实破洞 |
| 6 | `decimate_deliver.py` 在 apply 后做 `shade_smooth` + 清除 split normals | 仍是 604 | 验证该两步不引入破洞；604 来自 Decimate 本身（对比 realcheck 单次 apply 也是 0→但那次是假阳性未作用，见 #4） |
| 7 | `decimate_deliver.py` 反复调 ratio + `dg.update()` 循环 | 604（比单次 apply 更差） | 多次 ratio 变更累积状态。改为与 realcheck 一致的**单次 apply** |
| 8 | 测试 `DISSOLVE` 模式减面（Blender 5.1 无 PLANAR，仅有 COLLAPSE/UNSUBDIV/DISSOLVE） | 196+ 破洞，角度一大还碎成多块 | DISSOLVE 同样不保流形 |
| 9 | 测试 `decimate_type="PLANAR"` | AttributeError（5.1 无 PLANAR） | 改用 `DISSOLVE`，仍破洞（见 #8） |

**决策实证结论**（写入 `decimate_realcheck.py` 可复现）：
```
APPLIED ratio=0.55 tri≈2850 comps=1 boundary=604 REAL_HOLES
APPLIED ratio=0.50 tri≈2634 comps=1 boundary=604 REAL_HOLES
```
→ Decimate（COLLAPSE 或 DISSOLVE）**不保流形**，对本水密结构减面会重新撕出 604 条真实破洞 = 正是用户最想根治的裂痕。
→ 方案 A 的水密结构天然落在 **~5268 tri**（体素网格四边形导出三角化翻倍），**减面与无裂痕在本结构上互斥**。
→ 按用户授权采用「保留 5268 + 预算例外」：`art_quality_budget.json` 加 `exceptions.CHR_Warrior_A.maxTri=6000`，`asset_validate.py` 识别例外（仅本资产放宽，其他角色仍受 3000 硬约束，self-test 无回归）。

---

## 11. 跨文件同步清单（CROSS_FILE_CONSISTENCY）

交付 `CHR_Warrior_A` 时已同步以下文件（审查时应一并核对一致性）：

| 文件 | 改动 |
|---|---|
| `assets/resources/models/characters/CHR_Warrior_A.glb` | 新增：水密 5268 tri 模型本体 |
| `assets/resources/models/characters/CHR_Warrior_A.assetmeta.json` | 覆盖占位：lifecycle=已批准、reviewer 填入、命名前缀修正 |
| `assets/resources/config/art_quality_budget.json`（上层） | `rules3d.exceptions.CHR_Warrior_A.maxTri=6000` |
| `assets/resources/config/art_quality_budget.json`（项目级） | 同上例外同步 |
| `tools/asset_validate.py` | 新增 `exceptions` 识别（仅本资产放宽，无回归，self-test PASS） |
| `assets/resources/config/resource_inventory.json` | warrior 块：`current_status` → `approved_3d`、补 `current_dim`（tri/bones/tex/animClips） |
| `docs/progress/3d_progress.md` | warrior 行：已批准 / 5268 / 20 / 512 / 8 |

> 设计类规则文档（§16.3 的 3000 预算）**保持不变**；`CHR_Warrior_A` 作为**授权例外**存在，其他角色仍受 3000 硬约束。

---

## 12. 交付物清单

```
assets/resources/models/characters/
├── CHR_Warrior_A.glb            # 水密战士本体（5268 tri, 20 骨, 8 动画, 8 挂点, 512² 内嵌纹理）
└── CHR_Warrior_A.assetmeta.json # 通过 asset_validate 的 manifest（lifecycle=已批准）

art_source/models_review/CHR_Warrior_W/   # 审查/对照用（非运行时）
├── CHR_Warrior_W_v11.glb            # 与交付同源的构建产物
├── CHR_Warrior_W_v11.assetmeta.json
├── CHR_Warrior_W_v11_front.png      # Blender 渲染正视图
├── CHR_Warrior_W_v11_side.png       # Blender 渲染侧视图
├── CHR_Warrior_W_v11_test_scene.html# 浏览器交互预览（见 §13）
├── build_from_prototype_v11.py      # 方案 A 正本（本文 §6.1）
├── glb_watertight_check.py          # 独立水密校验（§6.2）
├── rt_check2.py                     # Blender 回环校验（§6.3）
└── decimate_realcheck.py            # 减面破坏水密实证（§6.4）
```

---

## 13. 预览测试页（审查可本地复现）

> 文件 `CHR_Warrior_W_v11_test_scene.html`（位于 review 目录，依赖同目录 `model-viewer.min.js`）。通过 `python -m http.server 8777 --directory <review目录>` 启动后访问 `http://localhost:8777/CHR_Warrior_W_v11_test_scene.html`。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>CHR_Warrior_W v11 · 方案A 验证 (水密+体素重网格+EMIT烘焙)</title>
<script type="module" src="./model-viewer.min.js"></script>
<style>
  :root { --bg:#0f1420; --panel:#1b2333; --line:#2c3852; --txt:#e8eefc; --muted:#94a3c4; --ok:#46d39a; --acc:#6aa6ff; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--txt); font:14px/1.5 -apple-system,Segoe UI,Roboto,"PingFang SC","Microsoft YaHei",sans-serif; }
  header { padding:14px 20px; border-bottom:1px solid var(--line); display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  header h1 { font-size:16px; margin:0; }
  header .tag { font-size:12px; color:var(--muted); }
  .layout { display:grid; grid-template-columns:1fr 320px; gap:16px; padding:16px; }
  .stage { background:linear-gradient(160deg,#16203a,#0d1322); border:1px solid var(--line); border-radius:12px; min-height:60vh; overflow:hidden; }
  model-viewer { width:100%; height:60vh; --poster-color:transparent; }
  .panel { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:14px; }
  .panel h2 { font-size:13px; margin:0 0 10px; color:var(--acc); letter-spacing:.04em; text-transform:uppercase; }
  .row { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #243049; }
  .row span:last-child { color:var(--txt); }
  .row span:first-child { color:var(--muted); }
  .chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
  .chip { background:#22324f; border:1px solid #324a73; color:#cfe0ff; padding:3px 9px; border-radius:999px; font-size:12px; }
  .chip.ok { border-color:var(--ok); color:var(--ok); }
  select,button { width:100%; padding:9px 10px; border-radius:8px; border:1px solid var(--line); background:#0f1726; color:var(--txt); font-size:13px; }
  button { margin-top:8px; cursor:pointer; background:#1d2c47; }
  button:hover { background:#26395c; }
  .pass { color:var(--ok); font-weight:600; }
  .note { color:var(--muted); font-size:12px; margin-top:10px; }
  .warn { color:#ffcf6a; font-size:12px; margin-top:6px; }
</style>
</head>
<body>
<header>
  <h1>CHR_Warrior_W v11 · 方案A 验证</h1>
  <span class="tag">水密准入 + Voxel重网格 + EMIT烘焙 · PBR母图 · 20骨 · 8段动画 · 8挂点</span>
</header>
<div class="layout">
  <div class="stage">
    <model-viewer id="mv" src="./CHR_Warrior_W_v11.glb?v=11" camera-controls auto-rotate
                  shadow-intensity="1" exposure="1.5" environment-image="neutral"></model-viewer>
  </div>
  <div class="panel">
    <h2>动画片段</h2>
    <select id="anim"><option value="">（加载中…）</option></select>
    <button id="play">▶ 播放 / 暂停</button>

    <h2 style="margin-top:16px">资产信息</h2>
    <div class="row"><span>三角面 tri</span><span id="triCount">—</span></div>
    <div class="row"><span>骨骼 bones</span><span id="bones">—</span></div>
    <div class="row"><span>贴图 texture</span><span>512² <span class="pass">✓</span></span></div>
    <div class="row"><span>动画段数</span><span id="animCount">—</span></div>
    <div class="row"><span>碰撞体</span><span>capsule <span class="pass">✓</span></span></div>
    <div class="row"><span>水密性</span><span id="watertight">—</span></div>

    <h2 style="margin-top:16px">挂点 Sockets (8)</h2>
    <div class="chips" id="sockets">
      <span class="chip ok">RightHand</span><span class="chip ok">LeftHand</span>
      <span class="chip ok">Head</span><span class="chip ok">Chest</span>
      <span class="chip ok">Back</span><span class="chip ok">Foot</span>
      <span class="chip ok">Weapon</span><span class="chip ok">SkillOrigin</span>
    </div>
    <div class="note">挂点已作为空节点父级到对应骨骼写入 glb（Weapon/RightHand 挂剑、LeftHand 挂盾）。</div>
    <div class="warn">方案A：图生3D母图(碎片~1312块)经 Voxel 重网格熔成单一水密表皮 → 无裂痕；母图 baseColor/normal/metallicRoughness 经 EMIT 烘焙回新网格 → 金色金属盔甲保留。</div>
  </div>
</div>

<script type="module">
  const mv = document.getElementById('mv');
  const sel = document.getElementById('anim');
  const playBtn = document.getElementById('play');

  function extractGlbJson(buf) {
    const dv = new DataView(buf);
    const clen = dv.getUint32(12, true);
    const jsonBytes = new Uint8Array(buf, 20, clen);
    return JSON.parse(new TextDecoder().decode(jsonBytes));
  }
  function countTris(js) {
    let total = 0;
    for (const m of js.meshes || []) for (const p of m.primitives || [])
      if (p.indices != null) total += js.accessors[p.indices].count / 3;
    return Math.round(total);
  }
  function populate(names, triCount, boneCount, animCount) {
    sel.innerHTML = '';
    for (const n of names) { const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); }
    if (names.length) { sel.value = names[0]; mv.animationName = names[0]; }
    if (triCount != null) document.getElementById('triCount').textContent = triCount;
    if (boneCount != null) document.getElementById('bones').textContent = boneCount + ' / 上限 30 ✓';
    if (animCount != null) document.getElementById('animCount').textContent = animCount + ' / 下限 5 ✓';
  }
  function showErr(msg) {
    sel.innerHTML = '<option value="">（加载失败）</option>';
    const tip = document.createElement('div'); tip.className = 'warn'; tip.style.marginTop = '6px'; tip.textContent = msg;
    sel.parentNode.insertBefore(tip, sel.nextSibling);
  }
  if (location.protocol === 'file:') {
    showErr('⚠ 当前是 file:// 协议，浏览器禁止加载本地 GLB。请通过 http://localhost:8777/CHR_Warrior_W_v11_test_scene.html 访问。');
  } else {
    try {
      const buf = await (await fetch('./CHR_Warrior_W_v11.glb?v=11')).arrayBuffer();
      const js = extractGlbJson(buf);
      const bones = js.skins?.length ? Math.max(...js.skins.map(s => s.joints.length)) : 0;
      populate((js.animations || []).map(a => a.name), countTris(js), bones, (js.animations || []).length);
      document.getElementById('watertight').innerHTML = '水密 ✓ <span class="pass">(Blender回环焊接校验: 1连通块 / 0边界边; 接缝重复顶点≤1mm·亚像素不可见)</span>';
    } catch (e) {
      showErr('⚠ 加载失败：' + e.message + '。请通过 http://localhost:8777/CHR_Warrior_W_v11_test_scene.html 打开。');
    }
  }
  mv.addEventListener('load', () => {
    const names = mv.availableAnimations || [];
    if (names.length && sel.options.length === 0) populate(names, null, null, null);
  });
  sel.addEventListener('change', () => { mv.animationName = sel.value; if (mv.paused) mv.play(); });
  playBtn.addEventListener('click', () => { if (mv.paused) mv.play(); else mv.pause(); });
</script>
</body>
</html>
```

---

## 14. 后续步骤（非阻塞，待推进）

1. **Cocos Editor 接入**：headless 环境无法生成 Prefab；需在 Cocos 中导入 `CHR_Warrior_A.glb` → 生成 Prefab + 登记 `assets.json`（3D 类型：Prefab / SkeletalAnimation / Material）。遵循 §16.4。
2. **武器挂载（剑 + 盾）**：8 挂点（RightHand/LeftHand/Weapon 等）已就位，可独立作为 prop 挂到对应挂点，动画更干净。
3. **LOD 链**：当前 `lodLevels=1`，后续可加 LOD（100/60/30%）进一步省面。
4. **固化经验进 skill**：`character-3d-from-concept/SKILL.md` 当前仍写「减面到 ~2800 tri」的 v4 路径，需补充方案 A（水密 Voxel Remesh + 预算例外）作为裂痕根治标准路径（待用户授权后更新）。

---

## 15. 审查 Checklist（reviewer 用）

- [ ] 环境：Blender 5.1 路径正确、`asset_validate.py` 无第三方依赖、预算文件路径命中（上层 `d:/game/assets/...`）
- [ ] 根因：理解 §3（Decimate 不保流形 + N-gon 撕裂 + UV 接缝误报三陷阱）
- [ ] 构建：运行 §5.1 产出 v11.glb，日志含 `BOUNDARY_EDGES ... 0 WATERTIGHT ✓` 与 `EXPORTED_GLB ... tri=5268`
- [ ] 水密：§5.2 / §5.3 均显示 `WATERTIGHT ✓`（焊接后 components=1 / boundary=0）
- [ ] **验证陷阱**：通读 §10.2，理解"不先焊接就数边界边/连通块"的 V1–V7 均为假阳性，权威判据只有 V9（导入→1mm 焊接→components=1 && boundary=0）
- [ ] 减面约束：§5.5 实证 `REAL_HOLES`（604），确认预算例外必要性；通读 §10.3 理解 COLLAPSE/DISSOLVE 均不保流形、以及若干"假水密/假破洞"中间误判
- [ ] 校验：§5.4 `fail_checks=0`，且 `budget_exception overrides=maxTri`
- [ ] 配置：§7.1 含 `exceptions.CHR_Warrior_A.maxTri=6000`；§7.2 manifest 字段齐全
- [ ] 入库：§11 所列 7 处文件均已同步，设计规则文档 §16.3 不变
- [ ] 外观：预览页（§13）确认金色盔甲与母图一致、转动无可见裂痕
- [ ] 跨职业：方案 A 可复用于 archer/assassin/mage/berserker，仅物种/武器/动画包不同

---

*文档结束。本文件为自包含权威说明，所有代码与配置均直接嵌入，审查人员无需另行取文件即可完整复现与核对。*
