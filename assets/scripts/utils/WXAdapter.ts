/**
 * WXAdapter - 微信小游戏适配层
 * 封装微信 SDK 所有调用：广告/存储/埋点/平台信息
 * 网络异常时自动 fallback，不阻塞玩家
 *
 * 使用方式：所有对外暴露的方法均返回 standard 结果
 * 调用方无需关心底层是微信环境还是开发环境
 */

import { sys } from 'cc';
import { AdPlacement } from '../core/Constants';

/** 广告播放结果 */
export interface AdResult {
    success: boolean;
    rewarded: boolean;
    error?: string;
}

/** 广告回调 */
export type AdCallback = (result: AdResult) => void;

export class WXAdapter {
    private static _instance: WXAdapter;
    private _isWXEnv: boolean = false;
    private _adCache: Map<string, any> = new Map();
    private _adCD: Map<string, number> = new Map();  // 广告位 CD（秒）
    private _adCDDuration: number = 60;               // 同位置 60 秒 CD

    static getInstance(): WXAdapter {
        if (!WXAdapter._instance) {
            WXAdapter._instance = new WXAdapter();
        }
        return WXAdapter._instance;
    }

    constructor() {
        this._isWXEnv = sys.platform === 'wechatgame' || typeof wx !== 'undefined';
    }

    get isWXEnv(): boolean { return this._isWXEnv; }

    // ======== 激励广告 ========

    /**
     * 播放激励视频广告
     * 自动加载 → 播放 → 回调结果
     * 网络异常时自动 fallback（直接给奖励）
     */
    playRewardedAd(placement: AdPlacement, callback?: AdCallback): void {
        // CD 检查
        if (this._isAdOnCD(placement)) {
            callback?.({ success: false, rewarded: false, error: 'ad_cd' });
            return;
        }

        if (!this._isWXEnv) {
            // 开发环境：直接模拟成功
            console.log(`[WXAdapter] 开发环境模拟广告: ${placement}`);
            callback?.({ success: true, rewarded: true });
            return;
        }

        try {
            const adUnitId = this._getAdUnitId(placement);
            if (!adUnitId) {
                this._fallbackReward(callback);
                return;
            }

            // 创建或复用广告实例
            let ad = this._adCache.get(placement);
            if (!ad) {
                ad = wx.createRewardedVideoAd({ adUnitId });
                // 加载失败处理
                ad.onError((err: any) => {
                    console.warn(`[WXAdapter] 广告加载失败 ${placement}: ${err.errMsg}`);
                });
                // 关闭回调
                ad.onClose((res: any) => {
                    this._setAdCD(placement);
                    const rewarded = res?.isEnded ?? false;
                    callback?.({ success: true, rewarded });
                });
                this._adCache.set(placement, ad);
            }

            ad.show()
                .then(() => { /* 广告展示成功 */ })
                .catch((err: any) => {
                    console.warn(`[WXAdapter] 广告展示失败 ${placement}: ${err.errMsg}`);
                    ad.load()
                        .then(() => ad.show())
                        .catch(() => {
                            // 加载+重试都失败 → fallback
                            this._fallbackReward(callback);
                        });
                });
        } catch (err: any) {
            console.warn(`[WXAdapter] 广告异常 ${placement}:`, err);
            this._fallbackReward(callback);
        }
    }

    /** 广告异常时直接发奖励（不阻塞玩家） */
    private _fallbackReward(callback?: AdCallback): void {
        console.log('[WXAdapter] 广告异常 fallback：直接发放奖励');
        callback?.({ success: true, rewarded: true });
    }

    // ======== 插屏广告 ========

    private _interstitialCount: number = 0;
    private _interstitialThreshold: number = 3;  // 每 3 局展示一次

    /** 尝试展示插屏广告（检测频次） */
    tryShowInterstitial(): void {
        this._interstitialCount++;
        if (this._interstitialCount < this._interstitialThreshold) return;
        this._interstitialCount = 0;

        if (!this._isWXEnv) return;

        try {
            const ad = wx.createInterstitialAd({
                adUnitId: this._getAdUnitId(AdPlacement.Interstitial) || '',
            });
            if (ad) {
                ad.show().catch(() => { /* 忽略展示失败 */ });
            }
        } catch (err) {
            // 插屏失败不阻塞
        }
    }

    // ======== Banner 广告 ========

    private _bannerAd: any = null;

    /** 展示 Banner（仅主界面） */
    showBanner(): void {
        if (!this._isWXEnv) return;
        if (this._bannerAd) {
            this._bannerAd.show();
            return;
        }
        try {
            this._bannerAd = wx.createBannerAd({
                adUnitId: this._getAdUnitId(AdPlacement.Banner) || '',
                style: { left: 0, top: 0, width: 320 },
            });
            this._bannerAd.onError(() => { /* Banner 失败不处理 */ });
        } catch (err) { /* 忽略 */ }
    }

