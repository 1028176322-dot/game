# art-pipeline 升级审查报告（对照《2D→3D 全面升级方案》v3 + 美术资源制作参数总表 v5）

> 审查目标：梳理 `art-pipeline` Skill 及其所有相关代码/配置，找出与「全 3D 升级」方案存在冲突或需同步调整的位置。
> 审查基准：`docs/2D转3D全面升级方案.md`（v3）、`回到地面/docs/美术资源制作参数总表_3D.md`（v5）、`ART_RESOURCE_RULES.md`、`art_pipeline.py`、`prompts.json`、`art_quality_budget.json`、`tmp_resource_status.py`、下游 Cocos TS 服务。
> 结论一句话：**art-pipeline 当前是 100% 的 2D 管线**（PNG/JPG 出图 → `textures/` → 2D 尺寸/Alpha/体积校验），与 3D 目标在「格式、命名、预算、目录、注册、生命周期、依赖、下游消费」八个维度全面冲突。必须新增 3D 分支并对齐规则单源，否则 agent 在 3D 资源上会套用 2D 流程产出错误资产。

---

## 0. 冲突全景（核心结论）

| 维度 | 现状（art-pipeline） | 3D 目标（方案 v3/v5） | 冲突等级 |
|---|---|---|---|
| 资源格式 | PNG/JPG 图片 | `.glb` 模型 + `.prefab` + ASTC 贴图 + `.material` + 骨骼动画 | 🔴 P0 |
| 生成方式 | Agnes AI 出图 + Pillow 程序化 | 模型由 Blender 制作，管线只做「校验→登记→装配」 | 🔴 P0 |
| 命名规范 | `{cat}_{sub}_{act}.png` 强制小写 `[a-z0-9_]` | `CHR_/MON_/BOSS_/FX_/TILE_` + PascalCase（如 `CHR_Warrior_A.glb`） | 🔴 P0（直接冲突） |
| 体积/预算 | KB 级图片体积 | Tri 面数 / 骨骼数 / 粒子数 / DrawCall / 内存 | 🔴 P0 |
| 入库目录 | `assets/resources/textures/` | `assets/resources/models/` + `prefabs/` + ASTC 贴图 | 🔴 P0 |
| 校验门禁 | 模式 RGBA/RGB、Alpha 边、chroma、KB | Tri/Bone/Socket/Collider/LOD/依赖/命名（asset_validate） | 🔴 P0 |
| 资源注册 | `assets.json`(SpriteFrame)/`game_assets.json`(frameWidth) | Prefab/SkeletalAnimation/Material/Socket/Collider/LOD 元数据 | 🔴 P0 |
| 生命周期元字段 | 无（仅 pipeline 状态机） | 版本/作者/日期/评审 + 依赖 + 性能等级 + 测试场景 + 选秀/评审中/已批准/已弃用 | 🟠 P1 |
| 下游消费 | `SpriteAnimationService`(切 2D 帧) / `AssetBundleService.loadSpriteFrame` | `ModelAnimService`(骨骼) / `AssetBundleService.loadModel/loadPrefab` + AssetCache | 🔴 P0 |

---

## 1. art-pipeline Skill 本体

### 1.1 `C:\Users\Administrator\.workbuddy\skills\art-pipeline\SKILL.md` — **P0**
- **修改点 1**：全文 12 步工作流、batch 子命令（generate/validate/import）、技术检查规则（step 6：path/naming/size/format/alpha/volume）**全部假设 2D 图片**。需新增「3D 资源分支」：characters/monsters/bosses/effects/tiles 走 `Blender→glb→ASTC→Prefab→asset_validate`；icons/ui/backgrounds 保留 2D 分支。
- **修改点 2**：Mandatory First Step 只读 `ART_RESOURCE_RULES.md`（2D）。需补充读取 3D 规范：`回到地面/docs/美术资源制作参数总表_3D.md` 与升级方案 §3.6/§5.9。
- **修改点 3**：技术检查（step 6）需增加 3D 委托——调用 `tools/asset_validate.py`（Tri/Bone/Socket/Collider/LOD/命名/依赖），并明确「3D 资产未过 asset_validate 禁止入库」。
- **修改点 4**：Configuration Files Reference 表缺 3D 资产规范文件与 `asset_validate.py`；需补 `回到地面/docs/美术资源制作参数总表_3D.md`、`tools/asset_validate.py`、`art_quality_budget.json`(rules3d)。
- **修改点 5**：Violation Warnings 全是 2D（backup 到 textures/、ASTC 仅一笔带过）。需增加 3D 违规：`.glb` 直接丢 `textures/`、未过 `asset_validate` 即入库、未登记依赖即 import、3D 命名不符 `CHR_/MON_/...`。
- **原因**：SKILL.md 是 agent 每步遵循的操作手册。不改，agent 会对 3D 角色套用 Agnes 出图而非校验 glb，直接产出错误资产。

