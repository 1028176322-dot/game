/**
 * StatusController - 怪物状态效果控制器
 *
 * 管辖:
 * - 冻结（停止行动）
 * - 沉默（无法攻击/施法）
 * - 防御减弱 / 受伤加重 debuff
 *
 * Phase 7: 从 MonsterController 提取
 */

import { GameConfig } from '../../core/GameConfig';

export class StatusController {
    freezeTimer = 0;
    silenceTimer = 0;
    defMultiplier = 1;
    damageTakenMultiplier = 1;
    private _debuffTimer = 0;

    get isFrozen(): boolean { return this.freezeTimer > 0; }
    get isSilenced(): boolean { return this.silenceTimer > 0; }

    freeze(duration: number): void {
        this.freezeTimer = Math.max(this.freezeTimer, duration);
    }

    silence(duration: number): void {
        this.silenceTimer = Math.max(this.silenceTimer, duration);
    }

    applyDefDebuff(multiplier: number, duration: number, isDamageTaken: boolean = false): void {
        if (isDamageTaken) {
            this.damageTakenMultiplier = Math.max(GameConfig.MIN_DAMAGE, multiplier);
        } else {
            this.defMultiplier = Math.min(1, Math.max(0.1, multiplier));
        }
        this._debuffTimer = Math.max(this._debuffTimer, duration);
    }

    update(dt: number): void {
        if (this.freezeTimer > 0) this.freezeTimer = Math.max(0, this.freezeTimer - dt);
        if (this.silenceTimer > 0) this.silenceTimer = Math.max(0, this.silenceTimer - dt);
        if (this._debuffTimer > 0) {
            this._debuffTimer = Math.max(0, this._debuffTimer - dt);
            if (this._debuffTimer <= 0) {
                this.defMultiplier = 1;
                this.damageTakenMultiplier = 1;
            }
        }
    }

    reset(): void {
        this.freezeTimer = 0;
        this.silenceTimer = 0;
        this.defMultiplier = 1;
        this.damageTakenMultiplier = 1;
        this._debuffTimer = 0;
    }
}
