import { useCallback, useState } from 'react';

import { persistInvoiceCreation } from '../api/invoiceApi';
import type {
  GenericAPICallbackProps,
  Invoice,
  Nullable,
  SubscriptionCreationRequest,
} from '../types';

export default function useCreateInvoice() {
  const [loading, setLoading] = useState(false);

  const createInvoice = useCallback(
    async ({
      payload,
      onError,
      onSuccess,
    }: GenericAPICallbackProps<
      SubscriptionCreationRequest,
      Nullable<Invoice>
    >) => {
      setLoading(true);
      const { invoice, error } = await persistInvoiceCreation(payload);
      if (error) onError?.(String(error));
      else onSuccess?.(invoice ?? undefined);
      setLoading(false);
    },
    [],
  );

  return { loading, createInvoice };
}
