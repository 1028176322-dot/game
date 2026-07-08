# TapTap 美术资源体积放宽与 prompts 更新方案

更新时间：2026-07-08

适用范围：

```text
E:/game/assets/resources/config/prompts.json
E:/game/回到地面/assets/resources/textures
E:/game/回到地面/art_source/textures_review/master
E:/game/回到地面/art_source/textures_export/runtime_replace
```

目标平台：TapTap Android 正式发布

---

## 1. 结论

切换到 TapTap Android 发布后，美术资源大小限制可以放宽，而且应该放宽。

当前项目之前按微信小游戏思路做了较强的单图体积约束，已经导致过这些问题：

```text
图片糊
颜色被异常量化
特效细节丢失
按钮边缘脏
透明边缘异常
背景压缩后质感差
为了体积反复生成失败
```

TapTap Android 版应该从：

```text
单张图片硬上限优先
```

改为：

```text
审核安全 > 功能正确 > 视觉质量 > 运行性能 > 总包体预算 > 单张体积
```

也就是说，单张图片体积不再作为自动失败的第一条件。只要资源安全、清晰、风格统一、加载正常，并且总包体和显存预算可控，就可以接受更大的资源。

---

## 2. prompts.json 是否需要更新

需要更新，但不建议把“体积限制”直接写进 `prompts.json`。

### 2.1 当前 prompts.json 结构

当前文件：

```text
E:/game/assets/resources/config/prompts.json
```

结构是：

```json
{
  "backgrounds/bg_combat_forest.png": "prompt text...",
  "characters/warrior/warrior_idle.png": "prompt text...",
  "ui/create/create_bg.jpg": "prompt text..."
}
```

当前统计：

```text
总资源数：418
bosses：120
ui：92
icons：67
monsters：36
characters：35
effects：27
tiles：24
backgrounds：17
```

这个结构适合作为“生成提示词源文件”，但不适合承载以下内容：

```text
推荐 KB
硬上限 KB
是否允许 JPG
是否允许透明
是否要 9-slice
是否必须保留母版
派生图质量参数
```

这些应该放在独立预算配置里。

### 2.2 prompts.json 应该更新什么

`prompts.json` 应该只更新和生成质量有关的提示词：

```text
1. 强化 TapTap Android 版高清质量要求。
2. 去掉会诱导过度压缩、低色数、像素化、有限调色板的描述。
3. 保留无文字、无伪文字、无违规元素、安全风格合同。
4. 对 UI、背景、角色、特效分别补充更准确的“高质量输出要求”。
5. 对一体化 UI 背景补充“预留布局区域，不画文字，不画角色主体”的规则。
```

### 2.3 prompts.json 不应该更新什么

不要把下面内容写进 prompt：

```text
文件大小限制
KB 数字
PNG 压缩等级
JPG quality
WebP quality
是否 hard fail
包体预算
运行内存预算
```

原因：

```text
AI 生图模型无法稳定遵守 KB 限制。
把“small file size / compressed / limited palette”写进 prompt 会降低画面质量。
文件大小应该由后处理脚本和预算配置控制。
```

---

## 3. 新资源预算标准

### 3.1 总包体预算

TapTap Android 首版建议：

```text
APK 总体积推荐：80MB 以下
APK 总体积可接受：120MB 以下
APK 总体积谨慎：150MB 以上

纹理资源推荐：50MB 以下
首屏必须加载资源：15MB 以下
单场景同时驻留纹理显存：150MB - 250MB
```

### 3.2 分类体积预算

| 资源类型 | 推荐范围 | 警告范围 | 人工确认上限 | 说明 |
|---|---:|---:|---:|---|
| 主城/创角/区域选择整屏背景 JPG | 300-800KB | 800KB-1.2MB | 1.5MB | 核心视觉，可明显放宽 |
| 普通战斗背景 JPG | 250-600KB | 600KB-1MB | 1.2MB | 背景清晰优先 |
| UI 大面板 PNG | 80-250KB | 250-500KB | 800KB | 9-slice 优先 |
| UI 小按钮 PNG | 20-100KB | 100-180KB | 250KB | 不画文字 |
| 角色 sprite sheet PNG | 150-500KB | 500KB-900KB | 1.2MB | 清晰优先 |
| Boss sprite sheet PNG | 400KB-1.2MB | 1.2MB-1.8MB | 2.5MB | Boss 是视觉重点 |
| 普通怪物 PNG | 100-350KB | 350-600KB | 900KB | 不要糊 |
| 特效 sprite sheet PNG | 80-250KB | 250-450KB | 700KB | 透明边缘优先 |
| 图标 PNG | 15-60KB | 60-120KB | 180KB | 128/192/256 清晰 |
| Tile PNG | 5-40KB | 40-80KB | 120KB | 可拼贴优先 |

