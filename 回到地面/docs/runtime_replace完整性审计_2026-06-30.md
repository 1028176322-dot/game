# runtime_replace 完整性审计

审计时间：2026-06-30

审计范围：

```text
PNG runtime:
E:/game/回到地面/art_source/textures_export/runtime_replace

Background runtime JPG:
E:/game/回到地面/art_source/textures_review/runtime_candidates/backgrounds
```

目标清单来源：

```text
E:/game/assets/resources/config/prompts.json
```

审计输出：

```text
E:/zdcs/runtime_assets_audit_with_bg_jpg_report.json
E:/zdcs/runtime_assets_audit_with_bg_jpg_issues.csv
```

## 1. 结论

如果把 `runtime_candidates/backgrounds/*.jpg` 视为 backgrounds 的正式运行时资源来源，则当前资源数量已经齐全：

```text
目标资源数：418
实际运行时资源数：418
匹配目标路径：418
缺失：0
多余：0
```

但还不能算完全通过，因为 `monsters` 36 张存在尺寸不符合当前目标规格的问题。

## 2. 分类完成情况

```text
backgrounds  目标 17   实际 17   来源：runtime_candidates/backgrounds/*.jpg
bosses       目标 120  实际 120  来源：runtime_replace PNG
characters   目标 35   实际 35   来源：runtime_replace PNG
effects      目标 27   实际 27   来源：runtime_replace PNG
icons        目标 67   实际 67   来源：runtime_replace PNG
monsters     目标 36   实际 36   来源：runtime_replace PNG，但尺寸不合格
tiles        目标 24   实际 24   来源：runtime_replace PNG
ui           目标 92   实际 92   来源：runtime_replace PNG
```

## 3. 背景资源说明

背景不是缺失，而是走了脚本生成的 JPG runtime candidate：

```text
E:/game/回到地面/art_source/textures_review/runtime_candidates/backgrounds
```

这 17 张 JPG 已全部存在，并按 `backgrounds/*.png` 的逻辑路径映射到目标清单：

```text
backgrounds/bg_combat_abyss.png       -> bg_combat_abyss.jpg
backgrounds/bg_combat_catacombs.png   -> bg_combat_catacombs.jpg
backgrounds/bg_combat_forest.png      -> bg_combat_forest.jpg
backgrounds/bg_combat_swamp.png       -> bg_combat_swamp.jpg
backgrounds/bg_combat_tundra.png      -> bg_combat_tundra.jpg
backgrounds/bg_combat_volcano.png     -> bg_combat_volcano.jpg
backgrounds/bg_event_abyss.png        -> bg_event_abyss.jpg
backgrounds/bg_event_catacombs.png    -> bg_event_catacombs.jpg
backgrounds/bg_event_forest.png       -> bg_event_forest.jpg
backgrounds/bg_event_swamp.png        -> bg_event_swamp.jpg
backgrounds/bg_event_tundra.png       -> bg_event_tundra.jpg
backgrounds/bg_event_volcano.png      -> bg_event_volcano.jpg
backgrounds/bg_room_healing.png       -> bg_room_healing.jpg
backgrounds/bg_room_rest.png          -> bg_room_rest.jpg
backgrounds/bg_room_shop.png          -> bg_room_shop.jpg
backgrounds/bg_room_treasure.png      -> bg_room_treasure.jpg
backgrounds/bg_room_upgrade.png       -> bg_room_upgrade.jpg
```

背景 JPG 总体积：

```text
2601.6 KB
```

单张约 140-170KB，符合之前“背景 PNG 过大，runtime 使用 JPG 候选”的方向。

需要注意：

- 后续替换到正式资源目录时，必须同步 Cocos 加载逻辑或资源映射，确保逻辑路径 `backgrounds/xxx` 能加载 `.jpg`。
- 如果 Cocos 现有配置强依赖 `.png`，则还需要补充一层路径映射或改资源引用。

## 4. 当前唯一有效未完成项：monsters 尺寸