### 1.2 `…\skills\art-pipeline\scripts\generate_panel.py` — **P3（基本不改）**
- 仅生成 2D UI PNG；UI 在升级方案中**保留 2D**，故此脚本有效。建议在 SKILL.md 注明：它只服务 2D-retained 的 UI，不参与 3D。

---

## 2. 核心实现 `回到地面/tools/art_pipeline.py` — **P0**

| 位置 | 现状 | 需修改点 | 原因 |
|---|---|---|---|
| 路径常量 L31-40 | 仅 `TEXTURES_DIR`；`MASTER_DIR`/`CANDIDATES_DIR` 是图片 | 新增 `MODELS_DIR`(`assets/resources/models` 或 `arts/models`)、`PREFABS_DIR`、`MODELS_REVIEW_DIR`(art_source/models_review)；`TEXTURES_DIR` 仅用于 2D-retained | 3D 模型/Prefab 不能进 `textures/` |
| `classify_resource()` L375-422 | 把 characters/monsters/bosses/effects/tiles 判为 2D sprite | 增加 `dim`(2d/3d) 标志，来源=一份 3D 资产清单/配置；3D 资产不再走 Agnes 出图 | 否则 3D 资源被当 2D 出图 |
| `cmd_generate()` L1433+ | AI 生成分支（Agnes）覆盖全部类别 | 3D 资产跳过 Agnes，改为「外部模型母版 → 3D 校验 → 登记」；新增 3D 生成/导入分支（或 `cmd_generate_3d`） | 模型非 AI 出图 |
| `post_process_generated()` L1165+ | matte 去除/去绿幕/调色板是 2D 专用 | 按 `dim` 分支：3D albedo 贴图可复用后处理，模型本体跳过 | 避免对 .glb 误用图像后处理 |
| `validate_technical()` L1272+ | 查 image mode RGBA/RGB、尺寸、Alpha 边、chroma、KB | 增加 3D 委托 `if 3d: return asset_validate(...)`；否则 3D 资产无法验证 | 3D 校验项完全不同 |
| 命名校验 L1294 `^[a-z0-9_]+$` | **强制小写** | 3D 资产用 `CHR_Warrior_A.glb`（大写 PascalCase）→ 必须加 3D 命名分支，否则**全部 3D 资产被判不合规** | 与 v5 命名直接冲突 |
| `cmd_import()` L1706+ | 拷贝到 `TEXTURES_DIR` | 3D 入库语义不同：`.glb` 源不入 runtime，需导入 Cocos 生成 Prefab→登记 `assets.json`(3D type)→依赖检查 | 模型源与运行实体分离 |
| `ProgressTracker` L428+ | 状态机 planned→prompting→generated→validated→approved→imported | 扩展 3D 阶段（modeled/rigged/animated/prefabbed/assetcached）+ 容纳 v5 元字段（version/author/date/reviewer、lifecycle 选秀/评审中/已批准/已弃用） | 进度与生命周期无载体 |
| `budget_limits()` L265+ | 返回 KB | 新增 `budget_3d(category)` 从规则新段读取（Tri/骨/粒子/DrawCall） | 3D 预算维度不同 |
| §15 JSON 读取 L53-90 | `detail_anchors` 等 2D prompt 参数 | §15 新增 3D 参数（模型目录、ASTC 档位表、Toon 材质路径、LOD 规则、3D 命名前缀），供脚本读取 | 单一权威来源（§14.1） |
| `_parse_art_rules_budget()` L164+ | 解析 §9.2 的 KB 表 | 新增解析 3D 预算表（写入 ART_RESOURCE_RULES.md 新节） | 预算不得硬编码 |

