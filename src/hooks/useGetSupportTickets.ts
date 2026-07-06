import { useCallback, useEffect, useState } from 'react';

import { fetchSupportTickets } from '../api/supportTicketApi';
import type { SupportTicketSummary, TicketStatus } from '../types';

export default function useGetSupportTickets(status?: TicketStatus) {
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { tickets: rows, error: err } = await fetchSupportTickets(status);
    if (err) setError(String(err));
    else setTickets(rows);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tickets, loading, error, refetch };
}
