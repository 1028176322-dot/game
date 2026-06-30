# 音频/字体 AI 制作指南

> 版本: v1.0 | 日期: 2026-06-26
> 用途: 给 AI 逐个生成音频和字体文件，按此清单逐条制作
> 存放根路径: E:/game/回到地面/assets/resources/

---

## 工具选择

### 推荐工具组合

| 资源类型 | 推荐 AI 工具 | 费用 | 理由 |
|----------|-------------|------|------|
| **BGM (11首)** | Suno AI (suno.com) | 免费每天5首 | 文字→音乐质量最好, 支持循环和风格控制 |
| **SFX (36个)** | ElevenLabs 音效生成 | 免费额度够用 | 最准确的效果音生成 |
| **SFX (备选)** | Freesound.org | 免费 | 搜现成音效, 需标注出处 |
| **字体** | 使用开源字体子集化 | 免费 | AI 目前无法生成可用的中文 TTF |

### 工具使用步骤

```
Suno AI 做 BGM:
  1. 打开 suno.com → 注册/登录（需梯子）
  2. 在 Create 页面粘贴"生成描述"（推荐用英文，效果更好）
  3. 风格选 Instrumental (纯音乐)
  4. 时长选 30 秒（或自定义）
  5. 生成 → 下载 MP3 → 按下方路径和命名保存

ElevenLabs 做 SFX:
  1. 打开 elevenlabs.io → 注册/登录
  2. 进入 Sound Effects 页面
  3. 粘贴"生成描述" (英文效果最好)
  4. 时长选 Short (< 2秒) 或 Medium (2~5秒)
  5. 生成 → 下载 WAV → 按下方路径和命名保存
  
字体:
  推荐 Zpix 像素字体 (开源免费, 含中文)
  下载 → 用字体子集化工具压缩 → 保存到 fonts/
```

---

## 一、BGM（11 首）—— 快速生成清单

> 存放路径: `E:/game/回到地面/assets/resources/audio/bgm/`
> 格式: MP3, 96kbps, 单文件 < 200KB, 循环播放 (30~60秒)
> 工具: Suno AI → 纯音乐(Instrumental) → 下载 MP3

### 操作步骤

在 Suno Create 页面：
1. **Paste** 下方对应英文描述到输入框
2. **Style** 选择 `Instrumental`（纯音乐）
3. **Duration** 选 30 秒（或 Custom 按需设置）
4. **Generate** → 试听满意后下载
5. **重命名** 为对应文件名，存入 `audio/bgm/`

> 💡 英文描述效果比中文好，下面直接给英文版，复制粘贴即可

---

### 第 1 首 · 主界面 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_main.mp3` |
| **时长** | 60 秒循环 |
| **目标大小** | < 200KB |
| **📋 复制这个到 Suno** | `Style: Epic orchestral, mysterious. Ethereal flute intro, harp arpeggios, low strings building dungeon exploration atmosphere. Medium tempo 80bpm, loopable, no ending, instrumental only.` |

### 第 2 首 · 战斗 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_combat.mp3` |
| **时长** | 30 秒循环 |
| **目标大小** | < 150KB |
| **📋 复制这个到 Suno** | `Style: Action, tense percussion. Driving drums, brass stabs, electronic beats. Fast tempo 120bpm, loopable 30s, no vocals, instrumental battle music.` |

### 第 3 首 · Boss 战 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_boss.mp3` |
| **时长** | 30 秒循环 |
| **目标大小** | < 150KB |
| **📋 复制这个到 Suno** | `Style: Epic orchestral, intense. Full orchestra with choir, timpani pounding, brass fanfare. Dark powerful tension. 100bpm, loopable, instrumental.` |

### 第 4 首 · 强化房 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_upgrade.mp3` |
| **时长** | 20 秒循环 |
| **目标大小** | < 100KB |
| **📋 复制这个到 Suno** | `Style: Hopeful, light. Harp and strings, glockenspiel. Warm and inviting, sense of discovery. Medium tempo 90bpm, loopable 20s, instrumental.` |

### 第 5 首 · 觉悟战 BGM（死亡）

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_death.mp3` |
| **时长** | 15 秒循环 |
| **目标大小** | < 80KB |
| **📋 复制这个到 Suno** | `Style: Dark, somber. Solo cello, low sustained notes, minimal ambient. Melancholic and reflective. Slow 50bpm, loopable 15s, instrumental.` |

### 第 6 首 · 森林区域 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_forest.mp3` |
| **📋 复制这个到 Suno** | `Style: Ethereal, nature. Chinese bamboo flute, harp, soft bird chirps in background. Mystical forest atmosphere. 70bpm, loopable 30s, instrumental.` |

### 第 7 首 · 墓穴区域 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_catacombs.mp3` |
| **📋 复制这个到 Suno** | `Style: Dark, oppressive. Pipe organ, low strings, chain rattling sounds. Underground tomb atmosphere. 60bpm, loopable 30s, instrumental.` |

### 第 8 首 · 火山区域 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_volcano.mp3` |
| **📋 复制这个到 Suno** | `Style: Intense, urgent. Taiko drums, electric guitar, fire crackling sounds. Volcanic fury. 130bpm, loopable 30s, instrumental.` |

