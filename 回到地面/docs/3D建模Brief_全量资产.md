# 3D 建模 Brief — 全量资产生产规格

> **编码**: UTF-8
> **版本**: 1.2.0 / 2026-07-11
> **用途**: 供 AI / Blender 美术师独立制作 3D 游戏资产，无需额外询问规格

```yaml
Document:
  Name: Art3D_Production_Brief
  Version: 1.2.0
  LastUpdate: 2026-07-11
  Compatible:
    - art_3d_manifest.json v1
    - art_quality_budget.json → rules3d v1
    - ART_RESOURCE_RULES.md §16
    - docs/角色.txt（部件拆分标准）
```

> ⚠️ AI 在开始制作前必须确认 `Version` 是否与项目当前版本一致。版本不匹配可能导致校验失败或资产不兼容。

> **📂 工作目录声明**：本文档中**所有命令**假设当前工作目录为 **`回到地面/`**（即 `E:/game/回到地面/`）。如需在其他目录运行，请先 `cd` 到该目录。脚本路径以 `tools/` 开头表示 `回到地面/tools/`，以 `../tools/` 开头表示父级 `E:/game/tools/`。

---

## 0. 策略总纲

- **游戏**: 《回到地面》— Cocos Creator 3.8.8 横版 Roguelike
- **风格**: Q 版卡通动物冒险，圆润造型、饱和色、柔光、粗描边
- **风格关键词**: **类二次元卡通渲染 (Anime-style Toon Shading)**，三渲二风格，非写实、非低多边形、非像素
- **色彩倾向**: **高饱和**（区域主色见 §7），暖色基底 + 区域差异化
- **禁止风格**: 写实 / 低多边形 / 像素 / 暗黑哥特 / PBR 写实色
- **平台**: TapTap Android（参考分辨率 1920×1080）
- **运行时**: Cocos Creator 3.8.8 内置渲染管线（非 URP/HDRP/Three.js），Cocos standard 材质
- **烘焙光照**: **不需要** — 使用 Cocos 动态光照或 Shader 级卡通光照，无需 UV 展开烘焙
- **当前阶段**: 2D → 3D 升级，已注册 176 项（134 + 42 地牢功能道具）3D 资产等待生产

---

## 1. 命名规范（权威源：`ART_RESOURCE_RULES.md §16.2`）

所有 3D 资产**强制**使用前缀 + PascalCase，从 `art_quality_budget.json → rules3d.naming.pattern` 验证：

| 类型 | 前缀 | 模式 | 示例 |
|------|------|------|------|
| 角色 | `CHR_` | `CHR_{Hero}_A.glb` | `CHR_Warrior_A.glb` |
| 怪物 | `MON_` | `MON_{Region}_{Name}.glb` | `MON_Forest_Boar.glb` |
| 终 Boss | `BOSS_` | `BOSS_{Name}_{NN}.glb`（含 `Final`） | `BOSS_Final_01.glb` |
| 小 Boss | `BOSS_` | `BOSS_{Name}_{NN}.glb` | `BOSS_Mini_01.glb` |
| 特效 | `FX_` | `FX_{Name}.prefab` | `FX_Crit.prefab` |
| 地块 | `TILE_` | `TILE_{Region}_{Module}.glb` | `TILE_Forest_Floor.glb` |
| 地牢道具 | `DNG_` | `DNG_{Region}_{Func}.glb` | `DNG_Forest_Chest.glb` |

- 动画 clip：`{前缀}_{Token}_{Clip}`（如 `CHR_Warrior_Attack`）
- 正则校验（`asset_validate.py` 执行）：`^(CHR|MON|BOSS|FX|TILE|DNG)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?([.]glb|[.]prefab)?$`
- **命名一致性**：所有名字必须保持**大小写统一**。例如 `HighGround`（PascalCase）不得写成 `Highground` 或 `highground`。Tile 模块命名：`Floor`/`Wall`/`HighGround`/`Thorn`/`Corner`/`Edge`/`Slope`/`Ramp`。Dungeon 功能件命名：`Entry`/`Chest`/`HealAltar`/`Shop`/`Event`/`BuffShrine`/`BossGate`。

---

## 2. 技术预算（权威源：`art_quality_budget.json → rules3d`）

### 2.1 角色 `characters`（5 英雄）

| 指标 | 最小值 | 推荐值 | 最大值 |
|------|-------|-------|-------|
| 面数 (Tri) | 2,000 | 2,500 | 3,000 |
| 骨骼 (Bones) | — | 26 | 30 |
| 贴图尺寸 | — | 512² | 512² |
| ASTC 压缩 | — | 6×6 | — |
| LOD | L0 100% (0m) | L1 60% (12m) | L2 30% (24m) |
| 动画剪辑 | 最少 5 clip | — | — |
| 碰撞体 | Capsule | — | — |
| 性能等级 | medium | — | — |

**Socket 要求**: RightHand, LeftHand, Head, Chest, Back, Foot, Weapon, SkillOrigin

**动画剪辑要求（最少 5 clip）**: idle, walk, attack, hurt, death（技能/闪避为加分项）

### 2.2 终 Boss `bosses_final`（12 个）

| 指标 | 最小值 | 推荐值 | 最大值 |
|------|-------|-------|-------|
| 面数 (Tri) | 5,000 | 7,000 | 9,000 |
| 骨骼 (Bones) | — | 60 | 80 |
| 贴图尺寸 | — | 1024² | 1024² |
| ASTC 压缩 | — | 8×8 | — |
| LOD | L0 100% (0m) | L1 50% (18m) | L2 20% (36m) |
| 动画剪辑 | 最少 8 clip | — | — |
| 碰撞体 | capsule_multi | — | — |
| 性能等级 | high | — | — |

**Socket 要求**: RightHand, LeftHand, Head, Chest, Back, Foot, Weapon, SkillOrigin, Mouth, Wing, Tail, Eye, WeakPoint

**动画剪辑要求（最少 8 clip）**: idle, walk, attack, skill, hurt, death, phasechange, 特殊出场

### 2.3 小 Boss `bosses_mini`（30 个）

| 指标 | 最小值 | 推荐值 | 最大值 |
|------|-------|-------|-------|
| 面数 (Tri) | 4,000 | 5,000 | 7,000 |
| 骨骼 (Bones) | — | 40 | 60 |
| 贴图尺寸 | — | 512² | 512² |
| ASTC 压缩 | — | 6×6 | — |
| LOD | L0 100% (0m) | L1 50% (14m) | — |
| 动画剪辑 | 最少 7 clip | — | — |
| 碰撞体 | Capsule | — | — |
| 性能等级 | medium | — | — |

**Socket 要求**: RightHand, LeftHand, Head, Chest, Back, Foot, Weapon, SkillOrigin, Mouth, Tail, WeakPoint

### 2.4 普通怪物 `monsters`（36 个）

| 指标 | 最小值 | 推荐值 | 最大值 |
|------|-------|-------|-------|
| 面数 (Tri) | 1,000 | 1,800 | 2,500 |
| 骨骼 (Bones) | — | 18 | 30 |
| 贴图尺寸 | — | 512² | 512² |
| ASTC 压缩 | — | 6×6 | — |
| LOD | L0 100% (0m) | L1 60% (14m) | L2 30% (28m) |
| 动画剪辑 | 最少 5 clip | — | — |
| 碰撞体 | Capsule | — | — |
| 性能等级 | low | — | — |

**Socket 要求**: RightHand, LeftHand, Head, Foot, SkillOrigin

### 2.5 普通特效 `effects_normal`

| 指标 | 上限 |
|------|------|
| 粒子数 | ≤80 |
| DrawCall | ≤2 |
| 贴图尺寸 | 256² |
| ASTC 压缩 | 6×6 |
| 持续时间 | ≤1.5s |
| 性能等级 | medium |

### 2.6 Boss 特效 `effects_boss`

| 指标 | 上限 |
|------|------|
| 粒子数 | ≤300 |
| DrawCall | ≤4 |
| 贴图尺寸 | 512² |
| ASTC 压缩 | 8×8 |
| 持续时间 | ≤2.0s |
| 性能等级 | high |

### 2.7 地块 `tiles`（每区域 4 模块 × 6 区域 = 24 件）

| 指标 | 值 |
|------|-----|
| 模块尺寸 | 2m × 2m |
| 贴图尺寸 | 512² |
| ASTC 压缩 | 6×6 |
| LOD | L0 100% (0m), L1 50% (20m) |
| 性能等级 | low |
| 模块类型 | Floor, Wall, HighGround, Thorn, Corner, Edge, Slope, Ramp |

> tiles 为**静态模块件，不需要骨骼/动画**。

### 2.8 地牢功能道具 `dungeon`（每区域 7 件 × 6 区域 = 42 件）

| 指标 | 值 |
|------|-----|
| 模块类型 | Entry（入口门）/ Chest（宝箱）/ HealAltar（治疗祭坛，对应地形码3）/ Shop（商店柜台）/ Event（事件标记）/ BuffShrine（强化神龛）/ BossGate（Boss 闸门） |
| 面数 (Tri) | 800 – 3000 |
| 骨骼 (Bones) | 0（静态道具，无骨骼/动画） |
| 贴图尺寸 | 512² |
| ASTC 压缩 | 6×6 |
| LOD | L0 100% (0m), L1 50% (20m) |
| 性能等级 | low |
| 区域主题 | 配色继承 §7 的 6 区域主色调（Forest 暖绿 / Catacombs 灰绿 / Volcano 橙黑 / Tundra 蓝白 / Swamp 墨绿 / Abyss 紫黑） |

> dungeon 道具为**静态功能件**，与 tiles 同理不需要骨骼/动画。它们填补地牢 DAG 房间的功能性视觉——每间房除地板/墙（`TILE_`）外，还需对应功能道具才构成可辨识房间（宝箱房有 `Chest`、回复房有 `HealAltar` 等）。
> **2D 参考缺口**：当前 `source_2d` 为空——这些功能道具尚无 2D 概念稿。生产前需先补一轮 2D 概念稿（或按 §7 区域色板直接由 AI 几何化设计；须遵守 §10.11 仅用本 Brief + 区域色板，禁止引用训练知识）。

