# 美术资源门禁报告

- 生成时间: 2026-06-27 15:13:45
- 项目目录: `E:\game\回到地面`
- 资源总记录: 492
- CSV 记录: 418
- 磁盘 PNG: 492
- 强引用资源: 1
- 仅疑似引用资源: 0
- 有问题资源: 349
- 清理候选: 74

## 关键门禁

- CSV 有但磁盘缺失: 0
- 磁盘有但 CSV 未登记: 74
- PNG P 模式: 0
- 缺 PNG meta: 0

## 输出文件

- `art_resource_gate_detail.csv`: 全量明细
- `cleanup_candidates.csv`: 清理/隔离候选
- `ref_cache_full.json`: 引用明细和行号

## 使用建议

1. 先修复 `missing_file`、`extra_file_not_in_textures_manifest`、`png_mode_P_convert_to_RGBA`、`missing_png_meta`。
2. `reference_count=0` 只能代表静态扫描未发现引用，不能单独作为删除依据。
3. 清理候选先执行隔离，不直接删除；确认微信小游戏和浏览器预览正常后再删除隔离目录。
