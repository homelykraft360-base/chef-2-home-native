import type { ServiceZone } from '../types';
import { tryCatch } from '../utils/error.utils';

import { clientApi } from './client';

/** Public zones list: GET /api/v1/service-zones (no trailing slash). */
export const fetchServiceZones = async () => {
  const { error, data } = await tryCatch<{ zones: ServiceZone[] }>(
    clientApi.get('/service-zones'),
  );
  return { zones: data?.zones, error };
};
