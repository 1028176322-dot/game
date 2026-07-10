"""
sync_prompts_from_textures.py
==============================
Reverse-scan from textures directory, sync prompts.json to cover all 499 resources.

Steps:
  1. Read current prompts.json
  2. Scan E:/game/回到地面/assets/resources/textures/ for all real files (skip .meta)
  3. Compare: find missing prompts and suffix mismatches
  4. Fix mismatches: re-key from .png to .jpg (preserve prompt text)
  5. Generate prompts for missing resources using categorized templates
  6. Write updated prompts.json + backup + change report

Usage:
  python tools/sync_prompts_from_textures.py [--dry-run] [--no-backup]
"""

import json
import os
import re
import shutil
import sys
from collections import OrderedDict
from datetime import datetime
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
TEXTURES_DIR  = Path(r"E:/game/回到地面/assets/resources/textures")
PROMPTS_PATH  = Path(r"E:/game/assets/resources/config/prompts.json")
TOOLS_DIR     = Path(r"E:/game/回到地面/tools")
BACKUP_DIR    = TOOLS_DIR / "output"

DRY_RUN = "--dry-run" in sys.argv
SKIP_BACKUP = "--no-backup" in sys.argv

# ── UI Template Bases ──────────────────────────────────────────────────────
# Shared prefix for all UI resources
UI_SAFETY_PREFIX = (
    'APPROVAL-SAFE UI CONTRACT: bright cartoon animal adventure UI only. '
    'No skull, no skeleton, no bones, no corpse, no blood, no red splatter, '
    'no wound, no organs, no anatomical heart, no horror, no grimdark, '
    'no gothic symbols, no scary face, no violent trophy. '
    'NO EMBEDDED TEXT CONTRACT: do not draw words, letters, numbers, English, '
    'pseudo-writing, captions, logos, signatures, watermarks, UI labels, '
    'title text, button text, price text, or placeholder glyph marks. '
    'All readable copy will be rendered by the game engine. '
    'Keep blank UI areas truly blank.'
)

UI_STYLE = (
    'Use smooth clean illustrated shapes, crisp confident outlines, '
    'rounded friendly forms, saturated cheerful colors, and soft painted highlights. '
    'Make it family-safe, cheerful, non-scary, and suitable for a cute animal '
    'themed adventure interface.'
)

UI_BG_INSTRUCTION = (
    'Draw only the reusable UI subject on a plain light neutral off-white '
    'removable background for transparent PNG extraction.'
)

UI_EMPTY_CENTER = (
    'Keep the center mostly clean and low-detail; put decorative strokes, trims, '
    'leaves, gems, ribbons, stars, and tiny animal accents only on borders or corners.'
)

UI_BLANK_SURFACE = (
    'Keep every surface blank and unmarked except for the requested artwork; '
    'all UI copy will be added later in the game engine. Avoid glyph-like marks, '
    'captions, labels, title marks, logo marks, creator marks, and placeholder '
    'markings anywhere in the image.'
)

UI_AVOID = (
    'Do not draw UI mockup screenshots, layout examples, placeholder markings, '
    'black checkerboard previews, blocky mosaic style, gritty dark style, '
    'blurry edges, or compression artifacts.'
)

UI_NEGATIVE = (
    'Negative prompt: skull, skeleton, bones, corpse, blood, gore, wound, '
    'organs, anatomical heart, red splatter, horror, scary, grimdark, gothic, '
    'English text, letters, words, numbers, logo, watermark, signature, '
    'fake writing, pseudo text, caption, label, title, UI mockup, screenshot, '
    'emoji face, portrait, mascot face, body parts, violent trophy.'
)

# Fullscreen BG suffix (for JPG fullscreen UI backgrounds)
TAPTAP_FULLSCREEN_CONTRACT = (
    ' TAPTAP ANDROID QUALITY CONTRACT: high-resolution clean cartoon animal game art '
    'for Android release, sharp readable details at mobile screen size, rich clean colors, '
    'smooth soft highlights, crisp edges, no blur, no muddy compression, '
    'no low-color posterization, no noisy artifacts.'
)

