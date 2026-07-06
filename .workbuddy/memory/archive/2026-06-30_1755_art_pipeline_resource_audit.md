# Memory Patch

## Source
- Thread: 美术资源完成度核验与 UI 文本整改收尾
- Date: 2026-06-30 17:55
- Scope: ART_PIPELINE, RUNTIME_ASSEMBLY
- Status: confirmed

## Proposed Updates

### ART_PIPELINE — 美术资源管线状态

- 全局规则：所有提示词已内置"no baked text"约束（all UI copy will be added later in the game engine），但未加显式 `NO-BAKED-TEXT CONTRACT` 头。
- 实际导入 `assets/resources/textures`：**401/418** 张 PNG（17 张 backgrounds 缺失）。
- `art_source/textures_review/master_review.csv`：**35 项需要重做**（安全/结构问题），按类别分布：
  - backgrounds ×5（blood-like/skull 安全）
  - tiles ×8（生成了徽章而非无缝纹理）
  - icons ×2（key/frenzyaxe 安全）
  - archer ×1（magenta 残留）
  - berserker ×7 / warrior ×7 / mage ×7（安全重写需 regenerate）
- `art_source/textures_review/rejected/`：**60 张被拒绝**（未计入正式目录）。
- `art_source/textures_review/approved/`：**0 张正式批准**。
- 接管提醒：另一 AI 对话生成完毕后未完成最终替换审批。

### RUNTIME_ASSEMBLY — UI 文本配置化完成状态

- `TextManager.ts`：已添加 `hasTextKey()`，`T()` 函数正常工作。
- `text.json`：新增 15 个 `ui.*` 键，覆盖 shop/marquee/equipment 等缺少项。
- UI 代码迁移：`tools/scan_hardcoded_ui_text.py` 扫描 **0 处硬编码玩家可见文本**。
- **8 个文件被修改**：MarqueeUI/ShopUI/ShopView/DungeonMapUI/MainUI/EquipmentView/InventoryView + text.json。

## Evidence
- `E:/game/回到地面/art_source/runtime_replace_final_check/runtime_replace_final_summary.json`（旧报告 313/418）
- `E:/game/回到地面/art_source/textures_review/master_review.csv`（35 项待修）
- runtime_replace 当前 401 PNGs vs 正式目录 401 PNGs（匹配）
- `python tools/scan_hardcoded_ui_text.py` → `[PASS] 未发现硬编码玩家可见文本`

## Conflicts
- 无（均为新增状态记录，不与现有 topics/*.md 规则冲突）

## Suggested Target
- `topics/ART_PIPELINE.md` — 补充资源管线状态段
- `topics/RUNTIME_ASSEMBLY.md` — 补充 UI 文本配置化完成状态
