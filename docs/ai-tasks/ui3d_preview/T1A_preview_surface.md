# T1A — PreviewSurface 离屏 3D 预览底座（RenderTexture）

> 阶段: UI-3D 预览 / 计划外追加（见 INDEX.md）｜ Token Budget: ≤2 文件 ｜ 执行前先读 `_agent_contract.md` + `_architecture_report.md` + `2D转3D实施计划.md`
> 依赖: T0（CharacterModelAssembler 自引用修复，已完成）
> 与 CharacterVisualService **零耦合**（本卡只做底座，不碰角色渲染链路）

## 输入 / 根因

- `main.scene` / `splash.scene` 主相机为 2D 正交（`projection=0`），不渲染 3D；且 UI 坐标/相机投影/Canvas 缩放/分辨率/横竖屏都会影响"把 3D 模型直接盖在 UI 上"的位置——这是 CreatePanel 反复"差一点却调不对"的根因。
- **根治路线（本卡）**：不把 3D 模型盖在 UI 上，而是离屏渲染成纹理再贴回 UI：
  ```
  3D 模型（PREVIEW 层，离屏 rig）
    -> PreviewCamera（targetTexture = RenderTexture）
    -> SpriteFrame(texture = RenderTexture)
    -> UI Sprite（挂在业务面板的槽位节点内，跟随 UITransform）
  ```
  优点：不碰 UI 相机、不扭曲按钮、不受 clearFlags/层级影响；遮罩/九宫格/布局系统全部正常；分辨率自适应简单（Sprite 跟槽位走）。

## 关键事实（执行方必须遵守，勿猜）

1. **预览层必须用用户层（bit 0-19）**。Cocos 3.8 中 `1<<20~1<<25` 全为引擎保留层：
   `IGNORE_RAYCAST=1<<20 / GIZMOS=1<<21 / EDITOR=1<<22 / UI_3D=1<<23 / SCENE_GIZMO=1<<24 / UI_2D=1<<25`。
   ⚠️ 之前草案的 `1<<22` = `EDITOR`，禁止使用。
2. **需要一个小层池**（多槽并发隔离）。RenderTexture 方案下每个 surface = 1 RT + 1 camera + 1 rig；若共用一层，各相机会互相拍到对方的模型。因此每个 surface 分配一个**独立用户层**，相机 `visibility` 只含该层，rig 子树整体设为该层，销毁时归还。默认池候选：`[1<<19, 1<<18, 1<<17, 1<<16]`（Step1 校验空闲，占用则顺延到更低 bit）。
3. **RenderTexture 首次引入项目**（全项目零先例），必须严格按下方 API 写。

## 输出

新增 `assets/scripts/render/PreviewSurface.ts`，导出单例 `PreviewSurface`：

```ts
export interface SurfaceHandle {
  /** UI 层：挂在槽位节点内、显示 RT 的 Sprite 节点（跟随 UITransform） */
  readonly surfaceNode: Node;
  /** 3D 层：离屏 rig 下、位于预览相机正前方、已设为分配层的空节点，供上层挂模型 */
  readonly modelRoot: Node;
  /** 本 surface 使用的预览层 bitmask（上层挂模型时须把模型子树设成此层） */
  readonly previewLayer: number;
  readonly camera: Camera;
  readonly renderTexture: RenderTexture;
  destroy(): void;
}

class PreviewSurface {
  static get instance(): PreviewSurface;

  /**
   * 为槽位节点创建一个离屏预览面：分配层 -> 建 RT -> 建预览相机(targetTexture=RT) ->
   * 在槽位内挂一个填满槽位的 Sprite 显示 RT。返回 handle（modelRoot 为空，等上层挂模型）。
   */
  acquire(slotNode: Node, opts?: {
    width?: number;        // RT 像素宽，默认取 slot UITransform 宽 * clamp(DPR,1,2)，clamp[128,1024]
    height?: number;       // 同上（高）
    transparent?: boolean; // 默认 true：clearFlags=SOLID_COLOR, clearColor.a=0
    clearColor?: Color;    // transparent=false 时的底色
    fov?: number;          // 默认 45
    cameraDistance?: number; // 相机到模型距离，默认 200
    ownerId?: string;      // 便于按 owner 批量清理（登记用）
  }): SurfaceHandle | null;  // 层池枯竭时返回 null（fail-fast，见下方"分配层"策略）

  /** 归还某 owner 的全部 surface */
  clearOwner(ownerId: string): void;
}
```

### acquire 内部实现要点（写死，勿改语义）

