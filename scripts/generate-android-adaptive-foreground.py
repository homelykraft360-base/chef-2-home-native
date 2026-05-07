#!/usr/bin/env python3
"""Build Android adaptive-icon foreground with Material safe-zone padding.

Android adaptive icons mask the foreground to circle/squircle/shapes; only the
inner ~66dp circle of the 108dp layer is reliably visible. Scale artwork to fit
that circle inside a 1024×1024 canvas so logos are not cropped.

Default source: assets/chef2home_logo.png (horizontal wordmark).
Output: assets/app-icon-adaptive-foreground.png

Usage:
  cd chef-2-home-native && python scripts/generate-android-adaptive-foreground.py

Optional:
  SAFE_NUMERATOR=60 python ...   # tighter inset if OEM masks still clip edges
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
DEFAULT_SRC = ASSETS / "chef2home_logo.png"
OUT = ASSETS / "app-icon-adaptive-foreground.png"
CANVAS = 1024
# Material keyline: diameter 66dp inside 108dp layer → scale artwork to this fraction.
_SAFE_NUM = int(os.environ.get("SAFE_NUMERATOR", "66"))
_SAFE_DEN = int(os.environ.get("SAFE_DENOMINATOR", "108"))
SAFE_RATIO = _SAFE_NUM / _SAFE_DEN


def main() -> None:
    src_path = Path(os.environ.get("ICON_SRC", str(DEFAULT_SRC)))
    if not src_path.is_file():
        raise FileNotFoundError(f"Source image not found: {src_path}")

    im = Image.open(src_path).convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)

    safe_px = int(round(CANVAS * SAFE_RATIO))
    scale = min(safe_px / im.width, safe_px / im.height)
    nw, nh = max(1, int(round(im.width * scale))), max(
        1, int(round(im.height * scale))
    )
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    x = (CANVAS - nw) // 2
    y = (CANVAS - nh) // 2
    canvas.paste(im, (x, y), im)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, format="PNG", optimize=True)
    print(f"Wrote {OUT} ({CANVAS}×{CANVAS}, safe≈{safe_px}px, ratio {_SAFE_NUM}/{_SAFE_DEN})")


if __name__ == "__main__":
    main()
