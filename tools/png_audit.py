"""PNG 色彩模式审计与修复工具
扫描 textures/ 下所有 PNG，检测 P mode (palette indexed color)，
输出报告，并可选择批量转换为 RGBA。
"""
import os, sys, json
from PIL import Image

TEXTURES_DIR = r"E:\game\回到地面\assets\resources\textures"
REPORT_FILE = r"E:\game\tools\png_audit_report.json"

def audit():
    results = {"p_mode": [], "rgba": [], "other": [], "errors": []}
    total = 0
    for root, dirs, files in os.walk(TEXTURES_DIR):
        for fname in files:
            if not fname.lower().endswith(".png"):
                continue
            fpath = os.path.join(root, fname)
            total += 1
            try:
                img = Image.open(fpath)
                mode = img.mode
                rel = os.path.relpath(fpath, TEXTURES_DIR)
                size = os.path.getsize(fpath)
                info = {"file": rel, "mode": mode, "size_bytes": size}
                if mode == "P":
                    results["p_mode"].append(info)
                elif mode in ("RGBA", "RGB"):
                    results["rgba"].append(info)
                else:
                    results["other"].append(info)
                img.close()
            except Exception as e:
                results["errors"].append({"file": fpath, "error": str(e)})
    
    results["summary"] = {
        "total_png": total,
        "p_mode": len(results["p_mode"]),
        "rgba": len(results["rgba"]),
        "other": len(results["other"]),
        "errors": len(results["errors"]),
        "total_size_p_mode_bytes": sum(i["size_bytes"] for i in results["p_mode"]),
        "total_size_p_mode_kb": round(sum(i["size_bytes"] for i in results["p_mode"]) / 1024, 1),
    }
    
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("=== PNG 色彩模式审计报告 ===")
    print(f"扫描文件总数: {total}")
    print(f"RGBA/RGB (合规): {len(results['rgba'])}")
    print(f"P mode (违规):   {len(results['p_mode'])}")
    print(f"其他模式:        {len(results['other'])}")
    print(f"错误:            {len(results['errors'])}")
    if results["p_mode"]:
        print(f"\nP mode 文件总大小: {results['summary']['total_size_p_mode_kb']} KB")
        print("\nP mode 文件列表:")
        for i in results["p_mode"]:
            print(f"  [{i['size_bytes']//1024}KB] {i['file']} (mode={i['mode']})")
    if results["errors"]:
        print("\n错误列表:")
        for e in results["errors"]:
            print(f"  {e['file']}: {e['error']}")
    print(f"\n报告已保存至: {REPORT_FILE}")
    return results

def fix_all_p_mode(dry_run=True):
    """将审计报告中的 P mode PNG 转换为 RGBA"""
    if not os.path.exists(REPORT_FILE):
        print("请先运行审计 (audit)")
        return
    
    with open(REPORT_FILE, encoding="utf-8") as f:
        report = json.load(f)
    
    p_files = report.get("p_mode", [])
    if not p_files:
        print("没有发现 P mode 文件，无需转换")
        return
    
    converted = 0
    errors = 0
    for info in p_files:
        fpath = os.path.join(TEXTURES_DIR, info["file"])
        try:
            img = Image.open(fpath)
            if img.mode == "P":
                rgba = img.convert("RGBA")
                if not dry_run:
                    rgba.save(fpath, format="PNG", optimize=True)
                converted += 1
                print(f"  {'[DRY-RUN]' if dry_run else '[OK]'} {info['file']}: P → RGBA")
            img.close()
        except Exception as e:
            errors += 1
            print(f"  [FAIL] {info['file']}: {e}")
    
    print(f"\n{'=== 试运行 (DRY-RUN) ===' if dry_run else '=== 转换完成 ==='}")
    print(f"P mode 文件: {len(p_files)}")
    print(f"已转换: {converted}")
    print(f"失败: {errors}")
    if dry_run:
        print("\n✅ 试运行结束，未做任何修改。")
        print("💡 确认无误后运行: python png_audit.py fix")
    else:
        print("💡 所有 P mode 文件已转换为 RGBA。")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "fix":
        dry_run = False
        print("执行修复模式: 将 P mode 转换为 RGBA")
        print("=" * 50)
        fix_all_p_mode(dry_run=False)
    elif len(sys.argv) > 1 and sys.argv[1] == "dryrun":
        fix_all_p_mode(dry_run=True)
    else:
        audit()
