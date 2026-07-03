# 三场景自适应 UI 与面板结构实施方案

> 适用范围：`splash.scene`、`main.scene`、`dungeon.scene`  
> 目标平台：微信小游戏，横屏优先，兼容不同宽高比、刘海屏、安全区、浏览器预览窗口变化。  
> 核心原则：所有 UI 结构一次按正式标准落地，不再使用临时固定尺寸方案。

---

## 1. 总目标

本方案解决三类问题：

1. **面板重叠**：Panel 打开后文字直接叠在主城 UI 上。
2. **分辨率写死**：`PanelRoot 1280x720`、`DimMask 1280x720`、`PanelFrame 820x560` 这类固定配置无法适配不同屏幕。
3. **结构混乱**：背景、遮罩、内容节点混在一起，后续改 UI、加滚动列表、做动画都容易返工。

最终统一为：

```text
Canvas
├── MainUI / SplashUI / DungeonSceneController
├── XxxPanel
│   └── PanelRoot                 active=false
│       ├── DimMask               全屏遮罩
│       └── PanelFrame            面板底板
│           └── ContentRoot       内容容器
└── ...
```

但注意：**这套 PanelRoot 结构只用于弹窗/面板类 UI**。  
`splash.scene` 和 `dungeon.scene` 有自己的自适应规则，不能把所有节点都强行套成 PanelRoot。

---

## 2. 全局 UI 自适应底座

### 2.1 必须新增/完善的组件

当前已有：

```text
assets/scripts/ui/ResponsivePanelRoot.ts
```

还需要新增：

```text
assets/scripts/ui/ResponsivePanelContent.ts
```

建议后续再加：

```text
assets/scripts/ui/layout/LoginPanelLayout.ts
assets/scripts/ui/layout/CreatePanelLayout.ts
assets/scripts/ui/layout/AreaSelectPanelLayout.ts
assets/scripts/ui/layout/CharacterPanelLayout.ts
assets/scripts/ui/layout/SettlementPanelLayout.ts
assets/scripts/ui/layout/SettingsPanelLayout.ts
assets/scripts/ui/layout/AdventureLogPanelLayout.ts
assets/scripts/ui/layout/SplashLayout.ts
assets/scripts/ui/layout/DungeonHudLayout.ts
```

### 2.2 ResponsivePanelRoot 职责

挂载位置：

```text
PanelRoot
```

负责：

```text
PanelRoot  铺满 Canvas 可视区域
DimMask    铺满 PanelRoot
PanelFrame 根据屏幕比例计算大小，并限制 min/max
```

正式版代码要求：

```ts
import { _decorator, Component, Node, UITransform, view, Vec3, clamp } from 'cc';
import { ResponsivePanelContent } from './ResponsivePanelContent';

const { ccclass, property, menu } = _decorator;

@ccclass('ResponsivePanelRoot')
@menu('UI/ResponsivePanelRoot')
export class ResponsivePanelRoot extends Component {
    @property(Node)
    dimMask: Node | null = null;

    @property(Node)
    panelFrame: Node | null = null;

    @property
    frameWidthRatio = 0.72;

    @property
    frameHeightRatio = 0.78;

    @property
    maxFrameWidth = 900;

    @property
    maxFrameHeight = 620;

    @property
    minFrameWidth = 520;

    @property
    minFrameHeight = 360;

    onLoad(): void {
        this.applyLayout();
        view.on('canvas-resize', this.applyLayout, this);
        view.on('design-resolution-changed', this.applyLayout, this);
    }

    onEnable(): void {
        this.applyLayout();
    }

    onDestroy(): void {
        view.off('canvas-resize', this.applyLayout, this);
        view.off('design-resolution-changed', this.applyLayout, this);
    }

    applyLayout(): void {
        const visible = view.getVisibleSize();
        let canvasW = visible.width;
        let canvasH = visible.height;

        const parent = this.node.parent;
        const parentTrans = parent?.getComponent(UITransform);
        if (parentTrans && parentTrans.width > 0 && parentTrans.height > 0) {
            canvasW = parentTrans.width;
            canvasH = parentTrans.height;
        }

        const rootTrans = this.node.getComponent(UITransform);
        if (rootTrans) {
            rootTrans.setContentSize(canvasW, canvasH);
        }
        this.node.setPosition(Vec3.ZERO);

        if (this.dimMask) {
            const maskTrans = this.dimMask.getComponent(UITransform);
            if (maskTrans) {
                maskTrans.setContentSize(canvasW, canvasH);
            }
            this.dimMask.setPosition(Vec3.ZERO);
        }

        if (this.panelFrame) {
            const frameTrans = this.panelFrame.getComponent(UITransform);
            if (frameTrans) {
                const w = clamp(canvasW * this.frameWidthRatio, this.minFrameWidth, this.maxFrameWidth);
                const h = clamp(canvasH * this.frameHeightRatio, this.minFrameHeight, this.maxFrameHeight);
                frameTrans.setContentSize(w, h);
            }
            this.panelFrame.setPosition(Vec3.ZERO);

            const content = this.panelFrame.getChildByName('ContentRoot');
            content?.getComponent(ResponsivePanelContent)?.applyLayout();
        }
    }
}
```

