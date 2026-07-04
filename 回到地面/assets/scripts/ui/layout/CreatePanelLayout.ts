/**
 * CreatePanelLayout - 创建角色面板内部布局组件
 *
 * 挂在 CreatePanel/PanelRoot/PanelFrame/ContentRoot 上。
 * 按设计稿排布：标题 → 模型展示 → 职业按钮 → 职业描述 → 确认/跳过。
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

        // Sizes for select phase
        this._setSize(this.titleLabel, w, 36);
        this._setSize(this.modelDisplay, Math.min(w - 80, 400), Math.min(200, h * 0.35));
        this._setSize(this.cardRoot, Math.min(w - 80, 600), 50);
        this._setSize(this.selectedDesc, w - 80, 40);
        this._setSize(this.errorLabel, w - 80, 24);
        this._setSize(this.confirmBtn, 160, 40);
        this._setSize(this.skipBtn, 140, 40);

        // Select phase layout
        this.titleLabel?.setPosition(0, halfH - 24);
        this.modelDisplay?.setPosition(0, halfH - 60 - Math.min(100, h * 0.175));
        this.cardRoot?.setPosition(0, -60);
        this.selectedDesc?.setPosition(0, -120);
        this.errorLabel?.setPosition(0, -halfH + 70);
        this.confirmBtn?.setPosition(-120, -halfH + 20);
        this.skipBtn?.setPosition(120, -halfH + 20);

        // Naming phase layout (name input centered)
        this._setSize(this.nameInput, 300, 40);
        this.nameInput?.setPosition(0, 0);
    }

    private _setSize(node: Node | null, width: number, height: number): void {
        const t = node?.getComponent(UITransform);
        if (t) t.setContentSize(width, height);
    }
}
