/**
 * MonsterController - 怪物控制器
 * 3 种基础 AI：冲锋型/远程型/防御型
 * 状态机集中管理状态转移
 */

import { _decorator, Component, Node, Vec3, tween, Sprite, Animation } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { MonsterState, MonsterAIType, ElementType } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { MathUtils } from '../utils/MathUtils';
import { PlayerController } from './PlayerController';
import { GridManager } from '../dungeon/GridManager';

const { ccclass, property } = _decorator;

export interface MonsterConfig {
    name: string;
    hp: number;
    atk: number;
    def: number;
    speed: number;
    aiType: MonsterAIType;
    exp: number;
}

@ccclass('MonsterController')
export class MonsterController extends Component {
    // ======== 状态定义 ========
    // 允许转移:
    // idle → chase | attack
    // chase → attack | retreat | defend
    // attack → chase | retreat
    // retreat → chase | attack
    // defend → attack | chase
    // stunned → chase | attack | retreat | defend
    // dead: 终止状态
    // ========

    @property
    hp: number = 20;
    @property
    atk: number = 5;
    @property
    def: number = 1;
    @property
    speed: number = 60;
    @property({ type: Number })
    aiType: MonsterAIType = MonsterAIType.Charger;

    private _state: MonsterState = MonsterState.Idle;
    private _maxHP: number = 20;
    private _gridX: number = 0;
    private _gridY: number = 0;
    private _target: PlayerController | null = null;
    private _gridManager: GridManager | null = null;
    private _attackTimer: number = 0;
    private _attackInterval: number = 1.5;
    private _sprite: Sprite | null = null;
    private _animation: Animation | null = null;
    private _config: MonsterConfig | null = null;
    private _isDead: boolean = false;

    // ======== 元素状态效果 (M2.2) ========
    /** 冻结计时 (秒) */
    private _freezeTimer: number = 0;
    /** 沉默计时 (秒) */
    private _silenceTimer: number = 0;
    /** 防御倍率 (默认1, Superconduct=0.5) */
    private _defMultiplier: number = 1;
    /** 受伤倍率 (默认1, Brittle=1.3) */
    private _damageTakenMultiplier: number = 1;
    /** 防御/受伤 debuff 剩余时间 */
    private _debuffTimer: number = 0;

    onLoad(): void {
        this._maxHP = this.hp;
        this._sprite = this.getComponent(Sprite);
        this._animation = this.getComponent(Animation);
        this._attackInterval = this._getAttackInterval();
    }

    /** 初始化怪物 */
    init(config: MonsterConfig, gridX: number, gridY: number, gridManager: GridManager): void {
        this._config = config;
        this.hp = config.hp;
        this._maxHP = config.hp;
        this.atk = config.atk;
        this.def = config.def;
        this.speed = config.speed;
        this.aiType = config.aiType;
        this._gridX = gridX;
        this._gridY = gridY;
        this._gridManager = gridManager;
        this._attackInterval = this._getAttackInterval();
        this._isDead = false;
        // 重置元素状态
        this._freezeTimer = 0;
        this._silenceTimer = 0;
        this._defMultiplier = 1;
        this._damageTakenMultiplier = 1;
        this._debuffTimer = 0;

        this.node.setPosition(gridManager.gridToWorld(gridX, gridY));
        gridManager.setOccupied(gridX, gridY, true);
        this._setState(MonsterState.Idle);
    }

    /** 设置目标（玩家） */
    setTarget(player: PlayerController): void {
        this._target = player;
    }

    /** 更新 AI（每帧调用） */
    updateAI(dt: number, player: PlayerController): void {
        if (this._isDead || !this._gridManager) return;

        // 冻结时停止所有行动
        if (this._freezeTimer > 0) return;

        this._target = player;
        const dist = MathUtils.manhattanDistance(this._gridX, this._gridY, player.gridX, player.gridY);

        // 更新攻击计时（沉默时不计时）
        if (this._silenceTimer <= 0) {
            this._attackTimer += dt;
        }

        // AI 状态机流转
        switch (this.aiType) {
            case MonsterAIType.Charger:
                this._updateChargerAI(dist);
                break;
            case MonsterAIType.Ranged:
                this._updateRangedAI(dist);
                break;
            case MonsterAIType.Defender:
                this._updateDefenderAI(dist);
                break;
        }

        // 攻击冷却到了且目标在攻击范围内 → 攻击（沉默时不能攻击）
        if (this._attackTimer >= this._attackInterval && this._isInAttackRange(dist) && this._silenceTimer <= 0) {
            this._attackPlayer();
            this._attackTimer = 0;
        }
    }

