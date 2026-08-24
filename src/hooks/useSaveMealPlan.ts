import { useCallback, useState } from 'react';

import { createMealPlan, updateMealPlan } from '../api/mealPlanApi';
import type {
  GenericAPICallbackProps,
  MealPlan,
  MealPlanDayInput,
} from '../types';

type SavePayload = {
  weekStart: string;
  days: MealPlanDayInput[];
  existingPlanId?: number;
  shoppingNotes?: string | null;
  targetUserId?: number;
};

export default function useSaveMealPlan() {
  const [loading, setLoading] = useState(false);

  const saveMealPlan = useCallback(
    async ({
      payload,
      onError,
      onSuccess,
    }: GenericAPICallbackProps<SavePayload, MealPlan | null>) => {
      setLoading(true);
      const { existingPlanId, weekStart, days, shoppingNotes, targetUserId } = payload;
      const result = existingPlanId
        ? await updateMealPlan(existingPlanId, { days, shoppingNotes }, targetUserId)
        : await createMealPlan({ weekStart, days, shoppingNotes }, targetUserId);
      if (result.error) {
        onError?.(String(result.error));
      } else {
        onSuccess?.(result.mealPlan);
      }
      setLoading(false);
    },
    [],
  );

  return { loading, saveMealPlan };
}