### 3.3 自动判定策略

旧策略：

```text
超过 hard limit -> fail -> 删除或不入库
```

新策略：

```text
安全违规 -> fail
尺寸错误 -> fail
路径错误 -> fail
透明错误 -> fail
sprite sheet 帧数错误 -> fail
9-slice 边缘错误 -> fail
严重模糊 -> fail

体积超过推荐值 -> warning
体积超过人工确认上限 -> manual_review
体积大但视觉优秀 -> 可批准入库
```

---

## 4. 新增预算配置文件

建议新增：

```text
E:/game/assets/resources/config/art_quality_budget.json
```

内容：

```json
{
  "platform": "taptap_android",
  "packageBudgetMB": {
    "recommended": 80,
    "acceptable": 120,
    "manualReview": 150
  },
  "textureBudgetMB": {
    "recommended": 50,
    "acceptable": 75,
    "manualReview": 100
  },
  "rules": {
    "backgrounds": {
      "format": "jpg",
      "recommendKB": 600,
      "warningKB": 1000,
      "manualReviewKB": 1200,
      "failOnSize": false,
      "runtimeQuality": 90
    },
    "ui_fullscreen": {
      "format": "jpg_or_png",
      "recommendKB": 800,
      "warningKB": 1200,
      "manualReviewKB": 1500,
      "failOnSize": false,
      "runtimeQuality": 90
    },
    "ui_panel": {
      "format": "png_rgba",
      "recommendKB": 250,
      "warningKB": 500,
      "manualReviewKB": 800,
      "failOnSize": false,
      "nineSliceRequired": true
    },
    "ui_button": {
      "format": "png_rgba",
      "recommendKB": 100,
      "warningKB": 180,
      "manualReviewKB": 250,
      "failOnSize": false,
      "nineSlicePreferred": true
    },
    "characters": {
      "format": "png_rgba",
      "recommendKB": 500,
      "warningKB": 900,
      "manualReviewKB": 1200,
      "failOnSize": false
    },
    "bosses": {
      "format": "png_rgba",
      "recommendKB": 1200,
      "warningKB": 1800,
      "manualReviewKB": 2500,
      "failOnSize": false
    },
    "monsters": {
      "format": "png_rgba",
      "recommendKB": 350,
      "warningKB": 600,
      "manualReviewKB": 900,
      "failOnSize": false
    },
    "effects": {
      "format": "png_rgba",
      "recommendKB": 250,
      "warningKB": 450,
      "manualReviewKB": 700,
      "failOnSize": false
    },
    "icons": {
      "format": "png_rgba",
      "recommendKB": 60,
      "warningKB": 120,
      "manualReviewKB": 180,
      "failOnSize": false
    },
    "tiles": {
      "format": "png_rgba",
      "recommendKB": 40,
      "warningKB": 80,
      "manualReviewKB": 120,
      "failOnSize": false,
      "tileableRequired": true
    }
  }
}
```

---

## 5. prompts.json 更新规则

### 5.1 全局追加高清质量合同

建议所有资源 prompt 都保证含有：

```text
TAPTAP ANDROID QUALITY CONTRACT: high-resolution clean cartoon animal game art for Android release, sharp readable details at mobile screen size, rich clean colors, smooth soft highlights, crisp edges, no blur, no muddy compression, no low-color posterization, no noisy artifacts.
```

中文含义：

```text
TapTap Android 正式版高清质量要求：
高清、干净、卡通动物风、移动端可读、颜色丰富、边缘清晰、不模糊、不压坏、不低色数。
```

### 5.2 替换低质量诱导词

需要检查并替换：

