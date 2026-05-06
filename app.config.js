/**
 * Dynamic Expo config — merges with app.json so assets (icon, splash, etc.) stay applied.
 * @see https://docs.expo.dev/workflow/configuration/#dynamic-configuration
 *
 * Add Firebase config files at the project root (gitignored):
 *   - google-services.json (Android)
 *   - GoogleService-Info.plist (iOS)
 * Or set GOOGLE_SERVICES_JSON / GOOGLE_SERVICE_INFO_PLIST to alternate paths for CI.
 */
export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    bundleIdentifier: 'com.homelykraft.chef2home',
    googleServicesFile:
      process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',
  },
  android: {
    ...config.android,
    package: 'com.homelykraft.chef2home',
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
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
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
