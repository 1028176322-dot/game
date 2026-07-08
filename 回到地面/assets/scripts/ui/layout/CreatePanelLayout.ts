/**
 * Zone-internal layout for CreatePanel.
 *
 * This component is code-driven. Scene references may become stale after node
 * moves, so every lookup falls back to stable child paths under ContentRoot.
 */

import {
    _decorator,
    Component,
    Node,
    UITransform,
    Label,
    HorizontalTextAlignment,
    VerticalTextAlignment,
    Size,
    Vec3,
    view,
} from 'cc';
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
        const contentSize = this.node.getComponent(UITransform)?.contentSize ?? new Size(680, 500);

        this._layoutTitle(contentSize);
        this._layoutPreview(contentSize);
        this._layoutChoices(contentSize);
        this._layoutInfo(contentSize);
        this._layoutActions(contentSize);
        this._layoutNameInput(contentSize);
    }

    private _layoutTitle(contentSize: Size): void {
        const title = this._node(this.titleLabel, 'HeaderZone/TitleLabel');
        this._setSize(title, Math.min(contentSize.width, 520), 40);
        title?.setPosition(0, 0);
        this._formatLabel(title, 28, 34, Label.Overflow.SHRINK);
    }

    private _layoutPreview(contentSize: Size): void {
        const preview = this._node(this.modelDisplay, 'PreviewZone/ModelDisplay');

        this._setSize(preview, Math.min(contentSize.width - 48, 260), 150);
        preview?.setPosition(0, 0);
    }

    private _layoutChoices(contentSize: Size): void {
        const cards = this._node(this.cardRoot, 'ChoiceZone/CardRoot');
        this._setSize(cards, Math.min(contentSize.width - 32, 620), 52);
        cards?.setPosition(0, 0);
    }

    private _layoutInfo(contentSize: Size): void {
        const info = this._node(this.selectedInfo, 'InfoZone/SelectedInfo');
        const desc = this._node(this.selectedDesc, 'InfoZone/SelectedDesc');

        this._setSize(info, Math.min(contentSize.width - 64, 480), 28);
        this._setSize(desc, Math.min(contentSize.width - 64, 560), 40);

        info?.setPosition(0, 17);
        desc?.setPosition(0, -18);

        this._formatLabel(info, 22, 26, Label.Overflow.SHRINK);
        this._formatLabel(desc, 20, 24, Label.Overflow.SHRINK);
    }

    private _layoutActions(contentSize: Size): void {
        const confirm = this._node(this.confirmBtn, 'ActionZone/ConfirmBtn');
        const skip = this._node(this.skipBtn, 'ActionZone/SkipBtn');
        const error = this._node(this.errorLabel, 'ActionZone/ErrorLabel');
        const actionZone = this._node(null, 'ActionZone');

        this._setSize(confirm, 200, 62);
        this._setSize(skip, 200, 62);
        this._setSize(error, Math.min(contentSize.width - 64, 480), 22);

        // Position buttons at the bottom-left and bottom-right corners of the screen.
        // ActionZone is centered horizontally in the panel, so we compute the desired
        // screen-corner world coordinates and subtract the ActionZone world offset
        // to get the local coordinates for the button children.
        if (actionZone) {
            const visible = view.getVisibleSize();
            const screenW = visible.width > 0 ? visible.width : 1280;
            const screenH = visible.height > 0 ? visible.height : 720;
            const marginX = 24;   // margin from left/right screen edge
            const marginY = 20;   // margin from bottom screen edge
            const btnHalfW = 100; // 200 / 2
            const btnHalfH = 31;  // 62 / 2

            const actionZoneWorld = actionZone.getWorldPosition();

            const targetLeft = new Vec3(
                -screenW / 2 + marginX + btnHalfW,
                -screenH / 2 + marginY + btnHalfH,
                0
            );
            const targetRight = new Vec3(
                screenW / 2 - marginX - btnHalfW,
                -screenH / 2 + marginY + btnHalfH,
                0
            );

            confirm?.setPosition(
                targetLeft.x - actionZoneWorld.x,
                targetLeft.y - actionZoneWorld.y
            );
            skip?.setPosition(
                targetRight.x - actionZoneWorld.x,
                targetRight.y - actionZoneWorld.y
            );
            // Error label stays centered above the buttons.
            error?.setPosition(0, Math.max(
                targetLeft.y - actionZoneWorld.y,
                targetRight.y - actionZoneWorld.y
            ) + 50);
        } else {
            confirm?.setPosition(-520, -36);
            skip?.setPosition(520, -36);
            error?.setPosition(0, 17);
        }

        this._formatButtonLabel(confirm, 22);
        this._formatButtonLabel(skip, 22);
        this._formatLabel(error, 18, 22, Label.Overflow.SHRINK);
    }

    private _layoutNameInput(contentSize: Size): void {
        const input = this._node(this.nameInput, 'NameInput');
        this._setSize(input, Math.min(contentSize.width - 96, 420), 46);
        input?.setPosition(0, 0);
    }

    private _setSize(node: Node | null, width: number, height: number): void {
        let transform = node?.getComponent(UITransform);
        if (node && !transform) {
            transform = node.addComponent(UITransform);
        }
        transform?.setContentSize(width, height);
    }

    private _formatButtonLabel(node: Node | null, fontSize: number): void {
        const label = node?.getComponentInChildren(Label);
        if (!label) return;
        this._applyLabelStyle(label, fontSize, fontSize + 4, Label.Overflow.SHRINK);
    }

    private _formatLabel(node: Node | null, fontSize: number, lineHeight: number, overflow: Label.Overflow): void {
        const label = node?.getComponent(Label) ?? node?.getComponentInChildren(Label);
        if (!label) return;
        this._applyLabelStyle(label, fontSize, lineHeight, overflow);
    }

    private _applyLabelStyle(label: Label, fontSize: number, lineHeight: number, overflow: Label.Overflow): void {
        label.fontSize = fontSize;
        label.lineHeight = lineHeight;
        label.overflow = overflow;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
    }

    private _node(ref: unknown, path: string): Node | null {
        return NodeRef.find(this.node, path) ?? NodeRef.node(ref as any);
    }
}
