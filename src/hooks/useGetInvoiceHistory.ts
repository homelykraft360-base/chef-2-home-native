import { useCallback, useEffect, useState } from 'react';

import { fetchMyInvoiceHistory } from '../api/invoiceApi';
import type { InvoiceHistoryItem } from '../types';

export default function useGetInvoiceHistory() {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { invoices: rows, error: err } = await fetchMyInvoiceHistory();
    if (err) {
      setError(`${err}`);
      setInvoices([]);
    } else {
      setInvoices(rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { loading, invoices, error, refetch };
}
