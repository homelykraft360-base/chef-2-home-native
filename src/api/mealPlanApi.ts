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

export const fetchCurrentMealPlan = async () => {
  const { data, error } = await tryCatch<MealPlanResponse>(
    clientApi.get(`${BASE_PATH}current`),
  );
  return { mealPlan: data?.mealPlan ?? null, error };
};

export const fetchMealPlansInRange = async (
  fromWeek?: string,
  toWeek?: string,
) => {
  const query = buildUrl(BASE_PATH, { fromWeek, toWeek });
  const { data, error } = await tryCatch<MealPlansResponse>(
    clientApi.get(query),
  );
  return { mealPlans: data?.mealPlans ?? [], error };
};

export const createMealPlan = async (payload: MealPlanCreateRequest) => {
  const { data, error } = await tryCatch<MealPlanResponse>(
    clientApi.post(BASE_PATH, payload),
  );
  return { mealPlan: data?.mealPlan ?? null, error };
};

export const updateMealPlan = async (
  planId: number,
  payload: MealPlanUpdateRequest,
) => {
  const { data, error } = await tryCatch<MealPlanResponse>(
    clientApi.put(`${BASE_PATH}${planId}`, payload),
  );
  return { mealPlan: data?.mealPlan ?? null, error };
};
