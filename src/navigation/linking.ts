import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';

import { store } from '../store';
import { setPendingInviteToken } from '../store/authSlice';
import type { RootStackParamList } from './types';

function extractInviteToken(url: string): string | null {
  const parsed = Linking.parse(url);
  const path = parsed.path ?? '';
  if (!path.includes('invite')) return null;
  const token = parsed.queryParams?.token;
  if (typeof token === 'string' && token.trim()) return token.trim();
  return null;
}

function cacheTokenFromUrl(url: string) {
  const token = extractInviteToken(url);
  if (token) {
    store.dispatch(setPendingInviteToken(token));
  }
}

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.createURL('/'),
    'chef2home://',
    'https://chef2home.ng',
  ],
  config: {
    screens: {
      AcceptInvite: {
        path: 'invite',
        parse: {
          token: (value: string) => value,
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          SignUp: 'signup',
          OTP: 'otp',
        },
      },
      Main: {
        screens: {
          Home: 'home',
          Meals: 'meals',
          Subscription: 'subscription',
          Settings: 'settings',
        },
      },
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) cacheTokenFromUrl(url);
    return url;
  },
  subscribe(listener: (url: string) => void) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      cacheTokenFromUrl(url);
      listener(url);
    });
    return () => subscription.remove();
  },
};
