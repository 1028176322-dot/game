# UI 文本配置化与美术无文字整改方案

更新时间：2026-06-29

## 1. 总结论

本项目是微信小游戏，所有玩家可读文本必须由运行时代码渲染，来源必须是配置表或业务数据，不允许烘焙进任何图片资源。

统一规则：

- 美术资源只负责形状、材质、图标、装饰、背景、角色、怪物、特效。
- 所有标题、按钮文字、数字、价格、倒计时、房间名、技能名、物品名、Logo 字、伪英文、伪文字，都必须走 `Cocos Label/RichText + TextManager + text.json`。
- `prompts.json` 里的所有后续生图提示词都必须明确写入“无烘焙文字”要求。
- 生成后必须人工看 contact sheet，任何可读文字、伪文字、英文、数字都判定失败并重做。

关键文件：

```text
E:/game/回到地面/assets/resources/config/text.json
E:/game/回到地面/assets/scripts/core/TextManager.ts
E:/game/assets/resources/config/prompts.json
E:/game/tools/gen_missing_179.py
```

## 2. 当前问题

### 2.1 美术侧

已经出现过这些问题：

- `btn_close.png` 被生成成装饰徽章/头像，不是关闭按钮。
- 技能图标、套装图标、地图图标中出现英文、伪英文、`CRITICAL` 等文字。
- UI 背景图中出现英文标题。
- 部分图标通过图案表达文字含义，例如字母徽章、数字、缩写。

这些资源即使技术参数通过，也不能进入正式替换。

### 2.2 代码侧

项目已有 `text.json` 和 `TextManager.ts`，但存在两个问题：

- `TextManager.ts`、`ConfigManager.ts`、`text.json` 中大量中文注释或默认文本显示为乱码，后续维护容易误判。
- 部分 UI 代码仍然硬编码玩家可见文本，例如商店标题、继续按钮、版本号、倒计时提示、装备/道具标题等。

### 2.3 配置侧

`text.json` 目前已经有基础结构，但 key 不够细，且部分文本乱码。需要整理成稳定、可审查、可扩展的配置表。

## 3. 所有类别资源的无文字规则

| 类别 | 是否允许图片内可读文字 | 处理原则 |
|---|---:|---|
| UI | 否 | 按钮、面板、标题装饰、商店面板必须留空，由 Label 叠加文字 |
| Icons | 否 | 图标只能是道具/技能/套装符号，不允许字母、数字、徽章文字 |
| Backgrounds | 否 | 背景中书页、木牌、石碑、招牌必须空白或抽象纹理 |
| Characters | 否 | 角色衣服、盾牌、武器、旗帜不能有文字/数字/标记词 |
| Monsters | 否 | 怪物身体、护甲、武器不能有文字/数字/符文文字 |
| Bosses | 否 | Boss 装饰只能是抽象纹样，不能出现符文文字/徽章文字 |
| Effects | 否 | 特效不能出现 CRIT/MISS/数字伤害/字母爆字 |
| Tiles | 否 | 地块只能表现材质，不能有符号、字母、数字 |

允许的图形例外：

- 关闭按钮可以用“两条交叉的圆角线”作为图形符号，但不能生成英文字母 `X` 的字体字形。
- 道具图标可以有抽象符号，例如星形、叶片、宝石、爪印、箭头、盾牌轮廓，但不能有可读字符。
- 背景中可以有书、卷轴、牌匾，但表面必须无文字。

## 4. 配置表规范

### 4.1 text.json 推荐结构

路径：

```text
E:/game/回到地面/assets/resources/config/text.json
```

推荐结构：

```json
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2026-06-29",
    "description": "全局玩家可见文本配置"
  },
  "ui": {
    "hp": "生命: {cur}/{max}",
    "floor": "第 {floor} 层",
    "defeat": "击败: {count}",
    "version": "v{version}",
    "common": {
      "close": "关闭",
      "continue": "继续冒险",
      "select": "选择",
      "equipped": "已装备",
      "owned": "已拥有",
      "price": "{cost}"
    },
    "shop": {
      "title": "魂石商店",
      "tabCharacters": "角色",
      "tabTalents": "天赋",
      "tabExtras": "扩展",
      "soulStone": "魂石: {count}",
      "extraRelicPoolName": "遗物池扩展",
      "extraRelicPoolDesc": "解锁更多遗物进入选项池"
    },
    "inventory": {
      "title": "道具",
      "hint": "按 1-5 使用"
    },
    "equipment": {
      "title": "装备",
      "setTitle": "套装:\n{sets}",
      "emptySlot": "[{slot}]"
    },
    "map": {
      "explorer": "探索者 - 地图全开"
    },
    "event": {
      "autoSelect": "自动选择: {secs}s"
    },
    "marquee": {
      "title": "跑马灯",
      "progressHint": "看广告点亮跑马灯，3 格领钥匙！",
      "continue": "继续冒险",
      "getKey": "获得一把钥匙！",
      "progress": "进度: {lit}/{total}  看广告点亮 1 格"
    }
  },
  "room": {
    "combat": "战",
    "treasure": "宝",
    "healing": "泉",
    "shop": "店",
    "upgrade": "强",
    "event": "?",
    "boss": "王",
    "start": "始",
    "unknown": "?"
  }
}
```

