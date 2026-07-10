# REPORT Demo6 — 100 怪同屏性能基线（PerfSampler）

> 阶段: Demo6（Phase 0）｜ 生成: 2026-07-10 ｜ 计划任务卡: `docs/ai-tasks/demo6.md`

## 完成度

| 项 | 状态 | 说明 |
|---|---|---|
| 完成 (DoD) | ✓（代码 + 单测） | PerfSampler 落地 + 单测通过；真机 ≥30fps/DrawCall<120 需真机验收 |
| 测试 | ✓ | vitest 100 passed（新增 9 个 perf 用例） |
| Validate | ⚠️ 8/9 | 唯一 FAIL = 美术轨 `resource_inventory.json` 缺 `metadata`（用户确认由美术轨处理，非本 Demo 引入） |

## 交付物（commit `3e8aa5e`，4 文件 / +212 行）

1. **`assets/scripts/debug/PerfSampler.ts`**（NEW）— Demo6 真正的新增物
   - 纯 TS、零 `cc`、可 node 单测；`implements ILifecycle`（红线 3）。
   - **滑动窗口平滑 FPS/帧时**：由引擎每帧注入的 `dtMs` 推导（`fps = count*1000 / Σdt`），**完全确定性、零 `Math.random`（红线 5）**。
   - 内存/DrawCall 经可注入 `IPerfSource`（引擎喂真实值，测试注入桩）。
   - `getSnapshot()` 返回 `Partial<DebugSnapshot>`，与 §5.5 DebugPanel 的 `Map` 聚合兼容（无 switch）。

2. **`assets/scripts/debug/DebugPanel.ts`**（EXTENDED，非新建）
   - 新增 `setPerfSampler()`；`update(dtMs)` 委托 PerfSampler 为权威 perf 源（最小增量）。
   - 保留 §5.5 瞬时节点的兜底路径（无 sampler 时行为不变）。

3. **`assets/scripts/core/GameBootstrap.ts`**（MODIFIED）
   - `_wireInfra` 注册 `PerfSampler` 并 `setPerfSampler` 到 DebugPanel（即任务卡"条件挂载"接线）。
   - Dev/Debug 构建仅含的约束以注释标注为 bundler 级 concern（§5.5 已同处理）。

4. **`tests/core/perf.test.ts`**（NEW）— 9 用例
   - 确定性 ~60fps、滑动窗口替换后 ~30fps、空窗口/非有限 delta、IPerfSource 内存/DrawCall、快照结构、reset、ILifecycle；DebugPanel 委托 + §5.5 兜底对等。

## 计划冲突与处置（Contract #2 禁止重复实现）

任务卡要求「新增 `assets/scripts/debug/DebugPanel.ts`」，但 **§5.5 已交付** `DebugPanel.ts`（F8 开关 + FPS/Frame/Mem/DrawCall + 12 类快照 + 事件环）。重建同名文件 = 违反 #2。

**处置**：Demo6 的 DebugPanel 需求已被 §5.5 满足，仅落实其真正新增物 `PerfSampler.ts`，并对既有 DebugPanel 做**最小增量扩展**（委托，非复制）。未创建第二个 DebugPanel 文件，已上报。

## 红线核查

| 红线 | 结果 |
|---|---|
| #1 业务禁直连 PhysicsSystem | ✓ 全纯 TS |
| #2 禁 switch(skillId) | ✓（PerfSampler 无分类分支；DebugPanel Map 聚合） |
| #3 必须 ILifecycle | ✓ PerfSampler 实现 |
| #4 业务禁 new 服务 | ✓ 仅 GameBootstrap 构造 |
| #5 禁 Math.random | ✓ FPS 由注入 dt 推导 |
| #6 仅 SceneFlowService loadScene | ✓ |

## validate:all 9 门禁

| 门禁 | 结果 |
|---|---|
| 编码审计 | ✓ issues=0 |
| 架构门禁 | ✓ |
| TS 静态检查 | ✓ |
| 资源注册 | ✓ |
| UI 皮肤绑定 | ✓ |
| 非 UI 资源注册 | ✓ |
| 文档一致性 | ✓ |
| 包体预算 | ✓ |
| 配置校验 | ✗（美术轨 `resource_inventory.json` 缺 `metadata`，用户确认美术轨处理） |

## 范围声明

- 未修改业务主链路（battle/dungeon/ui/scene/config/assets/app/run/utils）。
- 仅触碰 `debug/**`（任务卡允许）与 `core/GameBootstrap.ts`（条件挂载，允许）。
- 余下 312 WARN = 美术轨微信合规待审 + 30 个 miniboss idle 未引用，均非错误、非本 Demo 引入。

## 风险 / 待办

- 🟡 **真机验收**：100 怪同屏中端机 ≥30fps、DrawCall<120、内存稳定 —— 需真机/模拟器跑 `PerfSampler` + 引擎 IPerfSource，单测无法覆盖（任务卡已注明 风险: 需真机验收）。
- ⚪ 美术轨修复 `resource_inventory.json` 的 `metadata` 后，`validate:all` 恢复 9/9，§5.13 分支门禁即放行合回 main。
