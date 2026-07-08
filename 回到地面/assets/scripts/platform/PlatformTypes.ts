/**
 * PlatformTypes - Shared type definitions for platform adapter pattern
 *
 * Defines runtime platform identifiers and common result types
 * used by all platform adapters.
 */

/** Supported runtime platforms */
export type RuntimePlatform = 'wechat_minigame' | 'taptap_android' | 'native_android' | 'web_dev' | 'unknown';

/** Result returned by platform login methods */
export interface PlatformLoginResult {
    success: boolean;
    userId: string | null;
    token?: string;
    nickname?: string;
    avatar?: string;
    error?: string;
}

/** Result returned by compliance (anti-addiction) checks */
export interface ComplianceResult {
    isAllowed: boolean;
    /** Reason string if blocked */
    reason?: string;
    /** Remaining play time in minutes (for minors) */
    remainingMinutes?: number;
    /** Whether real-name auth is required */
    realNameRequired?: boolean;
}

/** Options passed to PlatformService.init() */
export interface PlatformInitOptions {
    channel: string;
    platform: string;
    debugMode?: boolean;
}
