#!/usr/bin/env python3
"""
Write node hierarchies to main.scene and dungeon.scene
Based on the working base format (Canvas._layer=33554432, Camera._visibility=1822425087)
"""
import json, os

SCENES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'scenes')

# Read the editor-saved working splash.scene as template
with open(os.path.join(SCENES_DIR, 'splash.scene'), 'r', encoding='utf-8') as f:
    TEMPLATE = json.load(f)

def build_scene(name, child_builder):
    """Clone template, rename, and add custom children to Canvas."""
    scene = json.loads(json.dumps(TEMPLATE))
    scene[0]['_name'] = name
    scene[1]['_name'] = name
    
    # Canvas is at idx 7 (cc.Node)
    canvas_idx = 7
    canvas = scene[canvas_idx]
    
    # Remove SplashUI children from Canvas (keep indices 8+ removal)
    # Canvas children are: [8(SplashUI), 15(UITransform), 16(Canvas)]
    # We need to remove the SplashUI node and its descendants, then rebuild
    # Find where SceneGlobals starts (after Canvas components)
    globals_start = None
    for i, entry in enumerate(scene):
        if entry.get('__type__') == 'cc.SceneGlobals':
            globals_start = i
            break
    
    if globals_start:
        # Keep entries 0-7 (base), then add our nodes, then add globals back
        base_entries = scene[:8]  # SceneAsset + Scene + MainLight + DirLight + StaticLight + Camera + CameraNode → wait no
        # Actually, need to be more careful
        # Indices 0-7: SceneAsset(0), Scene(1), MainLight(2), DirLight(3), StaticLight(4), CameraNode(5), Camera(6), CanvasNode(7)
        # Canvas has components at later indices
        # Find the UITransform and Canvas component that belong to Canvas node
        canvas_children_indices = [c['__id__'] for c in canvas['_children']]
        canvas_component_indices = [c['__id__'] for c in canvas['_components']]
        
        # Remove all SplashUI children from Canvas
        canvas['_children'] = []
        canvas['_components'] = []
        
        # Re-add Canvas components
        canvas_uit = None
        canvas_comp = None
        for ci in canvas_component_indices:
            entry = scene[ci]
            if entry.get('__type__') == 'cc.UITransform':
                canvas_uit = entry.copy()
            elif entry.get('__type__') == 'cc.Canvas':
                canvas_comp = entry.copy()
        
        # Trim to base entries only (keep 0-7, remove everything after)
        scene = scene[:8]
    else:
        canvas_uit = None
        canvas_comp = None
        canvas['_children'] = []
        canvas['_components'] = []
    
    # Reset Canvas children
    canvas['_children'] = []
    canvas['_components'] = []
    
    # Build custom children
    child_builder(scene, canvas_idx)
    
    # Add UITransform and Canvas back to Canvas
    uit_idx = len(scene)
    scene.append({'__type__': 'cc.UITransform', '_name': '', '_objFlags': 0, 'node': {'__id__': canvas_idx}, '_enabled': True, '__prefab': None, '_contentSize': {'__type__': 'cc.Size', 'width': 1280, 'height': 720}, '_anchorPoint': {'__type__': 'cc.Vec2', 'x': 0.5, 'y': 0.5}, '_id': str(uit_idx)})
    canvas['_components'].append({'__id__': uit_idx})
    
    c_idx = len(scene)
    scene.append({'__type__': 'cc.Canvas', '_name': '', '_objFlags': 0, 'node': {'__id__': canvas_idx}, '_enabled': True, '__prefab': None, '_cameraComponent': {'__id__': 6}, '_alignCanvasWithScreen': True, '_id': str(c_idx)})
    canvas['_components'].append({'__id__': c_idx})
    
    return scene

def build_main_children(scene, canvas_idx):
    """Add MainUI → StartButton, MainSceneController"""
    main_ui = add_node(scene, canvas_idx, 'MainUI')
    add_node(scene, main_ui, 'StartButton')
    add_node(scene, main_ui, 'MainSceneController')

def build_dungeon_children(scene, canvas_idx):
    """Add DungeonSceneController and all 10 subsystems"""
    dsc = add_node(scene, canvas_idx, 'DungeonSceneController')
    
    subsystems = [
        'DungeonSceneController',  # script holder
        'GridManager',
        'Player',
        'VirtualJoystick',
        'BattleManager',
        'DungeonManager',
        'BattleHUD',
        'SkillUI',
        'DungeonMapUI',
        'UpgradeUI',
        'DeathUI',
    ]
    
    player_idx = None
    for name in subsystems:
        idx = add_node(scene, dsc, name)
        if name == 'Player':
            player_idx = idx
    
    # Add PlayerController and AutoAttack under Player
    if player_idx:
        add_node(scene, player_idx, 'PlayerController')
        add_node(scene, player_idx, 'AutoAttack')

def add_node(scene, parent_idx, name):
    idx = len(scene)
    node = {
        '__type__': 'cc.Node', '_name': name, '_objFlags': 0,
        '_parent': {'__id__': parent_idx}, '_children': [],
        '_active': True, '_components': [], '_prefab': None,
        '_lpos': {'__type__': 'cc.Vec3', 'x': 0, 'y': 0, 'z': 0},
        '_lrot': {'__type__': 'cc.Quat', 'x': 0, 'y': 0, 'z': 0, 'w': 1},
        '_lscale': {'__type__': 'cc.Vec3', 'x': 1, 'y': 1, 'z': 1},
        '_euler': {'__type__': 'cc.Vec3', 'x': 0, 'y': 0, 'z': 0},
        '_mobility': 0, '_layer': 1073741824,
        '_id': str(idx)
    }
    scene.append(node)
    scene[parent_idx]['_children'].append({'__id__': idx})
    return idx

def write_scene(filename, scene):
    path = os.path.join(SCENES_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(scene, f, ensure_ascii=False, indent=2)
    print(f'{filename}: {len(scene)} entries, {os.path.getsize(path)} bytes')

if __name__ == '__main__':
    main = build_scene('main', build_main_children)
    write_scene('main.scene', main)
    
    dungeon = build_scene('dungeon', build_dungeon_children)
    write_scene('dungeon.scene', dungeon)
    
    print('Done. Restart editor → manually add script components to nodes.')
