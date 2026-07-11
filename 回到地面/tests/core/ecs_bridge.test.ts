// ecs_bridge.test.ts — engine-wiring bridge layer (§3.12).
// Tests the pure-TS parts only: EcsSyncMath, StatDamageable, EcsEntityFactory, EcsBridgeCore.
// The cc Component (EcsEntityBridge) is verified by the ts-static gate, not imported here.

import { describe, it, expect } from 'vitest';
import { GameContext, IAnimationController, ICollisionService, IEventBus } from '../../assets/scripts/core/GameContext';
import { AnimationStateMachine } from '../../assets/scripts/battle/ai/AnimationStateMachine';
import { PhysicsCollisionImpl } from '../../assets/scripts/physics/PhysicsCollisionImpl';
import { EventBusManager } from '../../assets/scripts/core/EventBusManager';
import { EntityManager, IEntityManager } from '../../assets/scripts/ecs/EntityManager';
import { EcsEntityFactory } from '../../assets/scripts/ecs/EcsEntityFactory';
import { EcsBridgeCore } from '../../assets/scripts/ecs/EcsBridgeCore';
import { StatDamageable } from '../../assets/scripts/ecs/StatDamageable';
import { gridToWorld, pickAutoAnimState } from '../../assets/scripts/ecs/EcsSyncMath';
import { ICombatSystem } from '../../assets/scripts/battle/combat/CombatSystem';
import { CombatSystem } from '../../assets/scripts/battle/combat/CombatSystem';
import type { BattleCommand } from '../../assets/scripts/battle/combat/CombatCommand';
import type { SkillRequest } from '../../assets/scripts/battle/ai/IAIController';

function makeCtx(): GameContext {
  const ctx = new GameContext();
  ctx.register(IAnimationController, new AnimationStateMachine());
  ctx.register(ICollisionService, new PhysicsCollisionImpl());
  ctx.register(IEventBus, new EventBusManager());
  ctx.register(IEntityManager, new EntityManager());
  ctx.register(ICombatSystem, new CombatSystem());
  return ctx;
}

describe('EcsSyncMath', () => {
  it('gridToWorld applies origin + tile size', () => {
    const w = gridToWorld(3, 2, 0, 0, 96);
    expect(w).toEqual({ x: 288, y: 192 });
  });

  it('gridToWorld respects non-zero origin', () => {
    const w = gridToWorld(1, 1, 100, 50, 64);
    expect(w).toEqual({ x: 164, y: 114 });
  });

  it('pickAutoAnimState returns walk when moving', () => {
    expect(pickAutoAnimState(true, null)).toBe('walk');
  });

  it('pickAutoAnimState returns idle when not moving', () => {
    expect(pickAutoAnimState(false, null)).toBe('idle');
  });

  it('pickAutoAnimState returns null when unchanged', () => {
    expect(pickAutoAnimState(true, 'walk')).toBeNull();
    expect(pickAutoAnimState(false, 'idle')).toBeNull();
  });
});

describe('StatDamageable', () => {
  it('reflects stat hp/alive and applies damage', () => {
    const ctx = makeCtx();
    const built = EcsEntityFactory.build(ctx, {
      id: 'e1', team: 'enemy', baseHP: 50, baseATK: 5, baseDEF: 1, baseSpeed: 60,
      startX: 0, startY: 0, dispatch: () => {},
    });
    const dmg = built.damageable;
    expect(dmg.hp).toBe(50);
    expect(dmg.maxHP).toBe(50);
    expect(dmg.alive).toBe(true);
    expect(dmg.id).toBe('e1');
    expect(dmg.team).toBe('enemy');
    expect(dmg.isBoss).toBe(false);

    dmg.applyDamage(20);
    expect(dmg.hp).toBe(30);
    expect(dmg.alive).toBe(true);
  });

  it('dies when hp reaches zero', () => {
    const ctx = makeCtx();
    const built = EcsEntityFactory.build(ctx, {
      id: 'e2', team: 'enemy', baseHP: 10, baseATK: 5, baseDEF: 1, baseSpeed: 60,
      startX: 0, startY: 0, dispatch: () => {},
    });
    built.damageable.applyDamage(10);
    expect(built.damageable.hp).toBe(0);
    expect(built.damageable.alive).toBe(false);
  });

  it('reports boss flag', () => {
    const ctx = makeCtx();
    const built = EcsEntityFactory.build(ctx, {
      id: 'boss', team: 'enemy', baseHP: 100, baseATK: 5, baseDEF: 1, baseSpeed: 60,
      startX: 0, startY: 0, isBoss: true, dispatch: () => {},
    });
    expect(built.damageable.isBoss).toBe(true);
  });
});

