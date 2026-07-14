# REPORT T1B — SceneModelPreview 门面

完成: ✓  测试: ✓（无新增单测，全 cc 委托）  Validate: ts-static/架构/编码 [OK]，3 项 FAIL 为既有基线

## 新增文件（1）
- `assets/scripts/render/SceneModelPreview.ts` — 面板级预览门面，懒加载单例，零挂载逻辑，100% 委托现有渲染链路。

## API（与 T1B 卡一致）
| API | 行为 | null 安全 |
|---|---|---|
| `showCharacterInSlot(slot, id, action='idle', opts?)` | `acquire`→`!surface` return null→`CharacterVisualService.play(modelRoot, character.${id}.${action}, fps, forceUnlit, previewLayer)`→`!ok` 则 `surface.destroy()` | ✓ |
| `showModelInSlot(slot, modelAssetId, opts?)` | `acquire`→`!surface` return null→`CharacterModelAssembler.mount(modelRoot, id, undefined,'Weapon', action, forceUnlit, previewLayer)`→`!ok` destroy | ✓ |
| `showBackdropInSlot(slot, id, opts?)` | 语义别名→委托 `showModelInSlot`；空 id return null | ✓ |
| `showBackdrop(id, opts?)` | 按 ownerId 用 `find()` 解析 `Canvas/MainMenuBackdrop3D`(MainScene) / `Canvas/SplashBackdrop3D`(Splash)，找不到 return null（**不建节点**）；空 id return null | ✓ |
| `clearOwner(ownerId)` | 委托 `PreviewSurface.instance.clearOwner`（单一真相源在 T1A） | — |
| `PreviewHandle.setAction(action)` | character→再调 `play`（内部 isMounted→clip 切换）；model→`assembler.play(modelRoot, action)` | — |

## 关键实现约束（已满足）
- `targetLayer` 全部传 `surface.previewLayer`（T0 已修复其真正生效），保证模型只被本 surface 预览相机拍进 RT、不被 UI/主相机看到。
- 所有 `acquire()` 返回值先判 `!surface` 再解引用（遵铁律 8，不用 `!` 掩盖 null）。
- 挂载/缩放/材质逻辑 **零实现**，全委托 `CharacterVisualService` / `CharacterModelAssembler`（铁律 3）。
- 未改 `PreviewSurface.ts` / `CharacterVisualService.ts` / `CharacterModelAssembler.ts` 签名（铁律 2）。
- handle 回收单一真相源在 T1A，T1B 不重复登记（避免 desync）。
- 仅从 `cc` import `find` / `Node`（满足 ts-static import 检查）；`{}` 配平。

## 验证（诚实报告）
- `TS静态检查` [OK]（`{}` 配平 + `cc` import 正确）。
- 整包 vitest：238 通过 / 13 失败——13 失败全为既有 `IHitResolver service not registered`（`skill.test.ts` / `vertical_slice.test.ts`），**与 T1B 无关，无新增失败**。
- `validate:all` 9 门禁：编码/架构/TS静态/UI皮肤 [OK]；3 项 FAIL（资源注册 / 非UI资源注册 / 文档一致性）均为改动前既有基线（缺 `character.preview.*` 美术资源 / WeChat 内容待审 / `character_parts` prompt），与 T1B 代码无关。

## 需引擎内人工验证（沙箱无 cc runtime）
- `showCharacterInSlot(slot, 'warrior', 'attack')` 在 main 槽位显示 warrior 3D、UI 不受影响。
- 多面板并发（不同 ownerId）各自独立层、互不串渲染；`clearOwner` 正确回收。
- `showBackdrop` 在 T4/T5 建好全屏 slot 节点前返回 null（不建节点）。

## 风险
- backdrop 配置来源与 2D 回退留 T4/T5（本卡不接 config）。
- `showBackdrop` 仅解析 slot 不建节点——须 T4/T5 先创建 `Canvas/MainMenuBackdrop3D` / `Canvas/SplashBackdrop3D` 才能生效。
- 门面全 cc 委托，无纯逻辑可单测；正确性依赖引擎内目视 + 既有 CharacterVisualService/Assembler 链路。
