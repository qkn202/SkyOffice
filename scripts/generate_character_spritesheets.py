import numpy as np
from PIL import Image

def build_spritesheets():
    adam_im = Image.open('client/public/assets/character/adam.png')
    w, h = adam_im.size # 1664, 48
    num_frames = w // 32 # 52

    # Scarf recoloring helper across all frames and angles
    def recolor_scarf_full(frame, house):
        px = frame.load()
        for y in range(19, 45):
            for x in range(32):
                r, g, b, a = px[x, y]
                if a > 80:
                    # Check if scarf pixel (scarlet red or warm gold)
                    is_gold = (r > 150 and g > 75 and b < 85 and g > b + 15)
                    is_red = (r > 90 and r > g * 1.25 and r > b * 1.25)
                    
                    if is_gold:
                        if house == 'slytherin':
                            px[x, y] = (220, 230, 235, 255) # silver
                        elif house == 'ravenclaw':
                            px[x, y] = (195, 145, 75, 255)  # bronze
                        elif house == 'hufflepuff':
                            px[x, y] = (255, 205, 45, 255)  # canary gold
                    elif is_red:
                        if house == 'slytherin':
                            # emerald green
                            ratio = min(1.0, max(0.2, (r + g + b) / 300.0))
                            px[x, y] = (int(16 * ratio), int(120 * ratio), int(60 * ratio), 255)
                        elif house == 'ravenclaw':
                            # sapphire blue
                            ratio = min(1.0, max(0.2, (r + g + b) / 300.0))
                            px[x, y] = (int(25 * ratio), int(75 * ratio), int(185 * ratio), 255)
                        elif house == 'hufflepuff':
                            # dark badger charcoal
                            ratio = min(1.0, max(0.2, (r + g + b) / 300.0))
                            px[x, y] = (int(42 * ratio), int(38 * ratio), int(36 * ratio), 255)

    # 1. ASH (Slytherin Boy)
    ash_im = adam_im.copy()
    for f in range(num_frames):
        frame = ash_im.crop((f * 32, 0, (f + 1) * 32, 48))
        px = frame.load()
        recolor_scarf_full(frame, 'slytherin')

        # Recolor hair to platinum/silver blonde
        for y in range(22):
            for x in range(32):
                r, g, b, a = px[x, y]
                if a > 100 and r < 120 and g < 100 and b < 90 and not (r < 10 and g < 10 and b < 10):
                    gray_lum = (r + g + b) // 3
                    if gray_lum < 35:
                        px[x, y] = (155, 168, 182, 255)
                    elif gray_lum < 50:
                        px[x, y] = (205, 215, 225, 255)
                    else:
                        px[x, y] = (242, 246, 250, 255)

        # Front-facing frames: 18..23, 42..47, 48
        if f in list(range(18, 24)) + list(range(42, 48)) + [48]:
            # Cool grey-green eyes
            px[11, 16] = (80, 140, 125, 255)
            px[11, 17] = (50, 100, 90, 255)
            px[12, 16] = (140, 200, 180, 255)
            px[19, 16] = (80, 140, 125, 255)
            px[19, 17] = (50, 100, 90, 255)
            px[20, 16] = (140, 200, 180, 255)
            # Smirk
            px[14, 20] = (255, 210, 175, 255)
            px[15, 20] = (180, 120, 110, 255)
            px[16, 20] = (160, 100, 95, 255)
            px[17, 19] = (170, 110, 100, 255)

        ash_im.paste(frame, (f * 32, 0))

    ash_im.save('client/public/assets/character/ash.png')
    print('ash.png built')

    # 2. LUCY (Ravenclaw Girl)
    lucy_im = adam_im.copy()
    for f in range(num_frames):
        frame = lucy_im.crop((f * 32, 0, (f + 1) * 32, 48))
        px = frame.load()
        recolor_scarf_full(frame, 'ravenclaw')

        # Recolor hair to rich chocolate/chestnut brunette
        for y in range(22):
            for x in range(32):
                r, g, b, a = px[x, y]
                if a > 100 and r < 120 and g < 100 and b < 90 and not (r < 10 and g < 10 and b < 10):
                    gray_lum = (r + g + b) // 3
                    if gray_lum < 35:
                        px[x, y] = (45, 24, 18, 255)
                    elif gray_lum < 50:
                        px[x, y] = (78, 42, 30, 255)
                    else:
                        px[x, y] = (115, 65, 45, 255)

        # Front-facing frames: 18..23, 42..47, 48
        if f in list(range(18, 24)) + list(range(42, 48)) + [48]:
            # Long hair locks falling in front
            for y in range(17, 29):
                # Left lock
                px[6, y] = (35, 18, 14, 255)
                px[7, y] = (78, 42, 30, 255)
                px[8, y] = (115, 65, 45, 255) if y % 3 == 0 else (65, 34, 24, 255)
                # Right lock
                px[23, y] = (115, 65, 45, 255) if y % 3 == 0 else (65, 34, 24, 255)
                px[24, y] = (78, 42, 30, 255)
                px[25, y] = (35, 18, 14, 255)
            # Taper lock tips
            px[7, 29] = px[8, 29] = (35, 18, 14, 255)
            px[23, 29] = px[24, 29] = (35, 18, 14, 255)

            # Eyelashes & sapphire blue eyes
            px[10, 15] = (25, 20, 20, 255)
            px[11, 15] = (30, 25, 25, 255)
            px[10, 16] = (35, 25, 25, 255)
            px[11, 16] = (37, 99, 235, 255)
            px[11, 17] = (29, 78, 216, 255)
            px[12, 16] = (147, 197, 253, 255)
            px[12, 17] = (255, 255, 255, 255)

            px[20, 15] = (30, 25, 25, 255)
            px[21, 15] = (25, 20, 20, 255)
            px[21, 16] = (35, 25, 25, 255)
            px[20, 16] = (37, 99, 235, 255)
            px[20, 17] = (29, 78, 216, 255)
            px[19, 16] = (147, 197, 253, 255)
            px[19, 17] = (255, 255, 255, 255)

            # Rosy cheeks
            px[9, 18] = px[10, 18] = (255, 155, 155, 255)
            px[21, 18] = px[22, 18] = (255, 155, 155, 255)

            # Soft pink lips
            px[15, 20] = (235, 100, 120, 255)
            px[16, 20] = (245, 120, 140, 255)

            # Pleated skirt & legs
            for y in range(35, 39):
                for x in range(11, 21):
                    if y == 38:
                        px[x, y] = (25, 25, 28, 255)
                    elif x % 3 == 0:
                        px[x, y] = (45, 48, 55, 255)
                    else:
                        px[x, y] = (65, 70, 80, 255)
            for y in range(39, 41):
                for x in range(12, 15): px[x, y] = (245, 195, 165, 255)
                for x in range(17, 20): px[x, y] = (245, 195, 165, 255)

        # Back-facing frames: 6..11, 30..35, 51
        elif f in list(range(6, 12)) + list(range(30, 36)) + [51]:
            # Gracefully cascading wavy long hair down the back
            for y in range(14, 28):
                # Width gently narrows from 16px to 12px
                hw = 8 if y < 20 else (7 if y < 24 else 6)
                cx = 16
                for x in range(cx - hw, cx + hw):
                    if x == cx - hw or x == cx + hw - 1 or y == 27:
                        px[x, y] = (35, 18, 14, 255) # outline
                    elif (x + y * 2) % 4 == 0:
                        px[x, y] = (115, 65, 45, 255) # strand highlight
                    elif (x + y) % 2 == 0:
                        px[x, y] = (78, 42, 30, 255) # base
                    else:
                        px[x, y] = (50, 28, 20, 255) # shadow

        # Side-facing frames
        else:
            facing_right = f in list(range(0, 6)) + list(range(24, 30)) + [50]
            # Long hair flowing down back in profile
            back_x_start = 8 if facing_right else 19
            back_x_end = 14 if facing_right else 25
            for y in range(14, 27):
                for x in range(back_x_start, back_x_end):
                    if x == back_x_start or x == back_x_end - 1 or y == 26:
                        px[x, y] = (35, 18, 14, 255)
                    else:
                        px[x, y] = (78, 42, 30, 255)
            # Pleated skirt in profile
            skirt_start = 11 if facing_right else 13
            skirt_end = 19 if facing_right else 21
            for y in range(35, 39):
                for x in range(skirt_start, skirt_end):
                    px[x, y] = (25, 25, 28, 255) if y == 38 else (55, 60, 70, 255)

        lucy_im.paste(frame, (f * 32, 0))

    lucy_im.save('client/public/assets/character/lucy.png')
    print('lucy.png built')

    # 3. NANCY (Hufflepuff Girl)
    nancy_im = adam_im.copy()
    for f in range(num_frames):
        frame = nancy_im.crop((f * 32, 0, (f + 1) * 32, 48))
        px = frame.load()
        recolor_scarf_full(frame, 'hufflepuff')

        # Recolor hair to honey-golden blonde
        for y in range(22):
            for x in range(32):
                r, g, b, a = px[x, y]
                if a > 100 and r < 120 and g < 100 and b < 90 and not (r < 10 and g < 10 and b < 10):
                    gray_lum = (r + g + b) // 3
                    if gray_lum < 35:
                        px[x, y] = (175, 100, 15, 255)
                    elif gray_lum < 50:
                        px[x, y] = (220, 145, 25, 255)
                    else:
                        px[x, y] = (252, 200, 70, 255)

        # Front-facing frames: 18..23, 42..47, 48
        if f in list(range(18, 24)) + list(range(42, 48)) + [48]:
            # Ribbon bows on top of twin-tails
            px[6, 8] = px[7, 8] = px[6, 9] = (255, 220, 20, 255)
            px[24, 8] = px[25, 8] = px[25, 9] = (255, 220, 20, 255)

            # Left ponytail (curved naturally)
            tail_coords_left = [
                (5, 9), (6, 9), (7, 9),
                (4, 10), (5, 10), (6, 10),
                (4, 11), (5, 11), (6, 11),
                (3, 12), (4, 12), (5, 12),
                (3, 13), (4, 13), (5, 13),
                (3, 14), (4, 14), (5, 14),
                (4, 15), (5, 15),
                (4, 16), (5, 16),
                (4, 17), (5, 17),
                (4, 18)
            ]
            for (tx, ty) in tail_coords_left:
                px[tx, ty] = (220, 145, 25, 255)
            # Outline
            for ty in range(10, 19):
                px[3 if ty in [12, 13, 14] else 4, ty] = (120, 70, 10, 255)
            px[4, 18] = (120, 70, 10, 255)

            # Right ponytail
            tail_coords_right = [
                (24, 9), (25, 9), (26, 9),
                (25, 10), (26, 10), (27, 10),
                (25, 11), (26, 11), (27, 11),
                (26, 12), (27, 12), (28, 12),
                (26, 13), (27, 13), (28, 13),
                (26, 14), (27, 14), (28, 14),
                (26, 15), (27, 15),
                (26, 16), (27, 16),
                (26, 17), (27, 17),
                (27, 18)
            ]
            for (tx, ty) in tail_coords_right:
                px[tx, ty] = (220, 145, 25, 255)
            for ty in range(10, 19):
                px[28 if ty in [12, 13, 14] else 27, ty] = (120, 70, 10, 255)
            px[27, 18] = (120, 70, 10, 255)

            # Amber-hazel eyes with eyelashes
            px[10, 15] = (25, 20, 20, 255)
            px[10, 16] = (35, 25, 25, 255)
            px[11, 16] = (180, 120, 20, 255)
            px[11, 17] = (140, 85, 10, 255)
            px[12, 16] = (250, 200, 60, 255)
            px[12, 17] = (255, 255, 255, 255)

            px[21, 15] = (25, 20, 20, 255)
            px[21, 16] = (35, 25, 25, 255)
            px[20, 16] = (180, 120, 20, 255)
            px[20, 17] = (140, 85, 10, 255)
            px[19, 16] = (250, 200, 60, 255)
            px[19, 17] = (255, 255, 255, 255)

            # Peachy blush & freckles
            px[9, 18] = px[10, 18] = (255, 150, 120, 255)
            px[21, 18] = px[22, 18] = (255, 150, 120, 255)
            px[12, 18] = px[19, 18] = px[15, 19] = (180, 110, 75, 255)

            # Cheerful open smile
            px[15, 20] = px[16, 20] = (210, 60, 80, 255)
            px[15, 21] = px[16, 21] = (255, 150, 160, 255)

            # Pleated skirt & legs
            for y in range(35, 39):
                for x in range(11, 21):
                    if y == 38:
                        px[x, y] = (25, 25, 28, 255)
                    elif x % 3 == 0:
                        px[x, y] = (45, 48, 55, 255)
                    else:
                        px[x, y] = (65, 70, 80, 255)
            for y in range(39, 41):
                for x in range(12, 15): px[x, y] = (245, 195, 165, 255)
                for x in range(17, 20): px[x, y] = (245, 195, 165, 255)

        # Back-facing frames
        elif f in list(range(6, 12)) + list(range(30, 36)) + [51]:
            # Ribbon bows and twin-tails visible in back
            px[6, 8] = px[7, 8] = (255, 220, 20, 255)
            px[24, 8] = px[25, 8] = (255, 220, 20, 255)
            for y in range(9, 18):
                px[4, y] = (120, 70, 10, 255)
                px[5, y] = (220, 145, 25, 255)
                px[26, y] = (220, 145, 25, 255)
                px[27, y] = (120, 70, 10, 255)

        # Side-facing frames
        else:
            facing_right = f in list(range(0, 6)) + list(range(24, 30)) + [50]
            tail_x = 8 if facing_right else 23
            px[tail_x, 9] = (255, 220, 20, 255)
            for y in range(10, 19):
                px[tail_x, y] = (220, 145, 25, 255)
                px[tail_x + (-1 if facing_right else 1), y] = (120, 70, 10, 255)
            # Pleated skirt in profile
            skirt_start = 11 if facing_right else 13
            skirt_end = 19 if facing_right else 21
            for y in range(35, 39):
                for x in range(skirt_start, skirt_end):
                    px[x, y] = (25, 25, 28, 255) if y == 38 else (55, 60, 70, 255)

        nancy_im.paste(frame, (f * 32, 0))

    nancy_im.save('client/public/assets/character/nancy.png')
    print('nancy.png built')

if __name__ == '__main__':
    build_spritesheets()
