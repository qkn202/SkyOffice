"""
Build Hub & Spoke Hogwarts Castle World Map (3600 x 2400 px)
- Hub (Center, 100% scale): Great Hall (1376 x 768) - pristine genuine alpha mask, zero black cuts.
- Spokes (4 Wings, 75% scale): Gryffindor (Top-Left), Slytherin (Bottom-Left),
  Ravenclaw (Top-Right), Hufflepuff (Bottom-Right).
- Connected by grand stone archways and flagstone corridors that penetrate deeply into each room.
- Zero black gaps, zero disconnections, authentic medieval gothic aesthetic.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

BASE_DIR = '/Users/khang/skyoffice-base'
MAP_V2_DIR = os.path.join(BASE_DIR, 'client/public/assets/map/v2')
OUTPUT_PATH = os.path.join(MAP_V2_DIR, 'hogwarts_castle_world.png')
PREVIEW_PATH = os.path.join(BASE_DIR, 'scripts/hub_spoke_final_preview.png')
CROP_PREVIEW_PATH = os.path.join(BASE_DIR, 'scripts/debug_slytherin_crop.png')

CW, CH = 3600, 2400
gh_x = (CW - 1376) // 2  # 1112
gh_y = (CH - 768) // 2   # 816

SCALE = 0.75
RW_SUB = int(1376 * SCALE)  # 1032
RH_SUB = int(768 * SCALE)   # 576

# 4 House Wings (Spokes)
gry_x, gry_y = 140, 140
sly_x, sly_y = 140, 1680
rav_x, rav_y = 2420, 140
huf_x, huf_y = 2420, 1680

def get_clean_room(img, is_white=False):
    """Generates an accurate RGBA image with transparent background (no black/white boxes)."""
    rgba = img.convert('RGBA')
    arr = np.array(rgba)
    
    if is_white:
        # Slytherin has white background [250..255]
        mask = ~((arr[:, :, 0] > 225) & (arr[:, :, 1] > 225) & (arr[:, :, 2] > 225))
    else:
        # Check if alpha channel already exists and is non-trivial
        if arr.shape[2] == 4 and np.any(arr[:, :, 3] == 0):
            return rgba
        # Otherwise filter out pure black void
        mask = (arr[:, :, 0] > 14) | (arr[:, :, 1] > 14) | (arr[:, :, 2] > 14)
        
    mask_im = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    rgba.putalpha(mask_im)
    return rgba

def build_map():
    print(f"Building Fully Connected Hogwarts Castle Map ({CW} x {CH} px)...")

    # 1. Base Canvas with Starry Night Sky
    bg_night_path = os.path.join(BASE_DIR, 'client/public/assets/background/backdrop_night.png')
    if os.path.exists(bg_night_path):
        bg_night = Image.open(bg_night_path).resize((CW, CH), Image.Resampling.LANCZOS)
        world = bg_night.convert('RGBA')
    else:
        world = Image.new('RGBA', (CW, CH), (14, 11, 20, 255))

    draw = ImageDraw.Draw(world)

    # Castle Foundation Depth Gradient
    for y in range(700, CH):
        alpha = int(min(255, (y - 700) / 600 * 240 + 15))
        draw.rectangle([0, y, CW, y + 1], fill=(12, 10, 18, alpha))

    # 2. Flagstone Tile from FloorAndGround.png
    fg_path = os.path.join(BASE_DIR, 'client/public/assets/map/FloorAndGround.png')
    fg = Image.open(fg_path)
    flag_tile = fg.crop((960, 192, 992, 224)).convert('RGBA')

    # Load TrueType font for Vietnamese support
    font_path = '/System/Library/Fonts/Supplemental/Arial.ttf'
    if not os.path.exists(font_path):
        font_path = '/System/Library/Fonts/Helvetica.ttc'
    font_banner = ImageFont.truetype(font_path, 16)

    # 3. Function to draw a grand castle corridor connecting two rooms
    def draw_grand_corridor(p1, p2, width=200, carpet_color=(120, 20, 30), border_color=(210, 160, 40)):
        x1, y1 = p1
        x2, y2 = p2
        dx = x2 - x1
        dy = y2 - y1
        dist = math.hypot(dx, dy)
        if dist == 0:
            return
            
        nx = -dy / dist
        ny = dx / dist
        
        # A. Polygonal Stone Walkway Foundation
        w_half = width // 2 + 15
        poly_pts = [
            (x1 + w_half * nx, y1 + w_half * ny),
            (x2 + w_half * nx, y2 + w_half * ny),
            (x2 - w_half * nx, y2 - w_half * ny),
            (x1 - w_half * nx, y1 - w_half * ny)
        ]
        
        # 1. Bridge Drop Shadow (deep soft shadow underneath)
        shadow_offset_y = 65
        shadow_pts = [(p[0], p[1] + shadow_offset_y) for p in poly_pts]
        draw.polygon(shadow_pts, fill=(6, 5, 10, 210))
        
        # 2. Stone Walkway Mask & Textured Flagstone Fill
        corridor_mask = Image.new('L', (CW, CH), 0)
        mask_draw = ImageDraw.Draw(corridor_mask)
        mask_draw.polygon(poly_pts, fill=255)
        
        min_x = max(0, int(min(p[0] for p in poly_pts)))
        max_x = min(CW, int(max(p[0] for p in poly_pts)))
        min_y = max(0, int(min(p[1] for p in poly_pts)))
        max_y = min(CH, int(max(p[1] for p in poly_pts)))
        
        texture_layer = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
        for fx in range(min_x, max_x, 32):
            for fy in range(min_y, max_y, 32):
                texture_layer.paste(flag_tile, (fx, fy))
                
        world.paste(texture_layer, (0, 0), corridor_mask)

        # B. Medieval Castle Parapets (Left & Right Railings)
        w_curb = width // 2
        for side in [-1, 1]:
            curb_x1 = int(x1 + side * w_curb * nx)
            curb_y1 = int(y1 + side * w_curb * ny)
            curb_x2 = int(x2 + side * w_curb * nx)
            curb_y2 = int(y2 + side * w_curb * ny)
            
            # Thick gothic stone rail
            draw.line([(curb_x1, curb_y1), (curb_x2, curb_y2)], fill=(20, 16, 26, 255), width=18)
            draw.line([(curb_x1, curb_y1), (curb_x2, curb_y2)], fill=(55, 48, 65, 255), width=10)
            draw.line([(curb_x1, curb_y1 - 2), (curb_x2, curb_y2 - 2)], fill=(90, 82, 100, 255), width=3)
            
            # Carved stone pillars with torch sconces along the parapet
            p_steps = max(2, int(dist / 110))
            for p_s in range(1, p_steps):
                t = p_s / p_steps
                px = int(x1 + dx * t + side * w_curb * nx)
                py = int(y1 + dy * t + side * w_curb * ny)
                
                # Pillar base & cap
                draw.rounded_rectangle([px - 10, py - 35, px + 10, py + 25], radius=4,
                                       fill=(45, 38, 55, 255), outline=(22, 18, 28, 255), width=2)
                draw.rectangle([px - 6, py - 12, px + 6, py - 4], fill=(26, 22, 32, 255))
                
                # Torch Flame & Ambient Glow Halo
                draw.ellipse([px - 16, py - 26, px + 16, py + 6], fill=(255, 175, 40, 75))
                draw.ellipse([px - 7, py - 18, px + 7, py - 4], fill=(255, 185, 45, 255))
                draw.ellipse([px - 3, py - 15, px + 3, py - 8], fill=(255, 255, 230, 255))

        # C. Velvet Carpet Runner down the corridor center (width = 68px)
        c_half = 34
        carpet_pts = [
            (int(x1 + c_half * nx), int(y1 + c_half * ny)),
            (int(x2 + c_half * nx), int(y2 + c_half * ny)),
            (int(x2 - c_half * nx), int(y2 - c_half * ny)),
            (int(x1 - c_half * nx), int(y1 - c_half * ny))
        ]
        
        # Carpet base
        draw.polygon(carpet_pts, fill=(*carpet_color, 245), outline=(*border_color, 255))
        
        # Gold/silver embroidered borders
        draw.line([carpet_pts[0], carpet_pts[1]], fill=(*border_color, 255), width=4)
        draw.line([carpet_pts[3], carpet_pts[2]], fill=(*border_color, 255), width=4)
        
        # Cross-stripes for textile realism
        stripe_steps = max(2, int(dist / 36))
        for s in range(1, stripe_steps):
            t = s / stripe_steps
            sx = int(x1 + dx * t)
            sy = int(y1 + dy * t)
            sx1 = int(sx + (c_half - 3) * nx)
            sy1 = int(sy + (c_half - 3) * ny)
            sx2 = int(sx - (c_half - 3) * nx)
            sy2 = int(sy - (c_half - 3) * ny)
            dark_stripe = (int(carpet_color[0] * 0.72), int(carpet_color[1] * 0.72), int(carpet_color[2] * 0.72), 160)
            draw.line([(sx1, sy1), (sx2, sy2)], fill=dark_stripe, width=3)

    # 4. Draw the 4 Corridors FIRST (Connecting deeply into room floor coordinates)
    # Spoke 1: Great Hall (1350, 1120) -> Gryffindor Tower (780, 560)
    draw_grand_corridor(
        (1350, 1120), (780, 560),
        width=200, carpet_color=(140, 15, 25), border_color=(225, 180, 45)
    )

    # Spoke 2: Great Hall (1700, 1450) -> Slytherin Dungeon (750, 1920)
    draw_grand_corridor(
        (1700, 1450), (750, 1920),
        width=200, carpet_color=(10, 70, 35), border_color=(200, 205, 210)
    )

    # Spoke 3: Great Hall (2250, 1120) -> Ravenclaw Tower (2820, 560)
    draw_grand_corridor(
        (2250, 1120), (2820, 560),
        width=200, carpet_color=(15, 40, 90), border_color=(215, 140, 50)
    )

    # Spoke 4: Great Hall (1950, 1450) -> Hufflepuff Basement (2850, 1920)
    draw_grand_corridor(
        (1950, 1450), (2850, 1920),
        width=200, carpet_color=(205, 150, 15), border_color=(50, 40, 30)
    )

    # 5. Load and Process the 5 Rooms with Genuine Alpha Masks
    gh_raw = Image.open(os.path.join(BASE_DIR, 'client/public/assets/map/great_hall_25d.png')).convert('RGBA')
    gry_raw = Image.open(os.path.join(MAP_V2_DIR, 'gryffindor_common_room_25d.png')).convert('RGBA')
    sly_raw = Image.open(os.path.join(MAP_V2_DIR, 'slytherin_common_room_25d.png')).convert('RGBA')
    rav_raw = Image.open(os.path.join(MAP_V2_DIR, 'ravenclaw_common_room_25d.png')).convert('RGBA')
    huf_raw = Image.open(os.path.join(MAP_V2_DIR, 'hufflepuff_common_room_25d.png')).convert('RGBA')

    gh_clean = get_clean_room(gh_raw)
    gry_s = get_clean_room(gry_raw).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)
    sly_s = get_clean_room(sly_raw, is_white=True).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)
    rav_s = get_clean_room(rav_raw).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)
    huf_s = get_clean_room(huf_raw).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)

    # 6. Paste 4 Common Rooms WITH ALPHA MASK (Zero black/white cuts)
    world.paste(gry_s, (gry_x, gry_y), gry_s)
    world.paste(sly_s, (sly_x, sly_y), sly_s)
    world.paste(rav_s, (rav_x, rav_y), rav_s)
    world.paste(huf_s, (huf_x, huf_y), huf_s)

    # 7. Paste Great Hall WITH ALPHA MASK (Seamless blend, zero opaque black box)
    world.paste(gh_clean, (gh_x, gh_y), gh_clean)

    # 8. Grand Gothic Portal Archways at Corridor Entrances
    portals = [
        # (Center X, Center Y, Width, Text, Sconce Color, Bg Color, Border Color)
        (1330, 1140, '🦁 THÁP GRYFFINDOR', (255, 185, 45), (135, 15, 25), (225, 180, 45)),
        (1680, 1460, '🐍 HẦM SLYTHERIN', (60, 230, 120), (10, 65, 30), (200, 205, 210)),
        (2270, 1140, '🦅 THÁP RAVENCLAW', (140, 200, 255), (15, 35, 85), (215, 140, 50)),
        (1970, 1460, '🦡 TẦNG HẦM HUFFLEPUFF', (255, 205, 70), (195, 145, 15), (50, 40, 30)),
    ]

    for px, py, text, sconce_col, bg_col, border_col in portals:
        # Two Stone Columns
        for cx in [px - 75, px + 75]:
            draw.rounded_rectangle([cx - 8, py - 40, cx + 8, py + 25], radius=4,
                                   fill=(50, 42, 60, 255), outline=(22, 18, 28, 255), width=2)
            # Torch Sconce
            draw.ellipse([cx - 14, py - 28, cx + 14, py + 4], fill=(*sconce_col, 85))
            draw.ellipse([cx - 6, py - 20, cx + 6, py - 6], fill=(*sconce_col, 255))
            draw.ellipse([cx - 2, py - 17, cx + 2, py - 10], fill=(255, 255, 235, 255))

        # Carved Stone Arch Lintel Banner
        banner_w = 210
        banner_h = 32
        by = py - 45
        draw.rounded_rectangle([px - banner_w // 2, by - banner_h // 2, px + banner_w // 2, by + banner_h // 2],
                               radius=8, fill=(*bg_col, 245), outline=border_col, width=2)
        # Gold inner trim
        draw.rounded_rectangle([px - banner_w // 2 + 3, by - banner_h // 2 + 3, px + banner_w // 2 - 3, by + banner_h // 2 - 3],
                               radius=6, fill=None, outline=(*border_col, 160), width=1)
        # Render Vietnamese Text cleanly
        draw.text((px, by), text, font=font_banner, fill=(255, 255, 255, 255), anchor="mm")

    # 9. Save Output Map & Previews
    world.convert('RGB').save(OUTPUT_PATH, format='PNG', optimize=True)
    print(f"Hub & Spoke Map saved successfully at {OUTPUT_PATH}!")
    print(f"File size: {os.path.getsize(OUTPUT_PATH) / (1024 * 1024):.2f} MB")

    preview = world.resize((900, 600), Image.Resampling.LANCZOS)
    preview.convert('RGB').save(PREVIEW_PATH)
    print(f"Preview saved to {PREVIEW_PATH}")

    # Zoomed crop around Slytherin corridor (x: 600..1800, y: 1300..2100) to inspect connection
    crop_sly = world.crop((600, 1300, 1850, 2150)).convert('RGB')
    crop_sly.save(CROP_PREVIEW_PATH)
    print(f"Slytherin connection crop saved to {CROP_PREVIEW_PATH}")

if __name__ == '__main__':
    build_map()
