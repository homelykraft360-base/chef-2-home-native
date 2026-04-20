import { useEffect, useState } from 'react';

import { fetchMyInvoiceHistory } from '../api/invoiceApi';
import type { InvoiceHistoryItem } from '../types';

export default function useGetInvoiceHistory() {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
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
    };

    load();
  }, []);

  return { loading, invoices, error };
}
