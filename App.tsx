import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PaystackProvider } from 'react-native-paystack-webview';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import Constants from 'expo-constants';

import RootNavigator from './src/navigation/RootNavigator';
import { persistor, store } from './src/store';

// Load API client so it subscribes to store and syncs token to request headers
import './src/api/client';

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

/** Block app until rehydration completes so token is available before any API call. */
function RehydrateGate({ children }: { children: React.ReactNode }) {
  return (
    <PersistGate
      loading={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D97602" />
        </View>
      }
      persistor={persistor}
    >
      {children}
    </PersistGate>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <RehydrateGate>
        <PaystackProvider publicKey={paystackKey}>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </PaperProvider>
        </PaystackProvider>
      </RehydrateGate>
    </ReduxProvider>
  );
}
