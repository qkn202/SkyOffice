"""
Master Hogwarts Castle & Wizarding World Pixel Art Generator.
Replaces modern corporate office assets with authentic handcrafted medieval Hogwarts castle visuals.
"""

import os
import random
from PIL import Image, ImageDraw

CLIENT_DIR = '/Users/khang/skyoffice-base/client'
PUBLIC_ASSETS = os.path.join(CLIENT_DIR, 'public/assets')
DIST_ASSETS = os.path.join(CLIENT_DIR, 'dist/assets')
BACKUP_DIR = os.path.join(PUBLIC_ASSETS, 'backup_original')

# ==============================================================================
# 1. FLOOR & GROUND TILE DESIGN
# ==============================================================================

def draw_flagstone_tile(draw, img, ox=0, oy=0, seed=42):
    """Generates authentic medieval castle flagstones (32x32)."""
    random.seed(seed)
    mortar = (38, 34, 42, 255)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=mortar)
    
    # 4 distinct interlocking stones
    patterns = [
        (ox + 1, oy + 1, ox + 16, oy + 14, (92, 88, 98)),
        (ox + 19, oy + 1, ox + 30, oy + 16, (104, 100, 110)),
        (ox + 1, oy + 17, ox + 17, oy + 30, (98, 94, 104)),
        (ox + 20, oy + 19, ox + 30, oy + 30, (90, 86, 96))
    ]
    
    for x0, y0, x1, y1, base in patterns:
        draw.rectangle([x0, y0, x1, y1], fill=(*base, 255))
        # Bevel highlight
        hl = (min(255, base[0] + 28), min(255, base[1] + 28), min(255, base[2] + 30), 255)
        draw.line([x0, y0, x1, y0], fill=hl)
        draw.line([x0, y0, x0, y1], fill=hl)
        # Bevel shadow
        sh = (max(0, base[0] - 28), max(0, base[1] - 28), max(0, base[2] - 26), 255)
        draw.line([x0, y1, x1, y1], fill=sh)
        draw.line([x1, y0, x1, y1], fill=sh)
        
        # Texture
        for px in range(x0 + 1, x1):
            for py in range(y0 + 1, y1):
                n = random.randint(-10, 10)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (
                    max(0, min(255, cur[0] + n)),
                    max(0, min(255, cur[1] + n)),
                    max(0, min(255, cur[2] + n)),
                    255
                ))
        # Subtle crevice moss
        if random.random() < 0.35:
            mx = random.randint(x0 + 1, x1 - 1)
            img.putpixel((mx, y1), (50, 75, 48, 255))
            if mx + 1 < x1:
                img.putpixel((mx + 1, y1), (65, 90, 58, 255))

def draw_corridor_flagstone(draw, img, ox=0, oy=0, seed=55):
    """Polished corridor stone paving with darker borders."""
    random.seed(seed)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=(30, 26, 34, 255))
    
    # Center slabs
    draw.rectangle([ox + 2, oy + 2, ox + 29, oy + 29], fill=(76, 72, 82, 255))
    draw.line([ox + 2, oy + 15, ox + 29, oy + 15], fill=(30, 26, 34, 255))
    draw.line([ox + 2, oy + 16, ox + 29, oy + 16], fill=(95, 90, 102, 255))
    
    # Border stones
    draw.rectangle([ox, oy, ox + 1, oy + 31], fill=(48, 44, 54, 255))
    draw.rectangle([ox + 30, oy, ox + 31, oy + 31], fill=(48, 44, 54, 255))
    
    for px in range(ox + 2, ox + 30):
        for py in range(oy + 2, oy + 30):
            if py not in (oy + 15, oy + 16):
                n = random.randint(-8, 8)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (
                    max(0, min(255, cur[0] + n)),
                    max(0, min(255, cur[1] + n)),
                    max(0, min(255, cur[2] + n)),
                    255
                ))

def draw_oak_wood_tile(draw, img, ox=0, oy=0, seed=101):
    """Ancient dark polished oak floorboards with wood grains and nail heads."""
    random.seed(seed)
    planks = [(68, 44, 26), (60, 38, 22), (74, 48, 28), (56, 36, 20)]
    
    for i in range(4):
        py0 = oy + i * 8
        py1 = py0 + 7
        col = planks[i]
        draw.rectangle([ox, py0, ox + 31, py1], fill=(*col, 255))
        draw.line([ox, py0, ox + 31, py0], fill=(min(255, col[0] + 18), min(255, col[1] + 16), min(255, col[2] + 14), 255))
        draw.line([ox, py1, ox + 31, py1], fill=(max(0, col[0] - 25), max(0, col[1] - 22), max(0, col[2] - 18), 255))
        
        for gx in range(ox, ox + 32):
            if random.random() < 0.6:
                gy = py0 + random.randint(1, 6)
                img.putpixel((gx, gy), (max(0, col[0] - 10), max(0, col[1] - 8), max(0, col[2] - 6), 255))
                
        nx = ox + ((i * 9 + 5) % 28) + 2
        ny = py0 + 3
        draw.rectangle([nx, ny, nx + 1, ny + 1], fill=(24, 18, 14, 255))
        img.putpixel((nx, ny), (42, 36, 30, 255))

