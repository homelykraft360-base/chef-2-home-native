#!/usr/bin/env python3
"""Thin wrapper — regenerates all icon assets (see generate_app_icons.py)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from generate_app_icons import ORANGE_HEX, composite_icons, hex_to_rgb  # noqa: E402

DEFAULT_SRC = ROOT / "assets" / "chef2home_logo.png"
OUT_DIR = ROOT / "assets"


def main() -> None:
    if not DEFAULT_SRC.is_file():
        raise FileNotFoundError(f"Source image not found: {DEFAULT_SRC}")
    composite_icons(DEFAULT_SRC, OUT_DIR, hex_to_rgb(ORANGE_HEX))


if __name__ == "__main__":
    main()
