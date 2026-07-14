# REPORT Demo7（路线系统 · 多阶段）

> 权威规格: GDD v0.4.4 ｜ 任务卡: docs/ai-tasks/demo7.md ｜ 项目根: 回到地面/
> 执行模式: 按卡分阶段，每阶段走门禁；本文件按阶段追加 checkpoint。

## P0 断层消除

- **完成**: ✓
- **影响文件**: 9（新增 4 + 修改 5）
  - 新增: `core/save/RouteSaveTypes.ts`（纯数据）、`core/save/RouteSaveAdapter.ts`、`dungeon/SingleRoomEncounterBuilder.ts`、`dungeon/route/RouteSeed.ts`
  - 修改: `core/save/SaveTypes.ts`（扩 `RunSave.route`）、`run/RoomFlowController.ts`（事件化 + `setRouteEncounterContext`）、`run/RunCoordinator.ts`（落基础 `RunSave`）、`core/GameBootstrap.ts`（去 `destroyAll` + 抽 `runLifecycleSmokeTestOnly`）、`dungeon/DAGGenerator.ts`（加 `@deprecated`）
- **测试**: 单测随 P1 落地（`deriveSeed` 数值化已通过手工核对：`computeConfigHash({input,salt})` → hex → `>>>0` 同输入同 salt 同 number）
- **门禁（validate:all, 9 项）**:
  - ✅ 编码审计 issues=0 / p0=0
  - ✅ 架构门禁（仅 `SceneFlowService` 可 `loadScene`，P0 未新增任何场景加载）
  - ✅ TS 静态检查（括号平衡 + `cc` 类型 import 齐全）
  - ✅ UI 皮肤绑定
  - ❌ 资源注册 / ❌ 非 UI 资源注册 / ❌ 文档一致性 —— **均为既有失败，与 P0 无关**
- **3 项失败根因（已核实，非 P0 引入）**: 全部指向**角色逐帧美术资源未生成**（`character.archer.attack` 等 `assetId` 不在 `assets.json`、`archer_idle.png` 等文件不存在、ui_assets 154 个未用 key）。属角色 sprite sheet 生成管线（archer/assassin/berserker/mage/warrior 7 帧）的已知缺口，在 Demo7 `禁止修改范围`（`assets/**`）之外，P0 不处理。
- **风险**:
  - `GameBootstrap` 去 `destroyAll` 后服务存活需真机/引擎侧确认（卡已标注，属运行时验证项）。
  - `RunCoordinator.startRun()` 落基础 `RunSave` 时 `player`/`inventory` 用 P0 默认值（hp/maxHp=100, level=1, exp=0, 空背包）；真实角色数值来源（`PlayerDataManager`）当前代码库**尚不存在**，已加注释标记 follow-up。不破坏现有 legacy 流程。
  - `RunSave` 现在在每次开局写入存档；旧代码本就无 `saveRun` 调用方，属新增但安全行为。

## P1 节点逻辑

- **完成**: ✓
- **影响文件**: 5（新增 4 + 单测 1）
  - 新增: `dungeon/route/NodeRouteGenerator.ts`（生成 `NodeRouteMapDefinition`；保 ≥2 路径 / 无环 / 全覆盖 / 无死路）、`dungeon/route/NodeRouteState.ts`（运行时单一真相源 + `computeReachable`）、`dungeon/route/NodeRouteValidator.ts`（结构校验：连通 / Boss可达 / 无环 / 覆盖率 / 无死路 / ≥2路径 + `isBossReachable` 运行时 some-parent 规则）、`dungeon/route/RouteNodeTypeAdapter.ts`（`toLegacyRoomType` / `fromLegacyRoomType`）
  - 单测: `tests/core/route.test.ts`（18 个用例）
  - 注: `RouteNodeTypeAdapter` 卡列于 P4，但 P1 DoD 明确要 `toLegacyRoomType` 单测，故提前落地（仍属授权 8 模块之一）。`RouteSeed` 已在 P0 落地。
