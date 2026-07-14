System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ICollisionService, ProjectileSystem, _crd, IProjectileSystem;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVec(extras) {
    _reporterNs.report("Vec3", "../../physics/ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionService(extras) {
    _reporterNs.report("ICollisionService", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionContract(extras) {
    _reporterNs.report("ICollisionContract", "../../physics/ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "./CombatCommand", _context.meta, extras);
  }

  _export("ProjectileSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      ICollisionService = _unresolved_2.ICollisionService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1696e3OQ7pPXIvaTmOqg1/K", "ProjectileSystem", undefined); // ProjectileSystem.ts — §3.8 projectile lifecycle. Pure TS, ILifecycle, deterministic.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.8 "飞行物生命周期" + §6.2 flow.


      _export("IProjectileSystem", IProjectileSystem = 'IProjectileSystem');

      _export("ProjectileSystem", ProjectileSystem = class ProjectileSystem {
        constructor() {
          this.name = 'ProjectileSystem';
          this._ctx = null;
          this._collision = null;
          this._projectiles = [];
          this._initialized = false;
        }

        // --- ILifecycle (§5.1) ---
        initialize(ctx) {
          this._ctx = ctx;
          this._collision = ctx.get(_crd && ICollisionService === void 0 ? (_reportPossibleCrUseOfICollisionService({
            error: Error()
          }), ICollisionService) : ICollisionService);
          this._initialized = true;
        }

        enter() {}

        exit() {
          this._projectiles = [];
        }

        pause() {}

        resume() {}

        destroy() {
          this._projectiles = [];
          this._ctx = null;
          this._collision = null;
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        } // Spawn a new projectile.


        spawn(def) {
          this._projectiles.push({
            def,
            x: def.fromX,
            y: def.fromY,
            elapsed: 0,
            hit: false
          });
        } // Advance all projectiles by dt. Returns hit results for this frame.


        update(dt, targets) {
          if (!this._collision) return [];
          var hits = [];
          var alive = [];

          for (var p of this._projectiles) {
            p.elapsed += dt; // Expired -> remove without resolve.

            if (p.elapsed >= p.def.maxDuration) {
              continue;
            } // Interpolate position along the line from -> to.


            var t = Math.min(p.elapsed / (p.def.maxDuration || 1), 1);
            p.x = p.def.fromX + (p.def.toX - p.def.fromX) * t;
            p.y = p.def.fromY + (p.def.toY - p.def.fromY) * t;
            alive.push(p); // Hit detection: once per projectile.

            if (!p.hit) {
              var aimVec = {
                x: p.x,
                y: 0,
                z: p.y
              };

              var found = this._collision.overlapSphere(aimVec, p.def.radius);

              if (found.length > 0) {
                var _loop = function _loop(tgt) {
                  var collided = found.some(c => {
                    // Duck-type: check if the collider's position matches the target's grid position.
                    return Math.abs(c.position.x - tgt.gridX) < 0.5 && Math.abs(c.position.z - tgt.gridY) < 0.5;
                  });

                  if (collided) {
                    p.hit = true;
                    hits.push({
                      projectileId: p.def.id,
                      targetId: tgt.id,
                      damage: p.def.damage,
                      sourceId: p.def.sourceId
                    });
                    return 1; // break
                  }
                };

                // Check if any collider matches a known target.
                for (var tgt of targets) {
                  if (_loop(tgt)) break;
                }
              }
            }
          }

          this._projectiles = alive;
          return hits;
        } // Get all active projectiles (for debug / cleanup).


        get active() {
          return this._projectiles;
        }

        count() {
          return this._projectiles.length;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=fe6b360dd7e8dd79e797c4b793c77c43bbbcdf6a.js.map