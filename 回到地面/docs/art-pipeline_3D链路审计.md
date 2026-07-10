# art-pipeline 3D 链路审计（prompts.json 消费 + 2D→3D 遗留改造点）

> 审计时间：2026-07-10
> 审计对象：`C:\Users\Administrator\.workbuddy\skills\art-pipeline\SKILL.md`、`E:\game\回到地面\tools\art_pipeline.py`、`E:\game\assets\resources\config\prompts.json`、`prompts_dim.json`、`art_quality_budget.json(rules3d)`、`tools\asset_validate.py`
> 结论：**prompts.json 确认是 2D AI 出图的唯一提示词来源（只读消费，非破坏）；3D 链路存在命名断裂、无批次驱动源、2D 兼容期被阻断、绝对路径、import 未强制校验 5 类遗留问题。**

---

## 一、确认：prompts.json 如何喂给 AI（完整链路）

| 步骤 | 代码位置 | 行为 |
|---|---|---|
| 1. 读取提示词库 | `art_pipeline.py:586 load_prompts()` → `PROMPTS_JSON`（`E:/game/assets/resources/config/prompts.json`，由 `os.path.dirname(PROJECT_ROOT)+"assets/resources/config/prompts.json"` 定位，即父级 `E:/game/assets/`） | 加载扁平 `{filename: prompt}` 字典 |
| 2. 遍历 key | `cmd_generate:1576` 遍历 `prompts.json` 的 key | 逐个资源处理 |
| 3. 分类 + 维度判定 | `classify_resource:426` → `category_dim:179` | 返回 `dim="2d"/"3d"` |
| 4. 3D 拦截 | `cmd_generate:1613 if info["dim"]=="3d": skip` | **3D 资产不调 Agnes，直接跳过** |
| 5. 组装提示词 | `cmd_generate:1686` `ct_prompt = f"{STYLE_ANCHOR} {orig_prompt} {detail} {SAFETY_BLOCK}"` | `orig_prompt = prompts.get(key)`（即 prompts.json 的值） |
| 6. 调 AGNES | `call_agnes_api:591` POST `agnes-image-2.1-flash` | 把 `ct_prompt` 发给 API |

**关键确认**：
- ✅ prompts.json 是 2D 出图的**唯一提示词来源**（`orig_prompt` 直接取自它），且为**只读消费**——P1 改造刻意不改动其字符串值，避免破坏消费方。
- ✅ prompts.json 中的提示词本身**不含** 3D 生产信息；3D（CHR_/MON_/BOSS_/FX_/TILE_）由 Blender 制作，不经 Agnes，3D 源在三层文档(L1/L2/L3) + `.assetmeta.json`。
- ⚠️ `STYLE_ANCHOR` / `DETAIL_ANCHORS` / `SAFETY_BLOCK` 来自 `ART_RESOURCE_RULES.md §15`（运行时解析），不是 prompts.json。

---

## 二、2D→3D 升级遗留改造点（按严重度排序）

### 🔴 GAP 1（CRITICAL）：3D 批次 import/validate 命名断裂，真实 3D 资产无法被驱动

- `cmd_import` 3D 分支（`art_pipeline.py:1883-1910`）用 **prompts.json 的 2D key** 拼目标路径：
  ```python
  base_no_ext = os.path.splitext(key)[0]            # 例: "characters/archer_idle"
  target_glb = MODELS_DIR / base_no_ext + ".glb"    # → models/characters/archer_idle.glb
  ```
- 但真实 3D 资产名是 `CHR_Archer_A.glb`（§16.2 PascalCase + 前缀）。**二者永不匹配** → import 打印「3D 候选文件不存在」并跳过。
- 更根本：`prompts_dim.json` 中 242 个 `"3d"` key 是**旧的 2D sprite 名**（如 `bosses/finalboss/abyss/boss_abyssoverlord_attack.png`），不是 3D 模型名；而 134 个真实 3D 资产（`CHR_*`/`MON_*`/`BOSS_*`/`FX_*`/`TILE_*`）**根本不在 prompts.json 中**。
- 结果：`cmd_import --category bosses` / `cmd_validate --category monsters` 等批次命令对真实 3D 资产**完全失效**（死代码路径）。

### 🔴 GAP 2（CRITICAL）：3D 资产无 batch 驱动源，与三层规范脱节

- `cmd_generate` / `cmd_validate` / `cmd_import` 全部以 **`prompts.json` key 为唯一迭代源** + progress 进度文件（也由 prompts.json 键入）。
- 134 个 3D 资产定义在 `docs/美术资源制作参数总表_3D.md`(L1) + `AI资源制作规范_MachineSpec.yaml/json`(L2)，但 pipeline **完全不读 L1/L2** 来批次遍历。
- 唯一能校验 3D 的是 `tools/asset_validate.py`（单文件 `.assetmeta.json`），但**没有「按 134 清单扫描全部 3D 资产是否齐备/通过」的批次入口**。
- **缺一个 3D 资产注册表**（如 `assets/resources/config/art_3d_manifest.json`，列出 134 个 CHR_*/MON_*... 及各自 bucket/依赖），让 pipeline 能像 prompts.json 驱动 2D 那样驱动 3D 的 generate→validate→import 批次。

### 🟠 GAP 3（HIGH）：当前 2D 游戏这 5 类 sprite 生成被「永久跳过」

