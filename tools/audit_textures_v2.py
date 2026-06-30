"""textures 全量资源审计脚本 v2
按用户反馈重写：补全字段、减少 replace 比例、修正 Boss 尺寸、补帧信息
输出完整审计 CSV，含 S/A/B/C 分级建议
"""
import os, csv, json
from PIL import Image

TEXTURES_DIR = r"E:\game\回到地面\assets\resources\textures"
META_DIR     = r"E:\game\回到地面\assets\resources\textures"
OUTPUT_CSV   = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"
FORBIDDEN_OUT = r"E:\game\回到地面\art_source\textures_forbidden_audit.csv"
CACHE_FILE   = r"E:\game\tools\used_by_cache.json"

# 加载引用缓存（如果存在）
ref_cache = {}
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, encoding="utf-8") as f:
        ref_cache = json.load(f)

# ======== 引用分析辅助 ========
def get_ref_info(rel_path: str, category: str) -> dict:
    """从缓存或目录分析获取 used_by/reference_count/scene_or_ui"""
    fname = os.path.basename(rel_path)
    # 优先从缓存取
    if fname in ref_cache and ref_cache[fname].get("used_by", "unknown") != "unknown":
        return ref_cache[fname]
    # 兜底：从目录推断
    p = rel_path.replace("\\", "/")
    scene_map = {
        "characters":   ("battle/dungeon", "dungeon", "战斗场景"),
        "bosses":       ("battle/dungeon", "dungeon", "Boss 战"),
        "monsters":     ("battle/dungeon", "dungeon", "战斗场景"),
        "effects":      ("scene_all", "all", "各场景通用"),
        "icons":        ("ui_all", "all", "各 UI 界面"),
        "tiles":        ("dungeon/map", "dungeon", "地图网格"),
        "backgrounds":  ("scene_battle", "dungeon", "战斗背景"),
        "ui/splash":    ("scene_splash", "splash", "启动屏"),
        "ui/main":      ("scene_main", "main", "主界面"),
        "ui/hud":       ("scene_battle", "dungeon", "战斗 HUD"),
        "ui/upgrade":   ("scene_upgrade", "main", "升级界面"),
        "ui/shop":      ("scene_shop", "main", "商店界面"),
        "ui/map":       ("scene_map", "dungeon", "地图界面"),
        "ui/event":     ("scene_event", "dungeon", "事件界面"),
        "ui/death":     ("scene_death", "main", "结算界面"),
        "ui/marquee":   ("scene_all", "all", "跑马灯"),
        "ui/room":      ("scene_dungeon", "dungeon", "房间界面"),
    }
    for prefix, (ub, scene, desc) in scene_map.items():
        if p.startswith(prefix):
            return {"used_by": ub, "reference_count": 0, "scene_or_ui": scene}
    return {"used_by": "unknown", "reference_count": 0, "scene_or_ui": "unknown"}


