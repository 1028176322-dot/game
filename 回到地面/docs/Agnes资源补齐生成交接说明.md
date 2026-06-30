# Agnes 资源补齐生成交接说明

## 1. 交接目标

使用 Agnes HTTP API 生成 `runtime_replace` 美术资源，并输出到：

```text
E:/game/回到地面/art_source/textures_export/runtime_replace
```

本交接只负责生成和重做资源，不负责最终替换 `assets/resources/textures`。

最终替换必须等资源全部生成、校验、人工验收通过后再执行。

本轮最高优先级口径：

```text
runtime_replace_missing_production_spec.csv 中的 179 张全部重做。
即使 runtime_replace 中已有同名 PNG，也必须覆盖重做。
所有 179 张必须使用新的明亮卡通像素风 prompt。
技术通过但风格偏暗黑、哥特、恐怖徽章、低饱和写实 RPG，也判 rejected。
```

本轮生成主命令：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179
```

## 2. 当前资源状态

当前 `runtime_replace` 中已有部分之前生成/处理过的 PNG，但这些文件不再作为本轮可保留结果。

当前已知状态：

```text
本轮生产规格文件行数: 179
本轮需要覆盖重做: 179
本轮不按“已存在则跳过”处理
额外 known-bad combat effects: 不并入本轮 179，后续单独处理
```

说明：

- 生产规格文件仍是 179 行。
- 之前生成过的 `effects/combat/fx_dodge.png`、`effects/reactions/fx_reaction_burn.png`、`effects/reactions/fx_reaction_conduct.png` 本轮也要覆盖重做。
- 本轮不再保留任何“技术通过但风格不一致”的旧图。
- 当前最终门禁显示 `runtime_replace` 尚未补齐，仍不能替换 `assets/resources/textures`。
本轮 179 中包含 effects：

```text
effects/reactions/fx_reaction_corrode.png
effects/reactions/fx_reaction_decay.png
effects/reactions/fx_reaction_freeze.png
effects/reactions/fx_reaction_melt.png
effects/reactions/fx_reaction_overload.png
effects/reactions/fx_reaction_radiance.png
effects/reactions/fx_reaction_shatter.png
effects/reactions/fx_reaction_vaporize.png
effects/reactions/fx_reaction_void.png
effects/relics/fx_relic_blink_stone.png
effects/relics/fx_relic_decoy_scroll.png
effects/relics/fx_relic_flame_ring.png
effects/relics/fx_relic_frost_amulet.png
effects/relics/fx_relic_gravity_stone.png
effects/relics/fx_relic_life_link.png
effects/relics/fx_relic_shadow_dagger.png
effects/relics/fx_relic_time_hourglass.png
effects/ui/fx_ui_glow.png
effects/ui/fx_ui_loading.png
```

另有 5 张已知不合格 combat effects，不在本轮 179 清单中，后续可单独重做：

```text
effects/combat/fx_crit.png
effects/combat/fx_dash.png
effects/combat/fx_heal.png
effects/combat/fx_hit_normal.png
effects/combat/fx_shield.png
```

这 5 张是之前生成过但 alpha 全不透明/背景被烘进图里的资源。本轮 `--full-rebuild-179` 不会处理它们；后续必须显式加：

```powershell
--include-rework-effects --category=effects --overwrite
```

## 3. 文件位置

生成脚本：

```text
E:/game/tools/gen_missing_179.py
```

生产规格文件：

```text
E:/game/回到地面/art_source/runtime_replace_recovery/runtime_replace_missing_production_spec.csv
```

生成输出目录：

```text
E:/game/回到地面/art_source/textures_export/runtime_replace
```

报告输出目录：

```text
E:/game/回到地面/art_source/textures_review
```

关键方案文档：

```text
E:/game/回到地面/docs/runtime_replace补齐与整体替换方案.md
```

## 4. API 使用方式

使用 Agnes HTTP API：

```text
POST https://apihub.agnes-ai.com/v1/images/generations
model = agnes-image-2.1-flash
size = 1024x1024
n = 1
```

脚本不会把 API Key 写进代码。

执行前必须在当前 PowerShell 会话里设置环境变量：

```powershell
$env:AGNES_API_KEY="填写用户提供的 Agnes API Key"
```

不要把 API Key 写入：

- Python 脚本
- Markdown 文档
- CSV
- Git commit

## 5. 脚本能力

脚本支持：

```powershell
python E:\game\tools\gen_missing_179.py
python E:\game\tools\gen_missing_179.py --batch=p0
python E:\game\tools\gen_missing_179.py --batch=p1
python E:\game\tools\gen_missing_179.py --category=effects
python E:\game\tools\gen_missing_179.py --test=5
python E:\game\tools\gen_missing_179.py --overwrite
python E:\game\tools\gen_missing_179.py --full-rebuild-179
python E:\game\tools\gen_missing_179.py contact p0
python E:\game\tools\gen_missing_179.py --include-rework-effects --category=effects --overwrite
```

参数说明：

| 参数 | 作用 |
|---|---|
| `--batch=p0` | 只生成 UI/icons/effects/tiles |
| `--batch=p1` | 只生成 monsters/bosses |
| `--category=effects` | 只生成指定分类 |
| `--test=N` | 只跑前 N 张，用于试样 |
| `--overwrite` | 覆盖已存在同路径 PNG |
| `--full-rebuild-179` | 本轮专用：只读取 179 张 production spec，并自动覆盖重做所有已有 PNG |
| `contact p0` | 只生成 P0 contact sheet |
| `--include-rework-effects` | 把 5 张已知不合格 combat effects 加入生成列表 |

## 6. 推荐执行顺序

### 6.1 先确认脚本语法

```powershell
python -m py_compile E:\game\tools\gen_missing_179.py
```

### 6.2 设置 API Key

```powershell
$env:AGNES_API_KEY="填写用户提供的 Agnes API Key"
```

### 6.3 先导出 179 张 Prompt 审查表

```powershell
python E:\game\tools\export_runtime_replace_prompts.py
```

必须确认：

```text
rows: 179
pending_or_rework: 179
blocking_prompt_issues: 0
```

如果不是这个结果，先停下，不要调用 Agnes。

### 6.4 先试 179 全量重做的小样张

不要直接跑完整 179。先执行：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --test=5
```

