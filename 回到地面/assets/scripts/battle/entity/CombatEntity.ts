/**
 * CombatEntity - 战斗实体基类
 *
 * 职责:
 * 1. 基本属性（HP/ATK/DEF/SPD）
 * 2. HP 管理（最大HP、当前HP、百分比）
 * 3. 状态管理（存活/死亡）
 */

export class CombatEntity {
    hp: number;
    maxHP: number;
    atk: number;
    def: number;
    speed: number;

    private _isDead = false;

    constructor(hp: number, atk: number, def: number, speed: number) {
        this.hp = hp;
        this.maxHP = hp;
        this.atk = atk;
        this.def = def;
        this.speed = speed;
    }

    get isDead(): boolean { return this._isDead; }
    get hpPercent(): number { return this.maxHP > 0 ? this.hp / this.maxHP : 0; }

    /** 标记死亡 */
    markDead(): void { this._isDead = true; }

    /** 重置状态 */
    reset(hp: number, atk: number, def: number, speed: number): void {
        this.hp = hp;
        this.maxHP = hp;
        this.atk = atk;
        this.def = def;
        this.speed = speed;
        this._isDead = false;
    }
}