# ======== 帧信息分析 ========
def guess_frame_info(w: int, h: int, rel_path: str = "") -> dict:
    """根据 PNG 尺寸猜测是否为序列帧条，补 frame_w/frame_h/frame_count/layout"""
    p = rel_path.replace("\\", "/") if rel_path else ""
    # 已知精灵单帧尺寸模式 — 越精确的放越前面
    known_patterns = [
        # 64x64 或 96x96 方图 → 单帧（bosses, monsters 等）
        {"min_w": 64, "max_w": 96, "min_h": 64, "max_h": 96, "frames": 1},
        # 48x48 方图 → 单帧（icons, monsters）
        {"min_w": 32, "max_w": 48, "min_h": 32, "max_h": 48, "frames": 1},
        # backgrounds: 宽幅单图
        {"min_w": 500, "frames": 1},
        # characters 序列帧: 宽 48, 高 100-400, 单帧高 64
        {"min_w": 48, "max_w": 48, "min_h": 100, "max_h": 400, "single_h": 64, "frames": lambda h: h // 64},
    ]

    # Boss 序列帧: 仅当路径以 bosses/ 开头时才匹配
    if p.startswith("bosses/"):
        known_patterns.append(
            {"min_w": 64, "max_w": 96, "min_h": 200, "single_h": 64, "frames": lambda h: h // 64},
        )

    # effects 序列帧
    known_patterns.append(
        {"min_w": 32, "max_w": 80, "min_h": 120, "single_h": 48, "frames": lambda h: h // 48},
    )
    for p in known_patterns:
        min_w = p.get("min_w", 0)
        max_w = p.get("max_w", 99999)
        min_h = p.get("min_h", 0)
        max_h = p.get("max_h", 99999)
        if min_w <= w <= max_w and min_h <= h <= max_h:
            frames = p["frames"]
            if callable(frames):
                fc = frames(h)
                fh = h // fc if fc > 0 else h
                if fc > 1 and h % fh == 0:
                    return {"frame_w": w, "frame_h": fh, "frame_count": fc, "layout": "vertical"}
                # 多帧检测失败 → 继续尝试下一个模式，不立即返回 single
                continue
            # 单帧模式 → 返回 single
            return {"frame_w": w, "frame_h": h, "frame_count": 1, "layout": "single"}
    # 所有模式都不匹配 → 默认 single
    return {"frame_w": w, "frame_h": h, "frame_count": 1, "layout": "single"}


# ======== 分 bundle 建议 ========
def guess_bundle(rel_path: str, grade: str) -> str:
    p = rel_path.replace("\\", "/")
    if grade == "C":
        return "none"

    # 角色 → core
    if p.startswith("characters"):
        return "bundle_core_battle"

    # Boss → 按区域分包（最终 Boss 文件名含区域关键词）
    if p.startswith("bosses"):
        if p.startswith("bosses/finalboss"):
            # 最终 Boss 文件名格式: boss_{name}_{action}.png
            # 从文件名关键词推断区域
            zone_keywords = {
                "forest": ["forest", "guardian"],
                "catacombs": ["skeleton", "catacomb"],
                "volcano": ["volcano", "fire"],
                "tundra": ["tundra", "frost", "queen"],
                "swamp": ["swamp", "beast", "behemoth"],
                "abyss": ["abyss", "overlord"],
            }
            zone = "unknown"
            for z, keywords in zone_keywords.items():
                if any(k in p.lower() for k in keywords):
                    zone = z
                    break
            return f"bundle_boss_{zone}"
        # miniboss → 按区域分包
        if p.startswith("bosses/miniboss"):
            # 路径格式: bosses/miniboss/{zone}/...
            parts = p.split("/")
            zone = parts[2] if len(parts) > 2 else "unknown"
            return f"bundle_boss_{zone}"
        return "bundle_boss_common"

    # 怪物 → 按区域分包
    if p.startswith("monsters"):
        zone = p.split("/")[1] if "/" in p else "unknown"
        return f"bundle_zone_{zone}"

    # 背景 → 按区域分包
    if p.startswith("backgrounds"):
        bg_zones = {"combat_forest": "forest", "combat_catacombs": "catacombs",
                     "combat_volcano": "volcano", "combat_tundra": "tundra",
                     "combat_swamp": "swamp", "combat_abyss": "abyss",
                     "event_forest": "forest", "event_catacombs": "catacombs",
                     "event_volcano": "volcano", "event_tundra": "tundra",
                     "event_swamp": "swamp", "event_abyss": "abyss",
                     "room_healing": "common", "room_rest": "common",
                     "room_shop": "common", "room_treasure": "common",
                     "room_upgrade": "common"}
        zone = "common"
        for keyword, z in bg_zones.items():
            if keyword in p.lower():
                zone = z
                break
        return f"bundle_bg_{zone}"

    # 特效 → 通用战斗分包
    if p.startswith("effects"):
        return "bundle_effects"

    # UI
    if p.startswith("icons"):
        return "bundle_ui"
    if p.startswith("ui/"):
        return "bundle_ui"

    # tiles → 按区域分包
    if p.startswith("tiles"):
        zone = p.split("/")[1] if "/" in p else "unknown"
        return f"bundle_tiles_{zone}"

    return "bundle_other"


# ======== 可见尺寸估算 ========
def guess_visible_size(rel_path: str, category: str, fw: int) -> int:
    """估算最终在屏幕上的显示宽度（px）"""
    p = rel_path.replace("\\", "/")
    if p.startswith("characters"):
        return 128  # 角色在战斗中约 128px 显示高度
    if p.startswith("bosses"):
        if "finalboss" in p:
            return 256
        return 192
    if p.startswith("monsters"):
        return 96
    if p.startswith("backgrounds"):
        return 750
    if p.startswith("effects"):
        return int(fw * 2.5) if fw > 0 else 128
    if p.startswith("icons"):
        return 48
    if p.startswith("tiles"):
        return 64
    if p.startswith("ui/"):
        if fw >= 1024:
            return 180  # ui/upgrade 图标显式在 180px 左右
        if fw >= 500:
            return 750
        return fw
    return fw


# ======== 目标尺寸估算 ========
def guess_target_size(rel_path: str, grade: str, category: str, w: int, h: int, fw: int, fh: int, fc: int, display_mode: str) -> tuple:
    """返回 (target_w, target_h, target_size_kb) — 真实微信小游戏预算"""
    p = rel_path.replace("\\", "/")
    tw, th = w, h

    if grade in ("C",):
        return (0, 0, 0)

    if grade == "S":
        if p.startswith("characters"):
            # 角色等比 4x: 48x64 → 192x256
            tw = 192 if w <= 48 else (256 if w <= 64 else w)
            if fc > 1:
                th = fh * 4 * fc  # 序列帧条单帧 4x, 总高度 = 帧数 x 单帧高
            else:
                th = h * 4
        elif p.startswith("bosses"):
            if fc > 1:
                # 序列帧条: 单帧放大到目标, 总高度 = 帧数 x 目标单帧高
                sf = 4 if w <= 96 else 3
                target_fh = fh * sf
                tw = fw * sf
                th = target_fh * fc
            else:
                # 单帧方图
                tw = 256 if "finalboss" in p else 192
                th = tw
        elif p.startswith("monsters"):
            if any(k in p.lower() for k in ["elite", "lord", "giant", "dragon"]):
                tw, th = 192, 192
            else:
                tw, th = 128, 128
        else:
            tw, th = max(w, 128), max(h, 128)

    elif grade == "A":
        if p.startswith("icons"):
            tw, th = 128, 128
        elif w >= 1024:
            tw, th = 256, 256  # 1024 降档
        elif p.startswith("backgrounds"):
            if display_mode == "fullscreen_portrait":
                tw, th = 750, 1334
            else:
                tw, th = 1000, 666
        else:
            tw, th = min(w, 256), min(h, 256)

    elif grade == "B":
        if p.startswith("effects"):
            tw, th = 192, int(h * 192 / w) if w > 0 else 192
        elif p.startswith("tiles"):
            tw, th = 32, 32
        else:
            tw, th = w, h

    # === 真实体积估算（微信小游戏实测经验值）===
    # 背景（750-1000px 宽, 有损压缩） : 200-600KB
    # 角色序列帧（192x512+）: 60-120KB
    # 怪物/图标 128x128 : 8-15KB
    # Boss 单帧 256x256 : 40-80KB
    # 特效 192x192 : 20-40KB
    # tiles 32x32 : 1-3KB
    # === 背景体积预算（基于 JPG/WebP/有损PNG压缩后实测值）===
    #   <= 250KB: 通过
    #   250-350KB: 可接受，需真机看画质
    #   350-500KB: 只允许重点背景或分包背景
    #   > 500KB: 退回重导出
    #   > 1MB: 禁止进入 assets/resources
    if p.startswith("backgrounds"):
        if display_mode == "fullscreen_portrait":
            tkb = min(350, max(200, tw * th // 4000))
        else:
            tkb = min(250, max(150, tw * th // 4000))
    elif p.startswith("characters"):
        tkb = min(120, max(40, tw * th // 2000))
    elif p.startswith("bosses"):
        tkb = min(80, max(30, (tw * th) // 2000))
    elif p.startswith("monsters"):
        tkb = min(30, max(8, (tw * th) // 2000))
    elif p.startswith("icons") or "ui/upgrade" in p:
        tkb = min(20, max(4, (tw * th) // 2000))
    elif p.startswith("effects"):
        tkb = min(40, max(10, (tw * th) // 1500))
    elif p.startswith("tiles"):
        tkb = 2
    elif p.startswith("ui/"):
        if tw >= 500:
            tkb = min(200, max(50, tw * th // 5000))
        else:
            tkb = min(30, max(4, tw * th // 2000))
    else:
        tkb = max(4, (tw * th) // 2000)

    return (tw, th, tkb)


# ======== display_mode 判断 ========
def guess_display_mode(rel_path: str, category: str, w: int, h: int) -> str:
    p = rel_path.replace("\\", "/")
    if p.startswith("backgrounds"):
        if "combat" in p:
            return "room_banner"
        return "room_banner"
    if p.startswith("ui/splash") or p.startswith("ui/main") or p.startswith("ui/death"):
        if w >= 700 and h >= 1000:
            return "fullscreen_portrait"
        return "panel_bg"
    if p.startswith("ui/shop") or p.startswith("ui/map") or p.startswith("ui/event") or p.startswith("ui/room"):
        return "panel_bg"
    if p.startswith("icons") or p.startswith("ui/hud") or p.startswith("ui/upgrade"):
        return "ui_icon"
    return "other"


# ======== 主函数 ========
def main():
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    rows = []
    forbidden = []
    total_kb = 0

    for root, dirs, files in os.walk(TEXTURES_DIR):
        # 检查非 PNG 文件（禁止文件审计）
        for fname in files:
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, TEXTURES_DIR).replace("\\", "/")
            lower = fname.lower()

            # 只检查 PNG
            if not lower.endswith(".png"):
                # 非 PNG 也检查 - .bak, .raw, .psd, .aseprite 等
                ext = os.path.splitext(fname)[1].lower()
                if ext in (".bak", ".raw", ".psd", ".aseprite", ".jpg", ".jpeg", ".webp", ".gif"):
                    sz = os.path.getsize(fpath)
                    forbidden.append({
                        "path": rel,
                        "size_kb": round(sz / 1024, 1),
                        "type": ext,
                        "action": "move_source" if ext in (".bak", ".raw") else "review",
                    })
                continue

            size_bytes = os.path.getsize(fpath)
            size_kb = round(size_bytes / 1024, 1)
            total_kb += size_kb

            parts = rel.split("/")
            category = parts[0] if parts else "unknown"

            try:
                img = Image.open(fpath)
                w, h = img.size
                mode = img.mode
                has_alpha = mode in ("RGBA", "LA") or (mode == "P" and "transparency" in img.info)
                img.close()
            except Exception as e:
                w, h, mode, has_alpha = 0, 0, str(e), False

            # 引用信息
            ref = get_ref_info(rel, category)

            # 帧信息
            frame = guess_frame_info(w, h, rel)
            fw, fh, fc, layout = frame["frame_w"], frame["frame_h"], frame["frame_count"], frame["layout"]

            # display_mode
            display_mode = guess_display_mode(rel, category, w, h)

            # 可见尺寸
            vis_w = guess_visible_size(rel, category, fw)
            vis_h = h if h > 0 else vis_w

            # 分级
            grade = guess_grade(rel, w, h, category, ref, display_mode)

            # 动作
            action = guess_action(grade, rel, w, h, display_mode)

            # 备注
            note = ""
            if rel.startswith("backgrounds".replace("/", "\\")) or rel.startswith("backgrounds"):
                note = "必选压缩: JPG/WebP优先; 母版保留到art_source; 运行时>500KB退回; >1MB禁入resources"
            if grade == "C":
                note = "移出resources到art_source/textures_master"

            # 目标尺寸
            tw, th, tkb = guess_target_size(rel, grade, category, w, h, fw, fh, fc, display_mode)

            # atlas 分组
            atlas_group = guess_atlas(rel, category, grade, action)

            # bundle
            bundle = guess_bundle(rel, grade)

            # 目标帧尺寸（帧语义 → 目标帧尺寸；保留原始帧为 source_frame_*）
            if fc > 1 and grade in ("S", "A") and action in ("replace", "resize_export"):
                # 序列帧：按 target_w / source_frame_w 等比推算目标帧尺寸
                if layout == "horizontal":
                    scale = tw / (fw * fc) if fw * fc > 0 else 1
                else:
                    scale = tw / fw if fw > 0 else 1
                tfw = int(round(fw * scale))
                tfh = int(round(fh * scale))
            else:
                tfw, tfh = fw, fh  # 没有缩放或保持 → 目标帧 = 原始帧

            # 图片内文字审计（默认值，后续需人工/OCR核实）
            has_text = "false"
            text_type = "none"
            text_language = "none"
            text_action = "none"
            text_note = ""
            if category in ("ui", "icons") and grade in ("S", "A"):
                # UI/图标有较高概率含文字，标记 suspected
                has_text = "suspected"
                text_type = "unknown"
                text_language = "unknown"
                text_action = "review"
                text_note = "需人工确认是否有文字"
            if rel.startswith("backgrounds"):
                has_text = "suspected"
                text_type = "signage"
                text_language = "unknown"
                text_action = "review"
                text_note = "背景招牌/海报需人工确认"

            rows.append({
                "path": rel,
                "category": category,
                "width": w,
                "height": h,
                "size_kb": size_kb,
                "mode": mode,
                "has_alpha": has_alpha,
                "grade": grade,
                "action": action,
                "used_by": ref["used_by"],
                "reference_count": ref["reference_count"],
                "scene_or_ui": ref["scene_or_ui"],
                "visible_w": vis_w,
                "visible_h": vis_h,
                "target_w": tw,
                "target_h": th,
                "target_size_kb": tkb,
                "bundle": bundle,
                "atlas_group": atlas_group,
                "source_frame_w": fw,
                "source_frame_h": fh,
                "frame_w": tfw,
                "frame_h": tfh,
                "frame_count": fc,
                "layout": layout,
                "display_mode": display_mode,
                "has_text": has_text,
                "text_type": text_type,
                "text_language": text_language,
                "text_action": text_action,
                "text_note": text_note,
                "status": "pending",
                "note": note,
            })

    # 写主 CSVS
    fields = [
        "path", "category", "width", "height", "size_kb",
        "mode", "has_alpha", "grade", "action",
        "used_by", "reference_count", "scene_or_ui",
        "visible_w", "visible_h",
        "target_w", "target_h", "target_size_kb",
        "bundle", "atlas_group",
        "source_frame_w", "source_frame_h", "frame_w", "frame_h", "frame_count", "layout",
        "display_mode",
        "has_text", "text_type", "text_language", "text_action", "text_note",
        "status", "note",
    ]
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

    # 写禁止文件审计
    with open(FORBIDDEN_OUT, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=["path", "size_kb", "type", "action"])
        w.writeheader()
        w.writerows(forbidden)

    # 统计
    grades = {}
    actions = {}
    for r in rows:
        grades[r["grade"]] = grades.get(r["grade"], 0) + 1
        actions[r["action"]] = actions.get(r["action"], 0) + 1

    print("=" * 65)
    print("  textures 全量资源审计 v2 完成")
    print("=" * 65)
    print(f"\n总文件数: {len(rows)}")
    print(f"总大小:   {round(total_kb / 1024, 1)} MB")
    print(f"\n资源分级:")
    for g in ["S", "A", "B", "C"]:
        count = grades.get(g, 0)
        pct = round(count / len(rows) * 100, 1) if rows else 0
        kb = round(sum(r["size_kb"] for r in rows if r["grade"] == g), 1)
        print(f"  {g}: {count:>4} 个 ({pct:>5.1f}%)  {kb:>8.1f} KB")

    print(f"\n处理动作统计:")
    for a in ["replace", "resize_export", "keep", "merge_atlas", "move_source", "delete", "defer", "compress_review"]:
        count = actions.get(a, 0)
        if count > 0:
            print(f"  {a:16s}: {count} 个")

    s_replace = sum(1 for r in rows if r["grade"] == "S" and r["action"] == "replace")
    a_replace = sum(1 for r in rows if r["grade"] == "A" and r["action"] == "replace")
    a_resize  = sum(1 for r in rows if r["grade"] == "A" and r["action"] == "resize_export")
    c_clean   = sum(1 for r in rows if r["action"] in ("move_source", "delete"))
    compress  = sum(1 for r in rows if r["action"] == "compress_review")

    print(f"\n首轮执行预估:")
    print(f"  S 级 replace:   {s_replace} 个（核心战斗替换）")
    print(f"  A 级 replace:   {a_replace} 个（高频 UI 替换）")
    print(f"  A 级 resize:    {a_resize} 个（UI 降档）")
    print(f"  C 级清理:       {c_clean} 个（移出/删除）")
    print(f"  compress_review: {compress} 个（需要审核压缩策略）")
    print(f"\n禁止文件审计: {len(forbidden)} 个")
    for fb in forbidden:
        print(f"  [{fb['action']}] {fb['path']} ({fb['type']}, {fb['size_kb']}KB)")

    print(f"\n审计清单: {OUTPUT_CSV}")
    print(f"禁止清单: {FORBIDDEN_OUT}")


# ======== 分级函数（7 种动作，减少 replace 比例） ========
def guess_grade(rel_path: str, w: int, h: int, category: str, ref: dict, display_mode: str) -> str:
    p = rel_path.replace("\\", "/")

    # C 级优先
    for c in ["_raw", ".bak", "bak.", "test", "unused"]:
        if c in p.lower():
            return "C"

    # used_by=unknown → B 级暂缓（后续需引用扫描确认）
    if ref.get("used_by") == "unknown":
        return "B"

    # S 级：角色全部
    if p.startswith("characters"):
        return "S"

    # Boss：按动作分级（idle/attack/skill → S, death/phasechange → A）
    if p.startswith("bosses"):
        fname = os.path.basename(p)
        s_actions = ["idle", "attack", "skill"]
        if any(a in fname for a in s_actions):
            return "S"
        return "A"  # death, phasechange

    # 怪物（精英级 → S, 普通 → A）
    if p.startswith("monsters"):
        elite = ["elite", "lord", "giant", "dragon", "king", "guardian"]
        if any(k in p.lower() for k in elite):
            return "S"
        return "A"

    # S 级：启动屏 + HUD
    if p.startswith("ui/splash") or p.startswith("ui/hud"):
        return "S"
    if p.startswith("ui/main"):
        if "background" in p.lower() or "bg" in p.lower()[:10]:
            return "S"
        return "A"

    # A 级：其他 UI / 背景
    for prefix in ["icons", "ui/upgrade", "ui/shop", "ui/map", "ui/event", "ui/death", "ui/marquee", "ui/room"]:
        if p.startswith(prefix):
            return "A"
    if p.startswith("backgrounds"):
        return "A"

    # B 级：特效 / tiles
    if p.startswith("effects"):
        return "B"
    if p.startswith("tiles"):
        return "B"

    return "B"


def guess_action(grade: str, rel_path: str, w: int, h: int, display_mode: str) -> str:
    p = rel_path.replace("\\", "/")

    # ========== C 级 ==========
    if grade == "C":
        if "_raw" in p or "bak" in p.lower():
            return "move_source"
        return "delete"

    # ========== S 级（核心战斗） ==========
    if grade == "S":
        if p.startswith("characters"):
            return "replace"
        if p.startswith("bosses"):
            return "replace"       # 只有 idle/attack/skill 到 S 级
        if p.startswith("monsters"):
            return "replace"       # 精英怪
        if p.startswith("ui/hud") and w <= 64:
            return "replace"
        if p.startswith("ui/main") and "bg" in p.lower():
            return "replace"
        if p.startswith("ui/splash"):
            return "replace"
        return "keep"

    # ========== A 级（高频 UI/图标/Boss death/怪物） ==========
    if grade == "A":
        # Boss death/phasechange → defer
        if p.startswith("bosses"):
            return "defer"

        # 普通怪物 → defer
        if p.startswith("monsters"):
            return "defer"

        # 图标：分类处理
        if p.startswith("icons"):
            if w >= 512:
                return "resize_export"
            if w <= 32:
                return "merge_atlas"
            if w <= 48:
                return "replace"
            return "merge_atlas"

        # 1024 UI 升级图标 → 降档
        if w >= 1024 and h >= 1024:
            return "resize_export"

        # 背景 → compress_review（必须专项压缩，实际超过 350KB 不入库）
        if p.startswith("backgrounds"):
            return "compress_review"

        # shop_bg → 审核压缩
        if "shop_bg" in p and w >= 700:
            return "compress_review"

        # 其他 A 级 UI 面板/大件 → keep
        if w >= 500:
            return "keep"

        # 小 UI 件 → 合并图集
        if w <= 64:
            return "merge_atlas"

        return "keep"

    # ========== B 级（used_by=unknown / 低频特效/tiles） ==========
    if grade == "B":
        # used_by=unknown → 标记待验证，不直接处理
        if p.startswith("effects"):
            key_effects = ["hit", "crit", "heal", "shield", "dash"]
            if any(k in p.lower() for k in key_effects):
                return "replace" if w <= 80 else "keep"
            return "defer"
        if p.startswith("tiles"):
            return "keep"
        return "defer"

    return "defer"


def guess_atlas(rel_path: str, category: str, grade: str, action: str) -> str:
    p = rel_path.replace("\\", "/")
    if action == "merge_atlas":
        return f"atlas_{category}_common"
    if p.startswith("icons") and grade == "A" and action in ("replace", "keep"):
        return "atlas_icons_common"
    if p.startswith("ui/hud"):
        return "atlas_hud"
    if p.startswith("ui/upgrade"):
        return "atlas_upgrade"
    return ""


if __name__ == "__main__":
    main()
