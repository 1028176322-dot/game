/**
 * WeChatAdAdapter - Ad adapter for WeChat Mini Game
 *
 * Wraps wx.createRewardedVideoAd / createInterstitialAd / createBannerAd
 * into the AdAdapter interface.
 */

declare const wx: any;

import { AdAdapter, RewardedAd, InterstitialAd, BannerAd, AdUnitStyle } from './AdAdapter';

class WeChatRewardedAd implements RewardedAd {
    private _ad: any;

    constructor(ad: any) {
        this._ad = ad;
    }

    async show(): Promise<void> {
        return this._ad.show();
    }

    onClose(callback: (res: { isEnded?: boolean }) => void): void {
        this._ad.onClose(callback);
    }

    onError(callback: (err: any) => void): void {
        this._ad.onError(callback);
    }
}

class WeChatInterstitialAd implements InterstitialAd {
    private _ad: any;

    constructor(ad: any) {
        this._ad = ad;
    }

    async show(): Promise<void> {
        return this._ad.show();
    }
}

class WeChatBannerAd implements BannerAd {
    private _ad: any;

    constructor(ad: any) {
        this._ad = ad;
    }

    show(): void {
        this._ad.show();
    }

    hide(): void {
        this._ad.hide();
    }

    onError(callback: (err: any) => void): void {
        this._ad.onError(callback);
    }
}

export class WeChatAdAdapter implements AdAdapter {
    readonly isAdSupported = true;

    createRewardedAd(adUnitId: string): RewardedAd {
        const ad = typeof wx !== 'undefined' ? wx.createRewardedVideoAd({ adUnitId }) : null;
        return new WeChatRewardedAd(ad || this._createMock());
    }

    createInterstitialAd(adUnitId: string): InterstitialAd {
        const ad = typeof wx !== 'undefined' ? wx.createInterstitialAd({ adUnitId }) : null;
        return new WeChatInterstitialAd(ad || { show: async () => {} });
    }

    createBannerAd(adUnitId: string, style: AdUnitStyle): BannerAd {
        const ad = typeof wx !== 'undefined'
            ? wx.createBannerAd({ adUnitId, style })
            : null;
        return new WeChatBannerAd(ad || { show() {}, hide() {}, onError() {} });
    }

    private _createMock(): any {
        return {
            show: async () => {},
            onClose: () => {},
            onError: () => {},
        };
    }
}
