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
| 当前文本 | `[ui.skip]` |
| textKey | `ui.skip` |
| 操作 | 添加组件→LocalizedLabel→填入ui.skip |

### Canvas/SplashUI/LoadingLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/splash.scene` |
| 节点路径 | `Canvas/SplashUI/LoadingLabel` |
| 当前文本 | `[ui.loading]` |
| textKey | `ui.loading` |
| 操作 | 添加组件→LocalizedLabel→填入ui.loading |

### Canvas/MainUI/StartButton/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/StartButton/Label` |
| 当前文本 | `[ui.mainStart]` |
| textKey | `ui.mainStart` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainStart |

### Canvas/MainUI/characterBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/characterBtn/Label` |
| 当前文本 | `[ui.mainCharacter]` |
| textKey | `ui.mainCharacter` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainCharacter |

### Canvas/MainUI/ShopBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/ShopBtn/Label` |
| 当前文本 | `[ui.mainShop]` |
| textKey | `ui.mainShop` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainShop |

### Canvas/MainUI/LogBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/LogBtn/Label` |
| 当前文本 | `[ui.mainLog]` |
| textKey | `ui.mainLog` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainLog |

### Canvas/MainUI/SettingsBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/SettingsBtn/Label` |
| 当前文本 | `[ui.mainSettings]` |
| textKey | `ui.mainSettings` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainSettings |

### Canvas/MainUI/CharNameLabel  ⏭️ 动态文本（代码刷新，不挂组件）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/CharNameLabel` |
| 当前文本 | `[ui.charName]` |
| textKey | `ui.charName` |
| 操作 | 跳过（代码刷新） |

### Canvas/MainUI/CharClassLabel  ⏭️ 动态文本（代码刷新，不挂组件）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/CharClassLabel` |
| 当前文本 | `[ui.charClass]` |
| textKey | `ui.charClass` |
| 操作 | 跳过（代码刷新） |

### Canvas/MainUI/LevelLabel  ⏭️ 动态文本（代码刷新，不挂组件）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/LevelLabel` |
| 当前文本 | `[ui.charLevel]` |
| textKey | `ui.charLevel` |
| 操作 | 跳过（代码刷新） |

### Canvas/MainUI/SoulStoneLabel  ⏭️ 动态文本（代码刷新，不挂组件）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/SoulStoneLabel` |
| 当前文本 | `[ui.soulStones]` |
| textKey | `ui.soulStones` |
| 操作 | 跳过（代码刷新） |

### Canvas/MainUI/VersionLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/MainUI/VersionLabel` |
| 当前文本 | `[ui.appVersion]` |
| textKey | `ui.appVersion` |
| 操作 | 添加组件→LocalizedLabel→填入ui.appVersion |

### Canvas/AreaSelectPanel/PanelRoot/PlayerInfo  ⏭️ 动态文本（代码刷新，不挂组件）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AreaSelectPanel/PanelRoot/PlayerInfo` |
| 当前文本 | `[ui.areaPlayerInfo]` |
| textKey | `ui.areaPlayerInfo` |
| 操作 | 跳过（代码刷新） |

### Canvas/AreaSelectPanel/PanelRoot/StartBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AreaSelectPanel/PanelRoot/StartBtn/Label` |
| 当前文本 | `[ui.areaStart]` |
| textKey | `ui.areaStart` |
| 操作 | 添加组件→LocalizedLabel→填入ui.areaStart |

### Canvas/AreaSelectPanel/PanelRoot/BackBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AreaSelectPanel/PanelRoot/BackBtn/Label` |
| 当前文本 | `[ui.areaBack]` |
| textKey | `ui.areaBack` |
| 操作 | 添加组件→LocalizedLabel→填入ui.areaBack |

### Canvas/LoginPanel/PanelRoot/TitleLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/LoginPanel/PanelRoot/TitleLabel` |
| 当前文本 | `[ui.loginTitle]` |
| textKey | `ui.loginTitle` |
| 操作 | 添加组件→LocalizedLabel→填入ui.loginTitle |

### Canvas/LoginPanel/PanelRoot/SubtitleLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/LoginPanel/PanelRoot/SubtitleLabel` |
| 当前文本 | `[ui.loginSubtitle]` |
| textKey | `ui.loginSubtitle` |
| 操作 | 添加组件→LocalizedLabel→填入ui.loginSubtitle |

### Canvas/LoginPanel/PanelRoot/WechatBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/LoginPanel/PanelRoot/WechatBtn/Label` |
| 当前文本 | `[ui.loginWechat]` |
| textKey | `ui.loginWechat` |
| 操作 | 添加组件→LocalizedLabel→填入ui.loginWechat |

