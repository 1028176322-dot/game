# AI美术资源高清替换方案

适用目录：`E:/game/回到地面/assets/resources/textures`

本文目标不是只修某一张图，而是给整个 `textures` 目录建立可长期执行的高清替换规范：现有资源如何盘点、哪些优先替换、AI 应该生成多大、替换文件怎么放、如何不破坏 Cocos Creator 引用、导入设置怎么调、替换后怎么验收。

## 0. 微信小游戏专项约束

这个项目是微信小游戏，资源方案不能简单理解成“所有图都越小越好”。真正要控制的是首包、首屏加载、分包加载和运行内存。

建议目标：

```text
首包：只放启动、loading、主界面最低必需资源，目标 < 4MB
分包：按区域、Boss、活动、高清资源拆分，总量预算 <= 30MB
resources：只放运行时真正会加载的资源
art_source：放 AI 母版、PSD、Aseprite、1024 原图、备份图，不进入构建
```

参考依据：Cocos Creator 3.8 微信小游戏分包文档说明，微信小游戏主包大小不能超过 4M，所有分包总大小不超过 30M；构建时可将 Asset Bundle 配置为小游戏分包，启动时只下载必要主包，后续由开发者手动加载分包。

关键原则：

- 不要为了首包把正式角色压成 48px。角色、怪物、Boss 应进分包或按需加载。
- AI 生成的 1024/2048 母版不能直接放到 `assets/resources/textures`。
- `*.bak.*`、`*_raw.png`、对比图、未压缩导出图都要移出 `resources`。
- 首屏只需要启动页和主界面必要资源，不需要预置全部区域怪物、Boss 和特效。
- 微信小游戏真机验收必须看两个指标：首包/分包体积，以及高 DPR 手机上最终显示是否清晰。

微信小游戏下的资源分层建议：

| 层级 | 放什么 | 清晰度策略 |
|---|---|---|
| 首包 | splash、loading、主界面 low 档、必要字体 | 优先小体积，背景可低清 |
| 基础分包 | HUD、首个角色、首个区域怪物、通用特效 | 默认 mid 档 |
| 区域分包 | forest/catacombs/volcano/tundra/swamp/abyss | 进入区域前加载 |
| Boss 分包 | Boss 动作、大招、专属背景 | high 档允许，但用前加载 |
| 非运行时素材 | AI 母版、raw、PSD、Aseprite、备份 | 不参与构建 |

AI 出图也要分两步：

```text
AI 母版：512/1024/2048，用于清晰和二次加工，不进包
运行时导出：128/192/256/512，按显示尺寸和分包预算进包
```

## 1. 当前资源盘点结论

本次扫描范围为 `assets/resources/textures` 下的 PNG 资源，现有运行时资源约 419 张 PNG，另有对应 `.meta` 文件。

| 目录 | 数量 | 当前尺寸概况 | 当前问题 | 处理优先级 |
|---|---:|---|---|---|
| `characters` | 35 | 宽度固定 48px，高度 128-384px，多为竖向序列帧条 | 战斗角色在手机上放大后必糊 | P0 |
| `monsters` | 36 | 多数 48x48 或 64x64 | 怪物上屏尺寸稍大就糊 | P0 |
| `bosses` | 120 | 小 Boss 多数 64x64，最终 Boss 多为 64/96px 宽的序列帧条 | Boss 是视觉重点，但源图偏小 | P0 |
| `effects` | 27 | 32-80px 宽，128-480px 高 | 特效放大后颗粒感明显 | P1 |
| `icons` | 67 | 多数 48x48 或 64x64 | 背包、技能、元素图标可接受但不够高清 | P1 |
| `tiles` | 24 | 32x32 | 如果是像素风可保留；非像素风则偏小 | P2 |
| `backgrounds` | 17 | 750x500 | 横向场景背景可用，但竖屏 cover 时可能不够 | P1 |
| `ui` | 93 | 从 2px 线条到 1280x1334；`ui/upgrade` 有大量 1024x1024 图标 | 同时存在过小 UI 和过大图标，体积分布不均 | P1 |

重点结论：

- 角色、怪物、Boss 当前是最大清晰度风险，尤其 `characters` 的 48px 宽序列帧条。
- `ui/upgrade` 下大量 1024x1024 图标占用体积很高，但如果实际只显示 96-180px，运行时应降档导出 256/512，而不是直接上 1024。
- `.meta` 文件里目前大多是 `minfilter: linear`、`magfilter: linear`、`mipfilter: none`。如果项目实际是像素风，角色/怪物/tiles 应改为 Point/Nearest；如果是非像素风，则要提高源图尺寸，Linear 本身不是根因。

## 2. 是否需要全部替换

结论：**不需要，也不建议把当前约 416-419 个纹理资源全部无差别替换成高清图。**

