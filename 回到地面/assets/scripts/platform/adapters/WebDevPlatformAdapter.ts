/**
 * WebDevPlatformAdapter - Platform adapter for browser / Cocos editor preview
 *
 * Provides dev-friendly behavior:
 * - localStorage-based user simulation
 * - Skips compliance checks (always allowed)
 * - Logs analytics to console
 */

import { PlatformAdapter } from './PlatformAdapter';
import { PlatformLoginResult, ComplianceResult } from '../PlatformTypes';

const DEV_USER_KEY = 'platform_user_id';
const DEV_GUEST_KEY = 'is_guest';

export class WebDevPlatformAdapter implements PlatformAdapter {
    readonly platformId = 'web_dev';
    readonly platformName = 'Web Dev';

    private _userId: string | null = null;
    private _isGuest = false;

    async init(_options?: Record<string, unknown>): Promise<void> {
        // Restore saved user
        this._userId = localStorage.getItem(DEV_USER_KEY);
        this._isGuest = localStorage.getItem(DEV_GUEST_KEY) === 'true';
        console.log('[WebDevAdapter] init, saved userId:', this._userId);
    }

    async login(): Promise<PlatformLoginResult> {
        // Dev mode: create/return local dev user
        const userId = 'dev_user_' + Date.now();
        this._userId = userId;
        this._isGuest = false;
        localStorage.setItem(DEV_USER_KEY, userId);
        localStorage.removeItem(DEV_GUEST_KEY);
        return { success: true, userId };
    }

    async logout(): Promise<void> {
        this._userId = null;
        this._isGuest = false;
        localStorage.removeItem(DEV_USER_KEY);
        localStorage.removeItem(DEV_GUEST_KEY);
        console.log('[WebDevAdapter] logout');
    }

    getUserId(): string | null {
        return this._userId;
    }

    async checkCompliance(_userId: string): Promise<ComplianceResult> {
        // Dev mode: always allowed
        return { isAllowed: true };
    }

    report(eventName: string, params?: Record<string, unknown>): void {
        console.log(`[WebDevAdapter] report: ${eventName}`, params);
    }
}
