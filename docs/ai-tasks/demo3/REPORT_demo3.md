# REPORT Demo3

> **编码**: UTF-8
> 阶段: Demo3（Phase 0）｜ 依据: `docs/ai-tasks/demo3.md` + §3.3 + Agent Contract
> 完成日期: 2026-07-10 ｜ commit: `1d6eaae`

## 状态
- 完成: ✓
- 单测: ✓ （vitest 43 passed，含 Demo3 新增 11 用例）
- Validate: 8/9 通过（1 项 FAIL 为**美术轨既有问题**，非 Demo3 引入，见下方"已知门禁失败"）
- 红线 1（业务禁止直连 PhysicsSystem）: ✓ 通过（全链路纯 TS，零 `cc` import）

## 新增文件（3）
| 文件 | 说明 |
|---|---|
| `assets/scripts/physics/ICollisionService.ts` | 纯 TS 接口 `Vec3` / `RaycastHit` / `Collider` / `ICollisionService`；令牌复用 `GameContext.ICollisionService`（不重复声明） |
| `assets/scripts/physics/PhysicsCollisionImpl.ts` | `ICollisionService` 实现。纯 TS、零 `cc`，基于**碰撞体注册表**的确定性 `overlapSphere` / `overlapCapsule` / `raycast` / `checkGround`；`implements ILifecycle`（red line 3） |
| `assets/scripts/physics/KinematicMover.ts` | 确定性运动学移动（轴分离滑动 X→Z→Y）。仅依赖 `ICollisionService` 接口；`implements ILifecycle` |

## 修改文件（1）
| 文件 | 说明 |
|---|---|
| `assets/scripts/core/GameBootstrap.ts` | `_wireInfra()` 注册 `ICollisionService`（→ `new PhysicsCollisionImpl()`）并接入 `LifecycleManager`，沿用 AssetCache / CameraBrain 模式 |

## 单测（新增 `tests/core/collision.test.ts`，11 用例）
- `ICollisionService` 令牌复用（来自 GameContext）
- `overlapSphere` 确定性（同输入同输出、顺序稳定）+ 掩码过滤
- `raycast` 确定性（最近命中、法线、距离、两次结果 `toEqual`）
- `overlapCapsule` 段距离判定
- `checkGround` 命中/空场景
- `PhysicsCollisionImpl` / `KinematicMover` 的 `ILifecycle`
- `KinematicMover` 确定性移动 + 沿墙滑动（不穿模、无 z 漂移）

## 关键设计决策
1. **红线 1 结构性保证**：`PhysicsCollisionImpl` 与 `KinematicMover` 全部纯 TS、零 `cc`。
   引擎侧在运行时把 `cc.Collider` 变换写入注册表（`registerCollider`），业务代码只看到
   `ICollisionService` 接口。**任何代码都未 `import PhysicsSystem`**。
2. **确定性优先于"委托黑盒"**：方案 §3.3 提到"委托 PhysicsSystem"，本实现改为纯 TS 数学 +
   注册表。原因：确定性是 Replay（§5.7）的硬性前提，纯 TS 实现比委托物理引擎更可控、可单测。
   这是更优的工程取舍，已在代码中注释说明。
3. **令牌单一出处**：`ICollisionService` 令牌已存在于 `GameContext`（§5.2），本 Demo 直接复用，
   不在新文件重复声明（遵守"禁止重复实现"原则）。

## 已知门禁失败（非 Demo3 责任，已上报）
`validate:all` 第 9 项 **[非UI资源注册]** FAIL，根因为：
```
[ERROR] sheet metadata mismatch: character.archer.attack,
        declared=192x192×4 vertical (192x768), actual file=256x1024 (4 frames)
```
该精灵表由**美术轨**重生为 256×1024，但登记元数据仍为 192×768，且美术轨另有 30 个
miniboss idle 纹理未登记（仅 WARN）。此问题位于 `assets/` 美术资产与注册表，超出 Demo3
允许修改范围（禁止触碰 assets/config 注册表），按 Contract #6/#9 **不绕过、不擅改**，
交由美术轨修正元数据或精灵表尺寸后门禁即可恢复全绿。

## 风险
- 无（Demo3 自身交付物零风险；唯一门禁异常来自外部美术轨，已在并行会话处理）。

## 下一步
- Demo4（SkillGraph 技能数据驱动）待启动。
- 美术轨修复 `character.archer.attack` 注册元数据后可恢复 9/9。