| 旧描述 | 新描述 |
|---|---|
| limited clean palette | rich clean palette |
| limited palette | rich clean palette |
| low file size | optimized runtime export |
| compressed texture | clean runtime export |
| small file size | balanced runtime export |
| reduce colors | preserve clean color gradients |
| 8-color palette | clean rich cartoon palette |
| pixel art | cartoon animal game art |
| dark fantasy | bright colorful cartoon animal fantasy |

注意：

```text
如果 tile 明确是程序化小图，可以保留“simple clean tile palette”。
但角色、Boss、背景、UI 不应再出现 limited palette 这类压缩诱导词。
```

### 5.3 背景类 prompt 更新

适用于：

```text
backgrounds/*.png
ui/main/*
ui/create/*
ui/area/*
ui/settlement/*
ui/death/*
```

追加：

```text
FULLSCREEN COMPOSITION CONTRACT: complete integrated UI scene background, no text, no symbols that look like letters, no blank signboards, no isolated sticker panel, keep functional areas visually blended into the environment with soft lighting and natural framing.
```

如果是一体化界面背景，追加：

```text
LAYOUT RESERVE CONTRACT: reserve clean readable areas for runtime UI labels and buttons; do not draw sample text, do not draw placeholder characters, do not draw permanent hero character in the main character display area.
```

### 5.4 UI 按钮 / 面板 prompt 更新

适用于：

```text
ui/**/*.png
```

追加：

```text
UI RUNTIME TEXT CONTRACT: draw decorative frame only, no embedded text, no fake letters, no numbers, no logo, center area must stay clean for runtime Label text. Use rounded wooden, leaf, flower, gem, paw, ribbon, or soft cloth decorations matching cheerful cartoon animal forest style.
```

9-slice 资源追加：

```text
NINE-SLICE CONTRACT: corners contain all decorative detail, edges are clean stretchable bands, center is simple and calm, no important detail in the stretch area, symmetric border thickness, readable after horizontal or vertical scaling.
```

### 5.5 角色 / 怪物 / Boss prompt 更新

适用于：

```text
characters/**
monsters/**
bosses/**
```

追加：

```text
SPRITE CLARITY CONTRACT: full-body cute cartoon animal sprite, clean silhouette, consistent body size across frames, no large colored blob behind the character, no background scenery, no floor patch, no shadow baked into the sprite unless explicitly requested.
```

动作序列追加：

```text
SPRITE SHEET CONTRACT: each frame must show the same character design, same scale, same costume, same species, same color palette, centered in each frame with safe transparent margin, no frame-to-frame identity drift.
```

### 5.6 特效 prompt 更新

适用于：

```text
effects/**
```

追加：

```text
VFX CLARITY CONTRACT: clean readable magical effect sprite sheet, transparent background after postprocess, bright core with soft outer glow, no solid rectangular background, no checkerboard, no fake transparency, no character or object unless explicitly requested.
```

不要写：

```text
black background
green screen
magenta screen
```

除非后处理脚本确实用该方案，而且必须保证不会把主体颜色误判为背景。

### 5.7 图标 prompt 更新

适用于：

```text
icons/**
ui/upgrade/icon_*.png
```

追加：

```text
ICON CONTRACT: single clean game item or skill symbol, centered, readable at 64px, transparent background, no face icon unless the asset is explicitly a character portrait, no text, no badge letters, no watermark.
```

### 5.8 Tile prompt 更新

适用于：

```text
tiles/**
```

追加：

```text
TILE CONTRACT: seamless top-down terrain tile, no central icon, no object hotspot, no border frame, no text, edges must match when repeated horizontally and vertically, subtle variation only.
```

如果 tile 已改为程序化生成，`prompts.json` 中 tile prompt 只作为设计参考，不作为实际 AI 生成源。

---

## 6. prompts.json 批量更新脚本方案

建议新增：

```text
E:/game/tools/update_prompts_for_taptap_quality.py
```

脚本职责：

```text
1. 读取 prompts.json。
2. 按路径分类。
3. 替换低质量诱导词。
4. 按类别追加质量合同。
5. 避免重复追加。
6. 输出备份。
7. 输出更新报告。
```

核心代码：

