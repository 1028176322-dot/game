/**
 * VirtualJoystick - 虚拟摇杆
 * 左半屏触摸/鼠标区域，输入延迟 < 50ms
 * 不直接操作游戏数据，仅转发输入方向
 */

import { _decorator, Component, Node, EventTouch, Touch, input, Input, Vec2, Vec3, tween, UITransform } from 'cc';

const { ccclass, property } = _decorator;

export enum JoystickDirection {
    None = 'none',
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right',
    UpLeft = 'upLeft',
    UpRight = 'upRight',
    DownLeft = 'downLeft',
    DownRight = 'downRight',
}

export interface JoystickEvent {
    direction: JoystickDirection;
    normalized: Vec2;       // 归一化方向向量
    raw: Vec2;              // 原始偏移量
    isActive: boolean;
}

@ccclass('VirtualJoystick')
export class VirtualJoystick extends Component {
    @property(Node)
    joystickBg: Node | null = null;       // 摇杆背景（编辑器拖入）
    @property(Node)
    joystickThumb: Node | null = null;    // 摇杆摇钮（编辑器拖入）

    private _maxRadius: number = 50;
    private _touchId: number | null = null;
    private _isActive: boolean = false;
    private _currentDirection: JoystickDirection = JoystickDirection.None;
    private _centerPos: Vec3 = new Vec3(0, 0, 0);
    private _onMoveCallback: ((event: JoystickEvent) => void) | null = null;
    private _onEndCallback: (() => void) | null = null;

    /** 设置移动回调 */
    setMoveCallback(cb: (event: JoystickEvent) => void): void {
        this._onMoveCallback = cb;
    }

    /** 设置结束回调 */
    setEndCallback(cb: () => void): void {
        this._onEndCallback = cb;
    }

    onLoad(): void {
        this._centerPos = this.node.getPosition();
        this._registerInput();
    }

    private _registerInput(): void {
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    private _onTouchStart(touch: Touch, event: EventTouch): void {
        if (this._touchId !== null) return; // 已有一个触摸

        const uiPos = touch.getUILocation();
        const halfW = this.node.parent?.getComponent(UITransform)?.width ?? 720;

        // 只处理左半屏触摸
        if (uiPos.x > halfW / 2) return;

        this._touchId = touch.getID();
        this._isActive = true;
        this._updateFromTouch(touch);
    }

    private _onTouchMove(touch: Touch, event: EventTouch): void {
        if (touch.getID() !== this._touchId) return;
        this._updateFromTouch(touch);
    }

    private _onTouchEnd(touch: Touch, event: EventTouch): void {
        if (touch.getID() !== this._touchId) return;
        this._reset();
        this._onEndCallback?.();
    }

    private _updateFromTouch(touch: Touch): void {
        if (!this.joystickThumb || !this.joystickBg) return;

        const touchPos = touch.getUILocation();
        const bgWorldPos = this.joystickBg.getWorldPosition();
        const bgTransform = this.joystickBg.getComponent(UITransform);
        if (!bgTransform) return;

        // 计算偏移
        const offsetX = touchPos.x - bgWorldPos.x;
        const offsetY = touchPos.y - bgWorldPos.y;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

        // 限制在最大半径内
        const clampedX = offsetX;
        const clampedY = offsetY;
        const normalizedX = distance > 0 ? offsetX / distance : 0;
        const normalizedY = distance > 0 ? offsetY / distance : 0;

        let thumbX = clampedX;
        let thumbY = clampedY;
        if (distance > this._maxRadius) {
            thumbX = normalizedX * this._maxRadius;
            thumbY = normalizedY * this._maxRadius;
        }

        this.joystickThumb.setPosition(thumbX, thumbY, 0);

        // 计算方向
        const direction = this._getDirection(normalizedX, normalizedY);
        this._currentDirection = direction;

        // 回调
        this._onMoveCallback?.({
            direction,
            normalized: new Vec2(normalizedX, normalizedY),
            raw: new Vec2(offsetX, offsetY),
            isActive: true,
        });
    }

    private _getDirection(nx: number, ny: number): JoystickDirection {
        const absX = Math.abs(nx);
        const absY = Math.abs(ny);
        const threshold = 0.3;

        if (absX < threshold && absY < threshold) return JoystickDirection.None;

        // 4 方向判定（取幅度大的方向）
        if (absX > absY) {
            return nx > 0 ? JoystickDirection.Right : JoystickDirection.Left;
        } else {
            return ny > 0 ? JoystickDirection.Up : JoystickDirection.Down;
        }
    }

    private _reset(): void {
        this._touchId = null;
        this._isActive = false;
        this._currentDirection = JoystickDirection.None;
        if (this.joystickThumb) {
            this.joystickThumb.setPosition(Vec3.ZERO);
        }
    }

    get isActive(): boolean { return this._isActive; }
    get currentDirection(): JoystickDirection { return this._currentDirection; }
}
