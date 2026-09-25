import os
import math
from PIL import Image, ImageDraw

OUTPUT_DIR = "client/public/assets/npc/lion"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Palette
RED_DARK = (168, 0, 24, 255)
RED = (225, 18, 48, 255)
RED_LIGHT = (255, 60, 85, 255)

GOLD_DARK = (180, 115, 0, 255)
GOLD = (255, 185, 0, 255)
GOLD_LIGHT = (255, 225, 75, 255)

WHITE = (255, 255, 255, 255)
WHITE_SHADOW = (215, 225, 235, 255)
WHITE_DARK = (175, 185, 198, 255)

GREEN_GEM = (16, 185, 129, 255)
GREEN_DARK = (5, 120, 80, 255)

BLACK = (20, 20, 24, 255)
MOUTH_DARK = (70, 5, 15, 255)
TONGUE = (255, 105, 135, 255)
TRANS = (0, 0, 0, 0)

# ==============================================================================
# 1. FRONT HEAD (48x48)
# ==============================================================================
def draw_head_front():
    im = Image.new("RGBA", (48, 48), TRANS)
    draw = ImageDraw.Draw(im)

    # 1.1 Ears (Top corners)
    # Left Ear
    draw.polygon([(8, 14), (2, 4), (14, 8)], fill=WHITE_SHADOW)
    draw.polygon([(7, 13), (4, 6), (12, 9)], fill=RED)
    draw.polygon([(7, 12), (5, 7), (10, 9)], fill=RED_LIGHT)
    # Right Ear
    draw.polygon([(39, 14), (45, 4), (33, 8)], fill=WHITE_SHADOW)
    draw.polygon([(40, 13), (43, 6), (35, 9)], fill=RED)
    draw.polygon([(40, 12), (42, 7), (37, 9)], fill=RED_LIGHT)

    # Ear fur tufts
    draw.ellipse([0, 10, 10, 18], fill=WHITE)
    draw.ellipse([37, 10, 47, 18], fill=WHITE)

    # 1.2 Main Forehead / Crown Base
    draw.ellipse([10, 8, 37, 30], fill=RED)
    draw.ellipse([12, 10, 35, 28], fill=RED_LIGHT)

    # Golden crest on forehead
    draw.polygon([(23, 8), (17, 17), (30, 17)], fill=GOLD)
    draw.polygon([(23, 10), (19, 16), (28, 16)], fill=GOLD_LIGHT)
    draw.rectangle([21, 14, 26, 19], fill=GOLD_DARK)

    # Forehead Mirror / Gem (Cầu ngọc / gương bát quái)
    draw.ellipse([21, 13, 26, 18], fill=GREEN_DARK)
    draw.ellipse([22, 14, 25, 17], fill=GREEN_GEM)
    draw.point((23, 14), fill=WHITE)

    # Horn (Sừng Lân - pointing up)
    draw.polygon([(23, 1), (20, 9), (27, 9)], fill=GOLD_DARK)
    draw.polygon([(23, 2), (21, 8), (26, 8)], fill=GOLD)
    draw.polygon([(23, 3), (22, 7), (25, 7)], fill=GOLD_LIGHT)
    # Horn tip ruby
    draw.ellipse([22, 0, 25, 3], fill=RED_LIGHT)

    # 1.3 Eyebrows (Bushy fiery brows)
    # Left brow
    draw.arc([10, 15, 22, 23], 180, 360, fill=BLACK, width=2)
    draw.polygon([(9, 19), (13, 15), (22, 18), (17, 21)], fill=GOLD)
    draw.polygon([(8, 18), (12, 14), (18, 16)], fill=GOLD_LIGHT)
    draw.polygon([(7, 19), (11, 16), (15, 19)], fill=WHITE)

    # Right brow
    draw.arc([25, 15, 37, 23], 180, 360, fill=BLACK, width=2)
    draw.polygon([(38, 19), (34, 15), (25, 18), (30, 21)], fill=GOLD)
    draw.polygon([(39, 18), (35, 14), (29, 16)], fill=GOLD_LIGHT)
    draw.polygon([(40, 19), (36, 16), (32, 19)], fill=WHITE)

    # 1.4 Big Expressive Eyes
    # Eye sockets / rings
    draw.ellipse([11, 19, 23, 30], fill=BLACK)
    draw.ellipse([24, 19, 36, 30], fill=BLACK)
    # Golden Iris
    draw.ellipse([12, 20, 22, 29], fill=GOLD)
    draw.ellipse([25, 20, 35, 29], fill=GOLD)
    # Pupil
    draw.ellipse([14, 21, 20, 28], fill=BLACK)
    draw.ellipse([27, 21, 33, 28], fill=BLACK)
    # Sparkle highlights
    draw.ellipse([15, 22, 18, 25], fill=WHITE)
    draw.ellipse([28, 22, 31, 25], fill=WHITE)
    draw.point((19, 26), fill=WHITE)
    draw.point((32, 26), fill=WHITE)

    # 1.5 Nose / Snout
    draw.ellipse([20, 25, 27, 30], fill=GOLD)
    draw.ellipse([21, 26, 26, 29], fill=RED)
    draw.ellipse([22, 27, 25, 28], fill=RED_LIGHT)

    # 1.6 Fluffy Cheeks
    draw.ellipse([4, 23, 14, 33], fill=WHITE)
    draw.ellipse([5, 24, 13, 32], fill=WHITE_SHADOW)
    draw.ellipse([33, 23, 43, 33], fill=WHITE)
    draw.ellipse([34, 24, 42, 32], fill=WHITE_SHADOW)
    # Rouge on cheeks
    draw.ellipse([7, 26, 11, 30], fill=(255, 120, 150, 180))
    draw.ellipse([36, 26, 40, 30], fill=(255, 120, 150, 180))

    # 1.7 Mouth / Jaw (Wide festive grin)
    draw.chord([12, 29, 35, 41], 0, 180, fill=MOUTH_DARK)
    # Red tongue inside
    draw.chord([18, 33, 29, 41], 0, 180, fill=TONGUE)
    # White cute fangs
    draw.polygon([(14, 30), (17, 30), (15, 34)], fill=WHITE) # Left upper fang
    draw.polygon([(30, 30), (33, 30), (32, 34)], fill=WHITE) # Right upper fang
    draw.polygon([(19, 39), (21, 39), (20, 36)], fill=WHITE) # Lower tooth
    draw.polygon([(26, 39), (28, 39), (27, 36)], fill=WHITE) # Lower tooth

    # Golden lower jaw lip
    draw.arc([12, 29, 35, 41], 0, 180, fill=GOLD, width=2)

    # 1.8 Magnificent White Beard (Râu Lân)
    # Flowing fluffy beard under chin
    draw.polygon([(17, 39), (30, 39), (27, 47), (23, 48), (20, 47)], fill=WHITE_SHADOW)
    draw.polygon([(18, 39), (29, 39), (26, 46), (23, 47), (21, 46)], fill=WHITE)
    # Extra side beard tufts
    draw.ellipse([11, 35, 19, 43], fill=WHITE)
    draw.ellipse([28, 35, 36, 43], fill=WHITE)

    return im