---

## 3. 导出规范（所有 .glb）

| 约束 | 要求 |
|------|------|
| 原点 | 脚底中心在原点 (0,0,0) |
| 朝向 | Y-up, 面朝 +Z（Cocos Creator 默认，Blender 导出时注意转换） |
| 单位尺度 | **1 unit = 1 meter** |
| 帧率 | 30fps 导出 |
| 文件格式 | `.glb`（二进制，非 `.gltf` 文件夹） |
| 动画 | locomotion 无缝循环 |
| AnimEvent | 命中帧须打 AnimEvent 标记 |
| 贴图目录 | 独立于 `.glb` 存放，走 `assets/resources/textures/astc/` |

### 3.1 材质/贴图通道规格

| 通道 | 是否需要 | 分辨率 | 说明 |
|------|---------|--------|------|
| **Albedo (Diffuse)** | ✅ **必须** | 角色/Boss 512²，怪/地块 512²，特效 256² | 颜色+alpha，饱和卡通色，无写实纹理细节 |
| **Normal Map** | ✅ **建议** | 与 Albedo 同分辨率 | 法线贴图增强卡通立体感，非 PBR 写实级 |
| **Metallic / Roughness** | ❌ **不需要** | — | Cocos 不依赖金属度粗糙度贴图，走标准材质参数 |
| **AO (Ambient Occlusion)** | ❌ **不需要** | — | 卡通风格通过 Shader 级卡通光照实现，无需 AO 贴图 |
| **ASTC 压缩** | ✅ **导入时自动转** | 6×6（默认）/ 8×8（终 Boss） | .glb 导出时贴图用 PNG，导入 Cocos Creator 3.8.8 时引擎自动转 ASTC，不需要单独装 astcenc 工具链 |

> 贴图为**非 PBR 写实色**。Cocos Creator 3.8.8 使用标准材质，通过 Albedo + Normal + 卡通光照 Shader 实现效果，不需要 PBR 工作流贴图链。

### 3.2 动画需求明细

**需要骨骼绑定的资产**：characters(5) + monsters(36) + bosses(42) = **83 项**
**不需要骨骼的资产**：tiles(24 静态模块件) + effects(27 粒子 Prefab) + dungeon(42 静态功能道具) = **93 项**

| 动作类型 | 适用 | 建议帧数 | 说明 |
|---------|------|---------|------|
| **idle（待机）** | 全部 83 项 | 30–60 帧 | 呼吸循环，轻微身体起伏，loop |
| **walk（行走）** | 全部 83 项 | 24–30 帧 | 地形移动，loop |
| **attack（攻击）** | 全部 83 项 | 18–30 帧 | 武器/肢体挥出→命中→收回，命中帧打 AnimEvent |
| **hurt（受击）** | 全部 83 项 | 12–18 帧 | 后仰/闪白，非 loop |
| **death（死亡）** | 全部 83 项 | 24–40 帧 | 倒地→消散/化光，终 Boss 建议更长 |
| **skill（技能）** | Boss 必含，角色加分 | 24–48 帧 | 特殊技能动作 |
| **phasechange（转阶段）** | 终 Boss 12 项 | 30–60 帧 | 变身/狂暴特效过渡 |
| **dodge（闪避）** | 角色建议 | 12–18 帧 | 侧滚/后跳 |

- 动画命名：`{前缀}_{Token}_{Clip}`（如 `CHR_Warrior_Idle`）
- 最小 clip 数见 §2 各节（角色 5 / 终 Boss 8 / 小 Boss 7 / 怪 5）

---

## 4. 导出后置作业（每个资产需附带的 sidecar 文件）

每个 3D 资产需附带 `.assetmeta.json`（与 `.glb` 同目录，同名），格式如下：

```json
{
  "name": "CHR_Warrior_A",
  "tri": 2500,
  "bones": 26,
  "textureSize": 512,
  "lodLevels": 3,
  "animClips": ["idle","walk","attack","hurt","death"],
  "sockets": ["RightHand","LeftHand","Head","Chest","Back","Foot","Weapon","SkillOrigin"],
  "colliders": ["capsule"],
  "depends": ["Weapon_Sword"],
  "lifecycle": "选秀",
  "perfTier": "medium",
  "version": "1.0.0",
  "author": "<your_name>",
  "date": "<YYYY-MM-DD>",
  "reviewer": ""
}
```

| 字段 | 说明 |
|------|------|
| `name` | 必须与 `.glb` 文件名一致（不含扩展名） |
| `tri` | 实际面数，须在对应预算范围内 |
| `bones` | 实际骨骼数 |
| `textureSize` | 贴图尺寸（如 512） |
| `lodLevels` | LOD 级别数 |
| `animClips` | 动画剪辑名称列表 |
| `sockets[]` | 必含 socket 集（见各节） |
| `colliders[]` | 碰撞体类型 |
| `depends[]` | 依赖 token（武器/FX/音频/子模型） |
| `lifecycle` | 初始为 `"选秀"`，通过评审后改 `"已批准"` |
| `perfTier` | `low` / `medium` / `high` |
| `version` | 初始 `"1.0.0"` |
| `author` | 你的名称 |
| `date` | 导出日期 |
| `reviewer` | 留空（审核人填） |

---

## 5. 生命周期

```
选秀 → 评审中 → 已批准 → 已弃用
```

- **选秀**: 初始状态，模型完成导出但未审核
- **评审中**: 提交技术校验（`asset_validate.py`）或人工视觉审核
- **已批准**: 通过全部校验，可正式入库接入运行时
- **已弃用**: 不再使用

仅「已批准」可正式接入。

---

## 6. 入库流程（给另一 AI/工具 参考）

### 6.1 前置：生成 .assetmeta.json 模板

在开始任何模型制作之前，先运行工具脚本为全部 176 项资产生成 .assetmeta.json 模板。AI 只需填入实际数值（Tri/Bone/Animation等），无需从头编写：

```bash
# 先确认工作目录
cd E:/game/回到地面/

# 生成全部 176 项模板（输出到 assets/resources/models/{cat}/）
python tools/gen_assetmeta_from_manifest.py

# 仅生成单个资产（用于测试）
python tools/gen_assetmeta_from_manifest.py --single CHR_Archer_A

# 预览但不写入
python tools/gen_assetmeta_from_manifest.py --dry-run
```

详见：`tools/gen_assetmeta_from_manifest.py`。

### 6.2 标准入库流程

```
Blender 制作 .glb
  ↓
导出 ASTC 贴图 → Cocos 导入生成 .prefab  ← 🔴 人工步骤
  ↓
在 .assetmeta.json 中填写实际数值（tri/bones/animClips/author/date）
  ↓
python tools/asset_validate.py assets/resources/models/<cat>/<NAME>.assetmeta.json
  ↓  PASS ?
  ↓
视觉审核（人工确认）← 🔴 人工步骤
  ↓  用户说"可以"或"入库"方可继续
python tools/art_pipeline.py import --mode 3d --resource <NAME>
  ↓  .glb → models/，.prefab → prefabs/
  ↓
更新 assets.json（3D 类型）
  ↓
填写 .assetmeta.json 的 reviewer 字段（人工签名）← 🔴 人工步骤
  ↓
npm.cmd run validate:all
```

### 6.3 人工门禁总览

| 步骤 | 执行者 | 说明 |
|------|--------|------|
| **Cocos 导入生成 Prefab** | 🔴 **人工** | AI 无法操作 Cocos Creator 编辑器。需人工在 Cocos 中导入 `.glb` → 生成 `.prefab` → 检查材质/贴图/Socket 挂载是否正确 |
| **视觉审核** | 🔴 **人工** | 用户确认模型：轮廓/比例/配色/动画/贴图 是否与 2D 参考一致。说"可以"或"入库"后方可 `import` |
| **assetmeta.reviewer 签名** | 🔴 **人工** | 审核通过后，在 `.assetmeta.json` 的 `reviewer` 字段填入审核人姓名 |
| 其余所有步骤 | 🤖 **AI** | 从建模到导出到 validate 全自动 |

> **原则**：AI 完成全部建模→导出→自检→validate PASS 后，进入人工审核队列。人工审核通过的资产才能正式入库。不允许 AI 猜测"视觉合格"或自动跳过人工门禁。

### 6.3 进度收集（可选）

批量生产过程中，随时运行以下脚本查看 3D 资产的整体进度状态：

```bash
# 先确认工作目录
cd E:/game/回到地面/

# 文本摘要（默认）
python tools/collect_3d_progress.py

# 逐资产详细状态
python tools/collect_3d_progress.py --detail

# JSON 输出（供 Jenkins/GitHub Actions/MCP Agent 读取）
python tools/collect_3d_progress.py --json

# 生成进度报告到 docs/progress/3d_progress.md
python tools/collect_3d_progress.py --report
```

详见：`tools/collect_3d_progress.py`。

---

## 7. 风格参考（2D 精灵图视觉参考）

每个 3D 资产都有对应的 **2D 精灵图**作为视觉参考，路径在 `art_3d_manifest.json` 的 `source_2d` 字段中。这些文件位于 `E:/game/回到地面/assets/resources/textures/` 下。请先查看 2D 参考图以了解：
- 角色比例 / 配色
- 怪物造型 / 区域元素
- Boss 体型 / 剪影
- 特效粒子视觉风格
- 地面纹理 / 色调

**6 区域主色调**（影响怪物/Boss/地块的配色方向）：

