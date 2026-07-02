import type { MealPlan } from '../types';

export function mealPlanHasSelections(plan: MealPlan | null | undefined): boolean {
  return Boolean(plan?.days?.some((day) => day.meals.length > 0));
}
