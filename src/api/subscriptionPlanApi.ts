import type {
  SubscriptionPlanResponse,
  SubscriptionPlansResponse,
} from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/subscription-plans/';

export const fetchSubscriptionPlans = async () => {
  const { error, data } = await tryCatch<SubscriptionPlansResponse>(
    clientApi.get(BASE_PATH),
  );
  return {
    subscriptionPlans: data?.subscriptionPlans,
    error,
  };
};
