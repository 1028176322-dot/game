System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Button, RunCoordinator, PlayerDataManager, AppFlowController, T, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _crd, ccclass, property, SettlementPanel;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfUiPanelId(extras) {
    _reporterNs.report("UiPanelId", "../UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIPanel(extras) {
    _reporterNs.report("UIPanel", "../UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunCoordinator(extras) {
    _reporterNs.report("RunCoordinator", "../../run/RunCoordinator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowController(extras) {
    _reporterNs.report("AppFlowController", "../../app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../../core/TextManager", _context.meta, extras);
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
      Label = _cc.Label;
      Button = _cc.Button;
    }, function (_unresolved_2) {
      RunCoordinator = _unresolved_2.RunCoordinator;
    }, function (_unresolved_3) {
      PlayerDataManager = _unresolved_3.PlayerDataManager;
    }, function (_unresolved_4) {
      AppFlowController = _unresolved_4.AppFlowController;
    }, function (_unresolved_5) {
      T = _unresolved_5.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "eb7eaaeqrpA5oEwjDYcvKtq", "SettlementPanel", undefined);
      /**
       * SettlementPanel - Run settlement panel
       *
       * Shown after returning from dungeon (both death and victory).
       * Displays run statistics, allows soul stone doubling via ad.
       *
       * Implements UIPanel interface for UiRouter lifecycle.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Button']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("SettlementPanel", SettlementPanel = (_dec = ccclass('SettlementPanel'), _dec2 = property(Node), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Label), _dec6 = property(Label), _dec7 = property(Label), _dec8 = property(Label), _dec9 = property(Button), _dec10 = property(Button), _dec(_class = (_class2 = class SettlementPanel extends Component {
        constructor() {
          super(...arguments);
          this.id = 'settlement';

          _initializerDefineProperty(this, "panelRoot", _descriptor, this);

          _initializerDefineProperty(this, "titleLabel", _descriptor2, this);

          _initializerDefineProperty(this, "zoneLabel", _descriptor3, this);

          _initializerDefineProperty(this, "floorLabel", _descriptor4, this);

          _initializerDefineProperty(this, "killLabel", _descriptor5, this);

          _initializerDefineProperty(this, "soulStoneLabel", _descriptor6, this);

          _initializerDefineProperty(this, "timeLabel", _descriptor7, this);

          _initializerDefineProperty(this, "doubleBtn", _descriptor8, this);

          _initializerDefineProperty(this, "backBtn", _descriptor9, this);

          this._soulStones = 0;
          this._doubled = false;
        }

        // ── UIPanel ──
        open(_params) {
          if (this.panelRoot) this.panelRoot.active = true;

          this._refresh();
        }

        close() {
          if (this.panelRoot) this.panelRoot.active = false;
        }

        refresh() {
          this._refresh();
        } // ── Lifecycle ──


        onLoad() {
          if (this.doubleBtn) {
            this.doubleBtn.node.on(Button.EventType.CLICK, this._onDouble, this);
          }

          if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this._onBackToHub, this);
          }
        } // ── Internal ──


        _refresh() {
          var result = (_crd && RunCoordinator === void 0 ? (_reportPossibleCrUseOfRunCoordinator({
            error: Error()
          }), RunCoordinator) : RunCoordinator).instance.getRunResult();

          if (!result) {
            if (this.titleLabel) this.titleLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementTitle');
            return;
          }

          this._soulStones = result.soulStones;

          if (this.titleLabel) {
            this.titleLabel.string = result.isVictory ? (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementVictory') : (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementTitle');
          }

          if (this.zoneLabel) {
            this.zoneLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementZone', {
              zone: result.zoneName
            });
          }

          if (this.floorLabel) {
            this.floorLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementFloor', {
              floor: result.floorReached
            });
          }

          if (this.killLabel) {
            this.killLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementKill', {
              count: result.kills
            });
          }

          if (this.soulStoneLabel) {
            this.soulStoneLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementSoulStone', {
              count: this._soulStones
            });
          }

          if (this.timeLabel) {
            var mins = Math.floor(result.elapsed / 60);
            var secs = Math.floor(result.elapsed % 60);
            this.timeLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementTime', {
              time: mins + ":" + secs.toString().padStart(2, '0')
            });
          }
        }

        _onDouble() {
          if (this._doubled) return;
          this._soulStones *= 2;
          this._doubled = true;

          if (this.soulStoneLabel) {
            this.soulStoneLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settlementSoulStone', {
              count: this._soulStones
            });
          }

          if (this.doubleBtn) {
            this.doubleBtn.interactable = false;
          }

          console.log('[Settlement] soul stones doubled:', this._soulStones);
        }

        _onBackToHub() {
          var result = (_crd && RunCoordinator === void 0 ? (_reportPossibleCrUseOfRunCoordinator({
            error: Error()
          }), RunCoordinator) : RunCoordinator).instance.getRunResult();

          if (result) {
            var pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
              error: Error()
            }), PlayerDataManager) : PlayerDataManager).getInstance();
            pdm.addSoulStones(this._soulStones);
            pdm.setBestFloor(result.floorReached);
            pdm.addTotalKills(result.kills);
            pdm.addTotalRun();
            pdm.save();
          }

          (_crd && RunCoordinator === void 0 ? (_reportPossibleCrUseOfRunCoordinator({
            error: Error()
          }), RunCoordinator) : RunCoordinator).instance.endRun();
          this.close();
          (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
            error: Error()
          }), AppFlowController) : AppFlowController).instance.returnToMainHub();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "panelRoot", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "zoneLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "floorLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "killLabel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "soulStoneLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "timeLabel", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "doubleBtn", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "backBtn", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9af51058eac9d46f59c8da554c9b28f1c92bd65d.js.map