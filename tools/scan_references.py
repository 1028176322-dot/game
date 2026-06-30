"""引用扫描工具 v2
扫描 .scene/.prefab/.anim/.ts/.json 中的 UUID 和路径引用
输出带置信度分层的明细缓存，可选合并回审计 CSV

用法:
  python scan_references.py           # 扫描 → ref_cache.json (只读)
  python scan_references.py merge     # 合并回 CSV (自动备份)
"""
import os, re, json, csv
from collections import defaultdict

# ======== 路径 ========
PROJECT_ROOT = r"E:\game\回到地面"
TEXTURES_DIR = os.path.join(PROJECT_ROOT, "assets", "resources", "textures")
ASSETS_DIR   = os.path.join(PROJECT_ROOT, "assets")
AUDIT_CSV    = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"
CACHE_FILE   = r"E:\game\tools\ref_cache.json"


# ====================================================================
# [1/3] 构建资源索引
# ====================================================================
def build_resource_index():
    """为每个 PNG 构建完整索引
    返回: {rel_path: {
        "path": "characters/warrior/warrior_idle.png",
        "basename": "warrior_idle",
        "resource_path": "textures/characters/warrior/warrior_idle",
        "resource_path_no_ext": "textures/characters/warrior/warrior_idle",
        "full_path": "assets/resources/textures/characters/warrior/warrior_idle.png",
        "uuid": "abc...",
        "texture_uuid": "abc...@6c48a",
        "sprite_frame_uuid": "abc...@f9941",
    }}
    """
    index = {}
    skipped = 0

    for root, dirs, files in os.walk(TEXTURES_DIR):
        for fname in files:
            if not fname.endswith(".png.meta"):
                continue

            meta_path = os.path.join(root, fname)
            rel = os.path.relpath(meta_path, TEXTURES_DIR).replace("\\", "/")
            rel_png = rel.replace(".png.meta", ".png")

            # 计算各种路径形态
            basename = os.path.splitext(fname)[0].replace(".png", "")
            resource_path = "textures/" + rel_png.replace(".png", "")
            full_path = f"assets/resources/textures/{rel_png}"

            entry = {
                "path": rel_png,
                "basename": basename,
                "resource_path": resource_path,
                "resource_path_no_ext": resource_path,
                "full_path": full_path,
                "uuid": "",
                "texture_uuid": "",
                "sprite_frame_uuid": "",
            }

            try:
                with open(meta_path, encoding="utf-8") as f:
                    data = json.load(f)

                entry["uuid"] = data.get("uuid", "")

                # 遍历 subMetas 提取 texture 和 spriteFrame UUID
                for sub_key, sub_val in data.get("subMetas", {}).items():
                    sub_uuid = sub_val.get("uuid", "")
                    sf_name = sub_val.get("name", "")
                    if sf_name == "texture":
                        entry["texture_uuid"] = sub_uuid
                    elif sf_name == "spriteFrame":
                        entry["sprite_frame_uuid"] = sub_uuid

            except Exception as e:
                skipped += 1
                continue

            index[rel_png] = entry

    print(f"  [索引] 共 {len(index)} 个资源, 跳过 {skipped} 个")
    # 统计 UUID 覆盖
    has_sf = sum(1 for v in index.values() if v["sprite_frame_uuid"])
    has_tex = sum(1 for v in index.values() if v["texture_uuid"])
    print(f"         有 spriteFrame UUID: {has_sf}")
    print(f"         有 texture UUID:     {has_tex}")
    return index


# ====================================================================
# [2/3] 搜索引用
# ====================================================================
def collect_search_files():
    """收集需要搜索的所有文件"""
    extensions = {".scene", ".prefab", ".anim", ".json", ".ts"}
    files = []

    for root, dirs, fnames in os.walk(ASSETS_DIR):
        for f in fnames:
            ext = os.path.splitext(f)[1].lower()
            if ext in extensions:
                files.append(os.path.join(root, f))

    print(f"  [搜索] 共 {len(files)} 个文件")
    return files


