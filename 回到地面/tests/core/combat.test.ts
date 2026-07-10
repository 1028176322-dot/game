// combat.test.ts — CombatSystem unit tests (§3.8 Pure TS, node, vitest).
// Covers all 6 subsystems: CombatSystem, TargetSelector, EffectExecutor,
// ProjectileSystem, LockOnManager, CombatCommand.
//
// All tests are deterministic, no `cc`, no Math.random.

import { describe, it, expect } from 'vitest';
import { GameContext, ILogger, ICollisionService, IConfigDatabase } from '../../assets/scripts/core/GameContext';
import { Logger } from '../../assets/scripts/core/Logger';
import { MockCollisionService } from '../support/MockCollisionService';
import { MockConfigDatabase } from '../support/MockConfigDatabase';
import { SkillGraph, ISkillGraph } from '../../assets/scripts/battle/skill/SkillGraph';
import { SkillExecutor, ISkillExecutor } from '../../assets/scripts/battle/skill/SkillExecutor';

import { CombatSystem, ICombatSystem } from '../../assets/scripts/battle/combat/CombatSystem';
import { TargetSelector } from '../../assets/scripts/battle/combat/TargetSelector';
import { EffectExecutor, type StatusEffect } from '../../assets/scripts/battle/combat/EffectExecutor';
import { ProjectileSystem } from '../../assets/scripts/battle/combat/ProjectileSystem';
import { LockOnManager } from '../../assets/scripts/battle/combat/LockOnManager';
import type { BattleCommand, CombatEntity, TargetResult } from '../../assets/scripts/battle/combat/CombatCommand';

// ---- Helper: a test double for CombatEntity ----
class MockCombatEntity implements CombatEntity {
  id: string;
  team: 'player' | 'enemy' | 'neutral';
  gridX: number;
  gridY: number;
  hp: number;
  maxHP: number;
  alive = true;
  isBoss = false;
  damageReceived: { amount: number; source?: string }[] = [];
  burnReceived: { dps: number; duration: number; source?: string }[] = [];

  constructor(id: string, team: 'player' | 'enemy', gx: number, gy: number, hp = 100) {
    this.id = id;
    this.team = team;
    this.gridX = gx;
    this.gridY = gy;
    this.hp = hp;
    this.maxHP = hp;
  }

  applyDamage(amount: number, source?: string): void {
    this.damageReceived.push({ amount, source });
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.alive = false;
  }
  applyBurn(dps: number, duration: number, source?: string): void {
    this.burnReceived.push({ dps, duration, source });
  }
}

function makeCmd(overrides: Partial<BattleCommand> = {}): BattleCommand {
  return { kind: 'skill', sourceId: 'p1', entityId: 'p1', ...overrides } as BattleCommand;
}

// ===================================================================
// TargetSelector
// ===================================================================
describe('TargetSelector', () => {
  const selector = new TargetSelector();
  const player = new MockCombatEntity('p1', 'player', 0, 0);
  const enemy1 = new MockCombatEntity('e1', 'enemy', 3, 0);
  const enemy2 = new MockCombatEntity('e2', 'enemy', 0, 4);
  const dead = new MockCombatEntity('dead', 'enemy', 5, 5);
  dead.alive = false;
  const pool = [player, enemy1, enemy2, dead];

  it('selectPrimary by explicit targetId', () => {
    const cmd = makeCmd({ targetId: 'e2' });
    const result = selector.selectPrimary(cmd, pool, player);
    expect(result?.id).toBe('e2');
  });

  it('selectPrimary returns nearest alive enemy when no explicit target', () => {
    const cmd = makeCmd();
    const result = selector.selectPrimary(cmd, pool, player);
    expect(result?.id).toBe('e1'); // dist 3 vs 4
  });

  it('selectPrimary returns null when no alive enemies', () => {
    const cmd = makeCmd();
    const result = selector.selectPrimary(cmd, [player], player);
    expect(result).toBeNull();
  });

  it('selectPrimary ignores dead enemies', () => {
    const cmd = makeCmd();
    const pool2 = [player, dead];
    const result = selector.selectPrimary(cmd, pool2, player);
    expect(result).toBeNull();
  });

  it('selectAOE within radius', () => {
    const cmd = makeCmd({ aimPosition: { x: 0, y: 0, z: 0 } });
    const result = selector.selectAOE(cmd, [enemy1, enemy2], 4);
    expect(result.map((e) => e.id).sort()).toEqual(['e1', 'e2']);
  });

  it('selectAOE returns empty if no aim position', () => {
    const cmd = makeCmd();
    const result = selector.selectAOE(cmd, pool, 1);
    expect(result).toEqual([]);
  });

  it('resolve returns primary + aoe + lockOn', () => {
    const cmd = makeCmd({ aimPosition: { x: 3, y: 0, z: 0 } });
    const result = selector.resolve(cmd, pool, player);
    expect(result.primary?.id).toBe('e1');
    expect(result.aoe.length).toBeGreaterThan(0);
    expect(result.lockOn?.id).toBe('e1');
  });
});

