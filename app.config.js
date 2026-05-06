/**
 * Dynamic Expo config — merges with app.json so assets (icon, splash, etc.) stay applied.
 * @see https://docs.expo.dev/workflow/configuration/#dynamic-configuration
 */
export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    bundleIdentifier: 'com.homelykraft.chef2home',
  },
  android: {
    ...config.android,
    package: 'com.homelykraft.chef2home',
  },
  plugins: [
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ??
          'com.googleusercontent.apps.PLACEHOLDER',
      },
    ],
    'expo-notifications',
  ],
  extra: {
    ...config.extra,
    baseUrl:
      process.env.EXPO_PUBLIC_BASE_URL ??
      'https://chef-2-home-api-staging.onrender.com',
    paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '',
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    eas: {
      /** Set automatically after `eas init`; optional locally for push token resolution */
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
