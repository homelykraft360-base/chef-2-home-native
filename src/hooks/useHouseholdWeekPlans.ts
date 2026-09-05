import { useCallback, useEffect, useState } from 'react';

import { fetchMealPlansInRange } from '../api/mealPlanApi';
import type { MealPlan } from '../types';

type Options = {
  weekStart: string | null;
  enabled: boolean;
  payerUserId?: number;
  memberUserIds: number[];
};

/** Loads each household member's plan for a single week (payer + members). */
export default function useHouseholdWeekPlans({
  weekStart,
  enabled,
  payerUserId,
  memberUserIds,
}: Options) {
  const [plansByUserId, setPlansByUserId] = useState<Record<number, MealPlan>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !weekStart || payerUserId == null) {
      setPlansByUserId({});
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const userIds = [
      payerUserId,
      ...memberUserIds.filter((id) => id !== payerUserId),
    ];
    const results = await Promise.all(
      userIds.map(async (userId) => {
        const targetUserId = userId === payerUserId ? undefined : userId;
        const { mealPlans, error: fetchError } = await fetchMealPlansInRange(
          weekStart,
          weekStart,
          targetUserId,
        );
        return { userId, plan: mealPlans[0] ?? null, error: fetchError };
      }),
    );

    const failure = results.find((row) => row.error);
    if (failure?.error) {
      setPlansByUserId({});
      setError(String(failure.error));
      setLoading(false);
      return;
    }

    const next: Record<number, MealPlan> = {};
    for (const { userId, plan } of results) {
      if (plan) next[userId] = plan;
    }
    setPlansByUserId(next);
    setLoading(false);
  }, [enabled, weekStart, payerUserId, memberUserIds]);

  useEffect(() => {
    void load();
  }, [load]);

  return { plansByUserId, loading, error, refetch: load };
}
