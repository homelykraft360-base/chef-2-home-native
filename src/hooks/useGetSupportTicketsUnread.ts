import { useCallback, useEffect, useState } from 'react';

import { fetchSupportTicketsUnreadSummary } from '../api/supportTicketApi';

export default function useGetSupportTicketsUnread() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { unreadCount: count, hasUnread: unread, error: err } =
      await fetchSupportTicketsUnreadSummary();
    if (err) setError(String(err));
    else {
      setUnreadCount(count);
      setHasUnread(unread);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { unreadCount, hasUnread, loading, error, refetch };
}
