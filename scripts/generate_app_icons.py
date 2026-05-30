#!/usr/bin/env python3
"""Build app launcher icons from the Chef2Home logo (orange bg + padded mark).

Outputs: app-icon.png, app-icon-adaptive-foreground.png, favicon.png — not `icon.png`,
which is used in the in-app header and should stay separate.

Requires: pip install Pillow
Example:
  python3 scripts/generate_app_icons.py \\
    --logo ../chef-2-home/public/img/chef2home_logo.png \\
    --out-dir ./assets
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

# Default matches android.adaptiveIcon.backgroundColor in app.json
ORANGE_HEX = "#FF6B35"

CANVAS = 1024
# Margin on each side (logo fits in remaining square)
PAD_FRAC = 0.12


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def composite_icons(logo_path: Path, out_dir: Path, orange: tuple[int, int, int]) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    logo = Image.open(logo_path).convert("RGBA")
    lw, lh = logo.size
    inner = CANVAS * (1 - 2 * PAD_FRAC)
    scale = min(inner / lw, inner / lh)
    nw, nh = max(1, int(round(lw * scale))), max(1, int(round(lh * scale)))
    logo_s = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    x0 = (CANVAS - nw) // 2
    y0 = (CANVAS - nh) // 2

    # iOS / universal Expo icon (opaque orange)
    base = Image.new("RGBA", (CANVAS, CANVAS), (*orange, 255))
    base.paste(logo_s, (x0, y0), logo_s)
    app_icon = base.convert("RGB")
    app_icon.save(out_dir / "app-icon.png", "PNG", optimize=True)

    # Android adaptive foreground (transparent outside mark)
    fg = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    fg.paste(logo_s, (x0, y0), logo_s)
    fg.save(out_dir / "app-icon-adaptive-foreground.png", "PNG", optimize=True)

    app_icon.resize((48, 48), Image.Resampling.LANCZOS).save(
        out_dir / "favicon.png", "PNG", optimize=True
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
    print(f"Wrote app-icon, adaptive foreground, favicon → {args.out_dir}")


if __name__ == "__main__":
    main()
