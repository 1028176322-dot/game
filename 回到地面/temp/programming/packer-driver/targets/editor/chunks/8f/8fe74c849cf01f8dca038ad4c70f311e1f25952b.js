System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, SuiciderAI, _crd;

  function _reportPossibleCrUseOfMonsterAI(extras) {
    _reporterNs.report("MonsterAI", "./MonsterAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAIContext(extras) {
    _reporterNs.report("MonsterAIContext", "./MonsterAI", _context.meta, extras);
  }

  _export("SuiciderAI", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6560auxU2BENrl/RnkyQBVK", "SuiciderAI", undefined);
      /**
       * SuiciderAI - 自爆型 AI
       *
       * 行为:
       * - 进入范围后自爆（2 格，2 倍攻击）
       * - 首次行动加速
       */


      _export("SuiciderAI", SuiciderAI = class SuiciderAI {
        constructor() {
          this._suicideRange = 2;
          this._hasSpedUp = false;
        }

        update(ctx) {
          if (ctx.dist <= this._suicideRange) {
            ctx.agent.suicideExplode();
            return;
          }

          if (!this._hasSpedUp) {
            this._hasSpedUp = true;
            ctx.agent.boostSpeed(1.5);
          }

          ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
          ctx.agent.setState('chase');
        }

        reset() {
          this._hasSpedUp = false;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8fe74c849cf01f8dca038ad4c70f311e1f25952b.js.map