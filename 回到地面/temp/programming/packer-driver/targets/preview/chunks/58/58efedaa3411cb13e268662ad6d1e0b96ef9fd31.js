System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, Rng, deriveSeed, NodeRewardResolver, _crd;

  function _reportPossibleCrUseOfRng(extras) {
    _reporterNs.report("Rng", "../../core/rng/Rng", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteNodeEncounterConfig(extras) {
    _reporterNs.report("RouteNodeEncounterConfig", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfderiveSeed(extras) {
    _reporterNs.report("deriveSeed", "./RouteSeed", _context.meta, extras);
  }

  _export("NodeRewardResolver", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      Rng = _unresolved_2.Rng;
    }, function (_unresolved_3) {
      deriveSeed = _unresolved_3.deriveSeed;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7bf25VvIKVISIhXEZIYdhED", "NodeRewardResolver", undefined); // assets/scripts/dungeon/route/NodeRewardResolver.ts
      //
      // Node unified reward resolution (GDD v0.4.4 §9.3). The SINGLE grant point for
      // node rewards — RoomFlowController's 'route' mode must NOT grant (anti-double-award,
      // GDD §9.1). Pure logic, deterministic (seeded via deriveSeed -> Rng), no Cocos.
      //
      // P4 (2026-07-13): full per-node-type resolution. Previously only elite/boss had a
      // multiplier; combat/treasure/rest/event/shop/upgrade now each resolve with their own
      // semantics. Deterministic: same config + outcome -> identical reward (event rng is
      // seeded from the encounter seed, so recovery in P5 reproduces the exact reward).
      //
      // Path note: from dungeon/route/, `../../` reaches assets/scripts/.
      //   ../../core/rng/Rng          -> assets/scripts/core/rng/Rng
      //   ./RouteSeed                 -> same-folder deriveSeed (FNV-1a hex -> uint32)
      //
      // Authoritative spec: GDD v0.4.4 §8.3 / §9.3 / §10.1.


      _export("NodeRewardResolver", NodeRewardResolver = class NodeRewardResolver {
        /**
         * Resolve the reward for a completed node encounter.
         * @param config the encounter config produced by RouteRunController.
         * @param outcome combat result (victory/defeat), elapsed ms, kill count.
         * @returns deterministic reward (same config + outcome -> identical reward).
         */
        resolve(config, outcome) {
          // Reward seed is derived from the encounter seed so recovery (P5) reproduces
          // the exact same reward for the same node — deterministic, no Math.random.
          var rewardSeed = (_crd && deriveSeed === void 0 ? (_reportPossibleCrUseOfderiveSeed({
            error: Error()
          }), deriveSeed) : deriveSeed)(config.seed, "reward:" + config.rewardProfileId);
          var rng = new (_crd && Rng === void 0 ? (_reportPossibleCrUseOfRng({
            error: Error()
          }), Rng) : Rng)(rewardSeed); // [PLACEHOLDER] tuning rationale (playtest before shipping):
          //   base gold/exp scale with difficulty so deeper floors feel rewarding;
          //   the small rng band is a variable reward schedule (GDD advanced econ) to
          //   keep opening nodes engaging.

          var baseGold = 10 + config.difficulty * 5;
          var baseExp = 5 + config.difficulty * 2;
          var variance = rng.int(0, config.difficulty * 3); // [0, difficulty*3]
          // Defeat grants nothing (placeholder: partial/consolation later).

          if (outcome.result === 'defeat') {
            return {
              gold: 0,
              exp: 0,
              items: [],
              heal: 0,
              effect: '',
              profileId: config.rewardProfileId
            };
          } // Per-node-type resolution (GDD §8.3 encounterViewType semantics).


          switch (config.encounterViewType) {
            case 'combat':
              return {
                gold: baseGold + variance,
                exp: baseExp,
                items: [],
                heal: 0,
                effect: '',
                profileId: config.rewardProfileId
              };

            case 'elite':
              // same combat base, richer payout (GDD §8.3)
              return {
                gold: (baseGold + variance) * 2,
                exp: baseExp * 2,
                items: [],
                heal: 0,
                effect: 'elite',
                profileId: config.rewardProfileId
              };

            case 'boss':
              // boss: biggest payout (GDD §8.3)
              return {
                gold: (baseGold + variance) * 4,
                exp: baseExp * 3,
                items: ['boss_token'],
                heal: 0,
                effect: 'boss',
                profileId: config.rewardProfileId
              };

            case 'treasure':
              // pure gold, generous, no exp
              return {
                gold: (baseGold + variance) * 3,
                exp: 0,
                items: [],
                heal: 0,
                effect: 'treasure',
                profileId: config.rewardProfileId
              };

            case 'rest':
              // heal only, no currency
              return {
                gold: 0,
                exp: 0,
                items: [],
                heal: 30 + config.difficulty * 5 + rng.int(0, config.difficulty * 2),
                effect: 'rest',
                profileId: config.rewardProfileId
              };

            case 'event':
              {
                // Deterministic 4-way event (seeded, so identical on replay/recovery).
                var roll = rng.int(0, 3); // [0, 3]

                if (roll === 0) {
                  return {
                    gold: baseGold * 2,
                    exp: 0,
                    items: [],
                    heal: 0,
                    effect: 'event_gold',
                    profileId: config.rewardProfileId
                  };
                }

                if (roll === 1) {
                  return {
                    gold: 0,
                    exp: 0,
                    items: [],
                    heal: 20 + config.difficulty * 3,
                    effect: 'event_heal',
                    profileId: config.rewardProfileId
                  };
                }

                if (roll === 2) {
                  return {
                    gold: 0,
                    exp: 0,
                    items: ['event_token'],
                    heal: 0,
                    effect: 'event_item',
                    profileId: config.rewardProfileId
                  };
                } // roll === 3: minor curse (negative heal, halved gold)


                return {
                  gold: Math.floor(baseGold / 2),
                  exp: 0,
                  items: [],
                  heal: -10,
                  effect: 'event_curse',
                  profileId: config.rewardProfileId
                };
              }

            case 'shop':
              // No auto-reward: the real trade UI is wired in a later UI phase
              // (ui/** is out of Demo7 scope). The node still resolves (marked
              // visited) so map flow advances. effect='shop' lets the UI show a
              // storefront on entry.
              return {
                gold: 0,
                exp: 0,
                items: [],
                heal: 0,
                effect: 'shop',
                profileId: config.rewardProfileId
              };

            case 'upgrade':
              // grants an upgrade token; small exp, no gold
              return {
                gold: 0,
                exp: baseExp,
                items: ['upgrade_token'],
                heal: 0,
                effect: 'upgrade',
                profileId: config.rewardProfileId
              };

            default:
              return {
                gold: baseGold + variance,
                exp: baseExp,
                items: [],
                heal: 0,
                effect: '',
                profileId: config.rewardProfileId
              };
          }
        }
        /** Map preview shown on the node BEFORE entering. Mirrors resolve() (no bait-and-switch). */


        preview(config) {
          return this.resolve(config, {
            result: 'victory',
            elapsed: 0,
            kills: 0
          });
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=58efedaa3411cb13e268662ad6d1e0b96ef9fd31.js.map