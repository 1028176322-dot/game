"""Phase 4a: 1024 图标降档 (resize_export)
1. 保留 1024 母版到 art_source/textures_master
2. PIL 缩放 1024→256
3. 放入 runtime_replace/ 等待替换
"""
import os, csv
from PIL import Image

AUDIT_CSV    = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"
TEXTURES_DIR = r"E:\game\回到地面\assets\resources\textures"
MASTER_DIR   = r"E:\game\回到地面\art_source\textures_master"
REPLACE_DIR   = r"E:\game\回到地面\art_source\textures_export\runtime_replace"

def main():
    items = []
    with open(AUDIT_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            if row["grade"] == "A" and row["action"] == "resize_export":
                items.append(row)

    print(f"resize_export 目标: {len(items)} 个\n")

    for row in items:
        rel = row["path"]
        tw = int(row["target_w"])
        th = int(row["target_h"])
        src = os.path.join(TEXTURES_DIR, rel.replace("/", os.sep))
        
        if not os.path.exists(src):
            print(f"  [跳过] {rel}: 源文件不存在")
            continue

        # 1. 备份 1024 母版到 master/
        master_dst = os.path.join(MASTER_DIR, rel.replace("/", os.sep))
        os.makedirs(os.path.dirname(master_dst), exist_ok=True)
        
        img = Image.open(src)
        print(f"  [{rel}] 源 {img.size[0]}x{img.size[1]}", end="")
        
        # 复制母版
        img.save(master_dst, format="PNG", optimize=True)
        
        # 2. 缩放到 256x256
        resized = img.resize((tw, th), Image.LANCZOS)
        resized = resized.convert("RGBA")
        
        # 3. 放入 runtime_replace/
        replace_dst = os.path.join(REPLACE_DIR, rel.replace("/", os.sep))
        os.makedirs(os.path.dirname(replace_dst), exist_ok=True)
        resized.save(replace_dst, format="PNG", optimize=True)
        
        new_size = os.path.getsize(replace_dst)
        print(f" -> {tw}x{th} {new_size // 1024}KB [母版已备份]")

    print(f"\n全部 {len(items)} 个 resize_export 完成!")
    print(f"母版: {MASTER_DIR}")
    print(f"待替换: {REPLACE_DIR}")

if __name__ == "__main__":
    main()
