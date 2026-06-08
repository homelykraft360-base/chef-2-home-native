# Chef2Home Mobile

React Native (Expo) customer app for Chef2Home — food subscription and meal booking. Works alongside the [Chef2Home web app](../chef-2-home) and shares the same API ([chef-2-home-api](../chef-2-home-api)).

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `EXPO_PUBLIC_BASE_URL` — API base URL (e.g. `https://api.yourapp.com` or `http://localhost:8000` for local).
   - `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` — Paystack public key for payments (e.g. `pk_test_xxxx`).

3. **Run**

   ```bash
   npm run start
   ```

   Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

## Scripts

| Command        | Purpose              |
|----------------|----------------------|
| `npm run start`| Start Expo dev server|
| `npm run ios`  | Run on iOS           |
| `npm run android` | Run on Android   |

## Features

- **Auth**: Login, sign up, OTP verification (customer only).
- **Dashboard**: Home, Booking, Subscription, Settings.
- **Booking**: Select plan, logistics (cook-in/delivery, ingredients), preferences, then Paystack payment (WebView).
- **Subscription**: View current subscription and toggle auto-renewal.
- **Settings**: View profile and sign out.

## Deep links

The app uses the scheme `chef2home`. Example: `chef2home://` to open the app.

## Builds

Use [EAS Build](https://docs.expo.dev/build/introduction/) for production iOS/Android builds:

```bash
npx eas build --platform all
```

To **run locally against production API / keys** (`.env.production`), see **[docs/RUN-PRODUCTION.md](docs/RUN-PRODUCTION.md)**.

## Optional: Sentry

To add error tracking, install `@sentry/react-native` and initialise in `App.tsx` as per [Sentry React Native docs](https://docs.sentry.io/platforms/react-native/).
