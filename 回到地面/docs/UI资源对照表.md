# 项目 UI 资源对照表

> 生成日期: 2026-07-06  
> 覆盖范围：所有界面面板 + 战斗 HUD + 运行时 UI + 背格资源  
> 标记：✅ 已有 | ⚠️ 部分缺失 | ❌ 缺失 | 🔲 待操作

---

## 1. 启动模块 (Splash)

### 1.1 启动画面 — SplashUI / SplashScene

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 背景图 | splash_bg | `textures/ui/splash/splash_bg.png` | ✅ | 启动背景 |
| Logo | splash_logo | `textures/ui/splash/splash_logo.png` | ✅ | 游戏 Logo |
| 按钮贴图 | btn_active | `textures/ui/common/btn_active.png` | ✅ | 跳过按钮高亮态 |
| 按钮贴图 | btn_default | `textures/ui/common/btn_default.png` | ✅ | 跳过按钮默认态 |
| 按钮贴图 | btn_hover | `textures/ui/common/btn_hover.png` | ✅ | 跳过按钮悬停态 |
| 按钮贴图 | btn_close | `textures/ui/common/btn_close.png` | ✅ | 关闭按钮（暂未使用） |
| 字体 | 系统字体 | — | ✅ | Cocos 默认系统字体 Arial |
| 文本配置 | text.json > ui | `assets/resources/config/text.json` | ✅ | `ui.skip` / `ui.loading` / `ui.version` |
| 样式 | Graphics 绘制 | 代码内用 `Graphics` | ✅ | 进度条 Graphic 纯色绘制 |

**代码接入管线**：`SplashUI._createProgressBar()` 用 `Graphics` 绘制进度条；`SplashUI.splashImage` 节点待用 `RenderAssetService` 加载 `splash_bg` / `splash_logo`。

**缺失资源**：
- 暂无 — 启动画面完全可运行

---

## 2. 主城模块 (MainHub)

### 2.1 主城界面 — MainHubUI / MainUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 背景图 | main_bg | `textures/ui/main/main_bg.png` | ✅ | 主城背景 |
| 装饰图 | main_titledeco | `textures/ui/main/main_titledeco.png` | ✅ | 标题装饰 |
| 按钮贴图 | btn_default | `textures/ui/common/btn_default.png` | ✅ | 5 个底部按钮默认态 |
| 按钮贴图 | btn_active | `textures/ui/common/btn_active.png` | ✅ | 5 个底部按钮按下态 |
| 按钮贴图 | btn_hover | `textures/ui/common/btn_hover.png` | ✅ | 5 个底部按钮悬停态 |
| 按钮贴图 | btn_close | `textures/ui/common/btn_close.png` | ✅ | 右上角关闭按钮态 |
| 通用面板背景 | panel_bg | `textures/ui/common/panel_bg.png` | ✅ | 面板背景九宫格 |
| 文本配置 | text.json | `assets/resources/config/text.json` | ✅ | `ui.mainStart/Character/Shop/Log/Settings` 等 |
| 字体 | 系统字体 | — | ✅ | 系统默认 |

**代码接入管线**：MainUI 节点在场景中已有 Button/Label 组件，但所有按钮和标签的贴图**未通过 `RenderAssetService` 加载**。当前使用编辑器手动绑定 Sprite 的默认色块，无实际贴图。

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 按钮贴图接入代码 | 5 个 BottomBar 按钮尚无 `applySpriteById` 调用 | P2 |
| main_bg 接入代码 | 背景节点尚无 `applyTextureAsSprite` 调用 | P2 |
| 主城角色立绘 | 当前 TopBar 只有文字，无角色头像 | P3 |

