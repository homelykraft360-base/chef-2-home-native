/**
 * Dynamic Expo config — merges with app.json so assets (icon, splash, etc.) stay applied.
 * @see https://docs.expo.dev/workflow/configuration/#dynamic-configuration
 *
 * Firebase native config (local): project root, often gitignored:
 *   google-services.json, GoogleService-Info.plist
 * EAS Build only sees git-tracked files — upload the same files as EAS "File"
 * env vars (see .env.example) and set eas.json build.environment so they load.
 */
export default ({ config }) => {
  const googleIosUrlScheme =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ??
    'com.googleusercontent.apps.147410743538-ao70kkf1tcpnesgg7beg3bc43tm567i7';

  const existingUrlTypes = Array.isArray(config.ios?.infoPlist?.CFBundleURLTypes)
    ? config.ios.infoPlist.CFBundleURLTypes
    : [];

  return {
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: 'com.homelykraft.chef2home',
      usesAppleSignIn: true,
      /** Required for ASAuthorization; without it, devices often report AK -7026 / AS error 1000. */
      entitlements: {
        ...(config.ios?.entitlements ?? {}),
        'com.apple.developer.applesignin': ['Default'],
      },
      googleServicesFile:
        process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',
      infoPlist: {
        ...(config.ios?.infoPlist ?? {}),
        // Keep URL scheme explicitly in Info.plist; plugin should add this too.
        CFBundleURLTypes: [
          ...existingUrlTypes,
          {
            CFBundleURLName: 'google-signin',
            CFBundleURLSchemes: [googleIosUrlScheme],
          },
        ],
      },
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
            deploymentTarget: '15.1',
            useFrameworks: 'static',
            // RN 0.81 + prebuilt React-Core: RNFB* as frameworks pulls non-modular React headers.
            // Keep Firebase pods statically linked; see react-native-firebase#8657 / Expo docs.
            forceStaticLinking: ['RNFBApp', 'RNFBMessaging'],
            // RNFirebase static + FirebaseCoreInternal (Swift): GoogleUtilities needs module maps.
            extraPods: [{ name: 'GoogleUtilities', modular_headers: true }],
            // If builds still fail, try: buildReactNativeFromSource: true (slower, skips prebuilt RN).
          },
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: googleIosUrlScheme,
        },
      ],
      'expo-apple-authentication',
      'expo-notifications',
    ],
    extra: {
      ...config.extra,
      baseUrl:
        process.env.EXPO_PUBLIC_BASE_URL ??
        'https://chef-2-home-api-staging.onrender.com',
      paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '',
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
      googleIosUrlScheme,
      eas: {
        /** Linked EAS project — required because dynamic config cannot be patched by `eas init`. */
        projectId:
          process.env.EAS_PROJECT_ID ?? 'c23da22f-1d9d-490e-86a8-7f34946b238c',
      },
    },
  };
};
