System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, BTAIController, FSMAIController, GOAPController, UtilityAIController, _crd, ATTACK_RANGE, CHASE_RANGE;

  function manhattan(ax, ay, bx, by) {
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  function moveToward(self, tx, ty, reason) {
    return {
      dx: Math.sign(tx - self.gridX),
      dy: Math.sign(ty - self.gridY),
      reason
    };
  }

  function attackDecision(reason) {
    var skill = {
      skillId: 'melee_attack',
      reason
    };
    return {
      node: reason,
      skill,
      anim: 'Attack'
    };
  } // ---------- BT (default): priority selector over conditions ----------
  // Order: Die > Attack(in range) > Chase(in chase range) > Patrol(far). Each frame re-evaluates.


  function satisfies(pre, w) {
    return pre.inRange ? w.inRange : true;
  }

  function applyEff(w, eff) {
    return {
      inRange: eff.inRange !== undefined ? eff.inRange : w.inRange
    };
  }

  function worldKey(w) {
    return w.inRange ? 'R' : 'NR';
  }

  function _reportPossibleCrUseOfAIStrategy(extras) {
    _reporterNs.report("AIStrategy", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAINode(extras) {
    _reporterNs.report("AINode", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEntity(extras) {
    _reporterNs.report("Entity", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIPerception(extras) {
    _reporterNs.report("AIPerception", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIDecision(extras) {
    _reporterNs.report("AIDecision", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIDecisionPolicy(extras) {
    _reporterNs.report("AIDecisionPolicy", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMoveCommand(extras) {
    _reporterNs.report("MoveCommand", "./IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillRequest(extras) {
    _reporterNs.report("SkillRequest", "./IAIController", _context.meta, extras);
  }

  _export({
    BTAIController: void 0,
    FSMAIController: void 0,
    GOAPController: void 0,
    UtilityAIController: void 0
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d735b3K7BBEJb0KXMTXi4vT", "aiPolicies", undefined); // aiPolicies.ts — the four pluggable decision policies (§3.10): BT / FSM / GOAP / Utility.
      // Pure TS, no `cc`, no Math.random (red line 5). Selected by AIController.setStrategy (Map, no switch).
      //
      // The four named classes map 1:1 to the spec's "BTAIController（默认）/ FSMAIController /
      // GOAPController / UtilityAIController". They are decision policies; the AIController
      // orchestrator hosts them and switches the active one via setStrategy (no switch on id).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.10.


      ATTACK_RANGE = 1;
      CHASE_RANGE = 4;

      _export("BTAIController", BTAIController = class BTAIController {
        constructor() {
          this.kind = 'BT';
        }

        decide(self, p) {
          if (!p.targetAlive) {
            return {
              node: 'Die',
              anim: 'Dead'
            };
          }

          var dist = manhattan(self.gridX, self.gridY, p.targetX, p.targetY);

          if (dist <= ATTACK_RANGE) {
            return attackDecision('Attack');
          }

          if (dist <= CHASE_RANGE) {
            return {
              node: 'Chase',
              move: moveToward(self, p.targetX, p.targetY, 'Chase'),
              anim: 'Walk'
            };
          }

          return {
            node: 'Patrol',
            anim: 'Idle'
          };
        }

      }); // ---------- FSM: stateful finite-state-machine over the behavior nodes ----------
      // State persists across frames (this._state). Transitions resolved by a record lookup (no switch).


      _export("FSMAIController", FSMAIController = class FSMAIController {
        constructor() {
          this.kind = 'FSM';
          this._state = 'Patrol';
        }

        decide(self, p) {
          var dist = p.targetAlive ? manhattan(self.gridX, self.gridY, p.targetX, p.targetY) : 999; // Transition (record lookup, no switch on id).

          if (!p.targetAlive) {
            this._state = 'Die';
          } else if (this._state === 'Die') {
            this._state = 'Patrol';
          } else if (dist <= ATTACK_RANGE) {
            this._state = 'Attack';
          } else if (dist <= CHASE_RANGE) {
            this._state = 'Chase';
          } else {
            this._state = 'Patrol';
          }

          var builders = {
            Patrol: () => ({
              node: 'Patrol',
              anim: 'Idle'
            }),
            Search: () => ({
              node: 'Search',
              anim: 'Walk'
            }),
            Chase: () => ({
              node: 'Chase',
              move: moveToward(self, p.targetX, p.targetY, 'Chase'),
              anim: 'Walk'
            }),
            Attack: () => attackDecision('Attack'),
            Lost: () => ({
              node: 'Lost',
              anim: 'Idle'
            }),
            Return: () => ({
              node: 'Return',
              anim: 'Walk'
            }),
            Dodge: () => ({
              node: 'Dodge',
              anim: 'Walk'
            }),
            Skill: () => ({
              node: 'Skill',
              skill: {
                skillId: 'ranged_skill',
                reason: 'Skill'
              },
              anim: 'Skill'
            }),
            Die: () => ({
              node: 'Die',
              anim: 'Dead'
            })
          };
          return builders[this._state]();
        }

      }); // ---------- GOAP: generic forward planner (BFS over action sequences) ----------
      // Goal: be in attack range (then attack). Actions: Approach (pre {} -> eff inRange),
      // Attack (pre inRange -> eff {}). Planner returns the first action to execute this frame.


      _export("GOAPController", GOAPController = class GOAPController {
        constructor() {
          this.kind = 'GOAP';
        }

        _actions(self, p) {
          return [{
            name: 'Approach',
            pre: {
              inRange: false
            },
            eff: {
              inRange: true
            },
            build: () => ({
              node: 'Chase',
              move: moveToward(self, p.targetX, p.targetY, 'Chase'),
              anim: 'Walk'
            })
          }, {
            name: 'Attack',
            pre: {
              inRange: true
            },
            eff: {},
            build: () => attackDecision('Attack')
          }];
        } // BFS for the shortest action sequence that satisfies the goal (inRange). Bounded depth 4.


        _plan(start, actions) {
          if (start.inRange) return []; // goal already met -> caller issues Attack.

          var queue = [{
            state: start,
            path: []
          }];
          var seen = new Set([worldKey(start)]);

          while (queue.length > 0) {
            var {
              state,
              path
            } = queue.shift();
            if (path.length >= 4) continue;

            for (var a of actions) {
              if (!satisfies(a.pre, state)) continue;
              var next = applyEff(state, a.eff);
              var k = worldKey(next);
              if (seen.has(k)) continue;
              seen.add(k);
              var np = [...path, a.name];
              if (next.inRange) return np; // reached goal

              queue.push({
                state: next,
                path: np
              });
            }
          }

          return [];
        }

        decide(self, p) {
          if (!p.targetAlive) return {
            node: 'Die',
            anim: 'Dead'
          };
          var dist = manhattan(self.gridX, self.gridY, p.targetX, p.targetY);
          var start = {
            inRange: dist <= ATTACK_RANGE
          };

          var actions = this._actions(self, p);

          var plan = this._plan(start, actions);

          if (plan.length === 0) {
            // Goal already satisfied (in range) -> attack directly.
            return attackDecision('Attack');
          }

          var first = actions.find(a => a.name === plan[0]);
          return first ? first.build(self, p) : attackDecision('Attack');
        }

      }); // ---------- Utility: score candidate actions, pick the best (deterministic tie-break) ----------


      _export("UtilityAIController", UtilityAIController = class UtilityAIController {
        constructor() {
          this.kind = 'Utility';
        }

        decide(self, p) {
          if (!p.targetAlive) return {
            node: 'Die',
            anim: 'Dead'
          };
          var dist = manhattan(self.gridX, self.gridY, p.targetX, p.targetY);
          var candidates = [{
            node: 'Attack',
            score: dist <= ATTACK_RANGE ? 100 - dist : 0,
            decision: attackDecision('Attack')
          }, {
            node: 'Chase',
            score: dist > ATTACK_RANGE && dist <= CHASE_RANGE ? 80 - dist : 0,
            decision: {
              node: 'Chase',
              move: moveToward(self, p.targetX, p.targetY, 'Chase'),
              anim: 'Walk'
            }
          }, {
            node: 'Patrol',
            score: dist > CHASE_RANGE ? 50 : 0,
            decision: {
              node: 'Patrol',
              anim: 'Idle'
            }
          }];
          candidates.sort((a, b) => b.score - a.score);
          var best = candidates[0];
          return best.score > 0 ? best.decision : {
            node: 'Patrol',
            anim: 'Idle'
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=591046bacfb778d5fde897b9557522e5d7b5777c.js.map