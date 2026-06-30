/**
 * EquipmentUI - 装备界面 (Phase 8 重构版)
 *
 * [Phase 8] ViewModel 化重构:
 * - 渲染委托给 EquipmentView
 * - 布局在 View 层面管理
 * - 业务逻辑保留在此（属性和交互）
 * - 支持 @property(Prefab) 未来绑定
 */

import { _decorator, Component, Prefab, instantiate } from 'cc';
import { eventBus } from '../core/EventBus';
import { EquipmentSystem, EquipmentSlot, EQUIPMENT_SLOTS, SLOT_NAMES, Rarity, RARITY_WEIGHTS } from '../battle/EquipmentSystem';
import { EquipmentView } from './view/EquipmentView';
import { EquipmentVM, EquippedSlotVM, BackpackSlotVM, EquippedItemVM } from './viewmodel/EquipmentViewModel';

const { ccclass, property } = _decorator;

const RARITY_COLOR_MAP: Record<string, { r: number; g: number; b: number }> = {
    common: { r: 204, g: 204, b: 204 },
    uncommon: { r: 74, g: 144, b: 217 },
    rare: { r: 255, g: 165, b: 0 },
    epic: { r: 255, g: 69, b: 0 },
};

@ccclass('EquipmentUI')
export class EquipmentUI extends Component {
    /** 未来可绑定 Prefab */
    @property(Prefab) equipPanelPrefab: Prefab | null = null;

    private _equipSystem: EquipmentSystem | null = null;
    private _isOpen = false;
    private _view: EquipmentView | null = null;

    init(system: EquipmentSystem): void {
        this._equipSystem = system;
        this._view = this.getComponent(EquipmentView) ?? this.node.addComponent(EquipmentView);
        this._view.buildFallbackLayout();
        this._view.bindCallbacks(
            (slot) => this._onSlotClick(slot),
            (index) => this._onBackpackClick(index),
        );
        this.node.active = false;
    }

    onLoad(): void {
        eventBus.on('equip:changed', () => this._isOpen && this._refreshAll(), this);
        eventBus.on('equip:unequipped', () => this._isOpen && this._refreshAll(), this);
        eventBus.on('equip:picked_up', () => this._isOpen && this._refreshAll(), this);
    }

    onDestroy(): void { eventBus.offTarget(this); }

    toggle(): void { this._isOpen ? this.hide() : this.show(); }

    show(): void { this._isOpen = true; this.node.active = true; this._refreshAll(); }
    hide(): void { this._isOpen = false; this.node.active = false; }
    get isOpen(): boolean { return this._isOpen; }

    private _refreshAll(): void {
        if (!this._equipSystem || !this._view) return;
        const vm = this._buildVM();
        this._view.render(vm);
    }

    private _buildVM(): EquipmentVM {
        const es = this._equipSystem!;
        const slots: EquippedSlotVM[] = EQUIPMENT_SLOTS.map(slot => ({
            slot,
            slotLabel: SLOT_NAMES[slot] ?? slot,
            item: this._toItemVM(es.getEquipped(slot)),
        }));
        const bp = es.getBackpack();
        const backpack: BackpackSlotVM[] = bp.map((item, i) => ({
            index: i,
            item: this._toItemVM(item),
        }));
        const sets = es.getActiveSetBonuses();
        return {
            slots,
            backpack,
            setInfo: sets.map(s => `${s.name} (${s.count})`),
            statsText: `战力: ${es.getTotalPowerLevel()}  背包: ${es.freeBackpackSlots}/12`,
        };
    }

    private _toItemVM(item: any): EquippedItemVM | null {
        if (!item) return null;
        return {
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            rarityColor: RARITY_COLOR_MAP[item.rarity] ?? { r: 255, g: 255, b: 255 },
        };
    }

    private _onSlotClick(slot: EquipmentSlot): void {
        if (!this._equipSystem) return;
        const item = this._equipSystem.getEquipped(slot);
        if (item) this._equipSystem.unequip(slot);
        this._refreshAll();
    }

    private _onBackpackClick(index: number): void {
        if (!this._equipSystem) return;
        const bp = this._equipSystem.getBackpack();
        const item = bp[index];
        if (!item) return;
        this._equipSystem.equip(item);
        this._equipSystem.discardFromBackpack(index);
        this._refreshAll();
    }
}
