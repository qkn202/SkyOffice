import random
from PIL import Image, ImageDraw

def create_flagstone(seed=42):
    random.seed(seed)
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Base mortar background
    mortar_color = (42, 38, 46, 255)
    draw.rectangle([0, 0, 31, 31], fill=mortar_color)
    
    # 4 irregular flagstones per 32x32 tile
    stones = [
        ([1, 1, 15, 13], (98, 92, 102)),
        ([18, 1, 30, 16], (108, 102, 112)),
        ([1, 16, 16, 30], (104, 98, 108)),
        ([19, 19, 30, 30], (94, 88, 98))
    ]
    
    for (x0, y0, x1, y1), base_col in stones:
        # Draw base stone
        draw.rectangle([x0, y0, x1, y1], fill=(*base_col, 255))
        
        # Add bevel highlight (top & left edges)
        hl_col = (min(255, base_col[0] + 25), min(255, base_col[1] + 25), min(255, base_col[2] + 25), 255)
        draw.line([x0, y0, x1, y0], fill=hl_col)
        draw.line([x0, y0, x0, y1], fill=hl_col)
        
        # Add bevel shadow (bottom & right edges)
        sh_col = (max(0, base_col[0] - 25), max(0, base_col[1] - 25), max(0, base_col[2] - 25), 255)
        draw.line([x0, y1, x1, y1], fill=sh_col)
        draw.line([x1, y0, x1, y1], fill=sh_col)
        
        # Subtle texture noise on stone surface
        for px in range(x0 + 1, x1):
            for py in range(y0 + 1, y1):
                n = random.randint(-12, 12)
                cur = img.getpixel((px, py))
                r = max(0, min(255, cur[0] + n))
                g = max(0, min(255, cur[1] + n))
                b = max(0, min(255, cur[2] + n))
                img.putpixel((px, py), (r, g, b, 255))
                
        # Subtle moss in crevice
        if random.random() < 0.4:
            mx = random.randint(x0 + 1, x1 - 1)
            my = y1
            img.putpixel((mx, my), (55, 78, 52, 255))
            if mx + 1 < x1:
                img.putpixel((mx + 1, my), (68, 92, 62, 255))
                
    return img

def create_oak_wood(seed=101):
    random.seed(seed)
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 4 horizontal wooden planks (each 8px high)
    plank_colors = [
        (72, 46, 28),
        (64, 40, 24),
        (76, 49, 30),
        (60, 38, 22)
    ]
    
    for i in range(4):
        y0 = i * 8
        y1 = y0 + 7
        col = plank_colors[i]
        draw.rectangle([0, y0, 31, y1], fill=(*col, 255))
        
        # Highlight on top edge of plank
        hl = (min(255, col[0] + 18), min(255, col[1] + 16), min(255, col[2] + 14), 255)
        draw.line([0, y0, 31, y0], fill=hl)
        
        # Dark shadow on bottom groove between planks
        sh = (max(0, col[0] - 25), max(0, col[1] - 22), max(0, col[2] - 18), 255)
        draw.line([0, y1, 31, y1], fill=sh)
        
        # Wood grain lines
        for gx in range(0, 32):
            if random.random() < 0.6:
                gy = y0 + random.randint(1, 6)
                img.putpixel((gx, gy), (max(0, col[0] - 10), max(0, col[1] - 8), max(0, col[2] - 6), 255))
                
        # Iron nail heads near joints
        nail_x = (i * 9 + 4) % 30 + 1
        nail_y = y0 + 3
        draw.rectangle([nail_x, nail_y, nail_x + 1, nail_y + 1], fill=(28, 24, 22, 255))
        img.putpixel((nail_x, nail_y), (48, 44, 40, 255))
        
    return img

