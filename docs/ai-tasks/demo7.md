# Demo7 — 地牢重做：节点路线图肉鸽（多阶段卡）

> 阶段: Demo7（路线系统）｜ 权威规格: GDD v0.4.4 ｜ 执行前先读 `_agent_contract.md` + 本卡 + GDD
> **项目根 = `回到地面/`**，本卡所有路径相对该根。历史 demo 卡里的 `core/...` 是 `assets/scripts/core/...` 的缩写。
> **权威机制细节以 GDD 为准**：`../../回到地面/docs/地牢重做_节点路线图肉鸽_设计v0.4.4.md`（以下简称 GDD）。本卡只给执行边界与分阶段验收，不重复 GDD 机制。

---

## 背景与范围

把现有"物理连续穿越 6×6 房间"的地牢，重做为《酋长你别跑》式的**节点路线图肉鸽**：进层看见整张节点地图 → 选路 → 点节点进入独立 3D 俯视场景打完/交互 → 回地图选下一节点。战斗本身不动（手动 ARPG 手感 + 元素反应）。

- **复用基座（Demo0–6 已落地，禁止重做）**：`GameContext` / `LifecycleManager` / `CameraBrain` / `ICollisionService` / `KinematicMover` / `SkillGraph` / `SaveService`(`core/save`) / `SaveManager`(`save/`,`ISaveManager`) / `ReplayRecorder`(FNV-1a 种子确定性) / `DungeonGenerator`(多房间连通图) / `GameBootstrap`(服务注册 + lifecycle)。
- **本卡新增**：Spire 式节点路线图生成 + 节点执行状态机 + 路线存档适配 + 单房建造器 + `GameBootstrap` 运行时修复。
- **不在范围**：群体随从 / 被追击追逐（参考游戏无此设计，已确认丢弃）。

---

## 输入

- GDD v0.4.4（全机制权威；§1 目标 / §4 NodeRouteMap / §5 RouteRunController 状态机 / §8 SingleRoomEncounterBuilder / §9 RoomFlowController 事件化 / §10 存档与种子 / §11 配置表 / §12 分阶段 / §13 门禁 / §14 ai-tasks 协调）。
- `_agent_contract.md` 10 条铁律 + 执行前门禁。
- 复用基座见上。

## 输出（按阶段，详见各阶段小节）

- **P0 断层消除**：单房可造、服务存活、存读通、无双发、种子数值化。
- **P1 节点逻辑**：`NodeRouteGenerator` + `NodeRouteState` + `NodeRouteValidator` + 单测。
- **P2 地图 UI**：2D 覆盖层选路、派生状态、点击进 `dungeon` encounter。
- **P3 3D 节点闭环**：combat 节点进 3D → 完成回地图 → `NodeRewardResolver` 结算 → cleared。
- **P4 节点类型**：elite / treasure / shop / rest / event / upgrade / boss 全接入。
- **P5 多层 + 存档 + 种子**：多层推进 + `RouteSavePort` 断线恢复 + 每日/种子挑战。

---

## 严格约束（红线，违反 = 任务失败）

1. **架构红线 1–6 不可放宽**（contract #10）：禁止直连 `PhysicsSystem`、禁止 `switch(skillId)`、必须 `ILifecycle`、禁止 `new` 服务、禁止 `Math.random`、仅 `SceneFlowService` 可 `loadScene`。路线系统一律用 `deriveSeed()`（FNV-1a hex → uint32）喂 `Rng`，禁用 `Math.random`。
2. **新增 route 接口以 GDD §5/§9/§10 为准**（属本卡授权的新模块），不与 `2D转3D全面升级方案.md §5.x` 既有接口冲突；既有基座接口签名 1:1 贴合，不得改参数/改名/合并。
3. **`RunSave` 只能由 `RunCoordinator.startRun()` 创建**（GDD v0.4.3 ③）：`RouteSaveAdapter.saveRoute()` 无 active `RunSave` 时**返回 `false`**，禁止私自构造空 `RunSave`（空 `{} as any` 绕过必填字段与存档校验）。
4. **`SaveService` 不承载 `RouteSaveAdapter` 逻辑**（GDD v0.4.4 ③）：`SaveService` 仅保持 `loadRun`/`saveRun` 签名不变；`RouteSaveAdapter` 自行 `import { SaveService }` 并取 `SaveService.instance` 调用。
5. **防双发**（GDD v0.4.4）：`RoomFlowController.onBattleVictory(mode)` 的 `'route'` 模式**只 emit `route:encounter_complete`**；奖励永远由 `RouteRunController` 在 `reward_pending` 经 `NodeRewardResolver` 结算，禁止 `RoomFlowController` 内直接 `grantRoomClearRewards`。
6. **`DungeonGenerator` 多房间职责不改**（GDD §14.2）：`SingleRoomEncounterBuilder` 仅以 `roomCount:1` 包一层，禁止误用 `DungeonGenerator.generate({roomCount:1})`（其 `clamp(..,3,12)` 会把 1 变 3）。
7. **`DAGGenerator` 标记 `@deprecated`，本卡不删除、不在新路径使用**（GDD §14.3 ② 逐步替换）：新路线图一律走 `NodeRouteGenerator`；旧 DAG 清理留待后续 InfraFix/清理卡。
8. **路径红线（消除倒挂，GDD §9.2/§14.1）**：
   - `dungeon/route/` 内模块引 `Constants` 用 `../../core/Constants`（非 `../core/Constants`，后者落到不存在的 `dungeon/core`）。
   - `run/RoomFlowController.ts` 引 `RouteNodeType` / `RouteEncounterContext` 用 `../core/save/RouteSaveTypes`（非 `dungeon/route` 引 —— 会重新制造 `route → dungeon/route` 倒挂；非 `../../core/...` —— 会落到不存在的 `assets/scripts/` 上层）。
   - `core/save/RouteSaveAdapter.ts` 引 `SaveService` 用 `../SaveService`（同层），取 `SaveService.instance`。
   - `RunCoordinator`（run/）引 `RunSave`/`SaveService` 用 `../core/save/...`。
   - **不新建 `NodeRouteTypes.ts`**：其类型已由 `core/save/RouteSaveTypes.ts` 提供，重复定义会分叉（GDD v0.4.3 明确）。