### 第 9 首 · 冰原区域 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_tundra.mp3` |
| **📋 复制这个到 Suno** | `Style: Cold, lonely. Piano, wind chimes, howling wind. Frozen wasteland atmosphere. 60bpm, loopable 30s, instrumental.` |

### 第 10 首 · 沼泽区域 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_swamp.mp3` |
| **📋 复制这个到 Suno** | `Style: Eerie, viscous. Cello, synthesizer pad, water droplet sounds. Toxic swamp dread. 70bpm, loopable 30s, instrumental.` |

### 第 11 首 · 深渊区域 BGM

| 字段 | 内容 |
|------|------|
| **文件名** | `bgm_abyss.mp3` |
| **📋 复制这个到 Suno** | `Style: Grand, despairing. Full symphony, choir, deep bass drone. Void of the abyss. 90bpm, loopable 30s, instrumental.` |

---

## 二、SFX（36 个）

> 存放路径: E:/game/回到地面/assets/resources/audio/sfx/
> 格式: WAV, 单文件 < 100KB, 0.3~1.5秒
> 工具: ElevenLabs Sound Effects → 下载 WAV
> 英文描述效果最佳，保持英文原文直接使用

### 2.1 玩家音效（14 个）

| 文件名 | 路径 | 时长 | 🤖 ElevenLabs 生成描述 (直接复制使用) |
|--------|------|------|---------------------------------------|
| `sfx_player_attack_1.wav` | `.../audio/sfx/sfx_player_attack_1.wav` | 0.5s | Short sword swing whoosh, metallic blade cutting air, 0.5 seconds |
| `sfx_player_attack_2.wav` | `.../audio/sfx/sfx_player_attack_2.wav` | 0.5s | Bow string release, arrow piercing air, sharp twang, 0.5 seconds |
| `sfx_player_attack_3.wav` | `.../audio/sfx/sfx_player_attack_3.wav` | 0.5s | Magic staff swoosh, low frequency hum, mystical energy, 0.5 seconds |
| `sfx_player_hit_1.wav` | `.../audio/sfx/sfx_player_hit_1.wav` | 0.3s | Light flesh impact, male grunt, getting hit, 0.3 seconds |
| `sfx_player_hit_2.wav` | `.../audio/sfx/sfx_player_hit_2.wav` | 0.5s | Heavy hit with bone crack, male pain cry, 0.5 seconds |
| `sfx_player_crit.wav` | `.../audio/sfx/sfx_player_crit.wav` | 0.5s | Sharp metallic clash, rising pitch, critical hit impact, 0.5 seconds |
| `sfx_player_dodge.wav` | `.../audio/sfx/sfx_player_dodge.wav` | 0.3s | Quick rolling sound, cloth whoosh, dodge roll, 0.3 seconds |
| `sfx_player_death.wav` | `.../audio/sfx/sfx_player_death.wav` | 1.0s | Body falling to ground, final breath exhale, death rattle, 1.0 seconds |
| `sfx_player_dash.wav` | `.../audio/sfx/sfx_player_dash.wav` | 0.3s | Fast air rush, speed burst, dash forward, 0.3 seconds |
| `sfx_player_heal.wav` | `.../audio/sfx/sfx_player_heal.wav` | 0.8s | Healing glow, ascending chime, warm magical recovery, 0.8 seconds |
| `sfx_player_shield.wav` | `.../audio/sfx/sfx_player_shield.wav` | 0.5s | Shield activation, low frequency thud, barrier forming, 0.5 seconds |
| `sfx_player_elementburst.wav` | `.../audio/sfx/sfx_player_elementburst.wav` | 1.0s | Multi-element explosion, mix of fire ice lightning sounds, burst, 1.0 seconds |
| `sfx_player_slowfield.wav` | `.../audio/sfx/sfx_player_slowfield.wav` | 0.8s | Low hum, slowing field activation, deep pulsing, 0.8 seconds |
| `sfx_player_snapshot.wav` | `.../audio/sfx/sfx_player_snapshot.wav` | 0.5s | Powerful bow shot, string snap plus air pierce, precise, 0.5 seconds |

### 2.2 怪物音效（9 个）

| 文件名 | 时长 | 🤖 ElevenLabs 生成描述 |
|--------|------|------------------------|
| `sfx_monster_hit_1.wav` | 0.3s | Fleshy impact, monster taking damage, wet thud, 0.3 seconds |
| `sfx_monster_hit_2.wav` | 0.3s | Bone cracking impact, skeleton hit, crunchy, 0.3 seconds |
| `sfx_monster_hit_3.wav` | 0.3s | Metal plate impact, armored monster hit, clang, 0.3 seconds |
| `sfx_monster_death_1.wav` | 0.5s | Skeleton collapsing, bones shattering, death rattle, 0.5 seconds |
| `sfx_monster_death_2.wav` | 0.8s | Ghost dissipating, ethereal fade out, wind sound, 0.8 seconds |
| `sfx_monster_death_3.wav` | 0.5s | Explosion, suicide monster detonation, fire burst, 0.5 seconds |
| `sfx_monster_attack_charger.wav` | 0.5s | Beast charge roar, heavy footsteps rushing, aggressive, 0.5 seconds |
| `sfx_monster_attack_ranged.wav` | 0.3s | Magic projectile cast, ranged attack whoosh, spell shoot, 0.3 seconds |
| `sfx_monster_attack_defender.wav` | 0.5s | Shield bash, heavy shield impact, defensive thud, 0.5 seconds |

