import { _decorator, Component, instantiate, Node, Prefab, UITransform, Vec3 } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { BattlePhase } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { MathUtils } from '../utils/MathUtils';
import { BattleClock } from '../core/time/BattleClock';
import { runEvents } from '../core/events';
import { PlayerController } from './PlayerController';
import { MonsterController, MonsterConfig } from './MonsterController';
import { AutoAttack } from './AutoAttack';
import { GridManager } from '../dungeon/GridManager';
import { RenderAssetService } from '../assets/RenderAssetService';
import { MonsterRuntimeFactory } from './MonsterRuntimeFactory';
import { MonsterRuntimeView } from './MonsterRuntimeView';
import { CharacterVisualService } from '../render/CharacterVisualService';

const { ccclass, property } = _decorator;

export interface MonsterEntry {
    monster: MonsterController;
    config: MonsterConfig;
}

@ccclass('BattleManager')
export class BattleManager extends Component {
    @property(Prefab)
    monsterPrefab: Prefab | null = null;

    private _phase: BattlePhase = BattlePhase.Init;
    private _player: PlayerController | null = null;
    private _autoAttack: AutoAttack | null = null;
    private _gridManager: GridManager | null = null;
    private _actorLayer: Node | null = null;
    private _monsters: MonsterEntry[] = [];
    private _roomMonsterCount = 0;
    private _totalMonsters = 0;
    private _killCount = 0;
    private _isRoomCleared = false;

    init(player: PlayerController, gridManager: GridManager, actorLayer?: Node): void {
        this._player = player;
        this._gridManager = gridManager;
        this._actorLayer = actorLayer ?? null;
        this._autoAttack = player.getComponent(AutoAttack);
        this._autoAttack?.init(this);
        this._setPhase(BattlePhase.Init);
        eventBus.on('monster:summon', this._onSummonMonster, this);
    }

    startBattle(monsterConfigs: MonsterConfig[]): void {
        this._clearMonsters();
        this._killCount = 0;
        this._totalMonsters = monsterConfigs.length;
        this._isRoomCleared = false;
        this._roomMonsterCount = monsterConfigs.length;

        for (const config of monsterConfigs) {
            const spawnPos = this._findSpawnPosition();
            if (spawnPos) {
                this._spawnMonster(config, spawnPos.x, spawnPos.y);
            }
        }

        this._setPhase(BattlePhase.InProgress);
        eventBus.emit('battle:started', this._totalMonsters);
        runEvents.emit('battle:started', { total: this._totalMonsters });
    }

    private _clearMonsters(): void {
        for (const entry of this._monsters) {
            this._releaseGrid(entry.monster);
            if (entry.monster?.node?.isValid) {
                entry.monster.node.destroy();
            }
        }
        this._monsters = [];
    }

    private _spawnMonster(config: MonsterConfig, gridX: number, gridY: number, isSummon = false): void {
        if (!this._actorLayer || !this._gridManager) {
            console.warn('[BattleManager] actorLayer/gridManager not ready');
            return;
        }

        const prefab = !isSummon ? this.monsterPrefab : null;
        const runtime = prefab
            ? this._createFromPrefab(config, gridX, gridY, prefab)
            : MonsterRuntimeFactory.create(`monster_${gridX}_${gridY}`);

        const monsterNode = runtime.root;
        this._actorLayer.addChild(monsterNode);

        const pos = this._gridManager.gridToWorld(gridX, gridY);
        monsterNode.setPosition(pos);
        monsterNode.setSiblingIndex(100 + gridY);

        runtime.controller.init(config, gridX, gridY, this._gridManager!, this);
        if (this._player) {
            runtime.controller.setTarget(this._player);
        }

        this._gridManager.setOccupied(gridX, gridY, true);
        this._monsters.push({ monster: runtime.controller, config });
        void this._applyMonsterVisual(monsterNode, config);

        if (isSummon) {
            this._totalMonsters++;
        }
    }

    private _createFromPrefab(config: MonsterConfig, gridX: number, gridY: number, prefab: Prefab) {
        const root = instantiate(prefab);
        root.name = `monster_${config.id ?? gridX}_${gridY}`;
        if (!root.getComponent(UITransform)) {
            root.addComponent(UITransform).setContentSize(96, 96);
        }
        const controller = root.getComponent(MonsterController) ?? root.addComponent(MonsterController);
        return {
            root,
            body: MonsterRuntimeFactory.getBodyNode(root),
            effectSocket: root.getChildByName('EffectSocket') ?? root,
            controller,
            view: root.getComponent(MonsterRuntimeView),
        };
    }

