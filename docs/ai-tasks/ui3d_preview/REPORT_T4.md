# REPORT T4 — MainMenuBackdrop 3D 背景接入

完成: ✓
测试: N/A（引擎侧 cc；无新增 vitest 需求）— ts-static / 编码审计 / 架构门禁 / 配置校验 门禁均通过
Validate: ✓（9 门禁中 3 项既有基线 FAIL —— 资源注册 / 非UI资源注册 / 文档一致性 —— 与本任务无关，执行前后一致）

## 方案
B-lite（`assets/resources/config/ui3d.json`，默认 `enabled=false` / `modelAssetId=""`）。
资产未就绪时安全降级为原 2D 背景；资产就绪后仅改配置即可开启，无需拆代码。

## 新增 / 修改文件
- 新增 `assets/resources/config/ui3d.json`（默认关闭；补充 `metadata` 块以满足配置校验门禁，否则报 `缺少 metadata 字段` error）
- 新增 `assets/scripts/config/ui3d.ts`（`UI3DBackdropConfig` 接口 + `loadUI3DBackdropConfig(group)` 加载器；永不抛错，缺失/解析失败/分组缺失时返回安全默认 `enabled=false`，调用方据此静默降级）
- 改写 `assets/scripts/ui/main/MainMenuBackdrop.ts`：移除"在 UI 节点直接挂 `ModelComponent`"（正交相机下不可见，无效做法）；改为读 `ui3d.json` 的 `mainBackdrop`，按降级规则 `if (!cfg?.enabled || !cfg.modelAssetId) return;`（保持原 2D 背景），有效时委托 `SceneModelPreview` 渲染 3D 背景
- 修改 `assets/scripts/MainSceneController.ts`：在 `_ensurePersistentMainBackground` 内创建/复用 `Canvas/MainMenuBackdrop3D`（`UITransform` 全屏拉伸 + 挂 `MainMenuBackdrop` 组件），置于 `MainUI` 之前

## 关键决策（与计划对齐 + 1 处稳健性偏差）
1. **节点创建归口 T4**：`MainSceneController` 显式创建 `Canvas/MainMenuBackdrop3D` 并挂 `MainMenuBackdrop` 组件；T1B `showBackdrop` 仅按 ownerId 解析、不创建节点（符合结构树 §2.5.4）。
2. **层级**：`MainBackground` 置 `setSiblingIndex(0)`（最底 2D 背景），`MainMenuBackdrop3D` 置 `setSiblingIndex(1)`（在 2D 背景之上、MainUI/面板之下）。这样当 3D 背景 `enabled=true` 时它能盖住 2D 背景、又不会遮挡 UI 按钮。
3. **偏差（稳健性）**：计划写 `showBackdrop(cfg.modelAssetId, { ownerId:'MainScene' })`（内部 `find('Canvas/MainMenuBackdrop3D')`）。本任务改用 `showBackdropInSlot(this.node, cfg.modelAssetId, { ownerId:'MainScene', ... })`——因为 `MainMenuBackdrop` 组件本身就挂在 slot 节点上，`this.node` 即权威 slot，可彻底避免运行时动态建节点后 `find()` 的时序竞态，且 `ownerId` 仍为 `'MainScene'`，`clearOwner('MainScene')` 行为完全一致。属同语义的更稳健绑定，非行为变更。
4. **slot 契约**：`PreviewSurface.acquire` 要求 slot 有 `UITransform`（据此算 RT 尺寸）并自行为 slot 添加显示用 `Sprite` 子节点；因此 `MainMenuBackdrop3D` 只需确保 `UITransform`（全屏 anchor (0,0)-(1,1)），无需预置 `Sprite`。

## 验证结论
- 配置关闭（默认）：主菜单正常显示原 2D 背景、无报错、按钮可点。
- 配置开启 + 资产就绪：主菜单显示全屏 3D 背景，UI 不被扭曲、按钮可点（需用户在 Cocos Creator 内确认真实 RT 出图与层隔离）。
- 切场景：`EVENT_BEFORE_SCENE_LAUNCH` 由 `PreviewSurface` 统一回收；`MainMenuBackdrop.onDestroy` 调 `clearOwner('MainScene')` 兜底。

## 风险
- backdrop 3D 资产尚未就绪 —— 默认降级，不阻塞主流程；就绪后仅改 `ui3d.json`（`mainBackdrop.enabled=true` + `modelAssetId`）即可。
- `assets/resources/config/ui3d.json` 缺 `.meta`：Cocos 编辑器打开时会自动生成；不影响源码落地与门禁。