| 区域 | 主色调 | 元素 |
|------|-------|------|
| Forest | 暖绿 | 苔藓、落叶、白花、古树 |
| Catacombs | 灰绿 | 风化灰岩、残破石柱、苔碑 |
| Volcano | 橙黑 | 黑曜岩、熔岩纹、橙光 |
| Tundra | 蓝白 | 冰霜、雪坡、蓝白冰棱 |
| Swamp | 墨绿 | 淤泥、绿潭、荧光菇、盘根 |
| Abyss | 紫黑 | 紫黑符文、黑曜晶簇、星光 |

**5 英雄识别色**：

| 英雄 | 动物 | 主色 | 武器 |
|------|------|------|------|
| Archer | 鹿 | 棕金 | 弓 |
| Warrior | 狮 | 红 | 剑盾 |
| Mage | 兔/羊 | 蓝紫 | 法杖 |
| Assassin | 猫 | 暗紫 | 双匕 |
| Berserker | 熊 | 橙 | 巨斧 |

---

## 8. 全量资产清单（176 项，含 42 地牢功能道具，按优先级排序）

> 优先级：P1（角色）→ P2（地块+雕像怪）→ P3（Boss+剩余怪+特效）
> 生命周期均为"选秀"。

### 8.1 P1 — 角色 Characters（5 项）

| 3D 命名 | 动物 | 2D 参考路径 | 3 个预算档 |
|---------|------|-----------|-----------|
| `CHR_Archer_A.glb` | 鹿 | `characters/archer/archer_*.png`（7 帧） | 2000-3000 Tri, ≤30骨, 512² |
| `CHR_Assassin_A.glb` | 猫 | `characters/assassin/assassin_*.png`（7 帧） | 同上 |
| `CHR_Berserker_A.glb` | 熊 | `characters/berserker/berserker_*.png`（7 帧） | 同上 |
| `CHR_Mage_A.glb` | 兔/羊 | `characters/mage/mage_*.png`（7 帧） | 同上 |
| `CHR_Warrior_A.glb` | 狮 | `characters/warrior/warrior_*.png`（7 帧） | 同上 |

### 8.2 P2 — 地块 Tiles（24 项）

| 3D 命名 | 区域 | 模块 | 2D 参考 |
|---------|------|------|---------|
| `TILE_Forest_Floor.glb` | forest | Floor | `tiles/forest/tile_forest_floor.png` |
| `TILE_Forest_Wall.glb` | forest | Wall | `tiles/forest/tile_forest_wall.png` |
| `TILE_Forest_HighGround.glb` | forest | HighGround | `tiles/forest/tile_forest_highground.png` |
| `TILE_Forest_Thorn.glb` | forest | Thorn | `tiles/forest/tile_forest_thorn.png` |
| `TILE_Catacombs_Floor.glb` | catacombs | Floor | `tiles/catacombs/tile_catacombs_floor.png` |
| `TILE_Catacombs_Wall.glb` | catacombs | Wall | `tiles/catacombs/tile_catacombs_wall.png` |
| `TILE_Catacombs_HighGround.glb` | catacombs | HighGround | `tiles/catacombs/tile_catacombs_highground.png` |
| `TILE_Catacombs_Thorn.glb` | catacombs | Thorn | `tiles/catacombs/tile_catacombs_thorn.png` |
| `TILE_Volcano_Floor.glb` | volcano | Floor | `tiles/volcano/tile_volcano_floor.png` |
| `TILE_Volcano_Wall.glb` | volcano | Wall | `tiles/volcano/tile_volcano_wall.png` |
| `TILE_Volcano_HighGround.glb` | volcano | HighGround | `tiles/volcano/tile_volcano_highground.png` |
| `TILE_Volcano_Thorn.glb` | volcano | Thorn | `tiles/volcano/tile_volcano_thorn.png` |
| `TILE_Tundra_Floor.glb` | tundra | Floor | `tiles/tundra/tile_tundra_floor.png` |
| `TILE_Tundra_Wall.glb` | tundra | Wall | `tiles/tundra/tile_tundra_wall.png` |
| `TILE_Tundra_HighGround.glb` | tundra | HighGround | `tiles/tundra/tile_tundra_highground.png` |
| `TILE_Tundra_Thorn.glb` | tundra | Thorn | `tiles/tundra/tile_tundra_thorn.png` |
| `TILE_Swamp_Floor.glb` | swamp | Floor | `tiles/swamp/tile_swamp_floor.png` |
| `TILE_Swamp_Wall.glb` | swamp | Wall | `tiles/swamp/tile_swamp_wall.png` |
| `TILE_Swamp_HighGround.glb` | swamp | HighGround | `tiles/swamp/tile_swamp_highground.png` |
| `TILE_Swamp_Thorn.glb` | swamp | Thorn | `tiles/swamp/tile_swamp_thorn.png` |
| `TILE_Abyss_Floor.glb` | abyss | Floor | `tiles/abyss/tile_abyss_floor.png` |
| `TILE_Abyss_Wall.glb` | abyss | Wall | `tiles/abyss/tile_abyss_wall.png` |
| `TILE_Abyss_HighGround.glb` | abyss | HighGround | `tiles/abyss/tile_abyss_highground.png` |
| `TILE_Abyss_Thorn.glb` | abyss | Thorn | `tiles/abyss/tile_abyss_thorn.png` |

### 8.3 P2 — 怪物 Monsters（36 项）

**Forest（6 个）**:

| 3D 命名 | 2D 参考 | 预算档 |
|---------|---------|-------|
| `MON_Forest_Boar.glb` | `monsters/forest/monster_forest_boar_idle.png` | 1000-2500 Tri, ≤30骨, 512² |
| `MON_Forest_Deerelite.glb` | `monsters/forest/monster_forest_deerelite_idle.png` | 同上 |
| `MON_Forest_Elfarcher.glb` | `monsters/forest/monster_forest_elfarcher_idle.png` | 同上 |
| `MON_Forest_Mushroom.glb` | `monsters/forest/monster_forest_mushroom_idle.png` | 同上 |
| `MON_Forest_Slime.glb` | `monsters/forest/monster_forest_slime_idle.png` | 同上 |
| `MON_Forest_Treant.glb` | `monsters/forest/monster_forest_treant_idle.png` | 同上 |

**Catacombs（6 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `MON_Catacombs_Batswarm.glb` | `monsters/catacombs/monster_catacombs_batswarm_idle.png` |
| `MON_Catacombs_Deathknight.glb` | `monsters/catacombs/monster_catacombs_deathknight_idle.png` |
| `MON_Catacombs_Ghost.glb` | `monsters/catacombs/monster_catacombs_ghost_idle.png` |
| `MON_Catacombs_Ghoul.glb` | `monsters/catacombs/monster_catacombs_ghoul_idle.png` |
| `MON_Catacombs_Skeleton.glb` | `monsters/catacombs/monster_catacombs_skeleton_idle.png` |
| `MON_Catacombs_Skeletonarcher.glb` | `monsters/catacombs/monster_catacombs_skeletonarcher_idle.png` |

**Volcano（6 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `MON_Volcano_Ashwraith.glb` | `monsters/volcano/monster_volcano_ashwraith_idle.png` |
| `MON_Volcano_Demon.glb` | `monsters/volcano/monster_volcano_demon_idle.png` |
| `MON_Volcano_Fireelemental.glb` | `monsters/volcano/monster_volcano_fireelemental_idle.png` |
| `MON_Volcano_Infernoelite.glb` | `monsters/volcano/monster_volcano_infernoelite_idle.png` |
| `MON_Volcano_Lavaspider.glb` | `monsters/volcano/monster_volcano_lavaspider_idle.png` |
| `MON_Volcano_Suicidegolem.glb` | `monsters/volcano/monster_volcano_suicidegolem_idle.png` |

**Tundra（6 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `MON_Tundra_Frostgiant.glb` | `monsters/tundra/monster_tundra_frostgiant_idle.png` |
| `MON_Tundra_Frostmage.glb` | `monsters/tundra/monster_tundra_frostmage_idle.png` |
| `MON_Tundra_Iceskeleton.glb` | `monsters/tundra/monster_tundra_iceskeleton_idle.png` |
| `MON_Tundra_Penguinsoldier.glb` | `monsters/tundra/monster_tundra_penguinsoldier_idle.png` |
| `MON_Tundra_Snowman.glb` | `monsters/tundra/monster_tundra_snowman_idle.png` |
| `MON_Tundra_Snowwolf.glb` | `monsters/tundra/monster_tundra_snowwolf_idle.png` |

**Swamp（6 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `MON_Swamp_Gianttoad.glb` | `monsters/swamp/monster_swamp_gianttoad_idle.png` |
| `MON_Swamp_Rottreant.glb` | `monsters/swamp/monster_swamp_rottreant_idle.png` |
| `MON_Swamp_Slimepoison.glb` | `monsters/swamp/monster_swamp_slimepoison_idle.png` |
| `MON_Swamp_Swampdragon.glb` | `monsters/swamp/monster_swamp_swampdragon_idle.png` |
| `MON_Swamp_Swampspider.glb` | `monsters/swamp/monster_swamp_swampspider_idle.png` |
| `MON_Swamp_Viper.glb` | `monsters/swamp/monster_swamp_viper_idle.png` |

**Abyss（6 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `MON_Abyss_Abyssarcher.glb` | `monsters/abyss/monster_abyss_abyssarcher_idle.png` |
| `MON_Abyss_Abysslordelite.glb` | `monsters/abyss/monster_abyss_abysslordelite_idle.png` |
| `MON_Abyss_Shadowdemon.glb` | `monsters/abyss/monster_abyss_shadowdemon_idle.png` |
| `MON_Abyss_Shadowgolem.glb` | `monsters/abyss/monster_abyss_shadowgolem_idle.png` |
| `MON_Abyss_Voidrift.glb` | `monsters/abyss/monster_abyss_voidrift_idle.png` |
| `MON_Abyss_Voidwraith.glb` | `monsters/abyss/monster_abyss_voidwraith_idle.png` |

### 8.4 P3 — 终 Boss（12 项）

