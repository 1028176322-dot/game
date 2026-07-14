/**
 * PlatformService - 平台检测与初始化 (Adapter 模式)
 *
 * 统一管理运行环境判断和平台操作：
 * - 根据运行时环境自动选择适配器（WebDev / WeChat / Android / TapTap）
 * - 提供 init / login / logout / getUserId / checkCompliance / report 统一接口
 * - 保留便捷属性 isWX / isTapTap / isDev / hasGlobal
 *
 * 所有业务代码应通过 PlatformService 调用平台能力，不直接操作 wx.* / jsb.*
 */

import { sys } from 'cc';
import { PlatformAdapter } from './adapters/PlatformAdapter';
import { PlatformLoginResult, ComplianceResult, PlatformInitOptions, RuntimePlatform } from './PlatformTypes';
import { WebDevPlatformAdapter } from './adapters/WebDevPlatformAdapter';
import { WeChatPlatformAdapter } from './adapters/WeChatPlatformAdapter';
import { TapTapAndroidAdapter } from './adapters/TapTapAndroidAdapter';
import { NativeAndroidPlatformAdapter } from './adapters/NativeAndroidPlatformAdapter';

export type { PlatformLoginResult, ComplianceResult, PlatformInitOptions, RuntimePlatform };

export class PlatformService {
    private static _instance: PlatformService | null = null;

    private _adapter: PlatformAdapter | null = null;
    private _platform: RuntimePlatform = 'unknown';
    private _channel: string = '';

    static get instance(): PlatformService {
        if (!this._instance) this._instance = new PlatformService();
        return this._instance;
    }

    private constructor() {
        // Constructor no longer detects platform — deferred to init()
        this._platform = this._detectPlatform();
    }

    // ── Initialization ──

    /**
     * Initialize platform adapter. Must be called once at app startup.
     * @param options Optional init options to override auto-detection
     */
    async init(options?: Partial<PlatformInitOptions>): Promise<void> {
        const opt = options || {};
        this._channel = opt.channel || '';

        this._adapter = this._createAdapter();
        console.log(`[PlatformService] init: platform=${this._platform}, channel=${this._channel}, adapter=${this._adapter.platformId}`);

        await this._adapter.init();

        // Migrate legacy storage keys
        this._migrateLegacyKeys();
    }

    // ── Platform Detection ──

    /** Detect runtime platform */
    private _detectPlatform(): RuntimePlatform {
        // Check WeChat Mini Game first
        if (sys.platform === 'wechatgame' || typeof wx !== 'undefined') {
            try {
                if (typeof wx !== 'undefined' && wx.getSystemInfoSync) return 'wechat_minigame';
            } catch { /* ignore */ }
        }
        // Check native (Android) via jsb
        if (typeof jsb !== 'undefined') {
            // TapTap channel or plain Android
            return 'native_android';
        }
        // Fallback: browser / editor preview
        return 'web_dev';
    }

    /** Create the appropriate adapter based on detected platform */
    private _createAdapter(): PlatformAdapter {
        if (this._platform === 'wechat_minigame') {
            return new WeChatPlatformAdapter();
        }
        if (this._platform === 'native_android') {
            if (this._channel === 'taptap') {
                return new TapTapAndroidAdapter();
            }
            return new NativeAndroidPlatformAdapter();
        }
        // Default: Web Dev (browser / editor preview)
        return new WebDevPlatformAdapter();
    }

    /** Migrate legacy storage keys (wx_openid → platform_user_id) */
    private _migrateLegacyKeys(): void {
        try {
            const storage = this._getStorage();
            if (!storage) return;

            const platformUserId = storage.getItem('platform_user_id');
            if (platformUserId) return; // already migrated

            const wxOpenId = storage.getItem('wx_openid');
            if (wxOpenId) {
                storage.setItem('legacy_wx_openid', wxOpenId);
                storage.setItem('platform_user_id', wxOpenId);
                console.log('[PlatformService] migrated legacy wx_openid to platform_user_id');
            }
        } catch (e) {
            console.warn('[PlatformService] key migration skipped:', e);
        }
    }

    /** Safely access platform storage */
    private _getStorage(): Storage | null {
        try {
            if (this._platform === 'wechat_minigame') {
                return wx.getStorageSync ? ({ getItem: (k: string) => wx.getStorageSync(k) || null, setItem: (k: string, v: string) => wx.setStorageSync(k, v) } as any) as Storage : null;
            }
            if (typeof sys !== 'undefined' && (sys as any).localStorage) {
                return (sys as any).localStorage as Storage;
            }
            if (typeof localStorage !== 'undefined') {
                return localStorage;
            }
            return null;
        } catch {
            return null;
        }
    }

    // ── Public API ──

    /** Current runtime platform */
    get platform(): RuntimePlatform { return this._platform; }

    /** Current channel identifier */
    get channel(): string { return this._channel; }

    /** Whether the current adapter has been initialized */
    get isInitialized(): boolean { return this._adapter !== null; }

    /** Is WeChat Mini Game environment */
    get isWX(): boolean { return this._platform === 'wechat_minigame'; }

    /** Is TapTap Android environment */
    get isTapTap(): boolean { return this._channel === 'taptap' && this._platform === 'native_android'; }

    /** Is development mode (Web Dev / editor preview / debug builds) */
    get isDev(): boolean { return this._platform === 'web_dev'; }

    /** Get the underlying adapter instance (for advanced use) */
    get adapter(): PlatformAdapter | null { return this._adapter; }

    /** Perform platform login */
    async login(): Promise<PlatformLoginResult> {
        if (!this._adapter) {
            return { success: false, userId: null, error: 'PlatformService not initialized' };
        }
        return this._adapter.login();
    }

    /** Perform platform logout */
    async logout(): Promise<void> {
        if (this._adapter) await this._adapter.logout();
    }

    /** Get current logged-in user ID */
    getUserId(): string | null {
        if (this._adapter) return this._adapter.getUserId();
        // Fallback: check storage directly
        try {
            const storage = this._getStorage();
            if (storage) return storage.getItem('platform_user_id');
        } catch { /* ignore */ }
        return null;
    }

    /** Check compliance (anti-addiction) status */
    async checkCompliance(userId: string): Promise<ComplianceResult> {
        if (!this._adapter) {
            return { isAllowed: true };
        }
        return this._adapter.checkCompliance(userId);
    }

    /** Report analytics event */
    report(eventName: string, params?: Record<string, unknown>): void {
        if (this._adapter) {
            this._adapter.report(eventName, params);
        }
    }

    /** Safe global variable check (e.g., hasGlobal('wx')) */
    hasGlobal(name: string): boolean {
        try {
            return typeof (window as any)[name] !== 'undefined';
        } catch {
            return false;
        }
    }
}
