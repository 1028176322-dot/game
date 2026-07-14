System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, StorageService, SaveMigrator, SaveValidator, SAVE_KEYS, SaveService, _crd;

  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

  // ── Defaults ──
  function defaultProfile() {
    var now = Date.now();
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
        unlockedRelicPoolExtras: []
      },
      stats: {
        bestFloor: 0,
        totalKills: 0,
        totalRuns: 0,
        totalRevives: 0,
        totalAdsWatched: 0
      },
      flags: {
        tutorialFinished: false,
        privacyAccepted: false,
        characterCreated: false
      },
      zoneClearCounts: {},
      zoneBestFloors: {}
    };
  }

  function defaultSettings() {
    return {
      schemaVersion: 1,
      audio: {
        music: true,
        sfx: true,
        musicVolume: 0.8,
        sfxVolume: 0.8
      },
      display: {
        quality: 'auto',
        damageNumber: true,
        screenShake: true
      },
      control: {
        joystickMode: 'fixed'
      }
    };
  } // ── Service ──


  function _reportPossibleCrUseOfStorageService(extras) {
    _reporterNs.report("StorageService", "../storage/StorageService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSaveMigrator(extras) {
    _reporterNs.report("SaveMigrator", "./SaveMigrator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSaveValidator(extras) {
    _reporterNs.report("SaveValidator", "./SaveValidator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerProfileSave(extras) {
    _reporterNs.report("PlayerProfileSave", "./SaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunSave(extras) {
    _reporterNs.report("RunSave", "./SaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSettingsSave(extras) {
    _reporterNs.report("SettingsSave", "./SaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSAVE_KEYS(extras) {
    _reporterNs.report("SAVE_KEYS", "./SaveTypes", _context.meta, extras);
  }

  _export("SaveService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      StorageService = _unresolved_2.StorageService;
    }, function (_unresolved_3) {
      SaveMigrator = _unresolved_3.SaveMigrator;
    }, function (_unresolved_4) {
      SaveValidator = _unresolved_4.SaveValidator;
    }, function (_unresolved_5) {
      SAVE_KEYS = _unresolved_5.SAVE_KEYS;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "92f8enkeF5LZpMZdIfpXuPb", "SaveService", undefined);
      /**
       * SaveService - 存档业务服务
       *
       * Business-level save/load API. All game modules that persist data go through
       * this service rather than touching StorageService or wx/localStorage directly.
       *
       * Phase 1 of data storage implementation plan.
       */


      _export("SaveService", SaveService = class SaveService {
        static get instance() {
          if (!this._instance) this._instance = new SaveService();
          return this._instance;
        }

        constructor() {
          this._storage = void 0;
          this._migrator = void 0;
          this._storage = (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance;
          this._migrator = new (_crd && SaveMigrator === void 0 ? (_reportPossibleCrUseOfSaveMigrator({
            error: Error()
          }), SaveMigrator) : SaveMigrator)(this._storage);
        }
        /** Access underlying storage for modules that need raw key access (e.g., MarqueeUI cache). */


        get storage() {
          return this._storage;
        } // ── Profile ──


        loadProfile() {
          var defaults = defaultProfile();

          var profile = this._migrator.loadProfile(defaults); // Merge newly-added default unlocks into existing profiles so old saves
          // pick up starter characters added after their first launch.


          var defaultUnlocks = defaults.profile.unlockedCharacters;
          var existingUnlocks = profile.profile.unlockedCharacters;

          for (var charId of defaultUnlocks) {
            if (!existingUnlocks.includes(charId)) {
              existingUnlocks.push(charId);
            }
          } // The selected character must be one of the default starters. If the stored
          // selection is not a default-unlocked starter (for example a previously
          // force-unlocked test character), reset it to the default.


          if (!defaultUnlocks.includes(profile.profile.selectedCharacter)) {
            profile.profile.selectedCharacter = defaults.profile.selectedCharacter;
          } // Validate and auto-repair


          var result = (_crd && SaveValidator === void 0 ? (_reportPossibleCrUseOfSaveValidator({
            error: Error()
          }), SaveValidator) : SaveValidator).validateProfile(profile);

          if (!result.ok) {
            console.warn('[SaveService] profile validation issues:');

            for (var err of result.errors) {
              console.warn('  ', err);
            }

            var repair = (_crd && SaveValidator === void 0 ? (_reportPossibleCrUseOfSaveValidator({
              error: Error()
            }), SaveValidator) : SaveValidator).repairProfile(profile);

            if (repair.fixed) {
              console.warn('[SaveService] auto-repairs applied:');

              for (var change of repair.changes) {
                console.warn('  ', change);
              }

              this.saveProfile(profile);
            } // If still invalid after repair, use defaults


            var retry = (_crd && SaveValidator === void 0 ? (_reportPossibleCrUseOfSaveValidator({
              error: Error()
            }), SaveValidator) : SaveValidator).validateProfile(profile);

            if (!retry.ok) {
              console.error('[SaveService] profile could not be repaired — using defaults');
              profile = defaults;
            }
          }

          return profile;
        }

        saveProfile(profile) {
          // Reject obviously bad data before writing
          var check = (_crd && SaveValidator === void 0 ? (_reportPossibleCrUseOfSaveValidator({
            error: Error()
          }), SaveValidator) : SaveValidator).validateBeforeSave(profile);

          if (!check.ok) {
            console.error('[SaveService] saveProfile rejected — validation failed:');

            for (var err of check.errors) {
              console.error('  ', err);
            }

            return false;
          }

          profile.updatedAt = Date.now();

          this._storage.backup((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).PROFILE);

          return this._storage.setJson((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).PROFILE, profile);
        }
        /** Apply a partial update to profile without re-writing the whole object. */


        patchProfile(profile, patch) {
          var merged = _extends({}, profile, patch, {
            updatedAt: Date.now()
          });

          this._storage.setJson((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).PROFILE, merged);

          return merged;
        } // ── Run ──


        loadRun() {
          var result = this._storage.getJson((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).RUN, null);

          return result.ok ? result.value : null;
        }

        saveRun(run) {
          run.updatedAt = Date.now();

          this._storage.backup((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).RUN);

          return this._storage.setJson((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).RUN, run);
        }

        clearRun() {
          this._storage.remove((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).RUN);

          this._storage.remove((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).RUN + "_backup");
        } // ── Settings ──


        loadSettings() {
          var result = this._storage.getJson((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).SETTINGS, null);

          return result.ok && result.value !== null ? result.value : defaultSettings();
        }

        saveSettings(settings) {
          return this._storage.setJson((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).SETTINGS, settings);
        } // ── Debugging ──


        exportDebugSave() {
          var dump = {};

          for (var key of Object.values(_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS)) {
            var raw = this._storage.getString(key);

            if (raw !== null) {
              try {
                dump[key] = JSON.parse(raw);
              } catch (_unused) {
                dump[key] = raw;
              }
            }
          }

          return dump;
        }

        resetProfile() {
          this._storage.remove((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).PROFILE);

          this._storage.remove((_crd && SAVE_KEYS === void 0 ? (_reportPossibleCrUseOfSAVE_KEYS({
            error: Error()
          }), SAVE_KEYS) : SAVE_KEYS).PROFILE + "_backup");

          this._storage.remove('player_data');
        }

        resetRun() {
          this.clearRun();
        }

      });

      SaveService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9fc53cc20bb8fdb0f6a8b15d49e45705904eda9a.js.map