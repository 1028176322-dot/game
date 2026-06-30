# 资源接入状态

## 状态
⚠️ 部分接入 — 418 张资源三种状态必须明确区分。

## 三个状态定义

| 状态 | 含义 | 数据源 |
|------|------|--------|
| **文件存在** | PNG 文件在 `assets/resources/textures` 目录下 | 文件系统扫描 |
| **maps.json 有映射** | `assets/resources/config/assets.json` 中有该资源条目 | `assets.json` |
| **画面已接入** | 运行时通过 `RenderAssetService`/UI 代码实际显示了该资源 | 代码审计 |

## 按类别统计

### ✅ 文件存在 + assets.json 有映射 + 画面已接入（~112 张）

| 类别 | 数量 | 说明 |
|------|:----:|------|
| backgrounds | 17 | 全部通过 RenderAssetService 接入 |
| characters idle | 5 | 5角色 idle 图 |
| monsters idle | 36 | 6区域怪物 idle 图 |
| tiles | 24 | 6区域 × 4类 tile |
| characters 其余动作 | 30 | 已映射但未全部验证 |
| **小计** | **~112** | |

### ⏳ 文件存在 + assets.json 有映射，但画面未接入（~306 张）

| 类别 | 数量 | 接入障碍 |
|------|:----:|---------|
| bosses | 120 | 需 Boss 战斗表现系统调用 RenderAssetService |
| ui | 92 | 各 UI 组件需要接入（EquipmentUI/ShopUI/etc 目前使用代码生成节点） |
| icons | 67 | 技能/装备/遗物/元素 UI 需要调用 |
| effects | 27 | 战斗特效系统需要接入 |
| **小计** | **306** | |

## 关键结论
- **不得**宣称"418 个资源全部接入画面" — 当前仅约 112 张实际显示
- 后续新增资源必须同时完成三步：文件到位 → assets.json 映射 → 渲染代码接入
- 仅完成前两步就停止 = 资源实际上不可见

## 验收命令
```bash
npm run validate:all
```
- 检查 assets.json 命中率
- 检查角色/怪物/tiles/背景是否存在

## 最近变更
- 2026-06-30：首次明确三个状态定义并统计。
