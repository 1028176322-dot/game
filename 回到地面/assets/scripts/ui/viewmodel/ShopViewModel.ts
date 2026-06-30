/**
 * ShopViewModel - 商店界面数据模型
 *
 * Phase 8: UI Prefab + ViewModel 化
 */

export interface ShopTabVM {
    id: string;
    label: string;
    active: boolean;
}

export interface ShopItemVM {
    id: string;
    name: string;
    description: string;
    cost: number;
    canAfford: boolean;
    actionLabel: string;
    icon?: string;
}

export interface SoulStoneDisplayVM {
    amount: number;
}

export interface ShopVM {
    tabs: ShopTabVM[];
    items: ShopItemVM[];
    soulStones: SoulStoneDisplayVM;
    activeTab: string;
}