FULLSCREEN_COMPOSITION = (
    ' FULLSCREEN COMPOSITION CONTRACT: complete integrated UI scene background, '
    'no text, no symbols that look like letters, no blank signboards, keep functional '
    'areas visually blended into the environment with soft lighting and natural framing.'
)

LAYOUT_RESERVE = (
    ' LAYOUT RESERVE CONTRACT: reserve clean readable areas for runtime UI labels '
    'and buttons; do not draw sample text, do not draw placeholder characters, '
    'do not draw permanent hero character in the main display area.'
)

# ── Helper: build a UI prompt from parts ──────────────────────────────────

def make_ui_prompt(size: str, subject: str) -> str:
    """Assemble a full UI prompt from size and subject."""
    parts = [
        f"Create a {size} bright colorful cartoon animation game UI asset.",
        UI_STYLE,
        f"The asset subject is: {subject}",
        UI_BG_INSTRUCTION,
        UI_EMPTY_CENTER,
        UI_BLANK_SURFACE,
        UI_AVOID,
        UI_NEGATIVE,
    ]
    return UI_SAFETY_PREFIX + " " + " ".join(parts)


def make_fullscreen_bg_prompt(size: str, subject: str) -> str:
    """Fullscreen JPG UI background (no transparency, no 9-slice)."""
    parts = [
        f"Create a {size} bright colorful cartoon animation game UI background asset.",
        UI_STYLE,
        f"The asset subject is: fullscreen UI background, {subject}",
        "This is a full opaque rectangular scene background, no transparency, no alpha channel.",
        "Draw only the background scene on the full canvas.",
        UI_BLANK_SURFACE,
        UI_AVOID,
        UI_NEGATIVE,
    ]
    return (
        UI_SAFETY_PREFIX
        + " "
        + " ".join(parts)
        + TAPTAP_FULLSCREEN_CONTRACT
        + FULLSCREEN_COMPOSITION
        + LAYOUT_RESERVE
    )


# ── Subject & size generators by filename pattern ─────────────────────────

def basename_no_ext(rpath: str) -> str:
    """Extract just the filename without extension from a relative path."""
    return rpath.rsplit("/", 1)[-1].rsplit(".", 1)[0]

PROMPT_GENERATORS: list[tuple[re.Pattern, str, callable]] = []

def register(pattern: str, size: str, subject_fn: callable):
    PROMPT_GENERATORS.append((re.compile(pattern), size, subject_fn))


# --- Fullscreen UI backgrounds (*_bg.jpg) ---
# Detected by filename ending with _bg and extension .jpg/.png
# We handle these separately in the main loop via a dict lookup

# --- Buttons ---
def btn_subject(name: str) -> str:
    name_no_ext = name.rsplit(".", 1)[0]
    # Remove 'btn_' prefix for a cleaner description
    btn_type = name_no_ext.replace("btn_", "").replace("_", " ")
    return (
        f"blank {btn_type} rounded rectangle button background, "
        f"clean blue-gray surface, empty center area for engine-rendered copy, "
        f"subtle bottom shadow, small corner trim only"
    )

register(r"^ui/.+/btn_", "200x60", btn_subject)

def _topic_name(name: str) -> str:
    """Extract a clean human-readable topic from a filename.
    E.g. 'ui/area/btn_back.png' -> 'back'.
    """
    return basename_no_ext(name).split("_", 1)[-1].replace("_", " ") if "_" in basename_no_ext(name) else basename_no_ext(name)

# --- Panels ---
def panel_subject(name: str) -> str:
    name_no_ext = name.rsplit(".", 1)[0]
    panel_type = name_no_ext.replace("_panel", "").replace("_", " ").strip()
    if not panel_type:
        panel_type = "generic"
    return (
        f"blank {panel_type} panel frame, soft blue-gray parchment surface, "
        f"gold trim, empty center content area, panel frame only"
    )

register(r"^ui/.+/[^/]*panel", "32x32", panel_subject)

