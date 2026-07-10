import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image
except Exception:
    Image = None


PROMPTS_PATH = Path(r"E:/game/assets/resources/config/prompts.json")
TEXTURE_ROOT = Path(r"E:/game/回到地面/assets/resources/textures")
OUTPUT_DIR = Path(r"E:/game/回到地面/tools/output")
ART_RULES_PATH = Path(r"E:/game/.workbuddy/memory/topics/ART_RESOURCE_RULES.md")


def _load_pipeline_config():
    """从 ART_RESOURCE_RULES.md 第15节 JSON 加载管线参数，与 art_pipeline.py 共享。"""
    if not ART_RULES_PATH.is_file():
        return {}
    try:
        text = ART_RULES_PATH.read_text(encoding="utf-8")
        # 查找第15节的 ```json ... ``` 代码块
        m = re.search(r"```json\s*\n(.*?)\n```", text, re.DOTALL)
        if m:
            return json.loads(m.group(1))
    except Exception:
        pass
    return {}


def _recommended_size_for(category: str) -> tuple[int, int] | None:
    """从 ART_RESOURCE_RULES.md 的 recommended_sizes 获取 master 推荐尺寸。"""
    cfg = _load_pipeline_config()
    sizes = cfg.get("recommended_sizes", {})
    if category in sizes:
        return tuple(sizes[category])
    return None


STYLE_CORE = (
    "Unified visual direction: bright cheerful cartoon animal adventure, "
    "warm hand-painted animation look, rounded friendly shapes, soft forest light, "
    "clean toy-like materials, saturated natural colors, gentle highlights, "
    "clear mobile readability, cozy family-safe fantasy mood, consistent with the "
    "integrated forest-and-gem interface style used by the current game."
)

QUALITY_CORE = (
    "Release quality target: crisp confident outlines, clean alpha-ready edges when needed, "
    "high-resolution details, smooth color gradients, polished lighting, readable silhouette, "
    "balanced contrast for small mobile screens, refined shape language, stable colors across the asset set."
)

SAFE_COPY_CORE = (
    "Runtime copy rule: all readable copy is provided by Cocos labels and game configuration; "
    "the artwork uses blank calm label areas, decorative leaf curls, paw motifs, stars, flowers, gems, "
    "ribbons, ropes, wood trims, soft cloth shapes, and simple geometric ornaments only."
)

SAFE_WORLD_CORE = (
    "Safe world motif: flowers, leaves, mushrooms, crystals, coins, lanterns, books, tents, tools, "
    "clouds, stars, paw marks, soft magic sparkles, friendly animal shapes, clean adventure props, "
    "warm camp details, peaceful ruins reclaimed by nature, and cheerful elemental scenery."
)

SEGMENTATION_CORE = (
    "Isolated subject on a flat solid pure white background (#FFFFFF). "
    "Completely flat uniform white fill. Pure white fills the entire background. "
    "Zero gradient, zero shadow, zero environment, zero scene. "
    "Just the subject centered on solid white."
)

# ── 纯净生物模板（怪物/BOSS 专用） ──────────────────
# 替换 STYLE_CORE + SAFE_COPY_CORE + SAFE_WORLD_CORE
# 只描述角色本身，不引入任何场景/装饰/环境概念
CREATURE_CORE = (
    "Clean game sprite style, simple shapes, clear silhouette, "
    "readable at small mobile screen size, flat cartoon art style, "
    "bright colors, clean outlines. "
    "On a flat pure white background with zero other elements. "
    "Zero background elements, zero environment, zero ground, "
    "zero decorations, zero sparkles, zero particles, zero shadows. "
    "Only the creature on white."
)

# ── 角色部件专用底座（部件化动画，2026-07-10） ──────────────────
# 替换 CREATURE_CORE 里的 "Only the creature on white" → "Only the part on transparent"
# 强调"part"，避免 AI 看到"creature"画整只角色
PART_CORE = (
    "Clean game sprite style, simple shapes, clear silhouette, "
    "readable at small mobile screen size, flat cartoon art style, "
    "bright colors, clean outlines. "
    "On a flat pure transparent background with zero other elements. "
    "Zero background elements, zero environment, zero ground, "
    "zero decorations, zero sparkles, zero particles, zero shadows. "
    "Only the character part on transparent."
)

CONSISTENCY_CLOSURE = (
    "Style consistency: same rounded line weight, same warm forest palette, "
    "same gem-and-leaf ornament language across every game resource."
)

PRODUCTION_NOTE_PNG = (
    "Production note: clean transparent edges, PNG RGBA export, "
    "no embedded text, mobile-optimized rendering."
)


ZONE_MAP = {
    "forest": "sunlit emerald forest with mossy trunks, tiny flowers, warm leaves, paw-shaped decorations, and gentle golden sparkles",
    "swamp": "lush green wetland with lily pads, soft mist, rounded mossy stones, glowing fireflies, and friendly water plants",
    "tundra": "bright snowy grove with blue ice crystals, soft snow pillows, tiny winter flowers, and cozy warm lantern glow",
    "volcano": "warm volcanic garden with rounded basalt stones, orange crystal light, safe glowing lava channels, and cheerful ember sparkles",
    "abyss": "dreamlike violet crystal cave with starry sparkles, smooth gem clusters, soft blue-violet glow, and friendly magical depth",
    "catacombs": "peaceful ancient nature ruin with clean stone arches, ivy, warm lanterns, moss, and faded geometric murals",
}

# ── 怪物/BOSS 专属色调指引（只讲颜色布局，不讲场景）────
# 用于 monster_prompt / boss_prompt 替代 ZONE_MAP，
# 避免 AI 读取场景描述后画出背景环境。
ZONE_COLOR_PALETTE = {
    "forest": "emerald green and warm brown color scheme with soft golden light accents",
    "swamp": "olive green and soft turquoise color scheme with gentle yellow glow accents",
    "tundra": "pale ice blue and soft white color scheme with gentle frosty highlights",
    "volcano": "dark red and warm orange color scheme with bright golden ember accents",
    "abyss": "deep violet and soft purple color scheme with gentle blue-violet glow accents",
    "catacombs": "warm grey and soft amber brown color scheme with gentle blue spirit accents",
}

# tile 专用配色：避免深色/暗幻想配色引发骷髅心脏
TILE_COLOR_PALETTE = {
    "forest": "soft sage green and warm cream color scheme",
    "swamp": "soft olive and pale teal color scheme",
    "tundra": "pale ice blue and soft white color scheme",
    "volcano": "soft terracotta and warm ochre color scheme",
    "abyss": "soft lavender and pale amethyst color scheme with gentle mist accents",
    "catacombs": "pale warm tan and soft limestone color scheme",
}

CHARACTER_MAP = {
    "warrior": "brave deer shield guardian with clean silver helmet, polished toy sword, round shield with blue gem trim, sturdy friendly stance",
    "archer": "agile deer ranger with small wooden bow, leaf-green cape, quiver, bright curious eyes, spring forest colors",
    "assassin": "swift cat scout with soft hood, twin polished daggers, nimble pose, purple-black accents, playful confident expression",
    "mage": "gentle rabbit spellcaster with blue star robe, crystal wand, soft magical sparkles, calm focused expression",
    "berserker": "energetic lion vanguard with clean large battle-axe, red-gold color scheme, sturdy boots, heroic friendly grin",
}

