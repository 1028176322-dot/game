# 《回到地面》AI 资源执行流程（Layer 3 · Workflow）

> 编码: UTF-8

> 本文件是 **Layer 3**：AI 执行 3D 资源生产的流水线。配合：
- **Layer 1** `./美术资源制作参数总表_3D.md`（人类可读规范，为什么/原则）
- **Layer 2** `./AI资源制作规范_MachineSpec.yaml` + `.json`（机器可读规格：每个资源的 target/min/max、Sockets 数组、Fail 条件、Input/Output、Pipeline 引用）

> **AI 执行契约**：
1. 读取 Layer 2 中该资源的 `schema`（预算/ sockets / fail / io / pipeline）。
2. 按下方 9 步顺序执行，每步先满足 `Validation` 再进入 `Next`。
3. 最后一步 `validate` 调用 `tools/asset_validate.py`，**任一 FAIL 即回到对应 step 修复重跑**，全绿方可合入。
4. 所有数值来自 `rules3d`（单一事实来源），禁止凭记忆改写预算。

---

## 0. 总体流水线（9 步）

| Step | 阶段 | 关键产出 |
|---|---|---|
| 1 | Mesh 建模 | <Token>.glb (raw mesh, +Y up, origin at feet) |
| 2 | UV 展开 | <Token>.glb (UV0 展开, 共享图集/合理利用率) |
| 3 | Texture 烘焙 | bake maps (albedo / emission / rim) at budget.textureSize |
| 4 | Texture 贴图 | <Token>_albedo.astc (block=6) |
| 5 | Rig 绑定 | <Token>.glb (skeleton, <= budget.maxBones bones) |
| 6 | Animation 动画 | <Token>_<Clip>.anim for each required clip |
| 7 | LOD 减面 | LOD0/LOD1/LOD2 (triPct + dist from budget.lod) |
| 8 | Prefab 组装 | <Token>.prefab (Animator/Collider/LOD Group/Socket/Material/AudioSource/EffectAnchor/Shadow) |
| 9 | Validate 校验 | validation report (Pass/Fail + detail) |

> 人类视角的 13 阶段见 Layer 1 §8；本 9 步是其 AI 可执行精简版（合并了概念/导出等人类协调步骤）。

---

## 1. 每步详细定义（Input / Output / Tool-call / Validation / Fail→Retry / Next）

### Step 1 — Mesh 建模 (`model`)

- **Input**: `concept_2d`、`source_sprites`、`naming_token(<Token>)`
- **Output**: `<Token>.glb (raw mesh, +Y up, origin at feet)`
- **Tool-call**: `blender --background --python tools/export_glb.py -- --name <Token> --src <source_sprites>`
- **Validation**:
  - [ ] pivot == feet, +Y up, facing +Z
  - [ ] naming matches rules3d pattern
  - [ ] mesh manifold / no flipped normals
- **Fail → Retry**: 若 Pivot 偏移 → 在 Blender 重设原点；若命名不符 → 改名重导；重试本步直到 validation 全绿
- **Next**: `uv`

### Step 2 — UV 展开 (`uv`)

- **Input**: `<Token>.glb`
- **Output**: `<Token>.glb (UV0 展开, 共享图集/合理利用率)`
- **Tool-call**: `blender smart-UV-project / manual seam; check texel density == textureSize`
- **Validation**:
  - [ ] no overlapping UV islands
  - [ ] texel density consistent with budget.textureSize
  - [ ] UV in 0..1 (or tiled per atlas)
- **Fail → Retry**: 重叠 → 重新分块/松弛；密度不符 → 调整 scale；重试本步
- **Next**: `texture_bake`

### Step 3 — Texture 烘焙 (`texture_bake`)

- **Input**: `<Token>.glb (high-poly if any)`、`Toon ramp (shared)`
- **Output**: `bake maps (albedo / emission / rim) at budget.textureSize`
- **Tool-call**: `blender bake (diffuse+emission+AO); or Substance; output PNG`
- **Validation**:
  - [ ] resolution <= budget.textureSize
  - [ ] no missing bakes for glowing/crystal parts
- **Fail → Retry**: 分辨率超 → 降尺寸重烘；缺通道 → 补烘；重试本步
- **Next**: `texture`

### Step 4 — Texture 贴图压缩 (`texture`)

- **Input**: `bake maps (PNG)`
- **Output**: `<Token>_albedo.astc (block=6)`
- **Tool-call**: `astcenc -c <in>.png <out>.astc 6`
- **Validation**:
  - [ ] ASTC block == budget.astcBlock
  - [ ] alpha clean (no fringing)
- **Fail → Retry**: 块号不符 → 用正确 block 重压；边缘脏 → 重做 alpha；重试本步
- **Next**: `rig`

### Step 5 — Rig 绑定 (`rig`)

- **Input**: `<Token>.glb`
- **Output**: `<Token>.glb (skeleton, <= budget.maxBones bones)`、`socket empty nodes (budget.sockets)`
- **Tool-call**: `blender auto-rig / manual; add Socket empty nodes per budget.sockets`
- **Validation**:
  - [ ] bones <= budget.maxBones
  - [ ] all budget.sockets nodes present
  - [ ] bone naming convention
- **Fail → Retry**: 骨数超 → 减骨/合并；缺 Socket → 补空节点；重试本步
- **Next**: `animation`

### Step 6 — Animation 动画 (`animation`)