### 2.3 ResponsivePanelContent 职责

挂载位置：

```text
PanelFrame/ContentRoot
```

负责：

```text
ContentRoot 自动跟随 PanelFrame 尺寸
保留统一 padding
居中
```

正式版代码：

```ts
import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('ResponsivePanelContent')
@menu('UI/ResponsivePanelContent')
export class ResponsivePanelContent extends Component {
    @property(Node)
    panelFrame: Node | null = null;

    @property
    paddingX = 48;

    @property
    paddingY = 56;

    onLoad(): void {
        this.applyLayout();
    }

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const frame = this.panelFrame ?? this.node.parent;
        if (!frame) return;

        const frameTrans = frame.getComponent(UITransform);
        const contentTrans = this.node.getComponent(UITransform);
        if (!frameTrans || !contentTrans) return;

        const width = Math.max(0, frameTrans.width - this.paddingX * 2);
        const height = Math.max(0, frameTrans.height - this.paddingY * 2);

        contentTrans.setContentSize(width, height);
        this.node.setPosition(Vec3.ZERO);
    }
}
```

### 2.4 PanelRoot 标准节点结构

所有主城弹窗面板统一：

```text
XxxPanel                         active=true
└── PanelRoot                    active=false
    ├── DimMask                  UITransform + Sprite
    └── PanelFrame               UITransform + Sprite
        └── ContentRoot          UITransform + ResponsivePanelContent
```

组件要求：

```text
PanelRoot:
  UITransform
  ResponsivePanelRoot

DimMask:
  UITransform
  Sprite
  Color: #000000
  Alpha: 120~180

PanelFrame:
  UITransform
  Sprite
  使用 UI 面板底图或临时纯色底

ContentRoot:
  UITransform
  ResponsivePanelContent
```

绑定要求：

```text
ResponsivePanelRoot.dimMask    -> DimMask
ResponsivePanelRoot.panelFrame -> PanelFrame

ResponsivePanelContent.panelFrame -> PanelFrame
```

---

## 3. main.scene 实施方案

### 3.1 哪些 PanelRoot 必须改

`main.scene` 中以下全部必须改成标准结构：

```text
Canvas/LoginPanel/PanelRoot
Canvas/CreatePanel/PanelRoot
Canvas/CharacterPanel/PanelRoot
Canvas/AreaSelectPanel/PanelRoot
Canvas/SettlementPanel/PanelRoot
Canvas/SettingsPanel/PanelRoot
Canvas/AdventureLogPanel/PanelRoot
```

保持规则：

```text
XxxPanel.active = true
PanelRoot.active = false
```

不要把 `XxxPanel` 主节点隐藏，否则 `onLoad()` 不执行，`UiRouter` 注册会不稳定。

### 3.2 当前项目现状

截至本方案编写时，场景实际状态是：

```text
所有 PanelRoot active=false              正确
所有 PanelRoot size=100x100              需要修
只有 LoginPanel 有 DimMask/PanelFrame    未全量落地
所有 PanelRoot 未挂 ResponsivePanelRoot  需要修
LoginPanel 缺 ContentRoot                需要修
```