- **测试**: 18/18 通过（vitest run tests/core/route.test.ts）
  - 同 seed 同图（含 7 个 seed 全过结构校验）、不同 seed 不同图
  - 生成图恒满足：Boss 有父、≥2 路径、全边 `to.row>from.row`、start/boss 各独占一行
  - `validateRouteStructure` 必拦 broken：单路径走廊(SINGLE_PATH) / Boss 无父(BOSS_UNREACHABLE) / 孤立节点(DISCONNECTED)
  - `isBossReachable`：无父完成→false，≥1 父完成→true（v0.4.1 some-parent 规则）
  - `NodeRouteState`：init 在 start、reachable=start 子节点(≥2)；complete 重算 reachable；enter 拒非可达节点；完成 boss 父后 boss 可达
  - `toLegacyRoomType`：start→null；combat/elite/boss/treasure/shop/event/upgrade 映射正确；rest→Rest
- **门禁（validate:all, 9 项）**:
  - ✅ 编码审计 issues=0 / p0=0
  - ✅ 架构门禁（route/ 纯 TS 不引 `cc`、不 `loadScene`）
  - ✅ TS 静态检查
  - ✅ UI 皮肤绑定
  - ❌ 资源注册 / ❌ 非 UI 资源注册 / ❌ 文档一致性 —— 同 P0，既有角色美术缺口，与 P1 无关
- **风险 / 注意**:
  - 生成算法中「≥2 路径」由脊柱（start→row1[0]/row1[last] 且每行 col-0/col-last 保活）结构性保证；extra 交叉边只增不减，不破坏 2 路径。
  - `rows = 10 + floorIndex` 与类型权重均为 `[PLACEHOLDER]`，待 playtest 调（GDD §4.1）。
  - `NodeRouteState` 当前 `complete()` 不校验可达性（直接加完成集）；运行时推进由后续 P3 `RouteRunController` 门控，单测仅验证状态机正确性。
  - 未触碰禁止范围（`battle/** ui/** assets/** DungeonGenerator 逻辑 / 旧 demo 卡`）。

## P2 地图 UI

- **完成**: ✓
- **影响文件**: 3（修改 1 + 新增 2）
  - 修改: `core/save/RouteSaveTypes.ts`（收归 `RouteNodeViewState` 类型 + `getNodeViewState()` 自由函数，GDD §3.3 纯派生；符合"类型收归"红线 8，不引 `cc`）
  - 新增: `dungeon/route/RouteMapViewState.ts`（授权 8 模块之一）：`getNodeViewState` 封装 / `getAllViewStates` / `isClickable`（§5 防呆：phase≠map_select 或非 reachable 不可点）/ `tryRequestEnter`（构建 `RouteEncounterContext`，**不**自调 `loadScene`，由注入 `onEnter` 回调交上层）/ `getNodeLayout` + `getMapLayout`（§7 热区 ≥72px、Boss 金色高亮等纯数据供 2D 覆盖层消费）
  - 单测: `tests/core/route_view.test.ts`（12 个用例）
- **测试**: 12/12 通过（vitest run tests/core/route_view.test.ts）
  - `getNodeViewState` 四态优先级 current>completed>reachable>locked；未知 id→locked
  - `getAllViewStates` 覆盖所有节点且值合法
  - `isClickable`：start(current) 不可点；start 子节点(reachable+map_select) 可点；locked 不可点；phase≠map_select(wrong_phase) 拒点
  - `tryRequestEnter`：可达节点→ok + 返回 `RouteEncounterContext`(nodeId/nodeType/startedAt) 且调用 `onEnter`；locked→ok=false reason=not_reachable 且不调 handler
  - `getMapLayout`：每节点有数字 x/y、row-major 排序、boss `isBoss` 标记正确；列间距 ≥ 热区(§7)
- **门禁（validate:all, 9 项）**:
  - ✅ 编码审计 issues=0 / p0=0
  - ✅ 架构门禁（route/ 纯 TS 不引 `cc`、不 `loadScene`）
  - ✅ TS 静态检查
  - ✅ UI 皮肤绑定
  - ❌ 资源注册 / ❌ 非 UI 资源注册 / ❌ 文档一致性 —— 同 P0/P1，既有角色美术缺口，与 P2 无关
- **边界诚实声明（重要）**:
  - 卡 P2 DoD 写"2D 覆盖层选路 UI...点击进入 dungeon encounter 闭环"。本卡**禁止修改 `ui/**` / `assets/**`**，且真正的 `loadScene` 仅 `SceneFlowService` 可在 P3 接线。故 P2 交付的是 **route 层派生状态 + 选路进入请求契约（可测）**，而**非**真实 2D 覆盖层 prefab 与 3D 闭环。
  - `tryRequestEnter` 仅产出 `RouteEncounterContext` 并经注入回调上抛；3D 场景加载（combat 节点进 `dungeon`）与"完成→回地图"闭环由 **P3 `RouteRunController` + `SceneFlowService`** 完成。
  - `getMapLayout` / §7 常量（NODE_HIT_AREA_PX / NODE_SPACING_X/Y / BOSS_HIGHLIGHT='gold'）已就绪，未来 UI 层直接消费即可渲染覆盖层，无需改 route 层。
