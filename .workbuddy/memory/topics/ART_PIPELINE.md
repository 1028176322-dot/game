# AI 美术生成管线

## 状态
⚠️ 运行中 — 已生成全量 418 条 prompts，179 张已重做为卡通像素风，待切换为卡通动物风。

## 强制规则

### 生成管线流程
```
AI 生成 → art_source/textures_master/ → 导出到 art_source/textures_export/runtime_replace/
→ 视觉审查（textures_review/）→ 验收通过 → 复制到 assets/resources/textures/
→ Cocos Creator 导入 → 检查 SpriteFrame → 资源链接入（RenderAssetService）
```

### 提示词规则（prompts.json）
- 风格描述必须使用**卡通动物风**（cute animal underground adventurer），禁止像素块风/暗黑风
- 必须包含 `CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING`
- 必须包含 `APPROVAL-SAFE MOBILE GAME ART` 安全锚点
- 不得出现血/杀/死/尸/亡/骷髅/恶魔/地狱等敏感词描述

### 资源规格
| 类型 | 目标帧宽 | Bundle |
|------|:--------:|--------|
| 角色 | 192px | bundle_core_battle |
| Boss | 256px | bundle_boss_{zone} |
| miniboss | 192px | bundle_boss_{zone} |
| 精英怪 | 192px | bundle_zone_{zone} |
| UI | 按用途 | bundle_ui |
| 图标 | 128-256px | bundle_ui |
| 背景 | 1000x666 → JPG | bundle_bg |
| tiles | 32px | bundle_tiles_{zone} |

### 透明处理
- characters/monsters/bosses/icons/ui：使用浅色中性分割背景 + 脚本裁切
- effects：黑底转 alpha（发光特效）
- backgrounds：不透明母版 + JPG 压缩
- tiles：程序化生成

### 替换门禁
- 禁止直接把 `runtime_replace` 全量复制进 `assets/resources/textures`
- 必须依次经过：`master → runtime_candidates → validated_runtime → staging_textures → Cocos import check → replace`
- 存在 `missing_png`/`dimension_mismatch`/`alpha_opaque`/`visual_safety_rework_required` 时不得替换

## 当前实现

### 权威文件
- `assets/resources/config/prompts.json` — 418 条生成提示词
- `art_source/textures_audit_manifest.csv` — 资源审计清单
- `tools/gen_missing_179.py` — 通用资源生成脚本（支持按 category/only 分批）

### 已完成的生成批次
- 全量 418 条 prompts 生成（素材阶段）
- 179 张重做为"明亮卡通像素风"（当前风格）

### 待完成
- prompts.json 中所有怪物/Boss/角色描述从"幻想生物"改为"萌系动物"
- 418 张按动物风格重新生成
- 视觉审查：排除骷髅/暗黑/血腥元素

## 禁止事项
- ❌ 声明"全部美术资源可安全替换" — 需通过完整审计
- ❌ 旧脚本直接写入 `assets/resources/textures` — 必须走 `art_source` 管线
- ❌ 使用 `pixel art`/`chunky pixels` 等像素风描述 — 现在是卡通动物风

## 参考文档
- `tools/config_tool/美术资源目录映射.md`
- `docs/AI美术资源高清替换方案.md`
- `docs/runtime_replace补齐与整体替换方案.md`

## 最近变更
- 2026-06-30：风格从"明亮卡通像素"变更为"卡通动物风"。
