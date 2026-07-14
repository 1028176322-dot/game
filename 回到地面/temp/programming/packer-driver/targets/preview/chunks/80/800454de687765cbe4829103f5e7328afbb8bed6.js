System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, SaveService, RouteSaveAdapter, _crd;

  function _reportPossibleCrUseOfSaveService(extras) {
    _reporterNs.report("SaveService", "./SaveService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteRunSnapshot(extras) {
    _reporterNs.report("RouteRunSnapshot", "./RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteSavePort(extras) {
    _reporterNs.report("RouteSavePort", "./RouteSaveTypes", _context.meta, extras);
  }

  _export("RouteSaveAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      SaveService = _unresolved_2.SaveService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6d2d3iZpq9MP4bqi5ok3Kwf", "RouteSaveAdapter", undefined); // assets/scripts/core/save/RouteSaveAdapter.ts
      // Implements RouteSavePort. Lives in the save-adaptation layer (core/save), NOT in
      // dungeon/route. Uses the SaveService singleton and never `new`s SaveService (its
      // constructor is private). Never fabricates a RunSave — a base RunSave must be
      // created by RunCoordinator.startRun() first (GDD v0.4.3 ①③).
      //
      // Authoritative spec: docs/地牢重做_节点路线图肉鸽_设计v0.4.4.md §10.3.


      _export("RouteSaveAdapter", RouteSaveAdapter = class RouteSaveAdapter {
        constructor() {
          // v0.4.2: use the singleton, never `new`; v0.4.3: lives in core/save.
          this._save = (_crd && SaveService === void 0 ? (_reportPossibleCrUseOfSaveService({
            error: Error()
          }), SaveService) : SaveService).instance;
        }

        saveRoute(snapshot) {
          // v0.4.3: no active run -> return false; a new RunSave can only be created
          // by RunCoordinator.startRun(). Fabricating one here would bypass RunSave
          // required fields and save validation.
          var run = this._save.loadRun();

          if (!run) {
            console.warn('[RouteSaveAdapter] no active RunSave; skip route save');
            return false;
          }

          run.route = snapshot;
          return this._save.saveRun(run);
        }

        loadRoute() {
          var _this$_save$loadRun$r, _this$_save$loadRun;

          return (_this$_save$loadRun$r = (_this$_save$loadRun = this._save.loadRun()) == null ? void 0 : _this$_save$loadRun.route) != null ? _this$_save$loadRun$r : null;
        }

        clearRoute() {
          var run = this._save.loadRun();

          if (run) {
            run.route = undefined;

            this._save.saveRun(run);
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=800454de687765cbe4829103f5e7328afbb8bed6.js.map