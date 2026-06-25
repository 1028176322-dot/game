/**
 * MonsterController - 怪物控制器 (Phase 3)
 * 6 种 AI：冲锋型/远程型/防御型/召唤型/自爆型/精英型(含Boss阶段)
 * 状态机集中管理状态转移
 */

import { _decorator, Component, Node, Vec3, tween, Sprite, Animation, instantiate, Prefab } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { MonsterState, MonsterAIType, ElementType } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { MathUtils } from '../utils/MathUtils';
import { PlayerController } from './PlayerController';
import { GridManager } from '../dungeon/GridManager';
import { ConfigManager } from '../core/ConfigManager';

const { ccclass, property } = _decorator;

export interface MonsterConfig {
    name: string;
    hp: number;
    atk: number;
    def: number;
    speed: number;
    aiType: MonsterAIType;
    exp: number;
    /** Boss 标记 */
    isBoss?: boolean;
    /** Boss 阶段数 */
    phases?: number;
    /** 阶段触发 HP 百分比阈值 */
    phaseTrigger?: number[];
}

@ccclass('MonsterController')
export class MonsterController extends Component {
    // 状态转移规则:
    // idle → chase | attack
    // chase → attack | retreat | defend
    // attack → chase | retreat
    // retreat → chase | attack
    // defend → attack | chase
    // stunned → chase | attack | retreat | defend
    // dead: 终止状态

    @property
    hp: number = 20;
    @property
    atk: number = 5;
    @property
    def: number = 1;
    @property
    speed: number = 60;
    @property
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
    private _battleManagerRef: any = null; // 用于召唤和自爆

    // ======== Boss 阶段系统 ========
    private _isBoss: boolean = false;
    private _phases: number = 1;
    private _currentPhase: number = 1;
    private _phaseTriggers: number[] = [];

    // ======== 召唤型 AI ========
    private _summonTimer: number = 0;
    private _summonInterval: number = 5.0;
    private _summonCount: number = 0;
    private _summonMax: number = 3;
    private _minionNodes: Node[] = [];

    // ======== 自爆型 AI ========
    private _suicideTimer: number = 5.0; // 5 秒自爆倒计时
    private _isSuicideStarted: boolean = false;
    private _suicideRange: number = 2; // 爆炸范围（格）

    // ======== 元素状态效果 ========
    private _freezeTimer: number = 0;
    private _silenceTimer: number = 0;
    private _defMultiplier: number = 1;
    private _damageTakenMultiplier: number = 1;
    private _debuffTimer: number = 0;

    // ======== 精英 AI 特殊能力 ========
    private _eliteAbilityTimer: number = 0;
    private _eliteAbilityInterval: number = 4.0;

    onLoad(): void {
        this._maxHP = this.hp;
        this._sprite = this.getComponent(Sprite);
        this._animation = this.getComponent(Animation);
        this._attackInterval = this._getAttackInterval();
    }

    /** 初始化怪物 */
    init(config: MonsterConfig, gridX: number, gridY: number, gridManager: GridManager, battleManager?: any): void {
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
        this._battleManagerRef = battleManager;
        this._attackInterval = this._getAttackInterval();
        this._isDead = false;

        // Boss 阶段初始化
        this._isBoss = config.isBoss || false;
        this._phases = config.phases || 1;
        this._currentPhase = 1;
        this._phaseTriggers = config.phaseTrigger || [];

        // 召唤型初始化
        this._summonTimer = 0;
        this._summonCount = 0;
        this._summonMax = 3;
        this._minionNodes = [];

        // 自爆型初始化
        this._suicideTimer = 5.0;
        this._isSuicideStarted = false;

        // 精英能力初始化
        this._eliteAbilityTimer = 0;

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
            case MonsterAIType.Summoner:
                this._updateSummonerAI(dt, dist);
                break;
            case MonsterAIType.Suicider:
                this._updateSuiciderAI(dt, dist);
                break;
            case MonsterAIType.Elite:
                this._updateEliteAI(dt, dist);
                break;
        }

