import { _decorator, Component, Label, Node } from 'cc';
import { AssetBundleService } from '../assets/AssetBundleService';
import { ConfigService } from '../config/ConfigService';
import { ConfigManager } from './ConfigManager';
import { GameManager } from './GameManager';
import { SceneFlowService } from '../app/SceneFlowService';

const { ccclass, property } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property(Label)
    statusLabel: Label | null = null;

    /** Optional callback: (progressPercent, statusMessage) */
    onProgress: ((pct: number, msg: string) => void) | null = null;

    private _ready = false;
    private _error: string | null = null;

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
        } catch (err) {
            this._error = err instanceof Error ? err.message : String(err);
            this._emitProgress(100, `Failed: ${this._error}`);
            this._setStatus(`启动失败：${this._error}`);
            console.error('[GameBootstrap] startup failed:', err);
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
    }
}
