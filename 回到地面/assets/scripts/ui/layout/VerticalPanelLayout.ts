/**
 * Generic vertical zone layout.
 *
 * Mount on ContentRoot. The component positions zone nodes from top to bottom.
 * If available height is smaller than the requested layout, it scales zone
 * heights and gaps down together instead of letting zones overlap.
 */

import { _decorator, CCInteger, Component, Node, UITransform, clamp } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('VerticalPanelLayout')
@menu('UI/VerticalPanelLayout')
export class VerticalPanelLayout extends Component {
    @property([Node])
    zones: Node[] = [];

    @property({ type: [CCInteger] })
    heights: number[] = [];

    @property
    gap = 10;

    @property
    paddingTop = 18;

    @property
    paddingBottom = 18;

    applyLayout(): void {
        const rootTrans = this.node.getComponent(UITransform);
        if (!rootTrans) return;

        const totalH = rootTrans.height;
        const totalW = rootTrans.width;
        const count = Math.min(this.zones.length, this.heights.length);
        if (count <= 0) return;

        let requestedH = this.paddingTop + this.paddingBottom;
        for (let i = 0; i < count; i++) {
            requestedH += this.heights[i] ?? 0;
        }
        requestedH += Math.max(0, count - 1) * this.gap;

        const scale = requestedH > 0 ? clamp(totalH / requestedH, 0.45, 1) : 1;
        const gap = this.gap * scale;
        const paddingTop = this.paddingTop * scale;

        let y = totalH / 2 - paddingTop;

        for (let i = 0; i < count; i++) {
            const zone = this.zones[i];
            if (!zone) continue;

            const h = (this.heights[i] ?? 0) * scale;
            const trans = zone.getComponent(UITransform);
            if (trans) {
                trans.setContentSize(totalW, h);
            }

            y -= h / 2;
            zone.setPosition(0, y);
            y -= h / 2 + gap;
        }
    }
}