| 3D 命名 | 区域 | 2D 参考 | 预算 |
|---------|------|---------|------|
| `BOSS_Final_01.glb` | abyss | `bosses/finalboss/abyss/boss_abyssoverlord_*.png`（含普攻/死亡/待机/转阶段/技能×5） | 5000-9000 Tri, ≤80骨, 1024² |
| `BOSS_Final_02.glb` | swamp | `bosses/finalboss/boss_beast_swamp_*.png` | 同上 |
| `BOSS_Final_03.glb` | volcano | `bosses/finalboss/boss_firelord_*.png` | 同上 |
| `BOSS_Final_04.glb` | forest | `bosses/finalboss/boss_forestguardian_*.png` | 同上 |
| `BOSS_Final_05.glb` | tundra | `bosses/finalboss/boss_frostqueen_*.png` | 同上 |
| `BOSS_Final_06.glb` | forest | `bosses/finalboss/boss_guardian_forest_*.png` | 同上 |
| `BOSS_Final_07.glb` | abyss | `bosses/finalboss/boss_lord_abyss_*.png` | 同上 |
| `BOSS_Final_08.glb` | catacombs | `bosses/finalboss/boss_lord_catacombs_*.png` | 同上 |
| `BOSS_Final_09.glb` | volcano | `bosses/finalboss/boss_lord_volcano_*.png` | 同上 |
| `BOSS_Final_10.glb` | tundra | `bosses/finalboss/boss_queen_tundra_*.png` | 同上 |
| `BOSS_Final_11.glb` | catacombs | `bosses/finalboss/boss_skeletonlord_*.png` | 同上 |
| `BOSS_Final_12.glb` | swamp | `bosses/finalboss/boss_swampbehemoth_*.png` | 同上 |

### 8.5 P3 — 小 Boss（30 项）

**Abyss（5 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `BOSS_Mini_01.glb` | `bosses/miniboss/abyss/miniboss_abysssentinel_idle.png` |
| `BOSS_Mini_02.glb` | `bosses/miniboss/abyss/miniboss_nightmareknight_idle.png` |
| `BOSS_Mini_03.glb` | `bosses/miniboss/abyss/miniboss_shadowdragon_idle.png` |
| `BOSS_Mini_04.glb` | `bosses/miniboss/abyss/miniboss_voidhunter_idle.png` |
| `BOSS_Mini_05.glb` | `bosses/miniboss/abyss/miniboss_voidlord_idle.png` |

**Catacombs（5 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `BOSS_Mini_06.glb` | `bosses/miniboss/catacombs/miniboss_blackknight_idle.png` |
| `BOSS_Mini_07.glb` | `bosses/miniboss/catacombs/miniboss_gargoyle_idle.png` |
| `BOSS_Mini_08.glb` | `bosses/miniboss/catacombs/miniboss_giantskeleton_idle.png` |
| `BOSS_Mini_09.glb` | `bosses/miniboss/catacombs/miniboss_lich_idle.png` |
| `BOSS_Mini_10.glb` | `bosses/miniboss/catacombs/miniboss_warden_catacombs_idle.png` |

**Forest（5 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `BOSS_Mini_11.glb` | `bosses/miniboss/forest/miniboss_boarchief_idle.png` |
| `BOSS_Mini_12.glb` | `bosses/miniboss/forest/miniboss_poisonflower_idle.png` |
| `BOSS_Mini_13.glb` | `bosses/miniboss/forest/miniboss_porcupineking_idle.png` |
| `BOSS_Mini_14.glb` | `bosses/miniboss/forest/miniboss_stagbeetle_idle.png` |
| `BOSS_Mini_15.glb` | `bosses/miniboss/forest/miniboss_warden_forest_idle.png` |

**Swamp（5 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `BOSS_Mini_16.glb` | `bosses/miniboss/swamp/miniboss_poisonscorpion_idle.png` |
| `BOSS_Mini_17.glb` | `bosses/miniboss/swamp/miniboss_rottreantelite_idle.png` |
| `BOSS_Mini_18.glb` | `bosses/miniboss/swamp/miniboss_serpentqueen_idle.png` |
| `BOSS_Mini_19.glb` | `bosses/miniboss/swamp/miniboss_swampcrocodile_idle.png` |
| `BOSS_Mini_20.glb` | `bosses/miniboss/swamp/miniboss_swampfrog_idle.png` |

**Tundra（5 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `BOSS_Mini_21.glb` | `bosses/miniboss/tundra/miniboss_frostelemental_idle.png` |
| `BOSS_Mini_22.glb` | `bosses/miniboss/tundra/miniboss_icegiant_idle.png` |
| `BOSS_Mini_23.glb` | `bosses/miniboss/tundra/miniboss_icescorpion_idle.png` |
| `BOSS_Mini_24.glb` | `bosses/miniboss/tundra/miniboss_polarbearking_idle.png` |
| `BOSS_Mini_25.glb` | `bosses/miniboss/tundra/miniboss_snowape_idle.png` |

**Volcano（5 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `BOSS_Mini_26.glb` | `bosses/miniboss/volcano/miniboss_firegolem_idle.png` |
| `BOSS_Mini_27.glb` | `bosses/miniboss/volcano/miniboss_inferno_idle.png` |
| `BOSS_Mini_28.glb` | `bosses/miniboss/volcano/miniboss_lavaworm_idle.png` |
| `BOSS_Mini_29.glb` | `bosses/miniboss/volcano/miniboss_volcanogiant_idle.png` |
| `BOSS_Mini_30.glb` | `bosses/miniboss/volcano/miniboss_warden_volcano_idle.png` |

### 8.6 P3 — 特效 Effects（27 项）

**战斗通用（6 个）**:

| 3D 命名 | 2D 参考 | 预算 |
|---------|---------|------|
| `FX_Crit.prefab` | `effects/combat/fx_crit.png` | ≤80粒子, ≤2DC, 256², ≤1.5s |
| `FX_Dash.prefab` | `effects/combat/fx_dash.png` | 同上 |
| `FX_Dodge.prefab` | `effects/combat/fx_dodge.png` | 同上 |
| `FX_Heal.prefab` | `effects/combat/fx_heal.png` | 同上 |
| `FX_HitNormal.prefab` | `effects/combat/fx_hit_normal.png` | 同上 |
| `FX_Shield.prefab` | `effects/combat/fx_shield.png` | 同上 |

**元素反应（11 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `FX_ReactionBurn.prefab` | `effects/reactions/fx_reaction_burn.png` |
| `FX_ReactionConduct.prefab` | `effects/reactions/fx_reaction_conduct.png` |
| `FX_ReactionCorrode.prefab` | `effects/reactions/fx_reaction_corrode.png` |
| `FX_ReactionDecay.prefab` | `effects/reactions/fx_reaction_decay.png` |
| `FX_ReactionFreeze.prefab` | `effects/reactions/fx_reaction_freeze.png` |
| `FX_ReactionMelt.prefab` | `effects/reactions/fx_reaction_melt.png` |
| `FX_ReactionOverload.prefab` | `effects/reactions/fx_reaction_overload.png` |
| `FX_ReactionRadiance.prefab` | `effects/reactions/fx_reaction_radiance.png` |
| `FX_ReactionShatter.prefab` | `effects/reactions/fx_reaction_shatter.png` |
| `FX_ReactionVaporize.prefab` | `effects/reactions/fx_reaction_vaporize.png` |
| `FX_ReactionVoid.prefab` | `effects/reactions/fx_reaction_void.png` |

**遗物特效（8 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `FX_RelicBlinkStone.prefab` | `effects/relics/fx_relic_blink_stone.png` |
| `FX_RelicDecoyScroll.prefab` | `effects/relics/fx_relic_decoy_scroll.png` |
| `FX_RelicFlameRing.prefab` | `effects/relics/fx_relic_flame_ring.png` |
| `FX_RelicFrostAmulet.prefab` | `effects/relics/fx_relic_frost_amulet.png` |
| `FX_RelicGravityStone.prefab` | `effects/relics/fx_relic_gravity_stone.png` |
| `FX_RelicLifeLink.prefab` | `effects/relics/fx_relic_life_link.png` |
| `FX_RelicShadowDagger.prefab` | `effects/relics/fx_relic_shadow_dagger.png` |
| `FX_RelicTimeHourglass.prefab` | `effects/relics/fx_relic_time_hourglass.png` |

**UI 特效（2 个）**:

| 3D 命名 | 2D 参考 |
|---------|---------|
| `FX_UiGlow.prefab` | `effects/ui/fx_ui_glow.png` |
| `FX_UiLoading.prefab` | `effects/ui/fx_ui_loading.png` |

### 8.7 P4 — 地牢功能道具 Dungeon Props（42 项）

> 地牢 DAG 房间（入口/战斗/宝箱/回复/商店/事件/强化/Boss）除地板墙（`TILE_`）外，还需功能道具构成可辨识房间。地形码 3（治疗）/5（暗区）也由 `HealAltar` / 暗区体积（见下）表达。

**7 功能件 × 6 区域 = 42 件**，命名 `DNG_{Region}_{Func}.glb`：

| 功能件 | 含义 | 地形/房间 |
|--------|------|-----------|
| `DNG_{R}_Entry` | 入口门/传送门 | 入口房 |
| `DNG_{R}_Chest` | 宝箱 | 宝箱房 |
| `DNG_{R}_HealAltar` | 治疗祭坛 | 回复房（地形码3） |
| `DNG_{R}_Shop` | 商店柜台 | 商店房 |
| `DNG_{R}_Event` | 事件标记石/符文 | 事件房 |
| `DNG_{R}_BuffShrine` | 强化神龛 | 强化房 |
| `DNG_{R}_BossGate` | Boss 闸门/传送门 | Boss 房 |

`{R}` ∈ Forest / Catacombs / Volcano / Tundra / Swamp / Abyss。战斗房由 `MON_*` 怪物本身定义，无独立道具；Boss 房由 `BOSS_*` + `BossGate` 道具共同定义。