本方案里“清单覆盖所有资源”的含义是：每个资源都要被盘点、标记用途、确认是否仍在使用，并给出处理动作；不是每张图都要重新 AI 生成、高清替换。微信小游戏尤其不能把所有图片都高清化后塞进 `resources` 或首包，否则会带来包体、加载、内存和真机性能问题。

正确目标是：

```text
全部资源都要审计
高价值资源优先替换
低价值资源按需保留
无用/备份/测试资源清理或移出构建目录
大资源结合分包和按需加载处理
```

### 2.1 资源处理分级

| 等级 | 资源类型 | 是否替换 | 处理建议 |
|---|---|---|---|
| S | 首屏核心图、主界面主视觉、玩家角色、Boss、常见怪物、核心战斗 HUD | 必须优先替换 | 第一批高清替换，保证手机高 DPR 下清晰 |
| A | 高频技能图标、装备图标、商店/背包/升级界面、常用特效 | 第二批替换 | 按显示尺寸导出 2x，必要时合图集 |
| B | 低频怪物、区域装饰、低频状态图标、非核心特效 | 按需替换 | 如果当前观感可接受，可暂缓 |
| C | 占位图、测试图、旧版本备份、raw 图、未使用资源、重复资源 | 不替换 | 删除或移到 `art_source`，不要进入 `assets/resources` |

### 2.2 每个资源都必须有处理动作

资源清单里不要只写“待替换”，而是要给每个资源一个明确动作：

| 动作 | 含义 | 示例 |
|---|---|---|
| `replace` | 同名高清替换 | 角色 idle、Boss attack、主界面背景 |
| `keep` | 保留现状 | 已经清晰、体积合理、低频但仍使用 |
| `merge_atlas` | 合并图集 | 小图标、按钮状态、同类 UI 零件 |
| `resize_export` | 从母版重新导出运行尺寸 | 当前 1024 图标只显示 96px |
| `move_source` | 移出运行目录 | AI 母版、raw、PSD、bak |
| `delete` | 删除 | 测试图、无引用占位图、重复废弃资源 |
| `defer` | 暂缓 | 低频资源，等包体和分包稳定后再处理 |

### 2.3 替换优先级判断标准

优先替换满足以下条件的资源：

1. 玩家每局都会看到。
2. 在手机上显示面积大。
3. 当前原图明显低于最终显示尺寸。
4. 会被缩放到 1.5x 以上。
5. 是付费、广告奖励、角色成长、Boss 战等关键体验的一部分。
6. 当前压缩或 PNG 模式导致 Cocos 显示异常。

可以暂缓的资源：

1. 很少出现的低频装饰。
2. 当前就是像素风且显示尺寸为整数倍放大。
3. 玩家几乎看不清细节的小图。
4. 后续可能废弃的占位资源。
5. 当前没有被场景、Prefab、代码引用的资源。

### 2.4 推荐审计清单字段

建议生成一份 CSV 或 Markdown 表格，覆盖 `assets/resources/textures` 下所有 PNG：

```text
path,category,width,height,size_kb,used_by,scene_or_ui,visible_size,priority,action,master_size,runtime_size,target_size_kb,status,note
```

示例：

```text
textures/characters/warrior/warrior_idle.png,characters,48,256,18,dungeon/player,战斗主角,96x512,S,replace,1024,192x1024,120,pending,4x同名替换
textures/ui/upgrade/icon_fireball.png,ui_icon,1024,1024,900,upgrade_ui,升级界面,96x96,A,resize_export,1024,256x256,80,pending,运行图过大
textures/test/foo.png,test,128,128,20,none,none,0,C,delete,,,0,pending,测试资源
textures/ui/main/main_bg_raw.png,source,1280,1334,1300,none,source,0,C,move_source,,,0,pending,raw源图移出resources
```

### 2.5 第一轮替换范围建议

第一轮不要追求“替完所有图”，而是完成以下目标：

```text
1. 清理 C 级资源，不让 raw/bak/test/source 进入 resources。
2. 替换 S 级资源：玩家角色、Boss、主界面主视觉、核心 HUD。
3. 处理明显过大的 A 级 UI 图标，从 1024 母版导出 256/512 运行图。
4. 对怪物、特效做样板替换，确认风格、尺寸、锚点、动画切帧都正确。
5. 建立自动审计脚本，后续每批替换都能检查尺寸、体积、PNG 模式和 SpriteFrame。
```

因此，最终执行结果可能是：

```text
约 416-419 个资源全部登记
第一批真正替换 50-120 个高价值资源
一批资源保留
一批资源合并图集或降档导出
一批 raw/bak/test/unused 资源移出或删除
剩余低频资源进入 defer 列表
```

