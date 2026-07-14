# 美术资源缺口清单（交给另一台电脑的 AI 生成用）

> **编码**: UTF-8
> **生成日期**: 2026-07-13
> **项目**: 《回到地面》Cocos Creator 3.8.8 横屏 Roguelike
> **目标平台**: TapTap（安卓原生游戏）；微信严格模式仅作历史参考
> **用途**: 交给另一台电脑的 AI，按本文件规格生成符合正式上线要求的 3D / 2D 资源
> **权威规则源**: `E:/game/.workbuddy/memory/topics/ART_RESOURCE_RULES.md`（§16 为 3D 唯一权威）

---

## 0. 一句话结论

- **角色现在是 3D 模型**（`.glb` + `.prefab`），**不是** 2D 逐帧 PNG。早期"角色逐帧生成方案：AI 生成 1024²→缩 192×1024→拼 sprite sheet" 是已作废的旧思路。
- 全项目目前**只有 2 个 `.glb`**（archer 本体 + 武器），其余 3D 资源**均未启动**。
- 2D 贴图（icons / ui / backgrounds / bosses / monsters / tiles / effects）多数已生成完，属"保留 2D"类或 2D 兜底。
- **真正的"生成缺口" = 全面的 3D 化**（§16.1 范围：角色 5 + 怪物 36 + Boss 42 + Tile 24 + 特效 27），目前仅 archer 1/5 完成。
- 另有若干**注册表 / 配置 / 文档失配**项（非生成，需本地工程侧修，见 §6）——它们正是 3 个 FAIL 门禁的根因，与"美术没生成"无关。
- ⚠️ **新增 3D 类目（本清单初版遗漏）**：ui3d_preview 的 T4（主菜单背景）/ T5（Splash 背景）已实现"全屏 3D 背景"渲染链路，但**需要 2 个 3D 背景模型**（`mainBackdrop` + `splashBackdrop`，配置在 `assets/resources/config/ui3d.json`，当前 `enabled=false`、空 `modelAssetId`）。资产就绪后仅改配置即可开启，无需再动代码。详见 §4.5。

---

## 1. 当前真实状态（已逐一核实，2026-07-13）

| 类目 | 2D 状态 | 3D 状态 | 生成缺口 |
|---|---|---|---|
| backgrounds | 17 jpg ✓（2D 保留） | 0/2 3D backdrop（ui3d_preview T4/T5，见 §4.5） | 2 个 3D 背景模型（待生成） |
| icons | 67 png ✓（2D 保留） | — | 无 |
| ui | 173（158 png + 15 jpg）✓（2D 保留） | — | 无 |
| effects | 27 png ✓（2D VFX 兜底） | 0/27 3D prefab | 27 个 3D 特效 |
| monsters | 36 png ✓（2D 兜底） | 0/36 3D | 36 个 3D 怪 |
| tiles | 24 png ✓（2D 兜底） | 0/24 3D | 24 个 3D 地块 |
| bosses | 120 png ✓（2D 兜底） | 0/42 3D（12 终 + 30 小） | 42 个 3D Boss |
| **characters** | 0 png（2D 已移除） | **1/5 3D（archer）** | **4 个 3D 角色**（warrior / assassin / mage / berserker） |

> 注：bosses / monsters / tiles 的 2D PNG 已存在，但 §16.1 把它们列入 3D 化范围；3D 版本目前一个都未生成。若保留 2D 兜底，则这些类目"缺口"可视为 0；若要走 3D 正式路径，则见 §4。

---

## 2. 美术风格与硬约束（生成 AI 必须遵守）

### 2.1 风格总纲（§1.1）
明亮卡通动物冒险 + 温暖手绘动画感 + 森林宝石一体化 UI。

正向描述（统一英文，每个 prompt 必带）：
```
bright cheerful cartoon animal adventure, warm hand-painted animation look,
rounded friendly shapes, soft forest light, clean toy-like materials,
saturated natural colors, gentle highlights, clear mobile readability,
cozy family-safe fantasy mood, consistent with the integrated
forest-and-gem interface style used by the current game.
```
- **禁止风格**：pixel art, dark fantasy, chunky pixels, low resolution, hard sci-fi, realistic horror。
- **安全主题词**（多用在场景/道具/特效）：flowers, leaves, mushrooms, crystals, coins, lanterns, books, tents, tools, clouds, stars, paw marks, soft magic sparkles, friendly animal shapes, clean adventure props, warm camp details。