    /** 冲锋型 AI：追击玩家，近战攻击 */
    private _updateChargerAI(dist: number): void {
        if (dist <= 1) {
            this._setState(MonsterState.Attack);
        } else if (dist <= 4) {
            this._moveTowardPlayer();
            this._setState(MonsterState.Chase);
        } else {
            this._setState(MonsterState.Idle);
        }
    }

    /** 远程型 AI：保持距离(2-4格)，远程攻击 */
    private _updateRangedAI(dist: number): void {
        if (dist <= 1) {
            // 太近了：后退
            this._retreatFromPlayer();
            this._setState(MonsterState.Retreat);
        } else if (dist <= 4) {
            // 在射程内：攻击
            this._setState(MonsterState.Attack);
        } else if (dist <= 6) {
            this._moveTowardPlayer();
            this._setState(MonsterState.Chase);
        } else {
            this._setState(MonsterState.Idle);
        }
    }

    /** 防御型 AI：低速高防，架盾格挡 */
    private _updateDefenderAI(dist: number): void {
        if (dist <= 1) {
            this._setState(MonsterState.Attack);
        } else if (dist <= 3) {
            this._setState(MonsterState.Defend);
            this._moveTowardPlayer();
        } else if (dist <= 5) {
            this._moveTowardPlayer();
            this._setState(MonsterState.Chase);
        } else {
            this._setState(MonsterState.Idle);
        }
    }

    /** 向玩家移动 */
    private _moveTowardPlayer(): void {
        if (!this._target || !this._gridManager) return;

        const dx = Math.sign(this._target.gridX - this._gridX);
        const dy = Math.sign(this._target.gridY - this._gridY);

        let newX = this._gridX;
        let newY = this._gridY;

        // 优先移动距离更大的方向
        const diffX = Math.abs(this._target.gridX - this._gridX);
        const diffY = Math.abs(this._target.gridY - this._gridY);

        if (diffX >= diffY && dx !== 0) {
            newX += dx;
        } else if (dy !== 0) {
            newY += dy;
        }

        if (this._gridManager.isWalkable(newX, newY)) {
            this._gridManager.setOccupied(this._gridX, this._gridY, false);
            this._gridX = newX;
            this._gridY = newY;
            this._gridManager.setOccupied(newX, newY, true);

            const targetPos = this._gridManager.gridToWorld(newX, newY);
            tween(this.node)
                .to(1 / this.speed * GameConfig.TILE_SIZE, { position: targetPos })
                .start();
        }
    }

    /** 后退 */
    private _retreatFromPlayer(): void {
        if (!this._target || !this._gridManager) return;

        const dx = Math.sign(this._gridX - this._target.gridX);
        const dy = Math.sign(this._gridY - this._target.gridY);

        const newX = this._gridX + dx;
        const newY = this._gridY + dy;

        if (this._gridManager.isWalkable(newX, newY)) {
            this._gridManager.setOccupied(this._gridX, this._gridY, false);
            this._gridX = newX;
            this._gridY = newY;
            this._gridManager.setOccupied(newX, newY, true);

            const targetPos = this._gridManager.gridToWorld(newX, newY);
            tween(this.node)
                .to(0.3, { position: targetPos })
                .start();
        }
    }

    /** 是否在攻击范围内 */
    private _isInAttackRange(dist: number): boolean {
        switch (this.aiType) {
            case MonsterAIType.Charger:
            case MonsterAIType.Defender:
                return dist <= 1;  // 近战，必须邻接
            case MonsterAIType.Ranged:
                return dist <= 4;  // 远程，4 格内
            default:
                return false;
        }
    }

    /** 攻击玩家 */
    private _attackPlayer(): void {
        if (!this._target) return;
        this._playAnimation('attack');

        const isCrit = MathUtils.chance(GameConfig.CRIT_BASE_CHANCE);
        const damage = isCrit
            ? Math.floor(this.atk * GameConfig.CRIT_MULTIPLIER)
            : this.atk;

        this._target.takeDamage(damage, isCrit);
        eventBus.emit('monster:attacked', this._gridX, this._gridY, damage, isCrit);
    }

    /** 被攻击 */
    takeDamage(rawDamage: number, isCrit: boolean = false): boolean {
        // 防御型架盾时减伤 50%
        const shieldMultiplier = (this.aiType === MonsterAIType.Defender && this._state === MonsterState.Defend) ? 0.5 : 1;
        // 减防 debuff (Superconduct 等)
        const effectiveDef = Math.floor(this.def * this._defMultiplier);
        const actualDamage = Math.max(GameConfig.MIN_DAMAGE, Math.floor(
            (rawDamage + MathUtils.d6() - effectiveDef * GameConfig.DAMAGE_FORMULA_DEF_FACTOR)
            * shieldMultiplier * this._damageTakenMultiplier
        ));

        this.hp = Math.max(0, this.hp - actualDamage);
        eventBus.emit('monster:damaged', this._gridX, this._gridY, actualDamage, isCrit);

        if (this.hp <= 0) {
            this._die();
            return true; // 已死亡
        }
        return false;
    }

