import messaging from '@react-native-firebase/messaging';

/**
 * Side-effect module — import this before `./App` so the handler is registered
 * before the app tree loads.
 */
messaging().setBackgroundMessageHandler(async () => undefined);