# --- Cards ---
def card_subject(name: str) -> str:
    name_no_ext = name.rsplit(".", 1)[0]
    card_type = name_no_ext.replace("_card", "").replace("_", " ").strip()
    return (
        f"blank {card_type} card background, rounded rectangle, "
        f"blue-gray surface, gold border trim, empty center for engine content"
    )

register(r"^ui/.+/[^/]*card", "200x60", card_subject)

# --- Avatars ---
def avatar_subject(name: str) -> str:
    name_no_ext = name.rsplit(".", 1)[0]
    class_name = name_no_ext.replace("avatar_", "").replace("_", " ").strip()
    return (
        f"circular character avatar frame for {class_name} class, "
        f"empty center portrait silhouette placeholder, "
        f"class-colored border ring with tiny icon accent at top-left, "
        f"no actual character drawing inside"
    )

register(r"^ui/.+/avatar_", "64x64", avatar_subject)

# --- Badges ---
def badge_subject(name: str) -> str:
    name_no_ext = name.rsplit(".", 1)[0]
    badge_type = name_no_ext.replace("area_badge_", "").replace("badge", "").replace("_", " ").strip()
    if not badge_type:
        badge_type = name_no_ext.split("/")[-1]
    return (
        f"small {badge_type} badge icon, rounded shape, "
        f"single clean symbol or emoji-like icon centered, no text, no frame text"
    )

register(r"^ui/.+/[^/]*badge", "32x32", badge_subject)

# --- Strips ---
def strip_subject(name: str) -> str:
    name_no_ext = name.rsplit(".", 1)[0]
    strip_type = name_no_ext.replace("_strip", "").replace("_", " ").strip()
    return (
        f"blank horizontal {strip_type} strip banner, "
        f"clean decorative bar, empty center for engine text, border ornament only"
    )

register(r"^ui/.+/[^/]*strip", "400x40", strip_subject)

# --- Miscellaneous simple elements ---
def stat_row_subject(name: str) -> str:
    return (
        "blank statistics row background, horizontal bar, "
        "empty center area for engine-rendered stats, subtle separator lines"
    )

register(r"^ui/log/stat_row", "400x30", stat_row_subject)

def loading_bar_subject(name: str) -> str:
    return (
        "blank loading progress bar background, "
        "horizontal rounded trough, empty fill channel, no symbol"
    )

register(r"^ui/splash/loading_bar", "256x16", loading_bar_subject)

def trophy_icon_subject(name: str) -> str:
    return (
        "trophy achievement icon silhouette, simple cup shape outline, "
        "empty center, no text, no letters, gold trim only"
    )

register(r"^ui/log/trophy_icon", "32x32", trophy_icon_subject)

def soulstone_icon_subject(name: str) -> str:
    return (
        "small purple soul crystal currency icon, faceted gem shape, "
        "soft golden sparkle, single object only"
    )

register(r"^ui/settlement/soulstone_icon", "32x32", soulstone_icon_subject)

def input_name_subject(name: str) -> str:
    return (
        "blank text input field background, "
        "rounded rectangle with light inner shadow, empty typing area, "
        "no text, no cursor drawn"
    )

register(r"^ui/create/input_name", "300x40", input_name_subject)

def character_stage_glow_subject(name: str) -> str:
    return (
        "character preview stage glow effect, "
        "soft radial gradient circle, gentle highlight area, "
        "no subject, no object, just ambient lighting backdrop"
    )

register(r"^ui/create/character_stage_glow", "256x256", character_stage_glow_subject)

# --- Items / slot-like elements ---
register(r"^ui/.+/[^/]*slot", "48x48", lambda n: (
    "empty square item slot frame, simple blue-gray border, "
    "transparent center, tiny corner shine, frame only"
))

register(r"^ui/.+/[^/]*frame", "48x48", lambda n: (
    "empty square UI frame element, clean border, transparent center"
))

# --- Upgrade icons ---
def upgrade_icon_subject(name: str) -> str:
    name_no_ext = name.rsplit(".", 1)[0]
    icon_type = name_no_ext.replace("icon_upgrade_", "").replace("_", " ").strip()
    return (
        f"single clean {icon_type} upgrade skill icon symbol, "
        f"centered, readable at 32px, transparent background, "
        f"no text, no badge letters, no watermark"
    )

