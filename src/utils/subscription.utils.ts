import type { Subscription } from '../types';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function subscriptionMsLeft(subscription: Subscription): number {
  return new Date(subscription.expiresAt).getTime() - Date.now();
}

export function isSubscriptionExpired(subscription: Subscription): boolean {
  return subscriptionMsLeft(subscription) < 0;
}

export function isSubscriptionEndingSoon(subscription: Subscription): boolean {
  const msLeft = subscriptionMsLeft(subscription);
  return msLeft >= 0 && msLeft <= THREE_DAYS_MS;
}

/** Expired or within the API renew window (3 days before expiry). */
export function subscriptionNeedsRenew(subscription: Subscription): boolean {
  return isSubscriptionExpired(subscription) || isSubscriptionEndingSoon(subscription);
}

/** True when meal planning and visit entitlements should be available. */
export function isSubscriptionEntitled(
  subscription: Subscription | null | undefined,
): boolean {
  if (!subscription || subscription.status !== 'active') return false;
  return !isSubscriptionExpired(subscription);
}

export function endingSoonLabel(msLeft: number): string {
  const daysLeft = Math.floor(msLeft / (24 * 60 * 60 * 1000));
  if (daysLeft <= 0) return 'Ending soon';
  if (daysLeft === 1) return 'Ends in 1 day';
  return `Ends in ${daysLeft} days`;
}
