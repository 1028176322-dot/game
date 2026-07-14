System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, instantiate, Node, Prefab, Sprite, UITransform, Vec3, GameConfig, TerrainType, RunRng, RenderAssetService, TileAssetService, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, GridManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTerrainType(extras) {
    _reporterNs.report("TerrainType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "../core/rng/RunRng", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRenderAssetService(extras) {
    _reporterNs.report("RenderAssetService", "../assets/RenderAssetService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileAssetService(extras) {
    _reporterNs.report("TileAssetService", "../render/TileAssetService", _context.meta, extras);
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
      instantiate = _cc.instantiate;
      Node = _cc.Node;
      Prefab = _cc.Prefab;
      Sprite = _cc.Sprite;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      TerrainType = _unresolved_3.TerrainType;
    }, function (_unresolved_4) {
      RunRng = _unresolved_4.RunRng;
    }, function (_unresolved_5) {
      RenderAssetService = _unresolved_5.RenderAssetService;
    }, function (_unresolved_6) {
      TileAssetService = _unresolved_6.TileAssetService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "41807NuBDtEpKlVAKTHDorM", "GridManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'instantiate', 'Node', 'Prefab', 'Sprite', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      /**
       * @deprecated GridManager is a legacy shell. `isWalkable` semantics are preserved;
       * tile rendering/generation now delegate to the new TileMap / NavigationGrid (§3.7).
       * Live delegation to the new classes is pending runtime verification (P1-6).
       */
      _export("GridManager", GridManager = (_dec = ccclass('GridManager'), _dec2 = property(Prefab), _dec(_class = (_class2 = class GridManager extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "tilePrefab", _descriptor, this);

          this._grid = [];
          this._tileSize = (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).TILE_SIZE;
          this._gridSize = (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).GRID_SIZE;
          this._zoneId = 'forest';
          this._tileContainer = null;
        }

        /** 设置瓦片渲染父节点（TileLayer），不设则挂到 this.node */
        setTileContainer(container) {
          this._tileContainer = container;
        }

        onLoad() {
          this._initGrid();
        }

        _initGrid() {
          for (var y = 0; y < this._gridSize; y++) {
            this._grid[y] = [];

            for (var x = 0; x < this._gridSize; x++) {
              var cell = this._createCell(x, y);

              this._grid[y][x] = cell;
            }
          }
        }

        _createCell(x, y) {
          var terrain = this._getDefaultTerrain(x, y);

          var cell = {
            x,
            y,
            terrain,
            walkable: terrain !== (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Wall && terrain !== (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Water,
            occupied: false,
            node: null
          };

          var tileNode = this._renderTile(cell);

          if (tileNode) {
            var _this$_tileContainer;

            cell.node = tileNode;
            tileNode.setPosition(this.gridToWorld(x, y));
            ((_this$_tileContainer = this._tileContainer) != null ? _this$_tileContainer : this.node).addChild(tileNode);
          }

          return cell;
        }

        _renderTile(cell) {
          var _tileNode;

          var tileNode = null;

          if (this.tilePrefab) {
            tileNode = instantiate(this.tilePrefab);
          } else {
            var _cell$terrain$toLower, _cell$terrain;

            tileNode = new Node("tile_" + cell.x + "_" + cell.y);
            tileNode.addComponent(UITransform);
            tileNode.addComponent(Sprite); // Try semantic key first, fallback to direct path

            var terrainName = (_cell$terrain$toLower = (_cell$terrain = (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType)[cell.terrain]) == null ? void 0 : _cell$terrain.toLowerCase()) != null ? _cell$terrain$toLower : 'floor';
            var tileKey = "tile." + this._zoneId + "." + terrainName;
            (_crd && TileAssetService === void 0 ? (_reportPossibleCrUseOfTileAssetService({
              error: Error()
            }), TileAssetService) : TileAssetService).instance.getTileAssetId(tileKey).then(assetId => {
              if (assetId) {
                (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
                  error: Error()
                }), RenderAssetService) : RenderAssetService).applySpriteById(tileNode, assetId);
              } else {
                (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
                  error: Error()
                }), RenderAssetService) : RenderAssetService).applyTileSprite(tileNode, this._zoneId, cell.terrain);
              }
            });
          }

          var transform = (_tileNode = tileNode) == null ? void 0 : _tileNode.getComponent(UITransform);

          if (transform) {
            transform.setContentSize(this._tileSize, this._tileSize);
          }

          return tileNode;
        }

        _getDefaultTerrain(x, y) {
          if (x === 0 || x === this._gridSize - 1 || y === 0 || y === this._gridSize - 1) {
            return (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Wall;
          }

          var gridRng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.fork("grid:terrain:" + x + ":" + y);
          var rand = gridRng.next();
          if (rand < 0.6) return (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
            error: Error()
          }), TerrainType) : TerrainType).Floor;
          if (rand < 0.75) return (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
            error: Error()
          }), TerrainType) : TerrainType).Grass;
          if (rand < 0.85) return (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
            error: Error()
          }), TerrainType) : TerrainType).Stone;
          if (rand < 0.92) return (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
            error: Error()
          }), TerrainType) : TerrainType).Water;
          return (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
            error: Error()
          }), TerrainType) : TerrainType).Floor;
        }

        gridToWorld(gx, gy) {
          return new Vec3((gx - (this._gridSize - 1) / 2) * this._tileSize, ((this._gridSize - 1) / 2 - gy) * this._tileSize, 0);
        }

        worldToGrid(worldPos) {
          var gx = Math.round(worldPos.x / this._tileSize + (this._gridSize - 1) / 2);
          var gy = Math.round((this._gridSize - 1) / 2 - worldPos.y / this._tileSize);
          if (gx < 0 || gx >= this._gridSize || gy < 0 || gy >= this._gridSize) return null;
          return {
            x: gx,
            y: gy
          };
        }

        isWalkable(x, y) {
          if (x < 0 || x >= this._gridSize || y < 0 || y >= this._gridSize) return false;
          var cell = this._grid[y][x];
          return cell.walkable && !cell.occupied;
        }

        setOccupied(x, y, occupied) {
          if (x >= 0 && x < this._gridSize && y >= 0 && y < this._gridSize) {
            this._grid[y][x].occupied = occupied;
          }
        }

        setZone(zoneId) {
          this._zoneId = zoneId || 'forest';
        }

        isOccupied(x, y) {
          var _this$_grid$y$x$occup, _this$_grid$y$x;

          if (x < 0 || x >= this._gridSize || y < 0 || y >= this._gridSize) return true;
          return (_this$_grid$y$x$occup = (_this$_grid$y$x = this._grid[y][x]) == null ? void 0 : _this$_grid$y$x.occupied) != null ? _this$_grid$y$x$occup : true;
        }

        generateWithSeed(seed) {
          for (var y = 0; y < this._gridSize; y++) {
            for (var x = 0; x < this._gridSize; x++) {
              var _this$_grid$y;

              (_this$_grid$y = this._grid[y]) == null || (_this$_grid$y = _this$_grid$y[x]) == null || (_this$_grid$y = _this$_grid$y.node) == null || _this$_grid$y.destroy();
            }
          }

          this._grid = [];

          this._initGrid();
        }

        getTerrain(x, y) {
          if (x < 0 || x >= this._gridSize || y < 0 || y >= this._gridSize) return (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
            error: Error()
          }), TerrainType) : TerrainType).Wall;
          return this._grid[y][x].terrain;
        }

        get gridSize() {
          return this._gridSize;
        }

        get tileSize() {
          return this._tileSize;
        }

        get grid() {
          return this._grid;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "tilePrefab", [_dec2], {
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
//# sourceMappingURL=bc4a1064fb732a14b1037dabd143e6fc4b5665b3.js.map