# ==============================================================================
# 2. SIDE HEAD (48x48) - Facing Right
# ==============================================================================
def draw_head_side():
    im = Image.new("RGBA", (48, 48), TRANS)
    draw = ImageDraw.Draw(im)

    # Ear (Tilted back)
    draw.polygon([(12, 14), (5, 6), (18, 8)], fill=WHITE_SHADOW)
    draw.polygon([(11, 13), (7, 8), (16, 9)], fill=RED)
    draw.ellipse([6, 12, 14, 18], fill=WHITE)

    # Head Dome
    draw.ellipse([10, 8, 36, 30], fill=RED)
    draw.ellipse([12, 10, 34, 28], fill=RED_LIGHT)

    # Horn (curving forward & up)
    draw.polygon([(25, 2), (20, 9), (28, 8)], fill=GOLD_DARK)
    draw.polygon([(26, 3), (22, 8), (27, 7)], fill=GOLD)
    draw.ellipse([25, 1, 28, 4], fill=RED_LIGHT)

    # Crest / Mirror
    draw.ellipse([28, 12, 33, 17], fill=GOLD)
    draw.ellipse([29, 13, 32, 16], fill=GREEN_GEM)

    # Eyebrow (Swept forward)
    draw.polygon([(26, 18), (38, 15), (32, 21)], fill=GOLD)
    draw.polygon([(27, 17), (37, 14), (33, 19)], fill=GOLD_LIGHT)
    draw.polygon([(25, 19), (30, 16), (28, 20)], fill=WHITE)

    # Big Eye (Side profile)
    draw.ellipse([25, 19, 37, 30], fill=BLACK)
    draw.ellipse([27, 20, 36, 29], fill=GOLD)
    draw.ellipse([29, 21, 35, 28], fill=BLACK)
    draw.ellipse([30, 22, 33, 25], fill=WHITE)

    # Snout / Nose (Projecting to the right)
    draw.ellipse([34, 23, 44, 30], fill=RED)
    draw.ellipse([36, 24, 43, 29], fill=GOLD)
    draw.ellipse([39, 25, 43, 28], fill=RED_LIGHT)

    # Fluffy Cheek
    draw.ellipse([18, 24, 28, 34], fill=WHITE)
    draw.ellipse([20, 27, 25, 31], fill=(255, 120, 150, 180))

    # Open Mouth / Jaws
    draw.polygon([(30, 30), (44, 30), (41, 38), (30, 37)], fill=MOUTH_DARK)
    # Tongue
    draw.chord([32, 33, 42, 39], 0, 180, fill=TONGUE)
    # Fangs
    draw.polygon([(36, 30), (39, 30), (37, 34)], fill=WHITE)
    draw.polygon([(40, 37), (43, 37), (41, 34)], fill=WHITE)

    # Lower Jaw (Gold trim)
    draw.line([(30, 37), (42, 38)], fill=GOLD, width=2)

    # Flowing Beard (Blowing slightly back)
    draw.polygon([(26, 37), (39, 38), (34, 47), (25, 46)], fill=WHITE_SHADOW)
    draw.polygon([(27, 37), (38, 38), (33, 46), (26, 45)], fill=WHITE)
    draw.ellipse([18, 35, 27, 43], fill=WHITE)

    # Mane fur trailing behind neck
    draw.ellipse([6, 19, 16, 32], fill=WHITE)
    draw.ellipse([8, 25, 17, 38], fill=WHITE_SHADOW)

    return im

