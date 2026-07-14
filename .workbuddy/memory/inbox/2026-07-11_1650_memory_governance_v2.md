<!-- 编码: UTF-8 -->
# MEMORY PATCH — 治理增强 v2（待 merge main memory）

- **Source**: 用户在 2026-07-11 的多轮反馈，要求把删除/移动安全规则提升为一级入口，并加入版本号、规则优先级、规则来源、AGENTS 阅读顺序、规则冲突优先级、文件定位表。
- **Target**: `E:\game\.workbuddy\memory\MEMORY.md`
- **Proposed**: 在 MEMORY.md 顶部与规则区做如下增量（不删除现有有效块）：

## 1. 文件顶部新增元数据块
```
内存版本：2.1
最后更新：2026-07-11
所有者：AI 治理项目（多 AI 协作）
```

## 2. 启动阅读顺序改为
```
1. 本文件（MEMORY.md）
2. AGENTS.md            <-- 新增：项目级即时规则（行为约束）
3. docs/SKILL_REFERENCE.md  （加载被触发的 Skill）
4. 最新 daily/<date>.md
5. 相关 topics/*.md
6. topics/ART_RESOURCE_RULES.md（任何美术操作前）
7. README.md（写记忆时）
```
理由：AGENTS 是项目级规则、记忆是长期记忆，职责不同，AI 进入仓库应先看 AGENTS 的即时约束。

## 3. 新增一级规则块：DELETE_SAFETY（P0）
```
DELETE_SAFETY (P0, 绝对不可违反)
  任何 删除 / 移动 / 重命名 操作前，必须：
  ① 默认 Dry-Run（工具：tools/maintenance/cleanup_scan.py）
  ② 四步安全门：hash 一致 → git grep 引用=0 → package.json 未引用 → 删除
  ③ 删除前建 Git 安全点：git tag cleanup_before_<YYYYMMDD> 或 git checkout -b backup_cleanup
  ④ 删除后重扫验证；引用变化立即终止并提示人工
  来源：AGENTS.md / docs/文件夹管理与清理方案.md §1,§8,§11
  核心保留清单：config/must_keep.json
```

## 4. 规则优先级标注（P0/P1/P2）
为现有主要块加前缀：
- P0（绝对不可违反）：ENCODING_WRITE_POLICY、CROSS_FILE_CONSISTENCY、DELETE_SAFETY、ASCII_SOURCE_POLICY
- P1（必须遵守）：ARCH_FOUNDATION / RUNTIME_ASSEMBLY / COCOS_EDITOR_BINDING_POLICY / RESPONSIVE_LAYOUT / TEXT_MIGRATION / ROUTE_UNLOCK
- P2（建议遵守）：部分约定性块（如相对路径细节、命名建议）

## 5. 规则冲突优先级说明
```
规则冲突时优先级：P0 安全性 > P1 架构 > P2 编码风格。
例：若某架构要求加载场景，但安全门禁止（P0），则安全优先，先报告人工。
```

## 6. 现有块补 Rule Source
为 ART_RESOURCE_RULES / CONVENTIONS / 等块补 `来源：topics/<file>.md`，便于 AI 直接跳转。

## 7. 新增文件定位表（明确各治理文件职责）
| 文件 | 定位 |
|------|------|
| AGENTS.md | AI 每次进入仓库必须遵守的即时规则（行为约束） |
| MEMORY.md | 长期稳定的项目知识索引（项目记忆） |
| SKILL_REFERENCE.md | 技能加载入口（能力路由） |
| topics/ | 各领域长期规范 |
| daily/ | 每日上下文与工作日志 |
| inbox/ | 待合并的记忆补丁 |
| docs/ | 设计、方案、规划、审查文档 |

- **Evidence**: 见 `docs/文件夹管理与清理方案.md` §11、`AGENTS.md` v2.0、`docs/CHANGELOG_AI_RULES.md`、`docs/adr/`。
- **Conflicts**: 现有 MEMORY.md 顶部"启动阅读顺序"未含 AGENTS.md；无 DELETE_SAFETY 一级块；无版本号/优先级。本 patch 不删除既有有效块。
- **Note**: 本 patch 取代并合并此前 `inbox/2026-07-11_1640_cleanup_safety_memory.md`（清理安全相关条目已纳入 DELETE_SAFETY 块）。
