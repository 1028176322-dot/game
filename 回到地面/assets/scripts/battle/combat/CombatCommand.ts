// CombatCommand.ts — unified battle command for CombatSystem (§3.8).
// Pure TS, no `cc`. Discriminated by `kind`; dispatch uses a Map (no switch on id).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.8 + §6.2.
//
// Combat layering (§2.5): commands are produced by AI (IAIController -> SkillRequest/MoveCommand)
// or by the player's SkillSystem, and consumed by CombatSystem. No system writes state directly.

import type { Vec3 } from '../../physics/ICollisionService';
import type { Damageable } from '../skill/SkillData';

// ---- Command types ----
export type BattleCommandKind = 'skill' | 'move';

export interface BattleCommand {
  readonly kind: BattleCommandKind;
  readonly sourceId: string;          // who issued this command
  readonly entityId: string;          // which entity executes it
  readonly targetId?: string;         // optional explicit target
  readonly aimPosition?: Vec3;        // aim / destination point
  // Skill fields
  readonly skillId?: string;
  // Move fields
  readonly dx?: number;               // -1 | 0 | 1 grid step
  readonly dy?: number;
}

// ---- Combat entity contract (pure TS, for targeting & damage) ----
// The engine-side entity implements this. Keeps combat layer free of `cc`.
export interface CombatEntity extends Damageable {
  readonly id: string;
  readonly team: 'player' | 'enemy' | 'neutral';
  readonly gridX: number;
  readonly gridY: number;
  readonly hp: number;
  readonly maxHP: number;
  readonly alive: boolean;
  readonly isBoss: boolean;
}

// ---- Target selection results ----
export interface TargetResult {
  readonly primary: CombatEntity | null;
  readonly aoe: CombatEntity[];
  readonly lockOn: CombatEntity | null;
}
