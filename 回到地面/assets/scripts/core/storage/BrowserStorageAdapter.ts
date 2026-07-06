/**
 * BrowserStorageAdapter - localStorage adapter for browser / dev environment.
 *
 * Implements StorageAdapter for Cocos preview or non-wechat platforms.
 */

import { StorageAdapter } from './StorageTypes';

export class BrowserStorageAdapter implements StorageAdapter {
    getString(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    setString(key: string, value: string): boolean {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (err) {
            console.warn(`[BrowserStorageAdapter] write failed: ${key}`, err);
            return false;
        }
    }

    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch {
            // Ignore remove failures
        }
    }

    has(key: string): boolean {
        try {
            return localStorage.getItem(key) !== null;
        } catch {
            return false;
        }
    }
}
