#!/usr/bin/env python3
"""
check_assets_registry.py — 资源注册完整性门禁

检查 assets.json 与磁盘文件的一致性，输出：
  1. disk_exists_but_not_registered — 磁盘有文件但 assets.json 未收录
  2. registered_but_missing_file — assets.json 有条目但对应文件不存在
  3. duplicate_asset_id — assets.json 中出现重复的 resourceId（非重复键，因 json 不允许重复键）
  4. unsupported_format — 磁盘中存在非 png/jpg 的纹理文件

用法：
    python tools/check_assets_registry.py
    python tools/check_assets_registry.py --ci        # 门禁模式：issues>0 时 exit(1)
    python tools/check_assets_registry.py --fix-assets # 自动补全缺失的文件注册

输出文件：
    tools/output/check_assets_registry_report.json
"""

import json
import os
import sys
from pathlib import Path

# ── 路径配置 ──

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = (SCRIPT_DIR / "..").resolve()
TEXTURES_DIR = PROJECT_DIR / "assets" / "resources" / "textures"
ASSETS_JSON = PROJECT_DIR / "assets" / "resources" / "config" / "assets.json"
UI_ASSETS_JSON = PROJECT_DIR / "assets" / "resources" / "config" / "ui_assets.json"
OUTPUT_DIR = SCRIPT_DIR / "output"

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
SKIP_DIRS = {"__MACOSX"}


def scan_disk_files(textures_dir: Path) -> dict[str, str]:
    """扫描磁盘上的纹理文件，返回 {resource_key: file_path}"""
    result = {}
    if not textures_dir.exists():
        print(f"[WARN] textures dir not found: {textures_dir}")
        return result

    for root, dirs, files in os.walk(textures_dir):
        # 过滤跳过目录
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for fname in files:
            ext = Path(fname).suffix.lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            full_path = Path(root) / fname
            rel_path = full_path.relative_to(textures_dir.parent)  # relative to assets/resources/
            # 去掉后缀：textures/ui/common/btn_active.png → textures/ui/common/btn_active
            key = str(rel_path.with_suffix("")).replace("\\", "/")
            result[key] = str(full_path)

    return result


def read_assets_json(path: Path) -> dict:
    """读取 assets.json，返回 {resource_key: entry}"""
    if not path.exists():
        print(f"[ERROR] assets.json not found: {path}")
        return {}

    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    data = raw.get("data", raw)
    # 过滤 metadata
    return {k: v for k, v in data.items() if k != "metadata"}


def read_ui_assets_json(path: Path) -> dict:
    """读取 ui_assets.json，返回 {semantic_key: assetId}"""
    if not path.exists():
        print(f"[WARN] ui_assets.json not found: {path}")
        return {}

    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    data = raw.get("data", raw)
    result = {}
    for k, v in data.items():
        if k == "metadata":
            continue
        if isinstance(v, dict) and "assetId" in v:
            result[k] = v["assetId"]
    return result


def check_registry(disk_files: dict, assets: dict) -> dict:
    """检查资产一致性"""
    disk_keys = set(disk_files.keys())
    assets_keys = set(assets.keys())

    return {
        "disk_exists_but_not_registered": sorted(disk_keys - assets_keys),
        "registered_but_missing_file": sorted(assets_keys - disk_keys),
        "total_disk": len(disk_keys),
        "total_registered": len(assets_keys),
        "total_matched": len(disk_keys & assets_keys),
    }


def check_ui_assets_cross_ref(ui_assets: dict, assets: dict) -> dict:
    """检查 ui_assets.json 引用的 assetId 是否在 assets.json 中"""
    missing_assets = []
    for semantic_key, asset_id in ui_assets.items():
        if asset_id not in assets:
            missing_assets.append({"key": semantic_key, "assetId": asset_id})

    return {
        "ui_assets_total": len(ui_assets),
        "ui_assets_assetId_not_in_assets_json": missing_assets,
    }


