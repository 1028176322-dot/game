System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, _dec, _class, _crd, ccclass, PartAnimationPlayer;

  function _reportPossibleCrUseOfPartCharacterRenderer(extras) {
    _reporterNs.report("PartCharacterRenderer", "./PartCharacterRenderer", _context.meta, extras);
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
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "008aaIB5aNAzauQxEvxF52t", "PartAnimationPlayer", undefined);
      /**
       * PartAnimationPlayer — Keyframe-driven animation for part-based characters.
       *
       * Reads character_part_animations.json and interpolates position/rotation/scale
       * per part on every update(). Attach to the same node as PartCharacterRenderer.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      ({
        ccclass
      } = _decorator);

      _export("PartAnimationPlayer", PartAnimationPlayer = (_dec = ccclass('PartAnimationPlayer'), _dec(_class = class PartAnimationPlayer extends Component {
        constructor() {
          super(...arguments);
          this._renderer = null;
          this._anim = null;
          this._time = 0;
          this._playing = false;
        }

        setup(renderer) {
          this._renderer = renderer;
        }

        play(anim) {
          this._anim = anim;
          this._time = 0;
          this._playing = true; // Reset parts to rig defaults before playing so animations are relative.

          if (this._renderer) {
            this._renderer.resetToRig();
          }
        }

        stop() {
          this._playing = false;
          this._anim = null;
        }

        isPlaying() {
          return this._playing;
        }

        update(dt) {
          if (!this._playing || !this._anim || !this._renderer) {
            return;
          }

          this._time += dt;

          if (this._time > this._anim.duration) {
            if (this._anim.loop) {
              this._time = this._time % this._anim.duration;
            } else {
              this._time = this._anim.duration;
              this._playing = false;
            }
          }

          for (var [partName, frames] of Object.entries(this._anim.tracks)) {
            var node = this._renderer.getPart(partName);

            if (!node || frames.length === 0) {
              continue;
            }

            this._applyTrack(node, frames, this._time);
          }
        }

        _applyTrack(node, frames, time) {
          var a = frames[0];
          var b = frames[frames.length - 1];

          for (var i = 0; i < frames.length - 1; i++) {
            if (time >= frames[i].time && time <= frames[i + 1].time) {
              a = frames[i];
              b = frames[i + 1];
              break;
            }
          }

          var span = Math.max(0.001, b.time - a.time);
          var t = Math.max(0, Math.min(1, (time - a.time) / span));

          if (a.position || b.position) {
            var ap = a.position || b.position;
            var bp = b.position || a.position;
            node.setPosition(ap[0] + (bp[0] - ap[0]) * t, ap[1] + (bp[1] - ap[1]) * t, 0);
          }

          if (a.rotation !== undefined || b.rotation !== undefined) {
            var _ref, _a$rotation, _ref2, _b$rotation;

            var ar = (_ref = (_a$rotation = a.rotation) != null ? _a$rotation : b.rotation) != null ? _ref : 0;
            var br = (_ref2 = (_b$rotation = b.rotation) != null ? _b$rotation : a.rotation) != null ? _ref2 : 0;
            node.setRotationFromEuler(0, 0, ar + (br - ar) * t);
          }

          if (a.scale || b.scale) {
            var as = a.scale || b.scale;
            var bs = b.scale || a.scale;
            node.setScale(as[0] + (bs[0] - as[0]) * t, as[1] + (bs[1] - as[1]) * t, 1);
          }
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=20ea9a1b1aaf6228e303064a97b8bd145ee7fb9d.js.map