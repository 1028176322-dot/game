# Demo1 — 3D 模型加载与骨骼动画

> 阶段: Demo1（Phase 0）｜ Token Budget: ≤3 文件 ｜ 执行前先读 `_agent_contract.md` + `_architecture_report.md`

## 输入
- `docs/2D转3D全面升级方案.md §3.6 AssetCache` `§5.9 资产管线` `§3.2 渲染管线切换`
- 查重：`AssetCache` / `ModelRenderService` / `IAssetCache`

## 输出
- 新增 `assets/scripts/assets/AssetCache.ts`：导出 `IAssetCache` 令牌 + `class AssetCache implements IAssetCache`（`load` / `release` / `refCount`，按 scope 释放）
- 新增 `assets/scripts/render/ModelRenderService.ts`：挂模型、播 idle 动画、引用计数驱动释放

## 严格约束
- 遵循 §3.6 / §5.9 签名；不得新增无关加载策略；`AssetCache` 必须实现 `ILifecycle`（由 LifecycleManager 管理）。

## 允许修改范围
- 新增 `assets/scripts/assets/AssetCache.ts` `assets/scripts/render/ModelRenderService.ts`
- 允许修改 `core/GameBootstrap.ts` 注册 `IAssetCache`

## 禁止修改范围
- `battle/**` `dungeon/**` `ui/**` `scene/**` `config/**` `app/**` `run/**` `utils/**` 及其它未列目录

## 完成定义 (DoD)
- [ ] 单测 `AssetCache` 引用计数/释放正确
- [ ] 空场景加载一个 `.glb` 播 idle，引用计数归零后释放
- [ ] `npm run validate:all` 9 门禁通过

## 执行 Prompt
```
你执行 Demo1（3D 模型加载）。先读 docs/ai-tasks/_agent_contract.md 与 _architecture_report.md。
允许新增: assets/scripts/assets/AssetCache.ts, assets/scripts/render/ModelRenderService.ts；允许在 GameBootstrap 注册 IAssetCache。
禁止修改: battle/** dungeon/** ui/** scene/** config/** app/** run/** utils/** 及其它未列目录。
步骤: Step0 扫描 → Step1 读 §3.6/§5.9 + 查重 → Step2 Diff → Step2.5 Execution Plan 等待 Plan Approved
→ Step3 写代码（AssetCache 实现 ILifecycle，严格按 §3.6）→ Step4 npm run test → Step5 修复 → Step6 validate:all → Step7 提交 [Demo1] → Step8 生成 REPORT_demo1.md。
Token Budget ≤3 文件。禁止重复实现、禁止自由发挥、禁止关 Lint/Validate。
```

## Checkpoint 模板（`REPORT_demo1.md`）
```
# REPORT Demo1
完成: ✓  测试: ✓  Validate: ✓ (9 门禁)
新增文件: 2  修改文件: 1 (GameBootstrap)
风险: 无
```
