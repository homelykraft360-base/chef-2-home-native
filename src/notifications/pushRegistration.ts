import messaging, {
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerPushToken } from '../api/userApi';
import type { DevicePlatform } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function platformTag(): DevicePlatform {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

/**
 * Request permission, obtain the FCM device token, and register it with the API.
 * Safe to call on every login — the API upserts by token.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.getPermissionsAsync();
  let final = status;
  if (final !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    final = req.status;
  }
  if (final !== 'granted') return null;

  if (Platform.OS === 'ios') {
    const auth = await messaging().requestPermission();
    const ok =
      auth === AuthorizationStatus.AUTHORIZED ||
      auth === AuthorizationStatus.PROVISIONAL;
    if (!ok) return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const token = await messaging().getToken();
  if (!token) return null;

  const { error } = await registerPushToken({
    fcmToken: token,
    platform: platformTag(),
  });
  if (error) {
    console.warn('[push] failed to register token with API:', error);
  }
  return token;
}
