/**
 * EventSystem - 事件系统 (Phase 3, M3.4)
 * 
 * 事件房内 2 选 1 的决策系统
 * 8 种场景 × 6 种状态检测 × 12 种后果
 * 状态匹配生成合理的 A/B 选项
 */

import { GameConfig } from '../core/GameConfig';
import { PlayerController } from './PlayerController';
import { MathUtils } from '../utils/MathUtils';

// ======== 类型定义 ========

export interface EventScene {
    id: string;
    name: string;
    description: string;
    weight: number;
    /** 特定条件选项 (覆盖默认通用选项) */
    specialConditions?: EventCondition[];
}

export interface EventCondition {
    /** 条件: 'hp_low' | 'hp_mid' | 'hp_high' | 'gold_rich' | 'gold_poor' | 'has_key' | 'no_key' | 'many_kills' | 'few_kills' | 'floor_shallow' | 'floor_deep' | 'has_fire' | 'has_frost' */
    check: string;
    /** 选项 A */
    optionA: EventOption;
    /** 选项 B */
    optionB: EventOption;
}

export interface EventOption {
    label: string;         // 显示名
    description: string;   // 效果描述
    consequences: EventConsequence[];
    /** 选项是否可用（条件不足时置灰） */
    isAvailable?: (player: PlayerController) => boolean;
}

export interface EventConsequence {
    type: 'heal' | 'damage' | 'gold_gain' | 'gold_loss' | 'key_gain' | 'key_loss'
        | 'buff' | 'debuff' | 'weaken_next' | 'strengthen_next' | 'relic_gain' | 'nothing';
    value: number;         // 数值
    duration?: number;     // 持续场数 (buff/debuff)
}

export interface GeneratedEvent {
    scene: EventScene;
    optionA: EventOption;
    optionB: EventOption;
    description: string;   // 最终显示的描述文本
}

// ======== 事件场景定义 ========

