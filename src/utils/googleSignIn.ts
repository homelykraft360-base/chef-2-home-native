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

/**
 * Call Google Sign-In and return the ID token. Only call when isGoogleSignInAvailable is true.
 * Uses dynamic import so the native module is not loaded in Expo Go or on web.
 * Catches missing native module so the app never crashes.
 */
export async function getGoogleIdToken(): Promise<string | null> {
  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    const webClientId = (Constants.expoConfig?.extra as { googleWebClientId?: string })?.googleWebClientId;
    if (webClientId) {
      GoogleSignin.configure({ webClientId });
    }
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled' || !response.data?.idToken) {
      return null;
    }
    return response.data.idToken;
  } catch (_) {
    return null;
  }
}
