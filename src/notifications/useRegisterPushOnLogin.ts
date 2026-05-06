import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { registerPushToken } from '../api/userApi';
import type { RootState } from '../store';

import { platformTag, registerForPushNotifications } from './pushRegistration';

function navigateToMeals(navigation: { navigate: (name: string) => void }) {
  navigation.navigate('Meals');
}

/**
 * Wired once at the top of the authenticated tree. Registers the device's FCM token
 * whenever we have an auth token, mirrors foreground FCM into local notifications,
 * and deep-links taps (FCM + expo-notifications) to the Meals tab.
 */
export default function useRegisterPushOnLogin() {
  const authToken = useSelector((s: RootState) => s.auth.token);
  const navigation = useNavigation();

  useEffect(() => {
    if (!authToken) return;
    registerForPushNotifications().catch((err) =>
      console.warn('[push] registration error:', err),
    );
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    const unsubRefresh = messaging().onTokenRefresh(async (token) => {
      const { error } = await registerPushToken({
        fcmToken: token,
        platform: platformTag(),
      });
      if (error) console.warn('[push] token refresh register failed:', error);
    });
    return () => unsubRefresh();
  }, [authToken]);

  useEffect(() => {
    const unsubMsg = messaging().onMessage(async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? 'Chef2Home';
      const body = remoteMessage.notification?.body ?? '';
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: (remoteMessage.data ?? {}) as Record<string, unknown>,
        },
        trigger: null,
      });
    });
    return () => unsubMsg();
  }, []);

  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.screen === 'Meals') {
          navigateToMeals(navigation as { navigate: (name: string) => void });
        }
      })
      .catch(() => undefined);

    const unsubOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data?.screen === 'Meals') {
        navigateToMeals(navigation as { navigate: (name: string) => void });
      }
    });

    const subExpo = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data?.screen;
        if (screen === 'Meals') {
          navigateToMeals(navigation as { navigate: (name: string) => void });
        }
      },
    );

    return () => {
      unsubOpen();
      subExpo.remove();
    };
  }, [navigation]);
}