这 5 张会按 CSV 排序从 179 清单中取样，并覆盖已有同名 PNG。看输出：


```text
gen_batch_all_report.csv
validate_batch_all.csv
contact_all.png
```

重点验收：

- 是否是明亮卡通像素风，不是暗黑风。
- 是否没有英文、数字、伪文字、水印。
- 是否没有骷髅、血、真实器官、恐怖徽章。
- 是否尺寸正确、透明 alpha 正确。
- 是否没有棋盘格/灰背景。
- 是否符合对应资源语义，不是头像/emoji/整页 UI mockup。
- effects 文件体积是否在三档策略内：`<=80KB` 正常，`80-96KB` size_warning 可人工验收，`>96KB` failed_size 需重做

### 6.5 小样张通过后，覆盖重做全部 179 张

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179
```

注意：

- `--full-rebuild-179` 会自动开启 overwrite。
- 只处理 `runtime_replace_missing_production_spec.csv` 的 179 张。
- 不会把额外 5 张 known-bad combat effects 混进来。
- 生成完成后必须看 `contact_all.png`。

### 6.6 179 张通过后，再单独处理 5 张 known-bad combat effects

本轮 179 不包含以下 5 张，但建议后续重做：

```powershell
python E:\game\tools\gen_missing_179.py --include-rework-effects --category=effects --overwrite
```

这会把 5 张 known-bad combat effects 加进任务。

### 6.7 可选：按分类分批全量覆盖

如果 Agnes 调用量或人工验收压力太大，可以按分类分批，但仍然必须覆盖重做：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=effects
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=icons
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=tiles
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=ui
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p1 --category=monsters
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p1 --category=bosses
```

下面是分类验收重点。

icons 验收重点：

- 无文字
- 无英文字母
- 小尺寸可读
- 透明背景正确
- 不要 UI 截图感

tiles 验收重点：

- 32x32
- 可平铺
- 不要预览网格
- 不要文字
- 区域材质正确

UI 验收重点：

- 横屏手游 HUD 风格
- 不含文字/数字
- 小件清楚
- 面板/槽位成套
- 不要截图/整页 UI mockup

P1 验收重点：

- monsters：128x128，透明背景，单个怪物，不要场景
- bosses：256x256 或 256x1024，透明背景，同 Boss 设计一致

## 7. 重要注意事项

### 7.1 本轮不要使用旧的“跳过已存在”流程

不要执行：

```powershell
python E:\game\tools\gen_missing_179.py
```

原因：

- 这个旧默认模式会跳过已存在 PNG。
- 本轮要求 179 张全部按新卡通像素风重做。

### 7.2 本轮必须覆盖 179 张

