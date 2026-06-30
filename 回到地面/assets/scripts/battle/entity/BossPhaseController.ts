/**
 * BossPhaseController - Boss 阶段控制器
 *
 * 管辖:
 * - HP 阈值检测
 * - 阶段变更（速度/攻速/攻击递增）
 * - 阶段变更事件通知
 *
 * Phase 7: 从 MonsterController 提取
 */

import { CombatEntity } from './CombatEntity';

export interface BossPhaseConfig {
    isBoss: boolean;
    phases: number;
    phaseTriggers: number[];  // HP 百分比阈值（如 [0.6, 0.3] = 60%/30% 血进入阶段 2/3）
}

export interface BossPhaseSnapshot {
    currentPhase: number;
    maxPhases: number;
    onPhaseChanged?: (newPhase: number, maxPhase: number) => void;
}

export class BossPhaseController {
    private _isBoss: boolean;
    private _phases: number;
    private _currentPhase = 1;
    private _phaseTriggers: number[];

    constructor(
        config: BossPhaseConfig,
        private readonly _entity: CombatEntity,
        private readonly _onChanged?: (newPhase: number, maxPhase: number) => void,
    ) {
        this._isBoss = config.isBoss;
        this._phases = config.phases;
        this._phaseTriggers = [...config.phaseTriggers];
    }

    get isBoss(): boolean { return this._isBoss; }
    get currentPhase(): number { return this._currentPhase; }
    get maxPhases(): number { return this._phases; }

    /** 每帧检查阶段（精英/Boss 战斗循环中调用） */
    checkPhase(): void {
        if (!this._isBoss || this._phases <= 1) return;

        const hpPct = this._entity.hpPercent;
        let newPhase = 1;
        for (let i = 0; i < this._phaseTriggers.length; i++) {
            if (hpPct <= this._phaseTriggers[i]) {
                newPhase = i + 2;
            }
        }

        if (newPhase > this._currentPhase) {
            this._currentPhase = newPhase;
            this._applyPhaseEffects();
            this._onChanged?.(this._currentPhase, this._phases);
        }
    }

    /** 获取阶段倍率乘数 */
    getPhaseSpeedMultiplier(): number {
        switch (this._currentPhase) {
            case 2: return 1.2;
            case 3: return 1.3;
            case 4: return 1.5;
            default: return 1.0;
        }
    }

    getPhaseAtkMultiplier(): number {
        switch (this._currentPhase) {
            case 3: return 1.2;
            case 4: return 1.3;
            default: return 1.0;
        }
    }

    getPhaseAtkSpeedMultiplier(): number {
        switch (this._currentPhase) {
            case 2: return 0.8;
            case 3: return 0.7;
            case 4: return 0.5;
            default: return 1.0;
        }
    }

    private _applyPhaseEffects(): void {
        this._entity.speed = Math.floor(this._entity.speed * this.getPhaseSpeedMultiplier());
        this._entity.atk = Math.floor(this._entity.atk * this.getPhaseAtkMultiplier());
    }

    /** 初始化配置 */
    reset(isBoss: boolean, phases: number, phaseTriggers: number[]): void {
        this._isBoss = isBoss;
        this._phases = phases;
        this._phaseTriggers = [...phaseTriggers];
        this._currentPhase = 1;
    }
}
