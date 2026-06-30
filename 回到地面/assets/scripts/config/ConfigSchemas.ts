/**
 * ConfigSchemas - 配置校验规则
 *
 * 每个配置表的基本校验规则，在 ConfigService.loadAll() 时执行
 * 按需扩展更细粒度的字段校验
 */

import { ConfigMetadata } from './ConfigTypes';
import { ConfigValidationError, ConfigReferenceError } from './ConfigError';

// ======== 通用校验 ========

export function validateMetadata(configName: string, raw: unknown): ConfigMetadata {
    if (!raw || typeof raw !== 'object') {
        throw new ConfigValidationError(configName, 'metadata', 'must be an object');
    }
    const obj = raw as Record<string, unknown>;
    if (!obj.metadata || typeof obj.metadata !== 'object') {
        throw new ConfigValidationError(configName, 'metadata', 'missing or invalid');
    }
    const meta = obj.metadata as Record<string, unknown>;
    if (typeof meta.version !== 'string' || !meta.version) {
        throw new ConfigValidationError(configName, 'metadata.version', 'must be a non-empty string');
    }
    if (typeof meta.lastUpdated !== 'string' || !meta.lastUpdated) {
        throw new ConfigValidationError(configName, 'metadata.lastUpdated', 'must be a non-empty string');
    }
    return meta as unknown as ConfigMetadata;
}

export function validateNonEmptyString(configName: string, field: string, value: unknown): void {
    if (typeof value !== 'string' || value.length === 0) {
        throw new ConfigValidationError(configName, field, 'must be a non-empty string');
    }
}

export function validatePositiveNumber(configName: string, field: string, value: unknown): void {
    if (typeof value !== 'number' || value < 0) {
        throw new ConfigValidationError(configName, field, 'must be a non-negative number');
    }
}

export function validateNumberRange(configName: string, field: string, value: unknown, min: number, max: number): void {
    if (typeof value !== 'number' || value < min || value > max) {
        throw new ConfigValidationError(configName, field, `must be between ${min} and ${max}`);
    }
}

// ======== 战斗配置校验 ========

export function validateBattleData(name: string, data: unknown): void {
    const obj = data as Record<string, unknown>;
    if (obj.autoAttack) {
        const aa = obj.autoAttack as Record<string, unknown>;
        validatePositiveNumber(name, 'autoAttack.baseInterval', aa.baseInterval);
        validatePositiveNumber(name, 'autoAttack.minDamage', aa.minDamage);
        validateNumberRange(name, 'autoAttack.rangeDecayRate', aa.rangeDecayRate, 0, 0.5);
    }
    if (obj.dodge) {
        const d = obj.dodge as Record<string, unknown>;
        validateNumberRange(name, 'dodge.duration', d.duration, 0.1, 1.0);
        validateNumberRange(name, 'dodge.cooldown', d.cooldown, 1.0, 10.0);
    }
}

// ======== 区域-怪物交叉引用校验 ========

export function validateZoneMonsterRefs(
    configName: string,
    zones: { zonePool: string[]; zones: Record<string, { monsterPool: string[] }> },
    zoneMonsters: Record<string, unknown>,
): void {
    for (const zoneId of zones.zonePool) {
        const zone = zones.zones[zoneId];
        if (!zone) {
            throw new ConfigReferenceError(configName, 'zonePool', `zone '${zoneId}' not found in zones`);
        }
        for (const monsterId of zone.monsterPool) {
            const zoneM = zoneMonsters[zoneId];
            if (!zoneM || typeof zoneM !== 'object') {
                throw new ConfigReferenceError(configName, `zones.${zoneId}.monsterPool`, `zone '${zoneId}' has no monster data`);
            }
            const monsterDef = (zoneM as Record<string, unknown>)[monsterId];
            if (!monsterDef) {
                throw new ConfigReferenceError(configName, `zones.${zoneId}.monsterPool`, `monster '${monsterId}' not found in zone '${zoneId}'`);
            }
        }
    }
}
