import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { fetchCurrentUserSubscription } from '../api/subscriptionApi';
import type { Subscription } from '../types';
import { subscriptionNeedsRenew } from '../utils/subscription.utils';

type Snapshot = {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
};

let snapshot: Snapshot = {
  subscription: null,
  loading: false,
  error: null,
};

let fetchPromise: Promise<Subscription | null> | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function updateSnapshot(partial: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

async function fetchSubscription(): Promise<Subscription | null> {
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    updateSnapshot({ loading: true, error: null });
    const { error: err, subscription: sub } =
      await fetchCurrentUserSubscription();
    if (err) {
      updateSnapshot({
        loading: false,
        error: String(err),
        subscription: null,
      });
      return null;
    }
    updateSnapshot({
      loading: false,
      error: null,
      subscription: sub ?? null,
    });
    return sub ?? null;
  })().finally(() => {
    fetchPromise = null;
  });

  return fetchPromise;
}

/** Update every consumer of useGetSubscription (e.g. after renew). */
export function setSharedSubscription(sub: Subscription | null) {
  updateSnapshot({ subscription: sub, error: null });
}

/** Poll until renew is reflected server-side, then sync shared state. */
export async function refreshSubscriptionAfterRenew(
  previous: Subscription,
): Promise<Subscription | null> {
  const delaysMs = [0, 400, 800, 1600, 3200];
  let last: Subscription | null = null;

  for (const delay of delaysMs) {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    const { subscription: refreshed, error } =
      await fetchCurrentUserSubscription();
    if (!error && refreshed) {
      last = refreshed;
      const extended =
        refreshed.expiresAt !== previous.expiresAt ||
        !subscriptionNeedsRenew(refreshed);
      if (extended) {
        setSharedSubscription(refreshed);
        return refreshed;
      }
    }
  }

  if (last) {
    setSharedSubscription(last);
  }
  return last;
}

export default function useGetSubscription() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const refetch = useCallback(() => fetchSubscription(), []);

  const setSubscription = useCallback((sub: Subscription | null) => {
    setSharedSubscription(sub);
  }, []);

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      void fetchSubscription();
    }
  }, []);

  return {
    subscription: state.subscription,
    setSubscription,
    loading: state.loading,
    error: state.error,
    refetch,
  };
}
