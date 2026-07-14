# 内存补丁

**来源**: TapTap 迁移 P0 阶段（2026-07-08 会话）

## 提议更新: MEMORY.md

### 新增一条 High Priority Rule

```
- **TAPTAP_PROGRESS_LOG - 2026-07-08**: `docs/TapTap迁移进度.md` 是 TapTap 发布迁移任务的唯一进度跟踪文件。**每次完成一个 TapTap 迁移子任务后，必须立即更新此文件**：将对应子任务标记为 ✅ 完成，更新总览百分比，补充备注（完成日期、关键决策、待处理项）。这是强制要求，不可跳过。未来新会话启动后，首先读取此文件恢复进度上下文。
```

**建议位置**: 插入在 PROGRESS_REPORT_SYNC 规则之后。

## 提议更新: CHANGELOG.md

- 新增 `docs/TapTap迁移进度.md` — TapTap 发布迁移进度跟踪文件

## 证据

- 用户明确要求"你需要一份进度文件来记录进度"、"每次完成任务后都需要更新"
- 用户指出"你需要更新到记忆里，不然后面你会忘记"
- MEMORY_WRITE_RULE 要求通过 inbox 提交流程而非直接编辑

## 可能冲突

- **MEMORY_WRITE_RULE**: 此补丁正通过正确的 inbox 流程提交，无冲突
- 建议合并后再添加此规则到 MEMORY.md

## 建议目标文件

- `MEMORY.md` — High Priority Rules 区域
- `CHANGELOG.md` — 新增文档记录