### 3.3 每个面板推荐尺寸参数

只配置比例和 min/max，不手动写死运行时尺寸。

| 面板 | frameWidthRatio | frameHeightRatio | minFrameWidth | minFrameHeight | maxFrameWidth | maxFrameHeight |
|------|-----------------|------------------|---------------|----------------|---------------|----------------|
| LoginPanel | 0.50 | 0.58 | 520 | 360 | 640 | 460 |
| CreatePanel | 0.72 | 0.78 | 680 | 500 | 900 | 620 |
| CharacterPanel | 0.74 | 0.80 | 720 | 520 | 940 | 620 |
| AreaSelectPanel | 0.78 | 0.80 | 720 | 520 | 980 | 640 |
| SettlementPanel | 0.58 | 0.72 | 560 | 420 | 720 | 560 |
| SettingsPanel | 0.50 | 0.62 | 520 | 360 | 640 | 460 |
| AdventureLogPanel | 0.58 | 0.70 | 560 | 400 | 720 | 520 |

ContentRoot 默认：

```text
paddingX = 48
paddingY = 56
```

复杂面板可微调：

```text
CreatePanel paddingX=56 paddingY=64
AreaSelectPanel paddingX=56 paddingY=64
CharacterPanel paddingX=56 paddingY=64
```

### 3.4 节点迁移规则

迁移前常见错误结构：

```text
PanelRoot
├── TitleLabel
├── Button
├── ListRoot
```

迁移后正式结构：

```text
PanelRoot
├── DimMask
└── PanelFrame
    └── ContentRoot
        ├── TitleLabel
        ├── Button
        └── ListRoot
```

移动后必须检查脚本字段引用：

```text
panelRoot       -> XxxPanel/PanelRoot
titleLabel      -> XxxPanel/PanelRoot/PanelFrame/ContentRoot/TitleLabel
button字段      -> XxxPanel/PanelRoot/PanelFrame/ContentRoot/对应按钮
container字段   -> XxxPanel/PanelRoot/PanelFrame/ContentRoot/对应容器
```

重点：`panelRoot` 永远绑定 `PanelRoot`，不要绑 `ContentRoot`。

### 3.5 main.scene 各面板内容结构

#### LoginPanel

```text
LoginPanel
└── PanelRoot
    ├── DimMask
    └── PanelFrame
        └── ContentRoot
            ├── TitleLabel          LocalizedLabel(ui.loginTitle)
            ├── SubtitleLabel       LocalizedLabel(ui.loginSubtitle)
            ├── WechatBtn
            │   └── Label           LocalizedLabel(ui.loginWechat)
            ├── GuestBtn
            │   └── Label           LocalizedLabel(ui.loginGuest)
            ├── AgreementLabel      LocalizedLabel(ui.loginAgreement)
            └── StatusLabel         动态文本，不挂 LocalizedLabel
```

#### CreatePanel

```text
CreatePanel
└── PanelRoot
    ├── DimMask
    └── PanelFrame
        └── ContentRoot
            ├── TitleLabel              LocalizedLabel(ui.createTitle)
            ├── NameInput
            │   └── PlaceholderLabel    LocalizedLabel(ui.createNamePlaceholder)
            ├── CardRoot                动态卡片容器
            ├── SelectedInfo            动态文本，不挂 LocalizedLabel
            ├── SelectedDesc            动态文本，不挂 LocalizedLabel
            ├── ConfirmBtn
            │   └── Label               LocalizedLabel(ui.createConfirm)
            ├── SkipBtn                 LocalizedLabel(ui.createSkip)
            └── ErrorLabel              动态错误文本，不挂 LocalizedLabel
```

`CreatePanel.ts` 必须满足：

```ts
animalLbl.string = T(opt.animalKey);
classLbl.string = T(opt.classKey);
selectedDesc.string = T(opt.descKey);
```

并修复卡片节点：

```ts
const classNode = new Node('Class');
classNode.setPosition(0, -5);
const classLbl = classNode.addComponent(Label);
classLbl.string = T(opt.classKey);
card.addChild(classNode);
```

默认角色名不要写死：

