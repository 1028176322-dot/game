# TapTap 发布迁移 — 方案分析与实施计划

> 适用项目：Cocos Creator 3.8.8《回到地面》
> 分析日期：2026-07-08
> 基于方案文档：`TapTap发布迁移详细方案.md`
> 当前代码基准：2026-07-08 日代码快照

---

## 一、方案分析总结

### 1.1 核心结论确认

方案文档结论正确：TapTap 发布应按 **Android 原生游戏** 处理，不是上传微信小游戏包。

迁移涉及 **7 大方向**：

| # | 方向 | 工作量评估 | 优先级 |
|---|------|-----------|--------|
| 1 | 平台层从 `wx` 改为多平台 Adapter | **高** — 重构核心架构 | P0 |
| 2 | 登录从微信改为 TapTap | 中 — 需接 SDK + Bridge | P1 |
| 3 | 实名/防沉迷接入 TapTap 合规 | 中 — 需接 SDK + 流程改动 | P2 |
| 4 | 存档 key 从微信语义改通用语义 | **低** — 影响范围小 | P0 |
| 5 | 广告/埋点/分享隔离 | **低** — 模拟 stub 即可 | P3 |
| 6 | Android 原生构建 | **中** — 环境配置工作量大 | P0 |
| 7 | TapTap 商店资料和提审 | **低** — 材料准备 | P4 |

### 1.2 当前代码现状审计

#### 已具备的有利基础 ✅

| 模块 | 状态 | 说明 |
|------|------|------|
| `AppFlowController` | ✅ 已存在 | 状态机结构完整，BOOT/AUTH_CHECK/PROFILE_CHECK/MAIN_HUB/DUNGEON 流程清晰 |
| `SceneFlowService` | ✅ 已存在 | 统一场景切换 |
| `RunCoordinator` | ✅ 已存在 | 地牢入口统一 |
| `StorageService` | ✅ v2 版 | 已抽象为通用 key-value，不依赖 wx |
| `UiRouter` | ✅ 已存在 | UIPanel 生命周期 |
| `ResponsivePanelRoot` | ✅ 已存在 | 自适应布局 |
| `T()` 文本系统 | ✅ 已存在 | 所有 UI 文本已集中到 `text.json` |
| `ui_assets.json` | ✅ 已存在 | 资源注册表 |

#### 必须修改的问题点 🚩

| 文件 | 问题 | 严重程度 |
|------|------|---------|
| `PlatformService.ts` | 只识别 wx/dev，无 login/init/compliance 方法 | **P0** |
| `AnalyticsService.ts` | 直接调用 `wx.reportAnalytics()` | **P0** — Android 会报 wx is not defined |
| `AdService.ts` | 直接调用 `wx.createRewardedVideoAd()` / `wx.createInterstitialAd()` | **P0** |
| `LoginPanel.ts` | 硬编码 `wxLoginBtn` 属性名，调用 `platform.wxLogin()`（不存在！） | **P0** |
| `LoginPanel.ts` | 存储 key 使用 `wx_openid` / `is_guest` | **P0** |
| `AppFlowController.ts` | `start()` 中没有 `PlatformService.init()` 调用 | **P1** |
| `AppFlowController.ts` | 无合规检查流程 | **P2** |
| `RunCoordinator.ts` | `startRun()` 中无合规二次检查 | **P2** |
| `text.json` | 仍有 `loginWechat` / `loginGuest` / `settingsWeChat` / `settingsGuest` | **P0** |
| `ui_assets.json` | `ui.login.wechat_btn` 键名 | **P0** |
| `tools/config_pipeline/check_all.py` | 缺少平台相关检查规则 | **P3** |

#### 注意事项 ⚠️

1. **WXAdapter.ts 已不存在** — 方案文档中提到的 WXAdapter 已被移除，无需再处理
2. **LoginPanel._onWxLogin() 调用 `platform.wxLogin()`** — 此方法在 PlatformService 中不存在，目前应该是编译/运行时错误，但 dev 模式下走 auto-skip 路径所以可能没暴露。Android 构建时必暴露。
3. **StorageService 已用 v2 通用版** — 存档层不需要迁移，只需改 key 名
4. **platform.json 还不存在** — 需新建
5. **未见其他 `wx_openid` 散落** — 仅在 LoginPanel 出现，范围可控