### 2.2 登录面板 — LoginPanel

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 面板背景 | panel_bg | `textures/ui/common/panel_bg.png` | ✅ | PanelFrame |
| 按钮贴图 | btn_default | `textures/ui/common/btn_default.png` | ✅ | 微信登录 / 游客按钮 |
| 按钮贴图 | btn_active | `textures/ui/common/btn_active.png` | ✅ | 按钮高亮态 |
| 文本配置 | text.json > ui.login* | `assets/resources/config/text.json` | ✅ | 全部 9 条已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 按钮贴图接入代码 | WechatBtn / GuestBtn 尚无 `applySpriteById` 调用 | P2 |
| 面板背景接入代码 | PanelFrame 的 Sprite 尚无贴图加载 | P2 |
| 微信图标 | 微信按钮上当前只有文字，没有微信品牌图标 | P3 |

### 2.3 角色创建面板 — CreatePanel

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 面板背景 | panel_bg | `textures/ui/common/panel_bg.png` | ✅ | PanelFrame |
| 文本配置 | text.json > ui.create* | `assets/resources/config/text.json` | ✅ | 全部 10 条已配置 |
| 文本配置 | text.json > class/classAnimal/classDesc | `text.json` | ✅ | 5 职业名称/动物/描述 |
| 字体 | 系统字体 | — | ✅ | |
| 占位色块 | ModelDisplay | 代码内用 `Sprite` 着色块 | ✅ | 运行时动态创建半透明底色 |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| **5 个角色模型图** | ModelDisplay 区域当前为动态生成文字标签，无实际角色预览图 | **P0** |
| **5 个职业动物头像** | 职业选择按钮当前纯色方块 + 文字，无动物头像图标 | **P0** |
| 按钮贴图接入代码 | ConfirmBtn / SkipBtn 尚无 `applySpriteById` | P2 |
| 面板背景接入代码 | PanelFrame Sprite 尚无贴图加载 | P2 |
| 角色背景图 | 5 职业不同色调仍需补全 Sprite 共用 | P2 |

> 注：5 角色已各生成 7 帧动作序列图（idle/attack/walk/hit/dodge/skill/death），需用于 `ModelDisplay`。

### 2.4 角色管理面板 — CharacterPanel

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 面板背景 | panel_bg | `textures/ui/common/panel_bg.png` | ✅ | PanelFrame |
| 文本配置 | text.json > ui.char* | `assets/resources/config/text.json` | ✅ | 全部 11 条已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| **5 个角色头像/卡片** | 当前角色槽位只显示文字，无角色头像卡片贴图 | **P0** |
| 解锁锁图标 | 锁定的角色槽位需要锁图标 | P3 |
| 面板背景接入代码 | PanelFrame Sprite 尚无贴图加载 | P2 |

### 2.5 路线选择面板 — AreaSelectPanel

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 面板背景 | panel_bg | `textures/ui/common/panel_bg.png` | ✅ | PanelFrame |
| 地图房间图标 | icon_room_combat/boss/event/healing/shop/treasure/upgrade | `textures/ui/map/` | ✅ | 7 种房间图标已全 |
| 地图路线图标 | map_line | `textures/ui/map/map_line.png` | ✅ | 路线连接线 |
| 地图节点图标 | map_node_current/unknown/visited | `textures/ui/map/` | ✅ | 3 种节点状态 |
| 文本配置 | text.json > ui.area*/zone.* | `assets/resources/config/text.json` | ✅ | 全部已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 面板背景接入代码 | PanelFrame Sprite 尚无贴图加载 | P2 |
| **区域预览图** | 当前只显示文字难度，无区域预览缩略图（森林/墓穴等的预览图） | **P1** |
| 路线卡片接入 | 路线卡片当前用纯色 Sprite，应替换为地图贴图 | P2 |

### 2.6 结算面板 — SettlementPanel

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 面板背景 | panel_bg | `textures/ui/common/panel_bg.png` | ✅ | PanelFrame |
| 结算背景 | death_bg | `textures/ui/death/death_bg.png` | ✅ | 结算界面背景 |
| 结果面板 | result_panel | `textures/ui/death/result_panel.png` | ✅ | 结算结果框 |
| 魂石图标 | icon_soulstone | `textures/ui/death/icon_soulstone.png` | ✅ | 魂石图标 |
| 按钮贴图 | btn_settle_active/default | `textures/ui/death/` | ✅ | 翻倍按钮态 |
| 按钮贴图 | btn_revive_active/default | `textures/ui/death/` | ✅ | 复活按钮态 |
| 文本配置 | text.json > ui.settlement* | `assets/resources/config/text.json` | ✅ | 全部已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 贴图接入代码 | 所有以上贴图尚无 `applySpriteById` 调用 | P2 |
| 胜利/失败特效 | 结算时无过渡特效/粒子 | P3 |

