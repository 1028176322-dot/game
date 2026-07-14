<!-- 编码: UTF-8 -->
# AGENTS.md — 项目级 AI 指令（v2.0，2026-07-11）

> **编码**: UTF-8
> 本文件是 `E:\game` 仓库的**项目级指令**，所有 AI 编码助手（Cursor / Claude Code / Codex / Aider / WorkBuddy / Copilot 等）进入本仓库工作时必须遵守。

> **权威来源**：完整设计、论证与演进见 `docs/文件夹管理与清理方案.md` 与 `docs/CHANGELOG_AI_RULES.md`。**若本文件与方案文档冲突，以方案文档最新版为准。**

## 1. 删除 / 移动 / 重命名 安全门（P0，绝对不可违反）
任何 AI 执行破坏性操作前，**必须**完成四步：
1. 默认 Dry-Run，先出清单，不立即执行。
2. 四步安全门：① hash 一致 → ② `git grep` 全文引用数 = 0 → ③ `package.json` 的 `scripts` 未引用 → ④ 才删除。
3. 删除前建 Git 安全点：`git tag cleanup_before_<YYYYMMDD>` 或 `git checkout -b backup_cleanup`。
4. 删除后重扫验证；若引用关系变化，**立即终止并提示人工**。
- 工具：`python tools/maintenance/cleanup_scan.py`（默认 dry-run，内置四步门；`--apply` 须 `--i-have-reviewed-the-plan`）。
- 核心保留清单见 `config/must_keep.json`（DebugPanel.ts / GameBootstrap.ts 等），**绝不自动删**。

## 2. 文件名判定红线（P0）
- 禁止仅凭文件名删除；**不匹配置换裸 `debug` / `tmp` / `temp`**（会误伤 `DebugPanel.ts` 等正式模块）。
- 仅用边界标记 `_debug_` / `_tmp_`；弱标记 `tmp_` / `temp_` 永不自动删，须人工复核。

## 3. 编码 / 路径（P0）
- 所有文件 UTF-8；写源码 / 文档前加载 encoding-pipeline-guard。
- 禁止绝对路径，一律相对路径。

## 4. AI 执行原则（精简版）
扫描 → 计划 → 确认 → 执行 → 重扫 → 报告。任何删除性操作默认 Dry-Run，经人工确认 + Git 安全点后才执行。

## 5. 仓库结构（信息）
- 双层：`E:\game` = 跨项目层（规划 / 审计 / 美术生成）；`E:\game\回到地面` = 项目层。属既定设计，勿"修复"其重复。
- 工具分类：`tools/generators | validators | maintenance | scratch`；实验代码入 `experimental/`，归档入 `archive/`，废弃入 `deprecated/`。

## 6. 完整规范入口
- `docs/文件夹管理与清理方案.md`：文件分析、清理清单、目录规划、命名、跨 AI 落地（§11）、AI 执行原则、优先级 P0/P1/P2。
- `docs/CHANGELOG_AI_RULES.md`：规则演进日志。
- `docs/adr/`：架构决策记录（ADR-001 双层目录 / ADR-002 DryRun / ADR-003 不用 tmp 判断）。
- `E:\game\.workbuddy\memory\MEMORY.md`：WorkBuddy 会话自动注入的规则索引（含 DELETE_SAFETY）。