### 1.3 高风险点

1. **Android 构建环境未配置** — 没有 JDK/SDK/NDK/Gradle 环境信息，此步骤可能卡住
2. **TapTap 开发者中心账号与应用未创建** — 需要客户方操作后台
3. **TapSDK 当前版本未知** — 方案中的 Bridge 代码需要根据实际 TapSDK 版本调整
4. **代码编码已提到有乱码** — 迁移过程中大量修改平台层文件，乱码问题可能在 PR review 时被漏过

---

## 二、实施路线

### P0：Android 原生包跑通（不接 TapSDK）

**目标**：游戏能作为 Android 原生包编译、安装、运行，主流程可走通。

#### P0.1 环境准备

| 任务 | 说明 | 前置条件 |
|------|------|---------|
| 确认 JDK 版本 | 推荐 JDK 17（Cocos 3.8 要求） | 无 |
| 确认 Android SDK/NDK 路径 | 安装 Android Studio，记录 SDK 和 NDK 路径 | JDK |
| Cocos 偏好设置 | 在 Cocos Creator 中配置 Android SDK/NDK/JDK/Gradle 路径 | 上述路径 |
| 确认 Gradle 版本 | Cocos 3.8 推荐 Gradle 7.x | 无 |
| 记录包名 | 建议 `com.yourcompany.backtoground` | 无 |
| **创建 TapTap 后台应用** | 获取 Client ID（P1/P2 才用，但可以先创建） | 无 |

**验收**：`Cocos -> 构建 -> Android -> 编译成功`

#### P0.2 新增 PlatformTypes.ts

新增文件：`assets/scripts/platform/PlatformTypes.ts`

内容：`RuntimePlatform` 类型 + `PlatformLoginResult` / `ComplianceResult` / `PlatformInitOptions` 接口（方案文档 5.1 节）。

不依赖任何第三方库。

#### P0.3 新增 PlatformAdapter.ts

新增文件：`assets/scripts/platform/adapters/PlatformAdapter.ts`

内容：`PlatformAdapter` 接口（方案文档 5.2 节）。

包含 `init()` / `login()` / `logout()` / `getUserId()` / `checkCompliance()` / `report()` 六个方法。

#### P0.4 新增 WebDevPlatformAdapter.ts

新增文件：`assets/scripts/platform/adapters/WebDevPlatformAdapter.ts`

内容：浏览器/编辑器预览用适配器（方案文档 5.4 节）。

行为：localStorage 模拟用户，跳过合规检查，console.log 模拟上报。

保留 `dev_user_id` key，但**不再写入 `wx_openid`**。

#### P0.5 新增 NativeAndroidPlatformAdapter.ts

新增文件：`assets/scripts/platform/adapters/NativeAndroidPlatformAdapter.ts`

内容：Android 原生测试包适配器（方案文档 5.5 节）。

行为：固定本地用户 `android_local_user`，跳过合规和广告检查。

#### P0.6 新增 WeChatPlatformAdapter.ts

新增文件：`assets/scripts/platform/adapters/WeChatPlatformAdapter.ts`

内容：从现有 `PlatformService` + 原 `WXAdapter` 逻辑提取。

职责：
- `init()`: 检测 wx 环境
- `login()`: 调用 `wx.login()` + 获取 openId
- `checkCompliance()`: 从微信获取防沉迷状态
- `report()`: 调用 `wx.reportAnalytics()`
- 实现完整的 `PlatformAdapter` 接口

目标是**不改变微信已有逻辑**，只做封装。

#### P0.7 重构 PlatformService.ts

修改文件：`assets/scripts/platform/PlatformService.ts`

将原来简单的检测服务改为 Adapter 模式（方案文档 5.3 节）：

```typescript
export class PlatformService {
    private _adapter: PlatformAdapter | null = null;
    private _platform: RuntimePlatform = 'unknown';

    async init(options?: Partial<PlatformInitOptions>): Promise<void> { ... }
    async login(): Promise<PlatformLoginResult> { ... }
    async logout(): Promise<void> { ... }
    getUserId(): string | null { ... }
    async checkCompliance(userId: string): Promise<ComplianceResult> { ... }
    report(eventName: string, params?: Record<string, unknown>): void { ... }
}
```

