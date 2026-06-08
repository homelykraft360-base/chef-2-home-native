# Run Chef2Home (native) against production configuration

“Production mode” here means the app loads **`EXPO_PUBLIC_*` values from `.env.production`** (production API URL, live Paystack key, production Google client IDs, etc.) while you still use the **dev client** + Metro on your machine.

Expo loads env files from `NODE_ENV` (see [Environment variables in Expo](https://docs.expo.dev/guides/environment-variables/)):

- `NODE_ENV=production` → `.env.production.local` → `.env.local` → **`.env.production`** → `.env`

So you **do not** need to copy `.env.production` into `.env` if you start Metro with `NODE_ENV=production`.

---

## Prerequisites

- A **dev-client** iOS/Android build installed (from `expo run:ios` / `expo run:android` or an EAS internal build). This repo is **not** Expo Go–compatible for all features (Firebase, Google Sign-In, etc.).
- **`.env.production`** in the project root with your production `EXPO_PUBLIC_*` values (see `.env.example`). Keep secrets out of git if you prefer; only commit non-secret templates.

---

## Run on iOS Simulator (production env)

From `chef-2-home-native`:

```bash
npm install
npm run start:prod
```

Then press **`i`** in the terminal, or open the dev client on the simulator and connect to the Metro URL.

Optional: bundle JS closer to a release build (slower refresh, useful for perf / parity checks):

```bash
npm run start:prod:release
```

---

## Run on a physical phone (production env)

1. Connect the device (USB) or use the same Wi‑Fi as your computer.
2. Start Metro with production env (same as above):

   ```bash
   npm run start:prod
   ```

3. Open the **Chef2Home dev client** on the phone (scan the QR code from the terminal, or use Expo’s dev menu → “Enter URL manually” if needed).

**API URL:** Your `.env.production` `EXPO_PUBLIC_BASE_URL` must be reachable from the phone (e.g. public `https://…` on Render). `http://localhost:8000` will **not** work from a device unless you tunnel or point to your machine’s LAN IP.

---

## Quick reference

| Goal | Command |
|------|---------|
| Production **env vars** + normal dev bundle | `npm run start:prod` |
| Production **env vars** + production-style JS (`--no-dev --minify`) | `npm run start:prod:release` |
| Default dev (`.env` / development) | `npm run start` |

---

## Notes

- **`EXPO_PUBLIC_*` are inlined when Metro bundles.** After changing `.env.production`, restart Metro (`Ctrl+C`, then `npm run start:prod` again). Use **`--clear`** if a value seems stuck: `npm run start:prod -- --clear`.
- **Store / TestFlight builds** do not use your laptop’s `.env.production`; they use **EAS environment variables** for the `production` environment. This doc is only for **local runs** against production config.
- **macOS/Linux:** `NODE_ENV=production` inline works. On **Windows**, use `set NODE_ENV=production` in `cmd` or install `cross-env` and prefix the script if you need Windows support.

---

## App Store / TestFlight (device `.ipa` only)

**Simulator builds cannot be submitted.** If EAS produced **`application-….tar.gz`**, that is an **iOS Simulator** artifact (a `.app` bundle inside). App Store Connect and `eas submit` expect a **device** build: **`.ipa`**.

- **Wrong profile for submit:** `production-simulator` (`ios.simulator: true`) → `.tar.gz`, no `.ipa`.
- **Correct profile for submit:** `production` (no `simulator` flag) → produces an **`.ipa`**.

```bash
cd chef-2-home-native
npx eas build --platform ios --profile production
```

Then submit **that** build (by id if needed):

```bash
npx eas submit --platform ios --id <BUILD_UUID>
```

If you use `eas submit --platform ios --latest`, the **latest** iOS build must be a **device** build. If you just ran `production-simulator`, `--latest` will pick the simulator `.tar.gz` and you get the error you saw. Fix: run a **`production`** device build, then submit again (or pass `--id` explicitly).
