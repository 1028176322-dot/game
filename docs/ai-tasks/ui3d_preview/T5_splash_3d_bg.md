# T5 — Splash 启动界面 3D 背景（优先级 P3 / 额外扩展；代码已完成，B-lite 默认关闭待资产）

> 阶段: UI-3D 预览 / 计划外追加 ｜ 依赖: **T1A + T1B**（且沿用 T4 的 backdrop 配置方案）｜ 优先级: **P3（额外扩展，非自然延伸）** ｜ Token Budget: ≤3 文件
> 状态: **已完成（代码落地，B-lite 默认关闭待资产）** —— 已按方案 B（复用 `splashImage` 作全屏 slot，不新建节点）落地并通过验证（见 `REPORT_T5.md`）。沿用 T4 的 `ui3d.json`，默认 `splashBackdrop.enabled=false` 时保持 2D 兜底。
>
> ⚠️ **定位（对齐 `docs/三场景完整结构树.md` §1）**：方案 §4.1 明确「splash/login 保持 2D」，故本任务是**额外扩展**而非本次 2D→3D 的自然延伸。仅在 main 侧（T2/T3）稳定、且用户明确要 Splash 3D 背景时才做；**不与 T1-T3 一起排期**。

## 输入
- `ui/SplashUI.ts` 启动背景为 2D 精灵（`splashImage` + `ui.splash.bg`）。
- T1B 提供 `showBackdropInSlot(slotNode, backdropModelAssetId, opts)` 规范 API（走 T1A 离屏 RT，全屏背景）；T5 选用它并直接传入 `splashImage` 作 slot（方案 B，不新建节点）。
- `splash.scene` 主相机为 2D 正交（projection=0）——RenderTexture 方案下**无需给 splash.scene 加透视相机**（预览相机在 T1A 内部、渲染到离屏 RT，背景以 2D Sprite 贴回），这是相较旧方案的又一简化。

## 配置决策（沿用 T4 B-lite，读 `ui3d.json` 的 `splashBackdrop`）

与 T4 同一份 `assets/resources/config/ui3d.json`，T5 读取其中 `splashBackdrop` 分组（默认 `enabled=false` / `modelAssetId=""`）。共用 T4 的降级规则：

```ts
const cfg = bundleLoader.get<UI3DBackdropConfig>('ui3d', 'splashBackdrop');
if (!cfg?.enabled || !cfg.modelAssetId) {
  return; // 保持现有 2D Splash 背景，不报错、不阻塞
}
```

> 资源就绪后只改 `ui3d.json` 的 `splashBackdrop.enabled=true` + `modelAssetId` 即可开启。`UI3DBackdropConfig` 接口与字段含义同 T4。

## 输出

> **Splash 全屏 slot 来源（方案 B，推荐，避免新建节点）**：T5 **不复用** T1B 的 `showBackdrop(ownerId:'Splash')`（该 API 解析 `Canvas/SplashBackdrop3D`，但本任务不创建该节点）。改为**直接复用 SplashUI 现有 `splashImage`（2D 背景精灵）作全屏 slot**，调 `showBackdropInSlot(this.splashImage, modelAssetId, opts)`。优点：少一个新节点、更贴合现有 splash 结构、不存在「节点未创建导致永远返回 null」的风险。

- 修改 `assets/scripts/ui/SplashUI.ts`：
  - 读 `ui3d.json` 的 `splashBackdrop`；按降级规则 `if (!cfg?.enabled || !cfg.modelAssetId) return;`（保持原 2D 背景）。
  - 有效时调 `SceneModelPreview.instance.showBackdropInSlot(this.splashImage, cfg.modelAssetId, { ownerId:'Splash', transparent: cfg.transparent ?? false, fallback2dKey: cfg.fallback2dKey })`（`splashImage` 即现有全屏 2D 背景精灵，作为 RT 贴回的承载槽位）。
  - Splash 销毁/切场景时 `SceneModelPreview.instance.clearOwner('Splash')`。

## 严格约束
- 仅"接入 T1B + 静默降级"，不新增预览/相机逻辑（铁律 3）。
- 不改 `SceneModelPreview` / `PreviewSurface` 签名（铁律 2）。
- 配置缺失静默降级为原 2D（铁律 4）。

## 允许修改范围
- `assets/scripts/ui/SplashUI.ts`（仅**读** `ui3d.json` 的 `splashBackdrop`，不写配置）

## 禁止修改范围
- `render/SceneModelPreview.ts` / `render/PreviewSurface.ts`
- `battle/** dungeon/** app/** run/** utils/** core/**` / 文档计划文件
- `assets/resources/config/ui3d.json`（由 T4 创建；T5 只读）

## 完成定义 (DoD)
- [ ] Splash 在 `backdropModelAssetId` 有效时显示全屏 3D 背景，UI 不被扭曲
- [ ] 缺失时 Splash 正常显示原 2D 背景、无报错
- [ ] 切场景干净回收
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
[DONE] 已执行并通过验证（见 REPORT_T5.md）；沿用 T4 的 ui3d.json，默认 splashBackdrop.enabled=false 保持 2D 兜底。以下为当时执行 Prompt，留存备查。
你执行 T5（Splash 3D 背景）。先读 T1A/T1B 卡 + SplashUI.ts + T4 B-lite 配置规范（ui3d.json 的 splashBackdrop）。
允许修改: assets/scripts/ui/SplashUI.ts（只读 ui3d.json）
禁止修改: render/SceneModelPreview.ts / render/PreviewSurface.ts 及范围外目录 / assets/resources/config/ui3d.json
步骤: Step0 扫描 -> Step1 读现状 + T1B showBackdrop/showBackdropInSlot + T4 ui3d.json splashBackdrop 字段 -> Step2 Diff -> Step2.5 Execution Plan 等待 Plan Approved
-> Step3 改 SplashUI 读 ui3d.json splashBackdrop + 降级规则(缺失保持 2D) + 切场景 clearOwner -> Step4 test -> Step5 修复 -> Step6 validate:all -> Step7 提交 [UI3D][T5] -> Step8 REPORT_T5.md
禁止关 Lint/Validate。
```

## Checkpoint 模板（REPORT_T5.md）
```
# REPORT T5
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
方案: B-lite (ui3d.json splashBackdrop, 默认 enabled=false)
修改文件: 1 (SplashUI.ts)
验证: 配置关闭时 Splash 正常显示原 2D 背景、无报错；配置开启+资源就绪时显示全屏 3D 背景且 UI 不被扭曲
风险: backdrop 资产是否就绪（未就绪则默认降级，不阻塞）
```
