/**
 * AreaSelectPanel - Area/route selection panel
 *
 * Opened from MainHubUI when player clicks "Start Adventure".
 * Displays available zone routes, assembles RunStartConfig,
 * and delegates to RunCoordinator.startRun().
 *
 * Implements UIPanel interface for UiRouter lifecycle.
 */

import { _decorator, Component, Node, Label, Button, Sprite, Color, Vec3, UITransform } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { RunCoordinator } from '../../run/RunCoordinator';
import { RunStartConfig, createDefaultRunConfig } from '../../run/RunStartConfig';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { T } from '../../core/TextManager';

const { ccclass, property } = _decorator;

// ── Unlock condition type ──

export type UnlockCondition =
    | { type: 'none' }
    | { type: 'clear_zone'; zoneId: string; count: number }
    | { type: 'reach_floor'; zoneId?: string; floor: number }
    | { type: 'player_level'; level: number };

// ── Zone metadata (not player-facing) ──

interface ZoneInfo {
    id: string;
    difficulty: string;
    stars: number;
}

const ZONE_DATA: Record<string, ZoneInfo> = {
    forest:    { id: 'forest',    difficulty: 'Easy',    stars: 1 },
    catacombs: { id: 'catacombs', difficulty: 'Medium',  stars: 3 },
    volcano:   { id: 'volcano',   difficulty: 'Hard',    stars: 5 },
    swamp:     { id: 'swamp',     difficulty: 'Medium',  stars: 3 },
    tundra:    { id: 'tundra',    difficulty: 'Hard',    stars: 4 },
    abyss:     { id: 'abyss',     difficulty: 'Extreme', stars: 5 },
};

// ── Route config ──

interface RouteEntry {
    id: string;
    zoneIds: string[];
    unlock: UnlockCondition;
    unlockTextKey: string;
    difficultyKey: string;
}

const ROUTES: RouteEntry[] = [
    {
        id: 'forest',
        zoneIds: ['forest', 'catacombs', 'volcano'],
        unlock: { type: 'none' },
        unlockTextKey: 'ui.unlockNone',
        difficultyKey: 'difficulty.easy',
    },
    {
        id: 'swamp',
        zoneIds: ['forest', 'swamp', 'tundra'],
        unlock: { type: 'clear_zone', zoneId: 'forest', count: 1 },
        unlockTextKey: 'ui.unlockClearZone',
        difficultyKey: 'difficulty.medium',
    },
    {
        id: 'abyss',
        zoneIds: ['catacombs', 'abyss', 'volcano'],
        unlock: { type: 'clear_zone', zoneId: 'catacombs', count: 1 },
        unlockTextKey: 'ui.unlockClearZone',
        difficultyKey: 'difficulty.hard',
    },
];

// ── Panel ──

@ccclass('AreaSelectPanel')
export class AreaSelectPanel extends Component implements UIPanel {
    id: UiPanelId = 'area_select';

    @property(Node)
    panelRoot: Node | null = null;

    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    playerInfo: Label | null = null;

    @property(Node)
    routeContainer: Node | null = null;

    @property(Node)
    lockedContainer: Node | null = null;

    @property(Button)
    startBtn: Button | null = null;

    @property(Button)
    backBtn: Button | null = null;

    private _selectedRouteIndex = 0;

