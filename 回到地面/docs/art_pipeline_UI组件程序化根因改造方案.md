# art_pipeline UI 组件程序化根因改造方案

> 日期：2026-07-09
> 适用项目：《回到地面》（Cocos Creator 3.8.8）
> 适用范围：`tools/art_pipeline.py`、`assets/resources/config/prompts.json`

---

## 1. 根因诊断

### 1.1 现状问题链

```
AI 文生图（Agnes agnes-image-2.1-flash）
  ↓ 生成完整方形画布（512/1024/1536）
  ↓ 装饰/边框元素填满画布
  ↓ 后处理裁切/缩放时装饰被截断
  ↓ 产生"四周切割感"
  ↓ prompt 越修越复杂，AI 仍然生成假文字/场景/色块
  ↓ 手动反复修改 5 轮以上仍不可控
  ↓ 体积预算 / alpha 门禁 / 视觉门禁 都拦不住
```

### 1.2 根本原因

| 原因 | 说明 |
|------|------|
| **模型能力边界** | Agnes 对结构化指令（"对外透明/留边/无文字"）遵循度很低 |
| **方形画布冲突** | UI 组件多为非方形（240×80 / 260×96），生成时 AI 填充方形画布 |
| **装饰溢出** | 边框/花叶/宝石装饰天然向边缘延伸，被裁切后断裂 |
| **prompt 无效** | 无论如何措辞，AI 仍将按钮卡片画成"小场景" |

### 1.3 结论

**UI 组件（按钮/卡片/面板/输入框/槽位）不应走 AI 文生图。**  
上述资源应改为程序化生成（Pillow），AI 只负责：
- 整屏背景（场景类）
- 角色/怪物/ Boss （角色类）
- 特效粒子（特效类）
- 图标单个物品（单体图标类 / 含清晰单人主体的 icon）

---

## 2. `generate_panel.py` 现有能力审计

当前 `art_pipeline.py` 的 `generate_procedural()` 会优先寻找：

```text
E:/game/回到地面/.workbuddy/skills/art-pipeline/scripts/generate_panel.py
```

但当前项目目录下没有这个文件。实际运行时会回退到：

```text
C:/Users/Administrator/.workbuddy/skills/art-pipeline/scripts/generate_panel.py
```

当前脚本真实 `--help` 参数如下：

```bash
usage: generate_panel.py [-h] [--width WIDTH] [--height HEIGHT]
                         [--radius RADIUS] [--output OUTPUT] [--no-leaves]
                         [--seed SEED]
```

也就是说，当前 `generate_panel.py` 只支持：

```text
width
height
radius
output
no-leaves
seed
```

它目前能做的是：

```text
1. 生成一个 RGBA 圆角羊皮纸面板。
2. 使用固定暖色渐变。
3. 叠加轻微纸纹/木纹。
4. 绘制两层边框。
5. 可选四角叶子装饰。
6. 使用固定 seed 保证复现。
```

它目前不支持：

```text
1. 不支持 --kind / --style 参数。
2. 不支持 button/card/panel/input/slot 分类。
3. 不支持按钮状态：default/hover/active/disabled/selected。
4. 不支持不同 UI 类型的装饰参数。
5. 不支持外圈透明安全边距。
6. 不支持 9-slice inset 输出。
7. 不支持中心留白比例配置。
8. 不支持左右端帽按钮结构。
9. 不支持卡片四角固定、边框可拉伸结构。
10. 不支持输入框低纹理、无装饰专用模式。
11. 不支持槽位、装备框、技能槽结构。
12. 不支持按资源 key 自动选择风格。
13. 不支持输出配套 Cocos SpriteFrame inset 配置。
```

当前脚本还有一个关键风险：它把主体圆角矩形画满画布。

```python
d.rounded_rectangle([0, 0, width - 1, height - 1], radius=radius, outline=border_outer, width=4)
mask = make_rounded_mask((width, height), radius)
base.putalpha(mask)
```

这意味着它没有外圈透明安全边距。对于按钮、卡片、槽位这类资源，仍可能产生：

```text
贴边
阴影被截断
四周切割感
9-slice 拉伸变形
alpha bbox padding 不达标
```

审计结论：

```text
generate_panel.py 当前只适合作为“简单圆角面板/临时输入框底板”的兜底脚本。
它不支持所有 UI 类型，也不支持 btn/panel/input/slot 的完整装饰参数。
因此不能直接作为 UI 基础组件程序化改造的最终落地方案。
```

