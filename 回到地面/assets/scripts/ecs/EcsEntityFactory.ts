// EcsEntityFactory.ts — assembles a full ECS entity (6 components + Damageable adapter) from
// GameContext-injected dependencies (§3.12). Pure TS, no `cc`. Used by the engine bridge and
// by tests. All component initialization is via ctx.get (red line 4: no new services).

import type { GameContext } from '../core/GameContext';
import { IAnimationController, ICollisionService, IEventBus } from '../core/GameContext';
import type { IAnimationController as IAnimContract } from '../battle/ai/AnimationStateMachine';
import type { ICollisionContract } from '../physics/ICollisionService';
import type { EventBusManager } from '../core/EventBusManager';
import type { EntityDescriptor } from './EntityManager';
import { StatComponent } from './StatComponent';
import { MovementComponent } from './MovementComponent';
import { AnimationComponent, PlayerAnimState } from './AnimationComponent';
import { CombatComponent } from './CombatComponent';
import { TargetComponent } from './TargetComponent';
import { InteractionComponent } from './InteractionComponent';
import { StatDamageable, EntityTeam } from './StatDamageable';
import type { BattleCommand } from '../battle/combat/CombatCommand';

export interface EntityBuildOptions {
  readonly id: string;
  readonly team: EntityTeam;
  readonly baseHP: number;
  readonly baseATK: number;
  readonly baseDEF: number;
  readonly baseSpeed: number;
  readonly startX: number;
  readonly startY: number;
  readonly isBoss?: boolean;
  readonly dispatch: (cmd: BattleCommand) => void;
  readonly clipMap?: Record<PlayerAnimState, string>;
}

export interface BuiltEntity {
  readonly descriptor: EntityDescriptor;
  readonly damageable: StatDamageable;
}

export class EcsEntityFactory {
  static build(ctx: GameContext, opts: EntityBuildOptions): BuiltEntity {
    const stat = new StatComponent();
    stat.initialize(opts.baseHP, opts.baseATK, opts.baseDEF, opts.baseSpeed);

    const movement = new MovementComponent();
    movement.initialize(ctx, opts.startX, opts.startY);

    const anim = new AnimationComponent(opts.clipMap);
    anim.initialize(ctx);

    const combat = new CombatComponent();
    combat.initialize(opts.id, opts.dispatch);

    const target = new TargetComponent();
    target.initialize(opts.startX, opts.startY);

    const interaction = new InteractionComponent();
    interaction.initialize(opts.id, ctx.get<EventBusManager>(IEventBus));

    const descriptor: EntityDescriptor = {
      id: opts.id,
      team: opts.team,
      stat,
      movement,
      anim,
      combat,
      target,
      interaction,
    };

    const damageable = new StatDamageable(
      opts.id,
      opts.team,
      stat,
      movement,
      opts.isBoss ?? false,
    );

    return { descriptor, damageable };
  }
}
