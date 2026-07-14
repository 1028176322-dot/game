System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ALL_MASK, KinematicMover, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionService(extras) {
    _reporterNs.report("ICollisionService", "./ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVec(extras) {
    _reporterNs.report("Vec3", "./ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfALL_MASK(extras) {
    _reporterNs.report("ALL_MASK", "./ICollisionService", _context.meta, extras);
  }

  _export("KinematicMover", void 0);

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

      _cclegacy._RF.push({}, "69e55gLoKVP148+QTQ73JK/", "KinematicMover", undefined); // KinematicMover.ts — deterministic kinematic movement (Demo3).
      // Pure TS, NO `cc` import -> node/vitest testable.
      //
      // Design:
      //  - Depends ONLY on ICollisionService (interface) -> business never touches PhysicsSystem
      //    (red line 1). The engine runtime injects the registered PhysicsCollisionImpl.
      //  - Deterministic: position += velocity*dt with axis-separated slide resolution
      //    (X, then Z, then Y) so the same input stream always yields the same path. This is the
      //    MoveCommand executor foundation for §2.6 (network) and §5.7 (Replay).
      //  - Implements ILifecycle (red line 3): destroy() resets state.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.3 + demo3.md.


      _export("KinematicMover", KinematicMover = class KinematicMover {
        constructor(_collision, start = {
          x: 0,
          y: 0,
          z: 0
        }, opts = {}) {
          var _opts$radius, _opts$mask;

          this.name = 'KinematicMover';
          this._pos = void 0;
          this._vel = {
            x: 0,
            y: 0,
            z: 0
          };
          this._radius = void 0;
          this._mask = void 0;
          this._ctx = null;
          this._initialized = false;
          this._collision = _collision;
          this._pos = {
            x: start.x,
            y: start.y,
            z: start.z
          };
          this._radius = (_opts$radius = opts.radius) != null ? _opts$radius : 0.4;
          this._mask = (_opts$mask = opts.mask) != null ? _opts$mask : _crd && ALL_MASK === void 0 ? (_reportPossibleCrUseOfALL_MASK({
            error: Error()
          }), ALL_MASK) : ALL_MASK;
        } // --- ILifecycle (§5.1) ---


        initialize(ctx) {
          this._ctx = ctx;
          this._initialized = true;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._pos = {
            x: 0,
            y: 0,
            z: 0
          };
          this._vel = {
            x: 0,
            y: 0,
            z: 0
          };
          this._ctx = null;
          this._initialized = false;
        } // --- API ---


        setVelocity(v) {
          this._vel = {
            x: v.x,
            y: v.y,
            z: v.z
          };
        }

        get velocity() {
          return {
            x: this._vel.x,
            y: this._vel.y,
            z: this._vel.z
          };
        }

        getPosition() {
          return {
            x: this._pos.x,
            y: this._pos.y,
            z: this._pos.z
          };
        }

        setPosition(p) {
          this._pos = {
            x: p.x,
            y: p.y,
            z: p.z
          };
        }

        get initialized() {
          return this._initialized;
        } // Deterministic integration: axis-separated slide (no random, fixed order X -> Z -> Y).


        update(dt) {
          const next = {
            x: this._pos.x + this._vel.x * dt,
            y: this._pos.y + this._vel.y * dt,
            z: this._pos.z + this._vel.z * dt
          };
          const resolved = {
            x: this._pos.x,
            y: this._pos.y,
            z: this._pos.z
          }; // X axis

          if (!this._blocked({
            x: next.x,
            y: this._pos.y,
            z: this._pos.z
          })) {
            resolved.x = next.x;
          } // Z axis


          if (!this._blocked({
            x: resolved.x,
            y: this._pos.y,
            z: next.z
          })) {
            resolved.z = next.z;
          } // Y axis


          if (!this._blocked({
            x: resolved.x,
            y: next.y,
            z: resolved.z
          })) {
            resolved.y = next.y;
          }

          this._pos = resolved;
        }

        _blocked(p) {
          return this._collision.overlapSphere(p, this._radius, this._mask).length > 0;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2d9f035b84af44272b54a7edb99f1820955ea806.js.map