### 2.7 设置面板 — SettingsPanel

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 面板背景 | panel_bg | `textures/ui/common/panel_bg.png` | ✅ | PanelFrame |
| 文本配置 | text.json > ui.settings* | `assets/resources/config/text.json` | ✅ | 全部已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 面板背景接入代码 | PanelFrame Sprite 尚无贴图加载 | P2 |
| 重置按钮样式 | 重置数据按钮尚无视觉反馈态 | P3 |

### 2.8 冒险日志面板 — AdventureLogPanel

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 面板背景 | panel_bg | `textures/ui/common/panel_bg.png` | ✅ | PanelFrame |
| 文本配置 | text.json > ui.log* | `assets/resources/config/text.json` | ✅ | 全部已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 面板背景接入代码 | PanelFrame Sprite 尚无贴图加载 | P2 |
| 统计图标 | 冒险次数/层数/击杀数处无装饰图标 | P3 |

### 2.9 商店界面 — ShopUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 商店背景 | shop_bg | `textures/ui/shop/shop_bg.png` | ✅ | 商店背景 |
| 商店槽位 | shop_slot | `textures/ui/shop/shop_slot.png` | ✅ | 商品槽位 |
| 金币图标 | icon_coin | `textures/ui/shop/icon_coin.png` | ✅ | 魂石/货币图标 |
| 文本配置 | text.json > ui.shop* | `assets/resources/config/text.json` | ✅ | 全部已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 贴图接入代码 | 尚无 `RenderAssetService.applySpriteById` 调用 | P2 |
| 角色/天赋头像 | 商店出售的角色和天赋卡片无图标 | P1 |
| Tab 标签样式 | 角色/天赋/扩展 Tab 标签无选中高亮贴图 | P3 |

---

## 3. 战斗模块 (Dungeon)

### 3.1 战斗 HUD — BattleHUD

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| HP 条背景 | hud_hpbar_bg | `textures/ui/hud/hud_hpbar_bg.png` | ✅ | HP 条底图 |
| HP 条填充 | hud_hpbar_fill | `textures/ui/hud/hud_hpbar_fill.png` | ✅ | HP 条填充色 |
| HP 条边框 | hud_hpbar_frame | `textures/ui/hud/hud_hpbar_frame.png` | ✅ | HP 条边框 |
| CD 遮罩 | hud_cdmask | `textures/ui/hud/hud_cdmask.png` | ✅ | 技能冷却遮罩 |
| 技能槽 | hud_skillslot | `textures/ui/hud/hud_skillslot.png` | ✅ | 技能槽背景 |
| 滚动按钮 | hud_rollbtn | `textures/ui/hud/hud_rollbtn.png` | ✅ | 翻滚/冲刺按钮 |
| 摇杆底座 | joystick_base | `textures/ui/hud/joystick_base.png` | ✅ | 虚拟摇杆底座 |
| 摇杆摇块 | joystick_dot | `textures/ui/hud/joystick_dot.png` | ✅ | 虚拟摇杆操作块 |
| 伤害数字 | 代码内 Label 创建 | — | ✅ | 运行时 Label 动态创建 |
| 字体 | 系统字体 | — | ✅ | |
| 文本配置 | text.json > ui.hp/floor/defeat/crit | `assets/resources/config/text.json` | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 贴图接入代码 | 所有 HUD 贴图尚无 `applySpriteById` 调用 | P2 |
| 技能图标 | 技能槽内当前无技能图标 | P3 |