---

## 3. 权威规则 `E:\game\.workbuddy\memory\topics\ART_RESOURCE_RULES.md` — **P0**

- **§3.1 文件格式**：仅 PNG/JPG → 增加 3D 格式（`.glb`/`.prefab`/ASTC/`.material`/骨骼动画），并明确哪些类别是 3D、哪些保留 2D。
- **§3.2 推荐运行尺寸**：2D 像素尺寸 → 补充「模型预算」列（Tri/骨/贴图尺寸/动画帧率/LOD），对齐 art-spec v5。
- **§3.3 Bundle 映射**：texture-based → 3D 模型需独立 bundle/目录（如 `models_*`）。
- **§4 资源注册**：4.1 三态可复用（"文件"定义需扩展为模型/Prefab）；4.2 注册链路 `textures→assets.json→...` 需增 3D 形态 `models→assets.json(3D type: Prefab/SkeletalAnimation/Material)→业务配置`；4.3 `loadSpriteFrame()` 需补 `loadModel/loadPrefab`。
- **§6 命名规则（冲突点）**：当前 `{category}_{subject}_{action}.png` + 小写强制；art-spec v5 强制 `CHR_/MON_/BOSS_/FX_/TILE_` + PascalCase。**必须分轨**：2D-retained 用现有小写规则，3D 资产用 v5 命名；否则 §14.1 单源违反。
- **§9.2 体积参考**：KB → 新增「3D 资源预算」小节（Tri/骨/粒子/DrawCall/内存），数据来自升级方案 v3 §6.1 + art-spec v5。
- **§10.1 正式资源目录**：仅 `textures/` → 新增 `models/`（glb 源）、`prefabs/`（3D 实体）、ASTC 贴图目录；2D-retained 仍在 `textures/`。
- **§10.2 工作目录**：`art_source` 无 3D 工作区 → 新增 `art_source/models_review/`（glb 母版/候选/校验报告）与 `art_source/models_export/`。
- **§11/§15**：新增 3D 管线参数（模型目录、ASTC 档位、Toon 材质、LOD 规则、3D 命名前缀），供 `art_pipeline.py` 读取。
- **新增 §**：3D 资源生命周期（选秀/评审中/已批准/已弃用）+ 版本/依赖/性能等级/测试场景 的权威定义（这些元字段目前只在生成器产出，无规则文件承载 → §14.1 单源缺口）。

---

## 4. 配置与进度文件

### 4.1 `E:\game\assets\resources\config\prompts.json` — **P1**
- 499 条全 2D 图 prompt（characters 35/monsters 36/bosses 120/...）。3D 升级后，角色/怪物/Boss/特效/Tile 的**模型**不再由 Agnes 出图（Blender 制作）；但 3D 的 **albedo/材质贴图** 可能仍需 AI 生成。
- **修改点**：每条加 `"dim": "3d"|"2d"|"3d_albedo"`，或拆出 `prompts_3d.json`（仅 albedo 贴图）。否则 pipeline 会对 3D 模型误用 Agnes 出图。

### 4.2 `E:\game\assets\resources\config\art_quality_budget.json` — **P0**
- 全 2D（`format: png_rgba/jpg`、`recommendKB/warningKB`）。
- **修改点**：新增 `rules3d` 段——模型 Tri/骨上限、贴图 ASTC 档位、VFX 粒子/DrawCall/生命周期、Tile 模块规格、Boss/角色差异化预算（来自 art-spec v5）。`art_pipeline.py` 的 3D 预算读取指向此段。

### 4.3 `E:\game\.workbuddy\tmp_resource_status.py` — **P1**
- 硬编码 8 个 2D 类别；`master_base`=图片、`runtime_base`=`textures/`；无 3D/lifecycle 列。
- **修改点**：`cat_names` 增 3D 状态列；`master_base`/`runtime_base` 区分 3D（`models/`+`prefabs/`）；新增 lifecycle/version 列；按 prompts 的 `dim` 标记决定 2D/3D 跟踪方式。否则 `resource_status.md` 无法反映 3D 进度（违反 §14.4 权威完整性）。