ACTION_MAP = {
    "idle": "4-frame idle breathing cycle: Frame 1 = standing relaxed; Frame 2 = body rises slightly with gentle inhale; Frame 3 = body settles with exhale; Frame 4 = return to neutral. Each frame a clearly different phase of the breath.",
    "attack": "4-frame attack sequence: Frame 1 = ready stance holding weapon forward; Frame 2 = wind-up drawing weapon/bow back; Frame 3 = weapon swung or thrust forward at full extension, arrow released; Frame 4 = follow-through recovery. Each frame a clearly different pose.",
    "walk": "4-frame walk cycle: Frame 1 = standing with one foot planted; Frame 2 = stepping forward, back leg pushing off; Frame 3 = mid-stride, legs passing; Frame 4 = landing step, opposite foot forward. Each frame a clearly different walking phase.",
    "hit": "4-frame hit reaction: Frame 1 = neutral stance; Frame 2 = head and body flinch backward from impact; Frame 3 = body curled, arms guarding; Frame 4 = recovering back to balance. Each frame a clearly different reaction phase.",
    "hurt": "4-frame hit reaction: Frame 1 = neutral stance; Frame 2 = head and body flinch backward from impact; Frame 3 = body curled, arms guarding; Frame 4 = recovering back to balance. Each frame a clearly different reaction phase.",
    "dodge": "4-frame dodge roll: Frame 1 = alert stance, weight on back foot; Frame 2 = body crouches down, tucking in; Frame 3 = sideways or forward roll, limbs tucked; Frame 4 = spring back up to standing. Each frame a clearly different dodge phase.",
    "death": "4-frame peaceful defeat: Frame 1 = standing hurt; Frame 2 = knees buckling, body leaning; Frame 3 = kneeling or falling forward; Frame 4 = lying down as soft sparkle dust fades. Each frame a clearly different collapse phase.",
    "skill": "4-frame skill cast: Frame 1 = raising weapon/wand to channel; Frame 2 = energy gathering around the character; Frame 3 = releasing the ability with weapon/wand thrust forward; Frame 4 = settling as soft magical glow lingers. Each frame a clearly different cast phase.",
    "phasechange": "4-frame power-up transformation: Frame 1 = normal stance; Frame 2 = body glowing, gems/leaves rising; Frame 3 = aura bursting, expression fierce and cheerful; Frame 4 = empowered pose with light rings settled. Each frame a clearly different transformation phase.",
}

UI_MODULE_MAP = {
    "splash": "opening screen with integrated meadow frame, paw ornaments, soft sky light, and calm loading area",
    "main": "main hub meadow interface with forest frame, open center for menu layout, warm sunlight, and cozy animal adventure mood",
    "login": "account login panel with gentle forest frame, warm parchment surface, agreement strip area, and calm safe login layout",
    "create": "character creation interface with integrated forest clearing, central character display stage, class selection area, name entry area, and bottom action area",
    "character": "character selection interface with warm forest gallery, avatar slots, character detail area, and friendly card layout",
    "area": "route selection interface with illustrated adventure map feeling, route cards, region badges, and clear start/back button zones",
    "shop": "cozy forest shop interface with wooden shelves, coin panel, friendly merchant mood, and warm gem decorations",
    "log": "adventure log interface with open storybook panel, trophy icon area, stat rows, and warm archive mood",
    "settings": "settings interface with calm wooden panel, leafy border, readable option rows, and quiet background",
    "settlement": "journey result interface with bright reward garden, wooden result frame, crystal rewards, and celebratory safe mood",
    "death": "journey summary interface with peaceful return-to-camp scene, warm lanterns, flowers, soft crystals, and gentle restart mood",
    "hud": "in-run HUD element with compact readable game overlay style, leafy gem trim, and clear mobile controls",
    "map": "dungeon map UI element with small readable room markers, parchment map feeling, and clean route symbols",
    "upgrade": "upgrade selection UI with friendly card frame, gem corners, open center for runtime labels, and cheerful reward energy",
    "equipment": "equipment interface with wooden leafy inventory frames, gem corners, clean slot grid, and calm readable layout",
    "event": "story event panel with magical forest vignette, choice card layout, soft parchment center, and peaceful adventure mood",
}

UI_MODULE_PALETTE = {
    "splash": "warm wood-and-gold color palette with soft golden highlights",
    "main": "rich forest green color palette with warm sunlight accents",
    "login": "gentle meadow green color palette with soft cream tones",
    "create": "warm forest green color palette with soft golden character highlight",
    "character": "warm forest green color palette with amber card accents",
    "area": "deep forest green color palette with golden path accents",
    "shop": "sapphire blue color palette with warm gem-toned highlights",
    "log": "warm amber brown color palette with soft golden accents",
    "settings": "calm forest green color palette with gentle wood tones",
    "settlement": "bright golden reward color palette with warm celebration light",
    "death": "deep night blue color palette with gentle silver star accents",
    "hud": "compact forest green color palette with gold accent trim",
    "map": "parchment brown color palette with soft golden room markers",
    "upgrade": "warm amber color palette with bright gemstone highlights",
    "equipment": "iron grey and soft purple color palette with gold embellishments",
    "event": "warm golden forest color palette with soft magical tint",
}

UI_OBJECT_MAP = {
    "bg": "full-screen integrated background",
    "background": "full-screen integrated background",
    "btn": "runtime label button frame",
    "button": "runtime label button frame",
    "panel": "runtime content panel",
    "card": "runtime content card",
    "slot": "small item slot frame",
    "icon": "small symbolic UI ornament",
    "badge": "small region badge ornament",
    "bar": "progress bar frame",
    "input": "name input frame",
    "strip": "thin information strip",
    "row": "stat row frame",
}

ICON_SAFE_MAP = {
    # ===== ITEMS =====
    "key": "plain silver key with simple round bow and two clean teeth",
    "advancedkey": "ornate gold skeleton key with intricate bow detail and three fine teeth",
    "coin": "bright gold coin with simple gem shine",
    "soulstone": "glowing blue-green soul crystal shard with soft light",
    "revivecoin": "bright gold coin with a gentle heart-shaped gem shine",
    "luckycoin": "bright gold coin with a four-leaf clover embossed on the center",
    "flamebomb": "round black bomb with short sizzling fuse and bright orange flame tip",
    "icebomb": "round frozen blue bomb with frost crystal spikes forming on the outer shell",
    "mapscroll": "rolled parchment scroll tied with a thin brown leather cord",
    "map": "folded treasure map with red X mark and dotted path lines",
    "rerollscroll": "rolled golden-edged scroll with a circular swirl seal in the middle",
    "scrollfire": "rolled parchment scroll sealed with a bright red flame emblem wax seal",
    "scrollholy": "rolled white scroll sealed with a golden holy light emblem wax seal",
    "scrollice": "rolled pale blue scroll sealed with a frost crystal snowflake emblem",
    "scrollpoison": "rolled green-veined scroll sealed with a venom purple drop emblem",
    "scrollshadow": "rolled dark grey scroll sealed with a crescent moon shadow emblem",
    "scrollthunder": "rolled brown scroll sealed with a blue-white lightning zigzag seal",
    # Potions — must come BEFORE generic "heal" key
    "healingpotion": "round glass bottle filled with green glowing healing liquid and a cork stopper",
    "bighealingpotion": "large round glass bottle filled with bright green bubbling healing liquid",
    "healthpotion": "round glass bottle with green healing liquid and a cork stopper",
    "largehealthpotion": "large round glass bottle with green healing liquid",
    "purifypotion": "round glass bottle with clear white glowing liquid and a silver metallic cap",
    "speedpotion": "tall narrow glass bottle with bright green streaky liquid and motion lines",
    "furypotion": "short round bottle with orange-red bubbling liquid and vapor wisps",
    "ironpotion": "sturdy dark grey iron flask with metal ring and steel chain accent",
    # ===== RELICS =====
    "blinkstone": "oval light blue teleportation gem with soft warp ripple aura",
    "decoyscroll": "rolled brown parchment scroll with a round wooden stamp emblem",
    "echoorb": "smooth crystal orb with concentric sound wave rings on the surface",
    "flamering": "circular fire opal ring with a tiny floating flame core inside",
    "frostamulet": "pendant necklace with an icy blue snowflake gemstone charm",
    "gravitystone": "smooth oval grey gravity stone with deep purple density core",
    "immortalstone": "glowing red oval life gem with gentle warm pulse light",
    "lifelink": "two interlocking green vitality rings with soft healing glow",
    "shadowcloak": "dark purple flowing cloak pin with faint shadow wisps trailing",
    "shadowdagger": "dark silver dagger with curved blade and faint shadow edge gleam",
    "thornarmor": "green-brown vine-wrapped armor fragment with small woody spikes",
    "ironarmor": "dark grey iron chestplate with steel rivets and reinforced plate design",
    "timehourglass": "small golden hourglass with purple sand trickling through thin glass frame",
    "frenzyaxe": "clean red-orange training axe charm with polished blade and bright courage ribbon",
    "speedgauntlet": "swift green glove charm with wind leaf trails",
    # ===== ELEMENTS =====
    "element_fire": "flame-shaped ruby emblem with warm amber glow and small sparkles",
    "element_frost": "hexagonal ice crystal shard with cold blue aura",
    "element_holy": "round golden halo emblem with soft white holy light rays",
    "element_lightning": "jagged lightning bolt emblem with blue-white electric crackle",
    "element_poison": "teardrop-shaped green venom crystal with toxic drip mark",
    "element_shadow": "purple-black crescent shadow emblem with faint violet glow",
    # ===== BUFFS =====
    "atkup": "glowing sword-shaped amulet with sharp edge gleam",
    "defup": "sturdy round shield charm with hard polished surface gleam",
    "shield": "blue energy barrier shield charm with hexagonal surface pattern",
    "speedup": "green running wind swirl with motion trail lines behind",
    "stealth": "dark purple crescent shadow charm with faint pale glow outline",
    # ===== DEBUFFS =====
    "burn": "orange fire emblem with rising heat waves and small ember glow dots",
    "freeze": "blue ice crystal charm with jagged cold shards and frost aura",
    "poison": "green acid droplet emblem with toxic bubble marks",
    "slow": "blue droplet and soft spiral motion mark",
    "stun": "yellow starburst concussion charm with dizzy spiral ring waves",
    # ===== SETS =====
    "frostbite": "blue snowflake crystal emblem with soft icy shine",
    "fury": "orange courage crystal with warm flame-shaped ribbon glow",
    "ironwall": "polished shield charm with blue gem rivets",
    "tempest": "green-blue wind spiral charm with tiny leaf sparks",
    "set_radiance": "golden starburst emblem with concentric soft light rings",
    "set_shadow": "dark crescent shadow emblem with faint purple edge glow",
    # ===== SKILLS =====
    "dash": "blue wind arrow swirl with paw-shaped motion sparkles",
    "healwave": "gentle green healing wave with soft water ripples and leaf sparkles",
    "elementburst": "rainbow elemental crystal burst with clean star sparks",
    "slowfield": "deep blue slow zone circle with heavy droplet marks",
    "skill_shield": "flat hexagonal blue energy shield with reinforced border frame",
    "snapshot": "round camera lens emblem with circular focus ring",
    # ===== LEGACY =====
    "berserkerpact": "orange courage ribbon charm with polished training axe motif and golden energy",
    "lifestealaura": "green vitality aura crystal with clover leaves and soft healing ring",
}

