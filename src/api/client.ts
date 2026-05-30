import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { store } from '../store';
import { signOutUser } from '../store/authSlice';
import type { ApiError } from '../types';
import { getErrorMessage } from '../utils/error.utils';

interface CustomAxiosError extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Android emulator: `localhost` is the emulator itself, not the host machine — use 10.0.2.2.
 * Physical device: user must set EXPO_PUBLIC_BASE_URL to the computer's LAN IP.
 */
function resolveApiBaseUrl(configured: string): string {
  const trimmed = configured.replace(/\/+$/, '');
  if (
    typeof __DEV__ === 'undefined' ||
    !__DEV__ ||
    Platform.OS !== 'android'
  ) {
    return trimmed;
  }
  try {
    const withScheme = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `http://${trimmed}`;
    const u = new URL(withScheme);
    const host = u.hostname.toLowerCase();
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return trimmed;
    }
    if (Device.isDevice) {
      console.warn(
        '[API] Physical Android cannot use localhost — set EXPO_PUBLIC_BASE_URL to http://YOUR_LAN_IP:8000 (same Wi-Fi).',
      );
      return trimmed;
    }
    u.hostname = '10.0.2.2';
    console.warn(
      '[API] Android emulator: using 10.0.2.2 instead of localhost so the API on your computer is reachable.',
    );
    return u.toString().replace(/\/$/, '');
  } catch {
    return trimmed;
  }
}

const baseUrl = resolveApiBaseUrl(
  Constants.expoConfig?.extra?.baseUrl ?? 'http://localhost:8000',
);

const clientApi = axios.create({
  baseURL: `${baseUrl}/api/v1/`,
  /** Render cold starts can exceed 10s; RN often surfaces slow TLS + redirects as ERR_NETWORK. */
  timeout: 45000,
  withCredentials: false,
});

function resolvedRequestUrl(config: InternalAxiosRequestConfig): string {
  try {
    return clientApi.getUri(config);
  } catch {
    const b = (config.baseURL ?? '').replace(/\/+$/, '');
    const u = (config.url ?? '').replace(/^\/+/, '');
    return u ? `${b}/${u}` : b;
  }
}

/** Chrome “Network” does not show RN Android traffic; log here to see calls in Metro / adb logcat. */
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  clientApi.interceptors.request.use((config) => {
    console.log(
      `[API] ${String(config.method ?? 'get').toUpperCase()} ${resolvedRequestUrl(config)}`,
    );
    return config;
  });
}

/** Keep Authorization header in sync with Redux so every request gets the token. */
function syncAuthHeader() {
  const token = store.getState().auth.token;
  const value = token ? `Bearer ${token}` : '';
  clientApi.defaults.headers.common['Authorization'] = value;
  clientApi.defaults.headers.get['Authorization'] = value;
  clientApi.defaults.headers.post['Authorization'] = value;
  clientApi.defaults.headers.patch['Authorization'] = value;
  clientApi.defaults.headers.put['Authorization'] = value;
}
syncAuthHeader();
store.subscribe(syncAuthHeader);

const attemptTokenRefresh = async (
  originalRequest: CustomAxiosError,
): Promise<unknown> => {
  if (!originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/auth/refresh`,
        {},
        { baseURL: undefined, timeout: 45000 },
      );
      const token = response.data?.access_token ?? response.data?.accessToken;
      if (response.status === 200 && token) {
        store.dispatch({ type: 'auth/setToken', payload: token });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return clientApi(originalRequest);
      }
      throw new Error('Unable to refresh token');
    } catch {
      store.dispatch(signOutUser());
      return Promise.reject(new Error('Session expired'));
    }
  }
  return Promise.reject(new Error('Session expired'));
};

clientApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = store.getState().auth.token;
    if (token && config.headers) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

clientApi.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    response = response.data ?? ({} as AxiosResponse);
    return response;
  },
  async (error: AxiosError) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const cfg = error.config;
      console.warn(
        '[API ERR]',
        error.code ?? 'NO_CODE',
        error.message,
        cfg ? resolvedRequestUrl(cfg) : '',
        error.response ? `HTTP ${error.response.status}` : '',
      );
    }
    const originalRequest = error.config as CustomAxiosError;
    const status = error.response?.status;
    if (
      originalRequest &&
      !originalRequest.url?.includes('auth') &&
      status === 401
    ) {
      const result = await attemptTokenRefresh(originalRequest);
      if (result !== undefined) return result;
    }
    const errorMessage = getErrorMessage(error);
    return Promise.reject(errorMessage);
  },
);

export { clientApi };
