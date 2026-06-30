# 回到地面 · 配置管理工具

> **版本**: v1.0 | **日期**: 2026-06-25
> **功能**: Excel ↔ JSON 双向转换，可视化数值编辑

---

## 使用方式

### 方法一（推荐）：编辑 Excel → 导出 JSON

```
1. 打开 tools/config_tool/config_template.xlsx
2. 修改数值（灰底=只读, 白底=可编辑）
3. 运行: python tools/config_tool/export.py
4. 生成的 JSON 自动写入 assets/resources/config/
5. 重启游戏 → 新配置生效
```

### 方法二：直接改 JSON

```
编辑器打开 assets/resources/config/*.json
找到对应配置项 → 修改数值 → 保存 → 重启游戏
```

### 方法三：直接用 Excel 打开 JSON

```
最推荐的方式:
1. 打开 Excel → 数据 → 获取数据 → 从文件 → 从 JSON
2. 选择 assets/resources/config/*.json
3. 在 Excel 中修改数值
4. 另存为 JSON → 覆盖原文件
```

---

## 适用的修改场景

### 哪里直接改 JSON（简单键值对）

```json
// 直接打开 battle.json 改:
{ "baseInterval": 1.0 }    → 直接改成 0.8
{ "minDamage": 1 }         → 直接改成 2
```

**适合**: 战斗参数、经济数值、广告参数等单层键值对

### 哪里用 Excel 改（大量行数据）

> 36 种怪物属性、6 个区域 27 个小关的配置

```json
// 如果在 JSON 里改 36 条怪物数据很累:
"forest": {
    "slime": { "hp": 12, "atk": 3, "def": 0 },
    "mushroom": { "hp": 10, "atk": 2, "def": 1 },
    // ... 30 多行
}
```

**适合**: 怪物属性表、装备词缀表、关卡配置表等表格式数据

### 哪里直接改 TypeScript（全局常量）

```typescript
// 改 GameConfig.ts 比 JSON 更方便:
AUTO_ATTACK_INTERVAL: 1.0,  // 全局攻速
CRIT_MULTIPLIER: 1.5,      // 全局暴击倍率
```

**适合**: 只需要改 1~2 个值、且是全局生效的配置

---

## 实际案例

### 场景：你觉得怪物太肉了

```
改了2个区域6个怪物的 HP，要改 30 个数字
如果在 JSON 里一个一个搜 → 累
如果在 Excel 里拉一列改 → 3 秒

直接用 Excel 打开 monsters.json:
  数据 → 获取数据 → 从文件 → 从 JSON
  选 monsters.json
  找到 hp 列 → 全部减 2 → 保存
  覆盖回原文件 → 完成
```

### 场景：你想改掉落概率

```json
// 直接打开 items.json 改:
"normalMonster": { "chance": 0.12 }  → 改成 0.15
"eliteMonster": { "chance": 0.40 }   → 改成 0.45
```

2 个数字 → 直接改 JSON, 不需要开 Excel。

---

## 配置覆盖优先级（改不生效时排查）

```
修改不生效时, 按这个顺序排查:

1. GameConfig.ts (编译期常量, 覆盖同名的 JSON 值)
2. assets/resources/config/ 下的 JSON
3. assets/resources/config/env/dev.json (开发环境覆盖)

例: 
  你在 battle.json 改了 baseInterval 为 0.5
  但 GameConfig.ts 的 AUTO_ATTACK_INTERVAL 还是 1.0
  → 运行时读取的是 GameConfig.ts 的值 (优先级更高)
  → 两个地方的对应关系:
     GameConfig.AUTO_ATTACK_INTERVAL ↔ battle.json.baseInterval
```

---

## 常用配置速查

| 你想改什么 | 改哪个文件 | 改哪个字段 |
|-----------|-----------|-----------|
| 攻击速度 | `battle.json` | `autoAttack.baseInterval` |
| 翻滚无敌帧 | `battle.json` | `dodge.duration` |
| 暴击率 | `battle.json` | `crit.baseChance` |
| 暴击伤害 | `battle.json` | `crit.multiplier` |
| 初始 HP | `player.json` | `baseStats.maxHP` |
| 移速 | `player.json` | `baseStats.moveSpeed` |
| 掉落概率 | `items.json` | `dropRates.normalMonster.chance` |
| 商店钥匙价格 | `economy.json` | `shop.keyPrice` |
| 魂石产出 | `economy.json` | `soulStone.baseRate` |
| 怪物血量 | `monsters.json` | 对应区域的怪物 `hp` |
| 关卡房间数 | `zones.json` | 对应区域的 `stages.XXX.rooms` |
| Boss HP | `zones.json` | 对应区域的 `finalBoss.hp` |
| 技能 CD | `skills.json` | `activeSkills[].cd` |
| 核心能力效果 | `skills.json` | `coreAbilities[].effect` |
| 套装效果 | `equipment.json` | `sets.XXX.twoPieceEffect` |
| 元素反应伤害 | `elements.json` | `reactions[].damageMultiplier` |
| 广告复活比例 | `economy.json` | `ads.reviveHpRatio` |
