import type {
  SubscriptionCreationRequest,
  SubscriptionResponse,
} from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/subscriptions';

export const fetchCurrentUserSubscription = async () => {
  const { error, data } = await tryCatch<SubscriptionResponse>(
    clientApi.get(BASE_PATH),
  );
  return {
    subscription: data?.subscription,
    error,
  };
};

export const persistSubscriptionCreation = async (
  payload: SubscriptionCreationRequest,
) => {
  const { error, data } = await tryCatch<SubscriptionResponse>(
    clientApi.post(BASE_PATH, payload),
  );
  return {
    subscription: data?.subscription,
    error,
  };
};

export const toggleAutoRenewal = async () => {
  const { error, data } = await tryCatch<SubscriptionResponse>(
    clientApi.patch(`${BASE_PATH}/auto-renewal`),
  );
  return {
    subscription: data?.subscription,
    error,
  };
};
