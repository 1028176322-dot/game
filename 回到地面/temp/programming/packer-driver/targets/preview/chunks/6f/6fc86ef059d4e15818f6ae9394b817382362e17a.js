System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd;

  function _reportPossibleCrUseOfMonsterAgent(extras) {
    _reporterNs.report("MonsterAgent", "../MonsterAgent", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ef5b7axXMZCspPccNLJYFAS", "MonsterAI", undefined);
      /**
       * MonsterAI - 怪物 AI 行为接口
       *
       * Phase 7: 新增一种怪物 AI 类型时，只需实现此接口
       * 无需修改 MonsterController 或 MonsterAgent
       */


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6fc86ef059d4e15818f6ae9394b817382362e17a.js.map