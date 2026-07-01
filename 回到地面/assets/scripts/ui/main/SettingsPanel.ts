/**
 * SettingsPanel - Settings and account management panel
 *
 * UIPanel implementation. Allows toggling audio, viewing version info,
 * and account management.
 */

import { _decorator, Component, Node, Label, Button } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { StorageService } from '../../core/StorageService';
import { PlatformService } from '../../platform/PlatformService';

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

    onLoad(): void {
        if (this.closeBtn) {
            this.closeBtn.node.on(Button.EventType.CLICK, () => this.close(), this);
        }
        if (this.resetBtn) {
            this.resetBtn.node.on(Button.EventType.CLICK, this._onResetData, this);
        }
    }

    private _refresh(): void {
        if (this.versionLabel) {
            this.versionLabel.string = 'Version 0.1.0';
        }
        if (this.accountLabel) {
            const isGuest = StorageService.instance.get('is_guest', 'false') === 'true';
            const openid = StorageService.instance.get('wx_openid', 'none');
            this.accountLabel.string = `Account: ${isGuest ? 'Guest' : 'WeChat'} (${openid.slice(0, 8)}...)`;
        }
    }

    private _onResetData(): void {
        // TODO: confirm dialog
        const { PlayerDataManager } = require('../../core/PlayerDataManager');
        PlayerDataManager.getInstance().resetAll();
        console.log('[Settings] data reset');
        this.close();
    }

    onDestroy(): void {
        // cleanup if needed
    }
}