本轮不要手动判断哪些旧图保留。统一使用：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179
```

该命令自动覆盖已有 PNG。

### 7.4 contact sheet 必须人工看

脚本只能检查：

- 路径
- 尺寸
- PNG mode
- alpha 是否全不透明
- 文件大小是否超过 2x 预算

脚本不能可靠判断：

- 是否有 AI 伪文字
- 是否风格统一
- 是否图标含义正确
- 是否怪物/Boss 设计合理
- 是否 sprite sheet 动作连贯

所以每批必须看：

```text
E:/game/回到地面/art_source/textures_review/contact_<batch>.png
```

## 8. 当前 effects 试样结论

最近一次 effects 三张样张：

```text
effects/combat/fx_dodge.png
effects/reactions/fx_reaction_burn.png
effects/reactions/fx_reaction_conduct.png
```

技术结果：

```text
尺寸正确
alpha 正确
体积在 2x 预算内
```

视觉结果：

```text
已明显好于上一轮调试点线版本
burn 是橙红火焰
conduct 已改成蓝白/黄电弧方向
dodge 是青蓝残影方向
```

仍需人工最终确认。

## 8.1 effects 体积策略

effects 不再使用原来的 `target_size_kb * 2 = 80KB` 作为硬失败线。

当前策略：

| 档位 | 含义 | 处理 |
|---|---|---|
| `<=80KB` | 正常 | 可进入人工验收 |
| `80-96KB` | `size_warning` | 不判失败，但必须人工看 contact sheet |
| `>96KB` | `failed_size` | 不落盘或需要重做/强压缩 |

需要按新策略重跑的 effects：

```text
effects/combat/fx_dodge.png
effects/reactions/fx_reaction_conduct.png
effects/reactions/fx_reaction_decay.png
effects/reactions/fx_reaction_overload.png
effects/relics/fx_relic_blink_stone.png
effects/relics/fx_relic_gravity_stone.png
```

这些之前多在 80-90KB，按新策略可以作为 `size_warning` 落盘。

`effects/relics/fx_relic_flame_ring.png` 曾到 104KB，超过 96KB hard limit，应单独重做或继续强压缩。

## 8.2 覆盖生成的安全规则

脚本已改为临时文件生成策略：

```text
先写入 <目标文件>.tmp.png
通过尺寸/alpha/体积门禁后
再 os.replace 到正式路径
```

这意味着：

- `--overwrite` 不会先删除旧文件。
- 如果新生成失败，旧文件会保留。
- 如果新生成超过 hard limit，正式文件不会被删除。
- 只有通过门禁的文件才会替换正式 PNG。

历史问题：

```text
effects/relics/fx_relic_time_hourglass.png
```

曾因旧脚本 `--overwrite` 后 failed_size 被删除。当前磁盘上如果缺失，需要单独重生成：

```powershell
python E:\game\tools\gen_missing_179.py --only=effects/relics/fx_relic_time_hourglass.png --overwrite
```

按新规则，如果生成结果在 80-96KB，会作为 `size_warning` 落盘；如果仍超过 96KB，会失败但不会删除已有正式文件。

## 9. 输出报告说明

每次生成会输出：

```text
E:/game/回到地面/art_source/textures_review/gen_batch_<batch>_report.csv
E:/game/回到地面/art_source/textures_review/validate_batch_<batch>.csv
E:/game/回到地面/art_source/textures_review/contact_<batch>.png
```

`gen_batch_<batch>_report.csv` 字段：

| 字段 | 含义 |
|---|---|
| path | 资源路径 |
| status | generated/skipped/failed/failed_size |
| actual_size_kb | 实际大小 |
| mode | PNG mode |
| error | 失败原因 |

`validate_batch_<batch>.csv`：

- 只有 header 表示无错误。
- 有行表示需要修复。

常见错误：

| 错误 | 处理 |
|---|---|
| `missing` | 重新生成该路径 |
| `size` | 目标尺寸不对，检查 spec |
| `mode` | 不是 RGB/RGBA，重做或转格式 |
| `alpha_opaque` | 透明失败，重做 |
| `failed_size` | 体积过大，降低颜色/简化提示词 |

## 10. 最终完成标准

全部生成后必须满足：

```text
runtime_replace PNG 数 = 418
CSV path missing = 0
CSV path extra = 0
P 模式 = 0
has_alpha=True 的资源不能 alpha 全 255
contact sheet 人工验收通过
```

然后再进入整体替换流程。

整体替换流程参考：

```text
E:/game/回到地面/docs/runtime_replace补齐与整体替换方案.md
```

## 10.1 最终技术门禁脚本

全部资源生成完后，必须先执行：

```powershell
python E:\game\tools\validate_runtime_replace_ready.py
```

这个脚本只读，不会改资源。它会检查：

- `runtime_replace` PNG 路径集合是否等于 `textures_audit_manifest.csv`
- 是否还有缺失 PNG
- 是否有 CSV 外多余 PNG
- 是否混入 `.meta`、`.gitkeep`、临时文件等非 PNG
- PNG 是否 P 模式
- 尺寸是否等于生产规格/CSV 目标尺寸
- `has_alpha=True` 的资源是否 alpha 全不透明
- 是否超过 `target_size_kb * 2` 的粗略体积上限
- 是否生成分类 contact sheet

输出目录：

```text
E:/game/回到地面/art_source/runtime_replace_final_check
```

关键输出：

```text
runtime_replace_final_summary.json
runtime_replace_final_detail.csv
runtime_replace_final_issues.csv
contact_effects.png
contact_icons.png
contact_tiles.png
contact_ui.png
contact_monsters.png
contact_bosses.png
```

必须看到：

```text
[PASS] runtime_replace is technically ready.
```

如果看到 `[FAIL]`，不能替换 `assets/resources/textures`。

## 10.2 人工肉眼验收标准

技术门禁通过后，还必须逐个打开 contact sheet 肉眼看。

不能只看脚本结果。

### effects

必须满足：

- 是透明背景特效，不是带背景的截图。
- 没有棋盘格、灰底、绿底、品红底残留。
- 竖排 sprite sheet 帧数正确。
- 每帧中心位置稳定。
- burn 是橙红火焰，不是绿色。
- conduct 是蓝白/黄电弧，不是绿色调试点。
- heal 可以是绿/金，但不能被抠掉主体。
- shield 是蓝白护盾感。
- hit/crit 有冲击感。

### icons

必须满足：

- 小尺寸可读。
- 不含英文字母、数字、水印、伪文字。
- 主体居中，不贴边。
- 同类图标风格一致。

### tiles

必须满足：

- 32x32。
- 可平铺。
- 没有预览网格。
- 区域材质正确。
- 不含文字。

### ui

必须满足：

- 横屏手游 HUD 风格。
- 不含文字/数字。
- 按钮、槽位、面板风格统一。
- 不能是整页 UI 截图。
- 透明背景正确。

### monsters

必须满足：

- 128x128。
- 单个怪物。
- 透明背景。
- 同区域风格一致。
- 不要场景、地面、道具、文字。
- 轮廓清楚，小尺寸能看懂。

### bosses

必须满足：

- 单帧 256x256。
- 序列帧按 256x256 每帧竖排。
- 同 Boss 的 death/phasechange 必须延续 idle/attack/skill 的设计。
- 透明背景。
- 不要场景、地面、UI。

## 10.3 最终替换脚本

只有在以下条件全部满足后，才能替换：

1. `validate_runtime_replace_ready.py` 通过。
2. 所有 contact sheet 人工验收通过。
3. Cocos Creator 已关闭。
4. 用户确认可以替换。

先 dry-run：

```powershell
python E:\game\tools\replace_textures_from_runtime_replace.py
```

dry-run 会再次检查：

- missing
- extra
- non_png

确认没有问题后，再执行：

```powershell
python E:\game\tools\replace_textures_from_runtime_replace.py --apply
```

脚本会：

1. 备份当前 `assets/resources/textures`
2. 删除旧 `assets/resources/textures`
3. 只复制 `runtime_replace` 里的 PNG 到新 `assets/resources/textures`
4. 不复制 `.meta`

替换后必须：

1. 打开 Cocos Creator。
2. 等待 Cocos 自动导入并生成 `.png.meta`。
3. 关闭 Cocos。
4. 先执行替换后逐文件校验：

```powershell
python E:\game\tools\verify_textures_after_replace.py
```

该脚本会检查：

- `assets/resources/textures` PNG 路径是否等于 manifest
- `assets/resources/textures` 每张 PNG 是否与 `runtime_replace` hash 完全一致
- 每张 PNG 是否生成 `.png.meta`
- 尺寸是否正确
- mode 是否 RGB/RGBA，不能是 P 模式
- 需要透明的资源是否 alpha 全不透明
- 文件大小是否明显超预算

必须看到：

```text
[PASS] textures replacement matches runtime_replace and technical resource checks.
```

5. 再执行项目资源门禁：

```powershell
python E:\game\tools\art_resource_gate.py
```

最终要求：

```text
Missing files: 0
extra files: 0
P-mode: 0
missing meta: 0
```

## 10.4 严禁操作

不要：

- 在 `runtime_replace` 未通过门禁时替换 `textures`
- 把 `.meta` 从 `runtime_replace` 复制到 `textures`
- 手动改 CSV 路径来迁就错误文件
- 把草稿、raw、rejected 文件放进 `runtime_replace`
- 在 Cocos Creator 打开时删除 `assets/resources/textures`
- 在未看 contact sheet 的情况下直接认为资源可用
- 把 Agnes API Key 写进代码或提交到 Git

## 11. 给下一个对话的简短任务说明

请继续执行：

1. 不要修改当前已保留的 239 张资源。
2. 使用 `E:/game/tools/gen_missing_179.py`。
3. 设置 `AGNES_API_KEY` 环境变量。
4. 先按分类小批量试样。
5. 优先完成 effects，并重做 5 张 known-bad combat effects。
6. 每批生成后查看 contact sheet。
7. 只有人工验收通过后才继续下一批。
8. 全部生成后执行 `validate_runtime_replace_ready.py`。
9. 技术门禁和人工验收都通过后，先 dry-run 再 `--apply` 执行 `replace_textures_from_runtime_replace.py`。
10. 替换后打开 Cocos 生成 meta，再执行 `verify_textures_after_replace.py`。
11. 最后执行 `art_resource_gate.py`，确认项目级资源门禁通过。
## 12. 最新生成防踩坑规则

本节是 2026-06-27 补充的执行规则，用来避免后续生成还在同一类问题上反复修改。

### 12.1 分类后处理策略

`gen_missing_179.py` 已按资源分类内置不同后处理，不要再临时改提示词绕过脚本规则。

| 分类 | 生成背景 | 后处理 | 是否强制透明 |
|---|---|---|---|
| effects | 纯黑背景 | 亮度转 alpha | 是 |
| icons | 纯品红 `#ff00ff` 背景 | 边缘连通背景抠除 | 是 |
| ui | 纯品红 `#ff00ff` 背景 | 边缘连通背景抠除 | 是 |
| monsters | 纯品红 `#ff00ff` 背景 | 边缘连通背景抠除 | 是 |
| bosses | 纯品红 `#ff00ff` 背景 | 边缘连通背景抠除 | 是 |
| tiles | 正常完整地块 | 不抠除背景 | 否 |