    // ── UIPanel interface ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        this._refresh();
    }

    close(): void {
        if (this.panelRoot) this.panelRoot.active = false;
    }

    refresh(): void {
        this._refresh();
    }

    // ── Lifecycle ──

    onLoad(): void {
        if (this.startBtn) {
            this.startBtn.node.on(Button.EventType.CLICK, this._onStartRun, this);
        }
        if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this._onBack, this);
        }
    }

    // ── Unlock / Display helpers ──

    private _isRouteUnlocked(route: RouteEntry): boolean {
        const pdm = PlayerDataManager.getInstance();
        const c = route.unlock;

        switch (c.type) {
            case 'none':
                return true;
            case 'clear_zone':
                return pdm.getZoneClearCount(c.zoneId) >= c.count;
            case 'reach_floor':
                return pdm.getBestFloor(c.zoneId) >= c.floor;
            case 'player_level':
                return pdm.getCharacterLevel() >= c.level;
            default:
                return false;
        }
    }

    private _getUnlockText(route: RouteEntry): string {
        const c = route.unlock;

        switch (c.type) {
            case 'none':
                return T('ui.unlockNone');
            case 'clear_zone':
                return T(route.unlockTextKey, {
                    zone: T(`zone.${c.zoneId}`),
                    count: c.count,
                });
            case 'reach_floor':
                return T(route.unlockTextKey, {
                    floor: c.floor,
                });
            case 'player_level':
                return T(route.unlockTextKey, {
                    level: c.level,
                });
            default:
                return '';
        }
    }

    // ── Render ──

    private _refresh(): void {
        const pdm = PlayerDataManager.getInstance();
        if (this.playerInfo) {
            const type = pdm.getSelectedCharacterId();
            this.playerInfo.string = T('ui.areaPlayerInfo', {
                character: type,
                level: pdm.getCharacterLevel(),
                stones: pdm.getSoulStones(),
            });
        }

        this._selectedRouteIndex = 0;
        this._renderRoute();
        this._renderLocked();
    }

    private _zoneDisplayName(zoneId: string): string {
        const key = `zone.${zoneId}`;
        if (T(key) !== key) return T(key);
        return zoneId;
    }

    private _difficultyDisplay(diff: string): string {
        const key = `difficulty.${diff.toLowerCase()}`;
        if (T(key) !== key) return T(key);
        return diff;
    }

    private _renderRoute(): void {
        const route = ROUTES[this._selectedRouteIndex];
        if (!route || !this.routeContainer) return;
        this.routeContainer.removeAllChildren();

        route.zoneIds.forEach((zoneId, i) => {
            const zone = ZONE_DATA[zoneId];
            if (!zone) return;

            const card = new Node(`zone_${i}`);
            card.setPosition((i - 1) * 180, 0);
            const uiTransform = card.addComponent(UITransform);
            uiTransform.setContentSize(140, 90);

            const bg = card.addComponent(Sprite);
            bg.color = new Color(0xF0, 0xF0, 0xF0, 0xFF);

            const nameNode = new Node('Name');
            nameNode.setPosition(0, 15);
            const nameLabel = nameNode.addComponent(Label);
            nameLabel.string = this._zoneDisplayName(zone.id);
            nameLabel.fontSize = 16;
            nameLabel.color = new Color(0x33, 0x33, 0x33, 0xFF);
            card.addChild(nameNode);

            const diffNode = new Node('Difficulty');
            diffNode.setPosition(0, -10);
            const diffLabel = diffNode.addComponent(Label);
            diffLabel.string = this._difficultyDisplay(zone.difficulty);
            diffLabel.fontSize = 13;
            diffLabel.color = new Color(0x88, 0x88, 0x88, 0xFF);
            card.addChild(diffNode);

            this.routeContainer!.addChild(card);

            if (i < route.zoneIds.length - 1) {
                const arrow = new Node('arrow');
                arrow.setPosition(90, 0);
                const a = arrow.addComponent(Label);
                a.string = T('ui.routeArrow');
                a.fontSize = 16;
                a.color = new Color(0xCC, 0xCC, 0xCC, 0xFF);
                this.routeContainer!.addChild(arrow);
            }
        });
    }

    private _renderLocked(): void {
        if (!this.lockedContainer) return;
        this.lockedContainer.removeAllChildren();

        ROUTES.forEach((route, i) => {
            if (i === this._selectedRouteIndex || this._isRouteUnlocked(route)) return;
            const node = new Node(`locked_${i}`);
            const label = node.addComponent(Label);
            label.string = `${route.zoneIds.map(zId => this._zoneDisplayName(zId)).join(T('ui.routeArrow'))}    [${this._getUnlockText(route)}]`;
            label.fontSize = 14;
            label.color = new Color(0xAA, 0xAA, 0xAA, 0xFF);
            this.lockedContainer!.addChild(node);
        });
    }

    // ── Actions ──

    private _onStartRun(): void {
        const pdm = PlayerDataManager.getInstance();
        const route = ROUTES[this._selectedRouteIndex];
        if (!route || !this._isRouteUnlocked(route)) return;

        const config: RunStartConfig = {
            characterId: pdm.getSelectedCharacterId(),
            characterName: pdm.getCharacterName() || 'Adventurer',
            zoneRoute: [...route.zoneIds],
            seed: Date.now(),
            difficulty: 1,
            startedAt: Date.now(),
            isContinue: false,
        };

        console.log('[AreaSelect] starting run:', config);

        this.close();
        RunCoordinator.instance.startRun(config);
    }

    private _onBack(): void {
        this.close();
    }
}
