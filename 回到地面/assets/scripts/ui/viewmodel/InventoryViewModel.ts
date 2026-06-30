/**
 * InventoryViewModel - 道具背包数据模型
 *
 * Phase 8: UI Prefab + ViewModel 化
 */

export interface InventorySlotVM {
    id: string;
    icon: string;
    name: string;
    count: number;
    usable: boolean;
    keyHint: string;
}

export interface InventoryVM {
    slots: InventorySlotVM[];
    selectedItemId: string | null;
    hintText: string;
}