register(r"^ui/upgrade/icon_upgrade_", "32x32", upgrade_icon_subject)

# --- Generic catch-all for remaining UI resources ---
register(r"^ui/.+", "32x32", lambda n: (
    f"blank {n.split('/')[-1].rsplit('.', 1)[0].replace('_', ' ')} UI element, "
    f"clean simple shape, no text, no symbols, empty center"
))


# ── Core logic ─────────────────────────────────────────────────────────────

def scan_textures() -> dict[str, str]:
    """Scan textures directory, return {relative_path_with_ext: abs_path}.

    Both the textures dir and os.walk paths use OS-native backslashes on Windows,
    so manual string slicing on the backslash-normalized prefix is reliable.
    """
    found: dict[str, str] = {}
    prefix = str(TEXTURES_DIR)  # e.g. E:\game\回到地面\...\textures
    for root, _dirs, files in os.walk(prefix):
        for fname in files:
            if fname.endswith(".meta"):
                continue
            full = os.path.join(root, fname)  # backslash-separated
            if full.startswith(prefix):
                rel = full[len(prefix):].lstrip("\\/")
            else:
                rel = full  # fallback (should never happen)
            found[rel] = full
    return found


def resource_id(path: str) -> str:
    """Strip extension to get resource ID (used for matching)."""
    return path.rsplit(".", 1)[0]


def load_prompts() -> dict[str, str]:
    with open(str(PROMPTS_PATH), "r", encoding="utf-8") as f:
        return json.load(f)


