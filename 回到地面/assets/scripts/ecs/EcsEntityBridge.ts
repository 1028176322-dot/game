// EcsEntityBridge.ts — Cocos Component glue that binds an ECS entity to a cc.Node (§3.12
// engine wiring). All logic lives in the pure-TS EcsBridgeCore; this file only adapts the
// engine lifecycle (onLoad/update/onDestroy) and injects node-sync callbacks.
//
// This is ADDITIVE: it does NOT replace the legacy PlayerController/MonsterController. The
// legacy components remain the live runtime; this bridge is the new-architecture path that
// can be attached to prefab nodes when the runtime is migrated (decision F).

import { _decorator, Component } from 'cc';
import { GameBootstrap } from '../core/GameBootstrap';
import {
  IEntityManager,
  ICombatSystem,
} from '../core/GameContext';
import type { IEntityManager as IEmContract } from './EntityManager';
import type { ICombatSystem as ICombatContract } from '../battle/combat/CombatSystem';
import { EcsEntityFactory, EntityBuildOptions } from './EcsEntityFactory';
import { EcsBridgeCore } from './EcsBridgeCore';
import type { EntityTeam } from './StatDamageable';

const { ccclass, property } = _decorator;

@ccclass('EcsEntityBridge')
export class EcsEntityBridge extends Component {
  // Editor-configurable base stats (mirrors legacy @property defaults).
  @property baseHP: number = 100;
  @property baseATK: number = 10;
  @property baseDEF: number = 5;
  @property baseSpeed: number = 60;

  private _core: EcsBridgeCore | null = null;
  private _gridToWorld: ((x: number, y: number) => { x: number; y: number }) | null = null;
  private _startX = 0;
  private _startY = 0;
  private _team: EntityTeam = 'enemy';
  private _isBoss = false;

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

  onLoad(): void {
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
    this._core?.tick(dt);
  }

  onDestroy(): void {
    this._core?.detach();
    this._core = null;
  }
}