    /** 死亡 */
    private _die(): void {
        if (this._isDead) return;
        this._isDead = true;
        this._setState(MonsterState.Dead);

        if (this._gridManager) {
            this._gridManager.setOccupied(this._gridX, this._gridY, false);
        }

        // 播放死亡动画后销毁
        this._playAnimation('die');

        eventBus.emit('monster:death', this._gridX, this._gridY, this._config?.exp ?? 0);

        tween(this.node)
            .to(0.3, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

    private _getAttackInterval(): number {
        switch (this.aiType) {
            case MonsterAIType.Charger: return GameConfig.MONSTER_ATTACK_INTERVAL_CHARGER;
            case MonsterAIType.Ranged: return GameConfig.MONSTER_ATTACK_INTERVAL_RANGED;
            case MonsterAIType.Defender: return GameConfig.MONSTER_ATTACK_INTERVAL_DEFENDER;
            default: return 1.5;
        }
    }

    private _setState(state: MonsterState): void {
        const oldState = this._state;
        this._state = state;

        // 验证状态转移合法性
        if (!this._isValidTransition(oldState, state)) {
            console.warn(`[MonsterController] 非法状态转移: ${oldState} → ${state}`);
            return;
        }

        switch (state) {
            case MonsterState.Idle: this._playAnimation('idle'); break;
            case MonsterState.Chase: this._playAnimation('walk'); break;
            case MonsterState.Attack: this._playAnimation('attack'); break;
            case MonsterState.Defend: this._playAnimation('defend'); break;
            case MonsterState.Dead: this._playAnimation('die'); break;
        }
    }

    /** 状态转移合法性校验 */
    private _isValidTransition(from: MonsterState, to: MonsterState): boolean {
        if (from === MonsterState.Dead) return false; // 死亡状态终止
        if (from === to) return true; // 相同状态允许刷新
        // 允许所有非终止状态间的常规切换
        return to !== MonsterState.Dead || from !== MonsterState.Dead;
    }

    private _playAnimation(name: string): void {
        if (this._animation) {
            try {
                this._animation.play(name);
            } catch (err) {
                // 动画缺失兜底
            }
        }
    }

    // ======== 元素状态效果 API (M2.2) ========

    /** 冻结: 停止所有行动 N 秒 */
    freeze(duration: number): void {
        this._freezeTimer = Math.max(this._freezeTimer, duration);
        eventBus.emit('monster:status_freeze', this, duration);
    }

    /** 沉默: N 秒内不能攻击 */
    silence(duration: number): void {
        this._silenceTimer = Math.max(this._silenceTimer, duration);
        eventBus.emit('monster:status_silence', this, duration);
    }

    /**
     * 应用防御/受伤 debuff
     * @param multiplier 防御倍率 (0.5=半防) 或 受伤倍率 (1.3=+30%)
     * @param duration 持续秒数
     * @param isDamageTaken 是否为受伤倍率 (默认false=防御倍率)
     */
    applyDefDebuff(multiplier: number, duration: number, isDamageTaken: boolean = false): void {
        if (isDamageTaken) {
            this._damageTakenMultiplier = Math.max(GameConfig.MIN_DAMAGE, multiplier);
        } else {
            this._defMultiplier = Math.min(1, Math.max(0.1, multiplier));
        }
        this._debuffTimer = Math.max(this._debuffTimer, duration);
    }

    /** 更新元素状态计时 (由 BattleManager 或元素系统调用) */
    updateStatusTimers(dt: number): void {
        // 冻结计时
        if (this._freezeTimer > 0) {
            this._freezeTimer = Math.max(0, this._freezeTimer - dt);
        }
        // 沉默计时
        if (this._silenceTimer > 0) {
            this._silenceTimer = Math.max(0, this._silenceTimer - dt);
        }
        // debuff 计时 (防御/受伤)
        if (this._debuffTimer > 0) {
            this._debuffTimer = Math.max(0, this._debuffTimer - dt);
            if (this._debuffTimer <= 0) {
                this._defMultiplier = 1;
                this._damageTakenMultiplier = 1;
            }
        }
    }

    get state(): MonsterState { return this._state; }
    get gridX(): number { return this._gridX; }
    get gridY(): number { return this._gridY; }
    get isDead(): boolean { return this._isDead; }
    get hpPercent(): number { return this._maxHP > 0 ? this.hp / this._maxHP : 0; }
    get isFrozen(): boolean { return this._freezeTimer > 0; }
    get isSilenced(): boolean { return this._silenceTimer > 0; }
}