**6 区域 × 7 件清单**：

| 区域 | 7 件命名 |
|------|--------|
| Forest | `DNG_Forest_Entry` `DNG_Forest_Chest` `DNG_Forest_HealAltar` `DNG_Forest_Shop` `DNG_Forest_Event` `DNG_Forest_BuffShrine` `DNG_Forest_BossGate` |
| Catacombs | `DNG_Catacombs_Entry` `DNG_Catacombs_Chest` `DNG_Catacombs_HealAltar` `DNG_Catacombs_Shop` `DNG_Catacombs_Event` `DNG_Catacombs_BuffShrine` `DNG_Catacombs_BossGate` |
| Volcano | `DNG_Volcano_Entry` `DNG_Volcano_Chest` `DNG_Volcano_HealAltar` `DNG_Volcano_Shop` `DNG_Volcano_Event` `DNG_Volcano_BuffShrine` `DNG_Volcano_BossGate` |
| Tundra | `DNG_Tundra_Entry` `DNG_Tundra_Chest` `DNG_Tundra_HealAltar` `DNG_Tundra_Shop` `DNG_Tundra_Event` `DNG_Tundra_BuffShrine` `DNG_Tundra_BossGate` |
| Swamp | `DNG_Swamp_Entry` `DNG_Swamp_Chest` `DNG_Swamp_HealAltar` `DNG_Swamp_Shop` `DNG_Swamp_Event` `DNG_Swamp_BuffShrine` `DNG_Swamp_BossGate` |
| Abyss | `DNG_Abyss_Entry` `DNG_Abyss_Chest` `DNG_Abyss_HealAltar` `DNG_Abyss_Shop` `DNG_Abyss_Event` `DNG_Abyss_BuffShrine` `DNG_Abyss_BossGate` |

> 完整 42 项已写入 `art_3d_manifest.json`（category=`dungeon`）。`source_2d` 暂为空——需补 2D 概念稿后再 3D 生产（或见 §2.8 的几何化例外）。

---

## 9. 资产优先级排序

### Must-Have（第一期，21 项）

P1 — 核心游戏闭环所需的资产，缺少则无法完成一个完整房间的战斗体验：

| 优先级 | 项数 | 资产 | 原因 |
|--------|------|------|------|
| **P1a** | 5 | **5 英雄角色** `CHR_*` | 主角，所有战斗依赖 |
| **P1b** | 4 | **Forest 地块** `TILE_Forest_*` | 初始区域，必须最先可用 |
| **P1c** | 6 | **Forest 怪物** `MON_Forest_*` | 初始区域怪物 |
| **P1d** | 1 | **Forest 小 Boss** `BOSS_Mini_14` (Stagbeetle) | 初始区域守关 |
| **P1e** | 1 | **Forest 终 Boss** `BOSS_Final_04` (ForestGuardian) | 初始区域最终挑战 |
| **P1f** | 3 | **基础战斗特效** `FX_HitNormal`, `FX_Crit`, `FX_Dodge` | 战斗反馈基石 |
| **P1g** | 1 | **恢复特效** `FX_Heal` | 生存保障 |

> P1 合计 21 项。完整后可体验：Forest 区域中控制任意角色与 Forest 怪物战斗、击败小 Boss 和终 Boss。

### Should-Have（第二期，53 项）

P2 — 扩展区域覆盖 + 核心系统完整：

| 优先级 | 项数 | 资产 |
|--------|------|------|
| **P2a** | 20 | **剩余 5 区域地块**（Catacombs/Volcano/Tundra/Swamp/Abyss ×4 模块） |
| **P2b** | 5 | **Catacombs 怪物** |
| **P2c** | 6 | **Volcano 怪物** |
| **P2d** | 6 | **Tundra 怪物** |
| **P2e** | 6 | **Swamp 怪物** |
| **P2f** | 6 | **Abyss 怪物** |
| **P2g** | 4 | **剩余战斗特效**（Dash/Shield/React-Burn/React-Freeze） |

> P2 合计 53 项。完成后 6 区域全部可用，怪物阵容完整。

### Nice-to-Have（第三期，60 项）

P3 — Boss 阵容 + 进阶特效：

| 优先级 | 项数 | 资产 |
|--------|------|------|
| **P3a** | 29 | **剩余小 Boss**（30 - 1 P1 Forest 小 Boss） |
| **P3b** | 11 | **剩余终 Boss**（12 - 1 P1 Forest 终 Boss） |
| **P3c** | 8 | **剩余元素反应特效**（Conduct/Corrode/Decay/Melt/Overload/Radiance/Shatter/Vaporize/Void 等） |
| **P3d** | 12 | **遗物特效 + UI 特效** |

> P3 合计 60 项。

### Deferred（第四期，42 项）— 地牢功能道具

P4 — 地牢 DAG 房间的功能性视觉补全：

| 优先级 | 项数 | 资产 |
|--------|------|------|
| **P4** | 42 | **地牢功能道具**（`DNG_*`，6 区域 × 7 功能件：Entry/Chest/HealAltar/Shop/Event/BuffShrine/BossGate） |

> P4 为**地牢房间功能道具**，补全 DAG 房间的可辨识视觉（宝箱房有 `Chest`、回复房有 `HealAltar` 等）。当前 `source_2d` 为空（无 2D 概念稿），需先补 2D 概念稿或按 §2.8 几何化例外生产。建议在所有战斗资产（P1–P3）完成后，随地牢系统实装一并推进。

### 汇总

| 批次 | 优先级 | 项数 | 累计 |
|------|--------|------|------|
| 第一期 | Must-Have (P1) | 21 | 21 |
| 第二期 | Should-Have (P2) | 53 | 74 |
| 第三期 | Nice-to-Have (P3) | 60 | 134 |
| 第四期 | Deferred (P4) | 42 | 176 |

> **建议生产顺序**：先 P1 打通 Forest 区域闭环 → 再 P2 扩展到 6 区域 → 最后 P3 补 Boss 阵容。

---

## 10. AI 生产执行规范

> ⚠️ 本章为 AI Agent 执行 3D 建模的**强制流程与约束**。违反本章任一规则，产出将被拒收。

### 10.1 AI 执行流程（15 步，必须严格遵守）

每个资产严格按照以下流程执行，**不得跳过步骤、不得改变顺序**：

```
Step 1  读取 art_3d_manifest.json，获得 source_2d 路径
  ↓
Step 2  读取对应的 2D 参考图（idle 帧为基准，攻击帧确认动作范围）
  ↓
Step 3  分析 2D 图并输出 Analysis 报告（见 §10.2）
  ↓
Step 4  建立 Base Mesh（先粗模确定比例和轮廓）
  ↓
Step 5  雕刻细节（保持轮廓，不允许脑补）
  ↓
Step 6  Retopo（以 Quad 为主，禁止 N-gon）
  ↓
Step 7  UV 展开（贴图密度均匀）
  ↓
Step 8  贴图绘制（Albedo + Normal，纯卡通风格）
  ↓
Step 9  Rig（骨骼绑定，按 §3.2 动画要求创建动作集）
  ↓
Step 10 动画（禁止 Root Motion，见 §10.7.4）
  ↓
Step 11 LOD（按 §2 对应类别的 LOD 参数生成）
  ↓
Step 12 导出 GLB（按 §3 导出规范）
  ↓
Step 13 生成 .assetmeta.json（按 §4 模板）
  ↓
Step 14 执行 asset_validate.py —— 必须 PASS
  ↓
Step 15 输出 AI 格式报告（见 §10.8）
  ↓
Step 16 进入人工审核队列 —— Cocos 导入生成 Prefab（🔴 人工）+ 视觉审核（🔴 人工）
  ↓
Step 17 审核通过后填写 .assetmeta.json 的 reviewer 字段 → import → validate:all

**停止条件（★ 强制 ★）**：
- 一个资产未达到 Validation PASS 前，**禁止开始制作下一资产**
- **禁止并行制作多个资产**
- 必须：当前资产 → Validation PASS → 进入下一资产
- 只有 Step 15 输出 `Validation: PASS` 后，才允许开始下一个资产
- 此规则避免 AI 一次生成几十个半成品
```

### 10.2 AI 必须先分析 2D（Step 3 强制输出）

在开始任何建模操作之前，**必须先输出 Analysis 报告**。格式如下：

```yaml
Asset: CHR_Archer_A
Analysis:
  Animal: 鹿 (Deer)
  Class: Archer (远程)
  Colors: [棕色, 金色, 绿色]
  Weapon: 弓 (Bow)
  BodyRatio: 头大身小, Q版 2.5头身
  Silhouette: 鹿角大且分叉, 弓在左侧, 站立姿态
  KeyFeatures: [大鹿角(识别度最高), 长弓, 绿色披肩, 金边装饰]
  Animation: [idle(待机), walk(行走), attack(拉弓射箭), hurt(受击), death(倒地)]
  Style: 类二次元卡通渲染, 高饱和, 粗描边
```

**必须逐项填写**。不得跳过。

分析完成后，**对照 2D 图逐条确认**：
- 主轮廓是否一致？
- 动物种类是否正确？
- 颜色是否匹配？
- 武器/装饰是否一一对应？

### 10.3 禁止脑补

**AI 不得新增任何原 2D 图中不存在的内容**。包括但不限于：

| 类别 | 禁止项 |
|------|--------|
| 装饰 | 披风、翅膀、尾巴（2D 有才能加） |
| 武器 | 2D 持弓就不改剑，2D 无盾就不加盾 |
| 配件 | 头盔、肩甲、腰带、挂件（2D 有才加） |
| 发光器官 | 2D 无光效就不加自发光 |
| 盔甲/花纹 | 保持 2D 设计，不增加额外刻线/纹路 |

**唯一例外**：当 2D 参考图无法表达三维结构时（例如背面、侧面没有绘制），允许**最小补全**。

