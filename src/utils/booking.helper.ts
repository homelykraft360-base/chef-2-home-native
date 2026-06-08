import {
  LAGOS_ISLAND_PER_VISIT_NAIRA,
  LAGOS_MAINLAND_PER_VISIT_NAIRA,
  WEEKLY_VISIT_MONTHLY_WEEKS,
} from '../constants/booking';
import type {
  LogisticsProps,
  PreferenceProps,
  SubscriptionCreationRequest,
  SubscriptionPlan,
} from '../types';

import { getPlanWeeklyVisitCap } from './subscriptionPlan.utils';

export function computeVisitFeesNaira(logistics: LogisticsProps): number {
  const perVisitNaira =
    logistics.location === 'lagos-island'
      ? LAGOS_ISLAND_PER_VISIT_NAIRA
      : logistics.location === 'lagos-mainland'
        ? LAGOS_MAINLAND_PER_VISIT_NAIRA
        : 0;
  const weeklyVisits = logistics.weeklySessionsCount;
  return perVisitNaira > 0
    ? weeklyVisits * perVisitNaira * WEEKLY_VISIT_MONTHLY_WEEKS
    : 0;
}

export function computeBookingMonthlyTotalNaira(
  plan: SubscriptionPlan,
  logistics: LogisticsProps,
): number {
  return plan.amount / 100 + computeVisitFeesNaira(logistics);
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
  return {
    subscriptionPlanId: plan.id,
    procureIngredients: false,
    delivery: logistics.preference === 'delivery',
    autoRenewal: true,
    weeklySessions: Math.min(
      getPlanWeeklyVisitCap(plan),
      Math.max(1, logistics.weeklySessionsCount),
    ),
    preferences,
    visitingDays: logistics.selectedDayAndTime,
    ...(logistics.location ? { location: logistics.location } : {}),
  };
}
