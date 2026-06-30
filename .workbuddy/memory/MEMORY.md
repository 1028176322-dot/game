# 项目记忆索引

> **入口文件 — 任何对话启动时第一优先读取。**
> **永远控制在 3KB 以内。**

---

## 记忆写入规则（强制）

**不同对话不得直接修改长期记忆文件。**

### 允许直接写
- `inbox/YYYY-MM-DD_HHMM_scope_status.md` — 记忆补丁
- `daily/YYYY-MM-DD.md` — 每日工作日志

### 禁止直接写（除非用户明确说"合并主记忆"）
- `MEMORY.md` — 本索引文件
- `topics/*.md` — 所有专题文件
- `CHANGELOG.md` — 合并历史

### 保存新记忆的流程
```
1. 复制 templates/MEMORY_PATCH_TEMPLATE.md
2. 命名为 inbox/YYYY-MM-DD_HHMM_scope_status.md
3. 填写：Source / Proposed Updates / Evidence / Conflicts / Suggested Target
4. 等用户说"合并主记忆"→ 再写入 topics/ + MEMORY.md + CHANGELOG
```

详细说明见 `README.md`。

---

## 启动读取顺序

1. **本文件** — 强制规则 + 索引
2. 当前任务相关的 `topics/*.md`
3. 如需保存记忆，读 `README.md` 确认流程

---

## 必读规则索引

| Scope | 文件 |
|-------|------|
| CONVENTIONS | `topics/CONVENTIONS.md` — 平台约束、技术栈、配置规范、版权规避 |
| WECHAT_REVIEW | `topics/WECHAT_REVIEW_RULES.md` — 微信审核红线、名称/美术/功能合规 |
| ENGINEERING | `topics/ENGINEERING_STANDARDS.md` — 分层职责、编码规则、开发流程 |
| ARCH_GOVERNANCE | `topics/ARCHITECTURE_GOVERNANCE.md` — Phase 1-9 架构治理、资源替换门禁 |
| RUNTIME_ASSEMBLY | `topics/RUNTIME_ASSEMBLY.md` — 运行时装配链、渲染接入状态 |
| ART_PIPELINE | `topics/ART_PIPELINE.md` — AI 美术生成管线、提示词规范 |
| RESOURCE_STATUS | `topics/RESOURCE_STATUS.md` — 418 资源三状态（存在/映射/接入） |
| DESIGN | `topics/DESIGN_MILESTONES.md` — 设计里程碑、文件结构 |
| DEV_PROGRESS | `topics/DEV_PROGRESS.md` — Phase 2-3 开发进度 |

## 最近高优先级记忆

- **MEMORY_SYSTEM — 2026-06-30**：建立记忆补丁工作流，不同对话只写 inbox/，不直接改 topics/ 或 MEMORY.md。
- **ART_PIPELINE — 2026-06-30**：美术风格已变更为**卡通动物风**（萌系地下城小动物），prompts.json 需同步更新。禁止使用像素块风/暗黑风描述。
- **RUNTIME_ASSEMBLY — 2026-06-30**：资源必须通过 `AssetBundleService`/`RenderAssetService` 接入，不得在 Cocos 编辑器中手动拖 SpriteFrame。
- **RUNTIME_ASSEMBLY — 2026-06-30**：当前只完成主战斗渲染链（约 112 张），不得宣称全部 418 个资源已接入画面。
- **RESOURCE_STATUS — 2026-06-30**：资源存在 ≠ assets.json 有映射 ≠ 画面已接入，三个状态完全不同。详见 `topics/RESOURCE_STATUS.md`。
