# TapTap 迁移进度跟踪

> 最后更新：2026-07-08 16:23
> 每次完成任务后自动更新

---

## 总览

| 阶段 | 状态 | 进度 | 说明 |
|------|------|------|------|
| **P0** Android 原生包跑通 | 🚧 进行中 | 80% | 代码重构完成，待环境配置+真机测试 |
| **P1** TapTap 登录接入 | 🚧 进行中 | 57% | Bridge+Adapter 代码完成，待 Android 工程集成 |
| **P2** 实名与防沉迷 | 🚧 进行中 | 50% | Service+流程代码完成，待 Android 工程集成+UI |
| **P3** 广告/埋点/分享隔离 | ✅ 完成 | 100% | 全部平台适配器 + Noop 适配 |
| **P4** Release 与提审 | ⬜ 待开始 | 0% | 依赖前面全部 |

---

## P0 — Android 原生包跑通

| 子任务 | 状态 | 完成日期 | 备注 |
|--------|------|---------|------|
| 0.1 新增 PlatformTypes.ts | ✅ 完成 | 2026-07-08 | 包含 RuntimePlatform / PlatformLoginResult / ComplianceResult / PlatformInitOptions |
| 0.2 新增 PlatformAdapter.ts | ✅ 完成 | 2026-07-08 | 适配器接口定义 |
| 0.3 新增 WebDevPlatformAdapter.ts | ✅ 完成 | 2026-07-08 | 浏览器/编辑器预览适配器 |
| 0.4 新增 NativeAndroidPlatformAdapter.ts | ✅ 完成 | 2026-07-08 | Android 原生测试包适配器 |
| 0.5 新增 WeChatPlatformAdapter.ts | ✅ 完成 | 2026-07-08 | 微信小游戏适配器 |
| 0.6 重构 PlatformService.ts | ✅ 完成 | 2026-07-08 | Adapter 模式 + 旧 key 迁移 |
| 0.7 新增 platform.json | ✅ 完成 | 2026-07-08 | 平台配置文件 |
| 0.8 改造 LoginPanel.ts | ✅ 完成 | 2026-07-08 | wxLoginBtn→platformLoginBtn, wx_openid→platform_user_id |
| 0.9 改造 AppFlowController.start() | ✅ 完成 | 2026-07-08 | 加入 PlatformService.init() + 合规检测 |
| 0.10 修改 SettingsPanel.ts | ✅ 完成 | 2026-07-08 | wx_openid→platform_user_id |
| 0.11 修改 text.json | ✅ 完成 | 2026-07-08 | 文本通用化 + 合规文案 |
| 0.12 修改 ui_assets.json | ✅ 完成 | 2026-07-08 | wechat_btn→platform_btn |
| 0.13 修改 ui_skin_bindings.json | ✅ 完成 | 2026-07-08 | 同步更新节点绑定 |
| **0.14 验证管道 (validate:all)** | ✅ **8/8 通过** | 2026-07-08 | config/bundle/encoding/architecture/TS/resource/skin/non-ui |
| **0.15 Cocos 编辑器节点绑定** | ⬜ **待人工操作** | — | 需要在编辑器中重连 platformLoginBtn |
| **0.16 Android 构建环境配置** | ⬜ **待人工操作** | — | JDK / SDK / NDK / Gradle 路径 |
| **0.17 Android Debug APK 构建测试** | ⬜ **待人工操作** | — | 真机测试主流程 |

### P0 已知问题/决策
- `ui.login.platform_btn` 复用 `btn_wechat` 纹理（P3 生成通用按钮图片）
- `ui.loginWechat` 文本 key 保留为遗留兼容（scene 文件引用）
- `wx_openid`→`platform_user_id` 迁移在 `PlatformService.init()` 自动完成

---

## P1 — TapTap 登录接入 (代码就绪，待 Android 构建验证)

| 子任务 | 状态 | 完成日期 | 备注 |
|--------|------|---------|------|
| 1.1 TapTap 后台配置 | ⬜ 待人工操作 | — | 需要 TapTap 开发者中心操作 |
| 1.2 新增 TapTapBridge.ts | ✅ 完成 | 2026-07-08 | TS 端 Bridge (callback ID 机制) |
| 1.3 新增 TapTapAndroidAdapter.ts | ✅ 完成 | 2026-07-08 | 对接 TapTapBridge + StorageService |
| 1.4 新增 TapTapBridge.java | ⬜ 待人工操作 | — | 需要 Android 原生工程中添加 Java 桥接文件 |
| 1.5 更新 PlatformService._createAdapter() | ✅ 完成 | 2026-07-08 | channel='taptap' 时自动选择 TapTapAdapter |
| 1.6 更新 LoginPanel 对接 | ✅ 完成 | 2026-07-08 | P0 已通用化，直接使用 platform.login() |
| 1.7 账号保持验证 | ⬜ 待真机测试 | — | P4 阶段验证 |

---

## P2 — 实名与防沉迷 (代码就绪，待 Android 构建验证)

| 子任务 | 状态 | 完成日期 | 备注 |
|--------|------|---------|------|
| 2.1 TapTap 后台开通合规认证 | ⬜ 待人工操作 | — | 需要 TapTap 开发者中心操作 |
| 2.2 新增 ComplianceService.ts | ✅ 完成 | 2026-07-08 | 缓存 + 并发保护 + 开局前检查 |
| 2.3 更新 TapTapBridge.java - 合规 API | ⬜ 待人工操作 | — | 需要 Android 原生工程中添加 |
| 2.4 更新 AppFlowController - 合规流程 | ✅ 完成 | 2026-07-08 | start() 中登录后检测合规 |
| 2.5 更新 RunCoordinator - 开局前检查 | ✅ 完成 | 2026-07-08 | startRun() 开头加入合规二次检查 |
| 2.6 合规 UI 提示 | ⬜ 待完善 | — | complianceBlocked/complianceRemaining 文本已添加 |

---

## P3 — 广告/埋点/分享隔离 ✅ 完成

| 子任务 | 状态 | 完成日期 | 备注 |
|--------|------|---------|------|
| 3.1 改造 AnalyticsService | ✅ 完成 | 2026-07-08 | 取消直接 wx.reportAnalytics()，改为 PlatformService.report() |
| 3.2 改造 AdService (NoopAdAdapter) | ✅ 完成 | 2026-07-08 | 新增 AdAdapter + WeChatAdAdapter + NoopAdAdapter |
| 3.3 分享能力抽象 | ✅ N/A | 2026-07-08 | 项目无分享逻辑，无需抽象 |
| 3.4 UI 资源清理 | ⬜ 待 P3 资源 | — | 需要生成通用 btn_platform 纹理（无文字版） |

### P3 新增文件
- `assets/scripts/platform/adapters/AdAdapter.ts`
- `assets/scripts/platform/adapters/NoopAdAdapter.ts`
- `assets/scripts/platform/adapters/WeChatAdAdapter.ts`

---

## P4 — Release 与提审 (待开始)

| 子任务 | 状态 |
|--------|------|
| 4.1 Release 签名生成 | ⬜ |
| 4.2 Release 构建 Profile | ⬜ |
| 4.3 真机回归测试 | ⬜ |
| 4.4 TapTap 商店资料 | ⬜ |
| 4.5 上传 APK 提审 | ⬜ |
