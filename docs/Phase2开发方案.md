# Phase 2 开发方案：肉鸽系统构筑

> **状态**: 方案待确认 | **日期**: 2026-06-25
> **基于**: README.md / 实施路线图.md / MEMORY.md
> **前置**: Phase 1 (26 文件, ~3000+ 行) ✅ 代码完成

---

## 1. 现状扫描

| 模块 | 状态 | 说明 |
|------|------|------|
| 核心框架 (5文件) | ✅ | EventBus/GameManager/ConfigManager/PoolManager/Constants 完备 |
| 战斗系统 (5文件) | ✅ | Player/Monster(3AI)/AutoAttack/SkillSystem 完备 |
| 地牢生成 (4文件) | ✅ | DAG/Grid/RoomTransition/DungeonManager 完备 |
| UI 系统 (8文件) | ✅ | 摇杆/HUD/技能/地图/强化/觉悟/启动/主界面 完备 |
| 微信适配 (1文件) | ✅ | 广告(占位ID)/存储/上报 完备 |
| **Build 实际效果** | ❌ | 35选项仅有UI描述，**未连接到实际游戏逻辑** |
| **遗物系统** | ⚠️ | 16种遗物只定义了7种被动名+描述，**0种有实际效果** |
| **元素反应** | ❌ | 仅有 ElementType 枚举，无反应逻辑 |
| **装备系统** | ❌ | 完全不存在 |
| **魂石商店** | ❌ | 仅结算有魂石计算，无商店/永久存档 |
| **角色解锁** | ❌ | 无角色选择/解锁/天赋系统 |
| **道具背包** | ❌ | ConfigManager 有掉落配置，无道具/背包逻辑 |

---

## 2. 实施策略

### 2.1 依赖关系

```
M2.1 (Build+遗物) ───→ M2.3 (装备) ───→ M2.5 (道具+背包)
       │                      │
       └──→ M2.2 (元素反应) ──┘
       │
       └──→ M2.4 (魂石商店+角色)
```

**建议顺序**: M2.1 → M2.2 → M2.3 → M2.4 → M2.5

**原因**: 
- M2.1 是 Build 循环的基础，影响后续所有系统
- M2.2 独立的战斗扩展，可与 M2.3 并行
- M2.3 装备依赖于 Build 系统中"装备即是一种 Build 维度"的抽象
- M2.4 魂石商店需要在核心玩法完善后才有购买动力
- M2.5 道具背包是最后的锦上添花

---

## 3. 架构变更

### 3.1 新增核心概念：运行时玩家属性

Phase 1 中 PlayerController 的属性是硬编码的 (`atk:10, def:3, maxHP:100`)，Phase 2 需要动态属性：

```
玩家最终属性 = 基础属性(Base) + Build增益(Build) + 装备增益(Equip) + 遗物增益(Relic)
```

**设计方案**: 新增 `PlayerStats` 模块，统一管理属性叠加

```typescript
interface RuntimeStats {
    atk: number;       // 基础10 + Build增益 + 装备 + 遗物
    def: number;       // 基础3 + ...
    maxHP: number;     // 基础100 + ...
    moveSpeed: number; // 基础200 + ...
    atkSpeed: number;  // 基础1.0秒间隔 → 攻速缩短间隔
    critChance: number;// 基础5% + ...
    critMultiplier: number; // 基础1.5x + ...
    attackRange: number;    // 基础2.0格 + ...
}
```

### 3.2 新增核心概念：元素附着

```
攻击(Fire元素) → 怪物获得[Fire]状态
另一攻击(Frost元素) → 怪物有[Fire][Frost] → 触发 Melt反应
反应后元素消耗/残留
→ 可能在链式反应中触发第三反应
```

### 3.3 新增核心概念：永久存档

```
PlayerData:
  - soulStones: number        // 永久魂石总量
  - unlockedCharacters: string[] // 已解锁角色
  - unlockedRelics: string[]  // 已解锁遗物池
  - selectedTalent: string    // 已选天赋
  - runHistory: RunRecord[]   // 最近N局记录
```

