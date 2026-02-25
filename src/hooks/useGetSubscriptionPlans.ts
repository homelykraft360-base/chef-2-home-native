import { useEffect, useState } from 'react';

import { fetchSubscriptionPlans } from '../api/subscriptionPlanApi';
import type { SubscriptionPlan } from '../types';

export default function useGetSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { error: err, subscriptionPlans = [] } =
        await fetchSubscriptionPlans();
      if (err) setError(String(err));
      else setPlans(subscriptionPlans);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { plans, loading, error };
}
