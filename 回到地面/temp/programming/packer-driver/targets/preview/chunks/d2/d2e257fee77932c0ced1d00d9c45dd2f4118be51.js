System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ConfigDatabase, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfGameConfigs(extras) {
    _reporterNs.report("GameConfigs", "../config/ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigName(extras) {
    _reporterNs.report("ConfigName", "../config/ConfigTypes", _context.meta, extras);
  }

  _export("ConfigDatabase", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "29fbcc46qBGYZ3ke9tGyx4m", "ConfigDatabase", undefined); // ConfigDatabase.ts — unified typed config query (§5.3).
      // Pure TS, NO `cc` import: runs in node for vitest.
      // Authoritative spec: docs/2D转3D全面升级方案.md §5.3.
      //
      // Reuse, not re-implement: §5.3 states "System 不得自行 load". ConfigDatabase only WRAPS
      // config data that is already loaded by ConfigService (at runtime via GameBootstrap, Demo0 D0-5).
      // It must never call resources.load / re-parse JSON itself.
      //
      // To stay `cc`-free and testable, the already-loaded data is injected via the constructor
      // (the injection seam). At runtime GameBootstrap passes the namespaces read from
      // ConfigService.instance. No static import of ConfigService here (it imports `cc`).
      // Contract for the typed config query (§5.3).


      _export("ConfigDatabase", ConfigDatabase = class ConfigDatabase {
        /** Inject already-loaded config data (from ConfigService at runtime; mock in tests). */
        constructor(configs) {
          this._configs = {};
          this._loaded = false;
          this._configs = configs != null ? configs : {};
        }
        /** Wrap the injected already-loaded data. Does NOT load anything itself. */


        loadAll() {
          var _this = this;

          return _asyncToGenerator(function* () {
            if (Object.keys(_this._configs).length === 0) {
              throw new Error('[ConfigDatabase] no config data injected; pass ConfigService data via constructor');
            }

            _this._loaded = true;
          })();
        } // NOTE: §5.3 return types (SkillConfig / MonsterConfig / BossConfig / EffectConfig /
        // AIConfig / CameraConfig / AudioConfig) are NOT yet defined in config/ConfigTypes.ts.
        // Per D0-3 rule we return `unknown` + TODO and do NOT define new config types here.
        // Namespace mapping below is provisional, pending ConfigTypes enrichment (Demo0 D0-5 / later):
        //   skills   -> 'skills'      (SkillsData exists; per-id type missing)
        //   monsters -> 'monsters'    (MonstersData exists; MonsterDef nested by zone)
        //   boss     -> 'zones'       (FinalBossDef lives in zones[zoneId].finalBoss)
        //   effect   -> 'economy'     (no effects config file yet)
        //   ai       -> 'battle'      (AI strategy config TBD)
        //   camera   -> 'zones'       (CameraBrain params TBD)
        //   audio    -> 'battle'      (AudioSystem params TBD)


        getSkill(id) {
          return this._byId('skills', id); // TODO: define SkillConfig in ConfigTypes
        }

        getMonster(id) {
          return this._byId('monsters', id); // TODO: define MonsterConfig in ConfigTypes
        }

        getBoss(id) {
          return this._byId('zones', id); // TODO: define BossConfig; zones[].finalBoss = FinalBossDef
        }

        getEffect(id) {
          return this._byId('economy', id); // TODO: define EffectConfig in ConfigTypes
        }

        getAI(id) {
          return this._byId('battle', id); // TODO: define AIConfig in ConfigTypes
        }

        getCamera(id) {
          return this._byId('zones', id); // TODO: define CameraConfig in ConfigTypes
        }

        getAudio(id) {
          return this._byId('battle', id); // TODO: define AudioConfig in ConfigTypes
        }

        _byId(ns, id) {
          var nsData = this._configs[ns];
          return nsData ? nsData[id] : undefined;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d2e257fee77932c0ced1d00d9c45dd2f4118be51.js.map