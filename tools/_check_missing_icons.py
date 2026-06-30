import json, os, csv

repo_root = 'E:/game/回到地面/art_source/textures_export/runtime_replace'

# Get all icon paths from manifest
manifest_paths = set()
with open('E:/game/回到地面/art_source/textures_audit_manifest.csv', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        if row.get('category','') == 'icons':
            p = row['path'].replace('\\', '/')
            manifest_paths.add(p)

# Check which are missing from disk
missing = []
for p in sorted(manifest_paths):
    full = os.path.join(repo_root, p)
    if not os.path.exists(full):
        missing.append(p)

print('Manifest icons: %d' % len(manifest_paths))
print('Missing from disk: %d' % len(missing))
for p in missing:
    print(' ', p)
