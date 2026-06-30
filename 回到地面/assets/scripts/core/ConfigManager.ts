/**
 * ConfigManager - 配置管理器（Phase 1 代理版 -> 即将废弃）
 *
 * 【Phase 1 根因治理说明】
 * 此类已在改造中，职责已迁移至 ConfigService（异步加载 JSON）
 * 当前保留作为旧代码的兼容代理，新代码请直接使用 ConfigService
 *
 * 迁移目标:
 * - ConfigService = 运行时唯一权威数据源
 * - TypeScript 默认值 = 仅开发/测试兜底
 * - 启动流程 = 等待 ConfigService.loadAll() 完成后进主界面
 */

import { GameConfig, GameConfigKey } from './GameConfig';
import { MonsterAIType } from './Constants';
import { loadTextConfig } from './TextManager';
import { ConfigService } from '../config/ConfigService';
import { RunRng } from './rng/RunRng';

// ======== 类型定义 ========

export interface MonsterDef {
    name: string;
    hp: number;
    atk: number;
    def: number;
    speed: number;
    ai: 'charger' | 'ranged' | 'defender' | 'suicider' | 'summoner' | 'elite';
    exp: number;
    appearanceWeight: number;
}

export interface ZoneStage {
    rooms: number;
    combatRooms: number;
    specialTypes: string[];
    miniBoss: string;
    miniBossHP: number;
    teaching?: string;
}

export interface FinalBossDef {
    id: string;
    name: string;
    hp: number;
    atk: number;
    def: number;
    phases: number;
    phaseTrigger: number[];
    unlockReward?: string;
    isFinalBoss?: boolean;
}

export interface ZoneDef {
    name: string;
    difficulty: number;
    visualTheme: string;
    stageCount: number;
    monsterPool: string[];
    drops: string;
    stages: Record<string, ZoneStage>;
    finalBoss: FinalBossDef;
}

export interface ZonesConfig {
    metadata: { version: string; lastUpdated: string; description: string };
    zonePool: string[];
    runsPerGame: number;
    zones: Record<string, ZoneDef>;
    roomTypeWeights: Record<string, number>;
}

export interface MonstersConfig {
    metadata: { version: string; lastUpdated: string; description: string };
    [zoneKey: string]: Record<string, MonsterDef> | any;
    monsterScale: {
        eliteHpMultiplier: number;
        eliteAtkMultiplier: number;
        summonHpMultiplier: number;
        summonAtkMultiplier: number;
        maxOnScreen: number;
        summonMaxPerMonster: number;
        summonGlobalCap: number;
    };
}

// ======== 内置默认配置（JSON 加载失败时兜底） ========

const DEFAULT_ZONES: ZonesConfig = {
    metadata: { version: '1.0.0', lastUpdated: '2026-06-25', description: '内置默认配置' },
    zonePool: ['forest', 'catacombs', 'volcano', 'tundra', 'swamp', 'abyss'],
    runsPerGame: 3,
    zones: {
        forest: {
            name: '翠绿森林', difficulty: 1, visualTheme: 'green', stageCount: 4,
            monsterPool: ['slime', 'mushroom', 'treant', 'boar', 'elfArcher', 'deerElite'],
            drops: 'equipment',
            stages: {
                'F1-1': { rooms: 5, combatRooms: 3, specialTypes: ['event', 'shop'], miniBoss: '大角鹿', miniBossHP: 18 },
                'F1-2': { rooms: 5, combatRooms: 3, specialTypes: ['event', 'healing'], miniBoss: '刺猬王', miniBossHP: 20 },
                'F1-3': { rooms: 5, combatRooms: 3, specialTypes: ['event', 'shop'], miniBoss: '野猪统领', miniBossHP: 22 },
                'F1-4': { rooms: 6, combatRooms: 4, specialTypes: ['event', 'treasure'], miniBoss: '毒花女王', miniBossHP: 25 },
            },
            finalBoss: { id: 'forestBoss', name: '森林守护者', hp: 25, atk: 6, def: 2, phases: 3, phaseTrigger: [0.5, 0.25], unlockReward: 'catacombs' },
        },
    },
    roomTypeWeights: { combat: 55, treasure: 12, healing: 10, shop: 10, event: 5, upgrade: 8 },
};

