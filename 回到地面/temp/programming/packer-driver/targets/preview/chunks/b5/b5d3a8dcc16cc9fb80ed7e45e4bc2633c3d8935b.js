System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, TargetSelector, _crd, ITargetSelector, ATTACK_RANGE_MELEE, ATTACK_RANGE_RANGED, LOCK_ON_RANGE;

  function manhattan(ax, ay, bx, by) {
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleCommand(extras) {
    _reporterNs.report("BattleCommand", "./CombatCommand", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "./CombatCommand", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTargetResult(extras) {
    _reporterNs.report("TargetResult", "./CombatCommand", _context.meta, extras);
  }

  _export("TargetSelector", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6f6e9ZUYIhLrpJtQL50BMU+", "TargetSelector", undefined); // TargetSelector.ts — picks combat targets for CombatSystem (§3.8).
      // Pure TS, no `cc`. Pure function of (command, pool) -> TargetResult. No switch on id.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.8 "找目标：锁定/范围/视线".


      _export("ITargetSelector", ITargetSelector = 'ITargetSelector');

      _export("ATTACK_RANGE_MELEE", ATTACK_RANGE_MELEE = 1);

      _export("ATTACK_RANGE_RANGED", ATTACK_RANGE_RANGED = 4);

      _export("LOCK_ON_RANGE", LOCK_ON_RANGE = 8);

      _export("TargetSelector", TargetSelector = class TargetSelector {
        constructor() {
          this._ctx = null;
        }

        // ILifecycle (§5.1): stateless service; no teardown needed beyond clearing the ctx ref.
        initialize(ctx) {
          this._ctx = ctx;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._ctx = null;
        } // Select primary target: explicit targetId, then nearest enemy in range.


        selectPrimary(cmd, pool, self) {
          if (cmd.targetId) {
            var _pool$find;

            return (_pool$find = pool.find(e => e.id === cmd.targetId && e.alive)) != null ? _pool$find : null;
          }

          var enemies = pool.filter(e => e.team !== self.team && e.alive);
          if (enemies.length === 0) return null;
          enemies.sort((a, b) => manhattan(self.gridX, self.gridY, a.gridX, a.gridY) - manhattan(self.gridX, self.gridY, b.gridX, b.gridY));
          return enemies[0];
        } // Select all enemies within a radius of the aim point.


        selectAOE(cmd, pool, radius) {
          var target = cmd.aimPosition ? {
            x: cmd.aimPosition.x,
            y: cmd.aimPosition.z
          } : null;
          if (!target) return [];
          return pool.filter(e => e.alive && manhattan(e.gridX, e.gridY, target.x, target.y) <= radius);
        } // Full target resolution for a command.


        resolve(cmd, pool, self) {
          var primary = this.selectPrimary(cmd, pool, self);
          var aoe = [];
          var lockOn = null;

          if (primary) {
            // AOE: for skill commands, pick targets around the primary.
            if (cmd.kind === 'skill') {
              var radius = cmd.aimPosition ? 1 : 0; // default splash radius if explicit aim

              aoe.push(...this.selectAOE(cmd, pool, radius));
              if (aoe.length === 0) aoe.push(primary);
            } // Lock-on candidate: nearest valid target within lock-on range.


            var dist = manhattan(self.gridX, self.gridY, primary.gridX, primary.gridY);

            if (dist <= LOCK_ON_RANGE) {
              lockOn = primary;
            }
          }

          return {
            primary,
            aoe: aoe.length > 0 ? aoe : primary ? [primary] : [],
            lockOn
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b5d3a8dcc16cc9fb80ed7e45e4bc2633c3d8935b.js.map