System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, BattleClock, _crd;

  _export("BattleClock", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f74c7SOSYJL9Km228BGsKGC", "BattleClock", undefined);

      /**
       * BattleClock - 战斗时钟
       *
       * 职责:
       * 1. 替代 eventBus.pause() 控制战斗计时
       * 2. 暂停时仅影响战斗逻辑，不影响 UI/存档/埋点等系统
       * 3. 支持 timeScale 实现子弹时间等效果
       *
       * 使用方式:
       *   const clock = BattleClock.instance;
       *   clock.paused = true;   // 暂停战斗（UI 仍可响应）
       *   clock.timeScale = 0.5; // 半速
       *   const scaledDt = clock.scale(dt);
       */
      _export("BattleClock", BattleClock = class BattleClock {
        constructor() {
          /** 战斗是否暂停 */
          this.paused = false;

          /** 时间流速倍率（1.0 = 正常） */
          this.timeScale = 1;
          // ======== 内部实现 ========
          this._restoreTimer = -1;
        }

        static get instance() {
          if (!this._instance) this._instance = new BattleClock();
          return this._instance;
        }
        /** 根据暂停/倍率缩放 dt */


        scale(dt) {
          return this.paused ? 0 : dt * this.timeScale;
        }
        /** 设置时间流速（带持续时长） */


        setTimeScale(scale, duration) {
          var prev = this.timeScale;
          this.timeScale = scale;

          if (duration > 0) {
            // 定时恢复（由 BattleManager 的 update 驱动）
            this._scheduleRestore(prev, duration);
          }
        }
        /** 重置到正常状态 */


        reset() {
          this.paused = false;
          this.timeScale = 1;
          this._restoreTimer = -1;
        }

        _scheduleRestore(target, duration) {
          this._restoreTimer = duration;
          this._pendingRestore = target;
        }
        /** 由外部每帧调用（BattleManager.update） */


        tick(dt) {
          if (this._restoreTimer > 0) {
            this._restoreTimer -= dt * (1 / this.timeScale);

            if (this._restoreTimer <= 0) {
              this.timeScale = this._pendingRestore;
              this._restoreTimer = -1;
            }
          }
        }

      });

      BattleClock._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=093ee8d84e8e6c83e2b52ae8ed8333e6ef98625f.js.map