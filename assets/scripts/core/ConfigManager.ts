/**
 * ConfigManager - 配置管理器
 * 所有配置表集中加载、校验、访问
 * 配置缺失不可崩：加载失败使用默认值兜底
 */

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

    /** 加载配置 */
    loadAll(): boolean {
        try {
            // 武器配置
            this._configs.set('weapons', this._loadDefaultWeapons());
            // 怪物配置
            this._configs.set('monsters', this._loadDefaultMonsters());
            // 技能配置
            this._configs.set('skills', this._loadDefaultSkills());
            // 关卡配置
            this._configs.set('floors', this._loadDefaultFloors());
            // 掉落配置
            this._configs.set('drops', this._loadDefaultDrops());

            this._isLoaded = true;
            this._validateAll();
            return true;
        } catch (err) {
            console.error('[ConfigManager] 配置加载失败，使用默认值兜底', err);
            this._isLoaded = true; // 即使失败也标记为"已加载"，使用默认值继续
            return false;
        }
    }

    get isLoaded(): boolean { return this._isLoaded; }

    /** 获取配置表（配置缺失返回空表，不崩溃） */
    getTable(name: string): ConfigTable {
        return this._configs.get(name) || {};
    }

    /** 获取配置项（缺失返回默认值） */
    get(tableName: string, key: string, defaultValue: any = null): any {
        const table = this._configs.get(tableName);
        if (!table) return defaultValue;
        return table[key] !== undefined ? table[key] : defaultValue;
    }

    private _validateAll(): void {
        for (const [name, table] of this._configs) {
            if (Object.keys(table).length === 0) {
                console.warn(`[ConfigManager] 配置表 "${name}" 为空`);
            }
        }
    }

    // ======== 默认配置（硬编码兜底） ========

    private _loadDefaultWeapons(): ConfigTable {
        return {
            fists: { name: '拳脚', atk: 5, range: 1, speed: 1.0, element: 'none' },
            sword: { name: '铁剑', atk: 10, range: 1.2, speed: 0.9, element: 'none' },
            bow: { name: '短弓', atk: 7, range: 3, speed: 0.8, element: 'none' },
            staff: { name: '法杖', atk: 12, range: 2.5, speed: 0.7, element: 'fire' },
        };
    }

    private _loadDefaultMonsters(): ConfigTable {
        return {
            slime: { name: '史莱姆', hp: 20, atk: 3, def: 1, speed: 60, ai: 'charger', exp: 5 },
            skeleton: { name: '骷髅兵', hp: 15, atk: 5, def: 0, speed: 80, ai: 'charger', exp: 8 },
            archerSkeleton: { name: '骷髅弓手', hp: 12, atk: 6, def: 0, speed: 50, ai: 'ranged', exp: 10 },
            shieldSkeleton: { name: '骷髅盾卫', hp: 30, atk: 3, def: 5, speed: 40, ai: 'defender', exp: 12 },
        };
    }

    private _loadDefaultSkills(): ConfigTable {
        return {
            dash: { name: '冲刺冲锋', cd: 5.0, duration: 0.3, type: 'active' },
            shield: { name: '护盾', cd: 6.0, duration: 2.0, type: 'active' },
        };
    }

    private _loadDefaultFloors(): ConfigTable {
        return {
            1: { name: '翠绿森林·外围', roomCount: 4, monsters: ['slime', 'skeleton'], boss: 'forestGuardian' },
            2: { name: '翠绿森林·深处', roomCount: 5, monsters: ['skeleton', 'archerSkeleton'], boss: 'forestGuardian' },
            3: { name: '幽暗墓穴·入口', roomCount: 5, monsters: ['skeleton', 'shieldSkeleton', 'archerSkeleton'], boss: 'skeletonLord' },
        };
    }

    private _loadDefaultDrops(): ConfigTable {
        return {
            normal: { weaponChance: 0.1, itemChance: 0.12, goldMin: 1, goldMax: 5 },
            elite: { weaponChance: 0.4, itemChance: 0.4, goldMin: 5, goldMax: 15 },
            boss: { weaponChance: 1.0, itemChance: 1.0, goldMin: 20, goldMax: 50 },
        };
    }
}
