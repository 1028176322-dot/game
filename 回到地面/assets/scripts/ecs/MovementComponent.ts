// MovementComponent.ts — grid movement from MoveCommand (§3.12 ECS).
// Pure TS, no `cc`. Receives MoveCommand, applies grid displacement via ICollisionService.
// Red line 1: uses ICollisionService, not PhysicsSystem.

import type { GameContext } from '../core/GameContext';
import { ICollisionService } from '../core/GameContext';
import type { ICollisionService as ICollisionContract } from '../physics/ICollisionService';
import type { Vec3 } from '../physics/ICollisionService';

export const IMovementComponent = 'IMovementComponent';

export interface MovementState {
  readonly gridX: number;
  readonly gridY: number;
  readonly moving: boolean;
}

export class MovementComponent {
  private _gridX = 0;
  private _gridY = 0;
  private _collision: ICollisionContract | null = null;
  private _moving = false;

  initialize(ctx: GameContext, startX: number, startY: number): void {
    this._collision = ctx.get<ICollisionContract>(ICollisionService);
    this._gridX = startX;
    this._gridY = startY;
  }

  get gridX(): number { return this._gridX; }
  get gridY(): number { return this._gridY; }
  get moving(): boolean { return this._moving; }

  getState(): MovementState {
    return { gridX: this._gridX, gridY: this._gridY, moving: this._moving };
  }

  // Execute a move command. Returns true if position changed.
  executeMove(dx: number, dy: number, isWalkable: (x: number, y: number) => boolean): boolean {
    const nx = this._gridX + dx;
    const ny = this._gridY + dy;
    if (!isWalkable(nx, ny)) {
      this._moving = false;
      return false;
    }
    this._gridX = nx;
    this._gridY = ny;
    this._moving = true;
    return true;
  }

  // Move toward a target position.
  moveToward(tx: number, ty: number, isWalkable: (x: number, y: number) => boolean): boolean {
    const dx = Math.sign(tx - this._gridX);
    const dy = Math.sign(ty - this._gridY);
    if (dx === 0 && dy === 0) {
      this._moving = false;
      return false;
    }
    return this.executeMove(dx, dy, isWalkable);
  }

  // Teleport (for room transitions).
  teleport(x: number, y: number): void {
    this._gridX = x;
    this._gridY = y;
    this._moving = false;
  }
}
