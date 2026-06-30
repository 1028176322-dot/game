/**
 * SummonerAI - 召唤型 AI
 *
 * 行为:
 * - 保持 3~5 格距离
 * - 每 5 秒召唤一个小怪
 * - 最多召唤 3 只
 */

import { MonsterAI, MonsterAIContext } from './MonsterAI';

export class SummonerAI implements MonsterAI {
    private _timer = 0;
    private _interval = 5.0;
    private _summonCount = 0;
    private _maxSummons = 3;

    update(ctx: MonsterAIContext): void {
        if (ctx.dist <= 2) {
            ctx.agent.retreatFromTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('retreat');
        } else if (ctx.dist > 5) {
            ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('chase');
        } else {
            ctx.agent.setState('attack');
        }

        this._timer += ctx.dt;
        if (this._timer >= this._interval && this._summonCount < this._maxSummons) {
            ctx.agent.summonMinion();
            this._timer = 0;
            this._summonCount++;
        }
    }

    reset(): void {
        this._timer = 0;
        this._summonCount = 0;
    }
}
