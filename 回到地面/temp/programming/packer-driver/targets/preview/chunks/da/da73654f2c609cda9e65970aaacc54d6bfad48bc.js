System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, SkillGraph, _crd, ISkillGraph;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillData(extras) {
    _reporterNs.report("SkillData", "./SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillNode(extras) {
    _reporterNs.report("SkillNode", "./SkillData", _context.meta, extras);
  }

  _export("SkillGraph", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3f58b5CjfBJUoebF1+hYlKH", "SkillGraph", undefined); // SkillGraph.ts — builds the data-driven skill node chain from SkillData (§3.9).
      // Pure TS, no `cc`. Implements ILifecycle (red line 3) so it is registered in LifecycleManager.
      //
      // Red line 2: NO `switch(skillId)`. The chain is derived purely from which fields are present
      // in SkillData. Adding a Boss skill = adding data (or a node kind) -> the framework is untouched.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.9.


      // Service token (co-located with the owning module; GameBootstrap registers it here).
      _export("ISkillGraph", ISkillGraph = 'ISkillGraph');

      _export("SkillGraph", SkillGraph = class SkillGraph {
        constructor() {
          this.name = 'SkillGraph';
          this._ctx = null;
          this._initialized = false;
        }

        // --- ILifecycle (§5.1) ---
        initialize(ctx) {
          this._ctx = ctx;
          this._initialized = true;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._ctx = null;
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        } // Build the node chain from SkillData. Pure function of the data shape -> data-driven.


        build(data) {
          var nodes = [];

          if (data.projectile) {
            nodes.push({
              kind: 'projectile',
              speed: data.projectile.speed,
              radius: data.projectile.radius,
              duration: data.projectile.duration
            });
          }

          if (data.onHit) {
            // Explosion (aoe at the hit point) carries the onHit damage.
            var aoeRadius = data.projectile ? data.projectile.radius : 1;
            nodes.push({
              kind: 'explosion',
              radius: aoeRadius,
              damage: data.onHit.damage
            });

            if (data.onHit.burn) {
              nodes.push({
                kind: 'burn',
                dps: data.onHit.burn.dps,
                duration: data.onHit.burn.duration
              });
            }
          }

          return nodes;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=da73654f2c609cda9e65970aaacc54d6bfad48bc.js.map