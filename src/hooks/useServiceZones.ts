import { useCallback, useEffect, useState } from 'react';

import { fetchServiceZones } from '../api/serviceZonesApi';
import type { ServiceZone } from '../types';

let cachedZones: Promise<ServiceZone[]> | null = null;

/** Session-wide cache. A failed request clears it so the next call retries. */
function getServiceZonesCached(): Promise<ServiceZone[]> {
  if (!cachedZones) {
    cachedZones = fetchServiceZones().then(({ zones, error }) => {
      if (error || !zones) {
        cachedZones = null;
        throw new Error(String(error ?? 'Could not load service areas'));
      }
      return zones;
    });
  }
  return cachedZones;
}

export function invalidateServiceZonesCache(): void {
  cachedZones = null;
}

export default function useServiceZones() {
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getServiceZonesCached()
      .then((result) => {
        if (active) setZones(result);
      })
      .catch(() => {
        if (active) setError('Could not load service areas');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => {
    invalidateServiceZonesCache();
    setReloadKey((key) => key + 1);
  }, []);

  return { zones, loading, error, refetch };
}
