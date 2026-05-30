# App Store screenshots

Generated from creative-approved phone grabs (`Screenshot_*.png` in Cursor assets).

| Folder | Resolution | Use |
|--------|------------|-----|
| `iphone-6_5/` | **1284 × 2778** portrait | App Store Connect → **iPhone 6.5" Display** (also accepted: **1242 × 2688** portrait or either pair landscape) |
| `ipad-13/` | **2064 × 2752** portrait | Large **13-inch iPad** slot |

For **1242 × 2688** instead, change `CANVAS["iphone-6_5"]` in `../scripts/generate-store-screenshots.py`. If ASC asks for **2048 × 2732** for iPad, adjust the `ipad-13` tuple there.

Sources were **460 × 1024** exports → outputs are upscaled; replace with full-resolution captures for production marketing quality.
