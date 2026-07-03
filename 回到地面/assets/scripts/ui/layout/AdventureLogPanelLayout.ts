/**
 * AdventureLogPanelLayout - 冒险日志面板内部布局组件
 *
 * 挂在 AdventureLogPanel/PanelRoot/PanelFrame/ContentRoot 上。
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('AdventureLogPanelLayout')
@menu('UI/AdventureLogPanelLayout')
export class AdventureLogPanelLayout extends Component {
    @property(Node) titleLabel: Node | null = null;
    @property(Node) totalRunsLabel: Node | null = null;
    @property(Node) bestFloorLabel: Node | null = null;
    @property(Node) totalKillsLabel: Node | null = null;
    @property(Node) soulStonesLabel: Node | null = null;
    @property(Node) closeBtn: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;
        const h = trans.height;

        this.titleLabel?.setPosition(0, h / 2 - 48);
        this.totalRunsLabel?.setPosition(0, h / 2 - 96);
        this.bestFloorLabel?.setPosition(0, h / 2 - 132);
        this.totalKillsLabel?.setPosition(0, h / 2 - 168);
        this.soulStonesLabel?.setPosition(0, h / 2 - 204);
        this.closeBtn?.setPosition(0, -h / 2 + 56);
    }
}