### 3.2 虚拟摇杆 — VirtualJoystick

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 摇杆底座 | joystick_base | `textures/ui/hud/joystick_base.png` | ✅ | |
| 摇杆摇块 | joystick_dot | `textures/ui/hud/joystick_dot.png` | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 贴图接入代码 | 摇杆贴图尚无代码加载 | P2 |

### 3.3 技能 UI — SkillUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 技能槽 | hud_skillslot | `textures/ui/hud/hud_skillslot.png` | ✅ | 技能槽背景 |
| CD 遮罩 | hud_cdmask | `textures/ui/hud/hud_cdmask.png` | ✅ | 冷却遮罩 |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| **6 个技能图标** | 技能槽内显示图标，当前无加载 | **P1** |
| 贴图接入代码 | 技能槽背景无加载 | P2 |
| 技能图标文件 | icons/skills/ 下有 6 个图标文件 `icon_skill_*.png` 但 assets.json 未收录 | ⚠️ |

### 3.4 地牢地图 UI — DungeonMapUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 地图节点图标 | icon_room_combat/boss/event/healing/shop/treasure/upgrade | `textures/ui/map/` | ✅ | 7 种房间图标 |
| 地图路线线 | map_line | `textures/ui/map/map_line.png` | ✅ | 连接线 |
| 当前节点 | map_node_current | `textures/ui/map/map_node_current.png` | ✅ | 高亮当前房间 |
| 未探索节点 | map_node_unknown | `textures/ui/map/map_node_unknown.png` | ✅ | 未探索 |
| 已访问节点 | map_node_visited | `textures/ui/map/map_node_visited.png` | ✅ | 已清理 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 贴图接入代码 | 所有房间图标和地图节点尚无 `applySpriteById` | P2 |
| 房间节点预制体 | `roomNodePrefab` 属性目前为 null，运行时新建纯色 Sprite | P3 |

### 3.5 死亡/结算 UI — DeathUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 死亡背景 | death_bg | `textures/ui/death/death_bg.png` | ✅ | 死亡面板背景 |
| 结果面板 | result_panel | `textures/ui/death/result_panel.png` | ✅ | 结算结果框 |
| 魂石图标 | icon_soulstone | `textures/ui/death/icon_soulstone.png` | ✅ | 魂石图标 |
| 复活按钮贴图 | btn_revive_active/default | `textures/ui/death/` | ✅ | 复活按钮态 |
| 结算按钮贴图 | btn_settle_active/default | `textures/ui/death/` | ✅ | 结算按钮态 |
| 字体 | 系统字体 | — | ✅ | |
| 文本配置 | text.json | `assets/resources/config/text.json` | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 贴图接入代码 | 尚无 `applySpriteById` 调用 | P2 |

### 3.6 升级选择 UI — UpgradeUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 卡片边框 (普通) | card_frame_common | `textures/ui/upgrade/card_frame_common.png` | ✅ | 普通品质卡框 |
| 卡片边框 (稀有) | card_frame_rare | `textures/ui/upgrade/card_frame_rare.png` | ✅ | 稀有品质卡框 |
| 卡片边框 (史诗) | card_frame_epic | `textures/ui/upgrade/card_frame_epic.png` | ✅ | 史诗品质卡框 |
| 能力图标 | icon_ability_* (11 个) | `textures/ui/upgrade/` | ✅ | 11 种能力图标 |
| 遗物图标 | icon_relic_* (16 个) | `textures/ui/upgrade/` | ✅ | 16 种遗物图标 |
| 升级图标 | icon_upgrade_* (7 个) | `textures/ui/upgrade/` | ✅ | 7 种升级图标 |
| 文本配置 | text.json > ability/skill/relicPassive/relicActive | `assets/resources/config/text.json` | ✅ | 全部已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 贴图接入代码 | 卡片边框和图标尚无 `applySpriteById` 调用 | P2 |
| UpgradeUI 脚本 | 需确认是否已有代码接入逻辑 | ? |

