# P3-4 进度文件：dungeon 运行时 3D 化改造

> **状态**：🟡 PAUSED（A/B/C 已完成且门禁全绿；D 受阻）
> **最后更新**：2026-07-11
> **暂停原因**：3D 角色模型资产尚未开始制作（`docs/progress/3d_progress.md` 中 134 个 3D 资产全为 `draft`、贴图 None）。D 步骤需要"可当活玩家的替换体"，而当前替换体（EcsEntityBridge）功能不完整 + 无 3D 资产 + 沙箱无法跑游戏验证，故按 `docs/代码与设计结构一致性审计报告.md` §10.1 红线暂缓。
> **如何续作**：直接读本文件 + 审计报告的 §9/§10.1，然后从「续作清单」第一步开始。

---

## 0. 目标与范围

让 `dungeon.scene` 的**运行时加载**对齐 `docs/三场景完整结构树.md` §3 描述的 3D 目标：

- 玩家用 **6 个 ECS 组件 + ModelComponent/SkinnedMeshRenderer**（而非旧 `PlayerController` 单类）
- `DungeonManager` 委派 **RoomRuntime 五类管线**
- `WorldSpaceUI` / `World` 各 3D 渲染层、主相机透视 + `CameraBrain` 接管

> ⚠️ 关键区分：**`dungeon.scene` 的战斗/地牢/玩家节点全部由运行时代码加载**，不是编辑器里手拖的。所以"对齐文档"= 改代码，不是改 .scene 层级。（`main.scene` 的 `ModelDisplay3D`、`splash` 的 `StatusLabel` 才是可手动改的 UI 残留。）

---

## 1. 已完成（可验证、零行为回归）

| 阶段 | 提交 | 内容 | 门禁 |
|---|---|---|---|
| **A** DungeonManager 委派 RoomRuntime | `e0a0e0c`（代码）+ `ecbd479`（审计同步） | `DungeonManager` 现 **additive** 用新五类管线（DungeonGenerator→RoomBuilder→NavigationGrid→RoomRuntime）为每个生成房间构建 `RoomRuntime`，注入并 `initialize`；房间进入 `enter()/load()`、destroy `exit()`；暴露 `roomRuntimes` getter。**旧 `DAGGenerator` 流程完全不动**（零回归）。 | TS Static OK / Architecture OK / encoding 0 |
| **C** 接口抽象 IPlayerAgent | `9249fca` | 新建 `assets/scripts/battle/IPlayerAgent.ts` 统一玩家契约；`PlayerController implements IPlayerAgent`；**12 个消费者**内部 `PlayerController`→`IPlayerAgent`（`@property(PlayerController)` 绑定与 `ensureComponent<PlayerController>` 故意保留，因为编辑器需要 cc 类）。 | 同上 |
| **B** 并行挂载 EcsEntityBridge | `647b959`（代码）+ `1b5b189`（审计同步） | `EcsEntityBridge` 现 `implements IPlayerAgent`（`init`/`handleJoystick`/`takeDamage`/`heal`/`stats`/`currentHP`/`gridX/Y`/`isAlive`/`state`/`isDodging`/`onHPChanged`/`node`）；新增静态开关 **`USE_ECS_PLAYER = false`** 使其 `onLoad`/`update` **惰性早退、完全不接管活玩家**；`DungeonSceneInstaller` additively `ensureComponent<EcsEntityBridge>` 于玩家节点并 `setSpawn`+`init(gridManager)`。 | 同上 |

> 门禁总基线：`npm.cmd run validate:all` = **6/9**（3 个 FAIL 全是美术轨既有缺口，与本次无关，用户已确认"不用管"）。`encoding_audit --ci` 始终 `issues=0, p0=0`。

---

## 2. D 受阻：为什么此刻不能"移除 PlayerController"

事实核查（探查子代理 + 直读 6 个 ECS 组件 / `StatDamageable` / `CharacterVisualService` / `MonsterController` 真实 API）后确认，替换体（bridge）**还当不了活玩家**：

