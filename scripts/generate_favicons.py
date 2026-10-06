"""Generate favicon and social preview assets from headshot."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
ASSETS = DOCS / "assets"
HEADSHOT = ASSETS / "afolabi-headshot.jpg"


def crop_face_square(img: Image.Image) -> Image.Image:
    """Headshot is already square; use center crop for consistency."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def save_favicons(square: Image.Image) -> None:
    sizes = [(16, ASSETS / "favicon-16x16.png"), (32, ASSETS / "favicon-32x32.png")]
    for size, path in sizes:
        resized = square.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(path, format="PNG", optimize=True)

    apple = square.resize((180, 180), Image.Resampling.LANCZOS)
    apple.save(ASSETS / "apple-touch-icon.png", format="PNG", optimize=True)

    ico_sizes = [16, 32]
    ico_images = [square.resize((s, s), Image.Resampling.LANCZOS) for s in ico_sizes]
    ico_images[0].save(
        DOCS / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[1:],
    )


def save_og_image(square: Image.Image) -> None:
    """1200x630 social preview: photo left, name + shortened headline."""
    og_w, og_h = 1200, 630
    bg_color = (26, 43, 60)
    accent = (217, 119, 6)

    canvas = Image.new("RGB", (og_w, og_h), bg_color)
    draw = ImageDraw.Draw(canvas)

    photo_size = 470
    photo = square.resize((photo_size, photo_size), Image.Resampling.LANCZOS)
    photo_x = 48
    photo_y = (og_h - photo_size) // 2
    canvas.paste(photo, (photo_x, photo_y))

    text_x = photo_x + photo_size + 48
    font_dir = "/usr/share/fonts/truetype/dejavu/"
    try:
        title_font = ImageFont.truetype(font_dir + "DejaVuSans-Bold.ttf", 48)
        sub_font = ImageFont.truetype(font_dir + "DejaVuSans.ttf", 26)
    except OSError:
        try:
            title_font = ImageFont.truetype("arial.ttf", 48)
            sub_font = ImageFont.truetype("arial.ttf", 26)
        except OSError:
            title_font = ImageFont.load_default()
            sub_font = ImageFont.load_default()

    lines = [
        "Business & Data Analyst",
        "SAP MDM · S/4HANA Migration",
        "Applied AI/ML · ERP · BI",
        "Supply Chain · MSc Statistics",
    ]
    draw.text((text_x, photo_y + 36), "Afolabi Adesina", fill=(248, 250, 252), font=title_font)
    draw.rectangle([(text_x, photo_y + 108), (text_x + 96, photo_y + 112)], fill=accent)
    y = photo_y + 136
    for line in lines:
        draw.text((text_x, y), line, fill=(226, 232, 240), font=sub_font)
        y += 40

    canvas.save(ASSETS / "og-image.jpg", format="JPEG", quality=88, optimize=True)


def main() -> None:
    img = Image.open(HEADSHOT).convert("RGB")
    square = crop_face_square(img)
    save_favicons(square)
    save_og_image(square)
    print("Generated favicons and og-image.jpg")


if __name__ == "__main__":
    main()
