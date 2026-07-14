System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd;

  function _reportPossibleCrUseOfEquipmentSlot(extras) {
    _reporterNs.report("EquipmentSlot", "../../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRarity(extras) {
    _reporterNs.report("Rarity", "../../battle/EquipmentSystem", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f75ce25E5BOQJsP+Isj6fWM", "EquipmentViewModel", undefined);
      /**
       * EquipmentViewModel - 装备界面数据模型
       *
       * 职责：装备界面的纯数据定义，不涉及渲染
       * 渲染由 EquipmentView 根据此 VM 驱动
       *
       * Phase 8: UI Prefab + ViewModel 化
       */


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5f322cefe75a5b500c0e21165fb41f087a0fc07b.js.map