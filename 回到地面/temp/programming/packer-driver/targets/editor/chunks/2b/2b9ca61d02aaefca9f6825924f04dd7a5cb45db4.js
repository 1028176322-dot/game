System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Button, Sprite, Color, UITransform, RunCoordinator, PlayerDataManager, T, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _crd, ccclass, property, ZONE_DATA, ROUTES, AreaSelectPanel;

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

  function _reportPossibleCrUseOfRunStartConfig(extras) {
    _reporterNs.report("RunStartConfig", "../../run/RunStartConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../../core/PlayerDataManager", _context.meta, extras);
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
      Sprite = _cc.Sprite;
      Color = _cc.Color;
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      RunCoordinator = _unresolved_2.RunCoordinator;
    }, function (_unresolved_3) {
      PlayerDataManager = _unresolved_3.PlayerDataManager;
    }, function (_unresolved_4) {
      T = _unresolved_4.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "445fd9XnqpJBaRiLl1Cx6Cb", "AreaSelectPanel", undefined);
      /**
       * AreaSelectPanel - Area/route selection panel
       *
       * Opened from MainHubUI when player clicks "Start Adventure".
       * Displays available zone routes, assembles RunStartConfig,
       * and delegates to RunCoordinator.startRun().
       *
       * Implements UIPanel interface for UiRouter lifecycle.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Button', 'Sprite', 'Color', 'Vec3', 'UITransform']);

      ({
        ccclass,
        property
      } = _decorator); // ── Unlock condition type ──
      // ── Zone metadata (not player-facing) ──

      ZONE_DATA = {
        forest: {
          id: 'forest',
          difficulty: 'Easy',
          stars: 1
        },
        catacombs: {
          id: 'catacombs',
          difficulty: 'Medium',
          stars: 3
        },
        volcano: {
          id: 'volcano',
          difficulty: 'Hard',
          stars: 5
        },
        swamp: {
          id: 'swamp',
          difficulty: 'Medium',
          stars: 3
        },
        tundra: {
          id: 'tundra',
          difficulty: 'Hard',
          stars: 4
        },
        abyss: {
          id: 'abyss',
          difficulty: 'Extreme',
          stars: 5
        }
      }; // ── Route config ──

      ROUTES = [{
        id: 'forest',
        zoneIds: ['forest', 'catacombs', 'volcano'],
        unlock: {
          type: 'none'
        },
        unlockTextKey: 'ui.unlockNone',
        difficultyKey: 'difficulty.easy'
      }, {
        id: 'swamp',
        zoneIds: ['forest', 'swamp', 'tundra'],
        unlock: {
          type: 'clear_zone',
          zoneId: 'forest',
          count: 1
        },
        unlockTextKey: 'ui.unlockClearZone',
        difficultyKey: 'difficulty.medium'
      }, {
        id: 'abyss',
        zoneIds: ['catacombs', 'abyss', 'volcano'],
        unlock: {
          type: 'clear_zone',
          zoneId: 'catacombs',
          count: 1
        },
        unlockTextKey: 'ui.unlockClearZone',
        difficultyKey: 'difficulty.hard'
      }]; // ── Panel ──

      _export("AreaSelectPanel", AreaSelectPanel = (_dec = ccclass('AreaSelectPanel'), _dec2 = property(Node), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Node), _dec6 = property(Node), _dec7 = property(Button), _dec8 = property(Button), _dec(_class = (_class2 = class AreaSelectPanel extends Component {
        constructor(...args) {
          super(...args);
          this.id = 'area_select';

          _initializerDefineProperty(this, "panelRoot", _descriptor, this);

          _initializerDefineProperty(this, "titleLabel", _descriptor2, this);

          _initializerDefineProperty(this, "playerInfo", _descriptor3, this);

          _initializerDefineProperty(this, "routeContainer", _descriptor4, this);

          _initializerDefineProperty(this, "lockedContainer", _descriptor5, this);

          _initializerDefineProperty(this, "startBtn", _descriptor6, this);

          _initializerDefineProperty(this, "backBtn", _descriptor7, this);

          this._selectedRouteIndex = 0;
        }

        // ── UIPanel interface ──
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
          if (this.startBtn) {
            this.startBtn.node.on(Button.EventType.CLICK, this._onStartRun, this);
          }

          if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this._onBack, this);
          }
        } // ── Unlock / Display helpers ──


        _isRouteUnlocked(route) {
          const pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          const c = route.unlock;

          switch (c.type) {
            case 'none':
              return true;

            case 'clear_zone':
              return pdm.getZoneClearCount(c.zoneId) >= c.count;

            case 'reach_floor':
              return pdm.getBestFloor(c.zoneId) >= c.floor;

            case 'player_level':
              return pdm.getCharacterLevel() >= c.level;

            default:
              return false;
          }
        }

        _getUnlockText(route) {
          const c = route.unlock;

          switch (c.type) {
            case 'none':
              return (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.unlockNone');

            case 'clear_zone':
              return (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)(route.unlockTextKey, {
                zone: (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                  error: Error()
                }), T) : T)(`zone.${c.zoneId}`),
                count: c.count
              });

            case 'reach_floor':
              return (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)(route.unlockTextKey, {
                floor: c.floor
              });

            case 'player_level':
              return (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)(route.unlockTextKey, {
                level: c.level
              });

            default:
              return '';
          }
        } // ── Render ──


        _refresh() {
          const pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();

          if (this.playerInfo) {
            const type = pdm.getSelectedCharacterId();
            this.playerInfo.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.areaPlayerInfo', {
              character: type,
              level: pdm.getCharacterLevel(),
              stones: pdm.getSoulStones()
            });
          }

          this._selectedRouteIndex = 0;

          this._renderRoute();

          this._renderLocked();
        }

        _zoneDisplayName(zoneId) {
          const key = `zone.${zoneId}`;
          if ((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)(key) !== key) return (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)(key);
          return zoneId;
        }

        _difficultyDisplay(diff) {
          const key = `difficulty.${diff.toLowerCase()}`;
          if ((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)(key) !== key) return (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)(key);
          return diff;
        }

        _renderRoute() {
          const route = ROUTES[this._selectedRouteIndex];
          if (!route || !this.routeContainer) return;
          this.routeContainer.removeAllChildren();
          route.zoneIds.forEach((zoneId, i) => {
            const zone = ZONE_DATA[zoneId];
            if (!zone) return;
            const card = new Node(`zone_${i}`);
            card.setPosition((i - 1) * 180, 0);
            const uiTransform = card.addComponent(UITransform);
            uiTransform.setContentSize(140, 90);
            const bg = card.addComponent(Sprite);
            bg.color = new Color(0xF0, 0xF0, 0xF0, 0xFF);
            const nameNode = new Node('Name');
            nameNode.setPosition(0, 15);
            const nameLabel = nameNode.addComponent(Label);
            nameLabel.string = this._zoneDisplayName(zone.id);
            nameLabel.fontSize = 16;
            nameLabel.color = new Color(0x33, 0x33, 0x33, 0xFF);
            card.addChild(nameNode);
            const diffNode = new Node('Difficulty');
            diffNode.setPosition(0, -10);
            const diffLabel = diffNode.addComponent(Label);
            diffLabel.string = this._difficultyDisplay(zone.difficulty);
            diffLabel.fontSize = 13;
            diffLabel.color = new Color(0x88, 0x88, 0x88, 0xFF);
            card.addChild(diffNode);
            this.routeContainer.addChild(card);

            if (i < route.zoneIds.length - 1) {
              const arrow = new Node('arrow');
              arrow.setPosition(90, 0);
              const a = arrow.addComponent(Label);
              a.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.routeArrow');
              a.fontSize = 16;
              a.color = new Color(0xCC, 0xCC, 0xCC, 0xFF);
              this.routeContainer.addChild(arrow);
            }
          });
        }

        _renderLocked() {
          if (!this.lockedContainer) return;
          this.lockedContainer.removeAllChildren();
          ROUTES.forEach((route, i) => {
            if (i === this._selectedRouteIndex || this._isRouteUnlocked(route)) return;
            const node = new Node(`locked_${i}`);
            const label = node.addComponent(Label);
            label.string = `${route.zoneIds.map(zId => this._zoneDisplayName(zId)).join((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.routeArrow'))}    [${this._getUnlockText(route)}]`;
            label.fontSize = 14;
            label.color = new Color(0xAA, 0xAA, 0xAA, 0xFF);
            this.lockedContainer.addChild(node);
          });
        } // ── Actions ──


        _onStartRun() {
          const pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          const route = ROUTES[this._selectedRouteIndex];
          if (!route || !this._isRouteUnlocked(route)) return;
          const config = {
            characterId: pdm.getSelectedCharacterId(),
            characterName: pdm.getCharacterName() || (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.defaultCharacterName'),
            zoneRoute: [...route.zoneIds],
            seed: Date.now(),
            difficulty: 1,
            startedAt: Date.now(),
            isContinue: false
          };
          console.log('[AreaSelect] starting run:', config);
          this.close();
          (_crd && RunCoordinator === void 0 ? (_reportPossibleCrUseOfRunCoordinator({
            error: Error()
          }), RunCoordinator) : RunCoordinator).instance.startRun(config);
        }

        _onBack() {
          this.close();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "panelRoot", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "playerInfo", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "routeContainer", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "lockedContainer", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "startBtn", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "backBtn", [_dec8], {
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
//# sourceMappingURL=2b9ca61d02aaefca9f6825924f04dd7a5cb45db4.js.map