这个比例要根据真实使用引用和真机观感决定，不要按数量硬性要求全部替换。

## 3. 总体替换原则

1. 运行时路径优先保持不变。

   现有路径例如：

   ```text
   assets/resources/textures/characters/warrior/warrior_idle.png
   assets/resources/textures/monsters/forest/monster_forest_wolf_idle.png
   assets/resources/textures/ui/splash/splash_bg.png
   ```

   第一轮替换不要改文件名、不要移动目录、不要删除 `.meta`。直接替换同名 `.png`，保留 `.meta` 中的 UUID，最大限度避免场景、Prefab、脚本引用断裂。

2. AI 不直接生成 48px/64px 正式资源。

   AI 生成低分辨率小图时会丢结构和边缘信息。正确流程是：

   ```text
   AI高清母版 -> 清理透明边缘 -> 统一动作/尺寸/锚点 -> 导出运行时尺寸 -> 无损或平台压缩 -> 同名替换
   ```

3. 文件大小通过“多档、分包、平台压缩、按需加载”解决，不通过把资源压糊解决。

4. 每个资源替换时必须保持语义兼容：

   - 同名文件。
   - 同动作名。
   - 同帧数。
   - 同帧排列方向。
   - 同透明边界策略。
   - 同锚点视觉位置。

5. 角色/怪物/Boss 如果从 48/64 提升到 192/256/384，需要同步确认动画切帧逻辑是否写死了 48/64。

## 4. 推荐文件结构

### 3.1 运行时资源目录保持现状

运行时目录继续使用：

```text
E:/game/回到地面/assets/resources/textures/
  backgrounds/
  bosses/
  characters/
  effects/
  icons/
  monsters/
  tiles/
  ui/
```

第一阶段不建议在 `resources/textures` 里直接新增 `low/mid/high` 三档目录，因为当前项目大概率已有大量直接资源路径或 UUID 引用。先做同名替换，稳定后再做多档加载。

### 3.2 新增源文件与替换工作区

建议在项目根目录新增这些非运行时目录，避免高清母版进入 `resources` 导致首包膨胀：

```text
E:/game/回到地面/art_source/textures_master/
  characters/
  monsters/
  bosses/
  icons/
  ui/
  backgrounds/
  effects/
  tiles/

E:/game/回到地面/art_source/textures_export/
  runtime_replace/
  runtime_low/
  runtime_mid/
  runtime_high/

E:/game/回到地面/art_source/textures_review/
  before_after/
  rejected/
  approved/
```

目录用途：

| 目录 | 用途 | 是否进 Cocos 构建 |
|---|---|---|
| `art_source/textures_master` | AI 母版、PSD、Aseprite、透明母图 | 否 |
| `art_source/textures_export/runtime_replace` | 准备同名替换到 `assets/resources/textures` 的 PNG | 否 |
| `art_source/textures_export/runtime_low` | 后续多档低清资源 | 否，除非接入动态加载 |
| `art_source/textures_export/runtime_mid` | 后续多档默认资源 | 否，除非接入动态加载 |
| `art_source/textures_export/runtime_high` | 后续多档高清资源 | 否，除非接入动态加载 |
| `art_source/textures_review` | 替换前后截图、验收记录 | 否 |

## 5. 资源规格标准

本项目按竖屏手机适配考虑，建议以 750x1334 为设计基准。资源规格不按“AI 文件大小限制”定，而按“最终最大显示尺寸”定。

通用公式：

```text
运行时资源宽度 >= 最大显示宽度 x 1.5 到 2
重要资源宽度 >= 最大显示宽度 x 2 到 3
```

如果资源是像素风：

```text
运行时资源宽度 = 最终显示宽度的整数约数
只允许 1x / 2x / 3x / 4x 整数倍缩放
Texture Filter 使用 Point/Nearest
```

如果资源是非像素风：

```text
运行时资源宽度建议至少为最终显示宽度的 2x
Texture Filter 可使用 Linear
透明角色不要使用有损压缩
```

### 4.1 characters

当前问题：角色序列帧条宽度为 48px，作为正式战斗角色过小。

建议规格：

| 当前类型 | 当前尺寸 | 第一阶段替换尺寸 | 长期高清尺寸 |
|---|---:|---:|---:|
| 普通角色单帧宽 | 48px | 192px | 256px |
| 重要角色单帧宽 | 48px | 256px | 384px |
| hit 动作条 | 48x128 | 192x512，等比 4x，保持原帧数 | 256x683 不建议，优先 4x 或重排为等尺寸帧 |
| idle/attack/death/dodge 动作条 | 48x256 | 192x1024，等比 4x，通常对应 4 帧 48x64 | 256 单帧需重新排版为规则 Sprite Sheet |
| walk/skill 动作条 | 48x384 | 192x1536，等比 4x，通常对应 6 帧 48x64 | 256 单帧需重新排版为规则 Sprite Sheet |

