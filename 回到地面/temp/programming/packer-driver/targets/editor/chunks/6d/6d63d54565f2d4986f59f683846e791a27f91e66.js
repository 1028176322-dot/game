System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, IAssetCache, RoomRuntime, _crd, IRoomRuntime;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAssetCache(extras) {
    _reporterNs.report("IAssetCache", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAssetCacheApi(extras) {
    _reporterNs.report("IAssetCacheApi", "../assets/AssetCache", _context.meta, extras);
  }

  function _reportPossibleCrUseOfINavigation(extras) {
    _reporterNs.report("INavigation", "./NavigationGrid", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomData(extras) {
    _reporterNs.report("RoomData", "./RoomBuilder", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGridCoord(extras) {
    _reporterNs.report("GridCoord", "./TileMap", _context.meta, extras);
  }

  _export("RoomRuntime", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      IAssetCache = _unresolved_2.IAssetCache;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "12136JbEmZFl7VMsvjJaFrE", "RoomRuntime", undefined); // RoomRuntime.ts — runtime instance of a room (§3.7 tail + §5.1 room-level lifecycle).
      // Pure TS, NO `cc` import -> node/vitest testable.
      //
      // Design (§5.1 layering: SceneFlowService -> RoomRuntime.enter/exit -> BattleRuntime):
      //  - Implements ILifecycle (red line 3). Room-level lifecycle is owned HERE and driven
      //    by LifecycleManager. enter/exit/destroy manage activation + resource release.
      //  - Resource leak prevention (§3.6): on load() it acquires this room's assetIds via the
      //    injected IAssetCache and reference-counts them; exit()/destroy() release EXACTLY the
      //    acquired ids (idempotent) so 返回大厅/重开 never leaks (RoomRuntime.destroy ->
      //    batch AssetCache.release, §3.6/§5.1).
      //  - No physics dependency: if a room needs collision it must go through ICollisionService
      //    (ctx.get), never PhysicsSystem (red line 1). Demo5 itself needs none.
      //  - DI token `IRoomRuntime` is co-located here (GameContext has no such token; not in the
      //    allowed edit range). Mirrors Demo4's ISkillGraph/ISkillExecutor co-location.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.7 + §5.1 + demo5.md.


      // DI token — single source for this service (co-located, see header note).
      _export("IRoomRuntime", IRoomRuntime = 'IRoomRuntime');

      _export("RoomRuntime", RoomRuntime = class RoomRuntime {
        constructor(_room, _nav) {
          this.name = 'RoomRuntime';
          this._ctx = null;
          this._cache = null;
          this._loaded = [];
          this._entities = new Map();
          this._active = false;
          this._room = _room;
          this._nav = _nav;
        }

        get roomId() {
          return this._room.roomId;
        }

        get navigation() {
          return this._nav;
        }

        get active() {
          return this._active;
        }

        get loadedAssetCount() {
          return this._loaded.length;
        } // --- ILifecycle (§5.1) ---


        initialize(ctx) {
          this._ctx = ctx; // Pull the asset cache from the container (red line 4: no `new`, inject via ctx.get).
          // getOptional: GameBootstrap registers IAssetCache at the tail of its async startup();
          // during the dungeon scene's synchronous _wireSystems the token may not be registered
          // yet. _cache is already designed nullable (guarded at lines 99/109), so a missing token
          // just means the new asset-cache pipeline is inactive this run — legacy flow is preserved.

          this._cache = ctx.getOptional(_crd && IAssetCache === void 0 ? (_reportPossibleCrUseOfIAssetCache({
            error: Error()
          }), IAssetCache) : IAssetCache);
        }

        enter() {
          this._active = true;
        }

        exit() {
          // Leaving the room: release this room's assets (§5.1 返回大厅 -> AssetCache 释放本房).
          this._active = false;

          this._releaseAll();
        }

        pause() {
          this._active = false;
        }

        resume() {
          this._active = true;
        }

        destroy() {
          // Reset -> re-initialize path (§5.1). Release any still-held assets (idempotent).
          this._releaseAll();

          this._entities.clear();

          this._active = false;
          this._cache = null;
          this._ctx = null;
        } // --- Resource management (§3.6) ---
        // Acquire every asset this room needs, reference-counted through IAssetCache.


        async load() {
          if (!this._cache) {
            // Legacy flow: IAssetCache not yet registered (e.g., _wireSystems runs before
            // GameBootstrap._wireInfra completes). Skip asset preloading; the new asset-cache
            // pipeline is inactive for this run.
            console.warn('[RoomRuntime] IAssetCache unavailable; skipping asset preload.');
            return;
          }

          for (const id of this._room.assetIds) {
            await this._cache.load(id);

            this._loaded.push(id);
          }
        }

        _releaseAll() {
          if (!this._cache) return;

          for (const id of this._loaded) {
            this._cache.release(id);
          }

          this._loaded.length = 0;
        } // --- Entity management ---


        addEntity(e) {
          this._entities.set(e.id, {
            id: e.id,
            x: e.x,
            y: e.y
          });

          this._room.tileMap.occupy(e.x, e.y);
        }

        removeEntity(id) {
          const e = this._entities.get(id);

          if (!e) return;

          this._room.tileMap.free(e.x, e.y);

          this._entities.delete(id);
        }

        get entityCount() {
          return this._entities.size;
        } // Convenience: path between two grid cells via the room's navigation.


        findPath(start, goal) {
          return this._nav.findPath(start, goal);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6d63d54565f2d4986f59f683846e791a27f91e66.js.map