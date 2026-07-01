/**
 * MainSceneController - Main scene bootstrap (simplified)
 *
 * Responsibilities:
 *   1. Listen for flow state changes
 *   2. Register and initialize all main-scene panels with UiRouter
 *   3. No longer manages dungeon entry directly
 *
 * Dungeon entry goes through: AreaSelectPanel -> RunCoordinator -> AppFlowController
 */

import { _decorator, Component } from 'cc';
import { PlayerDataManager } from './core/PlayerDataManager';
import { ShopUI } from './ui/ShopUI';
import { WXAdapter } from './utils/WXAdapter';
import { UiRouter } from './ui/UiRouter';
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

        // Register all main-scene panels with UiRouter
        this._registerPanels();

        // Listen for flow state changes
        eventBus.on('appflow:state_changed', this._onFlowState, this);
        eventBus.on('ui:open_shop', this._onOpenShop, this);
    }

    private _registerPanels(): void {
        const panels = [
            { id: 'area_select' as const, nodeName: 'AreaSelectPanel' },
            { id: 'character' as const, nodeName: 'CharacterPanel' },
            { id: 'settlement' as const, nodeName: 'SettlementPanel' },
            { id: 'settings' as const, nodeName: 'SettingsPanel' },
            { id: 'adventure_log' as const, nodeName: 'AdventureLogPanel' },
        ];

        for (const p of panels) {
            const node = this.node.getChildByName(p.nodeName);
            if (!node) {
                console.warn(`[MainScene] panel node not found: ${p.nodeName}`);
                continue;
            }
            const comp = node.getComponent(p.id as any) as any;
            if (comp && typeof comp.open === 'function') {
                UiRouter.instance.register(comp);
                console.log(`[MainScene] registered panel: ${p.id}`);
            }
        }
    }

    private _onFlowState(state: string): void {
        switch (state) {
            case AppFlowState.SETTLEMENT:
                UiRouter.instance.open('settlement');
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
