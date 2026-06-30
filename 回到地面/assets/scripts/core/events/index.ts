/**
 * events/index - 事件总线实例导出
 *
 * 提供两个独立的事件总线实例:
 * - runEvents: 游戏运行事件（战斗/房间/玩家/怪物）
 * - uiEvents: UI 事件（HUD/弹窗/转场）
 *
 * 分离原因:
 * 战斗暂停不应影响 UI 事件分发
 */

import { GameEventMap } from './GameEvents';
import { TypedEventBus } from './TypedEventBus';

/** 游戏运行事件总线（战斗/地图/系统逻辑） */
export const runEvents = new TypedEventBus<GameEventMap>();

/** UI 事件总线（HUD/弹窗/转场/商店） */
export const uiEvents = new TypedEventBus<GameEventMap>();
