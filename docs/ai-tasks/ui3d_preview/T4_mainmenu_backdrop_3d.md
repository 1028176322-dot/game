# T4 — MainMenuBackdrop 接入 3D 背景（优先级 P2；代码已完成，B-lite 默认关闭待资产）

> 阶段: UI-3D 预览 / 计划外追加 ｜ 依赖: **T1A + T1B** ｜ 优先级: **P2** ｜ Token Budget: ≤3 文件
> 状态: **已完成（代码落地，B-lite 默认关闭待资产）** —— 渲染链路与接线已按 Execution Plan 落地并通过验证（见 `REPORT_T4.md`）。`ui3d.json` 默认 `enabled=false` + `modelAssetId=""`，待 `BG_*` 3D 背景资产就绪后仅改配置即可开启，无需再动代码。

## 输入
- `ui/main/MainMenuBackdrop.ts` 已写好但**从未接入场景**，且直接把 `ModelComponent` 挂在 UI 节点上（正交相机下不可见）。
- `MainSceneController.ts` 有 `_ensurePersistentMainBackground` 钩子可挂 backdrop。
- T1B 提供 `showBackdrop(backdropModelAssetId, opts)`——全屏 3D 背景（走 T1A 离屏 RT，非槽位）。

### 结构树约束（对齐 `docs/三场景完整结构树.md` §2 / 附录 A §2）
- 附录 A 真实基线中 **main.scene 无 MainMenuBackdrop 节点**（Canvas 直接子只有 MainUI / 各 Panel / Shop / MainSceneController）。因此 T4 必须**明确创建节点位置与层级**，不能只写"在 `_ensurePersistentMainBackground` 挂 backdrop"。
- **节点路径与层级（写死）**：背景节点为 **`Canvas/MainMenuBackdrop3D`**（`UITransform + Sprite`，承载离屏 RT 贴回的全屏贴图）。
  - **兄弟序**：必须置于 `Canvas` 下、`MainUI` **之前**（`setSiblingIndex(0)` 或插到 MainUI 前），保证渲染在**所有 UI 之下**——背景在底、按钮在上。
  - **不遮挡/不拦截**：`MainMenuBackdrop3D` 及其 Sprite 不得拦截触摸（不加 Button/BlockInputEvents），避免盖住 MainUI 按钮点击。
  - 层：`UI_2D`（与其它 UI 同层，正常被 UI 相机渲染）；3D 模型本体在 T1A 的离屏预览层，不进 main 场景可见层。

## 配置决策（已定：B-lite，配置驱动、默认关闭）

> 见 INDEX §4 决策 7 / §5 已闭合。**采用方案 B 思路但最小字段、默认关闭**，不把 T4 与资源制作绑死。
> 背景/槽位是**两类不同 API**：角色预览用 `showCharacterInSlot`，全屏背景用 `showBackdrop`（T1B 便捷封装）/`showBackdropInSlot`（规范 API，传全屏 slot 节点）。

### B-lite 配置规范（`assets/resources/config/ui3d.json`）

T4 执行时**第一步创建该配置文件**（默认关闭，零运行风险）。结构固定，后续可扩展：

```json
{
  "version": 1,
  "mainBackdrop": {
    "enabled": false,
    "modelAssetId": "",
    "fallback2dKey": "ui.main.bg",
    "quality": "auto",
    "transparent": false
  },
  "splashBackdrop": {
    "enabled": false,
    "modelAssetId": "",
    "fallback2dKey": "ui.splash.bg",
    "quality": "auto",
    "transparent": false
  }
}
```

对应 TS 接口（T4 内定义或置于 `config/ui3d.ts`）：

```ts
export interface UI3DBackdropConfig {
  enabled: boolean;
  modelAssetId: string;
  fallback2dKey: string;
  quality?: 'auto' | 'high' | 'low';
  transparent?: boolean;
}
// 顶层： { version: number; mainBackdrop: UI3DBackdropConfig; splashBackdrop: UI3DBackdropConfig }
```

**加载失败 / 配置缺失统一降级**（T4/T5 共用，写死）：
```ts
const cfg = bundleLoader.get<UI3DBackdropConfig>('ui3d', 'mainBackdrop'); // 或 resources.load
if (!cfg?.enabled || !cfg.modelAssetId) {
  return; // 保持现有 2D 背景，不报错、不阻塞主菜单
}
```

> 资源就绪后**只改配置**：把 `enabled` 置 `true`、`modelAssetId` 填 `"models/ui/main_backdrop"` 即可开启，无需拆代码。
> 默认 `enabled=false` / `modelAssetId=""` 时，即使 T1A/T1B/T2/T3 已落地，也不影响主流程。

