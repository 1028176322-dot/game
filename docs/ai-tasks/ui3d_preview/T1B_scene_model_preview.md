# T1B — SceneModelPreview 面板级预览门面

> 阶段: UI-3D 预览 / 计划外追加（见 INDEX.md）｜ Token Budget: ≤2 文件 ｜ 执行前先读 `_agent_contract.md` + `_architecture_report.md` + `2D转3D实施计划.md`
> 依赖: **T1A（PreviewSurface）** + T0（Assembler 修复，已完成）
> 挂载 **100% 委托** 现有 `CharacterVisualService` / `CharacterModelAssembler`（决策 Q3）

## 输入 / 定位

- T1A 只提供"离屏底座"（RT + 相机 + 层 + 槽位 Sprite），不懂角色。
- 业务面板（CreatePanel / CharacterPanel / MainMenu / Splash）需要的是**一行调用**："把某角色/某模型显示在这个槽位里"。
- T1B 就是这层门面：接 slotNode → 用 T1A 拿底座 → 把模型挂进 `handle.modelRoot`（委托现有链路）→ 返回 `PreviewHandle`。

## 复用（查重，勿重复实现）

- `CharacterVisualService.instance.play(node, visualKey, fps, forceUnlit, targetLayer?)`：角色渲染主链路，`visualKey` 形如 `character.<id>.<action>`，内部解析 → `CharacterModelAssembler.mount` → 支持 2D 回退。
- `CharacterModelAssembler.instance.mount(node, modelAssetId, weaponAssetId?, weaponSocket?, action?, forceUnlit?, targetLayerArg?)`：按 modelAssetId 直挂（无角色键场景，如 backdrop 模型）。**T0 已修复 targetLayerArg 生效**。

## 输出

新增 `assets/scripts/render/SceneModelPreview.ts`，导出单例 `SceneModelPreview`：

```ts
export interface PreviewHandle {
  readonly surfaceNode: Node;   // 槽位内的 UI Sprite（来自 T1A）
  readonly modelRoot: Node;     // 模型挂载根（来自 T1A，已在 PREVIEW 层）
  setAction(action: string): void; // 切动作（委托 assembler.play）
  destroy(): void;
}

class SceneModelPreview {
  static get instance(): SceneModelPreview;

  /** 在 UI 槽位内显示角色 3D（最常用）。visualKey 内部拼 `character.${id}.${action}`。 */
  showCharacterInSlot(
    slotNode: Node,
    characterId: string,
    action?: string,               // 默认 'idle'
    opts?: {
      ownerId?: string;            // 便于按面板批量清理
      forceUnlit?: boolean;        // 默认 true（UI 场景无光照，unlit 保证可见）
      fps?: number;                // 默认 8
      width?: number; height?: number; transparent?: boolean;
    },
  ): Promise<PreviewHandle | null>;

  /** 在 UI 槽位内显示任意模型资源（无角色键，如装备/道具展示）。 */
  showModelInSlot(
    slotNode: Node,
    modelAssetId: string,
    opts?: { ownerId?: string; forceUnlit?: boolean; action?: string;
             width?: number; height?: number; transparent?: boolean; },
  ): Promise<PreviewHandle | null>;

  /** 全屏 3D 背景（主菜单/Splash）——规范 API：由调用方传入已创建的全屏 slot 节点。
   *  内部等价于 `showModelInSlot(slotNode, backdropModelAssetId, opts)`（仅作语义化别名，便于阅读）。 */
  showBackdropInSlot(
    slotNode: Node,
    backdropModelAssetId: string,
    opts?: { ownerId?: string; transparent?: boolean; fallback2dKey?: string; },
  ): Promise<PreviewHandle | null>;

  /** 全屏 3D 背景便捷封装：按 `ownerId` 约定解析全屏 slot 后委托 `showBackdropInSlot`。
   *  - ownerId='MainScene' → 解析 `Canvas/MainMenuBackdrop3D`（由 T4 负责创建节点）
   *  - ownerId='Splash'    → 解析 `Canvas/SplashBackdrop3D`（由 T5 负责创建节点）
   *  若对应全屏 slot 节点不存在 → 返回 null（**不自动建节点**，节点创建是 T4/T5 的职责）。
   *  结论：T1B 拥有"通用 slot API + 全屏 slot 解析"，**不拥有节点创建权**；节点创建/配置加载在 T4/T5。 */
  showBackdrop(
    backdropModelAssetId: string,
    opts?: { ownerId?: string; transparent?: boolean; fallback2dKey?: string; },
  ): Promise<PreviewHandle | null>;

  /** 按 owner 清理该面板的全部预览（面板 close 时调用）。 */
  clearOwner(ownerId: string): void;
}
```

### 实现要点（写死，勿猜）

1. `showCharacterInSlot`：
   ```ts
   const surface = PreviewSurface.instance.acquire(slotNode, { width, height, transparent, ownerId });
   // T1A 层池枯竭时 acquire 返回 null（fail-fast），上层必须安全 no-op，禁止对 null 解引用
   if (!surface) {
     console.warn('[SceneModelPreview] no preview surface available (layer pool exhausted)');
     return null;
   }
   const visualKey = `character.${characterId}.${action ?? 'idle'}`;   // 必须这样拼
   const ok = await CharacterVisualService.instance.play(
     surface.modelRoot, visualKey, opts?.fps ?? 8, opts?.forceUnlit ?? true, surface.previewLayer,
   );
   if (!ok) { surface.destroy(); return null; }
   // 登记 handle -> ownerId，返回 PreviewHandle 包装 surface。
   ```
   - **关键**：`targetLayer` 传 `surface.previewLayer`（T0 已修复使其真正生效），保证模型子树落在该 surface 的独立层，被预览相机拍进 RT、且不被 UI/主相机看到。
