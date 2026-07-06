/**
 * StorageService - 跨平台本地存储服务（v2）
 *
 * Uses StorageAdapter pattern to abstract wx/localStorage differences.
 * Provides typed read/write with backup, migration, and fallback support.
 *
 * Phase 1 of data storage implementation plan.
 * Replaces the v1 service at platform/StorageService.ts.
 */

import { PlatformService } from '../../platform/PlatformService';
import { StorageAdapter, StorageReadResult } from './StorageTypes';
import { WXStorageAdapter } from './WXStorageAdapter';
import { BrowserStorageAdapter } from './BrowserStorageAdapter';

type MigrationFn = (oldData: any) => any;

export class StorageService {
    private static _instance: StorageService | null = null;
    private readonly _adapter: StorageAdapter;

    static get instance(): StorageService {
        if (!this._instance) this._instance = new StorageService();
        return this._instance;
    }

    private constructor() {
        const platform = PlatformService.instance;
        this._adapter = platform.isWX ? new WXStorageAdapter() : new BrowserStorageAdapter();
    }

    // ── Raw string operations ──

    getString(key: string): string | null {
        return this._adapter.getString(key);
    }

    setString(key: string, value: string): boolean {
        return this._adapter.setString(key, value);
    }

    remove(key: string): void {
        this._adapter.remove(key);
    }

    has(key: string): boolean {
        return this._adapter.has(key);
    }

    // ── Typed JSON operations ──

    /** Read and parse JSON. Returns defaultValue on any failure. */
    getJson<T>(key: string, defaultValue: T): StorageReadResult<T> {
        try {
            const raw = this._adapter.getString(key);
            if (raw === null) {
                return { ok: true, value: defaultValue, source: 'default' };
            }
            const parsed = JSON.parse(raw) as T;
            return { ok: true, value: parsed, source: 'storage' };
        } catch (err) {
            console.warn(`[StorageService] read failed: ${key}`, err);
            return { ok: false, value: defaultValue, source: 'default', error: String(err) };
        }
    }

    /** Serialize and write. Returns true on success. */
    setJson<T>(key: string, value: T): boolean {
        try {
            const raw = JSON.stringify(value);
            if (raw.length > 1024 * 200) {
                console.warn(`[StorageService] large value: ${key}, ${raw.length} bytes`);
            }
            return this._adapter.setString(key, raw);
        } catch (err) {
            console.warn(`[StorageService] write failed: ${key}`, err);
            return false;
        }
    }

    // ── Backup operations ──

    /** Create a backup copy of key at key_backup. */
    backup(key: string): void {
        const raw = this._adapter.getString(key);
        if (raw !== null) {
            this._adapter.setString(`${key}_backup`, raw);
        }
    }

    /** Restore from key_backup or return defaultValue. */
    restoreBackup<T>(key: string, defaultValue: T): StorageReadResult<T> {
        const backupRaw = this._adapter.getString(`${key}_backup`);
        const backupKey = `${key}_backup`;

        if (backupRaw !== null) {
            try {
                const parsed = JSON.parse(backupRaw) as T;
                // Restore backup to primary key
                this._adapter.setString(key, backupRaw);
                console.log(`[StorageService] restored ${key} from backup`);
                return { ok: true, value: parsed, source: 'recovered' };
            } catch {
                console.warn(`[StorageService] backup also corrupted: ${backupKey}`);
            }
        }
        return { ok: false, value: defaultValue, source: 'default', error: 'backup missing or corrupted' };
    }

    // ── Migration support ──

    /**
     * Read data and run through version migrations.
     * migrations: Record<targetVersion, migrateFn> — runs sequentially from current version +1 up.
     * T should include a schemaVersion field.
     */
    readWithMigration<T>(
        key: string,
        defaultValue: T,
        migrations: Record<number, MigrationFn>,
    ): T {
        const result = this.getJson<T>(key, defaultValue);

        if (!result.ok || result.source === 'default') {
            // Try backup recovery before giving up
            if (result.error) {
                const recovered = this.restoreBackup(key, defaultValue);
                if (recovered.ok && recovered.source === 'recovered') {
                    return recovered.value;
                }
            }
            return defaultValue;
        }

        let current = result.value as any;
        const currentVersion = current.schemaVersion ?? 1;
        const versions = Object.keys(migrations)
            .map(Number)
            .filter(v => !isNaN(v))
            .sort((a, b) => a - b);

        let migrated = false;
        for (const targetVer of versions) {
            if (targetVer > currentVersion) {
                const migrateFn = migrations[targetVer];
                if (migrateFn) {
                    try {
                        current = migrateFn(current);
                        migrated = true;
                    } catch (err) {
                        console.warn(`[StorageService] migration to v${targetVer} failed for ${key}`, err);
                        // If migration fails, fall through with last good state
                    }
                }
            }
        }

        if (migrated) {
            this.setJson(key, current);
        }

        return current as T;
    }
}
