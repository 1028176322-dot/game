# Memory System

此工作空间使用 inbox-first 记忆更新机制。

## 写入规则

**允许直接写**：
- `inbox/YYYY-MM-DD_HHMM_scope_status.md`
- `daily/YYYY-MM-DD.md`（日常工作日志）

**禁止直接写**（除非用户明确说"合并主记忆"）：
- `MEMORY.md`
- `topics/*.md`
- `CHANGELOG.md`

## 使用方式

1. 先读 `MEMORY.md` 了解索引和规则
2. 根据当前任务读对应的 `topics/*.md`
3. 如需保存新记忆 → 复制 `templates/MEMORY_PATCH_TEMPLATE.md` 写入 `inbox/`
4. 只有用户说"合并主记忆"时才修改 `topics/`、`MEMORY.md`、`CHANGELOG.md`

## 目录结构

```
MEMORY.md              → 索引 + 强制规则 + 最近高优先级记忆
templates/             → 补丁模板
inbox/                 → 各对话提交的记忆补丁
topics/                → 长期专题记忆（只读，不直接改）
daily/                 → 每日工作日志
archive/               → 已归档的过期内容
CHANGELOG.md           → 合并历史
```
