/**
 * InventoryUI - 背包 UI (Phase 8 重构版)
 *
 * [Phase 8] ViewModel 化重构:
 * - 渲染委托给 InventoryView
 * - 布局在 View 层面管理
 * - 快捷键/交互逻辑保留在此
 */

import { _decorator, Component, Node, Prefab, input, Input, KeyCode, EventKeyboard } from 'cc';
import { eventBus } from '../core/EventBus';
import { ItemSystem } from '../battle/ItemSystem';
import { InventoryView } from './view/InventoryView';
import { InventoryVM, InventorySlotVM } from './viewmodel/InventoryViewModel';

const { ccclass, property } = _decorator;

@ccclass('InventoryUI')
export class InventoryUI extends Component {
    @property(Prefab) inventoryPrefab: Prefab | null = null;

    private _itemSystem: ItemSystem | null = null;
    private _isOpen = false;
    private _view: InventoryView | null = null;

    init(system: ItemSystem): void {
        this._itemSystem = system;
        this._view = this.getComponent(InventoryView) ?? this.node.addComponent(InventoryView);
        this._view.buildFallbackLayout();
        this._view.bindCallbacks((index) => this._useItem(index));
        this.node.active = false;
    }

    onLoad(): void {
        eventBus.on('bag:changed', () => this._isOpen && this._refreshAll(), this);
        eventBus.on('item:dropped', () => this._refreshAll(), this);
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    }

    toggle(): void { this._isOpen ? this.hide() : this.show(); }
    show(): void { this._isOpen = true; this.node.active = true; this._refreshAll(); }
    hide(): void { this._isOpen = false; this.node.active = false; }
    get isOpen(): boolean { return this._isOpen; }

    private _useItem(index: number): void {
        this._itemSystem?.useItem(index);
        this._refreshAll();
    }

    private _onKeyDown(event: EventKeyboard): void {
        if (!this._isOpen) return;
        const keyMap: Record<number, number> = {
            [KeyCode.DIGIT_1]: 0, [KeyCode.DIGIT_2]: 1, [KeyCode.DIGIT_3]: 2,
            [KeyCode.DIGIT_4]: 3, [KeyCode.DIGIT_5]: 4,
        };
        const idx = keyMap[event.keyCode];
        if (idx !== undefined) this._useItem(idx);
    }

    private _refreshAll(): void {
        if (!this._itemSystem || !this._view) return;
        const vm = this._buildVM();
        this._view.render(vm);
    }

    private _buildVM(): InventoryVM {
        const bag = this._itemSystem!.getBag();
        const slots: InventorySlotVM[] = bag.map((stack, i) => ({
            id: stack?.def?.id ?? `empty_${i}`,
            icon: '',
            name: stack?.def?.name ?? '',
            count: stack?.count ?? 0,
            usable: stack != null,
            keyHint: `${i + 1}`,
        }));
        return {
            slots,
            selectedItemId: null,
            hintText: '按 1-5 使用',
        };
    }
}
