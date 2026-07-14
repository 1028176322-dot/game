System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, TerrainType, ArtResourceResolver, _crd;

  function _reportPossibleCrUseOfTerrainType(extras) {
    _reporterNs.report("TerrainType", "../core/Constants", _context.meta, extras);
  }

  _export("ArtResourceResolver", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      TerrainType = _unresolved_2.TerrainType;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4d404NlmntMrYY2zrnazcFo", "ArtResourceResolver", undefined);

      _export("ArtResourceResolver", ArtResourceResolver = class ArtResourceResolver {
        static character(characterId, action = 'idle') {
          const id = this._compact(characterId);

          return `textures/characters/${id}/${id}_${action}`;
        }

        static monster(zoneId, monsterId, action = 'idle') {
          const zone = this._compact(zoneId);

          const monster = this._compact(monsterId);

          return `textures/monsters/${zone}/monster_${zone}_${monster}_${action}`;
        }

        static tile(zoneId, terrain) {
          const zone = this._compact(zoneId);

          const kind = this.tileKind(terrain);
          return `textures/tiles/${zone}/tile_${zone}_${kind}`;
        }

        static backgroundCombat(zoneId) {
          return `textures/backgrounds/bg_combat_${this._compact(zoneId)}`;
        }

        static ui(path) {
          return `textures/ui/${path}`;
        }

        static icon(path) {
          return `textures/icons/${path}`;
        }

        static tileKind(terrain) {
          switch (terrain) {
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Wall:
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Water:
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Lava:
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Ice:
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Swamp:
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).DarkZone:
              return 'wall';

            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Thorn:
              return 'thorn';

            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).HighGround:
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Stone:
              return 'highground';

            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Floor:
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).Grass:
            case (_crd && TerrainType === void 0 ? (_reportPossibleCrUseOfTerrainType({
              error: Error()
            }), TerrainType) : TerrainType).HealPad:
            default:
              return 'floor';
          }
        }

        static _compact(value) {
          return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ed349bcc295b436056ec3248620ba142e8dcf3ab.js.map