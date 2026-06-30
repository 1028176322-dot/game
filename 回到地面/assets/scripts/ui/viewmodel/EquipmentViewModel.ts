/**
 * EquipmentViewModel - 装备界面数据模型
 *
 * 职责：装备界面的纯数据定义，不涉及渲染
 * 渲染由 EquipmentView 根据此 VM 驱动
 *
 * Phase 8: UI Prefab + ViewModel 化
 */

import { EquipmentSlot, Rarity } from '../../battle/EquipmentSystem';

export interface EquippedSlotVM {
    slot: EquipmentSlot;
    slotLabel: string;
    item: EquippedItemVM | null;
}

export interface EquippedItemVM {
    id: string;
    name: string;
    rarity: Rarity;
    rarityColor: { r: number; g: number; b: number };
}

export interface BackpackSlotVM {
    index: number;
    item: EquippedItemVM | null;
}

export interface EquipmentVM {
    slots: EquippedSlotVM[];
    backpack: BackpackSlotVM[];
    setInfo: string[];
    statsText: string;
}