def draw_crimson_carpet_tile(draw, img, ox=0, oy=0, edge='center', seed=202):
    """Gryffindor royal crimson velvet carpet with woven antique gold Celtic border."""
    random.seed(seed)
    base_crimson = (116, 18, 34, 255)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=base_crimson)
    
    for px in range(ox, ox + 32):
        for py in range(oy, oy + 32):
            n = random.randint(-8, 8)
            img.putpixel((px, py), (
                max(0, min(255, base_crimson[0] + n)),
                max(0, min(255, base_crimson[1] + n//2)),
                max(0, min(255, base_crimson[2] + n//2)),
                255
            ))
            
    gold_main = (215, 175, 55, 255)
    gold_dark = (155, 120, 30, 255)
    gold_light = (250, 220, 110, 255)
    
    if 'top' in edge:
        draw.rectangle([ox, oy, ox + 31, oy + 3], fill=gold_dark)
        draw.line([ox, oy + 1, ox + 31, oy + 1], fill=gold_light)
        draw.line([ox, oy + 2, ox + 31, oy + 2], fill=gold_main)
        for fx in range(ox, ox + 32, 2):
            draw.line([fx, oy + 4, fx, oy + 5], fill=gold_main)
    if 'bottom' in edge:
        draw.rectangle([ox, oy + 28, ox + 31, oy + 31], fill=gold_dark)
        draw.line([ox, oy + 29, ox + 31, oy + 29], fill=gold_main)
        draw.line([ox, oy + 30, ox + 31, oy + 30], fill=gold_light)
        for fx in range(ox, ox + 32, 2):
            draw.line([fx, oy + 26, fx, oy + 27], fill=gold_main)
    if 'left' in edge:
        draw.rectangle([ox, oy, ox + 3, oy + 31], fill=gold_dark)
        draw.line([ox + 1, oy, ox + 1, oy + 31], fill=gold_light)
        draw.line([ox + 2, oy, ox + 2, oy + 31], fill=gold_main)
    if 'right' in edge:
        draw.rectangle([ox + 28, oy, ox + 31, oy + 31], fill=gold_dark)
        draw.line([ox + 29, oy, ox + 29, oy + 31], fill=gold_main)
        draw.line([ox + 30, oy, ox + 30, oy + 31], fill=gold_light)

def draw_dungeon_stone_tile(draw, img, ox=0, oy=0, seed=668):
    """Slytherin subterranean damp dungeon slate with emerald moss."""
    random.seed(seed)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=(22, 26, 25, 255))
    
    slabs = [
        (ox + 1, oy + 1, ox + 15, oy + 15, (44, 54, 50)),
        (ox + 18, oy + 1, ox + 30, oy + 20, (38, 48, 44)),
        (ox + 1, oy + 18, ox + 28, oy + 30, (48, 58, 54))
    ]
    for x0, y0, x1, y1, base in slabs:
        draw.rectangle([x0, y0, x1, y1], fill=(*base, 255))
        draw.line([x0, y0, x1, y0], fill=(min(255, base[0] + 16), min(255, base[1] + 18), min(255, base[2] + 18), 255))
        draw.line([x0, y1, x1, y1], fill=(max(0, base[0] - 18), max(0, base[1] - 18), max(0, base[2] - 18), 255))
        for px in range(x0 + 1, x1):
            for py in range(y0 + 1, y1):
                n = random.randint(-8, 8)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (
                    max(0, min(255, cur[0] + n)),
                    max(0, min(255, cur[1] + n + 2)),
                    max(0, min(255, cur[2] + n + 1)),
                    255
                ))
        mx = random.randint(x0 + 2, x1 - 3)
        my = random.randint(y0 + 2, y1 - 2)
        draw.rectangle([mx, my, mx + 2, my + 1], fill=(32, 68, 42, 255))

def draw_herbology_tile(draw, img, ox=0, oy=0, seed=217):
    """Herbology terracotta pavers with lush greenery peeking through."""
    random.seed(seed)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=(45, 30, 20, 255))
    
    stones = [
        (ox + 1, oy + 1, ox + 14, oy + 14, (120, 75, 50)),
        (ox + 17, oy + 1, ox + 30, oy + 14, (112, 70, 46)),
        (ox + 1, oy + 17, ox + 14, oy + 30, (116, 72, 48)),
        (ox + 17, oy + 17, ox + 30, oy + 30, (124, 78, 52))
    ]
    for x0, y0, x1, y1, base in stones:
        draw.rectangle([x0, y0, x1, y1], fill=(*base, 255))
        draw.line([x0, y0, x1, y0], fill=(min(255, base[0] + 20), min(255, base[1] + 18), min(255, base[2] + 16), 255))
        draw.line([x0, y1, x1, y1], fill=(max(0, base[0] - 22), max(0, base[1] - 20), max(0, base[2] - 18), 255))
        draw.line([ox + 15, oy + 14, ox + 15, oy + 12], fill=(60, 130, 50, 255))
        draw.line([ox + 16, oy + 15, ox + 17, oy + 14], fill=(75, 155, 60, 255))

def draw_stone_threshold_border(draw, img, ox=0, oy=0, orientation='vertical', seed=92):
    """Replaces modern thin lines with heavy castle stone threshold blocks."""
    random.seed(seed)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=(32, 28, 36, 255))
    if orientation == 'vertical':
        # Stone curb/threshold beam running vertically
        draw.rectangle([ox + 6, oy, ox + 25, oy + 31], fill=(68, 64, 76, 255))
        draw.line([ox + 6, oy, ox + 6, oy + 31], fill=(95, 90, 105, 255))
        draw.line([ox + 25, oy, ox + 25, oy + 31], fill=(42, 38, 48, 255))
        # Joints
        draw.line([ox + 6, oy + 15, ox + 25, oy + 15], fill=(32, 28, 36, 255))
    else:
        # Stone threshold beam running horizontally
        draw.rectangle([ox, oy + 6, ox + 31, oy + 25], fill=(68, 64, 76, 255))
        draw.line([ox, oy + 6, ox + 31, oy + 6], fill=(95, 90, 105, 255))
        draw.line([ox, oy + 25, ox + 31, oy + 25], fill=(42, 38, 48, 255))
        draw.line([ox + 15, oy + 6, ox + 15, oy + 25], fill=(32, 28, 36, 255))

