// EcsEntityBridge.ts — Cocos Component glue that binds an ECS entity to a cc.Node
// (§3.12 engine wiring). All logic lives in the pure-TS EcsBridgeCore; this
// file only adapts the engine lifecycle (onLoad/update/onDestroy) and injects
// node-sync callbacks.
//
// Now ALSO implements IPlayerAgent (P3-4-B) so it can stand in for the
// legacy PlayerController once the ECS player path is the live runtime (decision F).
//
// This is ADDITIVE: it is mounted on the player node in parallel with the
// legacy PlayerController. Activation is gated by the static USE_ECS_PLAYER
// flag (default FALSE) — while false, onLoad/update early-return, so the
// bridge is fully inert and never fights the live PlayerController for node
// position. Flipping the flag WITHOUT first removing PlayerController would
// cause a position tug-of-war (bridge.setNodePosition vs PlayerController
// tween) and a broken player — so the swap (flip flag + remove
// PlayerController/AutoAttack) is the D step and MUST be editor-verified
// (audit §10.1 red line).
//
// NOTE on `stats`: IPlayerAgent.stats is the legacy PlayerStats because 8+
// consumers read attack-specific runtime fields (atkSpeed / critChance /
// attackRange / lifeSteal / damageMultiplier / damageReduction / moveSpeed)
// that the ECS StatComponent does not yet model. While the bridge is inert
// those consumers run against the real PlayerController; once active, the
// bridge must keep a PlayerStats mirror in sync (TODO, part of the D wiring).

import { _decorator, Component } from 'cc';
import { GameBootstrap } from '../core/GameBootstrap';
import { GameEvent } from '../core/GameManager';
import { eventBus } from '../core/EventBus';
import { PlayerState } from '../core/Constants';
import { IEntityManager, ICombatSystem } from '../core/GameContext';
import type { IEntityManager as IEmContract } from './EntityManager';
import type { ICombatSystem as ICombatContract } from '../battle/combat/CombatSystem';
import { EcsEntityFactory, EntityBuildOptions } from './EcsEntityFactory';
import { EcsBridgeCore } from './EcsBridgeCore';
import { IPlayerAgent } from '../battle/IPlayerAgent';
import { PlayerStats } from '../battle/PlayerStats';
import type { EntityTeam } from './StatDamageable';
import { JoystickDirection, JoystickEvent } from '../ui/VirtualJoystick';
import type { GridManager } from '../dungeon/GridManager';

const { ccclass, property } = _decorator;

@ccclass('EcsEntityBridge')
export class EcsEntityBridge extends Component implements IPlayerAgent {
  // Activation gate: the ECS player path is not yet a functional replacement
  // (no input->movement wiring, no combat targeting, no HP callback, and the
  // StatComponent lacks attack stats). Keep FALSE until editor-verified.
  static USE_ECS_PLAYER = false;

  @property baseHP: number = 100;
  @property baseATK: number = 10;
  @property baseDEF: number = 5;
  @property baseSpeed: number = 60;

  private _core: EcsBridgeCore | null = null;
  private _gridToWorld: ((x: number, y: number) => { x: number; y: number }) | null = null;
  private _gridManager: GridManager | null = null;
  private _startX = 0;
  private _startY = 0;
  private _team: EntityTeam = 'enemy';
  private _isBoss = false;
  private _state: PlayerState = PlayerState.Idle;
  private _playerStats: PlayerStats | null = null;
  onHPChanged: ((current: number, max: number) => void) | null = null;

  /** Inject a grid->world adapter from the spawner (e.g. GridManager.gridToWorld). */
  setGridAdapter(fn: (x: number, y: number) => { x: number; y: number }): void {
    this._gridToWorld = fn;
  }

  /** Configure spawn cell + team before onLoad runs. */
  setSpawn(x: number, y: number, team: EntityTeam, isBoss = false): void {
    this._startX = x;
    this._startY = y;
    this._team = team;
    this._isBoss = isBoss;
  }

