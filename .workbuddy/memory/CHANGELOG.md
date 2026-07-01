# CHANGELOG

> 长期记忆更新历史。每次合并 inbox → topics 后记录。

## 2026-07-01

### 编码质量专项治理
- **类型**: 新增工具 + 规则
- **Scope**: ENGINEERING
- **变更**: 新增 encoding_audit.py 编码审计脚本、.editorconfig、CI 门禁接入、AI 协作编码规则
- **源补丁**: `inbox/2026-07-01_1050_encoding_audit_completed.md`
- **影响**: 所有 .ts/.json/.md/.csv/.py 文件必须为 UTF-8；修改后必须运行 `encoding_audit.py --ci`
- **修复**: 2 个 docs 文件中的真实乱码（装[corrupt-text]备UI→装备UI, 地牢地图→地牢地图）

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
- 2026-07-01: Merged ENCODING_WRITE_POLICY into MEMORY.md and topics/ENGINEERING_STANDARDS.md. Explicit UTF-8 writes and `npm.cmd run validate:all` are now mandatory after edits.
