/**
 * VerticalPanelLayout — Generic vertical zone-based layout component
 *
 * Usage: Mount on ContentRoot. Set zones in editor, then call applyLayout().
 * Places zones top-to-bottom within the container, with fixed heights + gaps + padding.
 *
 * Typical usage:
 *   ContentRoot [VerticalPanelLayout]
 *   ├── HeaderZone      52px  (TitleLabel)
 *   ├── PreviewZone    150px  (ModelDisplay)
 *   ├── ChoiceZone      58px  (CardRoot / buttons)
 *   ├── InfoZone        76px  (SelectedInfo, SelectedDesc)
 *   └── ActionZone      58px  (ConfirmBtn, SkipBtn)
 *
 * Each zone is responsible for its own internal layout (handled by panel-specific layout
 * component like CreatePanelLayout, or by the zone's own component).
 *
 * Integration with ResponsivePanelContent:
 *   ResponsivePanelContent.applyLayout() → sets ContentRoot size →
 *   VerticalPanelLayout.applyLayout() → positions zones →
 *   panel-specific layout → positions elements within each zone.
 */

import { _decorator, Component, Node, UITransform } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('VerticalPanelLayout')
@menu('UI/VerticalPanelLayout')
export class VerticalPanelLayout extends Component {
    @property([Node])
    zones: Node[] = [];

    @property([Number])
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

        // Calculate total fixed height
        let fixedH = this.paddingTop + this.paddingBottom;
        for (let i = 0; i < count; i++) {
            fixedH += this.heights[i] ?? 0;
        }
        fixedH += Math.max(0, count - 1) * this.gap;

        // Start from top
        let y = totalH / 2 - this.paddingTop;

        for (let i = 0; i < count; i++) {
            const zone = this.zones[i];
            if (!zone) continue;

            const h = this.heights[i] ?? 0;
            const trans = zone.getComponent(UITransform);
            if (trans) {
                trans.setContentSize(totalW, h);
            }

            y -= h / 2;
            zone.setPosition(0, y);
            y -= h / 2 + this.gap;
        }
    }
}