### 3.7 事件 UI — EventUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 文本配置 | text.json > event.* | `assets/resources/config/text.json` | ✅ | 事件场景名 + 选项文字 |
| 字体 | 系统字体 | — | ✅ | |
| 特效 | fx_ui_glow | `textures/effects/ui/fx_ui_glow.png` | ✅ | 辉光特效 |
| 特效 | fx_ui_loading | `textures/effects/ui/fx_ui_loading.png` | ✅ | 加载特效 |
| 元素图标 | icon_element_* (6 个) | `textures/icons/elements/` | ✅ | 6 种元素图标 |
| 状态图标 | icon_buff_* / icon_debuff_* (10 个) | `textures/icons/buffs/` | ✅ | 增益/减益图标 |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 交互面板背景 | 事件面板当前纯色无贴图背景 | P2 |

### 3.8 装备 UI — EquipmentUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 装备身体框 | equip_body_frame | `textures/ui/equipment/equip_body_frame.png` | ✅ | 角色装备全身框 |
| 装备槽位 (8 种) | equip_slot_* | `textures/ui/equipment/` | ✅ | 头盔/胸甲/武器/手套 等 |
| 背包槽位 | inventory_slot | `textures/ui/equipment/inventory_slot.png` | ✅ | 背包格子 |
| 道具槽位 | item_slot | `textures/ui/equipment/item_slot.png` | ✅ | 道具格子 |
| 稀有度边框 (4 种) | rarity_common/magic/rare/legendary | `textures/ui/equipment/` | ✅ | 品质边框 |
| 套装计数器背景 | set_counter_bg | `textures/ui/equipment/set_counter_bg.png` | ✅ | 套装进度背景 |
| 装备图标 | icon_item_* (18 个) + item_* (4 个) | `textures/icons/items/` | ✅ | 道具 + 装备图标 |
| 套装图标 | icon_set_* (6 个) | `textures/icons/sets/` | ✅ | 6 种套装图标 |
| 字体 | 系统字体 | — | ✅ | |
| 文本配置 | text.json > ui.*equipment*/inventory* | `assets/resources/config/text.json` | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 贴图接入代码 | 装备/背包贴图尚无 `applySpriteById` 调用 | P2 |
| 装备图标 assets.json 注册 | 装备图标路径需从 `icons/items/` 注册到 assets.json | P2 |

### 3.9 背包 UI — InventoryUI

同 EquipmentUI 资源体系，复用装备/道具槽位和图标。

### 3.10 跑马灯 UI — MarqueeUI

| 资源类型 | 资源名称 | 文件路径 | 状态 | 备注 |
|---------|---------|---------|:----:|------|
| 文本配置 | text.json > ui.marquee* | `assets/resources/config/text.json` | ✅ | 全部已配置 |
| 字体 | 系统字体 | — | ✅ | |

**缺失资源**：
| 缺失项 | 说明 | 优先级 |
|--------|------|:------:|
| 跑马灯格位样式 | 跑马灯进度格无视觉样式 | P3 |
| 钥匙图标 | 跑马灯获得钥匙无图标展示 | P3 |

---

## 4. 跨界面共享资源

### 4.1 UI 通用资源

| 资源名称 | 文件路径 | 状态 | 用途 |
|---------|---------|:----:|------|
| panel_bg | `textures/ui/common/panel_bg.png` | ✅ | 所有面板的 PanelFrame 背景 |
| btn_default | `textures/ui/common/btn_default.png` | ✅ | 按钮默认态 |
| btn_active | `textures/ui/common/btn_active.png` | ✅ | 按钮点击态 |
| btn_hover | `textures/ui/common/btn_hover.png` | ✅ | 按钮悬停态 |
| btn_close | `textures/ui/common/btn_close.png` | ✅ | 关闭按钮 |

### 4.2 特效资源