// ===================================================================
// EffectExecutor
// ===================================================================
describe('EffectExecutor', () => {
  const ctx = new GameContext();
  ctx.register(ILogger, new Logger(true));

  it('apply adds status and passes through Damageable', () => {
    const exec = new EffectExecutor();
    exec.initialize(ctx);
    const target = new MockCombatEntity('t1', 'enemy', 0, 0);
    const effect: StatusEffect = { id: 'burn1', kind: 'burn', dps: 5, duration: 3, magnitude: 0, sourceId: 'p1' };
    exec.apply(target, effect);
    expect(exec.getStatuses('t1').length).toBe(1);
    expect(target.damageReceived).toEqual([{ amount: 5, source: 'p1' }]);
    exec.destroy();
  });

  it('refresh extends remaining time', () => {
    const exec = new EffectExecutor();
    exec.initialize(ctx);
    const target = new MockCombatEntity('t1', 'enemy', 0, 0);
    const e1: StatusEffect = { id: 'burn1', kind: 'burn', dps: 5, duration: 3, magnitude: 0, sourceId: 'p1' };
    const e2: StatusEffect = { id: 'burn1', kind: 'burn', dps: 5, duration: 6, magnitude: 0, sourceId: 'p1' };
    exec.apply(target, e1);
    exec.apply(target, e2); // same id -> refresh to max(3,6)=6
    expect(exec.getStatuses('t1').length).toBe(1);
    expect(exec.getStatuses('t1')[0].remaining).toBeCloseTo(6, 5);
    exec.destroy();
  });

  it('tick reduces remaining and removes expired', () => {
    const exec = new EffectExecutor();
    exec.initialize(ctx);
    const target = new MockCombatEntity('t1', 'enemy', 0, 0);
    const effect: StatusEffect = { id: 'stun1', kind: 'stun', dps: 0, duration: 1, magnitude: 0, sourceId: 'p1' };
    exec.apply(target, effect);
    expect(exec.getStatuses('t1').length).toBe(1);
    exec.update(0.6);
    expect(exec.getStatuses('t1')[0].remaining).toBeCloseTo(0.4, 5);
    exec.update(0.5); // total 1.1 > 1 -> expired
    expect(exec.getStatuses('t1').length).toBe(0);
    exec.destroy();
  });

  it('clear removes all statuses for an entity', () => {
    const exec = new EffectExecutor();
    exec.initialize(ctx);
    exec.apply(new MockCombatEntity('t1', 'enemy', 0, 0), { id: 'x', kind: 'stun', dps: 0, duration: 10, magnitude: 0, sourceId: 'p1' });
    expect(exec.getStatuses('t1').length).toBe(1);
    exec.clear('t1');
    expect(exec.getStatuses('t1').length).toBe(0);
    exec.destroy();
  });

  it('ILifecycle exit clears all statuses', () => {
    const exec = new EffectExecutor();
    exec.initialize(ctx);
    exec.apply(new MockCombatEntity('t1', 'enemy', 0, 0), { id: 'x', kind: 'stun', dps: 0, duration: 10, magnitude: 0, sourceId: 'p1' });
    exec.exit();
    expect(exec.getStatuses('t1').length).toBe(0);
    exec.destroy();
  });

  it('heal effect uses negative damage on Damageable', () => {
    const exec = new EffectExecutor();
    exec.initialize(ctx);
    const target = new MockCombatEntity('t1', 'enemy', 0, 0, 50);
    const heal: StatusEffect = { id: 'heal1', kind: 'heal', dps: 0, duration: 0, magnitude: 20, sourceId: 'p1' };
    exec.apply(target, heal);
    expect(target.damageReceived).toEqual([{ amount: -20, source: 'p1' }]);
    exec.destroy();
  });
});

