import { useCallback, useState } from 'react';

import { createSupportTicket } from '../api/supportTicketApi';
import type {
  GenericAPICallbackProps,
  SupportTicket,
  SupportTicketCreateRequest,
} from '../types';

export default function useCreateSupportTicket() {
  const [loading, setLoading] = useState(false);

  const createTicket = useCallback(
    async ({
      payload,
      onError,
      onSuccess,
    }: GenericAPICallbackProps<SupportTicketCreateRequest, SupportTicket>) => {
      setLoading(true);
      const { ticket, error } = await createSupportTicket(payload);
      if (error) onError?.(String(error));
      else if (ticket) onSuccess?.(ticket);
      setLoading(false);
    },
    [],
  );

  return { loading, createTicket };
}
