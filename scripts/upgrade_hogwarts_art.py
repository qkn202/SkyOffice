"""
Hogwarts Visual Overhaul Engine - High Fidelity 16-Bit Graphics Upgrade.
Generates masterwork pixel-art textures, feast banquet tables, enchanted celestial ceilings,
and authentic Hogwarts props for SkyOffice.
"""

import os
import random
import math
from PIL import Image, ImageDraw

CLIENT_DIR = '/Users/khang/skyoffice-base/client'
PUBLIC_ASSETS = os.path.join(CLIENT_DIR, 'public/assets')
DIST_ASSETS = os.path.join(CLIENT_DIR, 'dist/assets')
BACKUP_DIR = os.path.join(PUBLIC_ASSETS, 'backup_original')

# ==============================================================================
# 1. ENHANCED FLOOR & GROUND TILES
# ==============================================================================

def draw_polished_flagstone(draw, img, ox, oy, seed=42):
    """Medieval castle flagstones with beveled relief, natural stone variation & moss."""
    random.seed(seed)
    mortar = (32, 28, 38, 255)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=mortar)

    # 4 distinct stones with varied organic shapes
    stones = [
        (ox + 1, oy + 1, ox + 17, oy + 14, (94, 90, 102)),
        (ox + 19, oy + 1, ox + 30, oy + 15, (108, 104, 116)),
        (ox + 1, oy + 16, ox + 15, oy + 30, (102, 98, 110)),
        (ox + 17, oy + 17, ox + 30, oy + 30, (88, 84, 96))
    ]

    for x0, y0, x1, y1, base in stones:
        draw.rectangle([x0, y0, x1, y1], fill=(*base, 255))
        # Top-left highlight
        hl = (min(255, base[0] + 32), min(255, base[1] + 32), min(255, base[2] + 36), 255)
        draw.line([x0, y0, x1, y0], fill=hl)
        draw.line([x0, y0, x0, y1], fill=hl)
        # Bottom-right shadow
        sh = (max(0, base[0] - 32), max(0, base[1] - 32), max(0, base[2] - 30), 255)
        draw.line([x0, y1, x1, y1], fill=sh)
        draw.line([x1, y0, x1, y1], fill=sh)

        # Subtle specular surface noise
        for px in range(x0 + 1, x1):
            for py in range(y0 + 1, y1):
                n = random.randint(-7, 7)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (
                    max(0, min(255, cur[0] + n)),
                    max(0, min(255, cur[1] + n)),
                    max(0, min(255, cur[2] + n + 2)),
                    255
                ))

        # Delicate crevice moss
        if random.random() < 0.4:
            mx = random.randint(x0 + 2, x1 - 2)
            img.putpixel((mx, y1), (45, 75, 42, 255))
            if mx + 1 < x1:
                img.putpixel((mx + 1, y1), (60, 95, 55, 255))

def draw_grand_aisle_flagstone(draw, img, ox, oy, seed=55):
    """Grand Central Aisle: Polished imperial obsidian with gold inlaid diamond star."""
    random.seed(seed)
    mortar = (24, 20, 28, 255)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=mortar)

    # Main dark polished granite slab
    draw.rectangle([ox + 2, oy + 2, ox + 29, oy + 29], fill=(52, 48, 58, 255))
    draw.line([ox + 2, oy + 2, ox + 29, oy + 2], fill=(85, 80, 95, 255))
    draw.line([ox + 2, oy + 2, ox + 2, oy + 29], fill=(85, 80, 95, 255))
    draw.line([ox + 2, oy + 29, ox + 29, oy + 29], fill=(28, 24, 32, 255))
    draw.line([ox + 29, oy + 2, ox + 29, oy + 29], fill=(28, 24, 32, 255))

    # Border trim stones
    draw.rectangle([ox, oy, ox + 1, oy + 31], fill=(38, 34, 44, 255))
    draw.rectangle([ox + 30, oy, ox + 31, oy + 31], fill=(38, 34, 44, 255))

    # Gold inlaid star emblem in center
    cx, cy = ox + 15, oy + 15
    gold_main = (220, 180, 55, 255)
    gold_light = (255, 230, 120, 255)
    gold_dark = (160, 125, 30, 255)

    draw.polygon([(cx, cy - 6), (cx + 6, cy), (cx, cy + 6), (cx - 6, cy)], fill=gold_dark)
    draw.polygon([(cx, cy - 4), (cx + 4, cy), (cx, cy + 4), (cx - 4, cy)], fill=gold_main)
    draw.rectangle([cx - 1, cy - 1, cx + 1, cy + 1], fill=gold_light)