---

## 4. 文件变更清单

### M2.1: Build 3选1 + 遗物系统 (预计 5 天工作量)

| 操作 | 文件 | 变更内容 |
|------|------|----------|
| **修改** | `ui/UpgradeUI.ts` | 补全剩余9种遗物+8种主动遗物, 选中后emit效果事件 |
| **修改** | `battle/PlayerController.ts` | 增加运行时属性叠加层, 暴露 `applyBuff/removeBuff` |
| **修改** | `battle/AutoAttack.ts` | 钩入核心能力(二段斩/旋风斩/闪电链/淬毒等) |
| **修改** | `battle/SkillSystem.ts` | 增强遗物技能绑定, 8种主动遗物技能效果 |
| **修改** | `battle/BattleManager.ts` | 钩入遗物(荆棘甲/狂战斧等), 战斗开始触发怒吼 |
| **新增** | `battle/PlayerStats.ts` | 属性叠加层: Base + Buff + Equip + Relic |
| **新增** | `battle/AbilityResolver.ts` | 12种核心能力效果解析 + 应用 |
| **新增** | `battle/RelicResolver.ts` | 16种遗物效果解析 + 应用 |

### M2.2: 元素反应系统 (预计 3 天工作量)

| 操作 | 文件 | 变更内容 |
|------|------|----------|
| **新增** | `battle/ElementSystem.ts` | 6元素附着/11种反应/链式反应/种子确定性 |
| **修改** | `battle/AutoAttack.ts` | 攻击时传递元素类型 |
| **修改** | `battle/MonsterController.ts` | 增加元素状态跟踪, takeDamage 增加元素参数 |
| **修改** | `battle/BattleManager.ts` | 集成元素反应系统 |
| **修改** | `ui/BattleHUD.ts` | 增加元素图标显示, 反应文字特效 |

### M2.3: 装备系统 + 词缀 + 套装 (预计 4 天工作量)

| 操作 | 文件 | 变更内容 |
|------|------|----------|
| **新增** | `battle/EquipmentSystem.ts` | 8槽位装备/词缀(12+12)/稀有度/套装(6套) |
| **新增** | `ui/EquipmentUI.ts` | 8槽位UI/背包12格/套装计数器 |
| **修改** | `battle/PlayerStats.ts` | 集成装备属性加成 |
| **修改** | `dungeon/DungeonManager.ts` | Boss房必掉橙装 |
| **修改** | `core/ConfigManager.ts` | 装备配置表 + 词缀配置表 + 套装配置表 |

### M2.4: 魂石商店 + 角色解锁 (预计 3 天工作量)

| 操作 | 文件 | 变更内容 |
|------|------|----------|
| **新增** | `ui/ShopUI.ts` | 魂石商店 UI + 角色/遗物解锁列表 |
| **新增** | `core/PlayerDataManager.ts` | 永久存档读写(单写入口) |
| **新增** | `core/CharacterConfig.ts` | 5个角色配置(战士/弓手/刺客/法师/狂战士) |
| **新增** | `core/TalentSystem.ts` | 3种天赋(贪婪/探索者/铁胃) |
| **修改** | `ui/MainUI.ts` | 增加商店按钮 + 角色选择 |
| **修改** | `ui/DeathUI.ts` | 魂石结算存入永久存档 |
| **修改** | `core/GameManager.ts` | 角色选择状态管理 |
| **修改** | `core/Constants.ts` | 新增角色/天赋相关枚举 |

### M2.5: 道具系统 + 背包 (预计 3 天工作量)

| 操作 | 文件 | 变更内容 |
|------|------|----------|
| **新增** | `battle/ItemSystem.ts` | 8种消耗品数据/掉落/使用效果 |
| **新增** | `ui/InventoryUI.ts` | 5格背包UI/叠加/快捷键 |
| **修改** | `battle/BattleManager.ts` | 怪物死亡掉落集成 |
| **修改** | `dungeon/DungeonManager.ts` | 商店移除消耗品 |