# ==============================================================================
# 2. CASTLE WALLS, TORCHES, BANNERS & GOTHIC PILLARS
# ==============================================================================

def draw_castle_wall(draw, img, ox=0, oy=0, torch=False, banner=None, seed=303):
    """Ashlar granite castle wall with optional burning torch or house banner."""
    random.seed(seed)
    mortar = (28, 26, 34, 255)
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=mortar)
    
    b1 = [(ox, oy, ox + 18, oy + 14, (66, 62, 74)), (ox + 20, oy, ox + 31, oy + 14, (74, 70, 82))]
    b2 = [(ox, oy + 16, ox + 11, oy + 30, (72, 68, 80)), (ox + 13, oy + 16, ox + 31, oy + 30, (64, 60, 72))]
    
    for x0, y0, x1, y1, base in b1 + b2:
        draw.rectangle([x0, y0, x1, y1], fill=(*base, 255))
        draw.line([x0, y0, x1, y0], fill=(min(255, base[0] + 20), min(255, base[1] + 20), min(255, base[2] + 22), 255))
        draw.line([x0, y0, x0, y1], fill=(min(255, base[0] + 20), min(255, base[1] + 20), min(255, base[2] + 22), 255))
        draw.line([x0, y1, x1, y1], fill=(max(0, base[0] - 22), max(0, base[1] - 22), max(0, base[2] - 20), 255))
        draw.line([x1, y0, x1, y1], fill=(max(0, base[0] - 22), max(0, base[1] - 22), max(0, base[2] - 20), 255))
        
        for px in range(x0 + 1, x1):
            for py in range(y0 + 1, y1):
                n = random.randint(-8, 8)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (
                    max(0, min(255, cur[0] + n)),
                    max(0, min(255, cur[1] + n)),
                    max(0, min(255, cur[2] + n)),
                    255
                ))
                
    if torch:
        tx = ox + 16
        draw.rectangle([tx - 1, oy + 16, tx + 1, oy + 24], fill=(70, 50, 25, 255))
        draw.rectangle([tx - 2, oy + 18, tx + 2, oy + 19], fill=(130, 95, 45, 255))
        draw.rectangle([tx - 2, oy + 14, tx + 2, oy + 16], fill=(160, 120, 55, 255))
        draw.polygon([(tx, oy + 4), (tx - 4, oy + 11), (tx + 4, oy + 11)], fill=(255, 95, 20, 255))
        draw.polygon([(tx, oy + 6), (tx - 3, oy + 12), (tx + 3, oy + 12)], fill=(255, 195, 40, 255))
        draw.polygon([(tx, oy + 8), (tx - 1, oy + 13), (tx + 1, oy + 13)], fill=(255, 255, 210, 255))
        for rx in range(tx - 6, tx + 7):
            for ry in range(oy + 2, oy + 16):
                if 0 <= rx < img.width and 0 <= ry < img.height:
                    cp = img.getpixel((rx, ry))
                    img.putpixel((rx, ry), (min(255, cp[0] + 25), min(255, cp[1] + 15), cp[2], 255))
                    
    if banner:
        bx = ox + 16
        draw.rectangle([bx - 10, oy + 2, bx + 10, oy + 3], fill=(190, 155, 60, 255))
        b_color = (140, 20, 32, 255) if banner == 'gryffindor' else (25, 90, 55, 255)
        accent = (235, 195, 55, 255) if banner == 'gryffindor' else (180, 195, 185, 255)
        draw.rectangle([bx - 8, oy + 4, bx + 8, oy + 22], fill=b_color)
        draw.polygon([(bx - 8, oy + 22), (bx + 8, oy + 22), (bx, oy + 28)], fill=b_color)
        draw.rectangle([bx - 3, oy + 9, bx + 3, oy + 15], fill=accent)
        draw.line([bx - 4, oy + 11, bx + 4, oy + 11], fill=(255, 235, 120, 255))

def draw_gothic_pillar(draw, img, ox=0, oy=0):
    """Carved gothic stone pillar / column replacing modern blue glass dividers."""
    draw.rectangle([ox, oy, ox + 31, oy + 31], fill=(0, 0, 0, 0))
    draw.rectangle([ox + 8, oy, ox + 23, oy + 4], fill=(95, 90, 102, 255))
    draw.line([ox + 7, oy + 1, ox + 24, oy + 1], fill=(125, 120, 135, 255))
    draw.rectangle([ox + 8, oy + 27, ox + 23, oy + 31], fill=(95, 90, 102, 255))
    draw.line([ox + 7, oy + 27, ox + 24, oy + 27], fill=(125, 120, 135, 255))
    draw.rectangle([ox + 10, oy + 5, ox + 21, oy + 26], fill=(78, 74, 86, 255))
    draw.line([ox + 11, oy + 5, ox + 11, oy + 26], fill=(115, 110, 125, 255))
    draw.line([ox + 14, oy + 5, ox + 14, oy + 26], fill=(115, 110, 125, 255))
    draw.line([ox + 17, oy + 5, ox + 17, oy + 26], fill=(115, 110, 125, 255))
    draw.line([ox + 13, oy + 5, ox + 13, oy + 26], fill=(52, 48, 58, 255))
    draw.line([ox + 16, oy + 5, ox + 16, oy + 26], fill=(52, 48, 58, 255))
    draw.line([ox + 20, oy + 5, ox + 20, oy + 26], fill=(52, 48, 58, 255))

