<!-- 编码: UTF-8 -->
# MEMORY Patch: CLEANUP & DELETION SAFETY（跨会话绑定）

> **编码**: UTF-8
> 按项目 `MEMORY_WRITE_RULE`，本 patch 提议向 `E:\game\.workbuddy\memory\MEMORY.md` 注入"清理/删除安全"规则块，使每个 WorkBuddy 会话自动遵守。需用户说 "merge main memory" 后方可合并。

## Source（来源）
- 用户指令（2026-07-11）：「如果有多个不同的 ai 对话，怎么让它们都遵守规则，也要写进方案」。
- 背景：`docs/文件夹管理与清理方案.md` 已定义 AI 执行原则 7 条与安全门，但仅写在文档中，AI 不打开就不会遵守。

## Proposed（提议内容）
在 `MEMORY.md` 的 `## High Priority Rules` 下新增一个子节（位置：建议放在 `### Encoding & Source` 之后）：

```
### Cleanup & Deletion Safety (cross-session binding)
- NO_DIRECT_DELETE: 本仓库任何 delete/move/rename 必须走
  tools/maintenance/cleanup_scan.py 的 dry-run 计划 -> 人工确认 ->
  --apply --i-have-reviewed-the-plan。禁止对 tracked 文件裸 rm/git rm
  而不经过四步安全门（hash -> git grep 引用数=0 -> package.json 检查 -> 删除）。
- GIT_SAFETY_TAG: 任何删除前建 git 安全点
  (git tag cleanup_before_<YYYYMMDD> 或 git checkout -b backup_cleanup)。
- NO_BARE_SUBSTRING: 禁止凭文件名裸子串 debug/tmp/temp 判定可删
  （会误伤 DebugPanel.ts）；用边界标记 _debug_/_tmp_。
- 规范文档: docs/文件夹管理与清理方案.md §8(7条) / §11(跨会话落地)；
  跨工具约定另见仓库根 AGENTS.md。
```

并在 `## Startup Reading Order` 末尾追加一行（指向规范文档）：
```
7. docs/文件夹管理与清理方案.md（清理/删除安全规则与 AI 执行原则）。
```

## Evidence（依据）
- `tools/maintenance/cleanup_scan.py` 已落地并实跑：四步安全门内置，SAFE_DELETE 仅 26 个 prompts.backup_*，BLOCKED 9 个（_tmp_check_bosses* 等因 grep 发现引用被阻断）。
- `E:\game\AGENTS.md` 已创建（跨工具通用项目指令）。
- 文档 §8「AI 执行原则」+ §11「跨 AI 会话规则落地」已落地。

## Conflicts（冲突）
- 无。`MEMORY_WRITE_RULE` 要求经 inbox patch 合并，本文件即遵循该流程，不直接改 MEMORY.md。

## Target（目标文件）
- `E:\game\.workbuddy\memory\MEMORY.md`
