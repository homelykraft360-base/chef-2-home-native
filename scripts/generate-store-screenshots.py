#!/usr/bin/env python3
"""Resize source screenshots to store canvas sizes (cover + center crop).

Outputs iOS (iPhone / iPad) and Google Play (phone + 7\" / 10\" tablet) folders.

Usage (from repo root):
  cd chef-2-home-native && python3 -m venv .venv-storegen && source .venv-storegen/bin/activate
  pip install pillow
  python scripts/generate-store-screenshots.py

Edit SOURCE_PATHS if your PNGs live elsewhere.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = ROOT / "store" / "screenshots"

# Adjust if needed — paths used when assets live under Cursor project assets.
_DEFAULT_ASSETS = Path.home() / ".cursor/projects/Users-oak-pay-Development-homelykraft/assets"

SOURCE_PATHS = [
    ("01-sign-in", _DEFAULT_ASSETS / "Screenshot_1778110842-79d13187-dfd5-49f8-bd57-faf157406c36.png"),
    ("02-meals-subscription", _DEFAULT_ASSETS / "Screenshot_1778111183-4e2beedd-edcd-4684-9615-2549bbc6f6db.png"),
    ("03-account-settings", _DEFAULT_ASSETS / "Screenshot_1778111194-fe5daad8-da13-4937-9c6e-d0ee5c5043e5.png"),
    (
        "04-your-schedule",
        _DEFAULT_ASSETS / "Screenshot_1778111249-372da1fe-7552-44b1-baa1-aeb25ae57d25.png",
    ),
]

# iPhone 6.5" Display — ASC accepts portrait: 1242×2688 or 1284×2778 (and landscape swaps).
# Play Console — phone + tablet slots (portrait; within min/max side limits).
CANVAS = {
    "iphone-6_5": (1284, 2778),
    "ipad-13": (2064, 2752),
    "android-phone": (1080, 2340),
    "android-tablet-7": (1080, 1920),
    "android-tablet-10": (1600, 2560),
}


def cover_crop(im: Image.Image, tw: int, th: int) -> Image.Image:
    iw, ih = im.size
    scale = max(tw / iw, th / ih)
    nw, nh = int(round(iw * scale)), int(round(ih * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, (nw - tw) // 2)
    top = max(0, (nh - th) // 2)
    return im.crop((left, top, left + tw, top + th))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for folder, (tw, th) in CANVAS.items():
        dest = OUT / folder
        dest.mkdir(parents=True, exist_ok=True)
        for slug, src in SOURCE_PATHS:
            if not src.is_file():
                raise FileNotFoundError(f"Missing source: {src}")
            im = Image.open(src).convert("RGB")
            cover_crop(im, tw, th).save(
                dest / f"{slug}.png", format="PNG", optimize=True
            )
            print("wrote", dest / f"{slug}.png")


if __name__ == "__main__":
    main()