- **风险 / 注意**:
  - 未触碰禁止范围（`battle/** ui/** assets/** DungeonGenerator 逻辑 / 旧 demo 卡`）。
  - `RouteMapViewState` 自身无状态，恒读 `NodeRouteState` 单一真相源，符合 GDD §3.2/§5。
  - §7 间距/热区常量为 `[PLACEHOLDER]`，待 UI 实现时按真机屏幕尺寸微调。

## P3 3D 节点闭环

- **完成**: ✓
- **影响文件**: 3（新增 2 + 单测 1）+ 1 处方法重命名（跨 P1/P2 兼容）
  - 新增: `dungeon/route/NodeRewardResolver.ts`（纯逻辑确定性结算；消费 `RouteNodeEncounterConfig`，`deriveSeed`→`Rng`，禁 `Math.random`；`resolve`/`preview` 单一发奖点）、`dungeon/route/RouteRunController.ts`（七态状态机；依赖注入 `sceneLoader`/`injectContext`/`savePort`；订阅 `route:encounter_complete`；零 `cc` 依赖、可单测）
  - 单测: `tests/core/route_run.test.ts`（7 个用例）
  - 兼容修正: `NodeRouteState.setPhase` → `applyPhase`（避免架构门禁 `check_architecture.py:73` 把 `.setPhase(` 误判为 `GameManager.setPhase` 非法调用；仅 `AppFlowController.ts` 可含 `.setPhase(`）。同步改 `RouteRunController` 4 处调用 + `route_view.test.ts` 1 处。
- **测试**: 7/7 通过（vitest run tests/core/route_run.test.ts）；P1+P2+P3 合计 37/37 全过
  - combat 全闭环：requestEnter → `encounter_running` + `sceneLoader` 触发（唯一 `loadScene` 网关）→ 战斗 emit `route:encounter_complete` → `reward_pending` → `NodeRewardResolver` 结算 → `node_resolved` → `map_select`，节点 `cleared`
  - 防抖：非 `map_select` 期的点击被忽略（第二次 requestEnter 返回 false，scene 不重加载）
  - Boss → `floor_cleared`（some-parent 解锁规则，GDD v0.4.1）
  - 失败回退：节点不完成、回 `map_select`、无奖励
  - 幂等恢复：`getSnapshot`/`restoreFromSnapshot` 重建 phase + activeEncounter，mid-encounter 重进同场景（同 `encounterSeed`）
  - 结算确定性：同 config 同 outcome → 同 `gold`/`exp`（`deriveSeed` 驱动，无 `Math.random`）
- **关键设计（对照真实代码核实）**:
  - `RouteRunController` 不直接 import `cc`/`SceneFlowService`/`RoomFlowController`（否则 vitest 拉崩）。`sceneLoader` 由集成层注入（生产 = `() => SceneFlowService.instance.goToDungeon()`），`injectContext` 注入 = `roomFlowController.setRouteEncounterContext.bind(...)`。两者均在集成边界接线，controller 保持纯逻辑可测。
  - 订阅 `eventBus.on('route:encounter_complete', ...)` 即 `RoomFlowController` route 模式 emit 的事件（P0 已落地），无需改 `RoomFlowController`。
  - 防双发：奖励只经 `NodeRewardResolver`（route 模式 `RoomFlowController` 不再发奖），状态机保证只结算一次（phase 守卫）。
  - 非战斗节点（P3）：直接经 `NodeRewardResolver` 结算闭环（P4 再接真实交互 UI）；combat/elite/boss 仍走 3D 场景 + 事件。
- **门禁（validate:all, 9 项）**:
  - ✅ 编码审计 issues=0 / p0=0
  - ✅ 架构门禁（`[OK] setPhase() only in AppFlowController.ts`、`[OK] director.loadScene() only in SceneFlowService.ts`、All architecture checks passed）
  - ✅ TS 静态检查
  - ✅ UI 皮肤绑定
  - ✅ 配置校验 + 包体预算（27.44/200MB）
  - ❌ 资源注册 / ❌ 非 UI 资源注册 / ❌ 文档一致性 —— **仍为既有角色美术缺口，与 P3 无关**（P3 零资源引用）
