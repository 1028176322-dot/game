// IAIController.ts — AI controller abstraction (§3.10, v3 upgrade).
// Pure TS, no `cc`. The concrete AIController implements ILifecycle (red line 3).
//
// Red line 2: NO `switch(strategy)`. The active decision policy is selected from a
//   Map<AIStrategy, AIDecisionPolicy> via setStrategy. Add a 5th strategy = add a policy
//   entry; the framework stays untouched.
// Red line 5: NO Math.random. All decisions are deterministic functions of (self, perception).
//
// Combat layering (§2.5): the AI only PRODUCES MoveCommand / SkillRequest through the owner's
//   command sink; it never writes gridX/gridY or applies damage. The combat subsystem executes.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.10 (+ §2.5 combat layering, §3.5 anim SM).

import type { GameContext } from '../../core/GameContext';

// Service token (co-located with the owning module; GameBootstrap registers the animation impl here).
export const IAIController = 'IAIController';

export type AIStrategy = 'BT' | 'FSM' | 'GOAP' | 'Utility';

// Behavior node library (§3.10): Patrol/Search/Chase/Attack/Lost/Return/Dodge/Skill/Die.
export type AINode =
  | 'Patrol' | 'Search' | 'Chase' | 'Attack' | 'Lost' | 'Return' | 'Dodge' | 'Skill' | 'Die';

// Animation state-machine leaf states (§3.5): Idle/Walk/Attack/Skill/HitStun/Dead.
export type AIAnimState = 'Idle' | 'Walk' | 'Attack' | 'Skill' | 'HitStun' | 'Dead';

// ---- Combat-layering outputs (AI produces; combat subsystem executes) ----
export interface MoveCommand {
  readonly dx: number;          // -1 | 0 | 1 grid step
  readonly dy: number;
  readonly reason: AINode;
}

export interface SkillRequest {
  readonly skillId: string;
  readonly reason: AINode;
}

export interface AIDebugInfo {
  readonly strategy: AIStrategy;
  readonly node: AINode;
  readonly anim: AIAnimState;
  readonly targetDistance: number;
  readonly hasTarget: boolean;
}

// Perception of the world (target). Provided by the combat subsystem / blackboard (§2.6).
export interface AIPerception {
  readonly targetX: number;
  readonly targetY: number;
  readonly targetAlive: boolean;
}

// Minimal owner contract the AI controller depends on (pure TS, testable, no `cc`).
// The owner is the combat subsystem's representation of this actor; it carries the command
// sink so the AI can emit MoveCommand/SkillRequest without touching state directly.
export interface Entity {
  readonly id: string;
  readonly gridX: number;
  readonly gridY: number;
  readonly perception: AIPerception;
  submitMove(cmd: MoveCommand): void;
  submitSkill(req: SkillRequest): void;
}

// A single decision: which node is active, what to emit, what anim to play.
export interface AIDecision {
  readonly node: AINode;
  readonly move?: MoveCommand;
  readonly skill?: SkillRequest;
  readonly anim: AIAnimState;
}

// Pluggable decision policy (BT / FSM / GOAP / Utility). Selected by setStrategy, no switch.
export interface AIDecisionPolicy {
  readonly kind: AIStrategy;
  decide(self: Entity, perception: AIPerception): AIDecision;
}

// ---- IAIController (1:1 with §3.10) ----
export interface IAIController {
  initialize(ctx: GameContext, owner: Entity): void;
  update(dt: number): void;            // 产出 MoveCommand / SkillRequest
  setStrategy(s: AIStrategy): void;
  getDebugState(): AIDebugInfo;         // 供 DebugPanel（§5.5）
}