原因：
- effects 的发光边缘不适合绿幕/品红幕，容易产生彩色残留，所以继续使用黑底亮度转 alpha。
- icons/ui/monsters/bosses 不能只要求“transparent background”，Agnes 可能仍输出实底图；现在统一要求纯品红背景，再由脚本只抠除与图片边缘连通的背景区域。
- tiles 是 32x32 地块，通常应为完整不透明 tile；即使 CSV 里 `has_alpha=True`，最终门禁也不再把 tiles 的全不透明当错误。

### 12.2 透明度门禁

脚本和最终校验脚本现在使用同一套透明度规则：

```text
effects  : 必须不是 alpha 全 255
icons    : 必须不是 alpha 全 255，透明像素比例 >= 20%
ui       : 必须不是 alpha 全 255，透明像素比例 >= 2%
monsters : 必须不是 alpha 全 255，透明像素比例 >= 8%
bosses   : 必须不是 alpha 全 255，透明像素比例 >= 5%
tiles    : 不强制透明
```

如果 icons 再出现 `alpha_opaque`，不要改回黑底转 alpha；应保持品红背景策略，并检查 contact sheet 是否是整张图标贴到了边缘，导致边缘抠除没有空间。必要时只重试该图，提示词继续强调 `12 percent safe margin from image borders`。

