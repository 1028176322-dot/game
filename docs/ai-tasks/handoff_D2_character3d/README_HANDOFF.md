# D-2 交接包 — 4 角色 3D 模型生产（外机执行）

> 版本: v1.0 (2026-07-14) | 来源: 《回到地面》本机 | 目标机: 有 GPU 的 3D 资源生产机
> 上游: `docs/ai-tasks/D_gate_baseline_and_character3d.md` D-2 节 + `ART_RESOURCE_RULES.md §16` + `art_quality_budget.json → rules3d.characters`

---

## 0. 一句话目标

照本包内的 **archer 样板**（`reference/CHR_Archer_A.glb`），产出其余 **4 个英雄**的 3D 模型 + 独立武器 + Cocos 预制体 + manifest，规格全部对齐 `rules3d.characters` 桶，回传本机走 D-3 审批入库。

**不做**: 不重做 archer（已完成）；不生成 monsters/bosses/effects/tiles（不在本次范围）。

---

## 1. 铁律（外机 AI 必须遵守，违反则回传作废）

1. **不得写入本机 runtime**：所有产物只放外机工作目录，回传后由本机 D-3 审批入库。外机严禁改动本机 `assets/`、`assets.json`、任何业务配置。
2. **approved 前不入库**：生命周期 `选秀 -> 评审中 -> 已批准 -> 已弃用`，仅"已批准"可接入（§16.6）。回传时 manifest `lifecycle` 填 `review`（评审中）。
3. **不重做 archer**：批量前先做 gap reconciliation，确认只产出 warrior / mage / assassin / berserker 四个，跳过 archer。
4. **规格硬门禁**：tri / bones / textureSize / astcBlock / lod / animClips 必须落在 `rules3d.characters` 区间（见 §4）。超标即返工。
5. **命名硬门禁**：必须匹配正则 `^(CHR|MON|BOSS|FX|TILE|DNG|BG)_[A-Za-z0-9]+(_[A-Za-z0-9]+)?([.]glb|[.]prefab)?$`。
6. **合规安全**：Q 版卡通动物，TapTap/微信小游戏可过审。禁止骷髅头 / 骨骼外露 / 血液 / 心脏 / 内脏 / 暴力恐怖元素。
7. **动画命名对齐 archer**：11 个 clip 名逐字一致（见 §5），否则本机运行时绑定（复用 archer 模板）会找不到 clip。

---

## 2. 4 角色定义（决策已定稿）

| 职业 | 动物 | 武器 | 形象基调 | 2D 形象参考 | 状态 |
|---|---|---|---|---|---|
| archer | 鹿 (cute deer ranger) | 弓 | 敏捷、绿色系游侠 | `reference/avatar_archer.png` + 样板 glb | 已完成(样板) |
| **warrior** | **熊** | 剑 + 盾 | 披甲、稳重、防御向 | `reference/avatar_warrior.png` | 待产出 |
| **mage** | **兔** | 法杖 | 长袍、灵动、法系 | `reference/avatar_mage.png` | 待产出 |
| **assassin** | **猫** | 双匕首 | 轻装、敏捷、暗色系 | `reference/avatar_assassin.png` | 待产出 |
| **berserker** | **熊** | 巨斧 | 狂暴、裸上身、粗犷 | `reference/avatar_berserker.png` | 待产出 |

> ⚠ **warrior 与 berserker 同为熊**：必须通过体型 / 装备 / 配色明显区分——
> - warrior 熊 = 披重甲、持剑盾、体态端正、冷色调金属甲；
> - berserker 熊 = 裸上身或破布、持巨斧、体型更壮、暖色/血性配色（不出现真实血液，用红棕布条/图腾代替）。
> 若你（用户）想改 warrior=狮 或 mage=羊，在开工前告知本机重出此表即可。

**风格权威参考**：以 `reference/avatar_*.png`（512 或 128 级 2D 头像）定基调 + archer glb 的建模语言（圆润、Q 版、大头小身）为准。archer 的部件级风格描述见 `specs/character_part_specs.json`（archer 段，可类推其余 4 角色的部件语言）。

---

## 3. 每个角色的交付物（共 4 组）

