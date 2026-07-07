# P1 Splash + Create 资源重做完成

## 本次重做范围
P1 共 11 个资源，全部按 `正式上线资源验收标准` 重新生成/替换：

| 模块 | 资源 | 结果 |
|------|------|------|
| Splash | splash_bg.jpg | ✅ 1280×720 JPG RGB 160.1KB |
| Splash | splash_logo.png | ✅ 520×180 RGBA 116.4KB，标题板中心空白 |
| Splash | loading_bar.png | ✅ 520×42 RGBA 24.4KB，新增 |
| Create | create_bg.jpg | ✅ 1280×720 JPG RGB 157.3KB |
| Create | btn_class_default.png | ✅ 160×64 RGBA 8.1KB |
| Create | btn_class_selected.png | ✅ 160×64 RGBA 9.2KB |
| Create | btn_create_confirm.png | ✅ 220×76 RGBA 14.1KB |
| Create | btn_create_skip.png | ✅ 220×76 RGBA 12.8KB |
| Create | input_name.png | ✅ 480×72 RGBA 11.4KB |
| Create | character_stage_glow.png | ✅ 320×120 RGBA 16.6KB |
| Create | info_panel.png | ✅ 620×110 RGBA 27.3KB |

## 配置修正
- `assets.json`：
  - `splash_bg`、`create_bg` 类型从 `SpriteFrame` 改为 `Texture2D`，路径去掉 `/spriteFrame`
  - 新增 `textures/ui/splash/loading_bar` SpriteFrame 注册
- `ui_assets.json`：
  - `ui.splash.bg` 类型改为 `background`
  - 新增 `ui.splash.loading_bar`
- 删除旧 `splash_bg.png` 与 `.meta`，避免同名双格式冲突

## 统一处理标准
- 背景/整屏界面：JPG RGB，1280×720，≤180KB，遵循 `RELEASE-GRADE INTEGRATED SCREEN CONTRACT`
- 按钮/输入框/面板/装饰板：RGBA PNG，中心 70% 空白，装饰只在边角，cyan 背景生成 + chroma key + defringe/alpha bleed
- 图标/光效：RGBA PNG，真透明，无纯色残留

## 验证
- `npm.cmd run validate:all` 全部 8 项门禁通过。
