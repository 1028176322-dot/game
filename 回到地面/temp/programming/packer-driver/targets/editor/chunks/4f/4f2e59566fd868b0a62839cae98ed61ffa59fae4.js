System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ChargerAI, _crd;

  function _reportPossibleCrUseOfMonsterAI(extras) {
    _reporterNs.report("MonsterAI", "./MonsterAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAIContext(extras) {
    _reporterNs.report("MonsterAIContext", "./MonsterAI", _context.meta, extras);
  }

  _export("ChargerAI", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "67c72VLsL9I27Ia7SBq65vQ", "ChargerAI", undefined);
      /**
       * ChargerAI - 冲锋型 AI
       *
       * 行为:
       * - 距离 ≤1: 攻击
       * - 距离 2~4: 追击
       * - 距离 >4: 待机
       */


      _export("ChargerAI", ChargerAI = class ChargerAI {
        update(ctx) {
          if (ctx.dist <= 1) {
            ctx.agent.setState('attack');
          } else if (ctx.dist <= 4) {
            ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('chase');
          } else {
            ctx.agent.setState('idle');
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4f2e59566fd868b0a62839cae98ed61ffa59fae4.js.map