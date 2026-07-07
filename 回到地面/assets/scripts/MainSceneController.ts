/**
 * MainSceneController - Main scene bootstrap (simplified)
 *
 * Responsibilities:
 *   1. Listen for flow state changes
 *   2. Register and initialize all main-scene panels with UiRouter
 *   3. No longer manages dungeon entry directly
 */

import { _decorator, Button, Component, Node } from 'cc';
import { PlayerDataManager } from './core/PlayerDataManager';
import { ShopUI } from './ui/ShopUI';
import { WXAdapter } from './utils/WXAdapter';
import { UiRouter, UIPanel } from './ui/UiRouter';
import { AppFlowController, AppFlowState } from './app/AppFlowController';
import { eventBus } from './core/EventBus';
import { UISkinSceneApplier } from './ui/UISkinSceneApplier';

const { ccclass, property } = _decorator;

@ccclass('MainSceneController')
export class MainSceneController extends Component {
    @property(ShopUI)
    shopUI: ShopUI | null = null;

    private _startButton: Button | null = null;

    onLoad(): void {
        PlayerDataManager.getInstance();
        this.shopUI?.init();

        this._ensurePersistentMainBackground();
        void UISkinSceneApplier.applyScene(this.node.scene ?? this.node, 'main');

        WXAdapter.getInstance().showBanner();
        WXAdapter.getInstance().reportAnalytics('game_start', {
            day: new Date().getDate(),
        });

        this._registerPanels();
        eventBus.on('appflow:state_changed', this._onFlowState, this);
        eventBus.on('ui:open_area_select', this._onOpenAreaSelect, this);
        eventBus.on('ui:open_shop', this._onOpenShop, this);
        eventBus.on('ui:open_settings', this._onOpenSettings, this);

        this._bindFallbackStartButton();
        this.scheduleOnce(() => this._bindFallbackStartButton(), 0.1);
    }

    private _registerPanels(): void {
        const router = UiRouter.instance;
        const candidates = [
            'LoginPanel', 'CreatePanel', 'CharacterPanel',
            'AreaSelectPanel', 'SettlementPanel',
            'SettingsPanel', 'AdventureLogPanel',
        ];

        // Search from scene root (panels are children of Canvas, not of MainSceneController)
        const sceneRoot = this.node.scene;
        for (const name of candidates) {
            // Search from scene root, recursively
            const node = this._findChildRecursive(sceneRoot ?? this.node, name);
            if (!node) {
                console.warn(`[MainScene] panel node not found in scene: ${name}`);
                continue;
            }
            const comp = node.getComponent(name) as unknown as UIPanel;
            if (comp && typeof comp.open === 'function' && typeof comp.close === 'function') {
                router.register(comp);
                console.log(`[MainScene] registered panel: ${name}`);
            } else {
                console.warn(`[MainScene] panel found but no UIPanel interface: ${name}`);
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

    private _ensurePersistentMainBackground(): Node | null {
        const canvas = this._findChildRecursive(this.node.scene ?? this.node, 'Canvas');
        if (!canvas) {
            console.warn('[MainScene] Canvas not found; main background cannot be created');
            return null;
        }

        let bg = canvas.getChildByName('MainBackground');
        if (!bg) {
            bg = new Node('MainBackground');
            bg.layer = canvas.layer;
            canvas.addChild(bg);
        }

        bg.setSiblingIndex(0);
        bg.active = true;
        return bg;
    }

    private _onFlowState(state: string): void {
        const router = UiRouter.instance;

        // Show MainUI only when in main hub, hide during all modal panels (area select, settings, etc.)
        // Robust lookup: the controller may live as a direct Canvas child or elsewhere; find MainUI by name.
        const mainUI =
            this.node.parent?.getChildByName('MainUI') ??
            this._findChildRecursive(this.node.scene ?? this.node, 'MainUI');
        const showMainUI = state === AppFlowState.MAIN_HUB;
        if (mainUI) mainUI.active = showMainUI;

        // Close all panels before opening the next one to prevent stacking
        router.closeAll();

        switch (state) {
            case AppFlowState.AREA_SELECT:
                router.open('area_select');
                break;
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
        if (this.shopUI) {
            this.shopUI.show();
        } else {
            console.warn('[MainScene] shopUI not bound');
        }
    }

    private _onOpenSettings(): void {
        UiRouter.instance.open('settings');
    }

    private _onOpenAreaSelect(): void {
        console.log('[MainScene] _onOpenAreaSelect triggered');
        AppFlowController.instance.goTo(AppFlowState.AREA_SELECT)
            .catch((err) => console.error('[MainScene] failed to enter AREA_SELECT', err));
    }

    onDestroy(): void {
        eventBus.offTarget(this);
        this._unbindStartButton();
        this.unscheduleAllCallbacks();
    }

    private _bindFallbackStartButton(): void {
        if (this._startButton) {
            const existing = this._startButton;
            this._unbindStartButton(existing);
            this._bindStartButton(existing);
            this._startButton = existing;
            console.log('[MainScene] bound fallback start button click to area select flow');
            return;
        }

        const parentNode = this.node.parent;
        const startNode = parentNode?.getChildByName('StartButton')
            ?? this.node.getChildByName('StartButton')
            ?? this._findStartButtonInScene();
        const startButton = startNode?.getComponent(Button) ?? null;

        if (!startButton) {
            console.warn('[MainScene] StartButton not found; game start button may not be bound');
            return;
        }

        this._startButton = startButton;
        this._bindStartButton(this._startButton);
        console.log('[MainScene] bound fallback start button click to area select flow');
    }

    private _bindStartButton(button: Button | null): void {
        const node = button?.node;
        if (!node || !node.isValid) return;
        node.on(Button.EventType.CLICK, this._onOpenAreaSelect, this);
    }

    private _unbindStartButton(button: Button | null = this._startButton): void {
        const node = button?.node;
        if (!node || !node.isValid) {
            if (this._startButton === button) {
                this._startButton = null;
            }
            return;
        }

        node.off(Button.EventType.CLICK, this._onOpenAreaSelect, this);
        if (this._startButton === button) {
            this._startButton = null;
        }
    }

    private _findStartButtonInScene(): Node | null {
        const scene = this.node.scene;
        if (!scene) return null;

        const search = (node: Node): Node | null => {
            if (node.name === 'StartButton') return node;
            for (const child of node.children) {
                const found = search(child);
                if (found) return found;
            }
            return null;
        };

        return search(scene);
    }
}
