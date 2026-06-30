/**
 * MonsterAgent - 怪物逻辑代理
 *
 * 组合 CombatEntity + StatusController + BossPhaseController + AI 策略
 * 负责移动/攻击/召唤/自爆/死亡等逻辑
 *
 * Phase 7: 从 MonsterController 提取
 */

import { GameConfig } from '../../core/GameConfig';
import { MathUtils } from '../../utils/MathUtils';
import { eventBus } from '../../core/EventBus';
import { MonsterConfig } from '../MonsterController';
import { CombatEntity } from './CombatEntity';
import { StatusController } from './StatusController';
import { DamageReceiver } from './DamageReceiver';
import { BossPhaseController } from './BossPhaseController';
import { MonsterAI, MonsterAIContext } from './ai/MonsterAI';
import { ChargerAI } from './ai/ChargerAI';
import { RangedAI } from './ai/RangedAI';
import { DefenderAI } from './ai/DefenderAI';
import { SummonerAI } from './ai/SummonerAI';
import { SuiciderAI } from './ai/SuiciderAI';

export type AgentState = 'idle' | 'chase' | 'attack' | 'retreat' | 'defend' | 'dead';

export interface MonsterAgentHooks {
    onAttackAnimation?: () => void;
    onDieAnimation?: () => void;
    onStateChanged?: (state: AgentState) => void;
    onFlashWhite?: () => void;
    onSummonEffect?: () => void;
    moveNodeTo(worldX: number, worldY: number, duration: number): void;
    isWalkable(x: number, y: number): boolean;
    setOccupied(x: number, y: number, occupied: boolean): void;
    gridToWorldX(gx: number): number;
    gridToWorldY(gy: number): number;
}

const AI_REGISTRY: Record<string, new () => MonsterAI & { reset?: () => void }> = {
    charger: ChargerAI,
    ranged: RangedAI,
    defender: DefenderAI,
    summoner: SummonerAI,
    suicider: SuiciderAI,
    elite: ChargerAI,  // elite 使用 charger 基础行为 + BossPhaseController
};

export class MonsterAgent {
    entity: CombatEntity;
    status: StatusController;
    damageReceiver: DamageReceiver;
    bossPhase: BossPhaseController;

    gridX = 0;
    gridY = 0;
    attackTimer = 0;
    attackInterval = 1.5;
    eliteAbilityTimer = 0;
    eliteAbilityInterval = 4.0;

    private _state: AgentState = 'idle';
    private _ai: MonsterAI | null = null;
    private _aiInst: { reset?: () => void } | null = null;
    private _aiType: string = 'charger';
    private _config: MonsterConfig | null = null;

    constructor(private readonly _hooks: MonsterAgentHooks) {
        this.entity = new CombatEntity(20, 5, 1, 60);
        this.status = new StatusController();
        this.damageReceiver = new DamageReceiver(
            this.entity, this.status,
            () => (this._aiType === 'defender' && this._state === 'defend') ? 0.5 : 1,
            (_dmg, _crit) => { this._hooks.onFlashWhite?.(); },
        );
        this.bossPhase = new BossPhaseController(
            { isBoss: false, phases: 1, phaseTriggers: [] }, this.entity,
            (p, mp) => eventBus.emit('boss:phase_changed', this, p, mp),
        );
    }

    get state(): AgentState { return this._state; }
    get isDead(): boolean { return this.entity.isDead; }
    get config(): MonsterConfig | null { return this._config; }

    init(config: MonsterConfig, gridX: number, gridY: number): void {
        this._config = config;
        this._aiType = config.aiType;
        this.entity.reset(config.hp, config.atk, config.def, config.speed);
        this.gridX = gridX;
        this.gridY = gridY;
        this.attackInterval = this._calcAttackInterval(config.aiType);
        this.attackTimer = 0;
        this.status.reset();
        this.bossPhase.reset(config.isBoss || false, config.phases || 1, config.phaseTrigger || []);
        this._state = 'idle';
        this.eliteAbilityTimer = 0;

        const Cls = AI_REGISTRY[config.aiType];
        if (Cls) {
            this._aiInst = new Cls();
            this._ai = this._aiInst as MonsterAI;
            this._aiInst.reset?.();
        }
        this._hooks.setOccupied(gridX, gridY, true);
    }

    updateAI(dt: number, playerGridX: number, playerGridY: number): void {
        if (this.entity.isDead) return;
        if (this.status.isFrozen) return;

        const dist = MathUtils.manhattanDistance(this.gridX, this.gridY, playerGridX, playerGridY);

        if (!this.status.isSilenced) this.attackTimer += dt;

        if (this._ai) {
            this._ai.update({ agent: this, playerGridX, playerGridY, dist, dt });
        }

        if (this.attackTimer >= this.attackInterval && this._isInAttackRange(dist) && !this.status.isSilenced) {
            this._attackPlayer();
            this.attackTimer = 0;
        }

        if (this._aiType === 'elite' || this._aiType === 'elite') {
            this.bossPhase.checkPhase();
        }
    }

    setState(state: AgentState): void {
        if (!this._isValidTransition(this._state, state)) return;
        this._state = state;
        this._hooks.onStateChanged?.(state);
    }

    // ======== 移动（由 AI 调用，通过 AIContext 传入玩家坐标） ========

    private _moveToCell(dx: number, dy: number): void {
        const nx = this.gridX + dx;
        const ny = this.gridY + dy;
        if (this._hooks.isWalkable(nx, ny)) {
            this._hooks.setOccupied(this.gridX, this.gridY, false);
            this.gridX = nx;
            this.gridY = ny;
            this._hooks.setOccupied(nx, ny, true);
            const dur = 1 / Math.max(1, this.entity.speed) * GameConfig.TILE_SIZE;
            this._hooks.moveNodeTo(this._hooks.gridToWorldX(nx), this._hooks.gridToWorldY(ny), dur);
        }
    }

