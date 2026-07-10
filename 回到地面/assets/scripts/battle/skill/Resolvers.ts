// Resolvers.ts — pure skill effect resolvers (§3.9 HitResolver / DamageResolver).
// Pure TS, no `cc`. No state, no `switch`. These are the leaf effects applied to a Damageable.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.9.

import type { Damageable } from './SkillData';

export class HitResolver {
  // Apply direct hit damage. Pure: forwards to the target contract.
  static resolve(target: Damageable, amount: number, source?: string): void {
    target.applyDamage(amount, source);
  }
}

export class DamageResolver {
  // Apply a burn damage-over-time effect. Pure: forwards to the target contract.
  static applyBurn(target: Damageable, dps: number, duration: number, source?: string): void {
    target.applyBurn(dps, duration, source);
  }
}
