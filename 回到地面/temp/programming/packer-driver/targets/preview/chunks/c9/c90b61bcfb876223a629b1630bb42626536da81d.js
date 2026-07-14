System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, AnimationStateMachine, _crd, TRANSITIONS;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIAnimState(extras) {
    _reporterNs.report("AIAnimState", "./IAIController", _context.meta, extras);
  }

  _export("AnimationStateMachine", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "abf25HT2SNGy4zK3EJiQgOU", "AnimationStateMachine", undefined); // AnimationStateMachine.ts — IAnimationController impl (§3.5 animation state machine).
      // Pure TS, no `cc`. Driven by the AI (and other systems) via setState/play.
      // Holds a small state machine with explicit allowed transitions; Dead is terminal.
      //
      // §3.5 pipeline: 业务 -> AnimationController.setState("Attack") / .play("SkillA")
      //                       -> StateMachine (状态/过渡/blend)
      //                       -> AnimationGraph (locomotion/attack/skill/hit/dodge/death)
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.5 (+ §3.10 AI drives anim via setState).
      // Service interface (token IAnimationController lives in core/GameContext). 1:1 with §3.5.


      // Allowed transitions (adjacency). Any state may enter Dead; Dead is terminal.
      TRANSITIONS = {
        Idle: ['Walk', 'Attack', 'Skill', 'HitStun', 'Dead'],
        Walk: ['Idle', 'Attack', 'Skill', 'HitStun', 'Dead'],
        Attack: ['Idle', 'Walk', 'HitStun', 'Dead'],
        Skill: ['Idle', 'Walk', 'HitStun', 'Dead'],
        HitStun: ['Idle', 'Walk', 'Attack', 'Dead'],
        Dead: []
      };

      _export("AnimationStateMachine", AnimationStateMachine = class AnimationStateMachine {
        constructor() {
          this.name = 'AnimationStateMachine';
          this._state = 'Idle';
          this._history = [];
          this._clips = [];
          this._initialized = false;
        }

        get currentState() {
          return this._state;
        }

        get history() {
          return this._history;
        }

        get clips() {
          return this._clips;
        } // Reject transitions not in the adjacency table (Dead is terminal, etc.).


        setState(state) {
          var _TRANSITIONS$this$_st;

          if (state === this._state) return;
          var allowed = (_TRANSITIONS$this$_st = TRANSITIONS[this._state]) != null ? _TRANSITIONS$this$_st : [];
          if (!allowed.includes(state)) return;
          this._state = state;

          this._history.push(state);
        }

        play(clip) {
          this._clips.push(clip);
        }

        reset() {
          this._state = 'Idle';
          this._history = [];
          this._clips = [];
        } // --- ILifecycle (§5.1) ---


        initialize(_ctx) {
          this._initialized = true;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this.reset();
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c90b61bcfb876223a629b1630bb42626536da81d.js.map