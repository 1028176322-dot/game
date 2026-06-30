import { _decorator, Component, director, Label, Node } from 'cc';
import { AssetBundleService } from '../assets/AssetBundleService';
import { ConfigService } from '../config/ConfigService';
import { ConfigManager } from './ConfigManager';
import { GameManager } from './GameManager';

const { ccclass, property } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    @property(Label)
    statusLabel: Label | null = null;

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
            this._setStatus('正在加载配置...');
            await ConfigService.instance.loadAll();
            ConfigManager.getInstance().loadAll();

            this._setStatus('正在加载资源映射...');
            await AssetBundleService.instance.loadAssetMapFromResources();

            this._ready = true;
            this._setStatus('加载完成');
            console.log('[GameBootstrap] startup complete');
        } catch (err) {
            this._error = err instanceof Error ? err.message : String(err);
            this._setStatus(`启动失败：${this._error}`);
            console.error('[GameBootstrap] startup failed:', err);
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
        director.loadScene('main');
    }

    private _setStatus(text: string): void {
        if (this.statusLabel) {
            this.statusLabel.string = text;
        }
    }

    static find(root: Node): GameBootstrap | null {
        const own = root.getComponent(GameBootstrap);
        if (own) return own;
        for (const child of root.children) {
            const found = GameBootstrap.find(child);
            if (found) return found;
        }
        return null;
    }

    static ensure(root: Node): GameBootstrap {
        const existing = GameBootstrap.find(root);
        if (existing) return existing;

        const node = new Node('GameBootstrap');
        root.addChild(node);
        return node.addComponent(GameBootstrap);
    }

    onDestroy(): void {
        this.unscheduleAllCallbacks();
    }
}
