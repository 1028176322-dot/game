<!-- 编码: UTF-8 -->
# CHANGELOG_AI_RULES.md — AI 治理规则演进日志

> 记录 `AGENTS.md` / `docs/文件夹管理与清理方案.md` / `tools/maintenance/cleanup_scan.py` 的规则演进。
> 最新权威状态以 `docs/文件夹管理与清理方案.md`（§11）与 `AGENTS.md`（v2.0）为准。

## v4.0（2026-07-11）— 优先级 / AST 孤儿 / CI 退出码 / 外部配置
- `cleanup_scan.py` 升级：
  - 新增候选优先级 **P0 / P1 / P2**（P0 必须人工 / P1 建议人工 / P2 AI 可自动）。
  - `MUST_KEEP` 改为外部 `config/must_keep.json`，新增核心文件无需改代码。
  - 孤儿检测升级为 **AST 引用图**（py `ast` + ts `import/export/require/dynamic` + md link），更准确。
  - 新增 **CI 退出码**：`0` 无 / `1` 发现 SAFE / `2` 发现 BLOCKED / `3` 失败。
- `AGENTS.md` 加版本号 +「冲突以方案文档为准」条款，消除两份文档内容漂移。
- 新增 `docs/CHANGELOG_AI_RULES.md`（本文件）与 `docs/adr/`（ADR-001 / 002 / 003）。
- 新增 `config/must_keep.json`。

## v3.0（2026-07-11）— 核心保留清单雏形
- 确认 `DebugPanel.ts` / `GameBootstrap.ts` 等核心文件绝不自动删。
- 双层目录职责厘清（根 `tools` = 美术生成管线；子 `tools` = 引擎校验/CI）。
- （后续 v4 将清单落地为外部 `config/must_keep.json`。）

## v2.0（2026-07-11）— Dry-Run 强制 + 安全门
- 引入 `cleanup_scan.py`：默认 **DRY-RUN**，四步安全门（hash → grep 引用 → package.json → git 状态）。
- `apply` 须 `--i-have-reviewed-the-plan` 二次确认。
- 删除判定联合 git tracked / ignored / Modified + grep + package.json。
- 文件名匹配改为边界形式 `_debug_` / `_tmp_`，不再匹配置换裸 `debug` / `tmp`。

## v1.0（早期）— 静态分析，无强制流程
- 仅有 `docs/文件夹管理与清理方案.md` 静态分析报告，无强制删除流程。
- 曾出现「9/9 门禁误读」「MD5 相同即删」等风险，催生 v2 安全门。