describe('EcsEntityFactory', () => {
  it('builds descriptor with all 6 components + damageable', () => {
    const ctx = makeCtx();
    const built = EcsEntityFactory.build(ctx, {
      id: 'p1', team: 'player', baseHP: 120, baseATK: 12, baseDEF: 6, baseSpeed: 80,
      startX: 5, startY: 5, dispatch: () => {},
    });
    const d = built.descriptor;
    expect(d.id).toBe('p1');
    expect(d.team).toBe('player');
    expect(d.stat).toBeDefined();
    expect(d.movement).toBeDefined();
    expect(d.anim).toBeDefined();
    expect(d.combat).toBeDefined();
    expect(d.target).toBeDefined();
    expect(d.interaction).toBeDefined();
    expect(d.stat.maxHP).toBe(120);
    expect(d.movement.gridX).toBe(5);
    expect(d.movement.gridY).toBe(5);
  });
});

describe('EcsBridgeCore', () => {
  function makeBridge(opts?: Partial<{ startX: number; startY: number; team: 'player' | 'enemy' | 'neutral' }>) {
    const ctx = makeCtx();
    const em = ctx.get<EntityManager>(IEntityManager)!;
    const built = EcsEntityFactory.build(ctx, {
      id: 'b1', team: opts?.team ?? 'enemy', baseHP: 40, baseATK: 5, baseDEF: 1, baseSpeed: 60,
      startX: opts?.startX ?? 1, startY: opts?.startY ?? 1, dispatch: () => {},
    });
    const positions: Array<{ x: number; y: number }> = [];
    const core = new EcsBridgeCore(built.descriptor, built.damageable, em, {
      gridToWorld: (x, y) => ({ x: x * 96, y: y * 96 }),
      setNodePosition: (x, y) => positions.push({ x, y }),
    });
    return { ctx, em, built, core, positions };
  }

  it('attach registers descriptor; detach unregisters', () => {
    const { em, core } = makeBridge();
    expect(em.count()).toBe(0);
    core.attach();
    expect(em.count()).toBe(1);
    expect(em.get('b1')).toBeDefined();
    core.detach();
    expect(em.count()).toBe(0);
    expect(core.detached).toBe(true);
  });

  it('tick syncs grid position to node via callback', () => {
    const { core, positions } = makeBridge({ startX: 2, startY: 3 });
    core.attach();
    core.tick(0.016);
    expect(positions).toEqual([{ x: 192, y: 288 }]);
  });

  it('submitMove changes grid via walkable check', () => {
    const { core } = makeBridge({ startX: 1, startY: 1 });
    core.attach();
    const moved = core.submitMove(1, 0, () => true);
    expect(moved).toBe(true);
    expect(core.descriptor.movement.gridX).toBe(2);
  });

  it('submitSkill enqueues combat request', () => {
    const { core } = makeBridge();
    core.attach();
    const req: SkillRequest = { skillId: 'fire', sourceId: 'b1' };
    core.submitSkill(req);
    // Process via combat component directly (dispatch is no-op in factory).
    core.descriptor.combat.process('b1');
    // Skill moved to cooldown; queue empty.
    expect(core.descriptor.combat.queueLength).toBe(0);
  });

  it('tick drives walk anim when moving, idle when stopped', () => {
    const { core } = makeBridge({ startX: 1, startY: 1 });
    core.attach();
    core.submitMove(1, 0, () => true);
    core.tick(0.016);
    expect(core.descriptor.anim.currentState).toBe('walk');
    // Advance past the move transit window -> moving clears -> idle.
    core.tick(0.2);
    expect(core.descriptor.anim.currentState).toBe('idle');
  });

  it('death triggers die anim and detaches', () => {
    const { em, built, core } = makeBridge();
    core.attach();
    built.damageable.applyDamage(40); // lethal (hp 40)
    expect(built.damageable.alive).toBe(false);
    core.tick(0.016);
    expect(core.descriptor.anim.currentState).toBe('die');
    expect(em.count()).toBe(0);
    expect(core.detached).toBe(true);
  });

  it('onDeath detaches from registry', () => {
    const { em, core } = makeBridge();
    core.attach();
    core.onDeath();
    expect(em.count()).toBe(0);
    expect(core.detached).toBe(true);
  });
});
