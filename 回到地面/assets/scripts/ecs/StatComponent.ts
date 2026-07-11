// StatComponent.ts — entity attribute container (§3.12 ECS).
// Pure TS, no `cc`. Holds base + buff-modified stats.
// Buff stacking uses record-based additive modifiers (no switch on stat type).

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';

export const IStatComponent = 'IStatComponent';

export interface StatModifier {
  readonly stat: 'hp' | 'atk' | 'def' | 'speed';
  readonly value: number;           // flat addition
  readonly multiplier: number;      // multiplicative (1 = no change)
  readonly sourceId: string;
  readonly duration: number;        // seconds, 0 = permanent
}

export class StatComponent implements ILifecycle {
  private _baseHP = 100;
  private _baseATK = 10;
  private _baseDEF = 5;
  private _baseSpeed = 60;
  private _hp = 100;
  private _alive = true;
  private _modifiers: StatModifier[] = [];

  // Base stats.
  get baseHP(): number { return this._baseHP; }
  get baseATK(): number { return this._baseATK; }
  get baseDEF(): number { return this._baseDEF; }
  get baseSpeed(): number { return this._baseSpeed; }

  // Effective (modified) stats.
  get hp(): number { return Math.max(0, Math.min(this.maxHP, this._hp)); }
  get maxHP(): number { return this._compute('hp', this._baseHP); }
  get atk(): number { return this._compute('atk', this._baseATK); }
  get def(): number { return this._compute('def', this._baseDEF); }
  get speed(): number { return this._compute('speed', this._baseSpeed); }
  get alive(): boolean { return this._alive; }

  initialize(baseHP: number, baseATK: number, baseDEF: number, baseSpeed: number): void;
  initialize(ctx: GameContext): void;
  initialize(ctxOrBaseHP: GameContext | number, baseATK?: number, baseDEF?: number, baseSpeed?: number): void {
    if (typeof ctxOrBaseHP !== 'number') return; // ILifecycle.initialize(ctx): no stat config to apply
    this._baseHP = ctxOrBaseHP;
    this._baseATK = baseATK ?? 0;
    this._baseDEF = baseDEF ?? 0;
    this._baseSpeed = baseSpeed ?? 0;
    this._hp = ctxOrBaseHP;
    this._alive = true;
    this._modifiers = [];
  }

  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._modifiers = [];
    this._alive = false;
    this._hp = 0;
  }

  takeDamage(amount: number): void {
    if (!this._alive) return;
    this._hp = Math.max(0, this._hp - Math.max(0, amount));
    if (this._hp <= 0) this._alive = false;
  }

  heal(amount: number): void {
    if (!this._alive) return;
    this._hp = Math.min(this.maxHP, this._hp + amount);
  }

  addModifier(mod: StatModifier): void {
    this._modifiers.push(mod);
  }

  clearModifiers(): void {
    this._modifiers = [];
  }

  update(dt: number): void {
    const alive: StatModifier[] = [];
    for (const m of this._modifiers) {
      if (m.duration > 0) {
        m.duration -= dt;
        if (m.duration <= 0) continue;
      }
      alive.push(m);
    }
    this._modifiers = alive;
  }

  private _compute(stat: string, base: number): number {
    let flat = 0;
    let mult = 1;
    for (const m of this._modifiers) {
      if (m.stat === stat) {
        flat += m.value;
        mult *= m.multiplier;
      }
    }
    return Math.max(0, Math.floor((base + flat) * mult));
  }
}