### 12.2.1 全分类提示词精确化

`gen_missing_179.py` 不再使用泛化提示词。后续生成必须使用脚本内置的精确 prompt，不要手动改回类似 `monster sprite`、`relic icon`、`UI asset` 这种宽泛描述。

当前脚本已补充：
- icons：按文件名映射具体遗物道具，例如蓝色传送晶石、卷轴、火焰戒指、战斧、冰霜护符、金色沙漏遗物；强制禁止头像、人脸、emoji。
- monsters：30 个怪物按文件名映射具体敌人，例如 snowwolf=雪狼、penguinsoldier=企鹅士兵、fireelemental=火元素、lavaspider=熔岩蜘蛛。
- bosses：按 Boss 名映射具体设计，例如 forestguardian=树皮守护者、firelord=熔岩火焰领主、frostqueen=冰霜女王、abyssoverlord=深渊霸主。
- tiles：按区域和 tile 类型生成，例如 floor/wall/highground/thorn，并明确必须是 32x32 正交俯视可平铺地块，不是图标、不是边框。
- ui：按文件名映射用途，例如 hpbar_fill=血条填充、equip_slot_weapon=武器装备槽、map_node_current=当前地图节点、shop_slot=商店槽位。
- effects：按最终尺寸推导竖排帧数，192x768=4 帧，192x576=3 帧；Boss 256x1024=4 帧，不再使用旧 CSV 小帧高推导。

如果后续某类资源再次出现“技术通过但内容不对”，优先补充对应文件名的 subject 映射，而不是只放宽技术门禁。

