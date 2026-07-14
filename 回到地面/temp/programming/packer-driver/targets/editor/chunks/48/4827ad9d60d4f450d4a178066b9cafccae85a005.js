System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Color, Graphics, Node, Sprite, UITransform, RuntimeEntityFactory, _crd;

  _export("RuntimeEntityFactory", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Color = _cc.Color;
      Graphics = _cc.Graphics;
      Node = _cc.Node;
      Sprite = _cc.Sprite;
      UITransform = _cc.UITransform;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "978c52S1FVN6paEYqP+MppX", "RuntimeEntityFactory", undefined);

      __checkObsolete__(['Color', 'Graphics', 'Node', 'Sprite', 'UITransform']);

      _export("RuntimeEntityFactory", RuntimeEntityFactory = class RuntimeEntityFactory {
        static create(spec) {
          var _spec$width, _spec$height, _spec$body, _bodySpec$name, _ref, _bodySpec$width, _ref2, _bodySpec$height, _spec$hpBar, _spec$shadow;

          const root = new Node(spec.name);
          this.ensureTransform(root, (_spec$width = spec.width) != null ? _spec$width : 96, (_spec$height = spec.height) != null ? _spec$height : 96);
          const bodySpec = (_spec$body = spec.body) != null ? _spec$body : {};
          const body = this.ensureSpriteChild(root, (_bodySpec$name = bodySpec.name) != null ? _bodySpec$name : 'Body', (_ref = (_bodySpec$width = bodySpec.width) != null ? _bodySpec$width : spec.width) != null ? _ref : 96, (_ref2 = (_bodySpec$height = bodySpec.height) != null ? _bodySpec$height : spec.height) != null ? _ref2 : 96);
          const slots = {};

          for (const slot of (_spec$slots = spec.slots) != null ? _spec$slots : []) {
            var _spec$slots, _slot$width, _slot$height, _slot$x, _slot$y;

            const child = this.ensureChild(root, slot.name, (_slot$width = slot.width) != null ? _slot$width : 1, (_slot$height = slot.height) != null ? _slot$height : 1);
            child.setPosition((_slot$x = slot.x) != null ? _slot$x : 0, (_slot$y = slot.y) != null ? _slot$y : 0, 0);
            slots[slot.name] = child;
          }

          const nodes = {
            root,
            body,
            slots
          };

          if ((_spec$hpBar = spec.hpBar) != null && _spec$hpBar.enabled) {
            var _spec$hpBar$width, _spec$hpBar$height, _spec$hpBar$y, _hpBar$getChildByName;

            const hpBar = this.createHPBar(root, (_spec$hpBar$width = spec.hpBar.width) != null ? _spec$hpBar$width : 84, (_spec$hpBar$height = spec.hpBar.height) != null ? _spec$hpBar$height : 12);
            hpBar.setPosition(0, (_spec$hpBar$y = spec.hpBar.y) != null ? _spec$hpBar$y : 58, 0);
            nodes.hpBar = hpBar;
            nodes.hpFill = (_hpBar$getChildByName = hpBar.getChildByName('BarFill')) != null ? _hpBar$getChildByName : undefined;
          }

          if ((_spec$shadow = spec.shadow) != null && _spec$shadow.enabled) {
            var _spec$shadow$width, _spec$shadow$height, _spec$shadow$y, _spec$shadow$width2, _spec$shadow$height2;

            const shadow = this.ensureChild(root, 'Shadow', (_spec$shadow$width = spec.shadow.width) != null ? _spec$shadow$width : 70, (_spec$shadow$height = spec.shadow.height) != null ? _spec$shadow$height : 20);
            shadow.setPosition(0, (_spec$shadow$y = spec.shadow.y) != null ? _spec$shadow$y : -42, 0);
            this.drawEllipse(shadow, (_spec$shadow$width2 = spec.shadow.width) != null ? _spec$shadow$width2 : 70, (_spec$shadow$height2 = spec.shadow.height) != null ? _spec$shadow$height2 : 20, new Color(0, 0, 0, 80));
            nodes.shadow = shadow;
          }

          return nodes;
        }

        static ensureTransform(node, width, height) {
          var _node$getComponent;

          const transform = (_node$getComponent = node.getComponent(UITransform)) != null ? _node$getComponent : node.addComponent(UITransform);
          transform.setContentSize(width, height);
          return transform;
        }

        static ensureChild(parent, name, width, height) {
          let child = parent.getChildByName(name);

          if (!child) {
            child = new Node(name);
            parent.addChild(child);
          }

          this.ensureTransform(child, width, height);
          return child;
        }

        static ensureSpriteChild(parent, name, width, height) {
          const child = this.ensureChild(parent, name, width, height);

          if (!child.getComponent(Sprite)) {
            child.addComponent(Sprite);
          }

          return child;
        }

        static createHPBar(parent, width, height) {
          const hpBar = this.ensureChild(parent, 'HPBar', width, height);
          const bg = this.ensureChild(hpBar, 'BarBg', width, Math.max(2, height - 2));
          this.drawRect(bg, width, Math.max(2, height - 2), new Color(35, 35, 35, 190));
          const fill = this.ensureChild(hpBar, 'BarFill', Math.max(2, width - 4), Math.max(2, height - 4));
          fill.setPosition(0, 0, 0);
          this.drawRect(fill, Math.max(2, width - 4), Math.max(2, height - 4), new Color(85, 220, 105, 230));
          return hpBar;
        }

        static drawRect(node, width, height, color) {
          var _node$getComponent2;

          const graphics = (_node$getComponent2 = node.getComponent(Graphics)) != null ? _node$getComponent2 : node.addComponent(Graphics);
          graphics.clear();
          graphics.fillColor = color;
          graphics.rect(-width / 2, -height / 2, width, height);
          graphics.fill();
        }

        static drawEllipse(node, width, height, color) {
          var _node$getComponent3;

          const graphics = (_node$getComponent3 = node.getComponent(Graphics)) != null ? _node$getComponent3 : node.addComponent(Graphics);
          graphics.clear();
          graphics.fillColor = color;
          graphics.ellipse(0, 0, width / 2, height / 2);
          graphics.fill();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4827ad9d60d4f450d4a178066b9cafccae85a005.js.map