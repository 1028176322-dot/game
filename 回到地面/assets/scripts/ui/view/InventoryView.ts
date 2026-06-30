/**
 * InventoryView - 道具背包渲染层
 *
 * Phase 8: UI Prefab + ViewModel 化
 * 无 Prefab 时使用 fallback 代码布局
 */

import { _decorator, Component, Node, Label, Sprite, Color, UITransform, Vec3 } from 'cc';
import { InventoryVM, InventorySlotVM } from '../viewmodel/InventoryViewModel';
import { T } from '../../core/TextManager';

const { ccclass, property } = _decorator;

@ccclass('InventoryView')
export class InventoryView extends Component {
    @property(Node) slotContainer: Node | null = null;

    private _slots: Array<{ root: Node; label: Label; countLabel: Label; keyLabel: Label }> = [];
    private _hintLabel: Label | null = null;

    private _onSlotClick: ((index: number) => void) | null = null;

    bindCallbacks(slotClick: (index: number) => void): void {
        this._onSlotClick = slotClick;
    }

    buildFallbackLayout(): void {
        if (this.slotContainer) return;
        const panel = new Node('inventoryPanel');
        panel.addComponent(UITransform).setContentSize(360, 260);
        this.node.addChild(panel);

        const title = new Node('title'); title.setPosition(0, 110); panel.addChild(title);
        const tl = title.addComponent(Label); tl.string = T('ui.inventory'); tl.fontSize = 22; tl.color = Color.WHITE;

        const cell = 70, pad = 8, startX = -140, startY = 60;
        for (let i = 0; i < 5; i++) {
            const x = startX + i * (cell + pad);
            const node = this._buildSlot(i, x, startY);
            panel.addChild(node.root);
            this._slots.push(node);
        }

        const hint = new Node('hint'); hint.setPosition(0, -100); panel.addChild(hint);
        this._hintLabel = hint.addComponent(Label);
        this._hintLabel.fontSize = 12; this._hintLabel.color = Color.GRAY;
    }

    render(vm: InventoryVM): void {
        for (let i = 0; i < this._slots.length; i++) {
            const slot = this._slots[i];
            const data = vm.slots[i];
            if (data) {
                slot.label.string = data.name.length > 4 ? data.name.slice(0, 4) : data.name;
                slot.label.color = data.usable ? Color.WHITE : Color.GRAY;
                slot.countLabel.string = data.count > 1 ? `x${data.count}` : '';
                slot.keyLabel.string = data.keyHint;
            } else {
                slot.label.string = '';
                slot.countLabel.string = '';
                slot.keyLabel.string = '';
            }
        }
        if (this._hintLabel) this._hintLabel.string = vm.hintText;
    }

    private _buildSlot(index: number, x: number, y: number) {
        const root = new Node(`slot_${index}`); root.setPosition(x, y);
        root.addComponent(UITransform).setContentSize(70, 70);
        const bg = new Node('bg'); bg.addComponent(UITransform).setContentSize(70, 70);
        bg.addComponent(Sprite).color = new Color(40, 40, 40, 180);
        root.addChild(bg);
        const nameN = new Node('name'); root.addChild(nameN);
        const label = nameN.addComponent(Label); label.fontSize = 11; label.color = Color.WHITE;
        const countN = new Node('count'); countN.setPosition(20, -20); root.addChild(countN);
        const countLabel = countN.addComponent(Label); countLabel.fontSize = 10; countLabel.color = Color.YELLOW;
        const keyN = new Node('key'); keyN.setPosition(0, -28); root.addChild(keyN);
        const keyLabel = keyN.addComponent(Label); keyLabel.fontSize = 9; keyLabel.color = new Color(150, 150, 150);
        root.on(Node.EventType.TOUCH_END, () => this._onSlotClick?.(index));
        return { root, label, countLabel, keyLabel };
    }
}