# ==============================================================================
# 3. BACK HEAD (48x48) - Facing Up
# ==============================================================================
def draw_head_back():
    im = Image.new("RGBA", (48, 48), TRANS)
    draw = ImageDraw.Draw(im)

    # Back of ears
    draw.polygon([(8, 14), (2, 4), (14, 8)], fill=RED_DARK)
    draw.polygon([(7, 13), (4, 6), (12, 9)], fill=RED)
    draw.polygon([(39, 14), (45, 4), (33, 8)], fill=RED_DARK)
    draw.polygon([(40, 13), (43, 6), (35, 9)], fill=RED)

    # Back dome
    draw.ellipse([10, 8, 37, 32], fill=RED_DARK)
    draw.ellipse([12, 10, 35, 30], fill=RED)

    # Golden horn tip visible in front
    draw.polygon([(23, 1), (21, 6), (26, 6)], fill=GOLD)
    draw.ellipse([22, 0, 25, 3], fill=RED_LIGHT)

    # Golden Crown & Brocade Ribbon on back of head
    draw.ellipse([18, 14, 29, 25], fill=GOLD_DARK)
    draw.ellipse([19, 15, 28, 24], fill=GOLD)
    draw.ellipse([21, 17, 26, 22], fill=RED)

    # Flowing mane ruffles (cascade of white & gold fur)
    for y in range(24, 44, 5):
        w_offset = (y - 24) * 0.8
        draw.ellipse([12 - w_offset, y, 35 + w_offset, y + 8], fill=WHITE_SHADOW)
        draw.ellipse([13 - w_offset, y, 34 + w_offset, y + 7], fill=WHITE)

    return im

