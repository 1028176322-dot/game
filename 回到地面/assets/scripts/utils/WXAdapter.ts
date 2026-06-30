/**
 * WXAdapter - 微信小游戏适配层（Phase 6 精简版）
 *
 * [Phase 6] 职责已拆分到 platform/ 服务类:
 *   - 广告 → AdService
 *   - 存储 → StorageService
 *   - 埋点 → AnalyticsService
 *   - 平台检测 → PlatformService
 *
 * 当前保留为兼容代理，新代码请直接使用 platform/ 下的服务
 */

import { AdPlacement } from '../core/Constants';
import { AdService, AdResult, AdCallback } from '../platform/AdService';
import { AnalyticsService } from '../platform/AnalyticsService';
import { PlatformService } from '../platform/PlatformService';

export { AdResult, AdCallback };

export class WXAdapter {
    private static _instance: WXAdapter;

    static getInstance(): WXAdapter {
        if (!WXAdapter._instance) WXAdapter._instance = new WXAdapter();
        return WXAdapter._instance;
    }

    get isWXEnv(): boolean { return PlatformService.instance.isWX; }

    // ======== 广告（代理到 AdService） ========

    playRewardedAd(placement: AdPlacement, callback?: AdCallback): void {
        AdService.instance.playRewardedAd(placement, callback);
    }

    tryShowInterstitial(): void {
        AdService.instance.tryShowInterstitial();
    }

    showBanner(): void {
        AdService.instance.showBanner();
    }

    hideBanner(): void {
        AdService.instance.hideBanner();
    }

    // ======== 数据上报（代理到 AnalyticsService） ========

    reportAnalytics(eventName: string, data: Record<string, any>): void {
        AnalyticsService.instance.report(eventName, data);
    }

    reportAdImpression(placement: AdPlacement): void {
        AnalyticsService.instance.reportAdImpression(placement);
    }

    flushAnalyticsCache(): void {
        AnalyticsService.instance.flushCache();
    }
}
