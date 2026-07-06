# Memory Patch

## Source
- Thread: 记忆系统重构对话
- Date: 2026-06-30 17:00
- Scope: MEMORY_SYSTEM

## Proposed Updates
- 建立记忆补丁工作流：不同对话只写 inbox/，不直接改 topics/ 或 MEMORY.md。
- 新增记忆系统层级：MEMORY.md(索引) → topics/(专题) → inbox/(补丁) → archive/(归档) + CHANGELOG.md。
- 新增 ART_PIPELINE.md 专题文件（AI 美术管线规则）。
- 新增 RESOURCE_STATUS.md 专题文件（418 资源三状态统计）。
- MEMORY.md 拆分为纯索引（1.7KB）。
- 所有专题文件统一格式：状态/强制规则/当前实现/禁止事项/验收命令/最近变更。
- 已创建 archive/ 目录用于存放过期内容。

## Evidence
- .workbuddy/memory/MEMORY.md — 新索引
- .workbuddy/memory/topics/ — 9 个专题文件
- .workbuddy/memory/inbox/ — 本文件
- .workbuddy/memory/CHANGELOG.md
- .workbuddy/memory/archive/ — 归档目录

## Conflicts
- 无
