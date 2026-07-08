/**
 * NoopAdAdapter - No-operation ad adapter for platforms without advertising
 *
 * Used on Android native / TapTap builds.
 * All ad operations return mock success objects.
 */

import { AdAdapter, RewardedAd, InterstitialAd, BannerAd, AdUnitStyle } from './AdAdapter';

class NoopRewardedAd implements RewardedAd {
    private _onClose: ((res: { isEnded?: boolean }) => void) | null = null;
    private _onError: ((err: any) => void) | null = null;

    async show(): Promise<void> {
        console.log('[NoopAd] rewarded ad show (simulated)');
        // Simulate ad close after a brief delay
        setTimeout(() => {
            this._onClose?.({ isEnded: true });
        }, 500);
    }

    onClose(callback: (res: { isEnded?: boolean }) => void): void {
        this._onClose = callback;
    }

    onError(callback: (err: any) => void): void {
        this._onError = callback;
    }
}

class NoopInterstitialAd implements InterstitialAd {
    async show(): Promise<void> {
        console.log('[NoopAd] interstitial ad show (simulated)');
    }
}

class NoopBannerAd implements BannerAd {
    show(): void {
        console.log('[NoopAd] banner show (simulated)');
    }
    hide(): void {
        console.log('[NoopAd] banner hide (simulated)');
    }
    onError(_callback: (err: any) => void): void {
        // noop
    }
}

export class NoopAdAdapter implements AdAdapter {
    readonly isAdSupported = false;

    createRewardedAd(_adUnitId: string): RewardedAd {
        return new NoopRewardedAd();
    }

    createInterstitialAd(_adUnitId: string): InterstitialAd {
        return new NoopInterstitialAd();
    }

    createBannerAd(_adUnitId: string, _style: AdUnitStyle): BannerAd {
        return new NoopBannerAd();
    }
}
