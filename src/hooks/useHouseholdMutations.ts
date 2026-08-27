import { useCallback, useState } from 'react';

import {
  inviteHouseholdMember,
  patchHouseholdMode,
  patchMemberQuotas,
  removeHouseholdMember,
  resendHouseholdInvite,
} from '../api/householdApi';
import type {
  GenericAPICallbackProps,
  HouseholdManagement,
  SubscriptionMember,
} from '../types';

export default function useHouseholdMutations() {
  const [inviteLoading, setInviteLoading] = useState(false);
  const [modeLoading, setModeLoading] = useState(false);
  const [quotasLoading, setQuotasLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const inviteMember = useCallback(
    async ({
      payload,
      onError,
      onSuccess,
    }: GenericAPICallbackProps<
      { inviteEmail?: string; invitePhone?: string },
      SubscriptionMember
    >) => {
      setInviteLoading(true);
      const { data, error } = await inviteHouseholdMember(payload);
      if (error) onError?.(String(error));
      else if (data?.member) onSuccess?.(data.member);
      setInviteLoading(false);
    },
    [],
  );

  const updateMode = useCallback(
    async ({
      payload: mode,
      onError,
      onSuccess,
    }: GenericAPICallbackProps<HouseholdManagement, HouseholdManagement>) => {
      setModeLoading(true);
      const { data, error } = await patchHouseholdMode(mode);
      if (error) onError?.(String(error));
      else if (data?.subscription?.householdManagement) {
        onSuccess?.(data.subscription.householdManagement as HouseholdManagement);
      }
      setModeLoading(false);
    },
    [],
  );

  const updateQuotas = useCallback(
    async ({
      payload,
      onError,
      onSuccess,
    }: GenericAPICallbackProps<
      {
        memberId: number;
        weeklySessionsQuota: number;
      },
      SubscriptionMember
    >) => {
      setQuotasLoading(true);
      const { memberId, weeklySessionsQuota } = payload;
      const { data, error } = await patchMemberQuotas(memberId, {
        weeklySessionsQuota,
      });
      if (error) onError?.(String(error));
      else if (data?.member) onSuccess?.(data.member);
      setQuotasLoading(false);
    },
    [],
  );

  const resendInvite = useCallback(
    async ({
      payload: memberId,
      onError,
      onSuccess,
    }: GenericAPICallbackProps<number, SubscriptionMember>) => {
      setResendLoading(true);
      const { data, error } = await resendHouseholdInvite(memberId);
      if (error) onError?.(String(error));
      else if (data?.member) onSuccess?.(data.member);
      setResendLoading(false);
    },
    [],
  );

  const removeMember = useCallback(
    async ({
      payload: memberId,
      onError,
      onSuccess,
    }: GenericAPICallbackProps<number, SubscriptionMember>) => {
      setRemoveLoading(true);
      const { data, error } = await removeHouseholdMember(memberId);
      if (error) onError?.(String(error));
      else if (data?.member) onSuccess?.(data.member);
      setRemoveLoading(false);
    },
    [],
  );

  return {
    inviteLoading,
    modeLoading,
    quotasLoading,
    resendLoading,
    removeLoading,
    inviteMember,
    updateMode,
    updateQuotas,
    resendInvite,
    removeMember,
  };
}
