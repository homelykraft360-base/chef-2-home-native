import { useCallback, useEffect, useState } from 'react';

import { fetchMealPlansInRange } from '../api/mealPlanApi';
import type { MealPlan } from '../types';

/** Fetches the plan (if any) that anchors on `weekStart`. */
export default function useGetMealPlanForWeek(
  weekStart: string | null,
  targetUserId?: number,
) {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!weekStart) {
      setMealPlan(null);
      return;
    }
    setLoading(true);
    setError(null);
    const { mealPlans, error: err } = await fetchMealPlansInRange(
      weekStart,
      weekStart,
      targetUserId,
    );
    if (err) setError(String(err));
    else setMealPlan(mealPlans[0] ?? null);
    setLoading(false);
  }, [weekStart, targetUserId]);

  useEffect(() => {
    load();
  }, [load]);

  return { mealPlan, loading, error, refetch: load, setMealPlan };
}