| # | 缺口 | 阻塞 D？ | 详情 |
|---|---|---|---|
| 1 | **3D 角色模型资产缺失** | 是（非崩溃项） | `assets/` 下零 `.glb`/`.fbx`；`CharacterVisualService` 仅 2D Sprite/部件渲染。故 B 的"Sprite→ModelComponent"在当前资产下无法落地，玩家仍 2D（功能不崩，只是未真正 3D 化）。 |
| 2 | **输入→移动未接线** | 是 | bridge `handleJoystick` 已写，但需确认 `JoystickEvent`→`core.submitMove`+`isWalkable` 闭环能驱动 `MovementComponent`。 |
| 3 | **战斗目标未喂喂** | 是 | `CombatComponent.resolveAutoAttack` 需外部喂 `target`+`AutoAttackContext`，**目前无任何代码把怪物喂给它**（无人调用 `BattleManager.getNearestMonster` 接进 combat）。 |
| 4 | **HP 变化无回调** | 是 | `StatDamageable`/`StatComponent` **无 HP 变更通知**，HUD 当前依赖 `PlayerController.onHPChanged`。 |
| 5 | **攻击属性不镜像** | 是 | `StatComponent` 只有 `hp/atk/def/speed`，缺 `atkSpeed/critChance/attackRange/lifeSteal/damageMultiplier/damageReduction/moveSpeed`（在 legacy `PlayerStats`）；bridge 需维护 `PlayerStats` 镜像（代码里已留 `TODO`，属 D 接线的一部分）。 |

> 叠加：**沙箱无法跑游戏验证**（Cocos 3.8.8 无 `--build` CLI、需显示器）。这正是审计报告 §10.1 标红的 🔴 项。
> → 此刻删 `PlayerController`/`AutoAttack` 会产出**无可用玩家**的游戏。故 D 必须暂缓：保留旧类、bridge 维持 inert。

---

## 3. 续作清单（恢复 D 时的执行顺序）

> 前置：先开始 3D 角色资产制作（见 §4）。每项完成后都跑 §5 门禁 + 用户在编辑器实测。

- [ ] **D-0** 生成 5 角色 3D 模型（`.glb`/prefab）并接入 `assets/scripts/render/CharacterVisualService.ts` 的 3D 分支（`ModelComponent`/`SkinnedMeshRenderer`）。→ 解决缺口 #1。
- [ ] **D-1** 接线 输入→移动：`EcsEntityBridge` 的 `handleJoystick` 内把 `JoystickEvent`→`core.submitMove`，并接 `GridManager.isWalkable` 闭环，驱动 `MovementComponent`。注意 `EcsBridgeCore.setNodePosition` 每帧会把节点拽回出生格——**激活前必须重排，否则与玩家 tween 抢位置**。→ 解决缺口 #2、#5（位置冲突）。
- [ ] **D-2** 接线 战斗目标：`BattleManager.getNearestMonster` 接入 `CombatComponent.resolveAutoAttack` 的 `target`+`AutoAttackContext`。→ 解决缺口 #3。
- [ ] **D-3** 加 HP 变更回调：`StatDamageable` 增加变更通知（或每帧 poll），驱动 HUD `onHPChanged`。→ 解决缺口 #4。
- [ ] **D-4** bridge 维护 `PlayerStats` 镜像（atkSpeed/critChance/attackRange/lifeSteal/damageMultiplier/damageReduction/moveSpeed），使 8+ 消费者读到正确攻击属性。→ 解决缺口 #5。
- [ ] **D-5** 在编辑器实测 B 的 inert 挂载（预期**零变化**，证明不破坏活玩家）：进地牢跑几层、战斗、HP HUD 正常。
- [ ] **D-6** 翻转 `USE_ECS_PLAYER = true`，再实测一轮（玩家由 ECS 驱动，旧类仍在但 inert）。
- [ ] **D-7** 确认 bridge 路径完全替代后，停用并移除 `PlayerController`/`AutoAttack` 节点与脚本引用（`#107` 任务）。**删除前务必 `git commit` 当前场景做安全点**。
- [ ] **D-8** 同步审计报告（`docs/代码与设计结构一致性审计报告.md` §9 / §10.1）：把 D 标 ✅，更新 `最后更新` 日期。

---

## 4. 3D 资产依赖（当前进度）

`docs/progress/3d_progress.md` 记录 134 个 3D 资产（bosses/characters/effects/monsters/tiles）目前**全部 `draft`、贴图 None**。玩家真正的 3D 化（缺口 #1）取决于 `characters` 类别（CHR_Archer_A 等 5 个）从 draft → 实际生成可加载模型。资产生产不在本代码改造范围内，但**是 D 的硬前置**。

---

## 5. 验证命令（每次改动后必跑）

