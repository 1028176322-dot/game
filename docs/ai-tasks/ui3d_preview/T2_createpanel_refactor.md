# T2 — CreatePanel 删除补丁、复用 SceneModelPreview（slot 版）

> 阶段: UI-3D 预览 / 计划外追加 ｜ 依赖: **T1A + T1B** ｜ Token Budget: ≤3 文件

## 输入
- `ui/main/CreatePanel.ts` 当前含"运行时 new 透视相机 + 挂场景根 + 找层 + `_resolveUiLayer` / `_resolvePreviewLayer` / `_setSubtreeLayer`"的补丁代码（此前为绕过正交 UI 相机），是按钮被扭曲的根因之一。
- T1B 提供 `showCharacterInSlot(slotNode, id, action, opts)` 统一入口——**接槽位节点，不再接 anchorWorldPos**。

### 结构树约束（对齐 `docs/三场景完整结构树.md` §2 / 附录 A §2.5）
- CreatePanel 真实结构：`SelectView / NamingView / ActionZone` 均为 `PanelRoot` 的**直接子节点、运行时创建**；`PanelFrame/ContentRoot` 仅旧兼容。**不得**假设内容在 ContentRoot 里。
- 预览槽位节点路径固定为 **`PanelRoot/SelectView/PreviewZone/ModelDisplay`**（`UITransform + Sprite`，运行时创建）。T2 必须在**创建/取得该运行时节点后**再把它作为 slotNode 传入；`this._modelDisplay` 语义 = 该运行时 `ModelDisplay` 节点（**不是**世界坐标锚点）。若时序上尚未创建，需在 SelectView 装配完成后再触发预览（不得在 null 上调用）。

## 输出
- 修改 `assets/scripts/ui/main/CreatePanel.ts`：
  - **删除** `_updateModelDisplay` 内全部"动态造相机 / 找层 / 挂场景根 / previewNode / previewCamera"补丁代码，及 `_resolvePreviewLayer` / `_setSubtreeLayer` / `_previewCamera` / `_previewNode` 字段。
  - 改为：
    ```ts
    this._previewHandle?.destroy();
    this._previewHandle = await SceneModelPreview.instance.showCharacterInSlot(
      this._modelDisplay,           // 面板内的预览槽位节点（UITransform）
      id, 'attack',
      { ownerId: 'CreatePanel', forceUnlit: true },
    );
    ```
  - **销毁/隐藏时机（必须全覆盖）**：`close()` 面板关闭、**切换职业**（重建预览前先销毁旧 handle）、**切到 NamingView 阶段**（SelectView 隐藏时预览槽位不可见 → 销毁或隐藏 handle，避免离屏 rig/RT 泄漏），三处都要 `this._previewHandle?.destroy()` 或 `SceneModelPreview.instance.clearOwner('CreatePanel')`。回到 SelectView 时再重新 `showCharacterInSlot`。
  - `_modelDisplay` 由"世界坐标锚点"改为"预览槽位"语义（模型显示在其 UITransform 区域内，位置/大小随布局，天然适配分辨率）。

## 严格约束
- 仅"删补丁 + 改调 T1B"，不新增预览逻辑（铁律 3）。
- 不改 `SceneModelPreview` / `PreviewSurface` 接口签名（铁律 2）。
- 行为目标：warrior 默认预览显示在 PreviewZone 槽位内，UI 完整无扭曲。

## 允许修改范围
- 修改 `assets/scripts/ui/main/CreatePanel.ts`

## 禁止修改范围
- `render/SceneModelPreview.ts` / `render/PreviewSurface.ts`（T1 产出，只调用）
- `battle/** dungeon/** config/** app/** run/** utils/** core/**` / 文档计划文件

## 完成定义 (DoD)
- [ ] CreatePanel 不再含任何动态相机/找层/挂场景根补丁代码
- [ ] slotNode 使用运行时 `PanelRoot/SelectView/PreviewZone/ModelDisplay` 节点（非 anchorWorldPos、非 ContentRoot 假设）
- [ ] 进入创建冒险者界面：warrior 3D 模型显示于 PreviewZone 槽位内，**标题/职业卡片/确认·跳过按钮完整可见、无扭曲**
- [ ] 切换职业刷新预览；切到 NamingView 隐藏/销毁预览、回 SelectView 恢复；close 时干净回收（无 RT/rig 泄漏）
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
你执行 T2（CreatePanel 改造，slot 版）。先读 T1A/T1B 卡 + SceneModelPreview/PreviewSurface 实际产出 + CreatePanel.ts 现状。
允许修改: assets/scripts/ui/main/CreatePanel.ts
禁止修改: render/SceneModelPreview.ts / render/PreviewSurface.ts 及范围外目录
步骤: Step0 扫描 -> Step1 读 CreatePanel 补丁段 + T1B API -> Step2 Diff -> Step2.5 Execution Plan 等待 Plan Approved
-> Step3 删补丁+改调 showCharacterInSlot(this._modelDisplay,...)+close 时 clearOwner -> Step4 test -> Step5 修复 -> Step6 validate:all -> Step7 提交 [UI3D][T2] -> Step8 REPORT_T2.md
禁止重复实现、禁止关 Lint/Validate。
```

## Checkpoint 模板（REPORT_T2.md）
```
# REPORT T2
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
修改文件: 1 (CreatePanel.ts)  删除补丁行: <n>
风险: 无
```
