import csv
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MANIFEST = PROJECT_ROOT / "art_source" / "textures_audit_manifest.csv"
TEXTURE_ROOT = PROJECT_ROOT / "assets" / "resources" / "textures"
OUT_DIR = PROJECT_ROOT / "art_source" / "text_review"


def load_font(size: int) -> ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def fit_image(img: Image.Image, max_w: int, max_h: int) -> Image.Image:
    img = img.convert("RGBA")
    ratio = min(max_w / img.width, max_h / img.height)
    new_size = (max(1, int(img.width * ratio)), max(1, int(img.height * ratio)))
    return img.resize(new_size, Image.Resampling.LANCZOS)


def read_manifest() -> list[dict]:
    with MANIFEST.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = read_manifest()
    review_rows = [
        row for row in rows
        if row.get("has_text", "").strip().lower() in ("suspected", "true")
        and row.get("text_action", "").strip() == "review"
    ]

    review_csv = OUT_DIR / "text_review_items.csv"
    with review_csv.open("w", encoding="utf-8-sig", newline="") as f:
        fieldnames = [
            "review_id",
            "path",
            "category",
            "text_type",
            "text_language",
            "suggested_action",
            "status",
            "note",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for idx, row in enumerate(review_rows, 1):
            writer.writerow({
                "review_id": idx,
                "path": row["path"],
                "category": row.get("category", ""),
                "text_type": row.get("text_type", ""),
                "text_language": row.get("text_language", ""),
                "suggested_action": "review",
                "status": "pending",
                "note": row.get("text_note", ""),
            })

    tile_w = 220
    tile_h = 210
    cols = 4
    rows_per_sheet = 20
    font = load_font(16)
    small_font = load_font(12)

    for sheet_index in range(math.ceil(len(review_rows) / rows_per_sheet)):
        chunk = review_rows[sheet_index * rows_per_sheet:(sheet_index + 1) * rows_per_sheet]
        sheet_rows = math.ceil(len(chunk) / cols)
        canvas = Image.new("RGB", (cols * tile_w, sheet_rows * tile_h), (245, 245, 245))
        draw = ImageDraw.Draw(canvas)

        for offset, row in enumerate(chunk):
            review_id = sheet_index * rows_per_sheet + offset + 1
            col = offset % cols
            line = offset // cols
            x = col * tile_w
            y = line * tile_h
            draw.rectangle([x, y, x + tile_w - 1, y + tile_h - 1], outline=(180, 180, 180))

            asset_path = TEXTURE_ROOT / Path(row["path"])
            try:
                img = Image.open(asset_path)
                preview = fit_image(img, tile_w - 24, 130)
                px = x + (tile_w - preview.width) // 2
                py = y + 28 + (130 - preview.height) // 2
                checker = Image.new("RGB", preview.size, (230, 230, 230))
                if preview.mode == "RGBA":
                    checker.paste(preview, mask=preview.getchannel("A"))
                    canvas.paste(checker, (px, py))
                else:
                    canvas.paste(preview.convert("RGB"), (px, py))
            except Exception as exc:
                draw.text((x + 10, y + 70), f"LOAD FAIL: {exc}", fill=(180, 0, 0), font=small_font)

            draw.text((x + 8, y + 6), f"#{review_id}", fill=(0, 0, 0), font=font)
            label = row["path"]
            if len(label) > 34:
                label = "..." + label[-31:]
            draw.text((x + 8, y + 164), label, fill=(20, 20, 20), font=small_font)
            draw.text((x + 8, y + 184), f"{row.get('category','')} / {row.get('text_type','')}", fill=(80, 80, 80), font=small_font)

        out = OUT_DIR / f"text_review_sheet_{sheet_index + 1:02d}.png"
        canvas.save(out)

    bad_csv = OUT_DIR / "bad_text_items.csv"
    if not bad_csv.exists():
        with bad_csv.open("w", encoding="utf-8-sig", newline="") as f:
            fieldnames = ["review_id", "text_type", "text_language", "text_action", "text_note"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerow({
                "review_id": "示例: 3",
                "text_type": "english/signage/watermark/fake_text/logo",
                "text_language": "en/zh/unknown",
                "text_action": "regenerate/paint_over/replace_with_label/keep",
                "text_note": "说明具体问题和修改要求",
            })

    print(f"Review items: {len(review_rows)}")
    print(f"Output: {OUT_DIR}")
    print(f"Open contact sheets: text_review_sheet_*.png")
    print(f"Fill only bad items in: {bad_csv.name}")


if __name__ == "__main__":
    main()
