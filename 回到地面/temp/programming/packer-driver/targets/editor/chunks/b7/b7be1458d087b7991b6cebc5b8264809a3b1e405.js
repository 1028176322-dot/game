System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Node, UITransform, SceneNodeFactory, _crd;

  _export("SceneNodeFactory", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Node = _cc.Node;
      UITransform = _cc.UITransform;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8d794M21Y1DgJ769BjbufYl", "SceneNodeFactory", undefined);

      __checkObsolete__(['Component', 'Node', 'UITransform']);

      _export("SceneNodeFactory", SceneNodeFactory = class SceneNodeFactory {
        static ensureChild(parent, name) {
          let child = parent.getChildByName(name);

          if (!child) {
            child = new Node(name);
            parent.addChild(child);
          }

          return child;
        }

        static ensureComponent(node, type) {
          let comp = node.getComponent(type);
          if (!comp) comp = node.addComponent(type);
          return comp;
        }

        static ensureTransform(node, width, height) {
          const transform = this.ensureComponent(node, UITransform);
          transform.setContentSize(width, height);
          return transform;
        }

        static findChildByName(root, name) {
          if (root.name === name) return root;

          for (const child of root.children) {
            const found = this.findChildByName(child, name);
            if (found) return found;
          }

          return null;
        }

        static findComponentInChildren(root, type) {
          const own = root.getComponent(type);
          if (own) return own;

          for (const child of root.children) {
            const found = this.findComponentInChildren(child, type);
            if (found) return found;
          }

          return null;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b7be1458d087b7991b6cebc5b8264809a3b1e405.js.map