def draw_house_runner(draw, img, ox, oy, house='gryffindor', seed=101):
    """Authentic House velvet runner with gold/silver embroidery and woven crest."""
    random.seed(seed)
    if house == 'gryffindor':
        c_base = (130, 18, 36)
        c_trim = (230, 190, 55)
        c_shade = (85, 10, 22)
    elif house == 'slytherin':
        c_base = (20, 78, 48)
        c_trim = (195, 205, 200)
        c_shade = (10, 48, 28)
    elif house == 'ravenclaw':
        c_base = (22, 58, 125)
        c_trim = (205, 155, 65)
        c_shade = (12, 35, 78)
    else: # hufflepuff
        c_base = (195, 145, 28)
        c_trim = (42, 38, 34)
        c_shade = (135, 95, 16)

    # Velvet base
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=(*c_base, 255))

    # Micro velvet weave
    for px in range(ox, ox + 32):
        for py in range(oy, oy + 32):
            n = random.randint(-6, 6)
            cur = img.getpixel((px, py))
            img.putpixel((px, py), (
                max(0, min(255, cur[0] + n)),
                max(0, min(255, cur[1] + n)),
                max(0, min(255, cur[2] + n)),
                255
            ))

    # Side braided borders
    draw.rectangle([ox, oy, ox + 2, oy + 31], fill=(*c_trim, 255))
    draw.line([ox + 1, oy, ox + 1, oy + 31], fill=(255, 245, 180, 255) if house != 'slytherin' else (240, 245, 245, 255))
    draw.rectangle([ox + 29, oy, ox + 31, oy + 31], fill=(*c_trim, 255))
    draw.line([ox + 30, oy, ox + 30, oy + 31], fill=(255, 245, 180, 255) if house != 'slytherin' else (240, 245, 245, 255))

    # Center diamond emblem
    cx, cy = ox + 15, oy + 15
    draw.polygon([(cx, cy - 4), (cx + 4, cy), (cx, cy + 4), (cx - 4, cy)], fill=(*c_trim, 255))
    draw.point((cx, cy), fill=(*c_shade, 255))

# ==============================================================================
# 2. ENHANCED BANQUET TABLES & FEAST PROPS
# ==============================================================================

