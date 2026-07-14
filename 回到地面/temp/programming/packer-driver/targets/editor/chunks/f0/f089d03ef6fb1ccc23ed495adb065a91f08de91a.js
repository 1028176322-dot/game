System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, LEGACY_KEYS, SAVE_KEYS, SaveMigrator, _crd, PROFILE_MIGRATIONS;

  // ── Profile migrations ──
  function migratePlayerDataToV1(oldData) {
    var _oldData$createdAt, _oldData$soulStones, _oldData$unlockedChar, _oldData$selectedChar, _oldData$selectedTale, _oldData$unlockedReli, _oldData$bestFloor, _oldData$totalKills, _oldData$totalRuns, _oldData$zoneClearCou, _oldData$zoneBestFloo;

    const now = Date.now();
    return {
      schemaVersion: 1,
      playerId: 'local_' + String(now),
      updatedAt: now,
      createdAt: (_oldData$createdAt = oldData.createdAt) != null ? _oldData$createdAt : now,
      profile: {
        soulStones: (_oldData$soulStones = oldData.soulStones) != null ? _oldData$soulStones : 0,
        unlockedCharacters: (_oldData$unlockedChar = oldData.unlockedCharacters) != null ? _oldData$unlockedChar : ['warrior'],
        selectedCharacter: (_oldData$selectedChar = oldData.selectedCharacter) != null ? _oldData$selectedChar : 'warrior',
        selectedTalent: (_oldData$selectedTale = oldData.selectedTalent) != null ? _oldData$selectedTale : null,
        unlockedRelicPoolExtras: (_oldData$unlockedReli = oldData.unlockedRelicPoolExtras) != null ? _oldData$unlockedReli : []
      },
      stats: {
        bestFloor: (_oldData$bestFloor = oldData.bestFloor) != null ? _oldData$bestFloor : 0,
        totalKills: (_oldData$totalKills = oldData.totalKills) != null ? _oldData$totalKills : 0,
        totalRuns: (_oldData$totalRuns = oldData.totalRuns) != null ? _oldData$totalRuns : 0,
        totalRevives: 0,
        totalAdsWatched: 0
      },
      flags: {
        tutorialFinished: false,
        privacyAccepted: false,
        characterCreated: oldData.characterName ? true : false
      },
      zoneClearCounts: (_oldData$zoneClearCou = oldData.zoneClearCounts) != null ? _oldData$zoneClearCou : {},
      zoneBestFloors: (_oldData$zoneBestFloo = oldData.zoneBestFloors) != null ? _oldData$zoneBestFloo : {}
    };
  } // ── Profile migration registry ──


  function _reportPossibleCrUseOfStorageService(extras) {
    _reporterNs.report("StorageService", "../storage/StorageService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerProfileSave(extras) {
    _reporterNs.report("PlayerProfileSave", "./SaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLEGACY_KEYS(extras) {
    _reporterNs.report("LEGACY_KEYS", "./SaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSAVE_KEYS(extras) {
    _reporterNs.report("SAVE_KEYS", "./SaveTypes", _context.meta, extras);
  }

  _export("SaveMigrator", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      LEGACY_KEYS = _unresolved_2.LEGACY_KEYS;
      SAVE_KEYS = _unresolved_2.SAVE_KEYS;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "20be63AaOxFoofqkkmmdt3C", "SaveMigrator", undefined);
      /**
       * SaveMigrator - 存档版本迁移工具
       *
       * Handles schema migration from old save formats to new.
       * Also supports legacy key migration (e.g., player_data -> save_profile_v1).
       */


      PROFILE_MIGRATIONS = {// schemaVersion 1 is the baseline — no migration needed yet.
        // Future migrations would be:
        //   2: migrateProfileV1ToV2,
        //   3: migrateProfileV2ToV3,
      }; // ── Public API ──

      _export("SaveMigrator", SaveMigrator = class SaveMigrator {
        constructor(storage) {
          this._storage = void 0;
          this._storage = storage;
        }
        /** Migrate player_data legacy key to new save_profile_v1 format. */


        migrateLegacyPlayerData() {
          const legacyRaw = this._storage.getJson((_crd && LEGACY_KEYS === void 0 ? (_reportPossibleCrUseOfLEGACY_KEYS({
            error: Error()
          }), LEGACY_KEYS) : LEGACY_KEYS).PLAYER_DATA, null);

          if (!legacyRaw.ok || legacyRaw.value === null) {
            return null;
          }

          const migrated = migratePlayerDataToV1(legacyRaw.value);

          this._storage.setJson((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).PROFILE, migrated); // Keep old key around for a while as safety net


          console.log('[SaveMigrator] migrated player_data -> save_profile_v1');
          return migrated;
        }
        /** Read profile with full migration chain (legacy + schema version). */


        loadProfile(defaultValue) {
          // Try new key first with schema migration
          const result = this._storage.readWithMigration((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).PROFILE, null, PROFILE_MIGRATIONS);

          if (result !== null) {
            return result;
          } // Fall back to legacy key


          const migrated = this.migrateLegacyPlayerData();

          if (migrated) {
            return migrated;
          }

          return defaultValue;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f089d03ef6fb1ccc23ed495adb065a91f08de91a.js.map