每个职业 `{Class}` ∈ {Warrior, Mage, Assassin, Berserker} 需交付：

```
CHR_{Class}_A.glb            # 角色主模型（含骨骼 + 11 动画 clip + 8 挂点空节点）
CHR_{Class}_A_Weapon.glb     # 独立武器模型（无骨骼、无动画，见 §6）
CHR_{Class}_A.prefab         # Cocos 导入后生成的角色预制体（结构照 reference 样板）
CHR_{Class}_A_Weapon.prefab  # 武器预制体
CHR_{Class}_A.assetmeta.json # sidecar manifest（模板见 templates/，字段见 §7）
```

例（warrior）：`CHR_Warrior_A.glb` / `CHR_Warrior_A_Weapon.glb` / `CHR_Warrior_A.prefab` / `CHR_Warrior_A_Weapon.prefab` / `CHR_Warrior_A.assetmeta.json`。

---

## 4. 3D 技术规格（硬门禁，来自 `rules3d.characters`）

| 项 | 要求 | archer 样板实测（参考） |
|---|---|---|
| 三角面 tri | min 2000 / **建议 2500** / max 3000 | 2800 ✅ |
| 骨骼数 bones | 建议 26 / **max 30** | 20 ✅ |
| 顶点数 | 无硬限，随面数 | 3907 |
| 贴图尺寸 textureSize | **512×512**（PBR 基础色 + 法线，共 2 张） | 2 textures ✅ |
| 贴图压缩 | ASTC **6×6** | — |
| 材质数 | 建议 1（角色主体单材质） | 1 ✅ |
| LOD | L0=100%@0m / L1=60%@12m / L2=30%@24m | 导入期由 Cocos 生成 |
| 动画 clip 数 | **≥5**（本项目对齐 11，见 §5） | 11 ✅ |
| 挂点 sockets | 8 个空节点（见 §6） | 含 Weapon 挂点 ✅ |
| 碰撞体 collider | capsule（胶囊） | — |
| 性能档 perfTier | medium | — |
| 单文件建议大小 | 主模型 ≈ 0.8–1.5MB（archer 1.23MB）；武器 ≈ 0.5–0.9MB（archer 0.80MB） | — |

> 数值唯一权威 = `specs/art_quality_budget.json → rules3d.characters`。外机自检脚本从此读取，勿硬编码。

---

## 5. 动画 clip 清单（11 个，命名逐字对齐 archer）

主模型 glb 内需内嵌以下 11 个 skeletal animation clip，**名称必须完全一致**（本机运行时按此名索引）：

```
player_idle        player_run         player_walk
player_walk_back   player_walk_left   player_walk_right
player_attack      player_skill       player_dodge
player_hit         player_die
```

- 每 clip 建议 60 通道（archer 实测），帧率与 archer 对齐。
- `player_idle` 必须存在且为默认循环。
- 若某职业有特色动作（如 berserker 蓄力），保持这 11 个名不变，特色动作放入 `player_skill`。

---

## 6. 挂点 sockets 与武器规范

主模型骨架需暴露 8 个挂点空节点（名称对齐 `rules3d.characters.sockets`）：

```
RightHand  LeftHand  Head  Chest  Back  Foot  Weapon  SkillOrigin
```

- **武器不焊死在主模型上**：主模型只留 `Weapon` 挂点（archer 用 `weaponSocket="Weapon"`）；武器为独立 `CHR_{Class}_A_Weapon.glb`（无骨骼、无动画，1 mesh 1 material），运行时挂到 `Weapon` 节点。
- 双武器职业（assassin 双匕）：可用一个 weapon glb 含左右两把（archer weapon 为单 glb 3 textures 的先例），或主手挂 `Weapon`、副手挂 `LeftHand`——**优先单 weapon glb**，与 archer 结构一致，降低本机绑定改动。
- `SkillOrigin` = 技能特效发射原点；`Back` = 背挂（弓/斧收纳位）。

---

## 7. sidecar manifest（`.assetmeta.json`）字段（§16.5）

每个主模型附带一份，模板见 `templates/CHR_{Class}_A.assetmeta.json`。必填字段：

