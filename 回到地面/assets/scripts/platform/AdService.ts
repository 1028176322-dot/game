/**
 * AdService - 广告管理服务
 *
 * 职责:
 * 1. 激励视频广告（复活/翻倍等）
 * 2. 插屏广告（局间展示）
 * 3. Banner 广告（主界面）
 *
 * 环境策略:
 * - 开发环境: 直接模拟成功
 * - 正式环境: 网络异常时按策略 fallback
 *
 * Phase 6: 从 WXAdapter 提取广告逻辑
 */

import { PlatformService } from './PlatformService';
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

        try {
            const adUnitId = this._getAdUnitId(placement);
            if (!adUnitId) {
                this._fallback(callback);
                return;
            }

            let ad = this._adCache.get(placement);
            if (!ad) {
                ad = wx.createRewardedVideoAd({ adUnitId });
                ad.onError((err: any) => {
                    console.warn(`[AdService] 广告加载失败 ${placement}: ${err.errMsg}`);
                });
                ad.onClose((res: any) => {
                    this._setAdCD(placement);
                    const rewarded = res?.isEnded ?? false;
                    callback?.({ success: true, rewarded });
                });
                this._adCache.set(placement, ad);
            }

            ad.show()
                .catch((err: any) => {
                    console.warn(`[AdService] 广告展示失败 ${placement}: ${err.errMsg}`);
                    ad.load()
                        .then(() => ad.show())
                        .catch(() => this._fallback(callback));
                });
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
        if (!this._platform.isWX) return;

        try {
            const ad = wx.createInterstitialAd({
                adUnitId: this._getAdUnitId(AdPlacement.Interstitial) || '',
            });
            if (ad) ad.show().catch(() => {});
        } catch { /* 忽略 */ }
    }

    // ======== Banner ========

    private _bannerAd: any = null;

    /** 展示 Banner */
    showBanner(): void {
        if (!this._platform.isWX) return;
        if (this._bannerAd) {
            this._bannerAd.show();
            return;
        }
        try {
            this._bannerAd = wx.createBannerAd({
                adUnitId: this._getAdUnitId(AdPlacement.Banner) || '',
                style: { left: 0, top: 0, width: 320 },
            });
            this._bannerAd.onError(() => {});
        } catch { /* 忽略 */ }
    }

    /** 隐藏 Banner */
    hideBanner(): void {
        if (this._bannerAd) {
            try { this._bannerAd.hide(); } catch { /* 忽略 */ }
        }
    }

    // ======== 私有方法 ========

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
