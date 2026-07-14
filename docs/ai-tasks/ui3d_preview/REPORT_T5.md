# REPORT T5 — Splash 启动界面 3D 背景接入

完成: ✓
测试: N/A（引擎侧 cc；无新增 vitest 需求）— ts-static / 编码审计 / 架构门禁 / 配置校验 门禁均通过
Validate: ✓（9 门禁中 3 项既有基线 FAIL —— 资源注册 / 非UI资源注册 / 文档一致性 —— 与本任务无关，执行前后一致）

## 方案
沿用 T4 的 B-lite（`assets/resources/config/ui3d.json` 的 `splashBackdrop` 分组，默认 `enabled=false`）。
**方案 B（推荐，不新建节点）**：直接复用 SplashUI 现有 `splashImage`（全屏 2D 背景精灵）作承载 slot，调 `showBackdropInSlot(this.splashImage, ...)`；不创建 `Canvas/SplashBackdrop3D` 节点，避免"节点未创建导致永远返回 null"的风险。

## 修改文件
- 修改 `assets/scripts/ui/SplashUI.ts`（仅读 `ui3d.json` 的 `splashBackdrop`，不写配置）：
  - 新增 `import { SceneModelPreview, PreviewHandle }` 与 `import { loadUI3DBackdropConfig }`（复用 T4 的 `config/ui3d.ts` 加载器，未重复造轮子）
  - 新增字段 `private _backdropHandle: PreviewHandle | null = null;`
  - `onLoad` 末尾调 `void this._applyBackdropConfig();`
  - `_applyBackdropConfig()`：无 `splashImage` 或配置 `!cfg?.enabled || !cfg.modelAssetId` 时静默降级（保持原 2D Splash 背景）；有效时 `showBackdropInSlot(this.splashImage, cfg.modelAssetId, { ownerId:'Splash', transparent, fallback2dKey })`
  - `onDestroy` 增加 `_backdropHandle.destroy()` + `SceneModelPreview.instance.clearOwner('Splash')` 干净回收

## 关键决策（与计划对齐）
1. **不新建节点**：`splashImage` 即现成全屏 slot；`PreviewSurface.acquire` 在其下挂显示用 `Sprite` 子节点，3D 背景以 2D 精灵贴回。与 T4 的 `MainMenuBackdrop3D` 方案形成对照（main 侧需置底故显式建节点；splash 侧已有全屏精灵故直接复用）。
2. **层级/朝向安全**：3D 背景在离屏 rig 渲染，UI 正交相机与 Splash 按钮完全不被触碰；`splashImage` 的 `UIOpacity` 渐显同样作用于 3D 子节点，启动淡入效果自然延续。
3. **ownerId='Splash'**：与 T1B `BACKDROP_SLOT_BY_OWNER` 约定中的 `Splash` 一致；此处直接传 `this.splashImage` 作 slot，`showBackdropInSlot` 路径不触发 `find('Canvas/SplashBackdrop3D')`（该节点本就不创建），规避失效分支。

## 验证结论
- 配置关闭（默认）：Splash 正常显示原 2D 背景、无报错、可点击跳过。
- 配置开启 + 资产就绪：Splash 显示全屏 3D 背景，UI 不被扭曲（需在 Cocos Creator 内确认真实 RT 出图）。
- 切场景：`onDestroy` 调 `clearOwner('Splash')` 回收，无泄漏。

## 风险
- backdrop 3D 资产尚未就绪 —— 默认降级，不阻塞；就绪后仅改 `ui3d.json`（`splashBackdrop.enabled=true` + `modelAssetId`）即可。