# ==============================================================================
# 4. BODY MID SEGMENT (42x36)
# ==============================================================================
def draw_body_mid():
    im = Image.new("RGBA", (42, 36), TRANS)
    draw = ImageDraw.Draw(im)

    # Main arched blanket body
    draw.ellipse([2, 2, 39, 30], fill=RED)
    draw.ellipse([4, 4, 37, 28], fill=RED_LIGHT)

    # Dragon Scales (Vảy kim sa rồng)
    # Row 1
    for x in range(8, 33, 7):
        draw.arc([x, 5, x + 7, 12], 0, 180, fill=GOLD, width=2)
        draw.point((x + 3, 9), fill=GOLD_LIGHT)
    # Row 2
    for x in range(5, 36, 7):
        draw.arc([x, 11, x + 7, 18], 0, 180, fill=GOLD, width=2)
        draw.point((x + 3, 15), fill=GOLD_LIGHT)
    # Row 3
    for x in range(8, 33, 7):
        draw.arc([x, 17, x + 7, 24], 0, 180, fill=GOLD, width=2)
        draw.point((x + 3, 21), fill=GOLD_LIGHT)

    # Golden border stripe
    draw.arc([3, 18, 38, 30], 0, 180, fill=GOLD, width=2)

    # Fluffy white fur trim along the bottom
    for x in range(3, 39, 6):
        draw.ellipse([x - 2, 25, x + 6, 34], fill=WHITE_SHADOW)
        draw.ellipse([x - 1, 25, x + 5, 33], fill=WHITE)

    return im

# ==============================================================================
# 5. BODY REAR SEGMENT (38x34)
# ==============================================================================
def draw_body_rear():
    im = Image.new("RGBA", (38, 34), TRANS)
    draw = ImageDraw.Draw(im)

    # Slightly higher arch (back dancer)
    draw.ellipse([2, 1, 35, 28], fill=RED)
    draw.ellipse([4, 3, 33, 26], fill=RED_LIGHT)

    # Dragon Scales
    for x in range(7, 29, 7):
        draw.arc([x, 4, x + 7, 11], 0, 180, fill=GOLD, width=2)
        draw.point((x + 3, 8), fill=GOLD_LIGHT)
    for x in range(4, 32, 7):
        draw.arc([x, 10, x + 7, 17], 0, 180, fill=GOLD, width=2)
        draw.point((x + 3, 14), fill=GOLD_LIGHT)
    for x in range(7, 29, 7):
        draw.arc([x, 16, x + 7, 23], 0, 180, fill=GOLD, width=2)

    # Fur trim
    for x in range(3, 35, 6):
        draw.ellipse([x - 2, 23, x + 6, 32], fill=WHITE_SHADOW)
        draw.ellipse([x - 1, 23, x + 5, 31], fill=WHITE)

    return im

# ==============================================================================
# 6. TAIL (30x30)
# ==============================================================================
def draw_tail():
    im = Image.new("RGBA", (30, 30), TRANS)
    draw = ImageDraw.Draw(im)

    # Golden Bell & Ribbon at base of tail
    draw.polygon([(4, 12), (10, 8), (10, 16)], fill=RED)
    draw.ellipse([8, 10, 15, 17], fill=GOLD_DARK)
    draw.ellipse([9, 11, 14, 16], fill=GOLD)
    draw.point((11, 12), fill=GOLD_LIGHT)

    # Fluffy Pom-pom Tail
    draw.ellipse([12, 4, 28, 22], fill=RED)
    draw.ellipse([14, 6, 26, 20], fill=RED_LIGHT)

    # White Fur Tufts erupting from tail
    draw.ellipse([16, 2, 24, 10], fill=WHITE)
    draw.ellipse([20, 6, 28, 14], fill=WHITE)
    draw.ellipse([19, 13, 27, 21], fill=WHITE)
    draw.ellipse([13, 14, 21, 22], fill=WHITE)
    draw.ellipse([15, 8, 23, 16], fill=WHITE_SHADOW)

    return im

# ==============================================================================
# 7. LION PAW / DANCER FOOT (20x16)
# ==============================================================================
def draw_paw():
    im = Image.new("RGBA", (20, 16), TRANS)
    draw = ImageDraw.Draw(im)

    # Red/Gold pant leg
    draw.rectangle([4, 0, 15, 6], fill=GOLD)
    draw.rectangle([5, 0, 14, 5], fill=GOLD_LIGHT)

    # White fur ankle cuff
    draw.ellipse([2, 4, 17, 10], fill=WHITE_SHADOW)
    draw.ellipse([3, 4, 16, 9], fill=WHITE)

    # Golden lion paw / shoe with 3 claw pads
    draw.ellipse([3, 8, 16, 15], fill=RED)
    draw.ellipse([4, 9, 15, 14], fill=GOLD)
    # Claws
    draw.ellipse([4, 11, 7, 15], fill=WHITE)
    draw.ellipse([8, 11, 11, 15], fill=WHITE)
    draw.ellipse([12, 11, 15, 15], fill=WHITE)

    return im

