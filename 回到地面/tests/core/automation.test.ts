// automation.test.ts — §5.11 automated-test infrastructure.
//
// Proves the test doubles (MockCollisionService / MockConfigDatabase) let logic unit tests run
// without the engine, covering the §5.11 categories:
//   - Seed     : same Rng seed -> identical sequence (determinism)
//   - Combat   : HitResolver/DamageResolver applied when explosion overlaps a target
//   - Skill    : SkillExecutor chain driven by MockCollisionService (no switch)
//   - (Dungeon already covered in room.test.ts; AI covered once IAIController lands, Demo6)
import { describe, it, expect } from 'vitest';
import { GameContext, ILogger, ICollisionService, IConfigDatabase } from '../../assets/scripts/core/GameContext';
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
