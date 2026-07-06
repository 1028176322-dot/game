/**
 * SaveMigrator - 存档版本迁移工具
 *
 * Handles schema migration from old save formats to new.
 * Also supports legacy key migration (e.g., player_data -> save_profile_v1).
 */

import { StorageService } from '../storage/StorageService';
import { PlayerProfileSave, LEGACY_KEYS, SAVE_KEYS } from './SaveTypes';

type MigrationFn<T> = (oldData: any) => T;

// ── Profile migrations ──

function migratePlayerDataToV1(oldData: any): PlayerProfileSave {
    const now = Date.now();
    return {
        schemaVersion: 1,
        playerId: 'local_' + String(now),
        updatedAt: now,
        createdAt: oldData.createdAt ?? now,
        profile: {
            soulStones: oldData.soulStones ?? 0,
            unlockedCharacters: oldData.unlockedCharacters ?? ['warrior'],
            selectedCharacter: oldData.selectedCharacter ?? 'warrior',
            selectedTalent: oldData.selectedTalent ?? null,
            unlockedRelicPoolExtras: oldData.unlockedRelicPoolExtras ?? [],
        },
        stats: {
            bestFloor: oldData.bestFloor ?? 0,
            totalKills: oldData.totalKills ?? 0,
            totalRuns: oldData.totalRuns ?? 0,
            totalRevives: 0,
            totalAdsWatched: 0,
        },
        flags: {
            tutorialFinished: false,
            privacyAccepted: false,
            characterCreated: (oldData as any).characterName ? true : false,
        },
        zoneClearCounts: oldData.zoneClearCounts ?? {},
        zoneBestFloors: oldData.zoneBestFloors ?? {},
    };
}

// ── Profile migration registry ──

const PROFILE_MIGRATIONS: Record<number, MigrationFn<any>> = {
    // schemaVersion 1 is the baseline — no migration needed yet.
    // Future migrations would be:
    //   2: migrateProfileV1ToV2,
    //   3: migrateProfileV2ToV3,
};

// ── Public API ──

export class SaveMigrator {
    private readonly _storage: StorageService;

    constructor(storage: StorageService) {
        this._storage = storage;
    }

    /** Migrate player_data legacy key to new save_profile_v1 format. */
    migrateLegacyPlayerData(): PlayerProfileSave | null {
        const legacyRaw = this._storage.getJson<any>(LEGACY_KEYS.PLAYER_DATA, null);
        if (!legacyRaw.ok || legacyRaw.value === null) {
            return null;
        }

        const migrated = migratePlayerDataToV1(legacyRaw.value);
        this._storage.setJson(SAVE_KEYS.PROFILE, migrated);

        // Keep old key around for a while as safety net
        console.log('[SaveMigrator] migrated player_data -> save_profile_v1');
        return migrated;
    }

    /** Read profile with full migration chain (legacy + schema version). */
    loadProfile(defaultValue: PlayerProfileSave): PlayerProfileSave {
        // Try new key first with schema migration
        const result = this._storage.readWithMigration(
            SAVE_KEYS.PROFILE,
            null,
            PROFILE_MIGRATIONS,
        );

        if (result !== null) {
            return result as PlayerProfileSave;
        }

        // Fall back to legacy key
        const migrated = this.migrateLegacyPlayerData();
        if (migrated) {
            return migrated;
        }

        return defaultValue;
    }
}
