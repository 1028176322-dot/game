/**
 * ResponsivePanelRoot - 自适应面板布局组件
 *
 * 作用：
 *   让 UIPanel 的 PanelRoot 在不同分辨率下自动适配。
 *   DimMask 铺满全屏，PanelFrame 按比例缩放并限制最大/最小值。
 *   布局后触发 ResponsivePanelContent 刷新内容区尺寸。
 *
 * 用法：
 *   挂到每个 UIPanel 的 PanelRoot 节点上。
 *   拖入 DimMask 和 PanelFrame 引用。
 *   不同面板调整 frameWidthRatio / frameHeightRatio 等参数。
 */

import { _decorator, Component, Node, UITransform, view, Vec3, clamp, Sprite } from 'cc';
import { ResponsivePanelContent } from './ResponsivePanelContent';

const { ccclass, property, menu } = _decorator;

@ccclass('ResponsivePanelRoot')
@menu('UI/ResponsivePanelRoot')
export class ResponsivePanelRoot extends Component {
    @property(Node)
    dimMask: Node | null = null;

    @property(Node)
    panelFrame: Node | null = null;

    @property({ tooltip: 'PanelFrame 宽度占父节点的比例' })
    frameWidthRatio = 0.72;

    @property({ tooltip: 'PanelFrame 高度占父节点的比例' })
    frameHeightRatio = 0.78;

    @property
    maxFrameWidth = 900;

    @property
    maxFrameHeight = 620;

    @property
    minFrameWidth = 520;

    @property
    minFrameHeight = 360;

    onLoad(): void {
        this.applyLayout();
        view.on('canvas-resize', this.applyLayout, this);
        view.on('design-resolution-changed', this.applyLayout, this);
    }

    onEnable(): void {
        // Enable DimMask and PanelFrame Sprites disabled in scene file
        // (disabled to avoid white triangle placeholder in editor when spriteFrame is null).
        // Engine renders correctly at runtime with default white texture + color tint.
        if (this.dimMask) {
            const sprite = this.dimMask.getComponent(Sprite);
            if (sprite && !sprite.enabled) sprite.enabled = true;
        }
        if (this.panelFrame) {
            const sprite = this.panelFrame.getComponent(Sprite);
            if (sprite && !sprite.enabled) sprite.enabled = true;
        }

        this.applyLayout();
        // Delayed re-apply in case view size is not ready during the first frame
        this.scheduleOnce(() => this.applyLayout(), 0);
    }

    onDestroy(): void {
        view.off('canvas-resize', this.applyLayout, this);
        view.off('design-resolution-changed', this.applyLayout, this);
        this.unscheduleAllCallbacks();
    }

    applyLayout(): void {
        const visible = view.getVisibleSize();
        let canvasW = visible.width;
        let canvasH = visible.height;

        const parent = this.node.parent;
        const parentTrans = parent?.getComponent(UITransform);
        if (parentTrans && parentTrans.width > 100 && parentTrans.height > 100) {
            canvasW = parentTrans.width;
            canvasH = parentTrans.height;
        }

        // Fallback: if view is not ready, use design resolution baseline
        if (canvasW < 100 || canvasH < 100) {
            canvasW = 1280;
            canvasH = 720;
        }

        const rootTrans = this.node.getComponent(UITransform);
        if (rootTrans) {
            rootTrans.setContentSize(canvasW, canvasH);
        }
        this.node.setPosition(Vec3.ZERO);

        // DimMask = 全屏
        if (this.dimMask) {
            const maskTrans = this.dimMask.getComponent(UITransform);
            if (maskTrans) {
                maskTrans.setContentSize(canvasW, canvasH);
            }
            this.dimMask.setPosition(Vec3.ZERO);
        }

        // PanelFrame = 比例缩放 + clamp
        if (this.panelFrame) {
            const frameTrans = this.panelFrame.getComponent(UITransform);
            if (frameTrans) {
                const w = clamp(canvasW * this.frameWidthRatio, this.minFrameWidth, this.maxFrameWidth);
                const h = clamp(canvasH * this.frameHeightRatio, this.minFrameHeight, this.maxFrameHeight);
                frameTrans.setContentSize(w, h);
            }
            this.panelFrame.setPosition(Vec3.ZERO);

            // 触发 ContentRoot 重新布局
            const content = this.panelFrame.getChildByName('ContentRoot');
            if (content) {
                const contentComp = content.getComponent(ResponsivePanelContent);
                if (contentComp) {
                    contentComp.applyLayout();
                }
            }
        }
    }
}
