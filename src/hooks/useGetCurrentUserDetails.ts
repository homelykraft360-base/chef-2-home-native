import { useCallback, useEffect, useState } from 'react';

import { fetchCurrentUserDetails } from '../api/userApi';
import type { User } from '../types';

export default function useGetCurrentUserDetails() {
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { error: err, user: u } = await fetchCurrentUserDetails();
    if (err) setError(String(err));
    else setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { user, loading, error, refetch };
}
