import * as Notifications from 'expo-notifications';

import { fetchSupportTicketsUnreadSummary } from '../api/supportTicketApi';

export type SupportUnreadState = {
  unreadCount: number;
  hasUnread: boolean;
};

let state: SupportUnreadState = { unreadCount: 0, hasUnread: false };
const listeners = new Set<(next: SupportUnreadState) => void>();

export function getSupportUnreadState(): SupportUnreadState {
  return state;
}

function publish(next: SupportUnreadState) {
  state = next;
  listeners.forEach((listener) => listener(next));
}

export function subscribeSupportUnread(listener: (next: SupportUnreadState) => void) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export async function refreshSupportUnreadState() {
  const { unreadCount, hasUnread, error } = await fetchSupportTicketsUnreadSummary();
  if (!error) {
    publish({ unreadCount, hasUnread });
  }
  return { unreadCount, hasUnread, error };
}

export function applyTicketReadOptimistically(wasUnread: boolean) {
  if (!wasUnread) return;
  const nextCount = Math.max(0, state.unreadCount - 1);
  publish({
    unreadCount: nextCount,
    hasUnread: nextCount > 0,
  });
}

export async function onSupportTicketOpened() {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch {
    // Non-fatal if the OS declines dismissal.
  }
  await refreshSupportUnreadState();
}
