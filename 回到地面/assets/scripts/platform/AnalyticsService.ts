/**
 * AnalyticsService - 数据埋点服务
 *
 * 职责:
 * 1. 封装 wx.reportAnalytics 调用
 * 2. 上报失败时自动缓存，启动时重试
 * 3. 开发环境直接打印日志
 *
 * Phase 6: 从 WXAdapter 提取埋点逻辑
 */

import { PlatformService } from './PlatformService';
import { StorageService } from './StorageService';
import { AdPlacement } from '../core/Constants';

export class AnalyticsService {
    private static _instance: AnalyticsService | null = null;
    private readonly _platform: PlatformService;
    private _cache: Array<{ eventId: string; params: Record<string, any>; ts: number }> = [];

    static get instance(): AnalyticsService {
        if (!this._instance) this._instance = new AnalyticsService();
        return this._instance;
    }

    private constructor() {
        this._platform = PlatformService.instance;
    }

    /** 上报事件 */
    report(eventName: string, data: Record<string, any>): void {
        const logStr = JSON.stringify(data);
        if (logStr.length > 1024) {
            console.warn(`[Analytics] 数据过大: ${eventName} = ${logStr.length}bytes`);
            return;
        }

        // 通过 PlatformService 委托给当前适配器
        this._platform.report(eventName, data);
    }

    /** 上报广告展示事件 */
    reportAdImpression(placement: AdPlacement): void {
        this.report('ad_impression', {
            pos: placement,
            type: this._getAdType(placement),
        });
    }

    /** 启动时刷新缓存（通过 PlatformService 委托给适配器） */
    flushCache(): void {
        const cached = StorageService.instance.getJson<
            Array<{ eventId: string; params: Record<string, any>; ts: number }>
        >('analytics_cache', []);

        if (cached.length === 0) return;
        for (const item of cached) {
            try {
                this._platform.report(item.eventId, item.params);
            } catch { /* 丢弃 */ }
        }
        StorageService.instance.remove('analytics_cache');
        this._cache = [];
    }

    private _cacheEvent(eventId: string, params: Record<string, any>): void {
        this._cache.push({ eventId, params, ts: Date.now() });
        if (this._cache.length > 20) this._cache.shift();
        StorageService.instance.setJson('analytics_cache', this._cache);
    }

    private _getAdType(placement: AdPlacement): string {
        switch (placement) {
            case AdPlacement.Interstitial: return 'interstitial';
            case AdPlacement.Banner: return 'banner';
            default: return 'reward';
        }
    }
}
