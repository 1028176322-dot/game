# Demo4 — 一个技能经 SkillGraph 释放

> 阶段: Demo4（Phase 0）｜ Token Budget: ≤4 文件 ｜ 执行前先读 `_agent_contract.md` + `_architecture_report.md`

## 输入
- `docs/2D转3D全面升级方案.md §3.9 SkillData→SkillGraph→SkillExecutor` `红线 2`
- 查重：`SkillGraph` / `SkillExecutor` / `SkillData` / `ISkillGraph`

## 输出
- 新增 `assets/scripts/battle/skill/SkillData.ts` `SkillGraph.ts` `SkillExecutor.ts`（及 `HitResolver` / `DamageResolver`）
- 导出对应类与 `ISkillGraph` 令牌

## 严格约束
- 禁止 `switch(skillId)`（红线 2）；技能释放走 `SkillGraph` 节点；`SkillExecutor` 从 `ctx.get` 取依赖（红线 4）；实现 `ILifecycle`。

## 允许修改范围
- 新增 `assets/scripts/battle/skill/**`
- 允许 `core/GameBootstrap.ts` 注册 `ISkillGraph`
- **禁止修改** `battle/` 下既有 `BattleManager` / `SkillSystem` 等（本 Demo 只新增，不重构旧代码）

## 禁止修改范围
- `dungeon/**` `ui/**` `scene/**` `config/**` `assets/**` `app/**` `run/**` `utils/**` 及 `battle/` 内非 `skill/` 子目录

## 完成定义 (DoD)
- [ ] 单测：一个技能经 `SkillGraph` 释放，无 `switch`
- [ ] `npm run validate:all` 通过（含架构红线 2 校验）
- [ ] `assets/scripts/battle/skill/**` 未引入 `cc` 之外的非常规依赖

## 执行 Prompt
```
你执行 Demo4（技能数据驱动）。先读 docs/ai-tasks/_agent_contract.md 与 _architecture_report.md。
允许新增: assets/scripts/battle/skill/**；允许在 GameBootstrap 注册 ISkillGraph。
禁止修改: battle/ 下非 skill/ 子目录、dungeon/** ui/** scene/** config/** assets/** app/** run/** utils/**。
步骤: Step0→Step1(读 §3.9 + 查重)→Step2 Diff→Step2.5 Execution Plan 等 Plan Approved→Step3 写代码(严禁 switch(skillId), 走 SkillGraph, SkillExecutor 从 ctx.get 取依赖, 实现 ILifecycle)→Step4 test→Step5 修复→Step6 validate:all(红线2校验)→Step7 提交 [Demo4]→Step8 REPORT_demo4.md。
Token Budget ≤4 文件。禁止重复实现、禁止自由发挥、禁止关 Lint/Validate。
```

## Checkpoint 模板（`REPORT_demo4.md`）
```
# REPORT Demo4
完成: ✓  测试: ✓  Validate: ✓ (9 门禁, 红线2 通过)
新增文件: 4 (battle/skill/**)  修改文件: 1 (GameBootstrap)
风险: 无
```