保留 `isWeChat` / `isTapTap` / `isDev` 便捷属性。

`_createAdapter()` 检测策略：
1. `wx` 全局 → `WeChatPlatformAdapter`
2. `jsb` 存在 + Android 系统 + channel='taptap' → `TapTapAndroidAdapter`（P1 才实现）
3. `jsb` 存在 + Android 系统 + 其他 channel → `NativeAndroidPlatformAdapter`
4. 否则 → `WebDevPlatformAdapter`

#### P0.8 新增 platform.json

新增文件：`assets/resources/config/platform.json`

内容（方案文档 12.1 节）：

```json
{
  "channel": "taptap",
  "platform": "android",
  "login": { "provider": "taptap", "allowGuest": false },
  "compliance": { "enabled": true, "checkOnLogin": true, "checkBeforeRun": true },
  "analytics": { "provider": "local_buffer" },
  "ads": { "enabled": false, "provider": "none" }
}
```

#### P0.9 改造 LoginPanel.ts

修改文件：`assets/scripts/ui/main/LoginPanel.ts`

改动点：
1. 属性 `wxLoginBtn: Button` → **改名为 `platformLoginBtn: Button`**
   - 注意：这与方案文档的 COCOS_EDITOR_BINDING_POLICY 不冲突，因为 LoginPanel 在方案文档中有特殊定制，且 `platformLoginBtn` 更适合所有平台
2. 存储 key：`wx_openid` → **改为 `platform_user_id`**；`is_guest` → 保留但语义改为通用
3. 登录方法：`_onWxLogin()` → **改为 `_onPlatformLogin()`**
4. 方法调用：`platform.wxLogin()` → **改为 `PlatformService.instance.login()`**
5. Dev 模式 auto-login：使用 `platform_user_id` 替代 `wx_openid`
6. Guest 登录：游客 ID 前缀改为 `guest_` 保留，但 key 改成 `platform_user_id`

#### P0.10 修改 AppFlowController.start()

修改文件：`assets/scripts/app/AppFlowController.ts`

在 `start()` 中加入 `PlatformService.instance.init()` 调用：

```typescript
async start(): Promise<void> {
    console.log('[AppFlow] start flow');
    // Platform init first
    await PlatformService.instance.init(platformConfig);
    // Then check auth
    ...
}
```

同时修改启动逻辑：不再只在 `isWX` 时检查登录，而是**所有环境都通过 `PlatformService.isDev` 和 `PlatformService.getUserId()` 综合判断**。

#### P0.11 修改 text.json

修改文件：`assets/resources/config/text.json`

变更：

| 旧 key | 旧值 | 变更 |
|--------|------|------|
| `loginWechat` | "微信登录" | → `loginPlatform` / "平台登录"（通用） |
| `settingsWeChat` | "微信" | → `settingsPlatform` / "TapTap" |
| `settingsGuest` | "游客" | 保留 |

新增 key（方案文档 12.2 节）：

```json
{
  "ui.loginTapTap": "TapTap 登录",
  "ui.loginPlatform": "平台登录",
  "ui.complianceBlocked": "当前账号暂时无法进入游戏",
  "ui.complianceRemaining": "剩余游戏时间：{minutes} 分钟",
  "ui.privacyPolicy": "隐私政策",
  "ui.userAgreement": "用户协议"
}
```

#### P0.12 修改 ui_assets.json

修改文件：`assets/resources/config/ui_assets.json`

变更：

| 旧 key | 新 key |
|--------|--------|
| `ui.login.wechat_btn` | `ui.login.platform_btn` |

如果已有 `btn_wechat.png` 资源，目前 P0 阶段可以先用同一个资源文件，**确保按钮图片上无"微信"文字**。P3 阶段可以统一生成新的通用按钮图片。

#### P0.13 存档 key 迁移

修改文件：`assets/scripts/core/save/SaveService.ts`（确认是否存在）或 LoginPanel 相关调用

在 StorageService 层添加兼容迁移（方案文档 11.2 节）：

