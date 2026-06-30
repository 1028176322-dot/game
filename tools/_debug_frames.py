"""Debug: run guess_frame_info directly on boss files"""
import sys
sys.path.insert(0, r'E:\game\tools')

# Inline the function to avoid import issues
def guess_frame_info(w, h):
    known_patterns = [
        {"min_w": 64, "max_w": 96, "min_h": 64, "max_h": 96, "frames": 1},
        {"min_w": 32, "max_w": 48, "min_h": 32, "max_h": 48, "frames": 1},
        {"min_w": 500, "frames": 1},
        {"min_w": 48, "max_w": 48, "min_h": 100, "single_h": 64, "frames": lambda h: h // 64},
        {"min_w": 32, "max_w": 80, "min_h": 120, "single_h": 48, "frames": lambda h: h // 48},
        {"min_w": 64, "max_w": 96, "min_h": 200, "single_h": 64, "frames": lambda h: h // 64},
    ]
    for p in known_patterns:
        min_w = p.get("min_w", 0)
        max_w = p.get("max_w", 99999)
        min_h = p.get("min_h", 0)
        max_h = p.get("max_h", 99999)
        if min_w <= w <= max_w and min_h <= h <= max_h:
            frames = p["frames"]
            if callable(frames):
                fc = frames(h)
                fh = h // fc if fc > 0 else h
                if fc > 1 and h % fh == 0:
                    return {"frame_w": w, "frame_h": fh, "frame_count": fc, "layout": "vertical"}
            return {"frame_w": w, "frame_h": h, "frame_count": 1, "layout": "single"}
    return {"frame_w": w, "frame_h": h, "frame_count": 1, "layout": "single"}

# Test
tests = [(64, 256), (64, 320), (64, 384), (96, 96), (48, 256), (48, 384)]
for w, h in tests:
    result = guess_frame_info(w, h)
    print(f'{w}x{h}: {result}')
