"""Phase 6: 特效 AI 生成 (5 个关键特效)"""
import os, sys, csv, json
from PIL import Image

AGNES_URL = "https://apihub.agnes-ai.com/v1/images/generations"
AGNES_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
NT = "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND."

AUDIT_CSV  = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"
REPLACE_DIR = r"E:\game\回到地面\art_source\textures_export\runtime_replace"
TEXTURES   = r"E:\game\回到地面\assets\resources\textures"
PROGRESS   = r"E:\game\.workbuddy\phase6_progress.json"


def call_agnes(prompt):
    import urllib.request
    data = json.dumps({"model": "agnes-image-2.1-flash", "prompt": prompt + " " + NT, "n": 1, "size": "1024x1024"}).encode("utf-8")
    req = urllib.request.Request(AGNES_URL, data=data)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {AGNES_KEY}")
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))["data"][0]["url"]


def download(url, path):
    import urllib.request
    with urllib.request.urlopen(url, timeout=120) as r:
        with open(path, "wb") as f: f.write(r.read())


def gen_one(prompt, dst_path, size):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    raw = dst_path + ".raw"
    try:
        url = call_agnes(prompt)
        download(url, raw)
        img = Image.open(raw)
        img = img.resize(size, Image.NEAREST)
        img = img.convert("RGBA")
        img.save(dst_path, format="PNG", optimize=True)
        if os.path.exists(raw): os.remove(raw)
        return os.path.getsize(dst_path)
    except Exception as e:
        if os.path.exists(raw): os.remove(raw)
        raise e


def main():
    prog = {"generated": {}}
    if os.path.exists(PROGRESS):
        with open(PROGRESS) as f: prog = json.load(f)

    items = []
    with open(AUDIT_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            if row["grade"] == "B" and row["action"] == "replace":
                items.append(row)

    total = len(items)
    print(f"特效 replace: {total} 个\n")

    for i, row in enumerate(items):
        rel = row["path"]
        key = rel.replace("\\", "/")
        if key in prog["generated"]:
            print(f"  [skip] {rel}")
            continue

        tw, th = int(row["target_w"]), int(row["target_h"])
        fname = os.path.basename(rel).replace(".png", "")
        
        fx_names = {
            "fx_hit_normal": "white hit spark flash effect sprite sheet, 4 frames",
            "fx_crit": "red-orange critical hit explosion effect sprite sheet, 6 frames, larger burst",
            "fx_dash": "white dash motion trail effect sprite sheet, 4 frames",
            "fx_heal": "green healing sparkle aura effect sprite sheet, 6 frames",
            "fx_shield": "gold energy shield impact effect sprite sheet, 6 frames",
        }
        desc = fx_names.get(fname, f"pixel art game effect {fname}")

        prompt = (
            f"Generate a pixel-art game effect sprite sheet. "
            f"Total {tw}x{th} pixels. {desc}. "
            f"Transparent background. Semi-transparent glowing particle style. "
        )

        out = os.path.join(TEXTURES, rel.replace("/", os.sep))
        print(f"  [{i+1}/{total}] {rel} -> {tw}x{th} ...", end=" ", flush=True)

        try:
            sz = gen_one(prompt, out, (tw, th))
            print(f"{sz//1024}KB")
            prog["generated"][key] = sz
            with open(PROGRESS, "w") as f: json.dump(prog, f, indent=2)
        except Exception as e:
            print(f"FAIL: {e}")
            with open(PROGRESS, "w") as f: json.dump(prog, f, indent=2)
            sys.exit(1)

    print(f"\n✅ 全部 {total} 个特效已生成并替换!")


if __name__ == "__main__":
    main()
