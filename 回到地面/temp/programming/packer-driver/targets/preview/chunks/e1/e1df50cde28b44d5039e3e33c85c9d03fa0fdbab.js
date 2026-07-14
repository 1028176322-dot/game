System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Color, UITransform, eventBus, PlayerDataManager, CHARACTER_LIST, TALENT_LIST, T, _dec, _class, _crd, ccclass, property, ShopUI;

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCHARACTER_LIST(extras) {
    _reporterNs.report("CHARACTER_LIST", "../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTALENT_LIST(extras) {
    _reporterNs.report("TALENT_LIST", "../core/PlayerDataManager", _context.meta, extras);
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
      Component = _cc.Component;
      Node = _cc.Node;
      Label = _cc.Label;
      Color = _cc.Color;
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      PlayerDataManager = _unresolved_3.PlayerDataManager;
      CHARACTER_LIST = _unresolved_3.CHARACTER_LIST;
      TALENT_LIST = _unresolved_3.TALENT_LIST;
    }, function (_unresolved_4) {
      T = _unresolved_4.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "34a89MALV9CWIkyxuMV6ePz", "ShopUI", undefined);
      /**
       * ShopUI - 魂石商店界面 (M2.4)
       * 代码生成节点 (无 Prefab 依赖)
       * 角色解锁 + 天赋购买 + 遗物池扩展
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Button', 'Label', 'Color', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /** 标签页 */

      _export("ShopUI", ShopUI = (_dec = ccclass('ShopUI'), _dec(_class = class ShopUI extends Component {
        constructor() {
          super(...arguments);
          this._dataManager = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          this._isOpen = false;
          this._currentTab = 'characters';
          // UI 节点
          this._panel = null;
          this._tabButtons = new Map();
          this._contentRoot = null;
          this._soulStoneLabel = null;
          this._closeBtn = null;
          // 内容项节点列表
          this._contentItems = [];
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('playerdata:soulStones_changed', this._onSoulStonesChanged, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('playerdata:character_unlocked', this._refreshCurrentTab, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('playerdata:talent_changed', this._refreshCurrentTab, this);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

        init() {
          this._buildUI();

          this.node.active = false;
        }

        toggle() {
          if (this._isOpen) this.hide();else this.show();
        }

        show() {
          this._isOpen = true;
          this.node.active = true;

          this._switchTab('characters');
        }

        hide() {
          this._isOpen = false;
          this.node.active = false;
        }

        get isOpen() {
          return this._isOpen;
        } // ======== UI 构建 ========


        _buildUI() {
          var _this = this;

          this._panel = new Node('shopPanel');
          this.node.addChild(this._panel);

          var panelTransform = this._panel.addComponent(UITransform);

          panelTransform.setContentSize(500, 400); // === 标题 ===

          var titleNode = new Node('title');
          titleNode.setPosition(0, 180, 0);

          this._panel.addChild(titleNode);

          var titleLabel = titleNode.addComponent(Label);
          titleLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.shopTitle');
          titleLabel.fontSize = 22;
          titleLabel.color = Color.WHITE; // === 魂石数量 ===

          var ssNode = new Node('soulStone');
          ssNode.setPosition(0, 150, 0);

          this._panel.addChild(ssNode);

          this._soulStoneLabel = ssNode.addComponent(Label);
          this._soulStoneLabel.fontSize = 16;
          this._soulStoneLabel.color = new Color(255, 215, 0); // 金色

          this._refreshSoulStoneLabel(); // === 标签页按钮 ===


          var tabs = [{
            tab: 'characters',
            label: '角色',
            x: -120
          }, {
            tab: 'talents',
            label: '天赋',
            x: 0
          }, {
            tab: 'extras',
            label: '扩展',
            x: 120
          }];

          var _loop = function _loop(t) {
            var btn = new Node("tab_" + t.tab);
            btn.setPosition(t.x, 110, 0);

            _this._panel.addChild(btn);

            btn.addComponent(UITransform).setContentSize(80, 30);
            var label = btn.addComponent(Label);
            label.string = t.label;
            label.fontSize = 14;
            label.color = Color.GRAY;
            btn.on(Node.EventType.TOUCH_END, () => _this._switchTab(t.tab));

            _this._tabButtons.set(t.tab, btn); // 存储 label 组件用于切换高亮


            btn._label = label;
          };

          for (var t of tabs) {
            _loop(t);
          } // === 内容容器 ===


          this._contentRoot = new Node('content');

          this._contentRoot.setPosition(0, 60, 0);

          this._panel.addChild(this._contentRoot); // === 关闭按钮 ===


          this._closeBtn = new Node('closeBtn');

          this._closeBtn.setPosition(220, 180, 0);

          this._panel.addChild(this._closeBtn);

          this._closeBtn.addComponent(UITransform).setContentSize(40, 30);

          var closeLabel = this._closeBtn.addComponent(Label);

          closeLabel.string = '✕';
          closeLabel.fontSize = 20;
          closeLabel.color = Color.RED;

          this._closeBtn.on(Node.EventType.TOUCH_END, () => this.hide());
        } // ======== 标签页切换 ========


        _switchTab(tab) {
          this._currentTab = tab; // 高亮当前标签

          for (var [t, btn] of this._tabButtons) {
            var label = btn._label;

            if (label) {
              label.color = t === tab ? Color.WHITE : Color.GRAY;
            }
          }

          this._refreshContent();
        }

        _refreshContent() {
          // 清除旧内容
          for (var node of this._contentItems) {
            node.destroy();
          }

          this._contentItems = [];

          switch (this._currentTab) {
            case 'characters':
              this._buildCharacterList();

              break;

            case 'talents':
              this._buildTalentList();

              break;

            case 'extras':
              this._buildExtrasList();

              break;
          }
        }

        _refreshCurrentTab() {
          this._refreshContent();

          this._refreshSoulStoneLabel();
        }

        _refreshSoulStoneLabel() {
          if (this._soulStoneLabel) {
            this._soulStoneLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.shopSoulStone', {
              count: this._dataManager.soulStones
            });
          }
        }

        _onSoulStonesChanged(amount) {
          if (this._isOpen) {
            this._refreshSoulStoneLabel();
          }
        } // ======== 角色列表 ========


        _buildCharacterList() {
          var _this2 = this;

          var _loop2 = function _loop2() {
            var charDef = (_crd && CHARACTER_LIST === void 0 ? (_reportPossibleCrUseOfCHARACTER_LIST({
              error: Error()
            }), CHARACTER_LIST) : CHARACTER_LIST)[i];

            var node = _this2._createShopItem(charDef.name, charDef.description, _this2._dataManager.isCharacterUnlocked(charDef.id), charDef.unlockCost, charDef.isDefault ? undefined : () => {
              if (!_this2._dataManager.isCharacterUnlocked(charDef.id)) {
                _this2._dataManager.unlockCharacter(charDef.id);
              } else {
                _this2._dataManager.selectCharacter(charDef.id);
              }

              _this2._refreshCurrentTab();
            }, 180 - i * 40);

            _this2._contentItems.push(node);
          };

          for (var i = 0; i < (_crd && CHARACTER_LIST === void 0 ? (_reportPossibleCrUseOfCHARACTER_LIST({
            error: Error()
          }), CHARACTER_LIST) : CHARACTER_LIST).length; i++) {
            _loop2();
          }
        } // ======== 天赋列表 ========


        _buildTalentList() {
          var _this3 = this;

          var _loop3 = function _loop3() {
            var talent = (_crd && TALENT_LIST === void 0 ? (_reportPossibleCrUseOfTALENT_LIST({
              error: Error()
            }), TALENT_LIST) : TALENT_LIST)[i];
            var isOwned = _this3._dataManager.selectedTalent === talent.id;

            var node = _this3._createShopItem(talent.name, talent.description, isOwned, talent.cost, () => {
              if (!isOwned) {
                _this3._dataManager.purchaseTalent(talent.id);
              }

              _this3._refreshCurrentTab();
            }, 180 - i * 40);

            _this3._contentItems.push(node);
          };

          for (var i = 0; i < (_crd && TALENT_LIST === void 0 ? (_reportPossibleCrUseOfTALENT_LIST({
            error: Error()
          }), TALENT_LIST) : TALENT_LIST).length; i++) {
            _loop3();
          }
        } // ======== 扩展列表 (简化) ========


        _buildExtrasList() {
          var _this4 = this;

          var extras = [{
            id: 'extra_relic_pool',
            name: '遗物池扩展',
            desc: '解锁更多遗物进入选项池',
            cost: 300
          }];

          var _loop4 = function _loop4() {
            var _this4$_dataManager$u;

            var ext = extras[i];
            var purchased = (_this4$_dataManager$u = _this4._dataManager['unlockedRelicPoolExtras']) == null ? void 0 : _this4$_dataManager$u.includes(ext.id);

            var node = _this4._createShopItem(ext.name, ext.desc, !!purchased, ext.cost, () => {
              if (!purchased) {
                _this4._dataManager.unlockRelicExtra(ext.id);
              }

              _this4._refreshCurrentTab();
            }, 180 - i * 40);

            _this4._contentItems.push(node);
          };

          for (var i = 0; i < extras.length; i++) {
            _loop4();
          }
        } // ======== 通用商店项 ========


        _createShopItem(name, desc, owned, cost, onAction, yPos) {
          var node = new Node("item_" + name);
          node.setPosition(0, yPos, 0);

          this._contentRoot.addChild(node);

          node.addComponent(UITransform).setContentSize(420, 35); // 名称

          var nameNode = new Node('name');
          nameNode.setPosition(-160, 0, 0);
          node.addChild(nameNode);
          var nameLabel = nameNode.addComponent(Label);
          nameLabel.string = name;
          nameLabel.fontSize = 14;
          nameLabel.color = Color.WHITE; // 描述

          var descNode = new Node('desc');
          descNode.setPosition(10, 0, 0);
          node.addChild(descNode);
          var descLabel = descNode.addComponent(Label);
          descLabel.string = desc;
          descLabel.fontSize = 13;
          descLabel.color = new Color(180, 180, 180); // 状态/按钮

          var actionNode = new Node('action');
          actionNode.setPosition(170, 0, 0);
          node.addChild(actionNode);
          var actionLabel = actionNode.addComponent(Label);
          actionLabel.fontSize = 12;

          if (owned) {
            actionLabel.string = this._dataManager.selectedCharacter === name || this._dataManager.selectedTalent === name ? (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.shopActionOwned') : (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.shopActionSelect');
            actionLabel.color = new Color(0, 200, 0);

            if (onAction) {
              actionNode.on(Node.EventType.TOUCH_END, onAction);
            }
          } else {
            var canAfford = this._dataManager.soulStones >= cost;
            actionLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.shopCost', {
              cost
            });
            actionLabel.color = canAfford ? new Color(255, 215, 0) : Color.RED;

            if (onAction && canAfford) {
              actionNode.on(Node.EventType.TOUCH_END, onAction);
            }
          } // 分隔线


          var lineNode = new Node('line');
          lineNode.setPosition(0, -18, 0);
          node.addChild(lineNode);
          var lineLabel = lineNode.addComponent(Label);
          lineLabel.string = '───';
          lineLabel.fontSize = 12;
          lineLabel.color = new Color(60, 60, 60);
          return node;
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e1df50cde28b44d5039e3e33c85c9d03fa0fdbab.js.map