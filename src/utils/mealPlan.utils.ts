import type { MealPlan } from '../types';

export function normalizeWeekStart(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function mealPlanHasSelections(plan: MealPlan | null | undefined): boolean {
  return Boolean(plan?.days?.some((day) => day.meals.length > 0));
}

/** True when a fetched plan belongs to the active week + household member context. */
export function mealPlanMatchesContext(
  plan: MealPlan | null | undefined,
  weekStart: string,
  targetUserId: number | undefined,
  ownerUserId: number | undefined,
): boolean {
  if (!plan || !ownerUserId) return false;
  if (normalizeWeekStart(plan.weekStart) !== normalizeWeekStart(weekStart)) {
    return false;
  }
  return plan.userId === ownerUserId;
}