### 2.2 Prompt 安全红线（§1.2 / §7）
- **所有 prompt 必须用纯正向描述**，禁止出现负向/危险词：`no / do not / avoid / without / forbidden / negative`。
- **禁止词**（只允许放在本地 `riskFilter` / `lint-prompts`，**绝不发给 AI 生图 API**）：
  `blood / skull / skeleton / bone / corpse / organ / anatomical / heart / horror / grimdark / gore / wound / injury / death / demon / hell`
- 微信严格模式红线（历史参考）：无血腥 / 无恐怖 / 无尸体 / 无体液 / 无断肢。
- 命名安全替代：可用 **骨兵 / 炎魔 / 暗影 / 翠毒 / 冰晶 / 爆裂**；禁止 **骷髅 / 恶魔 / 死亡 / 亡灵 / 地狱 / 腐烂 / 吸血 / 自爆 / 食尸**。
- 文件名含 `death` → 正向文案改为 `journey_summary` / `magical_sparkle_dissolve`。
- **审核门禁优先级高于体积/性能**——宁可保守，不要踩红线。

### 2.3 Prompt 通用结构（§1.3）
每个 prompt = `[STYLE_CORE] + [QUALITY_CORE] + [SAFE_COPY_CORE] + [SAFE_WORLD_CORE] + [dimensions_clause] + [format_clause] + [specific] + [consistency] + [production_note]`

### 2.4 格式与命名（§3 / §6 / §16.2）
- 2D 保留类继续用小写 `{category}_{subject}_{action}.png`（如 `monster.forest.slime`）。
- **3D 资产强制前缀 + PascalCase**（权威正则，供 `asset_validate.py` 使用）：
  `^(CHR|MON|BOSS|FX|TILE|BG)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?(\.glb|\.prefab)?$`
  > ✅ 正则已扩展为含 `BG`（同步落地 `art_quality_budget.json → rules3d.naming.pattern` 与 `ART_RESOURCE_RULES.md §16.2`，见 §6.E），`asset_validate.py` 现判 `BG_*` 为合法命名。
  - 角色 `CHR_{Hero}_A.glb`（A/B/C = 变体）
  - 怪物 `MON_{Region}_{Name}.glb`
  - Boss `BOSS_{Name}_{NN}.glb`（NN = 序号；终 Boss 名含 `Final`）
  - 特效 `FX_{Name}.prefab`
  - 地块 `TILE_{Region}_{Module}.glb`（Module ∈ Floor / Wall / HighGround / Thorn / Corner / Edge / Slope / Ramp）
  - 背景 `BG_{Scene}.glb`（UI 全屏 3D 背景，ui3d_preview T4/T5；静态环境模型，可无骨骼动画；详见 §4.5）
  - 动画 clip `{前缀}_{Token}_{Clip}`（如 `CHR_Warrior_Attack`）
- **禁止**在图片里烤入文字 / 水印 / 字母（除非显式要求）。

### 2.5 体积与性能（TapTap 正式版，§9 / §16.3）
预算权威源为 `art_quality_budget.json → rules3d`（见 §6 缺口 E）。权威默认如下（工具应读取，不硬编码）：

| 类目 | Tri | 骨 | 贴图 | 压缩 | LOD | 最低 clip |
|---|---|---|---|---|---|---|
| 角色 | 2000~3000 | 20~30 | 512² | ASTC 6×6 | 100·60·30% | 5 |
| 终 Boss | 5000~9000（建议 7000） | 40~80 | 1024² | ASTC 8×8 | 100·50·20% | 8 |
| 小 Boss | 4000~7000 | 30~60 | 512² | — | 100·50% | — |
| 普通怪 | 1000~2500 | 18~30 | 512² | — | 100·60·30% | 5 |
| 普通特效 | ≤80 粒子 / ≤2 DrawCall / 256² / ≤1.5s | | | | | |
| Boss 特效 | ≤300 粒子 / ≤4 DrawCall / 512² / ≤2s | | | | | |
| Tile | 2m×2m 模块 / 512² / LOD 100·50% | | | | | |
| 背景(3D) | ≤6000 Tri / 可 0 骨（静态）/ 1024²~2048² / ASTC 8×8 / LOD 100·50% / 可选 idle clip（环境微动） | | | | | |

---

## 3. 3D 角色生成缺口（当前最高优先级 —— 用户焦点）

**参考样本（已生成，必须对齐）**：
- `assets/resources/models/characters/CHR_Archer_A.glb` + `CHR_Archer_A_Weapon.glb`
- 同目录 `.prefab` 与 `.meta`（注：按 §16.4 应归到 `assets/resources/prefabs/`，当前与 glb 同目录，待本地归位）
- archer 的动画 clip 集可作其余职业的 clip 命名与数量参照

