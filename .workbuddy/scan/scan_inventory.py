#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
E:\\game 全量文件扫描器
- 递归枚举所有文件（排除 .git），收集元数据
- 按类型分类（源代码/配置/测试/文档/资源/meta/生成物/临时调试）
- 检测重复文件（按内容哈希，限 <2MB 的非生成文本类）
- 检测临时/调试/构建产物模式
- 输出：inventory.json（全量），并打印聚合摘要到 stdout
"""
import os, hashlib, json, re, sys
from datetime import datetime, timezone

ROOT = r"E:\game"
OUT_JSON = os.path.join(ROOT, ".workbuddy", "scan", "inventory.json")

# 生成物/派生目录（不应作为"源码"分析，且通常应 gitignore）
GENERATED_SEGMENTS = {
    "library", "temp", "local", "node_modules", ".creator", ".git",
    "__pycache__", ".cache", "dist", "build", "profiles", "settings",
    ".vscode", ".idea",
}
# 不应被哈希的超大阈值
HASH_SIZE_LIMIT = 2 * 1024 * 1024  # 2 MB

SOURCE_EXT = {".ts", ".tsx", ".js", ".mjs", ".cjs", ".mts", ".cts",
              ".py", ".java", ".cs", ".cpp", ".c", ".h", ".hpp",
              ".sh", ".ps1", ".cmd", ".bat", ".rpy", ".lua", ".glsl"}
CONFIG_EXT = {".json", ".yml", ".yaml", ".toml", ".ini", ".plist",
              ".editorconfig", ".npmrc", ".npmignore", ".gitignore",
              ".gitattributes", ".properties", ".env"}
DOC_EXT = {".md", ".txt", ".rst", ".url", ".docx", ".pdf", ".html", ".htm"}
RES_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg",
           ".gltf", ".glb", ".bin", ".fbx", ".ttf", ".otf", ".mp3",
           ".mp4", ".wav", ".ogg", ".plist", ".particle", ".anim",
           ".prefab", ".material", ".texture", ".image", ".font", ".atlas"}
META_EXT = {".meta"}

TEMP_PAT = re.compile(
    r"(~$|\.bak$|\.bak\d+$|_bak|tmp|temp|debug|old_|副本|copy|第\d+次|"
    r"\.swp$|\.swo$|\.cache$|\.log$|\.tmp$|\.orig$|\.rej$|_old|__pycache__)",
    re.IGNORECASE)
TEST_PAT = re.compile(r"(^|[/\\])(tests?|spec|__tests__)[/\\]", re.IGNORECASE)
TEST_FILE_PAT = re.compile(r"(\.(test|spec|tests)\.|(test|spec)\.(ts|js|py|mjs|cjs)$)", re.IGNORECASE)


def category_of(path, ext, is_generated):
    base = os.path.basename(path)
    if ext == ".meta":
        return "meta"
    if is_generated:
        return "generated"
    if ext in RES_EXT:
        return "resource"
    if ext in DOC_EXT:
        return "doc"
    if ext in CONFIG_EXT:
        return "config"
    if ext in SOURCE_EXT:
        if TEST_FILE_PAT.search(base) or TEST_PAT.search(path):
            return "test"
        return "source"
    if ext == ".map":
        return "build_artifact"
    if ext == ".pyc":
        return "generated"
    return "other"


def main():
    files = []
    # 聚合统计
    by_top = {}            # 顶层子目录 -> {cat -> count}
    ext_count = {}
    cat_count = {}
    generated_count = 0
    temp_files = []
    hashes = {}            # hash -> [paths]
    dup_groups = []

    for dirpath, dirnames, filenames in os.walk(ROOT):
        # 不进入 .git
        if ".git" in dirnames:
            dirnames.remove(".git")
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            try:
                st = os.stat(full)
            except OSError:
                continue
            size = st.st_size
            mtime = datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).strftime("%Y-%m-%d %H:%M")
            rel = os.path.relpath(full, ROOT)
            parts = rel.split(os.sep)
            top = parts[0] if len(parts) > 1 else "."
            ext = os.path.splitext(fn)[1].lower()
            is_generated = any(seg in parts for seg in GENERATED_SEGMENTS)
            cat = category_of(rel, ext, is_generated)

            # 顶层聚合
            by_top.setdefault(top, {}).setdefault(cat, 0)
            by_top[top][cat] += 1
            ext_count[ext] = ext_count.get(ext, 0) + 1
            cat_count[cat] = cat_count.get(cat, 0) + 1
            if is_generated:
                generated_count += 1

            # 临时/调试检测（对全量文件，但生成物内的忽略标记以免噪声）
            is_temp = bool(TEMP_PAT.search(fn)) or ext in {".log", ".map", ".pyc"}
            if is_temp and not is_generated:
                temp_files.append(rel)

            # 哈希（仅非生成、<2MB 文本类，用于重复检测）
            do_hash = (not is_generated) and (size <= HASH_SIZE_LIMIT) and (
                ext in SOURCE_EXT or ext in CONFIG_EXT or ext in DOC_EXT
                or ext in {".txt", ".csv", ".log", ".yml", ".yaml"})
            h = None
            if do_hash and size > 0:
                try:
                    with open(full, "rb") as f:
                        h = hashlib.md5(f.read()).hexdigest()
                    hashes.setdefault(h, []).append(rel)
                except OSError:
                    pass

            files.append({
                "path": rel, "size": size, "mtime": mtime, "ext": ext,
                "cat": cat, "gen": is_generated, "temp": is_temp, "hash": h,
            })

    # 重复组（>=2 且非生成）
    for h, paths in hashes.items():
        if len(paths) >= 2:
            dup_groups.append({"hash": h, "count": len(paths), "files": sorted(paths)})

    # 跨层同名检测（root 与 回到地面 下同名文件，可能重复实现）
    cross_layer = {}
    for f in files:
        parts = f["path"].split(os.sep)
        if len(parts) >= 2:
            name = parts[-1]
            layer = "root" if parts[0] != "回到地面" else "sub"
            cross_layer.setdefault(name, {}).setdefault(layer, []).append(f["path"])
    cross_dup = {n: v for n, v in cross_layer.items()
                 if "root" in v and "sub" in v}

    summary = {
        "total_files": len(files),
        "generated_files": generated_count,
        "by_category": cat_count,
        "by_top": by_top,
        "ext_count": dict(sorted(ext_count.items(), key=lambda x: -x[1])),
        "temp_files": sorted(temp_files),
        "temp_count": len(temp_files),
        "dup_groups": dup_groups,
        "dup_group_count": len(dup_groups),
        "cross_layer_dups": cross_dup,
    }
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump({"summary": summary, "files": files}, f, ensure_ascii=False, indent=0)

    # 打印摘要
    print("=== SCAN SUMMARY ===")
    print(f"Total files (excl .git): {len(files)}")
    print(f"Generated/derived files: {generated_count}")
    print(f"Temp/debug files (non-generated): {len(temp_files)}")
    print(f"Duplicate groups (>=2, content-equal): {len(dup_groups)}")
    print(f"Cross-layer same-name files (root vs sub): {len(cross_dup)}")
    print("\n--- By category ---")
    for c, n in sorted(cat_count.items(), key=lambda x: -x[1]):
        print(f"  {c:14s} {n}")
    print("\n--- By top-level dir (cat breakdown) ---")
    for top in sorted(by_top):
        print(f"  [{top}]")
        for c, n in sorted(by_top[top].items(), key=lambda x: -x[1]):
            print(f"      {c:14s} {n}")
    print("\n--- Temp/debug files (non-generated) ---")
    for t in sorted(temp_files)[:200]:
        print(f"  {t}")
    if len(temp_files) > 200:
        print(f"  ... and {len(temp_files)-200} more")
    print("\n--- Duplicate groups (content-equal) ---")
    for g in dup_groups:
        print(f"  hash={g['hash'][:8]} count={g['count']}")
        for p in g["files"]:
            print(f"      {p}")
    print("\n--- Cross-layer same-name files ---")
    for n, v in sorted(cross_dup.items()):
        print(f"  {n}: root={len(v.get('root',[]))} sub={len(v.get('sub',[]))}")


if __name__ == "__main__":
    main()
