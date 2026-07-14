# UI-3D 预览基础设施 — 任务集索引（计划外追加）

> **编码**: UTF-8
> 依据: `docs/ai-tasks/_agent_contract.md` + `_architecture_report.md` + `docs/2D转3D实施计划.md`
> 状态: **执行中（T1A–T5 已全部落地；B-lite 默认关闭，待 backdrop 3D 资产就绪后仅改 `ui3d.json` 即可开启）** —— 计划期不创建/修改源文件；各任务已按 `Plan Approved` 完成落地。

## 0. 范围声明（必须人工确认）

`main.scene` / `splash.scene` 是 2D 正交 UI 场景，架构上**从未为"在 2D UI 内嵌 3D"预留设施**。
当前 CreatePanel 用"运行时 new 透视相机 + 挂场景根 + 找独立层"的**补丁式**做法绕过，导致按钮被透视相机扭曲、且其它面板无法复用。

⚠️ **本任务集不在 `2D转3D实施计划.md` 的 Demo0-6 / 垂直切片 / Phase1-6 列表中**（该计划以地牢/战斗 3D 为主线）。
按 `_agent_contract.md` 铁律 1/5/6：**AI 不得自行把本任务写入计划、也不得私自扩大修改面**。
因此本任务集标记为 **计划外追加（out-of-plan addendum）**，需用户在下方"开放问题"中显式授权后，方可进入执行。

## 1. 根因（已确认，不再查）

| 场景 | 主相机 `_projection` | 渲染 3D？ |
|---|---|---|
| `dungeon.scene` | `1`（透视） | ✅ |
| `main.scene` | `0`（正交） | ❌ |
| `splash.scene` | `0`（正交） | ❌ |

根因 = UI 场景正交相机不渲染 3D + 无统一预览设施 → 每个面板各写一套绕过逻辑（补丁）。

## 2. 根源方案（非补丁）— RenderTexture + slotNode（评审升级版）

> 评审否决了旧的 `anchorWorldPos + 单相机盖 UI` 方案（位置/层级/适配/遮罩不根治）。改为**离屏渲染**路线：

```
3D 模型（PREVIEW 用户层，离屏 rig）
  -> PreviewCamera（targetTexture = RenderTexture，不上屏）
  -> SpriteFrame(texture = RenderTexture)
  -> UI Sprite（挂业务面板的槽位节点内，跟随 UITransform）
```

优点：**完全不碰 UI 相机 / 不扭曲按钮 / 不受 clearFlags/层级影响 / 遮罩·九宫格·布局系统全部正常 / 分辨率自适应（Sprite 跟槽位走）**。

分两层基础设施：
- **T1A `PreviewSurface`**：离屏底座（RenderTexture + 预览相机 + **用户层池** + 槽位 Sprite），与角色渲染**零耦合**，只暴露 `modelRoot`/`previewLayer`。
- **T1B `SceneModelPreview`**：面板级门面 `showCharacterInSlot / showModelInSlot / showBackdrop / clearOwner`，挂载 **100% 委托** `CharacterVisualService`/`CharacterModelAssembler`。

关键订正（评审发现）：
- 预览层必须用**用户层 bit 0-19**；`1<<20~1<<25` 全是 Cocos 保留层（旧草案的 `1<<22`=`EDITOR`，禁用）。
- RenderTexture 方案下 splash/main **无需**再给 `.scene` 加透视相机（预览相机在 T1A 内部、渲染到离屏 RT）。

面板调用示例：
```ts
await SceneModelPreview.instance.showCharacterInSlot(this._modelDisplay, id, 'attack', { ownerId:'CreatePanel', forceUnlit:true });
await SceneModelPreview.instance.showBackdrop('models/ui/main_backdrop', { ownerId:'MainScene' });
```

## 2.5 结构树对齐（权威蓝图：`回到地面/docs/三场景完整结构树.md`）

> 本任务集**必须对齐** `docs/三场景完整结构树.md`（含附录 A 真实场景基线）。此前任务卡与结构树有多处不一致，已按下列真实结构收紧。

### 2.5.1 CreatePanel 真实结构（附录 A §2.5）

CreatePanel 已**不是**传统 `PanelFrame/ContentRoot` 驱动。运行时真实结构：

```
CreatePanel (PanelRoot)          [CreatePanel, ResponsivePanelRoot, CreatePanelLayout]
  ├─ SelectView*                 (运行时创建，PanelRoot 直接子)
  │    └─ PreviewZone*
  │         └─ ModelDisplay*     [UITransform, Sprite]  ← 3D 预览槽（RenderTexture surface）
  ├─ NamingView*                 (运行时创建，切换显隐)
  ├─ ActionZone*                 (运行时创建)
  └─ PanelFrame / ContentRoot    (仅旧兼容，勿假设所有 UI 都在此下)
```

