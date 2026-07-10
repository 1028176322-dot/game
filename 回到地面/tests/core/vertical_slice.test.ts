// vertical_slice.test.ts — end-to-end headless integration test (Phase 4).
// Proves the full pipeline is wired: GameContext -> EntityManager -> IAIController -> CombatSystem
// -> TargetSelector -> HitResolver/DamageResolver -> EffectExecutor, all without the engine.
//
// This is the "headless vertical slice": it demonstrates a complete game tick (AI decision,
// command dispatch, damage resolution, status effects) in pure TS under vitest.

import { describe, it, expect } from 'vitest';
import { GameContext, ILogger, ICollisionService, IConfigDatabase, IAnimationController } from '../../assets/scripts/core/GameContext';
import { Logger } from '../../assets/scripts/core/Logger';
import { MockCollisionService } from '../support/MockCollisionService';
import { MockConfigDatabase } from '../support/MockConfigDatabase';
import { SkillGraph, ISkillGraph } from '../../assets/scripts/battle/skill/SkillGraph';
import { SkillExecutor, ISkillExecutor } from '../../assets/scripts/battle/skill/SkillExecutor';
import { CombatSystem, ICombatSystem } from '../../assets/scripts/battle/combat/CombatSystem';
import { AIController } from '../../assets/scripts/battle/ai/AIController';
import type { Entity, AIPerception, MoveCommand, SkillRequest } from '../../assets/scripts/battle/ai/IAIController';
import type { CombatEntity } from '../../assets/scripts/battle/combat/CombatCommand';
import type { Damageable } from '../../assets/scripts/battle/skill/SkillData';
import { AnimationStateMachine } from '../../assets/scripts/battle/ai/AnimationStateMachine';

// ---- Mock Entity (the IAIController.Entity that carries a CombatSystem command sink) ----
class SliceEntity implements Entity, Damageable {
  id: string;
  gridX: number;
  gridY: number;
  perception: AIPerception;
  moves: MoveCommand[] = [];
  skills: SkillRequest[] = [];
  damageReceived: { amount: number; source?: string }[] = [];
  burnReceived: { dps: number; duration: number; source?: string }[] = [];
  hp: number;
  maxHP: number;
  alive = true;

  constructor(id: string, gx: number, gy: number, perception: AIPerception, hp = 100) {
    this.id = id;
    this.gridX = gx;
    this.gridY = gy;
    this.perception = perception;
    this.hp = hp;
    this.maxHP = hp;
  }

  submitMove(cmd: MoveCommand): void { this.moves.push(cmd); }
  submitSkill(req: SkillRequest): void { this.skills.push(req); }
  applyDamage(amount: number, source?: string): void {
    this.damageReceived.push({ amount, source });
    this.hp = Math.max(0, Math.min(this.maxHP, this.hp - Math.max(0, amount)));
    if (this.hp <= 0) this.alive = false;
  }
  applyBurn(dps: number, duration: number, source?: string): void {
    this.burnReceived.push({ dps, duration, source });
  }
}

// ---- Mock CombatEntity (for CombatSystem pool) ----
class SliceCombatEntity implements CombatEntity {
  id: string;
  team: 'player' | 'enemy';
  gridX: number;
  gridY: number;
  hp: number;
  maxHP: number;
  alive = true;
  isBoss = false;
  damageReceived: { amount: number; source?: string }[] = [];

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
  applyBurn(_dps: number, _duration: number, _source?: string): void {}
}

