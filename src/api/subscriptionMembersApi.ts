import type {
  InviteAcceptAddressPayload,
  InvitePreview,
  PendingInvite,
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

export const fetchPendingInvite = async () => {
  const { error, data } = await tryCatch<PendingInvite>(
    clientApi.get(`${BASE_PATH}/invites/mine`),
  );

  return {
    invite: data,
    error,
  };
};

export const acceptInviteMine = async () => {
  const { error, data } = await tryCatch<{ member: SubscriptionMember }>(
    clientApi.post(`${BASE_PATH}/invites/accept/mine`),
  );

  return {
    member: data?.member,
    error,
  };
};

export type InviteAcceptAddressMinePayload = Omit<
  InviteAcceptAddressPayload,
  'token'
>;

export const acceptInviteAddressMine = async (
  payload: InviteAcceptAddressMinePayload,
) => {
  const { error, data } = await tryCatch<{ member: SubscriptionMember }>(
    clientApi.post(`${BASE_PATH}/invites/accept/address/mine`, payload),
  );

  return {
    member: data?.member,
    error,
  };
};