### 4.4 `E:\game\回到地面\docs\progress\resource_status.md` — **P2（随 4.3 重生成）**
- 由 `tmp_resource_status.py` 生成，无 3D 列；随 4.3 改造后自动包含 3D 进度与 lifecycle。

### 4.5 `E:\game\.workbuddy\memory\topics\RESOURCE_STATUS.md` — **P2（潜在 §14.4 违规）**
- §14.4 规定 `docs/progress/resource_status.md` 是唯一权威；但同时存在 topics/RESOURCE_STATUS.md（50 行），构成重复进度追踪。需确认其用途，若含逐资源明细应清空/合并，避免与权威源冲突。

---

## 5. 下游消费（Cocos TS 服务）— **P0/P1**

### 5.1 `回到地面/assets/scripts/render/SpriteAnimationService.ts` — **P0**
- 只加载/切片 `SpriteFrame`（2D 图集，见 L8/L83/L245 `_loadSpriteFrame`）。
- **修改点**：3D 动画改骨骼动画（`SkeletalAnimation` clip + `ModelAnimService`/动画状态机）。本服务重构为：2D-retained 帧动画走旧路径，3D 角色/怪/Boss 走骨骼动画；或新建 `ModelAnimService` 并让本服务仅 2D 模式启用。

### 5.2 `回到地面/assets/scripts/assets/AssetBundleService.ts` — **P0**
- 类型联合含 `SpriteFrame/Texture2D/Prefab/...`；`loadSpriteFrame` 是主要入口（L109/L113）。
- **修改点**：新增 3D 加载 `loadModel`/`loadPrefab`/`loadSkeletalAnimation`/`loadMaterial` + ASTC 纹理加载 + AssetCache 引用计数（升级方案 §3.6）；3D 资产经此服务按 `RuntimeLayerService` 装配。

### 5.3 `回到地面/assets/scripts/render/CharacterVisualService.ts` — **P1**
- 驱动 2D sprite 显示。
- **修改点**：3D 模式实例化 Prefab、设 Toon 材质、挂载 Socket/Collider、播放动画；2D 保留旧行为。

### 5.4 `回到地面/assets/scripts/assets/RenderAssetService.ts` — **P1**
- 运行时装配。
- **修改点**：增加 3D 模型/Prefab 装配路径（经 AssetCache），与 3D 资源注册（assets.json 3D 形态）对接。

> 备注：同目录 `TileAssetService`/`EffectService`/`BackgroundService`/`IconService` 也多为 2D sprite 驱动，需随 3D 化改造，但优先级低于上述 4 个核心，列入关联受影响清单，非本次必改。

---

## 6. 关联 / 缺失 / 单源冲突文件

### 6.1 `docs/美术资源生成与入库规范.md` — **缺失但被多处引用（P1）**
- SKILL.md、ART_RESOURCE_RULES.md §13/§14.2 均将其称为「总规范」，但 `docs/` 实际只有 4 个文件（无此文档）。
- **修改点**：创建该总规范并补全 3D 部分，或将引用改为现有文档（`回到地面/docs/美术资源制作参数总表_3D.md` + 升级方案）。否则文档链断裂（§14.1/§14.2 违反）。

### 6.2 `docs/SKILL_REFERENCE.md` — **P3**
- 索引称 art-pipeline 用于「任何纹理/gen 操作」。
- **修改点**：补一句——3D 模型资产经 art-pipeline 的 3D 分支（而非仅纹理）。

### 6.3 `E:\game\tools\art_resource_gate.py` — **P1**
- 审计 `assets/resources/textures` 下 PNG（meta/SpriteFrame UUID/格式安全，见 L17-25）。
- **修改点**：增加 3D 审计分支（`.glb` 存在性、Prefab 引用、ASTC、meta 完整性），否则 3D 资产绕过门禁。

### 6.4 `E:\game\tools\gen_art_spec.py`（v5 生成器）— **与 ART_RESOURCE_RULES.md 单源冲突（P1）**
- gen_art_spec.py **自带** CHR_/MON_/BOSS_/FX_/TILE_ 命名 + 预算 + 依赖定义；而 ART_RESOURCE_RULES.md §6/§9 是 PNG 命名/KB 预算。两套命名/预算并存 → 违反 §14.1 单一权威来源。
- **修改点**：把 3D 命名/预算/LOD/依赖规则**提升到 ART_RESOURCE_RULES.md 作为权威**（见 §3），`gen_art_spec.py` 改为读取该源而非自己硬编码。

