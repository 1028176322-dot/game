/**
 * SplashLayout - 启动页自适应布局组件
 *
 * 挂载在 Canvas/SplashUI 上。
 * 负责 SplashImage 居中、LoadingBar 底部安全区定位、
 * SkipButton 右上角定位。
 */

import { _decorator, Component, Node, UITransform, view, Vec3 } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('SplashLayout')
@menu('UI/SplashLayout')
export class SplashLayout extends Component {
    @property(Node)
    splashImage: Node | null = null;

    @property(Node)
    loadingBar: Node | null = null;

    @property(Node)
    loadingLabel: Node | null = null;

    @property(Node)
    skipButton: Node | null = null;

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
        const halfW = size.width / 2;
        const halfH = size.height / 2;
        const margin = 36;

        const rootTrans = this.node.getComponent(UITransform);
        if (rootTrans) {
            rootTrans.setContentSize(size.width, size.height);
        }

        if (this.splashImage) {
            this.splashImage.setPosition(Vec3.ZERO);
        }

        if (this.loadingBar) {
            this.loadingBar.setPosition(0, -halfH + 96, 0);
        }

        if (this.loadingLabel) {
            this.loadingLabel.setPosition(0, -halfH + 58, 0);
        }

        if (this.skipButton) {
            this.skipButton.setPosition(halfW - margin - 60, halfH - margin - 24, 0);
        }
    }
}