9. **`route` 字段落盘形态**：扩展 `RunSave` 加 `route?: RouteRunSnapshot`（类型收归 `core/save/RouteSaveTypes.ts`），`RouteSaveAdapter` 挂 `RunSave.route` 调 `saveRun`，**不另开独立 key**。

---

## 允许修改范围（GDD §14.1 授权清单）

**存档适配层（`core/save/`，非 `dungeon/route`）**：
- `assets/scripts/core/save/RouteSaveTypes.ts` — **新增**，纯数据类型（`RouteNodeType` / `NodeRouteMapDefinition` / `NodeRouteRuntimeState` / `RouteNodeEncounterConfig` / `RouteRunSnapshot` / `RouteSavePort` / `RouteEncounterContext`），不 import Cocos/controller，消除 `core/save → dungeon/route` 倒挂。
- `assets/scripts/core/save/SaveTypes.ts` — 扩展 `RunSave.route`（import 自 `./RouteSaveTypes`）；`RunRngState` 形状 `{ runSeed, combatStep, lootStep }`，`startRun()` 按此初始化。
- `assets/scripts/core/save/SaveService.ts` — **仅保持 `loadRun`/`saveRun` 签名不变**；不承载 `RouteSaveAdapter`。
- `assets/scripts/core/save/RouteSaveAdapter.ts` — **新增**，实现 `RouteSavePort`、依赖 `SaveService.instance`，属存档适配层。

**路线系统（`dungeon/route/`，新增 8 模块）**：
- `NodeRouteGenerator`（生成 `NodeRouteMapDefinition`，复用 `deriveSeed`）
- `NodeRouteState`（运行时 `NodeRouteRuntimeState`，单一真相源）
- `NodeRouteValidator`（路径连通性 / Boss 可达 / ≥2 条路径校验）
- `RouteRunController`（GDD §5 状态机，唯一推进节点流程；委托非战斗节点给 `RoomFlowController`）
- `NodeRewardResolver`（GDD §9 节点统一结算，消费 `RouteNodeEncounterConfig.rewardProfileId`）
- `RouteNodeTypeAdapter`（`RouteNodeType` ↔ `Constants.RoomType`，`start` → `null`）
- `RouteSeed`（`deriveSeed()` 工具，hex → uint32）
- `RouteMapViewState`（`getNodeViewState()` 派生 UI 状态，GDD §4.3）

**其他授权文件**：
- `assets/scripts/dungeon/SingleRoomEncounterBuilder.ts` — **新增**（GDD §8.2），专造单房 `connections:[]`。
- `assets/scripts/core/GameBootstrap.ts` — **P0 去 `destroyAll()`**（GDD §14.3 ③ 并入本卡）；Demo probe 抽到独立 `runLifecycleSmokeTestOnly()`；正式 `startup()` 注册完服务后**禁止 `destroyAll()`**。
- `assets/scripts/run/RoomFlowController.ts` — 事件化 + `setRouteEncounterContext(ctx)`（GDD §9.2）；import 路径见严格约束 8。
- `assets/scripts/run/RunCoordinator.ts` — `startRun()` 必须创建基础 `RunSave`（`route: undefined`），为 `RouteSaveAdapter` 提供 active run（GDD §10.3.1）；`runId` 在 `startRun()` 内派生 `const runId = \`run_${config.startedAt}_${config.seed}\``（**不新增 `RunStartConfig` 字段**）。
- `assets/scripts/save/SaveManager.ts` — 扩展 `RunState`/`DungeonState`（如需要）。
- `tests/core/route*.test.ts` — 单测（GDD §13）。
- `assets/scripts/dungeon/DAGGenerator.ts` — **仅加 `@deprecated` 注释指向 `NodeRouteGenerator`**，不改逻辑、不删代码。