EFFECT_MAP = {
    "burn": "orange and golden warmth burst with soft rounded flame-shaped light petals",
    "freeze": "blue ice sparkle wave with snowflake shards and soft frosty glow",
    "conduct": "blue-white lightning ribbon with yellow gem sparks and clean zigzag energy",
    "melt": "gold-orange crystal sparkle splash with soft heat shimmer",
    "radiance": "golden starburst light bloom with gentle circular rays",
    "shatter": "blue crystal shard burst with clean angular sparkle pieces",
    "vaporize": "turquoise mist swirl with bright aqua sparkles",
    "void": "violet star rift swirl with soft cosmic particles",
    "decay": "purple leaf-dust swirl with muted magical sparkles",
    "overload": "orange-blue energy pop with rounded spark clusters",
    "dodge": "cyan motion afterimage streak with soft paw-shaped speed sparkles",
    "blink": "blue teleport ring with tiny star particles",
    "flame": "warm orange ring of rounded flame petals",
    "gravity": "violet gravity ripple rings with floating gem dots",
    "time": "golden time ripple made from abstract sand-like sparkles and circular light waves",
    "crit": "bright star impact flash with clean comic sparkle energy",
}

# ── 怪物独有安全设计描述 ──────────────────────────────────
# 每只怪物拥有基于其名称的独有视觉描述，避免同区怪物 AI 生成结果视觉相似。
# 新增怪物只需在此添加新条目即可自动获得独有 prompt。
MONSTER_DESIGN_MAP: dict[str, str] = {
    # ══ Abyss — dreamlike violet crystal cave theme ══
    "shadowgolem": "sturdy round crystal golem with smooth violet gem studs on its body, "
        "gentle sparkle glow from inside, chunky boulder-shaped frame, friendly heavy stance",
    "voidrift": "ring-shaped sparkle creature made of three orbiting purple light rings, "
        "cheerful face in the center, tiny star fragments floating around it, hovering gently",
    "voidwraith": "fluffy mist creature with soft cloudy translucent body, "
        "gentle purple sparkle trail flowing behind, cheerful round bright eyes floating in the mist, "
        "weightless drifting pose",
    "abyssarcher": "playful bat-winged creature holding a crescent-shaped crystal bow, "
        "one eye squinted in aiming pose, starry purple and blue coloring, cute focused expression",
    "shadowdemon": "adorable miniature imp-like creature with tiny rounded horn buds, "
        "soft violet-blue fur, small folded bat wings, cheerful mischievous grin, playful hopping pose",
    "abysslordelite": "regal crowned creature with flowing crystalline mane on its neck and back, "
        "elegant gemstone patterns on its body, soft purple glow, gentle commanding upright posture",

    # ══ Catacombs — peaceful ancient nature ruin theme ══
    "batswarm": "cluster of tiny friendly bat-like creatures huddled together "
        "forming one round fluffy shape, dozens of small bright eyes, "
        "soft brown and grey fur tones, shifting playful grouping",
    "deathknight": "sturdy stone guardian creature wearing a polished toy helmet, "
        "holding a rounded practice sword and small wooden shield, "
        "moss creeping over its stone joints, patient protective stance",
    "ghost": "soft translucent spirit made of gentle white-blue mist with a calm smiling face, "
        "flowing veil-like body trailing behind it, tiny star sparkles inside its body, "
        "floating peacefully",
    "ghoul": "small round fluffy burrowing creature with oversized digging claws, "
        "earthy brown fur with patches of soft moss, big curious eyes peeking out, "
        "playful crouched pose",
    "skeleton": "friendly stone guardian creature with layered rock plates, "
        "smooth joint-like connections, a small ivy crown on its head, "
        "soft blue glow in its eye crevices, standing at ease",
    "skeletonarcher": "lean stone guardian ranger creature with a curved stone bow, "
        "moss-tipped arrows in a small quiver, lichen patterns on its stone body, "
        "calm watchful aiming pose",

    # ══ Forest — sunlit emerald forest theme ══
    "boar": "chubby round boar creature with leaf-textured wooden armor plates on its back, "
        "tiny flower-tipped tusks, mossy patches on round cheeks, sturdy playful charging pose",
    "deerelite": "graceful stag-like creature with branching vine antlers "
        "decorated with tiny blossoms, sleek leaf-patterned coat, "
        "soft glowing hooves, elegant proud standing pose",
    "elfarcher": "slim hooded forest creature with pointed leaf-shaped ears "
        "peeking from under its hood, a vine-wrapped toy bow, "
        "bright green eyes squinting in aim, agile crouched pose",
    "mushroom": "animated spotted mushroom creature with a large red and white dotted cap, "
        "two stubby root-like wiggly legs, tiny leaf-like hands on its round stem body, "
        "wobbling cheerfully",
    "slime": "bouncy translucent green jelly blob with tiny flower petals "
        "and leaf fragments suspended inside, two round shiny eyes "
        "and a wide happy smile on top, jiggling contentedly",
    "treant": "friendly walking tree creature with a kind knotted face in its trunk, "
        "two branch arms spread in welcoming gesture, root feet planted wide, "
        "tiny leaves sprouting from branches",

    # ══ Swamp — lush green wetland theme ══
    "gianttoad": "large round friendly toad creature with smooth green skin "
        "and soft golden spots, big gentle goggle eyes on top of its flat head, "
        "tiny lily pad on its back, sitting placidly",
    "rottreant": "gentle moss-draped tree creature with soft hanging vines "
        "and ferns growing from its branch arms, warm amber glow from within its trunk, "
        "roots tangled comfortably, slow relaxed pose",
    "slimepoison": "bright purple-green translucent jelly creature "
        "with tiny sparkling bubbles floating inside, cheerful round eyes, "
        "soft sizzling sparkle particles rising from its surface, curious wobbling motion",
    "swampdragon": "friendly dragon-like creature with rounded mossy green scales "
        "and soft lily pad wings, a long gentle neck, big warm golden eyes, "
        "tiny water flowers on its tail, welcoming pose",
    "swampspider": "round fuzzy spider creature with eight sturdy leaf-patterned legs, "
        "big friendly compound eyes, mossy green body, "
        "soft dewdrop sparkles on its back, curious investigative pose",
    "viper": "smooth graceful serpent with diamond leaf-scale pattern "
        "in soft greens and golds, gentle friendly face, "
        "tiny flower behind its head, coiled in a relaxed spring-like curve",

    # ══ Tundra — bright snowy grove theme ══
    "frostgiant": "big soft snowy giant creature with rounded ice crystal armor plates, "
        "fluffy white fur trim, icicle-like fingers, gentle cold breath visible as sparkles, "
        "warm friendly towering stance",
    "frostmage": "hooded frost creature in a soft blue-trimmed cloak, "
        "holding a crystal-tipped staff with a glowing snowflake charm, "
        "icy blue eyes warm and bright, gentle casting pose with sparkle aura",
    "iceskeleton": "crystalline ice guardian creature "
        "with translucent frost-coated stone body, smooth joint connections "
        "like frozen waterfalls, soft blue inner glow, frost flowers growing on its shoulders",
    "penguinsoldier": "adorable round penguin in a tiny polished metal helmet "
        "and chest plate, holding a small icicle spear with both flippers, "
        "determined cute expression, standing at proud attention",
    "snowman": "jolly round snowman creature with bright coal-button eyes "
        "and a cheerful smiling mouth, soft carrot-shaped nose, "
        "stick arms raised in happy greeting, red scarf fluttering, gentle sparkle aura",
    "snowwolf": "fluffy white wolf with soft ice-blue tipped fur, "
        "gentle pale blue eyes, frost-kissed paws leaving tiny sparkle prints, "
        "thick winter coat, alert friendly standing pose",

    # ══ Volcano — warm volcanic garden theme ══
    "ashwraith": "soft smoky cloud creature with gentle ember-gold glowing eyes, "
        "swirling warm grey body with tiny orange sparkles drifting through it, "
        "floating calmly, warm haze outline",
    "demon": "playful small horned creature with warm orange-red skin "
        "and soft rounded horns, small folded leathery wings, "
        "cheerful sharp-toothed grin, warm ember sparkles around its body, impish hopping pose",
    "fireelemental": "bright swirling fire spirit with a warm golden-orange core, "
        "soft rounded flame tendrils reaching outward like arms, "
        "two bright happy eyes in the center of its blaze, dancing gently",
    "infernoelite": "proud lava warrior creature with polished obsidian-like armor plates "
        "showing warm orange glow in the seams, a rounded toy sword of cooled magma rock, "
        "ember crown on head, heroic stance",
    "lavaspider": "warm orange-gold spider with smooth rounded gemstone body "
        "showing glowing vein patterns, eight sturdy legs ending in tiny glow tips, "
        "friendly clustered eyes, curious exploring pose",
    "suicidegolem": "chunky warm rock golem with bright orange-gold cracks "
        "showing gentle glow inside its body, one arm cracked open "
        "revealing a warm crystal core, slightly wobbly unstable-but-friendly posture",
}

