# REPORT D0-5

- 任务: D0-5 — GameBootstrap 接入 + 空场景验证
- 状态: ✅ 完成
- 提交: f21aff7（仅 2 文件，无连带改动）

## 完成定义 (DoD) 核对
- [x] 空场景链路：按序打印 `Initialize → Enter → Pause → Resume → Exit → Destroy`
      - 引擎侧：`GameBootstrap._wireInfra()` 用同一套四大件 + 探针驱动该序列（经 Logger channel "battle"）。
      - CI 侧：`tests/core/bootstrap_integration.test.ts` 用同一套四大件 + 同一探针/序列，断言消息顺序等于该 6 段（vitest 可跑，因 GameBootstrap 含 `cc` 无法在 node 跑）。
- [x] `npm run test` → 20 用例全过（6 文件，exit 0）
- [x] `npm run validate:all` → 9/9 门禁通过（含 gate-9 文档一致性 OK）
- [x] 既有 `ConfigService.loadAll()` 行为未被破坏：三步 load 原样保留，`console.log('[GameBootstrap] startup complete')` 仍出现（modified 文件内含该日志，未改）

## 交付物
- 修改 `assets/scripts/core/GameBootstrap.ts`（仅追加，未改既有逻辑）
  - 新增 imports：GameContext/ILogger/IConfigDatabase、Logger、ConfigDatabase、LifecycleManager/ILifecycle
  - 新增私有字段 `_ctx`、`_lifecycle`
  - 新增私有方法 `_wireInfra()`：创建 GameContext → register(ILogger, new Logger(true)) + register(IConfigDatabase, new ConfigDatabase()) → new LifecycleManager → 注入探针（ILifecycle）→ register → initialize + enterAll/pauseAll/resumeAll/exitAll/destroyAll，经 Logger 打印链路
  - `startup()` 末尾 try/catch 调用 `_wireInfra()`（非阻塞：失败仅 warn，不破坏既有启动流）
  - `onDestroy()` 追加 `this._ctx?.onDestroy()`（拆除注入的服务）
- 新增 `tests/core/bootstrap_integration.test.ts`（3 用例：链路顺序 / 双服务注册 / onDestroy 不抛）

## 新增文件: 1
- 回到地面/tests/core/bootstrap_integration.test.ts

## 修改文件: 1
- 回到地面/assets/scripts/core/GameBootstrap.ts

## 严格约束遵守
- 仅**追加**：未改既有三步 load（ConfigService/ConfigManager/AssetBundleService）、未改 `goToMain`
- 只 `new` 四大基础设施；探针为**匿名对象字面量**实现 ILifecycle（非 `new` 业务 System，红线 4 遵守）
- ConfigDatabase 不实现 ILifecycle → **未**注册进 LifecycleManager（避免伪造生命周期，§D0-5 约束）
- 未触碰 `assets/scripts/**` 其它目录

## 设计决策（如实记录）
- **引擎侧打印无法在 CI 验证**：GameBootstrap 含 `import { ... } from 'cc'`，vitest(node) 无法执行。故采用"双轨"验证——引擎内 `_wireInfra()` 用同一套类/序列打印；CI 内集成测试用同一套类/序列断言顺序。两者逻辑等价，链路正确性可被 CI 锁定。
- `_wireInfra()` 置于 `startup()` 末尾且包 try/catch：保证即便 infra 装配异常，既有 ConfigService.loadAll 等流程与 `startup complete` 日志照常完成（不破坏既有行为，DoD 第 4 条）。

## 风险: 无
- 无重复实现、无依赖冲突、无越权修改计划/接口/范围
- 无新增公开方法/通道/职责

## Demo0 收口
D0-0~D0-5 全部完成：vitest 测试基座 + GameContext + LifecycleManager + ConfigDatabase + Logger 四大基础设施已闭环，并经 GameBootstrap 接入验证。

## 下一步
进入 Demo1（按 `docs/2D转3D全面升级方案.md` §5.5 DebugPanel / 或 §5.6 SaveManager，取决于你定的 Demo 顺序）。每个 Demo 仍按 v3 规范独立任务文件 + 7 步 Pipeline 执行。
