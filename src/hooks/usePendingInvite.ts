import { useCallback, useEffect, useState } from 'react';

import {
  acceptInviteAddressMine,
  acceptInviteMine,
  fetchPendingInvite,
} from '../api/subscriptionMembersApi';
import type { PendingInvite } from '../types';

export default function usePendingInvite(enabled = true) {
  const [invite, setInvite] = useState<PendingInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setInvite(null);
      return;
    }
    setLoading(true);
    setError(null);
    const { invite: data, error: err } = await fetchPendingInvite();
    if (err) {
      setInvite(null);
      if (!`${err}`.includes('404') && !`${err}`.includes('Invite not found')) {
        setError(String(err));
      }
    } else {
      setInvite(data ?? null);
    }
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const bindInvite = useCallback(async () => {
    const { error: err } = await acceptInviteMine();
    if (err) return { error: String(err) };
    await refetch();
    return {};
  }, [refetch]);

  const completeAddress = useCallback(
    async (payload: Parameters<typeof acceptInviteAddressMine>[0]) => {
      const { error: err } = await acceptInviteAddressMine(payload);
      if (err) return { error: String(err) };
      setInvite(null);
      return {};
    },
    [],
  );

  return {
    invite,
    loading,
    error,
    refetch,
    bindInvite,
    completeAddress,
  };
}
