System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Node, NodeRef, _crd;

  _export("NodeRef", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Node = _cc.Node;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1ecf1w8EdZPM5/TL9z1O5FR", "NodeRef", undefined);

      __checkObsolete__(['Component', 'Node']);

      _export("NodeRef", NodeRef = class NodeRef {
        static node(ref) {
          if (!ref) return null;
          if (ref instanceof Node) return ref;
          var maybeNode = ref.node;
          return maybeNode instanceof Node ? maybeNode : null;
        }

        static component(ref, type, fallbackRoot, fallbackPath) {
          var _this$node, _node$getComponent;

          var node = (_this$node = this.node(ref)) != null ? _this$node : this.find(fallbackRoot, fallbackPath);
          return (_node$getComponent = node == null ? void 0 : node.getComponent(type)) != null ? _node$getComponent : null;
        }

        static childComponent(ref, type, fallbackRoot, fallbackPath) {
          var _this$node2, _node$getComponentInC;

          var node = (_this$node2 = this.node(ref)) != null ? _this$node2 : this.find(fallbackRoot, fallbackPath);
          return (_node$getComponentInC = node == null ? void 0 : node.getComponentInChildren(type)) != null ? _node$getComponentInC : null;
        }

        static find(root, path) {
          if (!root || !path) return null;
          var current = root;

          for (var part of path.split('/')) {
            var _current$getChildByNa, _current;

            if (!part || part === '.') continue;
            current = (_current$getChildByNa = (_current = current) == null ? void 0 : _current.getChildByName(part)) != null ? _current$getChildByNa : null;
            if (!current) return null;
          }

          return current;
        }

        static requiredNode(ref, owner, field) {
          var node = this.node(ref);

          if (!node) {
            console.warn("[NodeRef] " + owner + "." + field + " is not bound or is invalid");
          }

          return node;
        }

        static requiredComponent(ref, type, owner, field, fallbackRoot, fallbackPath) {
          var comp = this.component(ref, type, fallbackRoot, fallbackPath);

          if (!comp) {
            console.warn("[NodeRef] " + owner + "." + field + " missing component " + type.name);
          }

          return comp;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=04936b099c3221a66142ea7e8cee06dfbeeb88a9.js.map