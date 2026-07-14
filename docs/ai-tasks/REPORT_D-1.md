# REPORT D-1

- 任务: D-1 — 本机注册 / 配置 / 文档修复（清门禁 FAIL，validate:all 冲 9/9）
- 状态: ✅ 完成
- 编码: UTF-8 (no BOM)
- 完成日期: 2026-07-13
- 策略: **策略 A（重指到 avatar，不删键）** + **决策点 2 选"豁免 doc-consistency（改检查配置并记录理由）"**

---

## 0. 执行前核实：推翻任务卡 3 处原始假设

任务卡 §D-1 的 Output 基于 `ART_ASSET_GAP_CHECKLIST.md` 旧分析，逐文件读码核实后发现 3 处根因判断有误，已按实际根因修正（未按错误假设动手）：

| # | 任务卡原假设 | 实际根因（读码核实） | 实际修法 |
|---|---|---|---|
| 1 | `CHR_Archer_A` 路径缺 `.glb` 扩展名 | Cocos Prefab 注册 path 无扩展名是**规范**；报错是 `check_assets_registry.py` 的 `scan_disk_files` **只扫 textures/ 的 png/jpg**，对 `models/` 下 Prefab 条目盲区误判 | **修校验器**（非改 assets.json） |
| 2 | 补 `prompts.json` 的 `character_parts` 锚点 | pipeline 分类逻辑（`category = key.split("/")[0]`）使该前缀**永不产生**；补锚点会破坏 parts 分类。`character_parts` 是 §15 死键 | **移除 §15 死键**（决策点 2 已批准的豁免分支） |
| 3 | 35 个 `character.*` 键"重指不删即可过" | `_check_type_vs_file` 会因"单图 + type=sprite_sheet"报 type mismatch | 重指 avatar **+ type→sprite + 删帧元数据**（仍属策略 A 重指不删键） |

---

## 1. 四类门禁 FAIL 根因与修法（共 78 个报错点）

| # | 问题 | 报错数 | 根因 | 修法 |
|---|---|---|---|---|
| 1 | `game_assets.json` 35 键 | 70 | assetId 指向已删 2D + type=sprite_sheet | 重指 `avatar_{class}` + type→sprite + 删 frameWidth/frameHeight/frames/layout |
| 2 | `ui_assets.json` 5 preview | 5 | assetId 指向已删 2D `{class}_idle` | 重指 `avatar_{class}` |
| 3 | archer 2 模型 | 2 | 校验器只扫 textures/ 误判 models/ Prefab | 修 `check_assets_registry.py`（非纹理键按 config path 校验） |
| 4 | doc_consistency | 1 | §15 死键 `character_parts`（prompts.json 无此前缀） | 移除 §15 死键 6 处 |

**追加发现（D-1 四类根因之外的第 5 个独立 error）**

| # | 问题 | 归属 | 修法 |
|---|---|---|---|
| 5 | `art_quality_budget.json` 缺 `metadata` 字段（config 校验 error=1） | Task #142（art_quality_budget.json 落成）遗漏，非 D-1 四类根因 | 补标准 `metadata`(version/lastUpdated/description) 块，对齐其余 24 个配置文件 schema |

---

## 2. 交付物（改动文件）

### MOD `assets/resources/config/game_assets.json`（D-1a）
- 35 个 `character.{class}.{action}` 键（5 职业 × 7 动作 attack/death/dodge/hit/idle/skill/walk）
- 每键：`assetId` → `textures/ui/character/avatar_{class}`；`type` sprite_sheet → sprite；删除 `frameWidth`/`frameHeight`/`frames`/`layout`；保留 `category`/`safeReview`

### MOD `assets/resources/config/ui_assets.json`（D-1b）
- 5 个 `character.preview.{warrior|archer|assassin|mage|berserker}`：`assetId` → `textures/ui/character/avatar_{class}`（type/usage 不变）
- **决策点 1 落地**：改指 avatar 单图（非改指 3D、非删除），4 角色 3D 到位前先用头像占位，不阻断预览