```ts
pdm.createCharacter(T('ui.defaultCharacterName'), 'warrior');
```

#### CharacterPanel

```text
CharacterPanel
└── PanelRoot
    ├── DimMask
    └── PanelFrame
        └── ContentRoot
            ├── TitleLabel          LocalizedLabel(ui.charTitle)
            ├── SoulStoneLabel      动态文本，不挂 LocalizedLabel
            ├── CurrentName         动态文本，不挂 LocalizedLabel
            ├── CurrentInfo         动态文本，不挂 LocalizedLabel
            ├── CurrentStats        动态文本，不挂 LocalizedLabel
            ├── SlotContainer       动态列表容器
            └── CloseBtn
                └── Label           LocalizedLabel(ui.close)
```

`CharacterPanel.ts` 中英文硬编码必须迁移：

```text
Bear Warrior / Deer Archer / Select / Unlock / Soul Stones / Total runs
```

全部改为：

```ts
T('class.bearWarrior')
T('ui.charSelect')
T('ui.charUnlock')
T('ui.charSoulStones', { count })
T('ui.charStats', { count })
```

#### AreaSelectPanel

```text
AreaSelectPanel
└── PanelRoot
    ├── DimMask
    └── PanelFrame
        └── ContentRoot
            ├── PlayerInfo          动态文本，不挂 LocalizedLabel
            ├── RouteContainer      动态路线卡容器
            ├── LockedContainer     动态锁定提示容器
            ├── StartBtn
            │   └── Label           LocalizedLabel(ui.areaStart)
            └── BackBtn
                └── Label           LocalizedLabel(ui.areaBack)
```

`ROUTES` 必须保持结构化，不再使用英文条件字符串：

```ts
type UnlockCondition =
    | { type: 'none' }
    | { type: 'clear_zone'; zoneId: string; count: number }
    | { type: 'reach_floor'; zoneId?: string; floor: number }
    | { type: 'player_level'; level: number };
```

`reach_floor` 暂时不要启用，除非 `PlayerDataManager` 增加真正的区域最高层记录。当前 `getBestFloor(zoneId)` 返回的是通关次数，不是真正楼层。

#### SettlementPanel

```text
SettlementPanel
└── PanelRoot
    ├── DimMask
    └── PanelFrame
        └── ContentRoot
            ├── TitleLabel          动态文本，不挂 LocalizedLabel
            ├── ZoneLabel           动态文本，不挂 LocalizedLabel
            ├── FloorLabel          动态文本，不挂 LocalizedLabel
            ├── KillLabel           动态文本，不挂 LocalizedLabel
            ├── SoulStoneLabel      动态文本，不挂 LocalizedLabel
            ├── TimeLabel           动态文本，不挂 LocalizedLabel
            ├── DoubleBtn
            │   └── Label           LocalizedLabel(ui.settlementDouble)
            └── BackBtn
                └── Label           LocalizedLabel(ui.settlementBack)
```

`SettlementPanel.ts` 必须把以下硬编码迁移到 `T()`：

```text
Adventure Complete
Victory!
Reached:
Floor:
Defeated:
Soul Stones:
Time:
```

#### SettingsPanel

```text
SettingsPanel
└── PanelRoot
    ├── DimMask
    └── PanelFrame
        └── ContentRoot
            ├── VersionLabel        动态文本，不挂 LocalizedLabel
            ├── AccountLabel        动态文本，不挂 LocalizedLabel
            ├── ResetBtn
            │   └── Label           LocalizedLabel(ui.settingsReset)
            └── CloseBtn
                └── Label           LocalizedLabel(ui.close)
```

`SettingsPanel.ts` 中账号、版本文本必须用：

```ts
T('ui.settingsVersion', { ver })
T('ui.settingsAccount', { type, id })
```

#### AdventureLogPanel

```text
AdventureLogPanel
└── PanelRoot
    ├── DimMask
    └── PanelFrame
        └── ContentRoot
            ├── TitleLabel          LocalizedLabel(ui.logTitle)
            ├── TotalRunsLabel      动态文本，不挂 LocalizedLabel
            ├── BestFloorLabel      动态文本，不挂 LocalizedLabel
            ├── TotalKillsLabel     动态文本，不挂 LocalizedLabel
            ├── SoulStonesLabel     动态文本，不挂 LocalizedLabel
            └── CloseBtn
                └── Label           LocalizedLabel(ui.close)
```

