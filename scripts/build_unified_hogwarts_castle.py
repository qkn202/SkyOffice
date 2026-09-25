"""
Build Unified Hogwarts Castle World Map (4128 x 1536 px)
Seamlessly connects all 5 iconic Hogwarts areas into one continuous, fully walkable world:
- Top-Left (0, 0): Gryffindor Tower Common Room
- Bottom-Left (0, 768): Slytherin Dungeon Common Room
- Bottom-Center (1376, 768): The Great Hall (Đại Sảnh Đường)
- Top-Center (1376, 0): Grand Castle Skybridge & Founders Gallery
- Top-Right (2752, 0): Ravenclaw Tower Common Room
- Bottom-Right (2752, 768): Hufflepuff Basement Common Room
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = '/Users/khang/skyoffice-base'
MAP_V2_DIR = os.path.join(BASE_DIR, 'client/public/assets/map/v2')
FG_PATH = os.path.join(BASE_DIR, 'client/public/assets/map/FloorAndGround.png')
OUTPUT_PATH = os.path.join(MAP_V2_DIR, 'hogwarts_castle_world.png')

RW, RH = 1376, 768
TOTAL_W = RW * 3 # 4128
TOTAL_H = RH * 2 # 1536

def build_map():
    print(f"Generating Unified Hogwarts Castle World Map ({TOTAL_W} x {TOTAL_H} px)...")

    # 1. Base Canvas
    world = Image.new('RGB', (TOTAL_W, TOTAL_H), (15, 12, 20))

    # 2. Load 5 Room Artworks
    gh_raw = Image.open(os.path.join(MAP_V2_DIR, 'great_hall_25d.png')).resize((RW, RH), Image.Resampling.LANCZOS)
    gry_raw = Image.open(os.path.join(MAP_V2_DIR, 'gryffindor_common_room_25d.png')).resize((RW, RH), Image.Resampling.LANCZOS)
    sly_raw = Image.open(os.path.join(MAP_V2_DIR, 'slytherin_common_room_25d.png')).resize((RW, RH), Image.Resampling.LANCZOS)
    rav_raw = Image.open(os.path.join(MAP_V2_DIR, 'ravenclaw_common_room_25d.png')).resize((RW, RH), Image.Resampling.LANCZOS)
    huf_raw = Image.open(os.path.join(MAP_V2_DIR, 'hufflepuff_common_room_25d.png')).resize((RW, RH), Image.Resampling.LANCZOS)

    # 3. Paste 5 rooms into their designated castle wings
    world.paste(gry_raw, (0, 0))            # Top-Left: Gryffindor
    world.paste(sly_raw, (0, RH))           # Bottom-Left: Slytherin
    world.paste(gh_raw, (RW, RH))           # Bottom-Center: Great Hall
    world.paste(rav_raw, (RW * 2, 0))       # Top-Right: Ravenclaw
    world.paste(huf_raw, (RW * 2, RH))      # Bottom-Right: Hufflepuff

    # 4. Synthesize Top-Center: Grand Castle Skybridge & Founders Gallery (1376..2752, 0..768)
    fg_img = Image.open(FG_PATH) if os.path.exists(FG_PATH) else None

    gallery = Image.new('RGB', (RW, RH), (22, 18, 28))
    draw_gal = ImageDraw.Draw(gallery)

    # Flagstone floor tiling in Gallery
    if fg_img:
        # Tile flagstone (x: 960..992, y: 192..224)
        flag_tile = fg_img.crop((960, 192, 992, 224))
        for gy in range(0, RH, 32):
            for gx in range(0, RW, 32):
                gallery.paste(flag_tile, (gx, gy))

    # Gallery Upper Wall & Gothic Windows (y: 0..200)
    draw_gal.rectangle([0, 0, RW, 180], fill=(28, 22, 34))
    for win_x in range(120, RW - 100, 180):
        # Arched stained glass window
        draw_gal.rounded_rectangle([win_x, 25, win_x + 90, 150], radius=45, fill=(35, 45, 70), outline=(80, 70, 95), width=4)
        # Warm ambient light beam on floor
        draw_gal.polygon([(win_x + 10, 150), (win_x + 80, 150), (win_x + 130, 360), (win_x - 40, 360)], fill=(45, 40, 55))

    # Central Royal Carpet Runner connecting Gryffindor and Ravenclaw (y: 380..520)
    draw_gal.rectangle([0, 420, RW, 520], fill=(90, 18, 28))
    draw_gal.rectangle([0, 420, RW, 426], fill=(210, 165, 50))
    draw_gal.rectangle([0, 514, RW, 520], fill=(210, 165, 50))

    # Gothic Stone Pillars along the gallery
    for px in range(160, RW - 100, 220):
        draw_gal.rectangle([px, 160, px + 40, 420], fill=(42, 36, 50), outline=(20, 16, 26), width=2)
        # Sconce Torch
        draw_gal.ellipse([px + 12, 260, px + 28, 276], fill=(255, 180, 50))

    # Founders Banners in Gallery
    draw_gal.rounded_rectangle([250, 60, 310, 140], radius=8, fill=(139, 0, 0), outline=(255, 215, 0), width=3) # Gryffindor
    draw_gal.rounded_rectangle([480, 60, 540, 140], radius=8, fill=(0, 77, 32), outline=(192, 192, 192), width=3) # Slytherin
    draw_gal.rounded_rectangle([840, 60, 900, 140], radius=8, fill=(11, 37, 69), outline=(205, 127, 50), width=3) # Ravenclaw
    draw_gal.rounded_rectangle([1070, 60, 1130, 140], radius=8, fill=(212, 155, 0), outline=(34, 34, 34), width=3) # Hufflepuff

    # Paste gallery into world
    world.paste(gallery, (RW, 0))

    # 5. Carve & Blend Castle Walkways / Archway Thresholds between rooms:
    draw_w = ImageDraw.Draw(world)

    # A. Archway between Slytherin and Great Hall (Seam at x = 1376, y = 1050..1280)
    # Draw open gothic arch corridor connecting Slytherin & Great Hall
    arch_sy_top, arch_sy_bot = 1080, 1260
    draw_w.rectangle([RW - 30, arch_sy_top, RW + 30, arch_sy_bot], fill=(55, 48, 42))
    # Stone arch pillars
    draw_w.rectangle([RW - 10, arch_sy_top - 20, RW + 10, arch_sy_top], fill=(70, 65, 75))
    draw_w.rectangle([RW - 10, arch_sy_bot, RW + 10, arch_sy_bot + 20], fill=(70, 65, 75))

    # B. Archway between Great Hall and Hufflepuff (Seam at x = 2752, y = 1080..1260)
    arch_hy_top, arch_hy_bot = 1080, 1260
    draw_w.rectangle([RW * 2 - 30, arch_hy_top, RW * 2 + 30, arch_hy_bot], fill=(60, 52, 40))
    draw_w.rectangle([RW * 2 - 10, arch_hy_top - 20, RW * 2 + 10, arch_hy_top], fill=(75, 68, 55))
    draw_w.rectangle([RW * 2 - 10, arch_hy_bot, RW * 2 + 10, arch_hy_bot + 20], fill=(75, 68, 55))

    # C. Walkway between Gryffindor (x: 1376) and Gallery (x: 1376, y: 420..520)
    draw_w.rectangle([RW - 30, 420, RW + 30, 520], fill=(85, 20, 28)) # Continuous red runner
    draw_w.rectangle([RW - 30, 420, RW + 30, 426], fill=(210, 165, 50))
    draw_w.rectangle([RW - 30, 514, RW + 30, 520], fill=(210, 165, 50))

    # D. Walkway between Gallery and Ravenclaw (x: 2752, y: 420..520)
    draw_w.rectangle([RW * 2 - 30, 420, RW * 2 + 30, 520], fill=(45, 30, 60))
    draw_w.rectangle([RW * 2 - 30, 420, RW * 2 + 30, 426], fill=(205, 127, 50))
    draw_w.rectangle([RW * 2 - 30, 514, RW * 2 + 30, 520], fill=(205, 127, 50))

    # E. Staircase connecting Slytherin & Gryffindor on West wall (x: 180..320, seam at y = 768)
    # Stone stairs steps
    for step_y in range(RH - 40, RH + 40, 10):
        shade = 45 + (step_y % 20)
        draw_w.rectangle([180, step_y, 320, step_y + 8], fill=(shade, shade - 5, shade - 5), outline=(25, 20, 25))

    # F. Spiral Staircase connecting Hufflepuff & Ravenclaw on East wall (x: 3800..3960, seam at y = 768)
    for step_y in range(RH - 40, RH + 40, 10):
        shade = 50 + (step_y % 20)
        draw_w.rectangle([RW * 2 + 1050, step_y, RW * 2 + 1200, step_y + 8], fill=(shade + 5, shade, shade - 10), outline=(30, 25, 20))

    # G. Stairways connecting Great Hall to Upper Gallery (at x: 1560..1680 and x: 2440..2560, seam at y: 768)
    for step_y in range(RH - 35, RH + 35, 10):
        draw_w.rectangle([1560, step_y, 1680, step_y + 8], fill=(55, 50, 45), outline=(25, 20, 18))
        draw_w.rectangle([2440, step_y, 2560, step_y + 8], fill=(55, 50, 45), outline=(25, 20, 18))

    # 6. Save final composite
    os.makedirs(MAP_V2_DIR, exist_ok=True)
    world.save(OUTPUT_PATH, format='PNG', optimize=True)
    print(f"Unified Hogwarts Castle Map created successfully at {OUTPUT_PATH}!")
    print(f"File size: {os.path.getsize(OUTPUT_PATH) / (1024*1024):.2f} MB")

if __name__ == '__main__':
    build_map()
