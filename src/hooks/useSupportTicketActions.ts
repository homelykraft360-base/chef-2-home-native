import { useCallback, useState } from 'react';

import {
  closeSupportTicket,
  replyToSupportTicket,
} from '../api/supportTicketApi';
import type { SupportTicket } from '../types';

export default function useSupportTicketActions() {
  const [replyLoading, setReplyLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);

  const reply = useCallback(
    async (
      ticketId: number,
      message: string,
      onSuccess?: () => void,
      onError?: (error: string) => void,
    ) => {
      setReplyLoading(true);
      const { error } = await replyToSupportTicket(ticketId, { message });
      if (error) onError?.(String(error));
      else onSuccess?.();
      setReplyLoading(false);
    },
    [],
  );

  const close = useCallback(
    async (
      ticketId: number,
      onSuccess?: (ticket: SupportTicket) => void,
      onError?: (error: string) => void,
    ) => {
      setCloseLoading(true);
      const { ticket, error } = await closeSupportTicket(ticketId);
      if (error) onError?.(String(error));
      else if (ticket) onSuccess?.(ticket);
      setCloseLoading(false);
    },
    [],
  );

  return { reply, replyLoading, close, closeLoading };
}
