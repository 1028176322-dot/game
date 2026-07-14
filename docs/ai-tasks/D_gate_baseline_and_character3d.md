# D — 门禁基线清零 + 角色 3D 补齐（三轨任务卡）

> **编码**: UTF-8 (no BOM)
> 阶段: 2D->3D 主线收尾 / 遗留项 D ｜ 优先级: **P1（唯一实质技术欠账）**
> 状态: **D-1 已完成（2026-07-13, validate:all 9/9, 见 REPORT_D-1.md）**；D-2 依赖外机；D-3 依赖 D-2 交付
> 依赖协议: 本卡受 `AI_EXECUTION_PROTOCOL.md` 约束，执行前必须遵守其 §2 铁律、§5 三层审批、§6/§7 门禁。

---

## 0. 背景与根因（必读，勿混淆两类问题）

`validate:all` 长期 6/9，3 个门禁 FAIL（资源注册 / 非 UI 资源注册 / 文档一致性）。
**关键区分**（来源 `ART_ASSET_GAP_CHECKLIST.md` §6，已核实）：

| 类别 | 是什么 | 根因 | 谁来做 |
|---|---|---|---|
| 门禁 FAIL 根因 | assets.json / prompts.json / prefab 目录失配 | **注册表/配置/文档失配，与"美术没生成"无关** | 本机（D-1、D-3 局部） |
| 美术完整度缺口 | 4/5 角色 3D 模型未生成（warrior/assassin/mage/berserker，仅 archer 到位） | 资产尚未生产 | **另一台电脑**（D-2） |

> 结论：**3 个门禁 FAIL 不需要等 4 个模型就能清零**（D-1 即可）。4 个模型是让游戏拥有完整可玩角色视觉的独立缺口，在**外机**生产（D-2），产出后回机导入绑定（D-3）。

**同步约束（用户 2026-07-14）**：所有 3D 资源制作在另一台电脑。本机 AI 不生成 GLB；本机只做注册/配置/文档修复 + 交接契约产出 + 回收后的导入绑定。此约束叠加协议 §7.3「AI 不得将 GLB 直接入 runtime、approved 前不入库」。

---

## D-1 — 本机注册 / 配置 / 文档修复（清 3 门禁 FAIL）✅ 已完成

> 本机可立即执行，不依赖外机资产。目标：`validate:all` 从 6/9 -> 9/9（或明确豁免项）。
>
> **执行结果（2026-07-13）**：validate:all 6/9 -> **9/9**。详见 `REPORT_D-1.md`。
> 执行前读码核实推翻任务卡 3 处原始假设（.glb 扩展名/补锚点/重指不改 type 均有误），按实际根因修正：
> 1. archer 模型报错 = `check_assets_registry.py` 只扫 textures/ 的**盲区误报** -> **修校验器**（v2.1.0），非改 assets.json。
> 2. `character_parts` = §15 **死键** -> 移除（决策点 2 豁免分支），非补 prompts.json 锚点。
> 3. 35 个 `character.*` 键 = 重指 avatar **+ type→sprite + 删帧元数据**（`_check_type_vs_file` 要求）。
> 决策点落地：**[1] character.preview.* 改指 avatar**（非 3D、非删）；**[2] 豁免 doc-consistency（移 §15 死键+记录理由）**；**[3] 30 miniboss PNG 保留（未拍板，登记遗留）**。
> 追加修复：`art_quality_budget.json` 缺 metadata（Task #142 遗漏的第 5 个独立 error）已补。

### Input
- `ART_ASSET_GAP_CHECKLIST.md` §5、§6（失配清单，权威）
- `E:/game/回到地面/assets/resources/config/assets.json`（注册表）
- `E:/game/assets/resources/config/prompts.json`（prompt 锚点，文档一致性检查源）
- `E:/game/回到地面/tools/check_assets_registry.py` / `check_game_assets_registry.py` / `check_doc_consistency.py`（门禁脚本，先读懂判定逻辑再改）
- 参考样本：`assets/resources/models/characters/CHR_Archer_A.glb` + `.prefab`

### Output（预期改动，以实际读码为准）
- MOD `assets.json`：
  - 修 `CHR_Archer_A` / `CHR_Archer_A_Weapon` 路径缺 `.glb` 扩展名（2 项"注册但文件缺失"误报）
  - 处理 5 个 `character.preview.*` 指向不存在 2D PNG 路径 -> 改指 3D 模型或删除（**决策点，见下**）
  - 清理 154 个未使用 `ui_assets` key（`character.avatar.*` / `character.card.*` 等旧 2D 引用）
