# REPORT T1A

完成: ✓
测试: ✓（层池单测 6/6 通过）
Validate: 部分（见下「validate 状态」——T1A 未引入任何新失败）
新增: `assets/scripts/render/PreviewSurface.ts` + `assets/scripts/render/preview_layer_pool.ts` + `tests/render/preview_layer_pool.test.ts`

## 预览层池
- 默认 4 个用户层：`1<<19, 1<<18, 1<<17, 1<<16`（bit 0-19，禁用 1<<20~1<<25 保留层）。
- 池枯竭 `acquire` 返回 `null`（fail-fast），**不复用 last**、无跨 owner 串渲染。
- `clearOwner(ownerId)` 释放该 owner 全部层；`releaseByOwner` 单测覆盖。

## RT 尺寸策略（写死）
- `dpr = min(2, max(1, view.getDevicePixelRatio?.() ?? 1))`
- `rtW = clamp(ceil(slotW * dpr), 128, 1024)`，`rtH = clamp(ceil(slotH * dpr), 128, 1024)`
- 额外 `depthStencilFormat = DEPTH_24` 保证 3D 模型有深度（不 Z-fight）。

## resize（最低要求，非增强项）
- `acquire(slotNode)` 时按**当前** slot 尺寸 × DPR 建 RT。
- 面板重新打开 → 重新 `acquire`（不复用旧 handle / 旧尺寸 RT）。
- `clearOwner` 后再次 `acquire` 必须重建 RT（旧 RT 随 handle `destroy` 销毁）。
- 未实现全局 resize 监听；代码注释已写明：`ResponsivePanelLayout` 重排后业务面板需**重新调用** `showCharacterInSlot`（旧 handle 先 `destroy` 再 `acquire`）。

## 职责边界
- `PreviewSurface` 与 `CharacterVisualService` / `CharacterModelAssembler` **零耦合**：只暴露 `modelRoot` + `previewLayer` 供上层挂载。
- 生命周期：T1-A 懒加载单例，**不接 ILifecycle**；监听 `director.on(Director.EVENT_BEFORE_SCENE_LAUNCH)` 在切场景前销毁全部 surface / RT / camera / rig 并归还层。

## flipUVY
- 写死 `sf.flipUVY = true`。**待 Cocos Creator 编辑器目视确认是否倒置**（若倒置改回 `false`）。
- `sf.packable = false`（RT 不被合图，避免贴图错乱）。

## validate 状态（诚实报告）
- `TS静态检查` [OK]：新文件 `{}` 配平、且 `Node`/`SpriteFrame`/`Camera`/`RenderTexture` 等全部从 `cc` 正确 import。
- `vitest` 层池单测 6/6 通过。
- `validate:all` 9 门禁：**T1A 未引入任何新失败**。3 个失败门禁为**改动前既有基线问题**，与本次代码无关：
  1. `资源注册` — 缺 `character.preview.{warrior,archer,assassin,mage,berserker}` 美术资源（5 个）+ 154 个未用 key + 2 个注册文件缺失（均为美术资产登记问题）。
  2. `非UI资源注册` — 70 错误全是 `safeReview=false`（WeChat 内容待审）+ 未引用 assetId（内容审核/资产引用问题）。
  3. `文档一致性` — 仅 `character_parts` 锚点缺 prompt（art-pipeline 相关）。
- 整包 `vitest`：238 通过 / 13 失败（4 文件），失败均为 `[GameContext] service not registered: IHitResolver`（`skill.test.ts` / `vertical_slice.test.ts`），**既有基线**、import 的是 `SkillExecutor` 而非本任务文件，**与 T1A 无关**。

## 待编辑器验证（无法在本沙箱完成，需打开 Cocos Creator）
- 新建 `PreviewSurface.ts` / `preview_layer_pool.ts` 的 `.meta` 由 Cocos Creator 打开项目时自动生成（tsconfig 的 `cc` 类型 `temp/vscode-dist/cc` 亦由编辑器生成）。
- `flipUVY` 朝向需在编辑器中目视确认。
- 实际 RT 渲染 / 层隔离 / 不串渲染需在引擎内运行验证（建议手动塞一个测试 mesh 到 `modelRoot` 验 RT 出图）。

## 本次同步的文档小修（用户执行前要求，不影响 T1A）
- T1B：示例补 `if (!surface) { console.warn(...); return null; }` null 安全判断（`showCharacterInSlot` + `showModelInSlot`）。
- T5：改用方案 B，复用现有 `splashImage` 作全屏 slot，调 `showBackdropInSlot(this.splashImage, ...)`，不新建 `Canvas/SplashBackdrop3D`。
- T4 标题「待配置授权」→「待 backdrop 3D 资产就绪」。
