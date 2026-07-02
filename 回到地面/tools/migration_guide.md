# 场景文本迁移操作清单

> 在 Cocos Creator 编辑器中逐项操作

## 操作说明

1. 打开对应场景文件
2. 在层级管理器找到节点路径
3. 选中该节点 → 添加组件 → LocalizedLabel
4. 在 textKey 字段填入对应的 key

---

### Canvas/SplashUI/SkipButton/Label  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/splash.scene` |
| 节点路径 | `Canvas/SplashUI/SkipButton/Label` |
| 当前文本 | `跳过` |
| textKey | `ui.createSkip` |
| 状态 | already_migrated |

### Canvas/SplashUI/LoadingLabel  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/splash.scene` |
| 节点路径 | `Canvas/SplashUI/LoadingLabel` |
| 当前文本 | `正在加载...` |
| textKey | `ui.loading` |
| 状态 | already_migrated |

### Canvas/MainUI/StartButton/Label  📦 待迁移

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/StartButton/Label` |
| 当前文本 | `开始游戏` |
| textKey | `ui.mainStart` |
| 状态 | pending |

### Canvas/MainUI/characterBtn/Label  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/characterBtn/Label` |
| 当前文本 | `角色` |
| textKey | `ui.mainCharacter` |
| 状态 | already_migrated |

### Canvas/MainUI/ShopBtn/Label  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/ShopBtn/Label` |
| 当前文本 | `商店` |
| textKey | `ui.mainShop` |
| 状态 | already_migrated |

### Canvas/MainUI/LogBtn/Label  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/LogBtn/Label` |
| 当前文本 | `日志` |
| textKey | `ui.mainLog` |
| 状态 | already_migrated |

### Canvas/MainUI/SettingsBtn/Label  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/SettingsBtn/Label` |
| 当前文本 | `设置` |
| textKey | `ui.mainSettings` |
| 状态 | already_migrated |

### Canvas/MainUI/CharNameLabel  📦 待迁移

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/CharNameLabel` |
| 当前文本 | `Adventurer` |
| textKey | `ui.charName` |
| 状态 | pending |

### Canvas/MainUI/CharClassLabel  📦 待迁移

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/CharClassLabel` |
| 当前文本 | `Bear Warrior` |
| textKey | `ui.charClass` |
| 状态 | pending |

### Canvas/MainUI/LevelLabel  📦 待迁移

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/LevelLabel` |
| 当前文本 | `Lv1` |
| textKey | `ui.charLevel` |
| 状态 | pending |

### Canvas/MainUI/SoulStoneLabel  📦 待迁移

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/SoulStoneLabel` |
| 当前文本 | `Soul Stones: 0` |
| textKey | `ui.soulStones` |
| 状态 | pending |

### Canvas/MainUI/VersionLabel  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/VersionLabel` |
| 当前文本 | `v0.1.0` |
| textKey | `ui.appVersion` |
| 状态 | already_migrated |

### Canvas/AreaSelectPanel/PanelRoot/StartBtn/Label  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AreaSelectPanel/PanelRoot/StartBtn/Label` |
| 当前文本 | `开始冒险` |
| textKey | `ui.areaStart` |
| 状态 | already_migrated |

### Canvas/AreaSelectPanel/PanelRoot/BackBtn/Label  ✅ 已有

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AreaSelectPanel/PanelRoot/BackBtn/Label` |
| 当前文本 | `返回` |
| textKey | `ui.areaBack` |
| 状态 | already_migrated |

---

## 验证

```bash
python tools/check_hardcoded_text.py
npm.cmd run validate:all
```
