# Demo2 — 3D 跟随相机 CameraBrain

> 阶段: Demo2（Phase 0）｜ Token Budget: ≤2 文件 ｜ 执行前先读 `_agent_contract.md` + `_architecture_report.md`

## 输入
- `docs/2D转3D全面升级方案.md §3.4 CameraBrain` `§5.4 参数取自 ConfigDatabase.getCamera`
- 查重：`CameraBrain` / `ICameraBrain`

## 输出
- 新增 `assets/scripts/camera/CameraBrain.ts`：导出 `ICameraBrain` 令牌 + `class CameraBrain`（`setMode(Follow/Shake/LockOn/Cinematic)`、平滑跟随、受击抖动）

## 严格约束
- 遵循 §3.4；模式参数来自 `ConfigDatabase.getCamera`，**不得**硬编码可调参数；实现 `ILifecycle`。

## 允许修改范围
- 新增 `assets/scripts/camera/CameraBrain.ts`
- 允许 `core/GameBootstrap.ts` 注册 `ICameraBrain`

## 禁止修改范围
- `battle/**` `dungeon/**` `ui/**` `scene/**` `config/**` `assets/**` `app/**` `run/**` `utils/**` 及其它未列目录

## 完成定义 (DoD)
- [ ] 单测各模式切换状态正确
- [ ] 空场景相机平滑跟随 + 受击抖动
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
你执行 Demo2（3D 相机）。先读 docs/ai-tasks/_agent_contract.md 与 _architecture_report.md。
允许新增: assets/scripts/camera/CameraBrain.ts；允许在 GameBootstrap 注册 ICameraBrain。
禁止修改: battle/** dungeon/** ui/** scene/** config/** assets/** app/** run/** utils/** 及其它未列目录。
步骤: Step0→Step1(读 §3.4 + 查重)→Step2 Diff→Step2.5 Execution Plan 等 Plan Approved→Step3 写代码(模式参数取自 ConfigDatabase.getCamera, 实现 ILifecycle)→Step4 test→Step5 修复→Step6 validate:all→Step7 提交 [Demo2]→Step8 REPORT_demo2.md。
Token Budget ≤2 文件。禁止重复实现、禁止自由发挥、禁止关 Lint/Validate。
```

## Checkpoint 模板（`REPORT_demo2.md`）
```
# REPORT Demo2
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
新增文件: 1  修改文件: 1 (GameBootstrap)
风险: 无
```
