/**
 * RangedAI - 远程型 AI
 *
 * 行为:
 * - 距离 ≤1: 后退
 * - 距离 2~4: 攻击
 * - 距离 5~6: 追击
 * - 距离 >6: 待机
 */

import { MonsterAI, MonsterAIContext } from './MonsterAI';

export class RangedAI implements MonsterAI {
    update(ctx: MonsterAIContext): void {
        if (ctx.dist <= 1) {
            ctx.agent.retreatFromTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('retreat');
        } else if (ctx.dist <= 4) {
            ctx.agent.setState('attack');
        } else if (ctx.dist <= 6) {
            ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('chase');
        } else {
            ctx.agent.setState('idle');
        }
    }
}
