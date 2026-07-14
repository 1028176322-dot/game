System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, SaveValidator, _crd;

  function _reportPossibleCrUseOfPlayerProfileSave(extras) {
    _reporterNs.report("PlayerProfileSave", "./SaveTypes", _context.meta, extras);
  }

  _export("SaveValidator", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0353fbkGzhHpok12HwWdve3", "SaveValidator", undefined);
      /**
       * SaveValidator - archive data validation
       *
       * Phase 2 of data storage implementation plan.
       * Checks profile data integrity and provides human-readable error messages.
       * Catches corruption, manual tampering, or stale migration output before it
       * reaches business logic.
       */


      _export("SaveValidator", SaveValidator = class SaveValidator {
        /** Full validation pass on a loaded profile. Returns all issues found. */
        static validateProfile(profile) {
          const errors = []; // schemaVersion must be positive

          if (!profile.schemaVersion || profile.schemaVersion < 1) {
            errors.push('schemaVersion must be >= 1');
          } // soulStones cannot go negative


          if (profile.profile.soulStones < 0) {
            errors.push(`soulStones is negative (${profile.profile.soulStones}) — resetting to 0`);
          } // warrior must always be unlocked (base character)


          if (!profile.profile.unlockedCharacters.includes('warrior')) {
            errors.push('unlockedCharacters missing "warrior" — warrior is the base character and must remain unlocked');
          } // selected character must be in the unlocked list


          if (!profile.profile.unlockedCharacters.includes(profile.profile.selectedCharacter)) {
            errors.push(`selectedCharacter "${profile.profile.selectedCharacter}" is not in unlockedCharacters [${profile.profile.unlockedCharacters.join(', ')}] — resetting to "warrior"`);
          } // bestFloor cannot be negative


          if (profile.stats.bestFloor < 0) {
            errors.push(`bestFloor is negative (${profile.stats.bestFloor}) — resetting to 0`);
          } // totalRuns cannot be negative


          if (profile.stats.totalRuns < 0) {
            errors.push(`totalRuns is negative (${profile.stats.totalRuns}) — resetting to 0`);
          } // totalKills cannot be negative


          if (profile.stats.totalKills < 0) {
            errors.push(`totalKills is negative (${profile.stats.totalKills}) — resetting to 0`);
          }

          return {
            ok: errors.length === 0,
            errors
          };
        }
        /** Lightweight check used before save — refuses to persist obviously bad data. */


        static validateBeforeSave(profile) {
          const errors = [];

          if (!profile.schemaVersion || profile.schemaVersion < 1) {
            errors.push('schemaVersion required');
          }

          if (!profile.profile.unlockedCharacters || profile.profile.unlockedCharacters.length === 0) {
            errors.push('unlockedCharacters must not be empty');
          }

          if (!profile.profile.selectedCharacter) {
            errors.push('selectedCharacter required');
          }

          if (!profile.profile.selectedCharacter && profile.profile.unlockedCharacters.length > 0) {
            errors.push('selectedCharacter must be in unlockedCharacters');
          }

          return {
            ok: errors.length === 0,
            errors
          };
        }
        /** Fix common issues in-place and return whether any fixes were applied. */


        static repairProfile(profile) {
          const changes = [];
          let fixed = false;

          if (profile.profile.soulStones < 0) {
            changes.push(`soulStones ${profile.profile.soulStones} -> 0`);
            profile.profile.soulStones = 0;
            fixed = true;
          }

          if (!profile.profile.unlockedCharacters.includes('warrior')) {
            changes.push('unlockedCharacters + "warrior"');
            profile.profile.unlockedCharacters = ['warrior', ...profile.profile.unlockedCharacters.filter(id => id !== 'warrior')];
            fixed = true;
          }

          if (!profile.profile.unlockedCharacters.includes(profile.profile.selectedCharacter)) {
            const old = profile.profile.selectedCharacter;
            profile.profile.selectedCharacter = 'warrior';
            changes.push(`selectedCharacter "${old}" -> "warrior"`);
            fixed = true;
          }

          if (profile.stats.bestFloor < 0) {
            changes.push(`bestFloor ${profile.stats.bestFloor} -> 0`);
            profile.stats.bestFloor = 0;
            fixed = true;
          }

          if (profile.stats.totalRuns < 0) {
            changes.push(`totalRuns ${profile.stats.totalRuns} -> 0`);
            profile.stats.totalRuns = 0;
            fixed = true;
          }

          if (profile.stats.totalKills < 0) {
            changes.push(`totalKills ${profile.stats.totalKills} -> 0`);
            profile.stats.totalKills = 0;
            fixed = true;
          }

          return {
            fixed,
            changes
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2843362801f944932fc01b063ddd62c10cfd01c7.js.map