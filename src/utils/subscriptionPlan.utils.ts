import type { SubscriptionPlan } from '../types';

/** Missing/undefined → true for backward compatibility with older API payloads. */
export function isWeeklyBillingEnabled(
  plan: SubscriptionPlan | null | undefined,
): boolean {
  return plan?.weeklyBillingEnabled !== false;
}

/** Max weekly chef sessions selectable (always 5 when a plan is present). */
export function getPlanWeeklyVisitCap(
  plan: SubscriptionPlan | null | undefined,
): number {
  return plan ? 5 : 0;
}

/** Clamp to 1..cap (cap defaults to 5). */
export function clampWeeklySessions(
  plan: SubscriptionPlan | null | undefined,
  current: number,
): number {
  const cap = getPlanWeeklyVisitCap(plan) || 5;
  const n = Number(current);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(cap, Math.floor(n)));
}

/** Billing window shown in summaries when the API no longer stores duration. */
export function getPlanSummaryPeriodDays(): number {
  return 30;
}