- `category_dim` 对 `characters/monsters/bosses/effects/tiles` 整类返回 `"3d"`（prompts_dim.json map + `DIM_3D_CATEGORIES` 兜底）。
- 于是 `cmd_generate` 对这 5 类**全部跳过 Agnes 生成**。
- 但 3D 升级是**分阶段、尚未执行**的计划；当前 2D 游戏仍依赖这 5 类的 2D sprite（历史：monsters 已完成、icons 进行中，characters/bosses/effects/tiles 未必全做完）。
- 后果：**2D 生产链路在 3D 升级「半完成」状态下被阻断**——任一未生成的 2D sprite 已无法补生成。
- 缺一个**模式开关**（2D 兼容模式 vs 3D 模式），或 `prompts_dim.json` 只把「已确认被 3D 取代」的 key 标 3d，而非整类。

### 🟠 GAP 4（HIGH）：`cmd_import` 3D 分支未强制 `asset_validate` 通过

- SKILL.md 违反警告明写「🚫 3D 资产未过 `asset_validate.py` 一律禁止入库」。
- 但 `cmd_import` 3D 分支（`1883-1910`）**只检查 `.glb`/`.prefab` 文件是否存在就复制**，未先调用 `asset_validate.py` 校验命名/预算/Socket/Collider/依赖/lifecycle。
- 即「未过校验即入库」的违规路径实际未被拦截。

### 🟡 GAP 5（MEDIUM）：`ART_RULES_PATH` 硬编码绝对路径，违反「所有路径相对」指令

- `art_pipeline.py:67`：`ART_RULES_PATH = r"E:/game/.workbuddy/memory/topics/ART_RESOURCE_RULES.md"` 硬编码。
- 项目移动即失效；与用户「所有路径都必须用相对路径」指令冲突。
- 应改为基于 `__file__` 计算：`os.path.join(PROJECT_ROOT, "..", ".workbuddy", "memory", "topics", "ART_RESOURCE_RULES.md")`。
- 注：`PROMPTS_JSON` / `PROMPTS_DIM_JSON` / `RULES3D_BUDGET_JSON` 已正确基于 `PROJECT_ROOT` 父级计算，无此问题。

### 🟡 GAP 6（MEDIUM）：SKILL.md 的 3D import 示例与代码现实不符

- SKILL.md 写 `python tools/art_pipeline.py import --category bosses` →「.glb → models/；Prefab → prefabs/」。
- 但代码 3D 分支用 prompts.json key 拼路径（见 GAP 1），对真实 3D 资产名不工作。用户照抄会失败。

### 🟡 GAP 7（MEDIUM）：`prompts.json` 中 242 条 3D 类旧 prompt 处于「悬空」态

- 这些 key 现在被标 3d、跳过生成、导入也失败；既不是可用 2D（被跳过），也不是可用 3D（走 Blender，无对应模型名）。
- 方案全量执行后应退役（前序会话已记），但当前**既不能用也不能生成**。需明确处置：2D 兼容模式可生成（GAP 3 开关）或正式退役（从 prompts.json 移除/标记 retired）。

### 🟢 GAP 8（LOW）：`validate_technical` 内联 3D 校验与 `asset_validate.py` 双份实现

- `_validate_3d_asset`（`art_pipeline.py:1474`）内联镜像了 `tools/asset_validate.py` 的命名/三角面/骨骼/贴图逻辑（审计确认无 import 依赖）。
- rules3d 演进需两处同步，有漂移风险。建议 `cmd_validate` 3D 分支改为调用 `asset_validate.py`，单一来源。

---

## 三、已确认正确的部分（无需改）

- ✅ prompts.json 只读消费，P1 非破坏决策成立。
- ✅ 3D 维度判定：优先 `prompts_dim.json` map，回退 `DIM_3D_CATEGORIES`（单源顺序正确）。
- ✅ `validate_technical` 3D 路由（`dim=="3d"` → `_validate_3d_asset`）正确。
- ✅ `_rules3d_bucket` 桶名映射（`bosses_final`/`bosses_mini`/`effects_normal`/`effects_boss`）与 `art_quality_budget.json → rules3d` 实际键**完全一致**（P2 已修复）。
- ✅ `tools/asset_validate.py` 作为独立 3D 校验器已存在且 `--self-test` 通过。
- ✅ SKILL.md 已声明 2D/3D 双轨、3D 不走 Agnes。

---

## 四、建议改造顺序

| 优先级 | 改造项 | 产出 |
|---|---|---|
| P0 | 新增 3D 资产注册表 `art_3d_manifest.json`（134 项 CHR_*/MON_*/...） | 3D 批次驱动源（解 GAP 1+2） |
| P0 | `cmd_import`/`cmd_validate` 3D 分支改为读 manifest + 强制 `asset_validate` 通过 | 解 GAP 1+4 |
| P1 | 增加 2D/3D 模式开关（env 或 `--mode`），过渡期不阻断 2D sprite 生成 | 解 GAP 3+7 |
| P2 | `ART_RULES_PATH` 改为相对计算 | 解 GAP 5 |
| P2 | SKILL.md 3D import 示例对齐真实命令 | 解 GAP 6 |
| P3 | `cmd_validate` 3D 分支复用 `asset_validate.py` | 解 GAP 8 |