def draw_banquet_table_tile(draw, img, ox, oy, prop_type='candelabra', seed=301):
    """Draws rich carved dark oak banquet table with feasts, candelabras and goblets."""
    random.seed(seed)

    # Polished dark oak wood slab
    c_oak = (68, 38, 20, 255)
    c_hl = (98, 58, 32, 255)
    c_sh = (42, 22, 10, 255)

    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=c_oak)
    draw.line([ox, oy, ox + 31, oy], fill=c_hl)
    draw.line([ox, oy + 1, ox + 31, oy + 1], fill=c_hl)
    draw.line([ox, oy + 30, ox + 31, oy + 30], fill=c_sh)
    draw.line([ox, oy + 31, ox + 31, oy + 31], fill=c_sh)

    # Wood grain lines
    for gy in [oy + 6, oy + 12, oy + 18, oy + 24]:
        draw.line([ox, gy, ox + 31, gy], fill=(56, 30, 15, 255))
        draw.line([ox, gy + 1, ox + 31, gy + 1], fill=c_hl)

    if prop_type == 'candelabra':
        # 3-Branch Grand Golden Candelabra with glowing candle flames
        cx, cy = ox + 15, oy + 15
        gold = (235, 195, 55, 255)
        gold_d = (165, 125, 30, 255)

        # Base and stem
        draw.rectangle([cx - 4, cy + 5, cx + 4, cy + 7], fill=gold_d)
        draw.rectangle([cx - 1, cy - 2, cx + 1, cy + 5], fill=gold)
        # Branches
        draw.line([cx - 6, cy + 1, cx + 6, cy + 1], fill=gold)
        draw.line([cx - 6, cy - 2, cx - 6, cy + 1], fill=gold)
        draw.line([cx + 6, cy - 2, cx + 6, cy + 1], fill=gold)

        # 3 Candles & Flames
        for bx in [cx - 6, cx, cx + 6]:
            # White candle wax
            draw.rectangle([bx - 1, cy - 6, bx + 1, cy - 2], fill=(245, 240, 225, 255))
            # Wick
            draw.point((bx, cy - 7), fill=(40, 30, 20, 255))
            # Flame: Red -> Orange -> Yellow -> White core
            draw.polygon([(bx, cy - 12), (bx - 2, cy - 8), (bx + 2, cy - 8)], fill=(255, 95, 20, 255))
            draw.polygon([(bx, cy - 11), (bx - 1, cy - 8), (bx + 1, cy - 8)], fill=(255, 215, 50, 255))
            draw.point((bx, cy - 9), fill=(255, 255, 220, 255))

    elif prop_type == 'feast':
        # Silver platter with roasted feast & golden goblets
        cx, cy = ox + 15, oy + 15

        # Silver oval platter
        silver = (210, 215, 225, 255)
        silver_sh = (140, 145, 155, 255)
        draw.ellipse([cx - 8, cy - 4, cx + 8, cy + 4], fill=silver_sh)
        draw.ellipse([cx - 7, cy - 3, cx + 7, cy + 3], fill=silver)

        # Roasted golden turkey/pie
        draw.ellipse([cx - 5, cy - 2, cx + 5, cy + 2], fill=(185, 95, 30, 255))
        draw.ellipse([cx - 3, cy - 2, cx + 3, cy + 1], fill=(225, 145, 45, 255))

        # Golden goblets
        for gx, gy in [(ox + 4, oy + 8), (ox + 26, oy + 22)]:
            draw.rectangle([gx - 2, gy + 3, gx + 2, gy + 4], fill=(180, 140, 35, 255))
            draw.line([gx, gy, gx, gy + 3], fill=(225, 185, 50, 255))
            draw.polygon([(gx - 3, gy - 3), (gx + 3, gy - 3), (gx, gy)], fill=(255, 215, 60, 255))
            draw.ellipse([gx - 2, gy - 4, gx + 2, gy - 2], fill=(160, 20, 35, 255)) # ruby wine

    elif prop_type == 'grimoire':
        # Open vintage grimoire with glowing runes & quill
        cx, cy = ox + 15, oy + 15
        # Open book pages
        draw.polygon([(cx - 9, cy - 4), (cx, cy - 2), (cx + 9, cy - 4), (cx + 8, cy + 5), (cx, cy + 7), (cx - 8, cy + 5)], fill=(95, 22, 32, 255))
        draw.polygon([(cx - 8, cy - 5), (cx, cy - 3), (cx + 8, cy - 5), (cx + 7, cy + 4), (cx, cy + 6), (cx - 7, cy + 4)], fill=(245, 235, 205, 255))
        # Glowing runes
        draw.line([cx - 6, cy - 1, cx - 2, cy - 1], fill=(60, 140, 220, 255))
        draw.line([cx - 6, cy + 2, cx - 3, cy + 2], fill=(60, 140, 220, 255))
        draw.line([cx + 2, cy - 1, cx + 6, cy - 1], fill=(60, 140, 220, 255))
        draw.line([cx + 2, cy + 2, cx + 5, cy + 2], fill=(60, 140, 220, 255))

        # Potion vial
        draw.rectangle([ox + 25, oy + 6, ox + 28, oy + 12], fill=(45, 215, 120, 230))
        draw.point((ox + 26, oy + 5), fill=(210, 185, 80, 255))

# ==============================================================================
# 3. ENCHANTED CELESTIAL NIGHT SKY BACKDROP
# ==============================================================================

def create_enchanted_celestial_backdrop(width=1920, height=1080):
    """Creates stunning enchanted starry night sky with nebula ribbons and twinkling stars."""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # Deep magical vertical gradient: Dark void -> Indigo -> Amethyst
    for y in range(height):
        ratio = y / height
        r = int(8 + ratio * 18)
        g = int(6 + ratio * 14)
        b = int(22 + ratio * 45)
        draw.line([0, y, width, y], fill=(r, g, b, 255))

    # Ethereal aurora / nebula ribbon
    random.seed(777)
    for x in range(0, width, 2):
        ny1 = int(height * 0.35 + math.sin(x * 0.005) * 60 + math.cos(x * 0.012) * 30)
        for h in range(40):
            alpha = int(45 * math.sin(h / 40 * math.pi))
            img.putpixel((x, max(0, min(height - 1, ny1 + h))), (25, 185, 120, alpha))
            if x + 1 < width:
                img.putpixel((x + 1, max(0, min(height - 1, ny1 + h))), (25, 185, 120, alpha))

        ny2 = int(height * 0.55 + math.cos(x * 0.006) * 50 + math.sin(x * 0.01) * 25)
        for h in range(50):
            alpha = int(40 * math.sin(h / 50 * math.pi))
            img.putpixel((x, max(0, min(height - 1, ny2 + h))), (150, 45, 215, alpha))
            if x + 1 < width:
                img.putpixel((x + 1, max(0, min(height - 1, ny2 + h))), (150, 45, 215, alpha))

    # 1500 Twinkling stars of varying magnitudes
    star_colors = [
        (255, 255, 255, 255), (255, 245, 210, 240), (200, 230, 255, 230),
        (255, 215, 150, 220), (225, 190, 255, 210), (140, 215, 255, 200)
    ]

    for _ in range(1500):
        sx = random.randint(0, width - 1)
        sy = random.randint(0, height - 1)
        sc = random.choice(star_colors)
        mag = random.random()

        if mag > 0.96:
            # 4-point cross star
            draw.point((sx, sy), fill=(255, 255, 255, 255))
            draw.point((sx - 1, sy), fill=sc)
            draw.point((sx + 1, sy), fill=sc)
            draw.point((sx, sy - 1), fill=sc)
            draw.point((sx, sy + 1), fill=sc)
        elif mag > 0.75:
            # 2x2 star
            draw.rectangle([sx, sy, sx + 1, sy + 1], fill=sc)
        else:
            # Single pixel star
            draw.point((sx, sy), fill=sc)

    return img

