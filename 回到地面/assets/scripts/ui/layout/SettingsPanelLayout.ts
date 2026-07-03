/**
 * SettingsPanelLayout - 设置面板内部布局组件
 *
 * 挂在 SettingsPanel/PanelRoot/PanelFrame/ContentRoot 上。
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('SettingsPanelLayout')
@menu('UI/SettingsPanelLayout')
export class SettingsPanelLayout extends Component {
    @property(Node) versionLabel: Node | null = null;
    @property(Node) accountLabel: Node | null = null;
    @property(Node) resetBtn: Node | null = null;
    @property(Node) closeBtn: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;
        const h = trans.height;

        this.versionLabel?.setPosition(0, h / 2 - 48);
        this.accountLabel?.setPosition(0, h / 2 - 88);
        this.resetBtn?.setPosition(0, 20);
        this.closeBtn?.setPosition(0, -h / 2 + 56);
    }
}
