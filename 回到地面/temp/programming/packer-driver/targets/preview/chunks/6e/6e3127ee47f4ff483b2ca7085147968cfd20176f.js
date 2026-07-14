System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, pickAutoAnimState, EcsBridgeCore, _crd, ATTACK_ANIM_WINDOW;

  function _reportPossibleCrUseOfEntityDescriptor(extras) {
    _reporterNs.report("EntityDescriptor", "./EntityManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEntityManager(extras) {
    _reporterNs.report("EntityManager", "./EntityManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStatDamageable(extras) {
    _reporterNs.report("StatDamageable", "./StatDamageable", _context.meta, extras);
  }

  function _reportPossibleCrUseOfpickAutoAnimState(extras) {
    _reporterNs.report("pickAutoAnimState", "./EcsSyncMath", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerAnimState(extras) {
    _reporterNs.report("PlayerAnimState", "./AnimationComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillRequest(extras) {
    _reporterNs.report("SkillRequest", "../battle/ai/IAIController", _context.meta, extras);
  }

  _export("EcsBridgeCore", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      pickAutoAnimState = _unresolved_2.pickAutoAnimState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0f31bh4oPpGmpGuizf2sNFq", "EcsBridgeCore", undefined); // EcsBridgeCore.ts — orchestrates one entity's ECS components and bridges them to the engine
      // node via injected callbacks (§3.12 engine wiring). Pure TS, no `cc`: the cc bridge passes
      // node-sync callbacks so this class is fully unit-testable in node.
      //
      // Responsibilities:
      //  - attach/detach the descriptor in the EntityManager (lifecycle)
      //  - tick all ECS components each frame
      //  - sync grid position -> world node position (via gridToWorld callback)
      //  - drive animation from movement/attack/death state
      //  - accept MoveCommand / SkillRequest from AI or player input
      //
      // Red lines honored: ILifecycle-style attach/detach; no `cc`; no Math.random; no switch.


      ATTACK_ANIM_WINDOW = 0.25;

      _export("EcsBridgeCore", EcsBridgeCore = class EcsBridgeCore {
        constructor(descriptor, damageable, _em, _cb) {
          this._lastAuto = null;
          this._attackTimer = 0;
          this._detached = false;
          this.descriptor = descriptor;
          this.damageable = damageable;
          this._em = _em;
          this._cb = _cb;
        }

        attach() {
          if (this._detached) return;

          this._em.register(this.descriptor);
        }

        detach() {
          if (this._detached) return;

          this._em.unregister(this.descriptor.id);

          this._detached = true;
        }

        get detached() {
          return this._detached;
        } // Feed a grid move from AI / player input.


        submitMove(dx, dy, isWalkable) {
          return this.descriptor.movement.executeMove(dx, dy, isWalkable);
        } // Feed a skill request from AI / player input.


        submitSkill(req) {
          this.descriptor.combat.enqueue(req);
          this._attackTimer = ATTACK_ANIM_WINDOW;
        } // Per-frame tick: advance components, sync node, drive animation, handle death.


        tick(dt) {
          if (this._detached) return;
          this.descriptor.stat.update(dt);
          this.descriptor.combat.update(dt);
          this.descriptor.movement.update(dt);
          this.descriptor.interaction.update(dt);
          this.descriptor.target.updatePosition(this.descriptor.movement.gridX, this.descriptor.movement.gridY); // Sync node world position from grid cell.

          var w = this._cb.gridToWorld(this.descriptor.movement.gridX, this.descriptor.movement.gridY);

          this._cb.setNodePosition(w.x, w.y); // Drive animation.


          if (this._attackTimer > 0) {
            this._attackTimer -= dt;
            this.descriptor.anim.setState('attack');
            this._lastAuto = null;
          } else {
            var next = (_crd && pickAutoAnimState === void 0 ? (_reportPossibleCrUseOfpickAutoAnimState({
              error: Error()
            }), pickAutoAnimState) : pickAutoAnimState)(this.descriptor.movement.moving, this._lastAuto);

            if (next) {
              this.descriptor.anim.setState(next);
              this._lastAuto = next;
            }
          } // Death -> play die anim once, then detach from registry.


          if (!this.descriptor.stat.alive && this._lastAuto !== 'die') {
            this.descriptor.anim.setState('die');
            this._lastAuto = 'die';
            this.detach();
          }
        } // Explicit death hook (e.g., from CombatSystem kill event).


        onDeath() {
          this.descriptor.anim.setState('die');
          this.detach();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6e3127ee47f4ff483b2ca7085147968cfd20176f.js.map