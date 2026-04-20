import type {
  LogisticsProps,
  PreferenceProps,
  SubscriptionCreationRequest,
  SubscriptionPlan,
} from '../types';

import { getPlanWeeklyVisitCap } from './subscriptionPlan.utils';

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
