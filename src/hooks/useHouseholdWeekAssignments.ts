import { useCallback, useEffect, useState } from 'react';

import { fetchMealPlansInRange } from '../api/mealPlanApi';
import type { DayOfWeek, MealPlan, SubscriptionMember } from '../types';
import { mealPlanMatchesContext } from '../utils/mealPlan.utils';

export type HouseholdDayAssignment = {
  userId: number;
  label: string;
  mealCount: number;
};

export type HouseholdWeekAssignments = Partial<
  Record<DayOfWeek, HouseholdDayAssignment>
>;

function memberShortLabel(member: SubscriptionMember, selfUserId?: number): string {
  if (selfUserId != null && member.userId === selfUserId) return 'You';
  if (member.inviteEmail) return member.inviteEmail.split('@')[0];
  if (member.invitePhone) return member.invitePhone;
  return 'Member';
}

export function assignmentsFromPlans(
  entries: { userId: number; label: string; plan: MealPlan | null }[],
): HouseholdWeekAssignments {
  const map: HouseholdWeekAssignments = {};
  for (const { userId, label, plan } of entries) {
    for (const day of plan?.days ?? []) {
      if (day.meals.length > 0) {
        map[day.dayOfWeek] = {
          userId,
          label,
          mealCount: day.meals.length,
        };
      }
    }
  }
  return map;
}

type Options = {
  weekStart: string | null;
  enabled: boolean;
  selfUserId?: number;
  payerUserId?: number;
  members: SubscriptionMember[];
};

/** Loads every household member's plan for a week (payer meal assignment). */
export default function useHouseholdWeekAssignments({
  weekStart,
  enabled,
  selfUserId,
  payerUserId,
  members,
}: Options) {
  const [assignments, setAssignments] = useState<HouseholdWeekAssignments>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!enabled || !weekStart || payerUserId == null) {
      setAssignments({});
      return;
    }

    const targets: { userId: number; label: string; targetUserId?: number }[] = [
      { userId: payerUserId, label: 'You', targetUserId: undefined },
    ];
    for (const member of members) {
      if (
        member.status !== 'active' ||
        member.userId == null ||
        member.userId === payerUserId
      ) {
        continue;
      }
      targets.push({
        userId: member.userId,
        label: memberShortLabel(member, selfUserId),
        targetUserId: member.userId,
      });
    }

    setLoading(true);
    const results = await Promise.all(
      targets.map(async ({ userId, label, targetUserId }) => {
        const { mealPlans, error } = await fetchMealPlansInRange(
          weekStart,
          weekStart,
          targetUserId,
        );
        const plan =
          error || !mealPlans[0]
            ? null
            : mealPlanMatchesContext(
                  mealPlans[0],
                  weekStart,
                  targetUserId,
                  userId,
                )
              ? mealPlans[0]
              : null;
        return { userId, label, plan };
      }),
    );
    setAssignments(assignmentsFromPlans(results));
    setLoading(false);
  }, [enabled, weekStart, payerUserId, members, selfUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { assignments, loading, refetch: load };
}