`AdventureLogPanel.ts` 必须使用：

```ts
T('ui.logTotalRuns', { count })
T('ui.logBestFloor', { floor })
T('ui.logTotalKills', { count })
T('ui.logSoulStones', { count })
```

### 3.6 main.scene 布局脚本建议

复杂面板不要靠手摆死坐标，建议逐步新增：

```text
LoginPanelLayout
CreatePanelLayout
CharacterPanelLayout
AreaSelectPanelLayout
SettlementPanelLayout
SettingsPanelLayout
AdventureLogPanelLayout
```

职责：

```text
读取 ContentRoot 当前尺寸
计算内部节点位置
按钮、标题、列表自动按区域排布
```

示例：

```ts
applyLayout(): void {
    const size = this.contentRoot.getComponent(UITransform)!.contentSize;
    this.titleLabel?.setPosition(0, size.height / 2 - 44);
    this.primaryButton?.setPosition(0, -size.height / 2 + 56);
}
```

---

## 4. splash.scene 实施方案

### 4.1 splash 不使用 PanelRoot

`splash.scene` 不是弹窗场景，不需要：

```text
PanelRoot / DimMask / PanelFrame / ContentRoot
```

它应该使用独立的全屏启动布局：

```text
Canvas
└── SplashUI
    ├── SplashImage
    ├── LoadingBar
    ├── LoadingLabel
    └── SkipButton
        └── Label
```

### 4.2 SplashUI 自适应目标

需要适配：

```text
16:9 横屏
20:9 横屏
浏览器预览窗口缩放
微信小游戏安全区
```

规则：

```text
SplashImage 居中铺底，按 cover 或 contain 策略
LoadingBar 始终在底部安全区上方
LoadingLabel 在 LoadingBar 下方或上方
SkipButton 在右上安全区内
```

### 4.3 建议新增 SplashLayout

文件：

```text
assets/scripts/ui/layout/SplashLayout.ts
```

挂载位置：

```text
Canvas/SplashUI
```

字段：

```ts
@property(Node) splashImage
@property(Node) loadingBar
@property(Node) loadingLabel
@property(Node) skipButton
```

核心逻辑：

```ts
import { _decorator, Component, Node, UITransform, view, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SplashLayout')
export class SplashLayout extends Component {
    @property(Node) splashImage: Node | null = null;
    @property(Node) loadingBar: Node | null = null;
    @property(Node) loadingLabel: Node | null = null;
    @property(Node) skipButton: Node | null = null;

    onLoad(): void {
        this.applyLayout();
        view.on('canvas-resize', this.applyLayout, this);
        view.on('design-resolution-changed', this.applyLayout, this);
    }

    onDestroy(): void {
        view.off('canvas-resize', this.applyLayout, this);
        view.off('design-resolution-changed', this.applyLayout, this);
    }

    applyLayout(): void {
        const size = view.getVisibleSize();
        const halfW = size.width / 2;
        const halfH = size.height / 2;
        const margin = 36;

        const rootTrans = this.node.getComponent(UITransform);
        rootTrans?.setContentSize(size.width, size.height);

        this.splashImage?.setPosition(Vec3.ZERO);
        this.loadingBar?.setPosition(0, -halfH + 96, 0);
        this.loadingLabel?.setPosition(0, -halfH + 58, 0);
        this.skipButton?.setPosition(halfW - margin - 60, halfH - margin - 24, 0);
    }
}
```

### 4.4 SplashUI 代码要改的点

当前 `SplashUI.ts` 在 `_createProgressBar()` 中写死：

```ts
container.setPosition(0, -100);
```

正式方案：

1. `LoadingBar` 仍可由代码创建。
2. 创建后保存为字段。
3. 交给 `SplashLayout` 定位。

建议修改：

```ts
@property(Node)
loadingBar: Node | null = null;

private _createProgressBar(): void {
    const container = this.loadingBar ?? new Node('LoadingBar');
    if (!container.parent) this.node.addChild(container);
    this.loadingBar = container;
    ...
}
```