def save_prompts(data: dict[str, str], path: Path):
    with open(str(path), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def backup_prompts():
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_path = BACKUP_DIR / f"prompts_backup_{ts}.json"
    shutil.copy2(str(PROMPTS_PATH), str(backup_path))
    print(f"[backup] {backup_path}")
    return backup_path


def generate_prompt_for(rpath: str) -> str:
    """Generate a prompt for a missing resource path."""
    # Safety: file must have an extension
    fname = rpath.split("/")[-1]
    if "." not in fname:
        print(f"  [WARN] No extension in {rpath}, using fallback prompt")
        return make_ui_prompt("32x32", f"blank {fname} UI element, no text")

    name_no_ext = fname.rsplit(".", 1)[0]
    ext = fname.rsplit(".", 1)[1].lower()

    # Detect fullscreen UI backgrounds
    if name_no_ext.endswith("_bg"):
        size_map = {
            "area": "256x256",
            "character": "256x256",
            "create": "256x256",
            "equipment": "256x256",
            "event": "256x256",
            "log": "256x256",
            "login": "256x256",
            "settings": "256x256",
            "settlement": "256x256",
            "upgrade": "256x256",
        }
        subdir = rpath.split("/")[1]
        size = size_map.get(subdir, "256x256")
        bg_type = name_no_ext.replace("_bg", "").replace("_", " ").strip()
        scene_suffix = f"cheerful {bg_type} scene background for UI panel"
        return make_fullscreen_bg_prompt(size, scene_suffix)

    # Try registered generators
    for pattern, size, subject_fn in PROMPT_GENERATORS:
        if pattern.search(rpath):
            subject = subject_fn(rpath)
            return make_ui_prompt(size, subject)

    # Ultimate fallback
    return make_ui_prompt("32x32", f"blank UI element placeholder for {name_no_ext.replace('_', ' ')}")


def main():
    print("=" * 60)
    print(f"sync_prompts_from_textures.py")
    print(f"DRY_RUN={DRY_RUN}")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 60)

    # 1. Load current prompts
    prompts = load_prompts()
    print(f"\n[phase 1] Loaded prompts.json: {len(prompts)} entries")

    # 2. Scan textures
    textures = scan_textures()
    print(f"[phase 2] Scanned textures: {len(textures)} files")

    # 3. Build lookup by resource ID (no extension)
    # Normalise scan keys from backslashes to forward slashes for consistent comparison
    textures_norm: dict[str, str] = {}
    for rel_key, full_path in textures.items():
        norm_key = rel_key.replace("\\", "/")
        textures_norm[norm_key] = full_path

    texture_by_id: dict[str, str] = {}  # resource_id -> full absolute path
    for rp_norm, full_path in textures_norm.items():
        rid = resource_id(rp_norm)
        texture_by_id[rid] = full_path

    # 4. Build prompt lookup by resource ID
    prompt_by_id: dict[str, str] = {}  # resource_id -> prompt text
    for key, text in prompts.items():
        rid = resource_id(key)
        prompt_by_id[rid] = text

    # 5. Compare and find issues
    missing_prompts: list[str] = []
    suffix_mismatches: list[tuple[str, str, str]] = []  # (resource_id, old_key, new_key)
    matched_ok = 0

    for rid, actual_path in sorted(texture_by_id.items()):
        if rid in prompt_by_id:
            # Check extension match
            prompt_key = [k for k in prompts if resource_id(k) == rid][0]
            actual_ext = actual_path.rsplit(".", 1)[1]
            prompt_ext = prompt_key.rsplit(".", 1)[1]
            if prompt_ext != actual_ext:
                suffix_mismatches.append((rid, prompt_key, actual_path))
            else:
                matched_ok += 1
        else:
            missing_prompts.append(actual_path)

    print(f"\n[phase 3] Comparison results:")
    print(f"  Matched OK:          {matched_ok}")
    print(f"  Suffix mismatches:   {len(suffix_mismatches)}")
    print(f"  Missing prompts:     {len(missing_prompts)}")
    print(f"  Total (textures):    {len(textures)}")

    # Helper: full absolute path -> relative path (forward slashes)
    textures_dir_str = str(TEXTURES_DIR)

    def to_rpath(full_path: str) -> str:
        if full_path.startswith(textures_dir_str):
            raw = full_path[len(textures_dir_str):].lstrip("\\/")
        else:
            raw = full_path
        return raw.replace("\\", "/")

    # 6. Fix suffix mismatches
    fixes: list[dict] = []
    updated = dict(prompts)  # work on a copy

    for rid, old_key, actual_path in suffix_mismatches:
        new_key = to_rpath(actual_path)
        old_text = updated.pop(old_key)
        updated[new_key] = old_text
        fixes.append({
            "resource_id": rid,
            "old_key": old_key,
            "new_key": new_key,
            "action": "rekey",
        })
        print(f"  [fix] {old_key} -> {new_key}")

    # 7. Generate prompts for missing resources
    additions: list[dict] = []
    for actual_path in sorted(missing_prompts):
        rpath = to_rpath(actual_path)
        prompt_text = generate_prompt_for(rpath)
        updated[rpath] = prompt_text
        additions.append({
            "path": rpath,
            "action": "generated",
            "prompt_length": len(prompt_text),
        })
        print(f"  [add] {rpath} ({len(prompt_text)} chars)")

    # 8. Verify counts
    expected_count = len(textures)
    actual_count = len(updated)
    print(f"\n[phase 4] Count check:")
    print(f"  Expected (textures):  {expected_count}")
    print(f"  Actual (prompts):     {actual_count}")
    assert actual_count == expected_count, f"Count mismatch! {actual_count} != {expected_count}"

    # 9. Write output
    if not DRY_RUN:
        if not SKIP_BACKUP:
            backup_prompts()
        save_prompts(updated, PROMPTS_PATH)
        print(f"\n[write] Updated prompts.json saved to {PROMPTS_PATH}")

    # 10. Write change report
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "prompts_before": len(prompts),
            "textures_found": len(textures),
            "matched_ok": matched_ok,
            "suffix_mismatches_fixed": len(fixes),
            "missing_prompts_generated": len(additions),
            "prompts_after": len(updated),
        },
        "fixes": fixes,
        "additions": additions,
    }

    report_path = BACKUP_DIR / f"prompts_sync_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    if not DRY_RUN:
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        with open(str(report_path), "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"[report] {report_path}")

    print("\n" + "=" * 60)
    print("Done.")
    print("=" * 60)


if __name__ == "__main__":
    main()
