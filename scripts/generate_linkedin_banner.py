"""Generate a LinkedIn banner (1584 x 396) from the Attention theme."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "assets" / "linkedin-banner-attention.png"

W, H = 1584, 396
BG_TOP = (12, 72, 90)
BG_BOTTOM = (22, 108, 128)
ACCENT = (120, 210, 225)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def vertical_gradient(width: int, height: int) -> Image.Image:
    img = Image.new("RGB", (width, height), BG_TOP)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / max(height - 1, 1)
        color = tuple(int(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * t) for i in range(3))
        draw.line([(0, y), (width, y)], fill=color)
    return img


def add_grain(img: Image.Image, strength: int = 8) -> Image.Image:
    pixels = img.load()
    random.seed(42)
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            r, g, b = pixels[x, y]
            delta = random.randint(-strength, strength)
            pixels[x, y] = tuple(max(0, min(255, c + delta)) for c in (r, g, b))
    return img


def draw_attention_mesh(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int) -> None:
    nodes = []
    for i in range(8):
        angle = (math.tau / 8) * i - math.pi / 2
        x = cx + int(math.cos(angle) * radius)
        y = cy + int(math.sin(angle) * radius)
        nodes.append((x, y))

    for i, a in enumerate(nodes):
        for b in nodes[i + 1 :]:
            draw.line([a, b], fill=(90, 170, 185), width=1)
    for x, y in nodes:
        draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(150, 210, 220))


def draw_text_with_shadow(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    shadow: tuple[int, int, int] = (0, 0, 0),
) -> None:
    x, y = xy
    draw.text((x + 2, y + 2), text, font=font, fill=shadow)
    draw.text((x, y), text, font=font, fill=fill)


def build_banner() -> Image.Image:
    img = vertical_gradient(W, H)
    draw = ImageDraw.Draw(img)

    # Darken left safe zone for profile photo overlap
    for x in range(0, 430):
        alpha = 0.22 * (1 - x / 430)
        shade = int(255 * alpha)
        draw.line([(x, 0), (x, H)], fill=(max(0, BG_TOP[0] - shade), max(0, BG_TOP[1] - shade), max(0, BG_TOP[2] - shade)))

    draw_attention_mesh(draw, 1210, 165, 92)
    draw_attention_mesh(draw, 1310, 245, 68)

    text_x = 455
    text_y = 122

    title_font = load_font(50, bold=True)
    sub_font = load_font(19, bold=False)
    meta_font = load_font(15, bold=False)

    draw.line([(text_x, text_y - 24), (text_x + 210, text_y - 24)], fill=ACCENT, width=2)

    draw_text_with_shadow(draw, (text_x, text_y), "ATTENTION IS ALL YOU NEED", title_font, (255, 255, 255))
    draw_text_with_shadow(draw, (text_x, text_y + 68), "— Vaswani · Shazeer · Parmar", sub_font, (225, 238, 243))
    draw_text_with_shadow(draw, (text_x, text_y + 104), "Transformer architecture · applied AI", meta_font, (156, 198, 208))

    return add_grain(img)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    banner = build_banner()
    banner.save(OUT, format="PNG", optimize=True)
    print(f"Saved {OUT} ({banner.size[0]}x{banner.size[1]})")


if __name__ == "__main__":
    main()