然后 `SplashLayout.loadingBar` 绑定该节点。

### 4.5 splash.scene 验收

```text
浏览器窗口缩放后：
  SplashImage 不偏到角落
  LoadingBar 仍在底部安全区域
  LoadingLabel 不压住 LoadingBar
  SkipButton 在右上角且不出屏
  LocalizedLabel:
    SkipButton/Label -> ui.skip
    LoadingLabel -> ui.loading
```

---

## 5. dungeon.scene 实施方案

### 5.1 dungeon 不套主城 PanelRoot

`dungeon.scene` 是运行时战斗场景，不应该把整个战斗 UI 当作 main 的 PanelRoot 弹窗处理。

它已有运行时结构：

```text
Canvas
├── World
│   ├── BackgroundLayer
│   ├── TileLayer
│   ├── ActorLayer
│   ├── EffectLayer
│   └── DoorLayer
├── Systems
└── UIRoot
```

这是正确方向。

### 5.2 dungeon 需要的自适应对象

需要自适应的是：

```text
UIRoot
BattleHUD
VirtualJoystick
SkillUI
DungeonMapUI
UpgradeUI
DeathUI
EquipmentUI
InventoryUI
```

其中：

```text
BattleHUD / Joystick / SkillUI / MapUI 是常驻 HUD
UpgradeUI / DeathUI / EquipmentUI / InventoryUI 是战斗内弹窗
```

战斗内弹窗可以复用：

```text
PanelRoot / DimMask / PanelFrame / ContentRoot
ResponsivePanelRoot / ResponsivePanelContent
```

常驻 HUD 不使用 PanelRoot，使用 HUD 布局组件。

### 5.3 UIRoot 自适应

当前 `DungeonSceneInstaller.ts` 写死：

```ts
F.ensureTransform(uiRoot, 1280, 720);
```

正式方案：新增 `ResponsiveUIRoot`。

文件：

```text
assets/scripts/ui/ResponsiveUIRoot.ts
```

代码：

```ts
import { _decorator, Component, UITransform, view, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('ResponsiveUIRoot')
export class ResponsiveUIRoot extends Component {
    onLoad(): void {
        this.applyLayout();
        view.on('canvas-resize', this.applyLayout, this);
        view.on('design-resolution-changed', this.applyLayout, this);
    }

    onDestroy(): void {
        view.off('canvas-resize', this.applyLayout, this);
        view.off('design-resolution-changed', this.applyLayout, this);
    }

    applyLayout(): void {
        const size = view.getVisibleSize();
        this.node.getComponent(UITransform)?.setContentSize(size.width, size.height);
        this.node.setPosition(Vec3.ZERO);
    }
}
```

`DungeonSceneInstaller` 中：

```ts
const uiRoot = F.ensureChild(canvas, 'UIRoot');
F.ensureComponent<ResponsiveUIRoot>(uiRoot, ResponsiveUIRoot);
```

### 5.4 DungeonHudLayout

文件：

```text
assets/scripts/ui/layout/DungeonHudLayout.ts
```

挂载位置：

```text
UIRoot
```

字段：

```ts
@property(Node) battleHUD
@property(Node) joystick
@property(Node) skillUI
@property(Node) dungeonMapUI
```

布局规则：

```text
BattleHUD       左上安全区
VirtualJoystick 左下安全区
SkillUI         右下安全区
DungeonMapUI    右上安全区
```

核心代码：

```ts
import { _decorator, Component, Node, view } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('DungeonHudLayout')
export class DungeonHudLayout extends Component {
    @property(Node) battleHUD: Node | null = null;
    @property(Node) joystick: Node | null = null;
    @property(Node) skillUI: Node | null = null;
    @property(Node) dungeonMapUI: Node | null = null;

    onLoad(): void {
        this.applyLayout();
        view.on('canvas-resize', this.applyLayout, this);
        view.on('design-resolution-changed', this.applyLayout, this);
    }

    onDestroy(): void {
        view.off('canvas-resize', this.applyLayout, this);
        view.off('design-resolution-changed', this.applyLayout, this);
    }

    applyLayout(): void {
        const size = view.getVisibleSize();
        const halfW = size.width / 2;
        const halfH = size.height / 2;
        const margin = 36;

        this.battleHUD?.setPosition(-halfW + margin + 120, halfH - margin - 40);
        this.joystick?.setPosition(-halfW + margin + 120, -halfH + margin + 120);
        this.skillUI?.setPosition(halfW - margin - 180, -halfH + margin + 90);
        this.dungeonMapUI?.setPosition(halfW - margin - 180, halfH - margin - 120);
    }
}
```