---

## 禁止修改范围（contract #6）

- `battle/**` `ui/**` `scene/**` `config/**` `assets/**` `app/**` `utils/**` 及其它未列目录。
- `DungeonGenerator` 多房间逻辑（GDD §14.2）；现有 2D→3D 基座接口签名。
- 既有 `demoN.md` / `D0-x.md` / `_architecture_report.md` / `2D转3D实施计划.md`（contract #1）。
- 除 `DAGGenerator.ts` 的 `@deprecated` 注释外，不得改动旧 DAG 代码。

---

## 完成定义 (DoD) — 按阶段

- **[P0]** 单房可造（`SingleRoomEncounterBuilder` 同 seed 同尺寸、`connections:[]`）；`GameBootstrap` 正式 `startup()` 后服务存活（无 `destroyAll`）；`RunCoordinator.startRun()` 落基础 `RunSave` 成功；`RouteSaveAdapter` 经 `RunSave.route` 存读往返一致；`RoomFlowController` 事件化无双发；`deriveSeed` 数值化（同输入同 salt → 同 number）。
- **[P1]** `NodeRouteGenerator` 单测：同 seed 同图、Boss reachable（some 父）、≥2 路径、无环；`NodeRouteValidator` 单测：注入 broken（单路径 / Boss 不可达 / 孤立行）必拦；`toLegacyRoomType` 单测：`start`→`null` 映射正确、`import` 路径编译通过。
- **[P2]** 2D 覆盖层选路 → 点击节点进入 `dungeon` encounter 闭环；派生状态（`getNodeViewState()`）正确驱动 UI。
- **[P3]** 单 combat 节点：进 3D 场景 → 完成 → 回地图 → `NodeRewardResolver` 结算 → 节点 `cleared`，全流程闭环。
- **[P4]** elite / treasure / shop / rest / event / upgrade / boss 全类型可走（`encounterViewType` 区分；elite/boss 复用 combat 战斗基底）。
- **[P5]** 多层推进；中途退出可经 `RouteSavePort` 恢复；同种子同图（每日/种子挑战）。

> 每阶段收尾都必须 `npm run validate:all` 9 门禁全过（含 `encoding_audit --ci` issues=0/p0=0）。门禁不过 = 阶段未完成。

---

## 分阶段执行（每阶段独立走门禁）

> 每阶段动手前，Agent 必须输出 **Execution Plan**（将新增/修改/删除的文件、预计影响文件数、不会改的禁止范围、步骤）并等待 `Plan Approved`（人工模式）或 `AUTO_APPROVE=false`（自动模式默认等待）。未获批准前不得创建/修改任何源文件。

### P0 · 断层消除（≈8 文件）
- 新增 `dungeon/SingleRoomEncounterBuilder.ts`（GDD §8.2）。
- 修 `core/GameBootstrap.ts`：去 `destroyAll()` + Demo probe 抽 `runLifecycleSmokeTestOnly()`。
- 新增 `core/save/RouteSaveTypes.ts`（纯数据类型）。
- 扩展 `core/save/SaveTypes.ts`（`RunSave.route`）。
- 新增 `core/save/RouteSaveAdapter.ts`（用 `SaveService.instance`）。
- 改 `run/RoomFlowController.ts`：事件化 + `setRouteEncounterContext`。
- 增 `run/RunCoordinator.ts` 落基础 `RunSave`（GDD §10.3.1，含 `runId` 派生）。
- 为 `DAGGenerator.ts` 加 `@deprecated` 注释。
- DoD 见上 [P0]。

### P1 · 节点逻辑（≈4 文件 + 单测）
- 新增 `dungeon/route/`：`NodeRouteGenerator` / `NodeRouteState` / `NodeRouteValidator` / `RouteSeed`。
- 单测 `tests/core/route*.test.ts`（同 seed 复现 / validator 拦 broken / `toLegacyRoomType`）。
- DoD 见上 [P1]。

### P2 · 地图 UI（≈3 文件）
- 新增 `dungeon/route/RouteMapViewState`（`getNodeViewState()` 派生）。
- 2D 覆盖层选路 UI，点击进 `dungeon` encounter。
- DoD 见上 [P2]。

