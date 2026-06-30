"""Art resource gate for the Cocos Creator project.

This script audits all PNG art resources under assets/resources and checks:
  - disk files vs textures_audit_manifest.csv
  - PNG format safety for Cocos / WeChat mini game
  - meta / SpriteFrame UUID availability
  - static references in scene, prefab, anim, json, ts files
  - replacement target size and file-size budget
  - duplicate / legacy / extra-file cleanup candidates

Default mode is read-only. Use --merge-references to update CSV reference
columns. Use --quarantine --apply to move cleanup candidates into a quarantine
folder; never deletes files directly.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
import shutil
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except Exception:  # pragma: no cover - reported at runtime
    Image = None


TEXTURE_MANIFEST = Path("art_source/textures_audit_manifest.csv")
TEXTURES_ROOT = Path("assets/resources/textures")
RESOURCES_ROOT = Path("assets/resources")
SEARCH_EXTS = {".scene", ".prefab", ".anim", ".json", ".ts"}
PNG_EXT = ".png"
OLD_NAME_RE = re.compile(
    r"(^|[_\-. ])(old|backup|bak|copy|tmp|temp|low|lowres|small|48px|draft|test|v\d+)([_\-. ]|$)",
    re.IGNORECASE,
)


@dataclass
class PngInfo:
    rel_resource_path: str
    abs_path: Path
    width: int = 0
    height: int = 0
    mode: str = ""
    has_alpha: bool = False
    size_kb: float = 0.0
    sha1: str = ""
    error: str = ""


@dataclass
class RefHit:
    file: str
    line: int
    match_type: str
    confidence: str
    token: str


@dataclass
class AssetRecord:
    path: str
    row: dict[str, str] | None = None
    png: PngInfo | None = None
    meta_exists: bool = False
    uuid: str = ""
    texture_uuid: str = ""
    sprite_frame_uuid: str = ""
    references: list[RefHit] = field(default_factory=list)
    possible_references: list[RefHit] = field(default_factory=list)
    issues: list[str] = field(default_factory=list)
    cleanup_reasons: list[str] = field(default_factory=list)

    @property
    def reference_count(self) -> int:
        return len(self.references)

    @property
    def possible_reference_count(self) -> int:
        return len(self.possible_references)

    @property
    def used_by(self) -> str:
        if not self.references:
            return "unknown"
        return ", ".join(sorted({hit.file for hit in self.references}))


def read_text(path: Path) -> str:
    for enc in ("utf-8", "utf-8-sig", "gb18030"):
        try:
            return path.read_text(encoding=enc)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="ignore")


def find_project_root(start: Path, explicit: str | None) -> Path:
    if explicit:
        root = Path(explicit).resolve()
        if (root / TEXTURES_ROOT).exists() and (root / TEXTURE_MANIFEST).exists():
            return root
        raise SystemExit(f"[ERROR] project root invalid: {root}")

    candidates: list[Path] = []
    for parent in [start.resolve(), *start.resolve().parents]:
        candidates.append(parent)
        try:
            candidates.extend([p for p in parent.iterdir() if p.is_dir()])
        except OSError:
            pass

    for root in candidates:
        if (root / TEXTURES_ROOT).exists() and (root / TEXTURE_MANIFEST).exists():
            return root
    raise SystemExit("[ERROR] cannot locate project root with assets/resources/textures and art_source CSV")


def load_manifest(csv_path: Path) -> tuple[list[dict[str, str]], list[str]]:
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fields = list(reader.fieldnames or [])
    if "path" not in fields:
        raise SystemExit(f"[ERROR] CSV missing required column: path ({csv_path})")
    return rows, fields


def parse_bool(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def parse_int(value: str) -> int:
    try:
        return int(float(str(value).strip()))
    except Exception:
        return 0


def parse_float(value: str) -> float:
    try:
        return float(str(value).strip())
    except Exception:
        return 0.0


def sha1_file(path: Path) -> str:
    h = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def scan_pngs(project_root: Path) -> dict[str, PngInfo]:
    pngs: dict[str, PngInfo] = {}
    root = project_root / RESOURCES_ROOT
    for path in root.rglob("*.png"):
        rel_resource_path = path.relative_to(root).as_posix()
        info = PngInfo(rel_resource_path=rel_resource_path, abs_path=path)
        try:
            info.size_kb = round(path.stat().st_size / 1024, 2)
            info.sha1 = sha1_file(path)
            if Image is None:
                info.error = "Pillow not installed; cannot inspect PNG mode/dimensions"
            else:
                with Image.open(path) as img:
                    info.width, info.height = img.size
                    info.mode = img.mode
                    info.has_alpha = img.mode in {"RGBA", "LA"} or (
                        img.mode == "P" and "transparency" in img.info
                    )
        except Exception as exc:
            info.error = f"{type(exc).__name__}: {exc}"
        pngs[rel_resource_path] = info
    return pngs


def read_meta(path: Path) -> tuple[bool, str, str, str, str]:
    meta_path = path.with_suffix(path.suffix + ".meta")
    if not meta_path.exists():
        return False, "", "", "", "missing meta"
    try:
        data = json.loads(read_text(meta_path))
        uuid = data.get("uuid", "")
        texture_uuid = ""
        sprite_frame_uuid = ""
        for sub in data.get("subMetas", {}).values():
            name = sub.get("name", "")
            sub_uuid = sub.get("uuid", "")
            if name == "texture":
                texture_uuid = sub_uuid
            elif name == "spriteFrame":
                sprite_frame_uuid = sub_uuid
        return True, uuid, texture_uuid, sprite_frame_uuid, ""
    except Exception as exc:
        return True, "", "", "", f"invalid meta: {type(exc).__name__}: {exc}"


def collect_search_files(project_root: Path) -> list[Path]:
    assets_root = project_root / "assets"
    return [p for p in assets_root.rglob("*") if p.is_file() and p.suffix.lower() in SEARCH_EXTS]


def iter_matches(pattern: re.Pattern[str], content: str) -> list[tuple[int, str]]:
    return [(m.start(), m.group(0)) for m in pattern.finditer(content)]


def line_at(content: str, idx: int) -> int:
    return content.count("\n", 0, idx) + 1


def add_ref(records: dict[str, AssetRecord], rel: str, filepath: Path, project_root: Path, line: int,
            match_type: str, confidence: str, token: str) -> None:
    hit = RefHit(
        file=filepath.relative_to(project_root).as_posix(),
        line=line,
        match_type=match_type,
        confidence=confidence,
        token=token,
    )
    if confidence == "high":
        records[rel].references.append(hit)
    else:
        records[rel].possible_references.append(hit)


def scan_references(records: dict[str, AssetRecord], project_root: Path) -> None:
    uuid_patterns: list[tuple[str, str, re.Pattern[str], str]] = []
    path_patterns: list[tuple[str, re.Pattern[str], str]] = []
    basename_patterns: list[tuple[str, re.Pattern[str]]] = []

    for rel, rec in records.items():
        for token, kind in ((rec.sprite_frame_uuid, "sprite_frame_uuid"), (rec.texture_uuid, "texture_uuid")):
            if token:
                uuid_patterns.append((rel, token, re.compile(re.escape(token)), kind))
        if rec.uuid:
            uuid_patterns.append((rel, rec.uuid, re.compile(re.escape(rec.uuid) + r"(?!@)"), "uuid"))

        if rel.startswith("textures/"):
            res_no_ext = rel[:-4]
            full = "assets/resources/" + rel
            path_patterns.append((rel, re.compile(re.escape(res_no_ext + ".png")), "resource_path_png"))
            path_patterns.append((rel, re.compile(re.escape(res_no_ext) + r"(?!\.png)(?![/\w-])"), "resource_path"))
            path_patterns.append((rel, re.compile(re.escape(full)), "full_path"))

        base = Path(rel).stem.lower()
        if len(base) >= 4:
            basename_patterns.append((rel, re.compile(r"(?<![\w-])" + re.escape(base) + r"(?![\w-])")))

    for filepath in collect_search_files(project_root):
        content = read_text(filepath)
        ext = filepath.suffix.lower()

        for rel, token, pattern, kind in uuid_patterns:
            for idx, matched in iter_matches(pattern, content):
                add_ref(records, rel, filepath, project_root, line_at(content, idx), kind, "high", matched)

        for rel, pattern, kind in path_patterns:
            for idx, matched in iter_matches(pattern, content):
                add_ref(records, rel, filepath, project_root, line_at(content, idx), kind, "high", matched)

        if ext == ".ts":
            lower = content.lower()
            for rel, pattern in basename_patterns:
                for idx, matched in iter_matches(pattern, lower):
                    add_ref(records, rel, filepath, project_root, line_at(lower, idx), "filename", "low", matched)


def target_dimensions(row: dict[str, str]) -> tuple[int, int]:
    for w_key, h_key in (("target_w", "target_h"), ("frame_w", "frame_h")):
        w = parse_int(row.get(w_key, ""))
        h = parse_int(row.get(h_key, ""))
        if w > 0 and h > 0:
            return w, h
    return 0, 0


def expected_has_alpha(row: dict[str, str]) -> bool | None:
    value = row.get("has_alpha", "")
    if value == "":
        return None
    return parse_bool(value)


def assess_records(records: dict[str, AssetRecord], manifest_paths: set[str]) -> None:
    by_hash: defaultdict[str, list[AssetRecord]] = defaultdict(list)

    for rec in records.values():
        row = rec.row or {}
        png = rec.png

        if png is None:
            rec.issues.append("missing_file")
            rec.cleanup_reasons.append("manifest_row_missing_file")
            continue

        if rec.path not in manifest_paths:
            rec.issues.append("extra_file_not_in_textures_manifest")
            rec.cleanup_reasons.append("extra_file_not_in_textures_manifest")

        if png.error:
            rec.issues.append("png_read_error")

        if png.mode == "P":
            rec.issues.append("png_mode_P_convert_to_RGBA")

        if not rec.meta_exists:
            rec.issues.append("missing_png_meta")
        elif not rec.sprite_frame_uuid:
            rec.issues.append("missing_sprite_frame_uuid")

        if OLD_NAME_RE.search(Path(rec.path).name):
            rec.issues.append("legacy_or_backup_filename")
            rec.cleanup_reasons.append("legacy_or_backup_filename")

        if row:
            csv_w = parse_int(row.get("width", ""))
            csv_h = parse_int(row.get("height", ""))
            if csv_w and csv_h and (csv_w != png.width or csv_h != png.height):
                rec.issues.append(f"csv_dimension_mismatch:{csv_w}x{csv_h}!={png.width}x{png.height}")

            target_w, target_h = target_dimensions(row)
            action = row.get("action", "").strip().lower()
            grade = row.get("grade", "").strip().upper()
            if action in {"replace", "regenerate", "resize", "compress_review", "needs_fix"}:
                if target_w and target_h and (png.width < target_w or png.height < target_h):
                    rec.issues.append(f"below_target_dimension:{png.width}x{png.height}<{target_w}x{target_h}")
                target_size = parse_float(row.get("target_size_kb", ""))
                if target_size > 0 and png.size_kb > target_size * 1.15:
                    rec.issues.append(f"over_target_size:{png.size_kb}KB>{target_size}KB")

            if grade in {"S", "A"}:
                if not row.get("bundle", "").strip():
                    rec.issues.append("missing_bundle")
                if not row.get("atlas_group", "").strip():
                    rec.issues.append("missing_atlas_group")

            alpha = expected_has_alpha(row)
            if alpha is not None and alpha != png.has_alpha:
                rec.issues.append(f"csv_alpha_mismatch:{alpha}!={png.has_alpha}")

        if png.sha1:
            by_hash[png.sha1].append(rec)

    for same_hash in by_hash.values():
        if len(same_hash) <= 1:
            continue
        names = sorted(r.path for r in same_hash)
        for rec in same_hash:
            rec.issues.append("duplicate_binary:" + "|".join(names))
            if rec.reference_count == 0 and rec.possible_reference_count == 0:
                rec.cleanup_reasons.append("duplicate_binary_unreferenced")

    for rec in records.values():
        if rec.reference_count > 0:
            rec.cleanup_reasons = [
                reason for reason in rec.cleanup_reasons
                if reason not in {"extra_file_not_in_textures_manifest", "legacy_or_backup_filename", "duplicate_binary_unreferenced"}
            ]


def build_records(project_root: Path, manifest_rows: list[dict[str, str]], pngs: dict[str, PngInfo]) -> dict[str, AssetRecord]:
    records: dict[str, AssetRecord] = {}

    for row in manifest_rows:
        rel = row["path"].strip().replace("\\", "/")
        if not rel.startswith("textures/"):
            rel = "textures/" + rel
        rec = records.setdefault(rel, AssetRecord(path=rel))
        rec.row = row

    for rel, png in pngs.items():
        rec = records.setdefault(rel, AssetRecord(path=rel))
        rec.png = png
        meta_exists, uuid, texture_uuid, sprite_frame_uuid, meta_error = read_meta(png.abs_path)
        rec.meta_exists = meta_exists
        rec.uuid = uuid
        rec.texture_uuid = texture_uuid
        rec.sprite_frame_uuid = sprite_frame_uuid
        if meta_error:
            rec.issues.append(meta_error)

    return records


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def write_outputs(project_root: Path, records: dict[str, AssetRecord], out_dir: Path) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)

    detail_fields = [
        "path", "in_manifest", "exists", "width", "height", "mode", "has_alpha", "size_kb",
        "meta_exists", "sprite_frame_uuid", "reference_count", "possible_reference_count",
        "used_by", "issues", "cleanup_reasons",
    ]
    detail_rows: list[dict[str, Any]] = []
    cleanup_rows: list[dict[str, Any]] = []
    unmanifested_rows: list[dict[str, Any]] = []
    ref_cache: dict[str, Any] = {}
    issue_counter: defaultdict[str, int] = defaultdict(int)

    for rec in sorted(records.values(), key=lambda r: r.path):
        png = rec.png
        row = {
            "path": rec.path,
            "in_manifest": rec.row is not None,
            "exists": png is not None,
            "width": png.width if png else "",
            "height": png.height if png else "",
            "mode": png.mode if png else "",
            "has_alpha": png.has_alpha if png else "",
            "size_kb": png.size_kb if png else "",
            "meta_exists": rec.meta_exists,
            "sprite_frame_uuid": rec.sprite_frame_uuid,
            "reference_count": rec.reference_count,
            "possible_reference_count": rec.possible_reference_count,
            "used_by": rec.used_by,
            "issues": ";".join(rec.issues),
            "cleanup_reasons": ";".join(sorted(set(rec.cleanup_reasons))),
        }
        detail_rows.append(row)
        if rec.cleanup_reasons:
            cleanup_rows.append(row)
        if rec.png and rec.row is None:
            unmanifested_rows.append(row)
        for issue in rec.issues:
            issue_counter[issue.split(":", 1)[0]] += 1
        ref_cache[rec.path] = {
            "reference_count": rec.reference_count,
            "possible_reference_count": rec.possible_reference_count,
            "used_by": rec.used_by,
            "references": [hit.__dict__ for hit in rec.references],
            "possible_references": [hit.__dict__ for hit in rec.possible_references],
        }

    write_csv(out_dir / "art_resource_gate_detail.csv", detail_rows, detail_fields)
    write_csv(out_dir / "cleanup_candidates.csv", cleanup_rows, detail_fields)
    write_csv(out_dir / "unmanifested_art_assets.csv", unmanifested_rows, detail_fields)
    write_csv(
        out_dir / "issue_summary.csv",
        [{"issue": key, "count": value} for key, value in sorted(issue_counter.items(), key=lambda x: (-x[1], x[0]))],
        ["issue", "count"],
    )
    (out_dir / "ref_cache_full.json").write_text(json.dumps(ref_cache, ensure_ascii=False, indent=2), encoding="utf-8")

    total = len(records)
    manifest_count = sum(1 for r in records.values() if r.row is not None)
    exists_count = sum(1 for r in records.values() if r.png is not None)
    issue_count = sum(1 for r in records.values() if r.issues)
    cleanup_count = len(cleanup_rows)
    strong_ref = sum(1 for r in records.values() if r.reference_count > 0)
    possible_ref = sum(1 for r in records.values() if r.reference_count == 0 and r.possible_reference_count > 0)
    p_mode = sum(1 for r in records.values() if r.png and r.png.mode == "P")
    missing_meta = sum(1 for r in records.values() if r.png and not r.meta_exists)
    extra = sum(1 for r in records.values() if r.png and r.row is None)
    missing = sum(1 for r in records.values() if r.row and not r.png)

    report = [
        "# 美术资源门禁报告",
        "",
        f"- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"- 项目目录: `{project_root}`",
        f"- 资源总记录: {total}",
        f"- CSV 记录: {manifest_count}",
        f"- 磁盘 PNG: {exists_count}",
        f"- 强引用资源: {strong_ref}",
        f"- 仅疑似引用资源: {possible_ref}",
        f"- 有问题资源: {issue_count}",
        f"- 清理候选: {cleanup_count}",
        "",
        "## 关键门禁",
        "",
        f"- CSV 有但磁盘缺失: {missing}",
        f"- 磁盘有但 CSV 未登记: {extra}",
        f"- PNG P 模式: {p_mode}",
        f"- 缺 PNG meta: {missing_meta}",
        "",
        "## 输出文件",
        "",
        "- `art_resource_gate_detail.csv`: 全量明细",
        "- `issue_summary.csv`: 问题类型汇总",
        "- `cleanup_candidates.csv`: 清理/隔离候选",
        "- `unmanifested_art_assets.csv`: 磁盘存在但未登记到审计清单的美术资源",
        "- `ref_cache_full.json`: 引用明细和行号",
        "",
        "## 使用建议",
        "",
        "1. 先修复 `missing_file`、`extra_file_not_in_textures_manifest`、`png_mode_P_convert_to_RGBA`、`missing_png_meta`。",
        "2. `reference_count=0` 只能代表静态扫描未发现引用，不能单独作为删除依据。",
        "3. 清理候选先执行隔离，不直接删除；确认微信小游戏和浏览器预览正常后再删除隔离目录。",
    ]
    (out_dir / "art_resource_gate_report.md").write_text("\n".join(report) + "\n", encoding="utf-8")

    return {
        "total": total,
        "manifest_count": manifest_count,
        "exists_count": exists_count,
        "issue_count": issue_count,
        "cleanup_count": cleanup_count,
        "strong_ref": strong_ref,
        "possible_ref": possible_ref,
        "missing": missing,
        "extra": extra,
        "p_mode": p_mode,
        "missing_meta": missing_meta,
    }


def merge_references(project_root: Path, records: dict[str, AssetRecord], fields: list[str]) -> Path:
    csv_path = project_root / TEXTURE_MANIFEST
    rows, _ = load_manifest(csv_path)
    backup = csv_path.with_suffix(".before_art_resource_gate_merge.csv")
    shutil.copy2(csv_path, backup)

    for row in rows:
        rel = row["path"].strip().replace("\\", "/")
        full_rel = rel if rel.startswith("textures/") else "textures/" + rel
        rec = records.get(full_rel)
        if not rec:
            continue
        row["used_by"] = rec.used_by
        row["reference_count"] = str(rec.reference_count)
        if "possible_reference_count" in fields:
            row["possible_reference_count"] = str(rec.possible_reference_count)

    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    return backup


def quarantine(project_root: Path, records: dict[str, AssetRecord], out_dir: Path, apply: bool) -> tuple[int, Path]:
    qroot = out_dir / "quarantine"
    count = 0
    plan: list[dict[str, str]] = []

    for rec in sorted(records.values(), key=lambda r: r.path):
        if not rec.cleanup_reasons or rec.reference_count > 0:
            continue
        if rec.png is None:
            continue
        src = rec.png.abs_path
        dst = qroot / rec.path
        meta_src = src.with_suffix(src.suffix + ".meta")
        meta_dst = dst.with_suffix(dst.suffix + ".meta")
        plan.append({
            "path": rec.path,
            "src": str(src),
            "dst": str(dst),
            "reasons": ";".join(sorted(set(rec.cleanup_reasons))),
        })
        count += 1
        if apply:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dst))
            if meta_src.exists():
                meta_dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(meta_src), str(meta_dst))

    write_csv(out_dir / "quarantine_plan.csv", plan, ["path", "src", "dst", "reasons"])
    return count, qroot


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit, reference-scan, and gate Cocos art resources.")
    parser.add_argument("--project-root", default=None, help="Project root. Auto-detected when omitted.")
    parser.add_argument("--out-dir", default=None, help="Output directory. Default: art_source/art_resource_gate")
    parser.add_argument("--merge-references", action="store_true", help="Update used_by/reference_count in CSV.")
    parser.add_argument("--quarantine", action="store_true", help="Create a quarantine plan for cleanup candidates.")
    parser.add_argument("--apply", action="store_true", help="Actually apply --quarantine moves.")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    project_root = find_project_root(script_dir.parent, args.project_root)
    out_dir = Path(args.out_dir).resolve() if args.out_dir else project_root / "art_source" / "art_resource_gate"

    rows, fields = load_manifest(project_root / TEXTURE_MANIFEST)
    pngs = scan_pngs(project_root)
    texture_manifest_paths = {
        ("textures/" + row["path"].strip().replace("\\", "/")).replace("textures/textures/", "textures/")
        for row in rows
    }
    records = build_records(project_root, rows, pngs)
    scan_references(records, project_root)
    assess_records(records, texture_manifest_paths)
    summary = write_outputs(project_root, records, out_dir)

    print("=" * 64)
    print("Art Resource Gate")
    print("=" * 64)
    print(f"Project: {project_root}")
    print(f"Output:  {out_dir}")
    print(f"CSV rows: {summary['manifest_count']} | PNG files: {summary['exists_count']} | total records: {summary['total']}")
    print(f"Strong refs: {summary['strong_ref']} | possible refs: {summary['possible_ref']}")
    print(f"Issues: {summary['issue_count']} | cleanup candidates: {summary['cleanup_count']}")
    print(f"Missing files: {summary['missing']} | extra files: {summary['extra']} | P-mode: {summary['p_mode']} | missing meta: {summary['missing_meta']}")

    if args.merge_references:
        backup = merge_references(project_root, records, fields)
        print(f"[MERGE] updated CSV references; backup: {backup}")

    if args.quarantine:
        count, qroot = quarantine(project_root, records, out_dir, args.apply)
        mode = "APPLIED" if args.apply else "DRY-RUN"
        print(f"[QUARANTINE:{mode}] candidates: {count}; folder: {qroot}")
        if not args.apply:
            print("Run again with --quarantine --apply to move candidates.")

    if summary["missing"] or summary["extra"] or summary["p_mode"] or summary["missing_meta"]:
        print("[FAIL] Resource gate found blocking issues. See art_resource_gate_report.md")
    else:
        print("[PASS] No blocking disk/format/meta issues found. Review cleanup candidates before removing anything.")


if __name__ == "__main__":
    main()
