/**
 * ComplianceService - 合规检查（实名 + 防沉迷）
 *
 * 职责:
 * 1. 登录后检查用户合规状态
 * 2. 开局前检查（缓存状态避免频繁接口调用）
 * 3. 合规阻断/提醒 UI
 *
 * 流程: AppFlowController.start() → ComplianceService.check() → 通过/阻断
 *       RunCoordinator.startRun() → ComplianceService.canStartRun() → 通过/阻断
 */

import { PlatformService, ComplianceResult } from './PlatformService';
import { T } from '../core/TextManager';

export class ComplianceService {
    private static _instance: ComplianceService | null = null;

    private _cachedResult: ComplianceResult | null = null;
    private _lastCheckTime = 0;
    private readonly _cacheTTL = 5 * 60 * 1000; // 5分钟缓存
    private _checkInProgress = false;

    static get instance(): ComplianceService {
        if (!this._instance) this._instance = new ComplianceService();
        return this._instance;
    }

    /** 登录后执行合规检查 */
    async verifyAfterLogin(userId: string): Promise<ComplianceResult> {
        if (this._checkInProgress) {
            // 并发保护：等待上次检查完成
            return new Promise((resolve) => {
                const check = () => {
                    if (!this._checkInProgress) {
                        resolve(this._cachedResult || { isAllowed: true });
                    } else {
                        setTimeout(check, 200);
                    }
                };
                check();
            });
        }

        this._checkInProgress = true;
        try {
            const platform = PlatformService.instance;
            const result = await platform.checkCompliance(userId);
            this._cachedResult = result;
            this._lastCheckTime = Date.now();

            if (!result.isAllowed) {
                console.warn('[Compliance] blocked:', result.reason || 'unknown');
            } else if (result.remainingMinutes !== undefined) {
                console.log(`[Compliance] allowed, remaining: ${result.remainingMinutes}min`);
            }

            return result;
        } finally {
            this._checkInProgress = false;
        }
    }

    /** 开局前快速检查（使用缓存） */
    canStartRun(): boolean | 'need_recheck' {
        const now = Date.now();

        // 有缓存且在 TTL 内
        if (this._cachedResult && (now - this._lastCheckTime) < this._cacheTTL) {
            return this._cachedResult.isAllowed;
        }

        // 需要重新检查
        return 'need_recheck';
    }

    /** 刷新缓存（忽略 TTL） */
    async refreshCheck(userId: string): Promise<ComplianceResult> {
        return this.verifyAfterLogin(userId);
    }

    /** 清除缓存（登出时调用） */
    clearCache(): void {
        this._cachedResult = null;
        this._lastCheckTime = 0;
    }

    /** 获取剩余游戏时间（分钟），未成年人限时用 */
    getRemainingMinutes(): number | undefined {
        return this._cachedResult?.remainingMinutes;
    }

    /** 是否被合规阻止 */
    get isBlocked(): boolean {
        return this._cachedResult !== null && !this._cachedResult.isAllowed;
    }

    /** 合规提示文本 */
    getBlockMessage(): string {
        if (!this._cachedResult) return '';
        if (!this._cachedResult.isAllowed) {
            return this._cachedResult.reason || T('ui.complianceBlocked');
        }
        if (this._cachedResult.remainingMinutes !== undefined) {
            return T('ui.complianceRemaining', { minutes: this._cachedResult.remainingMinutes });
        }
        return '';
    }
}
