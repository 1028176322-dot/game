/**
 * NativeAndroidPlatformAdapter - Adapter for Android native test builds
 *
 * Used when building to Android without TapTap SDK (P0 debug builds).
 * Behavior:
 * - Fixed local user 'android_local_user'
 * - Skips compliance checks (always allowed)
 * - Logs analytics to console
 */

import { sys } from 'cc';
import { PlatformAdapter } from './PlatformAdapter';
import { PlatformLoginResult, ComplianceResult } from '../PlatformTypes';

const ANDROID_USER_KEY = 'platform_user_id';
const ANDROID_GUEST_KEY = 'is_guest';

export class NativeAndroidPlatformAdapter implements PlatformAdapter {
    readonly platformId = 'native_android';
    readonly platformName = 'Android Native';

    private _userId: string | null = null;
    private _isGuest = false;

    async init(_options?: Record<string, unknown>): Promise<void> {
        // Try to restore saved user from platform storage
        try {
            // sys is provided by the top-level cc import
            // Using sys.localStorage which works in native builds
            if (sys && (sys as any).localStorage) {
                this._userId = (sys as any).localStorage.getItem(ANDROID_USER_KEY);
                this._isGuest = (sys as any).localStorage.getItem(ANDROID_GUEST_KEY) === 'true';
            }
        } catch {
            // Fallback: no persistence available
        }
        console.log('[NativeAndroidAdapter] init, saved userId:', this._userId);
    }

    async login(): Promise<PlatformLoginResult> {
        const userId = this._userId || 'android_local_user';
        this._userId = userId;
        this._isGuest = false;
        try {
            // sys is provided by the top-level cc import
            if (sys && (sys as any).localStorage) {
                (sys as any).localStorage.setItem(ANDROID_USER_KEY, userId);
                (sys as any).localStorage.removeItem(ANDROID_GUEST_KEY);
            }
        } catch {
            // ignore
        }
        return { success: true, userId };
    }

    async logout(): Promise<void> {
        this._userId = null;
        this._isGuest = false;
        try {
            // sys is provided by the top-level cc import
            if (sys && (sys as any).localStorage) {
                (sys as any).localStorage.removeItem(ANDROID_USER_KEY);
                (sys as any).localStorage.removeItem(ANDROID_GUEST_KEY);
            }
        } catch {
            // ignore
        }
        console.log('[NativeAndroidAdapter] logout');
    }

    getUserId(): string | null {
        return this._userId;
    }

    async checkCompliance(_userId: string): Promise<ComplianceResult> {
        // P0: skip compliance, always allowed
        return { isAllowed: true };
    }

    report(eventName: string, params?: Record<string, unknown>): void {
        console.log(`[NativeAndroidAdapter] report: ${eventName}`, params);
    }
}