### 2.3 Boss 音效（6 个）

| 文件名 | 时长 | 🤖 ElevenLabs 生成描述 |
|--------|------|------------------------|
| `sfx_boss_forestguardian.wav` | 1.0s | Deep tree roots tearing, ancient forest guardian roar, 1.0 seconds |
| `sfx_boss_skeletonlord.wav` | 1.0s | Bone rattling, royal war horn, skeleton king commanding, 1.0 seconds |
| `sfx_boss_firelord.wav` | 1.0s | Fire explosion, demonic roar, inferno lord raging, 1.0 seconds |
| `sfx_boss_frostqueen.wav` | 1.0s | Ice shattering, female high-pitched scream, frost queen casting, 1.0 seconds |
| `sfx_boss_swampbehemoth.wav` | 1.0s | Viscous slime gurgling, deep guttural growl, swamp monster, 1.0 seconds |
| `sfx_boss_abyssoverlord.wav` | 1.5s | Void whispers, deep echoing abyss sound, demonic low speech, 1.5 seconds |

### 2.4 元素音效（4 个）

| 文件名 | 时长 | 🤖 ElevenLabs 生成描述 |
|--------|------|------------------------|
| `sfx_element_reaction.wav` | 0.3s | Bright magical chime, elemental reaction triggered, crisp, 0.3 seconds |
| `sfx_element_burn.wav` | 0.5s | Fire explosion with sizzling, burning crackle, 0.5 seconds |
| `sfx_element_freeze.wav` | 0.3s | Ice crystal forming, freezing crack, crisp frost, 0.3 seconds |
| `sfx_element_conduct.wav` | 0.5s | Electric current zapping, spark popping, lightning conducting, 0.5 seconds |

### 2.5 UI 音效（3 个）

| 文件名 | 时长 | 🤖 ElevenLabs 生成描述 |
|--------|------|------------------------|
| `sfx_ui_click.wav` | 0.1s | Short crisp button click, UI tap, clean digital click, 0.1 seconds |
| `sfx_ui_upgrade.wav` | 0.5s | Ascending chime, level up sound, upgrade confirmation, 0.5 seconds |
| `sfx_ui_coin.wav` | 0.5s | Coins clinking together, treasure reward, coin drop, 0.5 seconds |

---

## 三、字体（1 个）

> 存放路径: E:/game/回到地面/assets/resources/fonts/
> AI 目前无法直接生成可用的中文字体，推荐使用现成开源字体

### 推荐方案

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 下载 Zpix 像素字体 | 搜 "Zpix 最像素 字体 Github" → 下载 TTF |
| 2 | 字体子集化 | 只保留游戏需要的字符 (数字+符号+约500汉字) |
| 3 | 保存 | 重命名并保存到 `fonts/font_number.ttf` |

**子集化工具体**: font-spider (npm) 或 glyphhanger (Python)

### 如需 AI 生成 (等宽数字字体)

| 字段 | 内容 |
|------|------|
| **文件名** | `font_number.ttf` |
| **完整路径** | `E:/game/回到地面/assets/resources/fonts/font_number.ttf` |
| **字符集** | 数字 0123456789 + 符号 +-×÷%:./(),  |
| **大小** | < 1MB |
| **🤖 生成描述** | pixel art monospace number font, characters: 0123456789 +-×÷%.:, clear readable sharp edges, TTF format suitable for game UI damage numbers |

---

## 四、批量制作顺序建议

```
第一轮 (P0 - 必须先做):
  → SFX: ui_click, ui_upgrade, ui_coin     (3个, ~10分钟)
  → SFX: player_attack_1/2/3, player_hit_1/2, player_crit, player_dodge, player_death  (8个, ~20分钟)
  → BGM: bgm_main, bgm_combat, bgm_boss     (3首, ~15分钟 Suno)
  → 字体: font_number.ttf                    (5分钟下载+子集化)
  → 存放到对应路径

第二轮 (P1 - 体验完整):
  → SFX: 6个技能 + 6个Boss怒吼 + 4个元素   (16个, ~30分钟)
  → BGM: 6个区域BGM                          (6首, ~30分钟 Suno)

第三轮 (P2 - 锦上添花):
  → SFX: 9个怪物音效                         (9个, ~15分钟)
```

---

## 五、存放检查清单

每生成一个文件，按此检查:

```
☐ 文件名是否全小写 + 下划线 (无中文无空格无大写)
☐ 是否存在到正确的路径下
☐ BGM: < 200KB, MP3, 可循环
☐ SFX: < 100KB, WAV
☐ 字体: < 1MB, TTF
☐ 所有文件已 git add + commit + push
```
