/**
 * WXStorageAdapter - WeChat wx.setStorageSync / wx.getStorageSync adapter.
 *
 * Implements StorageAdapter for the wechat mini-game environment.
 */

import { StorageAdapter } from './StorageTypes';

export class WXStorageAdapter implements StorageAdapter {
    getString(key: string): string | null {
        try {
            const raw = wx.getStorageSync(key);
            if (raw === null || raw === undefined || raw === '') return null;
            return String(raw);
        } catch {
            return null;
        }
    }

    setString(key: string, value: string): boolean {
        try {
            wx.setStorageSync(key, value);
            return true;
        } catch (err) {
            console.warn(`[WXStorageAdapter] write failed: ${key}`, err);
            return false;
        }
    }

    remove(key: string): void {
        try {
            wx.removeStorageSync(key);
        } catch {
            // Ignore remove failures
        }
    }

    has(key: string): boolean {
        try {
            return wx.getStorageSync(key) !== undefined && wx.getStorageSync(key) !== null;
        } catch {
            return false;
        }
    }
}
