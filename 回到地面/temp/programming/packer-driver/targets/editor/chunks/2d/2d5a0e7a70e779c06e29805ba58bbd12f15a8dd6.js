System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd, _callbackIdCounter, _pendingCallbacks;

  function _nextCallbackId() {
    return 'tt_' + ++_callbackIdCounter;
  }
  /** Register a pending callback and return its ID */


  function _registerCallback(cb) {
    const id = _nextCallbackId();

    _pendingCallbacks.set(id, cb); // Auto-cleanup after 30s


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


  function onTapTapCallback(callbackId, jsonResult) {
    const cb = _pendingCallbacks.get(callbackId);

    if (cb) {
      _pendingCallbacks.delete(callbackId);

      try {
        const result = JSON.parse(jsonResult);
        cb(result);
      } catch {
        cb({
          success: false,
          error: 'invalid json'
        });
      }
    }
  } // ── Public API ──

  /** Check if TapSDK is available (via jsb.reflection) */


  function isTapTapSDKAvailable() {
    try {
      return typeof jsb !== 'undefined' && typeof jsb.reflection !== 'undefined';
    } catch {
      return false;
    }
  }
  /** Initialize TapTap SDK */


  async function initTapTapSDK(clientId) {
    if (!isTapTapSDKAvailable()) {
      return {
        success: false,
        error: 'jsb.reflection not available'
      };
    }

    return new Promise(resolve => {
      const cbId = _registerCallback(resolve);

      try {
        jsb.reflection.callStaticMethod('com/yourcompany/backtoground/TapTapBridge', 'init', '(Ljava/lang/String;Ljava/lang/String;)V', clientId, cbId);
      } catch (err) {
        _pendingCallbacks.delete(cbId);

        resolve({
          success: false,
          error: String(err)
        });
      }
    });
  }
  /** Perform TapTap login */


  async function tapLogin() {
    if (!isTapTapSDKAvailable()) {
      return {
        success: false,
        error: 'jsb.reflection not available'
      };
    }

    return new Promise(resolve => {
      const cbId = _registerCallback(resolve);

      try {
        jsb.reflection.callStaticMethod('com/yourcompany/backtoground/TapTapBridge', 'login', '(Ljava/lang/String;)V', cbId);
      } catch (err) {
        _pendingCallbacks.delete(cbId);

        resolve({
          success: false,
          error: String(err)
        });
      }
    });
  }
  /** Check anti-addiction compliance */


  async function checkCompliance(userId) {
    if (!isTapTapSDKAvailable()) {
      return {
        isAllowed: true
      };
    }

    return new Promise(resolve => {
      const cbId = _registerCallback(resolve);

      try {
        jsb.reflection.callStaticMethod('com/yourcompany/backtoground/TapTapBridge', 'checkCompliance', '(Ljava/lang/String;Ljava/lang/String;)V', userId, cbId);
      } catch (err) {
        _pendingCallbacks.delete(cbId);

        resolve({
          isAllowed: true
        });
      }
    });
  }

  _export({
    onTapTapCallback: onTapTapCallback,
    isTapTapSDKAvailable: isTapTapSDKAvailable,
    initTapTapSDK: initTapTapSDK,
    tapLogin: tapLogin,
    checkCompliance: checkCompliance
  });

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "62223ifjpNIAKRm9SX7s5t8", "TapTapBridge", undefined);
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


      _callbackIdCounter = 0;
      _pendingCallbacks = new Map();

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2d5a0e7a70e779c06e29805ba58bbd12f15a8dd6.js.map