### 4.2 配置规则

- key 使用稳定英文路径，不使用中文 key。
- 文本变量统一使用 `{name}` 格式。
- 不允许代码中拼接中文正文，例如 `"魂石: " + count`，必须使用 `T('ui.shop.soulStone', { count })`。
- emoji 不建议作为 UI 文本。需要图形时使用 Sprite 图标。
- 技能名、遗物名、道具名、怪物名、区域名、Boss 名也必须配置化。
- `text.json` 必须保存为 UTF-8。

## 5. TextManager 核心代码

当前 `TextManager.ts` 注释已经显示为乱码，建议直接重写为 UTF-8 清晰版。核心实现如下：

```ts
// E:/game/回到地面/assets/scripts/core/TextManager.ts

let textData: Record<string, unknown> | null = null;

export function loadTextConfig(data: Record<string, unknown>): void {
    textData = data;
}

export function hasTextKey(key: string): boolean {
    if (!textData) return false;
    const parts = key.split('.');
    let current: unknown = textData;
    for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
            return false;
        }
        current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string';
}

export function T(key: string, params?: Record<string, string | number | boolean>): string {
    if (!textData) {
        console.warn(`[TextManager] text config not loaded: ${key}`);
        return key;
    }

    const parts = key.split('.');
    let current: unknown = textData;
    for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
            console.warn(`[TextManager] missing key: ${key}`);
            return key;
        }
        current = (current as Record<string, unknown>)[part];
    }

    if (typeof current !== 'string') {
        console.warn(`[TextManager] key is not a string: ${key}`);
        return key;
    }

    if (!params) return current;

    return current.replace(/\{(\w+)\}/g, (raw, name) => {
        const value = params[name];
        if (value === undefined || value === null) {
            console.warn(`[TextManager] missing param "${name}" for key: ${key}`);
            return raw;
        }
        return String(value);
    });
}

export function getRoomShortName(roomType: string): string {
    return T(`room.${roomType}`);
}
```

如果希望减少 UI 代码重复，可以新增 UI 专用辅助函数：

```ts
// E:/game/回到地面/assets/scripts/ui/UIText.ts

import { Label } from 'cc';
import { T } from '../core/TextManager';

export function setLabelText(
    label: Label | null | undefined,
    key: string,
    params?: Record<string, string | number | boolean>,
): void {
    if (!label) return;
    label.string = T(key, params);
}
```

## 6. 配置加载核心代码

建议在启动流程或 `ConfigService.loadAll()` 中保证 `text.json` 先加载完成。核心代码：

```ts
import { JsonAsset, resources } from 'cc';
import { loadTextConfig } from '../core/TextManager';

export function loadGameTextConfig(): Promise<void> {
    return new Promise((resolve, reject) => {
        resources.load('config/text', JsonAsset, (err, asset) => {
            if (err || !asset) {
                reject(err ?? new Error('config/text load failed'));
                return;
            }

            loadTextConfig(asset.json as Record<string, unknown>);
            resolve();
        });
    });
}
```

注意：

- 不要只依赖 `ConfigManager` 内置兜底文本。兜底可以保留，但正式运行必须从 `assets/resources/config/text.json` 加载。
- 所有中文注释和文本文件都保存 UTF-8，避免再次出现乱码。

## 7. UI 代码迁移示例

### 7.1 ShopUI / ShopView

错误写法：

```ts
titleLabel.string = '魂石商店';
this._soulStoneLabel.string = `魂石: ${count}`;
actionLabel.string = owned ? '已装备' : '选择';
```

正确写法：

```ts
import { T } from '../core/TextManager';

titleLabel.string = T('ui.shop.title');
this._soulStoneLabel.string = T('ui.shop.soulStone', { count });
actionLabel.string = owned ? T('ui.common.equipped') : T('ui.common.select');
```

