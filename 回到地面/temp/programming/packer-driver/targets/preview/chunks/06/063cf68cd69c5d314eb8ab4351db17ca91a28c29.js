System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, RunRng, MathUtils, _crd, _rngCallId;

  function _nextRng(label) {
    return (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
      error: Error()
    }), RunRng) : RunRng).instance.fork("MathUtils:" + label + ":" + _rngCallId++);
  }

  function _reportPossibleCrUseOfRng(extras) {
    _reporterNs.report("Rng", "../core/rng/Rng", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "../core/rng/RunRng", _context.meta, extras);
  }

  _export("MathUtils", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      RunRng = _unresolved_2.RunRng;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e8859I2bXZACa2Nbr0UJjj8", "MathUtils", undefined);
      /**
       * MathUtils - 数学工具函数
       *
       * [Phase 2] 所有随机方法已迁移至 RunRng
       * 请勿新增 Math.random() 调用
       */


      // 模块级计数器：确保每个 fork 产生不同的子 RNG（同时保持确定性） 
      _rngCallId = 0;

      _export("MathUtils", MathUtils = class MathUtils {
        /** 投掷 D6 骰子 */
        static d6() {
          return _nextRng('d6').d6();
        }
        /** 投掷 nD6 */


        static rollDice(count) {
          var sum = 0;

          for (var i = 0; i < count; i++) {
            sum += MathUtils.d6();
          }

          return sum;
        }
        /** 概率判定 */


        static chance(probability) {
          return _nextRng('chance').next() < probability;
        }
        /** 范围内随机整数 [min, max] */


        static randomInt(min, max) {
          return _nextRng('randomInt').int(min, max);
        }
        /** 夹值 */


        static clamp(value, min, max) {
          return Math.max(min, Math.min(max, value));
        }
        /** 曼哈顿距离 */


        static manhattanDistance(x1, y1, x2, y2) {
          return Math.abs(x1 - x2) + Math.abs(y1 - y2);
        }
        /** 欧几里得距离 */


        static euclideanDistance(x1, y1, x2, y2) {
          return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        }
        /** 种子随机（简易 LCG）- 已废弃，使用 Rng 替代 */


        static seededRandom(seed) {
          var s = seed;
          return () => {
            s = s * 1664525 + 1013904223 & 0xFFFFFFFF;
            return (s >>> 0) / 0xFFFFFFFF;
          };
        }
        /** 从数组中随机取一项 */


        static randomPick(arr) {
          return _nextRng('randomPick').pick(arr);
        }
        /** 从数组中随机取 n 项（不重复） */


        static randomPickN(arr, n) {
          return _nextRng('randomPickN').shuffle(arr).slice(0, Math.min(n, arr.length));
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=063cf68cd69c5d314eb8ab4351db17ca91a28c29.js.map