  // IPlayerAgent: bind the grid manager and derive a grid->world adapter.
  init(gridManager: GridManager): void {
    this._gridManager = gridManager;
    this._gridToWorld = (x, y) => {
      const v = gridManager.gridToWorld(x, y);
      return { x: v.x, y: v.y };
    };
  }

  onLoad(): void {
    if (!EcsEntityBridge.USE_ECS_PLAYER) {
      // Inert while gated: do NOT build an entity, do NOT drive the node.
      return;
    }
    const ctx = GameBootstrap.context;
    if (!ctx) {
      console.warn('[EcsEntityBridge] GameContext not ready; entity not wired');
      return;
    }

    const opts: EntityBuildOptions = {
      id: this.node.name || `ecs_${this._startX}_${this._startY}`,
      team: this._team,
      baseHP: this.baseHP,
      baseATK: this.baseATK,
      baseDEF: this.baseDEF,
      baseSpeed: this.baseSpeed,
      startX: this._startX,
      startY: this._startY,
      isBoss: this._isBoss,
      dispatch: (cmd) => {
        const cs = ctx.get<ICombatContract>(ICombatSystem);
        cs?.dispatch(cmd);
      },
    };

    const built = EcsEntityFactory.build(ctx, opts);
    const em = ctx.get<IEmContract>(IEntityManager);
    if (!em) {
      console.warn('[EcsEntityBridge] EntityManager missing; entity not wired');
      return;
    }

    this._core = new EcsBridgeCore(built.descriptor, built.damageable, em, {
      gridToWorld: (x, y) => this._gridToWorld ? this._gridToWorld(x, y) : { x: 0, y: 0 },
      setNodePosition: (x, y) => this.node.setPosition(x, y, 0),
    });
    this._core.attach();
  }

  update(dt: number): void {
    if (!EcsEntityBridge.USE_ECS_PLAYER) return;
    this._core?.tick(dt);
  }

  onDestroy(): void {
    this._core?.detach();
    this._core = null;
  }

  // ======== IPlayerAgent surface (only exercised when USE_ECS_PLAYER is true) ========

  handleJoystick(event: JoystickEvent): void {
    if (!this._core || !this._gridManager) return;
    if (!event.isActive) {
      this._setState(PlayerState.Idle);
      return;
    }
    let dx = 0;
    let dy = 0;
    switch (event.direction) {
      case JoystickDirection.Up: dy = -1; break;
      case JoystickDirection.Down: dy = 1; break;
      case JoystickDirection.Left: dx = -1; break;
      case JoystickDirection.Right: dx = 1; break;
    }
    if (dx !== 0 || dy !== 0) {
      this._core.submitMove(dx, dy, (x, y) => this._gridManager!.isWalkable(x, y));
    }
  }

  takeDamage(rawDamage: number, isCrit: boolean = false): void {
    if (!this._core) return;
    this._core.damageable.applyDamage(rawDamage);
    const hp = this._core.damageable.hp;
    const max = this._core.damageable.maxHP;
    this.onHPChanged?.(hp, max);
    eventBus.emit('player:damaged', rawDamage, isCrit);
    if (!this._core.damageable.alive) {
      this._setState(PlayerState.Dead);
      eventBus.emit(GameEvent.GAME_OVER);
    }
  }

  heal(amount: number): void {
    if (!this._core) return;
    this._core.descriptor.stat.heal(amount);
    const hp = this._core.damageable.hp;
    const max = this._core.damageable.maxHP;
    this.onHPChanged?.(hp, max);
    eventBus.emit('player:healed', { amount });
  }

  get stats(): PlayerStats {
    if (!this._playerStats) {
      this._playerStats = PlayerStats.createDefault();
    }
    return this._playerStats;
  }

  get currentHP(): number { return this._core?.damageable.hp ?? this.baseHP; }
  get gridX(): number { return this._core?.damageable.gridX ?? this._startX; }
  get gridY(): number { return this._core?.damageable.gridY ?? this._startY; }
  get isAlive(): boolean { return this._core?.damageable.alive ?? true; }
  get state(): PlayerState { return this._state; }
  get isDodging(): boolean { return false; }

  private _setState(s: PlayerState): void {
    this._state = s;
  }
}
