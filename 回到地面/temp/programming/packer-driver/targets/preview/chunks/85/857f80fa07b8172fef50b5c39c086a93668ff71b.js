System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, IAnimationController, AnimationComponent, _crd, IAnimationComponent, DEFAULT_CLIP_MAP;

  // Translate ECS state to AIAnimState for the state machine.
  function translateState(s) {
    var _map$s;

    var map = {
      idle: 'Idle',
      walk: 'Walk',
      attack: 'Attack',
      skill: 'Skill',
      hit: 'HitStun',
      dodge: 'Idle',
      die: 'Dead'
    };
    return (_map$s = map[s]) != null ? _map$s : 'Idle';
  }

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAnimationController(extras) {
    _reporterNs.report("IAnimationController", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAnimContract(extras) {
    _reporterNs.report("IAnimContract", "../battle/ai/AnimationStateMachine", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  _export("AnimationComponent", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      IAnimationController = _unresolved_2.IAnimationController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "10d21OLbvxFoZprnrG+C+CX", "AnimationComponent", undefined); // AnimationComponent.ts — wraps IAnimationController for ECS (§3.12).
      // Pure TS, no `cc`. Maps entity states to animation clips via a data-driven record.
      // No switch on state type — uses a Map<state, clipId> look-up.


      _export("IAnimationComponent", IAnimationComponent = 'IAnimationComponent');

      // Data-driven anim clip mapping (configurable per character).
      DEFAULT_CLIP_MAP = {
        idle: 'player_idle',
        walk: 'player_walk',
        attack: 'player_attack',
        skill: 'player_skill',
        hit: 'player_hit',
        dodge: 'player_dodge',
        die: 'player_die'
      };

      _export("AnimationComponent", AnimationComponent = class AnimationComponent {
        constructor(clipMap) {
          this._anim = null;
          this._clipMap = void 0;
          this._currentState = 'idle';
          this._clipMap = clipMap != null ? clipMap : DEFAULT_CLIP_MAP;
        }

        initialize(ctx) {
          this._anim = ctx.get(_crd && IAnimationController === void 0 ? (_reportPossibleCrUseOfIAnimationController({
            error: Error()
          }), IAnimationController) : IAnimationController);
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._currentState = 'idle';
        }

        get currentState() {
          return this._currentState;
        } // Set animation state; drives the IAnimationController.


        setState(state) {
          if (state === this._currentState) return;
          this._currentState = state;
          var clip = this._clipMap[state];

          if (clip && this._anim) {
            this._anim.play(clip); // Map ECS state to the animation state machine.


            this._anim.setState(translateState(state));
          }
        } // Direct play (for one-off skill animations).


        playClip(clipId) {
          if (this._anim) {
            this._anim.play(clipId);
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=857f80fa07b8172fef50b5c39c086a93668ff71b.js.map