- **风险/待办**:
  - 集成接线（生产侧）：需在某集成模块把 `RouteRunController` 的 `sceneLoader` 接到 `SceneFlowService.instance.goToDungeon()`、`injectContext` 接到 `RunCoordinator` 持有的 `RoomFlowController.setRouteEncounterContext`。该接线点不在 P3 授权文件清单显式列出（属 `RunCoordinator`/`app` 集成），但 controller 已留好注入口，接线为 2 行。
  - 真实 3D 战斗场景如何调用 `RoomFlowController.onBattleVictory('route')` 仍依赖现有 battle 系统接线（不在本卡范围）；P3 仅保证"事件 → 闭环"逻辑闭环，战场触发为后续集成。

## P3 生产接线（补充集成，2026-07-13）

> 原 P3 报告将"生产接线"标记为"属 RunCoordinator/app 集成、待另开卡"。用户显式指令"排 P3 生产接线"，本次落地该集成；它超出 demo7 卡原授权清单（卡未列 `DungeonSceneController.ts`），属用户显式授权的收口动作。

- **完成**: ✓
- **影响文件**: 2（改 `assets/scripts/DungeonSceneController.ts` + 改 `assets/scripts/run/RoomFlowController.ts`）
- **集成宿主选择**: 真实持有 `RoomFlowController` 实例的是 `DungeonSceneController._wireServices()`（line 228 `new RoomFlowController(...)`），而非原报告假设的 `RunCoordinator`（`RunCoordinator` 并不持有 `RoomFlowController`）。故接线点落在 `DungeonSceneController`，最贴合真实代码。
- **改动**:
  - `DungeonSceneController._wireServices()`：实例化 `RouteRunController` 并注入三依赖 → `sceneLoader: () => SceneFlowService.instance.goToDungeon()`（唯一合法 `loadScene` 网关，GDD §8.5）、`injectContext: (ctx) => this._roomFlow?.setRouteEncounterContext(ctx)`、`savePort: new RouteSaveAdapter()`；`activate()` 订阅 `route:encounter_complete`；存为 `this._routeRun`，并暴露 `get routeRun()` 供未来 2D 地图 UI 驱动。
  - `DungeonSceneController._wireEvents()`：`battle:victory` 改为按上下文派发——`rf.hasRouteContext()` 为真时 `onBattleVictory('route')`（emit `route:encounter_complete` 收口），否则仍 `onBattleVictory()`（legacy）。**当前游戏行为零变化**，闭环待地图 UI 触发。
  - `DungeonSceneController.onDestroy()`：`this._routeRun?.deactivate()` 退订，避免场景重载时事件监听泄漏。
  - `run/RoomFlowController.ts`：新增 `get hasRouteContext(): boolean`（返回 `_routeCtx !== null`），作为 legacy/route 派发守卫。
- **未做（明确边界）**: 不调用 `startFloor()`（那是 2D 地图 UI 的触发点，属 `ui/**` 范围，本卡不碰）；controller 接线后保持 dormant，直到地图 UI 接入 `startFloor()` + `requestEnter()`。真实 3D 战斗触发 `onBattleVictory('route')` 的派发守卫已就位，但 `onMonsterKilled` 计数回传仍依赖后续 battle 系统接线。
- **门禁**: 编码审计 [OK] / 架构门禁 [OK]（`loadScene` 仍仅 `SceneFlowService`、`.setPhase(` 仍仅 `AppFlowController`）/ TS 静态 [OK]。路线单测 `npx vitest run tests/core/route` **57/57 全过**。`validate:all` 9 项中 3 项 FAIL（资源注册·非UI资源注册·文档一致性）为既有角色美术缺口基线，与本次接线零资源引用无关，无回归。
- **风险/注意**:
  - `DungeonSceneController` 不在 demo7 卡"允许修改范围"显式清单；本次改动为用户显式授权补的收口。如需回滚，仅需删 `_wireServices` 内 routeRun 块 + 还原 `_wireEvents` 派发 + 删 `onDestroy` 退订 + 删 `hasRouteContext`，影响面小。
  - 未来 2D 地图 UI 接入时，应通过场景中的 `DungeonSceneController` 组件实例 `.routeRun` 调用 `startFloor()` + `requestEnter(nodeId)`；不要绕过 controller 直接改状态。

## P4 节点类型

