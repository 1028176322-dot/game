/**
 * CharacterPanelLayout - 角色管理面板内部布局组件
 *
 * 挂在 CharacterPanel/PanelRoot/PanelFrame/ContentRoot 上。
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('CharacterPanelLayout')
@menu('UI/CharacterPanelLayout')
export class CharacterPanelLayout extends Component {
    @property(Node) titleLabel: Node | null = null;
    @property(Node) soulStoneLabel: Node | null = null;
    @property(Node) currentName: Node | null = null;
    @property(Node) currentInfo: Node | null = null;
    @property(Node) currentStats: Node | null = null;
    @property(Node) slotContainer: Node | null = null;
    @property(Node) closeBtn: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;
        const h = trans.height;

        this.titleLabel?.setPosition(0, h / 2 - 48);
        this.soulStoneLabel?.setPosition(0, h / 2 - 88);
        this.currentName?.setPosition(0, h / 2 - 130);
        this.currentInfo?.setPosition(0, h / 2 - 170);
        this.currentStats?.setPosition(0, h / 2 - 210);
        this.slotContainer?.setPosition(0, 20);
        this.closeBtn?.setPosition(0, -h / 2 + 56);
    }
}
