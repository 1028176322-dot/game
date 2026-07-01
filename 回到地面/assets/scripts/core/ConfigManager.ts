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

        try {
            loadTextConfig(cs.get('text') as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[ConfigManager] TextManager sync failed', err);
        }
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
                ui: {
                    hp: '生命: {cur}/{max}', defeat: '击败: {count}', floor: '第 {floor} 层',
                    reachFloor: '到达层数: {floor}', defeatCount: '击败数: {count}',
                    soulStone: '魂石: {count}', soulStoneDouble: '魂石: {count} (翻倍!)',
                    mapExplore: '探索者 - 地图全开',
                    equipment: '装备', inventory: '道具', inventoryHint: '按 1-5 使用',
                    powerAndBag: '战力: {power}  背包: {used}/12',
                    setTitle: '套装:\n{sets}',
                    marqueeTitle: '跑马灯', marqueeHint: '看广告点亮跑马灯，3 格领钥匙！',
                    marqueeContinue: '继续冒险', marqueeGetKey: '获得一把钥匙！',
                    marqueeProgress: '进度: {lit}/{total}  看广告点亮 1 格',
                    autoSelect: '自动选择: {secs}s', version: 'v1.0.0',
                    shopTitle: '魂石商店', shopTabCharacters: '角色', shopTabTalents: '天赋', shopTabExtras: '扩展',
                    shopSoulStone: '魂石: {count}', shopActionSelect: '选择', shopActionOwned: '已拥有',
                    shopActionUnlock: '解锁', shopCost: '{cost}', close: '关闭', emptySlot: '[{slot}]',
                },
                room: { combat: '战', treasure: '宝', healing: '泉', shop: '店', upgrade: '强', event: '?', boss: '王', start: '始', unknown: '?' },
                event: { sceneBrokenAltar: '破碎祭坛', sceneGlowingCrystal: '发光水晶', sceneAncientStatue: '古代雕像', sceneMysteriousChest: '神秘宝箱', sceneFountain: '古老喷泉', sceneCampfire: '营火', sceneWanderingMerchant: '流浪商人', sceneTrapRoom: '机关房', optionA: '选项A', optionB: '选项B' },
                element: { fire: '火焰', frost: '冰霜', lightning: '闪电', poison: '毒素', shadow: '暗影', holy: '神圣' },
                reaction: { burn: '爆燃', vaporize: '蒸汽', overload: '超载', melt: '融化', freeze: '冻结', shatter: '碎裂', decay: '霜蚀', conduct: '传导', void: '虚空', corrode: '腐蚀', radiance: '光辉' },
                mutation: { M01: '黑暗降临', M02: '绯红之月', M03: '奥术风暴', M04: '时空扭曲', M05: '地震', M06: '淘金热', M07: '虚弱诅咒', M08: '狂乱', M09: '回声', M10: '薄雾', M11: '倒计时', M12: '不稳定空间' },
                zone: { forest: '翠绿森林', catacombs: '幽暗墓穴', volcano: '熔岩火山', tundra: '冰封雪原', swamp: '翠毒沼泽', abyss: '暗影深渊' },
                boss: { forestGuardian: '森林守护者', skeletonLord: '白骨君主', fireLord: '火焰领主', frostQueen: '冰霜女王', swampBehemoth: '翠毒巨兽', abyssOverlord: '深渊霸主' },
                monster: { slime: '森林史莱姆', mushroom: '毒蘑菇', treant: '树苗精', boar: '尖刺野猪', elfArcher: '精灵射手', deerElite: '鹿角兽(精英)', skeleton: '骨兵', ghost: '幽灵', skeletonArcher: '暗影射手', ghoul: '掘地行者', batSwarm: '蝙蝠群', deathKnight: '暗影骑士(精英)', demon: '炎魔步兵', lavaSpider: '熔岩蜘蛛', fireElemental: '火元素', ashWraith: '灰烬魔', suicideGolem: '爆裂魔像', infernoElite: '炎魔(精英)', iceSkeleton: '冰晶兵', snowWolf: '雪狼', frostMage: '冰霜法师', penguinSoldier: '企鹅兵', snowman: '雪人', frostGiant: '冰霜巨人(精英)', slimePoison: '沼泽史莱姆', viper: '毒蛇', swampSpider: '沼泽蜘蛛', rotTreant: '枯木精', giantToad: '巨型蟾蜍', swampDragon: '毒沼龙(精英)', shadowDemon: '暗影魔', voidWraith: '虚空幽魂', abyssArcher: '深渊射手', shadowGolem: '暗影魔像', voidRift: '虚空裂隙', abyssLordElite: '深渊领主(精英)' },
                ability: { doubleStrike: '二段斩', phaseWalk: '穿影', warCry: '怒吼', lifeStealAura: '生命吸取', ricochet: '弹射箭', shieldReflect: '盾反', bulletTime: '子弹时间', elementResonance: '元素共鸣', sprint: '疾跑', frostBite: '霜噬', fireWalker: '火行者', holyShield: '圣盾' },
                skill: { dash: '冲刺冲锋', elementBurst: '元素爆发', shield: '护盾', healWave: '治疗波', slowField: '减速领域', snapShot: '锁定射击' },
                relicPassive: { thornArmor: '荆棘甲', luckyCoin: '幸运币', frenzyAxe: '狂战斧', immortalStone: '不朽石', echoOrb: '回响之珠', shadowCloak: '暗影斗篷', speedGauntlet: '急速手套', ironArmor: '铁甲' },
                relicActive: { shadowDagger: '暗影匕首', frostAmulet: '寒冰护符', flameRing: '烈焰之环', blinkStone: '闪烁石', gravityStone: '引力石', lifeLink: '生命链接', decoyScroll: '分身符', timeHourglass: '时间沙漏' },
                item: { healingPotion: '回复药水', bigHealingPotion: '大回复药水', furyPotion: '狂暴药水', ironPotion: '铁壁药水', speedPotion: '疾速药水', purifyPotion: '净化药水', flameBomb: '火焰瓶', iceBomb: '冰霜瓶', key: '钥匙', advancedKey: '高级钥匙', rerollScroll: '洗点券', reviveCoin: '复活币', mapScroll: '地图卷轴' },
            };
            loadTextConfig(defaultText);
            console.log('[ConfigManager] 文本配置已加载');
        } catch (err) {
            console.warn('[ConfigManager] 文本配置加载失败', err);
        }
    }
}
