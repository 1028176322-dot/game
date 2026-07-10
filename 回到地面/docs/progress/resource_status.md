# 美术资源状态总表

> **⚠️ 本项目资源进度追踪的唯一权威来源**
> 定义见 `ART_RESOURCE_RULES.md` §14.4。其他文档/脚本/内存文件不得重复维护逐资源进度信息。
>
> 生成时间：2026-07-10 10:44
> 数据来源：`prompts.json` / `prompts_dim.json` / `art_pipeline_progress.json` / 文件系统
> 维度说明：3D 类别(monsters/bosses/effects/tiles)走 3D 管线；2D 保留类别(ui/icons/backgrounds/角色部件)走 2D 管线。
> **玩家角色字符 sheet 变更（2026-07-10）**：`Characters(3D,35张sheet)` 逐步废弃，改为 `角色部件(2D,~60张)` 部件化动画方案。archer 原型12个部件已完成母版待入库。本表暂不改动，等部件正式入库后重建。

## 总览

| 类别 | 维度 | 总数 | 母版存在 | 已生成(走完pipeline) | 入库(runtime有文件) | 人工确认 |
|------|:----:|:---:|:--------:|:-------------------:|:------------------:|:--------:|
| Monsters | 3D | 36 | 0 | 36 | 0 | 0 |
| Icons | 2D | 67 | 67 | 67 | 67 | 0 |
| Tiles | 3D | 24 | 0 | 0 | 0 | 0 |
| Backgrounds | 2D | 17 | 17 | 16 | 17 | 0 |
| Characters | 3D | 35 | 0 | 18 | 0 | 0 |
| Bosses | 3D | 120 | 0 | 0 | 0 | 0 |
| UI | 2D | 173 | 173 | 0 | 173 | 0 |
| Effects | 3D | 27 | 0 | 0 | 0 | 0 |

---

## Monsters（36个）

| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |
|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|
| monsters/abyss/monster_abyss_abyssarcher_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/abyss/monster_abyss_abysslordelite_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/abyss/monster_abyss_shadowdemon_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/abyss/monster_abyss_shadowgolem_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/abyss/monster_abyss_voidrift_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/abyss/monster_abyss_voidwraith_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/catacombs/monster_catacombs_batswarm_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/catacombs/monster_catacombs_deathknight_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/catacombs/monster_catacombs_ghost_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/catacombs/monster_catacombs_ghoul_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/catacombs/monster_catacombs_skeleton_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/catacombs/monster_catacombs_skeletonarcher_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/forest/monster_forest_boar_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/forest/monster_forest_deerelite_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/forest/monster_forest_elfarcher_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/forest/monster_forest_mushroom_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/forest/monster_forest_slime_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/forest/monster_forest_treant_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/swamp/monster_swamp_gianttoad_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/swamp/monster_swamp_rottreant_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/swamp/monster_swamp_slimepoison_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/swamp/monster_swamp_swampdragon_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/swamp/monster_swamp_swampspider_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/swamp/monster_swamp_viper_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/tundra/monster_tundra_frostgiant_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/tundra/monster_tundra_frostmage_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/tundra/monster_tundra_iceskeleton_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/tundra/monster_tundra_penguinsoldier_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/tundra/monster_tundra_snowman_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/tundra/monster_tundra_snowwolf_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/volcano/monster_volcano_ashwraith_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/volcano/monster_volcano_demon_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/volcano/monster_volcano_fireelemental_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/volcano/monster_volcano_infernoelite_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/volcano/monster_volcano_lavaspider_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |
| monsters/volcano/monster_volcano_suicidegolem_idle.png | 3D | - | ✅ imported | - | - | - | - | ❌ 未入库 | - |

## Icons（67个）

| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |
|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|
| icons/buffs/icon_buff_atkup.png | 2D | art_source/textures_review/master/icons/buffs/icon_buff_atkup.png | ✅ imported | 2026-07-09 18:53 | - | - | assets/resources/textures/icons/buffs/icon_buff_atkup.png | ✅ 新版已入库 | 2026-07-09 18:53 |
| icons/buffs/icon_buff_defup.png | 2D | art_source/textures_review/master/icons/buffs/icon_buff_defup.png | ✅ imported | 2026-07-09 18:53 | - | - | assets/resources/textures/icons/buffs/icon_buff_defup.png | ✅ 新版已入库 | 2026-07-09 18:53 |
| icons/buffs/icon_buff_shield.png | 2D | art_source/textures_review/master/icons/buffs/icon_buff_shield.png | ✅ imported | 2026-07-09 18:53 | - | - | assets/resources/textures/icons/buffs/icon_buff_shield.png | ✅ 新版已入库 | 2026-07-09 18:53 |
| icons/buffs/icon_buff_speedup.png | 2D | art_source/textures_review/master/icons/buffs/icon_buff_speedup.png | ✅ imported | 2026-07-09 18:54 | - | - | assets/resources/textures/icons/buffs/icon_buff_speedup.png | ✅ 新版已入库 | 2026-07-09 18:54 |
| icons/buffs/icon_buff_stealth.png | 2D | art_source/textures_review/master/icons/buffs/icon_buff_stealth.png | ✅ imported | 2026-07-09 18:54 | - | - | assets/resources/textures/icons/buffs/icon_buff_stealth.png | ✅ 新版已入库 | 2026-07-09 18:54 |
| icons/buffs/icon_debuff_burn.png | 2D | art_source/textures_review/master/icons/buffs/icon_debuff_burn.png | ✅ imported | 2026-07-09 18:55 | - | - | assets/resources/textures/icons/buffs/icon_debuff_burn.png | ✅ 新版已入库 | 2026-07-09 18:55 |
| icons/buffs/icon_debuff_freeze.png | 2D | art_source/textures_review/master/icons/buffs/icon_debuff_freeze.png | ✅ imported | 2026-07-09 18:55 | - | - | assets/resources/textures/icons/buffs/icon_debuff_freeze.png | ✅ 新版已入库 | 2026-07-09 18:55 |
| icons/buffs/icon_debuff_poison.png | 2D | art_source/textures_review/master/icons/buffs/icon_debuff_poison.png | ✅ imported | 2026-07-09 18:55 | - | - | assets/resources/textures/icons/buffs/icon_debuff_poison.png | ✅ 新版已入库 | 2026-07-09 18:55 |
| icons/buffs/icon_debuff_slow.png | 2D | art_source/textures_review/master/icons/buffs/icon_debuff_slow.png | ✅ imported | 2026-07-09 18:56 | - | - | assets/resources/textures/icons/buffs/icon_debuff_slow.png | ✅ 新版已入库 | 2026-07-09 18:56 |
| icons/buffs/icon_debuff_stun.png | 2D | art_source/textures_review/master/icons/buffs/icon_debuff_stun.png | ✅ imported | 2026-07-09 18:56 | - | - | assets/resources/textures/icons/buffs/icon_debuff_stun.png | ✅ 新版已入库 | 2026-07-09 18:56 |
| icons/elements/icon_element_fire.png | 2D | art_source/textures_review/master/icons/elements/icon_element_fire.png | ✅ imported | 2026-07-09 18:56 | - | - | assets/resources/textures/icons/elements/icon_element_fire.png | ✅ 新版已入库 | 2026-07-09 18:56 |
| icons/elements/icon_element_frost.png | 2D | art_source/textures_review/master/icons/elements/icon_element_frost.png | ✅ imported | 2026-07-09 18:57 | - | - | assets/resources/textures/icons/elements/icon_element_frost.png | ✅ 新版已入库 | 2026-07-09 18:57 |
| icons/elements/icon_element_holy.png | 2D | art_source/textures_review/master/icons/elements/icon_element_holy.png | ✅ imported | 2026-07-09 18:57 | - | - | assets/resources/textures/icons/elements/icon_element_holy.png | ✅ 新版已入库 | 2026-07-09 18:57 |
| icons/elements/icon_element_lightning.png | 2D | art_source/textures_review/master/icons/elements/icon_element_lightning.png | ✅ imported | 2026-07-09 18:58 | - | - | assets/resources/textures/icons/elements/icon_element_lightning.png | ✅ 新版已入库 | 2026-07-09 18:58 |
| icons/elements/icon_element_poison.png | 2D | art_source/textures_review/master/icons/elements/icon_element_poison.png | ✅ imported | 2026-07-09 18:58 | - | - | assets/resources/textures/icons/elements/icon_element_poison.png | ✅ 新版已入库 | 2026-07-09 18:58 |
| icons/elements/icon_element_shadow.png | 2D | art_source/textures_review/master/icons/elements/icon_element_shadow.png | ✅ imported | 2026-07-09 18:59 | - | - | assets/resources/textures/icons/elements/icon_element_shadow.png | ✅ 新版已入库 | 2026-07-09 18:59 |
| icons/items/icon_item_advancedkey.png | 2D | art_source/textures_review/master/icons/items/icon_item_advancedkey.png | ✅ imported | 2026-07-09 18:59 | - | - | assets/resources/textures/icons/items/icon_item_advancedkey.png | ✅ 新版已入库 | 2026-07-09 18:59 |
| icons/items/icon_item_bighealingpotion.png | 2D | art_source/textures_review/master/icons/items/icon_item_bighealingpotion.png | ✅ imported | 2026-07-09 19:00 | - | - | assets/resources/textures/icons/items/icon_item_bighealingpotion.png | ✅ 新版已入库 | 2026-07-09 19:00 |
| icons/items/icon_item_flamebomb.png | 2D | art_source/textures_review/master/icons/items/icon_item_flamebomb.png | ✅ imported | 2026-07-09 19:00 | - | - | assets/resources/textures/icons/items/icon_item_flamebomb.png | ✅ 新版已入库 | 2026-07-09 19:00 |
| icons/items/icon_item_furypotion.png | 2D | art_source/textures_review/master/icons/items/icon_item_furypotion.png | ✅ imported | 2026-07-09 19:01 | - | - | assets/resources/textures/icons/items/icon_item_furypotion.png | ✅ 新版已入库 | 2026-07-09 19:01 |
| icons/items/icon_item_healingpotion.png | 2D | art_source/textures_review/master/icons/items/icon_item_healingpotion.png | ✅ imported | 2026-07-09 19:01 | - | - | assets/resources/textures/icons/items/icon_item_healingpotion.png | ✅ 新版已入库 | 2026-07-09 19:01 |
| icons/items/icon_item_icebomb.png | 2D | art_source/textures_review/master/icons/items/icon_item_icebomb.png | ✅ imported | 2026-07-09 19:01 | - | - | assets/resources/textures/icons/items/icon_item_icebomb.png | ✅ 新版已入库 | 2026-07-09 19:01 |
| icons/items/icon_item_ironpotion.png | 2D | art_source/textures_review/master/icons/items/icon_item_ironpotion.png | ✅ imported | 2026-07-09 19:02 | - | - | assets/resources/textures/icons/items/icon_item_ironpotion.png | ✅ 新版已入库 | 2026-07-09 19:02 |
| icons/items/icon_item_key.png | 2D | art_source/textures_review/master/icons/items/icon_item_key.png | ✅ imported | 2026-07-09 19:02 | - | - | assets/resources/textures/icons/items/icon_item_key.png | ✅ 新版已入库 | 2026-07-09 19:02 |
| icons/items/icon_item_mapscroll.png | 2D | art_source/textures_review/master/icons/items/icon_item_mapscroll.png | ✅ imported | 2026-07-09 19:03 | - | - | assets/resources/textures/icons/items/icon_item_mapscroll.png | ✅ 新版已入库 | 2026-07-09 19:03 |
| icons/items/icon_item_purifypotion.png | 2D | art_source/textures_review/master/icons/items/icon_item_purifypotion.png | ✅ imported | 2026-07-09 19:03 | - | - | assets/resources/textures/icons/items/icon_item_purifypotion.png | ✅ 新版已入库 | 2026-07-09 19:03 |
| icons/items/icon_item_rerollscroll.png | 2D | art_source/textures_review/master/icons/items/icon_item_rerollscroll.png | ✅ imported | 2026-07-09 19:03 | - | - | assets/resources/textures/icons/items/icon_item_rerollscroll.png | ✅ 新版已入库 | 2026-07-09 19:03 |
| icons/items/icon_item_revivecoin.png | 2D | art_source/textures_review/master/icons/items/icon_item_revivecoin.png | ✅ imported | 2026-07-09 19:04 | - | - | assets/resources/textures/icons/items/icon_item_revivecoin.png | ✅ 新版已入库 | 2026-07-09 19:04 |
| icons/items/icon_item_scrollfire.png | 2D | art_source/textures_review/master/icons/items/icon_item_scrollfire.png | ✅ imported | 2026-07-09 19:04 | - | - | assets/resources/textures/icons/items/icon_item_scrollfire.png | ✅ 新版已入库 | 2026-07-09 19:04 |
| icons/items/icon_item_scrollholy.png | 2D | art_source/textures_review/master/icons/items/icon_item_scrollholy.png | ✅ imported | 2026-07-09 19:05 | - | - | assets/resources/textures/icons/items/icon_item_scrollholy.png | ✅ 新版已入库 | 2026-07-09 19:05 |
| icons/items/icon_item_scrollice.png | 2D | art_source/textures_review/master/icons/items/icon_item_scrollice.png | ✅ imported | 2026-07-09 19:05 | - | - | assets/resources/textures/icons/items/icon_item_scrollice.png | ✅ 新版已入库 | 2026-07-09 19:05 |
| icons/items/icon_item_scrollpoison.png | 2D | art_source/textures_review/master/icons/items/icon_item_scrollpoison.png | ✅ imported | 2026-07-09 19:06 | - | - | assets/resources/textures/icons/items/icon_item_scrollpoison.png | ✅ 新版已入库 | 2026-07-09 19:06 |
| icons/items/icon_item_scrollshadow.png | 2D | art_source/textures_review/master/icons/items/icon_item_scrollshadow.png | ✅ imported | 2026-07-09 19:07 | - | - | assets/resources/textures/icons/items/icon_item_scrollshadow.png | ✅ 新版已入库 | 2026-07-09 19:07 |
| icons/items/icon_item_scrollthunder.png | 2D | art_source/textures_review/master/icons/items/icon_item_scrollthunder.png | ✅ imported | 2026-07-09 19:07 | - | - | assets/resources/textures/icons/items/icon_item_scrollthunder.png | ✅ 新版已入库 | 2026-07-09 19:07 |
| icons/items/icon_item_speedpotion.png | 2D | art_source/textures_review/master/icons/items/icon_item_speedpotion.png | ✅ imported | 2026-07-09 19:07 | - | - | assets/resources/textures/icons/items/icon_item_speedpotion.png | ✅ 新版已入库 | 2026-07-09 19:07 |
| icons/items/item_healthPotion.png | 2D | art_source/textures_review/master/icons/items/item_healthPotion.png | ✅ imported | 2026-07-09 19:08 | - | - | assets/resources/textures/icons/items/item_healthPotion.png | ✅ 新版已入库 | 2026-07-09 19:08 |
| icons/items/item_key.png | 2D | art_source/textures_review/master/icons/items/item_key.png | ✅ imported | 2026-07-09 19:08 | - | - | assets/resources/textures/icons/items/item_key.png | ✅ 新版已入库 | 2026-07-09 19:08 |
| icons/items/item_largeHealthPotion.png | 2D | art_source/textures_review/master/icons/items/item_largeHealthPotion.png | ✅ imported | 2026-07-09 19:08 | - | - | assets/resources/textures/icons/items/item_largeHealthPotion.png | ✅ 新版已入库 | 2026-07-09 19:08 |
| icons/items/item_map.png | 2D | art_source/textures_review/master/icons/items/item_map.png | ✅ imported | 2026-07-09 19:09 | - | - | assets/resources/textures/icons/items/item_map.png | ✅ 新版已入库 | 2026-07-09 19:09 |
| icons/relics/icon_relic_blinkstone.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_blinkstone.png | ✅ imported | 2026-07-09 19:09 | - | - | assets/resources/textures/icons/relics/icon_relic_blinkstone.png | ✅ 新版已入库 | 2026-07-09 19:09 |
| icons/relics/icon_relic_decoyscroll.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_decoyscroll.png | ✅ imported | 2026-07-09 19:10 | - | - | assets/resources/textures/icons/relics/icon_relic_decoyscroll.png | ✅ 新版已入库 | 2026-07-09 19:10 |
| icons/relics/icon_relic_echoorb.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_echoorb.png | ✅ imported | 2026-07-09 19:10 | - | - | assets/resources/textures/icons/relics/icon_relic_echoorb.png | ✅ 新版已入库 | 2026-07-09 19:10 |
| icons/relics/icon_relic_flamering.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_flamering.png | ✅ imported | 2026-07-09 19:10 | - | - | assets/resources/textures/icons/relics/icon_relic_flamering.png | ✅ 新版已入库 | 2026-07-09 19:10 |
| icons/relics/icon_relic_frenzyaxe.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_frenzyaxe.png | ✅ imported | 2026-07-09 19:11 | - | - | assets/resources/textures/icons/relics/icon_relic_frenzyaxe.png | ✅ 新版已入库 | 2026-07-09 19:11 |
| icons/relics/icon_relic_frostamulet.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_frostamulet.png | ✅ imported | 2026-07-09 19:12 | - | - | assets/resources/textures/icons/relics/icon_relic_frostamulet.png | ✅ 新版已入库 | 2026-07-09 19:12 |
| icons/relics/icon_relic_gravitystone.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_gravitystone.png | ✅ imported | 2026-07-09 19:12 | - | - | assets/resources/textures/icons/relics/icon_relic_gravitystone.png | ✅ 新版已入库 | 2026-07-09 19:12 |
| icons/relics/icon_relic_immortalstone.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_immortalstone.png | ✅ imported | 2026-07-09 19:12 | - | - | assets/resources/textures/icons/relics/icon_relic_immortalstone.png | ✅ 新版已入库 | 2026-07-09 19:12 |
| icons/relics/icon_relic_ironarmor.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_ironarmor.png | ✅ imported | 2026-07-09 19:13 | - | - | assets/resources/textures/icons/relics/icon_relic_ironarmor.png | ✅ 新版已入库 | 2026-07-09 19:13 |
| icons/relics/icon_relic_lifelink.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_lifelink.png | ✅ imported | 2026-07-09 19:13 | - | - | assets/resources/textures/icons/relics/icon_relic_lifelink.png | ✅ 新版已入库 | 2026-07-09 19:13 |
| icons/relics/icon_relic_luckycoin.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_luckycoin.png | ✅ imported | 2026-07-09 19:14 | - | - | assets/resources/textures/icons/relics/icon_relic_luckycoin.png | ✅ 新版已入库 | 2026-07-09 19:14 |
| icons/relics/icon_relic_shadowcloak.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_shadowcloak.png | ✅ imported | 2026-07-09 19:14 | - | - | assets/resources/textures/icons/relics/icon_relic_shadowcloak.png | ✅ 新版已入库 | 2026-07-09 19:14 |
| icons/relics/icon_relic_shadowdagger.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_shadowdagger.png | ✅ imported | 2026-07-09 19:15 | - | - | assets/resources/textures/icons/relics/icon_relic_shadowdagger.png | ✅ 新版已入库 | 2026-07-09 19:15 |
| icons/relics/icon_relic_speedgauntlet.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_speedgauntlet.png | ✅ imported | 2026-07-09 19:15 | - | - | assets/resources/textures/icons/relics/icon_relic_speedgauntlet.png | ✅ 新版已入库 | 2026-07-09 19:15 |
| icons/relics/icon_relic_thornarmor.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_thornarmor.png | ✅ imported | 2026-07-09 19:15 | - | - | assets/resources/textures/icons/relics/icon_relic_thornarmor.png | ✅ 新版已入库 | 2026-07-09 19:15 |
| icons/relics/icon_relic_timehourglass.png | 2D | art_source/textures_review/master/icons/relics/icon_relic_timehourglass.png | ✅ imported | 2026-07-09 19:16 | - | - | assets/resources/textures/icons/relics/icon_relic_timehourglass.png | ✅ 新版已入库 | 2026-07-09 19:16 |
| icons/sets/icon_set_frostbite.png | 2D | art_source/textures_review/master/icons/sets/icon_set_frostbite.png | ✅ imported | 2026-07-09 19:16 | - | - | assets/resources/textures/icons/sets/icon_set_frostbite.png | ✅ 新版已入库 | 2026-07-09 19:16 |
| icons/sets/icon_set_fury.png | 2D | art_source/textures_review/master/icons/sets/icon_set_fury.png | ✅ imported | 2026-07-09 19:17 | - | - | assets/resources/textures/icons/sets/icon_set_fury.png | ✅ 新版已入库 | 2026-07-09 19:17 |
| icons/sets/icon_set_ironwall.png | 2D | art_source/textures_review/master/icons/sets/icon_set_ironwall.png | ✅ imported | 2026-07-09 19:17 | - | - | assets/resources/textures/icons/sets/icon_set_ironwall.png | ✅ 新版已入库 | 2026-07-09 19:17 |
| icons/sets/icon_set_radiance.png | 2D | art_source/textures_review/master/icons/sets/icon_set_radiance.png | ✅ imported | 2026-07-09 19:17 | - | - | assets/resources/textures/icons/sets/icon_set_radiance.png | ✅ 新版已入库 | 2026-07-09 19:17 |
| icons/sets/icon_set_shadow.png | 2D | art_source/textures_review/master/icons/sets/icon_set_shadow.png | ✅ imported | 2026-07-09 19:18 | - | - | assets/resources/textures/icons/sets/icon_set_shadow.png | ✅ 新版已入库 | 2026-07-09 19:18 |
| icons/sets/icon_set_tempest.png | 2D | art_source/textures_review/master/icons/sets/icon_set_tempest.png | ✅ imported | 2026-07-09 19:18 | - | - | assets/resources/textures/icons/sets/icon_set_tempest.png | ✅ 新版已入库 | 2026-07-09 19:18 |
| icons/skills/icon_skill_dash.png | 2D | art_source/textures_review/master/icons/skills/icon_skill_dash.png | ✅ imported | 2026-07-09 19:19 | - | - | assets/resources/textures/icons/skills/icon_skill_dash.png | ✅ 新版已入库 | 2026-07-09 19:19 |
| icons/skills/icon_skill_elementburst.png | 2D | art_source/textures_review/master/icons/skills/icon_skill_elementburst.png | ✅ imported | 2026-07-09 19:19 | - | - | assets/resources/textures/icons/skills/icon_skill_elementburst.png | ✅ 新版已入库 | 2026-07-09 19:19 |
| icons/skills/icon_skill_healwave.png | 2D | art_source/textures_review/master/icons/skills/icon_skill_healwave.png | ✅ imported | 2026-07-09 19:19 | - | - | assets/resources/textures/icons/skills/icon_skill_healwave.png | ✅ 新版已入库 | 2026-07-09 19:19 |
| icons/skills/icon_skill_shield.png | 2D | art_source/textures_review/master/icons/skills/icon_skill_shield.png | ✅ imported | 2026-07-09 19:20 | - | - | assets/resources/textures/icons/skills/icon_skill_shield.png | ✅ 新版已入库 | 2026-07-09 19:20 |
| icons/skills/icon_skill_slowfield.png | 2D | art_source/textures_review/master/icons/skills/icon_skill_slowfield.png | ✅ imported | 2026-07-09 19:20 | - | - | assets/resources/textures/icons/skills/icon_skill_slowfield.png | ✅ 新版已入库 | 2026-07-09 19:20 |
| icons/skills/icon_skill_snapshot.png | 2D | art_source/textures_review/master/icons/skills/icon_skill_snapshot.png | ✅ imported | 2026-07-09 19:21 | - | - | assets/resources/textures/icons/skills/icon_skill_snapshot.png | ✅ 新版已入库 | 2026-07-09 19:21 |

