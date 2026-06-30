import csv, os

r = open('E:/game/回到地面/art_source/runtime_replace_recovery/runtime_replace_missing_production_spec.csv', encoding='utf-8-sig')
reader = csv.DictReader(r)
all_rows = []
for row in reader:
    all_rows.append(row)
r.close()

# Check all unique categories
cats = set()
for row in all_rows:
    cats.add(row.get('category',''))
print('Categories:', cats)
print()

# Count miniboss entries
minis = [r for r in all_rows if 'miniboss' in r.get('path','').lower()]
print('Miniboss entries:', len(minis))

# Check all boss-related paths (finalboss OR miniboss)
boss_paths = [r.get('path','') for r in all_rows if r.get('category','') == 'bosses']
print('Boss category entries:', len(boss_paths))

# Check paths with miniboss/finalboss
fb_paths = [r.get('path','') for r in all_rows if 'finalboss' in r.get('path','').lower()]
mb_paths = [r.get('path','') for r in all_rows if 'miniboss' in r.get('path','').lower()]
print('Path containing "finalboss":', len(fb_paths))
print('Path containing "miniboss":', len(mb_paths))

# What about the existing miniboss files on disk?
import os as _os
mb_dir = 'E:/game/回到地面/art_source/textures_export/runtime_replace/bosses/miniboss'
existing_mb = []
for root, dirs, files in _os.walk(mb_dir):
    for f in files:
        if f.endswith('.png') and not f.endswith('.meta'):
            existing_mb.append(f)
print()
print('Existing miniboss PNGs on disk:', len(existing_mb))
for f in sorted(existing_mb):
    print('  ', f)
