import { useEffect, useState } from 'react';

import { fetchPreferences } from '../api/preferenceApi';
import type { Preference } from '../types';

export default function useGetPreference() {
  const [preference, setPreference] = useState<Preference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { error: err, preference: p } = await fetchPreferences();
      if (err) setError(String(err));
      else setPreference(p ?? null);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { preference, loading, error };
}