const DEFAULT_MONSTERS: MonstersConfig = {
    metadata: { version: '1.0.0', lastUpdated: '2026-06-25', description: '内置默认怪物配置' },
    forest: {
        slime: { name: '森林史莱姆', hp: 12, atk: 3, def: 0, speed: 50, ai: 'charger', exp: 3, appearanceWeight: 30 },
        mushroom: { name: '毒蘑菇', hp: 10, atk: 2, def: 1, speed: 30, ai: 'defender', exp: 4, appearanceWeight: 20 },
        treant: { name: '树苗精', hp: 18, atk: 4, def: 2, speed: 40, ai: 'charger', exp: 5, appearanceWeight: 20 },
        boar: { name: '尖刺野猪', hp: 8, atk: 5, def: 0, speed: 80, ai: 'charger', exp: 4, appearanceWeight: 15 },
        elfArcher: { name: '精灵射手', hp: 8, atk: 5, def: 0, speed: 60, ai: 'ranged', exp: 6, appearanceWeight: 10 },
        deerElite: { name: '鹿角兽(精英)', hp: 24, atk: 7, def: 1, speed: 70, ai: 'elite', exp: 15, appearanceWeight: 5 },
    },
    monsterScale: {
        eliteHpMultiplier: 1.8, eliteAtkMultiplier: 1.5,
        summonHpMultiplier: 0.5, summonAtkMultiplier: 0.6,
        maxOnScreen: 10, summonMaxPerMonster: 3, summonGlobalCap: 8,
    },
};

export class ConfigManager {
    private static _instance: ConfigManager;
    private _zones: ZonesConfig = DEFAULT_ZONES;
    private _monsters: MonstersConfig = DEFAULT_MONSTERS;
    private _isLoaded: boolean = false;

    static getInstance(): ConfigManager {
        if (!ConfigManager._instance) {
            ConfigManager._instance = new ConfigManager();
        }
        return ConfigManager._instance;
    }

    /** 加载所有配置（已废弃 -> 请使用 ConfigService.loadAll()） */
    loadAll(): boolean {
        console.warn('[ConfigManager] loadAll() 已废弃，请改用 ConfigService.instance.loadAll()');

        try {
            // 如果 ConfigService 已就绪，使用其数据
            const cs = ConfigService.instance;
            if (cs.loaded) {
                this._syncFromConfigService(cs);
                this._isLoaded = true;
                console.log('[ConfigManager] 代理到 ConfigService');
                return true;
            }

            // 兜底：使用内置默认值
            this._zones = { ...DEFAULT_ZONES };
            this._monsters = { ...DEFAULT_MONSTERS };
            this._isLoaded = true;

            // 加载文本配置
            this._loadTextConfig();

            console.log('[ConfigManager] 配置加载完成 (使用内置默认值兜底)');
            return true;
        } catch (err) {
            console.error('[ConfigManager] 配置加载失败，使用默认值兜底', err);
            this._zones = { ...DEFAULT_ZONES };
            this._monsters = { ...DEFAULT_MONSTERS };
            this._isLoaded = true;
            return false;
        }
    }