# ==============================================================================
# 3. INTERACTIVE ITEMS DESIGN
# ==============================================================================

def create_grand_hogwarts_notice_board():
    """Grand Hogwarts Notice Board with gold baroque frame, crest & moving notices (64x192)."""
    img = Image.new('RGBA', (64, 192), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    for f in range(3):
        fy = f * 64
        draw.rectangle([2, fy + 2, 61, fy + 61], fill=(160, 125, 40, 255))
        draw.rectangle([4, fy + 4, 59, fy + 59], fill=(215, 175, 55, 255))
        draw.rectangle([6, fy + 6, 57, fy + 57], fill=(120, 90, 25, 255))
        draw.rectangle([7, fy + 7, 56, fy + 56], fill=(228, 212, 172, 255))
        
        random.seed(f * 10 + 7)
        for px in range(7, 57):
            for py in range(fy + 7, fy + 57):
                n = random.randint(-6, 6)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (
                    max(0, min(255, cur[0] + n)),
                    max(0, min(255, cur[1] + n - 2)),
                    max(0, min(255, cur[2] + n - 4)),
                    255
                ))
                
        # Crest
        draw.polygon([(32, fy + 9), (24, fy + 14), (26, fy + 21), (32, fy + 24), (38, fy + 21), (40, fy + 14)], fill=(160, 30, 40, 255))
        draw.polygon([(32, fy + 10), (25, fy + 14), (27, fy + 20), (32, fy + 23), (37, fy + 20), (39, fy + 14)], fill=(225, 185, 50, 255))
        draw.rectangle([30, fy + 14, 34, fy + 18], fill=(30, 25, 35, 255))
        
        # Daily Prophet clipping
        draw.rectangle([11, fy + 26, 29, fy + 51], fill=(245, 240, 225, 255))
        draw.rectangle([13, fy + 28, 27, fy + 40], fill=(70, 75, 80, 255))
        wiz_x = 18 + (f % 3)
        draw.rectangle([wiz_x, fy + 31, wiz_x + 3, fy + 37], fill=(210, 215, 220, 255))
        draw.polygon([(wiz_x + 1, fy + 29), (wiz_x - 1, fy + 32), (wiz_x + 3, fy + 32)], fill=(240, 240, 245, 255))
        draw.line([13, fy + 43, 27, fy + 43], fill=(35, 30, 25, 255))
        draw.line([13, fy + 46, 25, fy + 46], fill=(35, 30, 25, 255))
        draw.line([13, fy + 49, 23, fy + 49], fill=(35, 30, 25, 255))
        draw.ellipse([18, fy + 24, 22, fy + 28], fill=(185, 25, 35, 255))
        draw.ellipse([19, fy + 25, 21, fy + 27], fill=(225, 60, 70, 255))
        
        # Parchment notice
        draw.rectangle([34, fy + 26, 52, fy + 46], fill=(238, 224, 186, 255))
        draw.line([36, fy + 30, 50, fy + 30], fill=(75, 45, 20, 255))
        draw.line([36, fy + 34, 48, fy + 34], fill=(75, 45, 20, 255))
        draw.line([36, fy + 38, 50, fy + 38], fill=(75, 45, 20, 255))
        draw.line([36, fy + 42, 44, fy + 42], fill=(75, 45, 20, 255))
        draw.ellipse([41, fy + 24, 45, fy + 28], fill=(185, 25, 35, 255))
        
        # Quill
        qx, qy = 44 + (f % 2), fy + 47 - (f % 2)
        draw.line([qx, qy, qx + 6, qy - 7], fill=(245, 240, 230, 255))
        draw.line([qx + 1, qy - 1, qx + 7, qy - 6], fill=(225, 220, 205, 255))
        draw.point((qx, qy), fill=(160, 125, 40, 255))
        
    return img