| 资源名称 | 文件路径 | 状态 | 用途 |
|---------|---------|:----:|------|
| fx_crit | `textures/effects/combat/fx_crit.png` | ✅ | 暴击特效 |
| fx_dash | `textures/effects/combat/fx_dash.png` | ✅ | 闪避特效 |
| fx_dodge | `textures/effects/combat/fx_dodge.png` | ✅ | 闪避特效 |
| fx_heal | `textures/effects/combat/fx_heal.png` | ✅ | 治疗特效 |
| fx_hit_normal | `textures/effects/combat/fx_hit_normal.png` | ✅ | 普通攻击命中 |
| fx_shield | `textures/effects/combat/fx_shield.png` | ✅ | 护盾特效 |
| fx_reaction_* (11 个) | `textures/effects/reactions/` | ✅ | 元素反应特效 |
| fx_relic_* (8 个) | `textures/effects/relics/` | ✅ | 遗物释放特效 |
| fx_ui_glow/loading | `textures/effects/ui/` | ✅ | UI 辉光/加载 |

### 4.3 背景纹理

| 资源组 | 条目数 | 路径 | 状态 | 已接入 |
|-------|:-----:|------|:----:|:-----:|
| bg_combat_* (6 区) | 6 | `textures/backgrounds/` | ✅ | ✅ 已通过 DungeonSceneInstaller 接入 |
| bg_event_* (6 区) | 6 | `textures/backgrounds/` | ✅ | ✅ 已接入 |
| bg_room_* (5 种) | 5 | `textures/backgrounds/` | ✅ | ✅ 已接入 |

### 4.4 角色和怪物纹理

| 资源组 | 条目数 | 路径 | 状态 | 已接入 |
|-------|:-----:|------|:----:|:-----:|
| 角色动作 (5 角色 × 7 动作) | 35 | `textures/characters/*/` | ✅ | ✅ 已通过 RenderAssetService 接入 |
| 怪物 idle (6 区 × 6 怪) | 36 | `textures/monsters/*/` | ✅ | ✅ 已接入 |
| Boss (10 Boss × 6 动作) | 60 | `textures/bosses/finalboss/` | ✅ | ⏳ 待接入 Boss 战斗系统 |
| Miniboss | 0 | `textures/bosses/miniboss/` | ❌ | 无文件 |
| Tiles (6 区 × 4 类) | 24 | `textures/tiles/*/` | ✅ | ✅ 已接入 |

### 4.5 图标资源（待注册到 assets.json）

以下目录有文件但 `assets/resources/config/assets.json` **未收录**：

| 目录 | 文件数 | 建议 resourceId 前缀 | 状态 |
|------|:-----:|---------------------|:----:|
| `icons/buffs/` | 10 | `textures/icons/buffs/icon_buff/debuff_*` | ⚠️ 缺条目 |
| `icons/elements/` | 6 | `textures/icons/elements/icon_element_*` | ⚠️ 缺条目 |
| `icons/items/` | 23 | `textures/icons/items/icon_item_*` | ⚠️ 缺条目 |
| `icons/relics/` | 16 | `textures/icons/relics/icon_relic_*` | ⚠️ 缺条目 |
| `icons/sets/` | 6 | `textures/icons/sets/icon_set_*` | ⚠️ 缺条目 |
| `icons/skills/` | 6 | `textures/icons/skills/icon_skill_*` | ⚠️ 缺条目 |

> 这些图标文件在磁盘上存在，但 assets.json 中没有对应的资源 ID 映射。如需通过 `RenderAssetService` 加载，必须先注册。

### 4.6 UI 特效 / UI 装饰（待注册到 assets.json）

| 目录 | 文件数 | 状态 |
|------|:-----:|:----:|
| `effects/combat/` | 6 | ⚠️ 缺 assets.json 条目 |
| `effects/reactions/` | 11 | ⚠️ 缺 assets.json 条目 |
| `effects/relics/` | 8 | ⚠️ 缺 assets.json 条目 |
| `effects/ui/` | 2 | ⚠️ 缺 assets.json 条目 |

---

## 5. 配置文件清单