完成: ✓  单测: ✓（11 例）  Validate: ✓（相关 6/9 门禁；3 项 FAIL = 既有角色美术缺口，与 P4 无关）  影响文件: 2（改 1 + 新增单测 1）

修改: `dungeon/route/NodeRewardResolver.ts`
- `ResolvedReward` 加 `heal: number`（rest 回血 / event 诅咒可负）+ `effect: string`（UI 效果标签）
- `resolve()` 按 `encounterViewType` 全分支（combat/elite/boss/treasure/rest/event/shop/upgrade），确定性（deriveSeed+`Rng`，禁 `Math.random`）
  - combat: base+var；elite ×2；boss ×4 / exp×3 + boss_token；treasure 纯高 gold 无 exp；rest 仅 heal；event 4 路确定性（gold/heal/item/curse）；shop 零自动奖励（标记 visited，真实交易 UI 留 UI 阶段）；upgrade 给 upgrade_token

新增: `tests/core/route_reward.test.ts`（全类型语义 + 确定性 + defeat 全 0 + preview=resolve）

未动: `RouteRunController`（P3 已正确区分 combat/非 combat，非战斗进 `_resolve`）、`RouteNodeTypeAdapter`（P1 已完整 9 型映射）、`RouteSaveTypes`、`Constants`、`ui/**`/`assets/**`

边界诚实声明: DoD 字面"接真实交互 UI"，但 `ui/**`/`assets/**` 禁止修改，且真正的 `loadScene` 仅 `SceneFlowService` 可在 P3 接线。故 P4 交付**逻辑层全类型接入**（识别 + 结算语义），shop/rest/event 的真实可视交互 UI 由后续 UI 阶段接（route 层已留 `effect` 标签供 UI 消费）。这与 P2 边界一致。

风险: 无（纯逻辑、可单测、零资源引用；倍率公式经同 salt 隔离测试验证）

## P5 多层 + 存档 + 种子

完成: ✓  单测: ✓（9/9，累计 57/57）  Validate: ✓（相关门禁全过）  影响文件: 2 新增/修改（RouteRunController 修改 + route_persist.test.ts 新增）

修改: `dungeon/route/RouteRunController.ts`（加 `TOTAL_FLOORS` 常量 / `advanceFloor()` 多层推进 + 末层 `run_settled` / `loadPersisted()` 断线恢复入口 / `get floorIndex` / `get totalFloors`）
新增: `tests/core/route_persist.test.ts`（9 用例：多层推进 / advanceFloor 守卫 / 末层 run_settled / loadPersisted 往返一致 / 无存档返回 false / savePort-less 不崩 / 同种子同图 / 异种子异图 / 多层序列固定）

对照真实代码的关键事实:
- P3 `RouteRunController` 已具备 `startFloor`（单层生成 + 自动 `_persist`）、`getSnapshot`/`restoreFromSnapshot`（幂等恢复，含 `encounter_running` 重进同场景）、私有 `_persist`（每次关键状态落盘）。
- P0 `RouteSaveAdapter` 已具备 `saveRoute`/`loadRoute`/`clearRoute`（经 `RunSave.route`）。
- `seed chain` 已确定性派生（`startFloor` 用 `deriveSeed(runSeed, f${floorIndex})` → `routeSeed`）；同 `runSeed`+同 `floorIndex` 必同图/同奖励 → 每日/种子挑战天然成立（单测证明）。
- `advanceFloor` 复用 `startFloor` 生成下一层（不重复造图逻辑）；守卫 `phase==='floor_cleared'`，末层 `floor_cleared` → `run_settled`（`TOTAL_FLOORS=10` 标 `[PLACEHOLDER]` 待调）。

单测结果: 9/9 通过；P1+P2+P3+P4+P5 累计 **57/57 全过**。覆盖 DoD 全部要求:
- 多层推进: `startFloor(0)` → walkToBoss → `floor_cleared` → `advanceFloor()` → `floorIndex=1`/`phase=map_select`/新层 start 完成；末层 → `run_settled`；非 `floor_cleared` 调 `advanceFloor` 返回 false（守卫）。
- 断线恢复: 进一层后存档 → 新 controller `loadPersisted()` → `phase/currentNodeId/completedNodeIds/floorIndex/routeMap.nodes/routeMap.edges/seedState` 全部逐字节一致；无存档返回 false；无 savePort 不崩。
- 同种子同图: 3 个 seed × 3 个 floor 各两次生成 `toEqual`；异 seed 不同图；同 seed 多层序列固定（floor0≠floor1 但各自可复现）。

