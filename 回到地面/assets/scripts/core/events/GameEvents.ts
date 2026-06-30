/**
 * GameEvents - 游戏事件类型定义
 *
 * 所有事件通过 TypedEventBus 分发，确保参数类型安全
 * 命名规范: 作用域:事件名 (battle:started, player:damaged)
 *
 * 【迁移规则】
 * 1. 新增业务事件必须先在此处定义类型
 * 2. 禁止使用裸字符串事件名
 * 3. 旧 eventBus 保留兼容，新代码走 runEvents / uiEvents
 */

import { RoomNode } from '../../dungeon/DAGGenerator';

// ======== 战斗事件 ========

export interface BattleStartedPayload {
    total: number;
    roomId?: number;
}

export interface BattleVictoryPayload {
    roomId: number;
    roomType: string;
    isBoss: boolean;
}

export interface BattleDefeatPayload {
    roomId?: number;
}

// ======== 房间事件 ========

export interface RoomEnteredPayload {
    room: RoomNode;
    floor: number;
}

// ======== 玩家事件 ========

export interface PlayerDamagedPayload {
    amount: number;
    isCrit: boolean;
    source?: string;
}

export interface PlayerHealedPayload {
    amount: number;
    source?: string;
}

export interface PlayerRevivePayload {
    reviveType: 'ad' | 'skill' | 'item';
}

// ======== 怪物事件 ========

export interface MonsterDeathPayload {
    gridX: number;
    gridY: number;
    exp: number;
    monsterId?: string;
}

// ======== UI 事件 ========

export interface HudHealingPayload {
    amount: number;
}

export interface HudZoneIntroPayload {
    zoneName: string;
    theme: string;
}

export interface HudBossPhasePayload {
    phase: number;
    maxPhase: number;
}

// ======== 游戏事件映射表 ========

/**
 * GameEventMap - 完整事件类型映射
 *
 * 规则:
 * - 事件名使用 kebab-case，作用域前缀:命名
 * - 所有事件 payload 为对象，禁止裸参数
 * - 参数可选时使用 ? 标记
 */
export interface GameEventMap {
    // ---- 战斗 ----
    'battle:started': BattleStartedPayload;
    'battle:victory': BattleVictoryPayload;
    'battle:defeat': BattleDefeatPayload;
    'battle:time_scale': { scale: number; duration: number };

    // ---- 房间 ----
    'room:entered': RoomEnteredPayload;
    'room:shop': { roomId: number };
    'room:treasure': { roomId: number };
    'room:healing': { roomId: number };
    'room:upgrade': { roomId: number };
    'room:event': { roomId: number };

    // ---- 玩家 ----
    'player:damaged': PlayerDamagedPayload;
    'player:healed': PlayerHealedPayload;
    'player:revive': PlayerRevivePayload;
    'player:dodged': {};

    // ---- 怪物 ----
    'monster:death': MonsterDeathPayload;

    // ---- UI ----
    'hud:healing': HudHealingPayload;
    'hud:zone_intro': HudZoneIntroPayload;
    'hud:boss_phase': HudBossPhasePayload;
}
