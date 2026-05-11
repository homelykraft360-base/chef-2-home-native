# Store screenshots (iOS + Android)

Generated from creative-approved phone grabs (`Screenshot_*.png` in Cursor assets).

| Folder | Resolution | Use |
|--------|------------|-----|
| `iphone-6_5/` | **1284 × 2778** portrait | App Store Connect → **iPhone 6.5" Display** (also accepted: **1242 × 2688** portrait or either pair landscape) |
| `ipad-13/` | **2064 × 2752** portrait | Large **13-inch iPad** slot |
| `android-phone/` | **1080 × 2340** portrait | Google Play → **Phone** screenshots |
| `android-tablet-7/` | **1080 × 1920** portrait | Google Play → **7-inch tablet** screenshots |
| `android-tablet-10/` | **1600 × 2560** portrait | Google Play → **10-inch tablet** screenshots |

Slides:

1. `01-sign-in` — Sign in  
2. `02-meals-subscription` — Meals / subscription  
3. `03-account-settings` — Account settings  
4. `04-your-schedule` — Booking step “Your schedule”  

For **1242 × 2688** instead, change `CANVAS["iphone-6_5"]` in `../scripts/generate-store-screenshots.py`. If ASC asks for **2048 × 2732** for iPad, adjust the `ipad-13` tuple there.

Sources were **460 × 1024** exports → outputs are upscaled; replace with full-resolution captures for production marketing quality.
