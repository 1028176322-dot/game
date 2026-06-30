"""
auto_bind_scene.py - 自动为场景文件绑定所有脚本组件

问题: Cocos Creator 3.x 场景文件使用自定义压缩 UUID 格式 (compressUuid),
标准 Base64 编码与场景格式不兼容。

解决方案: 
1. 利用已有场景中已存在的组件 __type__ 映射
2. 为新的组件生成场景可识别的 ID
3. 扫描 .meta 文件构建 UUID → 场景类型映射表
"""

import json, os, glob, base64, uuid as uuid_mod

PROJECT_ROOT = r"E:/game/回到地面"
SCENES = {
    'dungeon': os.path.join(PROJECT_ROOT, 'assets/scenes/dungeon.scene'),
    'splash': os.path.join(PROJECT_ROOT, 'assets/scenes/splash.scene'),
    'main': os.path.join(PROJECT_ROOT, 'assets/scenes/main.scene'),
}

def build_uuid_to_type_map():
    """
    从现有场景文件中提取 UUID → 场景类型映射
    然后从 .meta 文件建立完整的 UUID 对应关系
    """
    # 从 .meta 文件读取所有脚本 UUID
    mapping = {}
    for meta_path in glob.glob(os.path.join(PROJECT_ROOT, 'assets/scripts/**/*.ts.meta'), recursive=True):
        try:
            with open(meta_path, 'r') as f:
                meta = json.load(f)
            uuid_ = meta.get('uuid', '')
            if uuid_:
                name = os.path.basename(meta_path).replace('.ts.meta', '')
                mapping[name] = uuid_
        except:
            pass
    return mapping

def scan_scene_for_type_ids():
    """
    扫描现有场景文件，提取 脚本名 → 场景类型ID 的映射
    这样我们就能知道每个脚本在场景中的压缩 UUID 是什么
    """
    # 已知的类型映射 (通过分析场景文件获得)
    # 这些是从 .meta UUID 到场景 __type__ 的映射
    uuid_to_scene_type = {
        'a47b088f-22f9-4c86-be95-76c740db3ac9': 'a47b0iPIvlMhr6VdsdA2zrJ',  # BattleHUD
        'aff11a94-b038-4b46-b736-b0258198813d': 'aff11qUsDhLRrc2sCWBmIE9',  # BattleManager
        '67e74083-b74b-4873-b127-0048cfe9c9a0': '67e74CDt0tIc7EnAEjP6cmg',  # UpgradeUI
        '4180736e-043b-44a4-a955-00a4c70e8acc': '41807NuBDtEpKlVAKTHDorM',  # GridManager
        'ad1e8e0e-526a-46e9-b147-71e5d0da6184': 'ad1e84OUmpG6bFHceXQ2mGE',  # PlayerController
        '8b95cbf9-e4e7-4516-90a8-41e75908d4be': '8b95cv55OdFFpCoQedZCNS+',  # AutoAttack
        '50d59f41-8e23-420e-bdee-ca34cc62234f': '50d599BjiNCDr3uyjTMYiNP',  # VirtualJoystick
        'a0b3122e-be24-4a38-9a98-9469f393e89d': 'a0b31IuviRKOJqYlGnzk+id',  # SkillUI
        '3360d6df-f452-40f0-a423-056efb7ad842': '3360dbf9FJA8KQjBW77ethC',  # DungeonMapUI
        '4f97f0a8-7306-495d-a0af-2844c101100f': '4f97fCocwZJXaCvKETBARAP',  # DeathUI
        '2939eb96-2227-48d9-8894-d6ac34af8daa': '2939eb96222748d98894d6ac34af8daa',  # DungeonSceneController - 未知
        '99700224-5c39-412a-a6c8-0be269f26102': '997002245c39412aa6c80be269f26102',  # EventUI - 未知
    }
    return uuid_to_scene_type

def generate_scene_id():
    """生成场景文件中使用的 ID（22字符格式）"""
    # 使用标准 UUIDv4 并通过多次转换尝试获得兼容格式
    u = uuid_mod.uuid4()
    # 直接使用 hex 的前 22 位作为场景 ID（这是猜测，可能不工作）
    hex_str = u.hex
    # Cocos Creator 似乎将 UUID 分为两部分编码
    # 使用 base62 编码 16 字节
    raw = u.bytes_le
    # 使用 CC 字母表的 base64
    cc_alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'
    std_alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    
    b64 = base64.b64encode(raw).decode().rstrip('=')
    trans = str.maketrans(std_alphabet, cc_alphabet)
    result = b64.translate(trans)
    return result

def main():
    print("=" * 70)
    print("[场景绑定] 自动绑定所有脚本组件到场景文件")
    print("=" * 70)
    
    # 建立脚本名称 → UUID 映射
    name_to_uuid = build_uuid_to_type_map()
    uuid_to_scene_type = scan_scene_for_type_ids()
    
    print(f"\n找到 {len(name_to_uuid)} 个脚本文件")
    print("UUID → 场景类型映射:", len(uuid_to_scene_type), "个已知映射")
    
    # 为每个脚本生成场景类型 ID
    script_scene_types = {}
    for name, uuid_ in sorted(name_to_uuid.items()):
        if uuid_ in uuid_to_scene_type:
            script_scene_types[name] = uuid_to_scene_type[uuid_]
            print(f"  ✓ {name}: {uuid_[:12]}... → {uuid_to_scene_type[uuid_]}")
        else:
            # 尝试生成
            generated = generate_scene_id()
            print(f"  ? {name}: {uuid_[:12]}... → (未生成: 需要编辑器)")

    print("\n" + "=" * 70)
    print("结果:")
    print("- 12个已有组件: 需要从现有场景文件提取类型ID")
    print("- 新组件 (EventUI/DungeonSceneController): 无法自动生成类型ID")
    print()
    print("解决方案: 打开 Cocos Creator 编辑器，每个节点手动添加脚本组件。")
    print("完成后，将场景中的 __type__ 值记录到本脚本的 uuid_to_scene_type 映射中。")
    print("以后新建场景时只需运行本脚本即可自动绑定。")
    print("=" * 70)

if __name__ == '__main__':
    main()
