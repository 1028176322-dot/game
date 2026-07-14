System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, MutationRuntimeService, _crd;

  function _reportPossibleCrUseOfMutationManager(extras) {
    _reporterNs.report("MutationManager", "../battle/MutationManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "../battle/IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleHUD(extras) {
    _reporterNs.report("BattleHUD", "../ui/BattleHUD", _context.meta, extras);
  }

  _export("MutationRuntimeService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c76fceogSREOaVyFUexxq7i", "MutationRuntimeService", undefined);
      /**
       * MutationRuntimeService - 变异运行时管理
       *
       * 职责:
       * 1. 生成房间变异时应用到玩家属性
       * 2. 清除变异时移除玩家属性修正
       * 3. 处理变异持续效果（奥术风暴/倒计时）
       *
       * Phase 4: 从 DungeonSceneController 拆分
       */


      _export("MutationRuntimeService", MutationRuntimeService = class MutationRuntimeService {
        constructor(_mutationManager, _player, _battleHUD) {
          this._mutationManager = _mutationManager;
          this._player = _player;
          this._battleHUD = _battleHUD;
        }
        /** 生成层变异 */


        generateMutation(floorNumber) {
          if (!this._mutationManager || !this._player) return; // 清除旧变异

          this._player.stats.removeModifiersByPrefix('mutation:');

          this._mutationManager.clearMutations();

          var mutations = this._mutationManager.generateMutation(floorNumber);

          if (mutations.length > 0) {
            console.log("[\u53D8\u5F02] \u7B2C " + floorNumber + " \u5C42: " + mutations.map(m => m.name).join(', '));

            this._applyMutationEffects(mutations);
          }
        }
        /** 清除变异 */


        clearMutation() {
          if (this._player) {
            this._player.stats.removeModifiersByPrefix('mutation:');
          }
        }
        /** 奥术风暴变异伤害 */


        onElementStorm() {
          if (this._player) {
            this._player.takeDamage(3, false);
          }
        }
        /** 每帧更新变异管理器 */


        update(dt) {
          if (this._mutationManager) {
            this._mutationManager.update(dt);
          }
        }

        _applyMutationEffects(mutations) {
          if (!this._player) return;
          var stats = this._player.stats;

          for (var mut of mutations) {
            var eff = mut.effect;
            var src = "mutation:" + mut.id;

            if (eff.playerAtkMod !== undefined) {
              stats.applyModifier({
                source: src + ":atk",
                stat: 'atk',
                value: eff.playerAtkMod,
                type: 'flat',
                duration: 0
              });
            }

            if (eff.playerDefMod !== undefined) {
              stats.applyModifier({
                source: src + ":def",
                stat: 'def',
                value: eff.playerDefMod,
                type: 'flat',
                duration: 0
              });
            }

            if (eff.playerSpeedMod !== undefined) {
              stats.applyModifier({
                source: src + ":speed",
                stat: 'moveSpeed',
                value: eff.playerSpeedMod - 1,
                type: 'percent',
                duration: 0
              });
            }

            if (eff.playerAttackSpeed !== undefined) {
              stats.applyModifier({
                source: src + ":atkSpeed",
                stat: 'atkSpeed',
                value: eff.playerAttackSpeed - 1,
                type: 'percent',
                duration: 0
              });
            }

            if (eff.playerHealEffect !== undefined) {
              stats.applyModifier({
                source: src + ":heal",
                stat: 'lifeSteal',
                value: eff.playerHealEffect - 1,
                type: 'percent',
                duration: 0
              });
            }

            if (eff.playerLifesteal !== undefined) {
              stats.applyModifier({
                source: src + ":lifesteal",
                stat: 'lifeSteal',
                value: eff.playerLifesteal - 1,
                type: 'percent',
                duration: 0
              });
            }

            if (eff.skillCdMod !== undefined) {
              stats.applyModifier({
                source: src + ":cd",
                stat: 'atkSpeed',
                value: 1 / eff.skillCdMod - 1,
                type: 'percent',
                duration: 0
              });
            }

            if (eff.goldDropMod !== undefined) {
              stats.applyModifier({
                source: src + ":gold",
                stat: 'damageMultiplier',
                value: eff.goldDropMod - 1,
                type: 'percent',
                duration: 0
              });
            }
          }

          if (this._battleHUD && this._player) {
            var final = this._player.stats.getFinalStats();

            this._battleHUD.refreshHP(this._player.currentHP, final.maxHP);
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2bcbbe65659ac0bd5885aee33bfffed6a09ad54f.js.map