注意：

- 如果动画系统按“整图高度 / 单帧高度”推帧，等比放大到 4x 最安全。
- 如果代码写死单帧宽高为 48，则替换为 192 后必须同步改动画切帧配置。
- 如果 Cocos 中已经手工切了 SpriteFrame，需要检查 `.meta` 是否有 SpriteFrame 子资源；当前抽样 `.meta` 看起来主要是 texture，不是手工切帧。

推荐 AI 母版：

```text
单角色母版：1024x1024 或 2048x2048
动作帧母版：每帧 256x256 起
运行时第一阶段：每帧 192x192 或 256x256
```

### 4.2 monsters

当前问题：多数 48x48 或 64x64，适合缩略图，不适合战斗中放大展示。

建议规格：

| 怪物类型 | 当前尺寸 | 第一阶段替换尺寸 | 长期高清尺寸 |
|---|---:|---:|---:|
| 普通小怪 | 48x48 / 64x64 | 128x128 | 192x192 |
| 精英怪 | 64x64 | 192x192 | 256x256 |
| 飞行/大型怪 | 64x64 | 192x192 | 256-384px |

替换规则：

- 保持同名。
- 保持透明背景。
- 保持怪物脚底或中心视觉锚点一致，避免替换后碰撞位置和血条位置看起来偏移。

### 4.3 bosses

当前问题：Boss 是视觉重点，但当前小 Boss 多为 64x64，最终 Boss 序列帧条单帧宽约 64/96。

建议规格：

| Boss 类型 | 当前尺寸 | 第一阶段替换尺寸 | 长期高清尺寸 |
|---|---:|---:|---:|
| miniboss idle | 64x64 | 192x192 | 256x256 |
| finalboss 单帧 | 64/96px 宽 | 256px 宽 | 384-512px 宽 |
| finalboss 技能帧 | 64x384 等 | 等比 4x | 视战斗展示大小到 512px |

替换策略：

- 最终 Boss 优先替换 `idle`、`attack`、`skill`，再替换 `death`、`phasechange`。
- 同一 Boss 的所有动作必须统一单帧尺寸，否则动画切换时会跳。

### 4.4 icons

当前问题：`icons` 下多为 48/64px，作为小图标尚可，但在高 DPR 手机上偏软。

建议规格：

| 图标类型 | 当前尺寸 | 推荐运行时尺寸 |
|---|---:|---:|
| 元素图标 | 48/64 | 128x128 |
| 物品图标 | 48/64 | 128x128 或 256x256 |
| 技能图标 | 64 | 256x256 |
| 装备/遗物图标 | 64 | 256x256 |

不要把所有图标都做成 1024x1024 放进运行时。1024 更适合作为母版，不适合直接作为常规 UI 运行资源。

### 4.5 ui

当前问题分两类：

- 小 UI 件太小，例如按钮、线条、节点图标。
- `ui/upgrade` 大量 1024x1024 图标体积高，如果实际显示尺寸不大，运行时浪费明显。

建议：

| UI 类型 | 推荐运行时尺寸 |
|---|---:|
| 全屏竖屏背景 | 750x1334 低清，1500x2668 高清 |
| 横向战斗/房间背景 | 至少覆盖实际相机视口；当前 750x500 可作为低清 |
| 大按钮 | 256-512px 宽，九宫格优先 |
| 小按钮/关闭按钮 | 96-192px |
| 地图节点图标 | 96-128px |
| 升级卡牌图标 | 256x256 默认，512x512 高清 |
| 1024x1024 图标 | 保留母版，运行时导出 256/512 |

`ui/main/main_bg_raw.png` 这类 raw 文件不应长期放在 `resources` 运行时目录。如果它只是母版，应移到 `art_source/textures_master`，运行时只保留 `main_bg.png`。

### 4.6 backgrounds

当前背景多数 750x500，横向战斗背景可用，但竖屏 cover 或高清屏幕下可能不够。

建议：

| 背景类型 | 当前尺寸 | 推荐低清 | 推荐高清 |
|---|---:|---:|---:|
| 战斗背景 | 750x500 | 1000x667 | 1500x1000 |
| 事件/房间背景 | 750x500 | 1000x667 | 1500x1000 |
| 竖屏 UI 背景 | 1280x1334 或类似 | 750x1334 | 1500x2668 |

背景可以使用 WebP/JPG 或平台纹理压缩，但如果项目当前统一 PNG，第一阶段仍建议同名 PNG 替换，待构建压缩策略稳定后再改格式。

### 4.7 effects

建议：

