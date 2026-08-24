import type {
  InviteAcceptAddressPayload,
  InvitePreview,
  SubscriptionMember,
} from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/subscriptions';

export const fetchInvitePreview = async (token: string) => {
  const { error, data } = await tryCatch<InvitePreview>(
    clientApi.get(`${BASE_PATH}/invites/preview`, {
      params: { token },
    }),
  );

  return {
    preview: data,
    error,
  };
};

export const acceptInvite = async (token: string) => {
  const { error, data } = await tryCatch<{ member: SubscriptionMember }>(
    clientApi.post(`${BASE_PATH}/invites/accept`, { token }),
  );

  return {
    member: data?.member,
    error,
  };
};

export const acceptInviteAddress = async (
  payload: InviteAcceptAddressPayload,
) => {
  const { error, data } = await tryCatch<{ member: SubscriptionMember }>(
    clientApi.post(`${BASE_PATH}/invites/accept/address`, payload),
  );

  return {
    member: data?.member,
    error,
  };
};