### MOD `tools/check_assets_registry.py`（D-1c，v2.0.0 → v2.1.0）
- 新增 `RESOURCES_DIR` 常量
- Check A 拆分：`texture_asset_keys`（走 textures/ 磁盘扫描）vs `nontexture_asset_keys`（如 Prefab/model，按其 config `path` 解析 `{path}.*` 校验存在性）
- `registered_but_missing_file` = `(texture_asset_keys - disk_keys) | nontexture_missing`
- 更新文件头 docstring 说明与 `total_matched` 统计口径
- 结果：`registered_but_missing_file: []`（archer 2 模型误报清除）

### MOD `.workbuddy/memory/topics/ART_RESOURCE_RULES.md` §15（D-1d，_version 1 → 2）
- 移除 `character_parts` 死键 6 处：`detail_anchors` / `transparent_categories` / `matte_categories` / `min_opaque_ratio` / `palette_retry_steps` / `recommended_sizes`
- 新增 `_changelog` 记录理由：2D 角色已改走 §16.2 单母版切割，`character_parts` 不再由 art_pipeline 独立生成，prompts.json 无此前缀会致 doc_consistency Check 2 恒 FAIL；`characters` 类别保留不变
- §16.2 散文（工具名/配置文件名/方案描述）保留，非 config 键

### MOD `assets/resources/config/art_quality_budget.json`（追加修复）
- 顶部补 `metadata`：version `1.0.0` / lastUpdated `2026-07-13` / description

---

## 3. 完成定义 (DoD) 核对

- [x] `check_assets_registry.py`：Issues counted as errors = 0；`registered_but_missing_file: []`（archer 已引用，误报清除）
- [x] `check_game_assets_registry.py`：errors=0（35 键 type mismatch 清除）
- [x] `check_doc_consistency.py`：ALL CHECKS PASSED（0 issue，death key 移除生效）
- [x] `encoding_audit.py --ci`：scanned=650，issues=0，p0=0 p1=0 p2=0
- [x] `npm.cmd run validate:all`：**全部 9 项检查通过 [OK]**（6/9 → 9/9）
- [x] `REPORT_D-1.md` 已写

---

## 4. 严格约束遵守

- 仅改注册/配置/文档 + 门禁校验器盲区修复；**未新增接口、未改服务签名**
- **未**为让门禁过而删断言、改期望值、`--skip`（协议 §9.2）——修的是校验器**真实盲区**（textures-only 扫描）与**真实死键**（character_parts）
- 未触碰 forbidden scope：`render/**`、`battle/**`、`config/**` 服务层未动；未生成/导入任何 GLB
- 策略 A（重指不删键）严格遵守：35 键 + 5 preview 全部保留 key，仅改指向

---

## 5. 设计决策（如实记录）

- **决策点 2 选"豁免 doc-consistency"而非"补 prompts.json 锚点"**：因 pipeline 分类逻辑使 `character_parts` 前缀永不产生，补锚点属于给死路径续命；移除 §15 死键更干净，且与 §16.2 已生效的母版切割方案一致。
- **art_quality_budget.json 的 metadata 修复越出 D-1 原始 4 类根因**：如实标注为第 5 个独立 error（Task #142 遗漏）。因其是让 config 门禁达 9/9 的唯一剩余阻塞、且属强制 schema 字段（24 个同类文件均有），故一并修复，不做设计判断，仅补规范字段。

---

## 6. 遗留缺口（非 error，不阻塞 9/9；待后续处理）

| 项 | 类型 | 现状 | 归属 |
|---|---|---|---|
| 154 个 unused `ui_assets` key（含旧 `character.card.*` 等） | warning | 未清理（不计 error） | 后续清理任务 |
| 30 个 miniboss idle PNG unreferenced | warning | 保留（决策点 3 未拍板） | 待用户定：清理 / 接线 |
| archer `.prefab` 归位（models/ → prefabs/） | 优化 | 未做（与门禁误报无关，误报已由 D-1c 消除） | 可选，非 DoD 必需 |
| warrior=熊 / mage=兔 动物定稿 | 决策 | 已定（熊/兔） | D-2 外机生产依据 |
| 4 角色 3D 模型（warrior/assassin/mage/berserker） | 美术缺口 | 未生产 | D-2 外机 → D-3 回机 |

---

## 7. 风险

- 无 error 级风险。`character.preview.*` 与 35 个 `character.*` 现全部指向 `avatar_{class}` 单图，4 角色 3D 到位后（D-3）需将预览/动作指向切回 3D 模型或部件动画；已在遗留缺口登记，不影响当前 9/9 与可玩性。
