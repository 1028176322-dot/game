/**
 * AdService - 广告管理服务
 *
 * 职责:
 * 1. 激励视频广告（复活/翻倍等）
 * 2. 插屏广告（局间展示）
 * 3. Banner 广告（主界面）
 *
 * 平台策略:
 * - 通过 AdAdapter 委托给平台特定实现
 * - 开发环境: 模拟成功
 * - Android/TapTap: NoopAdAdapter（无广告）
 * - 微信: WeChatAdAdapter
 */

import { PlatformService } from './PlatformService';
import { AdAdapter } from './adapters/AdAdapter';
import { NoopAdAdapter } from './adapters/NoopAdAdapter';
import { AdPlacement } from '../core/Constants';

export interface AdResult {
    success: boolean;
    rewarded: boolean;
    error?: string;
}

export type AdCallback = (result: AdResult) => void;

export class AdService {
    private static _instance: AdService | null = null;
    private readonly _platform: PlatformService;
    private _adapter: AdAdapter | null = null;
    private _adCache = new Map<string, any>();
    private _adCD = new Map<string, number>();
    private readonly _cdDuration = 60; // 同位置 60 秒 CD

    /** 正式环境是否允许广告失败发奖励（false = 不发） */
    prodRewardFallback = false;

    static get instance(): AdService {
        if (!this._instance) this._instance = new AdService();
        return this._instance;
    }

    private constructor() {
        this._platform = PlatformService.instance;
    }

    // ======== 激励视频 ========

    /** 播放激励视频广告 */
    playRewardedAd(placement: AdPlacement, callback?: AdCallback): void {
        if (this._isAdOnCD(placement)) {
            callback?.({ success: false, rewarded: false, error: 'ad_cd' });
            return;
        }

        if (this._platform.isDev) {
            console.log(`[AdService] 开发环境模拟广告: ${placement}`);
            callback?.({ success: true, rewarded: true });
            return;
        }

        this._initAdapter();

        const adUnitId = this._getAdUnitId(placement);
        if (!adUnitId || !this._adapter) {
            this._fallback(callback);
            return;
        }

        try {
            let wrapperRewardedAd = this._adCache.get(placement);
            if (!wrapperRewardedAd) {
                const ad = this._adapter.createRewardedAd(adUnitId);
                ad.onError((err: any) => {
                    console.warn(`[AdService] 广告加载失败 ${placement}: ${err.errMsg || err}`);
                });
                const wrapper = {
                    raw: ad,
                    show: () => {
                        return new Promise<void>((resolve, reject) => {
                            ad.onClose((res) => {
                                this._setAdCD(placement);
                                const rewarded = res?.isEnded ?? false;
                                callback?.({ success: true, rewarded });
                            });
                            ad.show().catch((err: any) => {
                                console.warn(`[AdService] 广告展示失败 ${placement}: ${err.errMsg || err}`);
                                ad.show().catch(() => this._fallback(callback));
                            });
                            resolve();
                        });
                    },
                };
                this._adCache.set(placement, wrapper);
            }

            wrapperRewardedAd.show();
        } catch (err: any) {
            console.warn(`[AdService] 广告异常 ${placement}:`, err);
            this._fallback(callback);
        }
    }

    // ======== 插屏广告 ========

    private _interstitialCount = 0;
    private readonly _interstitialThreshold = 3;

    /** 尝试展示插屏广告（按频次控制） */
    tryShowInterstitial(): void {
        this._interstitialCount++;
        if (this._interstitialCount < this._interstitialThreshold) return;
        this._interstitialCount = 0;

        this._initAdapter();
        if (!this._adapter) return;

        try {
            const adUnitId = this._getAdUnitId(AdPlacement.Interstitial);
            if (!adUnitId) return;
            const ad = this._adapter.createInterstitialAd(adUnitId);
            ad.show().catch(() => {});
        } catch { /* 忽略 */ }
    }

    // ======== Banner ========

    private _bannerAd: any = null;

    /** 展示 Banner */
    showBanner(): void {
        this._initAdapter();
        if (!this._adapter) return;

        if (this._bannerAd) {
            this._bannerAd.show();
            return;
        }
        try {
            const adUnitId = this._getAdUnitId(AdPlacement.Banner);
            if (!adUnitId) return;
            const bAd = this._adapter.createBannerAd(adUnitId, { left: 0, top: 0, width: 320 });
            bAd.onError(() => {});
            this._bannerAd = bAd;
        } catch { /* 忽略 */ }
    }

    /** 隐藏 Banner */
    hideBanner(): void {
        if (this._bannerAd) {
            try { this._bannerAd.hide(); } catch { /* 忽略 */ }
        }
    }

    // ======== 私有方法 ========

    /** 延迟初始化适配器（懒加载） */
    private _initAdapter(): void {
        if (this._adapter) return;
        if (this._platform.isWX) {
            const { WeChatAdAdapter } = require('./adapters/WeChatAdAdapter');
            this._adapter = new WeChatAdAdapter();
        } else {
            this._adapter = new NoopAdAdapter();
        }
    }

    private _fallback(callback?: AdCallback): void {
        if (!this._platform.isDev && !this.prodRewardFallback) {
            console.log('[AdService] 正式环境广告失败，不发奖励');
            callback?.({ success: false, rewarded: false, error: 'ad_failed' });
            return;
        }
        console.log('[AdService] 广告异常 fallback：直接发放奖励');
        callback?.({ success: true, rewarded: true });
    }

    private _getAdUnitId(placement: AdPlacement): string | null {
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
        const last = this._adCD.get(placement) || 0;
        return (Date.now() - last) < this._cdDuration * 1000;
    }

    private _setAdCD(placement: AdPlacement): void {
        this._adCD.set(placement, Date.now());
    }
}
