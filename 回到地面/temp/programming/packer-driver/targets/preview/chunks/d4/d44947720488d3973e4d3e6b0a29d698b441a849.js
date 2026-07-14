System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Color, instantiate, Sprite, RuntimeEntityFactory, MonsterController, MonsterRuntimeView, MonsterRuntimeFactory, _crd;

  function _reportPossibleCrUseOfRuntimeEntityFactory(extras) {
    _reporterNs.report("RuntimeEntityFactory", "../runtime/RuntimeEntityFactory", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterController(extras) {
    _reporterNs.report("MonsterController", "./MonsterController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterRuntimeView(extras) {
    _reporterNs.report("MonsterRuntimeView", "./MonsterRuntimeView", _context.meta, extras);
  }

  _export("MonsterRuntimeFactory", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Color = _cc.Color;
      instantiate = _cc.instantiate;
      Sprite = _cc.Sprite;
    }, function (_unresolved_2) {
      RuntimeEntityFactory = _unresolved_2.RuntimeEntityFactory;
    }, function (_unresolved_3) {
      MonsterController = _unresolved_3.MonsterController;
    }, function (_unresolved_4) {
      MonsterRuntimeView = _unresolved_4.MonsterRuntimeView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1569ehr4XNEQbk+VBP/AeIi", "MonsterRuntimeFactory", undefined);

      __checkObsolete__(['Color', 'instantiate', 'Node', 'Prefab', 'Sprite']);

      _export("MonsterRuntimeFactory", MonsterRuntimeFactory = class MonsterRuntimeFactory {
        static create(name, prefab) {
          var _created$body, _created$hpBar, _ref, _created$hpFill, _created$slots$Effect, _created$shadow, _root$getComponent, _root$getComponent2, _body$getComponent;

          if (prefab === void 0) {
            prefab = null;
          }

          var created = prefab ? null : (_crd && RuntimeEntityFactory === void 0 ? (_reportPossibleCrUseOfRuntimeEntityFactory({
            error: Error()
          }), RuntimeEntityFactory) : RuntimeEntityFactory).create({
            name,
            width: 96,
            height: 96,
            body: {
              name: 'Body',
              width: 96,
              height: 96
            },
            hpBar: {
              enabled: true,
              width: 84,
              height: 12,
              y: 58
            },
            shadow: {
              enabled: true,
              width: 70,
              height: 20,
              y: -42
            },
            slots: [{
              name: 'EffectSocket',
              width: 1,
              height: 1
            }]
          });
          var root = prefab ? instantiate(prefab) : created.root;
          root.name = name;
          var body = (_created$body = created == null ? void 0 : created.body) != null ? _created$body : (_crd && RuntimeEntityFactory === void 0 ? (_reportPossibleCrUseOfRuntimeEntityFactory({
            error: Error()
          }), RuntimeEntityFactory) : RuntimeEntityFactory).ensureSpriteChild(root, 'Body', 96, 96);
          var hpBar = (_created$hpBar = created == null ? void 0 : created.hpBar) != null ? _created$hpBar : (_crd && RuntimeEntityFactory === void 0 ? (_reportPossibleCrUseOfRuntimeEntityFactory({
            error: Error()
          }), RuntimeEntityFactory) : RuntimeEntityFactory).createHPBar(root, 84, 12);
          hpBar.setPosition(0, 58, 0);
          var hpFill = (_ref = (_created$hpFill = created == null ? void 0 : created.hpFill) != null ? _created$hpFill : hpBar.getChildByName('BarFill')) != null ? _ref : undefined;
          var effectSocket = (_created$slots$Effect = created == null ? void 0 : created.slots.EffectSocket) != null ? _created$slots$Effect : (_crd && RuntimeEntityFactory === void 0 ? (_reportPossibleCrUseOfRuntimeEntityFactory({
            error: Error()
          }), RuntimeEntityFactory) : RuntimeEntityFactory).ensureChild(root, 'EffectSocket', 1, 1);
          var shadow = (_created$shadow = created == null ? void 0 : created.shadow) != null ? _created$shadow : (_crd && RuntimeEntityFactory === void 0 ? (_reportPossibleCrUseOfRuntimeEntityFactory({
            error: Error()
          }), RuntimeEntityFactory) : RuntimeEntityFactory).ensureChild(root, 'Shadow', 70, 20);

          if (!(created != null && created.shadow)) {
            shadow.setPosition(0, -42, 0);
            (_crd && RuntimeEntityFactory === void 0 ? (_reportPossibleCrUseOfRuntimeEntityFactory({
              error: Error()
            }), RuntimeEntityFactory) : RuntimeEntityFactory).drawEllipse(shadow, 70, 20, new Color(0, 0, 0, 80));
          }

          var controller = (_root$getComponent = root.getComponent(_crd && MonsterController === void 0 ? (_reportPossibleCrUseOfMonsterController({
            error: Error()
          }), MonsterController) : MonsterController)) != null ? _root$getComponent : root.addComponent(_crd && MonsterController === void 0 ? (_reportPossibleCrUseOfMonsterController({
            error: Error()
          }), MonsterController) : MonsterController);
          var view = (_root$getComponent2 = root.getComponent(_crd && MonsterRuntimeView === void 0 ? (_reportPossibleCrUseOfMonsterRuntimeView({
            error: Error()
          }), MonsterRuntimeView) : MonsterRuntimeView)) != null ? _root$getComponent2 : root.addComponent(_crd && MonsterRuntimeView === void 0 ? (_reportPossibleCrUseOfMonsterRuntimeView({
            error: Error()
          }), MonsterRuntimeView) : MonsterRuntimeView);
          var bodySprite = (_body$getComponent = body.getComponent(Sprite)) != null ? _body$getComponent : body.addComponent(Sprite);
          view.initRefs(bodySprite, hpBar, hpFill != null ? hpFill : hpBar, effectSocket, shadow);
          return {
            root,
            body,
            effectSocket,
            controller,
            view
          };
        }

        static getBodyNode(root) {
          var _root$getChildByName;

          return (_root$getChildByName = root.getChildByName('Body')) != null ? _root$getChildByName : root;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d44947720488d3973e4d3e6b0a29d698b441a849.js.map