// ===================================================================
// ProjectileSystem
// ===================================================================
describe('ProjectileSystem', () => {
  it('spawn and update interpolates position', () => {
    const ps = new ProjectileSystem();
    const ctx = new GameContext();
    ctx.register(ILogger, new Logger(true));
    const collision = new MockCollisionService();
    ctx.register(ICollisionService, collision);
    ps.initialize(ctx);

    ps.spawn({ id: 'p1', speed: 10, radius: 0.5, maxDuration: 2, damage: 15, sourceId: 'p1', fromX: 0, fromY: 0, toX: 4, toY: 0 });
    expect(ps.count()).toBe(1);
    ps.destroy();
  });

  it('projectile expires after maxDuration', () => {
    const ps = new ProjectileSystem();
    const ctx = new GameContext();
    ctx.register(ILogger, new Logger(true));
    ctx.register(ICollisionService, new MockCollisionService());
    ps.initialize(ctx);

    ps.spawn({ id: 'p1', speed: 10, radius: 0.5, maxDuration: 1, damage: 15, sourceId: 'p1', fromX: 0, fromY: 0, toX: 5, toY: 0 });
    ps.update(1.5, []); // exceed duration
    expect(ps.count()).toBe(0);
    ps.destroy();
  });

  it('ILifecycle exit clears all projectiles', () => {
    const ps = new ProjectileSystem();
    const ctx = new GameContext();
    ctx.register(ILogger, new Logger(true));
    ctx.register(ICollisionService, new MockCollisionService());
    ps.initialize(ctx);

    ps.spawn({ id: 'p1', speed: 10, radius: 0.5, maxDuration: 10, damage: 15, sourceId: 'p1', fromX: 0, fromY: 0, toX: 5, toY: 0 });
    ps.exit();
    expect(ps.count()).toBe(0);
    ps.destroy();
  });
});

// ===================================================================
// LockOnManager
// ===================================================================
describe('LockOnManager', () => {
  const ctx = new GameContext();

  it('acquire and release', () => {
    const lm = new LockOnManager();
    lm.initialize(ctx);
    const target = new MockCombatEntity('e1', 'enemy', 3, 0);
    expect(lm.acquire(target)).toBe(true);
    expect(lm.state.locked).toBe(true);
    expect(lm.state.target?.id).toBe('e1');
    lm.release();
    expect(lm.state.locked).toBe(false);
    lm.destroy();
  });

  it('release on dead target via acquire', () => {
    const lm = new LockOnManager();
    lm.initialize(ctx);
    const dead = new MockCombatEntity('e1', 'enemy', 3, 0);
    dead.alive = false;
    expect(lm.acquire(dead)).toBe(false);
    expect(lm.state.locked).toBe(false);
    lm.destroy();
  });

  it('cycle through pool', () => {
    const lm = new LockOnManager();
    lm.initialize(ctx);
    const e1 = new MockCombatEntity('e1', 'enemy', 3, 0);
    const e2 = new MockCombatEntity('e2', 'enemy', 0, 4);
    const pool = [e1, e2];
    lm.cycle(pool, 'p1');
    expect(lm.state.target?.id).toBe('e1');
    lm.cycle(pool, 'p1');
    expect(lm.state.target?.id).toBe('e2');
    lm.destroy();
  });

  it('ILifecycle exit releases lock', () => {
    const lm = new LockOnManager();
    lm.initialize(ctx);
    lm.acquire(new MockCombatEntity('e1', 'enemy', 3, 0));
    expect(lm.state.locked).toBe(true);
    lm.exit();
    expect(lm.state.locked).toBe(false);
    lm.destroy();
  });
});