## Tiles（24个）

| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |
|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|
| tiles/abyss/tile_abyss_floor.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/abyss/tile_abyss_highground.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/abyss/tile_abyss_thorn.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/abyss/tile_abyss_wall.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/catacombs/tile_catacombs_floor.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/catacombs/tile_catacombs_highground.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/catacombs/tile_catacombs_thorn.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/catacombs/tile_catacombs_wall.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/forest/tile_forest_floor.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/forest/tile_forest_highground.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/forest/tile_forest_thorn.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/forest/tile_forest_wall.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/swamp/tile_swamp_floor.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/swamp/tile_swamp_highground.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/swamp/tile_swamp_thorn.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/swamp/tile_swamp_wall.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/tundra/tile_tundra_floor.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/tundra/tile_tundra_highground.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/tundra/tile_tundra_thorn.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/tundra/tile_tundra_wall.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/volcano/tile_volcano_floor.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/volcano/tile_volcano_highground.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/volcano/tile_volcano_thorn.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| tiles/volcano/tile_volcano_wall.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |

## Backgrounds（17个）

| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |
|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|
| backgrounds/bg_combat_abyss.jpg | 2D | art_source/textures_review/master/backgrounds/bg_combat_abyss.jpg | 🔄 generated | 2026-07-09 20:50 | - | - | assets/resources/textures/backgrounds/bg_combat_abyss.jpg | ✅ 新版已入库 | 2026-07-09 20:50 |
| backgrounds/bg_combat_catacombs.jpg | 2D | art_source/textures_review/master/backgrounds/bg_combat_catacombs.jpg | 🔄 generated | 2026-07-09 21:36 | - | - | assets/resources/textures/backgrounds/bg_combat_catacombs.jpg | ✅ 新版已入库 | 2026-07-09 21:36 |
| backgrounds/bg_combat_forest.jpg | 2D | art_source/textures_review/master/backgrounds/bg_combat_forest.jpg | 🔄 generated | 2026-07-09 21:37 | - | - | assets/resources/textures/backgrounds/bg_combat_forest.jpg | ✅ 新版已入库 | 2026-07-09 21:37 |
| backgrounds/bg_combat_swamp.jpg | 2D | art_source/textures_review/master/backgrounds/bg_combat_swamp.jpg | 🔄 generated | 2026-07-09 21:39 | - | - | assets/resources/textures/backgrounds/bg_combat_swamp.jpg | ✅ 新版已入库 | 2026-07-09 21:39 |
| backgrounds/bg_combat_tundra.jpg | 2D | art_source/textures_review/master/backgrounds/bg_combat_tundra.jpg | 🔄 generated | 2026-07-09 21:41 | - | - | assets/resources/textures/backgrounds/bg_combat_tundra.jpg | ✅ 新版已入库 | 2026-07-09 21:41 |
| backgrounds/bg_combat_volcano.jpg | 2D | art_source/textures_review/master/backgrounds/bg_combat_volcano.jpg | 🔄 generated | 2026-07-09 21:42 | - | - | assets/resources/textures/backgrounds/bg_combat_volcano.jpg | ✅ 新版已入库 | 2026-07-09 21:42 |
| backgrounds/bg_event_abyss.jpg | 2D | art_source/textures_review/master/backgrounds/bg_event_abyss.jpg | 🔄 generated | 2026-07-09 21:09 | - | - | assets/resources/textures/backgrounds/bg_event_abyss.jpg | ✅ 新版已入库 | 2026-07-09 21:09 |
| backgrounds/bg_event_catacombs.jpg | 2D | art_source/textures_review/master/backgrounds/bg_event_catacombs.jpg | 🔄 generated | 2026-07-09 21:46 | - | - | assets/resources/textures/backgrounds/bg_event_catacombs.jpg | ✅ 新版已入库 | 2026-07-09 21:46 |
| backgrounds/bg_event_forest.jpg | 2D | art_source/textures_review/master/backgrounds/bg_event_forest.jpg | 🔄 generated | 2026-07-09 21:12 | - | - | assets/resources/textures/backgrounds/bg_event_forest.jpg | ✅ 新版已入库 | 2026-07-09 21:12 |
| backgrounds/bg_event_swamp.jpg | 2D | art_source/textures_review/master/backgrounds/bg_event_swamp.jpg | 🔄 generated | 2026-07-09 21:49 | - | - | assets/resources/textures/backgrounds/bg_event_swamp.jpg | ✅ 新版已入库 | 2026-07-09 21:49 |
| backgrounds/bg_event_tundra.jpg | 2D | art_source/textures_review/master/backgrounds/bg_event_tundra.jpg | 🔄 generated | 2026-07-09 21:23 | - | - | assets/resources/textures/backgrounds/bg_event_tundra.jpg | ✅ 新版已入库 | 2026-07-09 21:23 |
| backgrounds/bg_event_volcano.jpg | 2D | art_source/textures_review/master/backgrounds/bg_event_volcano.jpg | 🔄 generated | 2026-07-09 21:53 | - | - | assets/resources/textures/backgrounds/bg_event_volcano.jpg | ✅ 新版已入库 | 2026-07-09 21:24 |
| backgrounds/bg_room_healing.jpg | 2D | art_source/textures_review/master/backgrounds/bg_room_healing.jpg | ⏳ prompting | 2026-07-09 21:54 | - | - | assets/resources/textures/backgrounds/bg_room_healing.jpg | ✅ 新版已入库 | 2026-07-09 21:26 |
| backgrounds/bg_room_rest.jpg | 2D | art_source/textures_review/master/backgrounds/bg_room_rest.jpg | 🔄 generated | 2026-07-09 21:28 | - | - | assets/resources/textures/backgrounds/bg_room_rest.jpg | ✅ 新版已入库 | 2026-07-09 21:28 |
| backgrounds/bg_room_shop.jpg | 2D | art_source/textures_review/master/backgrounds/bg_room_shop.jpg | 🔄 generated | 2026-07-09 21:29 | - | - | assets/resources/textures/backgrounds/bg_room_shop.jpg | ✅ 新版已入库 | 2026-07-09 21:29 |
| backgrounds/bg_room_treasure.jpg | 2D | art_source/textures_review/master/backgrounds/bg_room_treasure.jpg | 🔄 generated | 2026-07-09 21:31 | - | - | assets/resources/textures/backgrounds/bg_room_treasure.jpg | ✅ 新版已入库 | 2026-07-09 21:31 |
| backgrounds/bg_room_upgrade.jpg | 2D | art_source/textures_review/master/backgrounds/bg_room_upgrade.jpg | 🔄 generated | 2026-07-09 21:33 | - | - | assets/resources/textures/backgrounds/bg_room_upgrade.jpg | ✅ 新版已入库 | 2026-07-09 21:33 |

## Characters（35个）

| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |
|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|
| characters/archer/archer_attack.png | 3D | - | ✅ validated | - | - | - | - | ❌ 未入库 | - |
| characters/archer/archer_death.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/archer/archer_dodge.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/archer/archer_hit.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/archer/archer_idle.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/archer/archer_skill.png | 3D | - | ⏳ prompting | - | - | - | - | ❌ 未入库 | - |
| characters/archer/archer_walk.png | 3D | - | ❌ failed | - | - | - | - | ❌ 未入库 | - |
| characters/assassin/assassin_attack.png | 3D | - | ❌ failed | - | - | - | - | ❌ 未入库 | - |
| characters/assassin/assassin_death.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/assassin/assassin_dodge.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/assassin/assassin_hit.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/assassin/assassin_idle.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/assassin/assassin_skill.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/assassin/assassin_walk.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/berserker/berserker_attack.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/berserker/berserker_death.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/berserker/berserker_dodge.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/berserker/berserker_hit.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/berserker/berserker_idle.png | 3D | - | 🔄 generated | - | - | - | - | ❌ 未入库 | - |
| characters/berserker/berserker_skill.png | 3D | - | ⏳ prompting | - | - | - | - | ❌ 未入库 | - |
| characters/berserker/berserker_walk.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/mage/mage_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/mage/mage_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/mage/mage_dodge.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/mage/mage_hit.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/mage/mage_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/mage/mage_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/mage/mage_walk.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/warrior/warrior_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/warrior/warrior_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/warrior/warrior_dodge.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/warrior/warrior_hit.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/warrior/warrior_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/warrior/warrior_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| characters/warrior/warrior_walk.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |

## Bosses（120个）

| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |
|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|
| bosses/finalboss/abyss/boss_abyssoverlord_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/abyss/boss_abyssoverlord_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/abyss/boss_abyssoverlord_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/abyss/boss_abyssoverlord_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/abyss/boss_abyssoverlord_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_abyssoverlord_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_abyssoverlord_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_abyssoverlord_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_abyssoverlord_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_abyssoverlord_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_beast_swamp_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_beast_swamp_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_beast_swamp_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_beast_swamp_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_beast_swamp_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_firelord_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_firelord_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_firelord_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_firelord_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_firelord_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_forestguardian_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_forestguardian_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_forestguardian_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_forestguardian_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_forestguardian_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_frostqueen_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_frostqueen_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_frostqueen_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_frostqueen_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_frostqueen_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_guardian_forest_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_guardian_forest_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_guardian_forest_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_guardian_forest_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_guardian_forest_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_abyss_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_abyss_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_abyss_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_abyss_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_abyss_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_catacombs_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_catacombs_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_catacombs_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_catacombs_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_catacombs_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_volcano_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_volcano_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_volcano_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_volcano_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_lord_volcano_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_queen_tundra_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_queen_tundra_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_queen_tundra_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_queen_tundra_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_queen_tundra_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_skeletonlord_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_skeletonlord_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_skeletonlord_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_skeletonlord_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_skeletonlord_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_swampbehemoth_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_swampbehemoth_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_swampbehemoth_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_swampbehemoth_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/boss_swampbehemoth_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/catacombs/boss_skeletonlord_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/catacombs/boss_skeletonlord_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/catacombs/boss_skeletonlord_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/catacombs/boss_skeletonlord_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/catacombs/boss_skeletonlord_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/forest/boss_forestguardian_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/forest/boss_forestguardian_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/forest/boss_forestguardian_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/forest/boss_forestguardian_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/forest/boss_forestguardian_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/swamp/boss_swampbehemoth_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/swamp/boss_swampbehemoth_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/swamp/boss_swampbehemoth_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/swamp/boss_swampbehemoth_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/swamp/boss_swampbehemoth_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/tundra/boss_frostqueen_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/tundra/boss_frostqueen_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/tundra/boss_frostqueen_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/tundra/boss_frostqueen_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/tundra/boss_frostqueen_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/volcano/boss_firelord_attack.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/volcano/boss_firelord_death.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/volcano/boss_firelord_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/volcano/boss_firelord_phasechange.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/finalboss/volcano/boss_firelord_skill.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/abyss/miniboss_abysssentinel_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/abyss/miniboss_nightmareknight_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/abyss/miniboss_shadowdragon_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/abyss/miniboss_voidhunter_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/abyss/miniboss_voidlord_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/catacombs/miniboss_blackknight_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/catacombs/miniboss_gargoyle_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/catacombs/miniboss_giantskeleton_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/catacombs/miniboss_lich_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/catacombs/miniboss_warden_catacombs_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/forest/miniboss_boarchief_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/forest/miniboss_poisonflower_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/forest/miniboss_porcupineking_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/forest/miniboss_stagbeetle_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/forest/miniboss_warden_forest_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/swamp/miniboss_poisonscorpion_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/swamp/miniboss_rottreantelite_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/swamp/miniboss_serpentqueen_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/swamp/miniboss_swampcrocodile_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/swamp/miniboss_swampfrog_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/tundra/miniboss_frostelemental_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/tundra/miniboss_icegiant_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/tundra/miniboss_icescorpion_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/tundra/miniboss_polarbearking_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/tundra/miniboss_snowape_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/volcano/miniboss_firegolem_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/volcano/miniboss_inferno_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/volcano/miniboss_lavaworm_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/volcano/miniboss_volcanogiant_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| bosses/miniboss/volcano/miniboss_warden_volcano_idle.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |

## UI（173个）

| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |
|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|
| ui/area/area_badge_abyss.png | 2D | art_source/textures_review/master/ui/area/area_badge_abyss.png | 未走pipeline | 2026-07-07 13:57 | - | - | assets/resources/textures/ui/area/area_badge_abyss.png | ✅ 新版已入库 | 2026-07-07 13:57 |
| ui/area/area_badge_forest.png | 2D | art_source/textures_review/master/ui/area/area_badge_forest.png | 未走pipeline | 2026-07-09 12:22 | - | - | assets/resources/textures/ui/area/area_badge_forest.png | ✅ 新版已入库 | 2026-07-09 12:22 |
| ui/area/area_badge_swamp.png | 2D | art_source/textures_review/master/ui/area/area_badge_swamp.png | 未走pipeline | 2026-07-07 13:53 | - | - | assets/resources/textures/ui/area/area_badge_swamp.png | ✅ 新版已入库 | 2026-07-07 13:57 |
| ui/area/area_badge_tundra.png | 2D | art_source/textures_review/master/ui/area/area_badge_tundra.png | 未走pipeline | 2026-07-07 13:54 | - | - | assets/resources/textures/ui/area/area_badge_tundra.png | ✅ 新版已入库 | 2026-07-07 13:57 |
| ui/area/area_badge_volcano.png | 2D | art_source/textures_review/master/ui/area/area_badge_volcano.png | 未走pipeline | 2026-07-07 13:56 | - | - | assets/resources/textures/ui/area/area_badge_volcano.png | ✅ 新版已入库 | 2026-07-07 13:57 |
| ui/area/area_bg.jpg | 2D | art_source/textures_review/master/ui/area/area_bg.png | 未走pipeline | 2026-07-07 13:38 | - | - | assets/resources/textures/ui/area/area_bg.jpg | ✅ 新版已入库 | 2026-07-07 13:40 |
| ui/area/btn_back.png | 2D | art_source/textures_review/master/ui/area/btn_back.png | 未走pipeline | 2026-07-07 13:47 | - | - | assets/resources/textures/ui/area/btn_back.png | ✅ 新版已入库 | 2026-07-07 13:47 |
| ui/area/btn_start.png | 2D | art_source/textures_review/master/ui/area/btn_start.png | 未走pipeline | 2026-07-07 13:46 | - | - | assets/resources/textures/ui/area/btn_start.png | ✅ 新版已入库 | 2026-07-07 13:47 |
| ui/area/route_card_default.png | 2D | art_source/textures_review/master/ui/area/route_card_default.png | 未走pipeline | 2026-07-09 11:28 | - | - | assets/resources/textures/ui/area/route_card_default.png | ✅ 新版已入库 | 2026-07-09 11:28 |
| ui/area/route_card_locked.png | 2D | art_source/textures_review/master/ui/area/route_card_locked.png | 未走pipeline | 2026-07-09 11:41 | - | - | assets/resources/textures/ui/area/route_card_locked.png | ✅ 新版已入库 | 2026-07-09 11:41 |
| ui/area/route_panel.png | 2D | art_source/textures_review/master/ui/area/route_panel.png | 未走pipeline | 2026-07-07 13:39 | - | - | assets/resources/textures/ui/area/route_panel.png | ✅ 新版已入库 | 2026-07-07 13:40 |
| ui/character/avatar_archer.png | 2D | art_source/textures_review/master/ui/character/avatar_archer.png | 未走pipeline | 2026-07-07 13:28 | - | - | assets/resources/textures/ui/character/avatar_archer.png | ✅ 新版已入库 | 2026-07-07 13:29 |
| ui/character/avatar_assassin.png | 2D | art_source/textures_review/master/ui/character/avatar_assassin.png | 未走pipeline | 2026-07-07 13:32 | - | - | assets/resources/textures/ui/character/avatar_assassin.png | ✅ 新版已入库 | 2026-07-07 13:32 |
| ui/character/avatar_berserker.png | 2D | art_source/textures_review/master/ui/character/avatar_berserker.png | 未走pipeline | 2026-07-07 13:29 | - | - | assets/resources/textures/ui/character/avatar_berserker.png | ✅ 新版已入库 | 2026-07-07 13:29 |
| ui/character/avatar_mage.png | 2D | art_source/textures_review/master/ui/character/avatar_mage.png | 未走pipeline | 2026-07-07 13:28 | - | - | assets/resources/textures/ui/character/avatar_mage.png | ✅ 新版已入库 | 2026-07-07 13:29 |
| ui/character/avatar_warrior.png | 2D | art_source/textures_review/master/ui/character/avatar_warrior.png | 未走pipeline | 2026-07-07 13:42 | - | - | assets/resources/textures/ui/character/avatar_warrior.png | ✅ 新版已入库 | 2026-07-07 13:42 |
| ui/character/btn_select.png | 2D | art_source/textures_review/master/ui/character/btn_select.png | 未走pipeline | 2026-07-07 13:24 | - | - | assets/resources/textures/ui/character/btn_select.png | ✅ 新版已入库 | 2026-07-07 13:24 |
| ui/character/character_bg.jpg | 2D | art_source/textures_review/master/ui/character/character_bg.png | 未走pipeline | 2026-07-07 13:12 | - | - | assets/resources/textures/ui/character/character_bg.jpg | ✅ 新版已入库 | 2026-07-07 13:15 |
| ui/character/character_card_default.png | 2D | art_source/textures_review/master/ui/character/character_card_default.png | 未走pipeline | 2026-07-09 11:20 | - | - | assets/resources/textures/ui/character/character_card_default.png | ✅ 新版已入库 | 2026-07-09 11:20 |
| ui/character/character_card_selected.png | 2D | art_source/textures_review/master/ui/character/character_card_selected.png | 未走pipeline | 2026-07-09 11:20 | - | - | assets/resources/textures/ui/character/character_card_selected.png | ✅ 新版已入库 | 2026-07-09 11:20 |
| ui/character/character_detail_panel.png | 2D | art_source/textures_review/master/ui/character/character_detail_panel.png | 未走pipeline | 2026-07-07 13:19 | - | - | assets/resources/textures/ui/character/character_detail_panel.png | ✅ 新版已入库 | 2026-07-07 13:20 |
| ui/character/character_list_panel.png | 2D | art_source/textures_review/master/ui/character/character_list_panel.png | 未走pipeline | 2026-07-07 13:08 | - | - | assets/resources/textures/ui/character/character_list_panel.png | ✅ 新版已入库 | 2026-07-07 13:15 |
| ui/common/btn_active.png | 2D | art_source/textures_review/master/ui/common/btn_active.png | 未走pipeline | 2026-06-30 10:22 | - | - | assets/resources/textures/ui/common/btn_active.png | ✅ 新版已入库 | 2026-06-30 10:22 |
| ui/common/btn_close.png | 2D | art_source/textures_review/master/ui/common/btn_close.png | 未走pipeline | 2026-06-30 10:22 | - | - | assets/resources/textures/ui/common/btn_close.png | ✅ 新版已入库 | 2026-06-30 10:22 |
| ui/common/btn_default.png | 2D | art_source/textures_review/master/ui/common/btn_default.png | 未走pipeline | 2026-06-30 10:23 | - | - | assets/resources/textures/ui/common/btn_default.png | ✅ 新版已入库 | 2026-06-30 10:23 |
| ui/common/btn_hover.png | 2D | art_source/textures_review/master/ui/common/btn_hover.png | 未走pipeline | 2026-06-30 10:23 | - | - | assets/resources/textures/ui/common/btn_hover.png | ✅ 新版已入库 | 2026-06-30 10:23 |
| ui/common/panel_bg.png | 2D | art_source/textures_review/master/ui/common/panel_bg.png | 未走pipeline | 2026-06-30 11:37 | - | - | assets/resources/textures/ui/common/panel_bg.png | ✅ 新版已入库 | 2026-06-30 11:30 |
| ui/create/btn_class_default.png | 2D | art_source/textures_review/master/ui/create/btn_class_default.png | 未走pipeline | 2026-07-09 11:09 | - | - | assets/resources/textures/ui/create/btn_class_default.png | ✅ 新版已入库 | 2026-07-09 11:09 |
| ui/create/btn_class_selected.png | 2D | art_source/textures_review/master/ui/create/btn_class_selected.png | 未走pipeline | 2026-07-09 11:09 | - | - | assets/resources/textures/ui/create/btn_class_selected.png | ✅ 新版已入库 | 2026-07-09 11:09 |
| ui/create/btn_create_confirm.png | 2D | art_source/textures_review/master/ui/create/btn_create_confirm.png | 未走pipeline | 2026-07-09 11:07 | - | - | assets/resources/textures/ui/create/btn_create_confirm.png | ✅ 新版已入库 | 2026-07-09 11:07 |
| ui/create/btn_create_skip.png | 2D | art_source/textures_review/master/ui/create/btn_create_skip.png | 未走pipeline | 2026-07-09 11:08 | - | - | assets/resources/textures/ui/create/btn_create_skip.png | ✅ 新版已入库 | 2026-07-09 11:08 |
| ui/create/character_stage_glow.png | 2D | art_source/textures_review/master/ui/create/character_stage_glow.png | 未走pipeline | 2026-07-07 20:46 | - | - | assets/resources/textures/ui/create/character_stage_glow.png | ✅ 新版已入库 | 2026-07-07 20:46 |
| ui/create/create_bg.jpg | 2D | art_source/textures_review/master/ui/create/create_bg.png | 未走pipeline | 2026-07-07 20:48 | - | - | assets/resources/textures/ui/create/create_bg.jpg | ✅ 新版已入库 | 2026-07-07 20:48 |
| ui/create/create_model_stage.jpg | 2D | art_source/textures_review/master/ui/create/create_model_stage.png | 未走pipeline | 2026-07-07 17:39 | - | - | assets/resources/textures/ui/create/create_model_stage.jpg | ✅ 新版已入库 | 2026-07-07 17:39 |
| ui/create/info_panel.png | 2D | art_source/textures_review/master/ui/create/info_panel.png | 未走pipeline | 2026-07-07 20:54 | - | - | assets/resources/textures/ui/create/info_panel.png | ✅ 新版已入库 | 2026-07-07 20:54 |
| ui/create/input_name.png | 2D | art_source/textures_review/master/ui/create/input_name.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/create/input_name.png | 已入库(版本一致) | 2026-07-08 14:00 |
| ui/create/name_panel.png | 2D | art_source/textures_review/master/ui/create/name_panel.png | 未走pipeline | 2026-07-08 14:39 | - | - | assets/resources/textures/ui/create/name_panel.png | ✅ 新版已入库 | 2026-07-08 14:40 |
| ui/death/btn_revive_active.png | 2D | art_source/textures_review/master/ui/death/btn_revive_active.png | 未走pipeline | 2026-07-07 17:49 | - | - | assets/resources/textures/ui/death/btn_revive_active.png | ✅ 新版已入库 | 2026-07-07 17:49 |
| ui/death/btn_revive_default.png | 2D | art_source/textures_review/master/ui/death/btn_revive_default.png | 未走pipeline | 2026-07-07 17:49 | - | - | assets/resources/textures/ui/death/btn_revive_default.png | ✅ 新版已入库 | 2026-07-07 17:49 |
| ui/death/btn_settle_active.png | 2D | art_source/textures_review/master/ui/death/btn_settle_active.png | 未走pipeline | 2026-07-07 17:49 | - | - | assets/resources/textures/ui/death/btn_settle_active.png | ✅ 新版已入库 | 2026-07-07 17:49 |
| ui/death/btn_settle_default.png | 2D | art_source/textures_review/master/ui/death/btn_settle_default.png | 未走pipeline | 2026-07-07 17:49 | - | - | assets/resources/textures/ui/death/btn_settle_default.png | ✅ 新版已入库 | 2026-07-07 17:49 |
| ui/death/death_bg.jpg | 2D | art_source/textures_review/master/ui/death/death_bg.png | 未走pipeline | 2026-07-07 11:01 | - | - | assets/resources/textures/ui/death/death_bg.jpg | ✅ 新版已入库 | 2026-07-07 11:02 |
| ui/death/icon_soulstone.png | 2D | art_source/textures_review/master/ui/death/icon_soulstone.png | 未走pipeline | 2026-07-07 17:49 | - | - | assets/resources/textures/ui/death/icon_soulstone.png | ✅ 新版已入库 | 2026-07-07 17:49 |
| ui/death/result_panel.png | 2D | art_source/textures_review/master/ui/death/result_panel.png | 未走pipeline | 2026-07-07 11:32 | - | - | assets/resources/textures/ui/death/result_panel.png | ✅ 新版已入库 | 2026-07-07 11:33 |
| ui/equipment/btn_close.png | 2D | art_source/textures_review/master/ui/equipment/btn_close.png | 未走pipeline | 2026-07-07 15:43 | - | - | assets/resources/textures/ui/equipment/btn_close.png | ✅ 新版已入库 | 2026-07-07 15:43 |
| ui/equipment/btn_equip.png | 2D | art_source/textures_review/master/ui/equipment/btn_equip.png | 未走pipeline | 2026-07-07 15:42 | - | - | assets/resources/textures/ui/equipment/btn_equip.png | ✅ 新版已入库 | 2026-07-07 15:43 |
| ui/equipment/equip_body_frame.png | 2D | art_source/textures_review/master/ui/equipment/equip_body_frame.png | 未走pipeline | 2026-07-07 15:31 | - | - | assets/resources/textures/ui/equipment/equip_body_frame.png | ✅ 新版已入库 | 2026-07-07 15:33 |
| ui/equipment/equip_slot_chest.png | 2D | art_source/textures_review/master/ui/equipment/equip_slot_chest.png | 未走pipeline | 2026-07-07 16:18 | - | - | assets/resources/textures/ui/equipment/equip_slot_chest.png | ✅ 新版已入库 | 2026-07-07 16:21 |
| ui/equipment/equip_slot_gloves.png | 2D | art_source/textures_review/master/ui/equipment/equip_slot_gloves.png | 未走pipeline | 2026-07-07 16:19 | - | - | assets/resources/textures/ui/equipment/equip_slot_gloves.png | ✅ 新版已入库 | 2026-07-07 16:21 |
| ui/equipment/equip_slot_helmet.png | 2D | art_source/textures_review/master/ui/equipment/equip_slot_helmet.png | 未走pipeline | 2026-07-07 16:18 | - | - | assets/resources/textures/ui/equipment/equip_slot_helmet.png | ✅ 新版已入库 | 2026-07-07 16:21 |
| ui/equipment/equip_slot_legs.png | 2D | art_source/textures_review/master/ui/equipment/equip_slot_legs.png | 未走pipeline | 2026-07-07 16:19 | - | - | assets/resources/textures/ui/equipment/equip_slot_legs.png | ✅ 新版已入库 | 2026-07-07 16:21 |
| ui/equipment/equip_slot_necklace.png | 2D | art_source/textures_review/master/ui/equipment/equip_slot_necklace.png | 未走pipeline | 2026-07-07 16:21 | - | - | assets/resources/textures/ui/equipment/equip_slot_necklace.png | ✅ 新版已入库 | 2026-07-07 16:21 |
| ui/equipment/equip_slot_ring.png | 2D | art_source/textures_review/master/ui/equipment/equip_slot_ring.png | 未走pipeline | 2026-07-07 16:20 | - | - | assets/resources/textures/ui/equipment/equip_slot_ring.png | ✅ 新版已入库 | 2026-07-07 16:21 |
| ui/equipment/equip_slot_shoes.png | 2D | art_source/textures_review/master/ui/equipment/equip_slot_shoes.png | 未走pipeline | 2026-07-07 16:20 | - | - | assets/resources/textures/ui/equipment/equip_slot_shoes.png | ✅ 新版已入库 | 2026-07-07 16:21 |
| ui/equipment/equip_slot_weapon.png | 2D | art_source/textures_review/master/ui/equipment/equip_slot_weapon.png | 未走pipeline | 2026-07-07 16:17 | - | - | assets/resources/textures/ui/equipment/equip_slot_weapon.png | ✅ 新版已入库 | 2026-07-07 16:21 |
| ui/equipment/equipment_bg.jpg | 2D | art_source/textures_review/master/ui/equipment/equipment_bg.png | 未走pipeline | 2026-07-07 15:30 | - | - | assets/resources/textures/ui/equipment/equipment_bg.jpg | ✅ 新版已入库 | 2026-07-07 15:33 |
| ui/equipment/inventory_panel.png | 2D | art_source/textures_review/master/ui/equipment/inventory_panel.png | 未走pipeline | 2026-07-07 15:33 | - | - | assets/resources/textures/ui/equipment/inventory_panel.png | ✅ 新版已入库 | 2026-07-07 15:33 |
| ui/equipment/inventory_slot.png | 2D | art_source/textures_review/master/ui/equipment/inventory_slot.png | 未走pipeline | 2026-07-07 15:40 | - | - | assets/resources/textures/ui/equipment/inventory_slot.png | ✅ 新版已入库 | 2026-07-07 15:43 |
| ui/equipment/item_slot.png | 2D | art_source/textures_review/master/ui/equipment/item_slot.png | 未走pipeline | 2026-07-07 15:40 | - | - | assets/resources/textures/ui/equipment/item_slot.png | ✅ 新版已入库 | 2026-07-07 15:43 |
| ui/equipment/rarity_common.png | 2D | art_source/textures_review/master/ui/equipment/rarity_common.png | 未走pipeline | 2026-06-30 10:34 | - | - | assets/resources/textures/ui/equipment/rarity_common.png | ✅ 新版已入库 | 2026-06-30 10:34 |
| ui/equipment/rarity_legendary.png | 2D | art_source/textures_review/master/ui/equipment/rarity_legendary.png | 未走pipeline | 2026-06-30 10:35 | - | - | assets/resources/textures/ui/equipment/rarity_legendary.png | ✅ 新版已入库 | 2026-06-30 10:35 |
| ui/equipment/rarity_magic.png | 2D | art_source/textures_review/master/ui/equipment/rarity_magic.png | 未走pipeline | 2026-06-30 10:35 | - | - | assets/resources/textures/ui/equipment/rarity_magic.png | ✅ 新版已入库 | 2026-06-30 10:35 |
| ui/equipment/rarity_rare.png | 2D | art_source/textures_review/master/ui/equipment/rarity_rare.png | 未走pipeline | 2026-06-30 10:36 | - | - | assets/resources/textures/ui/equipment/rarity_rare.png | ✅ 新版已入库 | 2026-06-30 10:36 |
| ui/equipment/set_counter_bg.png | 2D | art_source/textures_review/master/ui/equipment/set_counter_bg.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/equipment/set_counter_bg.png | ✅ 新版已入库 | 2026-07-07 20:23 |
| ui/event/btn_continue.png | 2D | art_source/textures_review/master/ui/event/btn_continue.png | 未走pipeline | 2026-07-07 15:56 | - | - | assets/resources/textures/ui/event/btn_continue.png | ✅ 新版已入库 | 2026-07-07 15:56 |
| ui/event/choice_card.png | 2D | art_source/textures_review/master/ui/event/choice_card.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/event/choice_card.png | ✅ 新版已入库 | 2026-07-07 20:23 |
| ui/event/event_bg.jpg | 2D | art_source/textures_review/master/ui/event/event_bg.png | 未走pipeline | 2026-07-07 20:39 | - | - | assets/resources/textures/ui/event/event_bg.jpg | ✅ 新版已入库 | 2026-07-07 20:39 |
| ui/event/event_panel.png | 2D | art_source/textures_review/master/ui/event/event_panel.png | 未走pipeline | 2026-07-07 15:53 | - | - | assets/resources/textures/ui/event/event_panel.png | ✅ 新版已入库 | 2026-07-07 15:56 |
| ui/hud/floor_badge.png | 2D | art_source/textures_review/master/ui/hud/floor_badge.png | 未走pipeline | 2026-07-07 15:57 | - | - | assets/resources/textures/ui/hud/floor_badge.png | ✅ 新版已入库 | 2026-07-07 15:58 |
| ui/hud/hud_cdmask.png | 2D | art_source/textures_review/master/ui/hud/hud_cdmask.png | 未走pipeline | 2026-07-07 14:55 | - | - | assets/resources/textures/ui/hud/hud_cdmask.png | ✅ 新版已入库 | 2026-07-07 14:56 |
| ui/hud/hud_hpbar_bg.png | 2D | art_source/textures_review/master/ui/hud/hud_hpbar_bg.png | 未走pipeline | 2026-07-07 14:40 | - | - | assets/resources/textures/ui/hud/hud_hpbar_bg.png | ✅ 新版已入库 | 2026-07-07 14:42 |
| ui/hud/hud_hpbar_fill.png | 2D | art_source/textures_review/master/ui/hud/hud_hpbar_fill.png | 未走pipeline | 2026-07-07 14:41 | - | - | assets/resources/textures/ui/hud/hud_hpbar_fill.png | ✅ 新版已入库 | 2026-07-07 14:42 |
| ui/hud/hud_hpbar_frame.png | 2D | art_source/textures_review/master/ui/hud/hud_hpbar_frame.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/hud/hud_hpbar_frame.png | ✅ 新版已入库 | 2026-07-07 20:23 |
| ui/hud/hud_rollbtn.png | 2D | art_source/textures_review/master/ui/hud/hud_rollbtn.png | 未走pipeline | 2026-07-07 14:56 | - | - | assets/resources/textures/ui/hud/hud_rollbtn.png | ✅ 新版已入库 | 2026-07-07 14:56 |
| ui/hud/hud_skillslot.png | 2D | art_source/textures_review/master/ui/hud/hud_skillslot.png | 未走pipeline | 2026-07-07 14:49 | - | - | assets/resources/textures/ui/hud/hud_skillslot.png | ✅ 新版已入库 | 2026-07-07 14:56 |
| ui/hud/joystick_base.png | 2D | art_source/textures_review/master/ui/hud/joystick_base.png | 未走pipeline | 2026-07-07 15:02 | - | - | assets/resources/textures/ui/hud/joystick_base.png | ✅ 新版已入库 | 2026-07-07 15:03 |
| ui/hud/joystick_dot.png | 2D | art_source/textures_review/master/ui/hud/joystick_dot.png | 未走pipeline | 2026-07-07 15:03 | - | - | assets/resources/textures/ui/hud/joystick_dot.png | ✅ 新版已入库 | 2026-07-07 15:03 |
| ui/hud/kill_badge.png | 2D | art_source/textures_review/master/ui/hud/kill_badge.png | 未走pipeline | 2026-07-07 15:57 | - | - | assets/resources/textures/ui/hud/kill_badge.png | ✅ 新版已入库 | 2026-07-07 15:58 |
| ui/hud/pause_btn.png | 2D | art_source/textures_review/master/ui/hud/pause_btn.png | 未走pipeline | 2026-07-07 15:58 | - | - | assets/resources/textures/ui/hud/pause_btn.png | ✅ 新版已入库 | 2026-07-07 15:58 |
| ui/log/btn_close.png | 2D | art_source/textures_review/master/ui/log/btn_close.png | 未走pipeline | 2026-07-07 14:15 | - | - | assets/resources/textures/ui/log/btn_close.png | ✅ 新版已入库 | 2026-07-07 14:20 |
| ui/log/log_bg.jpg | 2D | art_source/textures_review/master/ui/log/log_bg.png | 未走pipeline | 2026-07-07 14:13 | - | - | assets/resources/textures/ui/log/log_bg.jpg | ✅ 新版已入库 | 2026-07-07 14:15 |
| ui/log/log_book_panel.png | 2D | art_source/textures_review/master/ui/log/log_book_panel.png | 未走pipeline | 2026-07-07 14:14 | - | - | assets/resources/textures/ui/log/log_book_panel.png | ✅ 新版已入库 | 2026-07-07 14:15 |
| ui/log/stat_row.png | 2D | art_source/textures_review/master/ui/log/stat_row.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/log/stat_row.png | ✅ 新版已入库 | 2026-07-07 20:23 |
| ui/log/trophy_icon.png | 2D | art_source/textures_review/master/ui/log/trophy_icon.png | 未走pipeline | 2026-07-07 14:17 | - | - | assets/resources/textures/ui/log/trophy_icon.png | ✅ 新版已入库 | 2026-07-07 14:32 |
| ui/login/agreement_strip.png | 2D | art_source/textures_review/master/ui/login/agreement_strip.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/login/agreement_strip.png | ✅ 新版已入库 | 2026-07-07 20:23 |
| ui/login/btn_guest.png | 2D | art_source/textures_review/master/ui/login/btn_guest.png | 未走pipeline | 2026-07-07 18:02 | - | - | assets/resources/textures/ui/login/btn_guest.png | ✅ 新版已入库 | 2026-07-07 18:02 |
| ui/login/btn_wechat.png | 2D | art_source/textures_review/master/ui/login/btn_wechat.png | 未走pipeline | 2026-07-07 17:59 | - | - | assets/resources/textures/ui/login/btn_wechat.png | ✅ 新版已入库 | 2026-07-07 17:59 |
| ui/login/login_bg.jpg | 2D | art_source/textures_review/master/ui/login/login_bg.jpg | 未走pipeline | 2026-07-07 16:45 | - | - | assets/resources/textures/ui/login/login_bg.jpg | ✅ 新版已入库 | 2026-07-07 16:46 |
| ui/login/login_panel.png | 2D | art_source/textures_review/master/ui/login/login_panel.png | 未走pipeline | 2026-07-07 17:57 | - | - | assets/resources/textures/ui/login/login_panel.png | ✅ 新版已入库 | 2026-07-07 18:04 |
| ui/main/btn_adventure.png | 2D | art_source/textures_review/master/ui/main/btn_adventure.png | 未走pipeline | 2026-07-07 17:54 | - | - | assets/resources/textures/ui/main/btn_adventure.png | ✅ 新版已入库 | 2026-07-07 17:54 |
| ui/main/btn_character.png | 2D | art_source/textures_review/master/ui/main/btn_character.png | 未走pipeline | 2026-07-07 17:54 | - | - | assets/resources/textures/ui/main/btn_character.png | ✅ 新版已入库 | 2026-07-07 17:54 |
| ui/main/btn_log.png | 2D | art_source/textures_review/master/ui/main/btn_log.png | 未走pipeline | 2026-07-07 17:55 | - | - | assets/resources/textures/ui/main/btn_log.png | ✅ 新版已入库 | 2026-07-07 17:55 |
| ui/main/btn_settings.png | 2D | art_source/textures_review/master/ui/main/btn_settings.png | 未走pipeline | 2026-07-07 17:56 | - | - | assets/resources/textures/ui/main/btn_settings.png | ✅ 新版已入库 | 2026-07-07 17:56 |
| ui/main/btn_shop.png | 2D | art_source/textures_review/master/ui/main/btn_shop.png | 未走pipeline | 2026-07-07 17:55 | - | - | assets/resources/textures/ui/main/btn_shop.png | ✅ 新版已入库 | 2026-07-07 17:55 |
| ui/main/main_bg.jpg | 2D | art_source/textures_review/master/ui/main/main_bg.jpg | 未走pipeline | 2026-07-07 16:45 | - | - | assets/resources/textures/ui/main/main_bg.jpg | 已入库(版本一致) | 2026-07-07 17:53 |
| ui/main/main_titledeco.png | 2D | art_source/textures_review/master/ui/main/main_titledeco.png | 未走pipeline | 2026-07-07 16:45 | - | - | assets/resources/textures/ui/main/main_titledeco.png | ✅ 新版已入库 | 2026-07-07 16:46 |
| ui/main/top_status_panel.png | 2D | art_source/textures_review/master/ui/main/top_status_panel.png | 未走pipeline | 2026-07-07 17:57 | - | - | assets/resources/textures/ui/main/top_status_panel.png | ✅ 新版已入库 | 2026-07-07 17:57 |
| ui/map/icon_room_boss.png | 2D | art_source/textures_review/master/ui/map/icon_room_boss.png | 未走pipeline | 2026-07-07 16:03 | - | - | assets/resources/textures/ui/map/icon_room_boss.png | ✅ 新版已入库 | 2026-07-07 16:07 |
| ui/map/icon_room_combat.png | 2D | art_source/textures_review/master/ui/map/icon_room_combat.png | 未走pipeline | 2026-07-07 16:02 | - | - | assets/resources/textures/ui/map/icon_room_combat.png | ✅ 新版已入库 | 2026-07-07 16:07 |
| ui/map/icon_room_event.png | 2D | art_source/textures_review/master/ui/map/icon_room_event.png | 未走pipeline | 2026-07-07 16:04 | - | - | assets/resources/textures/ui/map/icon_room_event.png | ✅ 新版已入库 | 2026-07-07 16:07 |
| ui/map/icon_room_healing.png | 2D | art_source/textures_review/master/ui/map/icon_room_healing.png | 未走pipeline | 2026-07-07 16:04 | - | - | assets/resources/textures/ui/map/icon_room_healing.png | ✅ 新版已入库 | 2026-07-07 16:07 |
| ui/map/icon_room_shop.png | 2D | art_source/textures_review/master/ui/map/icon_room_shop.png | 未走pipeline | 2026-07-07 16:05 | - | - | assets/resources/textures/ui/map/icon_room_shop.png | ✅ 新版已入库 | 2026-07-07 16:07 |
| ui/map/icon_room_treasure.png | 2D | art_source/textures_review/master/ui/map/icon_room_treasure.png | 未走pipeline | 2026-07-07 16:06 | - | - | assets/resources/textures/ui/map/icon_room_treasure.png | ✅ 新版已入库 | 2026-07-07 16:07 |
| ui/map/icon_room_upgrade.png | 2D | art_source/textures_review/master/ui/map/icon_room_upgrade.png | 未走pipeline | 2026-07-07 16:07 | - | - | assets/resources/textures/ui/map/icon_room_upgrade.png | ✅ 新版已入库 | 2026-07-07 16:07 |
| ui/map/map_line.png | 2D | art_source/textures_review/master/ui/map/map_line.png | 未走pipeline | 2026-06-30 10:46 | - | - | assets/resources/textures/ui/map/map_line.png | ✅ 新版已入库 | 2026-06-30 10:46 |
| ui/map/map_node_current.png | 2D | art_source/textures_review/master/ui/map/map_node_current.png | 未走pipeline | 2026-07-07 15:08 | - | - | assets/resources/textures/ui/map/map_node_current.png | ✅ 新版已入库 | 2026-07-07 15:11 |
| ui/map/map_node_unknown.png | 2D | art_source/textures_review/master/ui/map/map_node_unknown.png | 未走pipeline | 2026-07-07 15:09 | - | - | assets/resources/textures/ui/map/map_node_unknown.png | ✅ 新版已入库 | 2026-07-07 15:11 |
| ui/map/map_node_visited.png | 2D | art_source/textures_review/master/ui/map/map_node_visited.png | 未走pipeline | 2026-07-07 15:11 | - | - | assets/resources/textures/ui/map/map_node_visited.png | ✅ 新版已入库 | 2026-07-07 15:11 |
| ui/map/map_panel.png | 2D | art_source/textures_review/master/ui/map/map_panel.png | 未走pipeline | 2026-07-07 15:07 | - | - | assets/resources/textures/ui/map/map_panel.png | ✅ 新版已入库 | 2026-07-07 15:11 |
| ui/settings/btn_close.png | 2D | art_source/textures_review/master/ui/settings/btn_close.png | 未走pipeline | 2026-07-07 14:35 | - | - | assets/resources/textures/ui/settings/btn_close.png | ✅ 新版已入库 | 2026-07-07 14:35 |
| ui/settings/btn_reset.png | 2D | art_source/textures_review/master/ui/settings/btn_reset.png | 未走pipeline | 2026-07-07 20:40 | - | - | assets/resources/textures/ui/settings/btn_reset.png | ✅ 新版已入库 | 2026-07-07 20:40 |
| ui/settings/settings_bg.jpg | 2D | art_source/textures_review/master/ui/settings/settings_bg.png | 未走pipeline | 2026-07-07 14:18 | - | - | assets/resources/textures/ui/settings/settings_bg.jpg | ✅ 新版已入库 | 2026-07-07 14:18 |
| ui/settings/settings_panel.png | 2D | art_source/textures_review/master/ui/settings/settings_panel.png | 未走pipeline | 2026-07-07 14:32 | - | - | assets/resources/textures/ui/settings/settings_panel.png | ✅ 新版已入库 | 2026-07-07 14:35 |
| ui/settlement/btn_back.png | 2D | art_source/textures_review/master/ui/settlement/btn_back.png | 未走pipeline | 2026-07-07 17:49 | - | - | assets/resources/textures/ui/settlement/btn_back.png | ✅ 新版已入库 | 2026-07-07 17:49 |
| ui/settlement/btn_double.png | 2D | art_source/textures_review/master/ui/settlement/btn_double.png | 未走pipeline | 2026-07-07 17:49 | - | - | assets/resources/textures/ui/settlement/btn_double.png | ✅ 新版已入库 | 2026-07-07 17:49 |
| ui/settlement/result_panel.png | 2D | art_source/textures_review/master/ui/settlement/result_panel.png | 未走pipeline | 2026-07-07 11:34 | - | - | assets/resources/textures/ui/settlement/result_panel.png | ✅ 新版已入库 | 2026-07-07 11:35 |
| ui/settlement/reward_strip.png | 2D | art_source/textures_review/master/ui/settlement/reward_strip.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/settlement/reward_strip.png | ✅ 新版已入库 | 2026-07-07 20:23 |
| ui/settlement/settlement_bg.jpg | 2D | art_source/textures_review/master/ui/settlement/settlement_bg.png | 未走pipeline | 2026-07-07 11:06 | - | - | assets/resources/textures/ui/settlement/settlement_bg.jpg | ✅ 新版已入库 | 2026-07-07 11:07 |
| ui/settlement/soulstone_icon.png | 2D | art_source/textures_review/master/ui/settlement/soulstone_icon.png | 未走pipeline | 2026-07-07 17:49 | - | - | assets/resources/textures/ui/settlement/soulstone_icon.png | ✅ 新版已入库 | 2026-07-07 17:49 |
| ui/shop/btn_buy.png | 2D | art_source/textures_review/master/ui/shop/btn_buy.png | 未走pipeline | 2026-07-07 14:08 | - | - | assets/resources/textures/ui/shop/btn_buy.png | ✅ 新版已入库 | 2026-07-07 14:10 |
| ui/shop/coin_panel.png | 2D | art_source/textures_review/master/ui/shop/coin_panel.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/shop/coin_panel.png | ✅ 新版已入库 | 2026-07-07 20:23 |
| ui/shop/icon_coin.png | 2D | art_source/textures_review/master/ui/shop/icon_coin.png | 未走pipeline | 2026-07-07 14:10 | - | - | assets/resources/textures/ui/shop/icon_coin.png | ✅ 新版已入库 | 2026-07-07 14:32 |
| ui/shop/shop_bg.jpg | 2D | art_source/textures_review/master/ui/shop/shop_bg.png | 未走pipeline | 2026-07-07 14:02 | - | - | assets/resources/textures/ui/shop/shop_bg.jpg | ✅ 新版已入库 | 2026-07-07 14:04 |
| ui/shop/shop_shelf_panel.png | 2D | art_source/textures_review/master/ui/shop/shop_shelf_panel.png | 未走pipeline | 2026-07-07 14:03 | - | - | assets/resources/textures/ui/shop/shop_shelf_panel.png | ✅ 新版已入库 | 2026-07-07 14:04 |
| ui/shop/shop_slot.png | 2D | art_source/textures_review/master/ui/shop/shop_slot.png | 未走pipeline | 2026-07-07 14:04 | - | - | assets/resources/textures/ui/shop/shop_slot.png | ✅ 新版已入库 | 2026-07-07 14:04 |
| ui/splash/loading_bar.png | 2D | art_source/textures_review/master/ui/splash/loading_bar.png | 未走pipeline | 2026-07-07 20:23 | - | - | assets/resources/textures/ui/splash/loading_bar.png | ✅ 新版已入库 | 2026-07-07 20:23 |
| ui/splash/splash_bg.jpg | 2D | art_source/textures_review/master/ui/splash/splash_bg.png | 未走pipeline | 2026-07-07 12:27 | - | - | assets/resources/textures/ui/splash/splash_bg.jpg | ✅ 新版已入库 | 2026-07-07 12:31 |
| ui/splash/splash_logo.png | 2D | art_source/textures_review/master/ui/splash/splash_logo.png | 未走pipeline | 2026-07-07 12:34 | - | - | assets/resources/textures/ui/splash/splash_logo.png | ✅ 新版已入库 | 2026-07-07 12:34 |
| ui/upgrade/btn_pick.png | 2D | art_source/textures_review/master/ui/upgrade/btn_pick.png | 未走pipeline | 2026-07-07 15:29 | - | - | assets/resources/textures/ui/upgrade/btn_pick.png | ✅ 新版已入库 | 2026-07-07 15:29 |
| ui/upgrade/card_frame_common.png | 2D | art_source/textures_review/master/ui/upgrade/card_frame_common.png | 未走pipeline | 2026-07-07 15:15 | - | - | assets/resources/textures/ui/upgrade/card_frame_common.png | ✅ 新版已入库 | 2026-07-07 15:17 |
| ui/upgrade/card_frame_epic.png | 2D | art_source/textures_review/master/ui/upgrade/card_frame_epic.png | 未走pipeline | 2026-07-07 15:17 | - | - | assets/resources/textures/ui/upgrade/card_frame_epic.png | ✅ 新版已入库 | 2026-07-07 15:17 |
| ui/upgrade/card_frame_rare.png | 2D | art_source/textures_review/master/ui/upgrade/card_frame_rare.png | 未走pipeline | 2026-07-07 15:16 | - | - | assets/resources/textures/ui/upgrade/card_frame_rare.png | ✅ 新版已入库 | 2026-07-07 15:17 |
| ui/upgrade/icon_ability_bullettime.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_bullettime.png | 未走pipeline | 2026-06-30 10:53 | - | - | assets/resources/textures/ui/upgrade/icon_ability_bullettime.png | ✅ 新版已入库 | 2026-06-30 10:53 |
| ui/upgrade/icon_ability_doublestrike.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_doublestrike.png | 未走pipeline | 2026-06-30 10:54 | - | - | assets/resources/textures/ui/upgrade/icon_ability_doublestrike.png | ✅ 新版已入库 | 2026-06-30 10:54 |
| ui/upgrade/icon_ability_elementresonance.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_elementresonance.png | 未走pipeline | 2026-06-30 10:54 | - | - | assets/resources/textures/ui/upgrade/icon_ability_elementresonance.png | ✅ 新版已入库 | 2026-06-30 10:54 |
| ui/upgrade/icon_ability_firewalker.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_firewalker.png | 未走pipeline | 2026-06-30 10:55 | - | - | assets/resources/textures/ui/upgrade/icon_ability_firewalker.png | ✅ 新版已入库 | 2026-06-30 10:55 |
| ui/upgrade/icon_ability_frostbite.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_frostbite.png | 未走pipeline | 2026-06-30 10:55 | - | - | assets/resources/textures/ui/upgrade/icon_ability_frostbite.png | ✅ 新版已入库 | 2026-06-30 10:55 |
| ui/upgrade/icon_ability_holyshield.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_holyshield.png | 未走pipeline | 2026-06-30 10:56 | - | - | assets/resources/textures/ui/upgrade/icon_ability_holyshield.png | ✅ 新版已入库 | 2026-06-30 10:56 |
| ui/upgrade/icon_ability_lifestealaura.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_lifestealaura.png | 未走pipeline | 2026-06-30 10:57 | - | - | assets/resources/textures/ui/upgrade/icon_ability_lifestealaura.png | ✅ 新版已入库 | 2026-06-30 10:57 |
| ui/upgrade/icon_ability_phasewalk.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_phasewalk.png | 未走pipeline | 2026-06-30 10:57 | - | - | assets/resources/textures/ui/upgrade/icon_ability_phasewalk.png | ✅ 新版已入库 | 2026-06-30 10:57 |
| ui/upgrade/icon_ability_ricochet.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_ricochet.png | 未走pipeline | 2026-06-30 10:58 | - | - | assets/resources/textures/ui/upgrade/icon_ability_ricochet.png | ✅ 新版已入库 | 2026-06-30 10:58 |
| ui/upgrade/icon_ability_shieldreflect.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_shieldreflect.png | 未走pipeline | 2026-06-30 10:58 | - | - | assets/resources/textures/ui/upgrade/icon_ability_shieldreflect.png | ✅ 新版已入库 | 2026-06-30 10:58 |
| ui/upgrade/icon_ability_sprint.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_sprint.png | 未走pipeline | 2026-06-30 10:59 | - | - | assets/resources/textures/ui/upgrade/icon_ability_sprint.png | ✅ 新版已入库 | 2026-06-30 10:59 |
| ui/upgrade/icon_ability_warcry.png | 2D | art_source/textures_review/master/ui/upgrade/icon_ability_warcry.png | 未走pipeline | 2026-06-30 11:00 | - | - | assets/resources/textures/ui/upgrade/icon_ability_warcry.png | ✅ 新版已入库 | 2026-06-30 11:00 |
| ui/upgrade/icon_relic_blinkstone.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_blinkstone.png | 未走pipeline | 2026-06-30 11:01 | - | - | assets/resources/textures/ui/upgrade/icon_relic_blinkstone.png | ✅ 新版已入库 | 2026-06-30 11:01 |
| ui/upgrade/icon_relic_decoyscroll.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_decoyscroll.png | 未走pipeline | 2026-06-30 11:01 | - | - | assets/resources/textures/ui/upgrade/icon_relic_decoyscroll.png | ✅ 新版已入库 | 2026-06-30 11:01 |
| ui/upgrade/icon_relic_echoorb.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_echoorb.png | 未走pipeline | 2026-06-30 11:02 | - | - | assets/resources/textures/ui/upgrade/icon_relic_echoorb.png | ✅ 新版已入库 | 2026-06-30 11:02 |
| ui/upgrade/icon_relic_flamering.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_flamering.png | 未走pipeline | 2026-06-30 11:02 | - | - | assets/resources/textures/ui/upgrade/icon_relic_flamering.png | ✅ 新版已入库 | 2026-06-30 11:02 |
| ui/upgrade/icon_relic_frenzyaxe.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_frenzyaxe.png | 未走pipeline | 2026-06-30 11:03 | - | - | assets/resources/textures/ui/upgrade/icon_relic_frenzyaxe.png | ✅ 新版已入库 | 2026-06-30 11:03 |
| ui/upgrade/icon_relic_frostamulet.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_frostamulet.png | 未走pipeline | 2026-06-30 11:04 | - | - | assets/resources/textures/ui/upgrade/icon_relic_frostamulet.png | ✅ 新版已入库 | 2026-06-30 11:04 |
| ui/upgrade/icon_relic_gravitystone.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_gravitystone.png | 未走pipeline | 2026-06-30 11:04 | - | - | assets/resources/textures/ui/upgrade/icon_relic_gravitystone.png | ✅ 新版已入库 | 2026-06-30 11:04 |
| ui/upgrade/icon_relic_immortalstone.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_immortalstone.png | 未走pipeline | 2026-06-30 11:05 | - | - | assets/resources/textures/ui/upgrade/icon_relic_immortalstone.png | ✅ 新版已入库 | 2026-06-30 11:05 |
| ui/upgrade/icon_relic_ironarmor.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_ironarmor.png | 未走pipeline | 2026-06-30 11:06 | - | - | assets/resources/textures/ui/upgrade/icon_relic_ironarmor.png | ✅ 新版已入库 | 2026-06-30 11:06 |
| ui/upgrade/icon_relic_lifelink.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_lifelink.png | 未走pipeline | 2026-06-30 11:06 | - | - | assets/resources/textures/ui/upgrade/icon_relic_lifelink.png | ✅ 新版已入库 | 2026-06-30 11:06 |
| ui/upgrade/icon_relic_luckycoin.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_luckycoin.png | 未走pipeline | 2026-06-30 11:07 | - | - | assets/resources/textures/ui/upgrade/icon_relic_luckycoin.png | ✅ 新版已入库 | 2026-06-30 11:07 |
| ui/upgrade/icon_relic_shadowcloak.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_shadowcloak.png | 未走pipeline | 2026-06-30 11:08 | - | - | assets/resources/textures/ui/upgrade/icon_relic_shadowcloak.png | ✅ 新版已入库 | 2026-06-30 11:08 |
| ui/upgrade/icon_relic_shadowdagger.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_shadowdagger.png | 未走pipeline | 2026-06-30 11:08 | - | - | assets/resources/textures/ui/upgrade/icon_relic_shadowdagger.png | ✅ 新版已入库 | 2026-06-30 11:08 |
| ui/upgrade/icon_relic_speedgauntlet.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_speedgauntlet.png | 未走pipeline | 2026-06-30 11:09 | - | - | assets/resources/textures/ui/upgrade/icon_relic_speedgauntlet.png | ✅ 新版已入库 | 2026-06-30 11:09 |
| ui/upgrade/icon_relic_thornarmor.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_thornarmor.png | 未走pipeline | 2026-06-30 11:10 | - | - | assets/resources/textures/ui/upgrade/icon_relic_thornarmor.png | ✅ 新版已入库 | 2026-06-30 11:10 |
| ui/upgrade/icon_relic_timehourglass.png | 2D | art_source/textures_review/master/ui/upgrade/icon_relic_timehourglass.png | 未走pipeline | 2026-06-30 11:10 | - | - | assets/resources/textures/ui/upgrade/icon_relic_timehourglass.png | ✅ 新版已入库 | 2026-06-30 11:10 |
| ui/upgrade/icon_upgrade_agileboots.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_agileboots.png | 未走pipeline | 2026-06-30 11:11 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_agileboots.png | 已入库(版本一致) | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_aoeenhance.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_aoeenhance.png | 未走pipeline | 2026-07-07 16:15 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_aoeenhance.png | ✅ 新版已入库 | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_berserkerpact.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_berserkerpact.png | 未走pipeline | 2026-07-07 16:13 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_berserkerpact.png | ✅ 新版已入库 | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_greedring.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_greedring.png | 未走pipeline | 2026-06-30 11:12 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_greedring.png | 已入库(版本一致) | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_ironwall.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_ironwall.png | 未走pipeline | 2026-06-30 11:13 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_ironwall.png | 已入库(版本一致) | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_lifecharm.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_lifecharm.png | 未走pipeline | 2026-07-07 16:13 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_lifecharm.png | ✅ 新版已入库 | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_longarm.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_longarm.png | 未走pipeline | 2026-06-30 11:14 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_longarm.png | 已入库(版本一致) | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_meleeboost.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_meleeboost.png | 未走pipeline | 2026-07-07 16:15 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_meleeboost.png | ✅ 新版已入库 | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_movespeed.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_movespeed.png | 未走pipeline | 2026-07-07 16:16 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_movespeed.png | ✅ 新版已入库 | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_rangedboost.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_rangedboost.png | 未走pipeline | 2026-07-07 16:14 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_rangedboost.png | ✅ 新版已入库 | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_skillslot.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_skillslot.png | 未走pipeline | 2026-07-07 16:14 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_skillslot.png | ✅ 新版已入库 | 2026-07-07 16:16 |
| ui/upgrade/icon_upgrade_windstep.png | 2D | art_source/textures_review/master/ui/upgrade/icon_upgrade_windstep.png | 未走pipeline | 2026-06-30 11:15 | - | - | assets/resources/textures/ui/upgrade/icon_upgrade_windstep.png | 已入库(版本一致) | 2026-07-07 16:16 |
| ui/upgrade/upgrade_bg.jpg | 2D | art_source/textures_review/master/ui/upgrade/upgrade_bg.png | 未走pipeline | 2026-07-07 15:14 | - | - | assets/resources/textures/ui/upgrade/upgrade_bg.jpg | ✅ 新版已入库 | 2026-07-07 15:17 |

## Effects（27个）

| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |
|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|
| effects/combat/fx_crit.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/combat/fx_dash.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/combat/fx_dodge.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/combat/fx_heal.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/combat/fx_hit_normal.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/combat/fx_shield.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_burn.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_conduct.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_corrode.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_decay.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_freeze.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_melt.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_overload.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_radiance.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_shatter.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_vaporize.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/reactions/fx_reaction_void.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/relics/fx_relic_blink_stone.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/relics/fx_relic_decoy_scroll.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/relics/fx_relic_flame_ring.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/relics/fx_relic_frost_amulet.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/relics/fx_relic_gravity_stone.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/relics/fx_relic_life_link.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/relics/fx_relic_shadow_dagger.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/relics/fx_relic_time_hourglass.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/ui/fx_ui_glow.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
| effects/ui/fx_ui_loading.png | 3D | - | 未走pipeline | - | - | - | - | ❌ 未入库 | - |
