// SkillData.ts — skill config types (§3.9).
// Pure TS, no `cc`. The skill is fully data-driven: a single SkillData JSON describes the
// whole chain (projectile -> explosion -> burn). No `switch(skillId)` anywhere (red line 2).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.9 (JSON) + §5.3 (SkillConfig).
// File name per demo4.md task card. Interface is named SkillData; SkillConfig is an alias
// kept for parity with §5.3 `getSkill(id): SkillConfig`.

import type { Vec3 } from '../../physics/ICollisionService';

// --- Skill config (the §3.9 JSON shape) ---

export interface ProjectileSpec {
  speed: number;
  radius: number;
  duration: number;
}

export interface BurnSpec {
  dps: number;
  duration: number;
}

export interface HitSpec {
  damage: number;
  effect?: string;
  burn?: BurnSpec;
}

export interface SkillData {
  id: string;
  projectile?: ProjectileSpec;
  onHit?: HitSpec;
  sound?: string;
  anim?: string;
  cooldown?: number;
}

// §5.3 parity alias: ConfigDatabase.getSkill(id): SkillConfig.
export type SkillConfig = SkillData;

// --- Runtime contracts (pure TS, engine side implements) ---

// A target that can receive skill damage / burn. Pure-TS contract implemented later by
// CombatEntity (engine side). Keeps the skill layer free of `cc` and testable in node.
export interface Damageable {
  applyDamage(amount: number, source?: string): void;
  applyBurn(dps: number, duration: number, source?: string): void;
}

// Who casts the skill (for logging / ownership). Pure-TS.
export interface SkillCaster {
  id: string;
  position: Vec3;
}

// --- Data-driven skill node (the graph is a list of these) ---

// Discriminator `kind` is used as a Map key in SkillExecutor (NOT a switch on skillId)
// -> red line 2 compliant.
export type SkillNode =
  | { kind: 'projectile'; speed: number; radius: number; duration: number }
  | { kind: 'explosion'; radius: number; damage: number }
  | { kind: 'burn'; dps: number; duration: number };

export type SkillNodeKind = SkillNode['kind'];