```typescript
export function migratePlatformKeys(storage: StorageService): void {
    const platformUserId = storage.get('platform_user_id');
    if (platformUserId) return;
    const wxOpenId = storage.get('wx_openid');
    if (wxOpenId) {
        storage.set('legacy_wx_openid', wxOpenId);
        storage.set('platform_user_id', wxOpenId);
        storage.set('platform_type', 'wechat_minigame');
    }
}
```

#### P0.14 Android 构建 — Debug 包

操作步骤：
1. Cocos Creator 中创建 Android 构建配置文件
2. 配置包名、ABI（arm64-v8a + armeabi-v7a）
3. 配置签名（Debug 使用自动签名）
4. 构建
5. 安装到真机
6. 测试主流程（启动 → 登录 → 主城 → 选择角色 → 地牢 → 战斗 → 结算）

**P0 验收标准**：
- [x] APK 可安装
- [x] 启动正常（无黑屏、无闪退）
- [x] 主页正常显示
- [x] 登录/创建角色正常
- [x] 地牢可进、战斗正常
- [x] 无 `wx is not defined` 错误
- [x] 无 `platform.wxLogin is not a function` 错误
- [x] `npm.cmd run validate:all` 通过

---

### P1：TapTap 登录接入

**目标**：TapTap 登录可拉起，能获取用户信息并进入游戏。

#### P1.1 TapTap 后台配置

| 任务 | 说明 | 前置条件 |
|------|------|---------|
| 创建/确认应用 | TapTap 开发者中心 | P0 已完成 |
| 配置包名 | 与 P0 包名一致 | P0 |
| 配置签名指纹 | Debug/Release 分别配置 | P0 |
| 获取 Client ID / Client Token | 保存到服务端配置（**不提交到客户端 Git**） | 上述完成 |
| 开通登录能力 | TapTap 后台开启 | 上述完成 |

#### P1.2 新增 TapTapBridge.ts

新增文件：`assets/scripts/platform/taptap/TapTapBridge.ts`

内容：TypeScript 端 Bridge（方案文档 6.2 节），封装 `jsb.reflection.callStaticMethod()` 通信。

使用回调 ID 机制，避免 promise 泄漏。

#### P1.3 新增 TapTapAndroidAdapter.ts

新增文件：`assets/scripts/platform/adapters/TapTapAndroidAdapter.ts`

内容：TapTap Android 适配器（方案文档 6.3 节），对接 `TapTapBridge`。

- `init()` → 初始化 TapSDK
- `login()` → 拉起 TapTap 登录，获取 openId/name/avatar
- `checkCompliance()` → 调用防沉迷接口
- `report()` → console.log（暂不接埋点 SDK）

#### P1.4 新增 Android 侧 TapTapBridge.java

新增文件：Android 原生工程中的 `TapTapBridge.java`

内容（方案文档 6.4 节）：
- init/login/checkCompliance 的 Java Stub
- 通过 `CocosJavascriptJavaBridge.evalString()` 回传结果到 TS 层
- GameActivity.onCreate() 中注册 `TapTapBridge.setActivity(this)`

**注意**：实际 TapSDK 的 Gradle 依赖和初始化代码需根据 TapSDK 官方文档调整。

#### P1.5 更新 PlatformService._createAdapter()

在 `_createAdapter()` 中加入 TapTap 检测分支。

#### P1.6 更新 LoginPanel 对接 TapTap 登录

`_onPlatformLogin()` 调用 `PlatformService.instance.login()` 即可，Adapter 模式会自动选择 TapTap 适配器。

#### P1.7 账号保持

`StorageService.instance.set('platform_user_id', userId)` 已在 P0 实现。

使用 TapTap 返回的 openId 作为持久化标识。

**P1 验收标准**：
- [x] TapTap 登录能拉起 TapTap 客户端或 Web 页面
- [x] 能获取到 openId
- [x] 登录成功后能进入主城
- [x] 重启游戏后账号保持（不用重新登录）
- [x] 登录失败有 UI 提示
- [x] 无 jsb bridge callback 泄漏

---

### P2：实名与防沉迷

**目标**：符合 TapTap 合规要求，未成年人按政策限时。

#### P2.1 TapTap 后台开通合规认证

在 TapTap 开发者中心开通防沉迷/合规能力。

#### P2.2 新增 ComplianceService.ts

