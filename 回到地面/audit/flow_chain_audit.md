# 完整流程链路审计报告

> 日期: 2026-07-01 | 范围: Splash → Main → AreaSelect → RunCoordinator → Dungeon

## 链路 1: Splash → AppFlowController

```
splash.scene
├── SplashUI (有节点)
├── GameBootstrap (在 SplashUI.onLoad 内 ensure 创建)
├── LoadingBar (在代码中创建)
```

**状态: ✅ 代码正确, 场景连线正常**
- SplashUI 存在节点, `_goToMain` → `AppFlowController.start()`
- GameBootstrap 在代码内创建, 不需要场景节点

---

## 链路 2: Main → 面板注册

```
main.scene
├── Canvas
│   ├── MainUI (已有节点, 旧版)
│   │   └── StartButton
│   └── MainSceneController (是 MainUI 的子节点!)
│       └── (无子节点)
```

**状态: ❌ 面板注册失败**

问题: `MainSceneController._registerPanels()` 从 `this.node` 开始递归搜索:
```typescript
const node = this._findChildRecursive(this.node, 'AreaSelectPanel');
```
但 `this.node` 是 MainSceneController 节点, 它没有子节点。而 AreaSelectPanel 等面板节点**在场景中根本不存在**, 所以 `_findChildRecursive` 返回 null, 面板注册失败。

**所有面板都不会被注册**:
- LoginPanel ❌
- CreatePanel ❌
- CharacterPanel ❌
- AreaSelectPanel ❌
- SettlementPanel ❌
- SettingsPanel ❌
- AdventureLogPanel ❌

---

## 链路 3: 点击"开始游戏"

```
StartButton(Click)
  ├── MainUI._onStartTap() → onStartClick()
  │     └── eventBus.emit('ui:open_area_select')
  │           └── MainSceneController._onOpenAreaSelect()
  │                 └── AppFlowController.goTo(AREA_SELECT)
  │                       └── eventBus.emit('appflow:state_changed')
  │                             └── _onFlowState → router.open('area_select')
  │                                   └── AreaSelectPanel 未注册! ❌
  │
  └── MainSceneController._bindFallbackStartButton()
        └── _onOpenAreaSelect() (同上, 额外触发)
```

**状态: ❌ 断链点: AreaSelectPanel 未注册**
- 事件链路是对的: click → `ui:open_area_select` → `goTo(AREA_SELECT)` → `router.open('area_select')`
- 但 `router.open` 找不到 AreaSelectPanel, 因为没注册 → 什么都不发生

---

## 链路 4: AppFlowController 启动分流

```
AppFlowController.start()
  ├── AUTH_CHECK → goTo(AUTH_CHECK)
  │     └── SceneFlowService.goToMain() → scene加载
  │     └── emit 'appflow:state_changed' → router.open('login')
  │           └── LoginPanel 未注册! ❌
  │
  ├── PROFILE_CHECK → goTo(PROFILE_CHECK)
  │     └── emit → router.open('create_character')
  │           └── CreatePanel 未注册! ❌
  │
  └── MAIN_HUB → goTo(MAIN_HUB)
        └── emit → 无面板, 显示主城 (正常)
```

**状态: ⚠️ 登录/创建面板未注册, 但主城显示正常**

---

## 链路 5: RunCoordinator → DungeonScene

```
AreaSelectPanel.startRun()
  └── RunCoordinator.startRun(config)
        └── AppFlowController.goTo(DUNGEON)
              └── SceneFlowService.goToDungeon() ✅
                    └── DungeonSceneController._bootstrap()
                          ├── 读取 RunCoordinator.state.currentZone ✅
                          └── SpriteAnimationService.loadAll() ✅
```

**状态: ✅ 代码逻辑正确 (面板注册后可用)**

---

## 断链总结

| # | 断链点 | 根因 | 影响 |
|---|--------|------|------|
| 1 | `_registerPanels()` 搜索范围错 | 从 `this.node` 搜索, 但面板节点不在其子树内 | 所有面板注册失败 |
| 2 | 场景无面板节点 | main.scene 的 Canvas 下没有 AreaSelectPanel/LoginPanel 等节点 | 即使搜索对了也找不到 |
| 3 | AppFlowController.start() 的 AUTH_CHECK | PlatformService.isWX 硬编码返回 false | 开发环境跳过登录, 直接进主城 |

## 修复方案

### 必需修复才能跑通

```typescript
// MainSceneController._registerPanels() 改为从 scene root 搜索
const sceneRoot = this.node.scene;
const node = this._findChildRecursive(sceneRoot, name);

// 同时: 在场景中添加 AreaSelectPanel 节点 (编辑器操作)
// 或者: 让 MainSceneController 自身包含这些面板为子节点
```

### 当前实际能跑的路径

由于 Panel 注册失败且 AUTH_CHECK 跳过了登录检查:

```
Splash → goToMain() → Main场景
  → MainUI 旧版界面显示 (StartButton有节点, 能点)
  → 点 StartButton → emit 'ui:open_area_select'
  → 事件链路正确 → goTo(AREA_SELECT)
  → router.open('area_select') → AreaSelectPanel 未注册 → 无反应
```

**"点击开始游戏没反应"的直接原因**: 事件链路完整, 但 `router.open('area_select')` 找不到面板。

### 最快修复: 代码级 (无需编辑器)

在 MainSceneController.onLoad() 中动态创建 AreaSelectPanel 节点:

```typescript
private _ensurePanelNode(name: string): void {
    if (this._findChildRecursive(this.node.scene, name)) return;
    const node = new Node(name);
    node.addComponent(require(`./ui/main/${name}`)[name]);
    this.node.addChild(node);
}
```