### 5.5 dungeon 弹窗 UI

以下 UI 如果是弹窗，使用和 main 相同的 PanelRoot 标准：

```text
UpgradeUI
DeathUI
EquipmentUI
InventoryUI
```

结构：

```text
UIRoot/UpgradeUI
└── PanelRoot
    ├── DimMask
    └── PanelFrame
        └── ContentRoot
```

区别：

```text
dungeon 弹窗挂在 UIRoot 下
main 弹窗挂在 Canvas 下
```

### 5.6 dungeon World 层不要跟 UI 一起缩放

`World` 的职责是战斗场景内容：

```text
BackgroundLayer
TileLayer
ActorLayer
EffectLayer
DoorLayer
```

不要因为 UI 适配去缩放 `World`。  
World 的适配应该单独处理：

```text
背景图 cover/contain
网格居中
摄像机/Canvas 视口策略
```

当前阶段重点是 UI，不改战斗坐标系统。

### 5.7 dungeon 验收

```text
1280x720:
  HUD 四角布局正常
  joystick 不遮挡 FPS/按钮
  skillUI 在右下

宽屏:
  HUD 仍贴安全边距
  不集中挤在 1280x720 旧位置

窄屏:
  joystick 和 skillUI 不重叠
  BattleHUD 不出屏

弹窗:
  UpgradeUI / DeathUI 打开时有遮罩
  内容在 PanelFrame 内
```

---

## 6. 文本与动态 Label 规则

所有场景共用：

### 6.1 固定文本

固定文本挂 `LocalizedLabel`：

```text
按钮文本
标题文本
关闭按钮
静态说明
```

示例：

```text
StartBtn/Label -> LocalizedLabel(ui.areaStart)
CloseBtn/Label -> LocalizedLabel(ui.close)
```

### 6.2 动态文本

带 `{}` 参数的 key 不挂普通 `LocalizedLabel`。

示例：

```text
ui.soulStones = 魂石: {count}
ui.charLevel = Lv{level}
ui.areaPlayerInfo = 角色: {character} Lv{level} 魂石: {stones}
```

必须代码刷新：

```ts
label.string = T('ui.soulStones', { count });
```

### 6.3 代码动态创建 Label

代码动态创建的 Label 不能写英文/中文硬编码。

错误：

```ts
label.string = 'Soul Stones: ' + count;
```

正确：

```ts
label.string = T('ui.soulStones', { count });
```

---

## 7. ROUTES 解锁配置标准

### 7.1 禁止写人类可读条件字符串

禁止：

```ts
unlockCondition: 'Clear Emerald Forest 1 time'
```

必须：

```ts
unlock: { type: 'clear_zone', zoneId: 'forest', count: 1 },
unlockTextKey: 'ui.unlockClearZone',
```

### 7.2 UnlockCondition 标准

```ts
export type UnlockCondition =
    | { type: 'none' }
    | { type: 'clear_zone'; zoneId: string; count: number }
    | { type: 'reach_floor'; zoneId?: string; floor: number }
    | { type: 'player_level'; level: number };
```

### 7.3 当前限制

`reach_floor` 暂时不要用于正式配置，除非先修 `PlayerDataManager`：

当前问题：

```ts
getBestFloor(zoneId) 当前返回 zoneClearCounts[zoneId]
```

这不是区域最高层。

正式修法：

```ts
zoneBestFloors: Record<string, number>

getBestFloor(): number
getZoneBestFloor(zoneId: string): number
setZoneBestFloor(zoneId: string, floor: number): void
```

---

## 8. 实施顺序

### P0：底座组件

