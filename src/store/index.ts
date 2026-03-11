import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authSlice } from './authSlice';
import { themeSlice } from './themeSlice';

const authPersistConfig = {
  key: 'session-hub-auth',
  storage: AsyncStorage,
};
const themePersistConfig = {
  key: 'session-hub-theme',
  storage: AsyncStorage,
};

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authSlice.reducer),
    theme: persistReducer(themePersistConfig, themeSlice.reducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
