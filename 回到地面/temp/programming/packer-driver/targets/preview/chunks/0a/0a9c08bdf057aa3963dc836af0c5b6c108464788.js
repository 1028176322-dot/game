System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, ModelComponent, SkinnedMeshRenderer, AssetBundleService, _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, ModelDisplay3D;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfAssetBundleService(extras) {
    _reporterNs.report("AssetBundleService", "../../assets/AssetBundleService", _context.meta, extras);
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
      ModelComponent = _cc.ModelComponent;
      SkinnedMeshRenderer = _cc.SkinnedMeshRenderer;
    }, function (_unresolved_2) {
      AssetBundleService = _unresolved_2.AssetBundleService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "47c4floYItJerNR9FYClo+D", "ModelDisplay3D", undefined); // assets/scripts/ui/main/ModelDisplay3D.ts — P2-4 (§2.4).
      // 3D character preview viewport for the main menu CreatePanel. Wraps a
      // ModelComponent + SkinnedMeshRenderer so a 3D model asset can be shown in the
      // PreviewZone. Attach this component to the PreviewZone/ModelDisplay node in the
      // Cocos Creator editor (the .scene wiring cannot be verified in the sandbox).


      __checkObsolete__(['_decorator', 'Component', 'ModelComponent', 'SkinnedMeshRenderer', 'Model']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("ModelDisplay3D", ModelDisplay3D = (_dec = ccclass('ModelDisplay3D'), _dec2 = property(ModelComponent), _dec(_class = (_class2 = class ModelDisplay3D extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "modelComp", _descriptor, this);

          _initializerDefineProperty(this, "modelAssetId", _descriptor2, this);
        }

        onLoad() {
          if (!this.modelComp) {
            var _this$getComponent;

            this.modelComp = (_this$getComponent = this.getComponent(ModelComponent)) != null ? _this$getComponent : this.addComponent(ModelComponent);
          }

          if (!this.getComponent(SkinnedMeshRenderer)) {
            this.addComponent(SkinnedMeshRenderer);
          }

          if (this.modelAssetId) {
            void this.showModel(this.modelAssetId);
          }
        }
        /** Load a 3D model asset by id and assign it to the ModelComponent. */


        showModel(assetId) {
          var _this = this;

          return _asyncToGenerator(function* () {
            var asset = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
              error: Error()
            }), AssetBundleService) : AssetBundleService).instance.tryLoadById(assetId);
            if (!asset || !_this.modelComp) return false;
            _this.modelComp.asset = asset;
            return true;
          })();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "modelComp", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "modelAssetId", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=0a9c08bdf057aa3963dc836af0c5b6c108464788.js.map