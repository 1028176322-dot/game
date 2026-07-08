# 项目 Skill 参考手册

> 最后更新：2026-07-08
> 本项目的可用 Skill 清单、用途、触发条件和调用方式。
> **在每次开始新对话或接手新任务前，必须先阅读本文件**，确认当前任务是否与某个 Skill 的触发条件匹配。

---

## 概览

| Skill | 必读级别 | 触发条件 |
|---|---|---|
| `art-pipeline` | **MANDATORY** | 任何 `assets/resources/textures/` 操作 / 需要 AI 文生图 |
| `encoding-pipeline-guard` | **MANDATORY** | 任何源文件（TS/Python/JSON/MD）创建/编辑 |
| `ardot-mindmap-game-system-flow` | 按需 | 游戏系统流程图/思维导图 |

> **已合并**：`agnes-image-gen` 已合并入 `art-pipeline`（AI 生图为 art-pipeline 的 Step 2 子流程），不再作为独立 Skill 存在。
> **已废弃**：`ui-resource-pipeline`（项目级）已被 `art-pipeline` 取代，不再使用。

---

## MANDATORY 级别（每次相关操作必须调用）

### 1. art-pipeline

| 字段 | 内容 |
|---|---|
| **Skill 名** | `art-pipeline` |
| **调用方式** | `Skill({ skill: "art-pipeline" })` |
| **触发条件** | **任何**涉及 `assets/resources/textures/` 的操作：生成新图片、替换旧图片、裁切、压缩、导入、修复。**以及**用户要求 AI 文生图（已合并原 `agnes-image-gen` 的能力） |
| **用途** | 强制执行项目的完整美术资源生成与入库流程（12 步管线）：确认规格 → 确定生成方式（程序化 或 AI 生图） → 生成母版到 `art_source/textures_review/master/` → 用户视觉审查 → 导出运行时候选到 `runtime_candidates/` → 技术检测（尺寸/格式/Alpha/体积）→ 备份旧文件到 `backup/`（禁止放 `.bak` 到工程目录）→ 导入到 `assets/resources/textures/` → 更新配置注册表 → `npm.cmd run validate:all` → 用户最终确认 → 标记完结 |
| **内置脚本** | `scripts/generate_panel.py` — 程序化生成 UI 面板/按钮/输入框贴图（无 AI 水印/artifact） |
| **参考文档** | `docs/美术资源生成与入库规范.md` |

### 2. encoding-pipeline-guard

| 字段 | 内容 |
|---|---|
| **Skill 名** | `encoding-pipeline-guard` |
| **调用方式** | `Skill({ skill: "encoding-pipeline-guard" })` |
| **触发条件** | 创建、编辑、或审查 **TypeScript / Python / JSON / Markdown** 源文件时 **必须调用** |
| **用途** | 防止 GBK/ANSI 默认编码写入项目文件导致的中文乱码（mojibake）、U+FFFD 替换字符、注释截断、代码被注释吞掉、Cocos 编译/运行时失败。强制所有文件写入使用 UTF-8 编码 |
| **4 阶段流程** | 1. 文件生成/修改 → 2. 手动 UTF-8 写入 → 3. 编码审计 → 4. 修复 |
| **参考规则** | MEMORY.md 中 `ENCODING_WRITE_POLICY` 和 `ASCII_SOURCE_POLICY` |

---

## 按需调用级别

### 2. ardot-mindmap-game-system-flow

| 字段 | 内容 |
|---|---|
| **Skill 名** | `ardot-mindmap-game-system-flow` |
| **调用方式** | `Skill({ skill: "ardot-mindmap-game-system-flow" })` |
| **触发条件** | 用户要求绘制 XMIND 风格的**游戏系统流程图**、系统关系思维导图、游戏流程总览图 |
| **用途** | 在 Ardot Canvas 上创建游戏启动 → 核心玩法 → 所有子系统的完整系统流程图 |

---

## 调用优先级规则

1. **MANDATORY 级别必须最先调用** — 如果当前任务涉及美术资源操作、AI 文生图或文件修改，必须先加载 `art-pipeline` 和/或 `encoding-pipeline-guard`
2. **多个 Skill 可串联** — `art-pipeline` 的 AI 生成步骤内置了 Agnes API 调用，无需再加载旧版 `agnes-image-gen`；任何文件操作同时受 `encoding-pipeline-guard` 保护
3. **同一任务只加载一次** — 如果在当前对话中已加载某个 Skill，后续同对话的同类型操作无需重复加载

---

## 相关项目文档索引

| 文档 | 关联 Skill | 说明 |
|---|---|---|
| `docs/美术资源生成与入库规范.md` | `art-pipeline` | 美术资源流程总纲 |
| MEMORY.md（主记忆文件） | 全部 | 项目级规则和约束 |
| `topics/ENGINEERING_STANDARDS.md` | `encoding-pipeline-guard` | 工程编码标准 |
| `topics/RESOURCE_STATUS.md` | `art-pipeline` | 资源状态跟踪 |
| `topics/ART_PIPELINE.md` | `art-pipeline` | 美术管线专题文档 |
