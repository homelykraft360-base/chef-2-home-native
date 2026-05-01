import type {
  IngredientCheckoutResponse,
  IngredientExclusionInput,
  InvoiceIngredientBreakdown,
  MealPlanIngredientBreakdown,
} from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

const BASE_PATH = '/meal-plans';

export const fetchMealPlanIngredients = async (planId: number) => {
  const { data, error } = await tryCatch<MealPlanIngredientBreakdown>(
    clientApi.get(`${BASE_PATH}/${planId}/ingredients`),
  );
  return { breakdown: data ?? null, error };
};

export const updateIngredientExclusions = async (
  planId: number,
  exclusions: IngredientExclusionInput[],
) => {
  const { data, error } = await tryCatch<MealPlanIngredientBreakdown>(
    clientApi.put(`${BASE_PATH}/${planId}/ingredient-exclusions`, {
      exclusions,
    }),
  );
  return { breakdown: data ?? null, error };
};

export const createIngredientInvoice = async (planId: number) => {
  const { data, error } = await tryCatch<IngredientCheckoutResponse>(
    clientApi.post(`${BASE_PATH}/${planId}/ingredient-checkout`, {}),
  );
  return { checkout: data ?? null, error };
};

export const fetchInvoiceIngredientBreakdown = async (invoiceId: number) => {
  const { data, error } = await tryCatch<InvoiceIngredientBreakdown>(
    clientApi.get(`/invoices/${invoiceId}/ingredient-breakdown`),
  );
  return { breakdown: data ?? null, error };
};