| 特效类型 | 当前尺寸 | 推荐运行时尺寸 |
|---|---:|---:|
| hit/crit/dodge/heal | 32-80px 宽 | 128-256px |
| UI glow/loading | 64-128px | 256px |
| relic/reaction effect | 64-80px | 192-256px |

特效可以比角色更激进地压缩，但不要压到有明显色块。透明边缘要重点检查。

### 4.8 tiles

当前 `tiles` 多为 32x32。

如果项目是像素风：

- 可以保留 32x32。
- Texture Filter 改 Point/Nearest。
- 地图缩放使用整数倍。

如果项目不是像素风：

- 建议导出 64x64 或 128x128。
- 地形纹理不要用过强有损压缩。

## 6. 替换执行流程

### 5.1 替换前备份

替换前先完整备份当前目录：

```text
E:/game/回到地面/assets/resources/textures
-> E:/game/回到地面/art_source/textures_backup/textures_YYYYMMDD
```

备份内容必须包含 `.png` 和 `.meta`。

不要只备份 PNG。`.meta` 里有 UUID，是 Cocos 引用稳定的关键。

### 5.2 生成替换清单

建立清单文件：

```text
E:/game/回到地面/art_source/textures_replace_manifest.csv
```

建议字段：

```text
relativePath,category,currentWidth,currentHeight,targetWidth,targetHeight,frameCount,frameLayout,priority,status,notes
```

示例：

```text
characters/warrior/warrior_idle.png,characters,48,256,192,1024,8,vertical,P0,pending,4x等比替换
monsters/forest/monster_forest_wolf_idle.png,monsters,48,48,128,128,1,single,P0,pending,保持脚底锚点
ui/upgrade/icon_relic_frostamulet.png,ui,1024,1024,512,512,1,single,P1,pending,运行时降档
```

### 5.3 AI 生成与导出规则

AI 提示词或需求单必须包含：

- 资源用途：角色、怪物、Boss、UI、背景、图标、特效。
- 是否透明背景。
- 目标风格：像素风或非像素风。
- 视角：俯视、侧视、正面、45 度等。
- 动作名与帧数。
- 每帧目标尺寸。
- 是否需要保持原角色轮廓和配色。
- 禁止多余阴影、边框、背景、文字。

角色动作资源推荐导出方式：

```text
母版：每帧 512x512 或 1024x1024
运行时：每帧 192x192 或 256x256
序列帧条：保持现有纵向排列
透明边界：每帧统一画布大小
```

图标资源推荐导出方式：

```text
母版：1024x1024
运行时 mid：256x256
运行时 high：512x512
透明边缘：保留 6%-10% 安全边距
```

背景资源推荐导出方式：

```text
母版：至少 2048px 宽
运行时低清：1000px 或 750px 宽
运行时高清：1500px 或 2000px 宽
```

### 5.4 同名替换步骤

第一阶段采用同名替换，流程如下：

1. 在 `art_source/textures_export/runtime_replace` 下放置与运行时目录完全一致的相对路径。

   示例：

   ```text
   art_source/textures_export/runtime_replace/characters/warrior/warrior_idle.png
   art_source/textures_export/runtime_replace/ui/splash/splash_bg.png
   ```

2. 检查替换图尺寸是否符合清单。

3. 复制替换图覆盖：

   ```text
   assets/resources/textures/characters/warrior/warrior_idle.png
   ```

4. 不删除、不重建、不改名：

   ```text
   assets/resources/textures/characters/warrior/warrior_idle.png.meta
   ```

5. 打开 Cocos Creator，等待资源重新导入。

6. 检查 Console 是否有 UUID、SpriteFrame、Texture 导入错误。

7. 运行对应场景，截图对比。

## 7. Cocos Creator 导入设置

### 6.1 非像素风推荐设置

适用于普通 AI 卡通、插画、半写实资源：

```text
minfilter: linear
magfilter: linear
mipfilter: none
wrapModeS/T: clamp 或 repeat 按用途
hasAlpha: 透明图为 true
fixAlphaTransparencyArtifacts: 透明边缘有黑边时打开
```

注意：

- UI、角色、图标通常不需要 mipmap。
- 背景如果存在远近缩放，可以评估 mipmap，但 UI 背景一般不需要。

### 6.2 像素风推荐设置

适用于 tiles、像素角色、像素怪物：

```text
minfilter: nearest/point
magfilter: nearest/point
mipfilter: none
```

并且运行时必须避免小数倍缩放：

```text
允许：1x, 2x, 3x, 4x
避免：1.25x, 1.5x, 2.3x
```

### 6.3 当前 `.meta` 的处理原则

当前 `.meta` 样例中主要是：

```json
"minfilter": "linear",
"magfilter": "linear",
"mipfilter": "none"
```

第一阶段只替换 PNG，不批量修改 `.meta`。等确认美术风格后再分批处理：

