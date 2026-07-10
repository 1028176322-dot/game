# REPORT Demo2 — CameraBrain (3D 跟随相机)

- 完成: ✓
- 测试: ✓ (`npm run test` 32 用例全过 / 8 文件 / exit 0)
- Validate: ✓ (`validate:all` 9/9 门禁通过；编码审计 issues=0, p0=0)
- 新增文件: 2 (`assets/scripts/camera/CameraBrain.ts`, `tests/core/camerabrain.test.ts`)
- 修改文件: 1 (`assets/scripts/core/GameBootstrap.ts`)
- 风险: 无（无破坏性改动，既有启动逻辑原样保留）

## 交付物
- `CameraBrain.ts`：`ICameraBrain` 令牌(复用 GameContext) + `enum CameraMode`(7 模式) + `class CameraBrain implements ILifecycle`
  - 模式：Follow / LockOn / Boss / Dialogue / Cinematic / Shake / Zoom（**完整 7 模式，见上报项 #1**）
  - `setMode` / `triggerShake(amp?, dur?)` / `attach(camera)` / `setTarget(pos)` / `lateUpdate(dt)`
  - 参数全部来自 `ConfigDatabase.getCamera(modeKey)`，**零硬编码可调参数**（缺省兜底）
  - **零顶层 `cc` import** → node/vitest 可单测；引擎相机节点运行时经 `attach` 注入（结构类型 `ICameraNode`）
- `camerabrain.test.ts`：7 用例（令牌复用 / 模式切换 / 参数非硬编码验证 / 平滑跟随 / 受击抖动 / 生命周期）
- `GameBootstrap.ts`：`_wireInfra` 注册 `ICameraBrain` + 接入 `LifecycleManager` + `_findMainCamera()` 引擎侧 attach 主相机（非致命）

## 完成定义 (DoD) 核对
- [x] 单测各模式切换状态正确 → 7 用例覆盖 setMode / triggerShake / currentMode
- [x] 空场景相机平滑跟随 + 受击抖动 → 数学逻辑已单测覆盖（follow lerp + shake 偏移/衰减）；**引擎内实际渲染验证待 3D 场景就绪后运行**（双轨策略，同 Demo1）
- [x] `npm run validate:all` 9 门禁通过

## 修复记录 (Step5)
- 源文件 bug：`lateUpdate` 误引用未定义成员 `this._shakeFreq` → 改为 per-mode 参数 `p.shakeFreq`（NaN→正常）。属任务内合法修复，未改设计。

## 上报项 (Agent Contract #6)
1. **模式数量差异（任务卡 vs 权威定义）**：`demo2.md` 骨架 `setMode(Follow/Shake/LockOn/Cinematic)` 仅列 4 模式，但权威源 §3.4 定义 **7 模式**策略树。按"权威源优先"实现完整 7 模式，未删减。建议后续统一 `demo2.md` 与 §3.4 的模式清单。
2. **CameraBrain 无独立 `ICameraBrain` 接口定义**：复用 `GameContext` 的 `ICameraBrain` 令牌常量，未在 CameraBrain.ts 重复定义（遵守"禁止重复实现"）。
3. **参数命名空间映射**：`ConfigDatabase.getCamera(id)` 当前按 D0-3 的临时映射读取 `zones[id]`，待 `ConfigTypes` 补全 `CameraConfig` 后需校正命名空间（已在 CameraBrain 头部注释标明）。当前 GameBootstrap 仍以 `new ConfigDatabase()`（无注入数据）初始化，相机参数走缺省兜底；真实相机参数需等 ConfigService 注入管线接通（后续 Demo）。
4. **Token Budget**：骨架标"≤2 文件"，实际为 2 源文件(CameraBrain.ts + GameBootstrap.ts 修改) + 1 测试文件(camerabrain.test.ts) = 3 文件。因 DoD 明确要求"单测各模式切换"，测试文件不可省，与 Demo1 一致。按"2 源文件"理解并上报。

## Checkpoint
断点恢复入口：`docs/ai-tasks/demo2/REPORT_demo2.md` + commit `0ea8287`。