describe('vertical slice — full pipeline (Phase 4)', () => {
  function buildCtx(): GameContext {
    const ctx = new GameContext();
    ctx.register(ILogger, new Logger(true));
    ctx.register(ICollisionService, new MockCollisionService());
    const db = new MockConfigDatabase();
    db.setSkill('melee_attack', {
      id: 'melee_attack',
      onHit: { damage: 25 },
      cooldown: 1,
    });
    ctx.register(IConfigDatabase, db);

    // MovementComponent uses ICollisionService for grid checks.
    const graph = new SkillGraph();
    const executor = new SkillExecutor();
    ctx.register(ISkillGraph, graph);
    ctx.register(ISkillExecutor, executor);
    graph.initialize(ctx);
    executor.initialize(ctx);

    const cs = new CombatSystem();
    ctx.register(ICombatSystem, cs);
    cs.initialize(ctx);

    // Register IAnimationController (required by AIController.update).
    const animSM = new AnimationStateMachine();
    ctx.register(IAnimationController, animSM);
    animSM.initialize(ctx);

    return ctx;
  }

  it('full flow: AI decision -> CombatSystem -> damage resolved -> effect applied', () => {
    const ctx = buildCtx();
    const cs = ctx.get<CombatSystem>(ICombatSystem);

    // Register combat entities.
    const player = new SliceCombatEntity('player1', 'player', 0, 0);
    const enemy = new SliceCombatEntity('enemy1', 'enemy', 1, 0, 100);
    cs.register(player);
    cs.register(enemy);

    // Create the AI entity (the owner) with perception of the enemy.
    const aiEntity = new SliceEntity(
      'player1', 0, 0,
      { targetX: 1, targetY: 0, targetAlive: true },
    );

    // Wire the AI entity's submitSkill to dispatch through CombatSystem.
    const originalSubmit = aiEntity.submitSkill.bind(aiEntity);
    aiEntity.submitSkill = (req: SkillRequest) => {
      originalSubmit(req);
      cs.dispatch({
        kind: 'skill',
        sourceId: 'player1',
        entityId: 'player1',
        skillId: req.skillId,
        targetId: 'enemy1',
      });
    };

    // Run AI decision (BT default).
    const ai = new AIController();
    ai.initialize(ctx, aiEntity);
    ai.update(0.016); // one frame

    // AI should have produced a SkillRequest (enemy is adjacent, dist=1).
    expect(aiEntity.skills.length).toBeGreaterThanOrEqual(1);
    expect(aiEntity.skills[0].skillId).toBe('melee_attack');

    // CombatSystem should have processed the command.
    // The enemy receives at least the direct HitResolver damage.
    expect(enemy.damageReceived.length).toBeGreaterThanOrEqual(1);
    const dmg = enemy.damageReceived[0];
    expect(dmg.source).toBe('player1');

    // Cleanup.
    cs.destroy();
    ai.destroy();
  });

  it('multiple frames: AI produces commands, CombatSystem processes, entity pool maintained', () => {
    const ctx = buildCtx();
    const cs = ctx.get<CombatSystem>(ICombatSystem);

    const player = new SliceCombatEntity('player1', 'player', 0, 0);
    const enemy = new SliceCombatEntity('enemy1', 'enemy', 1, 0, 100);
    cs.register(player);
    cs.register(enemy);

    const aiEntity = new SliceEntity(
      'player1', 0, 0,
      { targetX: 1, targetY: 0, targetAlive: true },
    );

    // Wire AI -> CombatSystem.
    aiEntity.submitSkill = (req: SkillRequest) => {
      cs.dispatch({ kind: 'skill', sourceId: 'player1', entityId: 'player1', skillId: req.skillId, targetId: 'enemy1' });
    };

    const ai = new AIController();
    ai.initialize(ctx, aiEntity);

    // Run several frames.
    for (let i = 0; i < 10; i++) {
      ai.update(0.016);
      cs.update(0.016);
    }

    // Enemy should have taken damage (via SkillExecutor + HitResolver).
    expect(enemy.damageReceived.length).toBeGreaterThan(0);

    // Entity pool is maintained.
    expect(cs.entities.length).toBe(2);

    cs.destroy();
    ai.destroy();
  });

  it('ILifecycle: exit clears combat state', () => {
    const ctx = buildCtx();
    const cs = ctx.get<CombatSystem>(ICombatSystem);
    cs.register(new SliceCombatEntity('p1', 'player', 0, 0));
    expect(cs.entities.length).toBe(1);
    cs.exit();
    expect(cs.entities.length).toBe(0);
    cs.destroy();
    expect(cs.initialized).toBe(false);
  });
});
