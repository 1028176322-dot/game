/**
 * SettlementPanelLayout - 结算面板内部布局组件
 *
 * 挂在 SettlementPanel/PanelRoot/PanelFrame/ContentRoot 上。
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('SettlementPanelLayout')
@menu('UI/SettlementPanelLayout')
export class SettlementPanelLayout extends Component {
    @property(Node) titleLabel: Node | null = null;
    @property(Node) zoneLabel: Node | null = null;
    @property(Node) floorLabel: Node | null = null;
    @property(Node) killLabel: Node | null = null;
    @property(Node) soulStoneLabel: Node | null = null;
    @property(Node) timeLabel: Node | null = null;
    @property(Node) doubleBtn: Node | null = null;
    @property(Node) backBtn: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;
        const h = trans.height;

        this.titleLabel?.setPosition(0, h / 2 - 48);
        this.zoneLabel?.setPosition(0, h / 2 - 96);
        this.floorLabel?.setPosition(0, h / 2 - 132);
        this.killLabel?.setPosition(0, h / 2 - 168);
        this.soulStoneLabel?.setPosition(0, h / 2 - 204);
        this.timeLabel?.setPosition(0, h / 2 - 240);
        this.doubleBtn?.setPosition(-80, -h / 2 + 56);
        this.backBtn?.setPosition(80, -h / 2 + 56);
    }
}
