"""
Build Seamless Hogwarts Castle World Map (2800 x 1800 px)
Seamlessly connects the Great Hall with all 4 House Common Rooms into one continuous,
fully-walkable open world with ZERO black voids.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

BASE_DIR = '/Users/khang/skyoffice-base'
MAP_V2_DIR = os.path.join(BASE_DIR, 'client/public/assets/map/v2')
OUTPUT_PATH = os.path.join(MAP_V2_DIR, 'hogwarts_castle_world.png')
PREVIEW_PATH = os.path.join(BASE_DIR, 'scripts/castle_world_preview_v2.png')

CW, CH = 2800, 1800
gh_x = (CW - 1376) // 2  # 712
gh_y = (CH - 768) // 2   # 516

def make_room_rgba(img, is_white=False):
    arr = np.array(img)
    if is_white:
        mask = ~((arr[:, :, 0] > 230) & (arr[:, :, 1] > 230) & (arr[:, :, 2] > 230))
    else:
        mask = (arr[:, :, 0] > 14) | (arr[:, :, 1] > 14) | (arr[:, :, 2] > 14)
    
    # Feather mask slightly for seamless blending
    mask_im = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.8))
    img.putalpha(mask_im)
    return img

def build_castle_world():
    print(f"Generating Seamless Hogwarts Castle World ({CW} x {CH} px)...")

    # 1. Base Canvas & Atmosphere (Night Sky over Hogwarts)
    bg_night_path = os.path.join(BASE_DIR, 'client/public/assets/background/backdrop_night.png')
    if os.path.exists(bg_night_path):
        bg_night = Image.open(bg_night_path).resize((CW, CH), Image.Resampling.LANCZOS)
        world = bg_night.convert('RGBA')
    else:
        world = Image.new('RGBA', (CW, CH), (14, 12, 22, 255))
        
    draw = ImageDraw.Draw(world)

    # 2. Castle Dungeon Foundation (Dark stone gradient below y=600)
    for y in range(550, CH):
        alpha = int(min(255, (y - 550) / 450 * 240 + 20))
        draw.rectangle([0, y, CW, y + 1], fill=(16, 13, 20, alpha))

    # 3. Tile Stone Corridors across the castle interior
    gh_raw_path = os.path.join(BASE_DIR, 'client/public/assets/map/great_hall_25d.png')
    gh_raw = Image.open(gh_raw_path)
    # Sample a 32x32 flagstone tile from the Great Hall floor
    gh_tile = gh_raw.crop((550, 600, 582, 632)).convert('RGBA')

    # Lay stone floor under all rooms and connecting corridors (x: 250..2550, y: 180..1620)
    for cy in range(180, 1620, 32):
        for cx in range(250, 2550, 32):
            # Hexagonal/isometric diamond boundary mask so floor fills castle shape
            dx_c = abs(cx + 16 - 1400) / 1150
            dy_c = abs(cy + 16 - 900) / 720
            if (dx_c + dy_c) < 1.35:
                world.paste(gh_tile, (cx, cy))

    # 4. Load 5 Isometric Rooms
    gh = make_room_rgba(gh_raw.convert('RGBA'))
    gry = make_room_rgba(Image.open(os.path.join(MAP_V2_DIR, 'gryffindor_common_room_25d.png')).convert('RGBA'))
    sly = make_room_rgba(Image.open(os.path.join(MAP_V2_DIR, 'slytherin_common_room_25d.png')).convert('RGBA'), is_white=True)
    rav = make_room_rgba(Image.open(os.path.join(MAP_V2_DIR, 'ravenclaw_common_room_25d.png')).convert('RGBA'))
    huf = make_room_rgba(Image.open(os.path.join(MAP_V2_DIR, 'hufflepuff_common_room_25d.png')).convert('RGBA'))

    # 5. Paste Rooms in Depth Order (Upper Towers first, then Center Hall, then Lower Dungeons/Basements)
    # Upper Rooms
    world.paste(gry, (gh_x - 505, gh_y - 372), gry)
    world.paste(rav, (gh_x + 505, gh_y - 372), rav)

    # Upper Skybridge connecting Gryffindor & Ravenclaw (y: 200..340, x: 950..1850)
    sky_tile = gh_tile.copy()
    for sx in range(900, 1900, 32):
        for sy in range(210, 350, 32):
            world.paste(sky_tile, (sx, sy))
            
    # Skybridge Balustrade & Gothic Arch Windows
    for bx in range(920, 1880, 80):
        draw.rounded_rectangle([bx, 200, bx + 60, 280], radius=15, fill=(35, 42, 65, 230), outline=(85, 75, 100), width=3)
        # Sconce torch on skybridge
        draw.ellipse([bx + 24, 290, bx + 36, 302], fill=(255, 190, 60, 240))

    # Center: The Great Hall
    world.paste(gh, (gh_x, gh_y), gh)

    # Lower Rooms
    world.paste(sly, (gh_x - 505, gh_y + 372), sly)
    world.paste(huf, (gh_x + 505, gh_y + 372), huf)

    # Lower Castle Passage connecting Slytherin & Hufflepuff (y: 1450..1600, x: 900..1900)
    for lx in range(900, 1900, 32):
        for ly in range(1450, 1600, 32):
            world.paste(sky_tile, (lx, ly))

    # 6. Connecting Archways, Carpet Runners & Visual Thresholds
    # A. GRYFFINDOR THRESHOLD (Top-Left)
    # Scarlet runner from Great Hall left aisle (x: 880, y: 720) to Gryffindor entrance (x: 720, y: 560)
    draw.polygon([
        (880, 700), (920, 720), (740, 580), (700, 560)
    ], fill=(140, 15, 25, 235), outline=(220, 175, 45, 250))
    # Stone arch pillars
    draw.rounded_rectangle([860, 660, 885, 740], radius=6, fill=(55, 48, 62), outline=(28, 24, 32), width=2)
    draw.rounded_rectangle([915, 680, 940, 760], radius=6, fill=(55, 48, 62), outline=(28, 24, 32), width=2)
    # Torch with warm halo
    draw.ellipse([865, 680, 880, 695], fill=(255, 185, 55, 255))
    draw.ellipse([920, 700, 935, 715], fill=(255, 185, 55, 255))

    # B. SLYTHERIN THRESHOLD (Bottom-Left)
    # Emerald runner from Great Hall left aisle (x: 880, y: 1080) to Slytherin entrance (x: 720, y: 1240)
    draw.polygon([
        (880, 1060), (920, 1080), (740, 1220), (700, 1200)
    ], fill=(0, 65, 30, 235), outline=(190, 190, 190, 250))
    # Stone arch pillars
    draw.rounded_rectangle([860, 1040, 885, 1120], radius=6, fill=(45, 55, 50), outline=(20, 28, 24), width=2)
    draw.rounded_rectangle([915, 1060, 940, 1140], radius=6, fill=(45, 55, 50), outline=(20, 28, 24), width=2)
    # Emerald serpent sconce torch
    draw.ellipse([865, 1060, 880, 1075], fill=(60, 230, 120, 255))
    draw.ellipse([920, 1080, 935, 1095], fill=(60, 230, 120, 255))

    # C. RAVENCLAW THRESHOLD (Top-Right)
    # Midnight blue runner from Great Hall right aisle (x: 1880, y: 720) to Ravenclaw entrance (x: 2040, y: 560)
    draw.polygon([
        (1880, 720), (1920, 700), (2080, 560), (2040, 580)
    ], fill=(12, 35, 75, 235), outline=(205, 130, 50, 250))
    # Stone arch pillars
    draw.rounded_rectangle([1860, 680, 1885, 760], radius=6, fill=(48, 50, 65), outline=(24, 25, 35), width=2)
    draw.rounded_rectangle([1915, 660, 1940, 740], radius=6, fill=(48, 50, 65), outline=(24, 25, 35), width=2)
    # Celestial bronze torch
    draw.ellipse([1865, 700, 1880, 715], fill=(140, 200, 255, 255))
    draw.ellipse([1920, 680, 1935, 695], fill=(140, 200, 255, 255))

    # D. HUFFLEPUFF THRESHOLD (Bottom-Right)
    # Sunflower yellow & oak runner from Great Hall right aisle (x: 1880, y: 1080) to Hufflepuff entrance (x: 2040, y: 1240)
    draw.polygon([
        (1880, 1080), (1920, 1060), (2080, 1200), (2040, 1220)
    ], fill=(210, 150, 10, 235), outline=(45, 35, 25, 250))
    # Curved oak archway pillars
    draw.rounded_rectangle([1860, 1060, 1885, 1140], radius=6, fill=(65, 52, 40), outline=(32, 25, 18), width=2)
    draw.rounded_rectangle([1915, 1040, 1940, 1120], radius=6, fill=(65, 52, 40), outline=(32, 25, 18), width=2)
    # Warm honey lantern
    draw.ellipse([1865, 1080, 1880, 1095], fill=(255, 205, 70, 255))
    draw.ellipse([1920, 1060, 1935, 1075], fill=(255, 205, 70, 255))

    # 7. Gothic Lintel Banners carved onto archways
    banners = [
        (890, 650, '🦁 THÁP GRYFFINDOR', (140, 15, 25), (220, 175, 45)),
        (890, 1030, '🐍 HẦM SLYTHERIN', (0, 65, 30), (190, 190, 190)),
        (1910, 650, '🦅 THÁP RAVENCLAW', (12, 35, 75), (205, 130, 50)),
        (1910, 1030, '🦡 TẦNG HẦM HUFFLEPUFF', (190, 140, 15), (45, 35, 25)),
    ]

    for bx, by, text, bg_col, border_col in banners:
        draw.rounded_rectangle([bx - 85, by - 14, bx + 85, by + 14], radius=6, fill=(*bg_col, 240), outline=border_col, width=2)
        draw.text((bx, by), text, fill=(255, 255, 255), anchor="mm")

    # 8. Save Final World Map
    os.makedirs(MAP_V2_DIR, exist_ok=True)
    world.convert('RGB').save(OUTPUT_PATH, format='PNG', optimize=True)
    print(f"Hogwarts Castle World Map saved successfully at {OUTPUT_PATH}!")
    print(f"File size: {os.path.getsize(OUTPUT_PATH) / (1024*1024):.2f} MB")

    # Save Preview
    preview = world.resize((840, 540), Image.Resampling.LANCZOS)
    preview.convert('RGB').save(PREVIEW_PATH)
    print(f"Preview saved to {PREVIEW_PATH}")

if __name__ == '__main__':
    build_castle_world()
