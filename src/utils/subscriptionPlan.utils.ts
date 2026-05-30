import type { SubscriptionPlan } from '../types';

export function getPlanWeeklyVisitCap(
  plan: SubscriptionPlan | null | undefined,
): number {
  if (!plan) return 0;
  return 5;
}

export function getPlanSummaryPeriodDays(): number {
  return 30;
}