正确落地方式：

```text
P0：不要直接把所有 procedural_ui 都交给现有 generate_panel.py。
P0：先在 art_pipeline.py 中按 asset_kind 分流。
P1：新增正式 UI Kit 生成器，明确支持 button/card/panel/input/slot。
P1：旧 generate_panel.py 只作为 ui_panel / ui_input 的临时 fallback。
P2：正式 UI Kit 生成器必须放进项目目录，禁止依赖用户目录回退脚本。
```

---

## 3. 全资源分类规则（asset_kind）

### 2.1 `asset_kind` 定义

`asset_kind` 是 `classify_resource()` 输出的新字段，决定资源由哪种方式生成：

| asset_kind | 生成方式 | 适用资源 | 代码处理 |
|------------|---------|---------|---------|
| `background` | Agnes AI | 全屏/战斗/事件/房间背景 | JPG RGB，不做 alpha 处理 |
| `character` | Agnes AI | 角色序列帧 | PNG RGBA，matte removal + chroma cleanup |
| `monster` | Agnes AI | 怪物单帧 | PNG RGBA，matte removal |
| `boss` | Agnes AI | Boss 序列帧 | PNG RGBA，matte removal |
| `effect` | Agnes AI | 特效序列帧 | PNG RGBA，chroma cleanup |
| `icon` | Agnes AI | 单物品图标 | PNG RGBA，matte removal + 留边检查 |
| `procedural_ui` | **程序化** | 按钮/卡片/面板/输入框/槽位/条 | 正式 UI Kit 生成器；旧 `generate_panel.py` 仅作 fallback |
| `tile` | 程序化 | 地表 tile | 程序化纹理生成 |

### 2.2 分类判定表

| 路径模式 | category | asset_kind |
|----------|---------|------------|
| `backgrounds/**/*.jpg` | backgrounds | `background` |
| `backgrounds/**/*.png` | backgrounds | `background` |
| `ui/**/*_bg.jpg` 或 `ui/**/*_bg.png` | backgrounds | `background` |
| `ui/**/btn_*.png` | ui | `procedural_ui` |
| `ui/**/button_*.png` | ui | `procedural_ui` |
| `ui/**/panel*.png` | ui | `procedural_ui` |
| `ui/**/card*.png` | ui | `procedural_ui` |
| `ui/**/frame*.png` | ui | `procedural_ui` |
| `ui/**/slot*.png` | ui | `procedural_ui` |
| `ui/**/input*.png` | ui | `procedural_ui` |
| `ui/**/name_panel*.png` | ui | `procedural_ui` |
| `ui/**/strip*.png` | ui | `procedural_ui` |
| `ui/**/row*.png` | ui | `procedural_ui` |
| `ui/**/bar*.png` | ui | `procedural_ui` |
| 其他 `ui/**/*.png` | ui | `procedural_ui`（兜底，优先程序化） |
| `icons/**/*.png` | icons | `icon` |
| `ui/**/icon_*.png` | icons | `icon` |
| `characters/**/*.png` | characters | `character` |
| `monsters/**/*.png` | monsters | `monster` |
| `bosses/**/*.png` | bosses | `boss` |
| `effects/**/*.png` | effects | `effect` |
| `tiles/**/*.png` | tiles | `tile`（程序化，不依赖 AI） |

### 2.3 `classify_resource()` 新增代码

```python
KIND_PROCEDURAL_UI = re.compile(
    r"^(?:ui/(?:.*/)?(?:btn_|button_|panel|card|frame|slot|input_|name_|strip_|row_|bar_))"
)

def classify_resource(key):
    parts = key.split("/")
    category = parts[0] if len(parts) > 1 else "other"
    # 整屏背景
    if key.endswith("_bg.jpg") or key.endswith("_bg.png"):
        category = "backgrounds"
    
    # 判定 asset_kind
    if category == "backgrounds":
        asset_kind = "background"
    elif category == "tiles":
        asset_kind = "tile"
    elif category == "icons" or (category == "ui" and "icon_" in key):
        asset_kind = "icon"
    elif category == "characters":
        asset_kind = "character"
    elif category == "monsters":
        asset_kind = "monster"
    elif category == "bosses":
        asset_kind = "boss"
    elif category == "effects":
        asset_kind = "effect"
    elif category == "ui" and KIND_PROCEDURAL_UI.match(key):
        asset_kind = "procedural_ui"
    else:
        # 兜底：其他 UI 也走程序化
        asset_kind = "procedural_ui" if category == "ui" else "icon"
    
    is_procedural = asset_kind in ("procedural_ui", "tile")
    ...
```