    /**
     * 从 ConfigService 同步数据到内部默认值
     * 确保旧方法调用能获取到 JSON 配置中的值
     */
    private _syncFromConfigService(cs: ConfigService): void {
        // 同步 zones 数据
        const zonesData = cs.zones;
        this._zones = {
            metadata: zonesData.metadata,
            zonePool: zonesData.zonePool,
            runsPerGame: zonesData.runsPerGame,
            zones: zonesData.zones,
            roomTypeWeights: zonesData.roomTypeWeights,
        };

        // 同步 monsters 数据（保持按区域分组格式）
        const monstersData = cs.monsters as unknown as Record<string, unknown>;
        const rebuiltMonsters: Record<string, unknown> = {
            metadata: monstersData.metadata,
            monsterScale: monstersData.monsterScale,
        };
        for (const key of Object.keys(monstersData)) {
            if (key === 'metadata' || key === 'monsterScale') continue;
            rebuiltMonsters[key] = monstersData[key];
        }
        this._monsters = rebuiltMonsters as MonstersConfig;
    }

    get isLoaded(): boolean { return this._isLoaded; }

    /** 从 GameConfig 读取数值配置（类型安全） */
    getConfig<T extends GameConfigKey>(key: T): typeof GameConfig[T] {
        return GameConfig[key];
    }

    // ======== 区域配置 ========

