#!/usr/bin/env python3
"""Build launcher, splash, and Android adaptive icons from the Chef2Home logo.

Outputs: app-icon.png, splash-icon.png, app-icon-adaptive-foreground.png,
app-icon-adaptive-background.png, favicon.png

Logo is scaled to fit inside the Material adaptive-icon safe circle so wide
wordmarks are not clipped by OEM masks.

Requires: pip install Pillow
Example:
  python3 scripts/generate_app_icons.py \\
    --logo ./assets/chef2home_logo.png \\
    --out-dir ./assets
"""
from __future__ import annotations

import argparse
import math
import os
from pathlib import Path

from PIL import Image

# Default matches android.adaptiveIcon.backgroundColor in app.json
ORANGE_HEX = "#FF6B35"

CANVAS = 1024
_SAFE_NUM = int(os.environ.get("SAFE_NUMERATOR", "58"))
_SAFE_DEN = int(os.environ.get("SAFE_DENOMINATOR", "108"))
SAFE_RATIO = _SAFE_NUM / _SAFE_DEN


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def _fit_scale(width: int, height: int, safe_radius: float) -> float:
    """Scale so the logo diagonal fits inside the adaptive-icon safe circle."""
    half_diag = math.hypot(width, height) / 2
    if half_diag <= 0:
        return 1.0
    return safe_radius / half_diag


def prepare_logo(logo_path: Path) -> Image.Image:
    im = Image.open(logo_path).convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    return im


def scale_and_position(logo: Image.Image, canvas: int = CANVAS) -> tuple[Image.Image, int, int, int, int, float]:
    safe_radius = (canvas * SAFE_RATIO) / 2
    scale = _fit_scale(logo.width, logo.height, safe_radius)
    nw = max(1, int(round(logo.width * scale)))
    nh = max(1, int(round(logo.height * scale)))
    logo_s = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    x0 = (canvas - nw) // 2
    y0 = (canvas - nh) // 2
    return logo_s, x0, y0, nw, nh, safe_radius


def composite_icons(logo_path: Path, out_dir: Path, orange: tuple[int, int, int]) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    logo = prepare_logo(logo_path)
    logo_s, x0, y0, nw, nh, safe_radius = scale_and_position(logo)

    # iOS / universal Expo icon (opaque orange)
    base = Image.new("RGBA", (CANVAS, CANVAS), (*orange, 255))
    base.paste(logo_s, (x0, y0), logo_s)
    app_icon = base.convert("RGB")
    app_icon.save(out_dir / "app-icon.png", "PNG", optimize=True)

    # Splash — same centered logo on brand orange (Expo splash.image + backgroundColor)
    app_icon.save(out_dir / "splash-icon.png", "PNG", optimize=True)

    # Android adaptive foreground (transparent outside mark)
    fg = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    fg.paste(logo_s, (x0, y0), logo_s)
    fg.save(out_dir / "app-icon-adaptive-foreground.png", "PNG", optimize=True)

    # Android adaptive background (solid brand orange)
    Image.new("RGB", (CANVAS, CANVAS), orange).save(
        out_dir / "app-icon-adaptive-background.png", "PNG", optimize=True
    )

    app_icon.resize((48, 48), Image.Resampling.LANCZOS).save(
        out_dir / "favicon.png", "PNG", optimize=True
    )

    print(
        f"Wrote icons → {out_dir} "
        f"(logo {nw}×{nh}, safe radius≈{safe_radius:.0f}px, ratio {_SAFE_NUM}/{_SAFE_DEN})"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--logo",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "assets" / "chef2home_logo.png",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "assets",
    )
    parser.add_argument(
        "--orange",
        default=ORANGE_HEX,
        help='Background color, e.g. "#FF6B35"',
    )
    args = parser.parse_args()
    orange = hex_to_rgb(args.orange)
    if not args.logo.is_file():
        raise SystemExit(f"Logo not found: {args.logo}")
    composite_icons(args.logo, args.out_dir, orange)


if __name__ == "__main__":
    main()
