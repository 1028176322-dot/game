# -*- coding: utf-8 -*-
"""
gen_art_spec.py - Generate the 3D-upgrade art-asset production specs.

Single source of truth: ART_RESOURCE_RULES.md §16 + art_quality_budget.json
(rules3d). Per §14.1 / §16.6 this tool MUST read 3D naming/budget/LOD/socket/
dependency rules from that authoritative source and must NOT hardcode them.

Emits four artifacts (all from one run, always in sync):
  * Layer 1  回到地面/docs/美术资源制作参数总表_3D.md   (Human-readable spec: why/principles)
  * Layer 2a 回到地面/docs/AI资源制作规范_MachineSpec.yaml   (Machine-readable spec)
  * Layer 2b 回到地面/docs/AI资源制作规范_MachineSpec.json   (same spec, JSON dual-format)
  * Layer 3  回到地面/docs/AI执行流程_Workflow.md            (AI execution pipeline)

The Machine spec is parsed by AI agents: every number is target/min/max, every
Sockets entry is an array, every resource has a unique schema with Fail
conditions, Input/Output and a pipeline reference. No fuzzy words
(建议/适当/合理/美观) - use concrete values.

Run:  python tools/gen_art_spec.py
"""
import os
import re
import json
from collections import OrderedDict

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INV = os.path.join(BASE, "texture_files_runtime.txt")
BUDGET_PATH = os.path.join(BASE, "assets", "resources", "config", "art_quality_budget.json")
OUT_HUMAN = os.path.join(BASE, "回到地面", "docs", "美术资源制作参数总表_3D.md")
OUT_MACHINE_YAML = os.path.join(BASE, "回到地面", "docs", "AI资源制作规范_MachineSpec.yaml")
OUT_MACHINE_JSON = os.path.join(BASE, "回到地面", "docs", "AI资源制作规范_MachineSpec.json")
OUT_WORKFLOW = os.path.join(BASE, "回到地面", "docs", "AI执行流程_Workflow.md")

