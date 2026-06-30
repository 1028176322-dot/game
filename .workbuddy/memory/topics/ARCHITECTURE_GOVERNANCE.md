# 架构治理 Phase 1-9

## 状态
✅ 全部完成（2026-06-29）。

## 强制规则

### 解决方案标准
- 后续遇到架构/资源/配置/构建/审核/数据/性能问题，必须优先分析根因并给系统性改造方案
- 不得把"调阈值、重试 AI、局部补丁"作为第一方案
- 方案需包含：目标、涉及文件、核心代码、配置格式、执行顺序、验收标准、回滚/兼容策略

### 资源替换门禁
- 禁止直接把 `runtime_replace` 全量复制进 `assets/resources/textures`
- 必须经过 `master → runtime_candidates → validated_runtime → staging_textures → Cocos import check → replace`
- 存在 `missing_png`/`dimension_mismatch`/`alpha_opaque`/`visual_safety_rework_required` 时不得执行替换

### 提示词规范
- `assets/resources/config/prompts.json` 为权威文件
- 保持卡通动物风、明亮饱和、微信小游戏合规
- 禁止暗黑风、文字、水印、血液、器官、骷髅、恐怖元素
- 不得使用 `pixel art`/`chunky pixels`/`pixel-perfect` 等像素风描述

## 当前实现

### Phase 1-9 全量完成
| Phase | 核心变更 | 涉及文件 |
|-------|---------|---------|
| 1 | ConfigService 异步加载 | config/ConfigService.ts |
| 2 | Rng/RunRng 消除全项目 Math.random() | core/rng/ |
| 3 | TypedEventBus + GameEvents | core/events/ |
| 4 | DungeonSceneController 拆分为5服务 | run/ |
| 5 | AssetBundleService + assets.json | assets/ |
| 6 | 平台服务统一 Storage/Ad/Analytics/Platform | platform/ |
| 7 | MonsterController entity/ + ai/ 拆分 | battle/entity/ |
| 8 | UI ViewModel 化 | ui/viewmodel/ + ui/view/ |
| 9 | npm run validate:all 门禁 | tools/ |

详细执行方案见 `docs/项目架构根因治理执行方案.md`。

## 禁止事项
- 不得声明"全部美术资源已安全替换"直到资源审计通过

## 最近变更
- 2026-06-29：全部 9 个 Phase 完成。
