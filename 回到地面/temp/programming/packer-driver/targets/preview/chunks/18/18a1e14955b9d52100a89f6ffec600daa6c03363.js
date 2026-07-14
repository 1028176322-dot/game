System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Sprite, UISkinService, _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, menu, UISkinBinder;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfUISkinService(extras) {
    _reporterNs.report("UISkinService", "./UISkinService", _context.meta, extras);
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
      Sprite = _cc.Sprite;
    }, function (_unresolved_2) {
      UISkinService = _unresolved_2.UISkinService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3edcfnT5IdDxLz9zvVuuujS", "UISkinBinder", undefined);
      /**
       * UISkinBinder - UI 皮肤绑定组件
       *
       * 挂载在需要换图的节点上，在编辑器中配置 assetKey。
       * onLoad 时自动通过 UISkinService 加载对应皮肤。
       *
       * 编辑器用法:
       *   1. 在节点上添加 Component → UISkinBinder
       *   2. 填写 assetKey 属性（如 "ui.main.start_button"）
       *   3. 需要 Sprinted 效果的可直接挂 Sprite 组件，
       *      没有 Sprite 组件的 UISkinBinder 会自动添加。
       *
       * 运行时也可通过 refresh() 手动触发重新加载。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Sprite']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("UISkinBinder", UISkinBinder = (_dec = ccclass('UISkinBinder'), _dec2 = menu('UI/UISkinBinder'), _dec(_class = _dec2(_class = (_class2 = class UISkinBinder extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "assetKey", _descriptor, this);

          /** 是否在 onLoad 时自动加载（场景中已存在的节点建议 true） */
          _initializerDefineProperty(this, "autoLoad", _descriptor2, this);

          /** debug 模式：加载失败时打印更多信息 */
          _initializerDefineProperty(this, "debug", _descriptor3, this);
        }

        onLoad() {
          if (!this.autoLoad) return; // 延迟一帧确保 Sprite 组件已就绪

          this.scheduleOnce(() => this.refresh(), 0);
        }

        onEnable() {// 如果节点被重复启用，确保皮肤重新应用
          // 但避免在 onLoad 之后重复加载
        }
        /**
         * 手动刷新皮肤（可按需调用）
         */


        refresh() {
          var _this = this;

          return _asyncToGenerator(function* () {
            if (!_this.assetKey) {
              if (_this.debug) {
                console.warn("[UISkinBinder] " + _this.node.name + ": assetKey is empty");
              }

              return false;
            } // 确保有 Sprite 组件


            _this._ensureSprite();

            var ok = yield (_crd && UISkinService === void 0 ? (_reportPossibleCrUseOfUISkinService({
              error: Error()
            }), UISkinService) : UISkinService).instance.apply(_this.node, _this.assetKey);

            if (!ok && _this.debug) {
              console.warn("[UISkinBinder] " + _this.node.name + ": apply failed for key=" + _this.assetKey);
            }

            return ok;
          })();
        }
        /**
         * 设置新的 assetKey 并重新加载
         */


        setKey(key) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            _this2.assetKey = key;
            return _this2.refresh();
          })();
        }

        _ensureSprite() {
          if (!this.node.getComponent(Sprite)) {
            this.node.addComponent(Sprite);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "assetKey", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "autoLoad", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return true;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "debug", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return false;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=18a1e14955b9d52100a89f6ffec600daa6c03363.js.map