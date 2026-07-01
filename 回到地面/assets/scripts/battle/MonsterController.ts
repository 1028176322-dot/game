/**
 * MonsterController - 怪物 Cocos 控制器（Phase 7 精简版）
 *
 * 职责:
 * 1. Cocos Component 生命周期（onLoad/init/update）
 * 2. @property 绑定（编辑器可配置默认值）
 * 3. 委托 MonsterAgent 处理所有逻辑
 *   - AI 行为 → AI 策略类 (ai/)
 *   - 属性 → CombatEntity
 *   - 状态 → StatusController
 *   - 阶段 → BossPhaseController
 *   - 受伤 → DamageReceiver
 *
 * Phase 7: 从 667 行精简到 ≤200 行
 */

import { _decorator, Component, Node, tween, Sprite, Vec3 } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { MonsterState, MonsterAIType } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { PlayerController } from './PlayerController';
import { GridManager } from '../dungeon/GridManager';
import { MonsterAgent, AgentState } from './entity/MonsterAgent';
import { MonsterRuntimeView } from './MonsterRuntimeView';
import { SpriteAnimationService } from '../render/SpriteAnimationService';

const { ccclass, property } = _decorator;

export interface MonsterConfig {
    id?: string;
    zoneId?: string;
    name: string;
    hp: number; atk: number; def: number; speed: number;
    aiType: MonsterAIType;
    exp: number;
    isBoss?: boolean;
    phases?: number;
    phaseTrigger?: number[];
}

@ccclass('MonsterController')
export class MonsterController extends Component {
    @property hp: number = 20;
    @property atk: number = 5;
    @property def: number = 1;
    @property speed: number = 60;
    @property aiType: MonsterAIType = MonsterAIType.Charger;

    private _agent: MonsterAgent | null = null;
    private _gridManager: GridManager | null = null;
    private _sprite: Sprite | null = null;
    private _animService: SpriteAnimationService | null = null;
    private _player: PlayerController | null = null;
    private _battleManagerRef: any = null;
    private _view: MonsterRuntimeView | null = null;

    onLoad(): void {
        this._view = this.getComponent(MonsterRuntimeView);
        this._sprite = this._view?.bodySprite ?? this.getComponent(Sprite) ?? this.node.getChildByName('Body')?.getComponent(Sprite) ?? null;
        this._animService = SpriteAnimationService.instance;
        this._agent = new MonsterAgent({
            onAttackAnimation: () => this._playAnim('attack'),
            onDieAnimation: () => this._playAnim('die'),
            onStateChanged: (state) => this._onAgentState(state),
            onFlashWhite: () => this._flashWhite(),
            onSummonEffect: () => this._scalePulse(),
            moveNodeTo: (wx, wy, dur) => {
                tween(this.node).to(dur, { position: new Vec3(wx, wy, 0) }).start();
            },
            isWalkable: (x, y) => this._gridManager?.isWalkable(x, y) ?? false,
            setOccupied: (x, y, occ) => this._gridManager?.setOccupied(x, y, occ),
            gridToWorldX: (gx) => this._gridManager?.gridToWorld(gx, 0)?.x ?? 0,
            gridToWorldY: (gy) => this._gridManager?.gridToWorld(0, gy)?.y ?? 0,
        });
    }

    init(config: MonsterConfig, gridX: number, gridY: number, gridManager: GridManager, battleManager?: any): void {
        this._gridManager = gridManager;
        this._battleManagerRef = battleManager;
        this.hp = config.hp;
        this.atk = config.atk;
        this.def = config.def;
        this.speed = config.speed;
        this.aiType = config.aiType;
        this._agent?.init(config, gridX, gridY);
        this._view?.setHP(config.hp, config.hp);
        this._view?.showHP(!config.isBoss);
        const pos = gridManager.gridToWorld(gridX, gridY);
        this.node.setPosition(pos);
    }

    setTarget(player: PlayerController): void {
        this._player = player;
    }

    updateAI(dt: number, player: PlayerController): void {
        if (!this._agent || this._agent.isDead || !this._gridManager) return;
        this._agent.updateAI(dt, player.gridX, player.gridY);
    }

    takeDamage(rawDamage: number, isCrit: boolean = false): boolean {
        const died = this._agent?.takeDamage(rawDamage, isCrit) ?? false;
        this._view?.setHP(this._agent?.entity.hp ?? 0, this._agent?.entity.maxHP ?? this.maxHP);
        if (died && this._agent) {
            this._agent.die();
            this._dieVisual();
        }
        return died;
    }

    freeze(duration: number): void { this._agent?.freeze(duration); }
    silence(duration: number): void { this._agent?.silence(duration); }
    applyDefDebuff(multiplier: number, duration: number, isDamageTaken?: boolean): void {
        this._agent?.applyDefDebuff(multiplier, duration, isDamageTaken);
    }
    updateStatusTimers(dt: number): void { this._agent?.updateTimers(dt); }

    get state(): MonsterState { return this._mapState(this._agent?.state ?? 'idle'); }
    get gridX(): number { return this._agent?.gridX ?? 0; }
    get gridY(): number { return this._agent?.gridY ?? 0; }
    get isDead(): boolean { return this._agent?.isDead ?? false; }
    get hpPercent(): number { return this._agent?.entity.hpPercent ?? 0; }
    get isFrozen(): boolean { return this._agent?.status.isFrozen ?? false; }
    get isSilenced(): boolean { return this._agent?.status.isSilenced ?? false; }
    get isBoss(): boolean { return this._agent?.bossPhase.isBoss ?? false; }
    get currentPhase(): number { return this._agent?.bossPhase.currentPhase ?? 1; }
    get maxPhases(): number { return this._agent?.bossPhase.maxPhases ?? 1; }
    get maxHP(): number { return this._agent?.entity.maxHP ?? 20; }
    get config(): MonsterConfig | null { return this._agent?.config ?? null; }

    private _onAgentState(state: AgentState): void {
        this._playAnim(state === 'attack' ? 'attack' : state === 'chase' ? 'walk' : 'idle');
    }

    private _playAnim(name: string): void {
        if (!this._animService) return;
        // Try monster-specific anim first, fallback to generic
        const animId = `monster_${name}`;
        if (this._animService.getConfig(animId)) {
            this._animService.play(this.node, animId);
        }
    }

    private _flashWhite(): void {
        if (this._view) {
            this._view.flashHit();
            return;
        }
        if (!this._sprite) return;
        this._sprite.color = { r: 255, g: 80, b: 80, a: 255 } as any;
        this.scheduleOnce(() => {
            if (this._sprite && !this.isDead) this._sprite.color = { r: 255, g: 255, b: 255, a: 255 } as any;
        }, 0.1);
    }

    private _dieVisual(): void {
        tween(this.node).to(0.3, { scale: new Vec3(0, 0, 1) }).call(() => this.node.destroy()).start();
    }

    private _scalePulse(): void {
        tween(this.node).to(0.1, { scale: new Vec3(1.2, 1.2, 1) }).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
    }

    private _mapState(s: AgentState): MonsterState {
        const map: Record<string, MonsterState> = {
            idle: MonsterState.Idle, chase: MonsterState.Chase, attack: MonsterState.Attack,
            retreat: MonsterState.Retreat, defend: MonsterState.Defend, dead: MonsterState.Dead,
        };
        return map[s] ?? MonsterState.Idle;
    }
}
