"""
Build Hub & Spoke Hogwarts Castle World Map (3600 x 2400 px)
- Floor & architecture: 100% unified with Great Hall & 4 House Common Rooms (sampled directly from castle stone).
- Removed all corridor candles/torches per user request.
- Clean medieval gothic stone balustrades, carved stone pillars & finials.
- Fully connected: corridors penetrate deeply into each room, zero black voids.
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
        # Slytherin room has white background [225..255]
        mask = ~((arr[:, :, 0] > 225) & (arr[:, :, 1] > 225) & (arr[:, :, 2] > 225))
    else:
        # If alpha already present and non-trivial
        if arr.shape[2] == 4 and np.any(arr[:, :, 3] == 0):
            return rgba
        mask = (arr[:, :, 0] > 14) | (arr[:, :, 1] > 14) | (arr[:, :, 2] > 14)
        
    mask_im = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    rgba.putalpha(mask_im)
    return rgba

def build_map():
    print(f"Building Unified Hogwarts Castle Map ({CW} x {CH} px)...")

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

    # 2. Sample Authentic Stone Floor Directly from Great Hall
    gh_raw = Image.open(os.path.join(BASE_DIR, 'client/public/assets/map/great_hall_25d.png')).convert('RGBA')
    # 64x64 clean stone flagstone tile from Great Hall floor
    gh_tile = gh_raw.crop((540, 580, 604, 644)).convert('RGBA')

    # Load TrueType font for Vietnamese support
    font_path = '/System/Library/Fonts/Supplemental/Arial.ttf'
    if not os.path.exists(font_path):
        font_path = '/System/Library/Fonts/Helvetica.ttc'
    font_banner = ImageFont.truetype(font_path, 16)

    # 3. Draw Grand Castle Corridors (Stone balustrades, NO CANDLES, authentic castle stone floor)
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
        draw.polygon(shadow_pts, fill=(8, 6, 12, 210))
        
        # 2. Stone Walkway Mask & Textured Flagstone Fill (Identical to Great Hall floor)
        corridor_mask = Image.new('L', (CW, CH), 0)
        mask_draw = ImageDraw.Draw(corridor_mask)
        mask_draw.polygon(poly_pts, fill=255)
        
        min_x = max(0, int(min(p[0] for p in poly_pts)))
        max_x = min(CW, int(max(p[0] for p in poly_pts)))
        min_y = max(0, int(min(p[1] for p in poly_pts)))
        max_y = min(CH, int(max(p[1] for p in poly_pts)))
        
        texture_layer = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
        for fx in range(min_x, max_x, 64):
            for fy in range(min_y, max_y, 64):
                texture_layer.paste(gh_tile, (fx, fy))
                
        world.paste(texture_layer, (0, 0), corridor_mask)

        # B. Medieval Castle Stone Balustrades (Clean stone railings, NO CANDLES)
        w_curb = width // 2
        for side in [-1, 1]:
            curb_x1 = int(x1 + side * w_curb * nx)
            curb_y1 = int(y1 + side * w_curb * ny)
            curb_x2 = int(x2 + side * w_curb * nx)
            curb_y2 = int(y2 + side * w_curb * ny)
            
            # Thick gothic carved limestone rail (matching castle wall stone palette)
            draw.line([(curb_x1, curb_y1), (curb_x2, curb_y2)], fill=(42, 34, 28, 255), width=18)
            draw.line([(curb_x1, curb_y1), (curb_x2, curb_y2)], fill=(85, 72, 62, 255), width=10)
            draw.line([(curb_x1, curb_y1 - 2), (curb_x2, curb_y2 - 2)], fill=(128, 112, 100, 255), width=3)
            
            # Carved stone pillars & baluster caps along the parapet (NO CANDLES/TORCHES)
            p_steps = max(2, int(dist / 95))
            for p_s in range(1, p_steps):
                t = p_s / p_steps
                px = int(x1 + dx * t + side * w_curb * nx)
                py = int(y1 + dy * t + side * w_curb * ny)
                
                # Stone pillar shaft
                draw.rounded_rectangle([px - 8, py - 28, px + 8, py + 18], radius=3,
                                       fill=(75, 64, 55, 255), outline=(38, 30, 24, 255), width=2)
                # Carved stone top finial cap
                draw.rectangle([px - 10, py - 32, px + 10, py - 26], fill=(120, 105, 94, 255), outline=(42, 34, 28, 255))
                draw.ellipse([px - 5, py - 38, px + 5, py - 30], fill=(140, 125, 112, 255), outline=(42, 34, 28, 255))

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
        
        # Cross-stripes for rich textile depth
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
        width=200, carpet_color=(135, 18, 28), border_color=(220, 175, 45)
    )

    # Spoke 2: Great Hall (1700, 1450) -> Slytherin Dungeon (750, 1920)
    draw_grand_corridor(
        (1700, 1450), (750, 1920),
        width=200, carpet_color=(15, 68, 38), border_color=(195, 200, 205)
    )

    # Spoke 3: Great Hall (2250, 1120) -> Ravenclaw Tower (2820, 560)
    draw_grand_corridor(
        (2250, 1120), (2820, 560),
        width=200, carpet_color=(18, 42, 88), border_color=(210, 140, 50)
    )

    # Spoke 4: Great Hall (1950, 1450) -> Hufflepuff Basement (2850, 1920)
    draw_grand_corridor(
        (1950, 1450), (2850, 1920),
        width=200, carpet_color=(195, 145, 18), border_color=(52, 40, 30)
    )

    # 5. Load and Process the 5 Rooms with Genuine Alpha Masks
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

    # 8. Grand Gothic Portal Archways at Corridor Entrances (NO CANDLES)
    portals = [
        (1330, 1140, '🦁 THÁP GRYFFINDOR', (135, 18, 28), (220, 175, 45)),
        (1680, 1460, '🐍 HẦM SLYTHERIN', (15, 68, 38), (195, 200, 205)),
        (2270, 1140, '🦅 THÁP RAVENCLAW', (18, 42, 88), (210, 140, 50)),
        (1970, 1460, '🦡 TẦNG HẦM HUFFLEPUFF', (195, 145, 18), (52, 40, 30)),
    ]

    for px, py, text, bg_col, border_col in portals:
        # Two Carved Limestone Pillars (framing the doorway)
        for cx in [px - 75, px + 75]:
            # Pillar column
            draw.rounded_rectangle([cx - 8, py - 40, cx + 8, py + 25], radius=4,
                                   fill=(72, 60, 52, 255), outline=(36, 28, 22, 255), width=2)
            # Stone capital finial
            draw.rectangle([cx - 10, py - 45, cx + 10, py - 38], fill=(125, 110, 98, 255), outline=(36, 28, 22, 255))
            draw.ellipse([cx - 5, py - 50, cx + 5, py - 42], fill=(145, 130, 118, 255), outline=(36, 28, 22, 255))

        # Carved Stone Arch Lintel Banner
        banner_w = 210
        banner_h = 32
        by = py - 45
        draw.rounded_rectangle([px - banner_w // 2, by - banner_h // 2, px + banner_w // 2, by + banner_h // 2],
                               radius=8, fill=(*bg_col, 245), outline=border_col, width=2)
        # Inner metallic trim
        draw.rounded_rectangle([px - banner_w // 2 + 3, by - banner_h // 2 + 3, px + banner_w // 2 - 3, by + banner_h // 2 - 3],
                               radius=6, fill=None, outline=(*border_col, 160), width=1)
        # Render clean Vietnamese text
        draw.text((px, by), text, font=font_banner, fill=(255, 255, 255, 255), anchor="mm")

    # 9. Save Output Map & Previews
    world.convert('RGB').save(OUTPUT_PATH, format='PNG', optimize=True)
    print(f"Unified Hogwarts Map saved successfully at {OUTPUT_PATH}!")
    print(f"File size: {os.path.getsize(OUTPUT_PATH) / (1024 * 1024):.2f} MB")

    preview = world.resize((900, 600), Image.Resampling.LANCZOS)
    preview.convert('RGB').save(PREVIEW_PATH)
    print(f"Preview saved to {PREVIEW_PATH}")

    # Zoomed crop around Slytherin corridor (x: 600..1850, y: 1300..2150)
    crop_sly = world.crop((600, 1300, 1850, 2150)).convert('RGB')
    crop_sly.save(CROP_PREVIEW_PATH)
    print(f"Slytherin connection crop saved to {CROP_PREVIEW_PATH}")

if __name__ == '__main__':
    build_map()
