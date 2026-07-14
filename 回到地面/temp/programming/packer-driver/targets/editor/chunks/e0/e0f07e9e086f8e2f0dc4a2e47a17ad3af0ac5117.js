System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Sprite, Label, Color, instantiate, Prefab, RoomType, eventBus, PlayerDataManager, T, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, DungeonMapUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfRoomType(extras) {
    _reporterNs.report("RoomType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomNode(extras) {
    _reporterNs.report("RoomNode", "../dungeon/DAGGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonDAG(extras) {
    _reporterNs.report("DungeonDAG", "../dungeon/DAGGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../core/PlayerDataManager", _context.meta, extras);
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
      Sprite = _cc.Sprite;
      Label = _cc.Label;
      Color = _cc.Color;
      instantiate = _cc.instantiate;
      Prefab = _cc.Prefab;
    }, function (_unresolved_2) {
      RoomType = _unresolved_2.RoomType;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }, function (_unresolved_4) {
      PlayerDataManager = _unresolved_4.PlayerDataManager;
    }, function (_unresolved_5) {
      T = _unresolved_5.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3360dbf9FJA8KQjBW77ethC", "DungeonMapUI", undefined);
      /**
       * DungeonMapUI - 地牢地图 UI
       * 显示 DAG 可视化：房间节点 + 连接线
       * 标记当前房间、已清理房间、可选方向
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Sprite', 'Label', 'Color', 'instantiate', 'Prefab']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("DungeonMapUI", DungeonMapUI = (_dec = ccclass('DungeonMapUI'), _dec2 = property(Prefab), _dec3 = property(Node), _dec4 = property(Sprite), _dec(_class = (_class2 = class DungeonMapUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "roomNodePrefab", _descriptor, this);

          // 房间节点预制体
          _initializerDefineProperty(this, "mapContainer", _descriptor2, this);

          // 地图容器
          _initializerDefineProperty(this, "lineSprite", _descriptor3, this);

          // 连接线精灵
          this._dag = null;
          this._currentRoomId = -1;
          this._nodeMap = new Map();
          this._roomColors = {
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Normal]: new Color(180, 180, 180),
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Elite]: new Color(200, 100, 50),
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Boss]: new Color(200, 30, 30),
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Treasure]: new Color(255, 215, 0),
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Healing]: new Color(50, 200, 100),
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Shop]: new Color(100, 150, 255),
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Upgrade]: new Color(180, 100, 255),
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Event]: new Color(200, 180, 100),
            [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Rest]: new Color(150, 200, 200)
          };
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('dungeon:floor_generated', this._onFloorGenerated, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('room:entered', this._onRoomEntered, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('battle:victory', this._onRoomCleared, this);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

        _onFloorGenerated(floorNumber, seed, dag) {
          this._dag = dag;
          this._currentRoomId = dag.entryRoomId;

          this._renderMap(dag);
        }

        _onRoomEntered(room) {
          this._currentRoomId = room.id;

          this._updateNodeHighlight(room.id);
        }

        _onRoomCleared() {
          // 当前房间标记为已清除
          this._markRoomCleared(this._currentRoomId);
        }
        /** 渲染 DAG 地图 */


        _renderMap(dag) {
          var _this$mapContainer;

          // 清除旧节点
          (_this$mapContainer = this.mapContainer) == null || _this$mapContainer.removeAllChildren();

          this._nodeMap.clear();

          if (!this.mapContainer) return;
          const roomWidth = 64;
          const roomHeight = 48;
          const marginX = 80;
          const marginY = 60; // 探索者天赋: 显示提示

          const pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          const isExplorer = pdm.selectedTalent === 'explorer';

          if (isExplorer) {
            const labelNode = new Node('explorer_hint');
            labelNode.setPosition(0, 120, 0);
            this.mapContainer.addChild(labelNode);
            const hint = labelNode.addComponent(Label);
            hint.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.mapExplore');
            hint.fontSize = 12;
            hint.color = new Color(100, 200, 255);
          } // 按深度分组


          const depthMap = new Map();

          for (const [, room] of dag.rooms) {
            if (!depthMap.has(room.depth)) {
              depthMap.set(room.depth, []);
            }

            depthMap.get(room.depth).push(room);
          } // 渲染每个房间节点


          for (const [depth, rooms] of depthMap) {
            const nodeX = marginX + depth * (roomWidth + 10);
            const roomsAtDepth = rooms.length;

            for (let i = 0; i < roomsAtDepth; i++) {
              const room = rooms[i];
              const nodeY = marginY + (roomsAtDepth > 1 && i === 1 ? roomHeight + 8 : 0);

              const node = this._createRoomNode(room, nodeX, nodeY, roomWidth, roomHeight);

              this.mapContainer.addChild(node);

              this._nodeMap.set(room.id, node);
            }
          } // 渲染连接线（简化：在节点间画斜线）
          // （实际项目中用画线组件或 Sprite 拉伸实现）

        }

        _createRoomNode(room, x, y, w, h) {
          let node;

          if (this.roomNodePrefab) {
            node = instantiate(this.roomNodePrefab);
          } else {
            node = new Node(`room_${room.id}`);
            const sprite = node.addComponent(Sprite);
          }

          node.setPosition(x, y);
          const sprite = node.getComponent(Sprite);

          if (sprite) {
            const color = this._roomColors[room.type] || new Color(180, 180, 180);
            sprite.color = color;
          } // 标签


          const label = node.getComponentInChildren(Label);

          if (label) {
            label.string = this._getRoomShortName(room.type);
          } // 当前房间高亮


          if (room.id === this._currentRoomId) {
            this._highlightNode(node);
          }

          return node;
        }

        _getRoomShortName(type) {
          switch (type) {
            case (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Normal:
              return '战';

            case (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Elite:
              return '精';

            case (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Boss:
              return 'B';

            case (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Treasure:
              return '宝';

            case (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Healing:
              return '回';

            case (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Shop:
              return '商';

            case (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Upgrade:
              return '强';

            case (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Event:
              return '?';

            default:
              return '';
          }
        }

        _highlightNode(node) {
          const sprite = node.getComponent(Sprite);

          if (sprite) {
            sprite.color = Color.WHITE;
          }

          const scale = 1.3;
          node.setScale(scale, scale, 1);
        }

        _updateNodeHighlight(roomId) {
          // 取消旧高亮
          for (const [, node] of this._nodeMap) {
            node.setScale(1, 1, 1);
          } // 新高亮


          const currentNode = this._nodeMap.get(roomId);

          if (currentNode) {
            this._highlightNode(currentNode);
          }
        }

        _markRoomCleared(roomId) {
          const node = this._nodeMap.get(roomId);

          if (node) {
            const sprite = node.getComponent(Sprite);

            if (sprite) {
              // 变淡表示已清理
              const col = sprite.color.clone();
              col.a = 150;
              sprite.color = col;
            }
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "roomNodePrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "mapContainer", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "lineSprite", [_dec4], {
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
//# sourceMappingURL=e0f07e9e086f8e2f0dc4a2e47a17ad3af0ac5117.js.map