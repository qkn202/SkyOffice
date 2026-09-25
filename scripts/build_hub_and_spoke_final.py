"""
Build Hub & Spoke Hogwarts Castle World Map (3600 x 2400 px) - Compact & Unified
- Floor: Authentic medieval flagstone stone slabs (clean, zero table/bench artifacts).
- Distances between 4 Houses and Great Hall narrowed down by ~50% for fast navigation.
- Removed all candles/torches per user request.
- Clean gothic stone balustrades with carved limestone finials.
- Corridors penetrate deeply into each room, zero gaps, zero black cuts.
"""

import os
import math
from collections import deque
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

# 4 House Wings (Brought significantly closer to Great Hall)
# Shifted towards center: delta_x = 400px, delta_y = 180px
gry_x, gry_y = 540, 320
sly_x, sly_y = 540, 1520
rav_x, rav_y = 2020, 320
huf_x, huf_y = 2020, 1520

def get_clean_room(img, is_white=False):
    """Generates an accurate RGBA image with transparent background (no black/white boxes).
    Uses border-connected BFS flood fill to guarantee zero holes inside dark furniture/shadows."""
    rgba = img.convert('RGBA')
    arr = np.array(rgba)
    h, w, _ = arr.shape
    
    if is_white:
        is_void = (arr[:, :, 0] > 220) & (arr[:, :, 1] > 220) & (arr[:, :, 2] > 220)
    else:
        is_void = (arr[:, :, 0] < 18) & (arr[:, :, 1] < 18) & (arr[:, :, 2] < 18)
        if arr.shape[2] == 4:
            is_void = is_void | (arr[:, :, 3] < 30)

    visited = np.zeros((h, w), dtype=bool)
    q = deque()

    for y in range(h):
        for x in (0, w - 1):
            if is_void[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if is_void[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((y, x))

    while q:
        cy, cx = q.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not visited[ny, nx] and is_void[ny, nx]:
                    visited[ny, nx] = True
                    q.append((ny, nx))

    alpha = (~visited * 255).astype(np.uint8)
    mask_im = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8))
    rgba.putalpha(mask_im)
    return rgba

def generate_clean_flagstone_tile():
    """Generates an authentic medieval castle stone flagstone tile (64x64) with zero artifacts."""
    tile = Image.new('RGBA', (64, 64), (48, 36, 30, 255))
    draw = ImageDraw.Draw(tile)
    
    # 4 distinct interlocking rectangular castle flagstones matching Great Hall floor palette
    stones = [
        (1, 1, 30, 29, (108, 82, 70)),
        (33, 1, 62, 31, (98, 74, 62)),
        (1, 32, 31, 62, (114, 86, 74)),
        (34, 34, 62, 62, (104, 78, 66)),
    ]
    for x0, y0, x1, y1, col in stones:
        draw.rectangle([x0, y0, x1, y1], fill=(*col, 255))
        # Bevel highlight (top & left)
        hl = (min(255, col[0] + 24), min(255, col[1] + 24), min(255, col[2] + 24), 255)
        draw.line([x0, y0, x1, y0], fill=hl)
        draw.line([x0, y0, x0, y1], fill=hl)
        # Bevel shadow (bottom & right)
        sh = (max(0, col[0] - 24), max(0, col[1] - 24), max(0, col[2] - 24), 255)
        draw.line([x0, y1, x1, y1], fill=sh)
        draw.line([x1, y0, x1, y1], fill=sh)
        
    return tile

