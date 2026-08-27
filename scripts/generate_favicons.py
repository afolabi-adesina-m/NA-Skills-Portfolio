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
    """1200x630 social preview: photo left, name + tagline right."""
    og_w, og_h = 1200, 630
    bg_color = (15, 23, 42)  # slate-900
    accent = (59, 130, 246)  # blue-500

    canvas = Image.new("RGB", (og_w, og_h), bg_color)
    draw = ImageDraw.Draw(canvas)

    photo_size = og_h - 80
    photo = square.resize((photo_size, photo_size), Image.Resampling.LANCZOS)
    photo_x = 60
    photo_y = (og_h - photo_size) // 2
    canvas.paste(photo, (photo_x, photo_y))

    text_x = photo_x + photo_size + 50
    try:
        title_font = ImageFont.truetype("arial.ttf", 52)
        sub_font = ImageFont.truetype("arial.ttf", 28)
    except OSError:
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()

    draw.text((text_x, photo_y + 40), "Afolabi Adesina", fill=(248, 250, 252), font=title_font)
    draw.text(
        (text_x, photo_y + 120),
        "Applied analytics for operations,",
        fill=(148, 163, 184),
        font=sub_font,
    )
    draw.text((text_x, photo_y + 160), "systems, and decisions.", fill=(148, 163, 184), font=sub_font)

    draw.rectangle([(text_x, photo_y + 220), (text_x + 120, photo_y + 224)], fill=accent)
    draw.text(
        (text_x, photo_y + 240),
        "Portfolio Hub",
        fill=accent,
        font=sub_font,
    )

    canvas.save(ASSETS / "og-image.jpg", format="JPEG", quality=88, optimize=True)


def main() -> None:
    img = Image.open(HEADSHOT).convert("RGB")
    square = crop_face_square(img)
    save_favicons(square)
    save_og_image(square)
    print("Generated favicons and og-image.jpg")


if __name__ == "__main__":
    main()
