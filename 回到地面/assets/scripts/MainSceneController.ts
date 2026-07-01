/**
 * MainSceneController - Main scene bootstrap (simplified)
 *
 * Responsibilities:
 *   1. Listen for flow state changes
 *   2. Register and initialize all main-scene panels with UiRouter
 *   3. No longer manages dungeon entry directly
 */

import { _decorator, Component } from 'cc';
import { PlayerDataManager } from './core/PlayerDataManager';
import { ShopUI } from './ui/ShopUI';
import { WXAdapter } from './utils/WXAdapter';
import { UiRouter, UIPanel } from './ui/UiRouter';
import { AppFlowController, AppFlowState } from './app/AppFlowController';
import { eventBus } from './core/EventBus';

const { ccclass, property } = _decorator;

@ccclass('MainSceneController')
export class MainSceneController extends Component {
    @property(ShopUI)
    shopUI: ShopUI | null = null;

    onLoad(): void {
        PlayerDataManager.getInstance();
        this.shopUI?.init();

        WXAdapter.getInstance().showBanner();
        WXAdapter.getInstance().reportAnalytics('game_start', {
            day: new Date().getDate(),
        });

        this._registerPanels();
        eventBus.on('appflow:state_changed', this._onFlowState, this);
        eventBus.on('ui:open_shop', this._onOpenShop, this);
    }

    private _registerPanels(): void {
        const router = UiRouter.instance;
        const candidates = [
            'LoginPanel', 'CreatePanel', 'CharacterPanel',
            'AreaSelectPanel', 'SettlementPanel',
            'SettingsPanel', 'AdventureLogPanel',
        ];

        for (const name of candidates) {
            // Recursive search: panel may be nested under UIRoot/ or MainUI/
            const node = this._findChildRecursive(this.node, name);
            if (!node) continue;
            const comp = node.getComponent(name) as unknown as UIPanel;
            if (comp && typeof comp.open === 'function' && typeof comp.close === 'function') {
                router.register(comp);
                console.log(`[MainScene] registered panel: ${name}`);
            }
        }
    }

    private _findChildRecursive(parent: Node, name: string): Node | null {
        if (parent.name === name) return parent;
        for (const child of parent.children) {
            const found = this._findChildRecursive(child, name);
            if (found) return found;
        }
        return null;
    }

    private _onFlowState(state: string): void {
        const router = UiRouter.instance;
        switch (state) {
            case AppFlowState.AUTH_CHECK:
                router.open('login');
                break;
            case AppFlowState.PROFILE_CHECK:
                router.open('create_character');
                break;
            case AppFlowState.SETTLEMENT:
                router.open('settlement');
                break;
            default:
                break;
        }
    }

    private _onOpenShop(): void {
        UiRouter.instance.open('shop');
    }

    onDestroy(): void {
        eventBus.offTarget(this);
        this.unscheduleAllCallbacks();
    }
}
