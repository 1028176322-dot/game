# CHANGELOG

> 长期记忆更新历史。每次合并 inbox → topics 后记录。

## 2026-06-30

### 记忆系统重构
- **类型**: 工作流变更
- **Scope**: MEMORY_SYSTEM
- **变更**: 建立 inbox/topics/archive/CHANGELOG 四层工作流，MEMORY.md 降为纯索引
- **源补丁**: `inbox/2026-06-30_1700_memory_system_confirmed.md`
- **影响**: 不同对话不再直接改 topics，统一通过 inbox 提交补丁

### 新增专题文件
- **ART_PIPELINE.md**: AI 美术管线规则（Scope: ART_PIPELINE）
- **RESOURCE_STATUS.md**: 418 资源三状态统计（Scope: RESOURCE_STATUS）

### 标准化专题文件格式
- 全部 9 个 topics/*.md 改为：状态/强制规则/当前实现/禁止事项/验收命令/最近变更
