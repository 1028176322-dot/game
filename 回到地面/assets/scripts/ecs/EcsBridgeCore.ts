// EcsBridgeCore.ts — orchestrates one entity's ECS components and bridges them to the engine
// node via injected callbacks (§3.12 engine wiring). Pure TS, no `cc`: the cc bridge passes
// node-sync callbacks so this class is fully unit-testable in node.
//
// Responsibilities:
//  - attach/detach the descriptor in the EntityManager (lifecycle)
//  - tick all ECS components each frame
//  - sync grid position -> world node position (via gridToWorld callback)
//  - drive animation from movement/attack/death state
//  - accept MoveCommand / SkillRequest from AI or player input
//
// Red lines honored: ILifecycle-style attach/detach; no `cc`; no Math.random; no switch.

import type { EntityDescriptor } from './EntityManager';
import type { EntityManager } from './EntityManager';
import type { StatDamageable } from './StatDamageable';
import { pickAutoAnimState } from './EcsSyncMath';
import type { PlayerAnimState } from './AnimationComponent';
import type { SkillRequest } from '../battle/ai/IAIController';

export interface EcsBridgeCallbacks {
  gridToWorld(gridX: number, gridY: number): { x: number; y: number };
  setNodePosition(x: number, y: number): void;
}

const ATTACK_ANIM_WINDOW = 0.25;

export class EcsBridgeCore {
  private _lastAuto: PlayerAnimState | null = null;
  private _attackTimer = 0;
  private _detached = false;

  constructor(
    readonly descriptor: EntityDescriptor,
    readonly damageable: StatDamageable,
    private readonly _em: EntityManager,
    private readonly _cb: EcsBridgeCallbacks,
  ) {}

  attach(): void {
    if (this._detached) return;
    this._em.register(this.descriptor);
  }

  detach(): void {
    if (this._detached) return;
    this._em.unregister(this.descriptor.id);
    this._detached = true;
  }

  get detached(): boolean { return this._detached; }

  // Feed a grid move from AI / player input.
  submitMove(dx: number, dy: number, isWalkable: (x: number, y: number) => boolean): boolean {
    return this.descriptor.movement.executeMove(dx, dy, isWalkable);
  }

  // Feed a skill request from AI / player input.
  submitSkill(req: SkillRequest): void {
    this.descriptor.combat.enqueue(req);
    this._attackTimer = ATTACK_ANIM_WINDOW;
  }

  // Per-frame tick: advance components, sync node, drive animation, handle death.
  tick(dt: number): void {
    if (this._detached) return;

    this.descriptor.stat.update(dt);
    this.descriptor.combat.update(dt);
    this.descriptor.movement.update(dt);
    this.descriptor.interaction.update(dt);
    this.descriptor.target.updatePosition(
      this.descriptor.movement.gridX,
      this.descriptor.movement.gridY,
    );

    // Sync node world position from grid cell.
    const w = this._cb.gridToWorld(this.descriptor.movement.gridX, this.descriptor.movement.gridY);
    this._cb.setNodePosition(w.x, w.y);

    // Drive animation.
    if (this._attackTimer > 0) {
      this._attackTimer -= dt;
      this.descriptor.anim.setState('attack');
      this._lastAuto = null;
    } else {
      const next = pickAutoAnimState(this.descriptor.movement.moving, this._lastAuto);
      if (next) {
        this.descriptor.anim.setState(next);
        this._lastAuto = next;
      }
    }

    // Death -> play die anim once, then detach from registry.
    if (!this.descriptor.stat.alive && this._lastAuto !== 'die') {
      this.descriptor.anim.setState('die');
      this._lastAuto = 'die';
      this.detach();
    }
  }

  // Explicit death hook (e.g., from CombatSystem kill event).
  onDeath(): void {
    this.descriptor.anim.setState('die');
    this.detach();
  }
}
