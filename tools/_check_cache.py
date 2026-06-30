import json
with open(r'E:\game\tools\used_by_cache.json') as f:
    data = json.load(f)
print(f'Entries: {len(data)}')
samples = list(data.items())[:3]
for k, v in samples:
    ub = v.get("used_by", "?")
    rc = v.get("reference_count", 0)
    so = v.get("scene_or_ui", "?")
    print(f'{k}: used_by={ub}, refs={rc}, scene={so}')
found = sum(1 for v in data.values() if v.get("used_by") and v["used_by"] != "unknown")
unknown = sum(1 for v in data.values() if not v.get("used_by") or v["used_by"] == "unknown")
print(f"\nFound: {found}, Unknown: {unknown}")