```python
import json
from pathlib import Path
from datetime import datetime

PROMPTS_PATH = Path(r"E:/game/assets/resources/config/prompts.json")

GLOBAL_QUALITY = (
    " TAPTAP ANDROID QUALITY CONTRACT: high-resolution clean cartoon animal game art "
    "for Android release, sharp readable details at mobile screen size, rich clean colors, "
    "smooth soft highlights, crisp edges, no blur, no muddy compression, "
    "no low-color posterization, no noisy artifacts."
)

REPLACEMENTS = {
    "limited clean palette": "rich clean palette",
    "limited palette": "rich clean palette",
    "low file size": "optimized runtime export",
    "small file size": "balanced runtime export",
    "compressed texture": "clean runtime export",
    "reduce colors": "preserve clean color gradients",
    "8-color palette": "clean rich cartoon palette",
    "dark fantasy": "bright colorful cartoon animal fantasy",
}

CATEGORY_CONTRACTS = {
    "backgrounds": (
        " FULLSCREEN COMPOSITION CONTRACT: complete integrated scene background, no text, "
        "no symbols that look like letters, no blank signboards, keep functional areas visually "
        "blended into the environment with soft lighting and natural framing."
    ),
    "characters": (
        " SPRITE SHEET CONTRACT: each frame must show the same character design, same scale, "
        "same costume, same species, same color palette, centered in each frame with safe transparent margin, "
        "no frame-to-frame identity drift."
    ),
    "monsters": (
        " SPRITE CLARITY CONTRACT: full-body cute cartoon animal sprite, clean silhouette, "
        "no large colored blob behind the character, no background scenery, no floor patch."
    ),
    "bosses": (
        " BOSS SPRITE QUALITY CONTRACT: large readable cute cartoon animal boss, rich clean details, "
        "consistent design across all actions, no background plate, no scenery, no identity drift."
    ),
    "effects": (
        " VFX CLARITY CONTRACT: clean readable magical effect sprite sheet, transparent background after postprocess, "
        "bright core with soft outer glow, no solid rectangular background, no checkerboard, no fake transparency."
    ),
    "icons": (
        " ICON CONTRACT: single clean game item or skill symbol, centered, readable at 64px, "
        "transparent background, no face icon unless explicitly a character portrait, no text, no badge letters."
    ),
    "tiles": (
        " TILE CONTRACT: seamless top-down terrain tile, no central icon, no object hotspot, no border frame, "
        "no text, edges must match when repeated horizontally and vertically."
    ),
    "ui": (
        " UI RUNTIME TEXT CONTRACT: draw decorative frame or integrated UI background only, no embedded text, "
        "no fake letters, no numbers, no logo, runtime labels must be added by the game UI."
    ),
}

UI_NINE_SLICE_HINTS = (
    "btn_", "button", "panel", "frame", "card", "slot", "strip", "input"
)

NINE_SLICE_CONTRACT = (
    " NINE-SLICE CONTRACT: corners contain all decorative detail, edges are clean stretchable bands, "
    "center is simple and calm, no important detail in the stretch area, symmetric border thickness, "
    "readable after horizontal or vertical scaling."
)

def append_once(text: str, clause: str) -> str:
    marker = clause.split(":", 1)[0].strip()
    if marker in text:
        return text
    return text.rstrip() + clause

def update_prompt(path: str, prompt: str) -> tuple[str, list[str]]:
    changes = []
    new_prompt = prompt

    lower = new_prompt.lower()
    for old, new in REPLACEMENTS.items():
        if old in lower:
            new_prompt = new_prompt.replace(old, new)
            new_prompt = new_prompt.replace(old.upper(), new.upper())
            changes.append(f"replace:{old}->{new}")
            lower = new_prompt.lower()

    new_prompt = append_once(new_prompt, GLOBAL_QUALITY)

    category = path.split("/", 1)[0]
    contract = CATEGORY_CONTRACTS.get(category)
    if contract:
        before = new_prompt
        new_prompt = append_once(new_prompt, contract)
        if new_prompt != before:
            changes.append(f"append:{category}")

    if category == "ui" and any(hint in path.lower() for hint in UI_NINE_SLICE_HINTS):
        before = new_prompt
        new_prompt = append_once(new_prompt, NINE_SLICE_CONTRACT)
        if new_prompt != before:
            changes.append("append:nine_slice")

    return new_prompt, changes

def main() -> None:
    data = json.loads(PROMPTS_PATH.read_text(encoding="utf-8"))

    backup = PROMPTS_PATH.with_suffix(f".backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    backup.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    report = []
    updated = {}
    for path, prompt in data.items():
        new_prompt, changes = update_prompt(path, prompt)
        updated[path] = new_prompt
        if changes:
            report.append({"path": path, "changes": changes})

    PROMPTS_PATH.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report_path = PROMPTS_PATH.parent / "prompts_taptap_quality_update_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"updated={len(report)}")
    print(f"backup={backup}")
    print(f"report={report_path}")

if __name__ == "__main__":
    main()
```

