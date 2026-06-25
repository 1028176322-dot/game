/**
 * AutoAttack - 自动攻击组件
 * 挂载在玩家节点上，每隔 1.0 秒自动攻击最近敌人
 * 距离衰减超出 Range 显示 MISS
 */

import { _decorator, Component, Node } from 'cc';
import { BATTLE_CONSTANTS } from '../core/Constants';
import { MathUtils } from '../utils/MathUtils';
import { eventBus } from '../core/EventBus';
import { MonsterController } from './MonsterController';
import { BattleManager } from './BattleManager';

const { ccclass, property } = _decorator;

@ccclass('AutoAttack')
export class AutoAttack extends Component {
    @property
    attackRange: number = 2.0;   // 攻击范围（格）
    @property
    attackInterval: number = BATTLE_CONSTANTS.AUTO_ATTACK_INTERVAL;
    @property
    atk: number = 10;
    @property
    critChance: number = BATTLE_CONSTANTS.CRIT_BASE_CHANCE;

    private _timer: number = 0;
    private _battleManager: BattleManager | null = null;
    private _isActive: boolean = true;

    /** 初始化战斗管理器引用 */
    init(battleManager: BattleManager): void {
        this._battleManager = battleManager;
    }

    /** 设置是否启用手动暂停 */
    setActive(active: boolean): void {
        this._isActive = active;
    }

    update(dt: number): void {
        if (!this._isActive || !this._battleManager) return;

        this._timer += dt;
        if (this._timer >= this.attackInterval) {
            this._timer = 0;
            this._performAutoAttack();
        }
    }

    /** 执行自动攻击 */
    private _performAutoAttack(): void {
        const nearestMonster = this._battleManager?.getNearestMonster(this.node.getPosition(), this.attackRange);

        if (!nearestMonster) {
            // 范围内无目标 → MISS
            eventBus.emit('attack:miss');
            return;
        }

        // 计算距离
        const dist = MathUtils.euclideanDistance(
            this.node.getPosition().x, this.node.getPosition().y,
            nearestMonster.monster.node.getPosition().x, nearestMonster.monster.node.getPosition().y
        );

        const distInTiles = dist / BATTLE_CONSTANTS.TILE_SIZE;

        if (distInTiles > this.attackRange) {
            // 超出射程 → MISS
            eventBus.emit('attack:miss');
            return;
        }

        // 伤害计算：ATK + d6 - DEF × 0.5
        const isCrit = MathUtils.chance(this.critChance);
        const rawDamage = isCrit
            ? Math.floor(this.atk * BATTLE_CONSTANTS.CRIT_MULTIPLIER)
            : this.atk;

        const killed = nearestMonster.monster.takeDamage(rawDamage, isCrit);

        // 触发攻击事件
        eventBus.emit('attack:performed', nearestMonster.monster.node.getPosition(), rawDamage, isCrit);

        // 目标死亡 → 自动转火（下次 update 自动切换，通过 SwitchTargetDelay 已内联）
        if (killed) {
            this._battleManager?.removeMonster(nearestMonster.monster);
            // 立即触发下一轮检测（0.2 秒延迟由 BATTLE_CONSTANTS.SWITCH_TARGET_DELAY 控制）
        }
    }
}
