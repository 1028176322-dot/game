// automation.test.ts — §5.11 automated-test infrastructure.
//
// Proves the test doubles (MockCollisionService / MockConfigDatabase) let logic unit tests run
// without the engine, covering the §5.11 categories:
//   - Seed     : same Rng seed -> identical sequence (determinism)
//   - Combat   : HitResolver/DamageResolver applied when explosion overlaps a target
//   - Skill    : SkillExecutor chain driven by MockCollisionService (no switch)
//   - (Dungeon already covered in room.test.ts; AI covered once IAIController lands, Demo6)
import { describe, it, expect } from 'vitest';
import { GameContext, ILogger, ICollisionService, IConfigDatabase, IAnimationController } from '../../assets/scripts/core/GameContext';
import { Logger } from '../../assets/scripts/core/Logger';
import { SkillGraph, ISkillGraph } from '../../assets/scripts/battle/skill/SkillGraph';
import { SkillExecutor, ISkillExecutor } from '../../assets/scripts/battle/skill/SkillExecutor';
import { ALL_MASK, Collider, Vec3 } from '../../assets/scripts/physics/ICollisionService';
import type { Damageable, SkillCaster, SkillData } from '../../assets/scripts/battle/skill/SkillData';
import { Rng } from '../../assets/scripts/core/rng/Rng';
import { MockCollisionService } from '../support/MockCollisionService';
import { MockConfigDatabase } from '../support/MockConfigDatabase';
import { AudioSystem, MemoryAudioSink } from '../../assets/scripts/audio/AudioSystem';
import { IAudioService } from '../../assets/scripts/core/GameContext';
import { AIController } from '../../assets/scripts/battle/ai/AIController';
import { AnimationStateMachine, IAnimationController as IAnimController } from '../../assets/scripts/battle/ai/AnimationStateMachine';
import type { Entity, AIPerception, MoveCommand, SkillRequest, AIAnimState } from '../../assets/scripts/battle/ai/IAIController';

class MockDamageable implements Damageable {
  damageEvents: { amount: number; source?: string }[] = [];
  burnEvents: { dps: number; duration: number; source?: string }[] = [];
  applyDamage(amount: number, source?: string): void {
    this.damageEvents.push({ amount, source });
  }
  applyBurn(dps: number, duration: number, source?: string): void {
    this.burnEvents.push({ dps, duration, source });
  }
}

const AIM: Vec3 = { x: 0, y: 0, z: 0 };

function fireball(id: string): SkillData {
  return {
    id,
    projectile: { speed: 12, radius: 0.6, duration: 3 },
    onHit: { damage: 30, effect: 'burn', burn: { dps: 5, duration: 3 } },
  };
}

describe('§5.11 Seed determinism (Rng)', () => {
  it('same seed produces identical sequences', () => {
    const a = new Rng(777);
    const b = new Rng(777);
    const seqA: number[] = [];
    const seqB: number[] = [];
    for (let i = 0; i < 10; i++) {
      seqA.push(a.next());
      seqB.push(b.next());
    }
    expect(seqA).toEqual(seqB);
  });

  it('fork is deterministic for a given label', () => {
    const f1 = new Rng(42).fork('combat');
    const f2 = new Rng(42).fork('combat');
    expect(f1.int(1, 100)).toBe(f2.int(1, 100));
  });
});

describe('§5.11 Combat/Skill via MockCollisionService', () => {
  it('explosion hit applies damage + burn without a real engine', () => {
    const ctx = new GameContext();
    ctx.register(ILogger, new Logger(true));
    const collision = new MockCollisionService();
    ctx.register(ICollisionService, collision);

    const graph = new SkillGraph();
    const executor = new SkillExecutor();
    ctx.register(ISkillGraph, graph);
    ctx.register(ISkillExecutor, executor);
    graph.initialize(ctx);
    executor.initialize(ctx);

    const target = new MockDamageable();
    const col: Collider & { owner: Damageable } = {
      id: 't1',
      position: AIM,
      radius: 0.5,
      halfHeight: 0,
      mask: ALL_MASK,
      enabled: true,
      owner: target,
    };
    // fireball explosion radius = projectile.radius = 0.6 (see SkillGraph.build)
    collision.setOverlap(0.6, [col]);

    const caster: SkillCaster = { id: 'player', position: { x: 0, y: 0, z: -5 } };
    executor.execute(fireball('fireball'), caster, AIM);

    expect(target.damageEvents).toEqual([{ amount: 30, source: 'player' }]);
    expect(target.burnEvents).toEqual([{ dps: 5, duration: 3, source: 'player' }]);
    // The executor asked the collision service for the explosion overlap.
    expect(collision.calls.some((c) => c.startsWith('overlapSphere'))).toBe(true);
  });
});

