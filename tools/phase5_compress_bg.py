"""Phase 5: 背景压缩
- 源: art_source/textures_export/runtime_replace/backgrounds/ (AI 生成 ~1MB PNG)
- 目标: 1000x666 JPG, <= 250KB
- 输出: 替换 textures/ 前先检查体积
"""
import os, csv
from PIL import Image

BG_SRC   = r"E:\game\回到地面\art_source\textures_export\runtime_replace\backgrounds"
BG_MASTER = r"E:\game\回到地面\art_source\textures_master\backgrounds"
BG_DST   = r"E:\game\回到地面\assets\resources\textures\backgrounds"
OUT_CSV  = r"E:\game\tools\bg_compression_report.csv"

# 压缩参数
TARGET_W = 1000
TARGET_H = 666
MAX_KB   = 250          # 通过线
WARN_KB  = 350          # 可接受上限
FAIL_KB  = 500          # 退回

QUALITY_START = 85      # 起始 JPEG 质量
QUALITY_MIN   = 50      # 最低容忍质量


def compress_to_jpg(src_png, dst_jpg, quality):
    """PNG → JPEG 压缩, 返回文件大小 bytes"""
    img = Image.open(src_png)
    # 确定目标尺寸 (保持比例)
    img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    # 转 RGB (JPG 不支持透明通道)
    if img.mode == "RGBA":
        # 白色背景合成 (防止透明变黑)
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.save(dst_jpg, format="JPEG", quality=quality, optimize=True, subsampling=0)
    return os.path.getsize(dst_jpg)


def main():
    os.makedirs(BG_MASTER, exist_ok=True)

    results = []
    passed = 0
    warned = 0
    failed = 0

    # 获取所有背景 PNG 文件
    bg_files = sorted([f for f in os.listdir(BG_SRC) if f.endswith(".png")])

    print(f"背景压缩: {len(bg_files)} 个文件\n")

    for fname in bg_files:
        src_png = os.path.join(BG_SRC, fname)
        base = os.path.splitext(fname)[0]

        # 1. 保留母版 (1024 源图) 到 master/
        master_path = os.path.join(BG_MASTER, fname)
        img = Image.open(src_png)
        img.save(master_path, format="PNG", optimize=True)
        master_kb = os.path.getsize(master_path) // 1024

        # 2. 二分搜索最佳 JPEG 质量
        dst_jpg = os.path.join(BG_SRC, f"{base}.jpg")
        
        # 从高质量开始试，逐步降低
        best_q = QUALITY_MIN
        best_size = 99999999
        for q in range(QUALITY_START, QUALITY_MIN - 1, -5):  # 85, 80, 75, ..., 50
            sz = compress_to_jpg(src_png, dst_jpg, q)
            sz_kb = sz // 1024
            if MAX_KB - 20 <= sz_kb <= MAX_KB + 20:
                # 正好在目标附近, 完美
                best_q = q
                best_size = sz
                break
            elif sz_kb <= MAX_KB and sz > best_size:
                # 在预算内且比之前大(更高质量)
                best_q = q
                best_size = sz
        
        # 如果所有质量都超预算或都过小, 取最佳值
        if best_size == 99999999:
            # 全部超预算 → 最低 quality
            best_q = QUALITY_MIN
            best_size = compress_to_jpg(src_png, dst_jpg, QUALITY_MIN)
        elif best_q < QUALITY_START:
            # 用找到的最佳 quality 重新生成
            compress_to_jpg(src_png, dst_jpg, best_q)

        final_kb = best_size // 1024

        # 3. 判定
        if final_kb <= MAX_KB:
            status = "PASS"
            passed += 1
        elif final_kb <= WARN_KB:
            status = "WARN"
            warned += 1
        else:
            status = "FAIL"
            failed += 1

        note = f"quality={best_q}"
        if final_kb > FAIL_KB:
            note += " >500KB 禁止入库!"

        results.append({
            "file": fname,
            "master_kb": master_kb,
            "final_kb": final_kb,
            "quality": best_q,
            "status": status,
            "note": note,
        })

        print(f"  {status:4s} {fname:35s} {master_kb:>5}KB -> {final_kb:>4}KB (q={best_q}) {note}")

    # 4. 汇总
    print(f"\n=== 压缩结果 ===")
    print(f"  PASS (<=250KB):  {passed}")
    print(f"  WARN (<=350KB):  {warned}")
    print(f"  FAIL (>350KB):   {failed}")

    if failed == 0:
        print(f"\n✅ 全部通过! 执行替换...")
        for r in results:
            base = os.path.splitext(r["file"])[0]
            src_jpg = os.path.join(BG_SRC, f"{base}.jpg")
            dst_png = os.path.join(BG_DST, r["file"])  # 同名替换
            
            # JPG 替换 PNG — Cocos 可能不认扩展名变化, 所以输出为 .jpg
            # 但如果场景引用的是 .png, 必须保持同名 .png
            # 我们保持 .png 后缀, 用 JPG 数据写
            jpg_data = open(src_jpg, "rb").read()
            with open(dst_png, "wb") as f:
                f.write(jpg_data)  # 写入 JPG 数据但保留 .png 后缀
            
            new_sz = os.path.getsize(dst_png)
            print(f"  [OK] {r['file']} ({new_sz//1024}KB)")
            
            # 清理临时 JPG
            os.remove(src_jpg)

        print(f"\n✅ 全部 {len(results)} 个背景已替换!")

    # 写报告
    with open(OUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        import csv
        w = csv.DictWriter(f, fieldnames=["file", "master_kb", "final_kb", "quality", "status", "note"])
        w.writeheader()
        w.writerows(results)
    print(f"\n报告: {OUT_CSV}")


if __name__ == "__main__":
    main()
