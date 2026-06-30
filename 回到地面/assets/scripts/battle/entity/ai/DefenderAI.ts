/**
 * DefenderAI - 防御型 AI
 *
 * 行为:
 * - 距离 ≤1: 攻击
 * - 距离 2~3: 防御姿态 → 追击
 * - 距离 4~5: 追击
 * - 距离 >5: 待机
 */

import { MonsterAI, MonsterAIContext } from './MonsterAI';

export class DefenderAI implements MonsterAI {
    update(ctx: MonsterAIContext): void {
        if (ctx.dist <= 1) {
            ctx.agent.setState('attack');
        } else if (ctx.dist <= 3) {
            ctx.agent.setState('defend');
            ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
        } else if (ctx.dist <= 5) {
            ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('chase');
        } else {
            ctx.agent.setState('idle');
        }
    }
}
