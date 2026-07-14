System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ALL_MASK, PhysicsCollisionImpl, _crd, GROUND_PROBE_DIST;

  function maskMatch(colliderMask, queryMask) {
    return (colliderMask & queryMask) !== 0;
  }

  function dist3(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCollider(extras) {
    _reporterNs.report("Collider", "./ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionService(extras) {
    _reporterNs.report("ICollisionService", "./ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRaycastHit(extras) {
    _reporterNs.report("RaycastHit", "./ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVec(extras) {
    _reporterNs.report("Vec3", "./ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfALL_MASK(extras) {
    _reporterNs.report("ALL_MASK", "./ICollisionService", _context.meta, extras);
  }

  _export("PhysicsCollisionImpl", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      ALL_MASK = _unresolved_2.ALL_MASK;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5e59e/RXrRM9anCnHPDFojh", "PhysicsCollisionImpl", undefined); // PhysicsCollisionImpl.ts — ICollisionService implementation (§3.3).
      // Pure TS, NO `cc` import -> node/vitest testable, deterministic (§5.7 Replay).
      //
      // Design (red line 1 compliant):
      //  - Business code never imports PhysicsSystem. This implementation is the ONLY collision
      //    backend, and it is written in pure TS over a collider registry. The engine side
      //    registers cc.Collider transforms into the registry at runtime (registerCollider), so
      //    no `cc` dependency leaks into the contract or the math.
      //  - Determinism: all queries iterate colliders in insertion order (Map preserves order),
      //    no Math.random, fixed math -> identical input yields identical output. This is strictly
      //    better for replay determinism than delegating to a black-box physics engine.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.3.
      // Strict 1:1 with ICollisionService; implements ILifecycle (red line 3).


      GROUND_PROBE_DIST = 2;

      _export("PhysicsCollisionImpl", PhysicsCollisionImpl = class PhysicsCollisionImpl {
        constructor() {
          this.name = 'PhysicsCollisionImpl';
          this._colliders = new Map();
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
          this.clear();
          this._ctx = null;
          this._initialized = false;
        } // --- Registry (engine side feeds cc.Collider transforms here at runtime) ---


        registerCollider(c) {
          this._colliders.set(c.id, c);
        }

        unregisterCollider(id) {
          this._colliders.delete(id);
        }

        clear() {
          this._colliders.clear();
        }

        get initialized() {
          return this._initialized;
        } // --- ICollisionService (§3.3) ---


        overlapSphere(center, radius, mask = _crd && ALL_MASK === void 0 ? (_reportPossibleCrUseOfALL_MASK({
          error: Error()
        }), ALL_MASK) : ALL_MASK) {
          const hits = [];

          for (const c of this._colliders.values()) {
            if (c.enabled === false) continue;
            if (!maskMatch(c.mask, mask)) continue;

            if (dist3(center, c.position) <= radius + c.radius) {
              hits.push(c);
            }
          }

          return hits;
        }

        overlapCapsule(center, radius, height, mask = _crd && ALL_MASK === void 0 ? (_reportPossibleCrUseOfALL_MASK({
          error: Error()
        }), ALL_MASK) : ALL_MASK) {
          const halfH = height / 2;
          const top = {
            x: center.x,
            y: center.y + halfH,
            z: center.z
          };
          const bottom = {
            x: center.x,
            y: center.y - halfH,
            z: center.z
          };
          const hits = [];

          for (const c of this._colliders.values()) {
            if (c.enabled === false) continue;
            if (!maskMatch(c.mask, mask)) continue; // distance from collider center to the capsule segment [bottom, top]

            let t = 0;

            if (height > 0) {
              t = (c.position.y - bottom.y) / height;
              if (t < 0) t = 0;else if (t > 1) t = 1;
            }

            const segPoint = {
              x: bottom.x,
              y: bottom.y + (top.y - bottom.y) * t,
              z: bottom.z
            };

            if (dist3(c.position, segPoint) <= radius + c.radius) {
              hits.push(c);
            }
          }

          return hits;
        }

        raycast(origin, dir, maxDist, mask = _crd && ALL_MASK === void 0 ? (_reportPossibleCrUseOfALL_MASK({
          error: Error()
        }), ALL_MASK) : ALL_MASK) {
          const dl = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
          if (dl < 1e-9) return null;
          const d = {
            x: dir.x / dl,
            y: dir.y / dl,
            z: dir.z / dl
          };
          let bestT = Infinity;
          let bestId = null;

          for (const c of this._colliders.values()) {
            if (c.enabled === false) continue;
            if (!maskMatch(c.mask, mask)) continue; // ray-sphere: |origin + t*d - C|^2 = R^2

            const mx = origin.x - c.position.x;
            const my = origin.y - c.position.y;
            const mz = origin.z - c.position.z;
            const b = mx * d.x + my * d.y + mz * d.z;
            const cc = mx * mx + my * my + mz * mz - c.radius * c.radius;
            const disc = b * b - cc;
            if (disc < 0) continue;
            const sq = Math.sqrt(disc);
            let t = -b - sq; // entry point

            if (t < 0) {
              t = -b + sq; // origin inside sphere -> exit point

              if (t < 0) continue;
            }

            if (t > maxDist) continue;

            if (t < bestT) {
              bestT = t;
              bestId = c.id;
            }
          }

          if (bestId === null) return null;

          const c = this._colliders.get(bestId);

          const point = {
            x: origin.x + d.x * bestT,
            y: origin.y + d.y * bestT,
            z: origin.z + d.z * bestT
          };
          const nx = point.x - c.position.x;
          const ny = point.y - c.position.y;
          const nz = point.z - c.position.z;
          const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          const normal = {
            x: nx / nl,
            y: ny / nl,
            z: nz / nl
          };
          return {
            point,
            distance: bestT,
            normal,
            colliderId: bestId
          };
        }

        checkGround(pos, mask = _crd && ALL_MASK === void 0 ? (_reportPossibleCrUseOfALL_MASK({
          error: Error()
        }), ALL_MASK) : ALL_MASK) {
          const origin = {
            x: pos.x,
            y: pos.y + 0.1,
            z: pos.z
          };
          const down = {
            x: 0,
            y: -1,
            z: 0
          };
          return this.raycast(origin, down, GROUND_PROBE_DIST, mask) !== null;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d1cdb5ff9f45b58384499b82f694a2aaaf1bfb1e.js.map