2. `showModelInSlot`：同上结构（先 `acquire` → 判 `!surface` 则 `return null` → 再委托挂载），但挂载改调 `CharacterModelAssembler.instance.mount(surface.modelRoot, modelAssetId, undefined, 'Weapon', opts?.action ?? 'idle', opts?.forceUnlit ?? true, surface.previewLayer)`。**同样必须先判 `!surface`，禁止对 null 解引用**（铁律 8 不允许用 `!` 掩盖）。
3. `showBackdropInSlot`：直接委托 `showModelInSlot(slotNode, backdropModelAssetId, opts)`（语义化别名，不新增逻辑）。
4. `showBackdrop`：按 `opts.ownerId` 约定解析全屏 slot 节点（`MainScene`→`Canvas/MainMenuBackdrop3D`；`Splash`→`Canvas/SplashBackdrop3D`），找不到则返回 null（**不自动建节点**）；找到则 `showBackdropInSlot(foundSlot, backdropModelAssetId, opts)`。**配置来源与 2D 回退在 T4/T5 落地**（本卡不接 config）。若 `backdropModelAssetId` 为空则直接返回 null（no-op）。
   - 职责边界（写死）：T1B = 通用 slot API + 全屏 slot 解析委托；**T4/T5 = 节点创建（Canvas/MainMenuBackdrop3D 等）+ 配置加载 + 调用 showBackdrop / showBackdropInSlot**。二者不重叠。
4. `clearOwner` / `PreviewHandle.destroy`：委托 T1A 的 `surface.destroy()` / `clearOwner()`，并移除本类 handle 登记。
5. **不实现任何挂载/解析/缩放/材质逻辑**（全在 CharacterVisualService/Assembler，铁律 3）。

## 严格约束
- 挂载 100% 委托现有链路；本类只做"接 slot → 拿底座 → 委托挂载 → 管 handle"。
- 不改 `CharacterVisualService` / `CharacterModelAssembler` / `PreviewSurface` 签名（铁律 2）。
- 懒加载单例，不接 ILifecycle 注册（与 T1A 一致）；清理靠 `clearOwner` + T1A 的场景切换钩子。

## 允许修改范围
- 新增 `assets/scripts/render/SceneModelPreview.ts`

## 禁止修改范围
- `battle/** dungeon/** config/** app/** run/** utils/** core/**`
- `render/PreviewSurface.ts`（T1A 产物，只调用）/ `CharacterVisualService.ts` / `CharacterModelAssembler.ts`（只调用）
- `docs/2D转3D实施计划.md` / `demoN.md` / `_agent_contract.md` / `_architecture_report.md`

## 完成定义 (DoD)
- [ ] `showCharacterInSlot(slot, 'warrior', 'attack')` 在 main 场景槽位内显示 warrior 3D（RT 贴图），UI 不受影响。
- [ ] `targetLayer` 确实传入并生效（模型只被本 surface 预览相机渲染）。
- [ ] 多面板并发（不同 ownerId）互不干扰；`clearOwner` 正确回收。
- [ ] `showBackdropInSlot` / `showBackdrop` API 存在：`showBackdrop` 按 ownerId 解析全屏 slot 后委托 `showBackdropInSlot`，找不到 slot 返回 null（不自动建节点）；空参 no-op（配置接线留 T4/T5）。
- [ ] 复用既有渲染链路，无新挂载逻辑。
- [ ] `npm run validate:all` 9 门禁全过。

## 执行 Prompt
```
你执行 T1B（SceneModelPreview 门面）。先读 _agent_contract.md + _architecture_report.md + 2D转3D实施计划.md。依赖 T1A 已完成。
允许新增: assets/scripts/render/SceneModelPreview.ts
禁止修改: battle/** dungeon/** config/** app/** run/** utils/** core/** / PreviewSurface.ts / CharacterVisualService.ts / CharacterModelAssembler.ts / 文档计划文件
步骤: Step0 扫描 -> Step1 读 T1A PreviewSurface API + CharacterVisualService.play 签名 -> Step2 Diff -> Step2.5 Execution Plan 等待 Plan Approved
-> Step3 写 SceneModelPreview(showCharacterInSlot/showModelInSlot/showBackdrop/clearOwner, 委托挂载, visualKey=character.${id}.${action}) -> Step4 test -> Step5 修复 -> Step6 validate:all -> Step7 提交 [UI3D][T1B] -> Step8 REPORT_T1B.md
关键: 挂载全委托; targetLayer 必须传 surface.previewLayer; 不实现挂载/缩放/材质。
```

## Checkpoint 模板（REPORT_T1B.md）
```
# REPORT T1B
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
新增: SceneModelPreview.ts
API: showCharacterInSlot / showModelInSlot / showBackdropInSlot / showBackdrop / clearOwner
风险: <backdrop 配置留 T4/T5 / handle 登记回收完整性 / showBackdrop 仅解析 slot 不建节点>
```
