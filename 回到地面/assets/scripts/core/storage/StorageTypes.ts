/**
 * StorageTypes - 跨平台存储适配器接口与类型定义
 *
 * Phase 1 of data storage implementation plan.
 * Defines the abstraction layer so business code never touches wx/localStorage directly.
 */

/** Minimal storage adapter interface — enough for save file operations. */
export interface StorageAdapter {
    getString(key: string): string | null;
    setString(key: string, value: string): boolean;
    remove(key: string): void;
    has(key: string): boolean;
}

/** Typed read result with source tracking for diagnostics. */
export interface StorageReadResult<T> {
    ok: boolean;
    value: T;
    source: 'storage' | 'default' | 'migration' | 'recovered';
    error?: string;
}
