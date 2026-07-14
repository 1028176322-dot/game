System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd, SAVE_KEYS, LEGACY_KEYS;

  function _reportPossibleCrUseOfRouteRunSnapshot(extras) {
    _reporterNs.report("RouteRunSnapshot", "./RouteSaveTypes", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "316abCbLJpNzKh1DfRghqA+", "SaveTypes", undefined);
      /**
       * SaveTypes - 存档数据类型定义
       *
       * Phase 1 of data storage implementation plan.
       * Separates save data types from PlayerDataManager to avoid circular deps.
       */
      // ── Route run state (node-route roguelike, Demo7) ──
      // ── Player Profile (局外永久数据) ──
      // ── Run Save (单局数据) ──
      // ── Settings (设置) ──


      // ── Storage Keys ──
      _export("SAVE_KEYS", SAVE_KEYS = {
        PROFILE: 'save_profile_v1',
        RUN: 'save_run_v1',
        SETTINGS: 'save_settings_v1',
        CACHE_AD_STATE: 'cache_ad_state_v1',
        CACHE_MARQUEE: 'cache_marquee_v1',
        SYNC_QUEUE: 'sync_queue_v1'
      }); // Legacy keys for migration


      _export("LEGACY_KEYS", LEGACY_KEYS = {
        PLAYER_DATA: 'player_data',
        MARQUEE_PROGRESS: 'marquee_progress',
        AD_STATE: 'ad_state_cache'
      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8d42a38633801eade77dba352f892431d4fe4689.js.map