### Canvas/LoginPanel/PanelRoot/GuestBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/LoginPanel/PanelRoot/GuestBtn/Label` |
| 当前文本 | `[ui.loginGuest]` |
| textKey | `ui.loginGuest` |
| 操作 | 添加组件→LocalizedLabel→填入ui.loginGuest |

### Canvas/LoginPanel/PanelRoot/AgreementLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/LoginPanel/PanelRoot/AgreementLabel` |
| 当前文本 | `[ui.loginAgreement]` |
| textKey | `ui.loginAgreement` |
| 操作 | 添加组件→LocalizedLabel→填入ui.loginAgreement |

### Canvas/CreatePanel/PanelRoot/TitleLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/CreatePanel/PanelRoot/TitleLabel` |
| 当前文本 | `[ui.createTitle]` |
| textKey | `ui.createTitle` |
| 操作 | 添加组件→LocalizedLabel→填入ui.createTitle |

### Canvas/CreatePanel/PanelRoot/NameInput/PlaceholderLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/CreatePanel/PanelRoot/NameInput/PlaceholderLabel` |
| 当前文本 | `[ui.createNamePlaceholder]` |
| textKey | `ui.createNamePlaceholder` |
| 操作 | 添加组件→LocalizedLabel→填入ui.createNamePlaceholder |

### Canvas/CreatePanel/PanelRoot/ConfirmBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/CreatePanel/PanelRoot/ConfirmBtn/Label` |
| 当前文本 | `[ui.createConfirm]` |
| textKey | `ui.createConfirm` |
| 操作 | 添加组件→LocalizedLabel→填入ui.createConfirm |

### Canvas/CreatePanel/PanelRoot/SkipBtn  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/CreatePanel/PanelRoot/SkipBtn` |
| 当前文本 | `[ui.createSkip]` |
| textKey | `ui.createSkip` |
| 操作 | 添加组件→LocalizedLabel→填入ui.createSkip |

### Canvas/CharacterPanel/PanelRoot/TitleLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/CharacterPanel/PanelRoot/TitleLabel` |
| 当前文本 | `[ui.charTitle]` |
| textKey | `ui.areaTitle` |
| 操作 | 添加组件→LocalizedLabel→填入ui.areaTitle |

### Canvas/CharacterPanel/PanelRoot/CloseBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/CharacterPanel/PanelRoot/CloseBtn/Label` |
| 当前文本 | `[ui.close]` |
| textKey | `ui.mainCharacter` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainCharacter |

### Canvas/SettlementPanel/PanelRoot/DoubleBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/SettlementPanel/PanelRoot/DoubleBtn/Label` |
| 当前文本 | `[ui.settlementDouble]` |
| textKey | `ui.settlementDouble` |
| 操作 | 添加组件→LocalizedLabel→填入ui.settlementDouble |

### Canvas/SettlementPanel/PanelRoot/BackBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/SettlementPanel/PanelRoot/BackBtn/Label` |
| 当前文本 | `[ui.settlementBack]` |
| textKey | `ui.areaBack` |
| 操作 | 添加组件→LocalizedLabel→填入ui.areaBack |

### Canvas/SettingsPanel/PanelRoot/ResetBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/SettingsPanel/PanelRoot/ResetBtn/Label` |
| 当前文本 | `[ui.settingsReset]` |
| textKey | `ui.mainSettings` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainSettings |

### Canvas/SettingsPanel/PanelRoot/CloseBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/SettingsPanel/PanelRoot/CloseBtn/Label` |
| 当前文本 | `[ui.close]` |
| textKey | `ui.mainSettings` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainSettings |

### Canvas/AdventureLogPanel/PanelRoot/TitleLabel  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AdventureLogPanel/PanelRoot/TitleLabel` |
| 当前文本 | `[ui.logTitle]` |
| textKey | `ui.areaTitle` |
| 操作 | 添加组件→LocalizedLabel→填入ui.areaTitle |

### Canvas/AdventureLogPanel/PanelRoot/CloseBtn/Label  📦 需挂 LocalizedLabel（key 已存在）

| 字段 | 值 |
|------|-----|
| 场景 | `assets/scenes/main.scene` |
| 节点路径 | `Canvas/AdventureLogPanel/PanelRoot/CloseBtn/Label` |
| 当前文本 | `[ui.close]` |
| textKey | `ui.mainLog` |
| 操作 | 添加组件→LocalizedLabel→填入ui.mainLog |

---

## 验证

```bash
python tools/check_hardcoded_text.py
npm.cmd run validate:all
```
