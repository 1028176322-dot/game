# Step 1: Splash 启动画面 — 详细实现规格

> **版本**: v1.0 | **日期**: 2026-07-01 | **设计者**: GameDesigner  
> **编码**: UTF-8

---

## 1. 现状

**当前实现**: `SplashUI.ts` — 2 秒自动跳转，点击可提前跳过 (0.5s 最低停留)，跳转目标固定为 `director.loadScene('main')`。  
**加载流程**: `GameBootstrap.startup()` 并行加载 ConfigService + AssetBundleService，仅用文字反馈。

**问题**:
1. 跳转目标固定，没有分流逻辑 (登录/首次)
2. 无进度条，加载过程只有文字
3. 没有 `isLoggedIn()` 和 `isFirstTime()` 接口

---

## 2. 目标改造

**核心改动**: `_goToMain()` → `_decideNextScene()` 分流逻辑

```
加载完成
  │
  ├── 未登录 → director.loadScene('login')
  ├── 已登录 + 首次 → director.loadScene('create_character')
  └── 已登录 + 非首次 → director.loadScene('main')
```

---

## 3. 改动文件清单

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `assets/scripts/ui/SplashUI.ts` | 🛠 修改 | 分流逻辑 + 进度条引用 |
| `assets/scripts/core/GameBootstrap.ts` | 🛠 修改 | 添加进度回调 |
| `assets/scripts/platform/PlatformService.ts` | 🛠 修改 | 新增 wxLogin() + isLoggedIn() |
| `assets/scripts/core/PlayerDataManager.ts` | 🛠 修改 | 新增 isFirstTime() |
| `assets/scenes/splash.scene` | 🛠 修改 | 添加进度条节点 |
| `assets/resources/config/text.json` | 🛠 修改 | 补充 Splash 文本 key |

---

## 4. SplashUI.ts 改动

### 4.1 流程改造

```typescript
// 原: _goToMain() → 直接 loadScene('main')
// 新: _decideNextScene() → 三路分流

private async _decideNextScene(): Promise<void> {
    const platform = PlatformService.instance;
    const pdm = PlayerDataManager.getInstance();

    // 1. 微信环境检查 — 未登录
    if (platform.isWX && !await platform.isLoggedIn()) {
        console.log('[Splash] not logged in, goto login');
        director.loadScene('login');
        return;
    }

    // 2. 首次启动 — 无存档
    if (pdm.isFirstTime()) {
        console.log('[Splash] first time, goto create_character');
        director.loadScene('create_character');
        return;
    }

    // 3. 正常进入主城
    console.log('[Splash] returning player, goto main');
    director.loadScene('main');
}
```

### 4.2 加载进度条集成

```typescript
// SplashUI 新增属性
private _loadingBarFill: Graphics | null = null;
private _barNode: Node | null = null;

start(): void {
    // ... 原有淡入逻辑 ...

    // 绑定进度回调
    const bootstrap = GameBootstrap.find(this.node);
    if (bootstrap) {
        bootstrap.setProgressCallback((pct, msg) => {
            this._updateProgressBar(pct);
            if (this._loadingLabel) {
                this._loadingLabel.string = msg;
            }
        });
    }
}

private _updateProgressBar(pct: number): void {
    if (!this._loadingBarFill) return;
    // 进度条总宽 380, 按百分比缩放
    const totalWidth = 380;
    const fillWidth = totalWidth * (pct / 100);
    this._loadingBarFill.clear();
    this._loadingBarFill.fillColor = Color.fromHEX('#4A9EFF');
    this._loadingBarFill.roundRect(-totalWidth/2, -12, fillWidth, 24, 6);
    this._loadingBarFill.fill();
}
```

### 4.3 跳过逻辑保留（微调）

```typescript
// 原逻辑: 点击跳过直接调用 _goToMain()
// 新逻辑: 点击设置标记, 等加载完成后调用 _decideNextScene()

private _skipRequested = false;

start(): void {
    this.node.on(Node.EventType.TOUCH_END, () => {
        if (this._elapsed < 0.5) return; // 最低停留
        this._skipRequested = true;
    });
}

update(dt: number): void {
    this._elapsed += dt;
    // 显示"点击跳过"文字 (1s 后)
    if (this._elapsed >= 1.0 && this._skipLabel) {
        this._skipLabel.active = true;
    }
    // 自动跳转 (需要加载完成)
    if (this._elapsed >= GameConfig.SPLASH_MIN_DURATION && this._bootstrapReady) {
        this._decideNextScene();
    }
}
```

---

## 5. GameBootstrap.ts 改动

```typescript
// 新增进度回调
private _progressCallback: ((pct: number, msg: string) => void) | null = null;

setProgressCallback(cb: (pct: number, msg: string) => void): void {
    this._progressCallback = cb;
}

async startup(): Promise<void> {
    if (this._ready || this._error) return;
    try {
        this._progressCallback?.(5, '正在启动...');

        this._setStatus('正在加载配置...');
        this._progressCallback?.(10, '正在加载配置...');
        await ConfigService.instance.loadAll();

        this._progressCallback?.(50, '正在加载本地配置...');
        ConfigManager.getInstance().loadAll();

        this._progressCallback?.(70, '正在加载资源映射...');
        await AssetBundleService.instance.loadAssetMapFromResources();

        this._progressCallback?.(95, '正在初始化...');

        this._ready = true;
        this._progressCallback?.(100, '加载完成');
        this._setStatus('加载完成');
        console.log('[GameBootstrap] startup complete');
    } catch (err) {
        this._error = err instanceof Error ? err.message : String(err);
        this._progressCallback?.(100, `启动失败：${this._error}`);
        this._setStatus(`启动失败：${this._error}`);
        console.error('[GameBootstrap] startup failed:', err);
    }
}
```

