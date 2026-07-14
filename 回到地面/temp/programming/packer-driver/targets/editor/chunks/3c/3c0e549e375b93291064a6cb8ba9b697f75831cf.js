System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, AssetCache, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  _export("AssetCache", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3025cb6KTREuLxM2+3orUH7", "AssetCache", undefined); // AssetCache.ts — in-memory reference-counted 3D asset cache (§3.6).
      // Implements IAssetCache + ILifecycle.
      //
      // Design:
      //  - Pure TS, NO `cc` import  → runs under node/vitest (DoD: 未引入 cc).
      //  - Underlying load is DELEGATED to an injected loader (AssetBundleService), so the
      //    cache does NOT re-implement asset loading (reuse rule, §3.6 — 禁止重复实现).
      //  - Reference counting: load() +1, release() -1; 0 → deferred drop (Release Queue, 防抖动).
      //
      // DI token `IAssetCache` (string) is exported from ../core/GameContext (single source, §5.2).
      // Register: ctx.register(IAssetCache, new AssetCache(loader)).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.6.


      _export("AssetCache", AssetCache = class AssetCache {
        constructor(_loader, _releaseDelayMs = 1000) {
          this.name = 'AssetCache';
          this._entries = new Map();
          this._pendingRelease = new Set();
          this._ctx = null;
          this._destroyed = false;
          this._loader = _loader;
          this._releaseDelayMs = _releaseDelayMs;
        } // --- ILifecycle (§5.1) ---


        initialize(ctx) {
          this._ctx = ctx;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          // Immediate release of all entries on shutdown (no deferred wait).
          this._entries.clear();

          this._pendingRelease.clear();

          this._destroyed = true;
        } // --- IAssetCache (§3.6) ---


        async load(id) {
          if (this._destroyed) {
            throw new Error(`[AssetCache] load after destroy: ${id}`);
          }

          const existing = this._entries.get(id);

          if (existing) {
            existing.refs += 1;
            return existing.asset;
          }

          const asset = await this._loader(id);

          this._entries.set(id, {
            asset,
            refs: 1
          });

          return asset;
        }

        release(id) {
          const entry = this._entries.get(id);

          if (!entry || entry.refs === 0) return;
          entry.refs -= 1;

          if (entry.refs === 0) {
            this._scheduleRelease(id);
          }
        }

        refCount(id) {
          var _this$_entries$get$re, _this$_entries$get;

          return (_this$_entries$get$re = (_this$_entries$get = this._entries.get(id)) == null ? void 0 : _this$_entries$get.refs) != null ? _this$_entries$get$re : 0;
        } // §3.6 Release Queue: defer actual drop to avoid load/release thrash (防抖动).


        _scheduleRelease(id) {
          if (this._pendingRelease.has(id)) return;

          this._pendingRelease.add(id);

          setTimeout(() => {
            this._pendingRelease.delete(id);

            const entry = this._entries.get(id);

            if (entry && entry.refs === 0) {
              this._entries.delete(id);
            }
          }, this._releaseDelayMs);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3c0e549e375b93291064a6cb8ba9b697f75831cf.js.map