如果当前路径在 `ui/view/ShopView.ts`，import 路径应调整：

```ts
import { T } from '../../core/TextManager';
```

### 7.2 MarqueeUI

错误写法：

```ts
this._createLabelOn('Title', '跑马灯', ...);
closeLabel.string = '继续冒险';
this._keyLabel.string = '获得一把钥匙！';
this._progressLabel.string = `进度: ${litCount}/${MAX_LIGHTS}  看广告点亮1格`;
```

正确写法：

```ts
import { T } from '../core/TextManager';

this._createLabelOn('Title', T('ui.marquee.title'), ...);
closeLabel.string = T('ui.marquee.continue');
this._keyLabel.string = T('ui.marquee.getKey');
this._progressLabel.string = T('ui.marquee.progress', {
    lit: litCount,
    total: MAX_LIGHTS,
});
```

### 7.3 EventUI

错误写法：

```ts
label.string = `自动选择: ${secs}s`;
```

正确写法：

```ts
label.string = T('ui.event.autoSelect', { secs });
```

### 7.4 MainUI

错误写法：

```ts
versionLabel.string = 'v1.0.0';
```

正确写法：

```ts
versionLabel.string = T('ui.version', { version: '1.0.0' });
```

如果版本号来自配置或构建变量，应改为：

```ts
versionLabel.string = T('ui.version', { version: GameVersion.current });
```

### 7.5 关闭按钮

优先方案：关闭按钮使用 Sprite 图标，不创建 Label。

```ts
// 伪代码：实际加载方式按项目 ResourceLoader/AssetManager 封装接入
const closeNode = new Node('CloseButton');
const sprite = closeNode.addComponent(Sprite);
sprite.spriteFrame = closeButtonSpriteFrame;
```

临时方案：如果必须用 Label，则文本也要来自配置，但不推荐长期保留：

```ts
closeLabel.string = T('ui.common.close');
```

美术资产 `btn_close.png` 必须是两条交叉圆角线的图形按钮，不能是脸、徽章、花、文字 `X` 或 `close`。

## 8. 需要优先迁移的文件

优先顺序：

```text
E:/game/回到地面/assets/scripts/ui/ShopUI.ts
E:/game/回到地面/assets/scripts/ui/MarqueeUI.ts
E:/game/回到地面/assets/scripts/ui/DungeonMapUI.ts
E:/game/回到地面/assets/scripts/ui/EventUI.ts
E:/game/回到地面/assets/scripts/ui/MainUI.ts
E:/game/回到地面/assets/scripts/ui/view/ShopView.ts
E:/game/回到地面/assets/scripts/ui/view/InventoryView.ts
E:/game/回到地面/assets/scripts/ui/view/EquipmentView.ts
E:/game/回到地面/assets/scripts/ui/BattleHUD.ts
E:/game/回到地面/assets/scripts/ui/DeathUI.ts
```

已知需要迁移的玩家可见文本类型：

- 商店标题、页签、价格、拥有状态、选择状态。
- 地图提示。
- 事件自动选择倒计时。
- 主界面版本号。
- 跑马灯标题、说明、进度、领奖提示、继续按钮。
- 装备标题、道具标题、空槽位文案。

## 9. prompts.json 提示词规范

所有资源提示词都要遵守全局规则：

```text
GLOBAL NO-BAKED-TEXT CONTRACT:
this PNG is artwork only.
Do not include readable text, letters, numbers, logos, pseudo text, labels,
price tags, title words, UI copy, damage numbers, or sign text.
All readable words and numbers are rendered at runtime by Cocos Label/TextManager from config.
Use blank surfaces, abstract decorative marks, icons, symbols, material shapes, and clean silhouettes only.
```

UI 类额外规则：

```text
RUNTIME TEXT CONTRACT:
this PNG is artwork only.
All readable UI copy, button labels, titles, numbers, counters, and prices
are rendered at runtime by Cocos Label/TextManager from config.
The image must contain only blank surfaces, icon geometry, trim, and decorative shapes.
```

关闭按钮专用提示词核心：

```text
cartoon animal mobile game UI sprite asset, 32x32,
subject: small close button icon base,
rounded blue-gray square button with gold rim,
two thick crossed white rounded strokes in the center as a close pictogram,
tiny paw-print corner accents only,
not a face, not a mascot, not a flower, not a badge,
plain flat light neutral off-white segmentation background,
transparent subject PNG,
no readable text, no letters, no numbers, no pseudo-readable glyphs.
```

普通按钮提示词核心：

