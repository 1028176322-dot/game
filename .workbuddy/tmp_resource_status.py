import json, os

BASE = r'E:\game'
PROJECT = BASE + r'\回到地面'

prompts_path = BASE + r'\assets\resources\config\prompts.json'
dim_path = BASE + r'\assets\resources\config\prompts_dim.json'
progress_path = PROJECT + r'\art_source\textures_review\art_pipeline_progress.json'
master_base_2d = PROJECT + r'\art_source\textures_review\master'
runtime_base_2d = PROJECT + r'\assets\resources\textures'
# 3D bases (Phase 0 of 3D upgrade; dirs may not exist yet)
master_base_3d = PROJECT + r'\art_source\models_review\master'
runtime_base_3d = PROJECT + r'\assets\resources\models'

with open(prompts_path, 'r', encoding='utf-8') as f:
    prompts = json.load(f)

dim_of = {}
if os.path.isfile(dim_path):
    with open(dim_path, 'r', encoding='utf-8') as f:
        dim_doc = json.load(f)
    dim_of = dim_doc.get('map', {})

try:
    with open(progress_path, 'r', encoding='utf-8') as f:
        progress = json.load(f)
except FileNotFoundError:
    progress = {'resources': {}}

cat_names = {
    'monsters': 'Monsters', 'icons': 'Icons', 'tiles': 'Tiles',
    'backgrounds': 'Backgrounds', 'characters': 'Characters',
    'bosses': 'Bosses', 'ui': 'UI', 'effects': 'Effects'
}

from datetime import datetime

def fmt_time(ts):
    if ts is None or ts == 0:
        return '-'
    return datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M')

def rel_path(abspath):
    return os.path.relpath(abspath, PROJECT).replace(os.sep, '/')

def dim_for(k):
    if k in dim_of:
        return dim_of[k]
    return '2d' if k.split('/')[0] in ('ui', 'icons', 'backgrounds') else '3d'

all_resources = sorted(prompts.keys())

# Overview
lines = ['# 美术资源状态总表']
lines.append('')
lines.append(f'> **⚠️ 本项目资源进度追踪的唯一权威来源**')
lines.append(f'> 定义见 `ART_RESOURCE_RULES.md` §14.4。其他文档/脚本/内存文件不得重复维护逐资源进度信息。')
lines.append(f'>')
lines.append(f'> 生成时间：{datetime.now().strftime("%Y-%m-%d %H:%M")}')
lines.append(f'> 数据来源：`prompts.json` / `prompts_dim.json` / `art_pipeline_progress.json` / 文件系统')
lines.append(f'> 维度说明：3D 类别(characters/monsters/bosses/effects/tiles)走 3D 管线；2D 保留类别(ui/icons/backgrounds)走 2D 管线。')
lines.append('')
lines.append('## 总览')
lines.append('')
lines.append('| 类别 | 维度 | 总数 | 母版存在 | 已生成(走完pipeline) | 入库(runtime有文件) | 人工确认 |')
lines.append('|------|:----:|:---:|:--------:|:-------------------:|:------------------:|:--------:|')

by_cat = {}
for k in all_resources:
    cat = k.split('/')[0]
    by_cat.setdefault(cat, [])
    by_cat[cat].append(k)

for cat in cat_names:
    items = by_cat.get(cat, [])
    total = len(items)
    master_exist = 0; generated = 0; runtime_exist = 0
    for k in items:
        d = dim_for(k)
        mb = master_base_3d if d == '3d' else master_base_2d
        rb = runtime_base_3d if d == '3d' else runtime_base_2d
        rp = os.path.join(rb, k).replace(os.sep, '/')
        mp = os.path.join(mb, k).replace(os.sep, '/')
        if not os.path.isfile(mp):
            base, ext = os.path.splitext(mp)
            mp_png = base + '.png'
            if os.path.isfile(mp_png):
                mp = mp_png
                master_exist += 1
            else:
                mp = None
        else:
            master_exist += 1
        if d == '3d':
            rp_prefab = os.path.join(rb.replace('models', 'prefabs'), k).replace(os.sep, '/')
            if os.path.isfile(rp) or os.path.isfile(rp_prefab):
                runtime_exist += 1
        else:
            if os.path.isfile(rp):
                runtime_exist += 1
        if k in progress.get('resources', {}):
            st = progress['resources'][k].get('status', '')
            if st in ('done', 'generated', 'validated', 'failed', 'imported'):
                generated += 1
    cn = cat_names.get(cat, cat)
    dim_label = '3D' if any(dim_for(x) == '3d' for x in items) else '2D'
    lines.append(f'| {cn} | {dim_label} | {total} | {master_exist} | {generated} | {runtime_exist} | 0 |')

