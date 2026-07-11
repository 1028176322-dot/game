// IPlayerAgent.ts — unified player contract (P3-4-C).
//
// Decouples every dungeon system (BattleManager, UpgradeManager, SkillSystem,
// ElementSystem, EquipmentSystem, ItemSystem, EventSystem, MonsterController,
// RoomFlowController, EventUI, MutationRuntimeService, DungeonManager) from the
// concrete `PlayerController` monobehaviour. Both the legacy `PlayerController`
// and the new ECS `EcsEntityBridge` (once it is wired to drive the live
// player) satisfy this interface, so the runtime swap (remove PlayerController,
// mount the 6 ECS components) becomes a drop-in with no consumer changes.
//
// NOTE: `stats` is intentionally `PlayerStats` (legacy) because 8+ consumers
// read attack-specific runtime fields (atkSpeed / critChance / attackRange /
// lifeSteal / damageMultiplier / damageReduction / moveSpeed) that the ECS
// `StatComponent` does not yet model. The ECS bridge must keep a `PlayerStats`
// mirror in sync until those fields migrate into the component layer.

import { Node } from 'cc';
import { GridManager } from '../dungeon/GridManager';
import { PlayerStats } from './PlayerStats';
import { JoystickEvent } from '../ui/VirtualJoystick';
import { PlayerState } from '../core/Constants';

export interface IPlayerAgent {
  readonly node: Node;

  /** Bind the grid manager and (re)spawn at the grid center. */
  init(gridManager: GridManager): void;

  /** Feed virtual-joystick input (legacy input path). */
  handleJoystick(event: JoystickEvent): void;

  /** Apply incoming damage (with optional crit flag for fx). */
  takeDamage(rawDamage: number, isCrit?: boolean): void;

  /** Restore HP (talents / rooms / items). */
  heal(amount: number): void;

  /** Runtime stat layer (see NOTE above about attack fields). */
  readonly stats: PlayerStats;

  readonly currentHP: number;
  readonly gridX: number;
  readonly gridY: number;
  readonly isAlive: boolean;
  readonly state: PlayerState;
  readonly isDodging: boolean;

  /** Assigned by DungeonSceneController to refresh the HUD on HP change. */
  onHPChanged: ((current: number, max: number) => void) | null;
}
