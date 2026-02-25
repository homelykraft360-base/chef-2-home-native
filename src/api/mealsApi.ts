import type { FetchFilters, Meal } from '../types';
import { tryCatch } from '../utils/error.utils';
import { buildUrl } from '../utils/url.utils';

import { clientApi } from './client';

const BASE_PATH = '/meals';

export const fetchMeals = async (
  filter: FetchFilters,
  category?: string,
) => {
  const { data, error } = await tryCatch<{ meals: Meal[] }>(
    clientApi.get(buildUrl(BASE_PATH, { ...filter, category })),
  );
  return {
    meals: data?.meals,
    error,
  };
};
