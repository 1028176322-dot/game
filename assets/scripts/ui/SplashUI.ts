/**
 * SplashUI - 启动屏 UI
 * 2 秒自动跳转 + 点击跳过
 * 启动图加载异常时直接跳过
 */

import { _decorator, Component, Node, Label, tween, UIOpacity } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { GameManager, GameEvent } from '../core/GameManager';
import { eventBus } from '../core/EventBus';

const { ccclass, property } = _decorator;

@ccclass('SplashUI')
export class SplashUI extends Component {
    @property(Label)
    skipLabel: Label | null = null;   // "点击跳过" 文本
    @property(Node)
    splashImage: Node | null = null;  // 启动图节点

    private _elapsed: number = 0;
    private _hasSkipped: boolean = false;

    onLoad(): void {
        // 点击任意位置跳过
        this.node.on(Node.EventType.TOUCH_END, this._onSkip, this);
    }

    start(): void {
        // 启动图存在性检查（缺失时直接跳转）
        if (!this.splashImage || !this.splashImage.active) {
            this._goToMain();
            return;
        }

        // 启动图淡入
        const opacity = this.splashImage.getComponent(UIOpacity);
        if (opacity) {
            opacity.opacity = 0;
            tween(opacity).to(0.3, { opacity: 255 }).start();
        }
    }

    update(dt: number): void {
        if (this._hasSkipped) return;

        this._elapsed += dt;

        // 2 秒自动跳转
        if (this._elapsed >= GameConfig.SPLASH_DURATION) {
            this._goToMain();
        }

        // "点击跳过" 在 1 秒后显示
        if (this.skipLabel && this._elapsed > 1.0) {
            this.skipLabel.node.active = true;
        }
    }

    private _onSkip(): void {
        if (this._hasSkipped) return;
        if (this._elapsed < 0.5) return; // 至少展示 0.5 秒
        this._goToMain();
    }

    private _goToMain(): void {
        if (this._hasSkipped) return;
        this._hasSkipped = true;

        eventBus.emit('scene:transition', 'main');

        const gm = GameManager.instance;
        if (gm) {
            gm.setPhase(GamePhase.MainMenu);
        }
    }

    onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this._onSkip, this);
    }
}