---

## 4. 核心修改代码清单

### 3.1 `classify_resource()` — Asset kind 分类

新增 `asset_kind` 字段返回，程序化/ AI 路由从此字段判定。

### 3.2 `cmd_generate()` — 生成路由

```python
if info["asset_kind"] == "procedural_ui":
    # 调用正式 UI Kit 生成器，按 asset_kind/sub_kind 生成
    ok, err = generate_procedural_ui(info, master_path, target_size)
elif info["asset_kind"] == "tile":
    # 程序化 tile 生成
    ok, err = generate_procedural_tile(info, master_path)
else:
    # AI 文生图（background / character / monster / boss / effect / icon）
    ok, err = generate_ai(info, master_path, target_size)
```

### 3.3 `validate_technical()` — 验证路由

```python
if asset_kind == "procedural_ui":
    # 9-slice 验证 + 模式检查 + 尺寸检查
    # 不需要边缘透明检查（程序化天然有正确 alpha）
    # 不需要 chroma 检查
    # 需要检查 border 一致性
elif asset_kind == "background":
    # JPG RGB + 尺寸 + 体积 + 平坦度检查
elif asset_kind in ("character", "monster", "boss"):
    # RGBA + matte cleanup + 边缘透明 + 留边 + chroma
elif asset_kind in ("icon", "effect"):
    # RGBA + 单体对象 + 边缘透明 + 留边
```

---

## 5. UI 组件程序化生成方案

### 5.1 不能直接按最终方案调用当前 `generate_panel.py`

当前 `generate_panel.py` 的能力不足，不能使用下面这种参数：

```bash
# 当前脚本不支持这个命令，不能照此执行
python scripts/generate_panel.py \
  --width 240 --height 80 \
  --radius 12 \
  --style btn \
  --output master/ui/create/btn_create_confirm.png
```

因为当前脚本没有 `--style`，也没有 `button/card/input/slot` 的绘制逻辑。

短期允许的 fallback 调用只有：

```bash
python generate_panel.py \
  --width 360 \
  --height 200 \
  --radius 22 \
  --output output.png \
  --no-leaves \
  --seed 20260708
```

该 fallback 只允许用于：

```text
ui_panel 临时底板
ui_input 临时底板
```

不允许用于：

```text
ui_button
ui_card
ui_slot
route_card
character_card
equipment slot
```

这些必须由新的 UI Kit 生成器支持。

### 5.2 正式 UI Kit 生成参数映射

| 资源类型 | width | height | radius | style | 装饰 |
|---------|-------|--------|--------|-------|------|
| 小按钮 btn_* | 192 | 64 | 10 | btn | 可选小叶装饰 |
| 大按钮 btn_* | 240 | 80 | 14 | btn | 可选小叶装饰 |
| 卡片 card_* | 260 | 96 | 16 | panel | 四角宝石装饰 |
| 面板 panel_* | 360 | 200 | 22 | panel | 四角花叶装饰 |
| 输入框 input_* | 360 | 56 | 8 | input | --no-leaves |
| 名称面板 name_panel | 360 | 200 | 22 | panel | --no-leaves |
| 槽位 slot_* | 64 | 64 | 8 | slot | 无装饰 |

注意：上表是正式 UI Kit 生成器需要实现的目标能力，不是当前 `generate_panel.py` 已具备的能力。

### 5.3 程序化优势

| 对比项 | AI 文生图 | 程序化（Pillow） |
|--------|----------|----------------|
| 透明边缘 | 靠 AI 推测，经常失败 | 精确控制，100% 正确 |
| 留边 padding | 不保证 | 可设置（margin_ratio） |
| 9-slice 边框 | 画成随机花纹 | 稳定连续、长度可配置 |
| 假文字/伪细节 | 常见 | 不存在 |
| 体积控制 | 靠压缩，可能有损 | 直接输出最优 |
| 生成时间 | 15-60s / 张 | 0.1s / 张 |
| 一致性 | 同一 prompt 每次不同 | 相同 seed 完全一致 |
| 批量调试 | 消耗 API，成本高 | 命令行重复无需成本 |

