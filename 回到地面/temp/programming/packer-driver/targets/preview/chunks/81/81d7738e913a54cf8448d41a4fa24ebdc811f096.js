System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd;

  function _reportPossibleCrUseOfPlatformLoginResult(extras) {
    _reporterNs.report("PlatformLoginResult", "../PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfComplianceResult(extras) {
    _reporterNs.report("ComplianceResult", "../PlatformTypes", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "2e2feOs7fxAHaiF5l7rM5mM", "PlatformAdapter", undefined);
      /**
       * PlatformAdapter - Abstract interface for all platform adapters
       *
       * Each runtime platform (wechat, taptap, android-native, web-dev)
       * implements this interface to provide platform-specific behavior.
       */


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=81d7738e913a54cf8448d41a4fa24ebdc811f096.js.map