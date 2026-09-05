import type {
  SupportTicket,
  SupportTicketCreateRequest,
  SupportTicketMessageCreateRequest,
  SupportTicketUnreadSummary,
  SupportTicketsListResponse,
} from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/support-tickets/';

export const fetchSupportTicketsUnreadSummary = async () => {
  const { data, error } = await tryCatch<SupportTicketUnreadSummary>(
    clientApi.get(`${BASE_PATH}unread-summary`),
  );
  return {
    unreadCount: data?.unreadCount ?? 0,
    hasUnread: data?.hasUnread ?? false,
    error,
  };
};

export const fetchSupportTickets = async (status?: 'open' | 'closed') => {
  const params = status ? { status } : {};
  const { data, error } = await tryCatch<SupportTicketsListResponse>(
    clientApi.get(BASE_PATH, { params }),
  );
  return { tickets: data?.tickets ?? [], total: data?.total ?? 0, error };
};

export const fetchSupportTicket = async (ticketId: number) => {
  const { data, error } = await tryCatch<{ ticket: SupportTicket }>(
    clientApi.get(`${BASE_PATH}${ticketId}`),
  );
  return { ticket: data?.ticket, error };
};

export const createSupportTicket = async (payload: SupportTicketCreateRequest) => {
  const { data, error } = await tryCatch<{ ticket: SupportTicket }>(
    clientApi.post(BASE_PATH, payload),
  );
  return { ticket: data?.ticket, error };
};

export const replyToSupportTicket = async (
  ticketId: number,
  payload: SupportTicketMessageCreateRequest,
) => {
  const { error } = await tryCatch(
    clientApi.post(`${BASE_PATH}${ticketId}/messages`, payload),
  );
  return { error };
};

export const closeSupportTicket = async (ticketId: number) => {
  const { data, error } = await tryCatch<{ ticket: SupportTicket }>(
    clientApi.post(`${BASE_PATH}${ticketId}/close`),
  );
  return { ticket: data?.ticket, error };
};