- MOD `prompts.json` **或** 门禁豁免配置：补 `character_parts` 锚点类别（**决策点，见下**）
- MOD archer `.prefab` 归位：从与 `.glb` 同目录移到 `assets/resources/prefabs/`（§16.4）+ 同步 `assets.json` 路径
- archer 3D 模型运行时绑定（skin service / prefab），消除 unreferenced

### 决策点（执行前必须由用户拍板，否则 STOP）
1. **character.preview.* 5 项**：改指 3D 模型（archer 有、其余 4 个待 D-2）还是直接删 2D 预览 key？
2. **character_parts 锚点**：2D 角色兜底是否仍走"单母版切割"？
   - 若是 -> 在 `prompts.json` 补 `character_parts` 锚点
   - 若纯 3D -> 把 doc-consistency 该检查项豁免（需改检查配置，记录理由）
3. **30 个 miniboss idle PNG** unreferenced：是 2D 兜底遗留（清理）还是待接（保留并接线）？

### Strict Constraints
- 只改注册/配置/文档与 archer 绑定；**不新增接口、不改服务签名**
- 不得为"让门禁过"而删断言、改期望值、`--skip` 门禁（协议 §9.2）
- prefab 归位后必须同步更新所有引用路径（配置一致性红线）

### Allowed Scope
- `assets/resources/config/assets.json`、`prompts.json`（或 doc-consistency 检查配置）
- archer 的 `.prefab` 移动 + 其运行时绑定所在的 skin/prefab 绑定点
- `ART_ASSET_GAP_CHECKLIST.md`（回写 §6 状态）

### Forbidden Scope
- `assets/scripts/render/**`（T1A/T1B 已定签名，禁改）
- `assets/scripts/battle/**`、`config/**` 服务层
- 任何 3D 模型 GLB 的生成 / 导入（属 D-2/D-3）

### DoD
- [x] `check_assets_registry.py`：errors=0，`registered_but_missing_file: []`（archer 误报清除；unused key 154 项为 warning 不计 error，登记遗留）
- [x] `check_game_assets_registry.py`：errors=0（35 键 type mismatch 清除）
- [x] `check_doc_consistency.py`：0 issue（已豁免 character_parts，§15 死键移除并记录理由）
- [x] `encoding_audit.py --ci`：issues=0 p0=0
- [x] `npm.cmd run validate:all`：**9/9**
- [x] `REPORT_D-1.md` 已写

---

## D-2 — 外机 4 角色 3D 模型生产（交接契约）

> **本机不执行生成**。本机产出"最小自包含交接包 + 生成规格"，交给另一台电脑的 AI 执行；本机仅在回收阶段（D-3）介入。

### Input（本机负责整理并交付给外机）
- `ART_ASSET_GAP_CHECKLIST.md`（缺口清单，权威）
- `E:/game/.workbuddy/memory/topics/ART_RESOURCE_RULES.md` §16（3D 生成权威规则：范围/命名/预算/安全）
- `character_parts.json` + `character_rigs.json` + `character_part_animations.json`（5 职业部件/绑定/动画配置）
- 参考样本 `CHR_Archer_A.glb` + `.prefab`（风格/命名/结构对齐基准）
- `prompts.json`（现有 prompt 库，保持风格一致）
- `art_quality_budget.json`（项目层，已含 `rules3d.characters` 桶 + 命名正则；供外机 `asset_validate.py` 自检）

### Output（外机产出，回机验收）
- `CHR_Warrior_A.glb` + `_Weapon.glb` + `.prefab` + manifest —— 狮/熊，剑盾
- `CHR_Assassin_A.glb` + `_Weapon.glb` + `.prefab` + manifest —— 猫，双匕
- `CHR_Mage_A.glb` + `_Weapon.glb` + `.prefab` + manifest —— 兔/羊，法杖
- `CHR_Berserker_A.glb` + `_Weapon.glb` + `.prefab` + manifest —— 熊，巨斧

### 决策点（生成前必须定稿，否则风格摇摆返工）
- **Warrior 动物**：**熊**（已定稿 2026-07-14）
- **Mage 动物**：**兔**（已定稿 2026-07-14）
- Assassin=猫 / Berserker=熊（任务卡指定）
- ⚠ warrior 与 berserker 同为熊，交接包已要求体型/装备/配色区分（见交接包 §2 注）
- 若需改 warrior=狮 / mage=羊，开工前告知本机重出交接包 §2 表

### Strict Constraints（写入交接包，约束外机 AI）
- 命名严格符合 `^(CHR|MON|BOSS|FX|TILE|DNG|BG)_...` 正则（§16.2）
- tri/bones/texRes/astc/lod/clips 符合 `rules3d.characters` 桶（§16.3）
- 安全规则：无骷髅/骨骼/血液/器官/暴力惊悚元素（§7.4）
- Hunyuan3D（或所用工具）输出仅视为 **prototype**，非生产就绪（协议 §7.3）
- 批量生成前做 gap reconciliation，**不得重生成已完成的 archer**

