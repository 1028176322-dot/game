/**
 * CreatePanelLayout - 创建角色面板内部布局组件
 *
 * 挂在 CreatePanel/PanelRoot/PanelFrame/ContentRoot 上。
 * 根据 ContentRoot 尺寸自动排布标题、输入框、卡片、描述、按钮等子节点，
 * 并设置每个节点的 UITransform 尺寸，防止文字挤压/溢出。
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('CreatePanelLayout')
@menu('UI/CreatePanelLayout')
export class CreatePanelLayout extends Component {
    @property(Node) titleLabel: Node | null = null;
    @property(Node) nameInput: Node | null = null;
    @property(Node) cardRoot: Node | null = null;
    @property(Node) selectedInfo: Node | null = null;
    @property(Node) selectedDesc: Node | null = null;
    @property(Node) confirmBtn: Node | null = null;
    @property(Node) skipBtn: Node | null = null;
    @property(Node) errorLabel: Node | null = null;

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;

        const w = trans.width;
        const h = trans.height;
        const halfH = h / 2;

        // Spread sizes - smaller to avoid overlap in limited height
        this._setSize(this.titleLabel, w, 32);
        this._setSize(this.nameInput, 300, 40);
        this._setSize(this.cardRoot, Math.min(w - 60, 600), 140);
        this._setSize(this.selectedInfo, w - 80, 28);
        this._setSize(this.selectedDesc, w - 80, 36);
        this._setSize(this.confirmBtn, 160, 40);
        this._setSize(this.skipBtn, 140, 40);
        this._setSize(this.errorLabel, w - 80, 24);

        // Spread from top to bottom with clear gaps
        this.titleLabel?.setPosition(0, halfH - 24);
        this.nameInput?.setPosition(0, halfH - 88);
        this.cardRoot?.setPosition(0, 0);
        this.selectedInfo?.setPosition(0, -90);
        this.selectedDesc?.setPosition(0, -130);
        this.errorLabel?.setPosition(0, -halfH + 70);
        this.confirmBtn?.setPosition(-100, -halfH + 20);
        this.skipBtn?.setPosition(100, -halfH + 20);
    }

    private _setSize(node: Node | null, width: number, height: number): void {
        const t = node?.getComponent(UITransform);
        if (t) t.setContentSize(width, height);
    }
}
