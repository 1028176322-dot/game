System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, DefenderAI, _crd;

  function _reportPossibleCrUseOfMonsterAI(extras) {
    _reporterNs.report("MonsterAI", "./MonsterAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAIContext(extras) {
    _reporterNs.report("MonsterAIContext", "./MonsterAI", _context.meta, extras);
  }

  _export("DefenderAI", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "520c6dFDmBP04jTLVNeZgz2", "DefenderAI", undefined);
      /**
       * DefenderAI - 防御型 AI
       *
       * 行为:
       * - 距离 ≤1: 攻击
       * - 距离 2~3: 防御姿态 → 追击
       * - 距离 4~5: 追击
       * - 距离 >5: 待机
       */


      _export("DefenderAI", DefenderAI = class DefenderAI {
        update(ctx) {
          if (ctx.dist <= 1) {
            ctx.agent.setState('attack');
          } else if (ctx.dist <= 3) {
            ctx.agent.setState('defend');
            ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
          } else if (ctx.dist <= 5) {
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
//# sourceMappingURL=de806f2ce57df0cfc7f9a455481ac401e78e1047.js.map