约束：
- ui3d_preview **不得**假设所有 UI 都在 `PanelFrame/ContentRoot` 下。
- **不得**要求手动绑定 `ModelDisplay3D`——`SelectView/PreviewZone/ModelDisplay` 都是运行时创建的节点，底座必须支持"运行时把这个节点当 slot 传入"。
- `ModelDisplay` 只是 `[UITransform, Sprite]` 的 RenderTexture 承载面，**不直挂** `ModelComponent`。

### 2.5.2 T1 API：`anchorWorldPos` → `slotNode`

因 CreatePanel/SelectView/PreviewZone/ModelDisplay 均运行时创建，位置受 `CreatePanelLayout` / `ResponsivePanelRoot` / Canvas 缩放影响，**只有传 slotNode**、底座自行读 `UITransform` 才能自适应：

```ts
// ✅ 采用
showCharacterInSlot(slotNode: Node, characterId: string, action?: string, opts?): Promise<Handle>
// ❌ 否决
showCharacter(anchorWorldPos: Vec3, ...)
```

`SceneModelPreview` 职责统一为：`showCharacterInSlot / showModelInSlot / showBackdropInSlot / showBackdrop / clearOwner / clearAll`。

### 2.5.3 CharacterPanel 复用固定 PreviewSlot（不运行时新建锚点）

附录 A 显示 CharacterPanel 有固定 `PanelRoot/PanelFrame/ContentRoot/SlotContainer`。T3 **不得**让脚本运行时新建锚点/自算坐标，而是：

```
CharacterPanel (PanelRoot)
  └─ PanelFrame
       └─ ContentRoot
            ├─ SlotContainer     (既有)
            └─ PreviewSlot       [UITransform, Sprite]  ← 新增，与 SlotContainer 并列
```

`PreviewSlot` 的创建/布局由 **`CharacterPanelLayout`** 管理，面板脚本只把它作 slotNode 传给 `showCharacterInSlot`。

### 2.5.4 MainMenuBackdrop3D 需显式创建 + 置底

附录 A 真实 `main.scene` 的 Canvas 子节点**无** `MainMenuBackdrop`。T4 必须显式：
- 创建（或复用）`Canvas/MainMenuBackdrop3D` `[UITransform, Sprite]`；
- `setSiblingIndex(0)` 置于 `MainUI` 之前（渲染在底，不遮挡 UI/按钮）；
- 不拦截触摸；层 `UI_2D`。

### 2.5.5 结构树自身订正

结构树 §2 正文原把 `ModelDisplay3D [ModelComponent, SkinnedMeshRenderer]` 挂在 UI 节点下——**错误**，已改为 `PreviewZone → ModelDisplay [UITransform, Sprite]`（RenderTexture 贴图承载）。§1 splash 亦已注明 T5 为 P3 额外扩展。

## 3. 任务拆分（每任务 ≤2~3 文件，独立成卡）

| 任务 | 优先级 | 文件 | 内容 | 依赖 | 状态 |
|---|---|---|---|---|---|
| T0 | — | （内联修复） | 修 `CharacterModelAssembler.ts` L131 `targetLayer` 自引用（TDZ 崩溃）→ `targetLayerArg` | 无 | **已完成** ✅ |
| T1A | **P0** | `T1A_preview_surface.md` | `PreviewSurface` 离屏底座（RT+相机+用户层池+槽位 Sprite），零角色耦合 | T0 | **已完成** ✅ |
| T1B | **P0** | `T1B_scene_model_preview.md` | `SceneModelPreview` 门面（`showCharacterInSlot(slotNode,...)` slot API），委托挂载 | T1A | **已完成** ✅ |
| T2 | **P1** | `T2_createpanel_refactor.md` | CreatePanel 删补丁、把运行时 `SelectView/PreviewZone/ModelDisplay` 作 slot 传入 | T1A+T1B | **已完成** ✅ |
| T3 | **P1** | `T3_character_panel_3d.md` | CharacterPanel 复用固定 `ContentRoot/PreviewSlot`（由 `CharacterPanelLayout` 管理）接入 3D | T1A+T1B | **已完成** ✅ |
| T4 | **P2** | `T4_mainmenu_backdrop_3d.md` | MainMenuBackdrop 3D 背景（创建 `Canvas/MainMenuBackdrop3D` 置底）+ 接线（B-lite 默认关闭） | T1A+T1B | **已完成** ✅（代码+配置就位，资产就绪后仅改 `ui3d.json` 开启） |
| T5 | **P3** | `T5_splash_3d_bg.md` | Splash 3D 背景（方案 B：复用 `splashImage` 作全屏 slot，不新建节点） | T1A+T1B+T4 方案 | **已完成** ✅（B-lite 默认关闭，资产就绪后仅改 `ui3d.json` 开启） |

