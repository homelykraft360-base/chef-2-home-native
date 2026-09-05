import { useCallback, useEffect, useState } from 'react';

import { fetchSupportTicket } from '../api/supportTicketApi';
import { onSupportTicketOpened } from '../support/supportUnread';
import type { SupportTicket } from '../types';

export default function useGetSupportTicket(ticketId: number) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    const { ticket: data, error: err } = await fetchSupportTicket(ticketId);
    if (err) setError(String(err));
    else {
      setTicket(data ?? null);
      if (data) {
        await onSupportTicketOpened();
      }
    }
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ticket, loading, error, refetch };
}
