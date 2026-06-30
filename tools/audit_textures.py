"""textures 全量资源审计脚本
扫描 textures/ 下所有 PNG，输出完整审计 CSV，含 S/A/B/C 分级建议
"""
import os, csv
from PIL import Image

TEXTURES_DIR = r"E:\game\回到地面\assets\resources\textures"
OUTPUT_CSV = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"

# ======== 分级规则 ========
# 按目录和文件名模式自动推断 S/A/B/C 等级
S_PATTERNS = [
    "characters",       # 所有角色
    "bosses",           # 所有 Boss
    "ui/splash",        # 启动屏
    "ui/main",          # 主界面
    "ui/hud",           # 战斗 HUD
]

A_PATTERNS = [
    "icons",            # 图标
    "ui/upgrade",       # 升级界面
    "ui/shop",          # 商店
    "ui/map",           # 地图
    "ui/death",         # 结算
    "ui/event",         # 事件
    "ui/marquee",       # 跑马灯
    "backgrounds",      # 背景
]

C_PATTERNS = [
    "_raw",             # raw 源图
    ".bak",             # 备份
    "bak.",             # 备份
    "test",             # 测试
    "unused",           # 未使用
]

# 动作推断
def guess_grade_and_action(rel_path: str, w: int, h: int) -> tuple:
    """返回 (grade, action, target_w, target_h, note)"""
    p = rel_path.replace("\\", "/")

    # C 级：raw/bak/test
    for c in C_PATTERNS:
        if c in p.lower():
            if "_raw" in p or "bak" in p.lower():
                return ("C", "move_source", 0, 0, "raw/backup 移出 resources")
            return ("C", "delete", 0, 0, "测试/无用资源，确认后删除")

    # S 级：角色
    if p.startswith("characters"):
        # 角色动画帧 48px wide → 192px
        if w <= 48 and h >= 100:
            return ("S", "replace", 192, h * 4, f"4x 等比替换，当前 {w}x{h}")
        return ("S", "keep", w, h, f"角色资源，已较大")

    # S 级：Boss
    if p.startswith("bosses"):
        if "finalboss" in p:
            # finalboss 单帧宽 64/96
            if w <= 96:
                return ("S", "replace", 256, h * 4, f"finalboss 替换到 256px 宽")
        else:
            # miniboss 64x64
            if w <= 64 and h <= 64:
                return ("S", "replace", 192, 192, f"miniboss 替换到 192x192")
        return ("S", "keep", w, h, "")

    # S 级：怪物（常见怪物优先）
    if p.startswith("monsters"):
        # 精英怪 (deerelite, deathknight, infernoelite, frostgiant, swampdragon, abysslordelite)
        elite_keywords = ["elite", "lord", "giant", "dragon", "guardian", "king"]
        if any(k in p.lower() for k in elite_keywords):
            if w <= 64:
                return ("S", "replace", 192, 192, f"精英怪替换到 192x192")
            return ("S", "keep", w, h, f"精英怪已较大")
        else:
            # 普通小怪
            if w <= 48:
                return ("A", "replace", 128, 128, f"普通怪替换到 128x128")
            return ("A", "keep", w, h, f"普通怪已较大")

    # S 级：HUD
    if "ui/hud" in p:
        if w <= 48 and h <= 48:
            return ("S", "replace", 128, 128, f"HUD 图标替换到 128x128")
        return ("S", "keep", w, h, "")

    # S 级：splash + main
    if "ui/splash" in p or "ui/main" in p:
        if w < 750:
            return ("S", "replace", 750, 1334, f"主界面背景替换到 750x1334+")
        return ("S", "keep", w, h, "")

    # A 级：图标
    if p.startswith("icons"):
        if w <= 64:
            return ("A", "replace", 128, 128, f"图标替换到 128x128")
        if w >= 512:
            return ("A", "resize_export", 256, 256, f"图标过大，降档到 256")
        return ("A", "keep", w, h, "")

    # A 级：UI upgrade 1024 降档
    if "ui/upgrade" in p:
        if w >= 1024 and h >= 1024:
            return ("A", "resize_export", 256, 256, f"1024 图标降档到 256，母版保留")
        if w <= 64:
            return ("A", "replace", 128, 128, f"小图标替换到 128x128")
        return ("A", "keep", w, h, "")

    # A 级：背景
    if p.startswith("backgrounds"):
        if w < 1000:
            return ("A", "replace", 1000, int(h * 1000 / w), f"背景替换到 1000px 宽")
        return ("A", "keep", w, h, "")

    # A 级：UI shop/map/death/event/marquee
    for ui_sub in ["ui/shop", "ui/map", "ui/death", "ui/event", "ui/marquee", "ui/room"]:
        if ui_sub in p:
            if w < 600:
                return ("A", "replace", 750, 500, f"UI 面板替换到合理尺寸")
            return ("A", "keep", w, h, "")

    # B 级：特效
    if p.startswith("effects"):
        if w <= 80:
            return ("B", "replace", 192, h * 2, f"特效替换到 192px 宽")
        return ("B", "keep", w, h, "")

    # B 级：Tiles
    if p.startswith("tiles"):
        return ("B", "keep", w, h, f"tiles 32x32，确认像素风后保留或升级")

    # B 级：其他 UI
    if p.startswith("ui/"):
        return ("B", "keep", w, h, f"低频 UI，暂缓")

    # 兜底
    return ("B", "defer", w, h, "未分类，需人工确认")