新增文件：`assets/scripts/platform/ComplianceService.ts`

内容（方案文档 7.2 节）：
- `verifyBeforeEnterGame(userId)` — 登录后检查
- `canStartRun()` — 开局前检查（状态缓存）
- 管理 `ComplianceResult` 状态

#### P2.3 更新 TapTapBridge.java

在 `checkCompliance()` 中接入 TapSDK 的防沉迷 API。
从 Stub 改为真实调用。

#### P2.4 更新 AppFlowController

在 `start()` 和 `goTo(DUNGEON)` 流程中增加合规检查。

#### P2.5 更新 RunCoordinator

在 `startRun()` 开头加入合规二次检查（方案文档 8.2 节）：

```typescript
startRun(config: RunStartConfig): void {
    if (!ComplianceService.instance.canStartRun()) {
        AppFlowController.instance.goTo(AppFlowState.MAIN_HUB, {
            toast: T('ui.complianceBlocked'),
        });
        return;
    }
    // ... 原有逻辑
}
```

#### P2.6 合规 UI 提示

- 登录面板：合规失败显示具体原因
- 时间提醒：未成年人剩余时间定时提示
- 时间耗尽：合规阻断弹窗

**P2 验收标准**：
- [x] 未成年人被拒流程正常（不通过）
- [x] 成年人流程正常（通过）
- [x] 合规错误有明确 UI 提示（不崩溃）
- [x] 开局前合规检查生效

---

### P3：广告 / 埋点 / 分享隔离

**目标**：Android 包无任何 `wx.*` API 调用。

#### P3.1 改造 AnalyticsService

修改文件：`assets/scripts/platform/AnalyticsService.ts`

方案：
- 不再直接调用 `wx.reportAnalytics()`
- 改用 `PlatformService.instance.report(eventName, data)`
- 微信适配器负责调用 `wx.reportAnalytics()`
- 其他适配器走 `console.log` 或本地缓存

#### P3.2 改造 AdService

修改文件：`assets/scripts/platform/AdService.ts`

方案（方案文档第 10 节）：
- 提取 `AdAdapter` 接口
- 微信适配器：保留现有 `wx.createRewardedVideoAd()` 实现
- Android 适配器：`NoopAdAdapter`（所有广告返回 false）
- 业务代码处理 `rewarded === false` 的情况

#### P3.3 分享能力抽象（可选）

如果存在微信分享逻辑，新增 `ShareService` 统一管理。
TapTap 首版直接返回 false。

#### P3.4 UI 资源清理

- 把 `btn_wechat.png` 替换为 `btn_platform.png`（通用按钮）
- 确保登录按钮图片上无文字

**P3 验收标准**：
- [x] Android 包无任何 wx API 报错
- [x] 埋点事件本地缓存正常
- [x] 广告无响应时业务不崩溃
- [x] 无广告时奖励发放不做默认 fallback

---

### P4：Release 与 TapTap 提审

**目标**：生成正式 Release APK 并上传 TapTap。

#### P4.1 Release 签名

- 生成 `backtoground_taptap_release.keystore`
- 记录所有签名信息（alias/password/SHA1/SHA256/MD5）
- 存储到 `E:/game/secrets/`（**不提交 Git**）
- 更新 `.gitignore`

#### P4.2 Release 构建 Profile

新增 `build_profiles/android_taptap_debug.json` / `android_taptap_release.json`
Release 开启：JS 加密、MD5 Cache、关闭 Debug 和 SourceMap

#### P4.3 真机回归测试

按方案文档第 16.3 节清单执行。

#### P4.4 TapTap 后台配置

填写商店资料：名称/简介/截图/图标/隐私政策/用户协议/客服/适龄提示/分类

#### P4.5 上传 APK 并提审

**P4 验收标准**：
- [x] TapTap 后台 APK 解析成功
- [x] 签名校验通过
- [x] 商店资料完整
- [x] 提交审核

---

## 三、文件修改清单

### P0 阶段修改（12 个文件）

