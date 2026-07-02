import { useCallback, useEffect, useState } from 'react';

import { fetchCurrentUserSubscription } from '../api/subscriptionApi';
import type { Subscription } from '../types';

export default function useGetSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { error: err, subscription: sub } =
      await fetchCurrentUserSubscription();
    if (err) setError(String(err));
    else setSubscription(sub ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { subscription, loading, error, refetch };
}
