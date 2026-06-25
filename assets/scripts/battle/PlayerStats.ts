/**
 * PlayerStats - 运行时属性叠加层
 * 统一管理玩家最终属性的计算
 * 
 * 属性来源:
 *   base → 角色基础属性(PlayerController @property)
 *   buff → Build/升级增益
 *   relic → 遗物效果
 *   equip → 装备加成
 * 
 * 计算顺序: final = (base + flatModifiers) × (1 + percentModifiers)
 */

import { BATTLE_CONSTANTS } from '../core/Constants';

// ======== 运行时属性接口 ========

export interface RuntimeStats {
    /** 攻击力 */
    atk: number;
    /** 防御力 */
    def: number;
    /** 最大HP */
    maxHP: number;
    /** 移动速度 (px/s) */
    moveSpeed: number;
    /** 攻击间隔 (秒, 越小越快) */
    atkSpeed: number;
    /** 攻击范围 (格) */
    attackRange: number;
    /** 暴击率 (0-1) */
    critChance: number;
    /** 暴击倍率 */
    critMultiplier: number;
    /** 生命偷取 (0-1) */
    lifeSteal: number;
    /** 伤害倍率 */
    damageMultiplier: number;
    /** 减伤 (0-1) */
    damageReduction: number;
}

// ======== 修饰符类型 ========

export type StatKey = keyof RuntimeStats;

export type ModifierType = 'flat' | 'percent';

export interface StatModifier {
    /** 来源标识, 用于移除 (如 'ability:bleed', 'relic:fireAura') */
    source: string;
    /** 目标属性 */
    stat: StatKey;
    /** 数值 (flat 直接加, percent 乘 (1+sum) 于 (base+flat) 之后) */
    value: number;
    /** 类型 */
    type: ModifierType;
    /** 持续时间 (0 = 永久, >0 = 倒计时秒数) */
    duration: number;
    /** 剩余时间 (内部使用) */
    remaining: number;
}

// ======== 默认值 ========

export function createDefaultStats(): RuntimeStats {
    return {
        atk: 0,
        def: 0,
        maxHP: 0,
        moveSpeed: 0,
        atkSpeed: 0,
        attackRange: 0,
        critChance: 0,
        critMultiplier: 0,
        lifeSteal: 0,
        damageMultiplier: 0,
        damageReduction: 0,
    };
}

// ======== 属性叠加器 ========

export class PlayerStats {
    private _base: RuntimeStats;
    private _modifiers: StatModifier[] = [];

    constructor(base: RuntimeStats) {
        this._base = { ...base };
    }

    /** 设置基础属性 */
    setBase(stats: Partial<RuntimeStats>): void {
        Object.assign(this._base, stats);
    }

    /** 获取基础属性（外部只读） */
    get base(): Readonly<RuntimeStats> {
        return this._base;
    }

    /** 添加修饰符 */
    applyModifier(mod: Omit<StatModifier, 'remaining'>): string {
        const fullMod: StatModifier = {
            ...mod,
            remaining: mod.duration,
        };
        // 同一 source 不重复叠加（替换旧值）
        const existingIdx = this._modifiers.findIndex(m => m.source === mod.source);
        if (existingIdx >= 0) {
            this._modifiers[existingIdx] = fullMod;
        } else {
            this._modifiers.push(fullMod);
        }
        return mod.source;
    }

    /** 按来源移除修饰符 */
    removeModifier(source: string): void {
        this._modifiers = this._modifiers.filter(m => m.source !== source);
    }

    /** 移除一组来源的修饰符（如某个装备的所有词缀） */
    removeModifiersByPrefix(prefix: string): void {
        this._modifiers = this._modifiers.filter(m => !m.source.startsWith(prefix));
    }

    /** 清除所有修饰符（死亡/重开时） */
    clearAll(): void {
        this._modifiers = [];
    }

    /** 清除指定类型的修饰符 */
    clearByType(type: 'buff' | 'relic' | 'equip'): void {
        this._modifiers = this._modifiers.filter(m => !m.source.startsWith(type));
    }

    /** 计算最终属性 */
    getFinalStats(): RuntimeStats {
        const final = { ...this._base };

        // 第1遍: 所有 flat 修饰符
        for (const mod of this._modifiers) {
            if (mod.type === 'flat') {
                (final as any)[mod.stat] += mod.value;
            }
        }

        // 第2遍: 所有 percent 修饰符 (乘算于 base+flat 之后)
        const percentGroups: Partial<Record<StatKey, number>> = {};
        for (const mod of this._modifiers) {
            if (mod.type === 'percent') {
                percentGroups[mod.stat] = (percentGroups[mod.stat] || 0) + mod.value;
            }
        }
        for (const [stat, totalPercent] of Object.entries(percentGroups)) {
            (final as any)[stat] *= (1 + totalPercent);
        }

        // 确保最小值和边界
        final.atk = Math.max(0, final.atk);
        final.def = Math.max(0, final.def);
        final.maxHP = Math.max(1, final.maxHP);
        final.moveSpeed = Math.max(50, final.moveSpeed);
        final.atkSpeed = Math.max(0.2, final.atkSpeed); // 最快 0.2 秒一次
        final.attackRange = Math.max(0.5, final.attackRange);
        final.critChance = MathUtils.clamp(final.critChance, 0, 1);
        final.critMultiplier = Math.max(1, final.critMultiplier);
        final.lifeSteal = MathUtils.clamp(final.lifeSteal, 0, 1);
        final.damageMultiplier = Math.max(0.1, final.damageMultiplier);
        final.damageReduction = MathUtils.clamp(final.damageReduction, 0, 0.9); // 最高 90% 减伤

        return final;
    }

    /** 获取单个最终属性 */
    getFinalStat(stat: StatKey): number {
        return this.getFinalStats()[stat];
    }

    /** 获取当前所有修饰符 */
    get modifiers(): ReadonlyArray<StatModifier> {
        return this._modifiers;
    }

    /** 更新计时类修饰符 (每帧调用) */
    update(dt: number): void {
        let changed = false;
        for (const mod of this._modifiers) {
            if (mod.duration > 0) {
                mod.remaining -= dt;
                if (mod.remaining <= 0) {
                    mod.remaining = 0;
                    changed = true;
                }
            }
        }
        // 移除已过期的
        if (changed) {
            this._modifiers = this._modifiers.filter(m => m.duration <= 0 || m.remaining > 0);
        }
    }

    /** 创建指定基础值的 PlayerStats */
    static createFromBase(base: Partial<RuntimeStats>): PlayerStats {
        const defaults = createDefaultStats();
        const merged: RuntimeStats = { ...defaults, ...base };
        return new PlayerStats(merged);
    }

    /** 初始默认属性 (匹配 PlayerController 原始默认值) */
    static createDefault(): PlayerStats {
        return PlayerStats.createFromBase({
            atk: 10,
            def: 3,
            maxHP: 100,
            moveSpeed: 200,
            atkSpeed: BATTLE_CONSTANTS.AUTO_ATTACK_INTERVAL,
            attackRange: 2,
            critChance: BATTLE_CONSTANTS.CRIT_BASE_CHANCE,
            critMultiplier: BATTLE_CONSTANTS.CRIT_MULTIPLIER,
        });
    }
}

// 避免循环引用: MathUtils 在 getFinalStats 中使用, 使用内联实现
const MathUtils = {
    clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
};
