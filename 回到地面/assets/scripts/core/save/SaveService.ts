/**
 * SaveService - 存档业务服务
 *
 * Business-level save/load API. All game modules that persist data go through
 * this service rather than touching StorageService or wx/localStorage directly.
 *
 * Phase 1 of data storage implementation plan.
 */

import { StorageService } from '../storage/StorageService';
import { SaveMigrator } from './SaveMigrator';
import {
    PlayerProfileSave,
    RunSave,
    SettingsSave,
    SAVE_KEYS,
} from './SaveTypes';

// ── Defaults ──

function defaultProfile(): PlayerProfileSave {
    const now = Date.now();
    return {
        schemaVersion: 1,
        playerId: 'local_' + String(now),
        updatedAt: now,
        createdAt: now,
        profile: {
            soulStones: 0,
            unlockedCharacters: ['warrior'],
            selectedCharacter: 'warrior',
            selectedTalent: null,
            unlockedRelicPoolExtras: [],
        },
        stats: {
            bestFloor: 0,
            totalKills: 0,
            totalRuns: 0,
            totalRevives: 0,
            totalAdsWatched: 0,
        },
        flags: {
            tutorialFinished: false,
            privacyAccepted: false,
            characterCreated: false,
        },
        zoneClearCounts: {},
        zoneBestFloors: {},
    };
}

function defaultSettings(): SettingsSave {
    return {
        schemaVersion: 1,
        audio: { music: true, sfx: true, musicVolume: 0.8, sfxVolume: 0.8 },
        display: { quality: 'auto', damageNumber: true, screenShake: true },
        control: { joystickMode: 'fixed' },
    };
}

// ── Service ──

export class SaveService {
    private static _instance: SaveService | null = null;
    private readonly _storage: StorageService;
    private readonly _migrator: SaveMigrator;

    static get instance(): SaveService {
        if (!this._instance) this._instance = new SaveService();
        return this._instance;
    }

    private constructor() {
        this._storage = StorageService.instance;
        this._migrator = new SaveMigrator(this._storage);
    }

    /** Access underlying storage for modules that need raw key access (e.g., MarqueeUI cache). */
    get storage(): StorageService {
        return this._storage;
    }

    // ── Profile ──

    loadProfile(): PlayerProfileSave {
        return this._migrator.loadProfile(defaultProfile());
    }

    saveProfile(profile: PlayerProfileSave): boolean {
        profile.updatedAt = Date.now();
        this._storage.backup(SAVE_KEYS.PROFILE);
        return this._storage.setJson(SAVE_KEYS.PROFILE, profile);
    }

    /** Apply a partial update to profile without re-writing the whole object. */
    patchProfile(profile: PlayerProfileSave, patch: Partial<PlayerProfileSave>): PlayerProfileSave {
        const merged = { ...profile, ...patch, updatedAt: Date.now() };
        this._storage.setJson(SAVE_KEYS.PROFILE, merged);
        return merged;
    }

    // ── Run ──

    loadRun(): RunSave | null {
        const result = this._storage.getJson<RunSave>(SAVE_KEYS.RUN, null);
        return result.ok ? result.value : null;
    }

    saveRun(run: RunSave): boolean {
        run.updatedAt = Date.now();
        this._storage.backup(SAVE_KEYS.RUN);
        return this._storage.setJson(SAVE_KEYS.RUN, run);
    }

    clearRun(): void {
        this._storage.remove(SAVE_KEYS.RUN);
        this._storage.remove(`${SAVE_KEYS.RUN}_backup`);
    }

    // ── Settings ──

    loadSettings(): SettingsSave {
        const result = this._storage.getJson<SettingsSave>(SAVE_KEYS.SETTINGS, null);
        return result.ok && result.value !== null ? result.value : defaultSettings();
    }

    saveSettings(settings: SettingsSave): boolean {
        return this._storage.setJson(SAVE_KEYS.SETTINGS, settings);
    }

    // ── Debugging ──

    exportDebugSave(): Record<string, any> {
        const dump: Record<string, any> = {};
        for (const key of Object.values(SAVE_KEYS)) {
            const raw = this._storage.getString(key);
            if (raw !== null) {
                try {
                    dump[key] = JSON.parse(raw);
                } catch {
                    dump[key] = raw;
                }
            }
        }
        return dump;
    }

    resetProfile(): void {
        this._storage.remove(SAVE_KEYS.PROFILE);
        this._storage.remove(`${SAVE_KEYS.PROFILE}_backup`);
        this._storage.remove('player_data');
    }

    resetRun(): void {
        this.clearRun();
    }
}
