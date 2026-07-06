/**
 * CreatePanelLayout — Zone-internal layout for CreatePanel
 *
 * This component now ONLY handles positioning of elements WITHIN each zone.
 * Zone positioning (top-to-down within ContentRoot) is handled by VerticalPanelLayout.
 *
 * Zone structure:
 *   ContentRoot [VerticalPanelLayout]
 *   ├── HeaderZone      52px
 *   │   └── TitleLabel
 *   ├── PreviewZone    150px
 *   │   └── ModelDisplay
 *   ├── ChoiceZone      58px
 *   │   └── CardRoot
 *   ├── InfoZone        76px
 *   │   ├── SelectedInfo
 *   │   └── SelectedDesc
 *   ├── ActionZone      58px
 *   │   ├── ConfirmBtn
 *   │   ├── SkipBtn
 *   │   └── ErrorLabel
 *   └── NameInput        (naming phase, direct child of ContentRoot)
 */

import { _decorator, Component, Node, UITransform } from 'cc';
import { NodeRef } from '../../utils/NodeRef';

const { ccclass, property, menu } = _decorator;

@ccclass('CreatePanelLayout')
@menu('UI/CreatePanelLayout')
export class CreatePanelLayout extends Component {
    @property(Node) titleLabel: Node | null = null;
    @property(Node) modelDisplay: Node | null = null;
    @property(Node) cardRoot: Node | null = null;
    @property(Node) selectedInfo: Node | null = null;
    @property(Node) selectedDesc: Node | null = null;
    @property(Node) confirmBtn: Node | null = null;
    @property(Node) skipBtn: Node | null = null;
    @property(Node) errorLabel: Node | null = null;
    @property(Node) nameInput: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        // === Zone-internal layout ===
        // Each element is positioned relative to its parent zone.
        // The zone itself is positioned by VerticalPanelLayout.

        // --- HeaderZone: center TitleLabel ---
        const titleLabel = this._node(this.titleLabel, 'HeaderZone/TitleLabel');
        this._setSize(titleLabel, this._zoneWidth('HeaderZone', 420), 42);
        titleLabel?.setPosition(0, 0);

        // --- PreviewZone: center ModelDisplay ---
        const modelDisplay = this._node(this.modelDisplay, 'PreviewZone/ModelDisplay');
        this._setSize(modelDisplay, 220, 140);
        modelDisplay?.setPosition(0, 0);

        // --- ChoiceZone: CardRoot is centered; internal button layout done by _buildCards() ---
        const cardRoot = this._node(this.cardRoot, 'ChoiceZone/CardRoot');
        this._setSize(cardRoot, 580, 48);
        cardRoot?.setPosition(0, 0);

        // --- InfoZone: SelectedInfo above, SelectedDesc below ---
        const selectedInfo = this._node(this.selectedInfo, 'InfoZone/SelectedInfo');
        const selectedDesc = this._node(this.selectedDesc, 'InfoZone/SelectedDesc');
        this._setSize(selectedInfo, 480, 30);
        this._setSize(selectedDesc, 560, 44);
        selectedInfo?.setPosition(0, 16);
        selectedDesc?.setPosition(0, -18);

        // --- ActionZone: Confirm left, Skip right, Error above ---
        const confirmBtn = this._node(this.confirmBtn, 'ActionZone/ConfirmBtn');
        const skipBtn = this._node(this.skipBtn, 'ActionZone/SkipBtn');
        const errorLabel = this._node(this.errorLabel, 'ActionZone/ErrorLabel');
        this._setSize(confirmBtn, 140, 46);
        this._setSize(skipBtn, 140, 46);
        this._setSize(errorLabel, 480, 24);
        confirmBtn?.setPosition(-120, 0);
        skipBtn?.setPosition(120, 0);
        errorLabel?.setPosition(0, 34);

        // --- Naming phase: NameInput centered ---
        const nameInput = this._node(this.nameInput, 'NameInput');
        this._setSize(nameInput, 420, 48);
        nameInput?.setPosition(0, 0);
    }

    /** Get zone width from ContentRoot child, with a fallback. */
    private _zoneWidth(zoneName: string, fallback: number): number {
        // CreatePanelLayout is on ContentRoot, zones are direct children
        const zone = this.node.getChildByName(zoneName);
        const trans = zone?.getComponent(UITransform);
        return trans?.width ?? fallback;
    }

    private _setSize(node: Node | null, width: number, height: number): void {
        const t = node?.getComponent(UITransform);
        if (t) t.setContentSize(width, height);
    }

    private _node(ref: unknown, path: string): Node | null {
        return NodeRef.node(ref as any) ?? NodeRef.find(this.node, path);
    }
}