---

## 7. 生成脚本需要同步修改

生成脚本不能再把体积超限直接判失败。

### 7.1 旧逻辑

```python
if size_kb > hard_limit:
    status = "failed_size"
    output.unlink()
```

### 7.2 新逻辑

```python
if has_safety_violation:
    status = "failed_safety"
elif has_dimension_error:
    status = "failed_dimension"
elif has_alpha_error:
    status = "failed_alpha"
elif size_kb > manual_review_kb:
    status = "manual_review_size"
elif size_kb > warning_kb:
    status = "size_warning"
else:
    status = "generated"
```

重点：

```text
不要因为体积大自动删除文件。
体积大但视觉质量好的资源进入人工确认。
只有安全、尺寸、透明、路径、帧数、严重模糊错误才自动失败。
```

### 7.3 batch_report.csv 新字段

建议增加：

```csv
path,category,status,size_kb,recommend_kb,warning_kb,manual_review_kb,quality_status,review_required,error
```

示例：

```csv
ui/create/create_bg.jpg,ui_fullscreen,size_warning,920,800,1200,1500,ok,true,
effects/reactions/fx_reaction_burn.png,effects,generated,180,250,450,700,ok,false,
icons/items/icon_item_key.png,icons,failed_safety,45,60,120,180,safety_fail,true,heart-like object detected
```

---

## 8. 后处理压缩策略

### 8.1 背景

```text
母版：PNG 或高质量 JPG，保存在 art_source/textures_review/master
运行图：JPG quality 88-92
禁止：为了体积降到 70 以下导致糊
```

### 8.2 UI

```text
透明 UI：PNG RGBA
大面积不透明整屏 UI：JPG 或 PNG，按实际透明需求决定
9-slice：PNG RGBA，不要 JPG
按钮：PNG RGBA，尽量 9-slice
```

### 8.3 角色 / 怪物 / Boss

```text
必须 PNG RGBA
不使用 JPG
不使用索引色 P 模式
不使用过度 pngquant
```

### 8.4 特效

```text
必须 PNG RGBA
透明边缘质量优先
允许比微信版更大
不要用黑底转 alpha 导致发光信息丢失
```

### 8.5 图标

```text
PNG RGBA
中心主体清晰
不要为压缩牺牲边缘
```

---

## 9. prompts.json 更新后的验证

执行更新后必须检查：

```text
1. JSON 可解析。
2. 资源数量仍为 418。
3. 所有 key 未变化。
4. 没有 U+FFFD 乱码。
5. 没有危险正向词。
6. 没有 low file size / limited palette 等低质量诱导词。
7. 背景和 UI 没有要求嵌入文字。
```

验证脚本核心：

```python
import json
from pathlib import Path

p = Path(r"E:/game/assets/resources/config/prompts.json")
data = json.loads(p.read_text(encoding="utf-8"))

assert len(data) == 418

bad_terms = [
    "low file size",
    "small file size",
    "limited palette",
    "8-color palette",
    "embedded text",
]

danger_terms = [
    "blood",
    "skull",
    "organ",
    "heart",
    "corpse",
    "bone",
    "grave",
    "tomb",
]

for path, prompt in data.items():
    low = prompt.lower()
    for term in bad_terms:
        if term in low:
            print("low quality risk", path, term)
    for term in danger_terms:
        if term in low:
            print("manual review danger term", path, term)
```

注意：

```text
危险词检查不能简单一刀切。
例如 "no skull" 也包含 skull，但项目经验表明正向提示词中反复出现危险词会诱导 AI 生成违规内容。
更推荐的做法是：不要在 prompt 里大量列危险词，用正向安全描述替代。
```

---

## 10. 推荐操作步骤

### Step 1：备份