def create_alchemy_potions_desk():
    """Hogwarts Alchemy & Study Desk with bubbling cauldron, crystal orb, and grimoire (480x64, 5 frames)."""
    img = Image.new('RGBA', (480, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    for f in range(5):
        fx = f * 96
        # Table slab
        draw.rectangle([fx + 6, 20, fx + 89, 32], fill=(62, 38, 22, 255))
        draw.line([fx + 6, 20, fx + 89, 20], fill=(105, 68, 42, 255))
        draw.line([fx + 6, 32, fx + 89, 32], fill=(32, 18, 10, 255))
        
        # Legs
        draw.rectangle([fx + 10, 33, fx + 18, 58], fill=(48, 28, 16, 255))
        draw.rectangle([fx + 77, 33, fx + 85, 58], fill=(48, 28, 16, 255))
        draw.rectangle([fx + 8, 56, fx + 20, 60], fill=(75, 46, 26, 255))
        draw.rectangle([fx + 75, 56, fx + 87, 60], fill=(75, 46, 26, 255))
        draw.line([fx + 18, 48, fx + 77, 48], fill=(42, 24, 14, 255))
        
        # Cauldron
        cx, cy = fx + 23, 16
        draw.ellipse([cx - 8, cy - 4, cx + 8, cy + 8], fill=(35, 34, 40, 255))
        draw.ellipse([cx - 7, cy - 5, cx + 7, cy - 1], fill=(55, 54, 62, 255))
        potion_color = (40, 215, 120, 255) if f % 2 == 0 else (160, 45, 235, 255)
        draw.ellipse([cx - 5, cy - 4, cx + 5, cy - 2], fill=potion_color)
        bub_y = cy - 6 - (f * 2 % 8)
        draw.ellipse([cx - 2 + (f % 3), bub_y, cx + 1 + (f % 3), bub_y + 2], fill=(120, 255, 190, 220))
        draw.line([cx - 6, cy + 7, cx - 8, cy + 11], fill=(25, 24, 28, 255))
        draw.line([cx + 6, cy + 7, cx + 8, cy + 11], fill=(25, 24, 28, 255))
        draw.line([cx, cy + 8, cx, cy + 11], fill=(25, 24, 28, 255))
        
        # Grimoire
        bx, by = fx + 48, 19
        draw.polygon([(bx - 10, by - 4), (bx, by - 2), (bx + 10, by - 4), (bx + 9, by + 5), (bx, by + 7), (bx - 9, by + 5)], fill=(110, 25, 35, 255))
        draw.polygon([(bx - 9, by - 5), (bx, by - 3), (bx + 9, by - 5), (bx + 8, by + 4), (bx, by + 6), (bx - 8, by + 4)], fill=(240, 230, 200, 255))
        rune_glow = (255, 215, 60, 255) if f % 2 == 1 else (255, 160, 30, 255)
        draw.line([bx - 7, by - 1, bx - 2, by - 1], fill=rune_glow)
        draw.line([bx - 7, by + 2, bx - 3, by + 2], fill=rune_glow)
        draw.line([bx + 2, by - 1, bx + 7, by - 1], fill=rune_glow)
        draw.line([bx + 2, by + 2, bx + 6, by + 2], fill=rune_glow)
        
        # Crystal Orb
        ox, oy = fx + 74, 14
        draw.rectangle([ox - 4, oy + 5, ox + 4, oy + 7], fill=(195, 155, 45, 255))
        draw.line([ox - 4, oy + 7, ox - 6, oy + 12], fill=(160, 120, 35, 255))
        draw.line([ox + 4, oy + 7, ox + 6, oy + 12], fill=(160, 120, 35, 255))
        draw.ellipse([ox - 6, oy - 6, ox + 6, oy + 6], fill=(90, 150, 220, 230))
        draw.ellipse([ox - 4, oy - 4, ox + 4, oy + 4], fill=(160, 220, 255, 240))
        hl_x = ox - 2 + (f % 2)
        hl_y = oy - 2 + ((f + 1) % 2)
        draw.point((hl_x, hl_y), fill=(255, 255, 255, 255))
        draw.point((hl_x + 1, hl_y), fill=(255, 255, 255, 255))
        
        # Vials & Quill
        draw.rectangle([fx + 59, 17, fx + 62, 23], fill=(225, 40, 50, 240))
        draw.point((fx + 60, 16), fill=(200, 180, 120, 255))
        draw.line([fx + 34, 22, fx + 37, 14], fill=(245, 245, 250, 255))
        draw.point((fx + 34, 22), fill=(30, 25, 20, 255))
        
    return img

def create_floo_fireplace():
    """Floo Network Fireplace with roaring emerald flames (48x72)."""
    img = Image.new('RGBA', (48, 72), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Mantle
    draw.rectangle([4, 10, 43, 71], fill=(55, 52, 62, 255))
    draw.line([4, 10, 43, 10], fill=(95, 92, 104, 255))
    draw.line([4, 71, 43, 71], fill=(28, 26, 32, 255))
    draw.line([4, 10, 4, 71], fill=(95, 92, 104, 255))
    draw.line([43, 10, 43, 71], fill=(28, 26, 32, 255))
    
    draw.rectangle([2, 6, 45, 12], fill=(78, 74, 86, 255))
    draw.line([2, 6, 45, 6], fill=(125, 120, 135, 255))
    draw.line([2, 12, 45, 12], fill=(35, 32, 40, 255))
    
    # Floo powder pot
    draw.rectangle([9, 2, 16, 6], fill=(185, 145, 45, 255))
    draw.line([8, 1, 17, 1], fill=(225, 185, 65, 255))
    
    # Hearth & Flames
    draw.rectangle([10, 26, 37, 68], fill=(16, 14, 18, 255))
    draw.polygon([(10, 26), (24, 17), (37, 26)], fill=(16, 14, 18, 255))
    draw.polygon([(24, 28), (14, 62), (34, 62)], fill=(15, 160, 75, 255))
    draw.polygon([(24, 34), (17, 64), (31, 64)], fill=(40, 230, 115, 255))
    draw.polygon([(24, 40), (20, 65), (28, 65)], fill=(180, 255, 210, 255))
    
    for sx, sy in [(22, 24), (27, 20), (19, 18), (29, 27), (16, 29), (32, 32)]:
        draw.point((sx, sy), fill=(80, 255, 150, 255))
        
    return img

def create_gothic_velvet_chair():
    """Gothic high-back carved dark mahogany thrones with crimson velvet cushions (32x1472, 23 frames)."""
    img = Image.new('RGBA', (32, 1472), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    for f in range(23):
        fy = f * 64
        draw.rectangle([6, fy + 14, 25, fy + 42], fill=(54, 30, 18, 255))
        draw.polygon([(6, fy + 14), (16, fy + 6), (25, fy + 14)], fill=(54, 30, 18, 255))
        draw.polygon([(7, fy + 14), (16, fy + 8), (24, fy + 14)], fill=(85, 48, 28, 255))
        
        draw.rectangle([9, fy + 15, 22, fy + 40], fill=(135, 20, 35, 255))
        draw.point((13, fy + 22), fill=(215, 175, 55, 255))
        draw.point((18, fy + 22), fill=(215, 175, 55, 255))
        draw.point((15, fy + 29), fill=(215, 175, 55, 255))
        draw.point((13, fy + 36), fill=(215, 175, 55, 255))
        draw.point((18, fy + 36), fill=(215, 175, 55, 255))
        
        draw.rectangle([5, fy + 41, 26, fy + 50], fill=(155, 24, 42, 255))
        draw.line([5, fy + 41, 26, fy + 41], fill=(215, 175, 55, 255))
        draw.line([5, fy + 50, 26, fy + 50], fill=(85, 12, 22, 255))
        
        draw.rectangle([6, fy + 51, 9, fy + 60], fill=(42, 22, 12, 255))
        draw.rectangle([22, fy + 51, 25, fy + 60], fill=(42, 22, 12, 255))
        draw.point((6, fy + 60), fill=(160, 125, 40, 255))
        draw.point((25, fy + 60), fill=(160, 125, 40, 255))
        
    return img

# ==============================================================================
# 4. HOGWARTS STUDENT CHARACTER ROBES DESIGN
# ==============================================================================

def reskin_character_robes(char_name, house):
    """Transforms character from modern business suit to Hogwarts student robes."""
    src_path = os.path.join(BACKUP_DIR, f'character/{char_name}.png')
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    
    if house == 'gryffindor':
        c_scarf1 = (175, 25, 38, 255)
        c_scarf2 = (225, 180, 50, 255)
    elif house == 'slytherin':
        c_scarf1 = (24, 115, 62, 255)
        c_scarf2 = (175, 185, 175, 255)
    elif house == 'ravenclaw':
        c_scarf1 = (24, 75, 150, 255)
        c_scarf2 = (185, 140, 70, 255)
    else: # hufflepuff
        c_scarf1 = (225, 168, 30, 255)
        c_scarf2 = (42, 40, 38, 255)
        
    c_robe_dark = (22, 20, 26, 255)
    c_robe_mid = (34, 31, 40, 255)
    c_robe_hl = (48, 44, 56, 255)
    c_shirt = (235, 235, 240, 255)
    c_boots = (18, 16, 20, 255)
    
    for frame_idx in range(52):
        fx = frame_idx * 32
        is_facing_down = (18 <= frame_idx <= 23) or (42 <= frame_idx <= 47) or (frame_idx == 48)
        
        for px in range(32):
            x = fx + px
            for py in range(48):
                y = py
                r, g, b, a = img.getpixel((x, y))
                if a == 0:
                    continue
                is_skin = (r > 185 and g > 115 and b > 95 and r > g and g >= b - 15)
                if py < 19 or is_skin:
                    continue
                    
                is_outline = (r < 70 and g < 70 and b < 90)
                if is_outline:
                    img.putpixel((x, y), (16, 14, 20, 255))
                elif py >= 38:
                    img.putpixel((x, y), c_boots)
                elif is_facing_down and py in (20, 21, 22) and 14 <= px <= 17:
                    img.putpixel((x, y), c_shirt)
                elif is_facing_down and py in (23, 24, 25, 26) and 13 <= px <= 18:
                    if (py + px) % 2 == 0:
                        img.putpixel((x, y), c_scarf1)
                    else:
                        img.putpixel((x, y), c_scarf2)
                elif is_facing_down and py in (27, 28) and px in (11, 12):
                    img.putpixel((x, y), c_scarf2)
                else:
                    if px in (10, 21) or py == 37:
                        img.putpixel((x, y), c_robe_hl)
                    elif (py + px) % 2 == 0:
                        img.putpixel((x, y), c_robe_mid)
                    else:
                        img.putpixel((x, y), c_robe_dark)
                        
    return img

# ==============================================================================
# 5. GOTHIC FURNITURE IN MODERN_OFFICE_BLACK_SHADOW
# ==============================================================================

def reskin_modern_office_to_gothic():
    """Reskins office desks, file cabinets, and plants into Hogwarts medieval furniture."""
    src_path = os.path.join(BACKUP_DIR, 'tileset/Modern_Office_Black_Shadow.png')
    img = Image.open(src_path).convert('RGBA')
    draw = ImageDraw.Draw(img)
    
    # 1. Replace 3x3 Office Desks (rows 26..28, cols 3..5) with Hogwarts Carved Oak Banquet Table
    for r in range(26, 29):
        for c in range(3, 6):
            ox, oy = c * 32, r * 32
            draw.rectangle([ox, oy, ox + 31, oy + 31], fill=(58, 34, 18, 255))
            for gy in range(oy, oy + 32, 4):
                draw.line([ox, gy, ox + 31, gy], fill=(76, 46, 26, 255))
                draw.line([ox, gy + 1, ox + 31, gy + 1], fill=(42, 24, 12, 255))
                
    # Center candelabra
    tx, ty = 4 * 32 + 16, 27 * 32 + 16
    draw.rectangle([tx - 6, ty + 2, tx + 6, ty + 4], fill=(195, 155, 45, 255))
    draw.line([tx, ty - 6, tx, ty + 2], fill=(215, 175, 55, 255))
    draw.line([tx - 5, ty - 4, tx - 5, ty + 2], fill=(215, 175, 55, 255))
    draw.line([tx + 5, ty - 4, tx + 5, ty + 2], fill=(215, 175, 55, 255))
    draw.point((tx, ty - 8), fill=(255, 200, 50, 255))
    draw.point((tx - 5, ty - 6), fill=(255, 180, 40, 255))
    draw.point((tx + 5, ty - 6), fill=(255, 180, 40, 255))
    
    # 2. Replace 1x3 Vertical Office Cabinet (rows 0..2, col 12) with Gothic Grimoire Bookcase
    for r in range(3):
        ox, oy = 12 * 32, r * 32
        draw.rectangle([ox + 2, oy, ox + 29, oy + 31], fill=(44, 24, 12, 255))
        draw.line([ox + 2, oy, ox + 2, oy + 31], fill=(75, 45, 24, 255))
        draw.line([ox + 29, oy, ox + 29, oy + 31], fill=(25, 14, 8, 255))
        for sy in [oy + 10, oy + 21]:
            draw.line([ox + 2, sy, ox + 29, sy], fill=(85, 52, 28, 255))
        book_colors = [
            (145, 25, 35, 255), (25, 115, 60, 255), (30, 75, 145, 255),
            (195, 155, 45, 255), (95, 40, 125, 255), (165, 85, 30, 255)
        ]
        bx = ox + 4
        for bi, bc in enumerate(book_colors):
            draw.rectangle([bx, oy + 3, bx + 2, oy + 9], fill=bc)
            draw.point((bx + 1, oy + 6), fill=(235, 215, 100, 255))
            bx += 4
            if bx > ox + 26:
                break
                
    # 3. Replace Office Plant (rows 12..13, col 6) with Potted Mandrake in Terracotta Pot
    px, py = 6 * 32 + 16, 13 * 32 + 16
    draw.polygon([(px - 8, py + 8), (px + 8, py + 8), (px + 6, py + 15), (px - 6, py + 15)], fill=(135, 75, 45, 255))
    draw.rectangle([px - 9, py + 6, px + 9, py + 8], fill=(165, 95, 55, 255))
    draw.rectangle([px - 7, py + 4, px + 7, py + 6], fill=(52, 36, 24, 255))
    draw.ellipse([px - 6, py - 4, px + 6, py + 4], fill=(120, 95, 65, 255))
    draw.point((px - 2, py - 1), fill=(40, 30, 20, 255))
    draw.point((px + 2, py - 1), fill=(40, 30, 20, 255))
    draw.line([px, py - 5, px, py - 12], fill=(55, 135, 50, 255))
    draw.line([px - 1, py - 10, px - 6, py - 15], fill=(70, 165, 60, 255))
    draw.line([px + 1, py - 10, px + 6, py - 15], fill=(70, 165, 60, 255))
    
    return img

# ==============================================================================
# 6. MASTER EXECUTION & COMPOSITION
# ==============================================================================

def main():
    print('Starting Master Hogwarts Visual Overhaul...')
    
    # 1. FloorAndGround.png (2048 x 1280)
    fg_path = os.path.join(BACKUP_DIR, 'map/FloorAndGround.png')
    fg_img = Image.open(fg_path).convert('RGBA')
    fg_draw = ImageDraw.Draw(fg_img)
    
    def gid_coords(gid):
        idx = gid - 1
        return (idx % 64) * 32, (idx // 64) * 32
        
    print('Generating Hogwarts floors & walls into FloorAndGround.png for all 54 GIDs...')
    # Primary floors
    draw_flagstone_tile(fg_draw, fg_img, *gid_coords(412), seed=412) # Main chamber
    draw_corridor_flagstone(fg_draw, fg_img, *gid_coords(415), seed=415) # Castle corridor
    
    # Floor transitions & borders (replaces all modern lines!)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(92), orientation='vertical', seed=92)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(411), orientation='vertical', seed=411)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(414), orientation='vertical', seed=414)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(348), orientation='horizontal', seed=348)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(351), orientation='horizontal', seed=351)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(347), orientation='horizontal', seed=347)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(349), orientation='horizontal', seed=349)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(350), orientation='horizontal', seed=350)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(352), orientation='horizontal', seed=352)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(785), orientation='horizontal', seed=785)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(786), orientation='horizontal', seed=786)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(787), orientation='horizontal', seed=787)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(788), orientation='horizontal', seed=788)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(793), orientation='horizontal', seed=793)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(794), orientation='horizontal', seed=794)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(724), orientation='horizontal', seed=724)
    
    # Outer bounds
    draw_flagstone_tile(fg_draw, fg_img, *gid_coords(1), seed=1)
    draw_flagstone_tile(fg_draw, fg_img, *gid_coords(65), seed=65)
    draw_flagstone_tile(fg_draw, fg_img, *gid_coords(85), seed=85)
    draw_flagstone_tile(fg_draw, fg_img, *gid_coords(88), seed=88)
    draw_flagstone_tile(fg_draw, fg_img, *gid_coords(90), seed=90)
    draw_flagstone_tile(fg_draw, fg_img, *gid_coords(29), seed=29)
    
    # Gryffindor Velvet Carpet
    draw_crimson_carpet_tile(fg_draw, fg_img, *gid_coords(2383), edge='center', seed=2383)
    draw_crimson_carpet_tile(fg_draw, fg_img, *gid_coords(2319), edge='top', seed=2319)
    draw_crimson_carpet_tile(fg_draw, fg_img, *gid_coords(2382), edge='left', seed=2382)
    draw_crimson_carpet_tile(fg_draw, fg_img, *gid_coords(2320), edge='top_right', seed=2320)
    draw_crimson_carpet_tile(fg_draw, fg_img, *gid_coords(994), edge='top', seed=994)
    draw_crimson_carpet_tile(fg_draw, fg_img, *gid_coords(993), edge='top_left', seed=993)
    draw_crimson_carpet_tile(fg_draw, fg_img, *gid_coords(995), edge='top_right', seed=995)
    
    # Library Dark Oak
    draw_oak_wood_tile(fg_draw, fg_img, *gid_coords(1607), seed=1607)
    draw_oak_wood_tile(fg_draw, fg_img, *gid_coords(546), seed=546)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(152), orientation='vertical', seed=152)
    draw_stone_threshold_border(fg_draw, fg_img, *gid_coords(154), orientation='vertical', seed=154)
    
    # Slytherin Potions Dungeon
    draw_dungeon_stone_tile(fg_draw, fg_img, *gid_coords(668), seed=668)
    draw_dungeon_stone_tile(fg_draw, fg_img, *gid_coords(594), seed=594)
    draw_dungeon_stone_tile(fg_draw, fg_img, *gid_coords(658), seed=658)
    draw_dungeon_stone_tile(fg_draw, fg_img, *gid_coords(604), seed=604)
    draw_dungeon_stone_tile(fg_draw, fg_img, *gid_coords(610), seed=610)
    draw_dungeon_stone_tile(fg_draw, fg_img, *gid_coords(603), seed=603)
    draw_dungeon_stone_tile(fg_draw, fg_img, *gid_coords(667), seed=667)
    
    # Herbology Greenhouse
    draw_herbology_tile(fg_draw, fg_img, *gid_coords(217), seed=217)
    draw_herbology_tile(fg_draw, fg_img, *gid_coords(216), seed=216)
    draw_herbology_tile(fg_draw, fg_img, *gid_coords(218), seed=218)
    draw_herbology_tile(fg_draw, fg_img, *gid_coords(213), seed=213)
    
    # Castle Stone Walls
    draw_castle_wall(fg_draw, fg_img, *gid_coords(722), torch=True, seed=722)
    draw_castle_wall(fg_draw, fg_img, *gid_coords(930), torch=False, seed=930)
    draw_gothic_pillar(fg_draw, fg_img, *gid_coords(149)) # Gothic Pillar replaces glass divider!
    draw_castle_wall(fg_draw, fg_img, *gid_coords(721), banner='gryffindor', seed=721)
    draw_castle_wall(fg_draw, fg_img, *gid_coords(723), banner='slytherin', seed=723)
    draw_castle_wall(fg_draw, fg_img, *gid_coords(929), torch=False, seed=929)
    draw_castle_wall(fg_draw, fg_img, *gid_coords(931), torch=False, seed=931)
    draw_castle_wall(fg_draw, fg_img, *gid_coords(28), torch=False, seed=28)
    
    # Save FloorAndGround.png
    out_fg = os.path.join(PUBLIC_ASSETS, 'map/FloorAndGround.png')
    fg_img.save(out_fg)
    print('Saved:', out_fg)
    
    # 2. Interactive Items
    print('Generating Grand Hogwarts Notice Board...')
    wb_img = create_grand_hogwarts_notice_board()
    out_wb = os.path.join(PUBLIC_ASSETS, 'items/whiteboard.png')
    wb_img.save(out_wb)
    print('Saved:', out_wb)
    
    print('Generating Hogwarts Alchemy & Study Desk...')
    comp_img = create_alchemy_potions_desk()
    out_comp = os.path.join(PUBLIC_ASSETS, 'items/computer.png')
    comp_img.save(out_comp)
    print('Saved:', out_comp)
    
    print('Generating Floo Network Fireplace...')
    vm_img = create_floo_fireplace()
    out_vm = os.path.join(PUBLIC_ASSETS, 'items/vendingmachine.png')
    vm_img.save(out_vm)
    print('Saved:', out_vm)
    
    print('Generating Gothic High-Back Velvet Chairs...')
    chair_img = create_gothic_velvet_chair()
    out_chair = os.path.join(PUBLIC_ASSETS, 'items/chair.png')
    chair_img.save(out_chair)
    print('Saved:', out_chair)
    
    # 3. Gothic Furniture & Props
    print('Generating Gothic Furniture in Modern_Office_Black_Shadow.png...')
    mobs_img = reskin_modern_office_to_gothic()
    out_mobs = os.path.join(PUBLIC_ASSETS, 'tileset/Modern_Office_Black_Shadow.png')
    mobs_img.save(out_mobs)
    print('Saved:', out_mobs)
    
    # 4. Hogwarts Student Character Robes
    chars = [
        ('adam', 'gryffindor'),
        ('ash', 'slytherin'),
        ('lucy', 'ravenclaw'),
        ('nancy', 'hufflepuff')
    ]
    for cname, house in chars:
        print(f'Generating Hogwarts robes for {cname} ({house})...')
        c_img = reskin_character_robes(cname, house)
        out_c = os.path.join(PUBLIC_ASSETS, f'character/{cname}.png')
        c_img.save(out_c)
        print('Saved:', out_c)
        
    # 5. Mirror to dist/assets/
    if os.path.exists(DIST_ASSETS):
        print('Syncing generated assets to dist/assets/...')
        os.system(f'cp -r {PUBLIC_ASSETS}/* {DIST_ASSETS}/')
        
    print('All Hogwarts assets successfully created and deployed!')

if __name__ == '__main__':
    main()