**5 职业动物设定（来自项目设定）**：

| 职业 | 动物 | 武器件（参考 archer 的 `_Weapon` 做法） |
|---|---|---|
| Archer | 鹿（deer） | 弓 + 箭袋（已生成 `CHR_Archer_A_Weapon`） |
| Warrior | 狮（lion）**或** 熊（bear） | 剑 / 盾（待定，需与策划确认） |
| Mage | 兔（rabbit）**或** 羊（sheep） | 法杖 |
| Assassin | 猫（cat） | 双匕首 |
| Berserker | 熊（bear） | 巨斧 |

**每个待生成角色必须交付 5 件**：
1. `CHR_{Hero}_A.glb` —— 本体模型
   - 2000~3000 Tri / 20~30 骨 / 512² 贴图 / ASTC 6×6 / LOD 100·60·30%
   - 最低 5 个动画 clip（idle / attack / death / skill / phasechange；与 archer 对齐）
   - 风格：明亮卡通动物，圆润友好，与 archer 同一视觉体系
2. `CHR_{Hero}_A_Weapon.glb`（或合并进本体，依 archer 做法）—— 武器件，带 socket 绑定点
3. `CHR_{Hero}_A.prefab` —— Cocos 实体 Prefab（§16.4：放 `assets/resources/prefabs/`，当前 archer 与 glb 同目录，需按 §16.4 归位）
4. `.assetmeta.json` 旁注 manifest（§16.5）：含 `tri / bones / textureSize / lodLevels / animClips / sockets[] / colliders[] / version / author / date / reviewer / depends[] / perfTier / testScene / lifecycle`
5. ASTC 贴图放 `assets/resources/textures/astc/`（与 2D 贴图分离）

**清单（4 个待生成）**：
- [ ] `CHR_Warrior_A.glb`（+Weapon + prefab + manifest）—— 狮 / 熊，剑盾
- [ ] `CHR_Assassin_A.glb`（+Weapon + prefab + manifest）—— 猫，双匕
- [ ] `CHR_Mage_A.glb`（+Weapon + prefab + manifest）—— 兔 / 羊，法杖
- [ ] `CHR_Berserker_A.glb`（+Weapon + prefab + manifest）—— 熊，巨斧

> ⚠️ **决策点（生成前必须定稿）**：Warrior / Mage 的动物是二选一（"狮或熊" / "兔或羊"）。未定稿前不要生成，否则风格会摇摆、返工。

---

## 4. 其余 3D 类目缺口（范围来自 §16.1，按需要手范围决定生成量）

- [ ] **怪物 3D**：0/36（`MON_{Region}_{Name}.glb`，Region ∈ forest / catacombs / volcano / tundra / swamp / abyss；普通怪预算）
- [ ] **Boss 3D**：0/42（12 终 Boss `BOSS_{Name}_{NN}.glb` 含 Final + 30 小 Boss；终 / 小预算不同）
- [ ] **Tile 3D**：0/24（`TILE_{Region}_{Module}.glb`，Module ∈ Floor / Wall / HighGround / Thorn / Corner / Edge / Slope / Ramp）
- [ ] **特效 3D VFX**：0/27（`FX_{Name}.prefab`，普通 / Boss 特效预算）

> 这些是"正式 3D 上线路径"的完整缺口。若本次只补角色，则只做 §3；其余留待后续卡。

### 4.5 UI 3D 背景（ui3d_preview T4/T5，本清单初版遗漏）

**来源**：ui3d_preview 方案 T4（主菜单 3D 背景）+ T5（Splash 3D 背景）已实现渲染链路，但需 3D 背景模型资产才能开启。配置见 `assets/resources/config/ui3d.json`（`mainBackdrop` / `splashBackdrop`，默认 `enabled=false`、空 `modelAssetId`；资产就绪后仅改此处 + 填 `modelAssetId` 即可，无需再动代码）。

**渲染方式**：走与角色预览相同的 `CharacterModelAssembler.mount` 离屏 RT 链路（`SceneModelPreview.showBackdropInSlot`），`forceUnlit=true`。即：背景是一个静态 3D 模型（环境切片 / 立体场景），渲染进 RenderTexture 后贴回全屏 UI Sprite。

**清单（2 个待生成，可按章节扩展）**：
- [ ] `BG_MainMenu.glb`（+ ASTC 贴图 + `.assetmeta.json` manifest + 可选 `BG_MainMenu.prefab`）—— 主菜单全屏 3D 背景，挂在 `Canvas/MainMenuBackdrop3D`（由 `MainSceneController._ensurePersistentMainBackground` 创建，置于 MainBackground 之上、MainUI 之下）。
- [ ] `BG_Splash.glb`（+ ASTC 贴图 + manifest）—— Splash 全屏 3D 背景，复用现有 `splashImage` 节点作 slot（方案 B，不新建节点）。

