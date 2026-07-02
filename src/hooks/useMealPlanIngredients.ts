import { useCallback, useEffect, useState } from 'react';

import {
  createIngredientInvoice,
  fetchMealPlanIngredients,
  updateIngredientExclusions,
} from '../api/mealPlanIngredientsApi';
import type {
  ExclusionReason,
  IngredientCheckoutResponse,
  IngredientExclusionInput,
  MealPlanIngredientBreakdown,
} from '../types';

function exclusionsFromBreakdown(
  breakdown: MealPlanIngredientBreakdown | null,
): IngredientExclusionInput[] {
  if (!breakdown) return [];
  const out: IngredientExclusionInput[] = [];
  for (const meal of breakdown.meals) {
    for (const ing of meal.ingredients) {
      if (ing.isExcluded && ing.exclusionReason) {
        out.push({
          mealPlanDayId: meal.mealPlanDayId,
          mealId: meal.mealId,
          ingredientId: ing.ingredientId,
          reason: ing.exclusionReason,
        });
      }
    }
  }
  return out;
}

/** Per-meal toggle state. Exclusions sync to backend once at checkout. */
export default function useMealPlanIngredients(planId: number | null) {
  const [breakdown, setBreakdown] =
    useState<MealPlanIngredientBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    if (!planId) {
      setBreakdown(null);
      return;
    }
    setLoading(true);
    setError(null);
    const { breakdown: data, error: err } = await fetchMealPlanIngredients(
      planId,
    );
    if (err) setError(String(err));
    else setBreakdown(data);
    setLoading(false);
  }, [planId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleIngredient = useCallback(
    (
      mealPlanDayId: number,
      mealId: number,
      ingredientId: number,
      reason: ExclusionReason,
    ) => {
      setBreakdown((prev) => {
        if (!prev) return prev;
        const meals = prev.meals.map((m) => {
          if (m.mealPlanDayId !== mealPlanDayId || m.mealId !== mealId) {
            return m;
          }
          let mealSubtotalKobo = 0;
          const ingredients = m.ingredients.map((ing) => {
            const isTarget = ing.ingredientId === ingredientId;
            const isExcluded = isTarget ? !ing.isExcluded : ing.isExcluded;
            const exclusionReason = isTarget
              ? ing.isExcluded
                ? null
                : reason
              : ing.exclusionReason;
            if (!isExcluded) mealSubtotalKobo += ing.lineTotalKobo;
            return { ...ing, isExcluded, exclusionReason };
          });
          return { ...m, ingredients, mealSubtotalKobo };
        });
        const grossTotalKobo = meals.reduce(
          (sum, m) =>
            sum +
            m.ingredients.reduce((s, ing) => s + ing.lineTotalKobo, 0),
          0,
        );
        const excludedTotalKobo = meals.reduce(
          (sum, m) =>
            sum +
            m.ingredients.reduce(
              (s, ing) => (ing.isExcluded ? s + ing.lineTotalKobo : s),
              0,
            ),
          0,
        );
        return {
          ...prev,
          meals,
          grossTotalKobo,
          excludedTotalKobo,
          payableTotalKobo: grossTotalKobo - excludedTotalKobo,
        };
      });
    },
    [],
  );

  const checkout = useCallback(
    async (
      shoppingNotes?: string | null,
    ): Promise<IngredientCheckoutResponse | null> => {
      if (!planId || !breakdown) return null;
      setPaying(true);
      setError(null);

      // Sync the user's exclusion choices to the backend before charging.
      const exclusions = exclusionsFromBreakdown(breakdown);
      const { error: syncErr } = await updateIngredientExclusions(
        planId,
        exclusions,
        shoppingNotes,
      );
      if (syncErr) {
        // 409 here usually means a paid/pending invoice already exists for
        // this week. Refetch so the UI flips to the correct banner.
        await load();
        setError(
          'This week is no longer available for payment. Please review the latest status.',
        );
        setPaying(false);
        return null;
      }

      const { checkout: data, error: err } = await createIngredientInvoice(
        planId,
      );
      setPaying(false);
      if (err || !data) {
        await load();
        setError(String(err ?? 'Could not start payment'));
        return null;
      }
      return data;
    },
    [planId, breakdown, load],
  );

  return {
    breakdown,
    loading,
    error,
    paying,
    refetch: load,
    toggleIngredient,
    checkout,
  };
}
