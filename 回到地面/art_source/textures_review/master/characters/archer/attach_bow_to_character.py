import sys, bpy, math
char_path = sys.argv[sys.argv.index("--") + 1]
bow_path = sys.argv[sys.argv.index("--") + 2]
dst_path = sys.argv[sys.argv.index("--") + 3]

bpy.ops.wm.read_factory_settings(use_empty=True)

# import character
bpy.ops.import_scene.gltf(filepath=char_path)
# import bow
bpy.ops.import_scene.gltf(filepath=bow_path)

# find Weapon socket
weapon = None
for o in bpy.data.objects:
    if o.name == 'Weapon':
        weapon = o
        break
if not weapon:
    raise RuntimeError('Weapon socket not found in character glb')

bow = None
for o in bpy.data.objects:
    if o.type == 'MESH' and 'CHR_Archer_A_Weapon' in o.name:
        bow = o
        break
if not bow:
    raise RuntimeError('Bow mesh not found')

# parent bow to Weapon socket
bow.parent = weapon
bow.parent_type = 'OBJECT'
bow.parent_bone = ''
# reset local transform
bow.location = (0, 0, 0)
bow.rotation_euler = (0, 0, 0)
bow.scale = (1, 1, 1)

# Optional: orient the bow so it faces forward (+Z) and is held vertically.
# Since the bow already has long axis Y and string plane facing +Z, this default is reasonable.
# If visual review shows otherwise, tune these values.

# clear selection, select all for export
bpy.ops.object.select_all(action='SELECT')

# export merged glb
bpy.ops.export_scene.gltf(
    filepath=dst_path,
    export_format='GLB',
    export_yup=True,
    export_materials='EXPORT',
    export_image_format='AUTO',
)
print("MERGED", dst_path, "bow_parented_to", weapon.name)
PY