- **Input**: `<Token>.glb (rigged)`、`min clip list (Idle/Move/Attack/Hit/Death)`
- **Output**: `<Token>_<Clip>.anim for each required clip`、`AnimEvent on hit frames`
- **Tool-call**: `blender NLA / Marionette; export clips at 30fps; mark AnimEvent`
- **Validation**:
  - [ ] animClips >= budget.animClipsMin
  - [ ] hit-frame AnimEvent present
  - [ ] 30fps, seamless loop
- **Fail → Retry**: 缺 clip → 补做；帧率错 → 重设 30fps；缺 AnimEvent → 打点；重试本步
- **Next**: `lod`

### Step 7 — LOD 减面 (`lod`)

- **Input**: `<Token>.glb (full)`
- **Output**: `LOD0/LOD1/LOD2 (triPct + dist from budget.lod)`
- **Tool-call**: `blender decimate / Simplygon; emit LOD chain per budget.lod`
- **Validation**:
  - [ ] lodLevels >= len(budget.lod)-1
  - [ ] each LOD tri <= cap*triPct
  - [ ] switch dist matches budget.lod.dist
- **Fail → Retry**: LOD 缺失 → 生成缺失级；面数超 → 提升减面比；重试本步
- **Next**: `prefab`

### Step 8 — Prefab 组装 (`prefab`)

- **Input**: `<Token>.glb`、`LOD chain`、`material (ToonLit+ramp)`、`sockets`、`colliders`
- **Output**: `<Token>.prefab (Animator/Collider/LOD Group/Socket/Material/AudioSource/EffectAnchor/Shadow)`
- **Tool-call**: `cocos import → auto Prefab; or art_pipeline import <Token>.glb`
- **Validation**:
  - [ ] Prefab complete (per Layer2 manifest)
  - [ ] colliders present (budget.collider)
  - [ ] LOD Group wired
  - [ ] Socket nodes mapped
- **Fail → Retry**: 缺组件 → 补挂；Collider 类型错 → 改；重试本步
- **Next**: `validate`

### Step 9 — Validate 校验（门禁） (`validate`)

- **Input**: `<Token>.assetmeta.json`、`assets/resources/config/art_quality_budget.json`
- **Output**: `validation report (Pass/Fail + detail)`、`FAIL → back to the failing step`
- **Tool-call**: `python tools/asset_validate.py <dir>/<Token>.assetmeta.json --budget assets/resources/config/art_quality_budget.json`
- **Validation**:
  - [ ] all Layer2 `fail` assertions pass
  - [ ] asset_validate check_ids all ok
  - [ ] lifecycle == 已批准 before integration
- **Fail → Retry**: 任一 FAIL → 读取 report 明细，回到对应 step 修复后重新 validate，直到全绿方可合入
- **Next**: `DONE (asset approved → integrate)`

---

## 2. 校验门禁（validate 步骤详解）

`tools/asset_validate.py` 读取 `.assetmeta.json` 比对 `rules3d`，逐 check_id 输出 ok/XX：

| check_id | 含义 | 对应 Layer2 字段 |
|---|---|---|
| `naming` | 命名匹配 rules3d.naming.pattern | naming.pattern |
| `budget_rule_found` | 找到对应 rules3d 桶 | template.kind |
| `tri_budget` | triangles ∈ [minTri, maxTri] | budget.minTri/maxTri |
| `bones_budget` | bones <= maxBones | budget.maxBones |
| `texture_size` | textureSize <= 预算 | budget.textureSize |
| `lod_present` | lodLevels >= 要求 | lod |
| `anim_clips_min` | animClips >= animClipsMin | animClipsMin |
| `required_sockets` | 所有 required_sockets 存在 | sockets |
| `collider_present` | colliders 非空 | collider |
| `particles_budget` | maxParticles <= 预算 | budget.maxParticles |
| `drawcall_budget` | maxDrawCall <= 预算 | budget.maxDrawCall |
| `dependencies_present` | depends 全部存在 | manifest.depends |
| `lifecycle_valid` | lifecycle ∈ 4 态 | manifest.lifecycle |
| `perf_tier_valid` | perfTier ∈ low/medium/high | perfTier |
| `test_scene_present` | testScene 非空 | manifest.testScene |
| `meta_version/author/date/reviewer` | 元字段非空 | manifest.meta_* |

> 任一 `XX` → 该资源 FAIL，自动退回对应美术/AI step 修复；全 `ok` → PASS，可合入。

---

## 3. 每资源执行示例（以 `CHR_Warrior_A` 为例）

```text
1. 读 Layer2 assets[] 中 id=CHR_Warrior_A 的 schema
   budget: minTri=2000 recommendTri=2500 maxTri=3000 maxBones=30 textureSize=512 astcBlock=6
   sockets: [RightHand,LeftHand,Head,Chest,Back,Foot,Weapon,SkillOrigin]
   fail: triangles<=3000 / bones<=30 / textureSize<=512 / lodLevels>=2 / animClips>=5 / all(sockets) / colliders>0 / naming
2. model → uv → texture_bake → texture → rig → animation → lod → prefab
3. validate: python tools/asset_validate.py CHR_Warrior_A.assetmeta.json --budget assets/resources/config/art_quality_budget.json
4. 若 tri_budget=XX → 回到 model 减面至 <=3000 → 重跑 validate
5. 全 ok → lifecycle 置 已批准 → 合入
```

> 同样的流程适用于 MON_*/BOSS_*/FX_*/TILE_*，仅 budget/sockets/fail 取值随 `template` 不同（见 Layer 2）。

