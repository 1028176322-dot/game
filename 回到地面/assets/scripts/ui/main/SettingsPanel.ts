/**
 * SettingsPanel - Settings panel
 *
 * UIPanel implementation. Shows account info, version, reset button.
 */

import { _decorator, Component, Node, Label, Button } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { PlatformService } from '../../platform/PlatformService';
import { T } from '../../core/TextManager';

const { ccclass, property } = _decorator;

@ccclass('SettingsPanel')
export class SettingsPanel extends Component implements UIPanel {
    id: UiPanelId = 'settings';

    @property(Node)
    panelRoot: Node | null = null;

    @property(Label)
    versionLabel: Label | null = null;

    @property(Label)
    accountLabel: Label | null = null;

    @property(Button)
    resetBtn: Button | null = null;

    @property(Button)
    closeBtn: Button | null = null;

    // ── UIPanel ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        this._refresh();
    }

    close(): void {
        if (this.panelRoot) this.panelRoot.active = false;
    }

    refresh(): void {
        this._refresh();
    }

    // ── Lifecycle ──

    onLoad(): void {
        if (this.closeBtn) {
            this.closeBtn.node.on(Button.EventType.CLICK, () => this.close(), this);
        }
        if (this.resetBtn) {
            this.resetBtn.node.on(Button.EventType.CLICK, this._onReset, this);
        }
    }

    // ── Internal ──

    private _refresh(): void {
        if (this.versionLabel) {
            this.versionLabel.string = T('ui.settingsVersion', { ver: '0.1.0' });
        }

        if (this.accountLabel) {
            const platform = PlatformService.instance;
            const openid = platform.getOpenId() ?? '';
            const isGuest = platform.isGuest();
            const type = isGuest ? T('ui.settingsGuest') : T('ui.settingsWeChat');
            this.accountLabel.string = T('ui.settingsAccount', { type, id: openid.slice(0, 8) + '...' });
        }
    }

    private _onReset(): void {
        // TODO: confirm dialog before reset
        console.log('[SettingsPanel] reset requested');
    }
}
