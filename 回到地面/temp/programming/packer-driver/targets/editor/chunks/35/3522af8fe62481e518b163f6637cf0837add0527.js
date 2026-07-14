System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, eventBus, MathUtils, RunRng, _dec, _class, _crd, _equipIdCounter, ccclass, property, EquipmentSlot, EQUIPMENT_SLOTS, Rarity, RARITY_WEIGHTS, PREFIXES, SUFFIXES, SLOT_BASE_STATS, SET_BONUS_IDS, SLOT_NAMES, RARITY_PREFIX, EquipmentSystem;

  // ======== 套装定义 ========
  function buildSetBonuses() {
    return [{
      id: 'set_warrior',
      name: '战士之怒',
      pieceEffects: [{
        count: 2,
        description: '攻击 +15%',
        apply: s => s.applyModifier({
          source: 'set:warrior_2',
          stat: 'atk',
          value: 0.15,
          type: 'percent',
          duration: 0
        })
      }, {
        count: 6,
        description: '攻击 +35%',
        apply: s => {
          s.applyModifier({
            source: 'set:warrior_6',
            stat: 'atk',
            value: 0.35,
            type: 'percent',
            duration: 0
          });
        }
      }, {
        count: 8,
        description: '狂暴: HP<30% 时攻击翻倍',
        apply: s => s.applyModifier({
          source: 'set:warrior_8',
          stat: 'atk',
          value: 0.5,
          type: 'percent',
          duration: 0
        })
      }]
    }, {
      id: 'set_frost',
      name: '冰霜守护',
      pieceEffects: [{
        count: 2,
        description: '防御 +20%',
        apply: s => s.applyModifier({
          source: 'set:frost_2',
          stat: 'def',
          value: 0.20,
          type: 'percent',
          duration: 0
        })
      }, {
        count: 6,
        description: '被攻击时 30% 冻结攻击者 + 减伤 +10%',
        apply: s => s.applyModifier({
          source: 'set:frost_6',
          stat: 'damageReduction',
          value: 0.10,
          type: 'flat',
          duration: 0
        })
      }, {
        count: 8,
        description: '减伤 +20% + 冰甲持续反伤',
        apply: s => s.applyModifier({
          source: 'set:frost_8',
          stat: 'damageReduction',
          value: 0.20,
          type: 'flat',
          duration: 0
        })
      }]
    }, {
      id: 'set_lightning',
      name: '闪电之速',
      pieceEffects: [{
        count: 2,
        description: '移速 +15%',
        apply: s => s.applyModifier({
          source: 'set:lightning_2',
          stat: 'moveSpeed',
          value: 0.15,
          type: 'percent',
          duration: 0
        })
      }, {
        count: 6,
        description: '攻速 +25%',
        apply: s => s.applyModifier({
          source: 'set:lightning_6',
          stat: 'atkSpeed',
          value: -0.20,
          type: 'flat',
          duration: 0
        })
      }, {
        count: 8,
        description: '20% 概率追加一次攻击',
        apply: _s => {}
      }]
    }, {
      id: 'set_shadow',
      name: '暗影刺客',
      pieceEffects: [{
        count: 2,
        description: '暴击率 +10%',
        apply: s => s.applyModifier({
          source: 'set:shadow_2',
          stat: 'critChance',
          value: 0.10,
          type: 'flat',
          duration: 0
        })
      }, {
        count: 6,
        description: '暴击伤害 +50%',
        apply: s => s.applyModifier({
          source: 'set:shadow_6',
          stat: 'critMultiplier',
          value: 0.50,
          type: 'flat',
          duration: 0
        })
      }, {
        count: 8,
        description: '击败后 3 秒隐身 (怪物不追击)',
        apply: _s => {}
      }]
    }, {
      id: 'set_life',
      name: '生命之源',
      pieceEffects: [{
        count: 2,
        description: '最大生命 +25%',
        apply: s => s.applyModifier({
          source: 'set:life_2',
          stat: 'maxHP',
          value: 0.25,
          type: 'percent',
          duration: 0
        })
      }, {
        count: 6,
        description: '每秒回复 1 HP + 最大生命 +15%',
        apply: s => {
          s.applyModifier({
            source: 'set:life_6_hp',
            stat: 'maxHP',
            value: 0.15,
            type: 'percent',
            duration: 0
          });
        }
      }, {
        count: 8,
        description: '战败时满血复活一次 (每局一次)',
        apply: _s => {}
      }]
    }, {
      id: 'set_flame',
      name: '火焰之怒',
      pieceEffects: [{
        count: 2,
        description: '伤害倍率 +15%',
        apply: s => s.applyModifier({
          source: 'set:flame_2',
          stat: 'damageMultiplier',
          value: 0.15,
          type: 'percent',
          duration: 0
        })
      }, {
        count: 6,
        description: '攻击附加火焰 DoT (3秒10伤)',
        apply: _s => {}
      }, {
        count: 8,
        description: 'Overload 反应伤害翻倍 + 减CD 20%',
        apply: _s => {}
      }]
    }];
  }
  /** 套装 ID 列表 */


  // ======== 装备生成 ========
  function rollRarity() {
    const rng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
      error: Error()
    }), RunRng) : RunRng).instance.fork(`equip:rarity:${_equipIdCounter}`);
    const total = RARITY_WEIGHTS.reduce((s, e) => s + e.weight, 0);
    const roll = rng.next() * total;
    let cumulative = 0;

    for (const {
      rarity,
      weight
    } of RARITY_WEIGHTS) {
      cumulative += weight;
      if (roll < cumulative) return rarity;
    }

    return Rarity.Common;
  }

  function rollAffixes(rarity, pool) {
    // 白装无词缀, 蓝装1个, 金装2个, 橙装2个(但更高级)
    if (rarity === Rarity.Common) return null;
    if (pool.length === 0) return null;
    const affix = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
      error: Error()
    }), MathUtils) : MathUtils).randomPick(pool);
    const rarityLevel = RARITY_WEIGHTS.findIndex(e => e.rarity === rarity);
    return { ...affix,
      baseValue: affix.baseValue + affix.valuePerRarity * (rarityLevel - 1)
    };
  }

  function randomSlot() {
    return (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
      error: Error()
    }), MathUtils) : MathUtils).randomPick(EQUIPMENT_SLOTS);
  }

  function generateEquipment(slot, forceRarity) {
    var _SLOT_BASE_STATS$actu;

    const actualSlot = slot != null ? slot : randomSlot();
    const rarity = forceRarity != null ? forceRarity : rollRarity();
    const baseStats = (_SLOT_BASE_STATS$actu = SLOT_BASE_STATS[actualSlot]) != null ? _SLOT_BASE_STATS$actu : {}; // 稀有度乘数: 白 1x, 蓝 1.5x, 金 2x, 橙 3x

    const rarityMult = [1, 1.5, 2, 3][RARITY_WEIGHTS.findIndex(e => e.rarity === rarity)];
    const scaledBase = {};

    for (const [key, val] of Object.entries(baseStats)) {
      scaledBase[key] = Math.floor(val * rarityMult);
    } // 是否套装饰品 (30% 概率)


    const _id = ++_equipIdCounter;

    const equipRng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
      error: Error()
    }), RunRng) : RunRng).instance.fork(`equip:generate:${_id}`);
    const isSet = equipRng.chance(0.3);
    const setBonusId = isSet ? (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
      error: Error()
    }), MathUtils) : MathUtils).randomPick(SET_BONUS_IDS) : null; // 生成词缀

    const prefix = rarity === Rarity.Common ? null : rollAffixes(rarity, PREFIXES);
    const suffix = rarity === Rarity.Common || rarity === Rarity.Uncommon ? null : rollAffixes(rarity, SUFFIXES);
    const id = `equip_${_id}_${(_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
      error: Error()
    }), RunRng) : RunRng).instance.seed}`;

    const name = _buildEquipName(actualSlot, prefix, suffix, rarity);

    return {
      id,
      name,
      slot: actualSlot,
      rarity,
      baseStats: scaledBase,
      prefix,
      suffix,
      setBonusId
    };
  }

  function _buildEquipName(slot, prefix, suffix, rarity) {
    var _SLOT_NAMES$slot;

    const slotName = (_SLOT_NAMES$slot = SLOT_NAMES[slot]) != null ? _SLOT_NAMES$slot : '装备';
    const rarityTag = RARITY_PREFIX[rarity] ? `[${RARITY_PREFIX[rarity]}]` : '';
    const pre = prefix ? prefix.name : '';
    const suf = suffix ? suffix.name : '';
    const parts = [rarityTag, pre, slotName, suf].filter(Boolean);
    return parts.join('');
  }

  function getAffixValue(affix) {
    return Math.floor(affix.baseValue * 100) / 100;
  } // ======== 装备系统组件 ========


  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerStats(extras) {
    _reporterNs.report("PlayerStats", "./PlayerStats", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRuntimeStats(extras) {
    _reporterNs.report("RuntimeStats", "./PlayerStats", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "./IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtils(extras) {
    _reporterNs.report("MathUtils", "../utils/MathUtils", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "../core/rng/RunRng", _context.meta, extras);
  }

  _export({
    generateEquipment: generateEquipment,
    rollRarity: rollRarity
  });

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
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      MathUtils = _unresolved_3.MathUtils;
    }, function (_unresolved_4) {
      RunRng = _unresolved_4.RunRng;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bb776z46YBPZ4wpeg9pBhA8", "EquipmentSystem", undefined);
      /**
       * EquipmentSystem - 装备系统 (M2.3)
       * 
       * 8 装备槽位 + 12 格背包 + 12 前缀 + 12 后缀 + 4 稀有度 + 6 套装
       * 
       * 掉落: 普通 12% / 精英 40% / Boss 100%(必掉橙)
       * 稀有度权重: 白 50% / 蓝 30% / 金 15% / 橙 5%
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      // 装备 ID 生成计数器
      _equipIdCounter = 0;
      ({
        ccclass,
        property
      } = _decorator); // ======== 枚举 ========

      _export("EquipmentSlot", EquipmentSlot = /*#__PURE__*/function (EquipmentSlot) {
        EquipmentSlot["Head"] = "head";
        EquipmentSlot["Chest"] = "chest";
        EquipmentSlot["Weapon"] = "weapon";
        EquipmentSlot["Offhand"] = "offhand";
        EquipmentSlot["Ring1"] = "ring1";
        EquipmentSlot["Ring2"] = "ring2";
        EquipmentSlot["Boots"] = "boots";
        EquipmentSlot["Amulet"] = "amulet";
        return EquipmentSlot;
      }({}));

      _export("EQUIPMENT_SLOTS", EQUIPMENT_SLOTS = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Weapon, EquipmentSlot.Offhand, EquipmentSlot.Ring1, EquipmentSlot.Ring2, EquipmentSlot.Boots, EquipmentSlot.Amulet]);

      _export("Rarity", Rarity = /*#__PURE__*/function (Rarity) {
        Rarity["Common"] = "common";
        Rarity["Uncommon"] = "uncommon";
        Rarity["Rare"] = "rare";
        Rarity["Epic"] = "epic";
        return Rarity;
      }({}));

      _export("RARITY_WEIGHTS", RARITY_WEIGHTS = [{
        rarity: Rarity.Common,
        weight: 50,
        color: '#CCCCCC'
      }, {
        rarity: Rarity.Uncommon,
        weight: 30,
        color: '#4A90D9'
      }, {
        rarity: Rarity.Rare,
        weight: 15,
        color: '#FFA500'
      }, {
        rarity: Rarity.Epic,
        weight: 5,
        color: '#FF4500'
      }]);
      /** 词缀类型 */


      // ======== 词缀定义 ========

      /** 12 前缀 */
      _export("PREFIXES", PREFIXES = [{
        id: 'pre_strong',
        name: '强力的',
        stat: 'atk',
        baseValue: 2,
        valuePerRarity: 1.5,
        type: 'flat'
      }, {
        id: 'pre_sturdy',
        name: '坚固的',
        stat: 'def',
        baseValue: 1,
        valuePerRarity: 0.8,
        type: 'flat'
      }, {
        id: 'pre_swift',
        name: '迅捷的',
        stat: 'moveSpeed',
        baseValue: 0.05,
        valuePerRarity: 0.03,
        type: 'percent'
      }, {
        id: 'pre_crit',
        name: '暴击的',
        stat: 'critChance',
        baseValue: 0.02,
        valuePerRarity: 0.015,
        type: 'flat'
      }, {
        id: 'pre_life',
        name: '生命的',
        stat: 'maxHP',
        baseValue: 8,
        valuePerRarity: 5,
        type: 'flat'
      }, {
        id: 'pre_fire',
        name: '炽热的',
        stat: 'damageMultiplier',
        baseValue: 0.03,
        valuePerRarity: 0.02,
        type: 'percent'
      }, {
        id: 'pre_frost',
        name: '冰霜的',
        stat: 'def',
        baseValue: 1,
        valuePerRarity: 0.8,
        type: 'flat'
      }, {
        id: 'pre_lightning',
        name: '闪电的',
        stat: 'atkSpeed',
        baseValue: -0.04,
        valuePerRarity: -0.03,
        type: 'flat'
      }, {
        id: 'pre_poison',
        name: '剧毒的',
        stat: 'lifeSteal',
        baseValue: 0.02,
        valuePerRarity: 0.015,
        type: 'flat'
      }, {
        id: 'pre_shadow',
        name: '暗影的',
        stat: 'critMultiplier',
        baseValue: 0.1,
        valuePerRarity: 0.08,
        type: 'flat'
      }, {
        id: 'pre_holy',
        name: '神圣的',
        stat: 'damageReduction',
        baseValue: 0.02,
        valuePerRarity: 0.015,
        type: 'flat'
      }, {
        id: 'pre_deadly',
        name: '致命的',
        stat: 'critChance',
        baseValue: 0.03,
        valuePerRarity: 0.02,
        type: 'flat'
      }]);
      /** 12 后缀 */


      _export("SUFFIXES", SUFFIXES = [{
        id: 'suf_power',
        name: '之力量',
        stat: 'atk',
        baseValue: 2,
        valuePerRarity: 1.5,
        type: 'flat'
      }, {
        id: 'suf_guard',
        name: '之守护',
        stat: 'def',
        baseValue: 1,
        valuePerRarity: 0.8,
        type: 'flat'
      }, {
        id: 'suf_agile',
        name: '之敏捷',
        stat: 'moveSpeed',
        baseValue: 0.05,
        valuePerRarity: 0.03,
        type: 'percent'
      }, {
        id: 'suf_precise',
        name: '之精准',
        stat: 'critChance',
        baseValue: 0.02,
        valuePerRarity: 0.015,
        type: 'flat'
      }, {
        id: 'suf_vigor',
        name: '之活力',
        stat: 'maxHP',
        baseValue: 8,
        valuePerRarity: 5,
        type: 'flat'
      }, {
        id: 'suf_flame',
        name: '之火焰',
        stat: 'damageMultiplier',
        baseValue: 0.03,
        valuePerRarity: 0.02,
        type: 'percent'
      }, {
        id: 'suf_ice',
        name: '之寒冰',
        stat: 'attackRange',
        baseValue: 0.2,
        valuePerRarity: 0.15,
        type: 'flat'
      }, {
        id: 'suf_thunder',
        name: '之雷霆',
        stat: 'atkSpeed',
        baseValue: -0.04,
        valuePerRarity: -0.03,
        type: 'flat'
      }, {
        id: 'suf_venom',
        name: '之毒液',
        stat: 'lifeSteal',
        baseValue: 0.02,
        valuePerRarity: 0.015,
        type: 'flat'
      }, {
        id: 'suf_shadow',
        name: '之暗影',
        stat: 'critMultiplier',
        baseValue: 0.1,
        valuePerRarity: 0.08,
        type: 'flat'
      }, {
        id: 'suf_light',
        name: '之光',
        stat: 'damageReduction',
        baseValue: 0.02,
        valuePerRarity: 0.015,
        type: 'flat'
      }, {
        id: 'suf_ruin',
        name: '之毁灭',
        stat: 'atk',
        baseValue: 3,
        valuePerRarity: 2,
        type: 'flat'
      }]);
      /** 各部位基础属性 */


      SLOT_BASE_STATS = {
        [EquipmentSlot.Weapon]: {
          atk: 5
        },
        [EquipmentSlot.Head]: {
          maxHP: 15
        },
        [EquipmentSlot.Chest]: {
          def: 2
        },
        [EquipmentSlot.Offhand]: {
          def: 1,
          maxHP: 5
        },
        [EquipmentSlot.Ring1]: {
          atk: 2,
          critChance: 0.01
        },
        [EquipmentSlot.Ring2]: {
          atk: 2,
          critChance: 0.01
        },
        [EquipmentSlot.Boots]: {
          moveSpeed: 15
        },
        [EquipmentSlot.Amulet]: {
          maxHP: 10,
          damageMultiplier: 0.02
        }
      };
      SET_BONUS_IDS = ['set_warrior', 'set_frost', 'set_lightning', 'set_shadow', 'set_life', 'set_flame'];

      _export("SLOT_NAMES", SLOT_NAMES = {
        [EquipmentSlot.Head]: '头盔',
        [EquipmentSlot.Chest]: '胸甲',
        [EquipmentSlot.Weapon]: '武器',
        [EquipmentSlot.Offhand]: '副手',
        [EquipmentSlot.Ring1]: '戒指',
        [EquipmentSlot.Ring2]: '戒指',
        [EquipmentSlot.Boots]: '靴子',
        [EquipmentSlot.Amulet]: '项链'
      });

      _export("RARITY_PREFIX", RARITY_PREFIX = {
        [Rarity.Common]: '',
        [Rarity.Uncommon]: '精良',
        [Rarity.Rare]: '稀有',
        [Rarity.Epic]: '传说'
      });

      _export("EquipmentSystem", EquipmentSystem = (_dec = ccclass('EquipmentSystem'), _dec(_class = class EquipmentSystem extends Component {
        constructor(...args) {
          super(...args);
          this._player = null;
          this._playerStats = null;

          /** 当前装备 (8 槽) */
          this._equipped = new Map();

          /** 背包 (12 格) */
          this._backpack = new Array(12).fill(null);

          /** 套装定义 */
          this._setBonuses = [];

          /** 当前激活的套装效果 source 列表 */
          this._activeSetSources = [];
        }

        init(player) {
          this._player = player;
          this._playerStats = player.stats;
          this._setBonuses = buildSetBonuses();
        }
        /** 重置装备 (新地牢) */


        resetEquipment() {
          this._equipped.clear();

          this._backpack = new Array(12).fill(null);

          this._clearSetBonuses();
        } // ======== 装备操作 ========

        /** 装备一个物品到指定槽位 (返回被替换下的旧装备) */


        equip(item, targetSlot) {
          var _this$_equipped$get;

          const slot = targetSlot != null ? targetSlot : item.slot; // 检查槽位匹配

          if (targetSlot && item.slot !== targetSlot && slot !== EquipmentSlot.Ring1 && slot !== EquipmentSlot.Ring2) {
            console.warn(`[EquipmentSystem] 物品槽位不匹配: ${item.slot} ≠ ${slot}`);
            return null;
          }

          const old = (_this$_equipped$get = this._equipped.get(slot)) != null ? _this$_equipped$get : null;

          this._equipped.set(slot, item);

          this._applyEquipStats();

          this._recalcSetBonuses();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('equip:changed', slot, item, old);
          return old;
        }
        /** 卸下装备 (回到背包) */


        unequip(slot) {
          var _this$_equipped$get2;

          const item = (_this$_equipped$get2 = this._equipped.get(slot)) != null ? _this$_equipped$get2 : null;
          if (!item) return null; // 尝试放入背包

          const idx = this._backpack.findIndex(e => e === null);

          if (idx >= 0) {
            this._backpack[idx] = item;

            this._equipped.delete(slot);

            this._applyEquipStats();

            this._recalcSetBonuses();

            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('equip:unequipped', slot, item);
            return item;
          }

          console.warn('[EquipmentSystem] 背包已满');
          return null;
        }
        /** 从背包丢弃 */


        discardFromBackpack(index) {
          if (index >= 0 && index < this._backpack.length) {
            this._backpack[index] = null;
          }
        }
        /** 背包中移动物品 (交换) */


        swapBackpack(from, to) {
          const a = this._backpack[from];
          const b = this._backpack[to];

          if (a && b) {
            this._backpack[from] = b;
            this._backpack[to] = a;
          } else if (a) {
            this._backpack[from] = null;
            this._backpack[to] = a;
          } else if (b) {
            this._backpack[to] = null;
            this._backpack[from] = b;
          }
        }
        /** 获取当前槽位的装备 */


        getEquipped(slot) {
          var _this$_equipped$get3;

          return (_this$_equipped$get3 = this._equipped.get(slot)) != null ? _this$_equipped$get3 : null;
        }
        /** 获取全部已装备 */


        getAllEquipped() {
          return EQUIPMENT_SLOTS.map(s => this._equipped.get(s)).filter(Boolean);
        }
        /** 获取背包内容 */


        getBackpack() {
          return this._backpack;
        }
        /** 获取空闲背包格子数 */


        get freeBackpackSlots() {
          return this._backpack.filter(e => e === null).length;
        }
        /** 尝试拾取装备到背包 */


        pickupToBackpack(item) {
          const idx = this._backpack.findIndex(e => e === null);

          if (idx >= 0) {
            this._backpack[idx] = item;
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('equip:picked_up', item);
            return true;
          }

          return false;
        } // ======== 属性 ========

        /** 应用装备属性到 PlayerStats */


        _applyEquipStats() {
          if (!this._playerStats) return; // 清除所有装备来源的修饰符

          this._playerStats.removeModifiersByPrefix('equip:');

          this._playerStats.removeModifiersByPrefix('set:');

          for (const [slot, item] of this._equipped) {
            // 基础属性
            for (const [stat, val] of Object.entries(item.baseStats)) {
              if (val !== 0) {
                this._playerStats.applyModifier({
                  source: `equip:${slot}:base:${stat}`,
                  stat: stat,
                  value: val,
                  type: 'flat',
                  duration: 0
                });
              }
            } // 词缀属性


            if (item.prefix) {
              this._playerStats.applyModifier({
                source: `equip:${slot}:prefix`,
                stat: item.prefix.stat,
                value: getAffixValue(item.prefix),
                type: item.prefix.type,
                duration: 0
              });
            }

            if (item.suffix) {
              this._playerStats.applyModifier({
                source: `equip:${slot}:suffix`,
                stat: item.suffix.stat,
                value: getAffixValue(item.suffix),
                type: item.suffix.type,
                duration: 0
              });
            }
          }
        } // ======== 套装系统 ========

        /** 计算当前激活的套装效果并应用 */


        _recalcSetBonuses() {
          this._clearSetBonuses(); // 统计各套装装备数


          const setCount = new Map();

          for (const [, item] of this._equipped) {
            if (item.setBonusId) {
              var _setCount$get;

              setCount.set(item.setBonusId, ((_setCount$get = setCount.get(item.setBonusId)) != null ? _setCount$get : 0) + 1);
            }
          } // 应用套装效果


          for (const bonus of this._setBonuses) {
            var _setCount$get2;

            const count = (_setCount$get2 = setCount.get(bonus.id)) != null ? _setCount$get2 : 0;

            for (const effect of bonus.pieceEffects) {
              if (count >= effect.count) {
                const source = `set:${bonus.id}:${effect.count}`;
                effect.apply(this._playerStats);

                this._activeSetSources.push(source);
              }
            }
          }
        }

        _clearSetBonuses() {
          for (const src of this._activeSetSources) {
            var _this$_playerStats;

            (_this$_playerStats = this._playerStats) == null || _this$_playerStats.removeModifier(src);
          }

          this._activeSetSources = [];
        }
        /** 获取当前已激活的套装信息 */


        getActiveSetBonuses() {
          const setCount = new Map();

          for (const [, item] of this._equipped) {
            if (item.setBonusId) {
              var _setCount$get3;

              setCount.set(item.setBonusId, ((_setCount$get3 = setCount.get(item.setBonusId)) != null ? _setCount$get3 : 0) + 1);
            }
          }

          const result = [];

          for (const bonus of this._setBonuses) {
            var _setCount$get4;

            const count = (_setCount$get4 = setCount.get(bonus.id)) != null ? _setCount$get4 : 0;

            if (count > 0) {
              const activeEffects = bonus.pieceEffects.filter(e => count >= e.count).map(e => e.description);
              result.push({
                id: bonus.id,
                name: bonus.name,
                count,
                effects: activeEffects
              });
            }
          }

          return result;
        } // ======== 掉落系统 ========

        /** 生成一个随机掉落 (根据房间类型) */


        generateDrop(roomType) {
          switch (roomType) {
            case 'normal':
              return (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
                error: Error()
              }), MathUtils) : MathUtils).chance(0.12) ? generateEquipment() : null;

            case 'elite':
              if ((_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
                error: Error()
              }), MathUtils) : MathUtils).chance(0.4)) {
                return generateEquipment(undefined, (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
                  error: Error()
                }), MathUtils) : MathUtils).chance(0.5) ? Rarity.Uncommon : undefined);
              }

              return null;

            case 'boss':
              return generateEquipment(undefined, Rarity.Epic);
          }
        }
        /** 生成指定数量的掉落池 */


        generateDrops(roomType, count) {
          const drops = [];

          for (let i = 0; i < count * 2; i++) {
            const drop = this.generateDrop(roomType);

            if (drop && this._backpack.some(e => e === null)) {
              drops.push(drop);
              if (drops.length >= count) break;
            }
          } // 确保至少 boss 房有不占背包位的掉落


          if (roomType === 'boss' && drops.length === 0) {
            drops.push(generateEquipment(undefined, Rarity.Epic));
          }

          return drops;
        } // ======== 背包操作 (UI 绑定) ========

        /** 统计各种稀有度数量 */


        getRarityCounts() {
          const counts = {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0
          };

          for (const item of this._backpack) {
            if (item) counts[item.rarity]++;
          }

          for (const [, item] of this._equipped) {
            if (item) counts[item.rarity]++;
          }

          return counts;
        }
        /** 总装备等级估值 (用于战力显示) */


        getTotalPowerLevel() {
          let total = 0;

          for (const [, item] of this._equipped) {
            if (!item) continue;
            let power = 0;

            for (const val of Object.values(item.baseStats)) {
              power += Math.abs(val);
            }

            if (item.prefix) power += Math.abs(getAffixValue(item.prefix)) * 2;
            if (item.suffix) power += Math.abs(getAffixValue(item.suffix)) * 2;
            total += power;
          }

          return Math.floor(total);
        }

      }) || _class));
      /** 导出生成函数 (外部可用) */


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3522af8fe62481e518b163f6637cf0837add0527.js.map