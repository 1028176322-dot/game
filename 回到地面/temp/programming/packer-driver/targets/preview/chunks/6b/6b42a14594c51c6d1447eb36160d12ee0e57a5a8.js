System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, RangedAI, _crd;

  function _reportPossibleCrUseOfMonsterAI(extras) {
    _reporterNs.report("MonsterAI", "./MonsterAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAIContext(extras) {
    _reporterNs.report("MonsterAIContext", "./MonsterAI", _context.meta, extras);
  }

  _export("RangedAI", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "33ce0uIHmJHra42JJ6Ab9Va", "RangedAI", undefined);
      /**
       * RangedAI - 远程型 AI
       *
       * 行为:
       * - 距离 ≤1: 后退
       * - 距离 2~4: 攻击
       * - 距离 5~6: 追击
       * - 距离 >6: 待机
       */


      _export("RangedAI", RangedAI = class RangedAI {
        update(ctx) {
          if (ctx.dist <= 1) {
            ctx.agent.retreatFromTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('retreat');
          } else if (ctx.dist <= 4) {
            ctx.agent.setState('attack');
          } else if (ctx.dist <= 6) {
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
//# sourceMappingURL=6b42a14594c51c6d1447eb36160d12ee0e57a5a8.js.map