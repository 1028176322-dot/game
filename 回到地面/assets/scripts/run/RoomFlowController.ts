/**
 * RoomFlowController - 房间生命周期控制
 *
 * 职责:
 * 1. 战斗胜利 → 发放奖励 + 区域推进
 * 2. 区域 Boss 击败 → 进入下一区域
 * 3. 所有区域通关 → 游戏胜利
 * 4. 特殊房间处理（商店/宝箱/回血）
 *
 * Phase 4: 从 DungeonSceneController 拆分
 */

import { RoomType } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { GameManager, GameEvent } from '../core/GameManager';
import { DungeonManager } from '../dungeon/DungeonManager';
import { IPlayerAgent } from '../battle/IPlayerAgent';
import { RewardService, ClearedRoomType } from './RewardService';
import { WXAdapter } from '../utils/WXAdapter';
import { BattleClock } from '../core/time/BattleClock';
import type { RouteEncounterContext } from '../core/save/RouteSaveTypes';

export class RoomFlowController {
    private _routeCtx: RouteEncounterContext | null = null;
    private _encounterKills = 0;

    constructor(
        private readonly _dungeonManager: DungeonManager,
        private readonly _rewardService: RewardService,
        private readonly _player: IPlayerAgent | null,
    ) {}

    /**
     * v0.4.4 (Demo7): inject the route combat context before entering a route
     * encounter; pass null to leave the route context. The route branch of
     * onBattleVictory reads only from this context (no ad-hoc fields).
     */
    setRouteEncounterContext(ctx: RouteEncounterContext | null): void {
        this._routeCtx = ctx;
        this._encounterKills = 0;
    }

    /** v0.4.4 (Demo7) P3: true when a route encounter context is injected (route mode
     *  active). Lets DungeonSceneController route battle victory to onBattleVictory('route')
     *  without changing legacy behavior when no route context is set. */
    get hasRouteContext(): boolean {
        return this._routeCtx !== null;
    }

    /** v0.4.4 (Demo7): kill counter for the active route encounter (called by combat). */
    onMonsterKilled(): void {
        this._encounterKills++;
    }

    /**
     * 战斗胜利处理。
     * @param mode 'legacy' = old multi-room flow (grants reward directly);
     *             'route'  = node-route flow (emits route:encounter_complete only,
     *                        no reward here — prevents double-award with NodeRewardResolver)
     */
    onBattleVictory(mode: 'legacy' | 'route' = 'legacy'): void {
        if (mode === 'route') {
            const ctx = this._routeCtx;
            if (!ctx) {
                console.warn('[RoomFlowController] route victory without RouteEncounterContext');
                return;
            }
            eventBus.emit('route:encounter_complete', {
                nodeId: ctx.nodeId,
                nodeType: ctx.nodeType,
                result: 'victory',
                elapsed: Date.now() - ctx.startedAt,
                kills: this._encounterKills,
            });
            return;
        }

        const room = this._dungeonManager.currentRoom;
        if (!room) return;

        const roomType: ClearedRoomType = room.type === RoomType.Boss ? 'boss'
            : room.type === RoomType.Elite ? 'elite'
            : 'normal';

        // 上报战斗胜利
        WXAdapter.getInstance().reportAnalytics('room_clear', {
            sec: 0, hp: 0, reactions: 0,
        });

        // 发放奖励
        this._rewardService.grantRoomClearRewards(roomType);

        // Boss 房特殊处理
        if (room.type === RoomType.Boss) {
            this._handleBossVictory();
        }
    }

    /** Boss 房的胜利处理 */
    private _handleBossVictory(): void {
        const gm = GameManager.instance;
        const floorState = this._dungeonManager.floorState;

        if (floorState?.isMiniBossFloor) {
            // 迷你Boss → 下个小关
            console.log('[区域] 迷你Boss击败，进入下个小关');
            if (gm.advanceStage()) {
                this._dungeonManager.resetForZone(gm.currentZone, gm.currentStageId);
            } else {
                this._dungeonManager.enterNextFloor();
            }
        } else if (gm.isLastStageInZone) {
            // 终结Boss → 区域通关
            eventBus.emit(GameEvent.ZONE_BOSS_DEFEATED, gm.currentZone);
        }
    }

    /** 区域终结 Boss 击败 */
    onZoneBossDefeated(zoneId: string): void {
        const gm = GameManager.instance;
        console.log(`[区域] ${zoneId} 终结Boss击败!`);
        eventBus.emit('hud:zone_cleared', zoneId, gm.currentZoneDef?.name ?? '');

        if (gm.advanceToNextZone()) {
            this._dungeonManager.resetForZone(gm.currentZone, gm.currentStageId);
        }
    }

    /** 所有区域通关 */
    onAllZonesCleared(): void {
        console.log('[游戏] 恭喜通关!');
        eventBus.emit('game:victory');
    }

    /** 玩家复活 */
    onPlayerRevive(): void {
        if (this._player) {
            this._player.heal(50);
        }
        BattleClock.instance.paused = false;
    }

    /** 商店房间 */
    onEnterShopRoom(roomId: number): void {
        eventBus.emit('ui:show_shop', {
            sellItems: ['key', 'advancedKey', 'rerollScroll', 'elementScroll'],
        });
    }

    /** 宝箱房间 */
    onEnterTreasureRoom(roomId: number): void {
        console.log(`[宝箱房] 房间 ${roomId}`);
    }

    /** 回血房间 */
    onEnterHealingRoom(roomId: number): void {
        if (this._player) {
            const stats = this._player.stats.getFinalStats();
            const healAmount = Math.floor(stats.maxHP * 0.2);
            this._player.heal(healAmount);
            eventBus.emit('hud:healing', healAmount);
        }
    }
}
