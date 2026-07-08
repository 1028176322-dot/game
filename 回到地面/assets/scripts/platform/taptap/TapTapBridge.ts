/**
 * TapTapBridge - TypeScript-side bridge for TapTap Android SDK
 *
 * Communicates with the Java-side TapTapBridge via jsb.reflection.
 * Handles callback ID management to route responses.
 *
 * IMPORTANT: This bridge assumes TapSDK is integrated in the Android native project.
 * Actual TapSDK init/login/compliance code must be implemented in TapTapBridge.java.
 *
 * See: docs/TapTap发布迁移详细方案.md
 */

declare const jsb: any;

let _callbackIdCounter = 0;
const _pendingCallbacks = new Map<string, (result: any) => void>();

function _nextCallbackId(): string {
    return 'tt_' + (++_callbackIdCounter);
}

/** Register a pending callback and return its ID */
function _registerCallback(cb: (result: any) => void): string {
    const id = _nextCallbackId();
    _pendingCallbacks.set(id, cb);
    // Auto-cleanup after 30s
    setTimeout(() => {
        if (_pendingCallbacks.has(id)) {
            _pendingCallbacks.delete(id);
            console.warn('[TapTapBridge] callback timeout:', id);
        }
    }, 30000);
    return id;
}

/**
 * Called from Java side (CocosJavascriptJavaBridge.evalString) to deliver results.
 * The Java code should call:
 *   TapTapBridge.onJsCallback("callbackId", jsonResult);
 */
export function onTapTapCallback(callbackId: string, jsonResult: string): void {
    const cb = _pendingCallbacks.get(callbackId);
    if (cb) {
        _pendingCallbacks.delete(callbackId);
        try {
            const result = JSON.parse(jsonResult);
            cb(result);
        } catch {
            cb({ success: false, error: 'invalid json' });
        }
    }
}

// ── Public API ──

/** Check if TapSDK is available (via jsb.reflection) */
export function isTapTapSDKAvailable(): boolean {
    try {
        return typeof jsb !== 'undefined' && typeof jsb.reflection !== 'undefined';
    } catch {
        return false;
    }
}

/** Initialize TapTap SDK */
export async function initTapTapSDK(clientId: string): Promise<{ success: boolean; error?: string }> {
    if (!isTapTapSDKAvailable()) {
        return { success: false, error: 'jsb.reflection not available' };
    }
    return new Promise((resolve) => {
        const cbId = _registerCallback(resolve);
        try {
            jsb.reflection.callStaticMethod(
                'com/yourcompany/backtoground/TapTapBridge',
                'init',
                '(Ljava/lang/String;Ljava/lang/String;)V',
                clientId,
                cbId
            );
        } catch (err: any) {
            _pendingCallbacks.delete(cbId);
            resolve({ success: false, error: String(err) });
        }
    });
}

/** Perform TapTap login */
export async function tapLogin(): Promise<{
    success: boolean;
    userId?: string;
    nickname?: string;
    avatar?: string;
    error?: string;
}> {
    if (!isTapTapSDKAvailable()) {
        return { success: false, error: 'jsb.reflection not available' };
    }
    return new Promise((resolve) => {
        const cbId = _registerCallback(resolve);
        try {
            jsb.reflection.callStaticMethod(
                'com/yourcompany/backtoground/TapTapBridge',
                'login',
                '(Ljava/lang/String;)V',
                cbId
            );
        } catch (err: any) {
            _pendingCallbacks.delete(cbId);
            resolve({ success: false, error: String(err) });
        }
    });
}

/** Check anti-addiction compliance */
export async function checkCompliance(userId: string): Promise<{
    isAllowed: boolean;
    reason?: string;
    remainingMinutes?: number;
}> {
    if (!isTapTapSDKAvailable()) {
        return { isAllowed: true };
    }
    return new Promise((resolve) => {
        const cbId = _registerCallback(resolve);
        try {
            jsb.reflection.callStaticMethod(
                'com/yourcompany/backtoground/TapTapBridge',
                'checkCompliance',
                '(Ljava/lang/String;Ljava/lang/String;)V',
                userId,
                cbId
            );
        } catch (err: any) {
            _pendingCallbacks.delete(cbId);
            resolve({ isAllowed: true });
        }
    });
}
