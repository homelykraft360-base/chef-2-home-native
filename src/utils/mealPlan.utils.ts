import type { DayOfWeek, MealPlan, MealSize } from '../types';
import { DEFAULT_MEAL_SIZE } from '../types';

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

type VisitingDay = { day: DayOfWeek };

export type DaySelections = Record<DayOfWeek, Set<number>>;
export type DayMealSizes = Record<DayOfWeek, Record<number, MealSize>>;

/** Merge household member plans into one day-keyed selection map. */
export function mergeHouseholdWeekPlans(
  visitingDays: VisitingDay[],
  plansByUserId: Record<number, MealPlan>,
): {
  selections: DaySelections;
  mealSizes: DayMealSizes;
  dayOwners: Partial<Record<DayOfWeek, number>>;
} {
  const selections = visitingDays.reduce((acc, { day }) => {
    acc[day] = new Set<number>();
    return acc;
  }, {} as DaySelections);
  const mealSizes = visitingDays.reduce((acc, { day }) => {
    acc[day] = {};
    return acc;
  }, {} as DayMealSizes);
  const dayOwners: Partial<Record<DayOfWeek, number>> = {};

  for (const [userIdRaw, plan] of Object.entries(plansByUserId)) {
    const userId = Number(userIdRaw);
    for (const planDay of plan.days ?? []) {
      if (!selections[planDay.dayOfWeek]) continue;
      if (planDay.meals.length === 0) continue;
      dayOwners[planDay.dayOfWeek] = userId;
      selections[planDay.dayOfWeek] = new Set(planDay.meals.map((m) => m.id));
      mealSizes[planDay.dayOfWeek] = planDay.meals.reduce(
        (acc, meal) => {
          acc[meal.id] = meal.mealSize ?? DEFAULT_MEAL_SIZE;
          return acc;
        },
        {} as Record<number, MealSize>,
      );
    }
  }

  return { selections, mealSizes, dayOwners };
}