---

## 6. PlatformService.ts 改动

```typescript
// 新增登录相关方法
import { StorageService } from './StorageService';

/** 微信登录，返回 openid（开发环境返回模拟值） */
async wxLogin(): Promise<string | null> {
    if (!this._isWX) {
        // 开发/浏览器环境 — 模拟登录
        StorageService.instance.set('wx_openid', 'dev_user');
        return 'dev_user';
    }
    try {
        const res = await wx.login();
        if (!res.code) {
            console.warn('[Platform] wx.login returned no code');
            return null;
        }
        // 生产环境: 用 code 调后端换 openid
        // const openid = await this._exchangeCode(res.code);
        // 开发阶段先用 code 代替
        StorageService.instance.set('wx_openid', res.code);
        return res.code;
    } catch (err) {
        console.warn('[Platform] wx.login failed:', err);
        return null;
    }
}

/** 判断是否已登录（本地已有 openid 记录） */
async isLoggedIn(): Promise<boolean> {
    if (!this._isWX) return true; // 开发环境默认已登录
    const saved = StorageService.instance.get('wx_openid', '');
    return saved !== '';
}

/** 清除登录状态（退出登录用） */
clearLogin(): void {
    StorageService.instance.remove('wx_openid');
}
```

---

## 7. PlayerDataManager.ts 改动

```typescript
// 新增方法

/** 是否为首次启动：存档数据中无任何记录 */
isFirstTime(): boolean {
    return this._data.totalRuns === 0
        && this._data.soulStones === 0
        && this._data.totalKills === 0;
}

/** 是否有已创建的角色 */
hasCharacter(): boolean {
    return this._data.selectedCharacter !== ''
        && this._data.selectedCharacter !== null
        && this._data.selectedCharacter !== undefined;
}
```

---

## 8. Splash 场景节点设计

```
splash.scene — Canvas (1280x720)
├── Main Camera (Ortho, 1280x720)
│
├── SplashUI (Node) ← SplashUI 组件
│   ├── SplashImage (Sprite)
│   │   └── spriteFrame: splash_bg
│   │   └── UIOpacity: 初始 0 → 淡入 255 (0.3s)
│   │
│   ├── LoadingContainer (Node, y=-100)
│   │   ├── LoadingTitle (Label, "地下冒险 从心开始", y=60)
│   │   │   └── fontSize: 28, color: #FFF
│   │   ├── LoadingBarBg (Node, 380x24)
│   │   │   └── Graphics 圆角矩形, fillColor: #333
│   │   ├── LoadingBarFill (Node, 0x24)
│   │   │   └── Graphics 圆角矩形, fillColor: #4A9EFF
│   │   │   └── → width 随进度动态缩放
│   │   └── LoadingLabel (Label, "正在加载配置...", y=-40)
│   │       └── fontSize: 18, color: #CCC
│   │
│   ├── SkipLabel (Label, "点击跳过", y=-200)
│   │   └── 1 秒后 active=true, opacity: 0.5
│   │
│   └── VersionLabel (Label, "v0.1.0", x=560, y=-340)
│       └── fontSize: 14, color: #888, anchorX=1
```

---

## 9. 验收清单

| # | 场景 | 输入 | 预期输出 |
|---|------|------|----------|
| 1 | 浏览器首次 | `!isWX`, `isFirstTime=true` | Splash → `create_character.scene` |
| 2 | 浏览器非首次 | `!isWX`, `isFirstTime=false` | Splash → `main.scene` |
| 3 | 微信未登录 | `isWX=true`, `isLoggedIn=false` | Splash → `login.scene` |
| 4 | 微信已登录首次 | `isWX=true`, `isLoggedIn=true`, `isFirstTime=true` | Splash → `create_character.scene` |
| 5 | 微信已登录非首次 | `isWX=true`, `isLoggedIn=true`, `isFirstTime=false` | Splash → `main.scene` |
| 6 | 进度条 | 加载中 | 0% → 10% → 50% → 70% → 95% → 100% 逐段推进 |
| 7 | 点击跳过 | 加载未完成时点击 | 标记 skip, 加载完成后立即跳转 |
| 8 | 加载失败 | ConfigService 抛异常 | 显示错误信息, 阻止跳转 |

---

## 10. text.json 新增 Key

```json
{
    "splash_loading_title": "地下冒险 从心开始",
    "splash_loading_config": "正在加载配置...",
    "splash_loading_local": "正在加载本地配置...",
    "splash_loading_assets": "正在加载资源映射...",
    "splash_loading_init": "正在初始化...",
    "splash_loading_done": "加载完成",
    "splash_loading_failed": "启动失败：{reason}",
    "splash_skip": "点击跳过",
    "splash_version": "v{version}"
}
```
