System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Node, _dec, _class, _class2, _crd, ccclass, LayerType, LAYER_NAMES, ACTOR_BASE_INDEX, TILE_SIZE, RuntimeLayerService;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Node = _cc.Node;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5c8bcM+sopBI4GH0WAt3uUJ", "RuntimeLayerService", undefined);
      /**
       * RuntimeLayerService - Standardized dungeon render layer management
       *
       * Manages the 5-layer rendering stack for dungeon scenes:
       *   Background(0) -> Tile(1) -> Actor(2) -> Effect(3) -> Door(4)
       *
       * Enforces:
       *   - Fixed sibling index order
       *   - Dynamic Y-axis sorting within ActorLayer
       *   - Systems nodes contain only logic components (no renderable objects)
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Sprite', 'Graphics', 'Vec3']);

      ({
        ccclass
      } = _decorator);

      _export("LayerType", LayerType = /*#__PURE__*/function (LayerType) {
        LayerType[LayerType["Background"] = 0] = "Background";
        LayerType[LayerType["Tile"] = 1] = "Tile";
        LayerType[LayerType["Actor"] = 2] = "Actor";
        LayerType[LayerType["Effect"] = 3] = "Effect";
        LayerType[LayerType["Door"] = 4] = "Door";
        return LayerType;
      }({}));

      LAYER_NAMES = {
        [LayerType.Background]: 'BackgroundLayer',
        [LayerType.Tile]: 'TileLayer',
        [LayerType.Actor]: 'ActorLayer',
        [LayerType.Effect]: 'EffectLayer',
        [LayerType.Door]: 'DoorLayer'
      };
      ACTOR_BASE_INDEX = 100;
      TILE_SIZE = 96;

      _export("RuntimeLayerService", RuntimeLayerService = (_dec = ccclass('RuntimeLayerService'), _dec(_class = (_class2 = class RuntimeLayerService {
        constructor() {
          this._root = null;
          this._layers = new Map();
          this._initialized = false;
        }

        static get instance() {
          if (!this._instance) this._instance = new RuntimeLayerService();
          return this._instance;
        }
        /** Initialize the 5 render layers under the given root node */


        ensureLayers(root) {
          if (this._initialized && this._root === root) return;
          this._root = root;

          this._layers.clear();

          for (var t = LayerType.Background; t <= LayerType.Door; t++) {
            var name = LAYER_NAMES[t];
            var layer = root.getChildByName(name);

            if (!layer) {
              layer = new Node(name);
              root.addChild(layer);
            }

            layer.setSiblingIndex(t);

            this._layers.set(t, layer);
          }

          this._initialized = true;
          console.log('[RuntimeLayer] 5 render layers initialized');
        }
        /** Get a specific layer node */


        getLayer(type) {
          var _this$_layers$get;

          return (_this$_layers$get = this._layers.get(type)) != null ? _this$_layers$get : null;
        }
        /** Add a node to a render layer with optional Y-axis sort */


        addToLayer(node, type, yPos) {
          var layer = this._layers.get(type);

          if (!layer) {
            console.warn("[RuntimeLayer] layer not found: " + type);
            return;
          }

          layer.addChild(node); // Y-axis sort: lower Y = lower sibling index (drawn first = behind)

          if (type === LayerType.Actor && yPos !== undefined) {
            var sortIndex = ACTOR_BASE_INDEX + Math.floor(yPos / TILE_SIZE);
            node.setSiblingIndex(sortIndex);
          }
        }
        /** Calculate sort index for a grid Y position */


        getSortOrder(gridY) {
          return ACTOR_BASE_INDEX + Math.floor(gridY);
        }
        /** Update a node's sort order based on its world position (call each frame for moving entities) */


        updateSortOrder(node) {
          // Only applies to Actor layer
          var parent = node.parent;
          if (!parent || parent.name !== LAYER_NAMES[LayerType.Actor]) return;
          var worldPos = node.worldPosition;
          var sortIndex = ACTOR_BASE_INDEX + Math.floor(worldPos.y / TILE_SIZE);
          node.setSiblingIndex(sortIndex);
        }
        /** Remove all children from all layers */


        clearAll() {
          for (var [, layer] of this._layers) {
            layer.removeAllChildren();
          }
        }
        /** Clear a specific layer */


        clearLayer(type) {
          var layer = this._layers.get(type);

          if (layer) layer.removeAllChildren();
        }
        /** Check if layers are initialized */


        get isInitialized() {
          return this._initialized;
        }

      }, _class2._instance = null, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=71568a6887c8a0cda7df12695f0477adee3a2cdc.js.map