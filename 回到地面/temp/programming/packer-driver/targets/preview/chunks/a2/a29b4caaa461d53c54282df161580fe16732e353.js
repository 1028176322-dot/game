System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, ElementType, GameConfig, eventBus, MathUtils, _dec, _class, _class2, _crd, ccclass, property, ELEMENT_PAIRS, ElementSystem;

  /** 反应缓存键 (e1 < e2 排序) */
  function reactionKey(e1, e2) {
    return [e1, e2].sort().join('+');
  }
  /** 构建反应表 */


  function buildReactions() {
    var r = new Map();
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Frost), {
      name: 'Melt',
      description: '2x 伤害',
      handler: (sys, monster, pos) => {
        var _sys$_player$stats$ge, _sys$_player;

        // 额外造成一次 100% ATK 伤害
        var extraDmg = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).MIN_DAMAGE, Math.floor(((_sys$_player$stats$ge = (_sys$_player = sys._player) == null ? void 0 : _sys$_player.stats.getFinalStats().atk) != null ? _sys$_player$stats$ge : (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).PLAYER_BASE_ATK) * 1.0));

        sys._dealReactionDamage(monster, extraDmg);
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Lightning), {
      name: 'Overload',
      description: 'AoE 爆炸',
      handler: (sys, monster, pos) => {
        var _sys$_player$stats$ge2, _sys$_player2;

        var dmg = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).MIN_DAMAGE, Math.floor(((_sys$_player$stats$ge2 = (_sys$_player2 = sys._player) == null ? void 0 : _sys$_player2.stats.getFinalStats().atk) != null ? _sys$_player$stats$ge2 : (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).PLAYER_BASE_ATK) * 0.8)); // 对周围 1 格怪物造成 AoE

        sys._aoeDamage(pos, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).TILE_SIZE * 1.5, dmg, monster);
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Poison), {
      name: 'Burn',
      description: '3s DoT',
      handler: (sys, monster, _pos) => {
        var _sys$_player$stats$ge3, _sys$_player3;

        var dmg = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).MIN_DAMAGE, Math.floor(((_sys$_player$stats$ge3 = (_sys$_player3 = sys._player) == null ? void 0 : _sys$_player3.stats.getFinalStats().atk) != null ? _sys$_player$stats$ge3 : (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).PLAYER_BASE_ATK) * 0.15));

        sys._applyDot(monster, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
          error: Error()
        }), ElementType) : ElementType).Fire, dmg, 1.0, 3);
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Shadow), {
      name: 'Explosion',
      description: '大范围 AoE',
      handler: (sys, monster, pos) => {
        var _sys$_player$stats$ge4, _sys$_player4;

        var dmg = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).MIN_DAMAGE, Math.floor(((_sys$_player$stats$ge4 = (_sys$_player4 = sys._player) == null ? void 0 : _sys$_player4.stats.getFinalStats().atk) != null ? _sys$_player$stats$ge4 : (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).PLAYER_BASE_ATK) * 1.2));

        sys._aoeDamage(pos, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).TILE_SIZE * 3, dmg, monster);
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Frost, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Lightning), {
      name: 'Superconduct',
      description: '-50% 防御 5s',
      handler: (_sys, monster, _pos) => {
        monster.applyDefDebuff(0.5, 5);
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Frost, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Poison), {
      name: 'Freeze',
      description: '定身 2s',
      handler: (_sys, monster, _pos) => {
        monster.freeze(2);
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Frost, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Shadow), {
      name: 'Brittle',
      description: '+30% 受伤 5s',
      handler: (_sys, monster, _pos) => {
        monster.applyDefDebuff(-0.3, 5); // 负值 = 增加受伤
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Lightning, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Poison), {
      name: 'Conduct',
      description: '扩散到相邻',
      handler: (sys, monster, pos) => {
        // 给相邻怪物也随机附上 Poison
        var neighbors = sys._getNearestMonsters(pos, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).TILE_SIZE * 1.6, 2, monster);

        for (var n of neighbors) {
          if (!n.isDead) {
            sys._attachElement(n, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
              error: Error()
            }), ElementType) : ElementType).Poison, 4, 0, 0, 0, 0, 1);
          }
        }
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Lightning, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Shadow), {
      name: 'Silence',
      description: '无法攻击 3s',
      handler: (_sys, monster, _pos) => {
        monster.silence(3);
      }
    });
    r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Poison, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Shadow), {
      name: 'Decay',
      description: '递增 DoT 5s',
      handler: (sys, monster, _pos) => {
        var _sys$_player$stats$ge5, _sys$_player5;

        var baseDmg = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).MIN_DAMAGE, Math.floor(((_sys$_player$stats$ge5 = (_sys$_player5 = sys._player) == null ? void 0 : _sys$_player5.stats.getFinalStats().atk) != null ? _sys$_player$stats$ge5 : (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
          error: Error()
        }), GameConfig) : GameConfig).PLAYER_BASE_ATK) * 0.1)); // 每 1 秒一跳, 伤害递增 20%

        sys._applyDot(monster, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
          error: Error()
        }), ElementType) : ElementType).Shadow, baseDmg, 1.0, 5, true);
      }
    }); // Holy + any = Purify: 移除该元素 + 回复玩家

    var purgeElements = [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Frost, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Lightning, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Poison, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
      error: Error()
    }), ElementType) : ElementType).Shadow];

    var _loop = function _loop(e) {
      r.set(reactionKey((_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Holy, e), {
        name: 'Purify',
        description: "\u79FB\u9664 " + e,
        handler: (sys, monster, _pos) => {
          var _sys$_player6;

          // 从 monster 移除该元素
          sys._removeElement(monster, e); // 回复玩家 5 HP


          (_sys$_player6 = sys._player) == null || _sys$_player6.heal(5);
        }
      });
    };

    for (var e of purgeElements) {
      _loop(e);
    }

    return r;
  } // ======== 元素反应系统组件 ========


  function _reportPossibleCrUseOfElementType(extras) {
    _reporterNs.report("ElementType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterController(extras) {
    _reporterNs.report("MonsterController", "./MonsterController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAttackResult(extras) {
    _reporterNs.report("AttackResult", "./AutoAttack", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "./IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleManager(extras) {
    _reporterNs.report("BattleManager", "./BattleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtils(extras) {
    _reporterNs.report("MathUtils", "../utils/MathUtils", _context.meta, extras);
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
    }, function (_unresolved_2) {
      ElementType = _unresolved_2.ElementType;
    }, function (_unresolved_3) {
      GameConfig = _unresolved_3.GameConfig;
    }, function (_unresolved_4) {
      eventBus = _unresolved_4.eventBus;
    }, function (_unresolved_5) {
      MathUtils = _unresolved_5.MathUtils;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6e181dwiLBCCbCYylYJP0W8", "ElementSystem", undefined);
      /**
       * ElementSystem - 元素反应系统 (M2.2)
       * 
       * 6 元素附着 + 11 种反应效果 + 链式反应(≤3 层)
       * 通过 eventBus 与 AutoAttack/MonsterController 集成
       * 
       * 工作流:
       *   attack:performed 事件 → 检查怪物已有元素 → 触发反应/附着
       *   每帧 tick → 元素衰减 + DoT 伤害
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator); // ======== 元素类型工具 ========

      _export("ELEMENT_PAIRS", ELEMENT_PAIRS = [[(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Frost], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Lightning], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Poison], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Fire, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Shadow], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Frost, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Lightning], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Frost, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Poison], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Frost, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Shadow], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Lightning, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Poison], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Lightning, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Shadow], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Poison, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Shadow], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Holy, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Fire], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Holy, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Frost], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Holy, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Lightning], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Holy, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Poison], [(_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Holy, (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
        error: Error()
      }), ElementType) : ElementType).Shadow]]); // ======== 元素附着状态 ========
      // ======== 反应配置 ========


      _export("ElementSystem", ElementSystem = (_dec = ccclass('ElementSystem'), _dec(_class = (_class2 = class ElementSystem extends Component {
        constructor() {
          super(...arguments);
          this._player = null;
          this._monsterStatus = new Map();
          this._battleManager = null;
        }

        init(player, battleManager) {
          this._player = player;
          this._battleManager = battleManager;

          if (!ElementSystem._REACTIONS) {
            ElementSystem._REACTIONS = buildReactions();
          }
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('attack:performed', this._onAttackPerformed, this);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);

          this._monsterStatus.clear();
        }
        /** 清理怪物数据（房间切换/怪物死亡时） */


        clearMonster(monster) {
          this._monsterStatus.delete(monster);
        }
        /** 获取怪物的元素状态列表 */


        getMonsterElements(monster) {
          var _this$_monsterStatus$;

          return (_this$_monsterStatus$ = this._monsterStatus.get(monster)) != null ? _this$_monsterStatus$ : [];
        }
        /** 判断怪物是否有某元素 */


        hasElement(monster, element) {
          var statuses = this._monsterStatus.get(monster);

          if (!statuses) return false;
          return statuses.some(s => s.element === element);
        } // ======== 攻击事件处理 ========


        _onAttackPerformed(result) {
          var {
            target,
            element
          } = result;
          if (element === (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
            error: Error()
          }), ElementType) : ElementType).None || element === (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
            error: Error()
          }), ElementType) : ElementType).Physical) return;
          if (target.isDead) return; // 准备附着参数

          var duration = 6; // 基础附着时间

          var stacks = 1; // 检查并触发反应

          var triggered = this._tryTriggerReaction(target, element, target.node.getPosition(), 0);

          if (!triggered) {
            // 无反应: 附着元素
            this._attachElement(target, element, duration, stacks, 0, 0, 0, 1);
          }
        }
        /**
         * 尝试触发反应
         * @returns 是否触发了反应
         */


        _tryTriggerReaction(monster, newElement, pos, chainDepth) {
          if (chainDepth >= ElementSystem.MAX_CHAIN_DEPTH) return false;

          var existing = this._monsterStatus.get(monster);

          if (!existing || existing.length === 0) return false; // 检查所有 (existing, new) 配对

          for (var status of existing) {
            var _ElementSystem$_REACT;

            if (status.element === newElement) continue; // 同元素不反应

            var key = reactionKey(status.element, newElement);
            var reaction = (_ElementSystem$_REACT = ElementSystem._REACTIONS) == null ? void 0 : _ElementSystem$_REACT.get(key);

            if (reaction) {
              // 消耗两个参与反应的元素
              this._removeElement(monster, status.element); // 新元素已消耗 (不附着)
              // 执行反应效果


              console.log("[ElementSystem] " + reaction.name + ": " + status.element + " + " + newElement);
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('element:reaction', reaction.name, pos);
              reaction.handler(this, monster, pos); // 链式反应检测: 反应可能产生了新元素组合

              if (chainDepth + 1 < ElementSystem.MAX_CHAIN_DEPTH) {
                var remaining = this._monsterStatus.get(monster);

                if (remaining && remaining.length >= 2) {
                  // 检查剩余元素间能否再反应
                  for (var i = 0; i < remaining.length; i++) {
                    for (var j = i + 1; j < remaining.length; j++) {
                      var _ElementSystem$_REACT2;

                      var innerKey = reactionKey(remaining[i].element, remaining[j].element);

                      if ((_ElementSystem$_REACT2 = ElementSystem._REACTIONS) != null && _ElementSystem$_REACT2.has(innerKey)) {
                        // 链式触发
                        this._tryTriggerReaction(monster, remaining[j].element, pos, chainDepth + 1);

                        return true;
                      }
                    }
                  }
                }
              }

              return true;
            }
          }

          return false;
        } // ======== 元素附着管理 ========

        /**
         * 给怪物附着元素
         */


        _attachElement(monster, element, duration, stacks, tickTimer, tickDamage, tickInterval, tickStartDelay) {
          if (!this._monsterStatus.has(monster)) {
            this._monsterStatus.set(monster, []);
          }

          var list = this._monsterStatus.get(monster); // 同元素叠加


          var existing = list.find(s => s.element === element);

          if (existing) {
            existing.remainingTime = Math.max(existing.remainingTime, duration);
            existing.stacks = Math.min(existing.stacks + stacks, 5);
            existing.tickDamage = Math.max(existing.tickDamage, tickDamage);
            return;
          } // 上限 3 种元素 (移除最旧的)


          if (list.length >= 3) {
            list.shift();
          }

          list.push({
            element,
            remainingTime: duration,
            maxTime: duration,
            stacks,
            tickTimer: tickStartDelay,
            tickDamage,
            tickInterval
          });
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('element:applied', monster, element, duration);
        }
        /** 移除指定元素 */


        _removeElement(monster, element) {
          var list = this._monsterStatus.get(monster);

          if (!list) return;
          var idx = list.findIndex(s => s.element === element);

          if (idx >= 0) {
            list.splice(idx, 1);
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('element:removed', monster, element);

            if (list.length === 0) {
              this._monsterStatus.delete(monster);
            }
          }
        } // ======== 反应效果实现 ========

        /** 对怪物造成反应伤害（直接生效） */


        _dealReactionDamage(monster, damage) {
          if (monster.isDead) return;
          var killed = monster.takeDamage(damage, false);

          if (killed && this._battleManager) {
            this._battleManager.removeMonster(monster);
          }
        }
        /** 区域伤害 */


        _aoeDamage(center, radius, damage, exclude) {
          if (!this._battleManager) return;

          var monsters = this._battleManager.getAllMonsters();

          for (var m of monsters) {
            if (m === exclude || m.isDead) continue;
            var d = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
              error: Error()
            }), MathUtils) : MathUtils).euclideanDistance(center.x, center.y, m.node.getPosition().x, m.node.getPosition().y);

            if (d <= radius) {
              var killed = m.takeDamage(damage, false);
              if (killed) this._battleManager.removeMonster(m);
            }
          }
        }
        /** 应用 DoT */


        _applyDot(monster, element, tickDamage, tickInterval, totalDuration, rampUp) {
          if (rampUp === void 0) {
            rampUp = false;
          }

          var numTicks = Math.ceil(totalDuration / tickInterval);

          this._attachElement(monster, element, totalDuration, 1, tickInterval, tickDamage, tickInterval, tickInterval);

          var tickCount = 0;

          var doTick = () => {
            if (monster.isDead) return;
            var dmg = tickDamage;

            if (rampUp) {
              dmg = Math.floor(tickDamage * (1 + tickCount * 0.2)); // 每次 +20%
            }

            dmg = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).MIN_DAMAGE, dmg);
            var killed = monster.takeDamage(dmg, false);
            tickCount++;

            if (killed && this._battleManager) {
              this._battleManager.removeMonster(monster);

              return;
            }

            if (tickCount < numTicks && !monster.isDead) {
              this.scheduleOnce(doTick, tickInterval);
            }
          };

          this.scheduleOnce(doTick, tickInterval);
        }
        /** 获取附近的怪物 (排除自身) */


        _getNearestMonsters(pos, radius, maxCount, exclude) {
          if (!this._battleManager) return [];

          var all = this._battleManager.getAllMonsters();

          var withinRange = all.filter(m => {
            if (m === exclude || m.isDead) return false;
            var d = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
              error: Error()
            }), MathUtils) : MathUtils).euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);
            return d <= radius;
          });
          return withinRange.slice(0, maxCount);
        } // ======== 每帧更新 ========


        update(dt) {
          // 遍历怪物元素状态，衰减和 DoT
          for (var [_monster, statuses] of this._monsterStatus.entries()) {
            if (_monster.isDead || !_monster.node.isValid) {
              this._monsterStatus.delete(_monster);

              continue;
            }

            for (var i = statuses.length - 1; i >= 0; i--) {
              var s = statuses[i]; // 元素衰减

              s.remainingTime -= dt;

              if (s.remainingTime <= 0) {
                (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                  error: Error()
                }), eventBus) : eventBus).emit('element:removed', _monster, s.element);
                statuses.splice(i, 1);

                if (statuses.length === 0) {
                  this._monsterStatus.delete(_monster);
                }

                continue;
              } // DoT 计时


              if (s.tickDamage > 0 && s.tickInterval > 0) {
                s.tickTimer -= dt;

                if (s.tickTimer <= 0) {
                  s.tickTimer = s.tickInterval;
                  var dot = s.tickDamage * s.stacks;

                  if (!_monster.isDead) {
                    var killed = _monster.takeDamage(dot, false);

                    (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                      error: Error()
                    }), eventBus) : eventBus).emit('element:dot_tick', _monster, s.element, dot);

                    if (killed && this._battleManager) {
                      this._battleManager.removeMonster(_monster);
                    }
                  }
                }
              }
            }
          }
        }

      }, _class2._REACTIONS = null, _class2.MAX_CHAIN_DEPTH = 3, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a29b4caaa461d53c54282df161580fe16732e353.js.map