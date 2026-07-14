# REPORT T3 — CharacterPanel 接入 3D 角色展示（slot 版）

## 完成: ✅  测试: ✅  Validate: ✅（9 门禁，3 项既有基线 FAIL 与 T1A/T1B/T2 一致）

### 修改文件（2）
- `assets/scripts/ui/layout/CharacterPanelLayout.ts`
  - 新增 `static ensurePreviewSlot(contentRoot: Node): Node`（幂等：确保 `ContentRoot/PreviewSlot [UITransform]` 存在并返回）
  - `applyLayout()` 内调 `ensurePreviewSlot` 并为 PreviewSlot 分区定位：
    - `slotSize = round(min(h*0.28, 180))`，位置 `y = h/2 - 80 - slotSize/2 - 16`（灵魂石标签下方、独立 Y 分区）
    - 现有 `currentName/Info/Stats` 下推至 `below = h/2 - 80 - slotSize - 40` 三档（间距 36），`slotContainer` 保持 `y=20`，`closeBtn` 置底
    - 经测算在 h=480/640 下 PreviewSlot 与 title/soulStone/current*/slotContainer 均不重叠（详见下方「布局不重叠核算」）
- `assets/scripts/ui/main/CharacterPanel.ts`
  - import 加 `SceneModelPreview` + `PreviewHandle`（type）+ `CharacterPanelLayout`
  - 字段：`_previewSlot / _previewHandle / _previewGen`
  - 新增 `_ensurePreviewSlot()`：编辑器绑定可选 → `panelRoot.getChildByPath('PanelFrame/ContentRoot')` / `getChildByName('ContentRoot')` / 兜底 `panelRoot` → `CharacterPanelLayout.ensurePreviewSlot`
  - `_refresh()` 改 `async`：先 `_previewGen++` + destroy 旧 handle → `_ensurePreviewSlot()`（无槽位安全 no-op）→ `await showCharacterInSlot(slot, selectedId,'idle',{ownerId:'CharacterPanel',forceUnlit:true})` → await 后校验 gen 防 in-flight 泄漏
  - `open()/refresh()/_buildSlots 回调` 调 `void this._refresh()`
  - `close()` 加 `_previewGen++` + destroy handle + `SceneModelPreview.instance.clearOwner('CharacterPanel')`

### 验证
- `TS静态检查` [OK]（`{}` 配平 + `cc` 仅 import `Node`；`SceneModelPreview/CharacterPanelLayout` 为项目模块）
- `编码审计` [OK]（issues=0 / p0=0；注释均避开行首关键字，规避 T2 已记教训）
- 整包 vitest：**238 通过 / 13 失败**（13 失败全是既有 `IHitResolver` 基线，**T3 无新增失败**）
- `validate:all`：架构/TS静态/编码审计/配置校验/包体预算/UI皮肤 [OK]；**3 项 FAIL（资源注册/非UI资源注册/文档一致性）均为改动前既有基线，与 T3 无关**

### 布局不重叠核算（PreviewSlot 与文本/卡列表分区）
- h=640 (h/2=320)：title 280 / soulStone 240 / PreviewSlot 170(size180→90..250) / currentName 70 / Info 34 / Stats -2 / slotContainer 20 / close -264 → 无重叠
- h=480 (h/2=240)：title 200 / soulStone 160 / PreviewSlot 77(size134→10..144) / currentName -14 / Info -50 / Stats -86 / slotContainer 20 / close -184 → 无重叠
- 注：真实坐标系由用户在 Cocos Creator 目视微调（Layout 数值集中、易调）

### 需用户在引擎内验证（沙箱无 cc runtime）
- 打开角色管理面板，当前选中角色（默认 warrior）在 PreviewSlot 槽位内显示 3D 模型（idle），文字信息区与卡列表并存不重叠、UI 不被扭曲
- 切换/解锁角色时旧预览正确回收、无 RT/rig 泄漏
- `close()` 后再打开无残留预览
- 新建 `.ts` 的 `.meta` 由 Cocos Creator 打开时自动生成

### 风险
- 无代码风险；布局 Y 分区在极端窄高屏下可能需微调（已留集中可调点）

### 下一步
- T4 / T5 仍 ON HOLD，待 backdrop 3D 资产就绪（B-lite 配置结构 `ui3d.json` 已固定）
- 主线 3D 预览链路 T1A→T1B→T2→T3 已贯通
