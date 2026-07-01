/**
 * AreaSelectPanel - Area/route selection panel
 *
 * Opened from MainHubUI when player clicks "Start Adventure".
 * Displays available zone routes, assembles RunStartConfig,
 * and delegates to RunCoordinator.startRun().
 *
 * Implements UIPanel interface for UiRouter lifecycle.
 */

import { _decorator, Component, Node, Label, Button, Sprite, Color, Vec3 } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { RunCoordinator } from '../../run/RunCoordinator';
import { RunStartConfig, createDefaultRunConfig } from '../../run/RunStartConfig';
import { PlayerDataManager } from '../../core/PlayerDataManager';

const { ccclass, property } = _decorator;

interface ZoneInfo {
    id: string;
    name: string;
    difficulty: string;
    stars: number;
}

interface RouteEntry {
    zones: ZoneInfo[];
    unlockCondition: string;
    isUnlocked: () => boolean;
}

const ZONE_DATA: Record<string, ZoneInfo> = {
    forest:    { id: 'forest',    name: 'Emerald Forest',    difficulty: 'Easy',    stars: 1 },
    catacombs: { id: 'catacombs', name: 'Underground Crypt', difficulty: 'Medium',  stars: 3 },
    volcano:   { id: 'volcano',   name: 'Lava Volcano',      difficulty: 'Hard',    stars: 5 },
    swamp:     { id: 'swamp',     name: 'Toxic Swamp',       difficulty: 'Medium',  stars: 3 },
    tundra:    { id: 'tundra',    name: 'Frozen Tundra',     difficulty: 'Hard',    stars: 4 },
    abyss:     { id: 'abyss',     name: 'Void Abyss',        difficulty: 'Extreme', stars: 5 },
};

const ROUTES: RouteEntry[] = [
    {
        zones: [ZONE_DATA.forest, ZONE_DATA.catacombs, ZONE_DATA.volcano],
        unlockCondition: '',
        isUnlocked: () => true,
    },
    {
        zones: [ZONE_DATA.forest, ZONE_DATA.swamp, ZONE_DATA.tundra],
        unlockCondition: 'Clear Emerald Forest 1 time',
        isUnlocked: () => (PlayerDataManager.getInstance() as any).getZoneClearCount?.('forest') > 0 ?? false,
    },
    {
        zones: [ZONE_DATA.catacombs, ZONE_DATA.abyss, ZONE_DATA.volcano],
        unlockCondition: 'Clear Underground Crypt 1 time',
        isUnlocked: () => (PlayerDataManager.getInstance() as any).getZoneClearCount?.('catacombs') > 0 ?? false,
    },
];

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

    // ── Internal ──

    private _refresh(): void {
        const pdm = PlayerDataManager.getInstance();
        if (this.playerInfo) {
            const type = pdm.getSelectedCharacterId();
            this.playerInfo.string = `Character: ${type}  |  Lv${pdm.getCharacterLevel()}  Stones: ${pdm.getSoulStones()}`;
        }

        // Default route
        this._selectedRouteIndex = 0;
        this._renderRoute();
        this._renderLocked();
    }

    private _renderRoute(): void {
        const route = ROUTES[this._selectedRouteIndex];
        if (!route || !this.routeContainer) return;
        this.routeContainer.removeAllChildren();

        route.zones.forEach((zone, i) => {
            const card = new Node(`zone_${i}`);
            card.setPosition((i - 1) * 180, 0);

            const bg = card.addComponent(Sprite);
            bg.color = new Color(0xF0, 0xF0, 0xF0, 0xFF);

            const nameLabel = card.addComponent(Label);
            nameLabel.string = zone.name;
            nameLabel.fontSize = 16;
            nameLabel.color = new Color(0x33, 0x33, 0x33, 0xFF);
            nameLabel.position = new Vec3(0, 12, 0);

            const diffLabel = card.addComponent(Label);
            diffLabel.string = zone.difficulty;
            diffLabel.fontSize = 13;
            diffLabel.color = new Color(0x88, 0x88, 0x88, 0xFF);
            diffLabel.position = new Vec3(0, -10, 0);

            this.routeContainer!.addChild(card);

            if (i < route.zones.length - 1) {
                const arrow = new Node('arrow');
                arrow.setPosition(90, 0);
                const a = arrow.addComponent(Label);
                a.string = '>>>';
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
            if (i === this._selectedRouteIndex || route.isUnlocked()) return;
            const node = new Node(`locked_${i}`);
            const label = node.addComponent(Label);
            label.string = `${route.zones.map(z => z.name).join(' >>> ')}    [${route.unlockCondition}]`;
            label.fontSize = 14;
            label.color = new Color(0xAA, 0xAA, 0xAA, 0xFF);
            this.lockedContainer!.addChild(node);
        });
    }

    private _onStartRun(): void {
        const pdm = PlayerDataManager.getInstance();
        const route = ROUTES[this._selectedRouteIndex];
        if (!route || !route.isUnlocked()) return;

        const config: RunStartConfig = {
            characterId: pdm.getSelectedCharacterId(),
            characterName: pdm.getCharacterName() || 'Adventurer',
            zoneRoute: route.zones.map(z => z.id),
            seed: Date.now(),
            difficulty: 1,
            startedAt: Date.now(),
            isContinue: false,
        };

        console.log('[AreaSelect] starting run:', config);

        // Close panel, then start run
        this.close();
        RunCoordinator.instance.startRun(config);
    }

    private _onBack(): void {
        this.close();
    }
}