### 6.5 `tools/asset_validate.py` — **已建成 ✅**
- art-spec v5 §9.1 规划的 3D 技术校验器（读 .glb/Prefab 抽 Tri/骨/Socket/Collider/LOD/AnimEvent/命名 + 依赖，比对预算出报告）。`art_pipeline.py` 的 `validate` 与 SKILL.md step 6 均调用它。
- **位置**：`回到地面/tools/asset_validate.py`（与 `art_pipeline.py`/`encoding_audit.py`/`check_doc_consistency.py` 同目录；原位于顶层 `E:/game/tools/`，2026-07-10 迁移至此，以对齐 doc-consistency 门禁的 `PROJECT_ROOT=E:/game/回到地面`）。
- 调用：`python tools/asset_validate.py <manifest.assetmeta.json> [--budget ...]` / `--scan <dir>` / `--self-test`。

### 6.6 `E:\game\回到地面\tools\check_doc_consistency.py`（§14.3 引用）— **P2**
- 需确认其覆盖 3D 规则一致性（新增 3D 预算/命名解析检查）。

### 6.7 跨切面：根目录路径脆弱性（P2）
- SKILL.md 用 `E:/game/assets/...`；`art_pipeline.py` 用 `PROJECT_ROOT=回到地面` 的父目录推导 prompts 路径（L35），实际 prompts 在顶层 `E:/game/assets/...`，Cocos 项目在 `E:/game/回到地面/`。链路可工作但脆弱，且 `assets/resources/`(顶层配置) 与 `回到地面/assets/resources/`(运行资产) 是两个仓库。**建议**在改造时把 3D 规则/配置/脚本路径在 ART_RESOURCE_RULES.md 显式列清，避免 Phase 多人开发时路径漂移。

---

## 7. 修改优先级汇总（按文件）

| 优先级 | 文件 | 关键修改 |
|---|---|---|
| 🔴 P0 | SKILL.md | 增 3D 分支、3D 校验委托、3D 违规警告 |
| 🔴 P0 | `回到地面/tools/art_pipeline.py` | dim 分支、3D 命名/预算/校验/import/进度状态机 |
| 🔴 P0 | ART_RESOURCE_RULES.md | §3/§4/§6/§9/§10/§15 增补 3D；双轨命名；3D 预算/生命周期权威化 |
| 🔴 P0 | art_quality_budget.json | 新增 `rules3d`（Tri/骨/粒子/DrawCall） |
| 🔴 P0 | SpriteAnimationService.ts | 2D 帧动画 → 3D 骨骼动画分支 |
| 🔴 P0 | AssetBundleService.ts | 新增 loadModel/loadPrefab/loadSkeletalAnimation + AssetCache |
| 🔴 P0 | `tools/asset_validate.py` | **新建** 3D 校验器（Tri/Bone/Socket/Collider/LOD/依赖/命名） |
| 🟠 P1 | prompts.json | 加 `dim` 标记 / 拆 `prompts_3d.json` |
| 🟠 P1 | tmp_resource_status.py | 3D 类别/目录/lifecycle 列 |
| 🟠 P1 | `docs/美术资源生成与入库规范.md` | **创建/修复引用**（当前缺失） |
| 🟠 P1 | art_resource_gate.py | 增 3D 审计分支 |
| 🟠 P1 | gen_art_spec.py | 改读 ART_RESOURCE_RULES.md 3D 节（消除单源冲突） |
| 🟠 P1 | CharacterVisualService.ts / RenderAssetService.ts | 3D 实例化/Prefab 装配 |
| 🟡 P2 | resource_status.md / RESOURCE_STATUS.md(topics) / check_doc_consistency.py | 3D 列；清理重复进度源；3D 一致性检查 |
| ⚪ P3 | generate_panel.py / SKILL_REFERENCE.md | 注明仅服务 2D-retained |

---

## 8. 建议的分阶段改造路线（对齐升级方案 Phase）

