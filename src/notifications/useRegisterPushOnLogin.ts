import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import type { RootState } from '../store';

import { registerForPushNotifications } from './pushRegistration';

/**
 * Wired once at the top of the authenticated tree. Registers the device's
 * push token whenever we have an auth token, and deep-links taps on meal
 * reminders to the Meals tab.
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
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data?.screen;
        if (screen === 'Meals') {
          (navigation as { navigate: (name: string) => void }).navigate('Meals');
        }
      },
    );
    return () => sub.remove();
  }, [navigation]);
}
