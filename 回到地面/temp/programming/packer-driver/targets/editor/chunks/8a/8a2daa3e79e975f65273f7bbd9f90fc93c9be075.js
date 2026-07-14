System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, BossPhaseController, _crd;

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "./CombatEntity", _context.meta, extras);
  }

  _export("BossPhaseController", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "adf4eXj+kFOVYMMGxCHs/CD", "BossPhaseController", undefined);
      /**
       * BossPhaseController - Boss 阶段控制器
       *
       * 管辖:
       * - HP 阈值检测
       * - 阶段变更（速度/攻速/攻击递增）
       * - 阶段变更事件通知
       *
       * Phase 7: 从 MonsterController 提取
       */


      _export("BossPhaseController", BossPhaseController = class BossPhaseController {
        constructor(config, _entity, _onChanged) {
          this._isBoss = void 0;
          this._phases = void 0;
          this._currentPhase = 1;
          this._phaseTriggers = void 0;
          this._entity = _entity;
          this._onChanged = _onChanged;
          this._isBoss = config.isBoss;
          this._phases = config.phases;
          this._phaseTriggers = [...config.phaseTriggers];
        }

        get isBoss() {
          return this._isBoss;
        }

        get currentPhase() {
          return this._currentPhase;
        }

        get maxPhases() {
          return this._phases;
        }
        /** 每帧检查阶段（精英/Boss 战斗循环中调用） */


        checkPhase() {
          if (!this._isBoss || this._phases <= 1) return;
          const hpPct = this._entity.hpPercent;
          let newPhase = 1;

          for (let i = 0; i < this._phaseTriggers.length; i++) {
            if (hpPct <= this._phaseTriggers[i]) {
              newPhase = i + 2;
            }
          }

          if (newPhase > this._currentPhase) {
            var _this$_onChanged;

            this._currentPhase = newPhase;

            this._applyPhaseEffects();

            (_this$_onChanged = this._onChanged) == null || _this$_onChanged.call(this, this._currentPhase, this._phases);
          }
        }
        /** 获取阶段倍率乘数 */


        getPhaseSpeedMultiplier() {
          switch (this._currentPhase) {
            case 2:
              return 1.2;

            case 3:
              return 1.3;

            case 4:
              return 1.5;

            default:
              return 1.0;
          }
        }

        getPhaseAtkMultiplier() {
          switch (this._currentPhase) {
            case 3:
              return 1.2;

            case 4:
              return 1.3;

            default:
              return 1.0;
          }
        }

        getPhaseAtkSpeedMultiplier() {
          switch (this._currentPhase) {
            case 2:
              return 0.8;

            case 3:
              return 0.7;

            case 4:
              return 0.5;

            default:
              return 1.0;
          }
        }

        _applyPhaseEffects() {
          this._entity.speed = Math.floor(this._entity.speed * this.getPhaseSpeedMultiplier());
          this._entity.atk = Math.floor(this._entity.atk * this.getPhaseAtkMultiplier());
        }
        /** 初始化配置 */


        reset(isBoss, phases, phaseTriggers) {
          this._isBoss = isBoss;
          this._phases = phases;
          this._phaseTriggers = [...phaseTriggers];
          this._currentPhase = 1;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8a2daa3e79e975f65273f7bbd9f90fc93c9be075.js.map