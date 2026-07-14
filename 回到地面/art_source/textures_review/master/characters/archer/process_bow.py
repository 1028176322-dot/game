import sys, bpy, math, os
src = sys.argv[sys.argv.index("--") + 1]
dst = sys.argv[sys.argv.index("--") + 2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

mesh = next(o for o in bpy.data.objects if o.type == 'MESH')

# rename
mesh.name = 'CHR_Archer_A_Weapon'
mesh.data.name = 'CHR_Archer_A_Weapon_Mesh'

# 1. decimate (0.04 => ~800 tris from 20k)
mod = mesh.modifiers.new('Decimate', 'DECIMATE')
mod.ratio = 0.04
bpy.context.view_layer.objects.active = mesh
bpy.ops.object.modifier_apply(modifier='Decimate')

# 2. re-center origin to the grip center (middle of bounding box along Z)
#    Current bow long axis is Z. We keep origin at the geometric center first,
#    then after reorientation we'll place origin at grip center.
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# 3. rotate: long axis (Z) -> Y (vertical), thickness (Y) -> Z (front/back)
#    Rotate around X by -90 degrees
mesh.rotation_euler = (math.radians(-90), 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# 4. Now the bow is vertical (Y). Move origin to grip center (mid Y).
#    Grip center is at half of Y extent. We shift geometry so grip center is at (0,0,0).
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
vs = [v.co for v in mesh.data.vertices]
ys = [v.y for v in vs]
min_y, max_y = min(ys), max(ys)
grip_y = (min_y + max_y) / 2.0
# move geometry so grip_y is at origin
for v in mesh.data.vertices:
    v.co.y -= grip_y
# also update object location
mesh.location = (0, 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# 5. resize textures to 512x512
for img in bpy.data.images:
    if img.size[0] > 512 or img.size[1] > 512:
        img.scale(512, 512)
        print("RESIZED_TEXTURE", img.name, img.size[0], img.size[1])

# 6. export glb
bpy.ops.export_scene.gltf(
    filepath=dst,
    export_format='GLB',
    export_yup=True,
    export_materials='EXPORT',
    export_image_format='AUTO',
)
print("EXPORTED_WEAPON", dst, "tri", sum(len(p.vertices) - 2 for p in mesh.data.polygons))
PY