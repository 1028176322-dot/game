System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd, _callbackIdCounter, _pendingCallbacks;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _nextCallbackId() {
    return 'tt_' + ++_callbackIdCounter;
  }
  /** Register a pending callback and return its ID */


  function _registerCallback(cb) {
    var id = _nextCallbackId();

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
    var cb = _pendingCallbacks.get(callbackId);

    if (cb) {
      _pendingCallbacks.delete(callbackId);

      try {
        var _result = JSON.parse(jsonResult);

        cb(_result);
      } catch (_unused) {
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
    } catch (_unused2) {
      return false;
    }
  }
  /** Initialize TapTap SDK */


  function initTapTapSDK(_x) {
    return _initTapTapSDK.apply(this, arguments);
  }
  /** Perform TapTap login */


  function _initTapTapSDK() {
    _initTapTapSDK = _asyncToGenerator(function* (clientId) {
      if (!isTapTapSDKAvailable()) {
        return {
          success: false,
          error: 'jsb.reflection not available'
        };
      }

      return new Promise(resolve => {
        var cbId = _registerCallback(resolve);

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
    });
    return _initTapTapSDK.apply(this, arguments);
  }

  function tapLogin() {
    return _tapLogin.apply(this, arguments);
  }
  /** Check anti-addiction compliance */


  function _tapLogin() {
    _tapLogin = _asyncToGenerator(function* () {
      if (!isTapTapSDKAvailable()) {
        return {
          success: false,
          error: 'jsb.reflection not available'
        };
      }

      return new Promise(resolve => {
        var cbId = _registerCallback(resolve);

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
    });
    return _tapLogin.apply(this, arguments);
  }

  function checkCompliance(_x2) {
    return _checkCompliance.apply(this, arguments);
  }

  function _checkCompliance() {
    _checkCompliance = _asyncToGenerator(function* (userId) {
      if (!isTapTapSDKAvailable()) {
        return {
          isAllowed: true
        };
      }

      return new Promise(resolve => {
        var cbId = _registerCallback(resolve);

        try {
          jsb.reflection.callStaticMethod('com/yourcompany/backtoground/TapTapBridge', 'checkCompliance', '(Ljava/lang/String;Ljava/lang/String;)V', userId, cbId);
        } catch (err) {
          _pendingCallbacks.delete(cbId);

          resolve({
            isAllowed: true
          });
        }
      });
    });
    return _checkCompliance.apply(this, arguments);
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