严格规则：危险词不能出现在正向 prompt 中，即使是 `no skull`、`no blood` 这种否定句也不允许放在正向段。危险词只能出现在 `APPROVAL-SAFE` 或 `Negative prompt` 段。当前审计会把正向段里的 `death / skeleton / bone / skull / heart / blood / organs / corpse / horror` 等词判为 `prompt_rework_required`。

### 12.2.1.1 风格一致性：安全合规不等于暗黑风

本项目既要通过微信小游戏审核，也要保持之前已生成资源的“卡通像素风”。后续所有补齐、重做资源必须统一走下面的风格锚点：

```text
bright colorful cartoon pixel art
playful mobile game adventure look
clean chunky pixels
rounded friendly shapes
saturated colors
soft highlights
readable silhouettes
consistent with existing cute cartoon pixel assets
```

不要再把安全合规资源做成暗黑徽章、暗黑地牢、重金属、恐怖结算页或低饱和写实暗色风格。之前出现“补齐资源变暗黑风”的根因是 prompt 中混入了 `dark dungeon`、`dark metal`、`dark fantasy`、`scary badge` 一类词，AI 会把它理解成暗黑 RPG 美术，而不是项目现有的卡通像素风。

当前 `gen_missing_179.py` 已做以下修正：
- 全局 prompt 会追加 `STYLE_ANCHOR`，所有分类都会继承“明亮卡通像素风”。
- 全局 prompt 会追加分类 `DETAIL_ANCHORS`，确保每类资源都有清晰构图、尺寸可读性、边距、透明背景和用途描述。
- Boss / monsters 从 `dark dungeon style` 改为 `bright cartoon fantasy adventure style`。
- UI 从 `dark dungeon HUD style` 改为 `bright cartoon adventure HUD style`。
- buttons / panels / equipment slots 使用蓝灰、紫晶、金边、软高光，不再使用暗黑金属和恐怖徽章语言。
- icons 使用卡通道具图标语言，不再生成头像、emoji、徽章文字或暗黑头像章。
- tiles 仍保留区域材质差异，但用“卡通冒险地块”表达，不再用暗黑地牢地块表达。

179 张每张 prompt 的结构必须是：

```text
1. 具体 subject：从文件名映射具体内容，例如火焰戒指、蓝色传送晶石、森林树人、火山熔岩怪。
2. 分类构图约束：Boss 全身、怪物单体、effects 竖排帧、icons 单个道具、tiles 可平铺、UI 单个可复用控件。
3. STYLE_ANCHOR：明亮卡通像素风、圆润、饱和、手游冒险感。
4. DETAIL_ANCHOR：该分类的细节要求，例如粗描边、透明边距、小尺寸可读、空内容区。
5. CRITICAL no text：禁止任何文字、水印、签名。
6. APPROVAL-SAFE / Negative prompt：微信小游戏安全兜底和暗黑风排除词。
```

执行人如果发现 contact sheet 中出现整体偏黑、哥特徽章、恐怖 UI、低饱和写实 RPG 风格，即使尺寸、透明度、体积都通过，也必须判为 `visual_style_rework_required`，不能进入最终替换。

### 12.2.2 逐资源 Prompt 审查文件

为保证剩余每张资源的生成提示词都准确，已新增只读导出脚本：

```powershell
python E:\game\tools\export_runtime_replace_prompts.py
```

该脚本会读取 `runtime_replace_missing_production_spec.csv`，调用 `gen_missing_179.py` 的真实 `build_prompt()`，导出：

```text
E:\game\回到地面\art_source\runtime_replace_recovery\runtime_replace_prompt_review.csv
E:\game\回到地面\art_source\runtime_replace_recovery\runtime_replace_prompt_review.md
```

当前审查结果：

```text
prompt review 总数: 179
full_rebuild_required: 179
阻塞性 prompt 问题: 0
```

执行 Agnes 生成前，必须先看 `runtime_replace_prompt_review.md`。如果 `blocking_prompt_issue` 不为空，不能生成，必须先补 `gen_missing_179.py` 里的 subject 映射。

### 12.2.3 微信小游戏视觉安全重做

以下资源虽然技术上存在，但内容含有血腥/恐怖/伪文字风险，不能直接进入最终替换：

