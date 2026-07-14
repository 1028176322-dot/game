System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, instantiate, Layers, resolveSocketByName, _crd, WeaponAttachService;

  function _reportPossibleCrUseOfresolveSocketByName(extras) {
    _reporterNs.report("resolveSocketByName", "./model_clip", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSocketNodeLike(extras) {
    _reporterNs.report("SocketNodeLike", "./model_clip", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      instantiate = _cc.instantiate;
      Layers = _cc.Layers;
    }, function (_unresolved_2) {
      resolveSocketByName = _unresolved_2.resolveSocketByName;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bfa56c7dMZOyLI6XD+GNdFL", "WeaponAttachService", undefined); // WeaponAttachService.ts - Route B runtime weapon attach.
      //
      // The character GLB exposes named socket nodes (e.g. "Weapon", "RightHand").
      // The weapon GLB is a standalone dependency (assetmeta.depends). At runtime we
      // load both prefabs and parent the weapon under the socket node, so weapon
      // swapping / weapon skins remain possible without baking the weapon in.
      //
      // Engine-side (cc) code cannot run under node/vitest; the pure socket resolver
      // lives in model_clip.ts and is unit-tested with mock nodes.


      __checkObsolete__(['instantiate', 'Layers', 'Node', 'Prefab']);

      _export("WeaponAttachService", WeaponAttachService = {
        resolveSocket(root, name, fallback) {
          var _ref;

          var found = (_crd && resolveSocketByName === void 0 ? (_reportPossibleCrUseOfresolveSocketByName({
            error: Error()
          }), resolveSocketByName) : resolveSocketByName)(root, name, fallback);
          return (_ref = found) != null ? _ref : null;
        },

        attach(socket, weaponPrefab) {
          var _socket$worldPosition, _weapon$worldPosition;

          var weapon = instantiate(weaponPrefab); // Reset the weapon root's local transform so it spawns exactly at the socket.

          weapon.setPosition(0, 0, 0);
          weapon.setRotationFromEuler(0, 0, 0);
          weapon.setScale(1, 1, 1); // Imported weapon prefabs may live on a non-UI layer (e.g. PROFILER). Force
          // the whole subtree to the fixed UI_2D layer so the UI camera draws it in any
          // scene (dungeon or character preview), regardless of the socket's layer.

          var targetLayer = Layers.Enum.UI_2D;

          var applyLayer = n => {
            n.layer = targetLayer;
            n.children.forEach(applyLayer);
          };

          applyLayer(weapon);
          socket.addChild(weapon);
          console.warn('[WeaponAttachService] attached weapon to socket', socket.name, 'socketWorldPos=', (_socket$worldPosition = socket.worldPosition) == null ? void 0 : _socket$worldPosition.toString(), 'weaponWorldPos=', (_weapon$worldPosition = weapon.worldPosition) == null ? void 0 : _weapon$worldPosition.toString(), 'targetLayer=', targetLayer);
          return weapon;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=742934035133ec71ea4203ede5f5c02287e23436.js.map