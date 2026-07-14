System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Vec3, Camera, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, WorldSpaceUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Vec3 = _cc.Vec3;
      Camera = _cc.Camera;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1fff3y8Xp9CmKM44wItDMf1", "WorldSpaceUI", undefined); // assets/scripts/ui/world/WorldSpaceUI.ts — P3-1 (audit §5 dungeon.scene step 5).
      // Hosts a world-space UI container that follows a 3D target and billboards to
      // the main camera, so damage numbers / health bars can live in the 3D world.
      // Mount under the dungeon scene's world-space UI canvas. The canvas render-mode
      // change and node placement are done in the Cocos Creator editor (the .scene
      // wiring cannot be verified in the sandbox).


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'Camera']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("WorldSpaceUI", WorldSpaceUI = (_dec = ccclass('WorldSpaceUI'), _dec2 = property({
        type: Node
      }), _dec3 = property(Vec3), _dec(_class = (_class2 = class WorldSpaceUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "target", _descriptor, this);

          _initializerDefineProperty(this, "offset", _descriptor2, this);

          _initializerDefineProperty(this, "billboard", _descriptor3, this);

          _initializerDefineProperty(this, "followEnabled", _descriptor4, this);
        }

        update(dt) {
          if (!this.followEnabled || !this.target) return;
          const wp = this.target.worldPosition;
          this.node.setWorldPosition(wp.x + this.offset.x, wp.y + this.offset.y, wp.z + this.offset.z);

          if (this.billboard) {
            const cam = Camera.main;

            if (cam) {
              // Match the camera orientation so the UI plane faces the viewer.
              this.node.setWorldRotation(cam.node.worldRotation);
            }
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "target", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "offset", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return new Vec3(0, 1, 0);
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "billboard", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "followEnabled", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return true;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3149ac3a47a934ccb111bb08ba2d897355057be3.js.map