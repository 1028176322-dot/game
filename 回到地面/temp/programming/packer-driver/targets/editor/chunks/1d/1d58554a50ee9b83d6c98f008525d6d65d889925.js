System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ICollisionService, MovementComponent, _crd, IMovementComponent;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionService(extras) {
    _reporterNs.report("ICollisionService", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionContract(extras) {
    _reporterNs.report("ICollisionContract", "../physics/ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  _export("MovementComponent", void 0);

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

      _cclegacy._RF.push({}, "f92ecbShJNH/4/n8f3KJYL5", "MovementComponent", undefined); // MovementComponent.ts — grid movement from MoveCommand (§3.12 ECS).
      // Pure TS, no `cc`. Receives MoveCommand, applies grid displacement via ICollisionService.
      // Red line 1: uses ICollisionService, not PhysicsSystem.


      _export("IMovementComponent", IMovementComponent = 'IMovementComponent');

      _export("MovementComponent", MovementComponent = class MovementComponent {
        constructor() {
          this._gridX = 0;
          this._gridY = 0;
          this._collision = null;
          this._moving = false;
          this._transitRemaining = 0;
        } // ILifecycle: ctx-dependent wire-up. The per-entity spawn overload below keeps
        // EcsEntityFactory call sites (initialize(ctx, x, y)) unchanged.


        initialize(ctx, startX = 0, startY = 0) {
          this._collision = ctx.get(_crd && ICollisionService === void 0 ? (_reportPossibleCrUseOfICollisionService({
            error: Error()
          }), ICollisionService) : ICollisionService);
          this._gridX = startX;
          this._gridY = startY;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._transitRemaining = 0;
          this._moving = false;
        }

        get gridX() {
          return this._gridX;
        }

        get gridY() {
          return this._gridY;
        }

        get moving() {
          return this._moving;
        }

        getState() {
          return {
            gridX: this._gridX,
            gridY: this._gridY,
            moving: this._moving
          };
        } // Execute a move command. Returns true if position changed.
        // `duration` is the transit time (seconds) during which `moving` stays true
        // (mirrors an engine tween; without it `moving` would never reset in pure TS).


        executeMove(dx, dy, isWalkable, duration = 0.1) {
          const nx = this._gridX + dx;
          const ny = this._gridY + dy;

          if (!isWalkable(nx, ny)) {
            this._moving = false;
            this._transitRemaining = 0;
            return false;
          }

          this._gridX = nx;
          this._gridY = ny;
          this._moving = true;
          this._transitRemaining = duration;
          return true;
        } // Move toward a target position.


        moveToward(tx, ty, isWalkable) {
          const dx = Math.sign(tx - this._gridX);
          const dy = Math.sign(ty - this._gridY);

          if (dx === 0 && dy === 0) {
            this._moving = false;
            this._transitRemaining = 0;
            return false;
          }

          return this.executeMove(dx, dy, isWalkable);
        } // Advance the transit timer; clears `moving` when the step completes.


        update(dt) {
          if (this._transitRemaining > 0) {
            this._transitRemaining -= dt;

            if (this._transitRemaining <= 0) {
              this._transitRemaining = 0;
              this._moving = false;
            }
          }
        } // Teleport (for room transitions).


        teleport(x, y) {
          this._gridX = x;
          this._gridY = y;
          this._moving = false;
          this._transitRemaining = 0;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1d58554a50ee9b83d6c98f008525d6d65d889925.js.map