def build_map():
    print(f"Building Compact & Unified Hogwarts Castle Map ({CW} x {CH} px)...")

    # 1. Base Canvas with Enchanted Wizarding Mid-Autumn Night Sky
    bg_mid_autumn_path = os.path.join(BASE_DIR, 'client/public/assets/background/wizard_mid_autumn_bg.png')
    if not os.path.exists(bg_mid_autumn_path):
        bg_mid_autumn_path = os.path.join(BASE_DIR, 'client/public/assets/background/backdrop_night.png')
    
    bg_img = Image.open(bg_mid_autumn_path).resize((CW, CH), Image.Resampling.LANCZOS)
    world = bg_img.convert('RGBA')

    draw = ImageDraw.Draw(world)

    # 2. Pure Clean Castle Stone Flagstone Tile (Zero tables/benches/cloth)
    gh_tile = generate_clean_flagstone_tile()

    # Load TrueType font for Vietnamese support
    font_path = '/System/Library/Fonts/Supplemental/Arial.ttf'
    if not os.path.exists(font_path):
        font_path = '/System/Library/Fonts/Helvetica.ttc'
    font_banner = ImageFont.truetype(font_path, 16)

    # 3. Draw Grand Castle Corridors (Stone balustrades, NO CANDLES, authentic castle stone floor)
    def draw_grand_corridor(p1, p2, width=190, carpet_color=(120, 20, 30), border_color=(210, 160, 40)):
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
        
        # 1. Bridge Drop Shadow (soft subtle translucent shadow)
        shadow_offset_y = 20
        shadow_pts = [(p[0], p[1] + shadow_offset_y) for p in poly_pts]
        draw.polygon(shadow_pts, fill=(12, 8, 28, 60))
        
        # 2. Stone Walkway Mask & Textured Flagstone Fill (Identical to Great Hall stone palette)
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
            
            # Thick gothic carved limestone rail
            draw.line([(curb_x1, curb_y1), (curb_x2, curb_y2)], fill=(42, 34, 28, 255), width=18)
            draw.line([(curb_x1, curb_y1), (curb_x2, curb_y2)], fill=(85, 72, 62, 255), width=10)
            draw.line([(curb_x1, curb_y1 - 2), (curb_x2, curb_y2 - 2)], fill=(128, 112, 100, 255), width=3)
            
            # Carved stone pillars & baluster caps along the parapet (NO CANDLES)
            p_steps = max(2, int(dist / 85))
            for p_s in range(1, p_steps):
                t = p_s / p_steps
                px = int(x1 + dx * t + side * w_curb * nx)
                py = int(y1 + dy * t + side * w_curb * ny)
                
                # Stone pillar shaft
                draw.rounded_rectangle([px - 8, py - 26, px + 8, py + 16], radius=3,
                                       fill=(75, 64, 55, 255), outline=(38, 30, 24, 255), width=2)
                # Carved stone finial cap
                draw.rectangle([px - 10, py - 30, px + 10, py - 24], fill=(120, 105, 94, 255), outline=(42, 34, 28, 255))
                draw.ellipse([px - 5, py - 36, px + 5, py - 28], fill=(140, 125, 112, 255), outline=(42, 34, 28, 255))

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
        stripe_steps = max(2, int(dist / 32))
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
    # Spoke 1: Great Hall (1350, 1120) -> Gryffindor Tower (1120, 720)
    draw_grand_corridor(
        (1350, 1120), (1120, 720),
        width=190, carpet_color=(135, 18, 28), border_color=(220, 175, 45)
    )

    # Spoke 2: Great Hall (1700, 1450) -> Slytherin Dungeon (1120, 1690)
    draw_grand_corridor(
        (1700, 1450), (1120, 1690),
        width=190, carpet_color=(15, 68, 38), border_color=(195, 200, 205)
    )

    # Spoke 3: Great Hall (2250, 1120) -> Ravenclaw Tower (2280, 720)
    draw_grand_corridor(
        (2250, 1120), (2280, 720),
        width=190, carpet_color=(18, 42, 88), border_color=(210, 140, 50)
    )

    # Spoke 4: Great Hall (1950, 1450) -> Hufflepuff Basement (2280, 1690)
    draw_grand_corridor(
        (1950, 1450), (2280, 1690),
        width=190, carpet_color=(195, 145, 18), border_color=(52, 40, 30)
    )

    # 5. Load and Process the 5 Rooms with Genuine Alpha Masks
    gh_raw = Image.open(os.path.join(BASE_DIR, 'client/public/assets/map/great_hall_25d.png')).convert('RGBA')
    gry_raw = Image.open(os.path.join(MAP_V2_DIR, 'gryffindor_common_room_25d.png')).convert('RGBA')
    sly_raw = Image.open(os.path.join(MAP_V2_DIR, 'slytherin_common_room_25d.png')).convert('RGBA')
    rav_raw = Image.open(os.path.join(MAP_V2_DIR, 'ravenclaw_common_room_25d.png')).convert('RGBA')
    huf_raw = Image.open(os.path.join(MAP_V2_DIR, 'hufflepuff_common_room_25d.png')).convert('RGBA')

    gh_clean = get_clean_room(gh_raw)
    gry_s = get_clean_room(gry_raw).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)
    sly_s = get_clean_room(sly_raw, is_white=False).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)
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
        (1250, 940, '🦁 THÁP GRYFFINDOR', (135, 18, 28), (220, 175, 45)),
        (1450, 1550, '🐍 HẦM SLYTHERIN', (15, 68, 38), (195, 200, 205)),
        (2260, 940, '🦅 THÁP RAVENCLAW', (18, 42, 88), (210, 140, 50)),
        (2100, 1550, '🦡 TẦNG HẦM HUFFLEPUFF', (195, 145, 18), (52, 40, 30)),
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
    print(f"Compact Hogwarts Map saved successfully at {OUTPUT_PATH}!")
    print(f"File size: {os.path.getsize(OUTPUT_PATH) / (1024 * 1024):.2f} MB")

    preview = world.resize((900, 600), Image.Resampling.LANCZOS)
    preview.convert('RGB').save(PREVIEW_PATH)
    print(f"Preview saved to {PREVIEW_PATH}")

    # Zoomed crop around Slytherin corridor (x: 500..1800, y: 1300..2100)
    crop_sly = world.crop((500, 1300, 1800, 2100)).convert('RGB')
    crop_sly.save(CROP_PREVIEW_PATH)
    print(f"Slytherin connection crop saved to {CROP_PREVIEW_PATH}")

if __name__ == '__main__':
    build_map()