---

## 6. 9-Slice 资源规范

### 5.1 边距标准

| 类型 | left | right | top | bottom | 中心要求 |
|------|:----:|:-----:|:---:|:------:|---------|
| 小按钮 | 32 | 32 | 18 | 18 | 低对比纯净底色 |
| 主按钮 | 44 | 44 | 22 | 22 | 中心 70% 留给 Label |
| 长条卡片 | 44 | 44 | 18 | 18 | 羊皮纸或浅色内容区 |
| 大面板 | 64 | 64 | 64 | 64 | 柔和内容区，不能纯白 |

### 5.2 Sprite 配置（Cocos Creator）

```
Sprite Type: SLICED
Trim: true
Size Mode: CUSTOM
Border: {left, top, right, bottom} 按上表设置
```

### 5.3 `validate_technical` 新增 9-slice 验证

```python
def validate_nine_slice(filepath, expected_insets=None):
    """验证 9-slice 资源：
    - 四角细节集中
    - 边线像素连续（无突变的色块）
    - 中心区域颜色方差低
    
    Returns (pass, issues)
    """
```

---

## 7. 首批重做资源列表（P0）

### 7.1 程序化 UI（走正式 UI Kit 生成器）

| # | 资源 | 尺寸 | 参数 |
|---|------|------|------|
| 1 | `ui/create/btn_create_confirm.png` | 240×80 | btn, r=14 |
| 2 | `ui/create/btn_create_skip.png` | 240×80 | btn, r=14 |
| 3 | `ui/create/btn_class_default.png` | 192×64 | btn, r=12 |
| 4 | `ui/create/btn_class_selected.png` | 192×64 | btn, r=12, 选中高亮 |
| 5 | `ui/character/character_card_default.png` | 260×96 | panel, r=16 |
| 6 | `ui/character/character_card_selected.png` | 260×96 | panel, r=16, 选中高亮 |
| 7 | `ui/area/route_card_default.png` | 260×96 | panel, r=16 |
| 8 | `ui/area/route_card_locked.png` | 260×96 | panel, r=16 |
| 9 | `ui/area/area_badge_forest.png` | 128×128 | badge（AI 生成徽章符号） |
| 10 | `ui/area/area_badge_*.png` | 128×128 | badge × 5 区域 |

### 7.2 AI 生成（走 Agnes）

| # | 资源 | 说明 |
|---|------|------|
| 11 | `icons/items/icon_item_key.png` | 单体图标，AI 生成 |
| 12 | `ui/splash/splash_bg.jpg` | 整屏背景，需重跑生成 |

### 7.3 执行顺序

```
Batch 1: 程序化 UI（#1~#8）→ 批量生成，0 API 成本
Batch 1.5: splash_bg 重跑（#12）
Batch 2: 图标（#11）+ 徽章（#9~#10）
```

---

## 8. 验收标准

### 7.1 程序化 UI 验收

| 检查项 | 标准 | 检查方式 |
|--------|------|---------|
| 文件格式 | PNG RGBA | 自动 |
| 尺寸 | 精确匹配规格 | 自动 |
| 透明边缘 | 外圈 2px alpha=0 | 自动 |
| 9-slice border | 4 边稳定 | 自动 |
| 中心空白 | std < 15 | 自动 |
| 视觉 | 无假文字/无装饰溢出 | 人工确认 |
| 体积 | < 120KB | 自动 |

### 7.2 AI 资源验收

| 检查项 | 标准 | 检查方式 |
|--------|------|---------|
| 文件格式 | PNG RGBA / JPG RGB | 自动 |
| 尺寸 | 精确匹配 prompt | 自动 |
| 透明边缘 | 外圈 2px alpha=0，四角透明 | 自动 |
| 留边 | bbox ≥ 6px from edge | 自动 |
| 中心空白 | btn/card/panel 中心低方差 | 自动 |
| 视觉 | 无文字/无场景/无切割 | 人工确认 |
| 体积 | 按分类预算 | 自动 |

---

## 9. 执行命令

### 8.1 程序化 UI 批量生成

