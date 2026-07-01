/**
 * MainHubUI - Main city hub entry UI
 *
 * Root UI component on main.scene.
 * Owns TopBar, ActionBar, BottomBar and opens panels via UiRouter.
 */

import { _decorator, Component, Node, Button, Label, Sprite } from 'cc';
import { UiRouter, UiPanelId } from '../UiRouter';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { WXAdapter } from '../../utils/WXAdapter';
import { AppFlowController, AppFlowState } from '../../app/AppFlowController';
import { eventBus } from '../../core/EventBus';

const { ccclass, property } = _decorator;

@ccclass('MainHubUI')
export class MainHubUI extends Component {
    @property(Button)
    startBtn: Button | null = null;

    @property(Button)
    characterBtn: Button | null = null;

    @property(Button)
    shopBtn: Button | null = null;

    @property(Button)
    logBtn: Button | null = null;

    @property(Button)
    settingsBtn: Button | null = null;

    @property(Label)
    charNameLabel: Label | null = null;

    @property(Label)
    charClassLabel: Label | null = null;

    @property(Label)
    levelLabel: Label | null = null;

    @property(Label)
    soulStoneLabel: Label | null = null;

    @property(Label)
    versionLabel: Label | null = null;

    onLoad(): void {
        this._refreshTopBar();
        this._bindButtons();
        WXAdapter.getInstance().showBanner();

        // Listen for data updates when returning from dungeon
        eventBus.on('appflow:state_changed', this._onFlowStateChanged, this);
    }

    private _bindButtons(): void {
        if (this.startBtn) {
            this.startBtn.node.on(Button.EventType.CLICK, () => {
                // Open area select panel -> RunCoordinator -> dungeon
                UiRouter.instance.open('area_select');
            }, this);
        }
        if (this.characterBtn) {
            this.characterBtn.node.on(Button.EventType.CLICK, () => {
                UiRouter.instance.open('character');
            }, this);
        }
        if (this.shopBtn) {
            this.shopBtn.node.on(Button.EventType.CLICK, () => {
                UiRouter.instance.open('shop');
            }, this);
        }
        if (this.logBtn) {
            this.logBtn.node.on(Button.EventType.CLICK, () => {
                UiRouter.instance.open('adventure_log');
            }, this);
        }
        if (this.settingsBtn) {
            this.settingsBtn.node.on(Button.EventType.CLICK, () => {
                UiRouter.instance.open('settings');
            }, this);
        }
    }

    private _refreshTopBar(): void {
        const pdm = PlayerDataManager.getInstance();

        if (this.charNameLabel) {
            this.charNameLabel.string = pdm.getCharacterName() || 'Adventurer';
        }
        if (this.charClassLabel) {
            const type = pdm.getSelectedCharacterId();
            const names: Record<string, string> = {
                warrior: 'Bear Warrior', archer: 'Deer Archer',
                assassin: 'Fox Assassin', mage: 'Rabbit Mage',
                berserker: 'Boar Berserker',
            };
            this.charClassLabel.string = names[type] ?? 'Adventurer';
        }
        if (this.levelLabel) {
            this.levelLabel.string = `Lv${pdm.getCharacterLevel()}`;
        }
        if (this.soulStoneLabel) {
            this.soulStoneLabel.string = `Soul Stones: ${pdm.getSoulStones()}`;
        }
        if (this.versionLabel) {
            this.versionLabel.string = 'v0.1.0';
        }
    }

    private _onFlowStateChanged(state: string): void {
        if (state === AppFlowState.MAIN_HUB) {
            // Returning from dungeon - refresh all data
            this._refreshTopBar();
        }
    }

    /** Public: called after returning from dungeon or closing a purchase panel */
    refreshAll(): void {
        this._refreshTopBar();
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }
}