# ==============================================================================
# 8. ÔNG ĐỊA (Laughing Earth God with Palm Fan) (32x48)
# ==============================================================================
def draw_ong_dia():
    im = Image.new("RGBA", (32, 48), TRANS)
    draw = ImageDraw.Draw(im)

    SKIN = (255, 214, 175, 255)
    SKIN_SHADOW = (235, 180, 140, 255)
    ROBE_BLUE = (37, 99, 235, 255)
    ROBE_DARK = (29, 78, 216, 255)
    FAN_BROWN = (217, 119, 6, 255)
    FAN_LIGHT = (251, 191, 36, 255)

    # Feet
    draw.ellipse([7, 43, 13, 47], fill=BLACK)
    draw.ellipse([18, 43, 24, 47], fill=BLACK)

    # Pants
    draw.rectangle([6, 38, 14, 44], fill=BLACK)
    draw.rectangle([17, 38, 25, 44], fill=BLACK)

    # Robe over round belly
    draw.ellipse([4, 22, 27, 40], fill=ROBE_DARK)
    draw.ellipse([5, 23, 26, 39], fill=ROBE_BLUE)

    # Big bare round belly showing through open robe!
    draw.ellipse([9, 25, 22, 37], fill=SKIN_SHADOW)
    draw.ellipse([10, 26, 21, 36], fill=SKIN)
    # Belly button
    draw.point((15, 32), fill=SKIN_SHADOW)

    # Golden belt sash
    draw.rectangle([7, 36, 24, 38], fill=GOLD)

    # Big smiling bald head
    draw.ellipse([7, 7, 24, 23], fill=SKIN_SHADOW)
    draw.ellipse([8, 8, 23, 22], fill=SKIN)

    # Topknot hair / headband
    draw.ellipse([13, 5, 18, 9], fill=BLACK)
    draw.rectangle([8, 10, 23, 12], fill=RED)

    # Smiling crescent eyes (cười tít mắt)
    draw.arc([10, 11, 14, 15], 180, 360, fill=BLACK, width=2)
    draw.arc([17, 11, 21, 15], 180, 360, fill=BLACK, width=2)

    # Big rosy cheeks
    draw.ellipse([8, 15, 12, 19], fill=(255, 100, 120, 200))
    draw.ellipse([19, 15, 23, 19], fill=(255, 100, 120, 200))

    # Huge wide smiling mouth
    draw.chord([12, 15, 19, 21], 0, 180, fill=MOUTH_DARK)
    draw.point((15, 19), fill=TONGUE)

    # Palm Leaf Fan (Quạt mo) in right hand
    # Arm
    draw.line([(24, 25), (28, 28)], fill=SKIN, width=3)
    # Fan shape
    draw.polygon([(26, 26), (24, 16), (31, 17), (31, 25)], fill=FAN_BROWN)
    draw.polygon([(27, 25), (25, 18), (30, 18), (30, 24)], fill=FAN_LIGHT)
    # Fan handle
    draw.line([(26, 26), (28, 32)], fill=(120, 53, 15, 255), width=2)

    return im

def main():
    assets = {
        "lion_head_front.png": draw_head_front(),
        "lion_head_side.png": draw_head_side(),
        "lion_head_back.png": draw_head_back(),
        "lion_body_mid.png": draw_body_mid(),
        "lion_body_rear.png": draw_body_rear(),
        "lion_tail.png": draw_tail(),
        "lion_paw.png": draw_paw(),
        "ong_dia.png": draw_ong_dia(),
    }

    for name, img in assets.items():
        path = os.path.join(OUTPUT_DIR, name)
        img.save(path)
        print(f"Saved: {path} ({img.size[0]}x{img.size[1]})")

    print("All Lion Dance assets generated successfully!")

if __name__ == "__main__":
    main()
