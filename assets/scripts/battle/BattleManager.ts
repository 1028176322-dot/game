/**
 * BattleManager - 战斗管理器
 * 管理战斗生命周期：怪物生成 → 战斗进行 → 胜利/失败
 * 单一写入口管理战斗状态
 */

import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { BattlePhase } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { MathUtils } from '../utils/MathUtils';
import { PlayerController } from './PlayerController';
import { MonsterController, MonsterConfig } from './MonsterController';
import { AutoAttack } from './AutoAttack';
import { GridManager } from '../dungeon/GridManager';

const { ccclass, property } = _decorator;

export interface MonsterEntry {
    monster: MonsterController;
    config: MonsterConfig;
}

@ccclass('BattleManager')
export class BattleManager extends Component {
    @property(Prefab)
    monsterPrefab: Prefab | null = null;  // 怪物 Prefab（编辑器拖入，缺失时应有兜底）

    private _phase: BattlePhase = BattlePhase.Init;
    private _player: PlayerController | null = null;
    private _autoAttack: AutoAttack | null = null;
    private _gridManager: GridManager | null = null;
    private _monsters: MonsterEntry[] = [];
    private _roomMonsterCount: number = 0;
    private _totalMonsters: number = 0;
    private _killCount: number = 0;
    private _isRoomCleared: boolean = false;

    /** 初始化战斗 */
    init(player: PlayerController, gridManager: GridManager): void {
        this._player = player;
        this._gridManager = gridManager;
        this._autoAttack = player.getComponent(AutoAttack);
        if (this._autoAttack) {
            this._autoAttack.init(this);
        }
        this._setPhase(BattlePhase.Init);
    }

    /** 开始战斗（进入战斗房时调用） */
    startBattle(monsterConfigs: MonsterConfig[]): void {
        this._monsters = [];
        this._killCount = 0;
        this._totalMonsters = monsterConfigs.length;
        this._isRoomCleared = false;
        this._roomMonsterCount = monsterConfigs.length;

        // 生成怪物
        for (const config of monsterConfigs) {
            const spawnPos = this._findSpawnPosition();
            if (spawnPos) {
                this._spawnMonster(config, spawnPos.x, spawnPos.y);
            }
        }

        this._setPhase(BattlePhase.InProgress);
        eventBus.emit('battle:started', this._totalMonsters);
    }

    /** 生成单个怪物 */
    private _spawnMonster(config: MonsterConfig, gridX: number, gridY: number): void {
        let monsterNode: Node;

        if (this.monsterPrefab) {
            monsterNode = instantiate(this.monsterPrefab);
        } else {
            // Prefab 缺失兜底：创建空节点 + MonsterController
            monsterNode = new Node(`monster_${gridX}_${gridY}`);
        }

        this.node.addChild(monsterNode);
        const monsterCtrl = monsterNode.getComponent(MonsterController);
        if (!monsterCtrl) {
            // 组件缺失兜底：自动添加
            monsterNode.addComponent(MonsterController);
        }
        const ctrl = monsterNode.getComponent(MonsterController)!;
        ctrl.init(config, gridX, gridY, this._gridManager!);

        if (this._player) {
            ctrl.setTarget(this._player);
        }

        this._monsters.push({ monster: ctrl, config });
    }

    /** 查找可用的怪物生成位置（离玩家至少 2 格） */
    private _findSpawnPosition(): { x: number; y: number } | null {
        if (!this._gridManager) return null;

        const gridSize = this._gridManager.gridSize;
        const playerX = this._player?.gridX ?? Math.floor(gridSize / 2);
        const playerY = this._player?.gridY ?? Math.floor(gridSize / 2);

        // 遍历寻找可通行且离玩家 2 格以上的位置
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (this._gridManager.isWalkable(x, y)) {
                    const dist = MathUtils.manhattanDistance(x, y, playerX, playerY);
                    if (dist >= 2 && dist <= 4) {
                        return { x, y };
                    }
                }
            }
        }
        // 兜底：找任何一个可通行位置
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (this._gridManager.isWalkable(x, y) && !(x === playerX && y === playerY)) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    /** 获取范围内的最近怪物 */
    getNearestMonster(position: Vec3, range: number): MonsterEntry | null {
        let nearest: MonsterEntry | null = null;
        let nearestDist = range * GameConfig.TILE_SIZE + 1;

        for (const entry of this._monsters) {
            if (entry.monster.isDead) continue;

            const dist = Vec3.distance(position, entry.monster.node.getPosition());
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = entry;
            }
        }

        return nearest;
    }

    /** 移除已死亡的怪物 */
    removeMonster(monster: MonsterController): void {
        const idx = this._monsters.findIndex(e => e.monster === monster);
        if (idx >= 0) {
            this._monsters.splice(idx, 1);
            this._killCount++;

            // 全清判定
            if (this._monsters.length === 0 && this._totalMonsters > 0) {
                this._onRoomCleared();
            }
        }
    }

    /** 战斗房全清 */
    private _onRoomCleared(): void {
        this._isRoomCleared = true;
        this._setPhase(BattlePhase.Victory);
        eventBus.emit('battle:victory');
    }

    /** 处理玩家死亡 */
    onPlayerDeath(): void {
        this._setPhase(BattlePhase.Defeat);
        eventBus.emit('battle:defeat');
    }

    /** 暂停/恢复战斗（场景切换时） */
    setPaused(paused: boolean): void {
        this._autoAttack?.setActive(!paused);
        if (paused) {
            eventBus.pause();
        } else {
            eventBus.resume();
        }
    }

    private _setPhase(phase: BattlePhase): void {
        this._phase = phase;
    }

    update(dt: number): void {
        if (this._phase !== BattlePhase.InProgress) return;

        // 更新所有怪物 AI + 状态计时
        if (this._player) {
            for (const entry of this._monsters) {
                if (!entry.monster.isDead) {
                    entry.monster.updateAI(dt, this._player);
                    entry.monster.updateStatusTimers(dt);
                }
            }
        }
    }

    get phase(): BattlePhase { return this._phase; }
    get isRoomCleared(): boolean { return this._isRoomCleared; }
    get killCount(): number { return this._killCount; }
    get totalMonsters(): number { return this._totalMonsters; }
    get aliveMonsters(): MonsterEntry[] { return this._monsters.filter(e => !e.monster.isDead); }
    get monsterCount(): number { return this._monsters.filter(e => !e.monster.isDead).length; }

    /** 获取所有怪物（含死亡，用于清点/转场） */
    getAllMonsters(): MonsterController[] {
        return this._monsters
            .filter(e => !e.monster.isDead)
            .map(e => e.monster);
    }
}