```text
blank rounded button frame for a cartoon animal mobile game,
empty center label area for runtime Cocos Label,
soft blue-gray surface, warm gold rim, tiny paw-print trim,
no baked button text, no pseudo text, no letters, no numbers.
```

标题装饰提示词核心：

```text
blank title decoration frame for a cartoon animal mobile game,
empty clean center area for runtime title Label,
paw-print trim, gem dots, leaf curls,
no baked title text, no logo word, no pseudo text.
```

背景类提示词补充：

```text
blank books, blank signs, blank scrolls, blank plaques only;
no readable writing on any object.
```

图标类提示词补充：

```text
standalone item or skill symbol only,
no badge text, no letters, no numbers, no face emoji, no pseudo logo.
```

特效类提示词补充：

```text
abstract visual effect only,
no CRIT, no MISS, no damage number, no floating text.
```

## 10. 硬编码文本审计脚本

建议新增：

```text
E:/game/tools/scan_hardcoded_ui_text.py
```

核心代码：

```python
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(r"E:/game/回到地面/assets/scripts")

STRING_PATTERNS = [
    re.compile(r"\.string\s*=\s*([`'\"])(.*?)(?<!\\)\1", re.S),
    re.compile(r"_createLabelOn\([^;\n]*?,\s*([`'\"])(.*?)(?<!\\)\1", re.S),
    re.compile(r"_addLabel\([^;\n]*?,\s*([`'\"])(.*?)(?<!\\)\1", re.S),
]

ALLOW_EXACT = {
    "",
}

def has_visible_text(value: str) -> bool:
    value = value.strip()
    if value in ALLOW_EXACT:
        return False
    # Chinese, English, digits, or common UI punctuation in literal strings.
    if re.search(r"[\u4e00-\u9fffA-Za-z0-9]", value):
        return True
    # Emoji and symbols used as UI text should generally become Sprite icons.
    if re.search(r"[\U0001F300-\U0001FAFF]", value):
        return True
    return False

errors = []

for path in sorted(ROOT.rglob("*.ts")):
    text = path.read_text(encoding="utf-8", errors="ignore")
    for pattern in STRING_PATTERNS:
        for match in pattern.finditer(text):
            value = match.group(2)
            if has_visible_text(value):
                line = text[:match.start()].count("\n") + 1
                rel = path.relative_to(ROOT).as_posix()
                errors.append((rel, line, value.replace("\n", "\\n")[:160]))

for rel, line, value in errors:
    print(f"{rel}:{line}: {value}")

if errors:
    raise SystemExit(1)
```

执行：

```powershell
python E:/game/tools/scan_hardcoded_ui_text.py
```

验收标准：

- 输出为空才算通过。
- 不允许把中文 UI 正文加入白名单。
- 如果某个符号确实不是玩家文本，应优先改为 Sprite 图标，而不是加入白名单。

## 11. 图片内文字审计流程

自动 OCR 对卡通图和伪文字不稳定，所以必须使用“脚本预检 + contact sheet 人工验收”。

### 11.1 生成 contact sheet

按类别生成：

```powershell
python E:/game/tools/gen_missing_179.py contact ui
python E:/game/tools/gen_missing_179.py contact icons
python E:/game/tools/gen_missing_179.py contact backgrounds
python E:/game/tools/gen_missing_179.py contact effects
python E:/game/tools/gen_missing_179.py contact bosses
```

### 11.2 人工失败条件

任意一项出现即失败：

- 中文、英文、数字。
- 伪英文、乱码文字、装饰性假字。
- `CRIT`、`MISS`、价格、倒计时、等级、伤害数字。
- 标题、Logo 字、按钮文案。
- 地图房间字母或缩写。
- 书页、卷轴、牌匾、石碑上的可读文字。

### 11.3 状态标记

建议在批次报告里使用这些状态：

```text
generated        已生成，等待人工验收
approved         人工验收通过
failed_text      有文字/伪文字
failed_semantics 语义不对，例如关闭按钮变头像
failed_safety    有血液、骷髅、器官、恐怖元素
failed_quality   模糊、糊边、颜色异常、尺寸错误
```

## 12. 生成脚本需要遵守的规则

`E:/game/tools/gen_missing_179.py` 后续已经不是“179 张补齐脚本”，应作为通用资源制作脚本使用。

脚本执行原则：

- 不允许默认全量覆盖 418 张。
- 必须支持按类别、子目录、单文件生成。
- 默认跳过已有文件，除非显式 `--overwrite`。
- 生成前读取 `E:/game/assets/resources/config/prompts.json`。
- 输出路径必须严格匹配 manifest/prompt 配置。
- PNG 必须保存为 RGBA 或 RGB，禁止 PIL 的 P 模式。
- 任何资源只要人工状态不是 `approved`，不得进入最终替换。

推荐命令形式：

```powershell
# 只生成 UI
python E:/game/tools/gen_missing_179.py --category=ui