**规格要点**：
- 命名前缀 `BG_`（本清单 §2.4 新增；§16.2 正则与 `art_quality_budget.json → rules3d.naming.pattern` 已同步扩展含 `BG`——见 §6.E，已落成）。
- 静态环境模型：可无骨骼；如含环境微动（飘叶 / 流光），提供一个 `idle` clip（mount 默认播 `idle`）。
- **必须 unlit 友好**：预览 RT 以 `forceUnlit=true` 渲染，材质需在无场景光下仍明亮可读（与 §2.1 风格总纲一致）。
- 预算（已落成，见 `rules3d.backdrop`）：≤6000 Tri（建议 4000）/ 1024²~2048² 贴图 / ASTC 8×8 / LOD 100·50%；全屏占比高，建议 2048² 母版；manifest `colliders` 置 `["none"]`。
- 2D 兜底保留：`fallback2dKey` 仍指向现有 `ui.main.bg` / `ui.splash.bg`（背景 jpg 之一），`enabled=false` 时回退，不影响上线。

> ✅ **原 §16.1 规则冲突已解决（2026-07-13）**：`ART_RESOURCE_RULES.md §16.1` 已补"可选 3D 背景叠加（ui3d_preview T4/T5）"条目，明确 3D 背景是 2D 背景之上的可选增强层、`enabled=false` 时回退 2D 兜底；§16.2 已补 `BG_` / `DNG_` 命名行且正则扩展为 `^(CHR|MON|BOSS|FX|TILE|DNG|BG)...`；§16.3 已补背景(3D)/地牢(3D) 预算行。生成 AI 现可按 §16 正确生成 `BG_*` 背景资产。

---

## 5. 已生成但需本地工程侧处理（非生成 AI 职责）

> 以下不交给生成 AI，由本地工程按 §6 处理；列出供交接透明。

- **32 个 unreferenced 资产**（`check_game_assets_registry.py` warning）：`CHR_Archer_A`、`CHR_Archer_A_Weapon` + 30 个 `textures/bosses/miniboss/{region}/miniboss_X_idle` PNG。
  → archer 两个需运行时绑定（skin service / prefab）；30 个 miniboss PNG 需确认是 2D 兜底遗留还是待接。
- **154 个未使用 ui_assets key**（`character.avatar.*` / `character.card.*` 等旧 2D UI 引用）→ 清理。
- **5 个 `character.preview.*` ui_assets key** 指向不存在的 2D PNG 路径（`textures/characters/X/X_idle`）→ 改指 3D 模型或删除。
- **2 个"注册但文件缺失"误报** = `CHR_Archer_A` / `CHR_Archer_A_Weapon`，根因是 `assets.json` 路径未带 `.glb` 扩展名 → 修注册表路径。
- **312 个 safeReview=false**（monsters / tiles 待 WeChat 内容复核）→ 现有资产待审，非缺失。

---

## 6. 本地工程侧必须修的注册 / 配置 / 文档失配（门禁 FAIL 根因）

当前 3 个 FAIL 门禁（资源注册 / 非 UI 资源注册 / 文档一致性）全部源于以下，**与"美术没生成"无关**：

> 📋 已建任务卡跟踪：`docs/ai-tasks/D_gate_baseline_and_character3d.md`（D-1 本机注册/配置/文档修复清 3 门禁 FAIL；D-2 外机 4 角色 3D 生产交接；D-3 回机导入绑定）。3D 资源在另一台电脑生产。


- **A. `assets.json`**：`character.preview.*` 5 项指旧 2D 路径；`CHR_*` 2 项缺 `.glb` 扩展名；154 个 unused ui_assets key。
- **B. `prompts.json`**（根 `E:/game/assets/resources/config/prompts.json`）：缺 `character_parts` prompt 锚点类别（文档一致性 FAIL）。
  但 §683 已声明 `character_parts` 旧式被"单母版切割 / 3D"取代；`character_parts.json` 配置表存在（5 职业）。
  → **决策点**：若 2D 角色兜底仍走母版切割，则补 `character_parts` 锚点；若纯 3D，则把该 doc-consistency 检查项豁免。需用户拍板。