def main():
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)

    rows = []
    total_kb = 0

    for root, dirs, files in os.walk(TEXTURES_DIR):
        for fname in sorted(files):
            if not fname.lower().endswith(".png"):
                continue

            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, TEXTURES_DIR).replace("\\", "/")
            size_bytes = os.path.getsize(fpath)
            size_kb = round(size_bytes / 1024, 1)
            total_kb += size_kb

            # 目录分类
            parts = rel.split("/")
            category = parts[0] if parts else "unknown"

            try:
                img = Image.open(fpath)
                w, h = img.size
                mode = img.mode
                img.close()
            except Exception as e:
                w, h, mode = 0, 0, str(e)

            grade, action, tw, th, note = guess_grade_and_action(rel, w, h)

            rows.append({
                "path": rel,
                "category": category,
                "width": w,
                "height": h,
                "size_kb": size_kb,
                "mode": mode,
                "grade": grade,
                "action": action,
                "target_w": tw,
                "target_h": th,
                "status": "pending",
                "note": note,
            })

    # 写 CSV
    fields = ["path", "category", "width", "height", "size_kb", "mode",
              "grade", "action", "target_w", "target_h", "status", "note"]
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    # 统计
    grades = {}
    actions = {}
    for r in rows:
        grades[r["grade"]] = grades.get(r["grade"], 0) + 1
        actions[r["action"]] = actions.get(r["action"], 0) + 1

    print("=" * 60)
    print("  textures 全量资源审计完成")
    print("=" * 60)
    print(f"\n总文件数: {len(rows)}")
    print(f"总大小:   {round(total_kb / 1024, 1)} MB")
    print(f"\n资源分级:")
    for g in ["S", "A", "B", "C"]:
        count = grades.get(g, 0)
        pct = round(count / len(rows) * 100, 1) if rows else 0
        kb = round(sum(r["size_kb"] for r in rows if r["grade"] == g), 1)
        print(f"  {g}: {count:>4} 个 ({pct:>5.1f}%)  {kb:>8.1f} KB")

    print(f"\n处理动作统计:")
    for a in ["replace", "resize_export", "keep", "merge_atlas", "move_source", "delete", "defer"]:
        count = actions.get(a, 0)
        if count > 0:
            print(f"  {a:15s}: {count} 个")

    s_replace = sum(1 for r in rows if r["grade"] == "S" and r["action"] == "replace")
    a_replace = sum(1 for r in rows if r["grade"] == "A" and r["action"] == "replace")
    a_resize  = sum(1 for r in rows if r["grade"] == "A" and r["action"] == "resize_export")
    c_clean   = sum(1 for r in rows if r["action"] in ("move_source", "delete"))

    print(f"\n首轮执行预估:")
    print(f"  S 级 replace:   {s_replace} 个（核心战斗替换）")
    print(f"  A 级 replace:   {a_replace} 个（高频 UI 替换）")
    print(f"  A 级 resize:    {a_resize} 个（UI 降档）")
    print(f"  C 级清理:       {c_clean} 个（移出/删除）")
    print(f"  B 级 keep/defer: {grades.get('B', 0)} 个（暂缓）")
    print(f"\n审计清单已保存至: {OUTPUT_CSV}")
    print(f"💡 打开 CSV 后，请逐行确认 grade 和 action 是否正确，")
    print(f"   修改 status 为 'confirmed' 后可进入下一阶段。")


if __name__ == "__main__":
    main()