    moveTowardPlayer(): void {
        // 由 AI 的 AIContext 协调——实际执行在 updateAI 里用 ctx 中的 playerGridX/Y
        // 此处为空占位。MonsterController 会调用 _executeMovement
    }

    retreatFromPlayer(): void {
        // 同上
    }

    /** 由 MonsterController 每帧调用，执行实际移动 */
    executeMovement(dirX: number, dirY: number): void {
        let newX = this.gridX;
        let newY = this.gridY;
        if (Math.abs(dirX) >= Math.abs(dirY) && dirX !== 0) newX += Math.sign(dirX);
        else if (dirY !== 0) newY += Math.sign(dirY);
        if (this._hooks.isWalkable(newX, newY)) {
            this._hooks.setOccupied(this.gridX, this.gridY, false);
            this.gridX = newX;
            this.gridY = newY;
            this._hooks.setOccupied(newX, newY, true);
            const dur = 1 / Math.max(1, this.entity.speed) * GameConfig.TILE_SIZE;
            this._hooks.moveNodeTo(this._hooks.gridToWorldX(newX), this._hooks.gridToWorldY(newY), dur);
        }
    }

    boostSpeed(factor: number): void {
        this.entity.speed = Math.floor(this.entity.speed * factor);
    }

    /** 由 AI（ChargerAI/DefenderAI）调用 */
    moveTowardTarget(tx: number, ty: number): void {
        const dx = Math.sign(tx - this.gridX);
        const dy = Math.sign(ty - this.gridY);
        this.executeMovement(dx, dy);
    }

    /** 由 AI（RangedAI/SummonerAI）调用 */
    retreatFromTarget(tx: number, ty: number): void {
        const dx = Math.sign(this.gridX - tx);
        const dy = Math.sign(this.gridY - ty);
        this.executeMovement(dx, dy);
    }

    // ======== 攻击 ========

    private _attackPlayer(): void {
        this._hooks.onAttackAnimation?.();
        const isCrit = MathUtils.chance(GameConfig.CRIT_BASE_CHANCE);
        const dmg = isCrit ? Math.floor(this.entity.atk * GameConfig.CRIT_MULTIPLIER) : this.entity.atk;
        eventBus.emit('monster:attacked', this.gridX, this.gridY, dmg, isCrit);
    }

    // ======== 召唤 ========

    summonMinion(): void {
        const pos = this._findSpawnAdjacent();
        if (!pos) return;
        const cfg: MonsterConfig = {
            name: (this._config?.name ?? '') + '_召唤',
            hp: Math.floor((this._config?.hp ?? 10) * 0.4),
            atk: Math.floor((this._config?.atk ?? 5) * 0.5),
            def: 0, speed: 70, aiType: 'charger' as any, exp: 1,
        };
        eventBus.emit('monster:summon', cfg, pos.x, pos.y);
        this._hooks.onSummonEffect?.();
    }

    // ======== 自爆 ========

    suicideExplode(): void {
        if (this.entity.isDead) return;
        const dmg = Math.floor((this._config?.atk ?? 5) * 2);
        eventBus.emit('monster:explosion', this.gridX, this.gridY, dmg);
        this._die();
    }

    // ======== 死亡 ========

    die(): void {
        if (this.entity.isDead) return;
        this._die();
    }

    private _die(): void {
        this.entity.markDead();
        this.setState('dead');
        this._hooks.setOccupied(this.gridX, this.gridY, false);
        this._hooks.onDieAnimation?.();
        eventBus.emit('monster:death', this.gridX, this.gridY, this._config?.exp ?? 0);
    }

    // ======== 承受伤害 ========

    takeDamage(rawDamage: number, isCrit: boolean): boolean {
        return this.damageReceiver.takeDamage(rawDamage, isCrit);
    }

    // ======== 元素状态 ========

    freeze(duration: number): void {
        this.status.freeze(duration);
        eventBus.emit('monster:status_freeze', this, duration);
    }

    silence(duration: number): void {
        this.status.silence(duration);
        eventBus.emit('monster:status_silence', this, duration);
    }

    applyDefDebuff(multiplier: number, duration: number, isDamageTaken?: boolean): void {
        this.status.applyDefDebuff(multiplier, duration, isDamageTaken);
    }

    updateTimers(dt: number): void {
        this.status.update(dt);
    }

    /** 使用精英特殊能力（供 MonsterController 按怪物名调度） */
    useEliteAbility(_dist: number): number {
        return Math.floor(this.entity.atk * 0.5);
    }

    // ======== 私有 ========

    private _findSpawnAdjacent(): { x: number; y: number } | null {
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
            const nx = this.gridX + dx, ny = this.gridY + dy;
            if (this._hooks.isWalkable(nx, ny)) return { x: nx, y: ny };
        }
        return null;
    }

    private _isInAttackRange(dist: number): boolean {
        return dist <= (this._aiType === 'ranged' || this._aiType === 'summoner' ? 4 : 1);
    }

    private _calcAttackInterval(aiType: string): number {
        const map: Record<string, number> = {
            charger: GameConfig.MONSTER_ATK_INTERVAL_CHARGER,
            ranged: GameConfig.MONSTER_ATK_INTERVAL_RANGED,
            defender: GameConfig.MONSTER_ATK_INTERVAL_DEFENDER,
            summoner: 3, suicider: 2, elite: 1.2,
        };
        return map[aiType] ?? 1.5;
    }

    private _isValidTransition(from: AgentState, to: AgentState): boolean {
        return from !== 'dead';
    }
}
