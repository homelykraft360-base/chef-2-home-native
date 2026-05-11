#!/usr/bin/env python3
"""
Generate Android Play Store feature graphic (1024 x 500).

Uses:
  - assets/chef2home_logo.png (wordmark on white; fitted to a square tile)
  - ../chef-2-home/public/img/landing/home.jpg

Run from chef-2-home-native (with Pillow installed):
  python3 scripts/generate-play-feature-graphic.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "play-store-feature-graphic-1024x500.png"
HERO = ROOT.parent / "chef-2-home" / "public" / "img" / "landing" / "home.jpg"
LOGO = ROOT / "assets" / "chef2home_logo.png"

W, H = 1024, 500

# macOS system font (fallback: default bitmap font)
FONT_CANDIDATES = [
    Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
    Path("/Library/Fonts/Arial.ttf"),
]


def cover_crop(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    bw, bh = img.size
    scale = max(target_w / bw, target_h / bh)
    nw, nh = int(bw * scale), int(bh * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - target_w) // 2
    top = (nh - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def left_gradient_overlay(size: tuple[int, int], width: int, max_alpha: int) -> Image.Image:
    w, h = size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for x in range(min(width, w)):
        t = x / max(width - 1, 1)
        # warm brown tint, softer falloff — keeps kitchen bright & inviting
        a = int(max_alpha * (1.0 - t * 0.55))
        draw.line([(x, 0), (x, h)], fill=(62, 42, 32, a))
    return overlay


def inviting_photo(img: Image.Image) -> Image.Image:
    """Slightly brighter, warmer, softer — hero feels more welcoming."""
    out = ImageEnhance.Brightness(img).enhance(1.08)
    out = ImageEnhance.Color(out).enhance(1.07)
    out = ImageEnhance.Contrast(out).enhance(0.96)
    return out


def logo_on_white_square(logo: Image.Image, side: int, *, inner_pad: float = 0.08) -> Image.Image:
    """Fit wide logo inside a white square (letterbox) for consistent framing."""
    logo = logo.convert("RGBA")
    lw, lh = logo.size
    inner = max(1, int(side * (1.0 - 2 * inner_pad)))
    scale = min(inner / lw, inner / lh)
    nw, nh = max(1, int(lw * scale)), max(1, int(lh * scale))
    fitted = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    tile = Image.new("RGBA", (side, side), (255, 255, 255, 255))
    ox = (side - nw) // 2
    oy = (side - nh) // 2
    tile.alpha_composite(fitted, (ox, oy))
    return tile


def round_icon_rgba(icon: Image.Image, radius: int) -> Image.Image:
    """Apply rounded-rectangle alpha mask (slightly rounded corners)."""
    icon = icon.convert("RGBA")
    w, h = icon.size
    mask = Image.new("L", (w, h), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(icon, (0, 0), mask)
    return out


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for p in FONT_CANDIDATES:
        if p.is_file():
            try:
                return ImageFont.truetype(str(p), size)
            except OSError:
                continue
    return ImageFont.load_default()


def main() -> int:
    if not HERO.is_file():
        print(f"Missing hero image: {HERO}", file=sys.stderr)
        return 1
    if not LOGO.is_file():
        print(f"Missing logo: {LOGO}", file=sys.stderr)
        return 1

    hero = Image.open(HERO).convert("RGB")
    base = cover_crop(hero, W, H)
    base = inviting_photo(base)

    # Warm left gradient so logo + text read without darkening the whole scene
    grad = left_gradient_overlay((W, H), width=620, max_alpha=128)
    base_rgba = base.convert("RGBA")
    base_rgba = Image.alpha_composite(base_rgba, grad)
    canvas = base_rgba.convert("RGBA")

    raw_logo = Image.open(LOGO)
    icon_side = 300
    icon = logo_on_white_square(raw_logo, icon_side, inner_pad=0.1)
    corner_radius = max(18, int(icon_side * 0.11))
    icon = round_icon_rgba(icon, corner_radius)

    # Soft drop shadow behind icon (same corner radius as logo)
    pad = 24
    shadow_size = (icon_side + pad * 2, icon_side + pad * 2)
    shadow = Image.new("RGBA", shadow_size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle(
        [pad, pad, pad + icon_side, pad + icon_side],
        radius=corner_radius,
        fill=(0, 0, 0, 95),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=12))

    ix = 56
    iy = (H - icon_side) // 2
    canvas.alpha_composite(shadow, (ix - pad, iy - pad))
    canvas.alpha_composite(icon, (ix, iy))

    # Title + subtitle on the right of the icon
    draw = ImageDraw.Draw(canvas)
    title_font = load_font(52)
    sub_font = load_font(22)

    text_x = ix + icon_side + 36
    title = "Chef2Home"
    subtitle = "Personal chefs. At home."

    # subtle text shadow for readability
    for dx, dy in ((2, 2), (1, 1)):
        draw.text(
            (text_x + dx, 168 + dy),
            title,
            font=title_font,
            fill=(0, 0, 0, 160),
        )
    draw.text((text_x, 168), title, font=title_font, fill=(255, 255, 255, 255))

    for dx, dy in ((2, 2), (1, 1)):
        draw.text(
            (text_x + dx, 236 + dy),
            subtitle,
            font=sub_font,
            fill=(0, 0, 0, 140),
        )
    draw.text((text_x, 236), subtitle, font=sub_font, fill=(255, 248, 240, 255))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUT, format="PNG", optimize=True)
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