**补全原则**：
1. 保持原设计语言（同样的曲率、厚度、材质感）
2. 补全部分**必须标注**在 Analysis 的 `Note` 字段中
3. 补全后不影响主轮廓识别

### 10.4 禁止自由设计

AI 的职责是**将 2D 转换为 3D，不是重新创作**。

**严禁**：
- ❌ 重新设计造型 / 改武器 / 改脸型
- ❌ 重新配色（色板仅从 2D 图中提取）
- ❌ 重新换武器（2D 拿弓 → 3D 也必须拿弓）
- ❌ 自行添加花纹/刻线/装饰
- ❌ 改变身体比例（Q 版 2.5 头身就是 2.5 头身）

**允许**：
- ✅ 三维结构必要的补全（见 §10.3 例外条款）
- ✅ 背面/侧面/内部结构的最小推断
- ✅ 法线贴图增强立体感（不改变轮廓）

### 10.5 必须保持轮廓

**主轮廓（Silhouette）是资产识别度的第一优先**。

#### 优先级（从高到低）

```
轮廓 (Silhouette) ＞ 比例 (Proportion) ＞ 颜色 (Color) ＞ 细节 (Detail)
```

#### 具体要求

- 角色的**标志性轮廓特征必须保留**（如 Archer 的大鹿角、Warrior 的狮鬃+剑盾、Mage 的法杖+兔耳）
- 任何情况下，**轮廓识别率必须接近 2D 参考图**
- 怪物/Boss 的**剪影必须可识别**（同一区域内不同怪物从剪影上就能区分）
- 建模过程中**每完成一个阶段（Base Mesh / 雕刻 / 贴图）都要对照 2D 检查轮廓**

#### 典型错误

| ❌ 错误 | ✅ 正确 |
|---------|--------|
| 鹿角缩小了 | 保持 2D 鹿角的大小和分叉形状 |
| 狮鬃做薄了 | 保持 2D 狮鬃的蓬松轮廓 |
| Boss 肩甲简化 | 保持 2D 肩甲的夸张造型 |
| 弓缩短了 | 保持弓与 2D 一致的长度和弧度 |

### 10.6 建模细节要求

#### 角色 Mesh 拆分

角色模型**必须按以下部件拆分**（每个部件为独立 Mesh／独立材质 ID／独立骨骼控制），与项目的 2D 部件化方案对齐（权威来源：`docs/角色部件化母版标准姿势规范.md` + `docs/角色部件化母版切割与精确拼装方案.md`；旧 `角色.txt` 的 arm_r+bow 拆分已废弃）：

```
Body（躯干）
  ├── 身体主体，绑定 Spine 骨骼
Head（头部）
  ├── 头部独立 Mesh（含面部），可与身体不同材质
  ├── 眼睛必须为独立几何或独立材质（用于眨眼/高光调节）
  └── 牙齿/舌头/嘴巴：2D 图中有则建，2D 闭口/无齿可省略
Ear_L / Ear_R（耳朵/角）
  ├── 鹿角/兔耳/猫耳等，独立 Mesh，可轻微摆动
  └── 对称部件，命名统一加 _L / _R 后缀
Arm_L / Arm_R（手臂）
  ├── 含上臂+前臂+手，由独立骨骼控制摆动
  └── 对称部件，命名加 _L / _R
Leg_L / Leg_R（腿部）
  ├── 含大腿+小腿+脚，独立骨骼控制行走摆动
  └── 对称部件，命名加 _L / _R
Tail（尾巴）— 若有
  ├── 独立 Mesh，轻度摆动或旋转
Weapon（武器）
  ├── 独立 Mesh，Socket 挂载（RightHand 或对应位置）
  └── 按角色实际武器类型命名（如 Bow / Sword / Staff / Dagger / Axe）
Accessory（装饰物）— 复数可拆
  ├── 披风、箭袋、挂件、腰带等
  └── 每件装饰为独立 Mesh，可单独隐藏/替换
```

**命名规则**：所有部件 Mesh 名使用 PascalCase + 角色前缀，例如 `CHR_Archer_Body`、`CHR_Archer_Head`、`CHR_Archer_Ear_L`。

> **2D / 3D 部件名一致性**：2D 侧部件名用 snake_case（`ear_l`/`ear_r`/`arm_l`/`arm_r_weapon`/`shield_arm_l`/`sword_arm_r`/`dagger_arm_l`/`dagger_arm_r`/`staff_arm_r`/`axe_arm_r`/`quiver`/`cape`/`scarf`/`hat`/`helmet`/`shoulder_guard`/`belt`/`robe_front`/`tail`/`leg_l`/`leg_r`/`body`/`head`），3D Mesh 名用 PascalCase 并对称件加 `_L`/`_R` 后缀（`Ear_L`/`Ear_R`/`Arm_L`/`Arm_R`/`Leg_L`/`Leg_R`）。映射示例：`ear_l`→`Ear_L`，`arm_r_weapon`→`Arm_R_Weapon`（或 `Sword_Arm_R`），`shield_arm_l`→`Shield_Arm_L`。武器 Mesh 按实际类型命名（`Bow`/`Sword`/`Staff`/`Dagger`/`Axe`），挂在右手 Socket。

**标准部件集速查**：

| # | 部件 | 类型 | 必/可选 | 对应 2D 部件名（§4.3） |
|---|------|------|---------|------------|
| 1 | Body | 独立 Mesh | **必须** | body |
| 2 | Head | 独立 Mesh | **必须** | head |
| 3 | Eyes | 独立几何/材质 | **必须** | （在 head 内） |
| 4 | Ear_L / Ear_R | 独立 Mesh | 可选 | ear_l / ear_r |
| 5 | Arm_L / Arm_R | 独立 Mesh+骨骼 | **必须** | arm_l / arm_r |
| 6 | Leg_L / Leg_R | 独立 Mesh+骨骼 | **必须** | leg_l / leg_r |
| 7 | Tail | 独立 Mesh | 可选 | tail |
| 8 | Weapon | 独立 Mesh+Socket | **必须** | bow/quiver 等 |
| 9 | Accessory_* | 独立 Mesh | 可选 | cape, quiver 等 |

5 个英雄的标准 Accessory：
- Archer: Cape（披风），Quiver（箭袋）
- Warrior: Shield（盾）
- Mage: Cape（披风）
- Assassin: Cape（披风）
- Berserker: 无标准装饰（可选腰带/挂件）

#### 怪物/Boss

- 同样遵循部件拆分原则
- 终 Boss 需按 Socket 规定集预留挂点（见 §2.2）

### 10.7 Blender 建模完整流程

本节描述从参考图到最终 .glb 的 **Blender 手工建模全流程**。AI 应理解每个步骤的目的和约束，但不需要逐行指导——具体 Blender 操作由 AI 自身能力完成。

#### 阶段一：参考设置

| 步骤 | 操作 | 约束 |
|------|------|------|
| 1 | 创建新 Blender 工程，保存为 `{AssetName}.blend` | 与最终 .glb 同名 |
| 2 | 导入 2D 参考图（idle 帧）作为背景图（Background Image）：正面和侧面各一张 | 保持原始比例，对齐到 (0,0,0) |
| 3 | 导入 2D 攻击帧作为辅助参考（确认动作范围、武器长度） | 仅用于确认轮廓范围，不用于建模 |
| 4 | 设置单位：米（Metric），1 unit = 1 meter | `Scene Properties → Units → Unit Scale: 1.0` |
| 5 | 设置 Y-up，面朝 +Z | 与 §3 导出规范一致 |

#### 阶段二：建模（Base Mesh → Sculpt → Retopo）

| 步骤 | 操作 | 关键约束 |
|------|------|---------|
| 6 | **Base Mesh**：从基础几何体（Cube/Cylinder/Sphere）开始，用 Extrude/Loop Cut 快速搭建主体比例 | ⚠️ 时刻对照 2D 参考检查轮廓（§10.5） |
| 7 | **比例确认**：与 2D 参考图叠图检查——头身比、肩宽、臂长、腿长 | 轮廓识别率必须接近 2D |
| 8 | **雕刻（Sculpt）**：用 Dyntopo 或多级精度雕刻细节 | 注意面数预算，不要在雕刻阶段超限 |
| 9 | **Retopo**：在雕刻模型上重新拓扑，以 **Quad（四边面）为主** | ❌ 禁止 N-gon，❌ 禁止细长三角面 |
| 10 | **镜像**：角色/怪物对称部分使用 Mirror Modifier，只在完成对称后 Apply | 不对称细节（武器/装饰）单独建模 |

#### 阶段三：UV + 贴图

| 步骤 | 操作 | 关键约束 |
|------|------|---------|
| 11 | UV 展开：使用 Seams + Unwrap，密度均匀 | 面部/手部适当分配更多 UV 空间 |
| 12 | **Albedo 贴图绘制**：用 Texture Paint 在 UV 上绘制颜色 | 颜色从 2D 参考图取色，Hue≤5°偏差（§10.16） |
| 13 | **Normal 贴图烘焙**：从高模烘焙法线到低模，或手动绘制 | Normal 统一朝外，§10.7.2 |
| 14 | **贴图导出**：导出为 PNG（后续 Cocos 导入时转 ASTC） | Albedo + Normal 两张，分辨率见 §3.1 |

#### 阶段四：Rig（骨骼绑定）

| 步骤 | 操作 | 关键约束 |
|------|------|---------|
| 15 | **创建骨架（Armature）**：从根骨骼开始，按角色比例创建骨骼链 | 骨骼数 ≤ 预算（§2 各节） |
| 16 | **骨骼命名**：用清晰、一致的命名（如 `Root` / `Spine` / `Head` / `UpperArm_L` / `LowerArm_L`） | 不强制但推荐，便于 AI 识别和调试 |
| 17 | **创建 Socket 骨骼**：在 `RightHand`/`LeftHand`/`Head` 等位置创建空骨骼作为挂点 | Socket Forward=+Z, Up=+Y, Rot=Identity（§10.14） |
| 18 | **权重绘制（Weight Paint）**：自动权重 → 手动修正 | 关节处平滑过渡，避免"断裂"变形 |
| 19 | **绑定测试**：旋转各骨骼关节，检查变形是否自然 | 若有穿模/不自然，返回修权重或修拓扑 |

