# 运行时自动装配与渲染接入

## 状态
⚠️ 部分完成 — 主战斗渲染链已完成（背景/角色/怪物/tiles），UI/effects/icons/bosses 待接入。

## 强制规则
- **不得在 Cocos 编辑器里手动拖 SpriteFrame/组件引用**作为主方案
- 资源必须通过 `AssetBundleService`（资源映射）→ `RenderAssetService`（应用到 Sprite）链路接入
- 资源 ID 生成走 `ArtResourceResolver`，不得散落硬编码路径

## 当前实现

### 已建立的资源链
1. `AssetBundleService.ts` — 加载 `config/assets.json` 的唯一入口
2. `ArtResourceResolver.ts` — 按角色/怪物/地块/背景规则生成资源 ID
3. `RenderAssetService.ts` — 将资源 ID 应用到 Sprite，失败时只警告不阻断
4. `DungeonSceneInstaller.ts` — 创建地牢运行时节点结构

### 已接入渲染链（✅）
| 类型 | 条目数 | 说明 |
|------|:------:|------|
| backgrounds | 17 | bg_combat/bg_event/bg_room 全部接入 |
| characters | 35 | 5角色 idle 图接入 |
| monsters | 36 | 6区域 idle 图接入 |
| tiles | 24 | 6区域 × 4类 tile 接入 |

### 待接入（⏳ 仅在 assets.json 有映射）
| 类型 | 条目数 | 待接入系统 |
|------|:------:|-----------|
| bosses | 120 | Boss 战斗表现系统 |
| ui | 92 | 各 UI 组件 |
| icons | 67 | 技能/装备/遗物 UI |
| effects | 27 | 战斗特效系统 |

## 禁止事项
- ❌ 宣称"418 个资源全部接入画面" — 当前仅接入 ~112 张
- ❌ 把组件直接 `addComponent` 到 Scene 本体上（Cocos 不允许）

## 关键踩坑
- `GameBootstrap.ensure(root)` 不能加在 Scene 上，必须创建子节点
- `EventBus.emit` 必须 `entry.callback.apply(entry.target, args)`，否则 `this` 丢失
- Cocos 浏览器预览可能跑旧 chunk，修改源码后需重开编辑器
- 乱码注释可能吞代码，修改核心脚本后必须扫乱码风险

## 验收命令
```bash
npm run validate:all
# 额外的资源 ID 命中检查
# Cocos 预览检查三端 (浏览器/微信开发者工具/真机)
```

## 最近变更
- 2026-06-30：新增 RenderAssetService，完成主战斗渲染链接入。
