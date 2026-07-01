/**
 * LoginPanel - WeChat login / guest login panel
 *
 * UIPanel implementation. Opened by AppFlowController when AUTH_CHECK state is active.
 * On login success, calls AppFlowController.goTo(PROFILE_CHECK) for routing.
 */

import { _decorator, Component, Node, Label, Button, Sprite, Color } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { AppFlowController, AppFlowState } from '../../app/AppFlowController';
import { PlatformService } from '../../platform/PlatformService';
import { StorageService } from '../../core/StorageService';

const { ccclass, property } = _decorator;

@ccclass('LoginPanel')
export class LoginPanel extends Component implements UIPanel {
    id: UiPanelId = 'login';

    @property(Node)
    panelRoot: Node | null = null;

    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    subtitleLabel: Label | null = null;

    @property(Button)
    wxLoginBtn: Button | null = null;

    @property(Button)
    guestBtn: Button | null = null;

    @property(Label)
    agreementLabel: Label | null = null;

    @property(Label)
    statusLabel: Label | null = null;

    private _retryCount = 0;

    // ── UIPanel ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        this._retryCount = 0;
        if (this.statusLabel) this.statusLabel.string = '';

        // Dev mode: auto-skip to logged-in
        if (!PlatformService.instance.isWX) {
            console.log('[LoginPanel] dev mode, auto login');
            StorageService.instance.set('wx_openid', 'dev_user');
            this._onLoginSuccess();
        }
    }

    close(): void {
        if (this.panelRoot) this.panelRoot.active = false;
    }

    // ── Lifecycle ──

    onLoad(): void {
        if (this.wxLoginBtn) {
            this.wxLoginBtn.node.on(Button.EventType.CLICK, this._onWxLogin, this);
        }
        if (this.guestBtn) {
            this.guestBtn.node.on(Button.EventType.CLICK, this._onGuestLogin, this);
        }
        if (this.agreementLabel) {
            this.agreementLabel.node.on(Node.EventType.TOUCH_END, () => {
                console.log('[LoginPanel] agreement clicked');
                // TODO: show agreement detail popup
            });
        }
    }

    // ── Handlers ──

    private async _onWxLogin(): Promise<void> {
        this._setStatus('Logging in...');
        this._setButtonsEnabled(false);

        try {
            const platform = PlatformService.instance;
            const result = await platform.wxLogin();
            if (result) {
                this._onLoginSuccess();
            } else {
                this._retryCount++;
                if (this._retryCount >= 3) {
                    this._setStatus('Network error, please try again later');
                } else {
                    this._setStatus(`Login failed, retry (${this._retryCount}/3)`);
                }
                this._setButtonsEnabled(true);
            }
        } catch (err) {
            console.error('[LoginPanel] wx login error:', err);
            this._setStatus('Network error');
            this._setButtonsEnabled(true);
        }
    }

    private _onGuestLogin(): void {
        const guestId = 'guest_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        StorageService.instance.set('wx_openid', guestId);
        StorageService.instance.set('is_guest', 'true');
        console.log('[LoginPanel] guest login:', guestId);
        this._onLoginSuccess();
    }

    private _onLoginSuccess(): void {
        console.log('[LoginPanel] login success, proceeding');
        this.close();

        // Route to next state
        const appFlow = AppFlowController.instance;
        if (appFlow) {
            appFlow.goTo(AppFlowState.PROFILE_CHECK);
        }
    }

    // ── Helpers ──

    private _setStatus(msg: string): void {
        if (this.statusLabel) this.statusLabel.string = msg;
    }

    private _setButtonsEnabled(enabled: boolean): void {
        if (this.wxLoginBtn) this.wxLoginBtn.interactable = enabled;
        if (this.guestBtn) this.guestBtn.interactable = enabled;
    }
}