| 字段 | 说明 |
|---|---|
| `tri` / `bones` / `textureSize` / `lodLevels` / `animClips` | 实测值，供 `asset_validate.py` 比对预算 |
| `sockets[]` / `colliders[]` | 挂点集（§6）/ 碰撞体（`["capsule"]`） |
| `version` / `author` / `date` / `reviewer` | 版本 / 制作者 / 日期 / 评审人（回传时 reviewer 留空） |
| `depends[]` | 依赖 token（武器 / FX / 音频子模型），如 `["CHR_Warrior_A_Weapon"]` |
| `perfTier` | `medium` |
| `testScene` | 自检用验证场景名 |
| `lifecycle` | 回传时填 `review` |

---

## 8. 外机产出目录建议

```
<外机工作区>/models_review/characters/
  CHR_Warrior_A.glb / _Weapon.glb / .prefab / .assetmeta.json
  CHR_Mage_A.glb ...
  CHR_Assassin_A.glb ...
  CHR_Berserker_A.glb ...
  _validate_report.txt     # asset_validate 自检输出
```

> 对应本机 §16.4：3D 母版/候选/报告放 `art_source/models_review/`；本机 D-3 才把 approved 的 glb 放入 `assets/resources/models/` 并导出 prefab 到 `assets/resources/prefabs/`。

---

## 9. 外机自检（回传前必须跑通）

用项目自检脚本（若外机克隆了本仓库）：

```bash
python tools/asset_validate.py --budget specs/art_quality_budget.json \
  --models <外机>/models_review/characters
```

自检须全绿：
- [ ] 命名匹配正则（§1.5）
- [ ] tri / bones / textureSize / lod / animClips 落在 `rules3d.characters` 区间（§4）
- [ ] 11 个 animClip 名齐全且逐字一致（§5）
- [ ] 8 个 socket 空节点齐全（§6）
- [ ] manifest 字段完整（§7）
- [ ] 无违规元素（骷髅/血/内脏，§1.6）

---

## 10. 回传交付物清单（交回本机）

```
4 × CHR_{Class}_A.glb
4 × CHR_{Class}_A_Weapon.glb
4 × CHR_{Class}_A.prefab (+ _Weapon.prefab)
4 × CHR_{Class}_A.assetmeta.json
1 × _validate_report.txt（自检全绿证明）
```

本机收到后走 **D-3**：审批入库 -> 登记 `assets.json` -> `character_visuals.json` 4 职业从 `mode:"sheet"` 切 `mode:"parts"`（照 archer 段结构填 modelAssetId/weaponAssetId/weaponSocket）-> 运行时绑定复用 archer 模板 -> `validate:all` 复验。

---

## 11. 本包清单

| 路径 | 用途 |
|---|---|
| `reference/CHR_Archer_A.glb` `.prefab` | 角色样板（风格/结构/命名基准） |
| `reference/CHR_Archer_A_Weapon.glb` `.prefab` | 武器样板 |
| `reference/avatar_*.png` (×5) | 5 职业 2D 形象参考 |
| `specs/art_quality_budget.json` | `rules3d.characters` 预算 + 命名正则（自检读取） |
| `specs/character_visuals.json` | 形象模式登记（archer=parts，其余=sheet 待切） |
| `specs/character_rigs.json` | 骨骼/绑定配置 |
| `specs/character_part_animations.json` | 部件动画配置 |
| `specs/character_part_specs.json` | archer 部件级风格描述（可类推其余 4 角色） |
| `specs/character_parts.json` | 部件清单 |
| `templates/CHR_*.assetmeta.json` (×4) | sidecar manifest 模板 |

---

## 12. 决策记录

| # | 决策 | 结论 | 状态 |
|---|---|---|---|
| D-2.4 | Warrior 动物 | 熊 | 已定（可改狮，开工前告知本机） |
| D-2.5 | Mage 动物 | 兔 | 已定（可改羊，开工前告知本机） |
| D-2.a | Assassin / Berserker | 猫 / 熊 | 任务卡指定 |
| D-2.b | warrior/berserker 同为熊 | 需体型+装备+配色区分（§2 注） | 提示外机 |
| D-2.c | 武器结构 | 独立 weapon glb + Weapon 挂点 | 对齐 archer |
