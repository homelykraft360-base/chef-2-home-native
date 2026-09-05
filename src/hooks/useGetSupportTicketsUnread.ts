import { useCallback, useEffect, useState } from 'react';

import {
  refreshSupportUnreadState,
  subscribeSupportUnread,
  type SupportUnreadState,
} from '../support/supportUnread';

export default function useGetSupportTicketsUnread() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyState = useCallback((next: SupportUnreadState) => {
    setUnreadCount(next.unreadCount);
    setHasUnread(next.hasUnread);
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await refreshSupportUnreadState();
    if (result.error) setError(String(result.error));
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeSupportUnread(applyState);
    refetch();
    return unsubscribe;
  }, [applyState, refetch]);

  return { unreadCount, hasUnread, loading, error, refetch };
}
