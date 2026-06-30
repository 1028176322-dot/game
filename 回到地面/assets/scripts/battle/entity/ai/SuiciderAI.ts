/**
 * SuiciderAI - 自爆型 AI
 *
 * 行为:
 * - 进入范围后自爆（2 格，2 倍攻击）
 * - 首次行动加速
 */

import { MonsterAI, MonsterAIContext } from './MonsterAI';

export class SuiciderAI implements MonsterAI {
    private _suicideRange = 2;
    private _hasSpedUp = false;

    update(ctx: MonsterAIContext): void {
        if (ctx.dist <= this._suicideRange) {
            ctx.agent.suicideExplode();
            return;
        }

        if (!this._hasSpedUp) {
            this._hasSpedUp = true;
            ctx.agent.boostSpeed(1.5);
        }

        ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
        ctx.agent.setState('chase');
    }

    reset(): void {
        this._hasSpedUp = false;
    }
}
