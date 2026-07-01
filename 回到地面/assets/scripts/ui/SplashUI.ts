/**
 * SplashUI - Splash screen
 *
 * 2-second minimum display, click to skip.
 * After loading completes, delegates to AppFlowController.start()
 * instead of directly calling loadScene.
 */

import { _decorator, Component, Node, Label, tween, UIOpacity } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { GameManager } from '../core/GameManager';
import { GameBootstrap } from '../core/GameBootstrap';
import { AppFlowController } from '../app/AppFlowController';

const { ccclass, property } = _decorator;

@ccclass('SplashUI')
export class SplashUI extends Component {
    @property(Label)
    skipLabel: Label | null = null;

    @property(Node)
    splashImage: Node | null = null;

    private _elapsed = 0;
    private _hasSkipped = false;
    private _bootstrap: GameBootstrap | null = null;
    private _loadingDone = false;

    onLoad(): void {
        GameManager.ensure(this.node.scene);
        this._bootstrap = GameBootstrap.ensure(this.node.scene ?? this.node);
        this.node.on(Node.EventType.TOUCH_END, this._onSkip, this);
    }

    start(): void {
        if (!this.splashImage || !this.splashImage.active) {
            this._tryProceed();
            return;
        }

        const opacity = this.splashImage.getComponent(UIOpacity);
        if (opacity) {
            opacity.opacity = 0;
            tween(opacity).to(0.3, { opacity: 255 }).start();
        }
    }

    update(dt: number): void {
        if (this._hasSkipped) return;

        this._elapsed += dt;

        // Check if bootstrap is ready
        if (!this._loadingDone && this._bootstrap?.ready) {
            this._loadingDone = true;
        }

        // Auto proceed after minimum duration + loading done
        if (this._elapsed >= GameConfig.SPLASH_MIN_DURATION && this._loadingDone) {
            this._proceed();
        }

        // Show skip label after 1s
        if (this.skipLabel && this._elapsed > 1.0) {
            this.skipLabel.node.active = true;
        }
    }

    private _onSkip(): void {
        if (this._hasSkipped) return;
        if (this._elapsed < 0.5) return;

        if (this._loadingDone) {
            this._proceed();
        }
    }

    private _tryProceed(): void {
        if (this._bootstrap?.ready || this._bootstrap?.error) {
            this._proceed();
        } else {
            this.scheduleOnce(() => this._tryProceed(), 0.2);
        }
    }

    private _proceed(): void {
        if (this._hasSkipped) return;
        if (this._bootstrap?.error) {
            console.error('[SplashUI] bootstrap error:', this._bootstrap.error);
            return;
        }
        this._hasSkipped = true;

        // Delegate to AppFlowController state machine
        console.log('[SplashUI] loading done, starting flow');
        AppFlowController.ensure().start();
    }

    onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this._onSkip, this);
        this.unscheduleAllCallbacks();
    }
}
