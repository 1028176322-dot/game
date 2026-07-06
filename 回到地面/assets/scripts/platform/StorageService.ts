/**
 * StorageService (v1 -> v2 proxy)
 *
 * DEPRECATED: Use core/save/SaveService or core/storage/StorageService instead.
 * This file now delegates to core/storage/StorageService v2 for backward compat.
 */

import { StorageService as StorageServiceV2 } from '../core/storage/StorageService';

type Migration = (oldData: any) => any;

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
    private readonly _v2: StorageServiceV2;

    static get instance(): StorageService {
        if (!this._instance) this._instance = new StorageService();
        return this._instance;
    }

    private constructor() {
        this._v2 = StorageServiceV2.instance;
    }

    getJson<T>(key: string, fallback: T): T {
        const result = this._v2.getJson(key, fallback);
        return result.value;
    }

    setJson<T>(key: string, value: T): boolean {
        return this._v2.setJson(key, value);
    }

    get(key: string, fallback: string = ''): string {
        return this._v2.getString(key) ?? fallback;
    }

    set(key: string, value: string): boolean {
        return this._v2.setString(key, value);
    }

    remove(key: string): void {
        this._v2.remove(key);
    }

    getSave<T>(key: string, migrations: Record<number, Migration>): T {
        return this._v2.readWithMigration<T>(key, DEFAULT_SAVE as unknown as T, migrations);
    }

    get defaultSave(): SaveDataSchema {
        return { ...DEFAULT_SAVE, updatedAt: Date.now() };
    }
}
