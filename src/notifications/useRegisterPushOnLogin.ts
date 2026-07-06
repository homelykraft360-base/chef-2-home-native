import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { registerPushToken } from '../api/userApi';
import type { RootState } from '../store';

import { platformTag, registerForPushNotifications } from './pushRegistration';

type TabNavigation = {
  navigate: (name: string) => void;
  getParent?: () => { navigate: (name: string, params?: object) => void } | undefined;
};

function navigateToMeals(navigation: TabNavigation) {
  navigation.navigate('Meals');
}

function navigateToSupport(
  navigation: TabNavigation,
  ticketId?: number,
) {
  const parent = navigation.getParent?.();
  if (!parent) return;
  if (ticketId) {
    parent.navigate('SupportTicketDetail', { ticketId });
  } else {
    parent.navigate('SupportTickets');
  }
}

function handleSupportPushData(
  navigation: TabNavigation,
  data: Record<string, unknown> | undefined,
) {
  if (!data) return false;
  const screen = data.screen;
  if (screen === 'SupportTickets') {
    navigateToSupport(navigation);
    return true;
  }
  if (screen === 'SupportTicketDetail') {
    const rawId = data.ticketId ?? data.ticket_id;
    const ticketId = Number(rawId);
    if (Number.isFinite(ticketId) && ticketId > 0) {
      navigateToSupport(navigation, ticketId);
      return true;
    }
    navigateToSupport(navigation);
    return true;
  }
  return false;
}

/**
 * Wired once at the top of the authenticated tree. Registers the device's FCM token
 * whenever we have an auth token, mirrors foreground FCM into local notifications,
 * and deep-links notification taps to the relevant screen.
 */
export default function useRegisterPushOnLogin() {
  const authToken = useSelector((s: RootState) => s.auth.token);
  const navigation = useNavigation<TabNavigation>();

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
        const data = remoteMessage?.data as Record<string, unknown> | undefined;
        if (handleSupportPushData(navigation, data)) return;
        if (data?.screen === 'Meals') {
          navigateToMeals(navigation);
        }
      })
      .catch(() => undefined);

    const unsubOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
      const data = remoteMessage?.data as Record<string, unknown> | undefined;
      if (handleSupportPushData(navigation, data)) return;
      if (data?.screen === 'Meals') {
        navigateToMeals(navigation);
      }
    });

    const subExpo = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        if (handleSupportPushData(navigation, data)) return;
        if (data?.screen === 'Meals') {
          navigateToMeals(navigation);
        }
      },
    );

    return () => {
      unsubOpen();
      subExpo.remove();
    };
  }, [navigation]);
}
