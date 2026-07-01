# Step 1: Splash 启动画面 — 功能规格

> **版本**: v1.1 | **日期**: 2026-07-01 | **设计者**: GameDesigner  
> **编码**: UTF-8

---

## 1. 职责

Splash 场景只负责两件事：
1. **加载** — GameBootstrap 加载配置文件 + 资源映射
2. **启动** — AppFlowController 接管流程状态机

**不做的事**: 不再直接跳转场景。加载完成后调用 `AppFlowController.start()` 进入状态机。

---

## 2. 状态机入口

```
splash.scene 加载完成
  │
  └── AppFlowController.start()
        │
        ├── AUTH_CHECK → 弹出 LoginPanel (main 弹窗)
        ├── PROFILE_CHECK → 弹出 CreatePanel (main 弹窗) / 直接进 MainHub
        └── MAIN_HUB → 显示主城
```

---

## 3. UI 布局

```
splash.scene — Canvas (1280x720)
├── SplashImage (Sprite, splash_bg, UIOpacity 淡入)
├── LoadingContainer (Node, y=-100)
│   ├── LoadingTitle (Label, "地下冒险 从心开始")
│   ├── LoadingBarBg (Graphics, 圆角 #333)
│   ├── LoadingBarFill (Graphics, 圆角 #4A9EFF, 动态宽度)
│   └── LoadingLabel (Label, 进度文字)
├── SkipLabel (Label, "点击跳过", 1s 后可见)
└── VersionLabel (Label, "v{version}", 右下)
```

---

## 4. 进度条契约

| 进度 | 阶段 | 说明 |
|------|------|------|
| 5% | 启动 | 开始加载 |
| 10% | 配置 | ConfigService.loadAll() |
| 50% | 本地 | ConfigManager.loadAll() |
| 70% | 资源映射 | AssetBundleService.loadAssetMapFromResources() |
| 95% | 初始化 | 准备完毕 |
| 100% | 完成 → AppFlowController.start() | 状态机接管 |

---

## 5. 改动文件

| 文件 | 改动 |
|------|------|
| `assets/scripts/ui/SplashUI.ts` | 加载完成后调用 `AppFlowController.start()` 替代 `director.loadScene()` |
| `assets/scripts/core/GameBootstrap.ts` | 添加进度回调 `setProgressCallback()` |
| `assets/scenes/splash.scene` | 添加 LoadingBarBg/Fill 节点 |

---

## 6. 验收清单

| # | 条件 | 预期 |
|---|------|------|
| 1 | 加载完成 | 进度条 100% → AppFlowController.start() |
| 2 | 加载失败 | 显示错误信息, 阻止跳转 |
| 3 | 点击跳过 | 标记 skip, 加载完成后立即执行下一步 |
| 4 | 进度条动画 | 0% → 10% → 50% → 70% → 95% → 100% |
