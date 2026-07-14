# T1 —（已废弃，SUPERSEDED）

> ⚠️ 本卡的 `anchorWorldPos + 单相机盖 UI` 方案在评审中被否决（位置/层级/适配/遮罩不根治）。
> 已拆分为 **RenderTexture + slotNode** 的两张新卡：
>
> - `T1A_preview_surface.md` —— 离屏预览底座（RenderTexture + 预览相机 + 用户层池 + 槽位 Sprite），与角色渲染零耦合。
> - `T1B_scene_model_preview.md` —— 面板级门面（`showCharacterInSlot / showModelInSlot / showBackdrop / clearOwner`），挂载 100% 委托 `CharacterVisualService`。
>
> 另有 **T0**：已修复 `CharacterModelAssembler.ts` 第 131 行 `targetLayer` 自引用（TDZ 崩溃）——`targetLayerArg` 现已生效。
>
> 执行顺序：T0(done) → T1A → T1B → T2 → T3 →（T4/T5 待配置授权）。