    private async _applyMonsterVisual(monsterNode: Node, config: MonsterConfig): Promise<void> {
        if (!config.zoneId || !config.id) return;

        const bodyNode = MonsterRuntimeFactory.getBodyNode(monsterNode);

        // Try semantic key first: monster.{zone}.{id} (idle)
        const visualKey = `monster.${config.zoneId}.${config.id.toLowerCase()}`;
        const visualOk = await CharacterVisualService.instance.applyStatic(bodyNode, visualKey);
        if (visualOk) {
            const transform = monsterNode.getComponent(UITransform);
            if (transform) transform.setContentSize(96, 96);
            monsterNode.setScale(config.isBoss ? 1.6 : 1, config.isBoss ? 1.6 : 1, 1);
            return;
        }

        // Fallback: direct path
        const frame = await RenderAssetService.applyMonsterSprite(bodyNode, config.zoneId, config.id, 'idle');
        if (!frame || !monsterNode.isValid) return;

        const transform2 = monsterNode.getComponent(UITransform);
        if (transform2) transform2.setContentSize(96, 96);
        monsterNode.setScale(config.isBoss ? 1.6 : 1, config.isBoss ? 1.6 : 1, 1);
    }

    private _onSummonMonster(config: MonsterConfig, gridX: number, gridY: number): void {
        this._spawnMonster(config, gridX, gridY, true);
    }

    private _findSpawnPosition(): { x: number; y: number } | null {
        if (!this._gridManager) return null;

        const gridSize = this._gridManager.gridSize;
        const playerX = this._player?.gridX ?? Math.floor(gridSize / 2);
        const playerY = this._player?.gridY ?? Math.floor(gridSize / 2);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (this._gridManager.isWalkable(x, y) && !this._gridManager.isOccupied(x, y)) {
                    const dist = MathUtils.manhattanDistance(x, y, playerX, playerY);
                    if (dist >= 2 && dist <= 4) {
                        return { x, y };
                    }
                }
            }
        }

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (this._gridManager.isWalkable(x, y) && !this._gridManager.isOccupied(x, y)) {
                    return { x, y };
                }
            }
        }

        return null;
    }

    getNearestMonster(position: Vec3, range: number): MonsterEntry | null {
        this._pruneInvalidMonsters();

        let nearest: MonsterEntry | null = null;
        let nearestDist = range * GameConfig.TILE_SIZE + 1;

        for (const entry of this._monsters) {
            const node = entry.monster.node;
            if (!node || !node.isValid || entry.monster.isDead) continue;

            const dist = Vec3.distance(position, node.getPosition());
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = entry;
            }
        }

        return nearest;
    }

    removeMonster(monster: MonsterController): void {
        this._releaseGrid(monster);

        const idx = this._monsters.findIndex(e => e.monster === monster);
        if (idx >= 0) {
            this._monsters.splice(idx, 1);
            this._killCount++;

            if (this._monsters.length === 0 && this._totalMonsters > 0) {
                this._onRoomCleared();
            }
        }
    }

    private _releaseGrid(monster: MonsterController | null | undefined): void {
        if (!this._gridManager || !monster || !monster.isValid) return;
        this._gridManager.setOccupied(monster.gridX, monster.gridY, false);
    }

    private _pruneInvalidMonsters(): void {
        this._monsters = this._monsters.filter(entry => {
            const monster = entry.monster;
            if (!monster || !monster.isValid || !monster.node || !monster.node.isValid || monster.isDead) {
                this._releaseGrid(monster);
                return false;
            }
            return true;
        });
    }

    private _onRoomCleared(): void {
        this._isRoomCleared = true;
        this._setPhase(BattlePhase.Victory);
        eventBus.emit('battle:victory');
        runEvents.emit('battle:victory', { roomId: 0, roomType: 'normal', isBoss: false });
    }

    onPlayerDeath(): void {
        this._setPhase(BattlePhase.Defeat);
        eventBus.emit('battle:defeat');
        runEvents.emit('battle:defeat', {});
    }

    setPaused(paused: boolean): void {
        this._autoAttack?.setActive(!paused);
        BattleClock.instance.paused = paused;
    }

    private _setPhase(phase: BattlePhase): void {
        this._phase = phase;
    }

    update(dt: number): void {
        BattleClock.instance.tick(dt);
        if (this._phase !== BattlePhase.InProgress) return;

        this._pruneInvalidMonsters();

        if (this._player) {
            for (const entry of this._monsters) {
                entry.monster.updateAI(dt, this._player);
                entry.monster.updateStatusTimers(dt);
            }
        }
    }

    onDestroy(): void {
        this._clearMonsters();
        eventBus.offTarget(this);
    }

    get phase(): BattlePhase { return this._phase; }
    get isRoomCleared(): boolean { return this._isRoomCleared; }
    get killCount(): number { return this._killCount; }
    get totalMonsters(): number { return this._totalMonsters; }
    get aliveMonsters(): MonsterEntry[] { return this._monsters.filter(e => e.monster?.isValid && !e.monster.isDead); }
    get monsterCount(): number { return this.aliveMonsters.length; }

    getAllMonsters(): MonsterController[] {
        return this.aliveMonsters.map(e => e.monster);
    }
}
