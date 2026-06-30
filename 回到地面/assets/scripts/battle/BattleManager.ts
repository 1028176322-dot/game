import { _decorator, Color, Component, Graphics, instantiate, Node, Prefab, UITransform, Vec3 } from 'cc';
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
    private _monsters: MonsterEntry[] = [];
    private _roomMonsterCount: number = 0;
    private _totalMonsters: number = 0;
    private _killCount: number = 0;
    private _isRoomCleared: boolean = false;

    init(player: PlayerController, gridManager: GridManager): void {
        this._player = player;
        this._gridManager = gridManager;
        this._autoAttack = player.getComponent(AutoAttack);
        this._autoAttack?.init(this);
        this._setPhase(BattlePhase.Init);
        eventBus.on('monster:summon', this._onSummonMonster, this);
    }

    startBattle(monsterConfigs: MonsterConfig[]): void {
        this._monsters = [];
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

    private _spawnMonster(config: MonsterConfig, gridX: number, gridY: number, isSummon: boolean = false): void {
        let monsterNode: Node;

        if (this.monsterPrefab && !isSummon) {
            monsterNode = instantiate(this.monsterPrefab);
        } else {
            monsterNode = new Node(`monster_${gridX}_${gridY}`);
            const transform = monsterNode.addComponent(UITransform);
            transform.setContentSize(64, 64);

            const graphics = monsterNode.addComponent(Graphics);
            graphics.fillColor = new Color(255, 180, 120, 220);
            graphics.circle(0, 0, 28);
            graphics.fill();

            if (CC_DEBUG) {
                console.warn('[BattleManager] monsterPrefab is not assigned; using debug placeholder visual.');
            }
        }

        this.node.addChild(monsterNode);
        void this._applyMonsterVisual(monsterNode, config);

        let monsterCtrl = monsterNode.getComponent(MonsterController);
        if (!monsterCtrl) {
            monsterCtrl = monsterNode.addComponent(MonsterController);
        }

        monsterCtrl.init(config, gridX, gridY, this._gridManager!, this);
        if (this._player) {
            monsterCtrl.setTarget(this._player);
        }

        this._monsters.push({ monster: monsterCtrl, config });

        if (isSummon) {
            this._totalMonsters++;
        }
    }

    private async _applyMonsterVisual(monsterNode: Node, config: MonsterConfig): Promise<void> {
        if (!config.zoneId || !config.id) return;

        const frame = await RenderAssetService.applyMonsterSprite(monsterNode, config.zoneId, config.id, 'idle');
        if (!frame || !monsterNode.isValid) return;

        const transform = monsterNode.getComponent(UITransform);
        if (transform) transform.setContentSize(96, 96);
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

    removeMonster(monster: MonsterController): void {
        const idx = this._monsters.findIndex(e => e.monster === monster);
        if (idx >= 0) {
            this._monsters.splice(idx, 1);
            this._killCount++;

            if (this._monsters.length === 0 && this._totalMonsters > 0) {
                this._onRoomCleared();
            }
        }
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

        if (this._player) {
            for (const entry of this._monsters) {
                if (!entry.monster.isDead) {
                    entry.monster.updateAI(dt, this._player);
                    entry.monster.updateStatusTimers(dt);
                }
            }
        }
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    get phase(): BattlePhase { return this._phase; }
    get isRoomCleared(): boolean { return this._isRoomCleared; }
    get killCount(): number { return this._killCount; }
    get totalMonsters(): number { return this._totalMonsters; }
    get aliveMonsters(): MonsterEntry[] { return this._monsters.filter(e => !e.monster.isDead); }
    get monsterCount(): number { return this._monsters.filter(e => !e.monster.isDead).length; }

    getAllMonsters(): MonsterController[] {
        return this._monsters
            .filter(e => !e.monster.isDead)
            .map(e => e.monster);
    }
}
