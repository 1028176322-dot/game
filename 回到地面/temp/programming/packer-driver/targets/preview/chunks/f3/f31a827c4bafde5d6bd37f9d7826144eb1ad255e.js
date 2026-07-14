System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Sprite, UITransform, Vec3, resources, SpriteFrame, _dec, _class, _crd, ccclass, PartCharacterRenderer;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Sprite = _cc.Sprite;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
      resources = _cc.resources;
      SpriteFrame = _cc.SpriteFrame;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a89e52oXKdCD7LZ6ORrsnWm", "PartCharacterRenderer", undefined);
      /**
       * PartCharacterRenderer — Assemble a character from isolated part sprites.
       *
       * Loads character_parts.json + character_rigs.json and builds a node tree
       * where each part is a child Sprite. Parts are sorted by their rig z value.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Sprite', 'UITransform', 'Vec3', 'resources', 'SpriteFrame', 'JsonAsset']);

      ({
        ccclass
      } = _decorator);

      _export("PartCharacterRenderer", PartCharacterRenderer = (_dec = ccclass('PartCharacterRenderer'), _dec(_class = class PartCharacterRenderer extends Component {
        constructor() {
          super(...arguments);
          this._partNodes = new Map();
          this._rig = null;
          this._characterId = '';
        }

        setup(characterId, partsConfig, rig) {
          var _this = this;

          return _asyncToGenerator(function* () {
            _this._characterId = characterId;
            _this._rig = rig;

            var ui = _this.node.getComponent(UITransform) || _this.node.addComponent(UITransform);

            ui.setContentSize(rig.rootSize[0], rig.rootSize[1]); // Sort parts by z ascending so they render in correct order.

            var entries = Object.entries(rig.parts).sort((a, b) => a[1].z - b[1].z);

            for (var [partName, partRig] of entries) {
              var _partRig$scale$, _partRig$scale, _partRig$scale$2, _partRig$scale2, _partRig$anchor$, _partRig$anchor, _partRig$anchor$2, _partRig$anchor2;

              if (partName === 'shadow') {
                _this._createShadow(partName, partRig);

                continue;
              }

              var assetPath = partsConfig.parts[partName];

              if (!assetPath) {
                continue;
              }

              var partNode = new Node(partName);
              partNode.setParent(_this.node);
              partNode.setPosition(new Vec3(partRig.position[0], partRig.position[1], 0));
              partNode.setScale((_partRig$scale$ = (_partRig$scale = partRig.scale) == null ? void 0 : _partRig$scale[0]) != null ? _partRig$scale$ : 1, (_partRig$scale$2 = (_partRig$scale2 = partRig.scale) == null ? void 0 : _partRig$scale2[1]) != null ? _partRig$scale$2 : 1, 1);
              var partUi = partNode.addComponent(UITransform);
              partUi.setAnchorPoint((_partRig$anchor$ = (_partRig$anchor = partRig.anchor) == null ? void 0 : _partRig$anchor[0]) != null ? _partRig$anchor$ : 0.5, (_partRig$anchor$2 = (_partRig$anchor2 = partRig.anchor) == null ? void 0 : _partRig$anchor2[1]) != null ? _partRig$anchor$2 : 0.5);
              var sprite = partNode.addComponent(Sprite);
              var frame = yield _this._loadSpriteFrame(assetPath);

              if (frame) {
                sprite.spriteFrame = frame;
              } else {
                console.warn("[PartCharacterRenderer] failed to load part: " + assetPath);
              }

              _this._partNodes.set(partName, partNode);
            }
          })();
        }

        getCharacterId() {
          return this._characterId;
        }

        getPart(name) {
          return this._partNodes.get(name) || null;
        }

        getRig() {
          return this._rig;
        }

        resetToRig() {
          if (!this._rig) {
            return;
          }

          for (var [partName, partRig] of Object.entries(this._rig.parts)) {
            var _partRig$scale$3, _partRig$scale3, _partRig$scale$4, _partRig$scale4;

            var node = this._partNodes.get(partName);

            if (!node) {
              continue;
            }

            node.setPosition(partRig.position[0], partRig.position[1], 0);
            node.setRotationFromEuler(0, 0, 0);
            node.setScale((_partRig$scale$3 = (_partRig$scale3 = partRig.scale) == null ? void 0 : _partRig$scale3[0]) != null ? _partRig$scale$3 : 1, (_partRig$scale$4 = (_partRig$scale4 = partRig.scale) == null ? void 0 : _partRig$scale4[1]) != null ? _partRig$scale$4 : 1, 1);
          }
        }

        _loadSpriteFrame(path) {
          return new Promise(resolve => {
            var fullPath = path + "/spriteFrame";
            resources.load(fullPath, SpriteFrame, (err, frame) => {
              if (err || !frame) {
                console.warn("[PartCharacterRenderer] load failed: " + fullPath, err);
                resolve(null);
                return;
              }

              resolve(frame);
            });
          });
        }

        _createShadow(partName, rig) {
          var _rig$scale$, _rig$scale, _rig$scale$2, _rig$scale2;

          var node = new Node(partName);
          node.setParent(this.node);
          node.setPosition(rig.position[0], rig.position[1], 0);
          node.setScale((_rig$scale$ = (_rig$scale = rig.scale) == null ? void 0 : _rig$scale[0]) != null ? _rig$scale$ : 1, (_rig$scale$2 = (_rig$scale2 = rig.scale) == null ? void 0 : _rig$scale2[1]) != null ? _rig$scale$2 : 1, 1); // Shadow is intentionally a blank node in the prototype.
          // Replace with a Sprite loading a shadow texture when available.

          this._partNodes.set(partName, node);
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f31a827c4bafde5d6bd37f9d7826144eb1ad255e.js.map