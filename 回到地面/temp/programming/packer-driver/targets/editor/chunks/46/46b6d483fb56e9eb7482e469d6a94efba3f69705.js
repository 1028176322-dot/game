System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Button, Label, AdPlacement, GameManager, GameEvent, T, eventBus, WXAdapter, PlayerDataManager, GameConfig, RunRng, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _crd, ccclass, property, DeathUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfAdPlacement(extras) {
    _reporterNs.report("AdPlacement", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "../core/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../core/TextManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWXAdapter(extras) {
    _reporterNs.report("WXAdapter", "../utils/WXAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "../core/rng/RunRng", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Button = _cc.Button;
      Label = _cc.Label;
    }, function (_unresolved_2) {
      AdPlacement = _unresolved_2.AdPlacement;
    }, function (_unresolved_3) {
      GameManager = _unresolved_3.GameManager;
      GameEvent = _unresolved_3.GameEvent;
    }, function (_unresolved_4) {
      T = _unresolved_4.T;
    }, function (_unresolved_5) {
      eventBus = _unresolved_5.eventBus;
    }, function (_unresolved_6) {
      WXAdapter = _unresolved_6.WXAdapter;
    }, function (_unresolved_7) {
      PlayerDataManager = _unresolved_7.PlayerDataManager;
    }, function (_unresolved_8) {
      GameConfig = _unresolved_8.GameConfig;
    }, function (_unresolved_9) {
      RunRng = _unresolved_9.RunRng;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4f97fCocwZJXaCvKETBARAP", "DeathUI", undefined);
      /**
       * DeathUI - 觉悟战/结算 UI
       * 玩家死亡 → 弹出觉悟战（复活/结算选项）→ 结算统计 → 回到主界面
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Button', 'Label']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("DeathUI", DeathUI = (_dec = ccclass('DeathUI'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Label), _dec5 = property(Label), _dec6 = property(Label), _dec7 = property(Button), _dec(_class = (_class2 = class DeathUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "awakenPanel", _descriptor, this);

          // 觉悟战面板
          _initializerDefineProperty(this, "settlementPanel", _descriptor2, this);

          // 结算面板
          _initializerDefineProperty(this, "floorLabel", _descriptor3, this);

          _initializerDefineProperty(this, "killLabel", _descriptor4, this);

          _initializerDefineProperty(this, "soulStoneLabel", _descriptor5, this);

          _initializerDefineProperty(this, "reviveButton", _descriptor6, this);

          // 复活按钮
          this._deathData = {
            floor: 0,
            kills: 0,
            soulStones: 0
          };
          this._doubleAdInProgress = false;
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).GAME_OVER, this._onPlayerDeath, this);
          this.awakenPanel && (this.awakenPanel.active = false);
          this.settlementPanel && (this.settlementPanel.active = false);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

        _onPlayerDeath() {
          // 收集本局数据
          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance;
          this._deathData = {
            floor: gm.currentFloor,
            kills: 0,
            // 由外部更新
            soulStones: this._calcSoulStones(gm.currentFloor)
          }; // 弹出觉悟战面板

          if (this.awakenPanel) {
            this.awakenPanel.active = true;
          }
        }
        /** 点击"看广告复活"按钮 */


        onReviveClick() {
          if (this.reviveButton) {
            this.reviveButton.interactable = false;
          }

          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().playRewardedAd((_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
            error: Error()
          }), AdPlacement) : AdPlacement).Revive, result => {
            if (result.rewarded) {
              // 复活成功
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('player:revive');
              this.awakenPanel && (this.awakenPanel.active = false);
            } else {
              // 广告未看完或失败 → 进入结算
              this._showSettlement();
            }

            if (this.reviveButton) {
              this.reviveButton.interactable = true;
            }
          });
        }
        /** 点击"放弃/结算"按钮 */


        onSettleClick() {
          this.awakenPanel && (this.awakenPanel.active = false);

          this._showSettlement();
        }

        _showSettlement() {
          var _this$floorLabel, _this$killLabel, _this$soulStoneLabel;

          if (!this.settlementPanel) return; // 更新结算数据

          const flLabel = (_this$floorLabel = this.floorLabel) == null ? void 0 : _this$floorLabel.getComponent(Label);
          if (flLabel) flLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.reachFloor', {
            floor: this._deathData.floor
          });
          const klLabel = (_this$killLabel = this.killLabel) == null ? void 0 : _this$killLabel.getComponent(Label);
          if (klLabel) klLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.defeatCount', {
            count: this._deathData.kills
          });
          const ssLabel = (_this$soulStoneLabel = this.soulStoneLabel) == null ? void 0 : _this$soulStoneLabel.getComponent(Label);
          if (ssLabel) ssLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.soulStone', {
            count: this._deathData.soulStones
          });
          this.settlementPanel.active = true;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('ui:settlement_shown', this._deathData); // Phase 4: 展示插屏广告 (死亡结算后)

          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().reportAdImpression((_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
            error: Error()
          }), AdPlacement) : AdPlacement).Interstitial);
        }
        /** 点击"翻倍广告"按钮 (魂石 ×2) */


        onDoubleClick() {
          if (this._doubleAdInProgress) return;
          this._doubleAdInProgress = true;
          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().playRewardedAd((_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
            error: Error()
          }), AdPlacement) : AdPlacement).CoinDouble, result => {
            this._doubleAdInProgress = false;

            if (result.rewarded) {
              var _this$soulStoneLabel2;

              this._deathData.soulStones *= 2; // 刷新显示

              const ssLabel = (_this$soulStoneLabel2 = this.soulStoneLabel) == null ? void 0 : _this$soulStoneLabel2.getComponent(Label);
              if (ssLabel) ssLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.soulStoneDouble', {
                count: this._deathData.soulStones
              });
            }
          });
        }
        /** 点击"回到地面"按钮 */


        onBackToMainClick() {
          if (this.settlementPanel) {
            this.settlementPanel.active = false;
          } // 魂石结算存入永久存档 (M2.4)


          const pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          pdm.commitRunResult(this._deathData.floor, this._deathData.kills, this._deathData.soulStones); // 上报数据

          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().reportAnalytics('game_settlement', {
            floor: this._deathData.floor,
            kills: this._deathData.kills,
            soulStones: this._deathData.soulStones
          });
          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance;

          if (gm) {
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
              error: Error()
            }), GameEvent) : GameEvent).DUNGEON_EXIT);
          } // Return to main city via AppFlowController (P0 Architecture Rule)


          const {
            AppFlowController
          } = require('../app/AppFlowController');

          if (AppFlowController.instance) {
            AppFlowController.instance.returnToMainHub();
          }
        }
        /** 魂石结算公式 (来自 GameConfig 配置，含天赋增益) */


        _calcSoulStones(floor) {
          const base = (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).SOULSTONE_BASE_RATE;
          const perFloor = floor * 8;
          const bossBonus = (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).SOULSTONE_BOSS_BONUS * floor;
          let stones = base + perFloor + bossBonus; // 魂石波动（0~9 浮动，基于 seed 确定）

          const rewardRng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.fork(`death:reward:${floor}`);
          stones += rewardRng.int(0, 9); // 贪婪天赋: +15% 魂石

          const pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();

          if (pdm.selectedTalent === 'greed') {
            stones = Math.floor(stones * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).SOULSTONE_BASE_RATE * 0.15 + stones);
          }

          return stones;
        }
        /** 更新击杀数（由外部在战斗中累计设置） */


        setKillCount(kills) {
          this._deathData.kills = kills;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "awakenPanel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "settlementPanel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "floorLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "killLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "soulStoneLabel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "reviveButton", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=46b6d483fb56e9eb7482e469d6a94efba3f69705.js.map