/**
 * WeChatPlatformAdapter - Platform adapter for WeChat Mini Game
 *
 * Wraps wx.* API calls into the PlatformAdapter interface.
 * Preserves all existing WeChat login and reporting behavior.
 */

import { PlatformAdapter } from './PlatformAdapter';
import { PlatformLoginResult, ComplianceResult } from '../PlatformTypes';

declare const wx: any;

export class WeChatPlatformAdapter implements PlatformAdapter {
    readonly platformId = 'wechat_minigame';
    readonly platformName = 'WeChat';

    private _userId: string | null = null;

    async init(_options?: Record<string, unknown>): Promise<void> {
        console.log('[WeChatAdapter] init');
        // WeChat runtime is ready by the time component onLoad fires
    }

    async login(): Promise<PlatformLoginResult> {
        return new Promise<PlatformLoginResult>((resolve) => {
            if (typeof wx === 'undefined' || !wx.login) {
                resolve({ success: false, userId: null, error: 'wx.login not available' });
                return;
            }

            wx.login({
                success: (res: any) => {
                    if (res.code) {
                        // In a real app we'd exchange code for openId via backend.
                        // For now use code as offline userId placeholder.
                        const userId = 'wx_' + res.code.slice(0, 16);
                        this._userId = userId;
                        resolve({ success: true, userId });
                    } else {
                        resolve({ success: false, userId: null, error: 'wx.login failed: no code' });
                    }
                },
                fail: (err: any) => {
                    console.error('[WeChatAdapter] wx.login error:', err);
                    resolve({ success: false, userId: null, error: String(err) });
                },
            });
        });
    }

    async logout(): Promise<void> {
        this._userId = null;
        console.log('[WeChatAdapter] logout');
    }

    getUserId(): string | null {
        return this._userId;
    }

    async checkCompliance(userId: string): Promise<ComplianceResult> {
        // Use wx.checkSession / wx.getUserInfo for compliance where available
        // P0: simple session check
        return new Promise<ComplianceResult>((resolve) => {
            if (typeof wx === 'undefined' || !wx.checkSession) {
                resolve({ isAllowed: true });
                return;
            }
            wx.checkSession({
                success: () => {
                    resolve({ isAllowed: true });
                },
                fail: () => {
                    // Session expired — user needs to re-login
                    resolve({ isAllowed: false, reason: 'session_expired' });
                },
            });
        });
    }

    report(eventName: string, params?: Record<string, unknown>): void {
        if (typeof wx !== 'undefined' && wx.reportAnalytics) {
            try {
                wx.reportAnalytics(eventName, params || {});
            } catch (e) {
                console.warn('[WeChatAdapter] reportAnalytics error:', e);
            }
        }
    }
}
