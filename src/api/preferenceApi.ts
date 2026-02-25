import type { PreferenceRequest, PreferenceResponse } from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/preferences';

export const fetchPreferences = async () => {
  const { error, data } = await tryCatch<PreferenceResponse>(
    clientApi.get(BASE_PATH),
  );
  return {
    preference: data?.preference,
    error,
  };
};

export const persistPreferenceUpdate = async (payload: PreferenceRequest) => {
  const { error, data } = await tryCatch<PreferenceResponse>(
    clientApi.put(BASE_PATH, payload),
  );
  return {
    preference: data?.preference,
    error,
  };
};
