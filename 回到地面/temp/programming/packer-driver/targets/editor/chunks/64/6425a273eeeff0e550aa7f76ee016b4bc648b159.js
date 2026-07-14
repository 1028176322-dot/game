System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, MemorySaveBackend, SaveManagerImpl, _crd, SAVE_VERSION, KEY;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  _export({
    MemorySaveBackend: void 0,
    SaveManagerImpl: void 0
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f694eiFjjxJ+7r0qte3Eyaw", "SaveManager", undefined); // assets/scripts/save/SaveManager.ts — §5.6 SaveGame architecture + crash recovery.
      // Pure TS, no `cc` import: persistence backend is injected (MemorySaveBackend for
      // tests / fallback; engine wires a localStorage-backed backend in GameBootstrap).
      // Token: ISaveManager (declared in core/GameContext.ts, per §5.x service list).


      _export("MemorySaveBackend", MemorySaveBackend = class MemorySaveBackend {
        constructor() {
          this._store = new Map();
        }

        load(key) {
          return this._store.has(key) ? this._store.get(key) : null;
        }

        save(key, value) {
          this._store.set(key, value);
        }

        remove(key) {
          this._store.delete(key);
        }

      });

      _export("SAVE_VERSION", SAVE_VERSION = 1); // State shapes grounded in the plan's prose (§5.6):
      //   RunState   — "局内：种子/层数/已获道具"
      //   PlayerState— "跨局：解锁/等级/设置"
      //   DungeonState / EnemyState — minimal layered snapshots; fields extend later.
      // 1:1 with the plan's `interface SaveManager` (§5.6). No extra public methods.


      KEY = {
        run: 'save:run',
        player: 'save:player',
        dungeon: 'save:dungeon',
        enemy: 'save:enemy',
        seed: 'save:seed'
      };

      _export("SaveManagerImpl", SaveManagerImpl = class SaveManagerImpl {
        constructor(backend) {
          this._backend = void 0;
          this._ctx = null;
          this._backend = backend;
        }

        initialize(ctx) {
          this._ctx = ctx;
        }

        _write(key, value) {
          this._backend.save(key, JSON.stringify(value));
        }

        _read(key) {
          const raw = this._backend.load(key);

          if (raw === null) return null;

          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        }

        saveRun(state) {
          this._write(KEY.run, state);
        }

        savePlayer(state) {
          this._write(KEY.player, state);
        }

        saveDungeon(state) {
          this._write(KEY.dungeon, state);
        }

        saveEnemy(state) {
          this._write(KEY.enemy, state);
        }

        saveSeed(seed) {
          this._write(KEY.seed, {
            seed
          });
        }

        loadRun() {
          return this._read(KEY.run);
        }

        destroy() {
          // Nothing buffered in memory; the backend owns persistence.
          this._ctx = null;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6425a273eeeff0e550aa7f76ee016b4bc648b159.js.map