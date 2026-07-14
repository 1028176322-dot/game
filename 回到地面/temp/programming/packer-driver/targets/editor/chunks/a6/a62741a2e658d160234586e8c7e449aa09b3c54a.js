System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd;

  function _reportPossibleCrUseOfRoomNode(extras) {
    _reporterNs.report("RoomNode", "../../dungeon/DAGGenerator", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "9dd4aBcgTBNX5iRAQINhDVC", "GameEvents", undefined);
      /**
       * GameEvents - 游戏事件类型定义
       *
       * 所有事件通过 TypedEventBus 分发，确保参数类型安全
       * 命名规范: 作用域:事件名 (battle:started, player:damaged)
       *
       * 【迁移规则】
       * 1. 新增业务事件必须先在此处定义类型
       * 2. 禁止使用裸字符串事件名
       * 3. 旧 eventBus 保留兼容，新代码走 runEvents / uiEvents
       */
      // ======== 战斗事件 ========
      // ======== 房间事件 ========
      // ======== 玩家事件 ========
      // ======== 怪物事件 ========
      // ======== UI 事件 ========
      // ======== 游戏事件映射表 ========

      /**
       * GameEventMap - 完整事件类型映射
       *
       * 规则:
       * - 事件名使用 kebab-case，作用域前缀:命名
       * - 所有事件 payload 为对象，禁止裸参数
       * - 参数可选时使用 ? 标记
       */


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a62741a2e658d160234586e8c7e449aa09b3c54a.js.map