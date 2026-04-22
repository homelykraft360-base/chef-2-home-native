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
      const { existingPlanId, weekStart, days } = payload;
      const result = existingPlanId
        ? await updateMealPlan(existingPlanId, { days })
        : await createMealPlan({ weekStart, days });
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
