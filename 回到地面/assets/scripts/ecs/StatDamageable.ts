// StatDamageable.ts — adapts the ECS StatComponent to the combat-layer Damageable/CombatEntity
// contract (§3.8 / §3.12). Pure TS, no `cc`. Lets CombatSystem target ECS entities without
// knowing about components. Grid position is sourced from MovementComponent so the entity
// stays in sync with its grid cell.

import type { Damageable } from '../battle/skill/SkillData';
import type { CombatEntity } from '../battle/combat/CombatCommand';
import type { StatComponent } from './StatComponent';
import type { MovementComponent } from './MovementComponent';

export type EntityTeam = 'player' | 'enemy' | 'neutral';

export class StatDamageable implements Damageable, CombatEntity {
  constructor(
    private readonly _id: string,
    private readonly _team: EntityTeam,
    private readonly _stat: StatComponent,
    private readonly _movement: MovementComponent,
    private readonly _isBoss = false,
  ) {}

  applyDamage(amount: number, _sourceId?: string): void {
    this._stat.takeDamage(amount);
  }

  get hp(): number { return this._stat.hp; }
  get maxHP(): number { return this._stat.maxHP; }
  get alive(): boolean { return this._stat.alive; }

  get id(): string { return this._id; }
  get team(): EntityTeam { return this._team; }
  get gridX(): number { return this._movement.gridX; }
  get gridY(): number { return this._movement.gridY; }
  get isBoss(): boolean { return this._isBoss; }
}