- 非像素风：保留 Linear。
- 像素风：对 `characters`、`monsters`、`bosses`、`tiles` 改 Point/Nearest。

不要在未确认前批量删除 `.meta`，否则引用会重建 UUID。

## 8. PNG 导入与压缩策略

## 8.0 PNG 色彩模式与 Cocos 导入规则

### 7.0.1 新发现问题

部分 AI 生成或脚本处理后的 PNG 会被 PIL/Pillow 默认保存为 `P` 模式，也就是索引色调色板 PNG：

```text
AI 生成 PNG
-> PIL 保存为 P 模式 / 256 色调色板
-> Cocos Creator 导入时只识别为 texture
-> 没有生成可用 SpriteFrame
-> resources.load(..., SpriteFrame) 或编辑器搜索 SpriteFrame 失败
```

这类文件表面看是 `.png`，但内部像素格式不是项目期望的 `RGBA` 或 `RGB`。Cocos Creator 对图片导入、SpriteFrame 生成、透明通道和图集处理都更稳定地依赖标准 `RGBA/RGB` PNG。索引色 `P` 模式容易导致：

- 自动生成 `.meta` 时只有 `type=texture`。
- 搜索不到 SpriteFrame。
- 透明边缘异常。
- 图集打包或运行时加载行为不一致。
- 后续无损压缩工具进一步保留错误模式。

### 7.0.2 项目强制规则

从现在开始，所有进入 `assets/resources/textures` 的 PNG 必须满足：

```text
透明资源：PNG RGBA
不透明资源：PNG RGB
禁止：PNG P 模式 / palette indexed color
禁止：LA / L / CMYK / 16-bit PNG 直接入库
```

适用范围：

| 资源类型 | 必须模式 |
|---|---|
| characters | RGBA |
| monsters | RGBA |
| bosses | RGBA |
| effects | RGBA |
| icons | RGBA |
| ui 按钮/面板/图标 | RGBA |
| ui / backgrounds 无透明背景 | RGB 或 RGBA |
| tiles | RGB 或 RGBA，按是否透明决定 |

注意：即使为了微信小游戏包体使用 256 色调色板压缩，也不能直接以 `P` 模式进入 Cocos。应先导出为 `RGBA/RGB`，再用 Cocos 构建压缩、平台纹理压缩或安全的无损压缩处理。

### 7.0.3 AI/PIL 导出要求

所有由 Python/PIL/Pillow 处理的 PNG，在保存前必须显式转换：

```python
from PIL import Image

img = Image.open(src)

if need_alpha:
    img = img.convert("RGBA")
else:
    img = img.convert("RGB")

img.save(dst, format="PNG", optimize=True)
```

禁止这样直接保存：

```python
img.save(dst)
```

因为源图如果是 `P`、`L`、`LA` 或带 palette，Pillow 可能沿用原模式保存。

如果使用 `pngquant`，输出常常是 palette/indexed PNG。该输出不应直接进入 Cocos。若确实要用它控制体积，必须在最后再转回 `RGBA/RGB` 并重新验收；但这样通常会损失 pngquant 的体积优势，所以本项目不推荐对 SpriteFrame 资源使用 pngquant。

### 7.0.4 批量检测脚本

在项目根目录运行以下脚本，扫描 `textures` 下所有 PNG 的色彩模式：

```powershell
@'
from pathlib import Path
from PIL import Image

root = Path(r"E:/game/回到地面/assets/resources/textures")
bad_modes = {"P", "L", "LA", "CMYK", "I", "I;16", "F"}

bad = []
for path in root.rglob("*.png"):
    try:
        with Image.open(path) as img:
            mode = img.mode
            if mode in bad_modes:
                bad.append((path, mode, img.size))
    except Exception as exc:
        bad.append((path, f"ERROR: {exc}", ""))

if not bad:
    print("OK: all PNG files are RGB/RGBA-compatible.")
else:
    print("Bad PNG modes:")
    for path, mode, size in bad:
        print(f"{mode}\t{size}\t{path}")
    raise SystemExit(1)
'@ | python -
```

验收标准：

```text
输出 OK 才允许进入 Cocos 导入/构建
发现 P/L/LA/CMYK/I/F 模式必须先转换
```

### 7.0.5 批量转换脚本

转换前必须先备份 `.png` 和 `.meta`。转换脚本只覆盖 PNG，不修改 `.meta`：