## 输出
- 新增 `assets/resources/config/ui3d.json`（默认关闭，见上「B-lite 配置规范」）。
- 修改 `assets/scripts/ui/main/MainMenuBackdrop.ts`：
  - 移除"直接挂 UI 节点 ModelComponent"的无效做法；改为在 `Canvas` 下确保 `MainMenuBackdrop3D`（`UITransform+Sprite`，`setSiblingIndex(0)` 置底）作为背景 surface 槽位。
  - 读取 `ui3d.json` 的 `mainBackdrop`；按上面降级规则 `if (!cfg?.enabled || !cfg.modelAssetId) return;`（保持原 2D 背景）。
  - 有效时调 `SceneModelPreview.instance.showBackdrop(cfg.modelAssetId, { ownerId:'MainScene', transparent: cfg.transparent ?? false, fallback2dKey: cfg.fallback2dKey })`（T1B 内部解析 `Canvas/MainMenuBackdrop3D` 全屏 slot）。
- 修改 `assets/scripts/MainSceneController.ts`：在 `_ensurePersistentMainBackground` 创建/复用 `Canvas/MainMenuBackdrop3D` 节点（置于 MainUI 之前，见「结构树约束」）并挂 `MainMenuBackdrop` 组件（节点创建是 T4 职责，T1B 仅解析不创建）。

## 严格约束
- 仅"创建节点 + 读配置 + 接入 T1B + 静默降级"，不新增预览/相机逻辑（铁律 3）。
- 不改 `SceneModelPreview` / `PreviewSurface` 签名（铁律 2）。
- 配置/资产缺失必须静默降级为原 2D 背景，不得阻断主菜单。
- `ui3d.json` 创建属 B-lite 既定决策，**不需额外授权**（默认关闭、零运行风险）；但仅 T4 执行期创建，计划期不预建。

## 允许修改范围
- 新增 `assets/resources/config/ui3d.json`（默认关闭）
- `assets/scripts/ui/main/MainMenuBackdrop.ts`
- `assets/scripts/MainSceneController.ts`（仅 `_ensurePersistentMainBackground` 接线段 + 配置读取）

## 禁止修改范围
- `render/SceneModelPreview.ts` / `render/PreviewSurface.ts`
- `battle/** dungeon/** app/** run/** utils/** core/**` / 文档计划文件

## 完成定义 (DoD)
- [ ] `Canvas/MainMenuBackdrop3D` 节点存在、置于 MainUI 之前（渲染在 UI 之下）、不拦截触摸
- [ ] 主菜单出现全屏 3D 背景（`backdropModelAssetId` 有效时），UI 不被扭曲、按钮可正常点击
- [ ] 资产/配置缺失时主菜单正常显示原 2D 背景、无报错
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
[DONE] 已执行并通过验证（见 REPORT_T4.md）；配置结构固定为 B-lite，默认关闭，待 BG_* 资产就绪仅改 ui3d.json 即可开启。以下为当时执行 Prompt，留存备查。
你执行 T4（MainMenuBackdrop 3D 背景）。先读 T1A/T1B 卡 + 结构树 §2/附录A §2 + MainMenuBackdrop.ts + MainSceneController._ensurePersistentMainBackground。
允许修改: assets/resources/config/ui3d.json(新建,默认关闭), assets/scripts/ui/main/MainMenuBackdrop.ts, assets/scripts/MainSceneController.ts(仅 _ensurePersistentMainBackground 接线段+配置读取)
禁止修改: render/SceneModelPreview.ts / render/PreviewSurface.ts 及范围外目录
步骤: Step0 扫描 -> Step1 读现状 + T1B showBackdrop/showBackdropInSlot + 结构树 MainMenuBackdrop3D 置底约束 -> Step2 Diff -> Step2.5 Execution Plan 等待 Plan Approved
-> Step3 建 ui3d.json(默认关闭) -> Step3b 改 MainMenuBackdrop 用 showBackdrop + 降级规则 + MainSceneController 创建 Canvas/MainMenuBackdrop3D 置底接线 -> Step4 test -> Step5 修复 -> Step6 validate:all -> Step7 提交 [UI3D][T4] -> Step8 REPORT_T4.md
禁止关 Lint/Validate。
```

## Checkpoint 模板（REPORT_T4.md）
```
# REPORT T4
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
方案: B-lite (ui3d.json, 默认 enabled=false)
新增: assets/resources/config/ui3d.json
修改文件: 2 (MainMenuBackdrop.ts, MainSceneController.ts)
验证: 配置关闭时主菜单正常显示原 2D 背景、无报错；配置开启+资源就绪时显示全屏 3D 背景且按钮可点
风险: backdrop 资产是否就绪（未就绪则默认降级，不阻塞）
```
