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
import { SaveValidator } from './SaveValidator';
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
        const defaults = defaultProfile();
        let profile = this._migrator.loadProfile(defaults);

        // Merge newly-added default unlocks into existing profiles so old saves
        // pick up starter characters added after their first launch.
        const defaultUnlocks = defaults.profile.unlockedCharacters;
        const existingUnlocks = profile.profile.unlockedCharacters;
        for (const charId of defaultUnlocks) {
            if (!existingUnlocks.includes(charId)) {
                existingUnlocks.push(charId);
            }
        }
        // The selected character must be one of the default starters. If the stored
        // selection is not a default-unlocked starter (for example a previously
        // force-unlocked test character), reset it to the default.
        if (!defaultUnlocks.includes(profile.profile.selectedCharacter)) {
            profile.profile.selectedCharacter = defaults.profile.selectedCharacter;
        }

        // Validate and auto-repair
        const result = SaveValidator.validateProfile(profile);
        if (!result.ok) {
            console.warn('[SaveService] profile validation issues:');
            for (const err of result.errors) {
                console.warn('  ', err);
            }

            const repair = SaveValidator.repairProfile(profile);
            if (repair.fixed) {
                console.warn('[SaveService] auto-repairs applied:');
                for (const change of repair.changes) {
                    console.warn('  ', change);
                }
                this.saveProfile(profile);
            }

            // If still invalid after repair, use defaults
            const retry = SaveValidator.validateProfile(profile);
            if (!retry.ok) {
                console.error('[SaveService] profile could not be repaired — using defaults');
                profile = defaults;
            }
        }

        return profile;
    }

    saveProfile(profile: PlayerProfileSave): boolean {
        // Reject obviously bad data before writing
        const check = SaveValidator.validateBeforeSave(profile);
        if (!check.ok) {
            console.error('[SaveService] saveProfile rejected — validation failed:');
            for (const err of check.errors) {
                console.error('  ', err);
            }
            return false;
        }

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