def create_crimson_carpet(edge_type='center', seed=202):
    random.seed(seed)
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Base deep crimson velvet
    base_crimson = (112, 18, 32, 255)
    draw.rectangle([0, 0, 31, 31], fill=base_crimson)
    
    # Velvet micro-texture
    for x in range(32):
        for y in range(32):
            n = random.randint(-8, 8)
            img.putpixel((x, y), (max(0, min(255, base_crimson[0] + n)),
                                 max(0, min(255, base_crimson[1] + n//2)),
                                 max(0, min(255, base_crimson[2] + n//2)), 255))
            
    # Gold border if edge
    gold_main = (212, 175, 55, 255)
    gold_dark = (160, 125, 30, 255)
    gold_light = (245, 215, 110, 255)
    
    if 'top' in edge_type:
        draw.rectangle([0, 0, 31, 4], fill=gold_dark)
        draw.line([0, 1, 31, 1], fill=gold_light)
        draw.line([0, 2, 31, 2], fill=gold_main)
        # Gold fringe
        for fx in range(0, 32, 2):
            draw.line([fx, 5, fx, 6], fill=gold_main)
    if 'bottom' in edge_type:
        draw.rectangle([0, 27, 31, 31], fill=gold_dark)
        draw.line([0, 29, 31, 29], fill=gold_main)
        draw.line([0, 30, 31, 30], fill=gold_light)
        for fx in range(0, 32, 2):
            draw.line([fx, 25, fx, 26], fill=gold_main)
    if 'left' in edge_type:
        draw.rectangle([0, 0, 4, 31], fill=gold_dark)
        draw.line([1, 0, 1, 31], fill=gold_light)
        draw.line([2, 0, 2, 31], fill=gold_main)
    if 'right' in edge_type:
        draw.rectangle([27, 0, 31, 31], fill=gold_dark)
        draw.line([29, 0, 29, 31], fill=gold_main)
        draw.line([30, 0, 30, 31], fill=gold_light)
        
    return img

def create_castle_wall(torch=False, banner=None, seed=303):
    random.seed(seed)
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 2 courses of heavy Ashlar stone blocks (each 16px high)
    mortar = (32, 30, 38, 255)
    draw.rectangle([0, 0, 31, 31], fill=mortar)
    
    # Course 1 (y: 0..14) -> 2 blocks (split at x=18)
    blocks_c1 = [([0, 0, 17, 14], (68, 64, 76)), ([19, 0, 31, 14], (76, 72, 84))]
    # Course 2 (y: 16..30) -> 2 blocks (split at x=10)
    blocks_c2 = [([0, 16, 9, 30], (74, 70, 82)), ([11, 16, 31, 30], (66, 62, 74))]
    
    for (x0, y0, x1, y1), base_col in blocks_c1 + blocks_c2:
        draw.rectangle([x0, y0, x1, y1], fill=(*base_col, 255))
        # Top & left highlight
        hl = (min(255, base_col[0] + 20), min(255, base_col[1] + 20), min(255, base_col[2] + 22), 255)
        draw.line([x0, y0, x1, y0], fill=hl)
        draw.line([x0, y0, x0, y1], fill=hl)
        # Bottom & right shadow
        sh = (max(0, base_col[0] - 22), max(0, base_col[1] - 22), max(0, base_col[2] - 20), 255)
        draw.line([x0, y1, x1, y1], fill=sh)
        draw.line([x1, y0, x1, y1], fill=sh)
        # Surface texture
        for px in range(x0 + 1, x1):
            for py in range(y0 + 1, y1):
                n = random.randint(-10, 10)
                cur = img.getpixel((px, py))
                img.putpixel((px, py), (max(0, min(255, cur[0] + n)),
                                        max(0, min(255, cur[1] + n)),
                                        max(0, min(255, cur[2] + n)), 255))
                
    if torch:
        # Wall torch sconce in center (x=14..18)
        # Bronze bracket
        draw.rectangle([15, 16, 17, 24], fill=(70, 50, 25, 255))
        draw.rectangle([14, 18, 18, 19], fill=(130, 95, 45, 255)) # bracket ring
        draw.rectangle([14, 14, 18, 16], fill=(160, 120, 55, 255)) # torch cup
        # Roaring Flame
        draw.polygon([(16, 4), (12, 11), (20, 11)], fill=(255, 100, 20, 255)) # orange outer
        draw.polygon([(16, 6), (13, 12), (19, 12)], fill=(255, 200, 40, 255)) # yellow middle
        draw.polygon([(16, 8), (15, 13), (17, 13)], fill=(255, 255, 210, 255)) # white core
        
    if banner == 'gryffindor':
        # Hanging medieval tapestry banner
        # Hanging pole
        draw.rectangle([6, 3, 25, 4], fill=(180, 150, 60, 255))
        # Banner cloth (pennant)
        draw.rectangle([8, 5, 23, 22], fill=(135, 20, 32, 255))
        # Pointed pennant bottom
        draw.polygon([(8, 22), (23, 22), (16, 28)], fill=(135, 20, 32, 255))
        # Gold lion silhouette / heraldry mark
        draw.rectangle([13, 10, 18, 16], fill=(225, 185, 55, 255))
        draw.line([12, 12, 19, 12], fill=(245, 215, 80, 255))
        
    return img

if __name__ == '__main__':
    preview = Image.new('RGBA', (32 * 6, 32), (0, 0, 0, 0))
    t1 = create_flagstone(1)
    t2 = create_oak_wood(1)
    t3 = create_crimson_carpet('top_left', 1)
    t4 = create_castle_wall(torch=False)
    t5 = create_castle_wall(torch=True)
    t6 = create_castle_wall(banner='gryffindor')
    
    preview.paste(t1, (0, 0))
    preview.paste(t2, (32, 0))
    preview.paste(t3, (64, 0))
    preview.paste(t4, (96, 0))
    preview.paste(t5, (128, 0))
    preview.paste(t6, (160, 0))
    
    preview.save('/Users/khang/skyoffice-base/scripts/test_hogwarts_tiles.png')
    print('Generated test preview: /Users/khang/skyoffice-base/scripts/test_hogwarts_tiles.png')
