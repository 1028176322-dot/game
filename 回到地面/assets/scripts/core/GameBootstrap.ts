import { _decorator, Component, Label, Node, Camera } from 'cc';
import { AssetBundleService } from '../assets/AssetBundleService';
import { ConfigService } from '../config/ConfigService';
import { ConfigManager } from './ConfigManager';
import { GameManager } from './GameManager';
import { SceneFlowService } from '../app/SceneFlowService';
import { GameContext, ILogger, IConfigDatabase, IAssetCache, ICameraBrain, ICollisionService } from './GameContext';
import { Logger } from './Logger';
import { ConfigDatabase } from './ConfigDatabase';
import { LifecycleManager, ILifecycle } from './LifecycleManager';
import { AssetCache } from '../assets/AssetCache';
import { CameraBrain, CameraMode, ICameraNode } from '../camera/CameraBrain';
import { PhysicsCollisionImpl } from '../physics/PhysicsCollisionImpl';

const { ccclass, property } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property(Label)
    statusLabel: Label | null = null;

    /** Optional callback: (progressPercent, statusMessage) */
    onProgress: ((pct: number, msg: string) => void) | null = null;

    private _ready = false;
    private _error: string | null = null;
    private _ctx: GameContext | null = null;
    private _lifecycle: LifecycleManager | null = null;

    get ready(): boolean {
        return this._ready;
    }

    get error(): string | null {
        return this._error;
    }

    async onLoad(): Promise<void> {
        GameManager.ensure(this.node.scene);
        await this.startup();
    }

    async startup(): Promise<void> {
        if (this._ready || this._error) return;

        try {
            this._emitProgress(5, 'Starting...');
            this._setStatus('正在加载配置...');
            this._emitProgress(10, 'Loading config...');
            await ConfigService.instance.loadAll();

            this._emitProgress(50, 'Loading local config...');
            ConfigManager.getInstance().loadAll();

            this._emitProgress(70, 'Loading asset map...');
            await AssetBundleService.instance.loadAssetMapFromResources();

            this._emitProgress(95, 'Finalizing...');

            this._ready = true;
            this._emitProgress(100, 'Done');
            this._setStatus('加载完成');
            console.log('[GameBootstrap] startup complete');

            // Demo0 D0-5: wire GameContext + LifecycleManager (infra only, non-blocking).
            try {
                this._wireInfra();
            } catch (infraErr) {
                console.warn('[GameBootstrap] infra wiring demo skipped:', infraErr);
            }
        } catch (err) {
            this._error = err instanceof Error ? err.message : String(err);
            this._emitProgress(100, `Failed: ${this._error}`);
            this._setStatus(`启动失败：${this._error}`);
            console.error('[GameBootstrap] startup failed:', err);
        }
    }

    private _wireInfra(): void {
        // Demo0 D0-5: assemble the four core infra via GameContext (ServiceLocator).
        // Proves DI injection + ILifecycle broadcast are wired. Only infra classes are
        // `new`-ed here (no business System, per red line 4).
        // ConfigDatabase does NOT implement ILifecycle, so it is NOT registered into
        // LifecycleManager (avoid faking lifecycle, per D0-5 strict constraint).
        this._ctx = new GameContext();
        this._ctx.register(ILogger, new Logger(true));
        this._ctx.register(IConfigDatabase, new ConfigDatabase());
        this._lifecycle = new LifecycleManager();

        // Demo1: AssetCache — loader delegates to existing AssetBundleService (no re-implementation).
        // Implements ILifecycle, so it is registered into LifecycleManager for teardown.
        const assetCache = new AssetCache((id) => AssetBundleService.instance.loadById(id));
        this._ctx.register(IAssetCache, assetCache);
        this._lifecycle.register(assetCache);

        // Demo2: CameraBrain — 7-mode follow camera (§3.4). Implements ILifecycle, so it joins
        // LifecycleManager teardown. Mode params are sourced from ConfigDatabase.getCamera.
        const cameraBrain = new CameraBrain(this._ctx.get<ConfigDatabase>(IConfigDatabase));
        this._ctx.register(ICameraBrain, cameraBrain);
        this._lifecycle.register(cameraBrain);
        const mainCam = this._findMainCamera();
        if (mainCam) {
          cameraBrain.attach(mainCam);
        }
        cameraBrain.setMode(CameraMode.Follow);

        // Demo3: PhysicsCollisionImpl — ICollisionService (§3.3). Pure TS, no cc, deterministic.
        // Implements ILifecycle so it joins LifecycleManager teardown (red line 3).
        const collision = new PhysicsCollisionImpl();
        this._ctx.register(ICollisionService, collision);
        this._lifecycle.register(collision);

        const logger = this._ctx.get<Logger>(ILogger);
        // Demo probe (NOT a business system): implements ILifecycle so LifecycleManager
        // can broadcast lifecycle events; each method logs via the injected Logger.
        const probe: ILifecycle = {
            initialize: () => logger.channel('battle').info('Initialize'),
            enter:      () => logger.channel('battle').info('Enter'),
            pause:      () => logger.channel('battle').info('Pause'),
            resume:     () => logger.channel('battle').info('Resume'),
            exit:       () => logger.channel('battle').info('Exit'),
            destroy:    () => logger.channel('battle').info('Destroy'),
        };
        this._lifecycle.register(probe);
        probe.initialize(this._ctx);
        this._lifecycle.enterAll();
        this._lifecycle.pauseAll();
        this._lifecycle.resumeAll();
        this._lifecycle.exitAll();
        this._lifecycle.destroyAll();
    }

    private _findMainCamera(): ICameraNode | null {
        // Locate the scene's main camera node and attach it to CameraBrain.
        // Non-fatal: CameraBrain works in logic-only mode until a camera is attached.
        try {
            const scene = this.node.scene;
            const cam = scene.getComponentInChildren(Camera);
            return cam ? (cam.node as unknown as ICameraNode) : null;
        } catch {
            return null;
        }
    }

    private _emitProgress(pct: number, msg: string): void {
        if (this.onProgress) {
            this.onProgress(pct, msg);
        }
    }

    goToMain(): void {
        if (this._error) {
            console.warn('[GameBootstrap] blocked by startup error:', this._error);
            return;
        }
        if (!this._ready) {
            this.scheduleOnce(() => this.goToMain(), 0.2);
            return;
        }
        SceneFlowService.instance.goToMain();
    }

    private _setStatus(text: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = text;
        }
    }

    static find(root: Node): GameBootstrap | null {
        if (!this._isSceneRoot(root)) {
            const own = root.getComponent(GameBootstrap);
            if (own) return own;
        }
        for (const child of root.children) {
            const found = GameBootstrap.find(child);
            if (found) return found;
        }
        return null;
    }

    static ensure(root: Node): GameBootstrap {
        const existing = GameBootstrap.find(root);
        if (existing) return existing;

        let node = root.getChildByName('GameBootstrap');
        if (!node) {
            node = new Node('GameBootstrap');
            root.addChild(node);
        }
        return node.getComponent(GameBootstrap) ?? node.addComponent(GameBootstrap);
    }

    private static _isSceneRoot(node: Node): boolean {
        return node.constructor?.name === 'Scene';
    }

    onDestroy(): void {
        this.unscheduleAllCallbacks();
        this._ctx?.onDestroy();
    }
}
