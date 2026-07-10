// aiPolicies.ts — the four pluggable decision policies (§3.10): BT / FSM / GOAP / Utility.
// Pure TS, no `cc`, no Math.random (red line 5). Selected by AIController.setStrategy (Map, no switch).
//
// The four named classes map 1:1 to the spec's "BTAIController（默认）/ FSMAIController /
// GOAPController / UtilityAIController". They are decision policies; the AIController
// orchestrator hosts them and switches the active one via setStrategy (no switch on id).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.10.

import {
  AIStrategy, AINode, AIAnimState, Entity, AIPerception, AIDecision, AIDecisionPolicy,
  MoveCommand, SkillRequest,
} from './IAIController';

const ATTACK_RANGE = 1;
const CHASE_RANGE = 4;

function manhattan(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function moveToward(self: Entity, tx: number, ty: number, reason: AINode): MoveCommand {
  return { dx: Math.sign(tx - self.gridX), dy: Math.sign(ty - self.gridY), reason };
}

function attackDecision(reason: AINode): AIDecision {
  const skill: SkillRequest = { skillId: 'melee_attack', reason };
  return { node: reason, skill, anim: 'Attack' };
}

// ---------- BT (default): priority selector over conditions ----------
// Order: Die > Attack(in range) > Chase(in chase range) > Patrol(far). Each frame re-evaluates.
export class BTAIController implements AIDecisionPolicy {
  readonly kind: AIStrategy = 'BT';

  decide(self: Entity, p: AIPerception): AIDecision {
    if (!p.targetAlive) {
      return { node: 'Die', anim: 'Dead' };
    }
    const dist = manhattan(self.gridX, self.gridY, p.targetX, p.targetY);
    if (dist <= ATTACK_RANGE) {
      return attackDecision('Attack');
    }
    if (dist <= CHASE_RANGE) {
      return { node: 'Chase', move: moveToward(self, p.targetX, p.targetY, 'Chase'), anim: 'Walk' };
    }
    return { node: 'Patrol', anim: 'Idle' };
  }
}

// ---------- FSM: stateful finite-state-machine over the behavior nodes ----------
// State persists across frames (this._state). Transitions resolved by a record lookup (no switch).
export class FSMAIController implements AIDecisionPolicy {
  readonly kind: AIStrategy = 'FSM';
  private _state: AINode = 'Patrol';

  decide(self: Entity, p: AIPerception): AIDecision {
    const dist = p.targetAlive ? manhattan(self.gridX, self.gridY, p.targetX, p.targetY) : 999;

    // Transition (record lookup, no switch on id).
    if (!p.targetAlive) {
      this._state = 'Die';
    } else if (this._state === 'Die') {
      this._state = 'Patrol';
    } else if (dist <= ATTACK_RANGE) {
      this._state = 'Attack';
    } else if (dist <= CHASE_RANGE) {
      this._state = 'Chase';
    } else {
      this._state = 'Patrol';
    }

    const builders: Record<AINode, () => AIDecision> = {
      Patrol: () => ({ node: 'Patrol', anim: 'Idle' }),
      Search: () => ({ node: 'Search', anim: 'Walk' }),
      Chase: () => ({ node: 'Chase', move: moveToward(self, p.targetX, p.targetY, 'Chase'), anim: 'Walk' }),
      Attack: () => attackDecision('Attack'),
      Lost: () => ({ node: 'Lost', anim: 'Idle' }),
      Return: () => ({ node: 'Return', anim: 'Walk' }),
      Dodge: () => ({ node: 'Dodge', anim: 'Walk' }),
      Skill: () => ({ node: 'Skill', skill: { skillId: 'ranged_skill', reason: 'Skill' }, anim: 'Skill' }),
      Die: () => ({ node: 'Die', anim: 'Dead' }),
    };
    return builders[this._state]();
  }
}

// ---------- GOAP: generic forward planner (BFS over action sequences) ----------
// Goal: be in attack range (then attack). Actions: Approach (pre {} -> eff inRange),
// Attack (pre inRange -> eff {}). Planner returns the first action to execute this frame.
interface GOAPWorld { inRange: boolean }
type GOAPActionName = 'Approach' | 'Attack';

interface GOAPAction {
  name: GOAPActionName;
  pre: GOAPWorld;
  eff: Partial<GOAPWorld>;
  build: (self: Entity, p: AIPerception) => AIDecision;
}

function satisfies(pre: GOAPWorld, w: GOAPWorld): boolean {
  return (pre.inRange ? w.inRange : true);
}

function applyEff(w: GOAPWorld, eff: Partial<GOAPWorld>): GOAPWorld {
  return { inRange: eff.inRange !== undefined ? eff.inRange : w.inRange };
}

function worldKey(w: GOAPWorld): string {
  return w.inRange ? 'R' : 'NR';
}

export class GOAPController implements AIDecisionPolicy {
  readonly kind: AIStrategy = 'GOAP';

  private _actions(self: Entity, p: AIPerception): GOAPAction[] {
    return [
      {
        name: 'Approach',
        pre: { inRange: false },
        eff: { inRange: true },
        build: () => ({ node: 'Chase', move: moveToward(self, p.targetX, p.targetY, 'Chase'), anim: 'Walk' }),
      },
      {
        name: 'Attack',
        pre: { inRange: true },
        eff: {},
        build: () => attackDecision('Attack'),
      },
    ];
  }

  // BFS for the shortest action sequence that satisfies the goal (inRange). Bounded depth 4.
  private _plan(start: GOAPWorld, actions: GOAPAction[]): GOAPActionName[] {
    if (start.inRange) return []; // goal already met -> caller issues Attack.
    const queue: { state: GOAPWorld; path: GOAPActionName[] }[] = [{ state: start, path: [] }];
    const seen = new Set<string>([worldKey(start)]);
    while (queue.length > 0) {
      const { state, path } = queue.shift() as { state: GOAPWorld; path: GOAPActionName[] };
      if (path.length >= 4) continue;
      for (const a of actions) {
        if (!satisfies(a.pre, state)) continue;
        const next = applyEff(state, a.eff);
        const k = worldKey(next);
        if (seen.has(k)) continue;
        seen.add(k);
        const np = [...path, a.name];
        if (next.inRange) return np; // reached goal
        queue.push({ state: next, path: np });
      }
    }
    return [];
  }

  decide(self: Entity, p: AIPerception): AIDecision {
    if (!p.targetAlive) return { node: 'Die', anim: 'Dead' };
    const dist = manhattan(self.gridX, self.gridY, p.targetX, p.targetY);
    const start: GOAPWorld = { inRange: dist <= ATTACK_RANGE };
    const actions = this._actions(self, p);
    const plan = this._plan(start, actions);
    if (plan.length === 0) {
      // Goal already satisfied (in range) -> attack directly.
      return attackDecision('Attack');
    }
    const first = actions.find((a) => a.name === plan[0]);
    return first ? first.build(self, p) : attackDecision('Attack');
  }
}

// ---------- Utility: score candidate actions, pick the best (deterministic tie-break) ----------
export class UtilityAIController implements AIDecisionPolicy {
  readonly kind: AIStrategy = 'Utility';

  decide(self: Entity, p: AIPerception): AIDecision {
    if (!p.targetAlive) return { node: 'Die', anim: 'Dead' };
    const dist = manhattan(self.gridX, self.gridY, p.targetX, p.targetY);

    const candidates: { node: AINode; score: number; decision: AIDecision }[] = [
      {
        node: 'Attack',
        score: dist <= ATTACK_RANGE ? 100 - dist : 0,
        decision: attackDecision('Attack'),
      },
      {
        node: 'Chase',
        score: dist > ATTACK_RANGE && dist <= CHASE_RANGE ? 80 - dist : 0,
        decision: { node: 'Chase', move: moveToward(self, p.targetX, p.targetY, 'Chase'), anim: 'Walk' },
      },
      {
        node: 'Patrol',
        score: dist > CHASE_RANGE ? 50 : 0,
        decision: { node: 'Patrol', anim: 'Idle' },
      },
    ];

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    return best.score > 0 ? best.decision : { node: 'Patrol', anim: 'Idle' };
  }
}
