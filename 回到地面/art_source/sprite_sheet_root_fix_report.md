# Sprite Sheet Root Cause Fix — 5-Step Report

## Root Cause
1. **game_assets.json 类型说谎**：角色/部分Boss/特效 sprite sheet 标记为 `type: "sprite"`，缺失 `frameWidth`/`frameHeight`/`frames`/`layout`，运行时不知要切片
2. **加载路径错**：assets.json 存储类型是 `SpriteFrame`，但 `SpriteAnimationService` 用 `loadById<Texture2D>()` 加载，路径不对

## Fixes

### Step 1 — 扫描确认帧元数据
| 类别 | 实际尺寸 | 帧参数 |
|---|---|---|
| Characters (35) | 192×768 | 4 frames @ 192×192, vertical |
| Monsters (36) | 48×48 / 64×64 / 192×192 | **单帧**（保持 sprite） |
| Boss death/phasechange (12) | 64×256 | 4 frames @ 64×64, vertical |
| Boss 其他 (78) | 256×256 / 96×96 | **单帧**（保持 sprite） |
| Effects combat (6) | 192×768 / 192×1152 | 4-6 frames @ 192×192, vertical |
| Effects reactions (11) | 192×768 | 4 frames @ 192×192, vertical |
| Effects relics (8) | 192×768 | 4 frames @ 192×192, vertical |
| Effects ui (2) | 192×576 | 3 frames @ 192×192, vertical |

### Step 2 — game_assets.json 批量修正（55 变更）
- 35 character → `sprite_sheet` + 帧元数据
- 12 boss → `sprite_sheet` + 帧元数据（仅 death/phasechange）
- 6 combat + 2 ui effect → `effect_sheet` + 帧元数据
- 其余保持 `sprite`（monsters 全部、bosses 大部分、已正确的 effects）
- 最终分布：sprite 114 / icon 67 / sprite_sheet 47 / effect_sheet 27 / tile 24 / background 17

### Step 3 — SpriteAnimationService.applyFrameByAssetDef()
- 检查 `def.type` → `sprite_sheet`/`effect_sheet` 才切片
- 加载路径：`tryLoadSpriteFrame(assetId)` → `SpriteFrame.texture` → 切片
- 非 sheet：直接返回 fullFrame（不走 Texture2D 弯路）
- 严格验证：type 是 sheet 但缺帧元数据 → 直接报错返回 false

### Step 4 — _loadSpriteFrame() 统一加载路径
- 同走 `tryLoadSpriteFrame` + `.texture` 切片
- 移除未使用的 `Texture2D` import

### Step 5 — 门禁升级（_check_type_vs_file）
- 磁盘文件是多帧 sheet 但 game_assets 声明为 sprite → **ERROR**
- 磁盘文件是单帧但 game_assets 声明为 sprite_sheet → **ERROR**
- 帧元数据与文件实际尺寸不一致 → **ERROR**
- 双向互斥校验，从源头阻断类型声明与文件内容不一致

## Validation
- `npm.cmd run validate:all` → 8/8 all checks pass ✅
