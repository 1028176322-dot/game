import { describe, it, expect } from 'vitest';
import { GameContext, ILogger, ICollisionService } from '../../assets/scripts/core/GameContext';
import { Logger } from '../../assets/scripts/core/Logger';
import { LifecycleManager } from '../../assets/scripts/core/LifecycleManager';
import { PhysicsCollisionImpl } from '../../assets/scripts/physics/PhysicsCollisionImpl';
import { ALL_MASK, Collider, Vec3 } from '../../assets/scripts/physics/ICollisionService';
import { SkillGraph, ISkillGraph } from '../../assets/scripts/battle/skill/SkillGraph';
import { SkillExecutor, ISkillExecutor } from '../../assets/scripts/battle/skill/SkillExecutor';
import type { Damageable, SkillCaster, SkillData } from '../../assets/scripts/battle/skill/SkillData';

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

function wire(): { ctx: GameContext; collision: PhysicsCollisionImpl; executor: SkillExecutor } {
  const ctx = new GameContext();
  ctx.register(ILogger, new Logger(true));
  const collision = new PhysicsCollisionImpl();
  ctx.register(ICollisionService, collision);

  const graph = new SkillGraph();
  ctx.register(ISkillGraph, graph);
  const executor = new SkillExecutor();
  ctx.register(ISkillExecutor, executor);

  const lifecycle = new LifecycleManager();
  lifecycle.register(graph);
  lifecycle.register(executor);
  graph.initialize(ctx);
  executor.initialize(ctx);
  return { ctx, collision, executor };
}

describe('Demo4 SkillGraph / SkillExecutor', () => {
  it('builds a data-driven node chain without switch on skillId', () => {
    const graph = new SkillGraph();
    const nodes = graph.build(fireball('fireball'));
    expect(nodes.map((n) => n.kind)).toEqual(['projectile', 'explosion', 'burn']);

    // Different id, identical shape -> identical node chain (proves data-driven, not id-based).
    expect(graph.build(fireball('frostbolt')).map((n) => n.kind)).toEqual([
      'projectile',
      'explosion',
      'burn',
    ]);
  });

  it('adds an explosion-only chain when there is no projectile', () => {
    const graph = new SkillGraph();
    const nova: SkillData = { id: 'nova', onHit: { damage: 50, effect: 'shock' } };
    expect(graph.build(nova).map((n) => n.kind)).toEqual(['explosion']);
  });

  it('executes a skill: explosion hits via ICollisionService, damage + burn applied', () => {
    const { collision, executor } = wire();

    const target = new MockDamageable();
    const col: Collider & { owner: Damageable } = {
      id: 't1',
      position: AIM,
      radius: 0.5,
      enabled: true,
      mask: ALL_MASK,
      owner: target,
    };
    collision.registerCollider(col);

    const caster: SkillCaster = { id: 'player', position: { x: 0, y: 0, z: -5 } };
    executor.execute(fireball('fireball'), caster, AIM);

    expect(target.damageEvents).toEqual([{ amount: 30, source: 'player' }]);
    expect(target.burnEvents).toEqual([{ dps: 5, duration: 3, source: 'player' }]);
  });

  it('explosion only hits colliders within radius (position aware)', () => {
    const { collision, executor } = wire();

    const near = new MockDamageable();
    const far = new MockDamageable();
    const nearCol: Collider & { owner: Damageable } = {
      id: 'near',
      position: { x: 0.3, y: 0, z: 0 },
      radius: 0.3,
      enabled: true,
      mask: ALL_MASK,
      owner: near,
    };
    const farCol: Collider & { owner: Damageable } = {
      id: 'far',
      position: { x: 100, y: 0, z: 0 },
      radius: 0.3,
      enabled: true,
      mask: ALL_MASK,
      owner: far,
    };
    collision.registerCollider(nearCol);
    collision.registerCollider(farCol);

    const caster: SkillCaster = { id: 'player', position: { x: 0, y: 0, z: -5 } };
    executor.execute(fireball('fireball'), caster, AIM);

    expect(near.damageEvents.length).toBe(1);
    expect(far.damageEvents.length).toBe(0);
  });

  it('is deterministic: same input yields identical output across runs', () => {
    const targetA = new MockDamageable();
    const targetB = new MockDamageable();
    {
      const { collision, executor } = wire();
      const col: Collider & { owner: Damageable } = {
        id: 't',
        position: AIM,
        radius: 0.5,
        enabled: true,
        mask: ALL_MASK,
        owner: targetA,
      };
      collision.registerCollider(col);
      executor.execute(fireball('fireball'), { id: 'player', position: AIM }, AIM);
    }
    {
      const { collision, executor } = wire();
      const col: Collider & { owner: Damageable } = {
        id: 't',
        position: AIM,
        radius: 0.5,
        enabled: true,
        mask: ALL_MASK,
        owner: targetB,
      };
      collision.registerCollider(col);
      executor.execute(fireball('fireball'), { id: 'player', position: AIM }, AIM);
    }
    expect(targetA.damageEvents).toEqual(targetB.damageEvents);
    expect(targetA.burnEvents).toEqual(targetB.burnEvents);
  });
});
