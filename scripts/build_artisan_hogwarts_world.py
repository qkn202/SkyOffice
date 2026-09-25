"""
Build Artisan Hogwarts Castle World Map (3600 x 2400 px)
Authentic 2.5D Isometric Architecture:
- Pristine 100% Great Hall at center with genuine transparent alpha mask
- 75% Cozy House Common Rooms at 4 corners
- Grand Vaulted Stone Corridors with real flagstones, stone pillars, oil portraits, and torch sconces
- Zero black rectangular cuts, zero flat diagonal ribbons, 100% atmospheric gothic castle
"""

import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

BASE_DIR = '/Users/khang/skyoffice-base'
MAP_V2_DIR = os.path.join(BASE_DIR, 'client/public/assets/map/v2')
OUTPUT_PATH = os.path.join(MAP_V2_DIR, 'hogwarts_castle_world.png')
PREVIEW_PATH = os.path.join(BASE_DIR, 'scripts/artisan_preview.png')

CW, CH = 3600, 2400
gh_x = (CW - 1376) // 2  # 1112
gh_y = (CH - 768) // 2   # 816

SCALE = 0.75
RW_SUB = int(1376 * SCALE)  # 1032
RH_SUB = int(768 * SCALE)   # 576

# 4 House Wings
gry_x, gry_y = 140, 140
sly_x, sly_y = 140, 1680
rav_x, rav_y = 2420, 140
huf_x, huf_y = 2420, 1680

