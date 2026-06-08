import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

export type AppleSignInResult =
  | { status: 'cancelled' }
  | { status: 'unavailable' }
  | { status: 'error'; error: string }
  | {
      status: 'success';
      identityToken: string;
      firstName: string | null;
      lastName: string | null;
    };

function mapAppleAuthErrorMessage(raw: string): string {
  if (
    raw.includes('1000') ||
    raw.includes('AuthorizationError') ||
    raw.includes('7026')
  ) {
    return (
      'Sign in with Apple could not start. Use a physical iPhone when possible, sign in to iCloud on the simulator, ' +
      'enable Sign in with Apple on the App ID for this bundle, then run `npx expo prebuild --clean` and rebuild.'
    );
  }
  return raw;
}

export async function getAppleSignInAvailability(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Present Sign in with Apple and return the identity token for the API.
 * Only valid on iOS builds with the entitlement (EAS / dev client — not Expo Go).
 */
export async function performAppleSignIn(): Promise<AppleSignInResult> {
  if (Platform.OS !== 'ios') {
    return { status: 'unavailable' };
  }
  try {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      return { status: 'unavailable' };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return {
        status: 'error',
        error: 'Apple did not return an identity token. Please try again.',
      };
    }

    return {
      status: 'success',
      identityToken: credential.identityToken,
      firstName: credential.fullName?.givenName ?? null,
      lastName: credential.fullName?.familyName ?? null,
    };
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'ERR_REQUEST_CANCELED') {
      return { status: 'cancelled' };
    }
    const raw =
      e instanceof Error && e.message
        ? e.message
        : 'Apple sign-in failed. Please try again.';
    return { status: 'error', error: mapAppleAuthErrorMessage(raw) };
  }
}

export { AppleAuthentication };
