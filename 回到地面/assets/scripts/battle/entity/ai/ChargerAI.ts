/**
 * ChargerAI - 冲锋型 AI
 *
 * 行为:
 * - 距离 ≤1: 攻击
 * - 距离 2~4: 追击
 * - 距离 >4: 待机
 */

import { MonsterAI, MonsterAIContext } from './MonsterAI';

export class ChargerAI implements MonsterAI {
    update(ctx: MonsterAIContext): void {
        if (ctx.dist <= 1) {
            ctx.agent.setState('attack');
        } else if (ctx.dist <= 4) {
            ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('chase');
        } else {
            ctx.agent.setState('idle');
        }
    }
}
