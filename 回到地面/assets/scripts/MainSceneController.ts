/**
 * MainSceneController - Main scene bootstrap (simplified)
 *
 * Responsibilities reduced to:
 *   1. Listen for flow state changes
 *   2. Initialize main-scene panels
 *   3. No longer manages dungeon entry directly
 *
 * Dungeon entry now goes through: AreaSelectPanel -> RunCoordinator -> AppFlowController
 */

import { _decorator, Component, director } from 'cc';
import { AssetBundleService } from './assets/AssetBundleService';
import { ConfigService } from './config/ConfigService';
import { ConfigManager } from './core/ConfigManager';
import { eventBus } from './core/TypedEventBus';
import { PlayerDataManager } from './core/PlayerDataManager';
import { ShopUI } from './ui/ShopUI';
import { WXAdapter } from './utils/WXAdapter';
import { UiRouter, UiPanelId } from './ui/UiRouter';
import { AppFlowController, AppFlowState } from './app/AppFlowController';

const { ccclass, property } = _decorator;

@ccclass('MainSceneController')
export class MainSceneController extends Component {
    @property(ShopUI)
    shopUI: ShopUI | null = null;

    private _ready = false;

    onLoad(): void {
        PlayerDataManager.getInstance();
        this.shopUI?.init();

        WXAdapter.getInstance().showBanner();
        WXAdapter.getInstance().reportAnalytics('game_start', {
            day: new Date().getDate(),
        });

        eventBus.on('appflow:state_changed', this._onFlowState, this);
        eventBus.on('ui:open_shop', this._onOpenShop, this);
    }

    private _onFlowState(state: AppFlowState): void {
        console.log('[MainSceneController] flow state:', state);
        switch (state) {
            case AppFlowState.SETTLEMENT:
                // Open settlement panel after returning from dungeon
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
