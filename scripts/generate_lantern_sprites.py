import os
from PIL import Image, ImageDraw

OUTPUT_DIR = "client/public/assets/items"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def draw_festive_lantern(main_col, light_col, dark_col, flame_col, tassel_col):
    im = Image.new("RGBA", (32, 44), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    GOLD = (255, 215, 60, 255)
    GOLD_DARK = (180, 135, 20, 255)

    # 1. Hanging wire and top hook
    draw.line([(16, 2), (16, 6)], fill=(200, 200, 200, 255), width=1)
    draw.ellipse([14, 5, 18, 9], fill=GOLD_DARK)
    draw.ellipse([15, 6, 17, 8], fill=GOLD)

    # 2. Golden Top Cap (Mũ chụp đèn bằng đồng/vàng)
    draw.rounded_rectangle([10, 8, 22, 12], radius=2, fill=GOLD, outline=GOLD_DARK, width=1)

    # 3. Lantern Body (Bầu đèn lồng tròn hình quả trám / bầu dục)
    # Outer silk body
    draw.ellipse([4, 11, 28, 35], fill=dark_col)
    draw.ellipse([5, 12, 27, 34], fill=main_col)
    draw.ellipse([7, 14, 25, 32], fill=light_col)

    # Glowing Candle / Flame in center (Ngọn nến ma thuật bập bùng)
    draw.ellipse([12, 18, 20, 28], fill=flame_col)
    draw.ellipse([14, 20, 18, 26], fill=(255, 255, 255, 255))

    # Ribs / Bamboo Framework (Gân nan tre đèn lồng)
    draw.line([(16, 11), (16, 35)], fill=GOLD, width=1)
    draw.arc([7, 11, 25, 35], 70, 290, fill=GOLD, width=1)
    draw.arc([7, 11, 25, 35], 250, 470, fill=GOLD, width=1)

    # 4. Golden Bottom Rim (Đáy đèn bằng đồng)
    draw.rounded_rectangle([10, 34, 22, 37], radius=2, fill=GOLD, outline=GOLD_DARK, width=1)

    # 5. Silk Tassel (Tua rua lụa rủ xuống mềm mại)
    draw.ellipse([14, 37, 18, 40], fill=GOLD_DARK)
    draw.polygon([(14, 40), (18, 40), (17, 44), (15, 44)], fill=tassel_col)

    return im

def main():
    lanterns = {
        "lantern_red.png": draw_festive_lantern(
            main_col=(225, 25, 55, 255),
            light_col=(255, 80, 105, 255),
            dark_col=(160, 10, 30, 255),
            flame_col=(255, 230, 120, 255),
            tassel_col=(235, 35, 65, 255),
        ),
        "lantern_gold.png": draw_festive_lantern(
            main_col=(255, 185, 20, 255),
            light_col=(255, 225, 90, 255),
            dark_col=(190, 130, 10, 255),
            flame_col=(255, 255, 180, 255),
            tassel_col=(255, 195, 30, 255),
        ),
        "lantern_green.png": draw_festive_lantern(
            main_col=(16, 165, 95, 255),
            light_col=(52, 211, 135, 255),
            dark_col=(6, 110, 60, 255),
            flame_col=(200, 255, 220, 255),
            tassel_col=(20, 185, 110, 255),
        ),
        "lantern_blue.png": draw_festive_lantern(
            main_col=(37, 99, 235, 255),
            light_col=(96, 165, 250, 255),
            dark_col=(29, 65, 175, 255),
            flame_col=(210, 235, 255, 255),
            tassel_col=(59, 130, 246, 255),
        ),
    }

    for name, img in lanterns.items():
        path = os.path.join(OUTPUT_DIR, name)
        img.save(path)
        print(f"Saved: {path} ({img.size[0]}x{img.size[1]})")

    print("All festive wish lantern sprites generated successfully!")

if __name__ == "__main__":
    main()
