# REPORT Demo5

> 编码: UTF-8 ｜ 完成: ✓  测试: ✓  Validate: ✓ (9/9 门禁全过)

## 概要
- 阶段: Demo5（Phase 0）— 一个 3D 房间全周期 + NavigationGrid（§3.7 GridManager 拆分 + §5.1 房间级生命周期）
- commit: `d2490b8`
- 新增文件: 5（`dungeon/**`）｜ 修改文件: 1（`core/GameBootstrap.ts`）｜ 测试: 1（`tests/core/room.test.ts`）
- 风险: 无

## 交付物
| 文件 | 职责 | 关键点 |
|---|---|---|
| `dungeon/DungeonGenerator.ts` | seed+zone 确定性房间布局 | 复用既有 `Rng`(xorshift32)，无 `Math.random`（红线5）；房型 start/battle/elite/reward/boss + connections |
| `dungeon/TileMap.ts` | 逻辑层地块网格 | floor/wall/void + 占用；`isWalkable` |
| `dungeon/RoomBuilder.ts` | 布局→房间数据 | `build(layout)`→`RoomData`（TileMap + 模块件 floor/wall/decoration + `assetIds`） |
| `dungeon/NavigationGrid.ts` | Grid 寻路 | `implements INavigation`（最小签名同模块声明）；确定性 A*（4 邻域固定序 + seq tie-break）；NavMesh 推迟 Phase 4 |
| `dungeon/RoomRuntime.ts` | 房间运行时全周期 | `implements ILifecycle`（红线3）；导出 `IRoomRuntime` 令牌；`initialize` 经 `ctx.get` 取 `IAssetCache`（红线4）；`load` 引用计数、`exit/destroy` 精确释放本房资源（幂等，零泄漏，§3.6/§5.1）；实体+占用管理；不引物理 |

## DoD 核对
- [x] 单测 `NavigationGrid` 寻路正确 — 直线/绕墙/不可达/占用 4 场景，且确定性（同 in→同 path）
- [x] 房间 `enter → load → exit → destroy` 资源释放无泄漏 — fake AssetCache 引用计数归零，destroy 幂等无双释放
- [x] `npm run validate:all` 9 门禁通过 — 本轮含 `[非UI资源注册]` 也 OK（美术轨已修复 archer.attack 精灵表元数据）

## 验证
- `npm run test` → **61 用例全过**（11 文件；新增 13 个房间用例）
- `encoding_audit --ci` → issues=0 / p0=0 / p1=0 / p2=0
- `validate:all` → **9/9 全过**（配置/包体/编码/架构/TS静态/资源注册/UI皮肤/非UI资源注册/文档一致性）

## 架构红线核对
- 红线1（禁直连 PhysicsSystem）✓ — dungeon 全链路无物理依赖；如需碰撞走 `ICollisionService`
- 红线3（必须 ILifecycle）✓ — `RoomRuntime implements ILifecycle`，接入 LifecycleManager 逆序销毁
- 红线4（禁 new 服务）✓ — `RoomRuntime` 依赖经 `ctx.get<IAssetCache>` 注入
- 红线5（禁 Math.random）✓ — 布局用既有种子 `Rng`；A* 确定性无随机

## 说明
- **令牌归属**：`GameContext` 无 `IRoomRuntime` 令牌，`GameContext` 不在允许修改范围 → 沿用 Demo4 范式，令牌在 `RoomRuntime.ts` 同模块导出。
- **INavigation 签名**：§3.7 要求 NavigationGrid 实现 `INavigation`，但方案 §5.x 无显式签名 → 按 Contract #4 定义最小接口（`findPath`/`isWalkable`）并同模块声明，注明依据，待 §5.x 明确后再扩展。
- **既有 GridManager 不触碰**：旧 `dungeon/GridManager|DungeonManager|DAGGenerator` 属胖 GridManager，本 Demo 仅新增拆分后子模块，未改旧文件（Contract #6）。
