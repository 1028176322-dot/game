"""Phase 3 HD 资源生成器
读取审计清单，批量生成 S-grade replace 资源的高清版本
流程：AI 母版 → 缩放 → PNG 优化 → 放入 runtime_replace/ → 后续手动替换
"""
import os, sys, csv, json, time
from PIL import Image

AGNES_URL = "https://apihub.agnes-ai.com/v1/images/generations"
AGNES_KEY = "sk-zaluizuVOj0TVg6UbZjGDZnB4Cin2QaIoN0Vu6p5bGJpH2cw"
NT = "CRITICAL: ABSOLUTELY NO TEXT, NO WATERMARK, NO SIGNATURE, NO WRITING OF ANY KIND."

AUDIT_CSV = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"
OUT_DIR   = r"E:\game\回到地面\art_source\textures_export\runtime_replace"
PROGRESS  = r"E:\game\.workbuddy\phase3_progress.json"


def call_agnes(prompt):
    data = json.dumps({
        "model": "agnes-image-2.1-flash",
        "prompt": prompt + " " + NT,
        "n": 1,
        "size": "1024x1024"
    }).encode("utf-8")
    import urllib.request
    req = urllib.request.Request(AGNES_URL, data=data)
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {AGNES_KEY}")
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))["data"][0]["url"]


def download(url, path):
    import urllib.request
    with urllib.request.urlopen(url, timeout=120) as r:
        with open(path, "wb") as f:
            f.write(r.read())


def compress(src, dst, size, colors=64):
    img = Image.open(src)
    img = img.resize(size, Image.NEAREST)
    img = img.quantize(colors=min(colors, 256), method=Image.Quantize.MEDIANCUT)
    img = img.convert("RGBA")  # ensure no P mode
    img.save(dst, format="PNG", optimize=True)
    return os.path.getsize(dst)


def gen_one(prompt, dst_path, size, colors=64):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    raw = dst_path + ".raw"
    try:
        url = call_agnes(prompt)
        download(url, raw)
        sz = compress(raw, dst_path, size, colors)
        if os.path.exists(raw):
            os.remove(raw)
        return sz
    except Exception as e:
        if os.path.exists(raw):
            os.remove(raw)
        raise e


def build_prompt(row):
    """根据审计行构建 AI 提示词"""
    grade = row["grade"]
    action = row["action"]
    path = row["path"]
    fc = int(row["frame_count"])
    fw = int(row["frame_w"])
    fh = int(row["frame_h"])
    layout = row["layout"]
    category = row["category"]
    tw = int(row["target_w"])
    th = int(row["target_h"])
    note = row.get("note", "")

    # 从路径提取关键信息
    fname = os.path.basename(path)
    anim_name = fname.replace(".png", "").split("_")[-1] if fc > 1 else "idle"

    if path.startswith("characters"):
        cname = path.split("/")[1]
        char_names = {
            "warrior": "Silver-blue armored warrior with kite shield and broadsword, full plate armor with blue cape",
            "archer": "Green-brown ranger in leaf-patterned hooded cloak, carrying wooden longbow, quiver of arrows",
            "assassin": "Purple-black assassin in tight fitting shadow garb, face mask, dual daggers",
            "mage": "Blue-purple robed mage with pointed hat, tall wooden staff with glowing blue crystal orb",
            "berserker": "Red-skinned muscular berserker bare-chested with war paint, massive two-handed sword",
        }
        cdesc = char_names.get(cname, f"{cname} character")
        anim_desc = {
            "idle": "breathing idle",
            "walk": "walking forward",
            "attack": "weapon swing attack",
            "skill": "special skill with elemental effects",
            "dodge": "dodge roll",
            "hit": "take damage flashing",
            "death": "defeat animation fading away",
        }.get(anim_name, anim_name)

        if fc > 1:
            return (
                f"Generate a cartoon pixel-art game character sprite sheet. "
                f"Horizontal strip of {fc} frames side by side, total {tw}x{th} pixels. "
                f"Character: {cdesc}. Action: {anim_desc}. Side view, full body. "
                f"Each frame shows a distinct pose in the sequence. "
                f"Q版 cute cartoon pixel art, bright colors, transparent background."
            )
        else:
            return (
                f"Generate a cartoon pixel-art game character sprite, single frame. "
                f"{tw}x{th} pixels. Character: {cdesc}. Action: {anim_desc}. "
                f"Side view, full body. Q版 cute cartoon pixel art, bright colors, transparent background."
            )

    elif path.startswith("bosses"):
        bname = fname.replace(".png", "")
        is_mini = "miniboss" in path
        boss_type = "mini-boss" if is_mini else "final boss"
        return (
            f"Generate a cartoon pixel-art {boss_type} monster sprite. "
            f"{tw}x{th} pixels. "
            f"Impressive but cute cartoon pixel art style. "
            f"Transparent background."
        )

    elif path.startswith("monsters"):
        zone = path.split("/")[1]
        return (
            f"Generate a cute cartoon pixel-art monster sprite, single frame. "
            f"{tw}x{th} pixels. "
            f"Fantasy monster from the {zone} region. "
            f"Q版 cute cartoon pixel art, bright colors, transparent background."
        )

    elif path.startswith("ui"):
        return (
            f"Generate a cartoon pixel-art game UI element. "
            f"{tw}x{th} pixels. "
            f"Game UI icon or panel element. "
            f"Clean, readable, bright cartoon pixel art. "
            f"Transparent background."
        )

    else:
        return (
            f"Generate a cartoon pixel-art game asset. "
            f"{tw}x{th} pixels. "
            f"Cartoon pixel art style, transparent background."
        )


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # 加载进度
    prog = {"current_index": 0, "generated": {}, "batch": 0}
    if os.path.exists(PROGRESS):
        with open(PROGRESS) as f:
            prog = json.load(f)

    # 读取审计清单
    items = []
    with open(AUDIT_CSV, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["grade"] == "S" and row["action"] == "replace":
                items.append(row)

    total = len(items)
    print(f"S-grade replace 资源: {total} 个")

    start = prog.get("current_index", 0)
    if start >= total:
        print("所有资源已完成!")
        return

    for i, row in enumerate(items[start:], start=start):
        rel_path = row["path"]
        key = rel_path.replace("\\", "/")

        if key in prog["generated"]:
            print(f"  [skip] {key}")
            continue

        tw = int(row["target_w"])
        th = int(row["target_h"])

        out_path = os.path.join(OUT_DIR, key.replace("/", os.sep))

        prompt = build_prompt(row)
        print(f"\n  [{i+1}/{total}] {key} -> {tw}x{th} ...")
        sys.stdout.flush()

        try:
            sz = gen_one(prompt, out_path, (tw, th), 32 if "monster" in key or "icon" in key else 64)
            print(f"  [OK] {sz//1024}KB")
            prog["generated"][key] = sz
            prog["current_index"] = i + 1
            with open(PROGRESS, "w") as f:
                json.dump(prog, f, indent=2)
        except Exception as e:
            print(f"  [FAIL] {key}: {e}")
            # 保存进度后退出，下次重试
            prog["current_index"] = i
            with open(PROGRESS, "w") as f:
                json.dump(prog, f, indent=2)
            sys.exit(1)

    # 全部完成
    prog["current_index"] = total
    with open(PROGRESS, "w") as f:
        json.dump(prog, f, indent=2)
    print(f"\n全部 {total} 个 S-grade replace 资源完成!")


if __name__ == "__main__":
    main()
