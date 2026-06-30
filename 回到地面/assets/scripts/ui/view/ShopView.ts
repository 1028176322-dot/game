/**
 * ShopView - 商店渲染层
 *
 * Phase 8: UI Prefab + ViewModel 化
 */

import { _decorator, Component, Node, Label, Sprite, Color, UITransform, Vec3 } from 'cc';
import { ShopVM, ShopTabVM, ShopItemVM } from '../viewmodel/ShopViewModel';

const { ccclass, property } = _decorator;

@ccclass('ShopView')
export class ShopView extends Component {
    @property(Node) panelRoot: Node | null = null;

    private _tabs: Node[] = [];
    private _contentRoot: Node | null = null;
    private _soulStoneLabel: Label | null = null;
    private _items: Array<{ root: Node; nameL: Label; descL: Label; actionL: Label; costL: Label }> = [];
    private _noPrefabPanel: Node | null = null;

    private _onTabClick: ((tabId: string) => void) | null = null;
    private _onItemClick: ((itemId: string) => void) | null = null;

    bindCallbacks(tabClick: (tabId: string) => void, itemClick: (itemId: string) => void): void {
        this._onTabClick = tabClick;
        this._onItemClick = itemClick;
    }

    buildFallbackLayout(): void {
        if (this.panelRoot) return;
        const panel = new Node('shopPanel');
        panel.addComponent(UITransform).setContentSize(440, 380);
        this.node.addChild(panel);
        this._noPrefabPanel = panel;

        const title = new Node('title'); title.setPosition(0, 170); panel.addChild(title);
        (title.addComponent(Label)).string = T('ui.shopTitle'); title.getComponent(Label)!.fontSize = 22;

        this._soulStoneLabel = this._addLabel(panel, 'soulStone', 140, 170, '', 12, Color.YELLOW);

        // 3 个标签页占位
        for (let i = 0; i < 3; i++) {
            const tab = new Node(`tab_${i}`); tab.setPosition(-120 + i * 120, 130);
            tab.addComponent(UITransform).setContentSize(100, 30);
            const l = tab.addComponent(Label); l.fontSize = 14; l.color = Color.WHITE;
            panel.addChild(tab);
            this._tabs.push(tab);
            const idx = i;
            tab.on(Node.EventType.TOUCH_END, () => this._onTabClick?.(`tab_${idx}`));
        }

        this._contentRoot = new Node('content'); this._contentRoot.setPosition(0, 20);
        panel.addChild(this._contentRoot);

        const closeBtn = this._addLabel(panel, 'closeBtn', 190, 170, 'X', 16, Color.RED);
        closeBtn.on(Node.EventType.TOUCH_END, () => this.node.active = false);
    }

    render(vm: ShopVM): void {
        // 魂石
        if (this._soulStoneLabel) this._soulStoneLabel.string = T('ui.shopSoulStone', { count: vm.soulStones.amount });

        // 标签页
        for (let i = 0; i < this._tabs.length; i++) {
            const tab = vm.tabs[i];
            const label = this._tabs[i].getComponent(Label);
            if (label && tab) {
                label.string = tab.label;
                label.color = tab.active ? Color.WHITE : Color.GRAY;
            }
        }

        // 商品列表
        this._contentRoot?.removeAllChildren();
        this._items = [];
        for (const item of vm.items) {
            const node = this._buildItem(item);
            this._contentRoot?.addChild(node.root);
            this._items.push(node);
        }
    }

    private _buildItem(item: ShopItemVM) {
        const root = new Node(`item_${item.id}`);
        root.addComponent(UITransform).setContentSize(400, 40);
        const y = -this._items.length * 45;
        root.setPosition(0, y);
        const nameL = this._addLabel(root, 'name', -160, 0, item.name, 13, Color.WHITE);
        const descL = this._addLabel(root, 'desc', -30, 0, item.description, 10, new Color(180, 180, 180));
        const costL = this._addLabel(root, 'cost', 130, 0, `${item.cost}`, 12, item.canAfford ? Color.YELLOW : Color.RED);
        const actionL = this._addLabel(root, 'action', 180, 0, item.actionLabel, 12, item.canAfford ? Color.GREEN : Color.GRAY);
        root.on(Node.EventType.TOUCH_END, () => this._onItemClick?.(item.id));
        return { root, nameL, descL, actionL, costL };
    }

    private _addLabel(parent: Node, name: string, x: number, y: number, text: string, size: number, color: Color): Node {
        const n = new Node(name); n.setPosition(x, y); parent.addChild(n);
        const l = n.addComponent(Label); l.string = text; l.fontSize = size; l.color = color;
        n.addComponent(UITransform).setContentSize(200, 24);
        return n;
    }
}