```powershell
@'
from pathlib import Path
from PIL import Image

root = Path(r"E:/game/回到地面/assets/resources/textures")
bad_modes = {"P", "L", "LA", "CMYK", "I", "I;16", "F"}

converted = []
for path in root.rglob("*.png"):
    with Image.open(path) as img:
        if img.mode not in bad_modes:
            continue

        has_alpha = img.mode in {"P", "LA"} or ("transparency" in img.info)
        out = img.convert("RGBA" if has_alpha else "RGB")
        out.save(path, format="PNG", optimize=True)
        converted.append((path, img.mode, out.mode, out.size))

for path, old_mode, new_mode, size in converted:
    print(f"{old_mode} -> {new_mode}\t{size}\t{path}")

print(f"Converted {len(converted)} file(s).")
'@ | python -
```

转换后：

1. 重新运行检测脚本。
2. 打开 Cocos Creator，等待资源重新导入。
3. 检查 `.meta` 是否仍保留原 UUID。
4. 检查资源面板是否能找到对应 SpriteFrame。
5. 运行 `resources.load(path, SpriteFrame, ...)` 的场景或测试。

### 7.0.6 单文件修复命令

如果只修某个文件：

```powershell
@'
from PIL import Image

src = r"E:/game/回到地面/assets/resources/textures/ui/splash/splash_bg.png"
with Image.open(src) as img:
    out = img.convert("RGBA" if ("transparency" in img.info or img.mode in {"P", "LA", "RGBA"}) else "RGB")
    out.save(src, format="PNG", optimize=True)
    print(img.mode, "->", out.mode, out.size)
'@ | python -
```

### 7.0.7 加入替换验收

每批 AI 替换资源入库前，必须多加一项检查：

```text
PNG mode audit: 所有 PNG 必须是 RGB/RGBA，不允许 P 模式
```

如果出现以下现象，优先检查 PNG 模式：

- Cocos 资源面板只显示 Texture，不显示 SpriteFrame。
- `.meta` 里只有 texture 子资源。
- `resources.load("xxx", SpriteFrame, ...)` 加载失败。
- 搜索 SpriteFrame 搜不到，但 PNG 文件真实存在。
- 替换 PNG 后引用没断，但 Sprite 不显示。

### 7.1 禁止项

以下资源不要使用 TinyJPG/JPG：

- 透明角色。
- 透明怪物。
- Boss 序列帧。
- UI 图标。
- 像素风 tiles。
- 有透明边缘的特效。

谨慎使用 `pngquant`：

- 它会降色，可能让渐变、描边、透明边缘变脏。
- 如果必须使用，只能用于不重要的小 UI 或地图节点，并且必须人工验收。

### 7.2 推荐项

| 资源类型 | 推荐压缩 |
|---|---|
| 透明角色/怪物/Boss | PNG 无损，或平台纹理压缩 |
| 图标 | PNG 无损；运行时尺寸控制在 128/256/512 |
| 背景 | WebP/JPG/平台纹理压缩；第一阶段可同名 PNG |
| UI 面板/按钮 | PNG 无损，九宫格优先 |
| 特效 | PNG 无损或平台纹理压缩 |
| tiles | PNG 无损 |

无损 PNG 工具建议：

```text
oxipng
zopflipng
```

体积控制优先级：

```text
先控制运行时尺寸
再做无损压缩
再考虑平台纹理压缩
最后才考虑有损压缩
```

## 9. 分阶段替换计划

### 阶段 0：冻结与备份

目标：避免边替换边丢引用。

动作：

- 备份 `assets/resources/textures`。
- 导出 `textures_replace_manifest.csv`。
- 暂停对同目录的零散手工改名。

验收：

- 备份目录完整。
- 清单覆盖所有 419 张 PNG。

### 阶段 1：P0 战斗主体高清化

范围：

```text
characters/
monsters/
bosses/
```

目标：

- 角色从 48px 单帧升级到 192/256px。
- 怪物从 48/64px 升级到 128/192px。
- Boss 从 64/96px 升级到 256px 起。

替换方式：

- 同名 PNG 替换。
- 保留 `.meta`。
- 保持帧数和排列方向。

额外检查：

- 查动画切帧逻辑是否写死 48/64。
- 查战斗碰撞、血条、影子位置是否偏移。

### 阶段 2：P1 UI 和图标体积/清晰度治理

范围：

```text
icons/
ui/upgrade/
ui/hud/
ui/map/
ui/shop/
ui/splash/
```

目标：

- 小图标升级到 128/256。
- `ui/upgrade` 中 1024 图标导出运行时 256 或 512。
- 保留 1024 母版到 `art_source/textures_master`，不要长期放在 `resources`。

注意：

- 如果 1024 图标当前已经被场景直接引用，先同名替换为 512 或 256，不要移动路径。
- 替换后检查升级界面、商店、地图、HUD 的清晰度和内存占用。

### 阶段 3：P1 背景高清化

范围：

```text
backgrounds/
ui/main/
ui/splash/
ui/death/
ui/shop/
```

目标：

