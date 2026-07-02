/**
 * ResponsiveUIRoot - 地牢场景 UIRoot 自适应组件
 *
 * 挂载在 Canvas/UIRoot 上。
 * 让 UIRoot 自动铺满可视区域，替代手写 1280x720 固定尺寸。
 */

import { _decorator, Component, UITransform, view, Vec3 } from 'cc';

const { ccclass, menu } = _decorator;

@ccclass('ResponsiveUIRoot')
@menu('UI/ResponsiveUIRoot')
export class ResponsiveUIRoot extends Component {
    onLoad(): void {
        this.applyLayout();
        view.on('canvas-resize', this.applyLayout, this);
        view.on('design-resolution-changed', this.applyLayout, this);
    }

    onDestroy(): void {
        view.off('canvas-resize', this.applyLayout, this);
        view.off('design-resolution-changed', this.applyLayout, this);
    }

    applyLayout(): void {
        const size = view.getVisibleSize();
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.setContentSize(size.width, size.height);
        }
        this.node.setPosition(Vec3.ZERO);
    }
}
