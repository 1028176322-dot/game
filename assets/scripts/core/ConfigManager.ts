/**
 * ConfigManager - 配置管理器
 * 
 * 职责:
 * 1. 集中加载和管理所有配置表（数值、掉落、关卡等）
 * 2. 所有数值配置优先从 GameConfig.ts 读取
 * 3. 配置表加载失败时使用默认值兜底，不对上层业务造成影响
 * 
 * 使用方式:
 *   const cfg = ConfigManager.getInstance();
 *   cfg.getWeaponConfig('sword'); // 获取武器配置
 *   cfg.getMonsterConfig('slime'); // 获取怪物配置
 */

import { GameConfig, GameConfigKey } from './GameConfig';

interface ConfigTable {
    [key: string]: any;
}

export class ConfigManager {
    private static _instance: ConfigManager;
    private _configs: Map<string, ConfigTable> = new Map();
    private _isLoaded: boolean = false;

    static getInstance(): ConfigManager {
        if (!ConfigManager._instance) {
            ConfigManager._instance = new ConfigManager();
        }
        return ConfigManager._instance;
    }

    /** 加载所有配置 */
    loadAll(): boolean {
        try {
            this._configs.set('weapons', this._loadDefaultWeapons());
            this._configs.set('monsters', this._loadDefaultMonsters());
            this._configs.set('skills', this._loadDefaultSkills());
            this._configs.set('floors', this._loadDefaultFloors());
            this._configs.set('drops', this._loadDefaultDrops());
            this._configs.set('sets', this._loadDefaultSets());

            this._isLoaded = true;
            this._validateAll();
            return true;
        } catch (err) {
            console.error('[ConfigManager] 配置加载失败，使用默认值兜底', err);
            this._isLoaded = true;
            return false;
        }
    }

    get isLoaded(): boolean { return this._isLoaded; }

    /** 从 GameConfig 读取数值配置（类型安全） */
    getConfig<T extends GameConfigKey>(key: T): typeof GameConfig[T] {
        return GameConfig[key];
    }

    /** 获取配置表 */
    getTable(name: string): ConfigTable {
        return this._configs.get(name) || {};
    }

    /** 获取配置项（缺失返回默认值） */
    get(tableName: string, key: string, defaultValue: any = null): any {
        const table = this._configs.get(tableName);
        if (!table) return defaultValue;
        return table[key] !== undefined ? table[key] : defaultValue;
    }

    /** 获取武器配置 */
    getWeaponConfig(weaponId: string): any {
        return this.get('weapons', weaponId, { name: '拳脚', atk: GameConfig.PLAYER_BASE_ATK, range: 1, speed: 1.0, element: 'none' });
    }

    /** 获取怪物配置 */
    getMonsterConfig(monsterId: string): any {
        return this.get('monsters', monsterId, { name: '史莱姆', hp: 10, atk: 3, def: 1, speed: 60, ai: 'charger', exp: 5 });
    }

    /** 获取楼层配置 */
    getFloorConfig(floorNum: number): any {
        return this.get('floors', floorNum, { name: `第${floorNum}层`, roomCount: 5, monsters: ['slime'], boss: 'defaultBoss' });
    }

    // ======== 私有验证 ========

    private _validateAll(): void {
        for (const [name, table] of this._configs) {
            if (Object.keys(table).length === 0) {
                console.warn(`[ConfigManager] 配置表 "${name}" 为空`);
            }
        }
        // 验证 GameConfig 合理性
        if (GameConfig.DROP_NORMAL_CHANCE + GameConfig.DROP_ELITE_CHANCE < 0.01) {
            console.warn('[ConfigManager] GameConfig 掉落概率过小，可能无掉落');
        }
        if (GameConfig.GRID_SIZE < 3 || GameConfig.GRID_SIZE > 10) {
            console.warn('[ConfigManager] GRID_SIZE 超出合理范围 (3~10)');
        }
    }

    // ======== 默认配置（兜底） ========