```powershell
Copy-Item `
  -LiteralPath "E:/game/assets/resources/config/prompts.json" `
  -Destination "E:/game/assets/resources/config/prompts.backup_before_taptap_quality.json"
```

### Step 2：新增预算配置

创建：

```text
E:/game/assets/resources/config/art_quality_budget.json
```

内容使用本文第 4 章。

### Step 3：新增批量更新脚本

创建：

```text
E:/game/tools/update_prompts_for_taptap_quality.py
```

内容使用本文第 6 章。

### Step 4：试运行

建议先复制一份测试：

```powershell
Copy-Item `
  -LiteralPath "E:/game/assets/resources/config/prompts.json" `
  -Destination "E:/game/assets/resources/config/prompts.test.json"
```

先把脚本临时指向 `prompts.test.json`，确认更新结果。

### Step 5：正式运行

```powershell
python E:/game/tools/update_prompts_for_taptap_quality.py
```

### Step 6：检查报告

查看：

```text
E:/game/assets/resources/config/prompts_taptap_quality_update_report.json
```

重点看：

```text
ui
backgrounds
characters
bosses
effects
```

### Step 7：运行生成脚本小批量验证

不要全量重跑 418 张。

建议顺序：

```text
1. ui/create 2-3 张
2. backgrounds 1-2 张
3. characters 1 个角色动作
4. effects 2 张
5. icons 3 张
```

确认：

```text
画面更清晰
没有文字
没有违规
文件体积进入 warning 也能保留
runtime 图能加载
```

### Step 8：全量生成

按分类分批：

```text
backgrounds
ui
characters
monsters
bosses
effects
icons
tiles
```

不要一次性全量覆盖。

---

## 11. 是否需要重做现有资源

不需要因为体积策略变化就全部重做。

需要重做的情况：

```text
图片糊
颜色被压坏
UI 和背景不一体
按钮拉伸严重
资源有英文 / 伪文字
资源有骷髅 / 血液 / 器官 / 心脏
sprite sheet 身份漂移
特效边缘脏
透明错误
9-slice 不可拉伸
```

不需要重做的情况：

```text
画面清晰
风格统一
审核安全
加载正常
只是体积比旧微信预算大
```

---

## 12. 对当前 prompts.json 的具体判断

当前 `prompts.json` 需要更新，原因：

```text
1. 它仍然是后续 418 个资源生成的核心提示词源。
2. TapTap Android 版资源质量目标已经提高。
3. 旧的“低体积优先”策略不应继续影响生图。
4. 部分 prompt 中存在 limited palette / compression 类描述，会潜在降低质量。
5. UI 和一体化背景需要更明确地说明“不嵌字、预留运行时文本区域、整体融合”。
```

但更新方式应该是：

```text
脚本批量增强质量合同
脚本替换低质量诱导词
分类追加规则
预算另建 art_quality_budget.json
不手工逐条改 418 条
```

---

## 13. 最终交付物

执行完本方案后，应有：

```text
E:/game/assets/resources/config/prompts.json
E:/game/assets/resources/config/prompts.backup_before_taptap_quality.json
E:/game/assets/resources/config/prompts_taptap_quality_update_report.json
E:/game/assets/resources/config/art_quality_budget.json
E:/game/tools/update_prompts_for_taptap_quality.py
```

生成脚本应同步支持：

```text
size_warning
manual_review_size
failed_safety
failed_dimension
failed_alpha
failed_sprite_sheet
```

禁止继续使用：

```text
failed_size 后自动删除文件
80KB / 96KB 一刀切硬上限
为了压缩使用索引色 P 模式
为了压缩破坏 alpha
为了压缩降低到极少颜色
```

---

## 14. 给执行 AI 的要求

如果交给另一个对话执行，必须明确：

```text
1. 不要直接全量重跑资源。
2. 先备份 prompts.json。
3. 先创建 art_quality_budget.json。
4. 用脚本批量更新 prompts.json。
5. 小批量试生成并人工验收。
6. 体积超推荐值只标 warning，不自动失败。
7. 严禁因为体积大删除母版。
8. 所有正式资源必须保持审核安全。
9. UI 图片不得含文字，文字走 text.json + Label。
10. TS 代码注释保持 ASCII，中文说明写 md。
```