describe('§5.11 config-driven via MockConfigDatabase', () => {
  it('AudioSystem volume comes from injected config source', () => {
    const ctx = new GameContext();
    const db = new MockConfigDatabase();
    db.setAudio('hit', { id: 'hit', category: 'sfx', volume: 0.25, loop: false });
    ctx.register(IConfigDatabase, db);
    const sink = new MemoryAudioSink();
    const audio = new AudioSystem(sink);
    ctx.register(IAudioService, audio);
    audio.initialize(ctx);

    audio.playSfx('hit');
    expect(sink.plays[0].effectiveVolume).toBeCloseTo(0.25, 5);
  });
});

// ---- §5.11 AI test class (IAIController, Demo6 / §3.10) ----
// Proves the four pluggable strategies (BT / FSM / GOAP / Utility) each produce the expected
// MoveCommand / SkillRequest without touching position or HP (combat layering, §2.5), and that
// the animation state machine (§3.5) is driven via IAnimationController — all without the engine.

class MockEntity implements Entity {
  id = 'm1';
  gridX: number;
  gridY: number;
  perception: AIPerception;
  moves: MoveCommand[] = [];
  skills: SkillRequest[] = [];

  constructor(gx: number, gy: number, p: AIPerception) {
    this.gridX = gx;
    this.gridY = gy;
    this.perception = p;
  }
  submitMove(cmd: MoveCommand): void {
    this.moves.push(cmd);
  }
  submitSkill(req: SkillRequest): void {
    this.skills.push(req);
  }
}

class MockAnimationController implements IAnimController {
  states: AIAnimState[] = [];
  clips: string[] = [];
  private _state: AIAnimState = 'Idle';
  get currentState(): AIAnimState {
    return this._state;
  }
  setState(s: AIAnimState): void {
    this._state = s;
    this.states.push(s);
  }
  play(c: string): void {
    this.clips.push(c);
  }
}