    private _loadDefaultWeapons(): ConfigTable {
        return {
            fists: { name: '拳脚', atk: GameConfig.PLAYER_BASE_ATK, range: 1, speed: GameConfig.AUTO_ATTACK_INTERVAL, element: 'none' },
            sword: { name: '铁剑', atk: GameConfig.PLAYER_BASE_ATK + 5, range: 1.2, speed: 0.9, element: 'none' },
            bow: { name: '短弓', atk: GameConfig.PLAYER_BASE_ATK + 2, range: 3, speed: 0.8, element: 'none' },
            staff: { name: '法杖', atk: GameConfig.PLAYER_BASE_ATK + 7, range: 2.5, speed: 0.7, element: 'fire' },
        };
    }

    private _loadDefaultMonsters(): ConfigTable {
        return {
            slime: { name: '史莱姆', hp: 20, atk: 3, def: 1, speed: 60, ai: 'charger', exp: 5 },
            skeleton: { name: '骷髅兵', hp: 15, atk: 5, def: 0, speed: 80, ai: 'charger', exp: 8 },
            archerSkeleton: { name: '骷髅弓手', hp: 12, atk: 6, def: 0, speed: 50, ai: 'ranged', exp: 10 },
            shieldSkeleton: { name: '骷髅盾卫', hp: 30, atk: 3, def: 5, speed: 40, ai: 'defender', exp: 12 },
            ghost: { name: '幽灵', hp: 10, atk: 4, def: 0, speed: 90, ai: 'charger', exp: 6 },
        };
    }

    private _loadDefaultSkills(): ConfigTable {
        return {
            dash: { name: '冲刺冲锋', cd: 5.0, duration: 0.3, type: 'active' },
            shield: { name: '护盾', cd: 6.0, duration: GameConfig.SKILL_CAST_TIME, type: 'active' },
        };
    }

    private _loadDefaultFloors(): ConfigTable {
        return {
            1: { name: '翠绿森林·外围', roomCount: GameConfig.FLOOR_MIN_ROOMS, monsters: ['slime', 'skeleton'], boss: 'forestGuardian' },
            2: { name: '翠绿森林·深处', roomCount: GameConfig.FLOOR_MIN_ROOMS + 1, monsters: ['skeleton', 'archerSkeleton'], boss: 'forestGuardian' },
            3: { name: '幽暗墓穴·入口', roomCount: GameConfig.FLOOR_MIN_ROOMS + 1, monsters: ['skeleton', 'shieldSkeleton', 'archerSkeleton'], boss: 'skeletonLord' },
        };
    }

    private _loadDefaultDrops(): ConfigTable {
        return {
            normal: { weaponChance: 0.1, itemChance: GameConfig.DROP_NORMAL_CHANCE, goldMin: GameConfig.DROP_GOLD_MIN_NORMAL, goldMax: GameConfig.DROP_GOLD_MAX_NORMAL },
            elite: { weaponChance: 0.4, itemChance: GameConfig.DROP_ELITE_CHANCE, goldMin: GameConfig.DROP_GOLD_MIN_ELITE, goldMax: GameConfig.DROP_GOLD_MAX_ELITE },
            boss: { weaponChance: 1.0, itemChance: GameConfig.DROP_BOSS_CHANCE, goldMin: GameConfig.DROP_GOLD_MIN_BOSS, goldMax: GameConfig.DROP_GOLD_MAX_BOSS },
        };
    }

    private _loadDefaultSets(): ConfigTable {
        return {
            tempest: { name: '狂风', twoPiece: '攻速+12%', sixPiece: '4次攻击额外1次', eightPiece: '风刃AoE' },
            ironwall: { name: '铁壁', twoPiece: '受伤-8%', sixPiece: '50%反伤3点', eightPiece: '护盾10点/5秒' },
            shadow: { name: '暗影', twoPiece: '移速+15%', sixPiece: '翻滚后增伤30%', eightPiece: '击杀隐身+双倍' },
            fury: { name: '狂怒', twoPiece: 'HP<50%+15%ATK', sixPiece: '失血加速', eightPiece: '残血暴击' },
            frostbite: { name: '霜噬', twoPiece: '减速+20%', sixPiece: '控敌+25%伤', eightPiece: '概率冻结' },
            radiance: { name: '圣光', twoPiece: '治疗+20%', sixPiece: '自动回血', eightPiece: '假死CD60s' },
        };
    }
}