`monsters` 36 张全部存在，但实际尺寸不符合当前目标。

当前目标：

```text
128x128
```

实际情况：

```text
多数普通怪物：48x48
少数怪物：64x64
部分精英/大型怪：192x192
```

这说明 monsters 目录仍混有旧资源或旧尺寸资源，没有按当前统一规格完成重做。

需要处理的 36 张：

```text
monsters/abyss/monster_abyss_abyssarcher_idle.png
monsters/abyss/monster_abyss_abysslordelite_idle.png
monsters/abyss/monster_abyss_shadowdemon_idle.png
monsters/abyss/monster_abyss_shadowgolem_idle.png
monsters/abyss/monster_abyss_voidrift_idle.png
monsters/abyss/monster_abyss_voidwraith_idle.png
monsters/catacombs/monster_catacombs_batswarm_idle.png
monsters/catacombs/monster_catacombs_deathknight_idle.png
monsters/catacombs/monster_catacombs_ghost_idle.png
monsters/catacombs/monster_catacombs_ghoul_idle.png
monsters/catacombs/monster_catacombs_skeleton_idle.png
monsters/catacombs/monster_catacombs_skeletonarcher_idle.png
monsters/forest/monster_forest_boar_idle.png
monsters/forest/monster_forest_deerelite_idle.png
monsters/forest/monster_forest_elfarcher_idle.png
monsters/forest/monster_forest_mushroom_idle.png
monsters/forest/monster_forest_slime_idle.png
monsters/forest/monster_forest_treant_idle.png
monsters/swamp/monster_swamp_gianttoad_idle.png
monsters/swamp/monster_swamp_rottreant_idle.png
monsters/swamp/monster_swamp_slimepoison_idle.png
monsters/swamp/monster_swamp_swampdragon_idle.png
monsters/swamp/monster_swamp_swampspider_idle.png
monsters/swamp/monster_swamp_viper_idle.png
monsters/tundra/monster_tundra_frostgiant_idle.png
monsters/tundra/monster_tundra_frostmage_idle.png
monsters/tundra/monster_tundra_iceskeleton_idle.png
monsters/tundra/monster_tundra_penguinsoldier_idle.png
monsters/tundra/monster_tundra_snowman_idle.png
monsters/tundra/monster_tundra_snowwolf_idle.png
monsters/volcano/monster_volcano_ashwraith_idle.png
monsters/volcano/monster_volcano_demon_idle.png
monsters/volcano/monster_volcano_fireelemental_idle.png
monsters/volcano/monster_volcano_infernoelite_idle.png
monsters/volcano/monster_volcano_lavaspider_idle.png
monsters/volcano/monster_volcano_suicidegolem_idle.png
```

## 5. effects 说明

effects 当前是竖排 sprite sheet，实际尺寸如：

```text
192x768
192x1152
192x576
```

这不是错误。审计脚本如果从 prompt 中抓到 `each frame 192x192`，可能误判为整体尺寸不匹配。此次已排除该误报。

## 6. 当前状态定义

可以这样定义当前状态：

```text
数量完整：是，418/418
路径完整：是，缺失 0，多余 0
格式大类：PNG + 背景 JPG 候选
仍需处理：monsters 36 张尺寸不合格
```

## 7. 下一步建议

### 7.1 确认 backgrounds JPG 映射

需要明确正式替换时 backgrounds 的落点：

```text
方案 A：正式资源目录中保留 backgrounds/*.jpg
方案 B：保留逻辑路径 backgrounds/*.png，但通过映射表指向 JPG
方案 C：导出同名 PNG，但不推荐，体积会明显增大
```

推荐方案 A 或 B。

### 7.2 处理 monsters

按当前规格重新生成或重新导出 monsters：

```powershell
python E:/game/tools/gen_missing_179.py --full-rebuild-all --category=monsters --overwrite
```

完成后重新审计，目标结果：

```text
目标资源数：418
实际运行时资源数：418
缺失：0
多余：0
有效尺寸问题：0
P 模式：0
```

