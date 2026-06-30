import csv, os

r = open('E:/game/回到地面/art_source/runtime_replace_recovery/runtime_replace_missing_production_spec.csv', encoding='utf-8-sig')
reader = csv.DictReader(r)
bosses = []
for row in reader:
    cat = row.get('category','')
    if cat == 'bosses':
        p = row.get('path','')
        fw = row.get('final_target_w','?')
        fh = row.get('final_target_h','?')
        sz = row.get('target_size_kb','?')
        st = row.get('status','')
        bosses.append((p, fw, fh, sz, st))
r.close()
print('bosses entries:', len(bosses))
print()
for p, fw, fh, sz, st in bosses:
    fname = os.path.basename(p.replace('\\', '/'))
    print('  path="%s"  fname="%s"  size=%sKB  %sx%s  status=%s' % (p, fname, sz, fw, fh, st))
