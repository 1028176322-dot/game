# UI 资源生成管线（P2 已验证）

适用于《回到地面》项目 P2~P5 的一体化 UI 资源重做管线。
每次生成前先读 `docs/美术资源生成与入库规范.md`。

## 触发条件

用户说"生成/重做 XXX 资源"且资源类型为 UI 面板/按钮/背景/装饰。

## 管线流程

### 0. 加载必要文件

```bash
# 读取规范
cat docs/美术资源生成与入库规范.md | head -200

# 加载生图 skill
Skill({ skill: "agnes-image-gen" })
```

### 1. 生成母版（调用 Agnes API）

**关键规则（从 P2 失败的教训总结）：**

- ❌ 禁用在 prompt 中使用大写短语：`WECHAT-SAFE VISUAL DIRECTION`、`RELEASE-GRADE X CONTRACT`、`NO EMBEDDED TEXT CONTRACT`——AI 会把这些当 UI 文字渲染
- ❌ 禁止在 prompt 中包含 `route`、`label`、`list`、`preview`、`info`、`stats`、`button`、`title` 等关键词——AI 可能渲染为伪文字
- ✅ 使用纯视觉描述：画面有什么元素，什么颜色，什么材质
- ✅ 将 `no text, no letters, no words, no numbers, no logos` 放在 prompt 末尾作为简单约束
- ✅ 避免提及 "character"（可能生成动物角色）：用 "empty placeholder"、"empty area" 替代

curl 命令模板：

```bash
curl -s -X POST "https://apihub.agnes-ai.com/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw" \
  -d '{
    "model": "agnes-image-2.1-flash",
    "prompt": "纯视觉描述...No text, no letters, no numbers, no words, no logos.",
    "n": 1,
    "size": "1024x1024"
  }'
```

尺寸选择：
- 全屏背景 (1280×720) → master 1792×1024
- 面板/卡片/按钮 → master 1024×1024
- 头像/图标 (128×128) → master 1024×1024

### 2. 后处理（Python PIL）

使用 managed Python: `C:/Users/Administrator/.workbuddy/binaries/python/envs/default/Scripts/python.exe`

标准流程：

```python
from PIL import Image, ImageDraw, ImageFilter

img = Image.open(master_path)
if img.mode != "RGB":
    img = img.convert("RGB")

# 裁剪 5-8% 边缘（AI 生成图边缘有异常）
w, h = img.size
img = img.crop((int(w*0.05), int(h*0.05), int(w*0.95), int(h*0.95)))

# 缩放到运行时尺寸
img = img.resize(runtime_size, Image.LANCZOS)
img = img.filter(ImageFilter.UnsharpMask(radius=1.0-1.5, percent=25-50, threshold=2-3))

# 圆角透明（面板/按钮/卡片用）
radius = int(min(runtime_size) * 0.04-0.08)
mask = Image.new("L", img.size, 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle([0, 0, w, h], radius=max(radius, 1), fill=255)
img = img.convert("RGBA")
img.putalpha(mask)

# 去背景透明（头像/徽章用 — 去掉白色/浅色背景）
corners = [img.getpixel((0,0)), img.getpixel((w-1,0)), img.getpixel((0,h-1)), img.getpixel((w-1,h-1))]
bg = tuple(sum(c[i] for c in corners)//4 for i in range(3))
pix = img.load()
for y in range(h):
    for x in range(w):
        r,g,b,a = pix[x,y]
        if abs(r-bg[0])<50 and abs(g-bg[1])<50 and abs(b-bg[2])<50:
            pix[x,y] = (r,g,b,0)

# 量化控制体积（FASTOCTREE）
for colors in [64, 48, 32, 24]:
    q = img.quantize(colors=colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    q.convert("RGBA").save(path, "PNG", optimize=True, compress_level=9)
    if path.stat().st_size / 1024 <= max_kb:
        break
```

### 3. 保存到标准目录

```bash
# 母版
art_source/textures_review/master/{category}/{filename}

# 运行时候选
art_source/textures_review/runtime_candidates/{category}/{filename}

# 导出替换版
art_source/textures_export/runtime_replace/{category}/{filename}
```

### 4. 呈现给用户验收

```python
present_files(files=[...])
```

### 5. 入库

```bash
cp runtime_candidates/{path} assets/resources/textures/{path}
```

### 6. 更新配置

- **assets.json**：PNG→SpriteFrame + `/spriteFrame`；JPG→Texture2D 无子路径
- **ui_assets.json**：`{prefix}.{name}` → assetId + type + usage
- 如果是 PNG→JPG 切换，删除旧 PNG + `.meta`

### 7. 验证

```bash
cd E:/game/回到地面 && npm.cmd run validate:all
```

## 常见失败与修复

| 失败现象 | 原因 | 修复 |
|---------|------|------|
| AI 生成文字 | prompt 含大写短语或 UI 术语 | 改用纯视觉描述，禁 route/label/button/info/preview/list |
| 面板体积超限 | AI 细节过多 | 量化 64→48→32 色，或缩小半径减少透明区域 |
| 假透明棋盘格 | AI 画了透明网格 | 母版判定失败，重生成时指定 "opaque warm cream center" |
| 按钮中心有强图案 | 未指定空白区域 | 加 "central 70% area must be blank, quiet, low-contrast" |
| JPG 背景显示不出 | assets.json 仍是 SpriteFrame | 改为 Texture2D，去掉 /spriteFrame |
