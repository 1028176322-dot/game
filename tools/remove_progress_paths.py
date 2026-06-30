#!/usr/bin/env python3
"""Remove specific paths from gen_missing_progress.json completed_paths."""
import json

progress_file = r'E:\game\.workbuddy\gen_missing_progress.json'

with open(progress_file, 'r', encoding='utf-8') as f:
    progress = json.load(f)

completed = progress.get('completed_paths', [])
print(f'Before: {len(completed)} completed paths')

to_remove = {
    'backgrounds/bg_room_shop.png',
    'backgrounds/bg_combat_catacombs.png',
    'backgrounds/bg_event_tundra.png',
    'backgrounds/bg_event_catacombs.png',
    'backgrounds/bg_room_upgrade.png',
}

new_completed = [p for p in completed if p not in to_remove]
removed = len(completed) - len(new_completed)
progress['completed_paths'] = new_completed
print(f'Removed: {removed} paths')
print(f'After: {len(new_completed)} completed paths')

with open(progress_file, 'w', encoding='utf-8') as f:
    json.dump(progress, f, indent=2)

print('Done!')
