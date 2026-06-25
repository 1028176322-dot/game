/**
 * PlayerController - 玩家角色控制器
 * 负责角色移动、4 方向动画、翻滚、HP 管理
 * 运行时属性通过 PlayerStats 叠加层计算
 * 状态切换走统一 setState，禁止散落赋值
 */

import { _decorator, Component, Node, Vec3, tween, Sprite, Animation } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { PlayerState } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { GameEvent } from '../core/GameManager';
import { JoystickDirection, JoystickEvent } from '../ui/VirtualJoystick';
import { GridManager, GridCell } from '../dungeon/GridManager';
import { PlayerStats } from './PlayerStats';
import { PlayerDataManager } from '../core/PlayerDataManager';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property
    maxHP: number = 100;
    @property
    atk: number = 10;
    @property
    def: number = 3;
    @property
    moveSpeed: number = GameConfig.PLAYER_MOVE_SPEED;

    /** 运行时属性叠加层（外部通过此对象访问最终属性） */
    stats: PlayerStats = PlayerStats.createDefault();

    private _currentHP: number = 100;
    private _state: PlayerState = PlayerState.Idle;
    private _gridX: number = 3;
    private _gridY: number = 3;
    private _targetPos: Vec3 = new Vec3(0, 0, 0);
    private _isMoving: boolean = false;
    private _gridManager: GridManager | null = null;
    private _dodgeTimer: number = 0;
    private _dodgeCooldown: number = 0;
    private _isDodging: boolean = false;
    private _sprite: Sprite | null = null;
    private _animation: Animation | null = null;
    private _lastClickTime: number = 0;
    private _lastClickDir: JoystickDirection = JoystickDirection.None;

    /** 生命值变化回调 */
    onHPChanged: ((current: number, max: number) => void) | null = null;

    onLoad(): void {
        // 从 @property 默认值初始化属性叠加层基础值
        this.stats = PlayerStats.createFromBase({
            atk: this.atk,
            def: this.def,
            maxHP: this.maxHP,
            moveSpeed: this.moveSpeed,
            atkSpeed: GameConfig.AUTO_ATTACK_INTERVAL,
            attackRange: 2,
            critChance: GameConfig.CRIT_BASE_CHANCE,
            critMultiplier: GameConfig.CRIT_MULTIPLIER,
        });
        this._currentHP = this.stats.getFinalStats().maxHP;
        this._sprite = this.getComponent(Sprite);
        this._animation = this.getComponent(Animation);
    }

    /** 初始化网格引用 */
    init(gridManager: GridManager): void {
        this._gridManager = gridManager;
        // 重置玩家属性（新的一局）
        this.stats = PlayerStats.createFromBase({
            atk: this.atk,
            def: this.def,
            maxHP: this.maxHP,
            moveSpeed: this.moveSpeed,
            atkSpeed: GameConfig.AUTO_ATTACK_INTERVAL,
            attackRange: 2,
            critChance: GameConfig.CRIT_BASE_CHANCE,
            critMultiplier: GameConfig.CRIT_MULTIPLIER,
        });
        this._currentHP = this.stats.getFinalStats().maxHP;
        // 出生点：网格中心
        const center = Math.floor(gridManager.gridSize / 2);
        this._gridX = center;
        this._gridY = center;
        this._targetPos = gridManager.gridToWorld(this._gridX, this._gridY);
        this.node.setPosition(this._targetPos);
        gridManager.setOccupied(this._gridX, this._gridY, true);
    }

    /** 处理摇杆输入 */
    handleJoystick(event: JoystickEvent): void {
        if (this._state === PlayerState.Dead || this._state === PlayerState.Dodging) return;

        if (!event.isActive) {
            this._setState(PlayerState.Idle);
            return;
        }

        let dx = 0, dy = 0;
        switch (event.direction) {
            case JoystickDirection.Up: dy = -1; break;
            case JoystickDirection.Down: dy = 1; break;
            case JoystickDirection.Left: dx = -1; break;
            case JoystickDirection.Right: dx = 1; break;
        }

        // 双击同方向 → 翻滚
        if (dx !== 0 || dy !== 0) {
            const now = Date.now();
            if (event.direction === this._lastClickDir && now - this._lastClickTime < 300) {
                this._tryDodge(dx, dy);
                this._lastClickTime = 0;
                return;
            }
            this._lastClickTime = now;
            this._lastClickDir = event.direction;
        }

        this._tryMove(dx, dy);
    }

    /** 尝试移动（使用最终 moveSpeed） */
    private _tryMove(dx: number, dy: number): void {
        if (this._isMoving) return;
        if (!this._gridManager) return;

        const newX = this._gridX + dx;
        const newY = this._gridY + dy;

        if (this._gridManager.isWalkable(newX, newY)) {
            const speed = this.stats.getFinalStats().moveSpeed;
            this._gridManager.setOccupied(this._gridX, this._gridY, false);
            this._gridX = newX;
            this._gridY = newY;
            this._gridManager.setOccupied(newX, newY, true);
            this._targetPos = this._gridManager.gridToWorld(newX, newY);

            this._setState(PlayerState.Moving);
            this._isMoving = true;

            tween(this.node)
                .to(1 / speed * GameConfig.TILE_SIZE, { position: this._targetPos })
                .call(() => {
                    this._isMoving = false;
                    if (this._state !== PlayerState.Dodging) {
                        this._setState(PlayerState.Idle);
                    }
                })
                .start();

            // 面向方向（用于动画）
            this._updateFacing(dx, dy);
        }
    }

    /** 尝试翻滚 */
    private _tryDodge(dx: number, dy: number): void {
        if (this._dodgeCooldown > 0) return;
        if (this._isDodging) return;

        this._setState(PlayerState.Dodging);
        this._isDodging = true;
        this._dodgeCooldown = GameConfig.DODGE_COOLDOWN;
        this._dodgeTimer = GameConfig.DODGE_DURATION;

        eventBus.emit('player:dodged'); // M2.1: 触发穿影标记

        // 翻滚位移（固定 1 格）
        const newX = this._gridX + dx;
        const newY = this._gridY + dy;
        if (this._gridManager && this._gridManager.isWalkable(newX, newY)) {
            this._gridManager.setOccupied(this._gridX, this._gridY, false);
            this._gridX = newX;
            this._gridY = newY;
            this._gridManager.setOccupied(newX, newY, true);
            this._targetPos = this._gridManager.gridToWorld(newX, newY);

            tween(this.node)
                .to(0.3, { position: this._targetPos })
                .call(() => {
                    this._isDodging = false;
                    this._setState(PlayerState.Idle);
                })
                .start();
        } else {
            // 翻滚撞墙：原地触发无敌帧
            this._dodgeTimer = GameConfig.DODGE_DURATION;
            this.scheduleOnce(() => {
                this._isDodging = false;
                if (this._state === PlayerState.Dodging) {
                    this._setState(PlayerState.Idle);
                }
            }, GameConfig.DODGE_DURATION);
        }
    }

    /** 状态切换（统一入口，禁止散落赋值） */
    private _setState(state: PlayerState): void {
        const oldState = this._state;
        this._state = state;

        switch (state) {
            case PlayerState.Idle:
                this._playAnimation('idle');
                break;
            case PlayerState.Moving:
                this._playAnimation('walk');
                break;
            case PlayerState.Dodging:
                this._playAnimation('dodge');
                break;
            case PlayerState.Dead:
                this._playAnimation('die');
                break;
        }
    }

    /** 更新面向方向 */
    private _updateFacing(dx: number, dy: number): void {
        if (this._sprite) {
            if (dx < 0) {
                this.node.setScale(new Vec3(-1, 1, 1));
            } else if (dx > 0) {
                this.node.setScale(new Vec3(1, 1, 1));
            }
        }
    }

    /** 播放动画（缺失时兜底不做处理） */
    private _playAnimation(name: string): void {
        if (this._animation) {
            try {
                this._animation.play(name);
            } catch (err) {
                // 动画缺失：不做处理，不崩溃
            }
        }
    }

    /** 受到伤害（使用最终 DEF + 减伤） */
    takeDamage(rawDamage: number, isCrit: boolean = false): void {
        if (this._isDodging) return; // 无敌帧免疫伤害

        const finalStats = this.stats.getFinalStats();
        const actualDamage = this._calcDamage(rawDamage, finalStats);
        this._currentHP = Math.max(0, this._currentHP - actualDamage);

        const maxHP = finalStats.maxHP;
        this.onHPChanged?.(this._currentHP, maxHP);
        eventBus.emit('player:damaged', actualDamage, isCrit);

        if (this._currentHP <= 0) {
            this._setState(PlayerState.Dead);
            eventBus.emit(GameEvent.GAME_OVER);
        }
    }

    /** 伤害公式：rawDamage + d6 - (DEF × 0.5)，再 × 减伤因子 */
    private _calcDamage(rawDamage: number, stats: { def: number; damageReduction: number }): number {
        const d6Roll = Math.floor(Math.random() * 6) + 1;
        const reduced = Math.floor(stats.def * GameConfig.DAMAGE_FORMULA_DEF_FACTOR);
        const afterDef = Math.max(GameConfig.MIN_DAMAGE, rawDamage + d6Roll - reduced);
        // 应用减伤百分比
        return Math.floor(afterDef * (1 - stats.damageReduction));
    }

    /** 回血（使用最终 maxHP，含铁胃天赋增益） */
    heal(amount: number): void {
        // 铁胃天赋: 回复效果 +30%
        const pdm = PlayerDataManager.getInstance();
        const effectiveAmount = pdm.selectedTalent === 'iron_stomach'
            ? Math.floor(amount * 1.3)
            : amount;

        const maxHP = this.stats.getFinalStats().maxHP;
        this._currentHP = Math.min(maxHP, this._currentHP + effectiveAmount);
        this.onHPChanged?.(this._currentHP, maxHP);
        eventBus.emit('player:healed', effectiveAmount);
    }

    /** 更新 CD + PlayerStats 倒计时修饰符（每帧调用） */
    update(dt: number): void {
        if (this._dodgeCooldown > 0) {
            this._dodgeCooldown = Math.max(0, this._dodgeCooldown - dt);
        }
        if (this._dodgeTimer > 0) {
            this._dodgeTimer = Math.max(0, this._dodgeTimer - dt);
        }
        // 更新属性修饰符计时
        this.stats.update(dt);
    }

    // ======== 属性访问 ========
    get state(): PlayerState { return this._state; }
    get currentHP(): number { return this._currentHP; }
    get gridX(): number { return this._gridX; }
    get gridY(): number { return this._gridY; }
    get isDodging(): boolean { return this._isDodging; }
    get isAlive(): boolean { return this._currentHP > 0; }
}
