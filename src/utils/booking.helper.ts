import { WEEKLY_VISIT_MONTHLY_WEEKS } from '../constants/booking';
import type {
  LogisticsProps,
  PreferenceProps,
  ServiceZone,
  SubscriptionCreationRequest,
  SubscriptionPlan,
} from '../types';

import { perVisitFeeForZone } from './serviceZones.utils';
import { getPlanWeeklyVisitCap } from './subscriptionPlan.utils';

/** Monthly visit fee in naira = weekly visits x zone per-visit fee x 4 (fees from the API). */
export function computeVisitFeesNaira(
  logistics: LogisticsProps,
  zones: ServiceZone[],
): number {
  const perVisitNaira = perVisitFeeForZone(zones, logistics.location);
  const weeklyVisits = logistics.weeklySessionsCount;
  return perVisitNaira > 0
    ? weeklyVisits * perVisitNaira * WEEKLY_VISIT_MONTHLY_WEEKS
    : 0;
}

export function computeBookingMonthlyTotalNaira(
  plan: SubscriptionPlan,
  logistics: LogisticsProps,
  zones: ServiceZone[],
): number {
  return plan.amount / 100 + computeVisitFeesNaira(logistics, zones);
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
