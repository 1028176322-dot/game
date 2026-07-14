System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, LifecycleManager, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "./GameContext", _context.meta, extras);
  }

  _export("LifecycleManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5146a0ZtJJMPLMZho9JMzmC", "LifecycleManager", undefined); // LifecycleManager.ts — unified lifecycle management (§5.1).
      // Pure TS, no `cc` import: runs in node for vitest.
      // Authoritative spec: docs/2D转3D全面升级方案.md §5.1.
      // Strict 1:1 implementation: no extra methods, no extra responsibilities, no DI here.


      _export("LifecycleManager", LifecycleManager = class LifecycleManager {
        constructor() {
          this.systems = [];
        }

        register(s) {
          this.systems.push(s);
        }

        enterAll() {
          for (const s of this.systems) {
            s.enter();
          }
        }

        exitAll() {
          for (const s of this.systems) {
            s.exit();
          }
        }

        pauseAll() {
          for (const s of this.systems) {
            s.pause();
          }
        }

        resumeAll() {
          for (const s of this.systems) {
            s.resume();
          }
        } // Reverse order: last registered destroyed first (dependents before dependencies).


        destroyAll() {
          for (let i = this.systems.length - 1; i >= 0; i--) {
            this.systems[i].destroy();
          }

          this.systems = [];
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d13eb8b8a1d233642eb4cd04699f7bea2bfc3df4.js.map