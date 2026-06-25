/**
 * RoomTransition - 房间切换过渡
 * 处理房间切换的过渡动画、入口/出口逻辑
 * 战斗房不全清 → 出口关闭
 */

import { _decorator, Component, Node, tween, Vec3, UIOpacity } from 'cc';
import { BATTLE_CONSTANTS } from '../core/Constants';
import { eventBus } from '../core/EventBus';

const { ccclass, property } = _decorator;

@ccclass('RoomTransition')
export class RoomTransition extends Component {
    @property(Node)
    roomContainer: Node | null = null;  // 房间内容容器（淡入淡出）
    @property(Node)
    doorNode: Node | null = null;       // 出口门节点

    private _isTransitioning: boolean = false;
    private _isDoorOpen: boolean = false;

    onLoad(): void {
        eventBus.on('battle:victory', this._onVictory, this);
        eventBus.on('battle:started', this._onBattleStarted, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    /** 进入房间过渡动画 */
    enterRoom(callback?: () => void): void {
        if (this._isTransitioning) return;
        this._isTransitioning = true;
        this._isDoorOpen = false;

        // 默认出口关闭
        this._setDoorOpen(false);

        // 淡入动画
        const opacity = this.roomContainer?.getComponent(UIOpacity);
        if (opacity) {
            opacity.opacity = 0;
            tween(opacity)
                .to(BATTLE_CONSTANTS.ROOM_TRANSITION_DURATION, { opacity: 255 })
                .call(() => {
                    this._isTransitioning = false;
                    callback?.();
                })
                .start();
        } else {
            this.scheduleOnce(() => {
                this._isTransitioning = false;
                callback?.();
            }, BATTLE_CONSTANTS.ROOM_TRANSITION_DURATION);
        }
    }

    /** 退出房间过渡动画 */
    exitRoom(callback?: () => void): void {
        if (this._isTransitioning) return;
        this._isTransitioning = true;

        const opacity = this.roomContainer?.getComponent(UIOpacity);
        if (opacity) {
            tween(opacity)
                .to(BATTLE_CONSTANTS.ROOM_TRANSITION_DURATION, { opacity: 0 })
                .call(() => {
                    this._isTransitioning = false;
                    callback?.();
                })
                .start();
        } else {
            this.scheduleOnce(() => {
                this._isTransitioning = false;
                callback?.();
            }, BATTLE_CONSTANTS.ROOM_TRANSITION_DURATION);
        }
    }

    /** 战斗胜利 → 开启出口 */
    private _onVictory(): void {
        this._setDoorOpen(true);
    }

    /** 战斗开始 → 关闭出口 */
    private _onBattleStarted(): void {
        this._setDoorOpen(false);
    }

    private _setDoorOpen(open: boolean): void {
        this._isDoorOpen = open;
        if (this.doorNode) {
            this.doorNode.active = !open;
        }
        eventBus.emit('room:door_changed', open);
    }

    get isTransitioning(): boolean { return this._isTransitioning; }
    get isDoorOpen(): boolean { return this._isDoorOpen; }
}
