/**
 * DamageReceiver - 伤害接收与计算
 *
 * 职责:
 * 1. 伤害公式计算（原始伤害 + D6 - 有效防御 × 系数）
 * 2. 防御倍率和受伤倍率修正
 * 3. 闪白反馈
 *
 * Phase 7: 从 MonsterController 提取
 */

import { GameConfig } from '../../core/GameConfig';
import { CombatEntity } from './CombatEntity';
import { StatusController } from './StatusController';
import { MathUtils } from '../../utils/MathUtils';

export class DamageReceiver {
    constructor(
        private readonly _entity: CombatEntity,
        private readonly _status: StatusController,
        private readonly _getShieldMultiplier: () => number,
        private readonly _onDamageTaken?: (actualDamage: number, isCrit: boolean) => void,
    ) {}

    /** 承受伤害。返回 true 表示死亡 */
    takeDamage(rawDamage: number, isCrit: boolean = false): boolean {
        const shieldMult = this._getShieldMultiplier();
        const effectiveDef = Math.floor(this._entity.def * this._status.defMultiplier);
        const d6Roll = MathUtils.d6();

        const actualDamage = Math.max(GameConfig.MIN_DAMAGE, Math.floor(
            (rawDamage + d6Roll - effectiveDef * GameConfig.DAMAGE_FORMULA_DEF_FACTOR)
            * shieldMult * this._status.damageTakenMultiplier
        ));

        this._entity.hp = Math.max(0, this._entity.hp - actualDamage);
        this._onDamageTaken?.(actualDamage, isCrit);

        if (this._entity.hp <= 0) return true;
        return false;
    }
}