def search_references(index, search_files):
    """扫描所有搜索文件，返回引用明细
    返回: {rel_path: {
        "reference_count": int,
        "possible_reference_count": int,
        "used_by": "file1, file2",
        "references": [...]
        "possible_references": [...]
    }}
    """
    # 构建反向索引
    resource_path_to_path = {}
    basename_to_paths = defaultdict(set)

    # UUID 分两层:
    #   full_uuid_map: 完整的子资源 UUID (如 xxx@f9941) → rel_path
    #   main_uuid_map: 主 UUID, 匹配时要求后面不能是 @
    full_uuid_map = {}   # 完整 UUID 字符串, 含子资源后缀
    main_uuid_map = {}   # 主 UUID 不包含子资源后缀

    for rel_png, entry in index.items():
        sf = entry["sprite_frame_uuid"]
        if sf:
            full_uuid_map[sf] = rel_png

        main = entry["uuid"]
        if main:
            main_uuid_map[main] = rel_png

        rp = entry["resource_path"]
        if rp:
            resource_path_to_path[rp] = rel_png

        bn = entry["basename"]
        if len(bn) >= 4:
            basename_to_paths[bn.lower()].add(rel_png)

    refs = defaultdict(lambda: {
        "rc": 0, "prc": 0, "used_by_set": set(),
        "refs": [], "prefs": [],
    })

    # 预编译正则: 匹配主 UUID 但后面不能是 @
    main_uuid_patterns = {}
    for uid in main_uuid_map:
        try:
            main_uuid_patterns[uid] = re.compile(re.escape(uid) + r"(?!@)")
        except re.error:
            pass

    for filepath in search_files:
        rel_file = os.path.relpath(filepath, PROJECT_ROOT).replace("\\", "/")
        ext = os.path.splitext(filepath)[1].lower()

        try:
            with open(filepath, encoding="utf-8") as f:
                lines = f.readlines()
        except Exception:
            continue

        content = "".join(lines)
        content_lower = content.lower() if ext == ".ts" else ""

        # ---- spriteFrame UUID 匹配 (高置信, 最可靠) ----
        for uid, rel_png in full_uuid_map.items():
            idx = content.find(uid)
            if idx == -1:
                continue
            count = content.count(uid)
            r = refs[rel_png]
            r["rc"] += count
            r["used_by_set"].add(rel_file)
            # 找行号
            line_no = content[:idx].count("\n") + 1
            r["refs"].append({
                "file": rel_file, "line": line_no,
                "match_type": "spriteframe_uuid", "confidence": "high", "count": count,
            })

        # ---- 主 UUID 匹配 (高置信, 但需排除 @ 后缀) ----
        for uid, pattern in main_uuid_patterns.items():
            # 用 finditer 同时找出所有匹配及其行号
            matched = list(pattern.finditer(content))
            if not matched:
                continue
            count = len(matched)
            rel_png = main_uuid_map[uid]
            r = refs[rel_png]
            r["rc"] += count
            r["used_by_set"].add(rel_file)
            line_no = content[:matched[0].start()].count("\n") + 1
            r["refs"].append({
                "file": rel_file, "line": line_no,
                "match_type": "uuid", "confidence": "high", "count": count,
            })

        # ---- resources 路径匹配: 有 .png 后缀 (高置信) ---
        for rp, rel_png in resource_path_to_path.items():
            rp_png = rp + ".png"
            idx = content.find(rp_png)
            if idx == -1:
                continue
            count = content.count(rp_png)
            r = refs[rel_png]
            r["rc"] += count
            r["used_by_set"].add(rel_file)
            line_no = content[:idx].count("\n") + 1
            r["refs"].append({
                "file": rel_file, "line": line_no,
                "match_type": "resource_path_png", "confidence": "high", "count": count,
            })

        # ---- resources 路径匹配: 无后缀 (高置信, 用边界正则防重) ----
        for rp, rel_png in resource_path_to_path.items():
            # 正则: textures/a/b, 要求后面不是 .png 和 /字母/数字
            try:
                pattern = re.compile(re.escape(rp) + r"(?!\.png)(?![\/\w])")
            except re.error:
                continue
            matched = list(pattern.finditer(content))
            if not matched:
                continue
            count = len(matched)
            r = refs[rel_png]
            r["rc"] += count
            r["used_by_set"].add(rel_file)
            line_no = content[:matched[0].start()].count("\n") + 1
            r["refs"].append({
                "file": rel_file, "line": line_no,
                "match_type": "resource_path", "confidence": "high", "count": count,
            })

        # ---- 完整路径匹配 (高置信) ----
        for rel_png, entry in index.items():
            fp = entry["full_path"]
            idx = content.find(fp)
            if idx == -1:
                continue
            count = content.count(fp)
            r = refs[rel_png]
            r["rc"] += count
            r["used_by_set"].add(rel_file)
            line_no = content[:idx].count("\n") + 1
            r["refs"].append({
                "file": rel_file, "line": line_no,
                "match_type": "full_path", "confidence": "high", "count": count,
            })

        # ---- 文件名关键词匹配 (低置信, 仅 .ts) ----
        if ext == ".ts":
            for bn_lower, rel_set in basename_to_paths.items():
                idx = content_lower.find(bn_lower)
                if idx == -1:
                    continue
                count = content_lower.count(bn_lower)
                line_no = content_lower[:idx].count("\n") + 1
                for rel_png in rel_set:
                    r = refs[rel_png]
                    r["prc"] += count
                    r["prefs"].append({
                        "file": rel_file, "line": line_no,
                        "match_type": "filename", "confidence": "low",
                        "keyword": bn_lower,
                    })

    # 整理输出
    result = {}
    for rel_png in index:
        r = refs[rel_png]
        result[rel_png] = {
            "reference_count": r["rc"],
            "possible_reference_count": r["prc"],
            "used_by": ", ".join(sorted(r["used_by_set"])) if r["used_by_set"] else "unknown",
            "references": r["refs"],
            "possible_references": r["prefs"],
        }

    return result


