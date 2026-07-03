/**
 * AreaSelectPanelLayout - 区域选择面板内部布局组件
 *
 * 挂在 AreaSelectPanel/PanelRoot/PanelFrame/ContentRoot 上。
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('AreaSelectPanelLayout')
@menu('UI/AreaSelectPanelLayout')
export class AreaSelectPanelLayout extends Component {
    @property(Node) titleLabel: Node | null = null;
    @property(Node) playerInfo: Node | null = null;
    @property(Node) routeContainer: Node | null = null;
    @property(Node) lockedContainer: Node | null = null;
    @property(Node) startBtn: Node | null = null;
    @property(Node) backBtn: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;
        const h = trans.height;

        this.titleLabel?.setPosition(0, h / 2 - 48);
        this.playerInfo?.setPosition(0, h / 2 - 88);
        this.routeContainer?.setPosition(0, 40);
        this.lockedContainer?.setPosition(0, -60);
        this.startBtn?.setPosition(-80, -h / 2 + 56);
        this.backBtn?.setPosition(80, -h / 2 + 56);
    }
}