# ── 通用陷阱化解回退系统 ──
# 新增怪物/首领资源无需手动添加设计条目：
# 回退系统会根据文件名自动组合出独有安全描述。
_COMMON_TOKENS = {
    "monster", "monsters", "boss", "bosses", "character", "characters",
    "effect", "effects", "icon", "icons", "tile", "tiles",
    "background", "backgrounds", "ui",
    "idle", "attack", "walk", "hurt", "death", "skill", "phasechange",
    "png", "jpg", "jpeg", "webp",
}
_COMMON_TOKENS.update(ZONE_MAP.keys())
_COMMON_TOKENS.update(ACTION_MAP.keys())

_MONSTER_BODY_TYPES = [
    "round fluffy body",
    "tall slender frame",
    "wide sturdy build",
    "compact chunky shape",
    "graceful long form",
    "small agile figure",
]
_MONSTER_FEATURES = [
    "with crystal sparkle accents",
    "with soft leaf decorations",
    "with star-shaped markings",
    "with gentle glowing highlights",
    "with smooth polished surfaces",
    "with layered armor-like plates",
]
_MONSTER_POSES = [
    "standing in a friendly pose",
    "sitting with a curious expression",
    "crouching playfully",
    "floating gently in place",
    "hopping with cheerful energy",
    "leaning forward with interest",
]

# ── 各分类差异化特征池 ──────────────────────────────────
_EFFECT_TRAITS = {
    "body": ["rounded spark burst", "swirling energy ring", "soft mist cloud",
             "crystal shard cluster", "ribbon spiral", "star-shaped flash"],
    "color": ["warm golden", "cool blue-white", "vibrant purple",
              "soft green", "bright orange", "gentle pink"],
    "particles": ["tiny star sparkles", "gentle leaf flakes", "rounded bubble dots",
                  "feather-like wisps", "crystal fragment gleams", "soft light orbs"],
}
_ICON_TRAITS = {
    "shape": ["round centered emblem", "tall vertical motif", "wide horizontal badge",
              "compact square icon", "narrow slim token", "diamond-shaped mark"],
    "material": ["polished brass", "smooth silver", "warm gold",
                 "glowing crystal", "carved wood", "polished stone"],
    "deco": ["leaf curl accents", "tiny gem dots", "paw-shaped highlights",
             "star corner marks", "ribbon-like edges", "gentle sparkle glints"],
}
_UI_TRAITS = {
    "style": ["warm parchment", "soft translucent", "polished wood",
              "gentle gemstone", "smooth crystal", "warm fabric"],
    "border": ["leafy wooden", "gem-studded", "curled ribbon",
               "rounded stone", "twisted vine", "polished metal"],
    "accent": ["flower corner dots", "tiny star markers", "paw-shaped tabs",
               "gem rivet points", "leaf curl handles", "sparkle highlights"],
}
_BG_COMBAT_TRAITS = {
    "floor": {
        "forest": "rich mossy ground texture with scattered autumn leaves and tiny white flowers",
        "catacombs": "weathered gray flagstones with mossy cracks and faded geometric carvings",
        "volcano": "dark obsidian tiles with glowing orange lava veins radiating outward",
        "tundra": "frost-covered stone tiles with icy patches and pale frost flowers",
        "swamp": "dark muddy ground with stagnant green pools and tangled roots",
        "abyss": "dark purple-black flagstones with faint violet glowing rune cracks",
    },
    "edge": {
        "forest": "thick ancient tree trunks and dense bushes rising upward at left and right edges",
        "catacombs": "tall crumbling stone pillars and broken mossy tombstones at left and right edges",
        "volcano": "jagged volcanic rock formations and molten rock pools at left and right edges",
        "tundra": "tall jagged blue-white ice formations and snow banks at left and right edges",
        "swamp": "twisted dead tree trunks and marshy reeds at left and right edges",
        "abyss": "tall obsidian crystal clusters and rune-etched pillars at left and right edges",
    },
    "ground_detail": {
        "forest": "tiny white flowers, golden coins, and small mushrooms scattered near edges",
        "catacombs": "ancient pottery shards, faded murals, and small crystals near corners",
        "volcano": "glowing embers, small red crystals, and warm amber light near edges",
        "tundra": "snow crystals, frost flowers, and pale blue-white luminescence near edges",
        "swamp": "glowing mushrooms, mossy stones, and dim greenish marsh lights near edges",
        "abyss": "violet crystals, faint glowing dust, and dim purple shadows near corners",
    },
}