# 只生成 UI common
python E:/game/tools/gen_missing_179.py --category=ui/common

# 只重做一个资源
python E:/game/tools/gen_missing_179.py --only=ui/common/btn_close.png --overwrite

# 只做 dry-run，检查会生成哪些文件
python E:/game/tools/gen_missing_179.py --category=ui --dry-run
```

## 13. 替换前门禁

资源从 `runtime_replace` 替换到正式目录前，必须全部通过：

```text
1. 文件齐全：manifest/prompts 中要求的路径全部存在。
2. 无多余文件：runtime_replace 中不存在配置外文件。
3. 尺寸正确：runtime 图片尺寸符合 manifest。
4. 模式正确：PNG 不是 P 模式。
5. 无文字：contact sheet 人工确认无文字/伪文字。
6. 语义正确：关闭按钮像关闭按钮，道具图标像道具，背景像背景。
7. 风格正确：卡通动物风，不是暗黑风，不是像素风。
8. 安全正确：无血液、骷髅、器官、恐怖符号。
9. 代码文本扫描通过：无硬编码玩家可见文本。
10. Cocos 重新导入后 SpriteFrame/meta 正常。
```

## 14. 分阶段实施清单

### 阶段 A：文本配置修复

1. 将 `text.json` 重新保存为 UTF-8。
2. 补齐 `ui.common`、`ui.shop`、`ui.event`、`ui.marquee`、`ui.equipment`、`ui.inventory`、`ui.map`。
3. 修复已经乱码的中文文本。
4. 保留 `{var}` 模板变量。

### 阶段 B：TextManager 修复

1. 重写 `TextManager.ts` 为 UTF-8。
2. 保留 `loadTextConfig()`、`T()`、`getRoomShortName()`。
3. 新增 `hasTextKey()`。
4. 在启动流程确保 `text.json` 先加载。

### 阶段 C：UI 代码迁移

1. 将所有 `.string = '中文/英文/数字文本'` 改为 `T()`。
2. 将 `_createLabelOn(..., '文本')` 改为 `T()`。
3. 将 `_addLabel(..., '文本')` 改为 `T()`。
4. 将 emoji UI 替换为 Sprite 图标或配置文本。

### 阶段 D：美术提示词锁定

1. 检查 `prompts.json` 所有类别都有 `GLOBAL NO-BAKED-TEXT CONTRACT`。
2. UI 类必须额外有 `RUNTIME TEXT CONTRACT`。
3. `btn_close.png` 必须使用关闭按钮专用提示词。
4. `splash_logo.png`、`main_titledeco.png` 必须是空白标题装饰，不是带字 Logo。

### 阶段 E：分批重做与验收

1. 按 `ui`、`icons`、`backgrounds`、`effects`、`bosses`、`characters`、`monsters`、`tiles` 分批生成。
2. 每批生成 contact sheet。
3. 人工标记 `approved` 或失败原因。
4. 只允许 `approved` 资源进入最终替换。

### 阶段 F：最终替换

1. 备份正式目录：

```powershell
Copy-Item -LiteralPath 'E:/game/回到地面/assets/resources/textures' -Destination 'E:/game/回到地面/assets/resources/textures_backup_before_runtime_replace' -Recurse
```

2. 校验 `runtime_replace` 完整性。
3. 清理正式 textures 目录中旧资源。
4. 复制 `runtime_replace` 到 `assets/resources/textures`。
5. 打开 Cocos Creator 重新导入，确认 SpriteFrame 正常。
6. 运行游戏检查 UI、场景、战斗加载。

## 15. 完成定义

本整改完成必须满足：

```text
1. text.json 是 UTF-8 且玩家可见文本完整。
2. TextManager.ts 是 UTF-8 且 T() 可正常模板替换。
3. UI 代码中没有硬编码玩家可见文本。
4. prompts.json 中所有资源都禁止图片内文字。
5. 所有生成资源 contact sheet 人工通过。
6. btn_close.png 语义明确为关闭按钮。
7. 所有按钮、标题、价格、数字都由运行时 Label 渲染。
8. 所有资源符合卡通动物风。
9. 所有资源符合微信小游戏审核安全要求。
10. 替换到 assets/resources/textures 后 Cocos 能正常识别 SpriteFrame。
```

