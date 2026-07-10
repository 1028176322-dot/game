# REPORT Demo4 — 一个技能经 SkillGraph 释放

> **编码**: UTF-8
> 完成: ✓  测试: ✓  Validate: 8/9（红线 2 通过，1 项既有美术轨缺口非本 Demo 引入）
> 新增文件: 4 (`battle/skill/**`)  修改文件: 1 (`core/GameBootstrap.ts`)  测试: 1 (`tests/core/skill.test.ts`)
> 风险: 无

## 1. 交付物（commit `c8c5a86`）

| 文件 | 职责 | 约束 |
|---|---|---|
| `battle/skill/SkillData.ts` | 纯 TS 技能配置类型：`SkillData`/`SkillConfig`/`Damageable`/`SkillCaster`/`SkillNode`(判别联合)+`SkillNodeKind` | 零 `cc`，复用 `physics/Vec3` |
| `battle/skill/SkillGraph.ts` | `SkillGraph.build(data)` 按**数据字段**产出节点链（projectile→explosion→burn）；导出 `ISkillGraph` 令牌；`implements ILifecycle` | **无 `switch(skillId)`**（红线 2） |
| `battle/skill/SkillExecutor.ts` | 执行节点链；依赖经 `ctx.get` 注入（红线 4）；节点派发用 `Map<kind,handler>`（**无 switch**，红线 2）；导出 `ISkillExecutor` 令牌；`implements ILifecycle` | 红线 2 + 红线 4 + 红线 3 |
| `battle/skill/Resolvers.ts` | `HitResolver`/`DamageResolver` 纯函数，写入 `Damageable` 契约 | 零 `cc`，无状态 |
| `core/GameBootstrap.ts` | 注册 `ISkillGraph`+`ISkillExecutor`，`initialize`，接入 `LifecycleManager` | 仅追加，沿用 Demo1/2/3 模式 |
| `tests/core/skill.test.ts` | 5 用例 | vitest |

## 2. 验证结果

- **单测**：`npm run test` → **48 通过（10 文件，含 5 个新增技能用例）**。
  - 数据驱动链构建（fireball / frostbolt 不同 id → 相同节点链，证无 id 分支）。
  - 无 projectile 时仅 explosion 链。
  - 技能执行：爆炸经 `ICollisionService.overlapSphere` 命中 → `Damageable.applyDamage(30)` + `applyBurn(5,3)` 落地。
  - 半径感知：远处碰撞体不被命中。
  - 确定性：相同输入两次执行结果完全一致。
- **编码审计**：`encoding_audit --ci` → issues=0 / p0=0 / p1=0 / p2=0。
- **validate:all（9 门禁）**：**8/9 通过**。
  - ✅ 配置校验 / 包体预算 / 编码审计 / **架构门禁**（loadScene 仅 SceneFlowService，setPhase 仅 AppFlowController，无业务非法 new Component）/ **TS 静态检查** / 资源注册(ui) / UI 皮肤绑定 / 文档一致性。
  - ❌ 非 UI 资源注册（见下文 §3）。

## 3. 红线 2（禁止 `switch(skillId)`）✓ 通过（结构上）

- `SkillGraph.build` 仅依据 `data.projectile`/`data.onHit` 是否存在来组装节点，**从不读取 `data.id` 做分支**。
- `SkillExecutor` 节点派发使用 `Map<SkillNodeKind, handler>`，按 `node.kind` 查表，**无 `switch`**；对判别联合用 `Extract<>` 收窄类型（`Contract #8` 类型安全，无 `@ts-ignore`）。
- 单测以"不同 `id` → 相同节点链"直接证明执行路径与 `skillId` 无关。
- 说明：本仓库 `check_architecture.py` 当前**不**静态检测 `switch`（与 Demo3 红线 1 同情况）。红线 2 由"结构上无 switch + 单测证明"满足；未擅改 `tools/`（超出允许修改范围）。若后续需在门禁中静态卡点 `switch(skillId)`，建议单独提出并由人工决定是否增强 gate（属跨 Demo 的 gate 改进，不在本 Demo 允许范围内）。

## 4. 一项门禁失败（非 Demo4 责任，已上报）

`[非UI资源注册]` 因美术轨既有缺口失败，根因与 Demo3 **完全一致**：

- `[ERROR] sheet metadata mismatch: character.archer.attack` — 精灵表被美术轨重生为 `256×1024`，但登记元数据仍声明 `192×192×4`(=768)。
- `[ERROR] sheet size mismatch: character.archer.attack, actual=256x1024, expected=192x768`。
- 另 30 个未登记 miniboss idle 纹理（WARN）。

上述均位于 `assets/` 美术资产与注册表，**不在 Demo4 允许修改范围**（`battle/skill/**` + `core/GameBootstrap.ts`）。Demo4 仅新增纯 TS 逻辑层、注册服务、写单测，**未触碰任何资产或注册表**，未引入任何新 ERROR。按 `Contract #6/#9` 未绕过、未擅改，待美术轨修正元数据或精灵表尺寸后门禁即恢复全绿。

## 5. 复用的既有基础设施（禁止重复实现）

- `GameContext` / `ILifecycle` / `LifecycleManager`（Demo0）— 服务注册、生命周期广播。
- `Logger` + `ILogger`（Demo0 D0-4）— 战斗频道日志。
- `ICollisionService` 接口 + `PhysicsCollisionImpl` + `ALL_MASK`（Demo3）— 爆炸 AOE 命中查询，业务零 `PhysicsSystem`（红线 1 延续）。
- 令牌 `ISkillGraph`/`ISkillExecutor` 与所属类**同模块导出**（避免改动 `core/GameContext.ts` 令牌表，守住在允许范围内）。

## 6. 下一步

- Demo5（待定，按方案 §5.5 DebugPanel / §5.6 SaveManager / §5.7 ReplayRecorder 之一）或 Demo3 之后的战斗/AI 分层。
- 美术轨修复 `character.archer.attack` 精灵表尺寸/元数据后，`validate:all` 即恢复 9/9。