# ==============================================================================
# 4. MASTER ASSET INJECTION
# ==============================================================================

def main():
    print("Beginning High-Fidelity 16-Bit Graphics Overhaul...")

    # 1. FloorAndGround.png
    fg_path = os.path.join(PUBLIC_ASSETS, 'map/FloorAndGround.png')
    fg_img = Image.open(fg_path).convert('RGBA')
    fg_draw = ImageDraw.Draw(fg_img)

    def gid_coords(gid):
        idx = gid - 1
        return (idx % 64) * 32, (idx // 64) * 32

    print("Upgrading stone flagstones, central aisle & house velvet runners...")
    # Flagstones
    draw_polished_flagstone(fg_draw, fg_img, *gid_coords(412), seed=412)
    draw_grand_aisle_flagstone(fg_draw, fg_img, *gid_coords(415), seed=415)

    # House Runners
    draw_house_runner(fg_draw, fg_img, *gid_coords(2383), house='gryffindor', seed=2383)
    draw_house_runner(fg_draw, fg_img, *gid_coords(217), house='hufflepuff', seed=217)
    draw_house_runner(fg_draw, fg_img, *gid_coords(668), house='slytherin', seed=668)

    fg_img.save(fg_path)
    print("Saved:", fg_path)

    # 2. Modern_Office_Black_Shadow.png (Banquet Tables)
    mobs_path = os.path.join(PUBLIC_ASSETS, 'tileset/Modern_Office_Black_Shadow.png')
    mobs_img = Image.open(mobs_path).convert('RGBA')
    mobs_draw = ImageDraw.Draw(mobs_img)

    print("Upgrading Feast Banquet Tables, Candelabras & Grimoires...")
    # Row 26, Col 3: GID 3003 (Table with Grimoire / End)
    draw_banquet_table_tile(mobs_draw, mobs_img, 3 * 32, 26 * 32, prop_type='grimoire', seed=3003)
    # Row 27, Col 3: GID 3019 (Table with Feast)
    draw_banquet_table_tile(mobs_draw, mobs_img, 3 * 32, 27 * 32, prop_type='feast', seed=3019)
    # Row 27, Col 4: GID 3020 (Table with Candelabra)
    draw_banquet_table_tile(mobs_draw, mobs_img, 4 * 32, 27 * 32, prop_type='candelabra', seed=3020)
    # Row 28, Col 3: GID 3035 (Base table)
    draw_banquet_table_tile(mobs_draw, mobs_img, 3 * 32, 28 * 32, prop_type='feast', seed=3035)

    mobs_img.save(mobs_path)
    print("Saved:", mobs_path)

    # 3. Enchanted Celestial Backdrops
    print("Generating Enchanted Celestial Night Sky backdrops...")
    sky_img = create_enchanted_celestial_backdrop(1920, 1080)
    b_day = os.path.join(PUBLIC_ASSETS, 'background/backdrop_day.png')
    b_night = os.path.join(PUBLIC_ASSETS, 'background/backdrop_night.png')
    sky_img.save(b_day)
    sky_img.save(b_night)
    print("Saved:", b_day, "and", b_night)

    # 4. Sync to dist/assets/
    if os.path.exists(DIST_ASSETS):
        print("Syncing upgraded assets to dist/assets/...")
        os.system(f"cp -r {PUBLIC_ASSETS}/* {DIST_ASSETS}/")

    print("Texture and backdrop overhaul successfully completed!")

if __name__ == '__main__':
    main()
