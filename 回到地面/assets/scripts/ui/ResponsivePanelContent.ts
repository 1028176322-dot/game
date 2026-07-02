/**
 * ResponsivePanelContent - 内容区自适应组件
 *
 * 挂载在 PanelFrame/ContentRoot 上。
 * 根据 PanelFrame 尺寸自动计算 ContentRoot 大小，保留 padding。
 *
 * 用法：
 *   拖入 PanelFrame 引用，设 paddingX / paddingY。
 */

import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('ResponsivePanelContent')
@menu('UI/ResponsivePanelContent')
export class ResponsivePanelContent extends Component {
    @property(Node)
    panelFrame: Node | null = null;

    @property
    paddingX = 48;

    @property
    paddingY = 56;

    onLoad(): void {
        this.applyLayout();
    }

    onEnable(): void {
        this.applyLayout();
    }

    applyLayout(): void {
        const frame = this.panelFrame ?? this.node.parent;
        if (!frame) return;

        const frameTrans = frame.getComponent(UITransform);
        const contentTrans = this.node.getComponent(UITransform);
        if (!frameTrans || !contentTrans) return;

        const width = Math.max(0, frameTrans.width - this.paddingX * 2);
        const height = Math.max(0, frameTrans.height - this.paddingY * 2);

        contentTrans.setContentSize(width, height);
        this.node.setPosition(Vec3.ZERO);
    }
}
