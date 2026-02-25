export default {
  expo: {
    name: 'Chef2Home',
    slug: 'chef-2-home-native',
    version: '1.0.0',
    scheme: 'chef2home',
    extra: {
      baseUrl: process.env.EXPO_PUBLIC_BASE_URL ?? 'http://localhost:8000',
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
