/**
 * AdAdapter - Abstract interface for advertising platform adapters
 *
 * Each platform (WeChat, Android-noop) implements this interface
 * to provide ad functionality.
 */

export interface AdUnitStyle {
    left: number;
    top: number;
    width: number;
}

export interface RewardedAd {
    show(): Promise<void>;
    onClose(callback: (res: { isEnded?: boolean }) => void): void;
    onError(callback: (err: any) => void): void;
}

export interface InterstitialAd {
    show(): Promise<void>;
}

export interface BannerAd {
    show(): void;
    hide(): void;
    onError(callback: (err: any) => void): void;
}

export interface AdAdapter {
    /** Whether this platform supports advertising */
    readonly isAdSupported: boolean;

    /** Create a rewarded video ad */
    createRewardedAd(adUnitId: string): RewardedAd;

    /** Create an interstitial ad */
    createInterstitialAd(adUnitId: string): InterstitialAd;

    /** Create a banner ad */
    createBannerAd(adUnitId: string, style: AdUnitStyle): BannerAd;
}