```text
ui/upgrade/icon_upgrade_berserkerpact.png
ui/upgrade/icon_ability_lifestealaura.png
ui/death/*
ui/equipment/*
ui/common/btn_default.png
ui/common/btn_hover.png
ui/common/btn_active.png
ui/map/icon_room_boss.png
ui/splash/splash_bg.png
ui/hud/hud_cdmask.png
ui/hud/hud_rollbtn.png
ui/hud/hud_skillslot.png
icons/skills/icon_skill_dash.png
icons/skills/icon_skill_elementburst.png
icons/skills/icon_skill_healwave.png
icons/sets/icon_set_frostbite.png
icons/sets/icon_set_fury.png
icons/sets/icon_set_ironwall.png
icons/sets/icon_set_tempest.png
icons/buffs/icon_debuff_slow.png
```

问题类型：
- 骷髅、血溅、恐怖徽章。
- 心脏被箭刺穿、滴血。
- AI 伪文字。
- 装备槽/装备面板中出现骷髅头、恐怖徽章或危险符号。
- 技能/套装/状态图标出现英文标签、伪文字或头像徽章。
- splash / HUD / common button 出现英文标题、伪文字、骷髅纹样。

处理原则：
- 用非写实、非血腥、符号化的能量、徽章、护符、晶石表达。
- 禁止血、伤口、器官、真实心脏、骷髅、尸体、断肢、恐怖脸。
- 禁止任何文字、伪文字、字母和数字。

脚本已加入 `--include-safety-rework`，只重做这类安全问题资源：

```powershell
python E:\game\tools\gen_missing_179.py --include-safety-rework --only=ui/upgrade/icon_upgrade_berserkerpact.png --overwrite
python E:\game\tools\gen_missing_179.py --include-safety-rework --only=ui/upgrade/icon_ability_lifestealaura.png --overwrite
```

也可以两张一起重做：

```powershell
python E:\game\tools\gen_missing_179.py --include-safety-rework --category=ui --overwrite
```

现在 `--include-safety-rework --category=ui --overwrite` 会覆盖重做所有安全队列 UI，包括 `ui/death/*`、`ui/equipment/*`、common 按钮、HUD 控件、splash、map boss 和已知有问题的 upgrade 图标。技能/套装/状态图标属于 `icons` 分类，需要另外跑：

```powershell
python E:\game\tools\gen_missing_179.py --include-safety-rework --category=icons --overwrite
```

重做后必须看 contact sheet 和单图，确认没有血、骷髅、真实器官、刺穿、伪文字、英文标签。

`icon_upgrade_berserkerpact.png` 特别注意：不要在正向 prompt 中使用 `warrior`、`pact`、`axe`、`skull`、`bone` 等词。当前脚本已改为“红橙能量水晶 + 金色绶带 + 火焰能量光环”的非角色、非武器、非恐怖方向。如果重试后仍出现骷髅，继续判 rejected，不要进入最终替换。

### 12.2.4 全量视觉安全审计

视觉安全不是只检查单张图。已新增全量审计脚本，覆盖完整 `textures_audit_manifest.csv` 的 418 个资源，同时检查：

- 已生成 PNG：是否属于已知不合规、是否命中高风险文件名、是否有明显暗红色启发式风险。
- 未生成资源：真实 Agnes prompt 的正向描述是否含血、血腥、器官、真实心脏、刺穿、骷髅等风险词。
- 生成报告和人工复核 contact sheet。

执行：

```powershell
python E:\game\tools\visual_safety_audit.py
```

输出：

```text
E:\game\回到地面\art_source\visual_safety_audit\visual_safety_summary.json
E:\game\回到地面\art_source\visual_safety_audit\visual_safety_detail.csv
E:\game\回到地面\art_source\visual_safety_audit\visual_safety_issues.csv
E:\game\回到地面\art_source\visual_safety_audit\visual_safety_review_contact.png
```

当前审计结果：

```text
total: 418
generated_png: 327
known_reject: 25
prompt_rework: 0
manual_review: 71
```

解释：
- `reject_rework_required`：阻塞项，必须重做，不能进入最终替换。
- `prompt_rework_required`：阻塞项，说明未生成资源的 prompt 正向描述仍有不合规风险，必须先改 prompt。
- `manual_review`：人工复核项，不代表一定违规。比如火山背景红色比例高、death 动作、skeleton 题材都会进入复核。

最终替换前必须满足：

```text
known_reject = 0
prompt_rework = 0
manual_review 已人工确认可接受
```

### 12.3 179 张全量重做推荐执行顺序

本轮不是“补剩余”，而是 179 张全部按新卡通像素风覆盖重做。推荐顺序：

```powershell
python E:\game\tools\export_runtime_replace_prompts.py
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --test=5
python E:\game\tools\gen_missing_179.py contact all
```

确认 `contact_all.png` 小样风格正确后，执行全量：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179
python E:\game\tools\gen_missing_179.py contact all
```

如果要按分类降低风险，必须仍然带 `--full-rebuild-179`：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=effects
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=icons
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=tiles
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=ui
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p1 --category=monsters
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p1 --category=bosses
```