### Allowed Scope（外机）
- 仅生成上述 4 组角色资产及其 manifest / prefab；不碰本机工程源码

### Forbidden Scope
- 外机不得直接写入本机 runtime；产物经 D-3 审批后方可入库

### DoD
- [x] 本机已产出交接包（文件清单 + 生成规格 + 决策已定稿）并交付外机
      -> `docs/ai-tasks/handoff_D2_character3d/`（README_HANDOFF.md + reference/ + specs/ + templates/，2.3MB 自包含，含 archer 样板 glb/prefab + 5 avatar + rules3d 预算 + 4 sidecar 模板）；决策 warrior=熊/mage=兔 已定稿
- [ ] 外机回传 4 组 GLB + Weapon + prefab + manifest
- [ ] 外机自检：`asset_validate.py --budget .../art_quality_budget.json` 命名/预算通过
- [ ] 4 组资产通过内容安全复核（safeReview）

> **交接包已就绪（2026-07-14）**：把 `handoff_D2_character3d/` 整个目录拷到外机即可开工。外机 AI 先读 `README_HANDOFF.md`。

---

## D-3 — 回机导入 + 审批 + 运行时绑定 + 复验

> 依赖 D-2 交付。走协议 §7.3 审批入库流程，不得跳过。

### Input
- D-2 外机回传的 4 组资产 + manifest
- `ART_ASSET_GAP_CHECKLIST.md`（gap reconciliation 基准）
- archer 绑定实现（D-1 已建，作为 4 角色绑定的模板）

### Output
- 4 组资产经审批后入 `assets/resources/models/characters/` + prefab 归 `assets/resources/prefabs/`
- MOD `assets.json`：注册 4 组新资产（路径带 `.glb`）
- 4 角色运行时绑定（skin service / prefab），消除 unreferenced
- MOD `character.preview.*`（若 D-1 决策为"改指 3D"）：补齐 4 角色预览指向
- MOD `ART_ASSET_GAP_CHECKLIST.md`：characters 缺口 1/5 -> 5/5

### Strict Constraints
- **AI 不得将 GLB 直接入 runtime**：先 review/approve，再 import（协议 §7.3）
- approved 前不进 `models/` 或 textures
- 导入前做 gap reconciliation，避免覆盖/重复
- 不改 render/ 服务签名；绑定复用 D-1 的 archer 模板

### Allowed Scope
- `assets/resources/models/characters/`、`assets/resources/prefabs/`
- `assets.json`、`character.preview.*` 相关配置、skin/prefab 绑定点
- `ART_ASSET_GAP_CHECKLIST.md`

### Forbidden Scope
- `assets/scripts/render/**` 签名、`battle/**`、`config/**` 服务层

### DoD
- [ ] 4 组资产 approved 后入库，prefab 归位
- [ ] `check_game_assets_registry.py`：4 角色已引用，无 unreferenced
- [ ] `asset_validate.py`：4 组 tri/bones/tex/lod/命名全过
- [ ] `npm.cmd run validate:all`：9/9
- [ ] characters 缺口清零（5/5），缺口清单回写
- [ ] `REPORT_D-3.md` 已写

---

## 执行顺序与依赖

```
D-1 (本机, 立即可做, 需先定 3 个决策点)
      |
      +--> 清 3 门禁 FAIL, validate:all 目标 9/9
      |
D-2 (外机, 需先定 warrior/mage 动物, 本机产交接包)
      |
      +--> 外机回传 4 组资产
      |
D-3 (本机, 依赖 D-2 交付, 走审批入库)
      |
      +--> characters 5/5, 缺口清零
```

## 立即需用户拍板的决策点汇总

1. ~~**[D-1]** `character.preview.*` 5 项：改指 3D / 直接删？~~ → **已定：改指 avatar 单图占位**（4 角色 3D 到位后 D-3 切回）
2. ~~**[D-1]** `character_parts` 锚点：补 prompts.json / 豁免 doc-consistency？~~ → **已定：豁免（移除 §15 死键，2D 走母版切割）**
3. **[D-1 遗留]** 30 个 miniboss idle PNG unreferenced：清理 / 保留接线？（**仍待拍板**，不阻塞 9/9）
4. **[D-2]** Warrior 动物：狮 / 熊？ → **已定：熊**
5. **[D-2]** Mage 动物：兔 / 羊？ → **已定：兔**

> D-1 可在 1-3 拍板后立即走 Execution Plan 执行；D-2 交接包可在 4-5 拍板后产出；D-3 待外机回传后执行。