- **Phase 0（地基 / Demo0）**：新建 `tools/asset_validate.py`（3D 校验器）；在 ART_RESOURCE_RULES.md 新增「3D 资源规则」专章（命名/预算/目录/生命周期权威化）；`art_quality_budget.json` 增 `rules3d`。
- **Phase 1（渲染&相机切片）**：SKILL.md 增加 3D 分支骨架；`art_pipeline.py` 增 `dim` 分类与 3D import/validate 分支（先跑通一个 3D 角色端到端）。
- **Phase 2（角色&动画）**：`SpriteAnimationService`→`ModelAnimService`；`AssetBundleService` 增 3D 加载 + AssetCache；`CharacterVisualService` 3D 化。
- **Phase 3–4（战斗/地牢&美术批量）**：`gen_art_spec.py` 改为读规则单源；`tmp_resource_status.py`/`resource_status.md` 增 3D/lifecycle 列；`art_resource_gate.py` 增 3D 审计；`prompts.json` 加 `dim` 标记。
- **Phase 5–6（光照/特效/世界UI/优化发布）**：补齐 effects/tiles 3D 管线；`docs/美术资源生成与入库规范.md` 创建并补全 3D；`check_doc_consistency.py` 覆盖 3D 规则一致性。

> 改造原则（来自用户评审）：保持 **§14.1 单一权威来源**——3D 命名/预算/LOD/依赖规则只在 ART_RESOURCE_RULES.md 定义一次，`art_pipeline.py`、`gen_art_spec.py`、`asset_validate.py` 均引用读取，禁止各自硬编码。

---

## 9. 执行进度追踪（已落地修改）

> 审查已按 Phase 0 → P2 顺序落地执行。所有文件以 UTF-8 写入，并全部通过 `encoding_audit --ci`（scanned=499, issues=0, p0=0, p1=0, p2=0）。

| Phase | 文件 | 修改内容 | 状态 |
|---|---|---|---|
| P0 | `assets/resources/config/art_quality_budget.json` | 新增顶层 `rules3d` 段（角色 / Boss终 / Boss小 / 怪 / 特效普通 / 特效Boss / Tile / 命名 共 8 桶预算，数据来自 art-spec v5） | ✅ |
| P0 | `.workbuddy/memory/topics/ART_RESOURCE_RULES.md` | 新增 `§16 3D 资源规则（权威源）`：3D 范围、双轨命名、预算、目录与入库、manifest 元数据、生命周期、单源指令 | ✅ |
| P0 | `tools/asset_validate.py` | **新建** 3D 校验器：读 `.assetmeta.json` manifest，比对 `rules3d` 出 Pass/Fail 报告；覆盖命名/预算/Tri/骨/Socket/Collider/LOD/依赖/生命周期/元字段；含 `--self-test` / `--scan --report`；命名正则自动剥离 `.glb/.prefab` | ✅ |
| P1 | `assets/resources/config/prompts_dim.json` | **新建** 维度注册表（499 条：242 `3d` / 257 `2d`，由 prompts.json key 前缀推导；prompts.json 本身不改动以免破坏消费方） | ✅ |
| P1 | `.workbuddy/tmp_resource_status.py` | 增 3D 维度列、3D 母版/运行目录（models/prefabs）、生命周期/版本列；2D 行为完全不变；progress 缺失时降级为 `{}` | ✅ |
| P1 | `tools/art_resource_gate.py` | 增 3D 审计分支：扫描 `models/`、`prefabs/` 的 `.glb/.prefab`，检查 meta 存在 + 命名合规（读 rules3d 命名正则）；目录不存在时安全跳过；输出 `art_resource_gate_3d.csv` | ✅ |
| P2 | `回到地面/tools/art_pipeline.py` | 3D 分支骨架已落地：`category_dim()`（读 `prompts_dim.json`，回退 DIM_3D_CATEGORIES）、`classify_resource` 增 `dim`、`validate_technical` 增 `dim=` 形参并 3D 委托 `_validate_3d_asset()`（读 `rules3d` 校验命名+Tri/Bone/贴图预算）、`cmd_audit` 标 `[3D建模]`、`cmd_validate` 传 `dim`、`cmd_import` 路由 `models/`+`prefabs/`、`cmd_generate` 跳过 3D AI 生成、`ProgressTracker` 扩 `dim`/`modelPath` 字段；新增 `MODELS_DIR`/`PREFABS_DIR` 常量 | ✅ |
| P3 | `art-pipeline SKILL.md` | 增 3D 资源分支、Mandatory First Step 读 3D 规范、`step 6` 3D 校验委托 `asset_validate`、Configuration Files 补 3D 规范文件、Violation Warnings 增 3D 违规 | ✅ |

