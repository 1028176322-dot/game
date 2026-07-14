/**
 * SplashUI - Splash screen with loading progress bar
 *
 * 2-second minimum display, click to skip.
 * Shows a progress bar while loading.
 * After loading completes, delegates to AppFlowController.start().
 */

import { _decorator, Component, Node, Label, Graphics, Color, tween, UIOpacity } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { GameManager } from '../core/GameManager';
import { GameBootstrap } from '../core/GameBootstrap';
import { AppFlowController } from '../app/AppFlowController';
import { UISkinSceneApplier } from './UISkinSceneApplier';
import { SceneModelPreview, PreviewHandle } from '../render/SceneModelPreview';
import { loadUI3DBackdropConfig } from '../config/ui3d';

const { ccclass, property } = _decorator;

const BAR_WIDTH = 380;
const BAR_HEIGHT = 24;
const BAR_RADIUS = 6;

@ccclass('SplashUI')
export class SplashUI extends Component {
    @property(Label)
    skipLabel: Label | null = null;

    @property(Node)
    splashImage: Node | null = null;

    @property(Label)
    loadingLabel: Label | null = null;

    @property(Node)
    loadingBar: Node | null = null;

    private _elapsed = 0;
    private _hasSkipped = false;
    private _bootstrap: GameBootstrap | null = null;
    private _loadingDone = false;
    private _progressPct = 0;
    private _backdropHandle: PreviewHandle | null = null;

    // Progress bar nodes (created in code)
    private _barBg: Graphics | null = null;
    private _barFill: Graphics | null = null;

    onLoad(): void {
        GameManager.ensure(this.node.scene);
        this._bootstrap = GameBootstrap.ensure(this.node.scene ?? this.node);
        void UISkinSceneApplier.applyScene(this.node.scene ?? this.node, 'splash');

        // Create progress bar nodes
        this._createProgressBar();

        // Bind bootstrap progress
        if (this._bootstrap) {
            this._bootstrap.onProgress = (pct, msg) => {
                this._progressPct = pct;
                this._updateBar(pct);
                if (this.loadingLabel) {
                    this.loadingLabel.string = msg;
                }
            };
        }

        this.node.on(Node.EventType.TOUCH_END, this._onSkip, this);

        // T5: optional 3D splash backdrop (B-lite, default off). Reuses the
        // existing splashImage as the full-screen slot; degrades to the 2D
        // background if the config is missing or disabled.
        void this._applyBackdropConfig();
    }

    private _createProgressBar(): void {
        // Container for the bar
        const container = this.loadingBar ?? new Node('LoadingBar');
        if (!container.parent) this.node.addChild(container);
        // Position handled by SplashLayout — no hardcoded setPosition
        this.loadingBar = container;

        // Background bar (dark gray)
        const bgNode = new Node('Bg');
        this._barBg = bgNode.addComponent(Graphics);
        this._barBg.fillColor = new Color(0x33, 0x33, 0x33, 0xFF);
        this._drawBarBg(0);
        container.addChild(bgNode);

        // Fill bar (blue)
        const fillNode = new Node('Fill');
        this._barFill = fillNode.addComponent(Graphics);
        this._barFill.fillColor = new Color(0x4A, 0x9E, 0xFF, 0xFF);
        this._drawBarFill(0);
        container.addChild(fillNode);
    }

    private _drawBarBg(pct: number): void {
        if (!this._barBg) return;
        this._barBg.clear();
        this._barBg.roundRect(-BAR_WIDTH / 2, -BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT, BAR_RADIUS);
        this._barBg.fill();
    }

    private _drawBarFill(pct: number): void {
        if (!this._barFill) return;
        const fillW = Math.max(BAR_WIDTH * (pct / 100), 0);
        this._barFill.clear();
        if (fillW > 0) {
            this._barFill.roundRect(-BAR_WIDTH / 2, -BAR_HEIGHT / 2, fillW, BAR_HEIGHT, BAR_RADIUS);
            this._barFill.fill();
        }
    }

    private _updateBar(pct: number): void {
        this._drawBarFill(pct);
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

        if (!this._loadingDone && this._bootstrap?.ready) {
            this._loadingDone = true;
        }

        if (this._elapsed >= GameConfig.SPLASH_MIN_DURATION && this._loadingDone) {
            this._proceed();
        }

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
        console.log('[SplashUI] loading done, starting flow');
        AppFlowController.ensure().start();
    }

    private async _applyBackdropConfig(): Promise<void> {
        if (!this.splashImage) return; // degrade: keep existing 2D splash
        const cfg = await loadUI3DBackdropConfig('splashBackdrop');
        if (!cfg?.enabled || !cfg.modelAssetId) return; // degrade: keep 2D splash
        // Reuse the existing full-screen splashImage as the RT slot (approach B:
        // no new node). The 3D model renders offscreen into a RenderTexture
        // pasted back onto a Sprite child of splashImage.
        this._backdropHandle = await SceneModelPreview.instance.showBackdropInSlot(
            this.splashImage,
            cfg.modelAssetId,
            {
                ownerId: 'Splash',
                transparent: cfg.transparent ?? false,
                fallback2dKey: cfg.fallback2dKey,
            },
        );
    }

    onDestroy(): void {
        if (this._backdropHandle) {
            this._backdropHandle.destroy();
            this._backdropHandle = null;
        }
        SceneModelPreview.instance.clearOwner('Splash');
        this.node.off(Node.EventType.TOUCH_END, this._onSkip, this);
        this.unscheduleAllCallbacks();
    }
}
