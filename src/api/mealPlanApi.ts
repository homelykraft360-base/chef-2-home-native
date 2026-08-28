import type {
  MealPlanCreateRequest,
  MealPlanResponse,
  MealPlansResponse,
  MealPlanUpdateRequest,
} from '../types';
import { tryCatch } from '../utils/error.utils';
import { buildUrl } from '../utils/url.utils';

import { clientApi } from './client';

const BASE_PATH = '/meal-plans/';

const targetUserParams = (targetUserId?: number) =>
  targetUserId != null ? { targetUserId } : undefined;

export const fetchCurrentMealPlan = async (targetUserId?: number) => {
  const { data, error } = await tryCatch<MealPlanResponse>(
    clientApi.get(`${BASE_PATH}current`, {
      params: targetUserParams(targetUserId),
    }),
  );
  return { mealPlan: data?.mealPlan ?? null, error };
};

export const fetchMealPlansInRange = async (
  fromWeek?: string,
  toWeek?: string,
  targetUserId?: number,
) => {
  const query = buildUrl(BASE_PATH, {
    fromWeek,
    toWeek,
    ...(targetUserId != null ? { targetUserId } : {}),
  });
  const { data, error } = await tryCatch<MealPlansResponse>(
    clientApi.get(query),
  );
  return { mealPlans: data?.mealPlans ?? [], error };
};

export type HouseholdWeekAssignmentRow = {
  userId: number;
  dayOfWeek: string;
  mealCount: number;
};

export const fetchHouseholdWeekAssignments = async (weekStart: string) => {
  const { data, error } = await tryCatch<{
    weekStart: string;
    assignments: HouseholdWeekAssignmentRow[];
  }>(clientApi.get(`${BASE_PATH}household-week`, { params: { weekStart } }));
  return {
    assignments: data?.assignments ?? [],
    error,
  };
};

export const createMealPlan = async (
  payload: MealPlanCreateRequest,
  targetUserId?: number,
) => {
  const { data, error } = await tryCatch<MealPlanResponse>(
    clientApi.post(BASE_PATH, payload, {
      params: targetUserParams(targetUserId),
    }),
  );
  return { mealPlan: data?.mealPlan ?? null, error };
};

export const updateMealPlan = async (
  planId: number,
  payload: MealPlanUpdateRequest,
  targetUserId?: number,
) => {
  const { data, error } = await tryCatch<MealPlanResponse>(
    clientApi.put(`${BASE_PATH}${planId}`, payload, {
      params: targetUserParams(targetUserId),
    }),
  );
  return { mealPlan: data?.mealPlan ?? null, error };
};