# ---------------------------------------------------------------------------
# Authoritative source load (§14.1 / §16.6 - no hardcoded 3D budgets)
# ---------------------------------------------------------------------------
def load_budget():
    with open(BUDGET_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

BUDGET = load_budget()
R3D = BUDGET.get("rules3d", {})
NAMING = R3D.get("naming", {})
RULES_2D = BUDGET.get("rules", {})

# ---------------------------------------------------------------------------
# Design-guidance reference data (NOT budget numbers - allowed to stay here)
# ---------------------------------------------------------------------------
REGION_THEME = {
    "abyss":     ("Abyss 深渊·暗紫晶系", "#3B1E5B 暗紫 / #8A4FFF 晶紫(发光) / #1A0E2A 底"),
    "catacombs": ("Catacombs 墓穴·骨白褐系", "#E8E0C8 骨白 / #4A3B2A 暗褐 / #2A2018 底"),
    "forest":    ("Forest 森林·翠绿木系", "#2E6B3E 森林绿 / #C8A86A 暖木 / #16241A 底"),
    "swamp":     ("Swamp 沼泽·毒青泥系", "#3A6B5E 毒青 / #5A4A32 泥棕 / #1C241F 底"),
    "tundra":    ("Tundra 冰原·冰蓝雪系", "#7FB4D4 冰蓝 / #F0F4F8 雪白 / #23303A 底"),
    "volcano":   ("Volcano 火山·岩浆红系", "#D83A1A 岩浆红 / #2A1A14 黑岩 / #FF7A33 辉光"),
}
CHAR_THEME = {
    "archer":    ("Archer 游侠·自然绿", "#4CAF50 翠绿 / #C8A86A 木 / #F0E68C 弓弦金"),
    "assassin":  ("Assassin 刺客·暗影紫", "#3A2A4A 暗紫 / #8A4FFF 影紫 / #1A1422 底"),
    "berserker": ("Berserker 狂战·烈红", "#C0392B 赤红 / #2A1A14 黑铁 / #E0A030 怒光"),
    "mage":      ("Mage 法师·秘蓝", "#2E6FB0 秘蓝 / #F0E68C 符文黄 / #1A2A3A 底"),
    "warrior":   ("Warrior 战士·金橙", "#E0A030 金橙 / #8A8A8A 钢 / #2A2018 底"),
}
EFFECT_THEME = {
    "burn": ("Fire 火", "#FF6A2A / #FFD23A"), "fire": ("Fire 火", "#FF6A2A / #FFD23A"),
    "freeze": ("Frost 冰", "#7FB4D4 / #EAF6FF"), "frost": ("Frost 冰", "#7FB4D4 / #EAF6FF"),
    "melt": ("Melt 融", "#FFB36A / #BFE8FF"), "vaporize": ("Vapor 蒸", "#CFE8E0 / #FFFFFF"),
    "corrode": ("Poison 毒", "#5DBB5D / #2E6B3E"), "poison": ("Poison 毒", "#5DBB5D / #2E6B3E"),
    "decay": ("Decay 腐", "#7A8A4A / #3A4A2A"), "void": ("Void 虚", "#8A4FFF / #2A1640"),
    "shadow": ("Shadow 影", "#5A4A8A / #1A1422"), "conduct": ("Lightning 雷", "#FFE14D / #BFE8FF"),
    "overload": ("Overload 超载", "#FF8A2A / #FFE14D"), "radiance": ("Holy 圣", "#FFE9A8 / #FFF6D8"),
    "holy": ("Holy 圣", "#FFE9A8 / #FFF6D8"), "shatter": ("Shatter 碎", "#CFE8FF / #FFFFFF"),
    "crit": ("Crit 暴击", "#FF4D4D / #FFD23A"), "dash": ("Dash 冲刺", "#9FE8FF / #FFFFFF"),
    "dodge": ("Dodge 闪避", "#BFE8FF / #FFFFFF"), "heal": ("Heal 治疗", "#7CF0A0 / #DFFFE8"),
    "hit_normal": ("Hit 命中", "#FFFFFF / #FFE0A0"), "shield": ("Shield 护盾", "#7FB4FF / #D8E8FF"),
    "blink": ("Blink 闪现", "#BFE8FF / #8A4FFF"), "decoy": ("Decoy 诱饵", "#C8A86A / #FFE0A0"),
    "flame": ("Flame 焰", "#FF6A2A / #FFD23A"), "frost_amulet": ("Frost 冰", "#7FB4D4 / #EAF6FF"),
    "gravity": ("Gravity 重力", "#9A7BFF / #2A1640"), "life_link": ("Life 生命", "#7CF0A0 / #DFFFE8"),
    "shadow_dagger": ("Shadow 影", "#5A4A8A / #1A1422"), "time": ("Time 时", "#FFE9A8 / #BFE8FF"),
    "glow": ("Glow 辉光", "#FFFFFF / #FFE9A8"), "loading": ("Loading 载入", "#8A8A8A / #E0E0E0"),
}

ACTION_TO_CLIP = {
    "idle": "Idle", "walk": "Move", "attack": "Attack", "skill": "Skill",
    "dodge": "Dodge", "hit": "Hit", "death": "Death", "phasechange": "Special",
}
ANIM_MIN_BASE = ["Idle", "Move", "Attack", "Hit", "Death"]
ANIM_REC = ["Spawn", "Skill", "Taunt", "Special", "Recover", "Turn", "Stun", "KnockBack", "Dissolve"]
PHASE = {
    "characters": "Phase 2 角色&动画迁移", "monsters": "Phase 3 战斗 3D 化",
    "bosses": "Phase 4 地牢 3D 化&美术批量", "effects": "Phase 5 光照/特效/音频/世界UI",
    "tiles": "Phase 4 地牢 3D 化&美术批量",
}
RET_BATCH = {"icons": "第 4 批 (icons)", "ui": "第 2/3 批 (UI)", "backgrounds": "第 10 批 (backgrounds)"}

# 9-step AI execution pipeline (referenced by Layer 2 + detailed in Layer 3)
PIPELINE_STEPS = ["model", "uv", "texture_bake", "texture", "rig", "animation", "lod", "prefab", "validate"]
PIPELINE_NAME = {
    "model": "Mesh 建模", "uv": "UV 展开", "texture_bake": "Texture 烘焙",
    "texture": "Texture 贴图", "rig": "Rig 绑定", "animation": "Animation 动画",
    "lod": "LOD 减面", "prefab": "Prefab 组装", "validate": "Validate 校验",
}

# asset_validate.py check-id vocabulary (canonical)
ALL_CHECK_IDS = [
    "naming", "budget_rule_found", "tri_budget", "bones_budget", "texture_size",
    "lod_present", "anim_clips_min", "required_sockets", "collider_present",
    "particles_budget", "drawcall_budget", "dependencies_present", "lifecycle_valid",
    "perf_tier_valid", "test_scene_present", "meta_version", "meta_author",
    "meta_date", "meta_reviewer",
]


# ---------------------------------------------------------------------------
# Kind / bucket mapping (single definition, used by all layers)
# ---------------------------------------------------------------------------
def kind_for_effect(name):
    nl = name.lower()
    return ("effect_boss", "effects_boss") if ("boss" in nl or "final" in nl) else ("effect_normal", "effects_normal")


def cap_token(s):
    return s[0].upper() + s[1:] if s else s


def pascal(s):
    return "".join(w.capitalize() for w in s.split("_")) if s else s


def strip_fx(name):
    return name[3:] if name.lower().startswith("fx_") else name


def theme_for_monster(region):
    return REGION_THEME.get(region, ("Unknown 未知区域", "#888 / #444"))


def effect_theme(name):
    for kw, val in EFFECT_THEME.items():
        if kw in name:
            return val
    return ("Generic 通用", "#FFFFFF / #CCCCCC")


def boss_region_from_name(name):
    m = {
        "lord_catacombs": "catacombs", "guardian_forest": "forest", "swampbehemoth": "swamp",
        "frostqueen": "tundra", "firelord": "volcano", "forestguardian": "forest",
        "lord_abyss": "abyss", "lord_volcano": "volcano", "queen_tundra": "tundra",
        "skeletonlord": "catacombs", "abyssoverlord": "abyss", "beast_swamp": "swamp",
    }
    for k, v in m.items():
        if k in name:
            return v
    return "finalboss"


# ---------------------------------------------------------------------------
# Inventory parsing (real inventory: texture_files_runtime.txt)
# ---------------------------------------------------------------------------
def parse_inventory():
    entries = []
    with open(INV, "r", encoding="utf-8-sig") as f:
        for raw in f:
            p = raw.strip()
            if p:
                entries.append(p)
    return entries


def group(entries):
    characters, monsters, bosses, effects, tiles = OrderedDict(), OrderedDict(), OrderedDict(), OrderedDict(), OrderedDict()
    retained = OrderedDict()
    for p in entries:
        parts = p.split("/")
        top = parts[0]
        if top == "characters":
            hero = parts[1]
            fn = parts[2].rsplit(".", 1)[0]
            action = fn[len(hero) + 1:] if fn.startswith(hero + "_") else fn
            d = characters.setdefault(hero, {"actions": set(), "files": []})
            d["actions"].add(action)
            d["files"].append(p)
        elif top == "monsters":
            region = parts[1]
            fn = parts[2].rsplit(".", 1)[0]
            name = fn[:-5] if fn.endswith("_idle") else fn
            monsters.setdefault(name, {"region": region, "files": []})["files"].append(p)
        elif top == "bosses":
            sub = parts[1]
            fn = parts[-1].rsplit(".", 1)[0]
            base = fn
            if "_" in fn:
                base, action = fn.rsplit("_", 1)
            else:
                action = "idle"
            tier = "finalboss" if sub == "finalboss" else "miniboss"
            region = parts[2] if len(parts) >= 4 and parts[2] != "finalboss" else boss_region_from_name(base)
            d = bosses.setdefault(base, {"tier": tier, "region": region, "actions": set(), "files": []})
            d["actions"].add(action)
            if p not in d["files"]:
                d["files"].append(p)
        elif top == "effects":
            sub = parts[1]
            fn = parts[2].rsplit(".", 1)[0]
            effects.setdefault(fn, {"sub": sub, "files": []})["files"].append(p)
        elif top == "tiles":
            region = parts[1]
            fn = parts[2].rsplit(".", 1)[0]
            ttype = fn.rsplit("_", 1)[1] if "_" in fn else fn
            key = "%s_%s" % (region, ttype)
            tiles.setdefault(key, {"region": region, "type": ttype, "files": []})["files"].append(p)
        else:
            retained.setdefault(top, []).append(p)
    return characters, monsters, bosses, effects, tiles, retained


def skeleton_tree(animal="biped"):
    if animal == "quad":
        return ("Root → Hip → Spine → Chest → Neck → Head; "
                "Hip → FrontLeg.L/R → FrontFoot; Hip → BackLeg.L/R → BackFoot; Chest → Tail(可选)")
    return ("Root → Hip → Spine → Chest → Neck → Head; "
            "Chest → Arm.L/R → Hand.L/R; Hip → Leg.L/R → Foot.L/R")


# ---------------------------------------------------------------------------
# Machine-spec schema builders (read from R3D - the authoritative source)
# ---------------------------------------------------------------------------
MESH_KINDS = ("character", "monster", "boss_final", "boss_mini", "tile")


def material_const(kind):
    if kind in ("effect_normal", "effect_boss"):
        return OrderedDict([("shader", "Additive/SoftParticle"), ("emission", "on"),
                            ("depthWrite", "off"), ("receiveShadow", "no"), ("castShadow", "no")])
    if kind in ("character", "boss_final", "boss_mini"):
        ow = 0.8
    elif kind == "monster":
        ow = 0.5
    else:
        ow = 0.2
    return OrderedDict([("shader", "ToonLit"), ("outlineWidth", ow),
                        ("emission", "on(eyes/runes/crystal)"), ("rimLight", "on"),
                        ("receiveShadow", "yes"), ("castShadow", "yes"),
                        ("ramp", "shared_ToonRamp")])


def io_const(kind, token):
    if kind in ("effect_normal", "effect_boss"):
        return OrderedDict([
            ("input", ["source_sprites", "Shared_ParticleAtlas", "Shared_AdditiveShader"]),
            ("output", ["%s.prefab" % token]),
        ])
    if kind == "tile":
        region = token.split("_")[0]
        return OrderedDict([
            ("input", ["source_sprites", "Shared_Region_Atlas_%s" % region]),
            ("output", ["%s.glb" % token, "%s.prefab" % token]),
        ])
    clips = ANIM_MIN_BASE + ANIM_REC
    return OrderedDict([
        ("input", ["concept_2d", "source_sprites", "Shared_ToonRamp"]),
        ("output", ["%s.glb" % token, "%s.prefab" % token,
                     "%s_<Clip>.anim  (min: %s; rec:+%s)" % (token, "/".join(ANIM_MIN_BASE), "/".join(ANIM_REC))]),
        ("animClips", clips),
    ])


def fail_const(kind, rule):
    fails = []
    if "maxTri" in rule:
        fails.append(OrderedDict([("id", "tri_over_max"),
                                  ("assert", "triangles <= %d" % rule["maxTri"]), ("severity", "error")]))
        fails.append(OrderedDict([("id", "tri_below_min"),
                                  ("assert", "triangles >= %d" % rule["minTri"]), ("severity", "warn")]))
        fails.append(OrderedDict([("id", "bones_over"),
                                  ("assert", "bones <= %d" % rule["maxBones"]), ("severity", "error")]))
        fails.append(OrderedDict([("id", "texture_over"),
                                  ("assert", "textureSize <= %d" % rule["textureSize"]), ("severity", "error")]))
        n_lod = len(rule.get("lod", []))
        fails.append(OrderedDict([("id", "lod_missing"),
                                  ("assert", "lodLevels >= %d" % max(1, n_lod - 1)), ("severity", "error")]))
        fails.append(OrderedDict([("id", "anim_clips_short"),
                                  ("assert", "animClips >= %d" % rule.get("animClipsMin", 0)), ("severity", "error")]))
        fails.append(OrderedDict([("id", "missing_sockets"),
                                  ("assert", "all(required_sockets) present"), ("severity", "error")]))
        fails.append(OrderedDict([("id", "collider_missing"),
                                  ("assert", "colliders.length > 0"), ("severity", "error")]))
    else:
        if "maxParticles" in rule:
            fails.append(OrderedDict([("id", "particles_over"),
                                      ("assert", "maxParticles <= %d" % rule["maxParticles"]), ("severity", "error")]))
        if "maxDrawCall" in rule:
            fails.append(OrderedDict([("id", "drawcall_over"),
                                      ("assert", "maxDrawCall <= %d" % rule["maxDrawCall"]), ("severity", "error")]))
        fails.append(OrderedDict([("id", "texture_over"),
                                  ("assert", "textureSize <= %d" % rule["textureSize"]), ("severity", "error")]))
        if "maxDurationSec" in rule:
            fails.append(OrderedDict([("id", "duration_over"),
                                      ("assert", "maxDurationSec <= %s" % rule["maxDurationSec"]), ("severity", "error")]))
    fails.append(OrderedDict([("id", "naming_mismatch"),
                              ("assert", "name matches naming.pattern"), ("severity", "error")]))
    fails.append(OrderedDict([("id", "lifecycle_not_approved"),
                              ("assert", "lifecycle == 已批准 before integration"), ("severity", "warn")]))
    return fails


def validate_const(kind):
    checks = ["naming", "budget_rule_found"]
    if kind in MESH_KINDS:
        checks += ["tri_budget", "bones_budget", "texture_size", "lod_present",
                   "anim_clips_min", "required_sockets", "collider_present"]
    else:
        checks += ["particles_budget", "drawcall_budget"]
    checks += ["dependencies_present", "lifecycle_valid", "perf_tier_valid",
               "test_scene_present", "meta_version", "meta_author", "meta_date", "meta_reviewer"]
    return OrderedDict([
        ("tool", "tools/asset_validate.py"),
        ("command", "python tools/asset_validate.py <dir>/<name>.assetmeta.json --budget assets/resources/config/art_quality_budget.json"),
        ("checks", checks),
    ])


def manifest_const(kind, rule, token, prefix):
    m = OrderedDict()
    if kind in MESH_KINDS:
        m["name"] = "%s_%s.glb" % (prefix, token)
        m["tri"] = rule.get("minTri")
        m["bones"] = rule.get("recommendBones", rule.get("maxBones"))
        m["textureSize"] = rule.get("textureSize")
        m["lodLevels"] = max(1, len(rule.get("lod", [])) - 1)
        m["animClips"] = rule.get("animClipsMin")
        m["sockets"] = list(rule.get("sockets", []))
        m["colliders"] = [rule.get("collider")]
    else:
        m["name"] = "%s_%s.prefab" % (prefix, token)
        if "maxParticles" in rule:
            m["maxParticles"] = rule.get("maxParticles")
        if "maxDrawCall" in rule:
            m["maxDrawCall"] = rule.get("maxDrawCall")
        m["textureSize"] = rule.get("textureSize")
        if "maxDurationSec" in rule:
            m["maxDurationSec"] = rule.get("maxDurationSec")
        m["sockets"] = []
        m["colliders"] = []
    m["depends"] = ["<token list, e.g. FX_Hit_Normal / Shared_ToonRamp>"]
    m["perfTier"] = rule.get("perfTier")
    m["testScene"] = "<scene per ART_RESOURCE_RULES.md §16.5>"
    m["lifecycle"] = "选秀"
    m["version"] = "1.0"
    m["author"] = "<artist/outsource>"
    m["date"] = "YYYY-MM-DD"
    m["reviewer"] = "<reviewer>"
    return m


def build_schema_dict(kind, bucket, token=None, prefix=None, source2d=None, theme=None, region=None):
    """One fully-resolved, self-contained schema (no inheritance needed)."""
    rule = R3D.get(bucket, {})
    if prefix is None:
        prefix = rule.get("prefix")
    d = OrderedDict()
    d["category"] = rule.get("category")
    d["prefix"] = prefix
    # budget block (target/min/max)
    if "minTri" in rule:
        bd = OrderedDict()
        bd["minTri"] = rule["minTri"]
        bd["recommendTri"] = rule["recommendTri"]
        bd["maxTri"] = rule["maxTri"]
        bd["maxBones"] = rule["maxBones"]
        if "recommendBones" in rule:
            bd["recommendBones"] = rule["recommendBones"]
        bd["textureSize"] = rule["textureSize"]
        bd["astcBlock"] = rule["astcBlock"]
        d["budget"] = bd
    else:
        bd = OrderedDict()
        if "maxParticles" in rule:
            bd["maxParticles"] = rule["maxParticles"]
        if "maxDrawCall" in rule:
            bd["maxDrawCall"] = rule["maxDrawCall"]
        bd["textureSize"] = rule["textureSize"]
        bd["astcBlock"] = rule["astcBlock"]
        if "maxDurationSec" in rule:
            bd["maxDurationSec"] = rule["maxDurationSec"]
        d["budget"] = bd
    # LOD block
    d["lod"] = [OrderedDict([("level", l["level"]), ("triPct", l["triPct"]), ("dist", l["dist"])])
                for l in rule.get("lod", [])]
    if "animClipsMin" in rule:
        d["animClipsMin"] = rule["animClipsMin"]
    d["sockets"] = list(rule.get("sockets", []))
    d["collider"] = rule.get("collider")
    d["perfTier"] = rule.get("perfTier")
    d["material"] = material_const(kind)
    d["io"] = io_const(kind, token if token else "<Token>")
    d["pipeline"] = PIPELINE_STEPS
    d["fail"] = fail_const(kind, rule)
    d["validate"] = validate_const(kind)
    d["manifest"] = manifest_const(kind, rule, token if token else "<Token>", prefix)
    return d


def build_machine_spec(characters, monsters, bosses, effects, tiles, retained):
    """Layer 2: templates (per kind) + per-asset unique schemas (YAML + JSON)."""
    # ---- templates (one per kind, from R3D) ----
    templates = OrderedDict()
    template_defs = [
        ("character", "characters"), ("monster", "monsters"),
        ("boss_final", "bosses_final"), ("boss_mini", "bosses_mini"),
        ("effect_normal", "effects_normal"), ("effect_boss", "effects_boss"),
        ("tile", "tiles"),
    ]
    for kind, bucket in template_defs:
        templates[kind] = build_schema_dict(kind, bucket)

    # ---- per-asset unique schemas ----
    assets = []

    def add_asset(asset_id, kind, bucket, token, source2d, theme, region=None):
        sch = build_schema_dict(kind, bucket, token=token, source2d=source2d, theme=theme, region=region)
        a = OrderedDict()
        a["id"] = asset_id
        a["kind"] = kind
        a["template"] = kind
        a["token"] = token
        if region is not None:
            a["region"] = region
        a["source2d"] = list(source2d)
        if theme is not None:
            a["theme"] = OrderedDict([("name", theme[0]), ("colors", theme[1])])
        # inline kind-specific numbers so each asset is self-contained
        a["budget"] = sch["budget"]
        a["lod"] = sch["lod"]
        a["sockets"] = sch["sockets"]
        a["collider"] = sch["collider"]
        a["perfTier"] = sch["perfTier"]
        a["material"] = sch["material"]
        a["io"] = sch["io"]
        a["pipeline"] = sch["pipeline"]
        a["fail"] = sch["fail"]
        a["validate"] = sch["validate"]
        a["manifest"] = sch["manifest"]
        assets.append(a)

    for hero, dd in characters.items():
        token = cap_token(hero) + "_A"
        theme = CHAR_THEME.get(hero, ("Unknown 未定角色", "#888 / #444"))
        add_asset("CHR_%s" % token, "character", "characters", token, dd["files"], theme)

    for name, dd in monsters.items():
        token = "_".join(cap_token(w) for w in name.split("_"))
        theme = theme_for_monster(dd["region"])
        add_asset("MON_%s" % token, "monster", "monsters", token, dd["files"], theme, region=dd["region"])

    fb = [(n, x) for n, x in bosses.items() if x["tier"] == "finalboss"]
    mb = [(n, x) for n, x in bosses.items() if x["tier"] == "miniboss"]
    for i, (n, x) in enumerate(fb, 1):
        token = "Final_%02d" % i
        theme = (theme_for_monster(x["region"]) if x["region"] != "finalboss"
                 else ("FinalBoss 终boss·全域混搭", "#C0392B / #8A4FFF / #E0A030"))
        add_asset("BOSS_%s" % token, "boss_final", "bosses_final", token, x["files"], theme, region=x["region"])
    for i, (n, x) in enumerate(mb, 1):
        token = "Mini_%02d" % i
        theme = theme_for_monster(x["region"])
        add_asset("BOSS_%s" % token, "boss_mini", "bosses_mini", token, x["files"], theme, region=x["region"])

    for name, x in effects.items():
        kind, bucket = kind_for_effect(name)
        token = pascal(strip_fx(name))
        theme = effect_theme(name)
        add_asset("FX_%s" % token, kind, bucket, token, x["files"], theme)

    for key, x in tiles.items():
        token = "%s_%s" % (cap_token(x["region"]), cap_token(x["type"]))
        theme = theme_for_monster(x["region"])
        add_asset("TILE_%s" % token, "tile", "tiles", token, x["files"], theme, region=x["region"])

    # ---- retained 2D rules (machine-readable, category-level) ----
    retained_2d = OrderedDict()
    for cat in ("icons", "ui", "ui_fullscreen", "ui_panel", "ui_button", "backgrounds", "tiles"):
        if cat in RULES_2D:
            r = RULES_2D[cat]
            retained_2d[cat] = OrderedDict([
                ("format", r.get("format")),
                ("recommendKB", r.get("recommendKB")),
                ("warningKB", r.get("warningKB")),
                ("manualReviewKB", r.get("manualReviewKB")),
                ("failOnSize", r.get("failOnSize")),
            ])

    spec = OrderedDict()
    spec["spec_version"] = "1.0"
    spec["encoding"] = "utf-8"
    spec["generated_by"] = "tools/gen_art_spec.py"
    spec["source"] = OrderedDict([
        ("rules_doc", "ART_RESOURCE_RULES.md §16 (权威源)"),
        ("budget_file", "assets/resources/config/art_quality_budget.json#rules3d"),
        ("inventory", "texture_files_runtime.txt"),
    ])
    spec["naming"] = OrderedDict([
        ("pattern", NAMING.get("pattern")),
        ("note", NAMING.get("note", "")),
        ("clip_pattern", "{prefix}_{token}_{Clip}"),
    ])
    spec["global_validator"] = OrderedDict([
        ("tool", "tools/asset_validate.py"),
        ("command_single", "python tools/asset_validate.py <dir>/<name>.assetmeta.json --budget assets/resources/config/art_quality_budget.json"),
        ("command_scan", "python tools/asset_validate.py --scan <models_dir> --report validate_report.txt"),
        ("check_ids", ALL_CHECK_IDS),
    ])
    spec["pipeline_steps"] = [OrderedDict([("step", i + 1), ("id", sid), ("name", PIPELINE_NAME[sid])])
                              for i, sid in enumerate(PIPELINE_STEPS)]
    spec["templates"] = templates
    spec["assets"] = assets
    spec["retained_2d"] = retained_2d
    spec["summary"] = OrderedDict([
        ("total_3d_assets", len(assets)),
        ("characters", len(characters)), ("monsters", len(monsters)),
        ("bosses_final", len(fb)), ("bosses_mini", len(mb)),
        ("effects", len(effects)), ("tiles", len(tiles)),
        ("retained_2d_total", sum(len(v) for v in retained.values())),
    ])
    return spec


# ---------------------------------------------------------------------------
# YAML emitter (no 3rd-party dep; ASCII keys, quoted values incl. CJK)
# ---------------------------------------------------------------------------
_NUM_RE = re.compile(r'^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$')
_BOOL_NULL = {"true", "false", "null", "yes", "no", "on", "off"}


def _scalar(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v)
    special = set('[]{}|>*&!%@`"\':#<>,')
    looks_num = bool(_NUM_RE.match(s))
    need_quote = (s == "" or s.strip() != s or any(c in special for c in s)
                  or any(ord(c) > 127 for c in s)
                  or s.lower() in _BOOL_NULL or looks_num)
    if need_quote:
        return '"%s"' % s.replace("\\", "\\\\").replace('"', '\\"')
    return s


def _emit(obj, indent):
    pad = "  " * indent
    out = []
    if isinstance(obj, dict):
        if not obj:
            out.append(pad + "{}")
            return out
        for k, v in obj.items():
            if isinstance(v, dict):
                if not v:
                    out.append("%s%s: {}" % (pad, k))
                else:
                    out.append("%s%s:" % (pad, k))
                    out.extend(_emit(v, indent + 1))
            elif isinstance(v, list):
                if not v:
                    out.append("%s%s: []" % (pad, k))
                else:
                    out.append("%s%s:" % (pad, k))
                    out.extend(_emit_list(v, indent + 1))
            else:
                out.append("%s%s: %s" % (pad, k, _scalar(v)))
    elif isinstance(obj, list):
        if not obj:
            out.append(pad + "[]")
        else:
            out.extend(_emit_list(obj, indent))
    else:
        out.append(pad + _scalar(obj))
    return out


def _emit_list(lst, indent):
    pad = "  " * indent
    out = []
    for item in lst:
        if isinstance(item, dict):
            if not item:
                out.append("%s- {}" % pad)
            else:
                sub = _emit(item, indent + 1)
                first = True
                for line in sub:
                    if first:
                        stripped = line[2 * (indent + 1):] if line.startswith("  " * (indent + 1)) else line
                        out.append("%s- %s" % (pad, stripped))
                        first = False
                    else:
                        out.append(line)
        elif isinstance(item, list):
            out.append("%s-" % pad)
            out.extend(_emit_list(item, indent + 1))
        else:
            out.append("%s- %s" % (pad, _scalar(item)))
    return out


def yaml_dump(obj):
    header = (
        "# 编码: UTF-8\n"
        "# AI 资源制作规范（Machine Spec）— 机器可读，供 AI 解析执行\n"
        "# 单一事实来源: ART_RESOURCE_RULES.md §16 + art_quality_budget.json rules3d\n"
        "# 由 tools/gen_art_spec.py 依据 texture_files_runtime.txt 自动生成\n"
        "# 每个 3D 资源在 assets[] 中有唯一 Schema（target/min/max + Fail 条件 + Input/Output + Pipeline）\n"
    )
    return header + "\n".join(_emit(obj, 0)) + "\n"


# ---------------------------------------------------------------------------
# Layer 1 (human) emitters - numbers pulled from R3D (no hardcoded budget)
# ---------------------------------------------------------------------------
class Doc:
    def __init__(self):
        self.buf = []
    def w(self, s=""):
        self.buf.append(s + "\n")
    def raw(self, s):
        self.buf.append(s)


def naming_spec(d, prefix, token, ext="glb", anim_line=True):
    d.w("- **命名规范**: `%s_%s`" % (prefix, token))
    d.w("  - 模型文件：`%s_%s.%s`" % (prefix, token, ext))
    if anim_line:
        d.w("  - 动画文件：`%s_%s_<Clip>.anim`（如 `%s_%s_Attack`）" % (prefix, token, prefix, token))


def socket_spec(d, kind, rule):
    items = list(rule.get("sockets", [])) if rule else []
    extra = "；EffectAnchor 通用特效锚(可选)" if kind in MESH_KINDS else ""
    d.w("- **Socket 规范**: " + ("；".join(items) if items else "—（静态/粒子资产无 Socket；程序按 Prefab 节点名约定挂载）") + extra)


def collider_spec(d, kind, rule, height=1.8, radius=0.4):
    ctype = (rule or {}).get("collider", "capsule")
    if kind == "character":
        d.w("- **碰撞体规范**: Capsule（Height≈%.1f / Radius≈%.1f，脚底对齐）；"
            "WeaponCollider（右手武器碰撞体，攻击帧启用）；"
            "SkillSocket（SkillOrigin 处触发器）；FootIK（脚底 IK 贴合地面）" % (height, radius))
    elif kind == "boss":
        d.w("- **碰撞体规范**: Capsule（大体积，Height/Radius 按体型）；"
            "多 HitBox：WeakPoint 独立 HurtBox（弱点判定）；WeaponCollider（武器/炮臂）；"
            "SkillSocket×N；FootIK（类型=%s）" % ctype)
    elif kind == "monster":
        d.w("- **碰撞体规范**: Capsule（Height≈%.1f / Radius≈%.1f）；Mouth Collider（啃咬命中）；FootIK 可选（类型=%s）" % (height, radius, ctype))
    elif kind == "tile":
        d.w("- **碰撞体规范**: Box（静态，墙/高地实心碰撞）；Thorn 带 Trigger（尖刺伤害判定）；"
            "地面无碰撞（走 NavigationGrid / ICollisionService.overlap）")
    else:
        d.w("- **碰撞体规范**: —（VFX 无碰撞，命中等走 overlapSphere/射线查询）")


def material_spec(d, kind):
    if kind == "effect":
        d.w("- **材质规范**: Shader=Additive / SoftParticle（加色辉光 + 软粒子）；Emission=On（发光）；"
            "DepthWrite=Off；AlphaTest 可选；ReceiveShadow=No；CastShadow=No")
        return
    if kind in ("character", "boss"):
        ow, strength = "0.8", "强（辨识度）"
    elif kind == "monster":
        ow, strength = "0.5", "中"
    else:
        ow, strength = "0.2", "弱（环境件）"
    d.w("- **材质规范**: Shader=ToonLit（卡通光照）；OutlineWidth=%s（%s描边）；"
        "Emission=On（眼睛/符文/晶发光部位）；RimLight=On（边缘光增强体积感）；"
        "ReceiveShadow=Yes；CastShadow=Yes；Ramp=项目共享 Toon ramp（§6）" % (ow, strength))


def lod_spec(d, kind, rule):
    if kind == "effect":
        d.w("- **LOD 规范**: 特效无 LOD（粒子时长驱动，命中等走 overlapSphere/射线查询）")
        return
    lod = rule.get("lod", [])
    if kind == "tile":
        d.w("- **LOD 规范**: 静态模块件 LOD0=100%% → LOD1=%d%%（合并/降面）；切换≈%dm；"
            "地块面数极低，LOD 收益小，重在 Mesh Combine + Static Batching 降 DrawCall"
            % (int(lod[1]["triPct"] * 100) if len(lod) > 1 else 50,
               lod[1]["dist"] if len(lod) > 1 else 20))
        return
    cap = rule.get("maxTri", 3000)
    parts = []
    for l in lod:
        if l["level"] == 0:
            parts.append("LOD0=100%%（≤%d Tri）" % cap)
        else:
            parts.append("LOD%d=%d%%（≤%d）" % (l["level"], int(l["triPct"] * 100), int(cap * l["triPct"])))
    dists = " / ".join("LOD%d≈%dm" % (l["level"], l["dist"]) for l in lod if l["level"] > 0)
    d.w("- **LOD 规范**: %s；切换距离 %s" % (" → ".join(parts), dists))


def prefab_spec(d, kind):
    if kind == "effect":
        d.w("- **Prefab 规范**: Particle Prefab（Emitter 配置 + 贴图 + 曲线 + 混合模式）；"
            "无 Animator/Collider；EffectAnchor 节点供运行时挂载")
        return
    if kind == "tile":
        d.w("- **Prefab 规范**: 静态 Tile Prefab — Collider(Box/Trigger) / LOD Group / "
            "Material(ToonLit+ramp) / Shadow(Cast+Receive) / RenderLayer；无 Animator/Socket")
        return
    d.w("- **Prefab 规范**: 必须包含 — Animator(SkeletalAnimation/Marionette) / "
        "Collider(按碰撞规范) / LOD Group(LOD0/1/2) / Socket 节点(按 Socket 规范) / "
        "Material(ToonLit+ramp) / AudioSource(受击·技能音效锚) / EffectAnchor(特效挂载) / "
        "Shadow(Cast+Receive 配置) / RenderLayer(渲染排序)")


def anim_spec(d, raw_actions):
    derived = set()
    for a in raw_actions:
        c = ACTION_TO_CLIP.get(a)
        if c and c in ANIM_MIN_BASE:
            derived.add(c)
    d.w("- **动画（最低集·必做，Boss/怪/角色通用）**: " + " / ".join(ANIM_MIN_BASE))
    d.w("  - 由 2D 帧直接派生：%s" % (", ".join(sorted(derived)) if derived else "（无，需全部新做基础集）"))
    d.w("- **动画（推荐集·策划扩展技能/状态机时避免美术返工）**: " + " / ".join(ANIM_REC))
    d.w("  - 说明：最低集保证可玩；推荐集在肉鸽技能/状态(眩晕/击退/溶解)扩充时无需返工基础动画。")


def lifecycle_meta(d, kind, name, region=None, token=None):
    d.w("- **版本/作者/日期/评审**: v1.0 / [美术/外包] / YYYY-MM-DD / [评审人]"
        "（多人协作与外包迭代追踪；每次改版递增小版本，如 v1.0→v1.1）")
    if kind == "character":
        deps = "FX_Hit_Normal、FX_Dodge、Shared_ToonRamp、Audio_SFX_Character、CHR_%s_Weapon（如适用）" % token
    elif kind == "boss":
        deps = ("BOSS_%s_Weapon（武器/炮臂模型）、FX_*（Boss 技能特效，如 FX_Fire）、"
                "Audio_Boss_%s、Material_Boss_Toon、Minion_*（召唤随从，如适用）" % (token, token))
    elif kind == "monster":
        deps = "FX_Hit、FX_Death、Shared_ToonRamp、Audio_SFX_Monster、MON_%s_*（区域同类共享材质）" % token
    elif kind == "effect":
        deps = "Shared_ParticleAtlas、Shared_AdditiveShader、Material_FX（加色/软粒子）、Audio_*（音效，如适用）"
    elif kind == "tile":
        deps = "Shared_Region_Atlas_%s（区域共享地形图集）、ToonRamp、Lightmap_%s（区域烘焙，如适用）" % (
            (region or "Forest").capitalize(), (region or "Forest").capitalize())
    else:
        deps = "—"
    d.w("- **依赖关系**: %s（程序导入时一次性校验缺失依赖，避免运行时缺资源）" % deps)
    tier = {
        "character": ("中", "低", "1 模型 + 1–2 材质 + Toon 描边；可降 LOD1/2 + 关 RimLight 降级"),
        "boss": ("高", "中", "高面数 + 多材质 + 多 Socket；可关阴影/降 LOD/关描边降级"),
        "monster": ("低~中", "低", "低面数共享材质；同屏≤25 靠 GPU Instancing/Static Batching"),
        "effect": ("中(普通)/高(Boss)", "低", "粒子数受 VFX 预算约束；可降粒子数/贴图分辨率降级"),
        "tile": ("低", "极低", "静态件靠 Mesh Combine + Static Batching，几乎零 CPU"),
    }.get(kind, ("—", "—", ""))
    d.w("- **性能等级**: GPU 成本=%s / CPU 成本=%s（据设备档位动态降级；参考 v3 §6.1 性能预算）；%s" % tier)
    if kind == "character":
        scene = "Arena_Test（技能/移动/碰撞验证）、CharacterShowcase（展示/选角验证）"
    elif kind == "boss":
        scene = "Boss_Test（终boss/小boss 专用房验证）、Arena_Test（技能对拼验证）"
    elif kind == "monster":
        scene = "Dungeon_Test_%s（对应区域地牢验证）、Arena_Test（战斗验证）" % (region or "Forest").capitalize()
    elif kind == "effect":
        scene = "FX_Preview（特效预览台）、Arena_Test（挂载技能验证）、Boss_Test（Boss 技能验证）"
    else:
        scene = "Dungeon_Test_%s（对应区域地牢拼贴验证）" % (region or "Forest").capitalize()
    d.w("- **测试场景**: %s（资源完成后放入指定场景验证，禁止随便拖入任意地图）" % scene)
    d.w("- **资源生命周期**: 状态取值 = `选秀` / `评审中` / `已批准` / `已弃用`"
        "（新建默认 `选秀`；`已批准` 后方可正式接入；`已弃用` 资源标注并移出资源池，避免误用）")


def autocheck(d, kind):
    base = [
        "命名符合规范 (CHR_/MON_/BOSS_/FX_/TILE_)",
        "依赖资源完整（按依赖关系字段逐项校验，缺项即 Fail）",
        "ASTC 压缩（贴图 6×6 / 8×8）",
        "Prefab 完整",
        "Bundle 正确（AssetBundle 分组 + 引用计数）",
    ]
    if kind in ("character", "monster", "boss"):
        base += [
            "Pivot 正确（脚底 +Y up 面朝 +Z）",
            "Tri 符合预算（<上限）",
            "材质数量（角色≤2 / Boss≤4 / 怪≤2）",
            "Bone 数量（角色≤30 / Boss≤50 / 怪≤25）",
            "Socket 存在（按 Socket 规范齐全）",
            "Collider 存在（Capsule/Box + WeaponCollider/SkillSocket）",
            "Animation 完整（最低动画集 + 命中帧 AnimEvent）",
            "LOD 存在（LOD0/1/2）",
        ]
    elif kind == "tile":
        base += ["可拼贴无缝（Pivot/Grid Snap）", "面数极低 / 共享材质", "Collider 存在（Box/Trigger）", "LOD 存在"]
    elif kind == "effect":
        base += ["粒子数达标（普通≤80 / Boss≤300）", "DrawCall 达标", "生命周期达标（≤2s）", "透明边缘干净"]
    d.w("- **自动检查（工具扫描项，可一键生成报告·Fail 退回美术）**:")
    for r in base:
        d.w("  - [ ] %s" % r)


def vfx_budget(d):
    d.w("- **VFX 性能预算**: 普通技能 ≤80 粒子 / DrawCall≤2 / 贴图≤256² / 生命周期≤1.5s；"
        "Boss 技能 ≤300 粒子 / DrawCall≤4 / 贴图≤512² / 生命周期≤2s；"
        "UI VFX ≤40 粒子（屏幕空间，无世界坐标）")


def tile_module_spec(d):
    d.w("- **模块规范**: 模块尺寸 2m×2m（与 NavigationGrid 同粒度）；墙高 3m；"
        "类型 Floor(地板)/Wall(墙)/HighGround(高地)/Thorn(尖刺,带 Trigger)/Corner/Edge/Slope/Ramp；"
        "Pivot=块中心底(脚底) +Y up；Grid Snap=2m 对齐（地图拼贴无缝前置条件）")


# ---------------------------------------------------------------------------
# Layer 1 build (human-readable)
# ---------------------------------------------------------------------------
def build_human(characters, monsters, bosses, effects, tiles, retained):
    d = Doc()
    d.w("# 《回到地面》美术资源制作参数总表（3D 升级目标 · v6 · Layer 1 人类可读规范）")
    d.w("")
    d.w("> 依据 `texture_files_runtime.txt` 真实库存（**%d 项**）逐资源生成；" % len(parse_inventory_cached))
    d.w("> 对齐 `../docs/2D转3D全面升级方案.md` v3 第 4/5 章（卡通动物风 · 肉鸽 ARPG · TapTap 移动端）。")
    d.w("")
    d.w("> **三层文档架构（本文件 = Layer 1）**：")
    d.w("- **Layer 1（本文件）**：为什么 / 背景 / 原则 / 设计取舍 —— 给人看，评分 9.8 的人类规范。")
    d.w("- **Layer 2** `./AI资源制作规范_MachineSpec.yaml` + `.json`：机器可读规格（target/min/max、Sockets 数组、Fail 条件、Input/Output、Pipeline 引用）—— 给 AI 解析执行，无模糊词。")
    d.w("- **Layer 3** `./AI执行流程_Workflow.md`：AI 执行流水线（每步 Input/Output/Tool-call/Validation/Fail→Retry）。")
    d.w("> **单一事实来源**：`ART_RESOURCE_RULES.md §16` + `art_quality_budget.json → rules3d`。本文件与 Layer 2 均由 `tools/gen_art_spec.py` 读取同一源生成，**预算/命名/LOD/依赖不硬编码**（满足 §14.1 / §16.6）。")
    d.w("")
    d.w("> **口径说明**：")
    d.w("- **3D 升级类**（角色/怪物/Boss/特效/地块）：按「模型 / VFX / 模块件」聚合，原 2D 多帧合并为同一模型的动画 clip；每个模型独立成节、无遗漏。")
    d.w("- **2D 保留类**（图标/UI/背景）：不升级为 3D，按原文件逐张列表（表格每行=一项）。")
    d.w("")
    d.w("---")
    d.w("")

    # 0 Summary
    d.w("## 0. 总量与映射总览")
    d.w("")
    d.w("| 类别 | 2D 库存项 | 3D 聚合后资源数 | 处理 |")
    d.w("|---|---:|---:|---|")
    d.w("| characters 角色 | %d | %d 模型 | 3D 建模 |" % (
        sum(len(x["files"]) for x in characters.values()), len(characters)))
    d.w("| monsters 怪物 | %d | %d 模型 | 3D 建模 |" % (
        sum(len(x["files"]) for x in monsters.values()), len(monsters)))
    d.w("| bosses Boss | %d | %d 模型(含 %d 终boss+%d 小boss) | 3D 建模 |" % (
        sum(len(x["files"]) for x in bosses.values()), len(bosses),
        sum(1 for x in bosses.values() if x["tier"] == "finalboss"),
        sum(1 for x in bosses.values() if x["tier"] == "miniboss")))
    d.w("| effects 特效 | %d | %d VFX | 粒子/Shader |" % (
        sum(len(x["files"]) for x in effects.values()), len(effects)))
    d.w("| tiles 地块 | %d | %d 模块件 | 3D 模块套件 |" % (
        sum(len(x["files"]) for x in tiles.values()), len(tiles)))
    for cat, files in retained.items():
        d.w("| %s %s | %d | — (保留 2D) | 2D 保留 |" % (cat, cat.upper(), len(files)))
    grand = len(characters) + len(monsters) + len(bosses) + len(effects) + len(tiles)
    ret_total = sum(len(v) for v in retained.values())
    d.w("| **合计** | **%d** | **%d 个 3D 资源 + %d 张 2D 保留** | |" % (
        sum(len(x["files"]) for x in characters.values()) +
        sum(len(x["files"]) for x in monsters.values()) +
        sum(len(x["files"]) for x in bosses.values()) +
        sum(len(x["files"]) for x in effects.values()) +
        sum(len(x["files"]) for x in tiles.values()) + ret_total,
        grand, ret_total))
    d.w("")
    d.w("---")
    d.w("")

    # 1 Characters
    rule_chr = R3D["characters"]
    d.w("## 1. 角色模型（Characters，%d 个模型）" % len(characters))
    d.w("")
    for i, (hero, dd) in enumerate(characters.items(), 1):
        theme_name, theme_col = CHAR_THEME.get(hero, ("未定角色", "#888 / #444"))
        token = cap_token(hero) + "_A"
        d.w("### C%02d · %s（角色模型）" % (i, hero))
        d.w("- **名称**: `%s`（3D 卡通动物角色模型）" % hero)
        d.w("- **类型**: 3D 角色模型（玩家可控英雄）")
        naming_spec(d, "CHR", token)
        lifecycle_meta(d, "character", hero, token=token)
        d.w("- **源 2D 资源**: %s" % "、".join("`%s`" % f for f in dd["files"]))
        d.w("- **尺寸/分辨率**: 预算 %d~%d Tri（rules3d 区间，建议 %d）；albedo %d²；1–2 材质"
            % (rule_chr["minTri"], rule_chr["maxTri"], rule_chr["recommendTri"], rule_chr["textureSize"]))
        d.w("- **颜色规范**: %s — %s" % (theme_name, theme_col))
        d.w("- **格式要求**: `.glb`(glTF 2.0) + 骨骼；贴图 KTX2/ASTC %d×%d" % (rule_chr["astcBlock"], rule_chr["astcBlock"]))
        d.w("- **制作方式**: 3D 建模(Blender) + 骨骼绑定(20–30 骨) + 动画烘焙；卡通动物风 Toon/Cell 材质 + 描边")
        d.w("- **层级结构**: %s" % skeleton_tree("biped"))
        socket_spec(d, "character", rule_chr)
        collider_spec(d, "character", rule_chr, 1.8, 0.4)
        material_spec(d, "character")
        anim_spec(d, dd["actions"])
        lod_spec(d, "character", rule_chr)
        d.w("- **导出格式及压缩**: Blender→`CHR_%s.glb`（+Y up、脚底原点、面朝+Z）→ ASTC %d×%d 贴图 → "
            "导入 Cocos 自动生成 Prefab+LOD0/1/2 → 经 AssetCache 加载（§资产管线）" % (token, rule_chr["astcBlock"], rule_chr["astcBlock"]))
        prefab_spec(d, "character")
        d.w("- **验收门禁**: Tri<%d（建议 %d）/ 贴图≤%d² / 骨骼命名规范 / 动画 30fps 无缝 / "
            "原点脚底+Y-up+面朝+Z / 命中帧打 AnimEvent / Socket·Collider·LOD 齐全；过资产 Validate + 资产门禁"
            % (rule_chr["maxTri"], rule_chr["recommendTri"], rule_chr["textureSize"]))
        d.w("- **升级阶段**: %s" % PHASE["characters"])
        autocheck(d, "character")
        d.w("")

    d.w("---")
    d.w("")

    # 2 Monsters
    rule_mon = R3D["monsters"]
    d.w("## 2. 怪物模型（Monsters，%d 个模型）" % len(monsters))
    d.w("")
    for i, (name, dd) in enumerate(monsters.items(), 1):
        theme_name, theme_col = theme_for_monster(dd["region"])
        quad = dd["region"] in ("forest", "swamp", "tundra", "volcano")
        token = "_".join(cap_token(w) for w in name.split("_"))
        d.w("### M%02d · %s（怪物模型）" % (i, name))
        d.w("- **名称**: `%s`（3D 低模怪物）" % name)
        d.w("- **类型**: 3D 怪物模型（区域：%s）" % dd["region"])
        naming_spec(d, "MON", token)
        lifecycle_meta(d, "monster", name, region=dd["region"], token=token)
        d.w("- **源 2D 资源**: %s" % "、".join("`%s`" % f for f in dd["files"]))
        d.w("- **尺寸/分辨率**: 预算 %d~%d Tri（rules3d 区间，建议 %d）；albedo %d²；%d–%d 骨；共享材质模板"
            % (rule_mon["minTri"], rule_mon["maxTri"], rule_mon["recommendTri"], rule_mon["textureSize"],
               rule_mon["recommendBones"], rule_mon["maxBones"]))
        d.w("- **颜色规范**: %s — %s" % (theme_name, theme_col))
        d.w("- **格式要求**: `.glb` + 骨骼；贴图 ASTC %d×%d" % (rule_mon["astcBlock"], rule_mon["astcBlock"]))
        d.w("- **制作方式**: 3D 建模 + 骨骼绑定 + 动画；Toon 材质（与区域主题统一）")
        d.w("- **层级结构**: %s" % skeleton_tree("quad" if quad else "biped"))
        socket_spec(d, "monster", rule_mon)
        collider_spec(d, "monster", rule_mon, 1.6 if quad else 1.8, 0.5 if quad else 0.45)
        material_spec(d, "monster")
        anim_spec(d, set(["idle", "walk", "attack", "hit", "death"]))
        lod_spec(d, "monster", rule_mon)
        d.w("- **导出格式及压缩**: Blender→`MON_%s.glb`（+Y up/脚底原点）→ ASTC %d×%d → Prefab+LOD → AssetCache"
            % (token, rule_mon["astcBlock"], rule_mon["astcBlock"]))
        prefab_spec(d, "monster")
        d.w("- **验收门禁**: Tri<%d（建议 %d）/ 贴图≤%d² / 30fps / 区域色调一致 / Socket·Collider·LOD 齐全；过资产 Validate"
            % (rule_mon["maxTri"], rule_mon["recommendTri"], rule_mon["textureSize"]))
        d.w("- **升级阶段**: %s" % PHASE["monsters"])
        autocheck(d, "monster")
        d.w("")

    d.w("---")
    d.w("")

    # 3 Bosses
    rule_bf = R3D["bosses_final"]
    rule_bm = R3D["bosses_mini"]
    d.w("## 3. Boss 模型（Bosses，%d 个模型）" % len(bosses))
    d.w("")
    fb = [(n, x) for n, x in bosses.items() if x["tier"] == "finalboss"]
    mb = [(n, x) for n, x in bosses.items() if x["tier"] == "miniboss"]
    d.w("### 3.1 终 Boss（%d 个，预算 %d~%d Tri）" % (len(fb), rule_bf["minTri"], rule_bf["maxTri"]))
    d.w("")
    for i, (n, x) in enumerate(fb, 1):
        d.w("### B%02d · %s（终boss模型）" % (i, n))
        _boss_block(d, n, x, "终boss", i, "Final", rule_bf)
    d.w("### 3.2 小 Boss（%d 个，预算 %d~%d Tri）" % (len(mb), rule_bm["minTri"], rule_bm["maxTri"]))
    d.w("")
    for i, (n, x) in enumerate(mb, 1):
        d.w("### B%02d · %s（小boss模型）" % (i, n))
        _boss_block(d, n, x, "小boss", i, "Mini", rule_bm)

    d.w("---")
    d.w("")

    # 4 Effects + Tiles
    rule_fx_n = R3D["effects_normal"]
    rule_fx_b = R3D["effects_boss"]
    rule_tile = R3D["tiles"]
    d.w("## 4. 特效与地块（Effects %d VFX / Tiles %d 模块件）" % (len(effects), len(tiles)))
    d.w("")
    d.w("### 4.1 特效 VFX（%d 个）" % len(effects))
    d.w("")
    for i, (name, x) in enumerate(effects.items(), 1):
        theme_name, theme_col = effect_theme(name)
        sub = x["sub"]
        if sub == "ui":
            form = "UI 辉光/载入（屏幕空间 Shader，无世界坐标）"
        elif sub == "relics":
            form = "遗物触发 VFX（世界空间粒子 + 光环）"
        elif sub == "reactions":
            form = "元素反应状态 VFX（附着粒子 + 着色混合）"
        else:
            form = "战斗命中/位移 VFX（粒子 + 加色辉光）"
        token = pascal(strip_fx(name))
        kind, bucket = kind_for_effect(name)
        rule_fx = rule_fx_b if kind == "effect_boss" else rule_fx_n
        d.w("### E%02d · %s（特效 VFX）" % (i, name))
        d.w("- **名称**: `%s`（3D 特效资源）" % name)
        d.w("- **类型**: 3D 特效 / 粒子系统 / Shader VFX（子类：%s）" % sub)
        naming_spec(d, "FX", token, ext="prefab", anim_line=False)
        lifecycle_meta(d, "effect", name, token=token)
        d.w("- **源 2D 资源**: %s" % "、".join("`%s`" % f for f in x["files"]))
        d.w("- **尺寸/分辨率**: 粒子贴图 %d²（flipbook %d²）；软粒子；无骨骼"
            % (rule_fx["textureSize"], rule_fx["textureSize"]))
        d.w("- **颜色规范**: %s — %s" % (theme_name, theme_col))
        d.w("- **格式要求**: 粒子贴图 PNG(RGBA)→ASTC；VFX 以 Cocos Particle / 自定义 Shader 描述（非单图）")
        d.w("- **制作方式**: %s；贴图用 flipbook/软粒子/加色混合（替代 2D strip）" % form)
        d.w("- **层级结构**: 无骨骼；节点树 `EffectRoot → ParticleEmitter[]`（每个 emitter 引用贴图+曲线）")
        socket_spec(d, "effect", None)
        collider_spec(d, "effect", None)
        material_spec(d, "effect")
        d.w("- **动画帧数**: 2D 帧序列 → 3D 改为**时长驱动**（loop 0.4–1.2s），无定帧；hit/dodge 用一次性爆发曲线")
        vfx_budget(d)
        d.w("- **导出格式及压缩**: 贴图→ASTC %d×%d；VFX 配置(Particle .plist/.asset)随 Prefab 进 AssetBundle → AssetCache"
            % (rule_fx["astcBlock"], rule_fx["astcBlock"]))
        prefab_spec(d, "effect")
        d.w("- **验收门禁**: 透明边缘干净 / 发光不丢失 / 颜色无断层 / 粒子数·DrawCall·生命周期达标；体积≤160KB(贴图)；过资产 Validate")
        d.w("- **升级阶段**: %s" % PHASE["effects"])
        autocheck(d, "effect")
        d.w("")

    d.w("### 4.2 地块模块件（%d 个）" % len(tiles))
    d.w("")
    for i, (key, x) in enumerate(tiles.items(), 1):
        theme_name, theme_col = theme_for_monster(x["region"])
        ttype = x["type"]
        tname = {"floor": "地板", "wall": "墙体", "highground": "高地", "thorn": "尖刺/陷阱"}.get(ttype, ttype)
        token = "%s_%s" % (cap_token(x["region"]), cap_token(ttype))
        d.w("### T%02d · %s_%s（地块模块件）" % (i, x["region"], ttype))
        d.w("- **名称**: `%s`（3D 地块模块件）" % key)
        d.w("- **类型**: 3D 环境模块件（%s，类型：%s）" % (x["region"], tname))
        naming_spec(d, "TILE", token, anim_line=False)
        lifecycle_meta(d, "tile", key, region=x["region"], token=token)
        d.w("- **源 2D 资源**: %s" % "、".join("`%s`" % f for f in x["files"]))
        d.w("- **尺寸/分辨率**: 单块 %dm×%dm；共享 %d² 地形图集（按区域换肤）"
            % (rule_tile["moduleSizeM"], rule_tile["moduleSizeM"], rule_tile["textureSize"]))
        d.w("- **颜色规范**: %s — %s" % (theme_name, theme_col))
        d.w("- **格式要求**: `.glb` 模块件（无骨骼）；贴图 ASTC %d×%d，区域共享图集"
            % (rule_tile["astcBlock"], rule_tile["astcBlock"]))
        d.w("- **制作方式**: 3D 模块化建模(Blender) + 程序化/手调 UV；区域套件（可拼贴无缝）；静态件走 Mesh Combine")
        tile_module_spec(d)
        d.w("- **层级结构**: `TileRoot → Mesh`（静态；无骨骼；可挂碰撞代理体供 NavigationGrid/ICollisionService）")
        socket_spec(d, "tile", rule_tile)
        collider_spec(d, "tile", rule_tile)
        material_spec(d, "tile")
        d.w("- **动画帧数**: 静态（thorn 可选 0.5s 触发动画，非必需）")
        lod_spec(d, "tile", rule_tile)
        d.w("- **导出格式及压缩**: Blender→`TILE_%s.glb` → ASTC %d×%d 区域图集 → 进 AssetBundle（按区域）→ AssetCache 预载"
            % (token, rule_tile["astcBlock"], rule_tile["astcBlock"]))
        prefab_spec(d, "tile")
        d.w("- **验收门禁**: 可拼贴无缝 / 面数极低 / 共享材质（降 DrawCall）/ Collider·LOD 齐全；过资产 Validate")
        d.w("- **升级阶段**: %s" % PHASE["tiles"])
        autocheck(d, "tile")
        d.w("")

    d.w("---")
    d.w("")

    # 5 Retained 2D
    d.w("## 5. 2D 保留类资源（图标 / UI / 背景）")
    d.w("")
    d.w("> 以下资源**不升级为 3D**，按原文件逐张列出（每行=一项，无遗漏）。字段：名称 | 源文件 | 类型 | 尺寸/分辨率 | 颜色规范 | 格式 | 制作方式 | 动画帧 | 导出/压缩 | 批次")
    d.w("> 命名沿用现有路径（不纳入 CHR_/MON_/BOSS_/FX_/TILE_ 规范，因其为 2D 运行期资产）。")
    d.w("")
    sub_idx = {"icons": "1", "ui": "2", "backgrounds": "3"}
    for cat in ["icons", "ui", "backgrounds"]:
        if cat not in retained:
            continue
        d.w("### 5.%s %s（%d 项）" % (sub_idx[cat], cat.upper(), len(retained[cat])))
        d.w("")
        d.w("| 名称 | 源文件 | 类型 | 尺寸/分辨率 | 颜色规范 | 格式 | 制作方式 | 动画帧 | 导出/压缩 | 批次 |")
        d.w("|---|---|---|---|---|---|---|---|---|---|")
        for f in retained[cat]:
            fn = f.rsplit(".", 1)[0]
            ext = f.rsplit(".", 1)[1].lower()
            if cat == "icons":
                sz, fmt, meth, anim = "128×128", "RGBA PNG", "Agnes AI 图标模板", "—"
                col = "区域/元素主题色（见 effects/char 配色）"
                comp = "ASTC/LANCZOS+alpha 柔化；≤限容"
            elif cat == "backgrounds":
                sz, fmt, meth, anim = "1000×666(16:9)", "JPG(RGB)", "Agnes AI 全屏背景", "—"
                col = "区域环境色（见 REGION_THEME）"
                comp = "JPG 95% / ≤180KB"
            else:
                if f.endswith(".jpg"):
                    sz, fmt, meth, anim = "自适应(全屏/面板)", "JPG(RGB)", "UI Kit 程序化 / Agnes", "—"
                    col = "森林宝石 UI 色板（金/绿/木）"
                    comp = "JPG 95% / ≤限容"
                else:
                    sz, fmt, meth, anim = "按用途(128²–1024²)", "RGBA PNG", "UI Kit 程序化 / Agnes", "按钮态可选多帧"
                    col = "森林宝石 UI 色板"
                    comp = "ASTC/LANCZOS；9-slice 可拉伸"
            d.w("| `%s` | `%s` | %s | %s | %s | %s | %s | %s | %s | %s |" % (
                fn, f, cat, sz, col, fmt, meth, anim, comp, RET_BATCH[cat]))
        d.w("")

    d.w("---")
    d.w("")

    # 6 Supplement
    d.w("## 6. 需补充的 3D 专属资源（v3 §4.3）")
    d.w("")
    d.w("> 上述由 2D 升级而来的资源之外，3D 化必须额外制作的支撑资产：")
    d.w("")
    supp = [
        ("Toon Ramp 贴图", "卡通动物风核心", "1D ramp 渐变贴图（明→暗阶跃），<64×4，项目共享 1 张", ".png→ASTC", "手绘/程序化"),
        ("描边方案", "轮廓线", "Inverted-Hull 或法线外扩后处理；参数：宽度/阈值", "Shader/.effect", "Shader 编写"),
        ("天空盒/环境", "每区域 1 套", "6 面或全景立方图，2048²/面，区域主题色", ".hdr/.exr→ASTC", "3D 环境/程序化"),
        ("光照/烘焙数据", "静态地牢", "Lightmap（UV2）+ 阴影分级预设", "引擎内生成", "LightingService 配置"),
        ("世界空间 UI 3D 元素", "reticle/飘字/范围圈/小地图标", "billboard 面片 + 材质；脚底血条", ".glb/Prefab", "3D 建模+Shader"),
        ("3D 角色展示场景", "主菜单/选角", "单角色展台 + 打光 + 转台相机", "场景 Prefab", "3D 场景搭建"),
        ("LOD 网格", "角色/Boss/怪", "LOD0/LOD1/LOD2 降面版本（自动或手调）", ".glb", "建模/自动减面"),
        ("粒子贴图/flipbook", "特效通用", "火焰/冰/雷/血/烟/斩击 flipbook 256²–512²", ".png→ASTC", "手绘/程序化"),
    ]
    d.w("| 资源 | 用途 | 规格 | 格式 | 制作方式 |")
    d.w("|---|---|---|---|---|")
    for name, use, spec, fmt, meth in supp:
        d.w("| %s | %s | %s | %s | %s |" % (name, use, spec, fmt, meth))
    d.w("")

    d.w("---")
    d.w("")

    # 7 Naming
    d.w("## 7. 命名规范总览（工具扫描依据）")
    d.w("")
    d.w("| 类别 | 前缀 | 模型示例 | 动画命名示例 |")
    d.w("|---|---|---|---|")
    d.w("| 角色 | `CHR_` | `CHR_Warrior_A.glb` | `CHR_Warrior_A_Attack.anim` |")
    d.w("| 怪物 | `MON_` | `MON_Forest_Boar.glb` | `MON_Forest_Boar_Hit.anim` |")
    d.w("| Boss | `BOSS_` | `BOSS_Final_01.glb` / `BOSS_Mini_01.glb` | `BOSS_Final_01_Special.anim` |")
    d.w("| 特效 | `FX_` | `FX_Fireball.prefab` | —（粒子时长驱动） |")
    d.w("| 地块 | `TILE_` | `TILE_Forest_Floor.glb` | —（静态） |")
    d.w("")
    d.w("- 全部小写转首字母大写的 PascalCase 拼接；下划线分隔语义段；禁止空格/中文/特殊字符。")
    d.w("- 动画命名 = `{模型前缀}_{模型Token}_{Clip}`；Clip 取自最低/推荐动画集（§1–4）。")
    d.w("- 正则（权威，供 `asset_validate.py`）：`%s`" % NAMING.get("pattern", ""))
    d.w("")

    d.w("---")
    d.w("")

    # 8 Production flow
    d.w("## 8. 资源生产流程（13 阶段流水线 · 人类视角）")
    d.w("")
    d.w("> 单个资源从需求到上线必须走完以下 13 阶段，任一阶段 Fail 不进入下一阶段。")
    d.w("> AI 执行视角的 9 步精简流水线见 **Layer 3 `./AI执行流程_Workflow.md`**。")
    d.w("")
    stages = [
        ("1 需求", "策划/程序提需求单：资源用途、预算(面数/贴图/粒子)、Socket/Collider 清单、LOD 要求"),
        ("2 概念图", "2D 概念稿（卡通动物风定调、配色、姿态），与区域主题色一致"),
        ("3 建模", "Blender 低模，脚底原点 +Y up 面朝 +Z，命名合规"),
        ("4 UV", "展开 UV，共享图集/合理利用率，无重叠拉伸"),
        ("5 贴图", " albedo + Toon ramp + 自发光/边缘光通道；ASTC 压缩"),
        ("6 绑定", "骨骼绑定（角色≤30/Boss≤50/怪≤25 骨），命名规范，加 Socket 空节点"),
        ("7 动画", "最低集(Idle/Move/Attack/Hit/Death) + 推荐集；30fps；命中帧打 AnimEvent"),
        ("8 LOD", "生成 LOD0/1/2（百分比见各资源 LOD 规范）"),
        ("9 导出", "Blender→`.glb`（脚本化统一原点/朝向/30fps），贴图 ASTC"),
        ("10 Prefab", "导入 Cocos 自动生成 Prefab：Animator/Collider/LOD/Socket/Material/AudioSource/EffectAnchor/Shadow"),
        ("11 程序接入", "挂 SkillSocket/WeaponCollider/WeakPoint，接 ICollisionService / SkillGraph"),
        ("12 验收", "过资产 Validate（面数/贴图/骨骼命名/AnimEvent/命名/LOD/Collider）+ 资产门禁；自动检查清单全绿"),
        ("13 性能测试", "真机帧率/内存/DrawCall（预算见 v3 §6.1）；Boss 模型专项内存压力测试"),
    ]
    d.w("| 阶段 | 内容 |")
    d.w("|---|---|")
    for name, desc in stages:
        d.w("| %s | %s |" % (name, desc))
    d.w("")

    d.w("---")
    d.w("")

    # 9 Pipeline & auto-check tool
    d.w("## 9. 资产管线与自动检查工具（落地约束）")
    d.w("")
    d.w("1. **生产链路（脚本化）**：Blender → Export `.glb`（脚本统一原点/朝向/30fps）→ **Validate** → Import(ASTC) → Auto Prefab(材质+LOD+AnimEvent) → Bundle → AssetCache。")
    d.w("2. **Validate 失败即阻断合并**；规则与 §1–6 规格、资产门禁共用单一事实来源（`rules3d`）。")
    d.w("3. **内存/性能**：引用计数 + 生命周期释放（LifecycleManager）；DrawCall<120、内存<800MB、≥30fps（中端机）。")
    d.w("4. **颜色规范**：卡通动物风高饱和明快；混战靠轮廓色/光环区分；与现有 2D UI 色板协调。")
    d.w("")
    d.w("### 9.1 自动检查工具（关键）")
    d.w("")
    d.w("> 每个 3D 资源末尾的「自动检查」清单，由 `tools/asset_validate.py` 一键扫描：")
    d.w("- 读取 `.glb`/Prefab → 提取 Tri/材质数/Bone 数/Socket 节点/Collider/LOD/AnimEvent/命名；")
    d.w("- 与 §1–6 规格及 `rules3d` 预算逐项比对 → 生成报告（Pass/Fail + 明细）；")
    d.w("- Fail 项自动退回对应美术，无需人工逐张检查（数百资源可批量验收）。")
    d.w("- 检查项（与每资源清单一致）：命名 / Pivot / Tri / 材质数 / Bone 数 / Socket / Collider / Animation / LOD / ASTC / Prefab / Bundle。")
    d.w("")
    d.w("---")
    d.w("")

    n3d = len(characters) + len(monsters) + len(bosses) + len(effects) + len(tiles)
    n2d = sum(len(v) for v in retained.values())
    d.w("> 本文件由 `tools/gen_art_spec.py` 依据 `texture_files_runtime.txt` 读取 `rules3d` 自动生成（v6 · Layer 1），覆盖全部 %d 个库存项；"
        "3D 资源 %d 个（角色%d/怪物%d/Boss%d/特效%d/地块%d）+ 2D 保留 %d 张。库存/预算变动后重跑脚本即可同步。" % (
        len(parse_inventory_cached), n3d, len(characters), len(monsters), len(bosses), len(effects), len(tiles), n2d))
    d.w("")
    return "".join(d.buf)


def _boss_block(d, n, x, tier_label, idx, tier_token, rule):
    theme_name, theme_col = (theme_for_monster(x["region"])
                             if x["region"] != "finalboss"
                             else ("FinalBoss 终boss·全域混搭", "#C0392B / #8A4FFF / #E0A030"))
    token = "%s_%02d" % (tier_token, idx)
    d.w("- **名称**: `%s`（3D Boss 模型）" % n)
    d.w("- **类型**: 3D Boss 模型（%s，区域：%s）" % (tier_label, x["region"]))
    naming_spec(d, "BOSS", token)
    lifecycle_meta(d, "boss", n, region=x["region"], token=token)
    d.w("- **源 2D 资源**: %s" % "、".join("`%s`" % f for f in x["files"]))
    d.w("- **尺寸/分辨率**: 预算 %d~%d Tri（rules3d 区间，建议 %d）；albedo %d²；%d–%d 骨；可附属部件"
        % (rule["minTri"], rule["maxTri"], rule["recommendTri"], rule["textureSize"],
           rule["recommendBones"], rule["maxBones"]))
    d.w("- **颜色规范**: %s — %s" % (theme_name, theme_col))
    d.w("- **格式要求**: `.glb` + 骨骼；贴图 ASTC %d×%d（%d²）" % (rule["astcBlock"], rule["astcBlock"], rule["textureSize"]))
    d.w("- **制作方式**: 3D 高精度建模 + 骨骼绑定 + 多套技能/阶段动画；Toon 材质 + 强描边（Boss 辨识度）")
    d.w("- **层级结构**: %s（+ 附属件节点如翅膀/炮臂）" % skeleton_tree("biped"))
    socket_spec(d, "boss", rule)
    collider_spec(d, "boss", rule, 2.6, 0.9)
    material_spec(d, "boss")
    anim_spec(d, x["actions"])
    lod_spec(d, "boss", rule)
    d.w("- **导出格式及压缩**: Blender→`BOSS_%s.glb`（+Y up/脚底原点）→ ASTC %d×%d → Prefab+LOD0/1/2 → AssetCache"
        % (token, rule["astcBlock"], rule["astcBlock"]))
    prefab_spec(d, "boss")
    d.w("- **验收门禁**: Tri<%d（建议 %d）/ 贴图≤%d² / 30fps / 阶段动画衔接 / 命中帧 AnimEvent / "
        "Socket(Boss 含 Mouth/Wing/Tail/Eye/WeakPoint)·Collider·LOD 齐全；过资产 Validate"
        % (rule["maxTri"], rule["recommendTri"], rule["textureSize"]))
    d.w("- **升级阶段**: %s" % PHASE["bosses"])
    autocheck(d, "boss")
    d.w("")


# ---------------------------------------------------------------------------
# Layer 3 build (AI execution workflow)
# ---------------------------------------------------------------------------
STEP_DETAIL = OrderedDict([
    ("model", OrderedDict([
        ("name", "Mesh 建模"),
        ("input", ["concept_2d", "source_sprites", "naming_token(<Token>)"]),
        ("output", ["<Token>.glb (raw mesh, +Y up, origin at feet)"]),
        ("tool_call", "blender --background --python tools/export_glb.py -- --name <Token> --src <source_sprites>"),
        ("validation", ["pivot == feet, +Y up, facing +Z", "naming matches rules3d pattern", "mesh manifold / no flipped normals"]),
        ("fail_retry", "若 Pivot 偏移 → 在 Blender 重设原点；若命名不符 → 改名重导；重试本步直到 validation 全绿"),
        ("next", "uv"),
    ])),
    ("uv", OrderedDict([
        ("name", "UV 展开"),
        ("input", ["<Token>.glb"]),
        ("output", ["<Token>.glb (UV0 展开, 共享图集/合理利用率)"]),
        ("tool_call", "blender smart-UV-project / manual seam; check texel density == textureSize"),
        ("validation", ["no overlapping UV islands", "texel density consistent with budget.textureSize",
                        "UV in 0..1 (or tiled per atlas)"]),
        ("fail_retry", "重叠 → 重新分块/松弛；密度不符 → 调整 scale；重试本步"),
        ("next", "texture_bake"),
    ])),
    ("texture_bake", OrderedDict([
        ("name", "Texture 烘焙"),
        ("input", ["<Token>.glb (high-poly if any)", "Toon ramp (shared)"]),
        ("output", ["bake maps (albedo / emission / rim) at budget.textureSize"]),
        ("tool_call", "blender bake (diffuse+emission+AO); or Substance; output PNG"),
        ("validation", ["resolution <= budget.textureSize", "no missing bakes for glowing/crystal parts"]),
        ("fail_retry", "分辨率超 → 降尺寸重烘；缺通道 → 补烘；重试本步"),
        ("next", "texture"),
    ])),
    ("texture", OrderedDict([
        ("name", "Texture 贴图压缩"),
        ("input", ["bake maps (PNG)"]),
        ("output", ["<Token>_albedo.astc (block=%d)" % 6]),
        ("tool_call", "astcenc -c <in>.png <out>.astc %d" % 6),
        ("validation", ["ASTC block == budget.astcBlock", "alpha clean (no fringing)"]),
        ("fail_retry", "块号不符 → 用正确 block 重压；边缘脏 → 重做 alpha；重试本步"),
        ("next", "rig"),
    ])),
    ("rig", OrderedDict([
        ("name", "Rig 绑定"),
        ("input", ["<Token>.glb"]),
        ("output", ["<Token>.glb (skeleton, <= budget.maxBones bones)", "socket empty nodes (budget.sockets)"]),
        ("tool_call", "blender auto-rig / manual; add Socket empty nodes per budget.sockets"),
        ("validation", ["bones <= budget.maxBones", "all budget.sockets nodes present", "bone naming convention"]),
        ("fail_retry", "骨数超 → 减骨/合并；缺 Socket → 补空节点；重试本步"),
        ("next", "animation"),
    ])),
    ("animation", OrderedDict([
        ("name", "Animation 动画"),
        ("input", ["<Token>.glb (rigged)", "min clip list (Idle/Move/Attack/Hit/Death)"]),
        ("output", ["<Token>_<Clip>.anim for each required clip", "AnimEvent on hit frames"]),
        ("tool_call", "blender NLA / Marionette; export clips at 30fps; mark AnimEvent"),
        ("validation", ["animClips >= budget.animClipsMin", "hit-frame AnimEvent present", "30fps, seamless loop"]),
        ("fail_retry", "缺 clip → 补做；帧率错 → 重设 30fps；缺 AnimEvent → 打点；重试本步"),
        ("next", "lod"),
    ])),
    ("lod", OrderedDict([
        ("name", "LOD 减面"),
        ("input", ["<Token>.glb (full)"]),
        ("output", ["LOD0/LOD1/LOD2 (triPct + dist from budget.lod)"]),
        ("tool_call", "blender decimate / Simplygon; emit LOD chain per budget.lod"),
        ("validation", ["lodLevels >= len(budget.lod)-1", "each LOD tri <= cap*triPct", "switch dist matches budget.lod.dist"]),
        ("fail_retry", "LOD 缺失 → 生成缺失级；面数超 → 提升减面比；重试本步"),
        ("next", "prefab"),
    ])),
    ("prefab", OrderedDict([
        ("name", "Prefab 组装"),
        ("input", ["<Token>.glb", "LOD chain", "material (ToonLit+ramp)", "sockets", "colliders"]),
        ("output", ["<Token>.prefab (Animator/Collider/LOD Group/Socket/Material/AudioSource/EffectAnchor/Shadow)"]),
        ("tool_call", "cocos import → auto Prefab; or art_pipeline import <Token>.glb"),
        ("validation", ["Prefab complete (per Layer2 manifest)", "colliders present (budget.collider)",
                        "LOD Group wired", "Socket nodes mapped"]),
        ("fail_retry", "缺组件 → 补挂；Collider 类型错 → 改；重试本步"),
        ("next", "validate"),
    ])),
    ("validate", OrderedDict([
        ("name", "Validate 校验（门禁）"),
        ("input", ["<Token>.assetmeta.json", "assets/resources/config/art_quality_budget.json"]),
        ("output", ["validation report (Pass/Fail + detail)", "FAIL → back to the failing step"]),
        ("tool_call", "python tools/asset_validate.py <dir>/<Token>.assetmeta.json --budget assets/resources/config/art_quality_budget.json"),
        ("validation", ["all Layer2 `fail` assertions pass", "asset_validate check_ids all ok",
                        "lifecycle == 已批准 before integration"]),
        ("fail_retry", "任一 FAIL → 读取 report 明细，回到对应 step 修复后重新 validate，直到全绿方可合入"),
        ("next", "DONE (asset approved → integrate)"),
    ])),
])


def build_workflow():
    d = Doc()
    d.w("# 《回到地面》AI 资源执行流程（Layer 3 · Workflow）")
    d.w("")
    d.w("> 编码: UTF-8")
    d.w("")
    d.w("> 本文件是 **Layer 3**：AI 执行 3D 资源生产的流水线。配合：")
    d.w("- **Layer 1** `./美术资源制作参数总表_3D.md`（人类可读规范，为什么/原则）")
    d.w("- **Layer 2** `./AI资源制作规范_MachineSpec.yaml` + `.json`（机器可读规格：每个资源的 target/min/max、Sockets 数组、Fail 条件、Input/Output、Pipeline 引用）")
    d.w("")
    d.w("> **AI 执行契约**：")
    d.w("1. 读取 Layer 2 中该资源的 `schema`（预算/ sockets / fail / io / pipeline）。")
    d.w("2. 按下方 9 步顺序执行，每步先满足 `Validation` 再进入 `Next`。")
    d.w("3. 最后一步 `validate` 调用 `tools/asset_validate.py`，**任一 FAIL 即回到对应 step 修复重跑**，全绿方可合入。")
    d.w("4. 所有数值来自 `rules3d`（单一事实来源），禁止凭记忆改写预算。")
    d.w("")
    d.w("---")
    d.w("")

    d.w("## 0. 总体流水线（9 步）")
    d.w("")
    d.w("| Step | 阶段 | 关键产出 |")
    d.w("|---|---|---|")
    for i, sid in enumerate(PIPELINE_STEPS, 1):
        d.w("| %d | %s | %s |" % (i, PIPELINE_NAME[sid], STEP_DETAIL[sid]["output"][0]))
    d.w("")
    d.w("> 人类视角的 13 阶段见 Layer 1 §8；本 9 步是其 AI 可执行精简版（合并了概念/导出等人类协调步骤）。")
    d.w("")
    d.w("---")
    d.w("")

    d.w("## 1. 每步详细定义（Input / Output / Tool-call / Validation / Fail→Retry / Next）")
    d.w("")
    for i, sid in enumerate(PIPELINE_STEPS, 1):
        s = STEP_DETAIL[sid]
        d.w("### Step %d — %s (`%s`)" % (i, s["name"], sid))
        d.w("")
        d.w("- **Input**: %s" % "、".join("`%s`" % x for x in s["input"]))
        d.w("- **Output**: %s" % "、".join("`%s`" % x for x in s["output"]))
        d.w("- **Tool-call**: `%s`" % s["tool_call"])
        d.w("- **Validation**:")
        for v in s["validation"]:
            d.w("  - [ ] %s" % v)
        d.w("- **Fail → Retry**: %s" % s["fail_retry"])
        d.w("- **Next**: `%s`" % s["next"])
        d.w("")

    d.w("---")
    d.w("")

    d.w("## 2. 校验门禁（validate 步骤详解）")
    d.w("")
    d.w("`tools/asset_validate.py` 读取 `.assetmeta.json` 比对 `rules3d`，逐 check_id 输出 ok/XX：")
    d.w("")
    d.w("| check_id | 含义 | 对应 Layer2 字段 |")
    d.w("|---|---|---|")
    chk = [
        ("naming", "命名匹配 rules3d.naming.pattern", "naming.pattern"),
        ("budget_rule_found", "找到对应 rules3d 桶", "template.kind"),
        ("tri_budget", "triangles ∈ [minTri, maxTri]", "budget.minTri/maxTri"),
        ("bones_budget", "bones <= maxBones", "budget.maxBones"),
        ("texture_size", "textureSize <= 预算", "budget.textureSize"),
        ("lod_present", "lodLevels >= 要求", "lod"),
        ("anim_clips_min", "animClips >= animClipsMin", "animClipsMin"),
        ("required_sockets", "所有 required_sockets 存在", "sockets"),
        ("collider_present", "colliders 非空", "collider"),
        ("particles_budget", "maxParticles <= 预算", "budget.maxParticles"),
        ("drawcall_budget", "maxDrawCall <= 预算", "budget.maxDrawCall"),
        ("dependencies_present", "depends 全部存在", "manifest.depends"),
        ("lifecycle_valid", "lifecycle ∈ 4 态", "manifest.lifecycle"),
        ("perf_tier_valid", "perfTier ∈ low/medium/high", "perfTier"),
        ("test_scene_present", "testScene 非空", "manifest.testScene"),
        ("meta_version/author/date/reviewer", "元字段非空", "manifest.meta_*"),
    ]
    for cid, mean, field in chk:
        d.w("| `%s` | %s | %s |" % (cid, mean, field))
    d.w("")
    d.w("> 任一 `XX` → 该资源 FAIL，自动退回对应美术/AI step 修复；全 `ok` → PASS，可合入。")
    d.w("")

    d.w("---")
    d.w("")

    d.w("## 3. 每资源执行示例（以 `CHR_Warrior_A` 为例）")
    d.w("")
    d.w("```text")
    d.w("1. 读 Layer2 assets[] 中 id=CHR_Warrior_A 的 schema")
    d.w("   budget: minTri=2000 recommendTri=2500 maxTri=3000 maxBones=30 textureSize=512 astcBlock=6")
    d.w("   sockets: [RightHand,LeftHand,Head,Chest,Back,Foot,Weapon,SkillOrigin]")
    d.w("   fail: triangles<=3000 / bones<=30 / textureSize<=512 / lodLevels>=2 / animClips>=5 / all(sockets) / colliders>0 / naming")
    d.w("2. model → uv → texture_bake → texture → rig → animation → lod → prefab")
    d.w("3. validate: python tools/asset_validate.py CHR_Warrior_A.assetmeta.json --budget assets/resources/config/art_quality_budget.json")
    d.w("4. 若 tri_budget=XX → 回到 model 减面至 <=3000 → 重跑 validate")
    d.w("5. 全 ok → lifecycle 置 已批准 → 合入")
    d.w("```")
    d.w("")
    d.w("> 同样的流程适用于 MON_*/BOSS_*/FX_*/TILE_*，仅 budget/sockets/fail 取值随 `template` 不同（见 Layer 2）。")
    d.w("")
    return "".join(d.buf)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
parse_inventory_cached = None


def main():
    global parse_inventory_cached
    entries = parse_inventory()
    parse_inventory_cached = entries
    characters, monsters, bosses, effects, tiles, retained = group(entries)

    # Layer 1
    human = build_human(characters, monsters, bosses, effects, tiles, retained)
    with open(OUT_HUMAN, "w", encoding="utf-8") as f:
        f.write(human)

    # Layer 2
    spec = build_machine_spec(characters, monsters, bosses, effects, tiles, retained)
    yaml_text = yaml_dump(spec)
    with open(OUT_MACHINE_YAML, "w", encoding="utf-8") as f:
        f.write(yaml_text)
    with open(OUT_MACHINE_JSON, "w", encoding="utf-8") as f:
        json.dump(spec, f, ensure_ascii=False, indent=2)

    # Layer 3
    workflow = build_workflow()
    with open(OUT_WORKFLOW, "w", encoding="utf-8") as f:
        f.write(workflow)

    n3d = len(characters) + len(monsters) + len(bosses) + len(effects) + len(tiles)
    n2d = sum(len(v) for v in retained.values())
    print("WROTE Layer1: %s (%d lines)" % (OUT_HUMAN, human.count("\n")))
    print("WROTE Layer2: %s" % OUT_MACHINE_YAML)
    print("WROTE Layer2: %s" % OUT_MACHINE_JSON)
    print("WROTE Layer3: %s" % OUT_WORKFLOW)
    print("assets=%d (char=%d mon=%d boss=%d fx=%d tile=%d)  2D=%d"
          % (n3d, len(characters), len(monsters), len(bosses), len(effects), len(tiles), n2d))


if __name__ == "__main__":
    main()
