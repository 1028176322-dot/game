/**
 * TapTapAndroidAdapter - Platform adapter for TapTap Android builds
 *
 * Uses TapTapBridge (jsb.reflection) for TapSDK communication.
 * Falls back gracefully when jsb.reflection is not available (dev mode).
 */

import { PlatformAdapter } from './PlatformAdapter';
import { PlatformLoginResult, ComplianceResult } from '../PlatformTypes';
import { isTapTapSDKAvailable, initTapTapSDK, tapLogin, checkCompliance } from '../taptap/TapTapBridge';
import { StorageService } from '../StorageService';

export class TapTapAndroidAdapter implements PlatformAdapter {
    readonly platformId = 'taptap_android';
    readonly platformName = 'TapTap Android';

    private _userId: string | null = null;
    private _sdkAvailable = false;

    async init(_options?: Record<string, unknown>): Promise<void> {
        this._sdkAvailable = isTapTapSDKAvailable();

        if (this._sdkAvailable) {
            // In production, clientId should come from a config or build-time constant
            const result = await initTapTapSDK('YOUR_TAPTAP_CLIENT_ID');
            if (!result.success) {
                console.warn('[TapTapAdapter] TapSDK init failed:', result.error);
            }
        } else {
            console.log('[TapTapAdapter] jsb.reflection not available (dev mode)');
        }

        // Try to restore saved user
        this._userId = StorageService.instance.get('platform_user_id', null);
        console.log('[TapTapAdapter] init, saved userId:', this._userId);
    }

    async login(): Promise<PlatformLoginResult> {
        if (this._sdkAvailable) {
            try {
                const result = await tapLogin();
                if (result.success && result.userId) {
                    this._userId = result.userId;
                    StorageService.instance.set('platform_user_id', result.userId);
                    return {
                        success: true,
                        userId: result.userId,
                        nickname: result.nickname,
                        avatar: result.avatar,
                    };
                }
                return { success: false, userId: null, error: result.error || 'login failed' };
            } catch (err: any) {
                console.error('[TapTapAdapter] login error:', err);
                return { success: false, userId: null, error: String(err) };
            }
        }

        // Dev fallback
        const userId = 'tt_dev_' + Date.now();
        this._userId = userId;
        StorageService.instance.set('platform_user_id', userId);
        return { success: true, userId };
    }

    async logout(): Promise<void> {
        this._userId = null;
        StorageService.instance.remove('platform_user_id');
        console.log('[TapTapAdapter] logout');
    }

    getUserId(): string | null {
        if (this._userId) return this._userId;
        return StorageService.instance.get('platform_user_id', null);
    }

    async checkCompliance(userId: string): Promise<ComplianceResult> {
        if (this._sdkAvailable) {
            try {
                const result = await checkCompliance(userId);
                return {
                    isAllowed: result.isAllowed,
                    reason: result.reason,
                    remainingMinutes: result.remainingMinutes,
                };
            } catch (err) {
                console.warn('[TapTapAdapter] compliance check error:', err);
            }
        }
        // Fallback: allow
        return { isAllowed: true };
    }

    report(eventName: string, params?: Record<string, unknown>): void {
        console.log(`[TapTapAdapter] report: ${eventName}`, params);
        // TapTap analytics integration can be added here in P3
    }
}
