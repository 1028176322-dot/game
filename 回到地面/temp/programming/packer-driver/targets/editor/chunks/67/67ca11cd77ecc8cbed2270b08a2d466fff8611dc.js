System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Label, T, _dec, _dec2, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, requireComponent, LocalizedLabel;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

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
      Label = _cc.Label;
    }, function (_unresolved_2) {
      T = _unresolved_2.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ea7929fdMtIpoIm/qH96Rem", "LocalizedLabel", undefined);
      /**
       * LocalizedLabel - 多语言文本 Label 组件
       *
       * 用法（编辑器）：
       *   给已有 Label 的节点添加此组件
       *   填写 textKey = "ui.mainStart"
       *   运行时自动从 text.json 取值
       *
       * 用法（代码）：
       *   直接调用 T(key, params) 函数
       *
       * 优势：
       *   所有玩家可见文本集中在 text.json
       *   改文案不需改场景/脚本
       *   审核查敏感词只需搜 text.json
       *   后续多语言只需替换 text.json
       */


      __checkObsolete__(['_decorator', 'Component', 'Label']);

      ({
        ccclass,
        property,
        requireComponent
      } = _decorator);

      _export("LocalizedLabel", LocalizedLabel = (_dec = ccclass('LocalizedLabel'), _dec2 = requireComponent(Label), _dec(_class = _dec2(_class = (_class2 = class LocalizedLabel extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "textKey", _descriptor, this);

          _initializerDefineProperty(this, "fallback", _descriptor2, this);
        }

        onLoad() {
          this.refresh();
        }

        onEnable() {
          // Retry text resolution if the initial onLoad happened before text config was loaded.
          // This handles the race condition where splash-screen LocalizedLabels fire before
          // GameBootstrap finishes loading text.json.
          if (this.textKey) {
            const label = this.getComponent(Label);

            if (label && label.string === this.textKey) {
              this.scheduleOnce(() => this.refresh(), 0);
            }
          }
        }
        /**
         * 从 text.json 刷新文本
         * @param params 模板变量 {key: value}
         */


        refresh(params) {
          const label = this.getComponent(Label);
          if (!label) return;
          label.string = this.textKey ? (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)(this.textKey, params) : this.fallback;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "textKey", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fallback", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return '';
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=67ca11cd77ecc8cbed2270b08a2d466fff8611dc.js.map