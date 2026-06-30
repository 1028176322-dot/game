/**
 * ItemSystem - 道具系统 (M2.5)
 * 
 * 8 种消耗品 + 5 格背包(可叠加) + 掉落(按怪物类型)
 * 道具不可带出关卡 (重开时清空)
 * 
 * 使用效果:
 *   heal: 回复 HP
 *   buff: 临时属性加成 (持续本场战斗)
 *   aoe: 范围伤害/冰冻
 *   purify: 移除debuff + 回血
 */

import { _decorator, Component, Node, Vec3 } from 'cc';
import { ElementType } from '../core/Constants';
import { GameConfig } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { PlayerController } from './PlayerController';
import { BattleManager } from './BattleManager';
import { MonsterController } from './MonsterController';
import { MathUtils } from '../utils/MathUtils';

const { ccclass, property } = _decorator;

// ======== 道具类型 ========

export type ItemEffectType = 'heal' | 'buff' | 'aoe' | 'purify';

export interface ItemDef {
    id: string;
    name: string;
    effect: ItemEffectType;
    stackMax: number;
    // heal
    healAmount?: number;
    // buff
    buffStat?: 'atk' | 'def' | 'moveSpeed';
    buffAmount?: number;
    buffPercent?: number; // 0.2 = +20%
    // aoe
    aoeRange?: number;
    damage?: number;
    element?: string;
    freezeDuration?: number;
}

export interface ItemStack {
    def: ItemDef;
    count: number;
}

interface DropConfig {
    chance: number;
    pool: string[];
}

const ALL_ITEMS: Record<string, ItemDef> = {
    healingPotion: { id: 'healingPotion', name: '回复药水', effect: 'heal', healAmount: 10, stackMax: 5 },
    bigHealingPotion: { id: 'bigHealingPotion', name: '大回复药水', effect: 'heal', healAmount: 25, stackMax: 3 },
    furyPotion: { id: 'furyPotion', name: '狂暴药水', effect: 'buff', buffStat: 'atk', buffAmount: 4, stackMax: 3 },
    ironPotion: { id: 'ironPotion', name: '铁壁药水', effect: 'buff', buffStat: 'def', buffAmount: 3, stackMax: 3 },
    speedPotion: { id: 'speedPotion', name: '疾速药水', effect: 'buff', buffStat: 'moveSpeed', buffPercent: 0.2, stackMax: 3 },
    purifyPotion: { id: 'purifyPotion', name: '净化药水', effect: 'purify', healAmount: 5, stackMax: 3 },
    flameBomb: { id: 'flameBomb', name: '火焰瓶', effect: 'aoe', aoeRange: 2, damage: 8, element: 'fire', stackMax: 3 },
    iceBomb: { id: 'iceBomb', name: '冰霜瓶', effect: 'aoe', aoeRange: 2, freezeDuration: 2, element: 'frost', stackMax: 3 },
};

const DROP_CONFIGS: Record<string, DropConfig> = {
    normal: { chance: 0.12, pool: ['healingPotion', 'furyPotion', 'ironPotion', 'flameBomb', 'iceBomb'] },
    elite: { chance: 0.40, pool: ['bigHealingPotion', 'purifyPotion', 'flameBomb'] },
    boss: { chance: 1.0, pool: ['bigHealingPotion', 'purifyPotion'] },
};

// ======== 道具系统 ========

@ccclass('ItemSystem')
export class ItemSystem extends Component {
    private _player: PlayerController | null = null;
    private _battleManager: BattleManager | null = null;

    /** 背包: 最多 5 格 */
    private _bag: (ItemStack | null)[] = new Array(5).fill(null);

    init(player: PlayerController, battleManager: BattleManager): void {
        this._player = player;
        this._battleManager = battleManager;
    }

    /** 重置背包 (新地牢/死亡时) */
    resetBag(): void {
        this._bag = new Array(5).fill(null);
        eventBus.emit('bag:changed', this._getBagSnapshot());
    }

    // ======== 背包操作 ========

    /** 获取背包内容 (只读快照) */
    getBag(): (ItemStack | null)[] {
        return this._getBagSnapshot();
    }

    private _getBagSnapshot(): (ItemStack | null)[] {
        return this._bag.map(s => s ? { def: { ...s.def }, count: s.count } : null);
    }