1. 完善 `ResponsivePanelRoot.ts`
2. 新增 `ResponsivePanelContent.ts`
3. 新增 `ResponsiveUIRoot.ts`
4. 新增 `SplashLayout.ts`
5. 新增 `DungeonHudLayout.ts`

### P1：main.scene 面板结构

1. 7 个 PanelRoot 全部补：
   ```text
   DimMask
   PanelFrame
   PanelFrame/ContentRoot
   ```
2. 所有 PanelRoot 挂 `ResponsivePanelRoot`
3. 所有 ContentRoot 挂 `ResponsivePanelContent`
4. 内容节点全部移动到 ContentRoot
5. 重新检查脚本字段绑定

### P2：splash.scene 自适应

1. SplashUI 挂 `SplashLayout`
2. LoadingBar 从固定 `y=-100` 改为布局组件定位
3. SkipButton 走右上安全区
4. SplashImage 居中适配

### P3：dungeon.scene 自适应

1. UIRoot 挂 `ResponsiveUIRoot`
2. UIRoot 挂 `DungeonHudLayout`
3. BattleHUD、Joystick、SkillUI、MapUI 绑定到布局组件
4. UpgradeUI/DeathUI/EquipmentUI/InventoryUI 按 PanelRoot 标准改造

### P4：文本和配置收尾

1. 修 `CreatePanel.ts` 的 `classNode` 加子节点问题
2. 修 `AreaSelectPanel.ts` 的 `'Adventurer'`
3. 修 `CharacterPanel.ts` 硬编码
4. 修 `SettlementPanel.ts` 硬编码
5. 修 `SettingsPanel.ts` 硬编码
6. 修 `AdventureLogPanel.ts` 硬编码
7. 确认 `ROUTES` 无人类可读硬编码条件

---

## 9. 验收清单

### 9.1 静态检查

```bash
npm.cmd run validate:all
python tools/check_hardcoded_text.py
```

额外建议增加脚本检查：

```text
所有 PanelRoot 是否有 ResponsivePanelRoot
所有 PanelRoot 是否有 DimMask
所有 PanelRoot 是否有 PanelFrame
所有 PanelFrame 是否有 ContentRoot
所有 ContentRoot 是否有 ResponsivePanelContent
所有带 {} 参数的 textKey 是否没有挂普通 LocalizedLabel
```

### 9.2 浏览器检查

至少检查：

```text
1280x720
1600x900
1920x1080
20:9 横屏窗口
窄窗口模拟
```

### 9.3 main.scene

```text
主城默认只显示 MainUI
Login/Create/Character/Area/Settlement/Settings/Log 不默认显示
打开任意面板都有遮罩
面板内容不压到主城按钮
窗口缩放后 PanelFrame 居中且不出屏
```

### 9.4 splash.scene

```text
SplashImage 居中
LoadingBar 在底部安全区
SkipButton 在右上安全区
窗口缩放不乱位
```

### 9.5 dungeon.scene

```text
World 渲染层顺序正确
HUD 四角布局正确
Joystick 和 SkillUI 不重叠
战斗内弹窗有遮罩和 PanelFrame
```

---

## 10. 当前项目需要立刻修的已知问题

1. `ResponsivePanelRoot.ts` 需要补 `design-resolution-changed` 监听，并刷新 `ResponsivePanelContent`。
2. `main.scene` 目前只有 `LoginPanel` 有 `DimMask/PanelFrame`，其它面板未落地。
3. `LoginPanel` 缺 `ContentRoot`，内容节点未统一归入 `PanelFrame/ContentRoot`。
4. 所有 `PanelRoot` 当前仍是 `100x100`，未挂 `ResponsivePanelRoot`。
5. `CreatePanel.ts` 中 `Class` 节点未 `card.addChild(classNode)`。
6. `AreaSelectPanel.ts` 中仍有 `'Adventurer'` 默认名硬编码。
7. `CharacterPanel.ts`、`SettlementPanel.ts`、`AdventureLogPanel.ts`、`SettingsPanel.ts` 仍有硬编码英文动态文本。
8. `reach_floor` 解锁类型暂不应启用，除非增加 `zoneBestFloors` 数据结构。

