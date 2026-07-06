/**
 * CreatePanelLayout — Create panel internal layout component
 *
 * Mounted on ContentRoot under CreatePanel/PanelRoot/PanelFrame/ContentRoot.
 * Sets UITransform sizes and positions for all child nodes.
 *
 * Called automatically by ResponsivePanelContent.applyLayout().
 * Also triggered after dynamic card creation via _reLayout().
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('CreatePanelLayout')
@menu('UI/CreatePanelLayout')
export class CreatePanelLayout extends Component {
    @property(Node) titleLabel: Node | null = null;
    @property(Node) modelDisplay: Node | null = null;
    @property(Node) cardRoot: Node | null = null;
    @property(Node) selectedDesc: Node | null = null;
    @property(Node) confirmBtn: Node | null = null;
    @property(Node) skipBtn: Node | null = null;
    @property(Node) errorLabel: Node | null = null;
    @property(Node) nameInput: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;

        const w = trans.width;
        const h = trans.height;
        const halfH = h / 2;

        // --- Select phase node sizes ---
        this._setSize(this.titleLabel, Math.min(w - 80, 500), 36);
        this._setSize(this.modelDisplay, Math.min(w - 80, 420), Math.min(200, h * 0.35));
        this._setSize(this.cardRoot, Math.min(w - 60, 620), 180);
        this._setSize(this.selectedDesc, Math.min(w - 100, 520), 72);
        this._setSize(this.confirmBtn, 180, 56);
        this._setSize(this.skipBtn, 180, 56);
        this._setSize(this.errorLabel, Math.min(w - 80, 400), 28);

        // --- Naming phase node sizes ---
        this._setSize(this.nameInput, Math.min(w - 120, 420), 48);

        // --- Select phase positions (top-down) ---
        // Title at top
        this.titleLabel?.setPosition(0, halfH - 28);

        // Model display below title
        this.modelDisplay?.setPosition(0, halfH - 60 - Math.min(100, h * 0.175));

        // Cards centered
        this.cardRoot?.setPosition(0, 0);

        // Description below cards
        this.selectedDesc?.setPosition(0, -120);

        // Buttons at bottom
        this.confirmBtn?.setPosition(-120, -halfH + 40);
        this.skipBtn?.setPosition(120, -halfH + 40);

        // Error label above buttons
        this.errorLabel?.setPosition(0, -halfH + 90);

        // --- Naming phase positions ---
        this.nameInput?.setPosition(0, 0);
    }

    private _setSize(node: Node | null, width: number, height: number): void {
        const t = node?.getComponent(UITransform);
        if (t) t.setContentSize(width, height);
    }
}
