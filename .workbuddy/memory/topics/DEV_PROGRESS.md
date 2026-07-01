# Phase 2-3 开发进度

## 状态
✅ Phase 2-3 全部完成（2026-06-25）。

## Phase 2 关键交付

### M2.1-M2.5 完成
| Milestone | 核心文件 | 说明 |
|-----------|---------|------|
| Build + 遗物 | PlayerStats.ts, UpgradeManager.ts | 35 种选项（12核心+7属性+16遗物） |
| 元素反应 | ElementSystem.ts | 11 反应 + 链式触发 |
| 装备 + 词缀 + 套装 | EquipmentSystem.ts, EquipmentUI.ts | 8槽位 + 24词缀 + 6套装 |
| 魂石商店 + 角色解锁 | ShopUI.ts | 5角色 + 3天赋 |
| 道具 + 背包 | ItemSystem.ts, InventoryUI.ts | 8 消耗品 |

### PlayerStats 架构
- RuntimeStats 接口：atk/def/maxHP/moveSpeed/atkSpeed/attackRange/critChance/critMultiplier/lifeSteal/damageMultiplier/damageReduction
- StatModifier：flat/percent 类型，source-based 管理
- 计算公式：final = (base + flatMods) × (1 + percentMods)

## Phase 3 关键交付

### M3 Foundation
- Config 连接：zones.json + monsters.json 驱动怪物池/Boss/小关
- 3 种新 AI：Summoner/Suicider/Elite
- Boss 阶段系统：3/4 阶段行为树
- DAG 小关系统

### 事件系统（EventSystem）
- 8 种场景（祭坛/水晶/雕像等）
- 6 种状态检测（HP/GOLD/KEY/KILLS/FLOOR/ELEMENT）
- 12 种后果，数值对标战斗房 50-70%

### 房间变异（MutationManager）
- 12 种变异（黑暗/绯红之月/奥术风暴/时空扭曲等）
- 权重 + DDA 修正 + 互斥检查

### 全局配置化
- GameConfig.ts：150+ 数值项
- 9 个 JSON 配置表：battle/player/monsters/zones/equipment/skills/items/economy/elements

## 最近变更
- 2026-06-25：Phase 3 全部完成，MonsterController 重构完成（Phase 7 的一部分）。
- 2026-07-01：P0 架构地基落地。
  - 新增 `app/` 目录：SceneFlowService + AppFlowController（6 状态流程机）
  - 新增 `run/` 目录：RunCoordinator + RunStartConfig（地牢统一入口）
  - 新增 `render/` 目录：RuntimeLayerService（五层渲染）+ SpriteAnimationService（动画播放器）
  - 升级 UiRouter v2：UIPanel 接口 + 面板栈
  - 新增 `ui/main/` 目录：MainHubUI / AreaSelectPanel / SettlementPanel
  - 清理所有非法 `director.loadScene()` 调用，仅 SceneFlowService 允许
  - 设计文档 v1.2 定版：总原则 + P0 Architecture Rules（4 条红线 + 自查脚本）
  - 验证门禁：encoding audit + architecture gate + validate:all 全通过
