/**
 * StorageService - 跨平台本地存储
 *
 * 统一封装 localStorage（浏览器）和 wx.setStorageSync（微信小游戏）
 * 支持 getJson / setJson / remove / migrate 等操作
 *
 * Phase 6: 从 WXAdapter + PlayerDataManager 提取存储逻辑
 */

import { PlatformService } from './PlatformService';

/** 存档格式规范 */
export interface SaveDataSchema {
    schemaVersion: number;
    updatedAt: number;
    player: {
        soulStones: number;
        unlockedCharacters: string[];
        selectedCharacter: string;
        selectedTalent: string | null;
        unlockedRelicPoolExtras: string[];
        bestFloor: number;
        totalKills: number;
        totalRuns: number;
    };
    settings: {
        sound: boolean;
        music: boolean;
        vibration: boolean;
    };
}

type Migration = (oldData: any) => any;

const DEFAULT_SAVE: SaveDataSchema = {
    schemaVersion: 1,
    updatedAt: Date.now(),
    player: {
        soulStones: 0,
        unlockedCharacters: ['warrior'],
        selectedCharacter: 'warrior',
        selectedTalent: null,
        unlockedRelicPoolExtras: [],
        bestFloor: 0,
        totalKills: 0,
        totalRuns: 0,
    },
    settings: {
        sound: true,
        music: true,
        vibration: true,
    },
};

export class StorageService {
    private static _instance: StorageService | null = null;
    private readonly _platform: PlatformService;

    static get instance(): StorageService {
        if (!this._instance) this._instance = new StorageService();
        return this._instance;
    }

    private constructor() {
        this._platform = PlatformService.instance;
    }

    /** 读取 JSON 数据（缺失返回默认值） */
    getJson<T>(key: string, fallback: T): T {
        try {
            let raw: string | null = null;
            if (this._platform.isWX) {
                raw = wx.getStorageSync(key);
            } else {
                raw = localStorage.getItem(key);
            }
            if (raw === null || raw === undefined || raw === '') return fallback;
            return JSON.parse(raw) as T;
        } catch (err) {
            console.warn(`[StorageService] read failed: ${key}`, err);
            return fallback;
        }
    }

    /** 写入 JSON 数据 */
    setJson<T>(key: string, value: T): boolean {
        try {
            const raw = JSON.stringify(value);
            if (raw.length > 1024 * 200) {
                console.warn(`[StorageService] large value: ${key}, ${raw.length} bytes`);
            }
            if (this._platform.isWX) {
                wx.setStorageSync(key, raw);
            } else {
                localStorage.setItem(key, raw);
            }
            return true;
        } catch (err) {
            console.warn(`[StorageService] write failed: ${key}`, err);
            return false;
        }
    }

    /** 读取原始字符串 */
    get(key: string, fallback: string = ''): string {
        try {
            let raw: string | null = null;
            if (this._platform.isWX) {
                raw = wx.getStorageSync(key);
            } else {
                raw = localStorage.getItem(key);
            }
            if (raw === null || raw === undefined) return fallback;
            return raw;
        } catch (err) {
            console.warn(`[StorageService] read failed: ${key}`, err);
            return fallback;
        }
    }

    /** 写入原始字符串 */
    set(key: string, value: string): boolean {
        try {
            if (this._platform.isWX) {
                wx.setStorageSync(key, value);
            } else {
                localStorage.setItem(key, value);
            }
            return true;
        } catch (err) {
            console.warn(`[StorageService] write failed: ${key}`, err);
            return false;
        }
    }

    /** 删除指定 key */
    remove(key: string): void {
        try {
            if (this._platform.isWX) {
                wx.removeStorageSync(key);
            } else {
                localStorage.removeItem(key);
            }
        } catch {
            // 忽略删除失败
        }
    }

    /** 读取存档（带版本迁移） */
    getSave<T>(key: string, migrations: Record<number, Migration>): T {
        const raw = this.getJson<any>(key, null);
        if (raw === null) return DEFAULT_SAVE as unknown as T;

        let current = raw;
        const version = current.schemaVersion ?? 1;
        const sortedMigrations = Object.keys(migrations)
            .map(Number)
            .sort((a, b) => a - b);

        for (const v of sortedMigrations) {
            if (v > version) {
                current = migrations[v](current);
            }
        }
        return current as T;
    }

    /** 获取默认存档 */
    get defaultSave(): SaveDataSchema {
        return { ...DEFAULT_SAVE, updatedAt: Date.now() };
    }
}
