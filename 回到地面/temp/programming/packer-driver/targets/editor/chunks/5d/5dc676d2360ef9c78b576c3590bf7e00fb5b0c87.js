System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, GameConfig, eventBus, MathUtils, _dec, _class, _crd, ccclass, property, ALL_ITEMS, DROP_CONFIGS, ItemSystem;

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
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
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }, function (_unresolved_4) {
      MathUtils = _unresolved_4.MathUtils;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "318f5EAIG5Kp4amwHS8ALx8", "ItemSystem", undefined);
      /**
       * ItemSystem - 道具系统 (M2.5)
       * 
       * 8 种消耗品 + 5 格背包(可叠加) + 掉落(按怪物类型)
       * 道具不可带出关卡 (重开时清空)
       * 
       * 使用效果:
       *   heal: 回复 HP
       *   buff: 临时属性加成 (持续本场战斗)
       *   aoe: 范围伤害/冰冻
       *   purify: 移除debuff + 回血
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator); // ======== 道具类型 ========

      ALL_ITEMS = {
        healingPotion: {
          id: 'healingPotion',
          name: '回复药水',
          effect: 'heal',
          healAmount: 10,
          stackMax: 5
        },
        bigHealingPotion: {
          id: 'bigHealingPotion',
          name: '大回复药水',
          effect: 'heal',
          healAmount: 25,
          stackMax: 3
        },
        furyPotion: {
          id: 'furyPotion',
          name: '狂暴药水',
          effect: 'buff',
          buffStat: 'atk',
          buffAmount: 4,
          stackMax: 3
        },
        ironPotion: {
          id: 'ironPotion',
          name: '铁壁药水',
          effect: 'buff',
          buffStat: 'def',
          buffAmount: 3,
          stackMax: 3
        },
        speedPotion: {
          id: 'speedPotion',
          name: '疾速药水',
          effect: 'buff',
          buffStat: 'moveSpeed',
          buffPercent: 0.2,
          stackMax: 3
        },
        purifyPotion: {
          id: 'purifyPotion',
          name: '净化药水',
          effect: 'purify',
          healAmount: 5,
          stackMax: 3
        },
        flameBomb: {
          id: 'flameBomb',
          name: '火焰瓶',
          effect: 'aoe',
          aoeRange: 2,
          damage: 8,
          element: 'fire',
          stackMax: 3
        },
        iceBomb: {
          id: 'iceBomb',
          name: '冰霜瓶',
          effect: 'aoe',
          aoeRange: 2,
          freezeDuration: 2,
          element: 'frost',
          stackMax: 3
        }
      };
      DROP_CONFIGS = {
        normal: {
          chance: 0.12,
          pool: ['healingPotion', 'furyPotion', 'ironPotion', 'flameBomb', 'iceBomb']
        },
        elite: {
          chance: 0.40,
          pool: ['bigHealingPotion', 'purifyPotion', 'flameBomb']
        },
        boss: {
          chance: 1.0,
          pool: ['bigHealingPotion', 'purifyPotion']
        }
      }; // ======== 道具系统 ========

      _export("ItemSystem", ItemSystem = (_dec = ccclass('ItemSystem'), _dec(_class = class ItemSystem extends Component {
        constructor(...args) {
          super(...args);
          this._player = null;
          this._battleManager = null;

          /** 背包: 最多 5 格 */
          this._bag = new Array(5).fill(null);
        }

        init(player, battleManager) {
          this._player = player;
          this._battleManager = battleManager;
        }
        /** 重置背包 (新地牢/死亡时) */


        resetBag() {
          this._bag = new Array(5).fill(null);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('bag:changed', this._getBagSnapshot());
        } // ======== 背包操作 ========

        /** 获取背包内容 (只读快照) */


        getBag() {
          return this._getBagSnapshot();
        }

        _getBagSnapshot() {
          return this._bag.map(s => s ? {
            def: { ...s.def
            },
            count: s.count
          } : null);
        }
        /** 拾取道具到背包 (自动叠加或放入空格) */


        pickupItem(itemDef, count = 1) {
          // 先找同物品叠加
          for (let i = 0; i < this._bag.length; i++) {
            const stack = this._bag[i];

            if (stack && stack.def.id === itemDef.id && stack.count < itemDef.stackMax) {
              const addable = Math.min(itemDef.stackMax - stack.count, count);
              stack.count += addable;
              count -= addable;

              if (count <= 0) {
                this._emitBagChanged();

                return true;
              }
            }
          } // 再找空格


          for (let i = 0; i < this._bag.length; i++) {
            if (this._bag[i] === null) {
              const addCount = Math.min(count, itemDef.stackMax);
              this._bag[i] = {
                def: { ...itemDef
                },
                count: addCount
              };
              count -= addCount;

              if (count <= 0) {
                this._emitBagChanged();

                return true;
              }
            }
          } // 背包满了


          if (count < 1) {
            this._emitBagChanged();

            return true;
          }

          return false;
        }
        /** 从背包移除道具 */


        removeItem(index, count = 1) {
          const stack = this._bag[index];
          if (!stack || stack.count < count) return false;
          stack.count -= count;

          if (stack.count <= 0) {
            this._bag[index] = null;
          }

          this._emitBagChanged();

          return true;
        }
        /** 使用道具 (index 为背包格子位置) */


        useItem(index) {
          const stack = this._bag[index];
          if (!stack) return false;
          if (!this._applyEffect(stack.def)) return false; // 消耗 1 个

          return this.removeItem(index, 1);
        } // ======== 使用效果 ========


        _applyEffect(itemDef) {
          if (!this._player) return false;

          switch (itemDef.effect) {
            case 'heal':
              {
                var _itemDef$healAmount;

                this._player.heal((_itemDef$healAmount = itemDef.healAmount) != null ? _itemDef$healAmount : 10);

                (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                  error: Error()
                }), eventBus) : eventBus).emit('item:used', itemDef.id, {
                  heal: itemDef.healAmount
                });
                return true;
              }

            case 'buff':
              {
                const s = this._player.stats;
                const source = `item:${itemDef.id}`;

                if (itemDef.buffStat === 'atk') {
                  var _itemDef$buffAmount;

                  s.applyModifier({
                    source,
                    stat: 'atk',
                    value: (_itemDef$buffAmount = itemDef.buffAmount) != null ? _itemDef$buffAmount : 4,
                    type: 'flat',
                    duration: 0
                  });
                } else if (itemDef.buffStat === 'def') {
                  var _itemDef$buffAmount2;

                  s.applyModifier({
                    source,
                    stat: 'def',
                    value: (_itemDef$buffAmount2 = itemDef.buffAmount) != null ? _itemDef$buffAmount2 : 3,
                    type: 'flat',
                    duration: 0
                  });
                } else if (itemDef.buffStat === 'moveSpeed') {
                  var _itemDef$buffPercent;

                  s.applyModifier({
                    source,
                    stat: 'moveSpeed',
                    value: (_itemDef$buffPercent = itemDef.buffPercent) != null ? _itemDef$buffPercent : 0.2,
                    type: 'percent',
                    duration: 0
                  });
                } // buff 持续至战斗结束 (地牢重置时清空)


                (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                  error: Error()
                }), eventBus) : eventBus).emit('item:used', itemDef.id, {
                  buff: itemDef.buffStat
                });
                return true;
              }

            case 'aoe':
              {
                var _itemDef$aoeRange;

                if (!this._battleManager) return false;

                const pos = this._player.node.getPosition();

                const radius = ((_itemDef$aoeRange = itemDef.aoeRange) != null ? _itemDef$aoeRange : 2) * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
                  error: Error()
                }), GameConfig) : GameConfig).TILE_SIZE;

                const monsters = this._battleManager.getAllMonsters();

                for (const m of monsters) {
                  const d = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
                    error: Error()
                  }), MathUtils) : MathUtils).euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);

                  if (d <= radius) {
                    // AoE 伤害
                    if (itemDef.damage) {
                      const killed = m.takeDamage(itemDef.damage, false);
                      if (killed) this._battleManager.removeMonster(m);
                    } // 冻结


                    if (itemDef.freezeDuration) {
                      m.freeze(itemDef.freezeDuration);
                    }
                  }
                }

                (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                  error: Error()
                }), eventBus) : eventBus).emit('item:used', itemDef.id, {
                  aoe: true
                });
                return true;
              }

            case 'purify':
              {
                // 净化: 恢复少量 HP + 清除 debuff
                if (itemDef.healAmount) {
                  this._player.heal(itemDef.healAmount);
                } // 清除怪物身上的 debuff 是个复杂操作, 简化处理


                (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                  error: Error()
                }), eventBus) : eventBus).emit('item:used', itemDef.id, {
                  purify: true
                });
                return true;
              }

            default:
              return false;
          }
        } // ======== 掉落系统 ========

        /** 根据怪物类型生成掉落 */


        generateDrop(roomType) {
          const config = DROP_CONFIGS[roomType];
          if (!config || !(_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).chance(config.chance)) return false;
          const itemId = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).randomPick(config.pool);
          const itemDef = ALL_ITEMS[itemId];
          if (!itemDef) return false;
          const picked = this.pickupItem(itemDef);

          if (picked) {
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('item:dropped', itemDef.name);
          }

          return picked;
        }
        /** 调用掉落 (由 BattleManager 或外部系统) */


        tryDrop(roomType) {
          if (roomType === 'boss' || roomType === 'elite' || roomType === 'normal') {
            this.generateDrop(roomType);
          }
        } // ======== 内部 ========


        _emitBagChanged() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('bag:changed', this._getBagSnapshot());
        }
        /** 获取道具名称 (供 UI 显示) */


        static getItemDef(id) {
          return ALL_ITEMS[id];
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5dc676d2360ef9c78b576c3590bf7e00fb5b0c87.js.map