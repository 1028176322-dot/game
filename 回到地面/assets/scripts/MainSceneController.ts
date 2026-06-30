import { _decorator, Button, Component, director, Node } from 'cc';
import { AssetBundleService } from './assets/AssetBundleService';
import { ConfigService } from './config/ConfigService';
import { ConfigManager } from './core/ConfigManager';
import { eventBus } from './core/EventBus';
import { GameEvent, GameManager } from './core/GameManager';
import { PlayerDataManager } from './core/PlayerDataManager';
import { ShopUI } from './ui/ShopUI';
import { WXAdapter } from './utils/WXAdapter';

const { ccclass, property } = _decorator;

@ccclass('MainSceneController')
export class MainSceneController extends Component {
    @property(ShopUI)
    shopUI: ShopUI | null = null;

    private _ready = false;
    private _enteringDungeon = false;

    onLoad(): void {
        GameManager.ensure(director.getScene());
        void this._ensureStartupReady();

        PlayerDataManager.getInstance();
        this.shopUI?.init();

        WXAdapter.getInstance().showBanner();
        WXAdapter.getInstance().reportAnalytics('game_start', {
            day: new Date().getDate(),
        });

        eventBus.on('scene:transition', this._onSceneTransition, this);
        eventBus.on(GameEvent.DUNGEON_ENTER, this._onDungeonEnter, this);
        eventBus.on('ui:open_shop', this._onOpenShop, this);

        this._bindMainButtons();
    }

    private async _ensureStartupReady(): Promise<void> {
        try {
            if (!ConfigService.instance.loaded) {
                await ConfigService.instance.loadAll();
            }
            ConfigManager.getInstance().loadAll();
            await AssetBundleService.instance.loadAssetMapFromResources();
            this._ready = true;
        } catch (err) {
            this._ready = false;
            console.error('[MainSceneController] startup failed:', err);
        }
    }

    private _bindMainButtons(): void {
        const root = this.node.parent ?? this.node;
        const startNode = this._findChildByName(root, 'StartButton');
        const startButton = startNode?.getComponent(Button);
        if (!startButton) {
            console.error('[MainSceneController] StartButton is missing or has no Button component.');
            return;
        }
        startButton.node.off(Button.EventType.CLICK, this._onStartClick, this);
        startButton.node.on(Button.EventType.CLICK, this._onStartClick, this);
    }

    private _findChildByName(root: Node, name: string): Node | null {
        if (root.name === name) return root;
        for (const child of root.children) {
            const found = this._findChildByName(child, name);
            if (found) return found;
        }
        return null;
    }

    private _onStartClick(): void {
        if (this._enteringDungeon) return;
        if (!this._ready) {
            console.warn('[MainSceneController] startup is not ready, delaying dungeon enter.');
            this.scheduleOnce(() => this._onStartClick(), 0.2);
            return;
        }

        WXAdapter.getInstance().hideBanner();
        eventBus.emit(GameEvent.DUNGEON_ENTER, GameManager.instance?.currentFloor ?? 1);
    }

    private _onOpenShop(): void {
        this.shopUI?.show();
    }

    private _onSceneTransition(targetScene: string): void {
        if (targetScene === 'dungeon') {
            this._loadDungeonScene();
        }
    }

    private _onDungeonEnter(_floor: number): void {
        this._enteringDungeon = true;
        const gm = GameManager.ensure(director.getScene());
        const route = gm.initNewRun();
        console.log('[MainSceneController] zone route:', route.join(' -> '));
        this._loadDungeonScene();
    }

    private _loadDungeonScene(): void {
        director.loadScene('dungeon');
    }

    onDestroy(): void {
        eventBus.offTarget(this);
        this.unscheduleAllCallbacks();
    }
}
