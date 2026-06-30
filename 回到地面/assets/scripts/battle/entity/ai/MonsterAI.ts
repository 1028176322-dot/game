/**
 * MonsterAI - 怪物 AI 行为接口
 *
 * Phase 7: 新增一种怪物 AI 类型时，只需实现此接口
 * 无需修改 MonsterController 或 MonsterAgent
 */

import { MonsterAgent } from '../MonsterAgent';

export interface MonsterAIContext {
    agent: MonsterAgent;
    playerGridX: number;
    playerGridY: number;
    dist: number;
    dt: number;
}

export interface MonsterAI {
    /** 每帧更新行为 */
    update(ctx: MonsterAIContext): void;
}
