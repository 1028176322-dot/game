System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, SummonerAI, _crd;

  function _reportPossibleCrUseOfMonsterAI(extras) {
    _reporterNs.report("MonsterAI", "./MonsterAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAIContext(extras) {
    _reporterNs.report("MonsterAIContext", "./MonsterAI", _context.meta, extras);
  }

  _export("SummonerAI", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a4abc8uAvZFBrdWTPZKy1t5", "SummonerAI", undefined);
      /**
       * SummonerAI - 召唤型 AI
       *
       * 行为:
       * - 保持 3~5 格距离
       * - 每 5 秒召唤一个小怪
       * - 最多召唤 3 只
       */


      _export("SummonerAI", SummonerAI = class SummonerAI {
        constructor() {
          this._timer = 0;
          this._interval = 5.0;
          this._summonCount = 0;
          this._maxSummons = 3;
        }

        update(ctx) {
          if (ctx.dist <= 2) {
            ctx.agent.retreatFromTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('retreat');
          } else if (ctx.dist > 5) {
            ctx.agent.moveTowardTarget(ctx.playerGridX, ctx.playerGridY);
            ctx.agent.setState('chase');
          } else {
            ctx.agent.setState('attack');
          }

          this._timer += ctx.dt;

          if (this._timer >= this._interval && this._summonCount < this._maxSummons) {
            ctx.agent.summonMinion();
            this._timer = 0;
            this._summonCount++;
          }
        }

        reset() {
          this._timer = 0;
          this._summonCount = 0;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=15e0c4aaf5c184e037e1a7e9ccf0ca4febbbce58.js.map