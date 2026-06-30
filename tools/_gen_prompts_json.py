"""Pre-populate prompts.json with current prompts from gen_missing_179.py"""
import os, sys, json, csv

# Import gen_missing_179
sys.path.insert(0, r"E:\game\tools")
import importlib.util
spec = importlib.util.spec_from_file_location("gen_missing_179", r"E:\game\tools\gen_missing_179.py")
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)

MANIFEST_CSV = r"E:\game\回到地面\art_source\textures_audit_manifest.csv"
OUTPUT_JSON  = r"E:\game\assets\resources\config\prompts.json"

# Read manifest
with open(MANIFEST_CSV, encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))

print(f"Manifest: {len(rows)} rows")

# Build item dicts and generate prompts
prompts = {}
for row in rows:
    path = row["path"].replace("\\", "/").removeprefix("textures/")
    cat = row.get("category", "")
    
    # Build item dict that build_prompt expects
    item = {
        "path": path,
        "category": cat,
        "final_target_w": row.get("target_w", row.get("frame_w", "256")),
        "final_target_h": row.get("target_h", row.get("frame_h", "256")),
        "csv_frame_h": row.get("frame_h", ""),
        "has_alpha": row.get("has_alpha", "True"),
        "action": row.get("action", ""),
    }
    
    try:
        prompt = gen.build_prompt(item)
        prompts[path] = prompt
    except Exception as e:
        prompts[path] = f"[ERROR: {e}]"
        print(f"  WARN: {path} -> {e}")

# Write
os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)

print(f"\n已生成 {OUTPUT_JSON}")
print(f"条目数: {len(prompts)}")

# Show sample
boss_entries = [k for k in prompts.keys() if "finalboss" in k and "attack" in k]
if boss_entries:
    print(f"\n样例 (finalboss attack 第一条):")
    print(f"  key: {boss_entries[0]}")
    print(f"  prompt: {prompts[boss_entries[0]][:200]}...")