1. **分配层（fail-fast，严禁静默复用 last）**：从层池取一个空闲用户层 `previewLayer`。
   - **池未枯竭**：正常分配。
   - **池枯竭（默认 4 个用户层 `1<<19..1<<16` 全占用）**：**`acquire` 返回 `null`，不创建 surface、不渲染**（fail-fast）。上层 `showCharacterInSlot` 已对 `null` 做 no-op，UI 不崩、只是该槽位无预览。
   - ⚠️ **禁止**"池空复用 last + `console.warn`"——这会导致并发 surface 串渲染（多个面板共用一层，互相拍到对方模型），极难排查。
   - （可选回收策略，若要实现更优体验）：池空时销毁**同一 ownerId 最旧**的 surface 后再分配；但**仍不得跨 owner 复用 last**。
2. **RT**：`const rt = new RenderTexture(); rt.reset({ width, height });`
   - **尺寸策略（写死）**：`width/height` 默认由 slot 当前尺寸 × DPR 计算并 clamp 到 `[128, 1024]`：
     ```ts
     const dpr = Math.min(2, Math.max(1, view.getDevicePixelRatio?.() ?? 1)); // 高分屏封顶 2，避免 RT 被撑爆
     const rtWidth  = clamp(Math.ceil(slotUITransform.width  * dpr), 128, 1024);
     const rtHeight = clamp(Math.ceil(slotUITransform.height * dpr), 128, 1024);
     ```
   - 传入 `opts.width/height` 可覆盖，但仍受同一 `[128,1024]` clamp。
3. **rig 根**（全场景唯一，挂 `director.getScene()`，名 `__UIPreviewRig__`，惰性创建）；在其下建本 surface 的 `rigNode`，位置随 surface 索引在 x 轴上大幅错开（如 `x = index * 100000`）确保空间隔离；`rigNode.layer = previewLayer`。
4. **modelRoot**：`rigNode` 下的空节点，`layer=previewLayer`，置于相机正前方（相机在 `(rigX, 0, cameraDistance)` 看 -z，modelRoot 在 `(rigX, 0, 0)`）。
5. **预览相机**：`rigNode` 下 `new Node -> addComponent(Camera)`；
   `projection=PERSPECTIVE; fov; near=1; far=2000; visibility=previewLayer;`
   `clearFlags = transparent ? SOLID_COLOR : SOLID_COLOR;`（透明时 `clearColor = new Color(0,0,0,0)`）
   `camera.targetTexture = rt;`（关键：渲染到离屏 RT，不上屏、不碰 UI 相机）
   相机 `layer` 也设为 `previewLayer`。
6. **SpriteFrame**：`const sf = new SpriteFrame(); sf.texture = rt;`
   ⚠️ RT 贴到 UI 常需翻转 UV：设 `sf.flipUVY = true`（执行后须在编辑器目视确认是否倒置，倒了就切换该值——写清此 checklist）。
7. **UI Sprite**：在 `slotNode` 下建子节点 `__PreviewSurface__`（若已存在先销毁旧的），加 `UITransform`（尺寸=槽位内容尺寸，锚点 0.5,0.5，居中）+ `Sprite`（`sizeMode=CUSTOM, type=SIMPLE, spriteFrame=sf`），`layer` 沿用 `slotNode.layer`（即 UI_2D，正常被 UI 相机渲染）。
8. **resize 适配（最低要求，非增强项）**：slot 的 `UITransform` 尺寸变化必须同步更新 surface 的 `UITransform` 并**重建/重置 RT 尺寸**，否则响应式布局后会出现拉伸/糊图。至少满足：
   - `acquire(slotNode)` 时**按当前 slot 尺寸 × DPR 建 RT**（见上面尺寸策略）。
   - **面板重新打开时重新 `acquire`**（不要用旧 handle 复用旧尺寸 RT）。
   - **`clearOwner(ownerId)` 后再次 `acquire` 必须重建 RT，不复用旧尺寸**（旧 RT 已随 handle 销毁）。
   - 若**未实现全局 resize 监听**（如 `view.on('canvas-resize')` / `Canvas` 尺寸变化自动重算），必须**在文档与代码中显式写明**：`ResponsivePanelLayout` 重排后，业务面板需**重新调用 `showCharacterInSlot(slotNode, ...)`**（旧 handle 先 `destroy`，再重新 acquire）以刷新 RT 尺寸。

## 严格约束

