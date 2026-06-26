/**
 * TextManager - 全局文本管理器
 * 
 * 职责：
 *   从 textConfig.json 加载所有玩家可见文本
 *   提供 T(key) 模板函数，支持变量替换
 *   所有 UI 代码中的硬编码文本必须迁移至此
 * 
 * 使用方式：
 *   T('ui.hp', { cur: 80, max: 100 })        → "生命: 80/100"
 *   T('ui.defeat', { count: 5 })              → "击败: 5"
 *   T('zone.forest')                           → "翠绿森林"
 * 
 * 微信审核优势：
 *   所有玩家可见文本集中在 textConfig.json
 *   检查敏感词只需搜索这一个文件
 *   修改文本无需改动代码
 */

import { _decorator } from 'cc';

// 文本数据缓存
let _textData: Record<string, any> | null = null;

/**
 * 加载文本配置
 * 由 ConfigManager 在启动时调用
 */
export function loadTextConfig(data: Record<string, any>): void {
    _textData = data;
}

/**
 * 文本模板函数
 * @param key 点号分隔的键路径，如 "ui.hp"、"zone.forest"
 * @param params 可选模板变量，如 { cur: 80, max: 100 }
 * @returns 渲染后的文本字符串
 */
export function T(key: string, params?: Record<string, any>): string {
    if (!_textData) {
        console.warn(`[TextManager] 文本配置未加载，返回键名: ${key}`);
        return key;
    }

    // 按点号路径逐层查找
    const parts = key.split('.');
    let current: any = _textData;
    for (const part of parts) {
        if (current == null || typeof current !== 'object') {
            console.warn(`[TextManager] 键不存在: ${key}`);
            return key;
        }
        current = current[part];
    }

    if (typeof current !== 'string') {
        console.warn(`[TextManager] 键 ${key} 的值不是字符串`);
        return key;
    }

    // 模板变量替换 {varName}
    if (params) {
        return current.replace(/\{(\w+)\}/g, (match, varName) => {
            if (params[varName] !== undefined) {
                return String(params[varName]);
            }
            console.warn(`[TextManager] 模板变量 ${varName} 未提供 (键: ${key})`);
            return match;
        });
    }

    return current;
}

/**
 * 获取房间类型短名（地图用）
 */
export function getRoomShortName(roomType: string): string {
    const map: Record<string, string> = {
        'combat':    T('room.combat'),
        'treasure':  T('room.treasure'),
        'healing':   T('room.healing'),
        'shop':      T('room.shop'),
        'upgrade':   T('room.upgrade'),
        'event':     T('room.event'),
        'boss':      T('room.boss'),
        'start':     T('room.start'),
    };
    return map[roomType] || T('room.unknown');
}
