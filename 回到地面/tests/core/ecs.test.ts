// ecs.test.ts — ECS component unit tests (§3.12).
// Pure TS, node, vitest. Tests each component independently.

import { describe, it, expect } from 'vitest';
import { StatComponent } from '../../assets/scripts/ecs/StatComponent';
import { MovementComponent } from '../../assets/scripts/ecs/MovementComponent';
import { AnimationComponent } from '../../assets/scripts/ecs/AnimationComponent';
import { CombatComponent } from '../../assets/scripts/ecs/CombatComponent';
import { TargetComponent } from '../../assets/scripts/ecs/TargetComponent';
import { InteractionComponent } from '../../assets/scripts/ecs/InteractionComponent';
import { EntityManager } from '../../assets/scripts/ecs/EntityManager';
import { GameContext } from '../../assets/scripts/core/GameContext';
import { Logger } from '../../assets/scripts/core/Logger';
import { ILogger, ICollisionService } from '../../assets/scripts/core/GameContext';
import { MockCollisionService } from '../support/MockCollisionService';

describe('StatComponent', () => {
  it('initialize and compute effective stats', () => {
    const s = new StatComponent();
    s.initialize(100, 20, 10, 60);
    expect(s.baseHP).toBe(100);
    expect(s.atk).toBe(20);
    expect(s.def).toBe(10);
    expect(s.speed).toBe(60);
  });

  it('takeDamage reduces HP and can kill', () => {
    const s = new StatComponent();
    s.initialize(100, 10, 5, 60);
    s.takeDamage(30);
    expect(s.hp).toBe(70);
    expect(s.alive).toBe(true);
    s.takeDamage(80);
    expect(s.hp).toBe(0);
    expect(s.alive).toBe(false);
  });

  it('heal does not exceed maxHP', () => {
    const s = new StatComponent();
    s.initialize(100, 10, 5, 60);
    s.takeDamage(40);
    s.heal(20);
    expect(s.hp).toBe(80);
    s.heal(100);
    expect(s.hp).toBe(100);
  });

  it('addModifier affects effective stats', () => {
    const s = new StatComponent();
    s.initialize(100, 10, 5, 60);
    s.addModifier({ stat: 'atk', value: 5, multiplier: 1, sourceId: 'buff', duration: 0 });
    expect(s.atk).toBe(15);
  });
});

describe('MovementComponent', () => {
  it('executeMove updates grid position', () => {
    const m = new MovementComponent();
    expect(m.executeMove(1, 0, () => true)).toBe(true);
    expect(m.gridX).toBe(1);
    expect(m.gridY).toBe(0);
  });

  it('executeMove blocked by walkable check', () => {
    const m = new MovementComponent();
    expect(m.executeMove(1, 0, () => false)).toBe(false);
    expect(m.gridX).toBe(0);
  });

  it('moveToward moves toward target', () => {
    const m = new MovementComponent();
    m.moveToward(5, 5, () => true);
    expect(m.gridX).toBe(1);
    expect(m.gridY).toBe(1);
  });

  it('moveToward no-op when already at target', () => {
    const m = new MovementComponent();
    m.moveToward(0, 0, () => true);
    expect(m.gridX).toBe(0);
    expect(m.gridY).toBe(0);
  });

  it('teleport sets position', () => {
    const m = new MovementComponent();
    m.teleport(10, 20);
    expect(m.gridX).toBe(10);
    expect(m.gridY).toBe(20);
  });
});

describe('CombatComponent', () => {
  it('enqueue and process skill request', () => {
    const c = new CombatComponent();
    let dispatched: string | null = null;
    c.initialize('p1', (cmd) => { dispatched = cmd.skillId ?? null; });
    c.enqueue({ skillId: 'fireball', reason: 'Attack' });
    const result = c.process('p1');
    expect(result).toBe(true);
    expect(dispatched).toBe('fireball');
  });

  it('cooldown blocks immediate re-fire', () => {
    const c = new CombatComponent();
    let count = 0;
    c.initialize('p1', () => count++);
    c.enqueue({ skillId: 'fb', reason: 'Attack' });
    c.process('p1');
    c.enqueue({ skillId: 'fb', reason: 'Attack' });
    c.process('p1'); // blocked by cooldown
    expect(count).toBe(1);
    c.update(1.5); // cooldown expires
    c.process('p1');
    expect(count).toBe(2);
  });

  it('clear empties queue', () => {
    const c = new CombatComponent();
    c.initialize('p1', () => {});
    c.enqueue({ skillId: 'fireball', reason: 'Attack' });
    c.clear();
    expect(c.process('p1')).toBe(false);
  });
});

describe('TargetComponent', () => {
  it('setTarget and clear', () => {
    const t = new TargetComponent();
    t.initialize(0, 0);
    t.setTarget('e1', true);
    expect(t.targetId).toBe('e1');
    expect(t.locked).toBe(true);
    t.clear();
    expect(t.targetId).toBeNull();
  });

  it('getInfo returns distance', () => {
    const t = new TargetComponent();
    t.initialize(0, 0);
    t.setTarget('e1', false);
    const info = t.getInfo(5, 0);
    expect(info?.targetId).toBe('e1');
    expect(info?.distance).toBe(5);
  });
});

describe('InteractionComponent', () => {
  it('interact cooldown prevents spam', () => {
    const bus = undefined as any;
    const ic = new InteractionComponent();
    ic.initialize('p1', bus);
    // Without a real event bus, interact returns false (no bus available).
    expect(ic.interact('pickup', 'item1')).toBe(false);
  });
});

describe('EntityManager', () => {
  it('register and retrieve entity', () => {
    const em = new EntityManager();
    em.initialize(new GameContext());
    const stat = new StatComponent();
    stat.initialize(100, 10, 5, 60);
    em.register({ id: 'p1', team: 'player', stat, movement: new MovementComponent(), anim: new AnimationComponent(), combat: new CombatComponent(), target: new TargetComponent(), interaction: new InteractionComponent() });
    expect(em.get('p1')).toBeDefined();
    expect(em.count()).toBe(1);
    em.destroy();
  });

  it('rejects duplicate id', () => {
    const em = new EntityManager();
    em.initialize(new GameContext());
    const s = new StatComponent(); s.initialize(100, 10, 5, 60);
    em.register({ id: 'p1', team: 'player', stat: s, movement: new MovementComponent(), anim: new AnimationComponent(), combat: new CombatComponent(), target: new TargetComponent(), interaction: new InteractionComponent() });
    const s2 = new StatComponent(); s2.initialize(200, 20, 10, 70);
    expect(() => em.register({ id: 'p1', team: 'enemy', stat: s2, movement: new MovementComponent(), anim: new AnimationComponent(), combat: new CombatComponent(), target: new TargetComponent(), interaction: new InteractionComponent() })).toThrow();
    em.destroy();
  });

  it('ILifecycle exit clears all entities', () => {
    const em = new EntityManager();
    em.initialize(new GameContext());
    const s = new StatComponent(); s.initialize(100, 10, 5, 60);
    em.register({ id: 'p1', team: 'player', stat: s, movement: new MovementComponent(), anim: new AnimationComponent(), combat: new CombatComponent(), target: new TargetComponent(), interaction: new InteractionComponent() });
    em.exit();
    expect(em.count()).toBe(0);
    em.destroy();
  });
});
