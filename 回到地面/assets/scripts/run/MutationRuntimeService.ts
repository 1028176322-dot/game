/**
 * MutationRuntimeService - 变异运行时管理
 *
 * 职责:
 * 1. 生成房间变异时应用到玩家属性
 * 2. 清除变异时移除玩家属性修正
 * 3. 处理变异持续效果（奥术风暴/倒计时）
 *
 * Phase 4: 从 DungeonSceneController 拆分
 */

import { eventBus } from '../core/EventBus';
import { MutationManager } from '../battle/MutationManager';
import { IPlayerAgent } from '../battle/IPlayerAgent';
import { BattleHUD } from '../ui/BattleHUD';

export class MutationRuntimeService {
    constructor(
        private readonly _mutationManager: MutationManager | null,
        private readonly _player: IPlayerAgent | null,
        private readonly _battleHUD: BattleHUD | null,
    ) {}

    /** 生成层变异 */
    generateMutation(floorNumber: number): void {
        if (!this._mutationManager || !this._player) return;

        // 清除旧变异
        this._player.stats.removeModifiersByPrefix('mutation:');
        this._mutationManager.clearMutations();

        const mutations = this._mutationManager.generateMutation(floorNumber);
        if (mutations.length > 0) {
            console.log(`[变异] 第 ${floorNumber} 层: ${mutations.map(m => m.name).join(', ')}`);
            this._applyMutationEffects(mutations);
        }
    }

    /** 清除变异 */
    clearMutation(): void {
        if (this._player) {
            this._player.stats.removeModifiersByPrefix('mutation:');
        }
    }

    /** 奥术风暴变异伤害 */
    onElementStorm(): void {
        if (this._player) {
            this._player.takeDamage(3, false);
        }
    }

    /** 每帧更新变异管理器 */
    update(dt: number): void {
        if (this._mutationManager) {
            this._mutationManager.update(dt);
        }
    }

    private _applyMutationEffects(mutations: any[]): void {
        if (!this._player) return;
        const stats = this._player.stats;

        for (const mut of mutations) {
            const eff = mut.effect;
            const src = `mutation:${mut.id}`;

            if (eff.playerAtkMod !== undefined) {
                stats.applyModifier({ source: `${src}:atk`, stat: 'atk', value: eff.playerAtkMod, type: 'flat', duration: 0 });
            }
            if (eff.playerDefMod !== undefined) {
                stats.applyModifier({ source: `${src}:def`, stat: 'def', value: eff.playerDefMod, type: 'flat', duration: 0 });
            }
            if (eff.playerSpeedMod !== undefined) {
                stats.applyModifier({ source: `${src}:speed`, stat: 'moveSpeed', value: eff.playerSpeedMod - 1, type: 'percent', duration: 0 });
            }
            if (eff.playerAttackSpeed !== undefined) {
                stats.applyModifier({ source: `${src}:atkSpeed`, stat: 'atkSpeed', value: eff.playerAttackSpeed - 1, type: 'percent', duration: 0 });
            }
            if (eff.playerHealEffect !== undefined) {
                stats.applyModifier({ source: `${src}:heal`, stat: 'lifeSteal', value: eff.playerHealEffect - 1, type: 'percent', duration: 0 });
            }
            if (eff.playerLifesteal !== undefined) {
                stats.applyModifier({ source: `${src}:lifesteal`, stat: 'lifeSteal', value: eff.playerLifesteal - 1, type: 'percent', duration: 0 });
            }
            if (eff.skillCdMod !== undefined) {
                stats.applyModifier({ source: `${src}:cd`, stat: 'atkSpeed', value: 1 / eff.skillCdMod - 1, type: 'percent', duration: 0 });
            }
            if (eff.goldDropMod !== undefined) {
                stats.applyModifier({ source: `${src}:gold`, stat: 'damageMultiplier', value: eff.goldDropMod - 1, type: 'percent', duration: 0 });
            }
        }

        if (this._battleHUD && this._player) {
            const final = this._player.stats.getFinalStats();
            this._battleHUD.refreshHP(this._player.currentHP, final.maxHP);
        }
    }
}