def build_artisan_world():
    print(f"Building Artisan Hogwarts Castle Map ({CW} x {CH} px)...")

    # 1. Base Canvas with Starry Night Sky
    bg_night_path = os.path.join(BASE_DIR, 'client/public/assets/background/backdrop_night.png')
    if os.path.exists(bg_night_path):
        bg_night = Image.open(bg_night_path).resize((CW, CH), Image.Resampling.LANCZOS)
        world = bg_night.convert('RGBA')
    else:
        world = Image.new('RGBA', (CW, CH), (14, 11, 20, 255))

    draw = ImageDraw.Draw(world)

    # Castle Foundation Gradient (Dark ancient stone below y=700)
    for y in range(650, CH):
        alpha = int(min(255, (y - 650) / 600 * 240 + 15))
        draw.rectangle([0, y, CW, y + 1], fill=(12, 10, 18, alpha))

    # 2. Textures: Clean Flagstone & Oil Portraits
    floor_tex = Image.open(os.path.join(BASE_DIR, 'scripts/sample_corridor_floor.png')).convert('RGBA')
    wall_portraits = Image.open(os.path.join(BASE_DIR, 'scripts/sample_wall_portraits.png')).convert('RGBA')
    
    # Crop clean individual portraits from wall_portraits
    portrait_1 = wall_portraits.crop((30, 20, 150, 180)).resize((44, 58), Image.Resampling.LANCZOS)
    portrait_2 = wall_portraits.crop((160, 40, 280, 200)).resize((44, 58), Image.Resampling.LANCZOS)
    portrait_3 = wall_portraits.crop((290, 30, 390, 170)).resize((40, 56), Image.Resampling.LANCZOS)

    # 3. Load Great Hall with its FLAWLESS original alpha mask
    gh_raw = Image.open(os.path.join(BASE_DIR, 'client/public/assets/map/great_hall_25d.png'))
    if gh_raw.mode == 'RGBA':
        gh_rgba = gh_raw
        gh_alpha = gh_raw.split()[3]
    else:
        gh_rgba = gh_raw.convert('RGBA')
        gh_arr = np.array(gh_raw)
        gh_mask = (gh_arr[:, :, 0] > 18) | (gh_arr[:, :, 1] > 18) | (gh_arr[:, :, 2] > 22)
        gh_alpha = Image.fromarray((gh_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
        gh_rgba.putalpha(gh_alpha)

    # Scaled alpha mask for 75% common rooms
    sub_alpha = gh_alpha.resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)

    # Load 4 Common Rooms & apply clean alpha mask
    def load_room(rel_path, is_white=False):
        im = Image.open(os.path.join(BASE_DIR, rel_path))
        if is_white:
            arr = np.array(im)
            mask = ~((arr[:, :, 0] > 230) & (arr[:, :, 1] > 230) & (arr[:, :, 2] > 230))
            mask_im = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
            rgba = im.convert('RGBA')
            rgba.putalpha(mask_im)
        else:
            rgba = im.convert('RGBA')
            rgba.putalpha(gh_alpha)
        return rgba.resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)

    gry_s = load_room('client/public/assets/map/v2/gryffindor_common_room_25d.png')
    sly_s = load_room('client/public/assets/map/v2/slytherin_common_room_25d.png', is_white=True)
    rav_s = load_room('client/public/assets/map/v2/ravenclaw_common_room_25d.png')
    huf_s = load_room('client/public/assets/map/v2/hufflepuff_common_room_25d.png')

    # 4. Render Grand Isometric Corridors
    def render_isometric_corridor(p_gh, p_room, carpet_fill, carpet_border, banner_text, banner_bg, banner_border):
        x1, y1 = p_gh
        x2, y2 = p_room
        dx = x2 - x1
        dy = y2 - y1
        dist = math.hypot(dx, dy)
        steps = max(1, int(dist / 24))
        
        # Perpendicular normal
        nx = -dy / dist
        ny = dx / dist

        # A. Wide Flagstone Foundation (width = 240px)
        half_w = 120
        for s in range(steps + 1):
            t = s / steps
            cx = int(x1 + dx * t)
            cy = int(y1 + dy * t)
            
            # Paste patches of real flagstone floor
            patch_x = cx - 100
            patch_y = cy - 40
            world.paste(floor_tex.crop((50, 20, 250, 100)), (patch_x, patch_y), floor_tex.crop((50, 20, 250, 100)))

        # B. 3D Gothic Stone Walls with Baseboards along Outer Edge
        for side in [-1, 1]:
            # Outer wall line
            wx1 = int(x1 + side * half_w * nx)
            wy1 = int(y1 + side * half_w * ny)
            wx2 = int(x2 + side * half_w * nx)
            wy2 = int(y2 + side * half_w * ny)
            
            # Thick stone parapet & coping stone
            draw.line([(wx1, wy1), (wx2, wy2)], fill=(28, 24, 34, 255), width=14)
            draw.line([(wx1, wy1 - 4), (wx2, wy2 - 4)], fill=(68, 62, 76, 255), width=6)
            draw.line([(wx1, wy1 - 8), (wx2, wy2 - 8)], fill=(95, 88, 105, 255), width=2)

        # C. Velvet Carpet Runner with Gold Braid (width = 64px)
        c_half = 32
        carpet_pts = [
            (int(x1 + c_half * nx), int(y1 + c_half * ny)),
            (int(x2 + c_half * nx), int(y2 + c_half * ny)),
            (int(x2 - c_half * nx), int(y2 - c_half * ny)),
            (int(x1 - c_half * nx), int(y1 - c_half * ny))
        ]
        draw.polygon(carpet_pts, fill=(*carpet_fill, 235), outline=(*carpet_border, 255))
        draw.line([carpet_pts[0], carpet_pts[1]], fill=(*carpet_border, 255), width=3)
        draw.line([carpet_pts[3], carpet_pts[2]], fill=(*carpet_border, 255), width=3)

        # D. Stone Pillars & Oil Portraits along Corridor Midpoints
        mid_x = (x1 + x2) // 2
        mid_y = (y1 + y2) // 2
        
        # Place portraits on wall sides
        port_x1 = int(mid_x + nx * (half_w - 20))
        port_y1 = int(mid_y + ny * (half_w - 20)) - 40
        world.paste(portrait_1, (port_x1 - 22, port_y1 - 29), portrait_1)
        
        port_x2 = int(mid_x - nx * (half_w - 20))
        port_y2 = int(mid_y - ny * (half_w - 20)) - 40
        world.paste(portrait_2, (port_x2 - 22, port_y2 - 29), portrait_2)

        # 3 Pillars with Torches along the corridor (at 25%, 50%, 75%)
        for pct in [0.25, 0.75]:
            px = int(x1 + dx * pct)
            py = int(y1 + dy * pct)
            for side in [-1, 1]:
                pil_x = int(px + side * (half_w - 10) * nx)
                pil_y = int(py + side * (half_w - 10) * ny)
                # Pillar
                draw.rounded_rectangle([pil_x - 10, pil_y - 45, pil_x + 10, pil_y + 35], radius=4,
                                       fill=(52, 45, 60, 255), outline=(24, 20, 30, 255), width=2)
                # Torch Sconce with glowing halo
                draw.ellipse([pil_x - 18, pil_y - 32, pil_x + 18, pil_y + 4], fill=(255, 190, 50, 70))
                draw.ellipse([pil_x - 7, pil_y - 22, pil_x + 7, pil_y - 6], fill=(255, 185, 50, 255))
                draw.ellipse([pil_x - 3, pil_y - 18, pil_x + 3, pil_y - 10], fill=(255, 255, 230, 255))

        # E. Elegant Stone Archway Lintel Banner at Corridor Entrance
        bx = int(x1 + dx * 0.15)
        by = int(y1 + dy * 0.15) - 35
        draw.rounded_rectangle([bx - 95, by - 14, bx + 95, by + 14], radius=6, fill=(*banner_bg, 245), outline=banner_border, width=2)
        draw.text((bx, by), banner_text, fill=(255, 255, 255), anchor="mm")

    # Render the 4 Grand Corridors BEFORE pasting rooms (so rooms sit naturally on top of corridor thresholds)
    # Spoke 1: Great Hall -> Gryffindor
    render_isometric_corridor(
        (gh_x + 200, gh_y + 280), (gry_x + RW_SUB - 120, gry_y + RH_SUB - 70),
        carpet_fill=(140, 15, 25), carpet_border=(220, 175, 45),
        banner_text='🦁 THÁP GRYFFINDOR', banner_bg=(140, 15, 25), banner_border=(220, 175, 45)
    )

    # Spoke 2: Great Hall -> Slytherin
    render_isometric_corridor(
        (gh_x + 200, gh_y + 640), (sly_x + RW_SUB - 120, sly_y + 120),
        carpet_fill=(0, 65, 30), carpet_border=(190, 190, 190),
        banner_text='🐍 HẦM SLYTHERIN', banner_bg=(0, 65, 30), banner_border=(190, 190, 190)
    )

    # Spoke 3: Great Hall -> Ravenclaw
    render_isometric_corridor(
        (gh_x + 1170, gh_y + 280), (rav_x + 120, rav_y + RH_SUB - 70),
        carpet_fill=(12, 35, 75), carpet_border=(205, 130, 50),
        banner_text='🦅 THÁP RAVENCLAW', banner_bg=(12, 35, 75), banner_border=(205, 130, 50)
    )

    # Spoke 4: Great Hall -> Hufflepuff
    render_isometric_corridor(
        (gh_x + 1170, gh_y + 640), (huf_x + 120, huf_y + 120),
        carpet_fill=(200, 145, 15), carpet_border=(45, 35, 25),
        banner_text='🦡 TẦNG HẦM HUFFLEPUFF', banner_bg=(190, 140, 15), banner_border=(45, 35, 25)
    )

    # 5. Paste 4 Common Rooms WITH ALPHA MASK (Zero black rectangular boxes!)
    world.paste(gry_s, (gry_x, gry_y), sub_alpha)
    world.paste(sly_s, (sly_x, sly_y), sub_alpha)
    world.paste(rav_s, (rav_x, rav_y), sub_alpha)
    world.paste(huf_s, (huf_x, huf_y), sub_alpha)

    # 6. Paste Great Hall WITH ITS GENUINE ALPHA MASK (Pristine, 100% transparent corners!)
    world.paste(gh_rgba, (gh_x, gh_y), gh_alpha)

    # 7. Gothic Arch Pillars at Great Hall Doorways
    door_pillars = [
        ((gh_x + 195, gh_y + 265), (255, 185, 55)),
        ((gh_x + 195, gh_y + 655), (60, 230, 120)),
        ((gh_x + 1180, gh_y + 265), (140, 200, 255)),
        ((gh_x + 1180, gh_y + 655), (255, 205, 70)),
    ]
    for pt, col in door_pillars:
        draw.rounded_rectangle([pt[0] - 10, pt[1] - 35, pt[0] + 10, pt[1] + 35], radius=4,
                               fill=(55, 48, 62, 255), outline=(26, 22, 32, 255), width=2)
        draw.ellipse([pt[0] - 16, pt[1] - 25, pt[0] + 16, pt[1] + 7], fill=(*col, 80))
        draw.ellipse([pt[0] - 7, pt[1] - 16, pt[0] + 7, pt[1] - 2], fill=(*col, 255))

    # 8. Save Final Map & Preview
    world.convert('RGB').save(OUTPUT_PATH, format='PNG', optimize=True)
    print(f"Artisan Hogwarts Map saved to {OUTPUT_PATH}!")
    print(f"File size: {os.path.getsize(OUTPUT_PATH) / (1024*1024):.2f} MB")

    preview = world.resize((900, 600), Image.Resampling.LANCZOS)
    preview.convert('RGB').save(PREVIEW_PATH)
    print(f"Preview saved to {PREVIEW_PATH}")

if __name__ == '__main__':
    build_artisan_world()
