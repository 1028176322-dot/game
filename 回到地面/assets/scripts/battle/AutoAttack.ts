/**
 * AutoAttack - 自动攻击组件（挂载在玩家节点上）
 * 通过 PlayerStats 获取最终属性（ATK/攻速/暴击/射程）
 * 支持元素附着接口（由 ElementSystem 通过 eventBus 注入）
 */

import { _decorator, Component, Node, Vec3 } from 'cc';
import { ElementType, MODIFIER_SOURCE } from '../core/Constants';
import { GameConfig } from '../core/GameConfig';
import { MathUtils } from '../utils/MathUtils';
import { eventBus } from '../core/EventBus';
import { MonsterController } from './MonsterController';
import { BattleManager } from './BattleManager';
import { PlayerController } from './PlayerController';

const { ccclass, property } = _decorator;

export interface AttackResult {
    target: MonsterController;
    damage: number;
    isCrit: boolean;
    element: ElementType;
    killed: boolean;
}

@ccclass('AutoAttack')
export class AutoAttack extends Component {
    @property
    attackRange: number = GameConfig.PLAYER_BASE_ATTACK_RANGE;
    @property
    attackInterval: number = GameConfig.AUTO_ATTACK_INTERVAL;
    @property
    atk: number = GameConfig.PLAYER_BASE_ATK;
    @property
    critChance: number = GameConfig.CRIT_BASE_CHANCE;

    private _timer: number = 0;
    private _battleManager: BattleManager | null = null;
    private _player: PlayerController | null = null;
    private _isActive: boolean = true;

    /** 当前攻击附着的元素（默认 Physical，由能力/装备/遗物修改） */
    private _attackElement: ElementType = ElementType.Physical;

    /** 预攻击钩子: 返回 { forceCrit: boolean }, 用于穿影等能力 */
    onBeforeAttack: (() => { forceCrit: boolean }) | null = null;
    /** 后攻击钩子: 攻击后调用, 携带攻击结果 */
    onAfterAttack: ((result: AttackResult) => void) | null = null;

    /** 初始化战斗管理器引用 */
    init(battleManager: BattleManager): void {
        this._battleManager = battleManager;
    }

    /** 设置是否启用 */
    setActive(active: boolean): void {
        this._isActive = active;
    }

    /** 设置攻击元素（外部系统调用，如 ElementSystem/AbilityResolver） */
    setAttackElement(element: ElementType): void {
        this._attackElement = element;
    }

    /** 重置攻击元素为物理 */
    resetAttackElement(): void {
        this._attackElement = ElementType.Physical;
    }

    onLoad(): void {
        // 从父节点获取 PlayerController
        this._player = this.getComponent(PlayerController);
    }

    update(dt: number): void {
        if (!this._isActive || !this._battleManager) return;

        if (!this._player) {
            this._player = this.getComponent(PlayerController);
            if (!this._player) return;
        }

        // 使用 PlayerStats 的最终攻速
        const finalStats = this._player.stats.getFinalStats();
        const interval = finalStats.atkSpeed;

        this._timer += dt;
        if (this._timer >= interval) {
            this._timer = 0;
            this._performAutoAttack(finalStats);
        }
    }

    /** 执行自动攻击（使用最终属性） */
    private _performAutoAttack(stats: { atk: number; critChance: number; critMultiplier: number; attackRange: number; damageMultiplier: number; lifeSteal: number }): void {
        if (!this._player || !this._battleManager) return;

        const nearestMonster = this._battleManager.getNearestMonster(this.node.getPosition(), stats.attackRange);

        if (!nearestMonster) {
            eventBus.emit('attack:miss');
            return;
        }

        // 防御性检查：目标是否仍然有效
        const target = nearestMonster.monster;
        if (!target || !target.isValid || !target.node || !target.node.isValid || target.isDead) {
            eventBus.emit('attack:miss');
            return;
        }

        // 精确距离判定（格为单位）
        const dist = MathUtils.euclideanDistance(
            this.node.getPosition().x, this.node.getPosition().y,
            target.node.getPosition().x, target.node.getPosition().y
        );
        const distInTiles = dist / GameConfig.TILE_SIZE;

        if (distInTiles > stats.attackRange) {
            eventBus.emit('attack:miss');
            return;
        }

        // 暴击判定（支持预攻击钩子强制暴击）
        const preAttack = this.onBeforeAttack ? this.onBeforeAttack() : null;
        const isCrit = preAttack?.forceCrit || MathUtils.chance(stats.critChance);
        const rawDamage = isCrit
            ? Math.floor(stats.atk * stats.critMultiplier)
            : stats.atk;

        // 应用伤害倍率
        const finalDamage = Math.max(GameConfig.MIN_DAMAGE, Math.floor(rawDamage * stats.damageMultiplier));

        // 施加伤害
        const killed = target.takeDamage(finalDamage, isCrit);

        // 生命偷取
        if (stats.lifeSteal > 0 && finalDamage > 0) {
            const healAmount = Math.max(GameConfig.MIN_DAMAGE, Math.floor(finalDamage * stats.lifeSteal));
            this._player.heal(healAmount);
        }

        // 触发攻击事件（携带元素信息）
        const attackResult: AttackResult = {
            target: target,
            damage: finalDamage,
            isCrit,
            element: this._attackElement,
            killed,
        };
        eventBus.emit('attack:performed', attackResult);
        this.onAfterAttack?.(attackResult);

        // 目标死亡处理
        if (killed) {
            this._battleManager.removeMonster(target);
        }
    }
}