```bash
cd /e/game/回到地面
python tools/encoding_audit.py --ci          # 期望 issues=0, p0=0
python tools/check_ts_static.py              # 期望 TS Static OK
python tools/check_architecture.py           # 期望 Architecture OK（仅 SceneFlowService 可调 loadScene）
npm.cmd run validate:all                     # 总览 9 门禁，维持 6/9
python tools/scene_tree.py assets/scenes/dungeon.scene   # 核对运行时加载层级/组件
```

---

## 6. 关键文件锚点

| 文件 | 角色 |
|---|---|
| `assets/scripts/battle/IPlayerAgent.ts` | 新建：玩家统一契约（D 的接口基础） |
| `assets/scripts/battle/PlayerController.ts` | 旧玩家类，现 `implements IPlayerAgent`；**D 移除对象** |
| `assets/scripts/ecs/EcsEntityBridge.ts` | 新建式改造：`implements IPlayerAgent` + `USE_ECS_PLAYER` 惰性开关；D 的替换体 |
| `assets/scripts/ecs/EcsBridgeCore.ts` | 纯 TS 内核；`setNodePosition` 每帧拽回出生格（D-1 需重排） |
| `assets/scripts/ecs/StatDamageable.ts` | ECS 伤害/HP；**缺变更回调**（缺口 #4） |
| `assets/scripts/ecs/StatComponent.ts` | **缺攻击属性**（缺口 #5） |
| `assets/scripts/ecs/CombatComponent.ts` | `resolveAutoAttack` 需外部 target（缺口 #3） |
| `assets/scripts/ecs/MovementComponent.ts` | 移动；与 `PlayerController` tween 冲突（缺口 #2） |
| `assets/scripts/dungeon/DungeonManager.ts` | A 已完成：`roomRuntimes` getter |
| `assets/scripts/scene/DungeonSceneInstaller.ts` | B 已完成：additive `ensureComponent<EcsEntityBridge>` |
| `assets/scripts/render/CharacterVisualService.ts` | 仅 2D；需 3D 分支（缺口 #1） |
| `assets/scripts/core/GameBootstrap.ts` | DI 容器（`context`），注入 RoomRuntime/Entity 服务 |
| `docs/三场景完整结构树.md` §3 | 目标结构（3D 形态） |
| `docs/代码与设计结构一致性审计报告.md` §9 / §10.1 | 状态表 + 编辑器红线（D 是 🔴） |
| `docs/progress/3d_progress.md` | 134 个 3D 资产现状（全 draft） |

---

## 7. 决策点（恢复时确认）

1. **`USE_ECS_PLAYER` 翻转粒度**：逐房间渐进 vs 一次性全切？建议先全切 + 编辑器实测，因渐进需要 RoomFlowController 配合。
2. **3D 视觉是否随 D 一并做**：若资产（缺口 #1）未就绪，可先让玩家以 ECS 逻辑驱动（仍 2D 渲染），把纯视觉 3D 化拆为独立后续；但用户已明确"先暂停等 3D 资源"。
3. **移除旧类的安全点**：D-7 删除前必须 `git commit`，且需在编辑器实测"无 null 崩溃"后再删。

---

## 8. 关联任务（TaskList）

- `#108` P3-4 总任务（in_progress）
- `#104` P3-4-A DungeonManager 委派 RoomRuntime ✅
- `#105` P3-4-B 玩家并行挂 bridge + 3D 视觉 ✅（3D 视觉部分因资产缺失未落地）
- `#106` P3-4-C DungeonSceneController 适配 bridge 接口 → 实际落地为 IPlayerAgent 接口抽象 ✅
- `#107` P3-4-D 停用并移除 PlayerController + AutoAttack 🟡 受阻（见 §2/§3）

## Resolved Issues (2026-07-12)

- **[PreviewInEditor] PromiseRejectionEvent**（编辑器预览未捕获拒绝）：根因 `MainMenuBackdrop.loadBackdrop` / `ModelDisplay3D.showModel` 经 `void this.xxx()` 丢弃 Promise，内部 `AssetBundleService.loadById<Model>` 因 0 个 3D 模型而 reject 且未 catch。已在 `AssetBundleService` 加 `tryLoadById<T>`（仿 `tryLoadSpriteFrame`，失败返回 null + warn），两处改用之。3D 资产缺失时静默 no-op，不再崩预览。commit `860726a`（TS Static/Architecture/encoding 全绿）。属 D-0 前置的已解决坑。
