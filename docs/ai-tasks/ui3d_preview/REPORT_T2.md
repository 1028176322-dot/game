# REPORT T2

完成: ✓  测试: ✓(业务逻辑无纯单测，沿用整包 vitest 基线)  Validate: ✓(T2 未引入新失败)

## 修改文件
- `assets/scripts/ui/main/CreatePanel.ts` (1 文件，纯删补丁 + 改调 T1B)

## 删除的补丁代码 (按 T2 卡 §结构树约束)
- 字段：`_previewNode` / `_previewCamera`
- 方法：`_resolveUiLayer()` / `_resolvePreviewLayer()` / `_setSubtreeLayer()`
- `close()` 内移除 `_previewNode.removeFromParent()` / `_previewCamera.node.removeFromParent()`
- `_updateModelDisplay()` 内全部"new 透视相机 + 挂场景根 + 找层 + `CharacterVisualService.play(previewNode,...)` + 子树设层"逻辑
- 相应 import 收敛：移除 `CharacterVisualService` / `director` / `Vec3` / `Layers` / `Camera`

## 新增 / 改写
- 字段：`_previewHandle: PreviewHandle | null`、`_previewGen = 0`(in-flight 竞态令牌)
- import：新增 `SceneModelPreview, PreviewHandle`(`../../render/SceneModelPreview`)
- `_updateModelDisplay(id)`：先 `++_previewGen` 并使旧 handle 失效 →
  `await SceneModelPreview.instance.showCharacterInSlot(this._modelDisplay, id, 'attack', { ownerId:'CreatePanel', forceUnlit:true })` →
  若 `gen !== this._previewGen`(被更新请求/切阶段/关闭 supersede)则 `handle?.destroy()` 丢弃，否则赋值 `_previewHandle`
- `close()`：`_previewGen++` + `_previewHandle?.destroy()` + `SceneModelPreview.instance.clearOwner('CreatePanel')`
- `_setPhase('naming')`：进入命名阶段时 `_previewGen++` + 销毁 `_previewHandle`(SelectView 隐藏)
- 回 SelectView：`_onSkip` 已重调 `_updateModelDisplay`，自动重建

## 语义对齐
- `_modelDisplay` 即运行时 `PanelRoot/SelectView/PreviewZone/ModelDisplay` 节点(UITransform+Sprite 表面)，**非世界坐标锚点**；位置/尺寸随布局自适应分辨率。

## 验证结论 (诚实报告)
- `TS静态检查` [OK]（`{}` 配平 + `cc` 仅 import 用到的符号）
- `编码审计` [OK]（issues=0 / p0=0）—— 中途新注释以 `while ` 开头误触发 1 个 P0，已重述注释规避
- 整包 vitest：**238 通过 / 13 失败**，与 T1A/T1B 后基线完全一致；13 失败全为既有 `IHitResolver service not registered`（`skill.test.ts`/`vertical_slice.test.ts`），与 T2 无关
- `validate:all`：架构 / TS静态 / 编码审计 / 配置校验 / 包体预算 / UI皮肤绑定 [OK]；3 项 FAIL（资源注册 / 非UI资源注册 / 文档一致性）均为改动前既有基线（缺 `character.preview.*` 美术资源 / WeChat 内容待审 / `character_parts` prompt），与 T2 无关

## 需引擎内验证 (沙箱无 cc runtime)
- 进入创建冒险者界面：warrior 3D 模型显示于 PreviewZone 槽位内，标题/职业卡片/确认·跳过按钮完整可见、无扭曲
- 切换职业刷新预览；切到 NamingView 槽位销毁无泄漏；回 SelectView 恢复
- close 时 `clearOwner` 干净回收（无 RT/rig 泄漏）

## 风险
- 无（仅删补丁 + 委托，未改 T1 产出与被委托服务签名；`NodeRef` 为改动前已存在的未用 import，保持最小改动范围未动）