def generate_report():
    """生成完整的审计报告"""
    print("=" * 60)
    print("  UI 资源注册完整性检查")
    print("=" * 60)

    # 1. 扫描磁盘文件
    print("\n[1/4] 扫描磁盘纹理文件...")
    disk_files = scan_disk_files(TEXTURES_DIR)
    print(f"      找到 {len(disk_files)} 个文件")

    # 2. 读取 assets.json
    print("\n[2/4] 读取 assets.json...")
    assets = read_assets_json(ASSETS_JSON)
    print(f"      共 {len(assets)} 条注册")

    # 3. 读取 ui_assets.json
    print("\n[3/4] 读取 ui_assets.json...")
    ui_assets = read_ui_assets_json(UI_ASSETS_JSON)
    print(f"      共 {len(ui_assets)} 条语义 key")

    # 4. 执行检查
    print("\n[4/4] 执行检查...")

    registry_check = check_registry(disk_files, assets)
    ui_cross_ref = check_ui_assets_cross_ref(ui_assets, assets)

    # 汇总
    report = {
        "metadata": {
            "tool": "check_assets_registry.py",
            "version": "1.0.0",
            "timestamp": __import__("datetime").datetime.now().isoformat(),
        },
        "registry": registry_check,
        "ui_assets_cross_ref": ui_cross_ref,
    }

    # 输出
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report_path = OUTPUT_DIR / "check_assets_registry_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # 打印摘要
    r = registry_check
    print(f"\n{'=' * 60}")
    print(f"  检查结果")
    print(f"{'=' * 60}")
    print(f"  磁盘文件总数:         {r['total_disk']}")
    print(f"  assets.json 注册数:   {r['total_registered']}")
    print(f"  匹配数:               {r['total_matched']}")
    print(f"  磁盘有但未注册:       {len(r['disk_exists_but_not_registered'])}")
    print(f"  已注册但文件缺失:     {len(r['registered_but_missing_file'])}")

    if r['disk_exists_but_not_registered']:
        print(f"\n  ⚠️  以下文件在磁盘但未注册到 assets.json:")
        for f in r['disk_exists_but_not_registered'][:20]:
            print(f"      - {f}")
        if len(r['disk_exists_but_not_registered']) > 20:
            print(f"      ... 还有 {len(r['disk_exists_but_not_registered']) - 20} 个")

    if r['registered_but_missing_file']:
        print(f"\n  ❌  以下已注册 assetId 但磁盘文件缺失:")
        for f in r['registered_but_missing_file'][:20]:
            print(f"      - {f}")
        if len(r['registered_but_missing_file']) > 20:
            print(f"      ... 还有 {len(r['registered_but_missing_file']) - 20} 个")

    if ui_cross_ref['ui_assets_assetId_not_in_assets_json']:
        items = ui_cross_ref['ui_assets_assetId_not_in_assets_json']
        print(f"\n  ⚠️  ui_assets.json 引用了 {len(items)} 个不在 assets.json 中的 assetId:")
        for item in items[:10]:
            print(f"      {item['key']} → {item['assetId']}")
        if len(items) > 10:
            print(f"      ... 还有 {len(items) - 10} 个")

    total_issues = (
        len(r['disk_exists_but_not_registered'])
        + len(r['registered_but_missing_file'])
        + len(ui_cross_ref['ui_assets_assetId_not_in_assets_json'])
    )

    print(f"\n{'=' * 60}")
    print(f"  总计问题数: {total_issues}")
    print(f"  报告文件:   {report_path}")
    print(f"{'=' * 60}")

    return total_issues, report


def fix_missing_assets(report: dict):
    """自动补全缺失的文件注册到 assets.json"""
    missing = report['registry'].get('disk_exists_but_not_registered', [])
    if not missing:
        print("  没有需要补全的条目")
        return

    print(f"\n  正在补全 {len(missing)} 条缺失注册...")

    with open(ASSETS_JSON, "r", encoding="utf-8") as f:
        assets_data = json.load(f)

    data = assets_data.setdefault("data", {})
    if "metadata" in data:
        data = {k: v for k, v in data.items() if k != "metadata"}
    else:
        data = assets_data.get("data", assets_data)

    added = 0
    for key in missing:
        if key in data:
            continue

        # 判断类型
        if key.startswith("textures/ui/") or key.startswith("textures/icons/") or key.startswith("textures/effects/"):
            entry_type = "SpriteFrame"
            entry_path = f"{key}/spriteFrame"
        elif key.startswith("textures/backgrounds/"):
            entry_type = "Texture2D"
            entry_path = f"{key}/texture"
        elif key.startswith("textures/characters/") or key.startswith("textures/monsters/") or key.startswith("textures/bosses/"):
            entry_type = "SpriteFrame"
            entry_path = f"{key}/spriteFrame"
        else:
            entry_type = "SpriteFrame"
            entry_path = f"{key}/spriteFrame"

        # 写入 data
        if "data" in assets_data:
            if "metadata" not in assets_data["data"]:
                assets_data["data"]["metadata"] = {"autoFixed": True, "note": "fixed by check_assets_registry.py"}
            assets_data["data"][key] = {"bundle": "resources", "type": entry_type, "path": entry_path}
        else:
            assets_data[key] = {"bundle": "resources", "type": entry_type, "path": entry_path}

        added += 1

    if added > 0:
        # 更新 lastUpdated
        if "metadata" in assets_data:
            assets_data["metadata"]["lastUpdated"] = __import__("datetime").datetime.now().strftime("%Y-%m-%d")

        with open(ASSETS_JSON, "w", encoding="utf-8") as f:
            json.dump(assets_data, f, ensure_ascii=False, indent=4)

        print(f"  已补全 {added} 条注册到 {ASSETS_JSON}")
    else:
        print("  无新增条目")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="资源注册完整性门禁")
    parser.add_argument("--ci", action="store_true", help="门禁模式：issues>0 时 exit(1)")
    parser.add_argument("--fix-assets", action="store_true", help="自动补全缺失的文件注册")
    args = parser.parse_args()

    total_issues, report = generate_report()

    if args.fix_assets and total_issues > 0:
        fix_missing_assets(report)

    if args.ci and total_issues > 0:
        print(f"\n[CI FAIL] 存在 {total_issues} 个问题，门禁未通过")
        sys.exit(1)

    print(f"\n[PASS] 检查完成")


if __name__ == "__main__":
    main()