- 战斗/房间背景至少 1000px 宽，高清 1500px 宽。
- 竖屏背景至少 750x1334，高清 1500x2668。
- 背景用 cover 适配，不要强行拉伸。

### 阶段 4：P2 tiles 和 effects

范围：

```text
tiles/
effects/
```

目标：

- 确认是否像素风。
- 像素风保留 32/64 但改 Point/Nearest。
- 非像素风升级到 64/128。
- 特效升级到 128/256。

## 10. 多档资源长期方案

第一阶段先做同名替换。稳定后，再接入多档资源。

推荐长期目录：

```text
assets/resources/textures_quality/
  low/
    characters/
    monsters/
    bosses/
    icons/
    ui/
  mid/
    characters/
    monsters/
    bosses/
    icons/
    ui/
  high/
    characters/
    monsters/
    bosses/
    icons/
    ui/
```

档位建议：

| 档位 | 角色单帧 | 怪物 | Boss | 图标 | 背景 |
|---|---:|---:|---:|---:|---:|
| low | 128 | 96-128 | 192 | 128 | 750/1000 宽 |
| mid | 192 | 128-192 | 256 | 256 | 1000/1500 宽 |
| high | 256 | 192-256 | 384-512 | 512 | 1500/2000 宽 |

运行时选择规则：

```text
DPR < 2 或低端机：low
DPR 2-3：mid
DPR >= 3 或 PC：high
```

接入多档前必须先统一资源加载入口。不要在业务代码里散落大量硬编码路径。

## 11. 替换验收清单

每批替换完成后必须检查：

1. Cocos Console 无导入错误。
2. `.meta` 未被误删、UUID 未大面积重建。
3. 场景和 Prefab 无 Missing Texture / Missing SpriteFrame。
4. 角色动画帧数正确，无跳帧、错帧、拉伸。
5. 角色脚底、影子、血条位置正常。
6. 怪物/Boss 战斗中大小符合设计。
7. UI 图标在 750x1334、1080x1920、高 DPR 设备上清晰。
8. 背景没有横向或纵向强拉伸。
9. 透明边缘没有黑边、白边、脏边。
10. 构建包体和运行内存没有异常暴涨。

## 12. 高风险点与规避

### 11.1 替换后引用断裂

原因：

- 删除 `.meta`。
- 改文件名。
- 移动目录。
- 在 Cocos 外删除再新建导致 UUID 改变。

规避：

- 第一阶段只覆盖 PNG。
- 保留 `.meta`。
- 不改路径。

### 11.2 替换后动画错乱

原因：

- 帧数变了。
- 序列帧排列方向变了。
- 每帧尺寸不一致。
- 代码写死 48/64。

规避：

- 同动作保持同帧数。
- 同角色所有动作保持同单帧画布。
- 替换前检查动画切帧配置。

### 11.3 文件变清晰但包体暴涨

原因：

- 把 1024 母版直接放进运行时。
- 所有图标都用 1024。
- 大量资源进入 `resources` 首包。

规避：

- 1024 放 `art_source` 当母版。
- 运行时图标默认 256，重要图标 512。
- 长期做分包和多档加载。

### 11.4 看起来还是糊

原因：

- 运行时仍然把图放大超过原图尺寸。
- Canvas 适配导致整体小数倍缩放。
- 像素风使用 Linear。
- 浏览器或设备 DPR 下加载了低清档。

规避：

- 检查最终显示尺寸。
- 非像素风资源至少 2x。
- 像素风用 Point/Nearest 且整数倍缩放。
- 接入多档资源。

## 13. 建议优先替换清单

第一批 P0：

```text
textures/characters/**
textures/monsters/**
textures/bosses/miniboss/**
textures/bosses/finalboss/**
```

第二批 P1：

```text
textures/icons/**
textures/ui/hud/**
textures/ui/map/**
textures/ui/upgrade/**
textures/ui/splash/**
```

第三批 P1：

```text
textures/backgrounds/**
textures/ui/main/**
textures/ui/shop/**
textures/ui/death/**
```

第四批 P2：

```text
textures/effects/**
textures/tiles/**
```

## 14. 最终落地标准

替换完成后，项目应达到：

- 正式运行时不再使用 48px 宽角色作为主战斗显示资源。
- 普通角色单帧至少 192px，重要角色至少 256px。
- 普通怪物至少 128px，精英/Boss 至少 192/256px。
- 图标运行时默认 128/256，只有高清档或大展示使用 512。
- 1024 级图标保留为母版，不直接作为普通 UI 运行资源。
- 透明角色、怪物、Boss 不使用 TinyJPG/JPG。
- `.meta` 保留，UUID 不因替换大面积变化。
- 资源清晰度通过源图尺寸和多档加载解决，而不是靠压缩器硬凑体积。
