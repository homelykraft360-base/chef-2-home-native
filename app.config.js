export default {
  expo: {
    name: 'Chef2Home',
    slug: 'chef-2-home-native',
    version: '1.0.0',
    scheme: 'chef2home',
    extra: {
      // API base (no trailing slash). For Android emulator hitting a server on your Mac:
      //   1) Prefer: `adb reverse tcp:8000 tcp:8000` then use http://127.0.0.1:8000
      //      (avoids tools that reject numeric hosts like 10.0.2.2).
      //   2) Or: http://10.0.2.2:8000 (emulator-only alias to host loopback).
      // Physical device: use your Mac's LAN IP, e.g. http://192.168.1.42:8000
      // baseUrl: process.env.EXPO_PUBLIC_BASE_URL ?? 'http://localhost:8000',
      baseUrl: 'https://chef-2-home-api-staging.onrender.com',
      paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '',
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    },
    ios: { bundleIdentifier: 'com.homelykraft.chef2home' },
    android: { package: 'com.homelykraft.chef2home' },
    plugins: [
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme:
            process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ?? 'com.googleusercontent.apps.PLACEHOLDER',
        },
      ],
    ],
  },
};
