import type {
  BillingPeriod,
  LocationBand,
  LogisticsProps,
  PreferenceProps,
  SubscriptionCreationRequest,
  SubscriptionPlan,
} from '../types';

import {
  clampWeeklySessions,
  isWeeklyBillingEnabled,
} from './subscriptionPlan.utils';

const ISLAND_SLUGS = new Set([
  'lagos-island',
  'lagos-island-extension',
  'lagos-all',
]);

export function locationBandForZone(
  location: string | null | undefined,
): LocationBand | null {
  const slug = (location || '').trim().toLowerCase();
  if (!slug) return null;
  if (ISLAND_SLUGS.has(slug)) return 'island';
  if (slug.includes('mainland')) return 'mainland';
  return null;
}

export function lookupPlanAmountKobo(
  plan: SubscriptionPlan,
  logistics: LogisticsProps,
): number | null {
  const band = locationBandForZone(logistics.location);
  if (!band) return null;
  const days = Math.max(
    1,
    Math.min(5, Math.floor(logistics.weeklySessionsCount)),
  );
  const period: BillingPeriod = logistics.billingPeriod || 'monthly';
  if (period === 'weekly' && !isWeeklyBillingEnabled(plan)) return null;
  const weeks =
    period === 'weekly'
      ? Math.max(1, Math.min(4, Math.floor(Number(logistics.weeks) || 0)))
      : null;
  if (period === 'weekly' && (weeks == null || weeks < 1)) return null;

  const match = (plan.prices ?? []).find((row) => {
    if (row.locationBand !== band) return false;
    if (row.daysPerWeek !== days) return false;
    if (row.billingPeriod !== period) return false;
    if (period === 'monthly') return row.weeks == null;
    return row.weeks === weeks;
  });
  return match ? match.amountKobo : null;
}

/** Matrix-only total in naira. Null when location/combo is missing. */
export function computeBookingTotalNaira(
  plan: SubscriptionPlan,
  logistics: LogisticsProps,
): number | null {
  const kobo = lookupPlanAmountKobo(plan, logistics);
  return kobo == null ? null : kobo / 100;
}

/** @deprecated Prefer computeBookingTotalNaira — visit fees are baked into the matrix. */
export function computeVisitFeesNaira(
  _logistics: LogisticsProps,
  _zones?: unknown,
): number {
  return 0;
}

/** @deprecated Prefer computeBookingTotalNaira. */
export function computeBookingMonthlyTotalNaira(
  plan: SubscriptionPlan,
  logistics: LogisticsProps,
  _zones?: unknown,
): number {
  return computeBookingTotalNaira(plan, logistics) ?? 0;
}

export function periodLabel(
  period: BillingPeriod,
  weeks?: number | null,
): string {
  if (period === 'weekly') {
    const w = weeks ?? 1;
    return w === 1 ? '1 week' : `${w} weeks`;
  }
  return 'month';
}

export function mapToSubscriptionCreationRequest({
  plan,
  logistics,
  preferences,
}: {
  plan: SubscriptionPlan;
  logistics: LogisticsProps;
  preferences: PreferenceProps;
}): SubscriptionCreationRequest {
  const billingPeriod =
    !isWeeklyBillingEnabled(plan) || logistics.billingPeriod !== 'weekly'
      ? 'monthly'
      : 'weekly';
  return {
    subscriptionPlanId: plan.id,
    procureIngredients: false,
    delivery: logistics.preference === 'delivery',
    autoRenewal: true,
    weeklySessions: clampWeeklySessions(plan, logistics.weeklySessionsCount),
    preferences,
    visitingDays: logistics.selectedDayAndTime,
    billingPeriod,
    ...(billingPeriod === 'weekly' && logistics.weeks
      ? { weeks: logistics.weeks }
      : {}),
    ...(logistics.location ? { location: logistics.location } : {}),
  };
}
