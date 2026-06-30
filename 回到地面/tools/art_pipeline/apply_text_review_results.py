import csv
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MANIFEST = PROJECT_ROOT / "art_source" / "textures_audit_manifest.csv"
REVIEW_DIR = PROJECT_ROOT / "art_source" / "text_review"
REVIEW_ITEMS = REVIEW_DIR / "text_review_items.csv"
BAD_ITEMS = REVIEW_DIR / "bad_text_items.csv"
BACKUP = PROJECT_ROOT / "art_source" / "textures_audit_manifest.before_text_review.csv"


VALID_ACTIONS = {"regenerate", "paint_over", "replace_with_label", "keep", "review"}


def read_csv(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    if not REVIEW_ITEMS.exists():
        raise SystemExit(f"Missing {REVIEW_ITEMS}. Run generate_text_review_contact_sheet.py first.")
    if not BAD_ITEMS.exists():
        raise SystemExit(f"Missing {BAD_ITEMS}. Fill it after reviewing contact sheets.")

    manifest_rows = read_csv(MANIFEST)
    manifest_fields = list(manifest_rows[0].keys()) if manifest_rows else []
    review_rows = read_csv(REVIEW_ITEMS)
    review_by_id = {row["review_id"].strip(): row for row in review_rows}
    review_paths = {row["path"] for row in review_rows}

    bad_rows_raw = read_csv(BAD_ITEMS)
    bad_rows = []
    for row in bad_rows_raw:
        review_id = row.get("review_id", "").strip()
        if not review_id or not review_id.isdigit():
            continue
        if review_id not in review_by_id:
            raise SystemExit(f"Unknown review_id in bad_text_items.csv: {review_id}")
        text_action = row.get("text_action", "").strip()
        if text_action not in VALID_ACTIONS:
            raise SystemExit(f"Invalid text_action for review_id {review_id}: {text_action}")
        bad_rows.append(row)

    bad_by_path = {}
    for row in bad_rows:
        item = review_by_id[row["review_id"].strip()]
        bad_by_path[item["path"]] = row

    if not BACKUP.exists():
        BACKUP.write_bytes(MANIFEST.read_bytes())

    approved = 0
    needs_fix = 0
    kept = 0

    for row in manifest_rows:
        path = row["path"]
        if path not in review_paths:
            continue

        bad = bad_by_path.get(path)
        if not bad:
            row["has_text"] = "false"
            row["text_type"] = "none"
            row["text_language"] = "none"
            row["text_action"] = "none"
            row["text_note"] = "contact sheet 人工确认无文字/水印/可读字符"
            row["status"] = "approved"
            approved += 1
            continue

        text_action = bad["text_action"].strip()
        row["has_text"] = "true"
        row["text_type"] = bad.get("text_type", "").strip() or "unknown"
        row["text_language"] = bad.get("text_language", "").strip() or "unknown"
        row["text_action"] = text_action
        row["text_note"] = bad.get("text_note", "").strip()
        if text_action == "keep":
            row["status"] = "approved"
            kept += 1
        else:
            row["status"] = "needs_fix"
            needs_fix += 1

    write_csv(MANIFEST, manifest_rows, manifest_fields)

    print(f"Applied text review results.")
    print(f"Approved as no text: {approved}")
    print(f"Needs fix: {needs_fix}")
    print(f"Approved keep text/logo/decorative: {kept}")
    print(f"Backup: {BACKUP}")


if __name__ == "__main__":
    main()
