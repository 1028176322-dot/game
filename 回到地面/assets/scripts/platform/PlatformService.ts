/**
 * PlatformService - 平台检测与初始化
 *
 * 统一管理运行环境判断：
 * - 微信小游戏 / 浏览器开发环境
 * - 开发环境 vs 正式环境
 *
 * Phase 6: 从 WXAdapter 提取平台检测逻辑
 */

import { sys } from 'cc';

export class PlatformService {
    private static _instance: PlatformService | null = null;
    private _isWX: boolean;
    private _isDev: boolean;

    static get instance(): PlatformService {
        if (!this._instance) this._instance = new PlatformService();
        return this._instance;
    }

    private constructor() {
        this._isWX = sys.platform === 'wechatgame' || typeof wx !== 'undefined';
        this._isDev = !this._isWX || CC_DEBUG;
    }

    /** 是否为微信小游戏环境 */
    get isWX(): boolean { return this._isWX; }

    /** 是否为开发环境（非微信 或 CC_DEBUG） */
    get isDev(): boolean { return this._isDev; }

    /** 判断对象是否存在（安全访问 wx 全局变量） */
    hasGlobal(name: string): boolean {
        try {
            return typeof (window as any)[name] !== 'undefined';
        } catch {
            return false;
        }
    }
}
