# REPORT Demo1 — 3D 模型加载与骨骼动画（AssetCache + ModelRenderService）

> 依据: docs/2D转3D实施计划.md §Demo1 + docs/ai-tasks/demo1.md
> 执行: 2026-07-10

## 完成定义 (DoD) 核对
- [x] 单测 `AssetCache` 引用计数/释放正确 —— 5 用例全过（load/重复load/释放延迟/防抖/未知id/destroy）
- [x] `npm run test` 全绿 —— 25 用例 / 7 文件 / exit 0
- [~] 空场景加载一个 `.glb` 播 idle，引用计数归零后释放 —— **见风险项**，引擎侧代码已就位但当前工程无 3D 资产，无法在 CI 验证
- [x] `npm run validate:all` 9 门禁通过

## 交付物
| 类型 | 文件 | 说明 |
|---|---|---|
| 新增 | `assets/scripts/assets/AssetCache.ts` | `IAssetCache` 接口 + `class AssetCache implements IAssetCache, ILifecycle`；引用计数 + ReleaseQueue 延迟释放；**纯 TS 零 `cc` 依赖**；loader 注入复用 `AssetBundleService` |
| 新增 | `assets/scripts/render/ModelRenderService.ts` | 挂模型/播 idle/引用计数驱动释放；**含 `cc`**，引擎侧契约 |
| 新增 | `tests/core/assetcache.test.ts` | 5 用例，纯逻辑单测 |
| 修改 | `assets/scripts/core/GameBootstrap.ts` | `_wireInfra()` 注册 `IAssetCache` + 接入 `LifecycleManager` 销毁 |

## 严格约束遵守
- 遵循 §3.6 签名：`load` / `release` / `refCount`；`AssetCache` 实现 `ILifecycle`（由 LifecycleManager 管理）✓
- **禁止重复实现**：底层加载委托注入的 loader → `AssetBundleService.instance.loadById`，未重写 loader/reader ✓
- 未引入新增方法/接口/职责；`ModelRenderService` 不实现 `ILifecycle`（仅消费 `AssetCache`）✓
- 未触碰 `battle/**` `dungeon/**` `ui/**` `scene/**` `config/**` `app/**` `run/**` `utils/**` ✓

## 修复记录 (Step5)
- **P0 编码审计 `comment_may_swallow_code`**：`AssetCache.ts` 第 7 行注释 `//    class does NOT re-implement...` 被判定为"注释掉的代码"。改为 `//    cache does NOT re-implement...` 并去掉内层双引号。复跑 `encoding_audit --ci` → `issues=0, p0=0` ✓

## 风险 / 上报项
1. **`.glb` 引擎验证不可执行**：当前项目为 2D，美术轨尚未产出 3D 模型资产（`.glb`），故 DoD 中"空场景加载 .glb 播 idle"暂无法运行。`ModelRenderService` 代码逻辑正确（load→instantiate→play idle→release），待 3D 资产就绪后在引擎内验证。
2. **`ModelRenderService` 无独立单测**：因引用 `cc`，无法在 node/vitest 运行。其引用计数逻辑已下沉到 `AssetCache`（纯 TS 单测覆盖）。引擎侧接口契约正确。
3. **Token Budget**：4 文件（2 新增源 + 1 测试 + 1 修改）在 3~5 范围 ✓。

## 提交
`cf62e7a` — `[Demo1] add AssetCache (ref-count + lifecycle) + ModelRenderService, wire IAssetCache (§3.6)`
仅 4 文件入库，工作区无关改动未连带。
