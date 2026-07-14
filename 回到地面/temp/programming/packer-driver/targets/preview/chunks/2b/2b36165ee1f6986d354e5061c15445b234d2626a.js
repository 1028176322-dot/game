System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Color, Component, Label, Node, ProgressBar, tween, Vec3, eventBus, T, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, BattleHUD;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../core/TextManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Color = _cc.Color;
      Component = _cc.Component;
      Label = _cc.Label;
      Node = _cc.Node;
      ProgressBar = _cc.ProgressBar;
      tween = _cc.tween;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      T = _unresolved_3.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a47b0iPIvlMhr6VdsdA2zrJ", "BattleHUD", undefined);
      /**
       * BattleHUD - combat status display.
       *
       * UI only: shows HP, floor, kill count, damage numbers and reaction text.
       * Gameplay state remains owned by battle/player systems.
       */


      __checkObsolete__(['_decorator', 'Color', 'Component', 'Label', 'Node', 'ProgressBar', 'tween', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("BattleHUD", BattleHUD = (_dec = ccclass('BattleHUD'), _dec2 = property(ProgressBar), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Label), _dec6 = property(Node), _dec(_class = (_class2 = class BattleHUD extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "hpBar", _descriptor, this);

          _initializerDefineProperty(this, "hpLabel", _descriptor2, this);

          _initializerDefineProperty(this, "floorLabel", _descriptor3, this);

          _initializerDefineProperty(this, "killLabel", _descriptor4, this);

          _initializerDefineProperty(this, "damageNumberPrefab", _descriptor5, this);

          this._hp = 100;
          this._maxHP = 100;
          this._killCount = 0;
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('player:damaged', this._onPlayerDamaged, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('player:healed', this._onPlayerHealed, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('attack:performed', this._showDamageNumber, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('battle:victory', this._onVictory, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('floor:changed', this._onFloorChanged, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('element:reaction', this._showReactionText, this);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

        refreshHP(currentHP, maxHP) {
          this._hp = Math.max(0, currentHP);
          this._maxHP = Math.max(1, maxHP);

          if (this.hpBar) {
            this.hpBar.progress = this._hp / this._maxHP;
          }

          if (this.hpLabel) {
            this.hpLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.hp', {
              cur: this._hp,
              max: this._maxHP
            });
          }
        }

        refreshFloor(floor) {
          if (this.floorLabel) {
            this.floorLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.floor', {
              floor
            });
          }
        }

        refreshKills(kills) {
          this._killCount = kills;

          if (this.killLabel) {
            this.killLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.defeat', {
              count: kills
            });
          }
        }

        _onPlayerDamaged(damage) {
          this.refreshHP(this._hp - damage, this._maxHP);
        }

        _onPlayerHealed(amount) {
          this.refreshHP(this._hp + amount, this._maxHP);
        }

        _onVictory() {// Reserved for victory feedback.
        }

        _onFloorChanged(floor) {
          this.refreshFloor(floor);
        }

        _showDamageNumber(result) {
          var _result$target;

          var targetNode = result == null || (_result$target = result.target) == null ? void 0 : _result$target.node;
          if (!targetNode || !targetNode.isValid || !this.node.isValid) return;

          var localPos = this._worldToHud(targetNode.worldPosition);

          localPos.y += 42;
          var labelNode = new Node('damage_number');
          labelNode.setPosition(localPos);
          this.node.addChild(labelNode);
          var label = labelNode.addComponent(Label);
          label.string = "" + (result.isCrit ? (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.crit') : '') + result.damage;
          label.fontSize = result.isCrit ? 30 : 24;
          label.lineHeight = result.isCrit ? 34 : 28;
          label.color = result.isCrit ? new Color(255, 210, 70) : new Color(255, 255, 255);
          var endPos = new Vec3(localPos.x, localPos.y + 54, localPos.z);
          tween(labelNode).to(0.65, {
            position: endPos,
            scale: new Vec3(1.15, 1.15, 1)
          }).call(() => labelNode.destroy()).start();
        }

        _showReactionText(reactionName, pos) {
          if (!this.node.isValid) return;
          var labelNode = new Node('reaction_text');

          var localPos = this._worldToHud(pos);

          localPos.y += 30;
          labelNode.setPosition(localPos);
          this.node.addChild(labelNode);
          var label = labelNode.addComponent(Label);
          label.string = reactionName;
          label.fontSize = 28;
          label.color = new Color(255, 215, 0);
          label.lineHeight = 32;
          var endPos = new Vec3(localPos.x, localPos.y + 80, localPos.z);
          tween(labelNode).to(1.0, {
            position: endPos,
            scale: new Vec3(1.3, 1.3, 1)
          }).call(() => labelNode.destroy()).start();
        }

        _worldToHud(worldPos) {
          var localPos = new Vec3();
          this.node.inverseTransformPoint(localPos, worldPos);
          return localPos;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "hpBar", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "hpLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "floorLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "killLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "damageNumberPrefab", [_dec6], {
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
//# sourceMappingURL=2b36165ee1f6986d354e5061c15445b234d2626a.js.map