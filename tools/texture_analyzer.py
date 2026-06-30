#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import csv, json, os, re

BASE_DIR = "E:/game/回到地面"
CSV_PATH = os.path.join(BASE_DIR, "art_source", "textures_audit_manifest.csv")
SCRIPTS_DIR = os.path.join(BASE_DIR, "assets", "scripts")
SCENES_DIR = os.path.join(BASE_DIR, "assets", "scenes")
TEXTURES_META_DIR = os.path.join(BASE_DIR, "assets", "resources", "textures")
OUTPUT_PATH = "E:/game/tools/used_by_cache.json"

COMMON_WORDS = {"walk","idle","attack","death","hit","skill","dodge","fire","ice",
    "shadow","burn","freeze","poison","shield","speed","light","map","set","key",
    "dash","heal","slow","stun","dark","wall","floor","water","wind","earth","room",
    "shop","boss","rare","epic","line","dot","bg","fx","hp","hud","icon","ui","btn",
    "splash","main","logo","coin","slot","panel","frame","base","node","common",
    "equip","item","upgrade","chest","ring","shoes","weapon","gloves","helmet","legs",
    "necklace","active","default","hover","close","list","scroll","bomb","potion",
    "buff","debuff","element","relic","ability","arrow","bar","glow","mask","roll",
    "path","thorn","highground","lowground"}

SCENE_FILES = [os.path.join(SCENES_DIR, x) for x in ["dungeon.scene","main.scene","splash.scene"]]

def read_manifest(csv_path):
    textures = []
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            path = row.get("path", "").strip()
            if not path: continue
            basename = os.path.splitext(os.path.basename(path))[0]
            textures.append({"filename": basename, "path": path, "png_name": os.path.basename(path)})
    return textures

def collect_ts_files(scripts_dir):
    ts_files = []
    for root, dirs, files in os.walk(scripts_dir):
        for f in files:
            if f.endswith(".ts"): ts_files.append(os.path.join(root, f))
    return sorted(ts_files)

def build_uuid_map(textures_meta_dir):
    uuid_map = {}
    for root, dirs, files in os.walk(textures_meta_dir):
        for f in files:
            if not f.endswith(".png.meta"): continue
            meta_path = os.path.join(root, f)
            try:
                with open(meta_path, "r", encoding="utf-8") as mf:
                    meta_data = json.load(mf)
                png_name = f.replace(".png.meta", "")
                main_uuid = meta_data.get("uuid", "")
                if main_uuid:
                    uuid_map[main_uuid] = {"texture_name": png_name, "png_name": png_name+".png"}
                for sk, sv in meta_data.get("subMetas", {}).items():
                    sub_uuid = sv.get("uuid", "")
                    if sub_uuid:
                        uuid_map[sub_uuid] = {"texture_name": sv.get("displayName", png_name), "png_name": png_name+".png"}
            except: pass
    return uuid_map

def is_common_word(name):
    return name.lower() in COMMON_WORDS

def search_ts(texture_name, texture_path, ts_files):
    results = []
    for ts_file in ts_files:
        count = 0
        try:
            with open(ts_file, "r", encoding="utf-8") as f:
                content = f.read()
            rel = os.path.relpath(ts_file, SCRIPTS_DIR).replace("\\", "/")
            if not is_common_word(texture_name):
                count += len(re.findall(re.escape(texture_name), content))
            else:
                tp = texture_path.replace("\\", "/")
                if tp in content: count += content.count(tp)
            frp = "textures/" + texture_path.replace(".png", "")
            if frp in content: count += content.count(frp)
            parts = texture_path.split("/")
            for i in range(len(parts)-1):
                if len(parts[i]) > 2:
                    pat = "/" + parts[i] + "/"
                    if pat in content: count += content.count(pat)
            if count > 0: results.append((rel, count))
        except: pass
    return results

def search_uuid(uuid, scene_files):
    results = []
    uc = uuid.split("@")[0]
    for sf in scene_files:
        sn = os.path.basename(sf).replace(".scene", "")
        try:
            with open(sf, "r", encoding="utf-8") as f:
                content = f.read()
            c = content.count(uc)
            if c > 0: results.append((sn, c))
        except: pass
    return results

def determine(texture_path, texture_name, ts_refs, scene_refs):
    for sn,_ in scene_refs: return sn
    for tf,_ in ts_refs:
        tl = tf.lower()
        if "dungeonscenecontroller" in tl: return "dungeon"
        if "mainscenecontroller" in tl or "mainui" in tl: return "main"
        if "splash" in tl: return "splash"
        if "battlehud" in tl: return "battle"
        if "dungeonmap" in tl: return "map"
        if "deathui" in tl: return "death"
        if "shop" in tl: return "shop"
        if "equipment" in tl or "inventory" in tl: return "equipment"
        if "upgrade" in tl: return "upgrade"
        if "skill" in tl: return "skill"
        if "event" in tl: return "event"
    pl = (texture_path + texture_name).lower()
    if "backgrounds/" in pl: return "background"
    if "bosses/" in pl or "monsters/" in pl or "characters/" in pl: return "battle"
    if "tiles/" in pl: return "dungeon"
    if "ui/" in pl: return "ui_panel"
    if "icons/" in pl: return "icons"
    if "effects/" in pl: return "effects"
    return "unknown"

def main():
    print("="*60)
    print("[1/5] Reading manifest CSV ...")
    textures = read_manifest(CSV_PATH)
    print(f"  -> {len(textures)} textures")
    print("[2/5] TS files ...")
    ts_files = collect_ts_files(SCRIPTS_DIR)
    print(f"  -> {len(ts_files)} files")
    print("[3/5] UUID map ...")
    uuid_map = build_uuid_map(TEXTURES_META_DIR)
    print(f"  -> {len(uuid_map)} entries")
    print("[4/5] Searching ...")
    result = {}; found = 0; not_found = 0
    for i, tex in enumerate(textures):
        pn = tex["png_name"]; tn = tex["filename"]; tp = tex["path"]
        if (i+1)%50==0: print(f"  {i+1}/{len(textures)}")
        ts_refs = search_ts(tn, tp, ts_files)
        scene_refs = []
        for uid, info in uuid_map.items():
            if info["png_name"] == pn:
                scene_refs.extend(search_uuid(uid, SCENE_FILES))
        for sf in SCENE_FILES:
            sn = os.path.basename(sf).replace(".scene","")
            try:
                with open(sf,"r",encoding="utf-8") as f: content = f.read()
                if tn in content:
                    if not any(s[0]==sn for s in scene_refs):
                        scene_refs.append((sn, content.count(tn)))
            except: pass
        total = sum(c for _,c in ts_refs) + sum(c for _,c in scene_refs)
        used_by = "unknown"; mc = 0
        for rf,rc in ts_refs:
            if rc > mc: mc,used_by = rc,rf
        for sn,sc in scene_refs:
            if sc > mc: mc,used_by = sc,"scenes/"+sn+".scene"
        suo = determine(tp, tn, ts_refs, scene_refs)
        if total > 0: found += 1
        else: not_found += 1
        result[pn] = {"used_by": used_by, "reference_count": total, "scene_or_ui": suo}
    print("[5/5] Writing ...")
    import os as _os
    _os.makedirs(_os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    total_n = len(textures)
    print(f"\nTotal: {total_n}, Found: {found}, Not found: {not_found}")
    print(f"Not found ratio: {not_found/total_n*100:.1f}%")

if __name__ == "__main__":
    main()
