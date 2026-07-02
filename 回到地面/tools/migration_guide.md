# 场景文本迁移操作清单

> 所有固定 Label 都需要挂 LocalizedLabel 组件
> 动态文本节点（StatusLabel、PlayerInfo）由代码刷新，不需要挂

## 操作说明

1. 打开对应场景文件
2. 在层级管理器找到节点路径
3. 选中该节点 → 添加组件 → LocalizedLabel
4. 在 textKey 字段填入对应的 key

---

### Canvas/SplashUI/SkipButton/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/splash.scene` |
| 节点路径 | `Canvas/SplashUI/SkipButton/Label` |
| 当前文本 | `跳过` |
| textKey | `ui.skip` |
| 操作 | 添加组件→LocalizedLabel→填入ui.skip |

### Canvas/SplashUI/LoadingLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/splash.scene` |
| 节点路径 | `Canvas/SplashUI/LoadingLabel` |
| 当前文本 | `正在加载...` |
| textKey | `ui.loading` |
| 操作 | 添加组件→LocalizedLabel→填入ui.loading |

### Canvas/SplashUI/GameBootstrap/StatusLabel  ⏭️ 动态文本（代码刷新，不挂组件）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/splash.scene` |
| 节点路径 | `Canvas/SplashUI/GameBootstrap/StatusLabel` |
| 当前文本 | `label` |
| textKey | `scene.label` |
| 操作 | 跳过（代码刷新） |

### Canvas/MainUI/StartButton/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/StartButton/Label` |
| 当前文本 | `开始游戏` |
| textKey | `ui.mainStart` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainStart |

### Canvas/MainUI/characterBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/characterBtn/Label` |
| 当前文本 | `角色` |
| textKey | `ui.mainCharacter` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainCharacter |

### Canvas/MainUI/ShopBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/ShopBtn/Label` |
| 当前文本 | `商店` |
| textKey | `ui.mainShop` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainShop |

### Canvas/MainUI/LogBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/LogBtn/Label` |
| 当前文本 | `日志` |
| textKey | `ui.mainLog` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainLog |

### Canvas/MainUI/SettingsBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/SettingsBtn/Label` |
| 当前文本 | `设置` |
| textKey | `ui.mainSettings` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainSettings |

### Canvas/MainUI/CharNameLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/CharNameLabel` |
| 当前文本 | `Adventurer` |
| textKey | `ui.charName` |
| 操作 | 添加组件→LocalizedLabel→填入ui.charName |

### Canvas/MainUI/CharClassLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/CharClassLabel` |
| 当前文本 | `Bear Warrior` |
| textKey | `ui.charClass` |
| 操作 | 添加组件→LocalizedLabel→填入ui.charClass |

### Canvas/MainUI/LevelLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/LevelLabel` |
| 当前文本 | `Lv1` |
| textKey | `ui.charLevel` |
| 操作 | 添加组件→LocalizedLabel→填入ui.charLevel |

### Canvas/MainUI/SoulStoneLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/SoulStoneLabel` |
| 当前文本 | `Soul Stones: 0` |
| textKey | `ui.soulStones` |
| 操作 | 添加组件→LocalizedLabel→填入ui.soulStones |

### Canvas/MainUI/VersionLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/VersionLabel` |
| 当前文本 | `v0.1.0` |
| textKey | `ui.appVersion` |
| 操作 | 添加组件→LocalizedLabel→填入ui.appVersion |

### Canvas/AreaSelectPanel/PanelRoot/PlayerInfo  ⏭️ 动态文本（代码刷新，不挂组件）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AreaSelectPanel/PanelRoot/PlayerInfo` |
| 当前文本 | `label` |
| textKey | `ui.areaPlayerInfo` |
| 操作 | 跳过（代码刷新） |

### Canvas/AreaSelectPanel/PanelRoot/StartBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AreaSelectPanel/PanelRoot/StartBtn/Label` |
| 当前文本 | `开始冒险` |
| textKey | `ui.areaStart` |
| 操作 | 添加组件→LocalizedLabel→填入ui.areaStart |

### Canvas/AreaSelectPanel/PanelRoot/BackBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AreaSelectPanel/PanelRoot/BackBtn/Label` |
| 当前文本 | `返回` |
| textKey | `ui.areaBack` |
| 操作 | 添加组件→LocalizedLabel→填入ui.areaBack |

---

## 验证

```bash
python tools/check_hardcoded_text.py
npm.cmd run validate:all
```
