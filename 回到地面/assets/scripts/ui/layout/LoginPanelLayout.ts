/**
 * LoginPanelLayout - 登录面板内部布局组件
 *
 * 挂在 LoginPanel/PanelRoot/PanelFrame/ContentRoot 上。
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('LoginPanelLayout')
@menu('UI/LoginPanelLayout')
export class LoginPanelLayout extends Component {
    @property(Node) titleLabel: Node | null = null;
    @property(Node) subtitleLabel: Node | null = null;
    @property(Node) wechatBtn: Node | null = null;
    @property(Node) guestBtn: Node | null = null;
    @property(Node) agreementLabel: Node | null = null;
    @property(Node) statusLabel: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;
        const h = trans.height;

        this.titleLabel?.setPosition(0, h / 2 - 48);
        this.subtitleLabel?.setPosition(0, h / 2 - 88);
        this.wechatBtn?.setPosition(0, 30);
        this.guestBtn?.setPosition(0, -40);
        this.agreementLabel?.setPosition(0, -h / 2 + 56);
        this.statusLabel?.setPosition(0, -h / 2 + 22);
    }
}
