System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, TypedEventBus, _crd, runEvents, uiEvents;

  function _reportPossibleCrUseOfGameEventMap(extras) {
    _reporterNs.report("GameEventMap", "./GameEvents", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTypedEventBus(extras) {
    _reporterNs.report("TypedEventBus", "./TypedEventBus", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      TypedEventBus = _unresolved_2.TypedEventBus;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5ffc1lUOnBN3ZCtqm3xco0X", "index", undefined);
      /**
       * events/index - 事件总线实例导出
       *
       * 提供两个独立的事件总线实例:
       * - runEvents: 游戏运行事件（战斗/房间/玩家/怪物）
       * - uiEvents: UI 事件（HUD/弹窗/转场）
       *
       * 分离原因:
       * 战斗暂停不应影响 UI 事件分发
       */


      /** 游戏运行事件总线（战斗/地图/系统逻辑） */
      _export("runEvents", runEvents = new (_crd && TypedEventBus === void 0 ? (_reportPossibleCrUseOfTypedEventBus({
        error: Error()
      }), TypedEventBus) : TypedEventBus)());
      /** UI 事件总线（HUD/弹窗/转场/商店） */


      _export("uiEvents", uiEvents = new (_crd && TypedEventBus === void 0 ? (_reportPossibleCrUseOfTypedEventBus({
        error: Error()
      }), TypedEventBus) : TypedEventBus)());

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=cb9c64fcdc42ffd96156c9910663f2e80896da05.js.map