#### 阶段五：动画

| 步骤 | 操作 | 关键约束 |
|------|------|---------|
| 20 | **创建 Action**：按 §3.2 动画需求创建动作（idle/walk/attack/hurt/death…） | clip 数 ≥ 最小值 |
| 21 | **动画制作**：逐帧调整 Pose | **禁止 Root Motion**（§10.7.4） |
| 22 | **动画检查**：播放循环，检查穿模/滑步/不自然 | weapon socket 挂点对齐 |
| 23 | 如有需要，为**命中帧**添加 Pose Marker（命名如 `Hit`） | 后续在 Cocos 中绑定 AnimEvent |

#### 阶段六：LOD + 导出

| 步骤 | 操作 | 关键约束 |
|------|------|---------|
| 24 | **LOD 生成**：复制模型，用 Decimate Modifier 或手动减面 | 仅减面，❌ 不删除武器/头/尾巴（§10.15） |
| 25 | **LOD 检查**：从远距离查看 L2/L3 的轮廓 | 剪影仍可识别为原角色 |
| 26 | **导出 GLB**：`File → Export → glTF 2.0 (.glb)` | ✅ 勾选 `Selected Objects` ✅ `Include → Animations` ✅ `Transform → +Y Up` |
| 27 | **检查 GLB**：重新导入 GLB 确认 Mesh/骨骼/动画/贴图完整 | 无 Missing Material，无 Broken Bone |

#### 阶段七：提交

| 步骤 | 操作 | 关键约束 |
|------|------|---------|
| 28 | 在 `.assetmeta.json` 中填写实际 Tri/Bone/Animation 等数值 | 与 GLB 导出的实际数值一致 |
| 29 | 运行 `asset_validate.py` | 必须 PASS |
| 30 | 输出最终报告 + JSON（§10.8 / §10.18 / §10.20） | 逐项检查 §10.10 Checklist |
| 31 | **结束当前资产**，进入下一个 | 未 PASS 前禁止开始下一资产（§10.1） |

> Blender 工程文件（`.blend`）建议保留，在评审阶段可能需要微调。
> 
> 动画制作技巧：对角色使用 **Action Editor** 创建多个 Action，每个 Action 对应一个动画剪辑。GLB 导出时会自动将所有 Action 导出为独立动画 clip。

#### 10.7.1 Topology（拓扑）

| 要求 | 说明 |
|------|------|
| **以 Quad（四边面）为主** | 建模过程中应尽量使用四边形 |
| **允许三角面** | 仅在最终导出时由引擎自动三角化（GLB 导出时），**不在建模阶段刻意使用三角面** |
| **禁止 N-gon** | 任何超过 4 条边的面都是 N-gon，**严格禁止** |
| **禁止细长三角面** | 避免极窄、极长的三角形，保持面片均匀 |
| **循环边** | 关节处（肩/肘/膝/腕）应有足够的环线支撑形变动画 |
| **拓扑密度** | 面数预算见 §2，面部/手部适当加密，被遮挡部位可适当稀疏 |

#### 10.7.2 法线 (Normals)

| 要求 | 说明 |
|------|------|
| **统一朝外** | 所有法线必须指向外部，**禁止翻面（Inverted Normal）** |
| **Auto Smooth 角度** | 设置 Auto Smooth 角度为 **30°** |
| **硬边 (Hard Edge)** | 武器刃口、护甲边缘、硬表面转折处应标记为硬边 |
| **软边 (Soft Edge)** | 身体、脸部、有机曲面应保持软边 |
| **法线贴图** | 推荐使用法线贴图增强卡通立体感（见 §3.1） |

#### 10.7.3 Pivot（轴心）

| 类型 | 轴心位置 | 说明 |
|------|---------|------|
| **Character** | **脚底中心 (0,0,0)** | 角色站立的底面中心 |
| **Monster** | **脚底中心 (0,0,0)** | 同上 |
| **Boss** | **脚底中心 (0,0,0)** | 同上 |
| **Weapon** | **握柄中心** | 武器 Socket 挂点位置 |
| **Tile** | **模块中心 (0,0,0)** | 2m×2m 单元的几何中心 |
| **FX Prefab** | **世界原点 (0,0,0)** | Cocos 粒子系统世界坐标 |

#### 10.7.4 动画 Root Motion

| 要求 | 说明 |
|------|------|
| **禁止 Root Motion** | 所有动画中，Root（根骨骼）必须保持在 (0,0,0) |
| **移动由代码控制** | 行走/奔跑等位移由游戏代码控制，不在动画中位移 |
| **原地动画** | idle/walk/attack/hurt/death 全部在原点位置播放 |
| **例外** | 仅有死亡倒地的最后偏移、击飞等由代码触发的位移不在此限 |

#### 10.7.5 贴图风格

| 要求 | 说明 |
|------|------|
| **纯卡通 (Pure Toon)** | 大色块、少噪点、高饱和、对比鲜明 |
| **禁止照片纹理** | 不得使用真实照片素材作为贴图（污渍/划痕/真实金属/真实木纹/真实皮肤） |
| **渐变控制** | 使用 Cel Shading 式色阶过渡（2-3 阶），而非平滑渐变 |
| **描边** | **不需要手绘描边线**——描边由 Cocos Shader 或后处理实现 |
| **阴影** | 阴影由 Shader 级卡通光照实现，**不在贴图中预烘焙阴影** |
| **AO** | 不需要 AO 贴图（§3.1） |

### 10.8 AI 输出格式

每个资产完成后，**必须输出以下格式的报告**：

```yaml
Asset: CHR_Warrior_A
Category: characters
Result:
  Triangles: 2648
  Bones: 28
  TextureSize: 512
  AnimClips: [idle, walk, attack, hurt, death]
  LODs: 3
  Sockets: [RightHand, LeftHand, Head, Chest, Back, Foot, Weapon, SkillOrigin]
  ExportFormat: GLB
  AssetMeta: CHR_Warrior_A.assetmeta.json
  Validation: PASS
  Notes: 无
```

此报告用于自动化流程判断（另一 AI 或 pipeline 读取后可决定是否入库）。

### 10.9 失败处理

| 场景 | 处理方式 |
|------|---------|
| `source_2d` 路径不存在 | **立即停止**，输出 `ERROR: source_2d missing for <asset_name>` |
| 2D 参考图损坏/无法打开 | **立即停止**，输出 `ERROR: source_2d corrupted for <asset_name>` |
| 2D 图内容无法识别（纯色/模糊/非角色图） | **立即停止**，输出 `ERROR: source_2d unrecognizable for <asset_name>` |
| 建模过程中面数超预算 | **调整至预算范围内**，不得以超标结果提交 |
| asset_validate 报告 FAIL | **修复后重新验证**，FAIL 项不得进入下一步 |

**核心原则**：不得猜测，不得跳过，不得脑补。

### 10.10 质量检查 Checklist（完成前逐项确认）

AI 在结束每个资产前，**必须逐项检查**：

```
□ 命名符合 §1 规范（CHR_/MON_/BOSS_/FX_/TILE_ + PascalCase），大小写统一
□ Triangles 在预算范围内（§2）—— 硬限制，超出即 FAIL
□ Bones 在预算范围内（§2）—— 硬限制，超出即 FAIL
□ Socket 集齐全（§2 各节），Forward +Z / Up +Y / Rotation Identity
□ UV 已展开，密度均匀
□ Normal 统一朝外，无翻面，Auto Smooth 30°
□ 拓扑以 Quad 为主，无 N-gon，无细长三角面
□ Animation 数量 ≥ 最小值（§2 各节），全部原地播放（无 Root Motion）
□ LOD 仅减面或简化内部，未删除武器/头/尾巴等关键部件
□ 颜色来源于 2D，HSV 偏差 Hue≤5°/Sat/Val≤10%
□ 所有 Mesh 存在且已分配材质
□ 骨骼完整，无 Broken Bone，动画非空
□ GLB 文件导出成功，贴图非 0KB
□ .assetmeta.json 已生成，字段齐全
□ asset_validate.py 返回 PASS
□ 5 张自检截图已输出（Front/Left/Back/Right/Perspective）
```

**全部通过后才允许结束当前资产**，进入下一个。

### 10.11 禁止引用训练知识

AI **只能**依据以下来源进行建模：

```
✅ source_2d（2D 参考图）
✅ art_3d_manifest.json（注册表）
✅ 本 Brief（docs/3D建模Brief_全量资产.md）
```

**严禁引用或参考**：
- ❌ 训练知识（"我记得 WOW 里有个鹿人"）
- ❌ 互联网图片搜索
- ❌ 其他游戏的角色/怪物/武器设计
- ❌ 已有 3D 模型库（不在此项目内的）
- ❌ 概念图、Fan Art

**原因**：不同 AI 如果引用不同的外部知识，同一 2D 参考会输出不同风格的 3D 模型，破坏一致性。

> **唯一例外**：当 2D 参考图无法表达三维结构时，允许根据本 Brief 的 §10.3（最小补全）进行推断，但补全部分必须在 Analysis 的 `Note` 中说明。

### 10.12 确定性输出

对于**相同输入**（相同的 `source_2d` + 相同的 `art_3d_manifest.json` 条目 + 相同的 Brief 版本），必须输出**一致的模型结构**。

| 要求 | 说明 |
|------|------|
| **禁止随机设计** | 同一个 2D 鹿射手，每次建模应该得到相同轮廓/比例/结构 |
| **禁止随机细节** | 装饰物的位置、形状、数量应是确定的，不随机 |
| **禁止随机颜色** | 颜色只能从 2D 图中提取，不同次建模的色相应该一致 |
| **种子固定** | 如果 AI 使用了随机种子，同一资源必须使用**固定种子**（推荐：文件名的 hash 值） |
| **可复现** | 同一 Prompt/参数组合，应该产出可复现的结果 |