lines.append('')
lines.append('---')
lines.append('')

# Detail per category
for cat in cat_names:
    items = by_cat.get(cat, [])
    if not items: continue
    cn = cat_names.get(cat, cat)
    lines.append(f'## {cn}（{len(items)}个）')
    lines.append('')
    lines.append('| 资源名 | 维度 | 母版路径 | 母版状态 | 生成时间 | 生命周期 | 版本 | 入库路径 | 入库状态 | 入库时间 |')
    lines.append('|--------|:----:|---------|:--------:|:--------:|:--------:|:----:|---------|:--------:|:--------:|')
    for k in items:
        d = dim_for(k)
        mb = master_base_3d if d == '3d' else master_base_2d
        rb = runtime_base_3d if d == '3d' else runtime_base_2d
        mp = os.path.join(mb, k).replace(os.sep, '/')
        rp = os.path.join(rb, k).replace(os.sep, '/')

        if not os.path.isfile(mp):
            base, ext = os.path.splitext(mp)
            mp_png = base + '.png'
            if os.path.isfile(mp_png):
                mp = mp_png

        if os.path.isfile(mp):
            master_ctime = os.path.getmtime(mp)
            master_exists = True
        else:
            master_ctime = None
            master_exists = False

        if d == '3d':
            rp_prefab = os.path.join(rb.replace('models', 'prefabs'), k).replace(os.sep, '/')
            if os.path.isfile(rp):
                runtime_ctime = os.path.getmtime(rp); runtime_exists = True; rp_used = rp
            elif os.path.isfile(rp_prefab):
                runtime_ctime = os.path.getmtime(rp_prefab); runtime_exists = True; rp_used = rp_prefab
            else:
                runtime_ctime = None; runtime_exists = False; rp_used = None
        else:
            if os.path.isfile(rp):
                runtime_ctime = os.path.getmtime(rp); runtime_exists = True; rp_used = rp
            else:
                runtime_ctime = None; runtime_exists = False; rp_used = None

        if runtime_exists and master_exists and master_ctime and runtime_ctime:
            if abs(runtime_ctime - master_ctime) < 3600:
                runtime_status = '✅ 新版已入库'
            elif runtime_ctime < master_ctime:
                runtime_status = '⚠️ 旧版待替换'
            else:
                runtime_status = '已入库(版本一致)'
        elif runtime_exists:
            runtime_status = '已入库(未知版本)'
        else:
            runtime_status = '❌ 未入库'

        pg = progress.get('resources', {}).get(k, {})
        pg_status = pg.get('status', '')
        if pg_status == 'validated': gen_status = '✅ validated'
        elif pg_status == 'done': gen_status = '✅ done'
        elif pg_status == 'imported': gen_status = '✅ imported'
        elif pg_status == 'failed': gen_status = '❌ failed'
        elif pg_status == 'pending': gen_status = '⏳ pending'
        elif pg_status == '': gen_status = '未走pipeline'
        elif pg_status == 'generated': gen_status = '🔄 generated'
        elif pg_status == 'prompting': gen_status = '⏳ prompting'
        else: gen_status = pg_status

        lifecycle = pg.get('lifecycle', '-')
        version = pg.get('version', '-')

        master_path = rel_path(mp) if master_exists else '-'
        runtime_path = rel_path(rp_used) if runtime_exists else '-'

        lines.append(f'| {k} | {d.upper()} | {master_path} | {gen_status} | {fmt_time(master_ctime)} | {lifecycle} | {version} | {runtime_path} | {runtime_status} | {fmt_time(runtime_ctime)} |')
    lines.append('')

output_path = PROJECT + r'\docs\progress\resource_status.md'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print(f'已更新 {output_path}')
print(f'共 {sum(len(v) for v in by_cat.values())} 个资源')
