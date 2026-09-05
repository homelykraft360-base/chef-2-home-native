import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { HouseholdManagement, Subscription } from '../types';
import { authSlice } from '../store/authSlice';

import useGetSubscription from './useGetSubscription';

export type HouseholdRole = 'none' | 'payer' | 'activeMember' | 'invited';

export function resolveHouseholdRole(
  subscription: Subscription | null | undefined,
  currentUserId: number | undefined,
  pendingInviteToken: string | null,
): HouseholdRole {
  if (pendingInviteToken) {
    return 'invited';
  }
  if (!subscription || subscription.status !== 'active') {
    return 'none';
  }
  if (currentUserId != null && subscription.userId === currentUserId) {
    return 'payer';
  }
  return 'activeMember';
}

export default function useHouseholdEntitlement(
  subscriptionOverride?: Subscription | null,
) {
  const currentUser = useSelector(authSlice.selectors.currentUser);
  const pendingInviteToken = useSelector(
    (state: { auth: { pendingInviteToken?: string | null } }) =>
      state.auth.pendingInviteToken ?? null,
  );
  const cachedPayerFirstName = useSelector(
    (state: { auth: { cachedPayerFirstName?: string | null } }) =>
      state.auth.cachedPayerFirstName ?? null,
  );

  const {
    subscription: fetchedSubscription,
    loading,
    error,
    refetch,
  } = useGetSubscription();

  const subscription =
    subscriptionOverride !== undefined
      ? subscriptionOverride
      : fetchedSubscription;

  const role = useMemo(
    () =>
      resolveHouseholdRole(
        subscription,
        currentUser?.id,
        pendingInviteToken,
      ),
    [subscription, currentUser?.id, pendingInviteToken],
  );

  const householdManagement: HouseholdManagement =
    subscription?.householdManagement ?? 'payer_assigns';

  const isPayer = role === 'payer';
  const isActiveMember = role === 'activeMember';
  const isInvited = role === 'invited';
  const shouldShowSubscribeCTA = role === 'none';

  return {
    role,
    subscription,
    householdManagement,
    isPayer,
    isActiveMember,
    isInvited,
    shouldShowSubscribeCTA,
    pendingInviteToken,
    cachedPayerFirstName,
    loading,
    error,
    refetch,
  };
}
