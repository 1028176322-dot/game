System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, Rng, _crd;

  _export("Rng", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0e6505X0YxCHruurQslnbXk", "Rng", undefined);

      /**
       * Rng - xorshift32 伪随机数生成器
       *
       * 特性:
       * - 可复现（相同 seed → 相同序列）
       * - 非阻塞（无 Math.random 状态依赖）
       * - fork(label) 创建确定性子生成器（用于模块间隔离）
       * - 提供 int / chance / pick / weighted / shuffle / d6 等便捷方法
       *
       * 使用方式:
       *   const rng = new Rng(seed);
       *   const value = rng.int(1, 6);       // D6
       *   const ok = rng.chance(0.5);        // 50% 概率
       *   const item = rng.pick(items);      // 随机选一个
       *   const w = rng.weighted(items, i => i.weight);
       */
      _export("Rng", Rng = class Rng {
        constructor(seed) {
          this._state = void 0;
          this._state = seed >>> 0;
          if (this._state === 0) this._state = 0x12345678;
        }
        /** 获取 [0, 1) 浮点数 */


        next() {
          var x = this._state;
          x ^= x << 13;
          x ^= x >>> 17;
          x ^= x << 5;
          this._state = x >>> 0;
          return this._state / 0xffffffff;
        }
        /** 获取 [min, max] 整数（含两端） */


        int(min, max) {
          return Math.floor(this.next() * (max - min + 1)) + min;
        }
        /** 概率判定（0~1） */


        chance(probability) {
          return this.next() < probability;
        }
        /** 从数组中随机选一个 */


        pick(items) {
          if (items.length === 0) throw new Error('Rng.pick: empty array');
          return items[this.int(0, items.length - 1)];
        }
        /** 按权重选取 */


        weighted(items, getWeight) {
          var total = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);
          if (total <= 0) return this.pick(items);
          var roll = this.next() * total;

          for (var _item of items) {
            roll -= Math.max(0, getWeight(_item));
            if (roll <= 0) return _item;
          }

          return items[items.length - 1];
        }
        /** 打乱数组（Fisher–Yates 洗牌） */


        shuffle(items) {
          var result = [...items];

          for (var i = result.length - 1; i > 0; i--) {
            var j = this.int(0, i);
            [result[i], result[j]] = [result[j], result[i]];
          }

          return result;
        }
        /** D6 骰子（1~6） */


        d6() {
          return this.int(1, 6);
        }
        /**
         * fork - 创建一个确定性的子生成器
         * 
         * 相同 label + 相同父状态 → 相同子序列
         * 用于模块间隔离：不同模块使用不同 label，互不干扰
         */


        fork(label) {
          var hash = this._state;

          for (var i = 0; i < label.length; i++) {
            hash = (hash << 5) - hash + label.charCodeAt(i) >>> 0;
          }

          return new Rng(hash);
        }
        /** 获取当前内部状态（用于调试/存档） */


        get state() {
          return this._state;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=29731a5cb41c20012d5b2b237c5ef78387bacce7.js.map