```bash
cd E:/game/回到地面

# 生成所有 btn_create 相关
python tools/art_pipeline.py generate --category ui/create --self-check

# 生成所有 character card
python tools/art_pipeline.py generate --category ui/character --self-check

# 生成所有 area route card
python tools/art_pipeline.py generate --category ui/area --self-check
```

### 8.2 AI 批量生成

```bash
# 重跑图标
PYTHONIOENCODING=utf-8 AGNES_API_KEY="sk-..." \
python tools/art_pipeline.py generate --category icons --self-check --limit 10

# 重跑 splash
PYTHONIOENCODING=utf-8 AGNES_API_KEY="sk-..." \
python tools/art_pipeline.py generate --resource ui/splash/splash_bg.jpg --self-check
```

### 8.3 视觉审查

```bash
# 生成 contact sheet 供批量审查
python tools/art_pipeline.py contact --category ui/create
python tools/art_pipeline.py contact --category ui/character
python tools/art_pipeline.py contact --category ui/area
```

### 8.4 入库

```bash
# 只 import 人工确认通过的资源
python tools/art_pipeline.py import --all
npm.cmd run validate:all
```

---

## 10. 风险规避

| 风险 | 概率 | 缓解措施 |
|------|:----:|---------|
| 程序化 UI 视觉单调 | 中 | 正式 UI Kit 生成器增加装饰参数（叶子/宝石/轮廓）；旧 `generate_panel.py` 不作为主方案 |
| 9-slice 边框不适应 | 低 | 所有生成资源加 --self-check，验证 border 连续性 |
| 现有 UI 资源被覆盖 | 中 | `import` 前自动备份到 `backup/`，可回滚 |
| AI 生成假文字 | 高 | 视觉门禁 + 人工验收双重保障，无文字才入库 |
| 体积超预算 | 中 | palette reduction 自动降色数，不超过 hard limit |
| API Key 过期 | 中 | 失败后标记 `blocked_prompt_risk`，不反复消耗配额 |
| 环境变量丢失 | 低 | pipeline 启动时检查 AGNES_API_KEY，缺失则提示 |
| 程序化 seed 不稳定 | 低 | `--seed 20260708` 固定随机种子，多次生成一致 |

---

## 11. `art_pipeline.py` 修改总结

| 修改位置 | 改动内容 | 影响范围 |
|---------|---------|---------|
| `classify_resource()` | 新增 `asset_kind` 字段 + `KIND_PROCEDURAL_UI` 正则 | 所有资源 |
| `cmd_generate()` | 按 asset_kind 路由：程序化 → 正式 UI Kit 生成器，AI → Agnes | 生成流程 |
| `cmd_validate()` | procedural_ui 走 9-slice 验证，不走 alpha/chroma | 验证流程 |
| `validate_technical()` | 新增 edge-touch gate + visual quality gate | 门禁体系 |
| 新增 `validate_edge_transparent()` | 外圈 alpha / 四角 / bbox 留边 | 透明资源 |
| 新增 `validate_visual_quality()` | 亮度/方差/中心空白/Chroma | 所有类型 |
| 新增 `validate_nine_slice()` | 9-slice 四角/边线/中心一致性 | 程序化 UI |
| `post_process_generated()` | overscan + fit_rgba_to_canvas | AI 透明资源 |
| 常量区 | `ORNAMENT_TYPES`, `OVERSCAN_FACTOR` | 装饰框类 |
| `generate_procedural()` | 改为分派入口：UI Kit 主生成器优先，旧 `generate_panel.py` 仅 fallback | UI 程序化 |

---

## 12. 配套文件

| 文件 | 用途 |
|------|------|
| `tools/art_pipeline.py` | 主管线脚本，含全部生成/验证/导入逻辑 |
| `tools/ui_kit_generator.py` 或项目内 `scripts/generate_panel.py` 新版 | 正式 UI Kit 生成器；必须支持 button/card/panel/input/slot |
| `assets/resources/config/prompts.json` | AI prompt 配置文件 |
| `art_source/textures_review/visual_review_status.md` | 视觉审查进度表 |
| `art_source/textures_review/art_pipeline_progress.json` | 生成进度（断点续执行） |
| `docs/美术资源边缘切割感根因治理方案.md` | 原始治理方案文档 |
| `docs/美术资源生成与入库规范.md` | 总规范文档 |
| `topics/ART_RESOURCE_RULES.md` | 美术资源规则集 |
