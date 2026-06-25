/**
 * InventoryUI - 背包 UI (M2.5)
 * 
 * 5 格背包 + 道具名称/数量显示 + 点击使用 + 快捷键(1-5)
 * 代码生成节点 (无 Prefab 依赖)
 * 监听 bag:changed 事件自动刷新
 */

import { _decorator, Component, Node, Button, Label, Color, UITransform, Vec3, Sprite, input, Input, KeyCode, EventKeyboard } from 'cc';
import { eventBus } from '../core/EventBus';
import { ItemSystem, ItemStack } from '../battle/ItemSystem';

const { ccclass, property } = _decorator;

@ccclass('InventoryUI')
export class InventoryUI extends Component {
    private _itemSystem: ItemSystem | null = null;
    private _bagSlots: Node[] = [];
    private _isOpen: boolean = false;

    /** 面板根节点 */
    private _panel: Node | null = null;

    init(system: ItemSystem): void {
        this._itemSystem = system;
        this._buildUI();
        this.node.active = false;
    }

    onLoad(): void {
        eventBus.on('bag:changed', this._onBagChanged, this);
        eventBus.on('item:dropped', this._onItemDropped, this);

        // 快捷键 1-5
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    }

    toggle(): void {
        if (this._isOpen) this.hide();
        else this.show();
    }

    show(): void {
        this._isOpen = true;
        this.node.active = true;
        this._refreshAll();
    }

    hide(): void {
        this._isOpen = false;
        this.node.active = false;
    }

    get isOpen(): boolean { return this._isOpen; }

    // ======== UI 构建 ========

    private _buildUI(): void {
        this._panel = new Node('inventoryPanel');
        this.node.addChild(this._panel);
        const panelTransform = this._panel.addComponent(UITransform);
        panelTransform.setContentSize(350, 80);

        // 标题
        const titleNode = new Node('title');
        titleNode.setPosition(-140, 30, 0);
        this._panel.addChild(titleNode);
        const titleLabel = titleNode.addComponent(Label);
        titleLabel.string = '道具';
        titleLabel.fontSize = 14;
        titleLabel.color = Color.WHITE;

        // 5 个格子
        const startX = -120;
        const cellSize = 55;
        const padding = 8;

        for (let i = 0; i < 5; i++) {
            const x = startX + i * (cellSize + padding);
            const node = this._createSlot(i, x);
            this._bagSlots.push(node);
        }

        // 提示快捷键
        const hintNode = new Node('hint');
        hintNode.setPosition(-140, -30, 0);
        this._panel.addChild(hintNode);
        const hintLabel = hintNode.addComponent(Label);
        hintLabel.string = '按 1-5 使用';
        hintLabel.fontSize = 10;
        hintLabel.color = Color.GRAY;
    }

    private _createSlot(index: number, x: number): Node {
        const node = new Node(`slot_${index}`);
        node.setPosition(x, 0, 0);
        this._panel!.addChild(node);
        node.addComponent(UITransform).setContentSize(55, 55);

        // 背景框
        const bg = new Node('bg');
        bg.addComponent(UITransform).setContentSize(55, 55);
        const bgSprite = bg.addComponent(Sprite);
        bgSprite.color = new Color(40, 40, 40, 180);
        node.addChild(bg);

        // 道具名称
        const nameNode = new Node('name');
        nameNode.setPosition(0, 8, 0);
        node.addChild(nameNode);
        const nameLabel = nameNode.addComponent(Label);
        nameLabel.fontSize = 11;
        nameLabel.color = Color.WHITE;
        (node as any)._nameLabel = nameLabel;

        // 数量
        const countNode = new Node('count');
        countNode.setPosition(15, -15, 0);
        node.addChild(countNode);
        const countLabel = countNode.addComponent(Label);
        countLabel.fontSize = 10;
        countLabel.color = Color.YELLOW;
        (node as any)._countLabel = countLabel;

        // 快捷键数字提示
        const keyNode = new Node('key');
        keyNode.setPosition(-15, 20, 0);
        node.addChild(keyNode);
        const keyLabel = keyNode.addComponent(Label);
        keyLabel.string = `${index + 1}`;
        keyLabel.fontSize = 9;
        keyLabel.color = Color.GRAY;
        (node as any)._keyLabel = keyLabel;

        // 点击使用
        node.on(Node.EventType.TOUCH_END, () => {
            this._useItem(index);
        });

        return node;
    }

    // ======== 操作 ========

    private _useItem(index: number): void {
        if (!this._itemSystem) return;
        this._itemSystem.useItem(index);
        this._refreshAll();
    }

    private _onKeyDown(event: EventKeyboard): void {
        // 只处理快捷键当背包可见
        if (!this._isOpen) return;
        const keyMap: Record<number, number> = {
            [KeyCode.DIGIT_1]: 0,
            [KeyCode.DIGIT_2]: 1,
            [KeyCode.DIGIT_3]: 2,
            [KeyCode.DIGIT_4]: 3,
            [KeyCode.DIGIT_5]: 4,
        };
        const idx = keyMap[event.keyCode];
        if (idx !== undefined) {
            this._useItem(idx);
        }
    }

    // ======== 刷新 ========

    private _onBagChanged(): void {
        if (this._isOpen) this._refreshAll();
    }

    private _onItemDropped(itemName: string): void {
        // 掉落通知 (未打开背包时只刷新内部状态)
        this._refreshAll();
    }

    private _refreshAll(): void {
        if (!this._itemSystem) return;
        const bag = this._itemSystem.getBag();

        for (let i = 0; i < this._bagSlots.length; i++) {
            const node = this._bagSlots[i];
            const nameLabel = (node as any)._nameLabel as Label | undefined;
            const countLabel = (node as any)._countLabel as Label | undefined;

            const stack = bag[i];
            if (stack && nameLabel && countLabel) {
                nameLabel.string = stack.def.name.length > 5 ? stack.def.name.slice(0, 5) : stack.def.name;
                countLabel.string = `x${stack.count}`;
                countLabel.color = stack.count >= stack.def.stackMax ? Color.RED : Color.YELLOW;
            } else {
                if (nameLabel) nameLabel.string = '';
                if (countLabel) countLabel.string = '';
            }
        }
    }
}