| 配置文件 | 路径 | 状态 | 说明 |
|---------|------|:----:|------|
| 文本配置 | `assets/resources/config/text.json` | ✅ | 全局 UI 文本，312 行 |
| 资源映射 | `assets/resources/config/assets.json` | ✅ | 427 条资源映射 |
| 美术提示词 | `assets/resources/config/prompts.json` | ✅ | AI 生成提示词 418 条 |
| AI 生成进度 | `art_source/*progress*` | ✅ | 全量 + 179 补齐 |
| 视觉审计清单 | `art_source/textures_audit_manifest.csv` | ✅ | 审计清单 |
| UI 设计稿 | `docs/三场景完整结构树.md` | ✅ | 场景节点完整结构 |
| 资源对照表 | `docs/UI资源对照表.md` | ✅ | 本文档 |

---

## 6. 缺失资源汇总（按优先级排序）

### P0 — 界面功能性缺失，影响核心体验

| 资源 | 所属界面 | 说明 |
|------|---------|------|
| 🖼 5 个角色模型图 | CreatePanel > ModelDisplay | 选职业时的角色预览图，当前仅为文字 |
| 🖼 5 个职业动物头像 | CreatePanel > CardRoot 职业按钮 | 5 个简单图标（熊/鹿/狐/兔/猪头像） |
| 🖼 5 个角色头像/卡片 | CharacterPanel > SlotContainer | 角色管理界面的角色卡片，当前仅文字 |

### P1 — 视觉呈现缺失，影响体验完整度

| 资源 | 所属界面 | 说明 |
|------|---------|------|
| 🖼 6 个技能图标 | SkillUI > 技能槽 | icons/skills/ 下已有文件，assets.json 未收录 |
| 🖼 区域预览图 | AreaSelectPanel | 路线选择时无区域缩略图 |
| 🖼 角色/天赋头像 | ShopUI | 商店出售商品无贴图 |
| ⚙ 图标资源注册到 assets.json | 公共 | icons/items/relics/sets/buffs/elements/skills 共 67 文件缺映射 |

### P2 — 代码接入缺失（所有面板通用）

| 缺失项 | 涉及界面 | 说明 |
|--------|---------|------|
| panel_bg 接入 | 全部 7 个面板 | PanelFrame 的 Sprite 尚无 `applySpriteById` |
| btn_default/active/hover 接入 | 全部按钮 | Button 组件无贴图加载 |
| HUD 贴图接入 | BattleHUD/VirtualJoystick/SkillUI | 所有 HUD 组件无贴图加载 |
| 地图贴图接入 | DungeonMapUI/AreaSelectPanel | 房间图标/路线节点无贴图加载 |
| 装备/背包贴图接入 | EquipmentUI/InventoryUI | 装备槽位/道具槽位无贴图加载 |
| 结算贴图接入 | SettlementPanel/DeathUI | 结算面板/死亡面板无贴图加载 |

### P3 — 增强性需求

| 缺失项 | 涉及界面 | 说明 |
|--------|---------|------|
| 主城角色头像 | MainHubUI > TopBar | 角色名旁无头像 |
| 微信/QQ 品牌图标 | LoginPanel | 微信登录按钮无品牌标识 |
| 胜利/失败过渡特效 | SettlementPanel | 结算入场无粒子/动画 |
| 锁图标 | CharacterPanel | 锁定角色槽位需锁图标 |
| Tab 标签高亮 | ShopUI | 商店 Tab 切换无选中态 |
| 跑马灯格位样式 | MarqueeUI | 跑马灯进度无视觉 |

---

## 7. 资源接入标准操作流程

为每个 UI 组件接入美术资源的标准步骤：

```
Step 1 — 确认图片文件在 textures/ui/<分类>/ 目录下
Step 2 — 确认 assets/resources/config/assets.json 中有对应条目
         (type: "SpriteFrame", bundle: "resources")
Step 3 — 在面板脚本中 import { RenderAssetService } from '../assets/RenderAssetService'
Step 4 — 在 open() / onLoad() 中调用：
         await RenderAssetService.applySpriteById(node, 'textures/ui/<分类>/<资源名>')
Step 5 — 如果 assets.json 缺少条目，手动补入后运行 validate:all
```

---

> 最后更新: 2026-07-06  
> 对应 commit: `adfa332`
