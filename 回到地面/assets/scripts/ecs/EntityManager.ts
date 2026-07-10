// EntityManager.ts — ECS entity registry (§3.12).
// Pure TS, no `cc`. Implements ILifecycle. Manages all entity components.
// Entities are registered/deregistered as they enter/leave rooms.
// CombatSystem's entity pool can be backed by this registry.

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';
import type { StatComponent } from './StatComponent';
import type { MovementComponent } from './MovementComponent';
import type { AnimationComponent } from './AnimationComponent';
import type { CombatComponent } from './CombatComponent';
import type { TargetComponent } from './TargetComponent';
import type { InteractionComponent } from './InteractionComponent';

export const IEntityManager = 'IEntityManager';

// Minimal entity descriptor — holds all component references.
export interface EntityDescriptor {
  readonly id: string;
  readonly team: 'player' | 'enemy' | 'neutral';
  stat: StatComponent;
  movement: MovementComponent;
  anim: AnimationComponent;
  combat: CombatComponent;
  target: TargetComponent;
  interaction: InteractionComponent;
}

export class EntityManager implements ILifecycle {
  readonly name = 'EntityManager';

  private readonly _entities = new Map<string, EntityDescriptor>();
  private _initialized = false;

  // --- ILifecycle ---
  initialize(_ctx: GameContext): void {
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {
    this.clear();
  }
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this.clear();
    this._initialized = false;
  }
  get initialized(): boolean {
    return this._initialized;
  }

  register(desc: EntityDescriptor): void {
    if (this._entities.has(desc.id)) {
      throw new Error(`[EntityManager] duplicate entity: ${desc.id}`);
    }
    this._entities.set(desc.id, desc);
  }

  unregister(entityId: string): void {
    this._entities.delete(entityId);
  }

  get(entityId: string): EntityDescriptor | undefined {
    return this._entities.get(entityId);
  }

  getAll(): EntityDescriptor[] {
    return Array.from(this._entities.values());
  }

  getByTeam(team: 'player' | 'enemy' | 'neutral'): EntityDescriptor[] {
    return this.getAll().filter((e) => e.team === team);
  }

  getAlive(): EntityDescriptor[] {
    return this.getAll().filter((e) => e.stat.alive);
  }

  count(): number {
    return this._entities.size;
  }

  clear(): void {
    this._entities.clear();
  }
}
