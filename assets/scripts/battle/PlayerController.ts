/**
 * PlayerController - 玩家角色控制器
 * 负责角色移动、4 方向动画、翻滚、HP 管理
 * 状态切换走统一 setState，禁止散落赋值
 */

import { _decorator, Component, Node, Vec3, tween, Sprite, Animation } from 'cc';
import { PlayerState, BATTLE_CONSTANTS } from '../core/Constants';
import { eventBus, GameEvent } from '../core/GameManager';
import { JoystickDirection, JoystickEvent } from '../ui/VirtualJoystick';
import { GridManager, GridCell } from '../dungeon/GridManager';

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
    moveSpeed: number = BATTLE_CONSTANTS.PLAYER_MOVE_SPEED;

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
        this._currentHP = this.maxHP;
        this._sprite = this.getComponent(Sprite);
        this._animation = this.getComponent(Animation);
    }

    /** 初始化网格引用 */
    init(gridManager: GridManager): void {
        this._gridManager = gridManager;
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

    /** 尝试移动 */
    private _tryMove(dx: number, dy: number): void {
        if (this._isMoving) return;
        if (!this._gridManager) return;

        const newX = this._gridX + dx;
        const newY = this._gridY + dy;

        if (this._gridManager.isWalkable(newX, newY)) {
            this._gridManager.setOccupied(this._gridX, this._gridY, false);
            this._gridX = newX;
            this._gridY = newY;
            this._gridManager.setOccupied(newX, newY, true);
            this._targetPos = this._gridManager.gridToWorld(newX, newY);

            this._setState(PlayerState.Moving);
            this._isMoving = true;

            tween(this.node)
                .to(1 / this.moveSpeed * BATTLE_CONSTANTS.TILE_SIZE, { position: this._targetPos })
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
        this._dodgeCooldown = BATTLE_CONSTANTS.DODGE_COOLDOWN;
        this._dodgeTimer = BATTLE_CONSTANTS.DODGE_DURATION;

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
            this._dodgeTimer = BATTLE_CONSTANTS.DODGE_DURATION;
            this.scheduleOnce(() => {
                this._isDodging = false;
                if (this._state === PlayerState.Dodging) {
                    this._setState(PlayerState.Idle);
                }
            }, BATTLE_CONSTANTS.DODGE_DURATION);
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
            // 水平翻转
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

    /** 受到伤害 */
    takeDamage(rawDamage: number, isCrit: boolean = false): void {
        if (this._isDodging) return; // 无敌帧免疫伤害

        const actualDamage = this._calcDamage(rawDamage);
        this._currentHP = Math.max(0, this._currentHP - actualDamage);
        this.onHPChanged?.(this._currentHP, this.maxHP);

        // 显示伤害数字回调
        eventBus.emit('player:damaged', actualDamage, isCrit);

        if (this._currentHP <= 0) {
            this._setState(PlayerState.Dead);
            eventBus.emit(GameEvent.GAME_OVER);
        }
    }

    /** 伤害公式：ATK + d6 - DEF × 0.5 */
    private _calcDamage(rawDamage: number): number {
        const d6Roll = Math.floor(Math.random() * 6) + 1;
        const reduced = Math.floor(this.def * BATTLE_CONSTANTS.DAMAGE_FORMULA_DEF_FACTOR);
        return Math.max(1, rawDamage + d6Roll - reduced);
    }

    /** 回血 */
    heal(amount: number): void {
        this._currentHP = Math.min(this.maxHP, this._currentHP + amount);
        this.onHPChanged?.(this._currentHP, this.maxHP);
        eventBus.emit('player:healed', amount);
    }

    /** 更新 CD（每帧调用） */
    update(dt: number): void {
        if (this._dodgeCooldown > 0) {
            this._dodgeCooldown = Math.max(0, this._dodgeCooldown - dt);
        }
        if (this._dodgeTimer > 0) {
            this._dodgeTimer = Math.max(0, this._dodgeTimer - dt);
        }
    }

    // ======== 属性访问 ========
    get state(): PlayerState { return this._state; }
    get currentHP(): number { return this._currentHP; }
    get gridX(): number { return this._gridX; }
    get gridY(): number { return this._gridY; }
    get isDodging(): boolean { return this._isDodging; }
    get isAlive(): boolean { return this._currentHP > 0; }
}