- **C. 角色 3D 模型已生成（archer）但运行时未引用** → 需在 skin service / prefab 绑定，使其不再是 unreferenced。
- **D. prefab 目录失配**：archer 的 `.prefab` 与 `.glb` 同目录，未按 §16.4 归到 `assets/resources/prefabs/`。
- **E. `art_quality_budget.json`（`rules3d` 段）—— ✅ 已落成（2026-07-13）**：文件原缺失致 `asset_validate.py` 空跑；现已在**两层**补齐（跨项目层 `E:/game/assets/resources/config/` + 项目层 `E:/game/回到地面/assets/resources/config/`，validator 实际读取项目层）。含全部桶 `characters / bosses_final / bosses_mini / monsters / effects_normal / effects_boss / tiles / dungeon / backdrop` 的 tri/bones/texRes/astc/lod/clips 规则 + `naming.pattern` 正则（已含 `CHR|MON|BOSS|FX|TILE|DNG|BG`）。`rules3d.backdrop` 为本次新增（T4/T5 的 3D 背景预算：≤6000 Tri / 2048² / ASTC 8×8 / LOD 100·50% / 可选 idle / `colliders:["none"]`）。`asset_validate.py` 的 `PREFIX_BUCKET` 已加 `"BG":"backdrop"` 使新桶可解析。
- **F. `ui3d.json` 启用前置**：T4/T5 代码已就位，但 `mainBackdrop` / `splashBackdrop` 默认 `enabled=false` 且 `modelAssetId` 为空。启用前需先生成 §4.5 的 `BG_MainMenu.glb` / `BG_Splash.glb`，并在配置填 `modelAssetId` + `enabled=true`；此非门禁 FAIL，属"功能待资产"状态，与现有 3 个 FAIL 无关。

---

## 7. 验证门禁（生成 + 入库后必须全过）

```bash
cd E:/game/回到地面
python tools/encoding_audit.py --ci            # 必须 issues=0 p0=0
python tools/check_assets_registry.py          # 资源注册
python tools/check_game_assets_registry.py     # 非 UI 资源注册
python tools/check_doc_consistency.py         # 文档一致性
python tools/asset_validate.py --scan <dir>  # 3D 预算/命名/manifest 校验（依赖 §6.E 的 budget 文件）
npm.cmd run validate:all                      # 9 门禁总验
```

通过标准：
- 编码 0/0/0；
- 3D 资产 tri / bones / tex / LOD 符合 §16.3；
- 命名符合 §16.2 正则；
- `assets.json` 无 missing / unreferenced / 未用 key；
- 文档一致性 0 issue。

---

## 8. 交接给另一台电脑 AI 的最小自包含包

建议把以下文件一并复制过去，保证生成 AI 有完整上下文：

- 本文件（缺口清单）
- `E:/game/.workbuddy/memory/topics/ART_RESOURCE_RULES.md`（美术规则全集，§16 为 3D 权威）
- `E:/game/回到地面/assets/resources/config/character_parts.json` + `character_rigs.json` + `character_part_animations.json`（5 职业部件 / 绑定 / 动画配置）
- 参考样本：`assets/resources/models/characters/CHR_Archer_A.glb` + `.prefab`（风格 / 命名 / 结构对齐基准）
- `E:/game/assets/resources/config/prompts.json`（现有 prompt 库，保持风格一致）
- `E:/game/回到地面/assets/resources/config/ui3d.json`（UI 3D 背景配置契约：`mainBackdrop`/`splashBackdrop` 的 `modelAssetId` 字段名 + `enabled` 开关 + `fallback2dKey`；生成 AI 据此命名 `BG_*` 资产并回填 `modelAssetId`）
- 工具（可选，供对方自检）：`tools/asset_validate.py`、`tools/gen_3d_manifest.py`、`tools/gen_assetmeta_from_manifest.py`
- `art_quality_budget.json` **已落成**（项目层 `E:/game/回到地面/assets/resources/config/`，含 `rules3d.backdrop` + `BG` 命名）：生成 AI 导出 `BG_*` 后可用 `asset_validate.py --budget assets/resources/config/art_quality_budget.json` 校验。

---

> **附录：关于 MEMORY.md 旧描述的说明**
> 对话中出现的"角色逐帧生成方案：AI 生成 1024²→缩 192×1024→拼 sprite sheet" 为**服务器托管的长期用户画像**里的旧描述（每次会话从服务器注入并覆盖，本地只读）。项目级 `E:/game/.workbuddy/memory/MEMORY.md` 与用户级 `C:/Users/Administrator/.workbuddy/MEMORY.md` 均已是 3D 正确版本，不含该旧行。该旧描述无法从本地编辑消除（会被下次会话覆盖），需由服务器侧画像更新；本地两份 MEMORY.md 无需改动。