> `T1_scene_model_preview.md` 已标记 SUPERSEDED（内容迁至 T1A/T1B）。
> 执行顺序：T0(done) → **P0** T1A(done) → T1B(done) → **P1** T2(done) / T3(done) → **P2** T4(done) / **P3** T5(done)。全部落地，B-lite 默认关闭待资产。
> 优先级依据见 §2.5「结构树对齐」——T1(slot 底座) 是所有面板的根治前提，故为 P0；CreatePanel/CharacterPanel 是有真实结构可对齐的实际界面，故 P1；MainMenuBackdrop 需新建节点且资产来源未定，故 P2；Splash 3D 背景与主约束相斥，属可选扩展，故 P3。

## 4. 已确认决策（用户拍板，2026-07-13）

1. **范围授权**：授权为**计划外追加**（out-of-plan addendum）。按本目录任务卡执行，每任务仍走 Step2.5 Execution Plan → 等待 `Plan Approved`。
2. **相机归口**：预览相机由 `PreviewSurface`(T1A) **自管**，渲染到离屏 RT，不与 `CameraBrain`（Demo2）耦合，职责不重叠。
3. **挂载去重**：模型挂载 **100% 委托 `CharacterVisualService`/`CharacterModelAssembler`**（含角色键解析/targetLayer/auto-fit/forceUnlit/sprite 回退）。**不新写挂载逻辑、不另起 `ModelRenderService` 路径**（核查确认其全项目零接线）。
4. **渲染路线**：采用 **RenderTexture + slotNode**（评审升级）；否决 `anchorWorldPos + 单相机盖 UI`。
5. **预览层**：用**用户层 bit 0-19** 的小池（默认候选 `1<<19..1<<16`，T1A Step1 校验空闲）；**禁用** `1<<20~1<<25` 保留层。
6. **生命周期**：T1-A 懒加载单例，**不接 ILifecycle 注册**（不改 `core/**`/`GameBootstrap`）；清理靠 `clearOwner` + `Director.EVENT_BEFORE_SCENE_LAUNCH`。
7. **backdrop 配置（T4/T5）= B-lite（配置驱动，默认关闭）**：采用方案 B 思路，但只加**最小字段**、不把 T4/T5 与大量资源制作绑死。配置文件 `assets/resources/config/ui3d.json`，默认 `enabled=false` / `modelAssetId=""`，无资源时不阻塞主流程、安全降级为原 2D 背景；资源就绪后仅改配置即可开启，无需拆代码。完整规范见 T4 卡「B-lite 配置规范」。

## 5. 开放问题（已闭合）

- **Q-配置（T4/T5）— ✅ 已决策：B-lite（配置驱动，默认关闭）**。
  - 采用方案 B 思路（配置驱动），但只加最小字段、不把 T4/T5 与大量资源制作绑死。
  - 配置文件：`assets/resources/config/ui3d.json`，含 `mainBackdrop` / `splashBackdrop` 两组，默认 `enabled=false` / `modelAssetId=""`。
  - **无资源时安全降级**：`if (!cfg?.enabled || !cfg.modelAssetId) return;`（保持原 2D 背景），不阻塞 T1A/T1B/T2/T3 主流程。
  - **资源就绪后只改配置**（设 `enabled=true` + `modelAssetId`）即可开启，无需拆代码；后续 TapTap/微信/高低画质可在 `quality` 字段继续扩展。
  - 完整字段与 `UI3DBackdropConfig` 接口见 T4 卡「B-lite 配置规范」。T4/T5 **代码已完成**（见 `REPORT_T4/T5.md`），`ui3d.json` 默认 `enabled=false` 待 `BG_*` 资产就绪后仅改配置即可开启，无需再动代码。

## 6. 执行纪律

- 严格 8 步 Pipeline（Step0 扫描→…→Step8 REPORT）。
- 每任务先 `Step2.5 Execution Plan` **等待 `Plan Approved`** 再写代码。
- 每任务完成生成 `REPORT_Tx.md`。
- 不得修改 `2D转3D实施计划.md` / `demoN.md` / `_agent_contract.md` / `_architecture_report.md`。
- `npm run validate:all` 9 门禁必须全过（铁律 9）。
