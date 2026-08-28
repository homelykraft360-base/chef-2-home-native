import { useCallback, useEffect, useState } from 'react';

import { fetchHouseholdWeekAssignments } from '../api/mealPlanApi';
import type { DayOfWeek, SubscriptionMember } from '../types';

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

function labelForUserId(
  userId: number,
  payerUserId: number,
  members: SubscriptionMember[],
  selfUserId?: number,
): string {
  if (userId === payerUserId) return 'You';
  const member = members.find((m) => m.userId === userId);
  if (member) return memberShortLabel(member, selfUserId);
  return 'Member';
}

type Options = {
  weekStart: string | null;
  enabled: boolean;
  selfUserId?: number;
  payerUserId?: number;
  members: SubscriptionMember[];
};

/** Loads household visit-day ownership for a week in a single API call. */
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

    setLoading(true);
    const { assignments: rows, error } = await fetchHouseholdWeekAssignments(weekStart);
    if (error) {
      setAssignments({});
      setLoading(false);
      return;
    }

    const map: HouseholdWeekAssignments = {};
    for (const row of rows) {
      map[row.dayOfWeek as DayOfWeek] = {
        userId: row.userId,
        label: labelForUserId(row.userId, payerUserId, members, selfUserId),
        mealCount: row.mealCount,
      };
    }
    setAssignments(map);
    setLoading(false);
  }, [enabled, weekStart, payerUserId, members, selfUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { assignments, loading, refetch: load };
}
