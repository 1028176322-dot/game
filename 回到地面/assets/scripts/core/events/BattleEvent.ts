// BattleEvent.ts — combat domain event types (§3.11).
// Pure TS, no `cc`. Discriminated union; dispatch uses Map on type, not switch on id.

import type { Vec3 } from '../../physics/ICollisionService';

export interface BattleDamageEvent {
  readonly domain: 'battle';
  readonly type: 'damage_dealt';
  readonly sourceId: string;
  readonly targetId: string;
  readonly amount: number;
  readonly isCrit: boolean;
  readonly element?: string;
}

export interface BattleDeathEvent {
  readonly domain: 'battle';
  readonly type: 'entity_died';
  readonly entityId: string;
  readonly killerId: string;
  readonly isBoss: boolean;
}

export interface BattleSkillCastEvent {
  readonly domain: 'battle';
  readonly type: 'skill_cast';
  readonly casterId: string;
  readonly skillId: string;
  readonly targetId?: string;
  readonly aimPosition?: Vec3;
}

export interface BattleStatusEvent {
  readonly domain: 'battle';
  readonly type: 'status_applied' | 'status_removed';
  readonly entityId: string;
  readonly statusKind: string;
}

export interface BattlePhaseEvent {
  readonly domain: 'battle';
  readonly type: 'boss_phase_changed';
  readonly entityId: string;
  readonly phase: number;
  readonly maxPhases: number;
}

export type BattleEvent =
  | BattleDamageEvent
  | BattleDeathEvent
  | BattleSkillCastEvent
  | BattleStatusEvent
  | BattlePhaseEvent;
