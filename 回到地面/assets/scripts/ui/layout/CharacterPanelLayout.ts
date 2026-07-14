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

    /**
     * Ensure a `PreviewSlot [UITransform, Sprite]` exists under `contentRoot`
     * and return it. The 3D character preview from T1B mounts its RenderTexture
     * surface onto this node. Layout (size + position) is applied in applyLayout.
     * Safe to call repeatedly (idempotent).
     */
    static ensurePreviewSlot(contentRoot: Node): Node {
        let slot = contentRoot.getChildByName('PreviewSlot');
        if (!slot) {
            slot = new Node('PreviewSlot');
            slot.addComponent(UITransform);
            contentRoot.addChild(slot);
        }
        return slot;
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;
        const h = trans.height;

        this.titleLabel?.setPosition(0, h / 2 - 40);
        this.soulStoneLabel?.setPosition(0, h / 2 - 80);

        // PreviewSlot: current-character 3D showcase, upper-middle partition.
        // Placed just below the soul-stone label, on its own Y band so it never
        // overlaps the text info rows or the card list (SlotContainer).
        const slot = CharacterPanelLayout.ensurePreviewSlot(this.node);
        const slotTrans = slot.getComponent(UITransform);
        const slotSize = Math.round(Math.min(h * 0.28, 180));
        if (slotTrans) {
            slotTrans.setContentSize(slotSize, slotSize);
            slot.setPosition(0, h / 2 - 80 - slotSize / 2 - 16);
        }

        const below = h / 2 - 80 - slotSize - 40;
        this.currentName?.setPosition(0, below);
        this.currentInfo?.setPosition(0, below - 36);
        this.currentStats?.setPosition(0, below - 72);
        this.slotContainer?.setPosition(0, 20);
        this.closeBtn?.setPosition(0, -h / 2 + 56);
    }
}
