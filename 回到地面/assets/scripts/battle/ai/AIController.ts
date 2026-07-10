// AIController.ts — orchestrator implementing IAIController (§3.10, default strategy = BT).
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

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import { IAnimationController as IAnimationControllerToken } from '../../core/GameContext';
import type { IAnimationController } from './AnimationStateMachine';
import {
  IAIController, AIStrategy, AIDebugInfo, Entity, AIPerception,
} from './IAIController';
import type { AIDecision, AIDecisionPolicy } from './IAIController';
import { BTAIController, FSMAIController, GOAPController, UtilityAIController } from './aiPolicies';

function manhattan(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export class AIController implements IAIController, ILifecycle {
  readonly name = 'AIController';

  private _ctx: GameContext | null = null;
  private _owner: Entity | null = null;
  private readonly _policies = new Map<AIStrategy, AIDecisionPolicy>();
  private _active: AIDecisionPolicy | null = null;
  private _lastDebug: AIDebugInfo | null = null;
  private _initialized = false;

  constructor() {
    // Red line 2: registry, NOT switch. Default = BT (spec: BTAIController 默认).
    this._policies.set('BT', new BTAIController());
    this._policies.set('FSM', new FSMAIController());
    this._policies.set('GOAP', new GOAPController());
    this._policies.set('Utility', new UtilityAIController());
    this._active = this._policies.get('BT')!;
  }

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext, owner: Entity): void {
    this._ctx = ctx;
    this._owner = owner;
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._ctx = null;
    this._owner = null;
    this._active = null;
    this._lastDebug = null;
    this._initialized = false;
  }
  get initialized(): boolean {
    return this._initialized;
  }

  setStrategy(s: AIStrategy): void {
    const p = this._policies.get(s);
    if (!p) {
      throw new Error(`[AIController] unknown strategy: ${s}`);
    }
    this._active = p;
  }

  update(_dt: number): void {
    if (!this._ctx || !this._owner || !this._active) {
      throw new Error('[AIController] not initialized');
    }
    const self = this._owner;
    const perception = self.perception;
    const decision: AIDecision = this._active.decide(self, perception);

    // Combat layering: emit commands through the owner sink; never touch state directly.
    if (decision.move) self.submitMove(decision.move);
    if (decision.skill) self.submitSkill(decision.skill);

    // Drive the animation state machine (§3.5) via the injected controller.
    const anim = this._ctx.get<IAnimationController>(IAnimationControllerToken);
    anim.setState(decision.anim);
    if (decision.skill && decision.anim === 'Skill') {
      anim.play(decision.skill.skillId);
    }

    const dist = perception.targetAlive
      ? manhattan(self.gridX, self.gridY, perception.targetX, perception.targetY)
      : -1;
    this._lastDebug = {
      strategy: this._active.kind,
      node: decision.node,
      anim: decision.anim,
      targetDistance: dist,
      hasTarget: perception.targetAlive,
    };
  }

  getDebugState(): AIDebugInfo {
    if (!this._lastDebug) {
      return {
        strategy: this._active ? this._active.kind : 'BT',
        node: 'Patrol',
        anim: 'Idle',
        targetDistance: -1,
        hasTarget: false,
      };
    }
    return this._lastDebug;
  }
}
