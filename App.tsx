import { StatusBar } from 'expo-status-bar';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PaystackProvider } from 'react-native-paystack-webview';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import Constants from 'expo-constants';

import RootNavigator from './src/navigation/RootNavigator';
import { persistor, store } from './src/store';

const paystackKey =
  (Constants.expoConfig?.extra as { paystackPublicKey?: string })
    ?.paystackPublicKey ?? '';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D97602',
  },
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaystackProvider publicKey={paystackKey}>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </PaperProvider>
        </PaystackProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
