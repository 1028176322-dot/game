System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, PlatformService, WXStorageAdapter, BrowserStorageAdapter, StorageService, _crd;

  function _reportPossibleCrUseOfPlatformService(extras) {
    _reporterNs.report("PlatformService", "../../platform/PlatformService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStorageAdapter(extras) {
    _reporterNs.report("StorageAdapter", "./StorageTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStorageReadResult(extras) {
    _reporterNs.report("StorageReadResult", "./StorageTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWXStorageAdapter(extras) {
    _reporterNs.report("WXStorageAdapter", "./WXStorageAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBrowserStorageAdapter(extras) {
    _reporterNs.report("BrowserStorageAdapter", "./BrowserStorageAdapter", _context.meta, extras);
  }

  _export("StorageService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      PlatformService = _unresolved_2.PlatformService;
    }, function (_unresolved_3) {
      WXStorageAdapter = _unresolved_3.WXStorageAdapter;
    }, function (_unresolved_4) {
      BrowserStorageAdapter = _unresolved_4.BrowserStorageAdapter;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c6e269dPxRMy4YFROeT35IO", "StorageService", undefined);
      /**
       * StorageService - 跨平台本地存储服务（v2）
       *
       * Uses StorageAdapter pattern to abstract wx/localStorage differences.
       * Provides typed read/write with backup, migration, and fallback support.
       *
       * Phase 1 of data storage implementation plan.
       * Replaces the v1 service at platform/StorageService.ts.
       */


      _export("StorageService", StorageService = class StorageService {
        static get instance() {
          if (!this._instance) this._instance = new StorageService();
          return this._instance;
        }

        constructor() {
          this._adapter = void 0;
          const platform = (_crd && PlatformService === void 0 ? (_reportPossibleCrUseOfPlatformService({
            error: Error()
          }), PlatformService) : PlatformService).instance;
          this._adapter = platform.isWX ? new (_crd && WXStorageAdapter === void 0 ? (_reportPossibleCrUseOfWXStorageAdapter({
            error: Error()
          }), WXStorageAdapter) : WXStorageAdapter)() : new (_crd && BrowserStorageAdapter === void 0 ? (_reportPossibleCrUseOfBrowserStorageAdapter({
            error: Error()
          }), BrowserStorageAdapter) : BrowserStorageAdapter)();
        } // ── Raw string operations ──


        getString(key) {
          return this._adapter.getString(key);
        }

        setString(key, value) {
          return this._adapter.setString(key, value);
        }

        remove(key) {
          this._adapter.remove(key);
        }

        has(key) {
          return this._adapter.has(key);
        } // ── Typed JSON operations ──

        /** Read and parse JSON. Returns defaultValue on any failure. */


        getJson(key, defaultValue) {
          try {
            const raw = this._adapter.getString(key);

            if (raw === null) {
              return {
                ok: true,
                value: defaultValue,
                source: 'default'
              };
            }

            const parsed = JSON.parse(raw);
            return {
              ok: true,
              value: parsed,
              source: 'storage'
            };
          } catch (err) {
            console.warn(`[StorageService] read failed: ${key}`, err);
            return {
              ok: false,
              value: defaultValue,
              source: 'default',
              error: String(err)
            };
          }
        }
        /** Serialize and write. Returns true on success. */


        setJson(key, value) {
          try {
            const raw = JSON.stringify(value);

            if (raw.length > 1024 * 200) {
              console.warn(`[StorageService] large value: ${key}, ${raw.length} bytes`);
            }

            return this._adapter.setString(key, raw);
          } catch (err) {
            console.warn(`[StorageService] write failed: ${key}`, err);
            return false;
          }
        } // ── Backup operations ──

        /** Create a backup copy of key at key_backup. */


        backup(key) {
          const raw = this._adapter.getString(key);

          if (raw !== null) {
            this._adapter.setString(`${key}_backup`, raw);
          }
        }
        /** Restore from key_backup or return defaultValue. */


        restoreBackup(key, defaultValue) {
          const backupRaw = this._adapter.getString(`${key}_backup`);

          const backupKey = `${key}_backup`;

          if (backupRaw !== null) {
            try {
              const parsed = JSON.parse(backupRaw); // Restore backup to primary key

              this._adapter.setString(key, backupRaw);

              console.log(`[StorageService] restored ${key} from backup`);
              return {
                ok: true,
                value: parsed,
                source: 'recovered'
              };
            } catch {
              console.warn(`[StorageService] backup also corrupted: ${backupKey}`);
            }
          }

          return {
            ok: false,
            value: defaultValue,
            source: 'default',
            error: 'backup missing or corrupted'
          };
        } // ── Migration support ──

        /**
         * Read data and run through version migrations.
         * migrations: Record<targetVersion, migrateFn> — runs sequentially from current version +1 up.
         * T should include a schemaVersion field.
         */


        readWithMigration(key, defaultValue, migrations) {
          var _current$schemaVersio;

          const result = this.getJson(key, defaultValue);

          if (!result.ok || result.source === 'default') {
            // Try backup recovery before giving up
            if (result.error) {
              const recovered = this.restoreBackup(key, defaultValue);

              if (recovered.ok && recovered.source === 'recovered') {
                return recovered.value;
              }
            }

            return defaultValue;
          }

          let current = result.value;
          const currentVersion = (_current$schemaVersio = current.schemaVersion) != null ? _current$schemaVersio : 1;
          const versions = Object.keys(migrations).map(Number).filter(v => !isNaN(v)).sort((a, b) => a - b);
          let migrated = false;

          for (const targetVer of versions) {
            if (targetVer > currentVersion) {
              const migrateFn = migrations[targetVer];

              if (migrateFn) {
                try {
                  current = migrateFn(current);
                  migrated = true;
                } catch (err) {
                  console.warn(`[StorageService] migration to v${targetVer} failed for ${key}`, err); // If migration fails, fall through with last good state
                }
              }
            }
          }

          if (migrated) {
            this.setJson(key, current);
          }

          return current;
        }

      });

      StorageService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6e6d00d7c1f27a50aa14c9805cf39dcde1d5df92.js.map