def _find_unique_token(tokens: list[str]) -> str | None:
    """从 token 列表中找出怪物/首领特有的名称 token（排除通用 token）。
    
    token 包含目录路径和文件名两部分。
    从文件名 stem 中提取物种名（可能由多个 token 组成，如 lord_abyss）。
    绕过目录级别 token（如 finalboss/）和 zone/action 等通用 token。
    """
    # 构造完整路径，通过文件名 stem 获取物种名
    dir_tokens = {"monster", "monsters", "boss", "bosses", "final", "finalboss",
                  "character", "characters", "effect", "effects", "icon", "icons",
                  "tile", "tiles", "background", "backgrounds", "ui"}
    dir_tokens.update(ZONE_MAP.keys())
    
    # 从后往前找出所有连续的非通用 token（这些构成物种名）
    species_tokens = []
    for t in reversed(tokens):
        if t in _COMMON_TOKENS:
            if species_tokens:  # 已经收集到物种token了，再遇到通用token就停止
                break
            continue
        if t in dir_tokens:
            if species_tokens:  # 遇到目录级token，停止
                break
            continue
        species_tokens.insert(0, t)  # 从后往前所以insert到开头
    
    if species_tokens:
        return "_".join(species_tokens)
    return None


def _generate_monster_design(rel: str, tokens: list[str]) -> str:
    """回退：从文件名确定性派生出独有安全描述。
    
    先用 HIGH_RISK_TOKEN_REPLACEMENTS 净化，再用 hash 组合特征模板。
    确保新增资源无需手动添加也能获得独有描述。
    seed 基于物种名 + zone，保证同一物种不同 zone 获得不同概念。
    """
    species = _find_unique_token(tokens)
    if not species:
        return "cute rounded animal-like fantasy creature with gentle friendly features"
    
    # 对多 token 物种名（如 lord_abyss），逐 token 应用风险替换
    safe_parts = []
    for token in species.split("_"):
        safe_parts.append(HIGH_RISK_TOKEN_REPLACEMENTS.get(token, token))
    safe_name = " ".join(safe_parts)
    
    # 加入 zone 区分跨区域同系 boss（如 lord_abyss vs lord_volcano）
    zone = find_zone(tokens)
    seed_source = f"{species}|{zone}" if zone else species
    
    # seed 只基于物种名 + zone
    import hashlib
    seed = int(hashlib.md5(seed_source.encode()).hexdigest(), 16)
    n_body = len(_MONSTER_BODY_TYPES)
    n_feat = len(_MONSTER_FEATURES)
    n_pose = len(_MONSTER_POSES)
    
    body = _MONSTER_BODY_TYPES[seed % n_body]
    feat = _MONSTER_FEATURES[(seed // n_body) % n_feat]
    pose = _MONSTER_POSES[(seed // (n_body * n_feat)) % n_pose]
    
    return f"unique cute {safe_name} with {body} {feat}, {pose}"


def _generate_unique_concept(rel: str, tokens: list[str],
                              trait_pool: dict[str, list[str]],
                              prefix: str = "cute") -> str:
    """从种子确定性派生出任何类别的独有安全概念描述。
    
    Args:
        rel: 文件相对路径
        tokens: 从文件名提取的 token 列表
        trait_pool: 特征池，如 {"body": [...], "color": [...], ...}
        prefix: 概念前缀
    Returns:
        独特的安全描述文本
    """
    species = _find_unique_token(tokens)
    if not species:
        return f"{prefix} decorative element with gentle friendly features"
    
    safe_parts = [HIGH_RISK_TOKEN_REPLACEMENTS.get(t, t) for t in species.split("_")]
    safe_name = " ".join(safe_parts)
    
    zone = find_zone(tokens)
    seed_source = f"{species}|{zone}" if zone else species
    
    import hashlib
    seed = int(hashlib.md5(seed_source.encode()).hexdigest(), 16)
    
    parts = []
    factor = 1
    for key, values in trait_pool.items():
        idx = (seed // factor) % len(values)
        parts.append(values[idx])
        factor *= len(values)
    traits = " ".join(parts)
    return f"{prefix} {safe_name} with {traits}"


def _safe_subject(rel: str) -> str:
    """生成安全的资源概念名（仅用于 prompts 中的引用）。"""
    tokens = tokens_from_path(rel)
    species = _find_unique_token(tokens)
    if not species:
        return cleaned_name(rel)
    safe_parts = [HIGH_RISK_TOKEN_REPLACEMENTS.get(t, t) for t in species.split("_")]
    return " ".join(safe_parts)


HIGH_RISK_TOKEN_REPLACEMENTS = {
    "death": "journey summary",
    "revive": "continue run",
    "boss": "major encounter",
    "blood": "vitality",
    "heart": "vitality crystal",
    "skull": "paw gem",
    "skeleton": "stone guardian",
    "skeletonlord": "ancient stone guardian",
    "skeletonarcher": "ancient stone ranger",
    "giantskeleton": "giant stone guardian",
    "iceskeleton": "ice crystal guardian",
    "bone": "wood trim",
    "frenzy": "courage energy",
    "berserker": "brave vanguard",
    "lifesteal": "vitality aura",
    "critical": "star impact",
}

RISK_SUBSTRINGS = [
    " no ",
    "do not",
    "avoid",
    "without",
    "forbidden",
    "negative",
    "blood",
    "skull",
    "skeleton",
    "bone",
    "corpse",
    "organ",
    "anatomical",
    "heart",
    "horror",
    "grimdark",
    "gore",
    "wound",
    "injury",
    "english",
    "letters",
    "words",
    "watermark",
    "signature",
    "pseudo",
    "fake",
    "checkerboard",
]


def rel_textures() -> list[str]:
    files = []
    for path in TEXTURE_ROOT.rglob("*"):
        if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}:
            files.append(path.relative_to(TEXTURE_ROOT).as_posix())
    return sorted(files)


def size_for(rel: str) -> tuple[int | None, int | None]:
    """返回推荐 master 尺寸（优先 ART_RESOURCE_RULES.md），回退到运行时文件尺寸。"""
    # 优先从规则文件获取推荐 master 尺寸
    category = rel.split("/")[0] if "/" in rel else ""
    rec = _recommended_size_for(category)
    if rec is not None:
        return rec
    # 回退：读取运行时文件实际尺寸
    if Image is None:
        return None, None
    path = TEXTURE_ROOT / rel
    try:
        with Image.open(path) as img:
            return img.size
    except Exception:
        return None, None


def tokens_from_path(rel: str) -> list[str]:
    stem = Path(rel).stem.lower()
    chunks = []
    for part in rel.lower().replace("\\", "/").split("/"):
        part = Path(part).stem
        chunks.extend(part.replace("-", "_").split("_"))
    return [c for c in chunks if c]


def cleaned_name(rel: str) -> str:
    tokens = tokens_from_path(rel)
    cleaned = []
    for token in tokens:
        cleaned.append(HIGH_RISK_TOKEN_REPLACEMENTS.get(token, token))
    return " ".join(cleaned)


def find_zone(tokens: list[str]) -> str:
    for token in tokens:
        if token in ZONE_MAP:
            return token
    return "forest"


def find_character(tokens: list[str]) -> str:
    for key in CHARACTER_MAP:
        if key in tokens:
            return key
    return "warrior"


def find_action(tokens: list[str]) -> str:
    for key in ACTION_MAP:
        if key in tokens:
            return key
    return "idle"


def _ui_canvas_size(rel: str) -> tuple[int, int]:
    """Return UI canvas dimensions based on component type.
    
    Aligns with ART_RESOURCE_RULES.md §11.2/§15 ui_kit_default_dims
    and 资源提示词设计策略.md §5.3.
    """
    tokens = tokens_from_path(rel)
    low = rel.lower()
    
    # .jpg → 毫无疑问的全屏背景
    if low.endswith(".jpg"):
        return 1920, 1080
    
    # 组件关键字匹配（优先级从具体到通用）
    if "btn" in tokens or "button" in tokens or "/btn_" in low or "/button_" in low:
        return 240, 80
    if "card" in tokens or "/card_" in low:
        return 260, 96
    if "slot" in tokens or "/slot_" in low:
        return 92, 92
    if "panel" in tokens or "/panel_" in low or "/frame_" in low:
        return 360, 200
    if "input" in tokens or "/input_" in low or "/name_" in low:
        return 260, 44
    if "bar" in tokens or "/bar_" in low:
        return 360, 36
    if "strip" in tokens or "/strip_" in low:
        return 360, 48
    if "row" in tokens or "/row_" in low:
        return 360, 48
    
    # .png + bg token 但无组件关键字 → 全屏背景
    if "bg" in tokens or "background" in tokens:
        return 1920, 1080
    
    return 192, 192


def dimensions_clause(rel: str) -> str:
    category = rel.split("/")[0] if "/" in rel else ""
    if category == "ui":
        w, h = _ui_canvas_size(rel)
    else:
        w, h = size_for(rel)
    if w and h:
        return f"Target canvas: {w}x{h}."
    return "Target canvas follows the current resource file dimensions."


def format_clause(rel: str) -> str:
    ext = Path(rel).suffix.lower()
    if ext in {".jpg", ".jpeg"}:
        return "Runtime format intent: full opaque rectangular image with rich color and smooth gradients for JPG export."
    return "Runtime format intent: PNG RGBA workflow with clean alpha extraction when the asset needs transparency."


def ui_kind(tokens: list[str], rel: str) -> str:
    low = rel.lower()
    # 组件关键字优先级高于 generic bg 判定（避免 panel_bg 误判为全屏背景）
    for key in ["panel", "btn", "button", "card", "slot", "bar", "input", "strip", "row"]:
        if key in tokens or key in low:
            return UI_OBJECT_MAP.get(key, "decorative UI asset")
    # 全屏背景：仅 .jpg 和独立 bg 标记
    if low.endswith(".jpg") or "bg" in tokens or "background" in tokens:
        return "background"
    for key in ["icon", "badge"]:
        if key in tokens or key in low:
            return UI_OBJECT_MAP.get(key, "decorative UI asset")
    return "decorative UI asset"


def _ui_style(tokens: list[str], key: str) -> str:
    """从文件名 hash 确定性地选择一个 UI 特征值。"""
    import hashlib
    source = "_".join(tokens)
    seed = int(hashlib.md5(source.encode()).hexdigest(), 16)
    pool = _UI_TRAITS.get(key, ["gentle"])
    return pool[seed % len(pool)]


def ui_prompt(rel: str) -> str:
    tokens = tokens_from_path(rel)
    module = rel.split("/")[1] if len(rel.split("/")) > 1 else "main"
    module_desc = UI_MODULE_MAP.get(module, "cartoon animal game interface")
    module_palette = UI_MODULE_PALETTE.get(module, "warm forest color palette")
    kind = ui_kind(tokens, rel)
    safe_subject = _safe_subject(rel)
    # 每个 UI 资源从文件名 hash 获得不同的样式/边框/装饰组合
    ui_style = _ui_style(tokens, "style")
    ui_border = _ui_style(tokens, "border")
    ui_accent = _ui_style(tokens, "accent")

    if kind == "background":
        specific = (
            f"Asset role: {kind} for the {module} screen. Scene concept: {module_desc}. "
            "Composition: one continuous illustrated environment, shared light source, integrated decorative frame, "
            "naturally reserved runtime zones for title, character display, menu buttons, information panels, and bottom actions as appropriate. "
            "The reserved areas use calm low-detail lighting, soft ground glow, gentle shadows, and blank readable surfaces."
        )
    elif "button" in kind:
        specific = (
            f"Asset role: {kind} for the {module} screen. Shape concept: rounded wooden and leafy button frame, "
            f"themed with gentle {ui_style} finish, using {module_palette}, "
            "blank calm center for runtime label, decorative leaves and gem dots at left and right ends, soft alpha edge, "
            "subtle inner highlight, consistent size language with other game buttons."
        )
    elif "panel" in kind or "card" in kind or "strip" in kind or "row" in kind or "input" in kind:
        specific = (
            f"Asset role: {kind} for the {module} screen. Shape concept: warm parchment or soft translucent forest panel, "
            f"adorned with {ui_border} border and {ui_accent}, using {module_palette}, "
            "leafy wooden border, gem corner details, quiet cream content area, clean stretchable bands for scalable UI, "
            "comfortable blank interior for runtime Chinese labels and icons."
        )
    elif "slot" in kind:
        specific = (
            f"Asset role: {kind} for the {module} screen. Shape concept: compact wooden leafy slot with gem corners, "
            f"decorated with {ui_accent}, using {module_palette}, "
            "calm center well, polished edge highlight, readable small-scale silhouette."
        )
    else:
        specific = (
            f"Asset role: {kind} for the {module} screen. Visual subject: {safe_subject}. "
            f"Using {module_palette}. "
            "Use a clean symbolic ornament, centered, readable, and matched to the forest adventure UI kit."
        )

    if kind == "background":
        # UI 背景图（如 splash_bg）需要完整的场景描述
        core = " ".join([STYLE_CORE, QUALITY_CORE, SAFE_COPY_CORE, SAFE_WORLD_CORE])
    else:
        # 按钮/面板/卡片/插槽等使用纯净模板
        core = CREATURE_CORE
    return " ".join([
        core,
        dimensions_clause(rel),
        format_clause(rel),
        specific,
        "Style consistency: same rounded line weight, same warm forest palette, same gem-and-leaf ornament language across every UI resource.",
        "Production note: artwork contains blank copy zones and decorative visual forms only; readable game copy is rendered by the engine.",
    ])


def background_prompt(rel: str) -> str:
    tokens = tokens_from_path(rel)
    zone = find_zone(tokens)
    zone_desc = ZONE_MAP[zone]
    zone_idx = list(ZONE_MAP.keys()).index(zone) if zone in ZONE_MAP else 0
    
    if "combat" in tokens:
        mode = "combat backdrop"
        zone_floor = _BG_COMBAT_TRAITS["floor"].get(zone, "rich ground texture")
        zone_edge = _BG_COMBAT_TRAITS["edge"].get(zone, "decorative elements at sides")
        zone_detail = _BG_COMBAT_TRAITS["ground_detail"].get(zone, "small decorative details near edges")
        bg_concept = (
            f"top-down overhead view of a {zone} combat arena floor, "
            f"{zone_floor}, strong three-dimensional {zone_edge}, "
            f"{zone_detail}, wide clean empty center tactical area, "
            f"clean empty center area, characters rendered as separate game sprites"
        )
        composition = (
            "top-down floor perspective with strong three-dimensional edge decorations "
            "rising upward, very clean empty center play area, rich floor texture, "
            "ground-level perspective only, filled with floor texture and edge decorations"
        )
    elif "event" in tokens:
        mode = "event or room backdrop"
        zone_floor = _BG_COMBAT_TRAITS["floor"].get(zone, "rich ground texture")
        zone_edge = _BG_COMBAT_TRAITS["edge"].get(zone, "decorative elements at sides")
        bg_concept = (
            f"top-down overhead view of a {zone} event arena floor, "
            f"{zone_floor}, decorative {zone_edge}, "
            f"open center area for encounter events, "
            f"clean empty center area, characters rendered as separate game sprites"
        )
        composition = (
            "top-down floor perspective with strong three-dimensional edge decorations, "
            "clean center area for UI overlay, ground-level perspective only, filled with floor texture and edge decorations"
        )
    elif "room" in tokens:
        mode = "event or room backdrop"
        # Room-specific
        if "healing" in tokens:
            room_desc = "a healing room with smooth stone floor and a glowing crystal fountain at center emitting soft green curative light, tall arched walls with herbal vines at sides"
        elif "rest" in tokens:
            room_desc = "a rest room with warm wooden floor and a cozy campfire at center, tall wooden support pillars at sides, bedrolls and cushions at corners"
        elif "shop" in tokens:
            room_desc = "a shop room with polished wooden floor and a tall merchant counter, tall shelves with potions and items along the walls"
        elif "treasure" in tokens:
            room_desc = "a treasure vault with stone floor and a large golden chest at center, tall stone pillars at sides, scattered coins and gems at corners"
        elif "upgrade" in tokens:
            room_desc = "an upgrade workshop with stone floor and a large glowing anvil at center, tall metal weapon racks at sides, tools hanging on walls"
        else:
            room_desc = f"a {zone} room with appropriate fantasy room features"
        bg_concept = (
            f"top-down overhead view of {room_desc}, "
            f"clean center area for gameplay"
        )
        composition = (
            "top-down indoor room perspective with strong three-dimensional wall "
            "and prop details, room features at edges and center, "
            "clean open floor space"
        )
    else:
        # Fallback for any other background type
        mode = "background"
        bg_concept = f"top-down overhead view of {zone_desc}, clean open center area"
        composition = "top-down perspective with clean center area, decorative edges"

    return " ".join([
        STYLE_CORE,
        QUALITY_CORE,
        SAFE_COPY_CORE,
        SAFE_WORLD_CORE,
        dimensions_clause(rel),
        format_clause(rel),
        f"Asset role: full-screen {mode} for the {zone} region.",
        f"Scene concept: {bg_concept}.",
        f"Composition: {composition}.",
        CONSISTENCY_CLOSURE,
        "Production note: full opaque rectangular scene with cohesive lighting, polished cartoon animation finish, and clear mobile readability.",
    ])


def character_prompt(rel: str) -> str:
    tokens = tokens_from_path(rel)
    character = find_character(tokens)
    action = find_action(tokens)
    return " ".join([
        CREATURE_CORE,
        dimensions_clause(rel),
        format_clause(rel),
        "Sprite sheet layout: 4 frames stacked vertically in a single image, each frame 256x256, total canvas 256x1024, vertical strip arrangement.",
        f"Character concept: {CHARACTER_MAP[character]}.",
        f"Animation concept: {ACTION_MAP[action]}.",
        "Frame consistency: same species, same costume, same body scale, same color palette, same face design, centered in every frame with even transparent margin.",
        CONSISTENCY_CLOSURE,
        PRODUCTION_NOTE_PNG,
    ])


# ── Character parts prompt (modular animation, 2026-07-10) ────────────────
# Maps part filenames to descriptive text used in prompt generation.
# Per docs/角色.txt §2.1-2.2: 每个部件严格只画一个 part;
# 耳朵是独立部件(ear_l/ear_r), 由 rig 摆动; head 只含脸+鹿角, 不能含耳朵。
# 关键: CHARACTER_PART_MAP 写完整的一句话（确认 ImageGen 时工作的格式）:
#   "Single isolated {part} part for a cute cartoon deer ranger character,
#    front view, {detail description}, no [other parts], centered with transparent margin, clean PNG RGBA."
# 必须包含排他词"no [其他部件]"，否则 AI 自动补全。
CHARACTER_PART_MAP: dict[str, str] = {
    "body":   "torso part, front view, rounded chest body, small belt, green collar, cape attachment collar, no head, no arms, no legs, centered with transparent margin, clean PNG RGBA",
    "head":   "head part, front view, warm orange-brown deer fur face, big bright friendly eyes, small muzzle, leaf-green ranger hood, small antlers on top, no ears, no body, no neck, centered with transparent margin, clean PNG RGBA",
    "ear_l":  "left ear part, warm orange-brown fur with soft pink inner ear, no head, no body, no antlers, centered with transparent margin, clean PNG RGBA",
    "ear_r":  "right ear part, warm orange-brown fur with soft pink inner ear, no head, no body, no antlers, centered with transparent margin, clean PNG RGBA",
    "arm_l":  "left arm part, front view, orange-brown deer fur, short green ranger sleeve, small hand, no body, no bow, no weapon, centered with transparent margin, clean PNG RGBA",
    "arm_r":  "right arm part, front view, orange-brown deer fur, short green ranger sleeve, small hand, no body, no bow, no weapon, centered with transparent margin, clean PNG RGBA",
    "leg_l":  "single left leg part, front view, orange-brown deer fur, green pants, small brown boot, only one leg not a pair, no body, no torso, centered with transparent margin, clean PNG RGBA",
    "leg_r":  "single right leg part, front view, orange-brown deer fur, green pants, small brown boot, only one leg not a pair, no body, no torso, centered with transparent margin, clean PNG RGBA",
    "tail":   "tail part, warm orange-brown fur with cream white tip, small fluffy shape, no body, no rump, centered with transparent margin, clean PNG RGBA",
    "bow":    "weapon bow part, small wooden curved bow, polished wood, simple bow string, no character, no arrows, no body, centered with transparent margin, clean PNG RGBA",
    "quiver": "quiver part, small brown leather quiver with arrow tips sticking out, no character, no body, centered with transparent margin, clean PNG RGBA",
    "cape":   "cape part, green cape cloth, soft flowing shape, no body, no hood, centered with transparent margin, clean PNG RGBA",
}

# Maps part filenames to target canvas dimensions (w, h)
CHARACTER_PART_SIZE_MAP: dict[str, tuple[int, int]] = {
    "body": (160, 160),
    "head": (128, 128),
    "ear_l": (64, 96),
    "ear_r": (64, 96),
    "arm_l": (96, 128),
    "arm_r": (96, 128),
    "leg_l": (80, 112),
    "leg_r": (80, 112),
    "tail": (96, 128),
    "bow": (128, 128),
    "quiver": (96, 96),
    "cape": (128, 160),
}

def character_part_prompt(rel: str) -> str:
    """Generate prompt for a modular character part image.
    
    Matches the ImageGen working format: short, single natural sentence,
    NO CONSISTENCY_CLOSURE / PRODUCTION_NOTE_PNG / format_clause noise.
    Includes "no [other parts]" exclusions to avoid AI auto-completing.
    """
    tokens = tokens_from_path(rel)
    character = find_character(tokens) or "unknown"
    part_name = Path(rel).stem
    part_desc = CHARACTER_PART_MAP.get(part_name, f"single isolated {part_name} part")
    part_size = CHARACTER_PART_SIZE_MAP.get(part_name, (256, 256))

    return " ".join([
        PART_CORE,
        f"Target canvas: {part_size[0]}x{part_size[1]}.",
        f"Single isolated {part_desc}",
    ])


_MONSTER_DESIGN_MAP_KEYS: dict[str, str] | None = None


def _get_monster_design_map() -> dict[str, str]:
    """构建以物种名为 key 的设计地图。
    
    将 MONSTER_DESIGN_MAP 的 key（原为单个 token 如 shadowgolem）
    转换为可直接匹配 species token 的格式。
    同时支持多 token 物种名（如 lord_abyss → 在 map 中没有显式条目,
    直接走回退）。
    """
    return MONSTER_DESIGN_MAP


def monster_design(rel: str, tokens: list[str]) -> str:
    """获取怪物/首领的独有安全视觉描述。
    
    1. 优先查 MONSTER_DESIGN_MAP（36 只已知怪物）
    2. 回退用 _generate_monster_design() 从种子派生产出
    """
    species = _find_unique_token(tokens)
    if species and species in MONSTER_DESIGN_MAP:
        return MONSTER_DESIGN_MAP[species]
    return _generate_monster_design(rel, tokens)


def monster_prompt(rel: str) -> str:
    tokens = tokens_from_path(rel)
    zone = find_zone(tokens)
    action = find_action(tokens)
    concept = monster_design(rel, tokens)
    # 怪物用色调指引代替场景描述——避免 AI 画背景
    palette = ZONE_COLOR_PALETTE.get(zone, "soft natural color scheme with gentle highlights")
    return " ".join([
        CREATURE_CORE,
        dimensions_clause(rel),
        format_clause(rel),
        f"Color palette: {palette}.",
        f"Creature concept: {concept}.",
        f"Animation concept: {ACTION_MAP[action]}.",
        CONSISTENCY_CLOSURE,
        PRODUCTION_NOTE_PNG,
    ])


def boss_prompt(rel: str) -> str:
    tokens = tokens_from_path(rel)
    zone = find_zone(tokens)
    action = find_action(tokens)
    # Bosses 使用与怪物相同的差异化系统：优先查显式地图（逐步添加），回退到种子派生
    concept = monster_design(rel, tokens)
    palette = ZONE_COLOR_PALETTE.get(zone, "soft natural color scheme with gentle highlights")
    return " ".join([
        CREATURE_CORE,
        dimensions_clause(rel),
        format_clause(rel),
        f"Color palette: {palette}.",
        f"Creature concept: major encounter creature with {concept}, large silhouette, polished details.",
        f"Animation concept: {ACTION_MAP[action]}.",
        CONSISTENCY_CLOSURE,
        PRODUCTION_NOTE_PNG,
    ])


def effect_prompt(rel: str) -> str:
    tokens = tokens_from_path(rel)
    # 1. 优先查 EFFECT_MAP（16 个已定义特效）
    subject = None
    for key, desc in EFFECT_MAP.items():
        if key in tokens or key in rel.lower():
            subject = desc
            break
    # 2. 回退：从文件名 hash 组合独有特效描述
    if subject is None:
        subject = _generate_unique_concept(rel, tokens, _EFFECT_TRAITS, "magical")
    return " ".join([
        CREATURE_CORE,
        dimensions_clause(rel),
        format_clause(rel),
        "Asset role: cartoon magical visual effect sprite sheet for combat feedback.",
        f"Effect concept: {subject}.",
        "Animation layout: each frame centered in its own cell, consistent progression from anticipation to bright peak to soft fade, clear empty margin, transparent export workflow.",
        "Visual language: bright core, soft outer glow, rounded spark clusters, clean readable shape at mobile scale.",
        CONSISTENCY_CLOSURE,
        PRODUCTION_NOTE_PNG,
    ])


def icon_prompt(rel: str) -> str:
    tokens = tokens_from_path(rel)
    # 1. 优先查 ICON_SAFE_MAP（16 个已定义图标）
    subject = None
    low = rel.lower()
    for key, desc in ICON_SAFE_MAP.items():
        if key in tokens or key in low:
            subject = desc
            break
    # 2. 回退：从文件名 hash 组合独有图标描述
    if subject is None:
        subject = _generate_unique_concept(rel, tokens, _ICON_TRAITS, "iconic")
    else:
        # 即使是 ICON_SAFE_MAP 匹配到的图标，也追加基于文件名的独特细节
        import hashlib
        suffix_seed = int(hashlib.md5(rel.encode()).hexdigest(), 16)
        # 装饰元素的循环变化
        decos = ["small flower accent", "tiny leaf curl", "gentle sparkle dot",
                 "subtle gem highlight", "soft ribbon touch", "paw-shaped mark"]
        suffix = decos[suffix_seed % len(decos)]
        subject = f"{subject}, with {suffix}"
    return " ".join([
        CREATURE_CORE,
        dimensions_clause(rel),
        format_clause(rel),
        "Asset role: standalone inventory, skill, buff, or set icon.",
        f"Icon concept: {subject}.",
        "Composition: one centered object, thick soft outline, simple readable silhouette, rich but clean colors, gentle top-left highlight, subtle shadow contained inside the subject shape.",
        "Small-scale readability: recognizable at 64px, uncluttered center, consistent icon lighting and border thickness across the icon set, no badge label, no text of any kind. Rarity color ring: white common, blue uncommon, purple epic, gold legendary.",
        CONSISTENCY_CLOSURE,
        PRODUCTION_NOTE_PNG,
    ])


def tile_prompt(rel: str) -> str:
    tokens = tokens_from_path(rel)
    zone = find_zone(tokens)
    palette = TILE_COLOR_PALETTE.get(zone, "soft natural colors")
    # 判断 tile 类型
    kind = "floor"
    for k in ["floor", "wall", "highground", "thorn", "water", "path"]:
        if k in tokens:
            kind = k
            break
    # 地面概念（统一地面 + 自然地貌特征）
    ground_concept = "simple natural ground surface"
    # 地貌特征：只用抽象纹理词汇（grain/line/crack/ridge/groove/wave/gradient），避免形成可识别形状
    terrain_feature = {
        ("abyss", "floor"):      "fine grain texture with subtle crack lines",
        ("abyss", "wall"):       "intersecting line texture with soft ridges",
        ("abyss", "highground"): "smooth gradient texture with gentle wave ridges",
        ("abyss", "thorn"):      "rough grain texture with irregular crack lines",
        ("catacombs", "floor"):      "compacted texture with faint grid lines",
        ("catacombs", "wall"):       "vertical groove texture with soft channels",
        ("catacombs", "highground"): "smooth gradient texture with soft ridge lines",
        ("catacombs", "thorn"):      "irregular line texture with rough edges",
        ("forest", "floor"):      "soft dappled texture with gentle noise",
        ("forest", "wall"):       "woven ridge texture with soft vertical grooves",
        ("forest", "highground"): "smooth gradient texture with curved ridge lines",
        ("forest", "thorn"):      "coarse grain texture with rough crack lines",
        ("swamp", "floor"):      "damp smooth texture with subtle swirl lines",
        ("swamp", "wall"):       "layered line texture with soft horizontal ridges",
        ("swamp", "highground"): "smooth gradient texture with soft ridge lines",
        ("swamp", "thorn"):      "cracked texture with fine irregular lines",
        ("tundra", "floor"):      "frost texture with fine crystalline grain",
        ("tundra", "wall"):       "icy ridge texture with soft vertical grooves",
        ("tundra", "highground"): "smooth gradient texture with wave ridge lines",
        ("tundra", "thorn"):      "frozen crack texture with fine irregular lines",
        ("volcano", "floor"):      "ash texture with fine grain and subtle dark streaks",
        ("volcano", "wall"):       "ridged texture with soft volcanic grooves",
        ("volcano", "highground"): "smooth gradient texture with flow ridge lines",
        ("volcano", "thorn"):      "rough grain texture with irregular crack lines",
    }
    feat = terrain_feature.get((zone, kind), "natural ground surface with subtle terrain variation")
    return " ".join([
        CREATURE_CORE,
        dimensions_clause(rel),
        format_clause(rel),
        f"Ground surface: {ground_concept} using {palette}. "
        f"Geographic texture: {feat}. "
        "Seamless ground tile texture with tileable edges.",
        CONSISTENCY_CLOSURE,
        PRODUCTION_NOTE_PNG,
    ])


def prompt_for(rel: str) -> str:
    category = rel.split("/", 1)[0]
    if category == "ui":
        return ui_prompt(rel)
    if category == "backgrounds":
        return background_prompt(rel)
    if category == "characters":
        # Detect modular character parts (new pipeline)
        if "/parts/" in rel:
            return character_part_prompt(rel)
        return character_prompt(rel)
    if category == "monsters":
        return monster_prompt(rel)
    if category == "bosses":
        return boss_prompt(rel)
    if category == "effects":
        return effect_prompt(rel)
    if category == "icons":
        return icon_prompt(rel)
    if category == "tiles":
        return tile_prompt(rel)
    return " ".join([STYLE_CORE, QUALITY_CORE, SAFE_COPY_CORE, dimensions_clause(rel), f"Asset role: {cleaned_name(rel)}."])


def risk_hits(prompt: str) -> list[str]:
    low = " " + prompt.lower() + " "
    return [term.strip() for term in RISK_SUBSTRINGS if term in low]


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    rels = rel_textures()

    old = {}
    if PROMPTS_PATH.exists():
        old = json.loads(PROMPTS_PATH.read_text(encoding="utf-8"))

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = PROMPTS_PATH.with_name(f"prompts.backup_positive_style_{timestamp}.json")
    if old:
        backup.write_text(json.dumps(old, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    updated = {rel: prompt_for(rel) for rel in rels}

    report = []
    for rel, prompt in updated.items():
        report.append({
            "path": rel,
            "category": rel.split("/", 1)[0],
            "length": len(prompt),
            "risk_hits": risk_hits(prompt),
            "had_previous_prompt": rel in old,
        })

    PROMPTS_PATH.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report_path = OUTPUT_DIR / f"prompts_positive_style_report_{timestamp}.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    summary_path = OUTPUT_DIR / f"prompts_positive_style_summary_{timestamp}.txt"
    counts = Counter(item["category"] for item in report)
    risks = [item for item in report if item["risk_hits"]]
    missing_old = [item["path"] for item in report if not item["had_previous_prompt"]]
    lines = [
        f"updated={len(updated)}",
        f"backup={backup}",
        f"report={report_path}",
        f"risk_count={len(risks)}",
        f"new_prompt_count={len(missing_old)}",
        "category_counts:",
    ]
    for key, count in sorted(counts.items()):
        lines.append(f"  {key}={count}")
    if risks:
        lines.append("risk_samples:")
        for item in risks[:30]:
            lines.append(f"  {item['path']}: {item['risk_hits']}")
    summary_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("\n".join(lines))


if __name__ == "__main__":
    main()
