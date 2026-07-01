/**
 * MainUI - main scene UI interaction
 * Displays the start button and main UI text.
 */

import { _decorator, Button, Component, Label } from 'cc';
import { eventBus } from '../core/EventBus';
import { WXAdapter } from '../utils/WXAdapter';
import { T } from '../core/TextManager';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends Component {
    @property(Button)
    startButton: Button | null = null;
    @property(Button)
    shopButton: Button | null = null;
    @property(Button)
    settingsButton: Button | null = null;
    @property(Label)
    versionLabel: Label | null = null;

    onLoad(): void {
        if (this.versionLabel) {
            this.versionLabel.string = T('ui.version');
        }

        if (!this.startButton) {
            this.startButton = this.node.getChildByName('StartButton')?.getComponent(Button) ?? null;
        }

        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this._onStartTap, this);
        } else {
            console.warn('[MainUI] startButton is not assigned');
        }

        if (this.shopButton) {
            this.shopButton.node.on(Button.EventType.CLICK, this._onShopTap, this);
        }

        if (this.settingsButton) {
            this.settingsButton.node.on(Button.EventType.CLICK, this._onSettingsTap, this);
        }

        WXAdapter.getInstance().showBanner();
    }

    onStartClick(): void {
        WXAdapter.getInstance().hideBanner();
        eventBus.emit('ui:open_area_select');
    }

    onShopClick(): void {
        eventBus.emit('ui:open_shop');
    }

    onSettingsClick(): void {
        eventBus.emit('ui:open_settings');
    }

    onDestroy(): void {
        if (this.startButton) {
            this.startButton.node.off(Button.EventType.CLICK, this._onStartTap, this);
        }
        if (this.shopButton) {
            this.shopButton.node.off(Button.EventType.CLICK, this._onShopTap, this);
        }
        if (this.settingsButton) {
            this.settingsButton.node.off(Button.EventType.CLICK, this._onSettingsTap, this);
        }
        WXAdapter.getInstance().showBanner();
    }

    private _onStartTap(): void {
        this.onStartClick();
    }

    private _onShopTap(): void {
        this.onShopClick();
    }

    private _onSettingsTap(): void {
        this.onSettingsClick();
    }
}