### P3 · 3D 节点闭环（≈4 文件）
- 新增 `dungeon/route/RouteRunController`（GDD §5 状态机）。
- 新增 `dungeon/route/NodeRewardResolver`。
- 非战斗节点委托 `RoomFlowController`，combat 节点经 `RunCoordinator`/`SceneFlowService.goToDungeon()`（唯一允许 `loadScene`）。
- DoD 见上 [P3]。

### P4 · 节点类型（≈5 文件）
- 新增 `dungeon/route/RouteNodeTypeAdapter` + 接入 elite/treasure/shop/rest/event/upgrade/boss（`encounterViewType` 区分；elite/boss 复用 combat 基底）。
- DoD 见上 [P4]。

### P5 · 多层 + 存档 + 种子（≈5 文件）
- `RouteSavePort` 断线恢复 + 多层推进 + 每日/种子挑战。
- DoD 见上 [P5]。

---

## 执行 Prompt（Agent 入口）

```
你执行 Demo7（地牢重做·节点路线图肉鸽，多阶段）。先读 docs/ai-tasks/_agent_contract.md 与 GDD v0.4.4（../../回到地面/docs/地牢重做_节点路线图肉鸽_设计v0.4.4.md）。
权威机制以 GDD 为准；本卡只给执行边界与分阶段验收。
允许新增/修改范围严格限于「允许修改范围」小节（core/save/ 4 文件、dungeon/route/ 8 模块、dungeon/SingleRoomEncounterBuilder.ts、core/GameBootstrap.ts、run/RoomFlowController.ts、run/RunCoordinator.ts、save/SaveManager.ts、tests/core/route*.test.ts、DAGGenerator.ts 仅 @deprecated 注释）。
禁止修改: battle/** ui/** scene/** config/** assets/** app/** utils/** 及其它未列目录；DungeonGenerator 多房间逻辑；既有 demoN.md/D0-x.md。
红线: 架构红线 1-6 不可放宽；RunSave 只能由 RunCoordinator.startRun() 创建；SaveService 不承载 adapter；RoomFlowController route 模式只 emit route:encounter_complete（防双发）；deriveSeed 数字化喂 Rng（禁 Math.random）；路径红线消除 core/save ↔ dungeon/route 倒挂（详见严格约束 8）。
步骤: 每阶段 → Step0 读 GDD 相关节 + 查重 → Step1 输出 Execution Plan 等 Plan Approved → Step2 写码（1:1 贴合 GDD 签名，不改禁止范围）→ Step3 单测 → Step4 修复 → Step5 validate:all（9 门禁全过）→ Step6 提交 [Demo7-Px] → Step7 写 REPORT_demo7.md 对应阶段。
DAGGenerator 仅加 @deprecated 注释，不删不改逻辑。禁止重复实现、禁止自由发挥、禁止关 Lint/Validate。
```

---

## Checkpoint 模板（`REPORT_demo7.md`）

```
# REPORT Demo7（路线系统 · 多阶段）

## P0 断层消除
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)  影响文件: N
新增: SingleRoomEncounterBuilder.ts / RouteSaveTypes.ts / RouteSaveAdapter.ts / route×4(P1) ...
修改: GameBootstrap.ts(去 destroyAll) / SaveTypes.ts(RunSave.route) / RoomFlowController.ts(事件化) / RunCoordinator.ts(落 RunSave) / DAGGenerator.ts(@deprecated)
风险: 无（GameBootstrap 去 destroyAll 后需真机确认服务存活）

## P1 节点逻辑
完成: ✓  单测: ✓（同 seed 复现 / validator 拦 broken / toLegacyRoomType）
...（每阶段一段，末阶段给总影响文件数与总风险）
```

---

## 附录：§14.3 三项协调决策（已拍板，2026-07-13）

| # | 决策点 | 结论 |
|---|---|---|
| ① | `SingleRoomEncounterBuilder` 与 `route/` 模块落地路径 | **写入 Demo7 卡**，交 ai-tasks Agent 执行（不本会话直接做，不越工作流） |
| ② | `NodeRouteMap` 与旧 `DAGGenerator` 关系 | **逐步替换**：新 `NodeRouteGenerator` 取代旧 DAG 地图流程；`DungeonGenerator` 转单房建造器；`DAGGenerator` 标记 `@deprecated` 逐步移除（本卡不删） |
| ③ | `GameBootstrap.ts` 修复归属 | **并入 Demo7**（去 `destroyAll` + Demo probe 拆出，与 P0 断层消除同轮落地） |

> 本卡即 GDD §14「Demo7 卡与契约边界」的落地授权；GDD v0.4.4 仍为用户侧主规格，本卡为 ai-tasks Agent 的执行约束。
