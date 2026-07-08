/**
 * LoginPanel - Platform login / guest login panel (Adpater-ready)
 *
 * UIPanel implementation. Opened by AppFlowController when AUTH_CHECK state is active.
 * On login success, calls AppFlowController.goTo(PROFILE_CHECK) for routing.
 *
 * Uses PlatformService (Adapter pattern) instead of direct wx.* calls.
 */

import { _decorator, Component, Node, Label, Button, Sprite, Color } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { AppFlowController, AppFlowState } from '../../app/AppFlowController';
import { PlatformService } from '../../platform/PlatformService';
import { StorageService } from '../../platform/StorageService';
import { T } from '../../core/TextManager';

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

    /** Platform login button — platform-specific (WeChat / TapTap / generic) */
    @property(Node)
    platformLoginBtn: Node | null = null;

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
        const platform = PlatformService.instance;
        if (platform.isDev) {
            console.log('[LoginPanel] dev mode, auto login');
            StorageService.instance.set('platform_user_id', 'dev_user');
            this._onLoginSuccess();
            return;
        }

        // Check if already logged in (platform_user_id exists)
        const existingUserId = platform.getUserId();
        if (existingUserId) {
            console.log('[LoginPanel] already logged in:', existingUserId);
            this._onLoginSuccess();
        }
    }

    close(): void {
        if (this.panelRoot) this.panelRoot.active = false;
    }

    // ── Lifecycle ──

    onLoad(): void {
        if (this.platformLoginBtn) {
            this.platformLoginBtn.on(Node.EventType.TOUCH_END, this._onPlatformLogin, this);
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

    private async _onPlatformLogin(): Promise<void> {
        this._setStatus(T('ui.loading'));
        this._setButtonsEnabled(false);

        try {
            const platform = PlatformService.instance;
            const result = await platform.login();
            if (result.success && result.userId) {
                StorageService.instance.set('platform_user_id', result.userId);
                StorageService.instance.remove('is_guest');
                this._onLoginSuccess();
            } else {
                this._retryCount++;
                if (this._retryCount >= 3) {
                    this._setStatus(T('ui.loginFailed'));
                } else {
                    this._setStatus(T('ui.loginRetry', { n: this._retryCount }));
                }
                this._setButtonsEnabled(true);
            }
        } catch (err) {
            console.error('[LoginPanel] platform login error:', err);
            this._setStatus(T('ui.loginFailed'));
            this._setButtonsEnabled(true);
        }
    }

    private _onGuestLogin(): void {
        const guestId = 'guest_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        StorageService.instance.set('platform_user_id', guestId);
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
        if (this.platformLoginBtn) this.platformLoginBtn.getComponent(Button)!.interactable = enabled;
        if (this.guestBtn) this.guestBtn.interactable = enabled;
    }
}