describe('§5.11 AI via IAIController (BT/FSM/GOAP/Utility)', () => {
  function mkCtx(anim: IAnimController): GameContext {
    const ctx = new GameContext();
    ctx.register(IAnimationController, anim);
    return ctx;
  }

  it('BT default: adjacent target -> SkillRequest(melee), anim=Attack', () => {
    const anim = new MockAnimationController();
    const self = new MockEntity(5, 5, { targetX: 5, targetY: 5, targetAlive: true }); // dist 0
    const ai = new AIController();
    ai.initialize(mkCtx(anim), self);
    ai.update(0.016);

    expect(self.skills).toEqual([{ skillId: 'melee_attack', reason: 'Attack' }]);
    expect(self.moves.length).toBe(0);
    expect(anim.currentState).toBe('Attack');
    const dbg = ai.getDebugState();
    expect(dbg.node).toBe('Attack');
    expect(dbg.hasTarget).toBe(true);
    expect(dbg.targetDistance).toBe(0);
  });

  it('BT: target in chase range -> MoveCommand toward target, anim=Walk', () => {
    const anim = new MockAnimationController();
    const self = new MockEntity(2, 2, { targetX: 5, targetY: 2, targetAlive: true }); // dist 3
    const ai = new AIController();
    ai.initialize(mkCtx(anim), self);
    ai.update(0.016);

    expect(self.moves).toEqual([{ dx: 1, dy: 0, reason: 'Chase' }]);
    expect(self.skills.length).toBe(0);
    expect(anim.currentState).toBe('Walk');
    expect(ai.getDebugState().node).toBe('Chase');
  });

  it('BT: target far -> Patrol, no command, anim=Idle', () => {
    const anim = new MockAnimationController();
    const self = new MockEntity(0, 0, { targetX: 10, targetY: 0, targetAlive: true }); // dist 10
    const ai = new AIController();
    ai.initialize(mkCtx(anim), self);
    ai.update(0.016);

    expect(self.moves.length).toBe(0);
    expect(self.skills.length).toBe(0);
    expect(anim.currentState).toBe('Idle');
    expect(ai.getDebugState().node).toBe('Patrol');
  });

  it('BT: dead target -> Die, anim=Dead, no command', () => {
    const anim = new MockAnimationController();
    const self = new MockEntity(5, 5, { targetX: 5, targetY: 5, targetAlive: false });
    const ai = new AIController();
    ai.initialize(mkCtx(anim), self);
    ai.update(0.016);

    expect(self.moves.length).toBe(0);
    expect(self.skills.length).toBe(0);
    expect(anim.currentState).toBe('Dead');
    const dbg = ai.getDebugState();
    expect(dbg.node).toBe('Die');
    expect(dbg.hasTarget).toBe(false);
  });

  it('setStrategy switches FSM/GOAP/Utility and rejects unknown', () => {
    // FSM at dist 3 -> Chase move
    const aiF = new AIController();
    const animF = new MockAnimationController();
    aiF.initialize(mkCtx(animF), new MockEntity(2, 2, { targetX: 5, targetY: 2, targetAlive: true }));
    aiF.setStrategy('FSM');
    aiF.update(0.016);
    expect(aiF.getDebugState().strategy).toBe('FSM');
    expect(aiF.getDebugState().node).toBe('Chase');
    expect(animF.currentState).toBe('Walk');

    // GOAP at dist 3 (not in range) -> plan [Approach] -> Chase move
    const aiG = new AIController();
    const animG = new MockAnimationController();
    aiG.initialize(mkCtx(animG), new MockEntity(2, 2, { targetX: 5, targetY: 2, targetAlive: true }));
    aiG.setStrategy('GOAP');
    aiG.update(0.016);
    expect(aiG.getDebugState().strategy).toBe('GOAP');
    expect(aiG.getDebugState().node).toBe('Chase');
    expect(animG.currentState).toBe('Walk');

    // GOAP at dist 0 (in range) -> goal met -> Attack directly
    const aiG2 = new AIController();
    const animG2 = new MockAnimationController();
    aiG2.initialize(mkCtx(animG2), new MockEntity(5, 5, { targetX: 5, targetY: 5, targetAlive: true }));
    aiG2.setStrategy('GOAP');
    aiG2.update(0.016);
    expect(aiG2.getDebugState().node).toBe('Attack');

    // Utility at dist 1 -> Attack skill
    const aiU = new AIController();
    const animU = new MockAnimationController();
    aiU.initialize(mkCtx(animU), new MockEntity(5, 5, { targetX: 5, targetY: 5, targetAlive: true }));
    aiU.setStrategy('Utility');
    aiU.update(0.016);
    expect(aiU.getDebugState().strategy).toBe('Utility');
    expect(aiU.getDebugState().node).toBe('Attack');

    // unknown strategy throws
    const aiX = new AIController();
    aiX.initialize(mkCtx(new MockAnimationController()), new MockEntity(0, 0, { targetX: 0, targetY: 0, targetAlive: true }));
    expect(() => aiX.setStrategy('NOPE' as never)).toThrow();
  });

  it('update before initialize throws', () => {
    const ai = new AIController();
    expect(() => ai.update(0.016)).toThrow();
  });

  it('ILifecycle destroy clears state and blocks further update', () => {
    const anim = new MockAnimationController();
    const ai = new AIController();
    ai.initialize(mkCtx(anim), new MockEntity(5, 5, { targetX: 5, targetY: 5, targetAlive: true }));
    ai.update(0.016);
    expect(ai.getDebugState().node).toBe('Attack');
    ai.destroy();
    expect(ai.initialized).toBe(false);
    expect(() => ai.update(0.016)).toThrow();
  });
});

describe('§5.11 AnimationStateMachine (§3.5)', () => {
  it('valid transitions accepted; Dead terminal; invalid rejected', () => {
    const sm = new AnimationStateMachine();
    expect(sm.currentState).toBe('Idle');
    sm.setState('Walk');
    sm.setState('Attack');
    sm.setState('Dead');
    expect(sm.currentState).toBe('Dead');
    // Dead is terminal.
    sm.setState('Idle');
    expect(sm.currentState).toBe('Dead');
    expect(sm.history).toEqual(['Walk', 'Attack', 'Dead']);
  });

  it('multi-step valid chain; Attack->Skill rejected (not adjacent)', () => {
    const sm = new AnimationStateMachine();
    sm.setState('Walk');
    sm.setState('Skill'); // Walk->Skill valid
    sm.setState('Idle'); // Skill->Idle valid
    sm.setState('HitStun'); // Idle->HitStun valid
    sm.setState('Attack'); // HitStun->Attack valid
    sm.setState('Skill'); // Attack->Skill invalid -> rejected
    expect(sm.currentState).toBe('Attack');
    expect(sm.history).toEqual(['Walk', 'Skill', 'Idle', 'HitStun', 'Attack']);
  });

  it('play records clips; ILifecycle reset on destroy', () => {
    const sm = new AnimationStateMachine();
    sm.play('SkillA');
    expect(sm.clips).toEqual(['SkillA']);
    sm.initialize({} as GameContext);
    sm.destroy();
    expect(sm.currentState).toBe('Idle');
    expect(sm.clips.length).toBe(0);
  });
});