    /** 隐藏 Banner（进入战斗时） */
    hideBanner(): void {
        if (this._bannerAd) {
            try { this._bannerAd.hide(); } catch (err) { /* 忽略 */ }
        }
    }

    // ======== 本地存储 ========

    /** 保存数据（带类型校验） */
    setData<T>(key: string, value: T): boolean {
        try {
            const json = JSON.stringify(value);
            const size = new Blob([json]).size;
            // 微信小游戏单条限制
            if (size > 500) {
                console.warn(`[WXAdapter] 存储数据过大: ${key} = ${size}bytes`);
                return false;
            }
            if (this._isWXEnv) {
                wx.setStorageSync(key, json);
            } else {
                localStorage.setItem(key, json);
            }
            return true;
        } catch (err) {
            console.error(`[WXAdapter] 存储失败 ${key}:`, err);
            return false;
        }
    }

    /** 读取数据（缺失返回默认值） */
    getData<T>(key: string, defaultValue: T): T {
        try {
            let raw: string | null = null;
            if (this._isWXEnv) {
                raw = wx.getStorageSync(key);
            } else {
                raw = localStorage.getItem(key);
            }
            if (raw === null || raw === undefined || raw === '') {
                return defaultValue;
            }
            return JSON.parse(raw) as T;
        } catch (err) {
            console.warn(`[WXAdapter] 读取失败 ${key}，返回默认值`);
            return defaultValue;
        }
    }

    /** 删除存储 */
    removeData(key: string): void {
        try {
            if (this._isWXEnv) {
                wx.removeStorageSync(key);
            } else {
                localStorage.removeItem(key);
            }
        } catch (err) { /* 忽略 */ }
    }

    // ======== 数据上报 ========

    /** 上报事件 (含失败缓存) */
    reportAnalytics(eventName: string, data: Record<string, any>): void {
        if (!this._isWXEnv) {
            console.log(`[WXAdapter] 上报: ${eventName}`, data);
            return;
        }
        try {
            // 单条日志 < 1KB
            const logStr = JSON.stringify(data);
            if (logStr.length > 1024) {
                console.warn(`[WXAdapter] 上报数据过大: ${eventName} = ${logStr.length}bytes`);
                return;
            }
            wx.reportAnalytics(eventName, data);
        } catch (err) {
            console.warn(`[WXAdapter] 上报失败: ${eventName}`);
            this._cacheEvent(eventName, data);
        }
    }

    /** 上报广告展示事件 (方便数据统计) */
    reportAdImpression(placement: AdPlacement): void {
        this.reportAnalytics('ad_impression', {
            pos: placement,
            type: this._getAdType(placement),
        });
    }

    /** 获取广告类型 */
    private _getAdType(placement: AdPlacement): string {
        switch (placement) {
            case AdPlacement.Interstitial: return 'interstitial';
            case AdPlacement.Banner: return 'banner';
            default: return 'reward';
        }
    }

    // ======== 上报缓存 ========

    private _analyticsCache: Array<{ eventId: string; params: Record<string, any>; ts: number }> = [];

    /** 缓存失败事件 */
    private _cacheEvent(eventId: string, params: Record<string, any>): void {
        this._analyticsCache.push({ eventId, params, ts: Date.now() });
        if (this._analyticsCache.length > 20) {
            this._analyticsCache.shift();
        }
        this.setData('analytics_cache', this._analyticsCache);
    }

    /** 刷新缓存（启动时调用） */
    flushAnalyticsCache(): void {
        const cache = this.getData<Array<{ eventId: string; params: Record<string, any>; ts: number }>>('analytics_cache', []);
        if (cache.length === 0) return;

        for (const item of cache) {
            try {
                if (this._isWXEnv) {
                    wx.reportAnalytics(item.eventId, item.params);
                }
            } catch (err) {
                // 重试失败就丢弃（防止无限重试循环）
            }
        }
        this.removeData('analytics_cache');
        this._analyticsCache = [];
    }

    // ======== 私有方法 ========

    private _getAdUnitId(placement: AdPlacement): string | null {
        // 占位：正式上线时填写微信广告位 ID
        const adMap: Record<string, string> = {
            [AdPlacement.Revive]: '',
            [AdPlacement.Treasure]: '',
            [AdPlacement.UpgradeExtra]: '',
            [AdPlacement.ShopDiscount]: '',
            [AdPlacement.CoinDouble]: '',
            [AdPlacement.DailyReward]: '',
            [AdPlacement.Marquee]: '',
            [AdPlacement.Interstitial]: '',
            [AdPlacement.Banner]: '',
        };
        return adMap[placement] || null;
    }

    private _isAdOnCD(placement: AdPlacement): boolean {
        const lastTime = this._adCD.get(placement) || 0;
        return (Date.now() - lastTime) < this._adCDDuration * 1000;
    }

    private _setAdCD(placement: AdPlacement): void {
        this._adCD.set(placement, Date.now());
    }
}