### 9.1 关于 prompts.json 的决策（非破坏性）
原审查建议「每条加 `dim` 标记」。但 `prompts.json` 的值为**字符串**（prompt 文本），直接注入字段会破坏 `art_pipeline.py` 等消费方（按字符串读取）。故改为：**维度由 key 前缀（category）推导**，并落为独立 `prompts_dim.json` 注册表（非破坏性，prompts.json 不动）。`art_pipeline.py` 在 P2 接入时读取该注册表即可，无需改动 499 条原始 prompt。

### 9.2 asset_validate.py 快速验证（已通过）
- `--self-test`：**PASS**（`fail_checks=0`）。
- 功能扫描：良好资产（`CHR_Archer_A`，Tri 2200/Bone 24/512²/3 clip/Socket 全/Collider 有/依赖齐/生命周期已批准）正确 **PASS**；越预算 Boss（`BOSS_Final_01`，Tri 9500/Bone 90/贴图 2048/缺 Socket/缺 Collider/缺依赖 `Weapon_Missing`/无效 `perfTier=ultra`/空测试场景/空元字段）被正确判 **FAIL（13 项违规）**。
- 命名正则支持 `.glb/.prefab` 后缀自动剥离，示例 `CHR_Warrior_A.glb` 可被正确识别。

### 9.3 落地后已解决的审查冲突点
- **命名直接冲突（P0）**：`asset_validate.py` 现采用 `rules3d.naming`（`CHR_/MON_/BOSS_/FX_/TILE_` + PascalCase），与 art-spec v5 一致；业务侧 3D 资产不再被 2D 小写规则误判。
- **单源冲突（P1）**：3D 命名/预算/LOD 规则已提升到 `ART_RESOURCE_RULES.md §16` + `art_quality_budget.json rules3d` 作为唯一权威；`gen_art_spec.py` 与 `asset_validate.py` 均引用读取（gen_art_spec.py 的硬编码将在 P2 同步改为读取 §16）。
- **关键缺口（P0）**：3D 校验器 `tools/asset_validate.py` 已建成，`art_pipeline.py`（P2）与 SKILL.md（P3）的 3D 门禁可直接调用。

### 9.4 P2（art_pipeline.py 3D 分支）落地验证（已通过）
- `py_compile` 通过；`encoding_audit --ci`：`scanned=499, issues=0`（2D 路径零回归）。
- **端到端测试**（隔离测试资产 `characters/CHR_TestPipe_A.glb` / `bosses/BOSS_TestPipe_X.glb`，测后已清理、进度已 reset）：
  - 良好 3D 角色：`validate` → **PASS**；`import` → 复制到 `assets/resources/models/characters/CHR_TestPipe_A.glb`（prefab 缺省则仅落模型）；`generate` → 打印「跳过 AI 生成（3D 资产，需经 Blender→glb→Prefab 流程）」；`audit` → 标注 `[3D建模]`。
  - 越预算 Boss：`validate` → **FAIL**，正确报 `三角面超标: 99999 > 7000; 骨骼数超标: 200 > 60; 贴图尺寸超标: 4096 > 512`。
- **修复的缺陷**：初版 `_rules3d_bucket` 桶名与 `art_quality_budget.json` 实际键（`bosses_final`/`bosses_mini`/`effects_normal`/`effects_boss`/`tiles`）不一致，且误用 `maxTextureSize`（实际字段为 `textureSize`），导致 BAD 资产被误判 PASS；已对齐桶名与字段名后复测通过。
- **2D 路径零回归**：所有 2D 分支（TEXTURES_DIR import、image 技术门禁、`dim` 形参默认值 `None`、ProgressTracker 仅增字段）均未改动既有行为。
