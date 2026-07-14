# T3 — CharacterPanel 接入 3D 角色展示（slot 版）

> 阶段: UI-3D 预览 / 计划外追加 ｜ 依赖: **T1A + T1B** ｜ Token Budget: ≤3 文件

## 输入
- 审计结论（最高优先级缺口）：`ui/main/CharacterPanel.ts` 当前**只有文字**，完全没有角色形象。
- T1B 提供 `showCharacterInSlot(slotNode, selectedId, 'idle', opts)`——接槽位节点。

### 结构树约束（对齐 `docs/三场景完整结构树.md` §2.1 / 附录 A §2.5）
- CharacterPanel 真实结构：所有内容在 `PanelRoot/PanelFrame/ContentRoot` 下（`TitleLabel/SoulStoneLabel/CurrentName/CurrentInfo/CurrentStats/SlotContainer/CloseBtn`），布局由 `CharacterPanelLayout` 管理。
- **预览槽位规则**：在 `ContentRoot` 下**新增 `PreviewSlot [UITransform, Sprite]`**，与 `SlotContainer`（角色卡列表容器，保持原职责）**并列**；`PreviewSlot` 的位置/尺寸**由 `CharacterPanelLayout` 布局管理**。**禁止**在 CharacterPanel.ts 里运行时新建无来源、自己算坐标的漂移锚点。

## 输出
- 修改 `assets/scripts/ui/main/CharacterPanel.ts`：
  - 取得 `ContentRoot/PreviewSlot` 作为预览槽位（**路径查找优先**，契合项目自动化目标）：
    `CharacterPanelLayout.ensurePreviewSlot(contentRoot)` 确保槽位存在并返回节点（由 Layout 创建/纳管，跟随布局自适应）；兜底：`contentRoot.getChildByName('PreviewSlot')`；**编辑器 `@property(Node) previewSlot` 仅作为可选优化，不作为必须步骤**。缺槽位时该次预览 no-op + `console.warn`，不崩。
  - `_refresh()` / 选中变更时：
    ```ts
    if (!this._previewSlot) return; // 无槽位则跳过
    this._previewHandle?.destroy();
    this._previewHandle = await SceneModelPreview.instance.showCharacterInSlot(
      this._previewSlot, selectedId, 'idle', { ownerId: 'CharacterPanel', forceUnlit: true },
    );
    ```
  - `close()` 时 `SceneModelPreview.instance.clearOwner('CharacterPanel')`。
  - 本面板不造相机/层/RT（全在 T1）。
- （布局纳管）配套修改 `assets/scripts/ui/layout/CharacterPanelLayout.ts`：实现 `static ensurePreviewSlot(contentRoot: Node): Node`，在 `ContentRoot` 下确保 `PreviewSlot [UITransform, Sprite]` 存在并设置其 UITransform 尺寸/位置（与 `SlotContainer` 并列分区），与结构树 §4.4「*PanelLayout 通用规则」一致。

## 严格约束
- 仅"绑/纳管槽位 + 调 T1B"，不新增预览逻辑（铁律 3）。
- 不改 `SceneModelPreview` / `PreviewSurface` 签名（铁律 2）。
- 位置/大小由 `CharacterPanelLayout` + 槽位 UITransform 决定，禁止在面板脚本里硬编码坐标或相机参数。

## 允许修改范围
- 修改 `assets/scripts/ui/main/CharacterPanel.ts`
- 修改 `assets/scripts/ui/layout/CharacterPanelLayout.ts`（仅 `ensurePreviewSlot` + PreviewSlot 分区布局段）

## 禁止修改范围
- `render/SceneModelPreview.ts` / `render/PreviewSurface.ts`
- `battle/** dungeon/** config/** app/** run/** utils/** core/**` / 文档计划文件

## 完成定义 (DoD)
- [ ] `ContentRoot/PreviewSlot` 存在且由 `CharacterPanelLayout` 布局管理（非面板脚本硬编码坐标）
- [ ] CharacterPanel 选中角色时，在 `PreviewSlot` 槽位内显示对应 3D 模型（idle），UI 不被扭曲、与 `SlotContainer` 卡列表并存不重叠
- [ ] 切换角色时旧预览正确回收、无泄漏；无槽位时安全 no-op
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
你执行 T3（CharacterPanel 3D，slot 版）。先读 T1A/T1B 卡 + CharacterPanel.ts + CharacterPanelLayout.ts + 三场景完整结构树.md §2.1/附录A §2.5。
允许修改: assets/scripts/ui/main/CharacterPanel.ts, assets/scripts/ui/layout/CharacterPanelLayout.ts(仅 ensurePreviewSlot + PreviewSlot 分区)
禁止修改: render/SceneModelPreview.ts / render/PreviewSurface.ts 及范围外目录
步骤: Step0 扫描 -> Step1 读 CharacterPanel/Layout + T1B API -> Step2 Diff -> Step2.5 Execution Plan 等待 Plan Approved
-> Step3 ContentRoot 下 PreviewSlot(布局纳管)+@property/兜底获取+调 showCharacterInSlot+close 时 clearOwner -> Step4 test -> Step5 修复 -> Step6 validate:all -> Step7 提交 [UI3D][T3] -> Step8 REPORT_T3.md
禁止关 Lint/Validate。报告里提示用户在编辑器绑定 previewSlot（或确认布局已创建）。
```

## Checkpoint 模板（REPORT_T3.md）
```
# REPORT T3
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
修改文件: 1~2 (CharacterPanel.ts [+CharacterPanelLayout.ts : ensurePreviewSlot])
需人工: 可选——如偏好编辑器绑定，确认 @property previewSlot 已挂；默认走 Layout.ensurePreviewSlot 路径查找，无需手动绑定
风险: 无
```