const EVENT_SCENES: EventScene[] = [
    {
        id: 'broken_altar', name: '破碎祭坛', weight: 20,
        description: '一座破损的献祭台，台面上刻着古老的符文，周围散落着骨骸和金币',
        specialConditions: [
            {
                check: 'hp_low',
                optionA: { label: '献祭', description: '消耗 3 HP 换取 8 金币', consequences: [{ type: 'damage', value: 3 }, { type: 'gold_gain', value: 8 }] },
                optionB: { label: '祈祷', description: '消耗 5 金币恢复 6 HP', consequences: [{ type: 'gold_loss', value: 5 }, { type: 'heal', value: 6 }] },
            },
        ],
    },
    {
        id: 'glowing_crystal', name: '发光水晶', weight: 18,
        description: '墙壁上镶嵌着一颗脉动的能量水晶，散发出不稳定的光芒',
        specialConditions: [
            {
                check: 'hp_low',
                optionA: { label: '触碰', description: '触碰水晶，回复 8 HP', consequences: [{ type: 'heal', value: 8 }] },
                optionB: { label: '砸碎', description: '砸碎水晶获得 10 金币，但怪物攻击+1', consequences: [{ type: 'gold_gain', value: 10 }, { type: 'debuff', value: 1, duration: 1 }] },
            },
            {
                check: 'has_fire',
                optionA: { label: '共鸣', description: '火焰共鸣，HP 全满，但失去火焰附魔', consequences: [{ type: 'heal', value: 999 }] },
                optionB: { label: '灌注', description: '灌注火焰，下一房怪物全灼烧', consequences: [{ type: 'weaken_next', value: 3 }] },
            },
        ],
    },
    {
        id: 'ancient_statue', name: '古代雕像', weight: 15,
        description: '一尊持剑的战士雕像，剑刃上刻着一段褪色的铭文',
        specialConditions: [
            {
                check: 'has_key',
                optionA: { label: '献祭钥匙', description: '用钥匙开启雕像底座，获得随机遗物', consequences: [{ type: 'key_loss', value: 1 }, { type: 'relic_gain', value: 1 }] },
                optionB: { label: '检查', description: '仔细检查雕像，发现 5 金币', consequences: [{ type: 'gold_gain', value: 5 }] },
            },
        ],
    },
    {
        id: 'twisted_portal', name: '扭曲传送门', weight: 14,
        description: '空气扭曲着形成一个旋转的次元裂隙，发出低沉的嗡鸣声',
        specialConditions: [
            {
                check: 'many_kills',
                optionA: { label: '进入', description: '跳过下一场战斗，直接到下一房间', consequences: [{ type: 'nothing', value: 0 }] },
                optionB: { label: '摧毁', description: '摧毁传送门，获得 10 金币', consequences: [{ type: 'gold_gain', value: 10 }] },
            },
        ],
    },
    {
        id: 'magic_well', name: '魔法井', weight: 13,
        description: '一口深不见底的蓝色井口，水面泛着微弱的荧光',
    },
    {
        id: 'mysterious_merchant', name: '神秘商人', weight: 10,
        description: '一个兜帽遮面的流浪商人蹲在角落，面前摆着几个发光的瓶子',
        specialConditions: [
            {
                check: 'gold_rich',
                optionA: { label: '高阶药水', description: '20 金币换取 HP 全满 + ATK+2', consequences: [{ type: 'gold_loss', value: 20 }, { type: 'heal', value: 999 }, { type: 'buff', value: 2, duration: 1 }] },
                optionB: { label: '幸运符', description: '15 金币换取暴击率 +15%', consequences: [{ type: 'gold_loss', value: 15 }, { type: 'buff', value: 15, duration: 1 }] },
            },
        ],
    },
    {
        id: 'trap_hallway', name: '陷阱走廊', weight: 5,
        description: '走廊两侧墙壁布满箭孔，地板上能看到压力板的痕迹',
    },
    {
        id: 'dormant_volcano', name: '休眠火山', weight: 5,
        description: '地面裂开一道缝隙，岩浆在下方缓慢流动，散发着灼热的空气',
    },
];

export class EventSystem {
    private _player: PlayerController | null = null;
    private _lastEventFloor: number = 0; // 上次触发稀有事件的层数

    init(player: PlayerController): void {
        this._player = player;
    }

    /** 生成一个随机事件 */
    generateEvent(currentFloor: number, zoneId: string): GeneratedEvent {
        const scene = this._pickScene();
        const description = this._buildDescription(scene);
        const options = this._generateOptions(scene);

        return {
            scene,
            description,
            optionA: options.optionA,
            optionB: options.optionB,
        };
    }

    /** 按权重随机选择场景 */
    private _pickScene(): EventScene {
        const totalWeight = EVENT_SCENES.reduce((s, sc) => s + sc.weight, 0);
        let roll = Math.random() * totalWeight;
        for (const scene of EVENT_SCENES) {
            roll -= scene.weight;
            if (roll <= 0) return scene;
        }
        return EVENT_SCENES[0];
    }

    /** 构建场景描述（加玩家状态附着） */
    private _buildDescription(scene: EventScene): string {
        return scene.description;
    }

    /** 生成 A/B 选项 */
    private _generateOptions(scene: EventScene): { optionA: EventOption; optionB: EventOption } {
        // 尝试匹配特殊条件
        if (scene.specialConditions && this._player) {
            for (const cond of scene.specialConditions) {
                if (this._checkCondition(cond.check)) {
                    return { optionA: cond.optionA, optionB: cond.optionB };
                }
            }
        }

        // 默认通用选项
        return this._getDefaultOptions(scene);
    }

