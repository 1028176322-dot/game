# Demo3 — ICollisionService + 运动学移动

> 阶段: Demo3（Phase 0）｜ Token Budget: ≤3 文件 ｜ 执行前先读 `_agent_contract.md` + `_architecture_report.md`

## 输入
- `docs/2D转3D全面升级方案.md §3.3 ICollisionService` `红线 1`
- 查重：`ICollisionService` / `CollisionService` / `PhysicsCollision`

## 输出
- 新增 `assets/scripts/physics/ICollisionService.ts`：接口 + `ICollisionService` 令牌
- 新增 `assets/scripts/physics/PhysicsCollisionImpl.ts`：运动学 overlapSphere / raycast 实现
- 新增 `assets/scripts/physics/KinematicMover.ts`：确定性移动

## 严格约束
- 业务**禁止 `import PhysicsSystem`**（红线 1）；只暴露 `ICollisionService`；实现确定性 overlap/raycast；实现 `ILifecycle`。

## 允许修改范围
- 新增 `assets/scripts/physics/**`
- 允许 `core/GameBootstrap.ts` 注册 `ICollisionService`

## 禁止修改范围
- `battle/**` `dungeon/**` `ui/**` `scene/**` `config/**` `assets/**` `app/**` `run/**` `utils/**` 及其它未列目录

## 完成定义 (DoD)
- [ ] 单测 overlap/raycast 确定性（同输入同输出）
- [ ] 架构门禁校验：业务层仅依赖接口，不依赖 `PhysicsSystem`
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
你执行 Demo3（碰撞隔离）。先读 docs/ai-tasks/_agent_contract.md 与 _architecture_report.md。
允许新增: assets/scripts/physics/**；允许在 GameBootstrap 注册 ICollisionService。
禁止修改: battle/** dungeon/** ui/** scene/** config/** assets/** app/** run/** utils/** 及其它未列目录。
步骤: Step0→Step1(读 §3.3 + 查重)→Step2 Diff→Step2.5 Execution Plan 等 Plan Approved→Step3 写代码(严禁业务 import PhysicsSystem, 只暴露 ICollisionService, 确定性)→Step4 test→Step5 修复→Step6 validate:all(架构红线1校验)→Step7 提交 [Demo3]→Step8 REPORT_demo3.md。
Token Budget ≤3 文件。禁止重复实现、禁止自由发挥、严禁直连 PhysicsSystem、禁止关 Lint/Validate。
```

## Checkpoint 模板（`REPORT_demo3.md`）
```
# REPORT Demo3
完成: ✓  测试: ✓  Validate: ✓ (9 门禁, 红线1 通过)
新增文件: 3  修改文件: 1 (GameBootstrap)
风险: 无
```
