import type {
  MessageResponse,
  PushTokenRegisterRequest,
  User,
  UserUpdateRequest,
} from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/users/';

export const fetchCurrentUserDetails = async () => {
  const { data, error } = await tryCatch<{ user: User }>(
    clientApi.get(BASE_PATH),
  );
  return {
    user: data?.user,
    error,
  };
};

export const persistProfileUpdate = async (payload: UserUpdateRequest) => {
  const { data, error } = await tryCatch<MessageResponse>(
    clientApi.put(BASE_PATH, payload),
  );
  return {
    message: data?.message,
    error,
  };
};

export const registerPushToken = async (payload: PushTokenRegisterRequest) => {
  const { data, error } = await tryCatch<MessageResponse>(
    clientApi.post(`${BASE_PATH}me/push-token`, payload),
  );
  return {
    message: data?.message,
    error,
  };
};

export const deleteMyAccount = async () => {
  const { data, error } = await tryCatch<MessageResponse>(
    clientApi.delete(`${BASE_PATH}me`),
  );
  return {
    message: data?.message,
    error,
  };
};