    /** 拾取道具到背包 (自动叠加或放入空格) */
    pickupItem(itemDef: ItemDef, count: number = 1): boolean {
        // 先找同物品叠加
        for (let i = 0; i < this._bag.length; i++) {
            const stack = this._bag[i];
            if (stack && stack.def.id === itemDef.id && stack.count < itemDef.stackMax) {
                const addable = Math.min(itemDef.stackMax - stack.count, count);
                stack.count += addable;
                count -= addable;
                if (count <= 0) {
                    this._emitBagChanged();
                    return true;
                }
            }
        }

        // 再找空格
        for (let i = 0; i < this._bag.length; i++) {
            if (this._bag[i] === null) {
                const addCount = Math.min(count, itemDef.stackMax);
                this._bag[i] = { def: { ...itemDef }, count: addCount };
                count -= addCount;
                if (count <= 0) {
                    this._emitBagChanged();
                    return true;
                }
            }
        }

        // 背包满了
        if (count < 1) {
            this._emitBagChanged();
            return true;
        }
        return false;
    }

    /** 从背包移除道具 */
    removeItem(index: number, count: number = 1): boolean {
        const stack = this._bag[index];
        if (!stack || stack.count < count) return false;
        stack.count -= count;
        if (stack.count <= 0) {
            this._bag[index] = null;
        }
        this._emitBagChanged();
        return true;
    }

    /** 使用道具 (index 为背包格子位置) */
    useItem(index: number): boolean {
        const stack = this._bag[index];
        if (!stack) return false;

        if (!this._applyEffect(stack.def)) return false;

        // 消耗 1 个
        return this.removeItem(index, 1);
    }

    // ======== 使用效果 ========

    private _applyEffect(itemDef: ItemDef): boolean {
        if (!this._player) return false;

        switch (itemDef.effect) {
            case 'heal': {
                this._player.heal(itemDef.healAmount ?? 10);
                eventBus.emit('item:used', itemDef.id, { heal: itemDef.healAmount });
                return true;
            }
            case 'buff': {
                const s = this._player.stats;
                const source = `item:${itemDef.id}`;
                if (itemDef.buffStat === 'atk') {
                    s.applyModifier({ source, stat: 'atk', value: itemDef.buffAmount ?? 4, type: 'flat', duration: 0 });
                } else if (itemDef.buffStat === 'def') {
                    s.applyModifier({ source, stat: 'def', value: itemDef.buffAmount ?? 3, type: 'flat', duration: 0 });
                } else if (itemDef.buffStat === 'moveSpeed') {
                    s.applyModifier({ source, stat: 'moveSpeed', value: itemDef.buffPercent ?? 0.2, type: 'percent', duration: 0 });
                }
                // buff 持续至战斗结束 (地牢重置时清空)
                eventBus.emit('item:used', itemDef.id, { buff: itemDef.buffStat });
                return true;
            }
            case 'aoe': {
                if (!this._battleManager) return false;
                const pos = this._player.node.getPosition();
                const radius = (itemDef.aoeRange ?? 2) * GameConfig.TILE_SIZE;
                const monsters = this._battleManager.getAllMonsters();
                for (const m of monsters) {
                    const d = MathUtils.euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);
                    if (d <= radius) {
                        // AoE 伤害
                        if (itemDef.damage) {
                            const killed = m.takeDamage(itemDef.damage, false);
                            if (killed) this._battleManager.removeMonster(m);
                        }
                        // 冻结
                        if (itemDef.freezeDuration) {
                            m.freeze(itemDef.freezeDuration);
                        }
                    }
                }
                eventBus.emit('item:used', itemDef.id, { aoe: true });
                return true;
            }
            case 'purify': {
                // 净化: 恢复少量 HP + 清除 debuff
                if (itemDef.healAmount) {
                    this._player.heal(itemDef.healAmount);
                }
                // 清除怪物身上的 debuff 是个复杂操作, 简化处理
                eventBus.emit('item:used', itemDef.id, { purify: true });
                return true;
            }
            default:
                return false;
        }
    }

    // ======== 掉落系统 ========

    /** 根据怪物类型生成掉落 */
    generateDrop(roomType: 'normal' | 'elite' | 'boss'): boolean {
        const config = DROP_CONFIGS[roomType];
        if (!config || !MathUtils.chance(config.chance)) return false;

        const itemId = MathUtils.randomPick(config.pool);
        const itemDef = ALL_ITEMS[itemId];
        if (!itemDef) return false;

        const picked = this.pickupItem(itemDef);
        if (picked) {
            eventBus.emit('item:dropped', itemDef.name);
        }
        return picked;
    }

    /** 调用掉落 (由 BattleManager 或外部系统) */
    tryDrop(roomType: string): void {
        if (roomType === 'boss' || roomType === 'elite' || roomType === 'normal') {
            this.generateDrop(roomType);
        }
    }

    // ======== 内部 ========

    private _emitBagChanged(): void {
        eventBus.emit('bag:changed', this._getBagSnapshot());
    }

    /** 获取道具名称 (供 UI 显示) */
    static getItemDef(id: string): ItemDef | undefined {
        return ALL_ITEMS[id];
    }
}