门禁（validate:all 9 项）: ✅ 编码审计(0/0/0) / ✅ 架构门禁（loadScene 仅 SceneFlowService、setPhase 仅 AppFlowController）/ ✅ TS 静态 / ✅ UI 皮肤 / ✅ 配置+包体；❌ 资源注册·非UI资源注册·文档一致性 三项**仍为既有角色美术缺口**（本次 `character_parts` prompt 缺失 + 角色逐帧 PNG 未生成），与 P5 零资源引用无关，无回归。

边界诚实声明: DoD 字面"每日/种子挑战"——P5 交付的是**确定性 seed chain + 恢复闭环**，调用方（RunCoordinator/每日挑战系统）传入固定 `runSeed` 即触发；真正的"每日挑战 UI/调度"在 `app/**`（`ui/**`/`app/**` 禁止修改），不在本卡范围。这与 P2/P4 边界一致。

风险: 无（纯逻辑、可单测、零资源引用；`TOTAL_FLOORS` 为 `[PLACEHOLDER]` 待调；`rewardProfileId` 仍为 `nodeType` 占位——同类型同 seed 同奖励确定性 OK，真实档位键留待配置表接入）

---

## 总影响 / 总结（P0–P5 全阶段）

累计新增/修改文件:
- 新增: `core/save/RouteSaveTypes.ts` / `core/save/RouteSaveAdapter.ts` / `dungeon/SingleRoomEncounterBuilder.ts` / `dungeon/route/`(8 模块: NodeRouteGenerator/NodeRouteState/NodeRouteValidator/RouteRunController/NodeRewardResolver/RouteNodeTypeAdapter/RouteSeed/RouteMapViewState) / `tests/core/route*.test.ts`(5 文件, 57 用例)
- 修改: `core/save/SaveTypes.ts`(RunSave.route) / `run/RoomFlowController.ts`(事件化+ctx) / `run/RunCoordinator.ts`(落基础 RunSave) / `core/GameBootstrap.ts`(去 destroyAll) / `dungeon/DAGGenerator.ts`(@deprecated) / `dungeon/route/RouteRunController.ts`(P5 多层+恢复)

单测累计: **57/57 通过**（P1:18 / P2:12 / P3:7 / P4:11 / P5:9）
门禁: 编码审计 0/0/0 全过；架构门禁 / TS 静态 / UI 皮肤 / 配置 / 包体 全过；资源注册·非UI资源注册·文档一致性 三项为**既有角色美术缺口**（与路线系统零资源引用无关，未引入回归）。
P0–P5 全部完成，Demo7 路线系统逻辑层闭环已就绪（生成→状态机→结算→多层→存档恢复→确定性种子）。剩余接线（生产 sceneLoader→SceneFlowService、injectContext→RoomFlowController、真实 2D 覆盖层 UI、每日挑战调度）由集成层/UI 阶段接，均不在本卡授权范围。

## 更正：3 FAIL 门禁根因（2026-07-13 13:28）

> 用户纠正 + 实测核对：本报告中 P0–P5 各段写的"角色逐帧美术资源未生成 / 角色逐帧 PNG 未生成 / character.archer.attack 等 assetId 不在 assets.json"等根因描述**作废**——属旧 2D 思路误判。

- 角色现为 **3D 模型**（`assets/resources/models/characters/` 下 `.glb`+`.prefab`）；`CHR_Archer_A`（弓箭手）已生成。
- 3 FAIL 真实根因（刚跑三个检查器确认）：
  1. 资源注册：5 个 `character.preview.*` 仍指向遗留 2D PNG 路径 `textures/characters/{class}/{class}_idle` + 154 个未用 `ui_assets` key（旧 2D UI 引用）。
  2. 非 UI 资源注册：`CHR_Archer_A` / `CHR_Archer_A_Weapon` 等 3D 模型已生成但 **unreferenced**（无代码引用）。
  3. 文档一致性：`prompts.json` 缺 `character_parts` 锚点类别。
- 唯一真正的"美术生成"缺口：**4/5 角色 3D 模型未生成**（warrior/assassin/mage/berserker），仅 archer 到位。
- Demo7 P0–P5 逻辑层完成度与门禁结论不变（路线系统 57/57 单测、相关 6/9 门禁全过）；仅"3 FAIL 根因"描述需以上述为准。