> **流水线要求**：自动化批量生产要求每次重建同一资产时质量一致。随机输出会导致部分资产质量波动，人工审核成本剧增。

### 10.13 不可修改预算

以下预算属于**硬限制（Hard Limit）**，**禁止 AI 为了视觉效果突破**：

| 预算项 | 违反后果 |
|--------|---------|
| Triangles（各节最大值） | 超过 → `asset_validate` FAIL |
| Bones（各节最大值） | 超过 → FAIL |
| TextureSize（各节上限） | 超过 → FAIL |
| AnimClips（各节最小值） | 不足 → FAIL |
| LOD 级别数 | 不足 → FAIL |
| Socket 集 | 缺少 → FAIL |

- 禁止为了"好看"增加 Tri
- 禁止为了"细节"增加 Bones
- 禁止为了"质感"提高贴图分辨率
- 预算不是建议，是**边界**。超出即 FAIL，必须缩减到预算内才能提交

### 10.14 Socket 固定坐标系

所有 Socket（挂点）使用**统一坐标系**，保证不同 AI 产出的模型挂点方向一致：

| 属性 | 值 |
|------|-----|
| **Forward** | **+Z**（模型面朝方向） |
| **Up** | **+Y**（模型上方） |
| **Rotation** | **Identity（无旋转）** |
| **Scale** | **(1, 1, 1)** |

- `RightHand` 的 Forward 指向手掌张开方向
- `Weapon` 的 Forward 指向武器尖端
- `Head` 的 Up 指向头顶
- 不同 AI 制作的武器挂到同一角色上时，握持方向必须一致

### 10.15 LOD 生成规则

LOD 的简化**只能使用以下策略**：

| ✅ 允许 | ❌ 禁止 |
|--------|--------|
| 降低细分（减少 Edge Loop） | **删除武器** |
| 合并小面片 | **删除头/面部** |
| 简化内部不可见结构 | **删除尾巴/角/翅膀等识别特征** |
| 减少 UV 岛的接缝 | **合并不同部件导致轮廓变形** |
| Decimate 减面（保持轮廓） | 移除关键 Socket 挂点 |

**核心原则**：LOD 可以降低精度，但不能改变资产的**识别度**。L3（最远距离）的模型剪影应该仍能被识别为原来的角色/怪物/Boss。

### 10.16 贴图 Palette 一致性

**颜色必须来源于 2D 参考图**，禁止 AI 自行调色：

| 要求 | 说明 |
|------|------|
| **色板来源** | 从 2D 参考图中提取主色、辅色、点缀色 |
| **HSV 偏差** | 相对于 2D 图，**Hue ≤ 5° 偏差，Saturation/Value ≤ 10% 偏差** |
| **禁止重新调色** | 不得因为"好看"改变 2D 配色 |
| **跨资源一致性** | 同一角色的 2D→3D 颜色、UI 头像颜色、3D 模型颜色三者应视觉一致 |
| **区域调性** | 怪物/Boss 的颜色必须匹配 §7 的 6 区域主色调（Forest 暖绿/Volcano 橙黑等） |

### 10.17 自检截图

每个资产完成建模 + 贴图后，**必须输出 5 张预览截图**（渲染或视口截图均可）：

```
{AssetName}_front.png   — 正面
{AssetName}_left.png    — 左侧
{AssetName}_back.png    — 背面
{AssetName}_right.png   — 右侧
{AssetName}_persp.png   — 45° 透视
```

- 截图背景为纯色（建议浅灰 #808080）
- 模型居中，占据画面 60-80%
- 同一批资产的截图角度/距离/大小应保持一致
- 截图用于快速视觉审核，加速人工确认流程

### 10.18 AI 最终输出状态（扩展格式）

输出报告在 §10.8 基础上，增加**分段状态**字段：

```yaml
Asset: CHR_Warrior_A
Category: characters
Triangles: 2648
Bones: 28
TextureSize: 512
AnimClips: [idle, walk, attack, hurt, death]
LODs: 3
Sockets: [RightHand, LeftHand, Head, Chest, Back, Foot, Weapon, SkillOrigin]
ExportFormat: GLB
AssetMeta: CHR_Warrior_A.assetmeta.json
Status:
  MeshExists: PASS
  MaterialAssigned: PASS
  BoneIntegrity: PASS
  AnimationNotEmpty: PASS
  NoZeroKBTextures: PASS
  Analysis: PASS
  Modeling: PASS
  Rig: PASS
  Animation: PASS
  Export: PASS
  Validation: PASS
Notes: 无
```

**Status 字段说明**：

| 检查项 | 含义 |
|--------|------|
| `MeshExists` | 所有 Mesh 存在，无空网格 |
| `MaterialAssigned` | 所有 Mesh 已分配材质，无 Missing Material |
| `BoneIntegrity` | 所有骨骼完整连接，无 Broken Bone |
| `AnimationNotEmpty` | 动画剪辑有实际关键帧，无空动画 |
| `NoZeroKBTextures` | 贴图文件非 0KB，无损坏 |
| `Analysis` | §10.2 分析报告已输出 |
| `Modeling` | 建模各阶段完成 |
| `Rig` | 骨骼绑定完成 |
| `Animation` | 动画制作完成 |
| `Export` | GLB 导出成功 |
| `Validation` | `asset_validate.py` 返回 PASS |

**只有当 `Status` 中所有项为 `PASS` 时**，才允许进入下一资产。

### 10.19 禁止自动修复（Validation 失败时的行为）

当 Validation 失败时，AI **只能重新执行失败的步骤**，**不得回溯修改已通过的步骤**。

| 场景 | ✅ 允许 | ❌ 禁止 |
|------|--------|--------|
| Rig PASS → Animation FAIL | 仅重新生成 Animation | 重新建模 / 重新 Rig |
| Modeling PASS → UV FAIL | 仅重做 UV + 贴图 | 重做 Modeling（面数/拓扑已通过） |
| Animation PASS → LOD FAIL | 仅调整 LOD | 重做动画 / 改 Rig |
| Export PASS → Validation FAIL | 按验证报告逐项修复 | 重新导出整个模型 |

**原则**：
- 每一步 Validation 通过后即**锁定**，后续步骤不得回退修改
- 这保证了流水线的**可追溯性**：如果 Animation 出问题，问题一定在 Animation 步骤
- 禁止"为了修复穿模而改 Mesh"（穿模应通过 Animation 调整或 Collider 修正，不改变已通过的 Mesh）

### 10.20 机器可读状态输出（无人值守自动化）

当流水线需要完全无人值守（Jenkins / GitHub Actions / Python Pipeline / MCP Agent 自动检测）时，AI 在最终输出报告中**额外输出一段 JSON 格式的状态摘要**，与 §10.18 的 YAML 报告并存：

```json
{
  "asset": "CHR_Warrior_A",
  "status": "PASS",
  "version": "1.0.0",
  "triangles": 2648,
  "bones": 28,
  "textureSize": 512,
  "lodLevels": 3,
  "animClipCount": 5,
  "socketCount": 8,
  "validation": "PASS",
  "timestamp": "2026-07-10T15:30:00Z"
}
```

| 字段 | 说明 |
|------|------|
| `asset` | 3D 资产名（与 `.glb` 文件名一致） |
| `status` | `PASS` / `FAIL`（整体状态） |
| `version` | 本 Brief 版本号 |
| `triangles` | 实际面数 |
| `bones` | 实际骨骼数 |
| `textureSize` | 贴图尺寸 |
| `lodLevels` | LOD 级别数 |
| `animClipCount` | 动画剪辑数 |
| `socketCount` | 挂点数 |
| `validation` | `PASS` / `FAIL`（asset_validate 结果） |
| `timestamp` | 完成时间 (ISO 8601) |

> 此 JSON 可用于自动判断是否触发下一个资产的构建、记录进度数据库、或生成全量资源进度看板。

| 文件 | 用途 |
|------|------|
| `docs/3D建模Brief_全量资产.md` | **本文档** — 给另一 AI/美术的完整 Brief |
| `docs/角色.txt` | **角色部件化拆分标准（部件列表/命名/骨骼对应）** — 3D 建模时部件拆分须与此一致 |
| `docs/资源清单_可执行.md` | 全量资源执行计划与状态 |
| `docs/美术资源制作参数总表_3D.md` | 逐资源参数表（命名/预算/LOD/依赖） |
| `.workbuddy/memory/topics/ART_RESOURCE_RULES.md §16` | 3D 权威规则（命名/预算/目录/生命周期） |
| `assets/resources/config/art_quality_budget.json → rules3d` | 机器可读预算数值 |
| `assets/resources/config/art_3d_manifest.json` | 176 项注册表（含 source_2d 参考路径） |
| `tools/asset_validate.py` | 3D 技术校验器 |
| `tools/art_pipeline.py` | 3D 入库入口（`import --mode 3d`） |
| `tools/gen_assetmeta_from_manifest.py` | 从 manifest 批量生成 .assetmeta.json 模板（176 项） |
| `tools/collect_3d_progress.py` | 扫描模型目录，聚合 3D 资产进度（支持 JSON/MD 输出） |

---

## 附录：生产要点速查

- 文件放 `assets/resources/models/{cat}/`（cat=characters/monsters/bosses/effects/tiles）
- `.assetmeta.json` 与 `.glb` 同目录同名
- 每完成一个, 用 `asset_validate.py` 自检 → 通过后标记 lifecycle 为"评审中"
- 全部完成 + 校验通过后, 走 `art_pipeline.py import --mode 3d --all` 批量入库
- tiles 是静态件, 不需要骨骼/动画
- effects 是 Cocos 粒子系统 Prefab（非 .glb 模型），`prefix` 为 `FX_`，走 `.prefab`
