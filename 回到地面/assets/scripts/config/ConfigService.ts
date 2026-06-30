/**
 * ConfigService - 配置异步加载服务
 *
 * 职责:
 * 1. 通过 resources.load 异步加载 JSON 配置
 * 2. 加载完成后执行校验（字段存在性 + 交叉引用）
 * 3. 提供类型安全的 typed getter
 * 4. 加载失败明确报错，拒绝静默兜底
 *
 * 使用方式:
 *   await ConfigService.instance.loadAll();
 *   const zones = ConfigService.instance.zones;
 */

import { resources, JsonAsset } from 'cc';
import {
    ConfigName,
    GameConfigs,
    BattleData,
    MonstersData,
    ZonesData,
    MonsterDef,
    MonsterScale,
} from './ConfigTypes';
import { ConfigLoadError } from './ConfigError';
import { validateMetadata, validateZoneMonsterRefs } from './ConfigSchemas';

const CONFIG_NAMES: ConfigName[] = [
    'battle',
    'economy',
    'elements',
    'equipment',
    'items',
    'monsters',
    'player',
    'skills',
    'text',
    'zones',
];

export class ConfigService {
    private static _instance: ConfigService | null = null;
    private _configs: Partial<GameConfigs> = {};
    private _loaded = false;

    static get instance(): ConfigService {
        if (!this._instance) this._instance = new ConfigService();
        return this._instance;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    /** 异步加载全部配置表（必须等待完成再进主界面） */
    async loadAll(): Promise<void> {
        const results = await Promise.all(CONFIG_NAMES.map(name => this._loadOne(name)));

        for (const [name, data] of results) {
            (this._configs as Record<string, unknown>)[name] = data;
        }

        // 交叉引用校验
        this._validateCrossReferences();

        this._loaded = true;
        console.log('[ConfigService] 所有配置加载完成');
    }

    /** 加载单个配置文件 */
    private _loadOne<T extends ConfigName>(name: T): Promise<[T, GameConfigs[T]]> {
        return new Promise((resolve, reject) => {
            resources.load(`config/${name}`, JsonAsset, (err, asset) => {
                if (err || !asset) {
                    reject(new ConfigLoadError(
                        name,
                        `加载失败: ${err?.message ?? '未知错误'}`,
                        err ?? undefined,
                    ));
                    return;
                }

                try {
                    const raw = asset.json as Record<string, unknown>;

                    // 校验 metadata
                    validateMetadata(name, raw);

                    // 类型化数据（JSON 结构即最终数据）
                    const data = raw as GameConfigs[T];
                    resolve([name, data]);
                } catch (e) {
                    reject(e instanceof Error
                        ? new ConfigLoadError(name, `解析失败: ${e.message}`, e)
                        : new ConfigLoadError(name, '未知解析错误'));
                }
            });
        });
    }

    /** 交叉引用校验：zone.monsterPool 引用的怪物必须存在于 monsters.json */
    private _validateCrossReferences(): void {
        const zones = this._configs.zones;
        const monsters = this._configs.monsters;
        if (!zones || !monsters) return;

        // 收集每个区域的怪物定义
        const zoneMonsters: Record<string, unknown> = {};
        for (const key of Object.keys(monsters)) {
            if (key === 'metadata' || key === 'monsterScale') continue;
            zoneMonsters[key] = (monsters as unknown as Record<string, unknown>)[key];
        }

        validateZoneMonsterRefs('config', {
            zonePool: zones.zonePool,
            zones: zones.zones,
        }, zoneMonsters);
    }

    // ======== 类型安全 Getter ========

    get battle(): BattleData {
        return this._configs.battle as BattleData;
    }

    get zones(): ZonesData {
        return this._configs.zones as ZonesData;
    }

    get monsters(): MonstersData {
        return this._configs.monsters as MonstersData;
    }

    /** 泛型访问 */
    get<T extends ConfigName>(name: T): GameConfigs[T] {
        const cfg = this._configs[name];
        if (!cfg) {
            throw new ConfigLoadError(name, `配置未加载（请先调用 loadAll()）`);
        }
        return cfg as GameConfigs[T];
    }

    // ======== 便捷方法（供旧 ConfigManager 代理调用） ========

    /** 获取某个区域中指定怪物的配置 */
    getMonsterDef(zoneId: string, monsterId: string): MonsterDef | null {
        const monsters = this._configs.monsters;
        if (!monsters) return null;
        const zoneMonsters = (monsters as unknown as Record<string, unknown>)[zoneId];
        if (!zoneMonsters || typeof zoneMonsters !== 'object') return null;
        return (zoneMonsters as Record<string, MonsterDef>)[monsterId] ?? null;
    }

    /** 获取怪物缩放参数 */
    getMonsterScale(): MonsterScale {
        const monsters = this._configs.monsters;
        if (!monsters) {
            // 失败时返回默认值（仅作为防御措施）
            return {
                eliteHpMultiplier: 1.8,
                eliteAtkMultiplier: 1.5,
                summonHpMultiplier: 0.5,
                summonAtkMultiplier: 0.6,
                maxOnScreen: 10,
                summonMaxPerMonster: 3,
                summonGlobalCap: 8,
            };
        }
        return monsters.monsterScale;
    }

    /** 检查状态配置是否已加载（抛异常版） */
    assertLoaded(): void {
        if (!this._loaded) {
            throw new ConfigLoadError('ConfigService', '配置尚未加载 - 请在启动时 await ConfigService.instance.loadAll()');
        }
    }
}