    /** 检测玩家状态条件 */
    private _checkCondition(check: string): boolean {
        if (!this._player) return false;

        const stats = this._player.stats.getFinalStats();
        const hpRatio = stats.maxHP > 0 ? this._player.currentHP / stats.maxHP : 0;

        switch (check) {
            case 'hp_low': return hpRatio < 0.3;
            case 'hp_mid': return hpRatio >= 0.3 && hpRatio <= 0.7;
            case 'hp_high': return hpRatio > 0.7;
            case 'gold_rich': return true; // 实际检测由 isAvailable 处理
            case 'gold_poor': return true;
            case 'has_key': return true; // TODO: 钥匙系统
            case 'no_key': return true;
            case 'many_kills': return true;
            case 'few_kills': return true;
            case 'floor_shallow': return true;
            case 'floor_deep': return true;
            case 'has_fire': return true; // TODO: 元素附魔检测
            case 'has_frost': return true;
            default: return false;
        }
    }

    /** 默认选项（通用选项） */
    private _getDefaultOptions(scene: EventScene): { optionA: EventOption; optionB: EventOption } {
        const defaultOptions: Array<{
            labelA: string; descA: string; consA: EventConsequence[];
            labelB: string; descB: string; consB: EventConsequence[];
        }> = [
            { labelA: '献祭', descA: '消耗 3~5 HP 换 6~10 金币', consA: [{ type: 'damage', value: 4 }, { type: 'gold_gain', value: 8 }], labelB: '祈祷', descB: '消耗 5~8 金币回 5~10 HP', consB: [{ type: 'gold_loss', value: 6 }, { type: 'heal', value: 8 }] },
            { labelA: '调查', descA: '搜索房间，找到 3 金币', consA: [{ type: 'gold_gain', value: 3 }], labelB: '休息', descB: '回复 5 HP', consB: [{ type: 'heal', value: 5 }] },
            { labelA: '冒险', descA: '尝试打开隐藏机关，可能回血或受伤', consA: [{ type: 'heal', value: 8 }], labelB: '谨慎', descB: '绕道而行，无事发生', consB: [{ type: 'nothing', value: 0 }] },
        ];

        const pick = defaultOptions[Math.floor(Math.random() * defaultOptions.length)];
        return {
            optionA: { label: pick.labelA, description: pick.descA, consequences: pick.consA },
            optionB: { label: pick.labelB, description: pick.descB, consequences: pick.consB },
        };
    }

    /** 应用事件后果 */
    applyConsequence(consequence: EventConsequence): void {
        if (!this._player) return;

        switch (consequence.type) {
            case 'heal':
                if (consequence.value >= 999) {
                    // 全满
                    const stats = this._player.stats.getFinalStats();
                    this._player.heal(stats.maxHP);
                } else {
                    this._player.heal(consequence.value);
                }
                break;
            case 'damage':
                this._player.takeDamage(consequence.value, false);
                break;
            case 'gold_gain':
                eventBus.emit('gold:change', consequence.value);
                break;
            case 'gold_loss':
                eventBus.emit('gold:change', -consequence.value);
                break;
            case 'key_gain':
                eventBus.emit('key:change', consequence.value);
                break;
            case 'key_loss':
                eventBus.emit('key:change', -consequence.value);
                break;
            case 'buff':
                // 临时 Buff
                eventBus.emit('buff:apply', { stat: 'atk', value: consequence.value, duration: consequence.duration ?? 1 });
                break;
            case 'debuff':
                eventBus.emit('debuff:apply', { stat: 'monsterAtk', value: consequence.value, duration: consequence.duration ?? 1 });
                break;
            case 'weaken_next':
                eventBus.emit('battle:next_weaken', consequence.value);
                break;
            case 'strengthen_next':
                eventBus.emit('battle:next_strengthen', consequence.value);
                break;
            case 'relic_gain':
                eventBus.emit('relic:random_grant');
                break;
            case 'nothing':
            default:
                // 无事发生
                break;
        }
    }
}

// 需要导入 eventBus
import { eventBus } from '../core/EventBus';
