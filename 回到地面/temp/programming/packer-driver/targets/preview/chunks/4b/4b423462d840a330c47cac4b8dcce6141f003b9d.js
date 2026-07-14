System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, UiRouter, _crd;

  _export("UiRouter", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c2957IgUv5FAZrAjmTCaDM1", "UiRouter", undefined);
      /**
       * UiRouter - UI navigation router (Phase 8, upgraded v2)
       *
       * Unified Panel lifecycle management.
       * Every Panel must implement the UIPanel interface.
       *
       * Usage:
       *   UiRouter.instance.open('character');
       *   UiRouter.instance.close('character');
       *   UiRouter.instance.refresh('shop');
       */


      _export("UiRouter", UiRouter = class UiRouter {
        constructor() {
          this._panels = new Map();
          this._history = [];
        }

        static get instance() {
          if (!this._instance) this._instance = new UiRouter();
          return this._instance;
        }
        /** Register a panel implementing UIPanel interface */


        register(panel) {
          if (this._panels.has(panel.id)) {
            console.warn("[UiRouter] panel " + panel.id + " already registered, overwriting");
          }

          this._panels.set(panel.id, {
            panel,
            isOpen: false
          });
        }
        /** Open a panel by id */


        open(id, params) {
          var entry = this._panels.get(id);

          if (!entry) {
            console.warn("[UiRouter] panel not registered: " + id);
            return;
          }

          if (entry.isOpen) {
            console.log("[UiRouter] panel already open: " + id);
            return;
          }

          entry.isOpen = true;

          this._history.push(id);

          entry.panel.open(params);
        }
        /** Close a panel by id */


        close(id) {
          var entry = this._panels.get(id);

          if (!entry || !entry.isOpen) return;
          entry.isOpen = false;
          this._history = this._history.filter(h => h !== id);
          entry.panel.close();
        }
        /** Refresh a panel's data */


        refresh(id) {
          var entry = this._panels.get(id);

          if (!entry || !entry.isOpen) return;
          entry.panel.refresh == null || entry.panel.refresh();
        }
        /** Close all open panels */


        closeAll() {
          for (var id of [...this._history]) {
            this.close(id);
          }

          this._history = [];
        }
        /** Check if a panel is open */


        isOpen(id) {
          var _this$_panels$get$isO, _this$_panels$get;

          return (_this$_panels$get$isO = (_this$_panels$get = this._panels.get(id)) == null ? void 0 : _this$_panels$get.isOpen) != null ? _this$_panels$get$isO : false;
        }
        /** Check if a panel is registered */


        has(id) {
          return this._panels.has(id);
        }
        /** Close the most recently opened panel */


        closeLast() {
          var last = this._history.pop();

          if (last) this.close(last);
        }

      });

      UiRouter._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4b423462d840a330c47cac4b8dcce6141f003b9d.js.map