| 操作 | 文件 | 说明 |
|------|------|------|
| **新增** | `assets/scripts/platform/PlatformTypes.ts` | 平台类型和接口定义 |
| **新增** | `assets/scripts/platform/adapters/PlatformAdapter.ts` | 适配器接口 |
| **新增** | `assets/scripts/platform/adapters/WebDevPlatformAdapter.ts` | Web 开发适配器 |
| **新增** | `assets/scripts/platform/adapters/NativeAndroidPlatformAdapter.ts` | Android 原生适配器 |
| **新增** | `assets/scripts/platform/adapters/WeChatPlatformAdapter.ts` | 微信小游戏适配器（从原 PlatformService 提取） |
| **新增** | `assets/resources/config/platform.json` | 平台配置文件 |
| **修改** | `assets/scripts/platform/PlatformService.ts` | 重构为 Adapter 模式 |
| **修改** | `assets/scripts/ui/main/LoginPanel.ts` | 通用化 + 修复 wxLogin 问题 |
| **修改** | `assets/scripts/app/AppFlowController.ts` | 加入 PlatformService.init() |
| **修改** | `assets/resources/config/text.json` | 替换微信文本为通用文本 |
| **修改** | `assets/resources/config/ui_assets.json` | wechat_btn → platform_btn |
| **修改** | `assets/scripts/core/save/SaveService.ts` | 添加 key 迁移逻辑 |

### P1 阶段新增（4 个文件）

| 操作 | 文件 | 说明 |
|------|------|------|
| **新增** | `assets/scripts/platform/taptap/TapTapBridge.ts` | TS 端 Bridge |
| **新增** | `assets/scripts/platform/adapters/TapTapAndroidAdapter.ts` | TapTap 适配器 |
| **新增** | native/engine/android/.../TapTapBridge.java | Java 端 Bridge |
| **修改** | native/engine/android/.../GameActivity.java | 注册 TapTapBridge |

### P2 阶段

| 操作 | 文件 | 说明 |
|------|------|------|
| **新增** | `assets/scripts/platform/ComplianceService.ts` | 合规检查服务 |
| **修改** | `assets/scripts/app/AppFlowController.ts` | 合规流程集成 |
| **修改** | `assets/scripts/run/RunCoordinator.ts` | 开局前合规检查 |
| **修改** | `assets/resources/config/text.json` | 合规提示文案 |

### P3 阶段

| 操作 | 文件 | 说明 |
|------|------|------|
| **修改** | `assets/scripts/platform/AnalyticsService.ts` | 取消直接 wx 调用 |
| **修改** | `assets/scripts/platform/AdService.ts` | Adapter 化 |
| **新增** | 可选 ShareService | 分享抽象 |
| **修改** | `assets/resources/config/text.json` | 清理微信文案残留 |
| **修改** | `tools/config_pipeline/check_all.py` | 新增平台检查规则 |

### P4 阶段

| 操作 | 文件 | 说明 |
|------|------|------|
| **新增** | `build_profiles/android_taptap_debug.json` | Debug 构建配置 |
| **新增** | `build_profiles/android_taptap_release.json` | Release 构建配置 |
| **生成** | `backtoground_taptap_release.keystore` | Release 签名 |
| **修改** | `.gitignore` | 排除 keystore 和 secrets/ |

---

## 四、执行建议

### 4.1 执行顺序

1. **P0 是基础，必须先完成** — 重构 PlatformService + 跑通 Android 包
2. **P1 和 P2 可以并行** — 但建议先 P1（登录）再 P2（防沉迷），因为防沉迷依赖登录的 userId
3. **P3 可以和 P1/P2 并行** — 只是隔离改造，互不依赖
4. **P4 是最后一步** — 依赖前面所有完成

### 4.2 需要客户方配合

1. Android 构建环境配置（JDK/SDK/NDK）
2. TapTap 开发者中心账号申请和应用创建
3. TapTap 后台开放登录/合规能力
4. 隐私政策 URL / 用户协议 URL
5. Release keystore 的密码管理

### 4.3 本次会话实施建议

建议本次先做 **P0**（Android 原生包跑通），这是所有后续的基础。

P0 完成后微信小游戏不受影响，可以随时回归验证。

---

## 五、当前状态备忘

- 方案文档 `TapTap发布迁移详细方案.md` 已完整阅读 ✅
- 代码审计已完成 ✅
- 实施计划已制定 ✅
- **当前阶段：等待确认 → 进入 P0 执行**