    /** 获取所有区域 ID 列表（废弃中） */
    getZonePool(): string[] {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.zones.zonePool;
        }
        return this._zones?.zonePool ?? ['forest', 'catacombs', 'volcano', 'tundra', 'swamp', 'abyss'];
    }

    /** 每局选择的区域数（废弃中） */
    getRunsPerGame(): number {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.zones.runsPerGame;
        }
        return this._zones?.runsPerGame ?? 3;
    }

    /** 获取区域定义（废弃中） */
    getZoneDef(zoneId: string): ZoneDef | null {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.zones.zones?.[zoneId] ?? null;
        }
        return this._zones?.zones?.[zoneId] ?? null;
    }

    /** 获取区域的怪物池 ID 列表（废弃中） */
    getMonsterPool(zoneId: string): string[] {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.zones.zones?.[zoneId]?.monsterPool ?? ['slime'];
        }
        return this._zones?.zones?.[zoneId]?.monsterPool ?? ['slime'];
    }

    /** 获取区域的小关配置（废弃中） */
    getStages(zoneId: string): Record<string, ZoneStage> | null {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.zones.zones?.[zoneId]?.stages ?? null;
        }
        return this._zones?.zones?.[zoneId]?.stages ?? null;
    }

    /** 获取区域的小关列表（按顺序）（废弃中） */
    getStageIds(zoneId: string): string[] {
        const stages = this.getStages(zoneId);
        return stages ? Object.keys(stages).sort() : [];
    }

    /** 获取区域终结 Boss 配置（废弃中） */
    getFinalBoss(zoneId: string): FinalBossDef | null {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.zones.zones?.[zoneId]?.finalBoss ?? null;
        }
        return this._zones?.zones?.[zoneId]?.finalBoss ?? null;
    }

    // ======== 怪物配置 ========

    /** 获取某个区域中指定怪物的配置（废弃中） */
    getMonsterDef(zoneId: string, monsterId: string): MonsterDef | null {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.getMonsterDef(zoneId, monsterId);
        }
        const zoneMonsters = this._monsters?.[zoneId];
        if (!zoneMonsters || typeof zoneMonsters !== 'object') return null;
        return (zoneMonsters as Record<string, MonsterDef>)[monsterId] ?? null;
    }

    /**
     * 按权重从怪物池中随机选取怪物（废弃中 -> 使用 RunRng）
     */
    pickMonsterFromPool(zoneId: string, excludeElite: boolean = false): { id: string; def: MonsterDef } | null {
        const poolIds = this.getMonsterPool(zoneId);
        const candidates: { id: string; def: MonsterDef; weight: number }[] = [];

        for (const mid of poolIds) {
            const def = this.getMonsterDef(zoneId, mid);
            if (!def) continue;
            if (excludeElite && def.ai === 'elite') continue;
            candidates.push({ id: mid, def, weight: def.appearanceWeight });
        }

        if (candidates.length === 0) {
            const fallback = this.getMonsterDef(zoneId, poolIds[0]);
            return fallback ? { id: poolIds[0], def: fallback } : null;
        }

        const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
        const rng = RunRng.instance.fork(`config:pickMonster:${zoneId}`);
        let roll = rng.next() * totalWeight;
        for (const c of candidates) {
            roll -= c.weight;
            if (roll <= 0) return { id: c.id, def: c.def };
        }
        return candidates[candidates.length - 1];
    }

    /** 获取指定区域/小关的迷你Boss配置（废弃中） */
    getMiniBossDef(zoneId: string, stageId: string): MonsterDef | null {
        const stage = ConfigService.instance.loaded
            ? ConfigService.instance.zones.zones?.[zoneId]?.stages?.[stageId]
            : this._zones?.zones?.[zoneId]?.stages?.[stageId];
        if (!stage) return null;
        return {
            name: stage.miniBoss,
            hp: stage.miniBossHP,
            atk: Math.floor(stage.miniBossHP * 0.4),
            def: Math.floor(zoneId === 'abyss' ? 3 : zoneId === 'forest' ? 1 : 2),
            speed: 50,
            ai: 'charger',
            exp: Math.floor(stage.miniBossHP * 0.5),
            appearanceWeight: 100,
        };
    }

    /** 获取怪物缩放配置（废弃中） */
    getMonsterScale(): MonstersConfig['monsterScale'] {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.getMonsterScale();
        }
        return this._monsters?.monsterScale ?? {
            eliteHpMultiplier: 1.8, eliteAtkMultiplier: 1.5,
            summonHpMultiplier: 0.5, summonAtkMultiplier: 0.6,
            maxOnScreen: 10, summonMaxPerMonster: 3, summonGlobalCap: 8,
        };
    }

    /** 获取房间类型权重（废弃中） */
    getRoomTypeWeights(): Record<string, number> {
        if (ConfigService.instance.loaded) {
            return ConfigService.instance.zones.roomTypeWeights;
        }
        return this._zones?.roomTypeWeights ?? { combat: 55, treasure: 12, healing: 10, shop: 10, event: 5, upgrade: 8 };
    }

    // ======== 区域选择 ========

    /**
     * 为一局游戏选择区域路线（废弃中 -> 使用 GameManager）
     */
    selectZoneRoute(): string[] {
        const pool = this.getZonePool();
        const runs = this.getRunsPerGame();
        const route: string[] = ['forest'];
        const remaining = pool.slice(1);
        const routeRng = RunRng.instance.fork('config:selectRoute');
        const shuffled = routeRng.shuffle(remaining);
        const count = Math.min(runs - 1, shuffled.length);
        for (let i = 0; i < count; i++) {
            route.push(shuffled[i]);
        }
        route.sort((a, b) => {
            const da = this.getZoneDef(a)?.difficulty ?? 99;
            const db = this.getZoneDef(b)?.difficulty ?? 99;
            return da - db;
        });
        return route;
    }

    // ======== 异步 JSON 加载（已废弃 -> 由 ConfigService 替代） ========

    private _tryLoadJsonAsync(): void {
        // 浏览器/微信环境下尝试通过 resources.load 加载完整 JSON
        // 目前使用内置默认值已满足需求，JSON 文件在构建时会自动合并
        // 如将来需要从远程加载配置，可在此处扩展
    }

    /** 加载文本配置到 TextManager */
    private _loadTextConfig(): void {
        try {
            // 尝试加载 text.json（运行时通过 resources.load 异步加载）
            // 同步环境下先使用内置默认文本数据兜底
            const defaultText = {
                ui: { hp: '生命: {cur}/{max}', defeat: '击败: {count}', floor: '第 {floor} 层' },
                room: { combat: '战', treasure: '宝', healing: '泉', shop: '店', upgrade: '强', event: '?', boss: '王', start: '始', unknown: '?' },
            };
            loadTextConfig(defaultText);
            console.log('[ConfigManager] 文本配置已加载');
        } catch (err) {
            console.warn('[ConfigManager] 文本配置加载失败', err);
        }
    }
}
