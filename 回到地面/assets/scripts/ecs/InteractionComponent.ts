// InteractionComponent.ts — handles pickup / dialogue / trigger interactions (§3.12 ECS).
// Pure TS, no `cc`. Receives interaction intents and emits events via EventBusManager.

import type { EventBusManager } from '../core/EventBusManager';
import type { BattleEvent } from '../core/events/BattleEvent';

export const IInteractionComponent = 'IInteractionComponent';

export type InteractionType = 'pickup' | 'dialogue' | 'activate' | 'interact';

export class InteractionComponent {
  private _eventBus: EventBusManager | null = null;
  private _entityId = '';
  private _cooldown = 0;

  initialize(entityId: string, eventBus: EventBusManager): void {
    this._entityId = entityId;
    this._eventBus = eventBus;
  }

  // Attempt an interaction. Returns true if the interaction was performed.
  interact(type: InteractionType, targetId: string, data?: unknown): boolean {
    if (this._cooldown > 0) return false;
    if (!this._eventBus) return false;

    const event: BattleEvent = {
      domain: 'battle',
      type: 'status_applied',
      entityId: this._entityId,
      statusKind: `interact_${type}`,
    };
    this._eventBus.battle.emit(event);
    this._cooldown = 0.5; // 500ms interaction cooldown
    return true;
  }

  update(dt: number): void {
    if (this._cooldown > 0) {
      this._cooldown -= dt;
    }
  }
}