# ====================================================================
# [3/3] 输出与合并
# ====================================================================
def output_cache(result):
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    total = len(result)
    with_ref = sum(1 for v in result.values() if v["reference_count"] > 0)
    only_possible = sum(1 for v in result.values() if v["reference_count"] == 0 and v["possible_reference_count"] > 0)
    no_ref = sum(1 for v in result.values() if v["reference_count"] == 0 and v["possible_reference_count"] == 0)

    print(f"\n  [结果] 总资源: {total}")
    print(f"         有强引用: {with_ref}")
    print(f"         仅疑似引用: {only_possible}")
    print(f"         无任何引用: {no_ref}")
    print(f"  缓存: {CACHE_FILE}")


def merge_to_csv():
    """将缓存合并回 CSV，仅更新 used_by / reference_count
    自动备份原始 CSV
    """
    if not os.path.exists(CACHE_FILE):
        print("[ERROR] 缓存不存在，先运行 python scan_references.py")
        return

    # 备份
    backup_path = AUDIT_CSV.replace(".csv", ".before_reference_merge.csv")
    import shutil
    shutil.copy2(AUDIT_CSV, backup_path)
    print(f"  [备份] {backup_path}")

    with open(CACHE_FILE, encoding="utf-8") as f:
        cache = json.load(f)

    rows = []
    updated = 0
    with open(AUDIT_CSV, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames.copy()
        for row in reader:
            rel = row["path"]
            if rel in cache:
                ref = cache[rel]
                # 只更新 used_by 和 reference_count
                new_used = ref["used_by"]
                new_count = str(ref["reference_count"])
                if row["used_by"] != new_used or row["reference_count"] != new_count:
                    updated += 1
                row["used_by"] = new_used
                row["reference_count"] = new_count
                # 默认不写入 possible_reference_count，避免列数变化
                # 如果想加，先在 CSV 加列再在这里写
            rows.append(row)

    with open(AUDIT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print(f"  [合并] {updated}/{len(rows)} 行已更新")
    print(f"  注意: 只更新了 used_by / reference_count")
    print(f"  action/grade/status/text_action 等人工字段未改动")


# ====================================================================
# 主入口
# ====================================================================
def main():
    import sys

    mode = "scan"
    if len(sys.argv) > 1:
        mode = sys.argv[1]

    if mode == "scan":
        print("=" * 55)
        print("  引用扫描 v2")
        print("=" * 55)
        print("[1/3] 构建资源索引...")
        index = build_resource_index()

        print("[2/3] 收集搜索文件...")
        search_files = collect_search_files()

        print("[3/3] 执行引用搜索...")
        result = search_references(index, search_files)

        output_cache(result)

    elif mode == "merge":
        print("=" * 55)
        print("  合并引用到 CSV")
        print("=" * 55)
        merge_to_csv()

    elif mode == "clean":
        if os.path.exists(CACHE_FILE):
            os.remove(CACHE_FILE)
            print(f"  [OK] 已删除 {CACHE_FILE}")
        else:
            print("  缓存不存在")


if __name__ == "__main__":
    main()
