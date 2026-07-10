# Demo5 — 一个 3D 房间全周期 + NavigationGrid

> 阶段: Demo5（Phase 0）｜ Token Budget: ≤5 文件 ｜ 执行前先读 `_agent_contract.md` + `_architecture_report.md`

## 输入
- `docs/2D转3D全面升级方案.md §3.7 GridManager 拆分` `§3.10 AI（房间级）` `§5.1 层级串联`
- 查重：`RoomRuntime` / `RoomBuilder` / `NavigationGrid` / `DungeonGenerator` / `IRoomRuntime`

## 输出
- 新增 `assets/scripts/dungeon/DungeonGenerator.ts` `RoomBuilder.ts` `TileMap.ts` `NavigationGrid.ts` `RoomRuntime.ts`
- `RoomRuntime` 实现 `ILifecycle`（`enter`/`exit`/`destroy` 释放）；导出 `IRoomRuntime` 令牌

## 严格约束
- 房间级生命周期归 `RoomRuntime`，由 `LifecycleManager` 管理（§5.1 层级串联）。
- Grid 寻路（NavMesh 推迟 Phase 4）；不得引入物理依赖（走 `ICollisionService`）。

## 允许修改范围
- 新增 `assets/scripts/dungeon/**`
- 允许 `core/GameBootstrap.ts` / `app/SceneFlowService.ts` 注册 `IRoomRuntime`

## 禁止修改范围
- `battle/**` `ui/**` `scene/**` `config/**` `assets/**` `app/**`(注册除外) `run/**` `utils/**` 及其它未列目录

## 完成定义 (DoD)
- [ ] 单测 `NavigationGrid` 寻路正确
- [ ] 房间 `enter → exit → destroy` 资源释放无泄漏
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
你执行 Demo5（3D 房间）。先读 docs/ai-tasks/_agent_contract.md 与 _architecture_report.md。
允许新增: assets/scripts/dungeon/**；允许在 GameBootstrap/SceneFlowService 注册 IRoomRuntime。
禁止修改: battle/** ui/** scene/** config/** assets/** app/** run/** utils/** 及其它未列目录。
步骤: Step0→Step1(读 §3.7/§3.10 + 查重)→Step2 Diff→Step2.5 Execution Plan 等 Plan Approved→Step3 写代码(房间级生命周期归 RoomRuntime 并由 LifecycleManager 管理, 走 ICollisionService 不引物理, Grid 寻路)→Step4 test→Step5 修复→Step6 validate:all→Step7 提交 [Demo5]→Step8 REPORT_demo5.md。
Token Budget ≤5 文件。禁止重复实现、禁止自由发挥、禁止关 Lint/Validate。
```

## Checkpoint 模板（`REPORT_demo5.md`）
```
# REPORT Demo5
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
新增文件: 5 (dungeon/**)  修改文件: 1~2 (GameBootstrap/SceneFlowService)
风险: 无
```
