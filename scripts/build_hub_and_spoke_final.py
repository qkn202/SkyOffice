"""
Build Hub & Spoke Hogwarts Castle World Map (3600 x 2400 px)
- Hub (Center, 100% scale): Great Hall (1376 x 768) - untouched, pristine standard benchmark.
- Spokes (4 Wings, 75% scale): Gryffindor (Top-Left), Slytherin (Bottom-Left),
  Ravenclaw (Top-Right), Hufflepuff (Bottom-Right).
- Connected by grand stone archways and flagstone corridors.
- Zero overlapping, zero clipping of tables, zero black voids.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

BASE_DIR = '/Users/khang/skyoffice-base'
MAP_V2_DIR = os.path.join(BASE_DIR, 'client/public/assets/map/v2')
OUTPUT_PATH = os.path.join(MAP_V2_DIR, 'hogwarts_castle_world.png')
PREVIEW_PATH = os.path.join(BASE_DIR, 'scripts/hub_spoke_final_preview.png')

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
    arr = np.array(img)
    if is_white:
        mask = ~((arr[:, :, 0] > 230) & (arr[:, :, 1] > 230) & (arr[:, :, 2] > 230))
    else:
        mask = (arr[:, :, 0] > 14) | (arr[:, :, 1] > 14) | (arr[:, :, 2] > 14)
    mask_im = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = img.convert('RGBA')
    rgba.putalpha(mask_im)
    return rgba

def build_map():
    print(f"Building Hub & Spoke Hogwarts Castle Map ({CW} x {CH} px)...")

    # 1. Base Canvas with Starry Night Sky
    bg_night_path = os.path.join(BASE_DIR, 'client/public/assets/background/backdrop_night.png')
    if os.path.exists(bg_night_path):
        bg_night = Image.open(bg_night_path).resize((CW, CH), Image.Resampling.LANCZOS)
        world = bg_night.convert('RGBA')
    else:
        world = Image.new('RGBA', (CW, CH), (14, 11, 20, 255))

    draw = ImageDraw.Draw(world)

    # Gradient darkening for lower castle / lake dungeon level
    for y in range(700, CH):
        alpha = int(min(255, (y - 700) / 600 * 240 + 15))
        draw.rectangle([0, y, CW, y + 1], fill=(12, 10, 18, alpha))

    # 2. Flagstone Tile from FloorAndGround.png
    fg_path = os.path.join(BASE_DIR, 'client/public/assets/map/FloorAndGround.png')
    fg = Image.open(fg_path)
    flag_tile = fg.crop((960, 192, 992, 224)).convert('RGBA')

    # Function to draw a grand castle corridor
    def draw_grand_corridor(p1, p2, width=170, carpet_color=(120, 20, 30), border_color=(210, 160, 40)):
        x1, y1 = p1
        x2, y2 = p2
        dx = x2 - x1
        dy = y2 - y1
        dist = math.hypot(dx, dy)
        steps = int(dist / 16) + 1
        
        # A. Stone Flagstone Foundation (width + 40 for stone parapet borders)
        for s in range(steps + 1):
            t = s / steps
            cx = int(x1 + dx * t)
            cy = int(y1 + dy * t)
            half_w = width // 2 + 20
            for fx in range(cx - half_w, cx + half_w, 32):
                for fy in range(cy - 24, cy + 24, 32):
                    world.paste(flag_tile, (fx, fy), flag_tile)

        # B. Stone Side Parapets / Balustrades
        nx = -dy / dist
        ny = dx / dist
        w_half = width // 2
        
        # Left and Right stone curbs
        for side in [-1, 1]:
            curb_x1 = int(x1 + side * w_half * nx)
            curb_y1 = int(y1 + side * w_half * ny)
            curb_x2 = int(x2 + side * w_half * nx)
            curb_y2 = int(y2 + side * w_half * ny)
            draw.line([(curb_x1, curb_y1), (curb_x2, curb_y2)], fill=(32, 26, 36, 255), width=8)
            draw.line([(curb_x1, curb_y1), (curb_x2, curb_y2)], fill=(65, 58, 72, 255), width=4)

        # C. Velvet Carpet Runner in Center (width ~ 54)
        c_half = 27
        carpet_pts = [
            (int(x1 + c_half * nx), int(y1 + c_half * ny)),
            (int(x2 + c_half * nx), int(y2 + c_half * ny)),
            (int(x2 - c_half * nx), int(y2 - c_half * ny)),
            (int(x1 - c_half * nx), int(y1 - c_half * ny))
        ]
        draw.polygon(carpet_pts, fill=(*carpet_color, 240), outline=(*border_color, 255))
        
        # Gold braid border on carpet
        draw.line([carpet_pts[0], carpet_pts[1]], fill=(*border_color, 255), width=3)
        draw.line([carpet_pts[3], carpet_pts[2]], fill=(*border_color, 255), width=3)

    # Draw the 4 Spokes (Corridors connecting Great Hall to the 4 Wings)
    # Spoke 1: Great Hall (1312, 1096) -> Gryffindor Tower (900, 620)
    draw_grand_corridor((gh_x + 200, gh_y + 280), (gry_x + RW_SUB - 132, gry_y + RH_SUB - 80),
                        width=170, carpet_color=(140, 15, 25), border_color=(220, 175, 45))

    # Spoke 2: Great Hall (1312, 1456) -> Slytherin Dungeon (900, 1800)
    draw_grand_corridor((gh_x + 200, gh_y + 640), (sly_x + RW_SUB - 132, sly_y + 120),
                        width=170, carpet_color=(0, 65, 30), border_color=(190, 190, 190))

    # Spoke 3: Great Hall (2282, 1096) -> Ravenclaw Tower (2550, 620)
    draw_grand_corridor((gh_x + 1170, gh_y + 280), (rav_x + 130, rav_y + RH_SUB - 80),
                        width=170, carpet_color=(12, 35, 75), border_color=(205, 130, 50))

    # Spoke 4: Great Hall (2282, 1456) -> Hufflepuff Basement (2550, 1800)
    draw_grand_corridor((gh_x + 1170, gh_y + 640), (huf_x + 130, huf_y + 120),
                        width=170, carpet_color=(200, 145, 15), border_color=(45, 35, 25))

    # 3. Load 5 Rooms
    gh = Image.open(os.path.join(BASE_DIR, 'client/public/assets/map/great_hall_25d.png')).convert('RGB')
    gry = Image.open(os.path.join(MAP_V2_DIR, 'gryffindor_common_room_25d.png')).convert('RGB')
    sly = Image.open(os.path.join(MAP_V2_DIR, 'slytherin_common_room_25d.png')).convert('RGB')
    rav = Image.open(os.path.join(MAP_V2_DIR, 'ravenclaw_common_room_25d.png')).convert('RGB')
    huf = Image.open(os.path.join(MAP_V2_DIR, 'hufflepuff_common_room_25d.png')).convert('RGB')

    # 4. Paste Great Hall at Center (100% scale - 1376 x 768)
    # The Great Hall is the King of the castle, 100% pristine, no cutting!
    world.paste(gh, (gh_x, gh_y))

    # 5. Paste 4 Common Rooms at 75% Scale (1032 x 576)
    gry_s = get_clean_room(gry).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)
    sly_s = get_clean_room(sly, is_white=True).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)
    rav_s = get_clean_room(rav).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)
    huf_s = get_clean_room(huf).resize((RW_SUB, RH_SUB), Image.Resampling.LANCZOS)

    world.paste(gry_s, (gry_x, gry_y), gry_s)
    world.paste(sly_s, (sly_x, sly_y), sly_s)
    world.paste(rav_s, (rav_x, rav_y), rav_s)
    world.paste(huf_s, (huf_x, huf_y), huf_s)

    # 6. Gothic Archway Pillars & Torches at Corridor Entrances
    torch_nodes = [
        # Gryffindor spoke
        ((gh_x + 195, gh_y + 250), (255, 185, 55)),
        ((gry_x + RW_SUB - 110, gry_y + RH_SUB - 110), (255, 185, 55)),
        # Slytherin spoke
        ((gh_x + 195, gh_y + 670), (60, 230, 120)),
        ((sly_x + RW_SUB - 110, sly_y + 150), (60, 230, 120)),
        # Ravenclaw spoke
        ((gh_x + 1175, gh_y + 250), (140, 200, 255)),
        ((rav_x + 110, rav_y + RH_SUB - 110), (140, 200, 255)),
        # Hufflepuff spoke
        ((gh_x + 1175, gh_y + 670), (255, 205, 70)),
        ((huf_x + 110, huf_y + 150), (255, 205, 70)),
    ]

    for pt, col in torch_nodes:
        # Pillar
        draw.rounded_rectangle([pt[0] - 12, pt[1] - 42, pt[0] + 12, pt[1] + 42], radius=6, fill=(45, 38, 52), outline=(22, 18, 26), width=2)
        # Sconce
        draw.rectangle([pt[0] - 5, pt[1] - 15, pt[0] + 5, pt[1] - 5], fill=(28, 22, 32))
        # Torch flame & halo
        draw.ellipse([pt[0] - 18, pt[1] - 30, pt[0] + 18, pt[1] + 6], fill=(*col, 80))
        draw.ellipse([pt[0] - 8, pt[1] - 20, pt[0] + 8, pt[1] - 4], fill=(*col, 255))
        draw.ellipse([pt[0] - 4, pt[1] - 16, pt[0] + 4, pt[1] - 8], fill=(255, 255, 240, 255))

    # 7. Gothic Lintel Banners carved onto archways
    banners = [
        (gh_x + 160, gh_y + 220, '🦁 THÁP GRYFFINDOR', (140, 15, 25), (220, 175, 45)),
        (gh_x + 160, gh_y + 700, '🐍 HẦM SLYTHERIN', (0, 65, 30), (190, 190, 190)),
        (gh_x + 1210, gh_y + 220, '🦅 THÁP RAVENCLAW', (12, 35, 75), (205, 130, 50)),
        (gh_x + 1210, gh_y + 700, '🦡 TẦNG HẦM HUFFLEPUFF', (190, 140, 15), (45, 35, 25)),
    ]

    for bx, by, text, bg_col, border_col in banners:
        draw.rounded_rectangle([bx - 90, by - 14, bx + 90, by + 14], radius=6, fill=(*bg_col, 240), outline=border_col, width=2)
        draw.text((bx, by), text, fill=(255, 255, 255), anchor="mm")

    # 8. Save Output Map & Preview
    world.convert('RGB').save(OUTPUT_PATH, format='PNG', optimize=True)
    print(f"Hub & Spoke Map saved successfully at {OUTPUT_PATH}!")
    print(f"File size: {os.path.getsize(OUTPUT_PATH) / (1024*1024):.2f} MB")

    preview = world.resize((900, 600), Image.Resampling.LANCZOS)
    preview.convert('RGB').save(PREVIEW_PATH)
    print(f"Preview saved to {PREVIEW_PATH}")

if __name__ == '__main__':
    build_map()
