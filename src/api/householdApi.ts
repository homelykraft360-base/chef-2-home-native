import type {
  HouseholdListResponse,
  HouseholdManagement,
  SubscriptionMember,
} from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/subscriptions';

export const fetchHouseholdMembers = async () => {
  const { data, error } = await tryCatch<HouseholdListResponse>(
    clientApi.get(`${BASE_PATH}/members`),
  );
  return { data, error };
};

export const inviteHouseholdMember = async (payload: {
  inviteEmail?: string;
  invitePhone?: string;
}) => {
  const { data, error } = await tryCatch<{ member: SubscriptionMember }>(
    clientApi.post(`${BASE_PATH}/members`, payload),
  );
  return { data, error };
};

export const resendHouseholdInvite = async (memberId: number) => {
  const { data, error } = await tryCatch<{ member: SubscriptionMember }>(
    clientApi.post(`${BASE_PATH}/members/${memberId}/resend`),
  );
  return { data, error };
};

export const removeHouseholdMember = async (memberId: number) => {
  const { data, error } = await tryCatch<{ member: SubscriptionMember }>(
    clientApi.delete(`${BASE_PATH}/members/${memberId}`),
  );
  return { data, error };
};

export const patchMemberQuotas = async (
  memberId: number,
  payload: { weeklySessionsQuota: number },
) => {
  const { data, error } = await tryCatch<{ member: SubscriptionMember }>(
    clientApi.patch(`${BASE_PATH}/members/${memberId}/quotas`, payload),
  );
  return { data, error };
};

export const patchHouseholdMode = async (
  householdManagement: HouseholdManagement,
) => {
  const { data, error } = await tryCatch<{
    subscription: { householdManagement: string };
  }>(clientApi.patch(`${BASE_PATH}/household-management`, {
    householdManagement,
  }));
  return { data, error };
};
