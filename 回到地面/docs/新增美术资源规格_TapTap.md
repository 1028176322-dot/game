# 新增美术资源规格 — TapTap

> **发布日期**: 2026-07-09
> **关联项目**: 回到地面 (BackToGround) — TapTap Android 迁移
> **规范来源**: `ART_RESOURCE_RULES.md` — 所有管线参数读取自此文件

---

## 一、P0 — 必须生成（影响登录和战斗体验）

### 1.1 TapTap 登录按钮

| 属性 | 值 |
|------|-----|
| **资源 ID** | `ui/login/btn_taptap.png` |
| **尺寸** | 256×80 |
| **格式** | PNG RGBA |
| **类别** | ui |
| **9-slice** | 是（注册为 button 类型）|
| **用途** | TapTap 登录界面，替代 WeChat 登录按钮 |
| **推荐尺寸来源** | ART_RESOURCE_RULES.md 第 15 节 `recommended_sizes.ui` |

**规格说明**：
- 卡通游戏按钮风格，圆角矩形
- 蓝白色调（TapTap 品牌色：#2E7BF6 / #FFFFFF）
- 左侧放置 TapTap 品牌图标（小爪印），右侧文字「TapTap 登录」
- 不得包含微信/WeChat 元素
- 使用 9-slice 缩放适配不同文字长度
- alpha 边缘需要渐变过渡（装饰框检查）

**Prompt 参考**：
```
Target canvas: 256x80. Cartoon mobile game UI button, rounded rectangle with soft blue-white gradient, TapTap brand paw icon on left side, 'TapTap Login' text area on right, clean beveled shape, soft highlight, 9-slice safe content zone center, transparent alpha edges, consistent blue-gray adventure UI palette.
```

### 1.2 攻击弹道 Sprite

| 属性 | 值 |
|------|-----|
| **资源 ID** | `effects/combat/fx_attack_slash.png` |
| **尺寸** | 192×48（4 帧横排，每帧 48×48）|
| **格式** | PNG RGBA |
| **类别** | effects |
| **帧数** | 4 |
| **布局** | horizontal |
| **帧速** | 12 FPS |
| **循环** | 否（一次性播放）|
| **用途** | CombatEffectService 攻击弹道视觉效果，替换当前纯色方块 |

**规格说明**：
- 4 帧动画：从出现→展开→消退
- 白色-浅蓝渐变弧形刀光，中心到边缘半透明
- 每帧居中，背景全透明
- 无需描边，颜色柔和
- 与已有 `effects/combat/fx_hit_normal.png` 风格一致

**Prompt 参考**：
```
Target canvas: 192x48. Clean cartoon slash VFX animation sheet, 4 frames horizontal, white-blue arc shape per frame, expanding then fading, smooth alpha edges, semi-transparent center, bright arc, no text, no blood, no gore, consistent with existing cute cartoon effect assets.
```

### 1.3 暴击爆发特效

| 属性 | 值 |
|------|-----|
| **资源 ID** | `effects/combat/fx_crit_burst.png` |
| **尺寸** | 256×64（4 帧横排，每帧 64×64）|
| **格式** | PNG RGBA |
| **类别** | effects |
| **帧数** | 4 |
| **布局** | horizontal |
| **帧速** | 10 FPS |
| **循环** | 否 |
| **用途** | 暴击时目标位置爆发效果，替换当前放大的色块 |

**规格说明**：
- 4 帧动画：中心爆发→扩散→星光消散
- 金色调，中心亮白向外渐变金色
- 星形/放射状爆发形状
- 第 4 帧几乎全透明（消退）
- 与已有 `effects/combat/fx_crit.png` 配合使用

**Prompt 参考**：
```
Target canvas: 256x64. Cartoon crit burst VFX animation sheet, 4 frames horizontal, golden star explosion expanding from center, bright white-yellow core, golden sparkle trails, smooth alpha fadeout on last frame, no text, no blood, clean transparent edges.
```

---

## 二、P1 — 建议生成（提升战斗视觉层次）

### 2.1 元素反应地面标记

| 属性 | 值 |
|------|-----|
| **资源 ID** | `effects/combat/fx_reaction_ground.png` |
| **尺寸** | 256×64（4 帧横排，每帧 64×64）|
| **格式** | PNG RGBA |
| **类别** | effects |
| **帧数** | 4 |
| **布局** | horizontal |
| **帧速** | 8 FPS |
| **循环** | 否 |
| **用途** | 元素反应触发时怪物脚下显示一圈彩色地面标记圆环 |

**规格说明**：
- 圆形环状地面标记，4 帧从无到完整出现
- 半透明设计，不会遮挡游戏角色
- 颜色通用（白色底 + 彩色光晕），运行时可着色
- 边缘柔和过渡

**Prompt 参考**：
```
Target canvas: 256x64. Cartoon circular ground marker VFX animation sheet, 4 frames horizontal, semi-transparent magic ring appearing from center outwards, white glow with colored tint area, soft alpha edges, round swirl pattern, no text, readable over gameplay background, 64x64 per frame.
```

### 2.2 翻滚残影

| 属性 | 值 |
|------|-----|
| **资源 ID** | `effects/combat/fx_dodge_ghost.png` |
| **尺寸** | 192×48（4 帧横排，每帧 48×48）|
| **格式** | PNG RGBA |
| **类别** | effects |
| **帧数** | 4 |
| **布局** | horizontal |
| **帧速** | 10 FPS |
| **循环** | 否 |
| **用途** | 玩家翻滚无敌帧期间身后残影特效 |

**规格说明**：
- 人物轮廓残影形状，从清晰到消散
- 蓝白半透明色调
- 无需细致描画，模糊轮廓即可
- 帧 1 最清晰，帧 4 几乎全透明

**Prompt 参考**：
```
Target canvas: 192x48. Cartoon afterimage ghost VFX animation sheet, 4 frames horizontal, blue-white transparent humanoid silhouette shape, frame 1 clear to frame 4 nearly invisible, quick fade motion trail effect, smooth alpha gradient, no text, no face details.
```

---

## 三、生成参数汇总

| 资源 | 管线命令 | 难度 |
|------|----------|:----:|
| `btn_taptap.png` | `art_pipeline.py generate --key ui/login/btn_taptap.png` | 简单（UI 按钮，procedural 可生成）|
| `fx_attack_slash.png` | `art_pipeline.py generate --key effects/combat/fx_attack_slash.png` | 中等（AI Agnes 生成）|
| `fx_crit_burst.png` | `art_pipeline.py generate --key effects/combat/fx_crit_burst.png` | 中等 |
| `fx_reaction_ground.png` | `art_pipeline.py generate --key effects/combat/fx_reaction_ground.png` | 中等 |
| `fx_dodge_ghost.png` | `art_pipeline.py generate --key effects/combat/fx_dodge_ghost.png` | 困难（AI 理解"残影"概念需要多次尝试）|

**体积预算**（来自 ART_RESOURCE_RULES.md 第 9.2 节）：
- UI button: warning=500KB / hard=800KB
- Effects sprite: warning=450KB / hard=700KB

**合规检查**（生成后）：
```bash
python tools/art_pipeline.py validate --category ui       # btn_taptap
python tools/art_pipeline.py validate --category effects   # 全部 4 个特效资源
npm.cmd run validate:all                                   # 全部门禁
```
