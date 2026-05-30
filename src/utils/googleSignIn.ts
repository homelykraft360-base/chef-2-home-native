import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Google Sign-In uses a native module (RNGoogleSignin) that is only included in
 * development builds (expo run:ios / run:android), not in Expo Go or web.
 * Show the button only on iOS/Android when not in Expo Go.
 */
export const isGoogleSignInAvailable =
  Constants.appOwnership !== 'expo' &&
  (Platform.OS === 'ios' || Platform.OS === 'android');

type GoogleSignInResult =
  | { status: 'success'; idToken: string }
  | { status: 'cancelled' }
  | { status: 'unavailable'; error: string }
  | { status: 'error'; error: string };

type GoogleExtraConfig = {
  googleWebClientId?: string;
  googleIosClientId?: string;
  googleIosUrlScheme?: string;
};

function readExtra() {
  const fromExpoConfig = (Constants.expoConfig?.extra as GoogleExtraConfig) ?? {};
  const fromManifest = ((Constants.manifest as { extra?: GoogleExtraConfig } | null)
    ?.extra ?? {});
  const fromManifest2 = ((Constants.manifest2 as { extra?: GoogleExtraConfig } | null)
    ?.extra ?? {});

  // Release builds can expose config through different manifest sources.
  return {
    ...fromManifest,
    ...fromManifest2,
    ...fromExpoConfig,
  };
}

function isPlaceholder(value?: string): boolean {
  if (!value) return true;
  return value.toUpperCase().includes('PLACEHOLDER');
}

function deriveIosClientIdFromScheme(urlScheme?: string): string | null {
  if (!urlScheme || isPlaceholder(urlScheme)) return null;
  const prefix = 'com.googleusercontent.apps.';
  if (!urlScheme.startsWith(prefix)) return null;
  const suffix = urlScheme.slice(prefix.length);
  if (!suffix) return null;
  return `${suffix}.apps.googleusercontent.com`;
}

function validateGoogleSignInConfig(): string | null {
  const { googleWebClientId, googleIosClientId, googleIosUrlScheme } = readExtra();
  const resolvedIosClientId =
    googleIosClientId ?? deriveIosClientIdFromScheme(googleIosUrlScheme);

  if (!googleWebClientId || isPlaceholder(googleWebClientId)) {
    return 'Google sign-in is not configured: missing web client id.';
  }

  if (Platform.OS === 'ios' && !resolvedIosClientId) {
    return 'Google sign-in is not configured: missing iOS client id.';
  }

  return null;
}

/**
 * Call Google Sign-In and return the ID token. Only call when isGoogleSignInAvailable is true.
 * Uses dynamic import so the native module is not loaded in Expo Go or on web.
 * Catches missing native module so the app never crashes.
 */
export async function getGoogleIdToken(): Promise<GoogleSignInResult> {
  if (!isGoogleSignInAvailable) {
    return {
      status: 'unavailable',
      error: 'Google sign-in is not available in this app runtime.',
    };
  }

  const configError = validateGoogleSignInConfig();
  if (configError) {
    return { status: 'unavailable', error: configError };
  }

  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    const { googleWebClientId, googleIosClientId, googleIosUrlScheme } = readExtra();
    const resolvedIosClientId =
      googleIosClientId ?? deriveIosClientIdFromScheme(googleIosUrlScheme) ?? undefined;
    GoogleSignin.configure({
      webClientId: googleWebClientId,
      iosClientId: resolvedIosClientId,
    });
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled' || !response.data?.idToken) {
      return { status: 'cancelled' };
    }
    return { status: 'success', idToken: response.data.idToken };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Google sign-in failed. Please try again.';
    return { status: 'error', error: message };
  }
}