---

## 5. 核心设计决策

### 5.1 属性叠加架构

```
PlayerController (原属性)
    ↓
PlayerStats (运行时层)
    ├── base: 基础属性 (PlayerController 原始值)
    ├── buffs: Map<string, StatModifier>  // Build增益
    ├── relicBuffs: Map<string, StatModifier> // 遗物增益
    └── equipBuffs: EquipmentStats // 装备增益
    
    finalStats(): RuntimeStats  // 所有来源叠加计算
```

### 5.2 选项效果流程（M2.1 核心）

```
玩家点击选项
    ↓
UpgradeUI._onSelectOption(option)
    ↓
eventBus.emit('upgrade:selected', option)
    ↓
PlayerStats.applyBuff(option.id)  // 应用增益
    ↓
如果是遗物技能 → SkillSystem.equipSkill(RelicSlot, relicSkill)
    ↓
eventBus.emit('upgrade:complete')
    ↓
关闭强化房面板
```

### 5.3 元素反应枚举 (11 种)

| 元素A | 元素B | 反应名 | 效果 |
|-------|-------|--------|------|
| Fire | Frost | Melt (融化) | 2x 伤害, 移除两元素 |
| Fire | Lightning | Overload (超载) | 小范围 AoE 爆炸 |
| Fire | Poison | Burn (灼烧) | 持续伤害 3s, 移除 Poison |
| Fire | Shadow | Explosion (爆裂) | 大范围 AoE, 移除两元素 |
| Frost | Lightning | Superconduct (超导) | -50% 防御 5s |
| Frost | Poison | Freeze (冻结) | 定身 2s |
| Frost | Shadow | Brittle (脆化) | +30% 受伤 5s |
| Lightning | Poison | Conduct (传导) | 扩散到相邻怪物 |
| Lightning | Shadow | Silence (沉默) | 怪物无法攻击 3s |
| Poison | Shadow | Decay (衰败) | 每跳递增伤害 5s |
| Fire/Water/Frost | Holy | Purify (净化) | 移除异常 + 回血 |

### 5.4 魂石经济闭环

```
战斗击杀 → 魂石掉落(每局) 
    ↓
觉悟战结算 → 魂石转入永久存档
    ↓
主界面商店 → 消耗永久魂石
    ├── 解锁新角色 (500-2000魂石)
    ├── 解锁遗物池 (300-800魂石)
    └── 升级天赋 (1000魂石)
```

---

## 6. 风险与注意事项

| 风险 | 等级 | 应对 |
|------|------|------|
| 包体膨胀超4MB | 🔴 | 所有新增代码保持纯逻辑, 不引入外部库 |
| 属性叠加层影响性能 | 🟡 | 每次攻击时计算 finalStats, 非每帧刷新 |
| 元素链式反应死循环 | 🔴 | 限制链式反应深度 ≤ 3 次 |
| 存档兼容性 | 🟡 | 新增字段必须兼容旧存档, 用 `??` 提供默认值 |
| 装备系统复杂度 | 🟡 | 装�备UI使用代码生成节点, 不依赖Prefab |

---

## 7. 实施顺序（推荐）

```
Step 1: PlayerStats + 属性叠加架构  ← 基础必须先打好
Step 2: UpgradeUI 补全 + 效果连接     ← M2.1核心
Step 3: RelicResolver + 遗物技能     ← M2.1核心
Step 4: AbilityResolver + 12能力效果  ← M2.1核心
Step 5: ElementSystem + 11反应       ← M2.2
Step 6: EquipmentSystem + 词缀套装   ← M2.3
Step 7: EquipmentUI + 装备界面       ← M2.3
Step 8: PlayerDataManager + 魂石商店 ← M2.4
Step 9: CharacterConfig + 角色解锁   ← M2.4
Step 10: ItemSystem + 道具背包       ← M2.5
```