        // 攻击冷却到了且目标在攻击范围内 → 攻击（沉默时不能攻击）
        if (this._attackTimer >= this._attackInterval && this._isInAttackRange(dist) && this._silenceTimer <= 0) {
            this._attackPlayer();
            this._attackTimer = 0;
        }
    }

    // ======== 冲锋型 AI ========
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

    // ======== 远程型 AI ========
    private _updateRangedAI(dist: number): void {
        if (dist <= 1) {
            this._retreatFromPlayer();
            this._setState(MonsterState.Retreat);
        } else if (dist <= 4) {
            this._setState(MonsterState.Attack);
        } else if (dist <= 6) {
            this._moveTowardPlayer();
            this._setState(MonsterState.Chase);
        } else {
            this._setState(MonsterState.Idle);
        }
    }

    // ======== 防御型 AI ========
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

    // ======== 召唤型 AI ========
    private _updateSummonerAI(dt: number, dist: number): void {
        // 保持距离（在 3~5 格范围内）
        if (dist <= 2) {
            this._retreatFromPlayer();
            this._setState(MonsterState.Retreat);
        } else if (dist > 5) {
            this._moveTowardPlayer();
            this._setState(MonsterState.Chase);
        } else {
            this._setState(MonsterState.Attack);
        }

        // 召唤计时
        this._summonTimer += dt;
        if (this._summonTimer >= this._summonInterval && this._summonCount < this._summonMax) {
            this._summonMinion();
            this._summonTimer = 0;
        }
    }

    /** 召唤小怪 */
    private _summonMinion(): void {
        if (!this._gridManager || !this._target) return;

        // 查找召唤位置
        const positions = this._findSpawnAdjacent();
        if (!positions) return;

        const spawnConfig: MonsterConfig = {
            name: this._config?.name + '_召唤',
            hp: Math.floor((this._config?.hp ?? 10) * 0.4),
            atk: Math.floor((this._config?.atk ?? 5) * 0.5),
            def: 0,
            speed: 70,
            aiType: MonsterAIType.Charger,
            exp: 1,
        };

        // 发射事件让 BattleManager 处理生成
        eventBus.emit('monster:summon', spawnConfig, positions.x, positions.y);
        this._summonCount++;

        if (this._sprite) {
            // 闪烁效果表示召唤
            tween(this.node)
                .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }
    }

    /** 查找召唤位置（相邻可通行格） */
    private _findSpawnAdjacent(): { x: number; y: number } | null {
        if (!this._gridManager) return null;
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
        for (const [dx, dy] of dirs) {
            const nx = this._gridX + dx;
            const ny = this._gridY + dy;
            if (this._gridManager.isWalkable(nx, ny)) {
                return { x: nx, y: ny };
            }
        }
        return null;
    }

    // ======== 自爆型 AI ========
    private _updateSuiciderAI(dt: number, dist: number): void {
        // 自爆型怪物：接近玩家后自爆
        if (dist <= this._suicideRange) {
            this._explode();
            return;
        }

        // 加速冲向玩家
        if (!this._isSuicideStarted) {
            this._isSuicideStarted = true;
            this.speed = Math.floor(this.speed * 1.5); // 加速
        }

        this._moveTowardPlayer();
        this._setState(MonsterState.Chase);
    }

    /** 自爆 */
    private _explode(): void {
        if (this._isDead) return;

        // 对范围内玩家造成伤害
        if (this._target) {
            const dist = MathUtils.manhattanDistance(this._gridX, this._gridY,
                this._target.gridX, this._target.gridY);
            if (dist <= this._suicideRange) {
                const explosionDamage = Math.floor((this._config?.atk ?? 5) * 2); // 自爆伤害 = 2倍攻击
                this._target.takeDamage(explosionDamage, false);
                eventBus.emit('monster:explosion', this._gridX, this._gridY, explosionDamage);
            }
        }

        // 自身死亡
        this.hp = 0;
        this._die();
    }

    // ======== 精英型 AI ========
    private _updateEliteAI(dt: number, dist: number): void {
        // Boss 阶段检查
        if (this._isBoss && this._phases > 1) {
            this._checkBossPhase();
        }

        // 精英/Boss 行为：追近玩家攻击，但有特殊能力
        if (dist <= 1) {
            this._setState(MonsterState.Attack);
        } else if (dist <= 4) {
            this._moveTowardPlayer();
            this._setState(MonsterState.Chase);
        } else {
            this._moveTowardPlayer();
            this._setState(MonsterState.Chase);
        }

        // 精英特殊能力计时
        this._eliteAbilityTimer += dt;
        if (this._eliteAbilityTimer >= this._eliteAbilityInterval) {
            this._useEliteAbility(dist);
            this._eliteAbilityTimer = 0;
        }
    }

    /** 检查 Boss 阶段切换 */
    private _checkBossPhase(): void {
        const hpPercent = this._maxHP > 0 ? this.hp / this._maxHP : 0;

        let newPhase = 1;
        for (let i = 0; i < this._phaseTriggers.length; i++) {
            if (hpPercent <= this._phaseTriggers[i]) {
                newPhase = i + 2; // phase 2 = trigger[0], phase 3 = trigger[1], etc.
            }
        }

        if (newPhase > this._currentPhase) {
            this._currentPhase = newPhase;
            // 阶段变更效果
            switch (this._currentPhase) {
                case 2:
                    this.speed = Math.floor(this.speed * 1.2);
                    this._attackInterval *= 0.8; // 更快攻速
                    break;
                case 3:
                    this.speed = Math.floor(this.speed * 1.3);
                    this._attackInterval *= 0.7;
                    this.atk = Math.floor(this.atk * 1.2);
                    break;
                case 4:
                    this.speed = Math.floor(this.speed * 1.5);
                    this._attackInterval *= 0.5;
                    this.atk = Math.floor(this.atk * 1.3);
                    break;
            }
            eventBus.emit('boss:phase_changed', this, this._currentPhase, this._phases);
        }
    }

    /** 精英特殊能力 */
    private _useEliteAbility(dist: number): void {
        if (!this._target) return;
        switch (this._config?.name) {
            case '炎魔(精英)':
            case '火焰领主':
                // 范围攻击
                if (dist <= 3) {
                    this._target.takeDamage(Math.floor(this.atk * 0.7), false);
                }
                break;
            case '冰霜女王':
                // 冰冻减速
                if (dist <= 4) {
                    this._target.takeDamage(Math.floor(this.atk * 0.5), false);
                }
                break;
            case '深渊魔王':
                // 全屏攻击
                this._target.takeDamage(Math.floor(this.atk * 0.4), false);
                break;
            default:
                // 普通精英：额外攻击
                if (dist <= 2) {
                    this._target.takeDamage(Math.floor(this.atk * 0.5), false);
                }
                break;
        }
    }

    // ======== 移动逻辑 ========
    private _moveTowardPlayer(): void {
        if (!this._target || !this._gridManager) return;

        const dx = Math.sign(this._target.gridX - this._gridX);
        const dy = Math.sign(this._target.gridY - this._gridY);

        let newX = this._gridX;
        let newY = this._gridY;

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
                .to(1 / Math.max(1, this.speed) * GameConfig.TILE_SIZE, { position: targetPos })
                .start();
        }
    }

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

    private _isInAttackRange(dist: number): boolean {
        switch (this.aiType) {
            case MonsterAIType.Charger:
            case MonsterAIType.Defender:
            case MonsterAIType.Suicider:
            case MonsterAIType.Elite:
                return dist <= 1;
            case MonsterAIType.Ranged:
            case MonsterAIType.Summoner:
                return dist <= 4;
            default:
                return false;
        }
    }

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
        const shieldMultiplier = (this.aiType === MonsterAIType.Defender && this._state === MonsterState.Defend) ? 0.5 : 1;
        const effectiveDef = Math.floor(this.def * this._defMultiplier);
        const actualDamage = Math.max(GameConfig.MIN_DAMAGE, Math.floor(
            (rawDamage + MathUtils.d6() - effectiveDef * GameConfig.DAMAGE_FORMULA_DEF_FACTOR)
            * shieldMultiplier * this._damageTakenMultiplier
        ));

        this.hp = Math.max(0, this.hp - actualDamage);
        eventBus.emit('monster:damaged', this._gridX, this._gridY, actualDamage, isCrit);

        // 受伤闪白
        if (this._sprite) {
            this._sprite.color = { r: 255, g: 80, b: 80, a: 255 } as any;
            this.scheduleOnce(() => {
                if (this._sprite && !this._isDead) {
                    this._sprite.color = { r: 255, g: 255, b: 255, a: 255 } as any;
                }
            }, 0.1);
        }

        if (this.hp <= 0) {
            this._die();
            return true;
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
            case MonsterAIType.Charger: return GameConfig.MONSTER_ATK_INTERVAL_CHARGER;
            case MonsterAIType.Ranged: return GameConfig.MONSTER_ATK_INTERVAL_RANGED;
            case MonsterAIType.Defender: return GameConfig.MONSTER_ATK_INTERVAL_DEFENDER;
            case MonsterAIType.Summoner: return 3.0;
            case MonsterAIType.Suicider: return 2.0;
            case MonsterAIType.Elite: return 1.2;
            default: return 1.5;
        }
    }

    private _setState(state: MonsterState): void {
        const oldState = this._state;
        this._state = state;

        // 验证状态转移合法性
        if (!this._isValidTransition(oldState, state)) {
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

    private _isValidTransition(from: MonsterState, to: MonsterState): boolean {
        if (from === MonsterState.Dead) return false;
        if (from === to) return true;
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

    // ======== 元素状态效果 API ========

    freeze(duration: number): void {
        this._freezeTimer = Math.max(this._freezeTimer, duration);
        eventBus.emit('monster:status_freeze', this, duration);
    }

    silence(duration: number): void {
        this._silenceTimer = Math.max(this._silenceTimer, duration);
        eventBus.emit('monster:status_silence', this, duration);
    }

    applyDefDebuff(multiplier: number, duration: number, isDamageTaken: boolean = false): void {
        if (isDamageTaken) {
            this._damageTakenMultiplier = Math.max(GameConfig.MIN_DAMAGE, multiplier);
        } else {
            this._defMultiplier = Math.min(1, Math.max(0.1, multiplier));
        }
        this._debuffTimer = Math.max(this._debuffTimer, duration);
    }

    updateStatusTimers(dt: number): void {
        if (this._freezeTimer > 0) {
            this._freezeTimer = Math.max(0, this._freezeTimer - dt);
        }
        if (this._silenceTimer > 0) {
            this._silenceTimer = Math.max(0, this._silenceTimer - dt);
        }
        if (this._debuffTimer > 0) {
            this._debuffTimer = Math.max(0, this._debuffTimer - dt);
            if (this._debuffTimer <= 0) {
                this._defMultiplier = 1;
                this._damageTakenMultiplier = 1;
            }
        }
    }

    // ======== 访问器 ========

    get state(): MonsterState { return this._state; }
    get gridX(): number { return this._gridX; }
    get gridY(): number { return this._gridY; }
    get isDead(): boolean { return this._isDead; }
    get hpPercent(): number { return this._maxHP > 0 ? this.hp / this._maxHP : 0; }
    get isFrozen(): boolean { return this._freezeTimer > 0; }
    get isSilenced(): boolean { return this._silenceTimer > 0; }
    get isBoss(): boolean { return this._isBoss; }
    get currentPhase(): number { return this._currentPhase; }
    get maxPhases(): number { return this._phases; }
    get maxHP(): number { return this._maxHP; }
}