- 本卡**不引用** `CharacterVisualService` / `CharacterModelAssembler`（挂模型是 T1B 的事）。仅暴露 `modelRoot` + `previewLayer` 供上层挂载。
- 只依赖 `cc`（`Node, Camera, RenderTexture, SpriteFrame, Sprite, UITransform, Color, Vec3, view, director, Layers`）。
- 不修改任何既有文件签名（铁律 2）。
- 层从**用户层**分配，禁止用 `1<<20~1<<25` 保留层。

## 允许修改范围
- 新增 `assets/scripts/render/PreviewSurface.ts`
- （可选）新增 `assets/scripts/render/preview_layer_pool.ts`（纯 TS 层池分配，便于单测）

## 禁止修改范围
- `battle/** dungeon/** config/** app/** run/** utils/** core/**`
- `render/CharacterVisualService.ts` / `render/CharacterModelAssembler.ts`（本卡不碰）
- `docs/2D转3D实施计划.md` / `demoN.md` / `_agent_contract.md` / `_architecture_report.md`

## 生命周期（采用 T1-A：懒加载单例，不接 ILifecycle 注册）
- 不注册进 `GameContext` / `LifecycleManager`（避免改 `core/**` / `GameBootstrap`，超出授权）。
- 清理：`handle.destroy()` 显式销毁 + `clearOwner()` 批量 + 监听 `director.on(Director.EVENT_BEFORE_SCENE_LAUNCH)` 在切场景前销毁全部 surface/RT/camera/rig 并归还层。

## 完成定义 (DoD)
- [ ] `acquire(slotNode)` 在 `main`（正交 UI）场景下，能在槽位内显示一张 RT 贴图，且 **完全不影响** UI 按钮/布局（UI 相机不渲染 PREVIEW 层）。
- [ ] 手动往返 `modelRoot` 塞一个测试 mesh（临时验证，验完删除）→ RT 上出现该 mesh，`surfaceNode` 正确显示、无倒置（或已用 `flipUVY` 修正）。
- [ ] 两个并发 surface 各自独立层，互不串渲染。
- [ ] **层池枯竭时 `acquire` 返回 `null`（fail-fast），无 surface 复用 last / 无跨 owner 串渲染**；上层对 null 安全 no-op。
- [ ] **RT 尺寸 = clamp(ceil(slot 尺寸 × Dpr), 128, 1024)**；面板重开 / `clearOwner` 后 re-acquire 均重建 RT（不复用旧尺寸）；未做全局 resize 监听时，文档/代码已写明 ResponsivePanelLayout 重排后需重调用 `showCharacterInSlot`。
- [ ] `handle.destroy()` / `clearOwner()` / 切场景 均能干净回收，无泄漏、层归还。
- [ ] 层池纯 TS 部分有单测（`preview_layer_pool`，含枯竭返回 null 分支）。
- [ ] `npm run validate:all` 9 门禁全过。

## 执行 Prompt
```
你执行 T1A（PreviewSurface 离屏预览底座）。先读 _agent_contract.md + _architecture_report.md + 2D转3D实施计划.md。
允许新增: assets/scripts/render/PreviewSurface.ts (+ 可选 preview_layer_pool.ts)
禁止修改: battle/** dungeon/** config/** app/** run/** utils/** core/** / CharacterVisualService.ts / CharacterModelAssembler.ts / 文档计划文件
步骤: Step0 扫描 -> Step1 读 settings 层配置确认空闲用户层(校验 1<<19..1<<16) -> Step2 Diff -> Step2.5 Execution Plan 等待 Plan Approved
-> Step3 写 PreviewSurface(RT+相机+层池+槽位Sprite，零 CharacterVisualService 耦合) -> Step4 npm run test(层池单测) -> Step5 修复 -> Step6 validate:all -> Step7 提交 [UI3D][T1A] -> Step8 REPORT_T1A.md
关键: 预览层必须用户层(bit0-19)禁用保留层; RT 用 new RenderTexture()+reset; SpriteFrame.texture=rt 并检查 flipUVY; 相机 targetTexture=rt 不上屏。
```

## Checkpoint 模板（REPORT_T1A.md）
```
# REPORT T1A
完成: ✓  测试: ✓(层池)  Validate: ✓ (9 门禁)
新增: PreviewSurface.ts (+preview_layer_pool.ts)
预览层池: <实际分配的空闲用户 bit>
flipUVY: <true/false 目视确认结果>
风险: <RT 尺寸是否随 slot+DPR 重建 / 层池枯竭是否 fail-fast 返回 null / 全局 resize 监听是否接入，若未接入是否已在文档写明需重调用 showCharacterInSlot>
```