本轮 179 未完成前，不要使用不带 `--full-rebuild-179` 的旧命令。

需要重做单张时，用：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --only=相对路径/文件名.png
```

### 12.4 每类肉眼验收重点

icons：
- 没有英文、数字、水印、AI 伪文字。
- 图标主体居中，四周透明，不是深色方块底。
- 小尺寸下语义清楚，不像 UI 截图。
- 必须是 RPG 道具/装备/遗物图标，不允许是人脸、头像、emoji、表情、角色头部。
- 当前脚本已按文件名映射具体道具形态，例如 blinkstone=蓝色传送晶石、decoyscroll=卷轴、flamering=火焰戒指、frenzyaxe=战斧、frostamulet=冰霜护符、timehourglass=金色沙漏遗物。
- 如果 contact sheet 出现人脸/表情类内容，即使技术门禁通过，也必须判定 rejected 并用 `--category=icons --overwrite` 重跑。

icons 本轮 16 张全部重做：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=icons
python E:\game\tools\gen_missing_179.py contact p0
```

ui：
- 单个 UI 资产，不是整页 mockup。
- 无文字、无数字。
- 边缘透明，按钮/面板/槽位形状完整。
- 横屏手游 HUD 风格，不生成竖屏整页界面。

tiles：
- 32x32。
- 能平铺，边缘不要明显接缝。
- 不要预览网格、边框、文字。
- 允许全不透明。

monsters：
- 128x128。
- 单个怪物，透明背景。
- 不要地面、场景、图标框、道具。
- 同区域风格一致，轮廓清楚。

bosses：
- 单帧 256x256，序列帧按 256x256 每帧竖排。
- death/phasechange 必须延续同 Boss 设计。
- 每帧居中，透明背景，不要场景/地面/UI。

effects：
- 192x768 竖排 sprite sheet。
- 只要抽象特效，不要道具、柱子、沙漏、卡片、容器。
- `fx_relic_time_hourglass.png` 必须是时间扭曲光环/沙粒特效，不要沙漏物体。
- effects 体积策略仍是 `<=80KB` 正常，`80-96KB` 可人工接受，`>96KB` 必须重做或强压缩。

### 12.4.1 UI 体积处理策略

UI 的旧预算对按钮、装备槽、面板过紧，不能再简单用 `target_size_kb * 2` 作为硬失败线。当前脚本已加入 UI 专用策略：

```text
warning: target_size_kb * 2
hard:
  普通 UI 至少 24KB
  按钮/槽位/rarity frame 至少 20KB
  大面板/背景/body_frame 至少 120KB
  同时保留 target_size_kb * 4 的上限口径
```

处理含义：
- `<= warning`：正常通过。
- `warning < size <= hard`：`size_warning`，允许落盘，但必须人工看 contact sheet。
- `> hard`：`failed_size`，需要重做或继续压缩。

当前 UI failed_size 集中在按钮、死亡按钮、装备槽和 `equip_body_frame`。按新策略，它们会先走 UI 调色板压缩；如果仍超过 warning 但低于 hard，会作为 `size_warning` 保留，不再反复失败。

本轮 UI 推荐执行：

```powershell
python E:\game\tools\gen_missing_179.py --full-rebuild-179 --batch=p0 --category=ui
```

不要为了这批 UI 手动调小尺寸。重跑时仍然使用 `--full-rebuild-179`，保证旧暗黑风或旧语义错误文件不会被保留。

### 12.5 最终替换前必须跑的门禁

全部资源补齐后，先跑：

```powershell
python -m py_compile E:\game\tools\gen_missing_179.py E:\game\tools\visual_safety_audit.py E:\game\tools\validate_runtime_replace_ready.py E:\game\tools\replace_textures_from_runtime_replace.py E:\game\tools\verify_textures_after_replace.py
python E:\game\tools\visual_safety_audit.py
python E:\game\tools\validate_runtime_replace_ready.py
```

只有 `visual_safety_audit.py` 无阻塞项、`validate_runtime_replace_ready.py` 无 issues，且 contact sheet 人工验收通过，才允许执行：

```powershell
python E:\game\tools\replace_textures_from_runtime_replace.py
python E:\game\tools\replace_textures_from_runtime_replace.py --apply
```

替换后必须打开 Cocos Creator 等待 `.png.meta` 自动生成，再执行：

```powershell
python E:\game\tools\verify_textures_after_replace.py
python E:\game\tools\art_resource_gate.py
```

最终要求：

```text
missing = 0
extra = 0
non_png = 0
P-mode = 0
missing meta = 0
hash mismatch = 0
```
