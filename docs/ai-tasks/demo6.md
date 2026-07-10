# Demo6 — 100 怪同屏性能（DebugPanel 雏形）

> 阶段: Demo6（Phase 0）｜ Token Budget: ≤2 文件 ｜ 执行前先读 `_agent_contract.md` + `_architecture_report.md`

## 输入
- `docs/2D转3D全面升级方案.md §5.5 DebugPanel（雏形）` `§8.1 性能预算表`
- 查重：`DebugPanel` / `PerfSampler` / `DebugService`

## 输出
- 新增 `assets/scripts/debug/DebugPanel.ts`：F8 开关、FPS/FrameTime/Memory/DrawCall 打点；仅 Dev/Debug 构建包含
- 新增 `assets/scripts/debug/PerfSampler.ts`

## 严格约束
- `DebugPanel` 仅 Dev/Debug 构建包含（§5.5）；打点数据来自各 System 暴露的 debug 接口 + `Logger`；**不得**改动业务主链路。

## 允许修改范围
- 新增 `assets/scripts/debug/**`
- 允许 `core/GameBootstrap.ts` 条件挂载 `DebugPanel`（条件编译）

## 禁止修改范围
- `battle/**` `dungeon/**` `ui/**` `scene/**` `config/**` `assets/**` `app/**` `run/**` `utils/**` 及其它未列目录（除非为接入打点而只读其 debug 接口）

## 完成定义 (DoD)
- [ ] 单测 `PerfSampler` 采样正确
- [ ] 空场景 100 怪同屏：中端机 ≥30fps、DrawCall<120、内存稳定
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
你执行 Demo6（性能基线）。先读 docs/ai-tasks/_agent_contract.md 与 _architecture_report.md。
允许新增: assets/scripts/debug/**；允许在 GameBootstrap 条件挂载 DebugPanel。
禁止修改: battle/** dungeon/** ui/** scene/** config/** assets/** app/** run/** utils/** 及其它未列目录。
步骤: Step0→Step1(读 §5.5/§8.1 + 查重)→Step2 Diff→Step2.5 Execution Plan 等 Plan Approved→Step3 写代码(DebugPanel 仅 Dev/Debug 构建包含, 严格按 §5.5/§8.1, 不改业务主链路)→Step4 test→Step5 修复→Step6 validate:all→Step7 提交 [Demo6]→Step8 REPORT_demo6.md。
Token Budget ≤2 文件。禁止重复实现、禁止自由发挥、禁止关 Lint/Validate。
```

## Checkpoint 模板（`REPORT_demo6.md`）
```
# REPORT Demo6
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
新增文件: 2 (debug/**)  修改文件: 1 (GameBootstrap, 条件挂载)
风险: 无（需真机验收 ≥30fps / DrawCall<120）
```
