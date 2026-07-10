# REPORT D0-0

> **编码**: UTF-8
> 任务: 建立 core/ 单测基座（vitest）｜ 执行: 2026-07-10

## Status: DONE (with 1 external gate caveat)

- 完成: ✓
- 测试: ✓ (`npm run test` exit 0 — 1 test file, 1 case)
- Validate: ⚠ 8/9 门禁通过；第 9 项「文档一致性」FAIL — 见下方风险说明
- 新增文件: 2 (`vitest.config.ts`, `tests/core/smoke.test.ts`)
- 新增(依赖): 1 (`回到地面/package-lock.json`，npm install 生成)
- 修改文件: 1 (`回到地面/package.json` — scripts.test + devDependencies.vitest)
- 未触碰: `assets/scripts/**`, `tsconfig.json`, 其它目录

## DoD 核对
- [x] `npm run test` 可运行且 exit 0
- [x] 8/9 `validate:all` 门禁通过（配置 / 包体 / 编码 / 架构 / TS静态 / 资源注册 / UI皮肤 / 非UI资源）
- [x] `assets/scripts/core/` 四大文件后续确认未引入 `cc`（D0-0 未创建业务文件）
- [ ] 文档一致性门禁 FAIL — 非 D0-0 引入，见风险

## 风险 / 阻断（依 Agent Contract #6 必须上报）
- 「文档一致性」门禁失败，根因在 `art-pipeline SKILL.md` 含 2 条失效引用：
  1. `tools/asset_validate.py` — 文件**不存在**（真失效引用）
  2. `docs/美术资源制作参数总表_3D.md` — 文件存在，但 SKILL.md 用相对路径无法解析
- 此问题属**美术资源管线文档（art track）**，与 D0-0 无关；用户已确认「美术资源生成交另一个对话」。
- 按 Agent Contract #5/#6，D0-0 **不越权**修改 `art-pipeline SKILL.md`；建议由美术轨单独修复或在下个 art 任务处理。
- 不影响 core/ 测试基座功能，不影响后续 D0-1~D0-5。

## 提交
- commit `bffc71a` `[Demo0][D0-0] setup vitest test base for core/`
- 仅提交 4 文件，`node_modules` 未跟踪、未提交；未连带提交工作区其它无关改动（美术/配置等）。

## 下一步
- D0-1 LifecycleManager / D0-2 GameContext / D0-3 ConfigDatabase / D0-4 Logger / D0-5 GameBootstrap 接入。
- 建议并行开一个独立任务修复 `art-pipeline SKILL.md` 2 条失效引用，以解除第 9 门禁（不在 D0-0 范围内）。
