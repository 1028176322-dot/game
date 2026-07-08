/**
 * PlatformAdapter - Abstract interface for all platform adapters
 *
 * Each runtime platform (wechat, taptap, android-native, web-dev)
 * implements this interface to provide platform-specific behavior.
 */

import { PlatformLoginResult, ComplianceResult } from '../PlatformTypes';

export interface PlatformAdapter {
    /** Platform identifier string */
    readonly platformId: string;
    /** Human-readable platform name */
    readonly platformName: string;

    /** Initialize the platform (SDK init, env detection, etc.) */
    init(options?: Record<string, unknown>): Promise<void>;

    /** Perform platform login */
    login(): Promise<PlatformLoginResult>;

    /** Perform logout */
    logout(): Promise<void>;

    /** Get current logged-in user ID, or null if not logged in */
    getUserId(): string | null;

    /** Check anti-addiction / compliance status */
    checkCompliance(userId: string): Promise<ComplianceResult>;

    /** Report analytics event (noop if platform does not support) */
    report(eventName: string, params?: Record<string, unknown>): void;
}
