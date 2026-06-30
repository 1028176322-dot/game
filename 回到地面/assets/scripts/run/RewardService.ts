/**
 * RewardService - 房间清除奖励
 *
 * 职责:
 * 1. 战斗胜利后生成装备掉落
 * 2. 战斗胜利后生成道具掉落
 *
 * Phase 4: 从 DungeonSceneController 拆分
 */

import { eventBus } from '../core/EventBus';
import { EquipmentSystem } from '../battle/EquipmentSystem';
import { ItemSystem } from '../battle/ItemSystem';

export type ClearedRoomType = 'normal' | 'elite' | 'boss';

export class RewardService {
    constructor(
        private readonly _equipmentSystem: EquipmentSystem | null,
        private readonly _itemSystem: ItemSystem | null,
    ) {}

    /** 发放房间清除奖励 */
    grantRoomClearRewards(roomType: ClearedRoomType): void {
        this._dropEquipment(roomType);
        this._dropItems(roomType);
    }

    private _dropEquipment(roomType: ClearedRoomType): void {
        if (!this._equipmentSystem) return;
        const drops = this._equipmentSystem.generateDrops(roomType, 1);
        for (const drop of drops) {
            if (drop) {
                const autoPickup = this._equipmentSystem.pickupToBackpack(drop);
                if (autoPickup) {
                    console.log(`[装备] 拾取: ${drop.name}`);
                    eventBus.emit('equip:picked_up', drop);
                }
            }
        }
    }

    private _dropItems(roomType: ClearedRoomType): void {
        if (!this._itemSystem) return;
        this._itemSystem.tryDrop(roomType);
    }
}
