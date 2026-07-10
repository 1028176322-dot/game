// TargetSelector.ts — picks combat targets for CombatSystem (§3.8).
// Pure TS, no `cc`. Pure function of (command, pool) -> TargetResult. No switch on id.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.8 "找目标：锁定/范围/视线".

import type { BattleCommand, CombatEntity, TargetResult } from './CombatCommand';

export const ITargetSelector = 'ITargetSelector';

export const ATTACK_RANGE_MELEE = 1;
export const ATTACK_RANGE_RANGED = 4;
export const LOCK_ON_RANGE = 8;

function manhattan(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export class TargetSelector {
  // Select primary target: explicit targetId, then nearest enemy in range.
  selectPrimary(cmd: BattleCommand, pool: CombatEntity[], self: CombatEntity): CombatEntity | null {
    if (cmd.targetId) {
      return pool.find((e) => e.id === cmd.targetId && e.alive) ?? null;
    }
    const enemies = pool.filter((e) => e.team !== self.team && e.alive);
    if (enemies.length === 0) return null;
    enemies.sort((a, b) => manhattan(self.gridX, self.gridY, a.gridX, a.gridY) - manhattan(self.gridX, self.gridY, b.gridX, b.gridY));
    return enemies[0];
  }

  // Select all enemies within a radius of the aim point.
  selectAOE(cmd: BattleCommand, pool: CombatEntity[], radius: number): CombatEntity[] {
    const target = cmd.aimPosition ? { x: cmd.aimPosition.x, y: cmd.aimPosition.z } : null;
    if (!target) return [];
    return pool.filter((e) => e.alive && manhattan(e.gridX, e.gridY, target.x, target.y) <= radius);
  }

  // Full target resolution for a command.
  resolve(cmd: BattleCommand, pool: CombatEntity[], self: CombatEntity): TargetResult {
    const primary = this.selectPrimary(cmd, pool, self);
    const aoe: CombatEntity[] = [];
    let lockOn: CombatEntity | null = null;

    if (primary) {
      // AOE: for skill commands, pick targets around the primary.
      if (cmd.kind === 'skill') {
        const radius = cmd.aimPosition ? 1 : 0; // default splash radius if explicit aim
        aoe.push(...this.selectAOE(cmd, pool, radius));
        if (aoe.length === 0) aoe.push(primary);
      }
      // Lock-on candidate: nearest valid target within lock-on range.
      const dist = manhattan(self.gridX, self.gridY, primary.gridX, primary.gridY);
      if (dist <= LOCK_ON_RANGE) {
        lockOn = primary;
      }
    }
    return { primary, aoe: aoe.length > 0 ? aoe : (primary ? [primary] : []), lockOn };
  }
}