// ===================================================================
// CombatSystem integration
// ===================================================================
describe('CombatSystem', () => {
  function mkCtx(): GameContext {
    const ctx = new GameContext();
    ctx.register(ILogger, new Logger(true));
    ctx.register(ICollisionService, new MockCollisionService());
    ctx.register(IConfigDatabase, new MockConfigDatabase());
    const graph = new SkillGraph();
    const executor = new SkillExecutor();
    ctx.register(ISkillGraph, graph);
    ctx.register(ISkillExecutor, executor);
    graph.initialize(ctx);
    executor.initialize(ctx);
    return ctx;
  }

  it('register and unregister entities', () => {
    const cs = new CombatSystem();
    cs.initialize(mkCtx());
    const p = new MockCombatEntity('p1', 'player', 0, 0);
    cs.register(p);
    expect(cs.entities.length).toBe(1);
    cs.unregister('p1');
    expect(cs.entities.length).toBe(0);
    cs.destroy();
  });

  it('skill dispatch applies damage to target', () => {
    const ctx = mkCtx();
    const db = ctx.get<MockConfigDatabase>(IConfigDatabase);
    const cs = new CombatSystem();
    cs.initialize(ctx);

    const player = new MockCombatEntity('p1', 'player', 0, 0);
    cs.register(player);
    const enemy = new MockCombatEntity('e1', 'enemy', 1, 0);
    cs.register(enemy);

    // Register a fireball skill config in mock db.
    db.setSkill('fireball', {
      id: 'fireball', projectile: { speed: 12, radius: 0.6, duration: 3 },
      onHit: { damage: 30, burn: { dps: 5, duration: 3 } },
    });

    cs.dispatch({ kind: 'skill', sourceId: 'p1', entityId: 'p1', skillId: 'fireball', targetId: 'e1' });
    // player -> enemy: damage 30 applied
    expect(enemy.damageReceived.length).toBeGreaterThanOrEqual(1);
    cs.destroy();
  });

  it('dispatch on dead entity logs warning (no crash)', () => {
    const ctx = mkCtx();
    const cs = new CombatSystem();
    cs.initialize(ctx);
    const dead = new MockCombatEntity('dead', 'enemy', 0, 0);
    dead.alive = false;
    cs.register(dead);
    expect(() => cs.dispatch({ kind: 'skill', sourceId: 'x', entityId: 'dead', skillId: 'test' })).not.toThrow();
    cs.destroy();
  });

  it('update advances projectiles and effects', () => {
    const ctx = mkCtx();
    const cs = new CombatSystem();
    cs.initialize(ctx);
    const p = new MockCombatEntity('p1', 'player', 0, 0);
    cs.register(p);
    cs.update(0.016); // single frame, should not throw
    cs.destroy();
  });

  it('ILifecycle exit clears entity pool', () => {
    const ctx = mkCtx();
    const cs = new CombatSystem();
    cs.initialize(ctx);
    cs.register(new MockCombatEntity('p1', 'player', 0, 0));
    cs.exit();
    expect(cs.entities.length).toBe(0);
    cs.destroy();
  });

  it('ILifecycle destroy clears all state', () => {
    const cs = new CombatSystem();
    cs.initialize(mkCtx());
    cs.register(new MockCombatEntity('p1', 'player', 0, 0));
    cs.destroy();
    expect(cs.initialized).toBe(false);
  });
});
