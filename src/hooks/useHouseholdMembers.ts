import { useCallback, useEffect, useState } from 'react';

import { fetchHouseholdMembers } from '../api/householdApi';
import type {
  HouseholdManagement,
  SubscriptionMember,
} from '../types';

const WEEKS_PER_BILLING_MONTH = 4;

export default function useHouseholdMembers(enabled = true) {
  const [members, setMembers] = useState<SubscriptionMember[]>([]);
  const [seatsUsed, setSeatsUsed] = useState(0);
  const [seatsRemaining, setSeatsRemaining] = useState(0);
  const [seatCap, setSeatCap] = useState(4);
  const [householdManagement, setHouseholdManagement] =
    useState<HouseholdManagement>('payer_assigns');
  const [weeklySessionsPool, setWeeklySessionsPool] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await fetchHouseholdMembers();
    if (err) {
      setError(String(err));
      setMembers([]);
    } else if (data) {
      setMembers(data.members);
      setSeatsUsed(data.seatsUsed);
      setSeatsRemaining(data.seatsRemaining);
      setSeatCap(data.seatCap);
      setHouseholdManagement(data.subscription.householdManagement);
      setWeeklySessionsPool(
        (data.subscription.weeklySessions ?? 0) * WEEKS_PER_BILLING_MONTH,
      );
    }
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    members,
    seatsUsed,
    seatsRemaining,
    seatCap,
    householdManagement,
    weeklySessionsPool,
    loading,
    error,
    refetch,
  };
}
