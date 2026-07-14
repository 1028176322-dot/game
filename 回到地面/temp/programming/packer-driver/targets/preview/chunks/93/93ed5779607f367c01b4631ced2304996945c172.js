System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, IAnimationControllerToken, BTAIController, FSMAIController, GOAPController, UtilityAIController, AIController, _crd;

  function manhattan(ax, ay, bx, by) {
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAnimationControllerToken(extras) {
    _reporterNs.report("IAnimationControllerToken", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAnimationController(extras) {
    _reporterNs.report("IAnimationController", "./AnimationStateMachine", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAIController(extras) {
    _reporterNs.report("IAIController", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIStrategy(extras) {
    _reporterNs.report("AIStrategy", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIDebugInfo(extras) {
    _reporterNs.report("AIDebugInfo", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEntity(extras) {
    _reporterNs.report("Entity", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIDecision(extras) {
    _reporterNs.report("AIDecision", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIDecisionPolicy(extras) {
    _reporterNs.report("AIDecisionPolicy", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBTAIController(extras) {
    _reporterNs.report("BTAIController", "./aiPolicies", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFSMAIController(extras) {
    _reporterNs.report("FSMAIController", "./aiPolicies", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGOAPController(extras) {
    _reporterNs.report("GOAPController", "./aiPolicies", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUtilityAIController(extras) {
    _reporterNs.report("UtilityAIController", "./aiPolicies", _context.meta, extras);
  }

  _export("AIController", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      IAnimationControllerToken = _unresolved_2.IAnimationController;
    }, function (_unresolved_3) {
      BTAIController = _unresolved_3.BTAIController;
      FSMAIController = _unresolved_3.FSMAIController;
      GOAPController = _unresolved_3.GOAPController;
      UtilityAIController = _unresolved_3.UtilityAIController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4fcf960Gg5H64VoCkhhiqIN", "AIController", undefined); // AIController.ts — orchestrator implementing IAIController (§3.10, default strategy = BT).
      // Pure TS, no `cc`. Implements ILifecycle (red line 3) so it joins LifecycleManager teardown.
      //
      // Red line 2: setStrategy selects the active AIDecisionPolicy from a Map<AIStrategy, policy>
      //   (no switch). The 4 policies (BT/FSM/GOAP/Utility) are the spec's named implementations.
      // Red line 4: the animation dependency (IAnimationController) is pulled from GameContext via
      //   ctx.get — never `new`-ed here.
      // Red line 5: no Math.random; decisions are pure functions of (self, perception).
      //
      // Combat layering (§2.5): update() turns a decision into MoveCommand/SkillRequest pushed to the
      //   owner's command sink. The AI never writes gridX/gridY or applies damage.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.10.


      _export("AIController", AIController = class AIController {
        constructor() {
          this.name = 'AIController';
          this._ctx = null;
          this._owner = null;
          this._policies = new Map();
          this._active = null;
          this._lastDebug = null;
          this._initialized = false;

          // Red line 2: registry, NOT switch. Default = BT (spec: BTAIController 默认).
          this._policies.set('BT', new (_crd && BTAIController === void 0 ? (_reportPossibleCrUseOfBTAIController({
            error: Error()
          }), BTAIController) : BTAIController)());

          this._policies.set('FSM', new (_crd && FSMAIController === void 0 ? (_reportPossibleCrUseOfFSMAIController({
            error: Error()
          }), FSMAIController) : FSMAIController)());

          this._policies.set('GOAP', new (_crd && GOAPController === void 0 ? (_reportPossibleCrUseOfGOAPController({
            error: Error()
          }), GOAPController) : GOAPController)());

          this._policies.set('Utility', new (_crd && UtilityAIController === void 0 ? (_reportPossibleCrUseOfUtilityAIController({
            error: Error()
          }), UtilityAIController) : UtilityAIController)());

          this._active = this._policies.get('BT');
        } // --- ILifecycle (§5.1) ---


        initialize(ctx, owner) {
          this._ctx = ctx;
          this._owner = owner;
          this._initialized = true;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._ctx = null;
          this._owner = null;
          this._active = null;
          this._lastDebug = null;
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        }

        setStrategy(s) {
          var p = this._policies.get(s);

          if (!p) {
            throw new Error("[AIController] unknown strategy: " + s);
          }

          this._active = p;
        }

        update(_dt) {
          if (!this._ctx || !this._owner || !this._active) {
            throw new Error('[AIController] not initialized');
          }

          var self = this._owner;
          var perception = self.perception;

          var decision = this._active.decide(self, perception); // Combat layering: emit commands through the owner sink; never touch state directly.


          if (decision.move) self.submitMove(decision.move);
          if (decision.skill) self.submitSkill(decision.skill); // Drive the animation state machine (§3.5) via the injected controller.

          var anim = this._ctx.get(_crd && IAnimationControllerToken === void 0 ? (_reportPossibleCrUseOfIAnimationControllerToken({
            error: Error()
          }), IAnimationControllerToken) : IAnimationControllerToken);

          anim.setState(decision.anim);

          if (decision.skill && decision.anim === 'Skill') {
            anim.play(decision.skill.skillId);
          }

          var dist = perception.targetAlive ? manhattan(self.gridX, self.gridY, perception.targetX, perception.targetY) : -1;
          this._lastDebug = {
            strategy: this._active.kind,
            node: decision.node,
            anim: decision.anim,
            targetDistance: dist,
            hasTarget: perception.targetAlive
          };
        }

        getDebugState() {
          if (!this._lastDebug) {
            return {
              strategy: this._active ? this._active.kind : 'BT',
              node: 'Patrol',
              anim: 'Idle',
              targetDistance: -1,
              hasTarget: false
            };
          }

          return this._lastDebug;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=93ed5779607f367c01b4631ced2304996945c172.js.map