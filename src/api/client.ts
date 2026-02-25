import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';

import { store } from '../store';
import { signOutUser } from '../store/authSlice';
import type { ApiError } from '../types';
import { getErrorMessage } from '../utils/error.utils';

interface CustomAxiosError extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseUrl =
  Constants.expoConfig?.extra?.baseUrl ?? 'http://localhost:8000';

const clientApi = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  timeout: 10000,
  withCredentials: false,
});

const attemptTokenRefresh = async (
  originalRequest: CustomAxiosError,
): Promise<unknown> => {
  if (!originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/auth/refresh`,
        {},
        { baseURL: undefined },
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
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
